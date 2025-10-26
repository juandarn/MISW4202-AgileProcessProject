import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Receta } from '../receta';
import { RecetaService } from '../receta.service';
import { AccionTabla, ColumnaConfig } from '../../tabla-app/tabla/tabla.component';

@Component({
  selector: 'app-receta-lista',
  templateUrl: './receta-lista.component.html',
  styleUrls: ['./receta-lista.component.css'],
})
export class RecetaListaComponent implements OnInit {
  recetas: Array<Receta> = [];
  recetaSeleccionada: Receta | null = null;

  columnasTabla: ColumnaConfig[] = [
    { campo: 'nombre', encabezado: 'Nombre', ordenable: true },
    { campo: 'duracion', encabezado: 'Horas preparación', ordenable: true },
    { campo: 'accion', encabezado: 'Acciones', tipo: 'accion', clase: 'text-center' },
  ];

  constructor(
    private routerPath: Router,
    private toastr: ToastrService,
    private recetaService: RecetaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const restauranteId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.recetaService.darRecetas(restauranteId).subscribe(
      (recetas) => {
        this.recetas = recetas.map(r => ({
          ...r,
          duracion: Number(r.duracion)
        }));
      },
      (error) => this.manejarError(error)
    );
  }

  manejarAccion(evento: AccionTabla): void {
    const restauranteId = this.route.parent?.snapshot.paramMap.get('id');

    switch (evento.accion) {
      case 'crear':
        this.routerPath.navigate(['/restaurantes', restauranteId, 'receta', 'crear']);
        break;
      case 'editar':
        this.routerPath.navigate(['/restaurantes', restauranteId, 'receta', 'editar', evento.datos.id]);
        break;
      case 'detalle':
        this.routerPath.navigate(['/restaurantes', restauranteId, 'receta', 'detalle', evento.datos.id]);
        break;
      case 'eliminar':
        this.recetaSeleccionada = evento.datos;
        break;
    }
  }

  confirmarBorrado(): void {
    if (this.recetaSeleccionada) {
      const restauranteId = Number(this.route.parent?.snapshot.paramMap.get('id'));
      this.recetaService.borrarReceta(this.recetaSeleccionada.id, restauranteId).subscribe(
        () => {
          this.toastr.success('Confirmation', 'Registro eliminado de la lista');
          this.ngOnInit();
        },
        (error) => this.manejarError(error)
      );
    }
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
