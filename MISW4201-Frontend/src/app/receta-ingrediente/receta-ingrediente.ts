import { Ingrediente } from './../ingrediente/ingrediente';

export class RecetaIngrediente {
    id: number;
    cantidad: number;
    ingrediente: Ingrediente

    public constructor(id: number, cantidad: number, ingrediente: Ingrediente) {
        this.id = id;
        this.cantidad = cantidad;
        this.ingrediente = ingrediente;
    }

}
