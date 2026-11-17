import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaEntity } from '../../domain/entities/venta.entity';
import { VentaDetalleEntity } from '../../../ventas-detalles/domain/entities/ventas-detalle.entity';
import { reponerStockUseCase } from '../../../../produccion/lotes_produccion/application/use-cases/reponer-lotes-produccion-use-case';
import { CreateVentaDto } from '../../application/dto/create-venta.dto';
import { UpdateVentaDto } from '../../application/dto/update-venta.dto';

@Injectable()
export class VentasService {
  private readonly logger = new Logger(VentasService.name);

  constructor(
    @InjectRepository(VentaEntity)
    private readonly ventasRepository: Repository<VentaEntity>,
    @InjectRepository(VentaDetalleEntity)
    private readonly detallesRepository: Repository<VentaDetalleEntity>,
    private readonly reponerStock: reponerStockUseCase,
  ) {}

  async create(dto: CreateVentaDto): Promise<VentaEntity> {
    const nuevaVenta = this.ventasRepository.create(dto);
    return await this.ventasRepository.save(nuevaVenta);
  }

  async findAll(): Promise<VentaEntity[]> {
    return await this.ventasRepository.find();
  }

  async findOne(id: number): Promise<VentaEntity> {
    const venta = await this.ventasRepository.findOneBy({ id });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
    return venta;
  }

  async update(id: number, dto: UpdateVentaDto): Promise<VentaEntity> {
    const venta = await this.findOne(id);
    this.ventasRepository.merge(venta, dto);
    return await this.ventasRepository.save(venta);
  }

  async marcarPagada(id: number): Promise<VentaEntity> {
    const venta = await this.findOne(id);
    if (venta.estado === 'anulada') {
      throw new BadRequestException('Una venta anulada no se puede marcar como pagada');
    }
    if (venta.estado === 'pagada') {
      throw new BadRequestException('La venta ya está pagada');
    }
    venta.estado = 'pagada';
    return await this.ventasRepository.save(venta);
  }

  async anularVenta(id: number, usuarioId: number): Promise<VentaEntity> {
    const venta = await this.findOne(id);
    if (venta.estado === 'anulada') {
      throw new BadRequestException('La venta ya está anulada');
    }

    venta.estado = 'anulada';
    venta.anuladaPorUsuarioId = usuarioId;
    venta.fechaAnulacion = new Date();
    const anulada = await this.ventasRepository.save(venta);

    await this.devolverStockAlLote(id);
    return anulada;
  }

  /**
   * Al crear una venta se descuentan kilos del lote de producción; al anularla
   * hay que devolverlos. Si un lote ya no existe o el stock no cuadra se anota
   * en el log y se sigue: la venta ya quedó anulada y eso no se revierte.
   */
  private async devolverStockAlLote(ventaId: number): Promise<void> {
    const detalles = await this.detallesRepository.find({ where: { ventaId } });

    for (const detalle of detalles) {
      if (!detalle.loteProduccionId || !detalle.cantidadKg) continue;

      try {
        await this.reponerStock.ejecutar(detalle.loteProduccionId, Number(detalle.cantidadKg));
      } catch (error) {
        this.logger.warn(
          `No se pudo devolver ${detalle.cantidadKg} kg al lote ${detalle.loteProduccionId} ` +
          `al anular la venta ${ventaId}: ${(error as Error).message}`,
        );
      }
    }
  }

  async remove(id: number): Promise<void> {
    const venta = await this.findOne(id);
    await this.ventasRepository.softDelete(venta.id);
  }
}