import { PartialType } from "@nestjs/mapped-types";
import { crearActividadesDto } from "./crear-actividades.dto";

export class actualizarActividadesDto extends PartialType(crearActividadesDto) {}