// src/app/menu/menu-editar/menu-editar.component.ts
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../menu.service';
import { RecetaService } from 'src/app/receta/receta.service';
import { Receta } from 'src/app/receta/receta';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-menu-editar',
  templateUrl: './menu-editar.component.html',
  styleUrls: ['./menu-editar.component.css']
})
export class MenuEditarComponent implements OnInit {
  menuForm: FormGroup;
  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;
  recetasDisponibles: Receta[] = [];
  errorMessage: string | null = null;
  idMenu!: number;
  valoresOriginales: any;

  @ViewChild('successToast', { static: false }) successToast!: ElementRef;

  restauranteIdCtx: number | null = null;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private recetaService: RecetaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.menuForm = this.fb.group({
      nombre: ['', Validators.required],
      fechainicio: ['', Validators.required],
      fechafin: ['', Validators.required],
      descripcion: ['', Validators.required],
      recetas: this.fb.array([]),
      foto: [null]
    });
  }

  ngOnInit(): void {
    this.restauranteIdCtx = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.idMenu = Number(this.route.snapshot.paramMap.get('mid'));  // ← usa :mid

    if (!this.restauranteIdCtx || !this.idMenu) return;

    this.recetaService.darRecetas(this.restauranteIdCtx).subscribe({
      next: recetas => this.recetasDisponibles = recetas,
      error: err => console.error('Error cargando recetas:', err)
    });

    this.menuService.darMenu(this.restauranteIdCtx, this.idMenu).subscribe({
      next: menu => {
        this.llenarFormulario(menu["menu"]);
        this.valoresOriginales = JSON.parse(JSON.stringify(menu["menu"]));
      },
      error: err => {
        console.error('Error cargando menú:', err);
        this.errorMessage = 'No se pudo cargar el menú.';
      }
    });
  }

  get recetas(): FormArray {
    return this.menuForm.get('recetas') as FormArray;
  }

  agregarReceta(): void {
    this.recetas.push(
      this.fb.group({ idReceta: [null, Validators.required], personas: [1, Validators.required] })
    );
  }

  eliminarReceta(index: number): void { this.recetas.removeAt(index); }

  private base64ToFile(base64: string, filename: string, mimeType: string = 'image/png'): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new File([ab], filename, { type: mimeType });
  }

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
      foto: null
    });

    if (menu.foto) {
      this.imagenPreview = `data:image/png;base64,${menu.foto}`;
      const file = this.base64ToFile(menu.foto, 'menu.png');
      this.archivoSeleccionado = file;
      this.menuForm.patchValue({ foto: file });
    } else {
      this.imagenPreview = null;
      this.archivoSeleccionado = null;
    }
  }

  eliminarImagen(): void {
    this.imagenPreview = null;
    this.archivoSeleccionado = null;
    this.menuForm.patchValue({ foto: null });
  }

  manejarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.procesarArchivo(input.files?.[0]);
  }

  manejarDrop(event: DragEvent): void {
    event.preventDefault();
    this.procesarArchivo(event.dataTransfer?.files[0]);
  }

  permitirDrop(event: DragEvent): void { event.preventDefault(); }

  private procesarArchivo(file?: File): void {
    if (file) {
      this.archivoSeleccionado = file;
      this.menuForm.patchValue({ foto: file });
      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  cancelar(): void {
    // Ir a la lista de menús del restaurante
    const rid = this.restauranteIdCtx;
    if (rid) {
      this.router.navigate(['/restaurantes', rid, 'menus']);
    } else {
      // Fallback por si no hay contexto (no debería pasar)
      this.router.navigate(['/menus']);
    }
  }


  guardarCambios(): void {
    if (this.menuForm.invalid || !this.restauranteIdCtx) {
      this.menuForm.markAllAsTouched();
      this.errorMessage = 'Por favor complete todos los campos obligatorios.';
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.menuForm.get('nombre')?.value || '');
    formData.append('fechainicio', this.menuForm.get('fechainicio')?.value || '');
    formData.append('fechafin', this.menuForm.get('fechafin')?.value || '');
    formData.append('descripcion', this.menuForm.get('descripcion')?.value || '');
    formData.append('autor_id', sessionStorage.getItem('idUsuario') || '');
    formData.append('recetas', JSON.stringify(this.recetas.value));
    if (this.archivoSeleccionado) formData.append('foto', this.archivoSeleccionado);

    this.menuService.editarMenu(this.restauranteIdCtx, this.idMenu, formData).subscribe({
      next: () => {
        this.errorMessage = null;

        // Mostrar toast de éxito
        const toast = new Toast(this.successToast.nativeElement);
        toast.show();

        // 🔁 Redirigir a la lista de menús del restaurante
        setTimeout(() => {
          this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'menus']);
        }, 900);
      },
      error: err => {
        console.error('Error al editar menú:', err);
        this.errorMessage = err.error?.mensaje || 'Error inesperado al editar el menú.';
      }
    });
  }
}
