import { Proveedor } from '../proveedor/proveedor';
import { Ingrediente } from './../ingrediente/ingrediente';

export class ProveedorIngrediente {
  id: number;
  precio: number;
  cantidad: number;   
  fecha: Date;
  ingrediente: Ingrediente;
  proveedor: Proveedor;

  public constructor(
    id: number,
    precio: number,
    cantidad: number,  
    ingrediente: Ingrediente,
    proveedor: Proveedor
  ) {
    this.id = id;
    this.precio = precio;
    this.cantidad = cantidad;  
    this.fecha = new Date();
    this.ingrediente = ingrediente;
    this.proveedor = proveedor;
  }
}
