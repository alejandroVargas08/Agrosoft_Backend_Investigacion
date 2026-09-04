import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComercialService } from '../../application/use-cases/comercial.service';
import { CreateComercialDto } from '../../application/dto/create-comercial.dto';
import { UpdateComercialDto } from '../../application/dto/update-comercial.dto';

@Controller('comercial')
export class ComercialController {
  constructor(private readonly comercialService: ComercialService) {}

  @Post()
  create(@Body() createComercialDto: CreateComercialDto) {
    return this.comercialService.create(createComercialDto);
  }

  @Get()
  findAll() {
    return this.comercialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comercialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComercialDto: UpdateComercialDto) {
    return this.comercialService.update(+id, updateComercialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comercialService.remove(+id);
  }
}
