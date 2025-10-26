import { ProveedorIngrediente } from './../proveedor-ingrediente/proveedor-ingrediente';

export class IngredienteProveedorHistorial {
  fecha: Date;
  precio: number;
  ingrediente_proveedor: ProveedorIngrediente;

  constructor(
    fecha: string,
    precio: string,
    ingrediente_proveedor: ProveedorIngrediente
  ) {
    this.fecha = new Date(fecha);
    this.precio = parseFloat(precio) || 0;
    this.ingrediente_proveedor = ingrediente_proveedor;
  }
}
