import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransaccionesFinancierasService } from '../../application/use_cases/transacciones-financieras.service';
import { CreateTransaccionesFinancieraDto } from '../../application/dto/create-transacciones-financiera.dto';
import { UpdateTransaccionesFinancieraDto } from '../../application/dto/update-transacciones-financiera.dto';

@Controller('transacciones-financieras')
export class TransaccionesFinancierasController {
  constructor(private readonly transaccionesFinancierasService: TransaccionesFinancierasService) {}

  @Post()
  create(@Body() createTransaccionesFinancieraDto: CreateTransaccionesFinancieraDto) {
    return this.transaccionesFinancierasService.create(createTransaccionesFinancieraDto);
  }

  @Get()
  findAll() {
    return this.transaccionesFinancierasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaccionesFinancierasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransaccionesFinancieraDto: UpdateTransaccionesFinancieraDto) {
    return this.transaccionesFinancierasService.update(+id, updateTransaccionesFinancieraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaccionesFinancierasService.remove(+id);
  }
}
