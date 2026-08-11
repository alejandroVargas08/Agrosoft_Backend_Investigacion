import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../../domain/entities/cliente.entity';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const existe = await this.clienteRepository.findOne({
      where: { identificacion: createClienteDto.identificacion },
    });

    if (existe) {
      throw new ConflictException(
        `La identificación ${createClienteDto.identificacion} ya está registrada.`,
      );
    }

    const cliente = this.clienteRepository.create(createClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clienteRepository.find();
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
    }
    return cliente;
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (
      updateClienteDto.identificacion &&
      updateClienteDto.identificacion !== cliente.identificacion
    ) {
      const existe = await this.clienteRepository.findOne({
        where: { identificacion: updateClienteDto.identificacion },
      });
      if (existe) {
        throw new ConflictException(
          `La identificación ${updateClienteDto.identificacion} ya pertenece a otro cliente.`,
        );
      }
    }

    this.clienteRepository.merge(cliente, updateClienteDto);
    return await this.clienteRepository.save(cliente);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.softDelete(cliente.id);
  }

  async restore(id: number): Promise<Cliente> {
    await this.clienteRepository.restore(id);
    return this.findOne(id);
  }
}