import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Ingrediente } from './../ingrediente';
import { IngredienteService } from './../ingrediente.service';
import { AccionTabla, ColumnaConfig } from '../../tabla-app/tabla/tabla.component';

@Component({
  selector: 'app-ingrediente-lista',
  templateUrl: './ingrediente-lista.component.html',
  styleUrls: ['./ingrediente-lista.component.css'],
})
export class IngredienteListaComponent implements OnInit {
  ingredientes: Array<Ingrediente> = [];
  ingredienteSeleccionado: Ingrediente | null = null;
  restauranteIdCtx: string | null = null;

  // 🔑 Aquí guardamos el rol
  rol: string = '';

  columnasTabla: ColumnaConfig[] = [
    { campo: 'nombre', encabezado: 'Ingrediente', ordenable: true },
    { campo: 'mejor_precio', encabezado: 'Precio', ordenable: true },
    { campo: 'mejor_proveedor_nombre', encabezado: 'Proveedor', ordenable: true },
    { campo: 'total_cantidad', encabezado: 'Cantidad total', ordenable: true },
    { campo: 'accion', encabezado: 'Acciones', tipo: 'accion', clase: 'text-center' },
  ];

  constructor(
    private routerPath: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ingredienteService: IngredienteService
  ) {}

  ngOnInit() {

    this.rol = (sessionStorage.getItem('rol') || '').trim().toLowerCase();

    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    this.ingredienteService.darIngredientes().subscribe(
      (ingredientes) => {
        this.ingredientes = ingredientes.map((ing) => ({
          ...ing,
          mejor_proveedor_nombre: ing.mejor_proveedor?.nombre ?? 'Sin asignar aún',
          total_cantidad: ing.total_cantidad ?? 0,
        }));
      },
      (error) => this.manejarError(error)
    );
  }


  get isAdmin(): boolean {
    return this.rol === 'admin';
  }

  manejarAccion(evento: AccionTabla): void {
    const rid = this.restauranteIdCtx;

    if ((evento.accion === 'crear' || evento.accion === 'editar') && !this.isAdmin) {
      this.toastr.warning('No tienes permisos para realizar esta acción');
      return;
    }

    switch (evento.accion) {
      case 'crear':
        this.routerPath.navigate(['/restaurantes', rid, 'ingrediente', 'crear']);
        break;
      case 'editar':
        this.routerPath.navigate(['/restaurantes', rid, 'ingrediente', 'editar', evento.datos.id]);
        break;
      case 'detalle':
        this.routerPath.navigate(['/restaurantes', rid, 'ingrediente', 'detalle', evento.datos.id]);
        break;
      case 'eliminar':
        this.ingredienteSeleccionado = evento.datos;
        break;
    }
  }

  confirmarBorrado(): void {
    if (!this.ingredienteSeleccionado) return;

    this.ingredienteService.borrarIngrediente(this.ingredienteSeleccionado.id).subscribe(
      () => {
        this.toastr.success('Confirmation', 'Registro eliminado de la lista');
        this.ngOnInit();
      },
      (error) => this.manejarError(error)
    );
  }

  private manejarError(error: any): void {
    if (error.statusText === 'UNAUTHORIZED') {
      this.toastr.error('Error', 'Su sesión ha caducado, por favor vuelva a iniciar sesión.');
    } else if (error.statusText === 'UNPROCESSABLE ENTITY') {
      this.toastr.error('Error', 'No hemos podido identificarlo, por favor vuelva a iniciar sesión.');
    } else {
      this.toastr.error('Error', 'Ha ocurrido un error. ' + error.message);
    }
  }

}
