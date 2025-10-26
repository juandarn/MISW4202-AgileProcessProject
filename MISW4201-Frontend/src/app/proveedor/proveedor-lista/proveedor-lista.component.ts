import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';
import {
  AccionTabla,
  ColumnaConfig,
} from '../../tabla-app/tabla/tabla.component';

@Component({
  selector: 'app-proveedor-lista',
  templateUrl: './proveedor-lista.component.html',
  styleUrls: ['./proveedor-lista.component.css'],
})
export class ProveedorListaComponent implements OnInit {
  proveedores: Array<Proveedor> = [];
  proveedorSeleccionado: Proveedor | null = null;

  // id del restaurante en contexto (ruta padre /restaurantes/:id/...)
  restauranteIdCtx: string | null = null;

  columnasTabla: ColumnaConfig[] = [
    { campo: 'nombre', encabezado: 'Nombre', ordenable: true },
    { campo: 'cedula', encabezado: 'Cédula', ordenable: true },
    { campo: 'telefono', encabezado: 'Teléfono' },
    { campo: 'correo', encabezado: 'Correo' },
    { campo: 'direccion', encabezado: 'Dirección' },
    { campo: 'calificacion', encabezado: 'Calificación', tipo: 'calificacion', ordenable: true },
    { campo: 'accion', encabezado: 'Acciones', tipo: 'accion', clase: 'text-center' },
  ];

  constructor(
    private routerPath: Router,
    private toastr: ToastrService,
    private proveedorService: ProveedorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    this.proveedorService.darProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores;
    });
  }

  manejarAccion(evento: AccionTabla): void {
    switch (evento.accion) {
      case 'crear':
        this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'proveedor', 'crear']);
        break;
      case 'editar':
        this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'proveedor', 'editar', evento.datos.id]);
        break;
      case 'detalle':
        this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'proveedor', 'detalle', evento.datos.id]);
        break;
      case 'eliminar':
        this.proveedorSeleccionado = evento.datos;
        break;
    }
  }

  confirmarBorrado(): void {
    if (this.proveedorSeleccionado) {
      this.proveedorService.borrarProveedor(this.proveedorSeleccionado.id).subscribe(
        () => {
          this.toastr.success('Confirmation', 'Registro eliminado de la lista');
          this.ngOnInit();
        },
        (error) => {
          if (error.statusText === 'UNAUTHORIZED') {
            this.toastr.error('Error', 'Su sesión ha caducado, por favor vuelva a iniciar sesión.');
          } else if (error.statusText === 'UNPROCESSABLE ENTITY') {
            this.toastr.error('Error', 'No hemos podido identificarlo, por favor vuelva a iniciar sesión.');
          } else {
            this.toastr.error('Error', 'Ha ocurrido un error. ' + error.message);
          }
        }
      );
    }
  }
}
