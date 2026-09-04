const M2_POR_HECTAREA = 10_000;

export class Area {
private constructor(
    private readonly _m2: number,
    private readonly _ha: number,
) {}

static desdeM2(m2: number): Area {
    if (m2 === null || m2 === undefined || Number.isNaN(m2)) {
    throw new Error('El área en m2 es requerida');
    }
    if (m2 <= 0) {
    throw new Error('El área en m2 debe ser mayor a cero');
    }
    const ha = Math.round((m2 / M2_POR_HECTAREA) * 10_000) / 10_000;
    return new Area(m2, ha);
}

get m2(): number { return this._m2; }
get ha(): number { return this._ha; }

equals(otra: Area): boolean {
    return otra instanceof Area && otra.m2 === this._m2;
}

toString(): string {
    return `${this._m2} m² (${this._ha} ha)`;
}
}