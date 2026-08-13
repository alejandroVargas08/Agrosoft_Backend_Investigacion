import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { VentasService } from '../../application/use-cases/ventas.service';
import { CreateVentaDto } from '../../application/dto/create-venta.dto';
import { UpdateVentaDto } from '../../application/dto/update-venta.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  create(@Body() dto: CreateVentaDto) {
    return this.ventasService.create(dto);
  }

  @Get()
  findAll() {
    return this.ventasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVentaDto) {
    return this.ventasService.update(id, dto);
  }

  @Patch(':id/anular')
  anular(
    @Param('id', ParseIntPipe) id: number,
    @Body('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    return this.ventasService.anularVenta(id, usuarioId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.remove(id);
  }
}