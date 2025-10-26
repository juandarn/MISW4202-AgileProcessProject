import { ProveedorIngrediente } from "../proveedor-ingrediente/proveedor-ingrediente";

export class Proveedor {
    id: number;
    nombre: string;
    cedula: string;
    telefono: string;
    correo: string;
    direccion: string;
    calificacion: number;
    ingredientes: ProveedorIngrediente[];


    constructor(id: number, nombre: string, cedula: string, telefono: string, correo: string, direccion: string, calificacion: number) {
        this.id = id;
        this.nombre = nombre;
        this.cedula = cedula;
        this.telefono = telefono;
        this.correo = correo;
        this.direccion = direccion;
        this.calificacion = calificacion;
        this.ingredientes = [];
    }
}