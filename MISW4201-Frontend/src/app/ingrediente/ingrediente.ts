import { ProveedorIngrediente } from "../proveedor-ingrediente/proveedor-ingrediente";
import { Proveedor } from "../proveedor/proveedor";

export class Ingrediente {
  id: number;
  nombre: string;
  mejor_precio: number;
  mejor_proveedor: Proveedor;
  proveedores: ProveedorIngrediente[]
  total_cantidad?: number;

  public constructor(id: number, nombre: string, mejor_precio: number, proveedor: Proveedor, total_cantidad?: number) {
    this.id = id;
    this.nombre = nombre;
    this.mejor_precio = mejor_precio || null;
    this.mejor_proveedor = proveedor || null;
    this.proveedores = []
    this.total_cantidad = total_cantidad || 0;
  }

}
