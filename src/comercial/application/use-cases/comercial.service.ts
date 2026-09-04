import { Injectable } from '@nestjs/common';
import { CreateComercialDto } from '../../application/dto/create-comercial.dto';
import { UpdateComercialDto } from '../../application/dto/update-comercial.dto';

@Injectable()
export class ComercialService {
  create(createComercialDto: CreateComercialDto) {
    return 'This action adds a new comercial';
  }

  findAll() {
    return `This action returns all comercial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comercial`;
  }

  update(id: number, updateComercialDto: UpdateComercialDto) {
    return `This action updates a #${id} comercial`;
  }

  remove(id: number) {
    return `This action removes a #${id} comercial`;
  }
}
