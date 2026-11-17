import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { HistorialPreciosLoteService } from '../../application/use-cases/historial_precios_lote.service';
import { CreateHistorialPreciosLoteDto } from '../../application/dto/create-historial_precios_lote.dto';
import { UpdateHistorialPreciosLoteDto } from '../../application/dto/update-historial_precios_lote.dto';
import { Autenticado } from '../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';

@Controller('historial-precios-lote')
@Autenticado()
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

  // Las rutas con texto fijo van antes de :id, si no Nest las captura con el id
  @Get('lote/:loteId')
  findByLote(@Param('loteId', ParseIntPipe) loteId: number) {
    return this.historialService.findByLote(loteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialService.findOne(id);
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