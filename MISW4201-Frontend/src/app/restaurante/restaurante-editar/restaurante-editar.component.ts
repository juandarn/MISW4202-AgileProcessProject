import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestauranteService } from '../restaurante.service';
import { Restaurante } from '../restaurante';
import { Chef } from '../../chef/chef';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ChefService } from '../../chef/chef.service';
import { ColumnaConfig } from '../../tabla-app/tabla/tabla.component';

type AccionTabla = { accion: 'editar' | 'eliminar' | 'crear' | 'detalle', datos?: any };

@Component({
  selector: 'app-restaurante-editar',
  templateUrl: './restaurante-editar.component.html',
  styleUrls: ['./restaurante-editar.component.css'],
})
export class RestauranteEditarComponent implements OnInit {
  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;
  restaurante!: Restaurante;
  restauranteForm: FormGroup = {} as FormGroup;

  // Chefs
  chefs: Chef[] = [];
  chefSearch = new FormControl<string>('');
  selectedChefIds = new Set<number>(); // IDs seleccionados

  // Columnas de la tabla
  colsChefsTabla: ColumnaConfig[] = [
    { encabezado: 'Nombre', campo: 'nombre', ordenable: true },
    { encabezado: 'Especialidad', campo: 'especialidad', ordenable: true },
    { encabezado: 'Correo', campo: 'correo', ordenable: true },
    { encabezado: 'Teléfono', campo: 'telefono' },
    { encabezado: 'Acciones', campo: 'acciones', tipo: 'accion' }
  ];

  tiposComida: string[] = [
    'Colombiana', 'Italiana', 'Mexicana', 'China', 'Japonesa',
    'India', 'Vegetariana', 'Vegana', 'Rápida', 'Fusión',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private routerPath: Router,
    private toastr: ToastrService,
    private restauranteService: RestauranteService,
    private chefService: ChefService
  ) {}

  ngOnInit() {
    const idRestaurante = parseInt(this.route.snapshot.params['id']);

    this.restauranteForm = this.formBuilder.group({
      id: [0],
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      horario_atencion: ['', Validators.required],
      tipo_comida: ['', Validators.required],
    });

    // 1) Traer datos del restaurante
    this.restauranteService.darRestaurante(idRestaurante).pipe(
      tap((restaurante) => {
        this.restaurante = restaurante;
        this.restauranteForm.patchValue({
          id: restaurante.id,
          nombre: restaurante.nombre,
          direccion: restaurante.direccion,
          telefono: restaurante.telefono,
          horario_atencion: restaurante.horario_atencion,
          tipo_comida: restaurante.tipo_comida,
        });
        if (restaurante.foto) {
          this.imagenPreview = `data:image/png;base64,${restaurante.foto}`;
          const file = this.base64ToFile(restaurante.foto, 'restaurante.png');
          this.archivoSeleccionado = file;
          this.restauranteForm.patchValue({ foto: file });
        } else {
          this.imagenPreview = null;
          this.archivoSeleccionado = null;
        }


        // Si el backend devuelve los chefs ya asociados:
        const asociados = (restaurante as any)?.chefs as Chef[] | undefined;
        if (asociados && asociados.length) {
          asociados.forEach(c => this.selectedChefIds.add(Number(c.id)));
        }
      }),
      // 2) Traer todos los chefs
      switchMap(() => this.chefService.darChefs()),
      tap((chefs) => {
        this.chefs = chefs ?? [];
      }),
      catchError((err) => {
        this.toastr.error('Error al cargar datos', 'Error');
        return of(null);
      })
    ).subscribe();

    // Filtrado local (si más tarde quieres aplicarlo, puedes usarlo en un getter)
    this.chefSearch.valueChanges.subscribe();
  }

  // --- Datos para la tabla: todos los chefs que NO están seleccionados
  get tableChefs(): Chef[] {
    if (!this.chefs?.length) return [];
    const q = (this.chefSearch.value ?? '').trim().toLowerCase();
    const base = this.chefs.filter(c => !this.selectedChefIds.has(Number(c.id)));
    if (!q) return base;
    return base.filter(c =>
      (c.nombre ?? '').toLowerCase().includes(q) ||
      (c.especialidad ?? '').toLowerCase().includes(q) ||
      (c.correo ?? '').toLowerCase().includes(q)
    );
  }

  private base64ToFile(base64: string, filename: string, mimeType: string = 'image/png'): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new File([ab], filename, { type: mimeType });
  }


  // --- Chips (seleccionados)
  get selectedChefs(): Chef[] {
    const ids = new Set(Array.from(this.selectedChefIds));
    return this.chefs.filter(c => ids.has(Number(c.id)));
  }

  // --- selección ---
  addChef(id: number) {
    this.selectedChefIds.add(Number(id));
  }
  removeChef(id: number) {
    this.selectedChefIds.delete(Number(id));
  }

  // --- acciones de la tabla ---
  onTablaAccion(evt: AccionTabla) {
    const fila = evt?.datos as Chef | undefined;
    if (!fila) return;

    switch (evt.accion) {
      case 'editar':
        if (!this.selectedChefIds.has(Number(fila.id))) {
          this.addChef(fila.id);
          this.toastr.success(`Chef "${fila.nombre}" agregado`, 'Asignación');
        }
        break;

      case 'eliminar':
        if (this.selectedChefIds.has(Number(fila.id))) {
          this.removeChef(fila.id);
          this.toastr.info(`Chef "${fila.nombre}" quitado`, 'Asignación');
        }
        break;

      case 'detalle':
      case 'crear':
      default:
        break;
    }
  }

  // --- submit ---
// --- submit ---
editarRestaurante(): void {
  const formData = new FormData();
  formData.append('nombre', this.restauranteForm.get('nombre')?.value || '');
  formData.append('direccion', this.restauranteForm.get('direccion')?.value || '');
  formData.append('telefono', this.restauranteForm.get('telefono')?.value || '');
  formData.append('horario_atencion', this.restauranteForm.get('horario_atencion')?.value || '');
  formData.append('tipo_comida', this.restauranteForm.get('tipo_comida')?.value || '');


  if (this.archivoSeleccionado) {
    formData.append('foto', this.archivoSeleccionado);
  } else {
    formData.append('eliminar_foto', 'true');
  }


    this.restauranteService.editarRestaurante(
      Number(this.restauranteForm.get('id')?.value),
      formData
    ).pipe(
      switchMap(() =>
        this.restauranteService.actualizarChefsRestaurante(
          Number(this.restauranteForm.get('id')?.value),
          Array.from(this.selectedChefIds)
        )
      ),
      tap(() => {
        this.toastr.success('El restaurante ha sido editado exitosamente', 'Edición de restaurante');
        this.restauranteForm.reset();
        this.routerPath.navigate(['/restaurantes']);
      }),
      catchError((error) => {
        if (error.statusText === 'UNAUTHORIZED') {
          this.toastr.error('Error', 'Su sesión ha caducado, por favor vuelva a iniciar sesión.');
        } else if (error.statusText === 'UNPROCESSABLE ENTITY') {
          this.toastr.error('Error', 'No hemos podido identificarlo, por favor vuelva a iniciar sesión.');
        } else if (error?.error?.mensaje) {
          this.toastr.error('Error', error.error.mensaje);
        } else if (error?.message) {
          this.toastr.error('Error', error.message);
        } else {
          this.toastr.error('Error', 'Ha ocurrido un error. ' + error.message);
        }
        return of(null);
      })
    ).subscribe();
  }


  cancelarRestaurante(): void {
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

permitirDrop(event: DragEvent): void { event.preventDefault(); }

eliminarImagen(): void {
  this.imagenPreview = null;
  this.archivoSeleccionado = null;
}

private procesarArchivo(file?: File): void {
  if (file) {
    this.archivoSeleccionado = file;
    const reader = new FileReader();
    reader.onload = () => this.imagenPreview = reader.result;
    reader.readAsDataURL(file);
  }
}

}
