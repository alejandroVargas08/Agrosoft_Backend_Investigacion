import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { HistorialPreciosLoteService } from '../../application/use-cases/historial_precios_lote.service';
import { CreateHistorialPreciosLoteDto } from '../../application/dto/create-historial_precios_lote.dto';
import { UpdateHistorialPreciosLoteDto } from '../../application/dto/update-historial_precios_lote.dto';

@Controller('historial-precios-lote')
export class HistorialPreciosLoteController {
  constructor(private readonly historialService: HistorialPreciosLoteService) {}

  @Post()
  create(@Body() dto: CreateHistorialPreciosLoteDto) {
    return this.historialService.create(dto);
  }

  @Get()
  findAll() {
    return this.historialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findOne(id);
  }

  @Get('lote/:loteId')
  findByLote(@Param('loteId', ParseIntPipe) loteId: number) {
    return this.historialService.findByLote(loteId);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHistorialPreciosLoteDto) {
    return this.historialService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.remove(id);
  }
}