import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface ColumnaConfig {
  campo: string;
  encabezado: string;
  ordenable?: boolean;
  tipo?: 'texto' | 'fecha' | 'accion' | 'calificacion';
  clase?: string;
  formato?: string;
}

export interface AccionTabla {
  accion: 'editar' | 'eliminar' | 'crear' | 'detalle';
  datos?: any;
}

@Component({
  selector: 'tabla-app',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css'],
})
export class TablaComponent implements OnInit {
  @Input() datos: any[] = [];
  @Input() columnas: ColumnaConfig[] = [];
  @Input() tituloAccion: string = 'Acción';

  // 🔑 Flags para visibilidad de botones (y columna de acciones)
  @Input() mostrarBotonCrear: boolean = true;
  @Input() mostrarBotonEditar: boolean = true;
  @Input() mostrarBotonEliminar: boolean = true;

  @Output() accion = new EventEmitter<AccionTabla>();

  tamanoPagina: number = 10;
  pagina: number = 1;
  campoOrden: string = '';
  esOrdenAscendente: boolean = true;
  busqueda: string = '';

  ngOnInit(): void {
    if (this.columnas.length > 0 && this.columnas[0].ordenable) {
      this.campoOrden = this.columnas[0].campo;
    }
  }

  /** Filtra las columnas visibles según permisos */
  get columnasVisibles(): ColumnaConfig[] {
    return this.columnas.filter(col => {
      if (col.tipo === 'accion') {
        return this.mostrarBotonEditar || this.mostrarBotonEliminar;
      }
      return true;
    });
  }

  get datosFiltrados() {
    if (!this.busqueda) return this.datos;
    return this.datos.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(this.busqueda.toLowerCase())
      )
    );
  }

  get datosOrdenados() {
    const ordenables = [...this.datosFiltrados];
    if (!this.campoOrden) return ordenables;

    return ordenables.sort((a, b) => {
      let valorA = a[this.campoOrden];
      let valorB = b[this.campoOrden];

      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return this.esOrdenAscendente
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      if (valorA < valorB) return this.esOrdenAscendente ? -1 : 1;
      if (valorA > valorB) return this.esOrdenAscendente ? 1 : -1;
      return 0;
    });
  }

  get datosPaginados() {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    return this.datosOrdenados.slice(inicio, inicio + this.tamanoPagina);
  }

  get paginasTotales() {
    if (!this.datosFiltrados) return [];
    const pageCount = Math.ceil(this.datosFiltrados.length / this.tamanoPagina);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  cambiarCriterioDeOrden(campo: string) {
    if (this.campoOrden === campo) {
      this.esOrdenAscendente = !this.esOrdenAscendente;
    } else {
      this.campoOrden = campo;
      this.esOrdenAscendente = true;
    }
    this.pagina = 1;
  }

  manejarClickFila(fila: any) {
    this.accion.emit({ accion: 'detalle', datos: fila });
  }

  getColor(valor: any): string {
    const num = Number(valor);
    return `c${num}`;
  }


  crear() {
    this.accion.emit({ accion: 'crear' });
  }

  editar(fila: any) {
    this.accion.emit({ accion: 'editar', datos: fila });
  }

  eliminar(fila: any) {
    this.accion.emit({ accion: 'eliminar', datos: fila });
  }
}
