import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ColumnaConfig } from '../../tabla-app/tabla/tabla.component';
import { Restaurante } from '../restaurante';
import { RestauranteService } from '../restaurante.service';

type ChefLite = { id: string | number; nombre?: string; telefono?: string; correo?: string; especialidad?: string };
type RestauranteConChefs = Restaurante & { chefs?: ChefLite[] };

@Component({
  selector: 'app-restaurante-listar',
  templateUrl: './restaurante-listar.component.html',
  styleUrls: ['./restaurante-listar.component.css'],
})
export class RestauranteListarComponent implements OnInit {
  @Input() modoSeleccion = false;
  @Input() mostrarEncabezado: boolean = false;
  @Input() titulo = 'Restaurantes';
  @Input() subtitulo = 'Selecciona el restaurante que deseas administrar';

  @Output() seleccionar = new EventEmitter<Restaurante>();

  restaurantes: RestauranteConChefs[] = [];
  restauranteSeleccionado: RestauranteConChefs | null = null;

  private rol: string = '';

  columnasTabla: ColumnaConfig[] = [
    { campo: 'nombre', encabezado: 'Nombre', ordenable: true },
    { campo: 'direccion', encabezado: 'Dirección', ordenable: true },
    { campo: 'telefono', encabezado: 'Teléfono' },
    { campo: 'horario_atencion', encabezado: 'Horario' },
    { campo: 'tipo_comida', encabezado: 'Tipo de comida', ordenable: true },
    { campo: 'accion', encabezado: 'Acciones', tipo: 'accion', clase: 'text-center' },
  ];

  constructor(
    private routerPath: Router,
    private toastr: ToastrService,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit(): void {
    this.rol = (sessionStorage.getItem('rol') || '').trim().toLowerCase();

    this.restauranteService.darRestaurantes().subscribe({
      next: (restaurantes: RestauranteConChefs[]) => {
        if (this.isChef) {
          const idChef = (sessionStorage.getItem('idUsuario') || '').toString();
          if (!idChef) {
            this.toastr.error('No se pudo identificar al chef actual');
            this.restaurantes = [];
            return;
          }
          // 🔎 Filtrar solo los restaurantes donde en el JSON venga este chef
          this.restaurantes = (restaurantes || []).filter(r =>
            (r.chefs || []).some(c => String(c.id) === idChef)
          );

          if (this.restaurantes.length === 0) {
            this.toastr.info('No tienes restaurantes asignados todavía.');
          }
        } else {
          // Admin (u otros) ven todos
          this.restaurantes = restaurantes || [];
        }
      },
      error: () => this.toastr.error('Error al cargar los restaurantes', 'Error'),
    });
  }

  public get isChef(): boolean {
    return this.rol === 'chef';
  }

  crearRestaurante() {
    if (this.modoSeleccion || this.isChef) return; // chef no crea desde aquí
    this.routerPath.navigate(['restaurantes/crear']);
  }

  clickCard(restaurante: RestauranteConChefs): void {
    if (this.isChef) {
      // Persistimos selección para que otras vistas/servicios sepan qué restaurante usar
      sessionStorage.setItem('restauranteId', String(restaurante.id));
      if ((restaurante as any).nombre) {
        sessionStorage.setItem('restauranteNombre', (restaurante as any).nombre);
      }
      this.toastr.success(`Restaurante seleccionado: ${(restaurante as any).nombre || restaurante.id}`);
      // Ir directo a recetas del restaurante (ruta ya existente)
      this.routerPath.navigate(['/restaurantes', restaurante.id, 'recetas']);
      return;
    }

    if (this.modoSeleccion) {
      this.restauranteSeleccionado = restaurante;
      this.seleccionar.emit(restaurante);
    } else {
      this.verRestaurante(String(restaurante.id), (restaurante as any).nombre);
    }
  }

  verRestaurante(id: string, nombre?: string): void {
    if (this.isChef) {
      sessionStorage.setItem('restauranteId', id);
      if (nombre) sessionStorage.setItem('restauranteNombre', nombre);
      this.routerPath.navigate(['/restaurantes', id, 'recetas']);
      return;
    }
    this.routerPath.navigate(['/restaurantes', id, 'detalle']);
  }

  isSeleccionado(r: RestauranteConChefs) {
    return this.modoSeleccion && this.restauranteSeleccionado?.id === r.id;
  }
}
