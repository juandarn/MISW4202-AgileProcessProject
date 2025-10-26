// src/app/menu/menu-detalle/menu-detalle.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../menu.service';
import { RecetaService } from 'src/app/receta/receta.service';
import { Receta } from 'src/app/receta/receta';
import { AccionTabla, ColumnaConfig } from 'src/app/tabla-app/tabla/tabla.component';

@Component({
  selector: 'app-menu-detalle',
  templateUrl: './menu-detalle.component.html',
  styleUrls: ['./menu-detalle.component.css'],
})
export class MenuDetalleComponent implements OnInit {
  menuForm: FormGroup;
  imagenPreview: string | null = null;
  recetasDisponibles: Receta[] = [];
  errorMessage: string | null = null;
  idMenu!: number;
  recetasParaTabla: any[] = [];

  restauranteIdCtx: number | null = null;

  columnasRecetas: ColumnaConfig[] = [
    { campo: 'nombreReceta', encabezado: 'Receta', ordenable: true },
    { campo: 'personas', encabezado: 'Nº Personas', ordenable: true, clase: 'text-center' },
  ];

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private recetaService: RecetaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.menuForm = this.fb.group({
      nombre: [''],
      fechainicio: [''],
      fechafin: [''],
      descripcion: [''],
      autor: [''],
      recetas: this.fb.array([]),
      foto: [null],
    });
  }

  ngOnInit(): void {
    this.restauranteIdCtx = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.idMenu = Number(this.route.snapshot.paramMap.get('mid'));  // ← usa :mid

    if (!this.restauranteIdCtx || !this.idMenu) return;

    this.recetaService.darRecetas(this.restauranteIdCtx).subscribe({
      next: (recetas) => (this.recetasDisponibles = recetas),
      error: () => {},
    });

    this.menuService.darMenu(this.restauranteIdCtx, this.idMenu).subscribe({
      next: (menu) => {
        this.llenarFormulario(menu['menu']);
        this.prepararDatosDeRecetasParaTabla();
      },
      error: () => { this.errorMessage = 'No se pudo cargar el menú.'; },
    });
  }

  get recetas(): FormArray { return this.menuForm.get('recetas') as FormArray; }

  private llenarFormulario(menu: any): void {
    this.recetas.clear();
    (menu.recetas ?? []).forEach((r: any) => {
      this.recetas.push(this.fb.group({ idReceta: [r.id, Validators.required], personas: [r.personas, Validators.required] }));
    });

    this.menuForm.patchValue({
      nombre: menu.nombre,
      fechainicio: menu.fechainicio,
      fechafin: menu.fechafin,
      descripcion: menu.descripcion,
      autor: menu.autor?.nombre ?? '',
    });

    this.imagenPreview = menu.foto ? `data:image/png;base64,${menu.foto}` : null;
  }

  prepararDatosDeRecetasParaTabla(): void {
    this.recetasParaTabla = this.recetas.controls.map((control) => ({
      nombreReceta: this.obtenerNombreReceta(control.get('idReceta')?.value),
      personas: control.get('personas')?.value,
      datosOriginales: control.value,
    }));
  }

  manejarAccionReceta(evento: AccionTabla): void {
    if (evento.accion === 'crear' && this.restauranteIdCtx) {
      this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'menu', 'editar', this.idMenu]);
    }
  }

  obtenerNombreReceta(id: number): string {
    const receta = this.recetasDisponibles.find((r) => +r.id === id);
    return receta ? receta.nombre : 'Receta desconocida';
  }

  calcularCompraMenu() {
    if (!this.restauranteIdCtx) return;
    this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'reportecompra', this.idMenu]);
  }

}
