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
        activo: boolean,
    ):Usuario{
        if(!nombre || nombre.trim().length ===0){
            throw new Error('El nombre del usuario no debe estar vacío');
        }
        return new Usuario(id, nombre.trim(), email, password, true);//Hasta aqui quede, tener en cuenta que estamos en usuario,
    }
}