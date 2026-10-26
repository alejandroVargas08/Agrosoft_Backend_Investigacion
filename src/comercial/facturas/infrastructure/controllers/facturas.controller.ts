import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FacturasService } from '../../application/use-cases/facturas.service';
import { CreateFacturaDto } from '../../application/dto/create-factura.dto';
import { UpdateFacturaDto } from '../../application/dto/update-factura.dto';
import { Autenticado } from '../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';

@Controller('facturas')
@Autenticado()
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  create(@Body() dto: CreateFacturaDto) {
    return this.facturasService.create(dto);
  }

  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  // Las rutas con texto fijo van antes de :id, si no Nest las captura con el id
  @Get('venta/:ventaId')
  findByVenta(@Param('ventaId', ParseIntPipe) ventaId: number) {
    return this.facturasService.findByVenta(ventaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }


  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFacturaDto) {
    return this.facturasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.remove(id);
  }
}