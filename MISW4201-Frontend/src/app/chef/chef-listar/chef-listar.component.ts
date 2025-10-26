import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Chef } from './../chef';
import { ChefService } from './../chef.service';
import {
  AccionTabla,
  ColumnaConfig,
} from '../../tabla-app/tabla/tabla.component';

@Component({
  selector: 'app-chef-listar',
  templateUrl: './chef-listar.component.html',
  styleUrls: ['./chef-listar.component.css'],
})
export class ChefListarComponent implements OnInit {
  chefs: Array<Chef> = [];
  chefSeleccionado: Chef | null = null;

  columnasTabla: ColumnaConfig[] = [
    { campo: 'nombre', encabezado: 'Chef', ordenable: true },
    { campo: 'telefono', encabezado: 'Teléfono', ordenable: true },
    { campo: 'correo', encabezado: 'Correo', ordenable: true },
    { campo: 'especialidad', encabezado: 'Especialidad', ordenable: true },
    {
      campo: 'accion',
      encabezado: 'Acciones',
      tipo: 'accion',
      clase: 'text-center',
    },
  ];

  constructor(
    private routerPath: Router,
    private router: ActivatedRoute,
    private toastr: ToastrService,
    private chefService: ChefService
  ) {}

  ngOnInit() {
    this.chefService.darChefs().subscribe((chefs) => {
      this.chefs = chefs;
    });
  }

  manejarAccion(evento: AccionTabla): void {
    switch (evento.accion) {
      case 'crear':
        this.routerPath.navigate(['/chef/crear/']);
        break;
      case 'editar':
        this.routerPath.navigate(['/chef/editar/' + evento.datos.id]);
        break;
      case 'detalle':
        this.routerPath.navigate(['/chef/detalle/' + evento.datos.id]);
        break;
      case 'eliminar':
        this.chefSeleccionado = evento.datos;
        break;
    }
  }

  confirmarBorrado(): void {
    if (this.chefSeleccionado) {
      this.chefService.borrarChef(this.chefSeleccionado.id).subscribe(
        () => {
          this.toastr.success(
            'Confirmation',
            'Chef eliminado de la lista'
          );
          this.ngOnInit();
        },
        (error) => {
          if (error.statusText === 'UNAUTHORIZED') {
            this.toastr.error(
              'Error',
              'Su sesión ha caducado, por favor vuelva a iniciar sesión.'
            );
          } else if (error.statusText === 'UNPROCESSABLE ENTITY') {
            this.toastr.error(
              'Error',
              'No hemos podido identificarlo, por favor vuelva a iniciar sesión.'
            );
          } else {
            this.toastr.error(
              'Error',
              'Ha ocurrido un error. ' + error.message
            );
          }
        }
      );
    }
  }
}
