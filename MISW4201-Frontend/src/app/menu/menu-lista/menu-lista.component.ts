// src/app/menu/menu-lista/menu-lista.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Menu } from '../menu';
import { MenuService } from '../menu.service';
import { AccionTabla, ColumnaConfig } from '../../tabla-app/tabla/tabla.component';

@Component({
  selector: 'app-menu-lista',
  templateUrl: './menu-lista.component.html',
  styleUrls: ['./menu-lista.component.css']
})
export class MenuListaComponent implements OnInit {
  menus: Menu[] = [];
  menuSeleccionado: Menu | null = null;

  restauranteIdCtx: number | null = null;

  columnasTabla: ColumnaConfig[] = [
    { campo: 'nombre', encabezado: 'Nombre', ordenable: true },
    { campo: 'fechainicio', encabezado: 'Fecha inicio', ordenable: true, tipo: 'fecha' },
    { campo: 'fechafin', encabezado: 'Fecha fin', ordenable: true, tipo: 'fecha' },
    { campo: 'accion', encabezado: 'Acción', tipo: 'accion', clase: 'text-center' }
  ];

  constructor(
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.restauranteIdCtx = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.cargarMenus();
  }

  cargarMenus() {
    if (!this.restauranteIdCtx) return;
    this.menuService.darMenus(this.restauranteIdCtx).subscribe({
      next: (datos) => { this.menus = datos["menus"]; },
      error: (err) => { console.error('❌ Error al cargar los menús', err); }
    });
  }

  manejarAccion(evento: AccionTabla) {
    if (!this.restauranteIdCtx) return;

    switch (evento.accion) {
      case 'crear':
        this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'menu', 'crear']);
        break;
      case 'editar':
        this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'menu', 'editar', evento.datos.id]);
        break;
      case 'eliminar':
        this.menuSeleccionado = evento.datos;
        break;
      case 'detalle':
        this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'menu', 'detalle', evento.datos.id]);
        break;
    }
  }

  confirmarEliminar() {
    if (this.menuSeleccionado && this.restauranteIdCtx) {
      this.menuService.borrarMenu(this.restauranteIdCtx, this.menuSeleccionado.id).subscribe({
        next: () => this.cargarMenus(),
        error: (err) => console.error('❌ Error al eliminar el menú', err)
      });
    }
  }
}
