import { Component, OnInit } from '@angular/core';
import { ReportesService } from '../reportes.service';
import { ToastrService } from 'ngx-toastr';
import { ProveedorIngrediente } from 'src/app/proveedor-ingrediente/proveedor-ingrediente';
@Component({
  selector: 'app-tabla-ingredientexproveedor',
  templateUrl: './tabla-ingredientexproveedor.component.html',
  styleUrls: ['./tabla-ingredientexproveedor.component.css'],
})
export class TablaIngredientexproveedorComponent implements OnInit {
  ingredientesProveedores: ProveedorIngrediente[] = [];
  ingredientesProveedoresPaginado: ProveedorIngrediente[] = [];

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
    this.reportesService.darIngredientesProveedores().subscribe({
      next: (data) => {
        this.spinner = false;
        this.ingredientesProveedores = data;
        console.log(this.ingredientesProveedores);
        this.mostrarTabla = true;
        this.actualizarTabla();
        this.toastr.success(
          'El reporte de ingredientes por proveedor se cargó correctamente.',
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
    let filtrado = this.ingredientesProveedores.filter((h) => {
      const proveedor = h.proveedor?.nombre || '';
      const ingrediente = h.ingrediente?.nombre || '';
      return (
        proveedor.toLowerCase().includes(this.textoBusqueda.toLowerCase()) ||
        ingrediente.toLowerCase().includes(this.textoBusqueda.toLowerCase())
      );
    });

    // Paginación
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    const fin = inicio + this.tamanoPagina;
    this.ingredientesProveedoresPaginado = filtrado.slice(inicio, fin);
  }

  get paginasTotales() {
    return Array(
      Math.ceil(
        this.ingredientesProveedores.filter((h) => {
          const proveedor = h.proveedor?.nombre || '';
          const ingrediente = h.ingrediente?.nombre || '';
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

  getColorCalificacion(
    calificacion: string | number | undefined | null
  ): string {
    const cal = Number(calificacion);
    if (!cal || cal < 1) return 'rojo';
    if (cal <= 2) return 'rojo';
    if (cal === 3) return 'naranja';
    if (cal === 4) return 'amarillo';
    return cal >= 5 ? 'verde' : 'rojo';
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
    this.ingredientesProveedores.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (columna) {
        case 'proveedor':
          valorA = a.proveedor?.nombre || '';
          valorB = b.proveedor?.nombre || '';
          break;
        case 'ingrediente':
          valorA = a.ingrediente?.nombre || '';
          valorB = b.ingrediente?.nombre || '';
          break;
        case 'precio':
          valorA = Number(a.precio) || 0;
          valorB = Number(b.precio) || 0;
          break;
        case 'calificacion':
          valorA = Number(a.proveedor?.calificacion) || 0;
          valorB = Number(b.proveedor?.calificacion) || 0;
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
