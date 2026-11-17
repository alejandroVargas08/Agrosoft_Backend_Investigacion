import { BadRequestException, Injectable, Logger, OnModuleInit, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tf from '@tensorflow/tfjs';
import * as jpeg from 'jpeg-js';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');

const ARCHIVO = 'descriptores.json';
const PRESENCIA_MINIMA = 0.5;
const MAX_FOTOS_REGISTRO = 20;
const MIN_FOTOS_VALIDAS = 8;
const DISPERSION_MAXIMA = 0.55;

export interface FotoAnalizada {
  foto: Buffer;
  vector: number[];
}

export interface ResultadoVerificacion {
  aciertos: number;
  total: number;
  detalle: string;
}

export interface EstadoReconocimiento {
  usuarios: number;
  fotosReferencia: number;
  listo: boolean;
  entrenando: boolean;
}

@Injectable()
export class ReconocimientoRostroService implements OnModuleInit {
  private readonly logger = new Logger(ReconocimientoRostroService.name);
  private cargando: Promise<void> | null = null;
  private listo = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.asegurarModelos().catch((error) =>
      this.logger.error(`No se pudieron cargar los modelos de reconocimiento facial: ${(error as Error).message}`),
    );
  }

  private get carpetaModelos(): string {
    return resolve(this.config.get<string>('RUTA_MODELOS_FACEAPI') ?? 'node_modules/@vladmandic/face-api/model');
  }

  private get carpetaUsuarios(): string {
    return join(resolve(this.config.get<string>('RUTA_FOTOS_ROSTRO') ?? 'datasets/rostro'), 'usuarios');
  }

  private carpetaDe(correo: string): string {
    return join(this.carpetaUsuarios, correo.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_'));
  }

  umbral(): number {
    const valor = Number(this.config.get<string>('DISTANCIA_ROSTRO'));
    return Number.isFinite(valor) && valor >= 0.3 && valor <= 0.7 ? valor : 0.5;
  }

  decodificar(fotos: string[]): Buffer[] {
    return fotos.map((texto) => {
      const foto = Buffer.from(texto.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      if (foto.length < 1000 || foto[0] !== 0xff || foto[1] !== 0xd8) {
        throw new BadRequestException('Las fotos enviadas no son imágenes JPEG válidas');
      }
      return foto;
    });
  }

  async prepararFotos(fotos: string[]): Promise<FotoAnalizada[]> {
    const todas = this.decodificar(fotos);
    const paso = Math.max(1, todas.length / MAX_FOTOS_REGISTRO);
    const elegidas: Buffer[] = [];
    for (let i = 0; i < todas.length && elegidas.length < MAX_FOTOS_REGISTRO; i += paso) {
      elegidas.push(todas[Math.floor(i)]);
    }

    let validas: FotoAnalizada[] = [];
    for (const foto of elegidas) {
      const vector = await this.describir(foto);
      if (vector) validas.push({ foto, vector });
    }

    if (validas.length >= MIN_FOTOS_VALIDAS) {
      const centro = this.promedio(validas.map((v) => v.vector));
      validas = validas.filter((v) => this.distancia(v.vector, centro) <= DISPERSION_MAXIMA);
    }

    if (validas.length < MIN_FOTOS_VALIDAS) {
      throw new BadRequestException(
        `Solo se reconoció bien tu cara en ${validas.length} de ${elegidas.length} fotos. Repite la captura con buena luz, de frente y sin otras personas en cámara.`,
      );
    }
    return validas;
  }

  guardarUsuario(correo: string, fotos: FotoAnalizada[]): void {
    const carpeta = this.carpetaDe(correo);
    rmSync(carpeta, { recursive: true, force: true });
    mkdirSync(carpeta, { recursive: true });
    const descriptores = fotos.map((f) => f.vector.map((v) => Number(v.toFixed(6))));
    writeFileSync(join(carpeta, ARCHIVO), JSON.stringify(descriptores));
  }

  agregarReferencias(_fotos: FotoAnalizada[]): void {
    throw new BadRequestException('Ya no se necesitan caras de referencia: cada usuario se compara solo con su propio rostro.');
  }

  tieneFotos(correo: string): boolean {
    return existsSync(join(this.carpetaDe(correo), ARCHIVO));
  }

  fechaRostro(correo: string): Date | null {
    const archivo = join(this.carpetaDe(correo), ARCHIVO);
    return existsSync(archivo) ? statSync(archivo).mtime : null;
  }

  eliminarUsuario(correo: string): boolean {
    const carpeta = this.carpetaDe(correo);
    if (!existsSync(carpeta)) return false;
    rmSync(carpeta, { recursive: true, force: true });
    return true;
  }

  estado(): EstadoReconocimiento {
    const usuarios = existsSync(this.carpetaUsuarios)
      ? readdirSync(this.carpetaUsuarios, { withFileTypes: true }).filter(
          (d) => d.isDirectory() && existsSync(join(this.carpetaUsuarios, d.name, ARCHIVO)),
        ).length
      : 0;
    return { usuarios, fotosReferencia: 0, listo: true, entrenando: false };
  }

  async verificar(correo: string, fotos: Buffer[]): Promise<ResultadoVerificacion> {
    const archivo = join(this.carpetaDe(correo), ARCHIVO);
    if (!existsSync(archivo)) {
      throw new UnauthorizedException('Esta cuenta no tiene rostro registrado. Inicia sesión con tu contraseña y regístralo en tu perfil.');
    }

    const guardados = JSON.parse(readFileSync(archivo, 'utf8')) as number[][];
    const centro = this.promedio(guardados);
    const umbral = this.umbral();
    const detalle: string[] = [];
    let aciertos = 0;

    for (const foto of fotos) {
      const vector = await this.describir(foto);
      if (!vector) {
        detalle.push('sin rostro');
        continue;
      }
      const cercania = Math.min(
        this.distancia(vector, centro),
        this.mediaMenores(guardados.map((g) => this.distancia(vector, g)), 3),
      );
      detalle.push(cercania.toFixed(2));
      if (cercania < umbral) aciertos++;
    }

    this.logger.log(`Login con rostro ${correo}: ${aciertos}/${fotos.length} (distancias ${detalle.join(', ')}, umbral ${umbral})`);
    return { aciertos, total: fotos.length, detalle: detalle.join(', ') };
  }

  private async describir(foto: Buffer): Promise<number[] | null> {
    await this.asegurarModelos();
    const entrada = this.aTensor(foto);
    try {
      const resultado = await faceapi
        .detectSingleFace(entrada, new faceapi.SsdMobilenetv1Options({ minConfidence: PRESENCIA_MINIMA, maxResults: 1 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!resultado || resultado.detection.score < PRESENCIA_MINIMA) return null;
      return Array.from(resultado.descriptor as Float32Array);
    } finally {
      entrada.dispose();
    }
  }

  private async asegurarModelos(): Promise<void> {
    if (this.listo) return;
    if (!this.cargando) {
      this.cargando = this.cargarModelos().finally(() => {
        this.cargando = null;
      });
    }
    await this.cargando;
  }

  private async cargarModelos(): Promise<void> {
    let backend = 'wasm';
    try {
      if (!(await tf.setBackend('wasm'))) backend = 'cpu';
    } catch {
      backend = 'cpu';
    }
    if (backend === 'cpu') await tf.setBackend('cpu');
    await tf.ready();

    const carpeta = this.carpetaModelos;
    await this.cargarRed(faceapi.nets.ssdMobilenetv1, 'ssd_mobilenetv1_model', carpeta);
    await this.cargarRed(faceapi.nets.faceLandmark68Net, 'face_landmark_68_model', carpeta);
    await this.cargarRed(faceapi.nets.faceRecognitionNet, 'face_recognition_model', carpeta);
    this.listo = true;
    this.logger.log(`Reconocimiento facial listo (motor ${tf.getBackend()})`);
  }

  private async cargarRed(red: any, nombre: string, carpeta: string): Promise<void> {
    const archivo = [`${nombre}.json`, `${nombre}-weights_manifest.json`].map((n) => join(carpeta, n)).find((r) => existsSync(r));
    if (!archivo) {
      throw new ServiceUnavailableException(`No se encontró el modelo ${nombre} en ${carpeta}. Ejecuta: npm install @vladmandic/face-api`);
    }

    const json = JSON.parse(readFileSync(archivo, 'utf8'));
    const grupos: tf.io.WeightsManifestConfig = Array.isArray(json) ? json : json.weightsManifest;
    const especificaciones = grupos.flatMap((g) => g.weights);
    const pesos = Buffer.concat(grupos.flatMap((g) => g.paths.map((p) => readFileSync(join(carpeta, p)))));
    const datos = pesos.buffer.slice(pesos.byteOffset, pesos.byteOffset + pesos.byteLength) as ArrayBuffer;

    if (typeof red.loadFromWeightMap === 'function') {
      red.loadFromWeightMap(tf.io.decodeWeights(datos, especificaciones));
    } else {
      await red.loadFromDisk(carpeta);
    }
  }

  private aTensor(foto: Buffer): tf.Tensor3D {
    let imagen: { width: number; height: number; data: Uint8Array };
    try {
      imagen = jpeg.decode(foto, { useTArray: true, maxMemoryUsageInMB: 64 });
    } catch {
      throw new BadRequestException('Una de las fotos no se pudo leer');
    }

    const { width, height, data } = imagen;
    const rgb = new Float32Array(width * height * 3);
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      rgb[j] = data[i];
      rgb[j + 1] = data[i + 1];
      rgb[j + 2] = data[i + 2];
    }
    return tf.tensor3d(rgb, [height, width, 3], 'float32');
  }

  private distancia(a: number[], b: number[]): number {
    let suma = 0;
    for (let i = 0; i < a.length; i++) suma += (a[i] - b[i]) ** 2;
    return Math.sqrt(suma);
  }

  private promedio(vectores: number[][]): number[] {
    const suma = new Array(vectores[0].length).fill(0);
    for (const v of vectores) v.forEach((x, i) => (suma[i] += x));
    return suma.map((x) => x / vectores.length);
  }

  private mediaMenores(valores: number[], cantidad: number): number {
    const menores = [...valores].sort((a, b) => a - b).slice(0, cantidad);
    return menores.reduce((s, v) => s + v, 0) / menores.length;
  }
}