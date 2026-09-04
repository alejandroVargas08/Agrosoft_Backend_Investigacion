import {Controller,Get,Post,Body,Patch,Param,Delete,ParseIntPipe, } from '@nestjs/common';
import { VentasDetallesService } from '../../application/use-cases/ventas-detalles.service';
import { CreateVentaDetalleDto } from '../../application/dto/create-ventas-detalle.dto';
import { UpdateVentaDetalleDto } from '../../application/dto/update-ventas-detalle.dto';

@Controller('ventas-detalles')
export class VentasDetallesController {
  constructor(private readonly ventasDetallesService: VentasDetallesService) {}

  @Post()
  create(@Body() createDto: CreateVentaDetalleDto) {
    return this.ventasDetallesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.ventasDetallesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasDetallesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateVentaDetalleDto,
  ) {
    return this.ventasDetallesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ventasDetallesService.remove(id);
  }
}