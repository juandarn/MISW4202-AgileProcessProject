import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';
import { Ingrediente } from 'src/app/ingrediente/ingrediente';
import { IngredienteService } from 'src/app/ingrediente/ingrediente.service';

@Component({
  selector: 'app-proveedor-editar',
  templateUrl: './proveedor-editar.component.html',
  styleUrls: ['./proveedor-editar.component.css'],
})
export class ProveedorEditarComponent implements OnInit {
  proveedor: Proveedor;
  proveedorForm: FormGroup = {} as FormGroup;
  ingredientesSubForm: FormArray = {} as FormArray;
  listaIngredientes: Ingrediente[];

  // id del restaurante en contexto
  restauranteIdCtx: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private routerPath: Router,
    private toastr: ToastrService,
    private proveedorService: ProveedorService,
    private ingredienteService: IngredienteService
  ) {}

  ngOnInit() {
    const idProveedor = parseInt(this.router.snapshot.paramMap.get('pid') || '0', 10);
    this.restauranteIdCtx = this.router.parent?.snapshot.paramMap.get('id') ?? null;

    this.ingredientesSubForm = this.formBuilder.array([]);
    this.proveedorForm = this.formBuilder.group({
      id: [0],
      nombre: ['', Validators.required],
      cedula: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', Validators.required],
      direccion: ['', Validators.required],
      calificacion: [1, Validators.required],
      ingredientes: this.ingredientesSubForm,
    });

    this.ingredienteService.darIngredientes().subscribe((ingredientes) => {
      this.listaIngredientes = ingredientes;
    });

    this.proveedorService.darProveedor(idProveedor).subscribe((proveedor) => {
      this.proveedor = proveedor;

      this.proveedorForm.patchValue({
        id: proveedor.id,
        nombre: proveedor.nombre,
        cedula: proveedor.cedula,
        telefono: proveedor.telefono,
        correo: proveedor.correo,
        direccion: proveedor.direccion,
        calificacion: proveedor.calificacion,
      });

      this.ingredientesSubForm.clear();
      for (const pi of proveedor.ingredientes) {
        this.adicionarElemento(pi.id, pi.ingrediente.id, pi.precio, pi.cantidad);
      }
    });
  }

  editarProveedor(cambioProveedor: Proveedor): void {
    this.proveedorService.editarProveedor(cambioProveedor).subscribe(
      () => {
        this.toastr.success('El proveedor ha sido editado exitosamente', 'Edición de proveedor');
        this.proveedorForm.reset();
        this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'proveedores']);
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

  adicionarElemento(id: number, idIngrediente: number, precio: number, cantidad: number): void {
    const filaNueva = this.formBuilder.group({
      id: [id],
      precio: [precio ?? null, Validators.required],
      cantidad: [cantidad ?? null, [Validators.required, Validators.min(1)]],
      idIngrediente: [idIngrediente ?? null, Validators.required],
    });
    this.ingredientesSubForm.push(filaNueva);
  }

  cancelarProveedor(): void {
    this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'proveedores']);
  }

  adicionarIngrediente(): void {
    const filaNueva = this.formBuilder.group({
      id: [0],
      precio: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      idIngrediente: [null, Validators.required],
    });
    this.ingredientesSubForm.push(filaNueva);
  }

  eliminarIngrediente(index: number): void {
    this.ingredientesSubForm.removeAt(index);
  }

  getIngredientesDisponibles(index: number): Ingrediente[] {
    if (!this.listaIngredientes) return [];
    const seleccionados = this.ingredientesSubForm.controls
      .map((ctrl, i) => (i !== index ? ctrl.get('idIngrediente')?.value : null))
      .filter((id) => id !== null);
    return this.listaIngredientes.filter((ing) => !seleccionados.includes(ing.id));
  }
}
