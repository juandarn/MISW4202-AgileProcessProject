import { RecetaIngrediente } from '../receta-ingrediente/receta-ingrediente';

export class Receta {
    id: number;
    nombre: string;
    duracion: number;
    preparacion: string;
    ingredientes: Array<RecetaIngrediente>


    public constructor(id: number, nombre: string, duracion: number, preparacion: string) {
        this.id = id;
        this.nombre = nombre;
        this.duracion = duracion;
        this.preparacion = preparacion;
        this.ingredientes = [];
    }
}
