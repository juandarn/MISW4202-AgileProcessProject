import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IngredienteService } from '../ingrediente.service';
import { Ingrediente } from '../ingrediente';
import { ProveedorIngrediente } from 'src/app/proveedor-ingrediente/proveedor-ingrediente';

@Component({
  selector: 'app-ingrediente-detalle',
  templateUrl: './ingrediente-detalle.component.html',
  styleUrls: ['./ingrediente-detalle.component.css'],
})
export class IngredienteDetalleComponent implements OnInit {
  ingrediente!: Ingrediente;
  listaProveedores: ProveedorIngrediente[] = [];

  // (opcional) id del restaurante en contexto si lo necesitas para breadcrumbs, etc.
  restauranteIdCtx: string | null = null;

  constructor(
    private ingredienteService: IngredienteService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // param de ingrediente es :iid en rutas anidadas
    const idIngrediente = parseInt(this.route.snapshot.paramMap.get('iid') || '0', 10);
    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    this.ingredienteService.darIngrediente(idIngrediente).subscribe((ing) => {
      this.ingrediente = {
        ...ing,
        total_cantidad: ing.total_cantidad ?? 0,
        mejor_proveedor: ing.mejor_proveedor ?? null,
        mejor_precio: ing.mejor_precio ?? null,
      };

      this.listaProveedores = ing.proveedores ?? [];
    });
  }

  getColor(calificacion: number | string | null | undefined): string {
    const n = Number(calificacion);
    if (isNaN(n)) return 'c3';
    const v = Math.max(1, Math.min(5, Math.round(n)));
    return `c${v}`;
  }
}
