export class Password{
    private readonly hash: string;

    private constructor( hash: string){
        this.hash = hash;
    }

    static fromhash(hash: string): Password{
        if (!hash || hash.trim().length === 0){
            throw new Error ('El has de la contraseña no puede estar vacio');
        }
        return new Password(hash)
    }

    getHash(): string{
        return this.hash;
    }
}