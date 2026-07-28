import { Email } from "../value-objects/email.vo";
import { Password } from "../value-objects/password.vo";

export class Usuario{
    private readonly id: string;
    private nombre: string;
    private email: Email;
    private password:  Password;
    private activo: boolean;

    private constructor(
        id: string,
        nombre: string,
        email: Email,
        password: Password,
        activo: boolean
    ){
        this.id = id;
        this.nombre= nombre;
        this.email=email;
        this.password= password;
        this.activo=activo;
    }

    static crear(
        id: string,
        nombre: string,
        email: Email,
        password: Password,
    ):Usuario{
        if(!nombre || nombre.trim().length ===0){
            throw new Error('El nombre del usuario no debe estar vacío');
        }
        return new Usuario(id, nombre.trim(), email, password, true);
    }

    static reconstruir(
        id: string,
        nombre: string,
        email: Email,
        password: Password,
        activo: boolean,
    ):Usuario{
        return new Usuario(id, nombre, email, password, activo);
    }

    desactivar():void{
        this.activo= false;
    }

    activar(): void{
        this.activo= true;
    }

    cambiarNombre(nuevoNombre: string): void{
        if(!nuevoNombre || nuevoNombre.trim().length === 0){
            throw new Error('El nombre del usuario no puede estar vacío')
        }
        this.nombre = nuevoNombre.trim();
    }

    cambiarPassword(nuevoPasssword: Password): void{
        this.password= nuevoPasssword;
    }

    getId(): string {
        return this.id;
    }

    getNombre(): string{
        return this.nombre;
    }

    getEmail(): Email{
        return this.email;
    }

    getPassword(): Password{
        return this.password; 
    }

    getActivo(): boolean{
        return this.activo;
    }
}