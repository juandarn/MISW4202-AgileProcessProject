import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReporteCompra } from '../reporte-compra.model';
import { ReportesService } from '../reportes.service';

@Component({
  selector: 'app-reporte-compra',
  templateUrl: './reporte-compra.component.html',
  styleUrls: ['./reporte-compra.component.css'],
})
export class ReporteCompraComponent implements OnInit {
  reporte: ReporteCompra | null = null;
  cargando = false;
  error: string | null = null;

  restauranteId = 0;
  idMenu = 0;

  constructor(
    private route: ActivatedRoute,
    private reporteService: ReportesService
  ) {}

  ngOnInit(): void {
    // 🔵 restaurante desde el padre: /restaurantes/:id/...
    this.restauranteId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    // 🔵 menu id desde esta ruta: .../reportecompra/:mid
    this.idMenu = Number(this.route.snapshot.paramMap.get('mid'));

    if (!this.restauranteId || !this.idMenu) {
      this.error = 'Faltan parámetros de restaurante o menú';
      return;
    }

    this.cargarReporte(this.restauranteId, this.idMenu);
  }

  cargarReporte(restauranteId: number, idMenu: number): void {
    this.cargando = true;
    this.error = null;

    this.reporteService.darReporteCompra(restauranteId, idMenu).subscribe({
      next: (data: ReporteCompra) => {
        this.reporte = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar reporte:', err);
        this.error = err?.error?.mensaje || 'No se pudo cargar el reporte';
        this.cargando = false;
      },
    });
  }
}
