import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialPreciosLoteService } from '../../application/use-cases/historial_precios_lote.service';
import { CreateHistorialPreciosLoteDto } from '../../application/dto/create-historial_precios_lote.dto';
import { UpdateHistorialPreciosLoteDto } from '../../application/dto/update-historial_precios_lote.dto';

@Controller('historial-precios-lote')
export class HistorialPreciosLoteController {
  constructor(private readonly historialPreciosLoteService: HistorialPreciosLoteService) {}

  @Post()
  create(@Body() createHistorialPreciosLoteDto: CreateHistorialPreciosLoteDto) {
    return this.historialPreciosLoteService.create(createHistorialPreciosLoteDto);
  }

  @Get()
  findAll() {
    return this.historialPreciosLoteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialPreciosLoteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialPreciosLoteDto: UpdateHistorialPreciosLoteDto) {
    return this.historialPreciosLoteService.update(+id, updateHistorialPreciosLoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialPreciosLoteService.remove(+id);
  }
}
