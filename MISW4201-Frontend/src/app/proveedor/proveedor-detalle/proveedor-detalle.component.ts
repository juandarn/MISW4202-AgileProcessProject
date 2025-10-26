import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';
import { Ingrediente } from 'src/app/ingrediente/ingrediente';

@Component({
  selector: 'app-proveedor-detalle',
  templateUrl: './proveedor-detalle.component.html',
  styleUrls: ['./proveedor-detalle.component.css'],
})
export class ProveedorDetalleComponent implements OnInit {
  proveedor: Proveedor;
  listaIngredientes: Ingrediente[];

  // (opcional) restaurante en contexto por si lo necesitas
  restauranteIdCtx: string | null = null;

  constructor(
    private proveedorService: ProveedorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idProveedor = parseInt(this.route.snapshot.paramMap.get('pid') || '0', 10);
    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    this.proveedorService.darProveedor(idProveedor).subscribe((prov) => {
      this.proveedor = prov;
      this.listaIngredientes = (prov.ingredientes || []).map((i) => i.ingrediente);
    });
  }

  getColor(calificacion: number | string | null | undefined): string {
    const n = Number(calificacion);
    if (isNaN(n)) return 'c3';
    const v = Math.max(1, Math.min(5, Math.round(n)));
    return `c${v}`;
  }
}
