import { Injectable } from '@nestjs/common';
import { CreateTransaccionesFinancieraDto } from '../dto/create-transacciones-financiera.dto';
import { UpdateTransaccionesFinancieraDto } from '../dto/update-transacciones-financiera.dto';

@Injectable()
export class TransaccionesFinancierasService {
  create(createTransaccionesFinancieraDto: CreateTransaccionesFinancieraDto) {
    return 'This action adds a new transaccionesFinanciera';
  }

  findAll() {
    return `This action returns all transaccionesFinancieras`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaccionesFinanciera`;
  }

  update(id: number, updateTransaccionesFinancieraDto: UpdateTransaccionesFinancieraDto) {
    return `This action updates a #${id} transaccionesFinanciera`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaccionesFinanciera`;
  }
}
