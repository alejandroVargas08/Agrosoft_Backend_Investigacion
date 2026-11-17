import { SetMetadata } from "@nestjs/common";

export const PERMITE_EJECUTOR = 'permite_ejecutor_actividad';

export const PermitirEjecutor = () => SetMetadata(PERMITE_EJECUTOR, true);
