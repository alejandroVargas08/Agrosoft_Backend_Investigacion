import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransaccionesFinancierasService } from '../../application/use_cases/transacciones-financieras.service';
import { CreateTransaccionesFinancieraDto } from '../../application/dto/create-transacciones-financiera.dto';
import { UpdateTransaccionesFinancieraDto } from '../../application/dto/update-transacciones-financiera.dto';

@Controller('transacciones-financieras')
export class TransaccionesFinancierasController {
  constructor(private readonly service: TransaccionesFinancierasService) {}

  @Post()
  create(@Body() dto: CreateTransaccionesFinancieraDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTransaccionesFinancieraDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}