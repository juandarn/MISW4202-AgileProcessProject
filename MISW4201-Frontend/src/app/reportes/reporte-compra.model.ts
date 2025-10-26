// Representa un ingrediente dentro de una receta
export interface Ingrediente {
  nombre: string;
  cantidad_unitaria: number;
  cantidad_total: number;
  proveedor: string | null;
  precio_unitario: number;
  costo_total: number;
}

// Representa una receta dentro de un menú
export interface Receta {
  nombre: string;
  cantidad_recetas: number;
  ingredientes: Ingrediente[];
}

// Representa el reporte de compra completo del menú
export interface ReporteCompra {
  recetas: Receta[];
  total: number;
}
