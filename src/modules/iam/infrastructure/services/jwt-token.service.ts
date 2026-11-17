import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenServicePort, TokenPayload } from '../../domain/ports/token.service.port';

@Injectable()
export class JwtTokenService implements TokenServicePort {
    constructor(private readonly jwtService: JwtService) {}

    generar(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
    }
}