import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IngredienteProveedorHistorial } from '../ingrediente-proveedor-historial';
import { ReportesService } from '../reportes.service';

@Component({
  selector: 'app-tabla-historial-precios',
  templateUrl: './tabla-historial-precios.component.html',
  styleUrls: ['./tabla-historial-precios.component.css'],
})
export class TablaHistorialPreciosComponent implements OnInit {
  historialPrecios: IngredienteProveedorHistorial[] = [];
  historialPaginado: IngredienteProveedorHistorial[] = [];

  textoBusqueda: string = '';
  tamanoPagina: number = 10;
  pagina: number = 1;
  spinner: boolean = true;
  mostrarTabla: boolean;

  constructor(
    private toastr: ToastrService,
    private reportesService: ReportesService
  ) {}

  ngOnInit() {
    this.reportesService.darHistorialPrecios().subscribe({
      next: (historial) => {
        this.spinner = false;
        this.historialPrecios = historial;
        this.mostrarTabla = true;
        this.actualizarTabla();
        this.toastr.success(
          'El historial de precios se cargó correctamente.',
          'Operación exitosa',
          {
            timeOut: 3000,
            progressBar: true,
            closeButton: true,
            positionClass: 'toast-bottom-right',
          }
        );
      },
      error: (err) => {
        console.error(err);
        this.spinner = false;
        this.mostrarTabla = false;
        this.toastr.error(
          err?.message || 'Ocurrió un error al obtener los datos.',
          'Error en la carga',
          {
            timeOut: 3000,
            progressBar: true,
            closeButton: true,
            positionClass: 'toast-bottom-right',
          }
        );
      },
    });
  }

  actualizarTabla() {
    // Filtrar por búsqueda
    let filtrado = this.historialPrecios.filter((h) => {
      const proveedor = h.ingrediente_proveedor?.proveedor?.nombre || '';
      const ingrediente = h.ingrediente_proveedor?.ingrediente?.nombre || '';
      return (
        proveedor.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        ingrediente.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      );
    });

    // Paginación
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.historialPaginado = filtrado.slice(inicio, fin);
  }

  get paginasTotales() {
    return Array(
      Math.ceil(
        this.historialPrecios.filter((h) => {
          const proveedor = h.ingrediente_proveedor?.proveedor?.nombre || '';
          const ingrediente =
            h.ingrediente_proveedor?.ingrediente?.nombre || '';
          return (
            proveedor
              .toLowerCase()
              .includes(this.textoBusqueda.toLowerCase()) ||
            ingrediente.toLowerCase().includes(this.textoBusqueda.toLowerCase())
          );
        }).length / this.tamanoPagina
      )
    )
      .fill(0)
      .map((_, i) => i + 1);
  }

  cambiarPagina(p: number) {
    if (p < 1) return;
    this.pagina = p;
    this.actualizarTabla();
  }

  cambiarTamanoPagina() {
    this.pagina = 1;
    this.actualizarTabla();
  }

  ordenColumna: string = '';
  ordenAsc: boolean = true;

  ordenarPor(columna: string) {
    if (this.ordenColumna === columna) {
      // Si ya está ordenando por esta columna, alternar asc/desc
      this.ordenAsc = !this.ordenAsc;
    } else {
      // Cambiar a nueva columna, inicia en ascendente
      this.ordenColumna = columna;
      this.ordenAsc = true;
    }

    // Ordenar historial
    this.historialPrecios.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (columna) {
        case 'proveedor':
          valorA = a.ingrediente_proveedor?.proveedor?.nombre || '';
          valorB = b.ingrediente_proveedor?.proveedor?.nombre || '';
          break;
        case 'ingrediente':
          valorA = a.ingrediente_proveedor?.ingrediente?.nombre || '';
          valorB = b.ingrediente_proveedor?.ingrediente?.nombre || '';
          break;
        case 'precio':
          valorA = Number(a.precio) || 0;
          valorB = Number(b.precio) || 0;
          break;
        case 'fecha':
          valorA = new Date(a.fecha).getTime();
          valorB = new Date(b.fecha).getTime();
          break;
        default:
          valorA = '';
          valorB = '';
      }

      if (valorA < valorB) return this.ordenAsc ? -1 : 1;
      if (valorA > valorB) return this.ordenAsc ? 1 : -1;
      return 0;
    });

    // Recalcular la tabla paginada
    this.actualizarTabla();
  }
}
