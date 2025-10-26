import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestauranteService } from '../restaurante.service';

@Component({
  selector: 'app-restaurante-crear',
  templateUrl: './restaurante-crear.component.html',
  styleUrls: ['./restaurante-crear.component.css'],
})
export class RestauranteCrearComponent implements OnInit {
  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;
  restauranteForm!: FormGroup;

  tiposComida: string[] = [
    'Colombiana',
    'Italiana',
    'Mexicana',
    'China',
    'Japonesa',
    'India',
    'Vegetariana',
    'Vegana',
    'Rápida',
    'Fusión',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private routerPath: Router,
    private toastr: ToastrService,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit(): void {
    this.restauranteForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required]],
      telefono: [
        '',
        [Validators.required, Validators.pattern('^[+0-9 ()-]{7,20}$')],
      ],
      horario_atencion: ['', [Validators.required]],
      tipo_comida: ['', [Validators.required]],
      foto: [null],
    });
  }

  crearRestaurante(): void {
    if (this.restauranteForm.valid) {
      const formData = new FormData();

      formData.append('nombre', this.restauranteForm.get('nombre')?.value || '');
      formData.append('direccion', this.restauranteForm.get('direccion')?.value || '');
      formData.append('telefono', this.restauranteForm.get('telefono')?.value || '');
      formData.append('horario_atencion', this.restauranteForm.get('horario_atencion')?.value || '');
      formData.append('tipo_comida', this.restauranteForm.get('tipo_comida')?.value || '');

      if (this.archivoSeleccionado) {
        formData.append('foto', this.archivoSeleccionado, this.archivoSeleccionado.name);
      }

      this.restauranteService.crearRestaurante(formData).subscribe({
        next: () => {
          this.toastr.success('Restaurante creado exitosamente');
          this.restauranteForm.reset();
          this.routerPath.navigate(['/restaurantes']);
        },
        error: (error) => {
          if (error.status === 401 || error.statusText === 'Unauthorized') {
            this.toastr.error('No autorizado');
          } else {
            this.toastr.error('Error al crear restaurante');
          }
        },
      });
    } else {
      this.toastr.warning('Por favor, complete el formulario correctamente');
    }
  }

  cancelarRestaurante(): void {
    this.restauranteForm.reset();
    this.routerPath.navigate(['/restaurantes']);
  }

  manejarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.procesarArchivo(input.files?.[0]);
  }

  manejarDrop(event: DragEvent): void {
    event.preventDefault();
    this.procesarArchivo(event.dataTransfer?.files[0]);
  }

  permitirDrop(event: DragEvent): void {
    event.preventDefault();
  }

  eliminarImagen(): void {
    const preview = document.querySelector('.preview-container');
    if (preview) {
      preview.classList.remove('animate-fade-in');
      preview.classList.add('animate-fade-out');
      setTimeout(() => (this.imagenPreview = null), 300);
    } else {
      this.imagenPreview = null;
    }
    this.archivoSeleccionado = null;
    this.restauranteForm.patchValue({ foto: null });
  }

  private procesarArchivo(file?: File): void {
    if (file) {
      this.archivoSeleccionado = file;
      this.restauranteForm.patchValue({ foto: file });

      const reader = new FileReader();
      reader.onload = () => (this.imagenPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }
}
