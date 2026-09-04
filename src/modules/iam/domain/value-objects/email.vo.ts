export class Email{
    private readonly value: string;

    private constructor(value: string){
        this.value = value;
    };

    static create(value: string): Email{
        const normalizado = value.trim().toLowerCase();

        if(!this.esValido(normalizado)){
            throw new Error(`El correo con "${value}" no tiene un formato valido`);
        }
        return new Email(normalizado);
    }
    private static esValido(value:string){
        
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
    }

    getValue(): string{
        return this.value;
    }

    equals(otro:Email): boolean{
        return this.value === otro.value;
    }

    toString(): string {
        return this.value;
    }
}