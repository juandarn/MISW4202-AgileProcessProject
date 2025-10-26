// src/app/menu/menu-crear/menu-crear.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MenuService } from '../menu.service';
import { RecetaService } from 'src/app/receta/receta.service';
import { Receta } from 'src/app/receta/receta';
import { Toast } from 'bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-menu-crear',
  templateUrl: './menu-crear.component.html',
  styleUrls: ['./menu-crear.component.css']
})
export class MenuCrearComponent implements OnInit {
  menuForm: FormGroup;
  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;
  recetasDisponibles: Receta[] = [];
  errorMessage: string | null = null;

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
      recetas: this.fb.array([
        this.fb.group({ idReceta: [null, Validators.required], personas: [1, Validators.required] })
      ]),
      foto: [null]
    });
  }

  @ViewChild('successToast', { static: false }) successToast!: ElementRef;

  ngOnInit(): void {
    this.restauranteIdCtx = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (!this.restauranteIdCtx) return;

    this.recetaService.darRecetas(this.restauranteIdCtx).subscribe({
      next: recetas => this.recetasDisponibles = recetas,
      error: err => console.error('Error cargando recetas:', err)
    });
  }

  get recetas(): FormArray { return this.menuForm.get('recetas') as FormArray; }

  agregarReceta(): void {
    this.recetas.push(this.fb.group({ idReceta: [null, Validators.required], personas: [1, Validators.required] }));
  }
  eliminarReceta(index: number): void { this.recetas.removeAt(index); }

  eliminarImagen(): void {
    const preview = document.querySelector('.preview-container');
    if (preview) {
      preview.classList.remove('animate-fade-in');
      preview.classList.add('animate-fade-out');
      setTimeout(() => { this.imagenPreview = null; }, 300);
    } else {
      this.imagenPreview = null;
    }
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
    this.menuForm.reset();
    this.recetas.clear();
    this.imagenPreview = null;
    this.archivoSeleccionado = null;
    this.errorMessage = null;
  }

  agregar(): void {
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

    const recetasArray = this.recetas.value.map((r: any) => ({
      idReceta: Number(r.idReceta),
      personas: Number(r.personas)
    }));
    formData.append('recetas', JSON.stringify(recetasArray));

    if (this.archivoSeleccionado) {
      formData.append('foto', this.archivoSeleccionado, this.archivoSeleccionado.name);
    }

    this.menuService.crearMenuConFoto(this.restauranteIdCtx, formData).subscribe({
      next: () => {
        this.errorMessage = null;
        const toast = new Toast(this.successToast.nativeElement);
        toast.show();
        setTimeout(() => {
          this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'menus']);
        }, 900);
      },
      error: err => {
        console.error('Error al crear menú:', err);
        this.errorMessage = err.error?.mensaje || 'Error inesperado al crear el menú. Intente nuevamente.';
      }
    });
  }
}
