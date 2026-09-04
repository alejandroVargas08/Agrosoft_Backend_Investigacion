import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PagosService } from '../../application/use_cases/pagos.service';
import { CreatePagoDto } from '../../application/dto/create-pago.dto';
import { UpdatePagoDto } from '../../application/dto/update-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  create(@Body() dto: CreatePagoDto) {
    return this.pagosService.create(dto);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.findOne(id);
  }

  @Get('venta/:ventaId')
  findByVenta(@Param('ventaId', ParseIntPipe) ventaId: number) {
    return this.pagosService.findByVenta(ventaId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePagoDto) {
    return this.pagosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.remove(id);
  }
}