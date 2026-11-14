import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { DispositivoPushOrmEntity } from '../persistence/entities/dispositivo-push.orm-entity';

const TOKENS_VENCIDOS = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
];

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private messaging: Messaging | null = null;

  constructor(
    @InjectRepository(DispositivoPushOrmEntity)
    private readonly dispositivos: Repository<DispositivoPushOrmEntity>,
  ) {}

  onModuleInit() {
    const ruta = process.env.FIREBASE_CREDENTIALS;
    if (!ruta) {
      this.logger.warn('FIREBASE_CREDENTIALS no está en el .env: las notificaciones push están desactivadas');
      return;
    }
    const archivo = resolve(ruta);
    if (!existsSync(archivo)) {
      this.logger.warn(`No se encontró ${archivo}: las notificaciones push están desactivadas`);
      return;
    }
    try {
      const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(readFileSync(archivo, 'utf8'))) });
      this.messaging = getMessaging(app);
      this.logger.log('Notificaciones push activas');
    } catch (error) {
      this.logger.error('No se pudo iniciar Firebase', error as Error);
    }
  }

  async registrar(usuarioId: number, token: string, plataforma: string): Promise<void> {
    const existente = await this.dispositivos.findOne({ where: { token } });
    if (existente) {
      existente.usuarioId = usuarioId;
      existente.plataforma = plataforma;
      await this.dispositivos.save(existente);
      return;
    }
    await this.dispositivos.save(this.dispositivos.create({ usuarioId, token, plataforma }));
  }

  async quitar(usuarioId: number, token: string): Promise<void> {
    await this.dispositivos.delete({ usuarioId, token });
  }

  async enviarAUsuario(usuarioId: number, titulo: string, mensaje: string, datos: Record<string, string> = {}): Promise<void> {
    if (!this.messaging) return;
    try {
      const registros = await this.dispositivos.find({ where: { usuarioId } });
      if (registros.length === 0) return;

      const tokens = registros.map((r) => r.token);
      const respuesta = await this.messaging.sendEachForMulticast({
        tokens,
        notification: { title: titulo, body: mensaje },
        data: datos,
        android: {
          priority: 'high',
          notification: { channelId: 'agrosoft_avisos', color: '#3B7D48' },
        },
        apns: { payload: { aps: { sound: 'default' } } },
      });

      const vencidos = respuesta.responses
        .map((r, i) => (!r.success && TOKENS_VENCIDOS.includes(r.error?.code ?? '') ? tokens[i] : null))
        .filter((t): t is string => t !== null);

      if (vencidos.length > 0) {
        await this.dispositivos.delete({ token: In(vencidos) });
      }
    } catch (error) {
      this.logger.error(`No se pudo enviar el push al usuario ${usuarioId}`, error as Error);
    }
  }
}
