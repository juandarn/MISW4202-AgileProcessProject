import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RecetaService } from '../receta.service';
import { IngredienteService } from 'src/app/ingrediente/ingrediente.service';
import { Receta } from '../receta';
import { Ingrediente } from 'src/app/ingrediente/ingrediente';

@Component({
  selector: 'app-receta-editar',
  templateUrl: './receta-editar.component.html',
  styleUrls: ['./receta-editar.component.css']
})
export class RecetaEditarComponent implements OnInit {

  receta: Receta;
  recetaForm: FormGroup = {} as FormGroup;
  ingredientesSubForm: FormArray = {} as FormArray;
  listaIngredientes: Ingrediente[];

  // id del restaurante en contexto
  restauranteIdCtx: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private routerPath: Router,
    private toastr: ToastrService,
    private recetaService: RecetaService,
    private ingredienteService: IngredienteService
  ) { }

  ngOnInit() {
    const idReceta = parseInt(this.router.snapshot.params['id']);
    this.restauranteIdCtx = this.router.parent?.snapshot.paramMap.get('id') ?? null;

    this.ingredientesSubForm = this.formBuilder.array([]);

    this.recetaForm = this.formBuilder.group({
      id: [0],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      duracion: [0, Validators.required],
      ingredientes: this.ingredientesSubForm,
      preparacion: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.ingredienteService.darIngredientes().subscribe((ingredientes) => {
      this.listaIngredientes = ingredientes;

      this.recetaService.darReceta(idReceta, Number(this.restauranteIdCtx)).subscribe((receta) => {
        this.receta = receta;

        this.ingredientesSubForm.clear();
        for (const ri of receta.ingredientes) {
          this.adicionarElemento(ri.id, ri.ingrediente.id, ri.cantidad);
        }

        this.recetaForm.patchValue({
          id: receta.id,
          nombre: receta.nombre,
          duracion: Number(receta.duracion),
          preparacion: receta.preparacion
        });
      });
    });
  }

  editarReceta(cambioReceta: Receta): void {
    this.recetaService.editarReceta(cambioReceta, Number(this.restauranteIdCtx)).subscribe(
      () => {
        this.toastr.success("Registro editado", "Confirmación");
        this.recetaForm.reset();
        this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'recetas']);
      },
      error => {
        if (error.statusText === "UNAUTHORIZED") {
          this.toastr.error("Su sesión ha caducado, por favor vuelva a iniciar sesión.");
        } else if (error.statusText === "UNPROCESSABLE ENTITY") {
          this.toastr.error("No hemos podido identificarlo, por favor vuelva a iniciar sesión.");
        } else {
          this.toastr.error("Ha ocurrido un error. " + error.message);
        }
      }
    );
  }

  adicionarElemento(id: number, idIngrediente: number, cantidad: number): void {
    const filaNueva = this.formBuilder.group({
      id: [id ?? 0],
      idIngrediente: [idIngrediente ?? null, Validators.required],
      cantidad: [cantidad ?? null, [Validators.required, Validators.min(1)]]
    });
    this.ingredientesSubForm.push(filaNueva);
  }

  adicionarIngrediente(): void {
    const filaNueva = this.formBuilder.group({
      id: [0],
      idIngrediente: [null, Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]]
    });
    this.ingredientesSubForm.push(filaNueva);
  }

  eliminarIngrediente(index: number): void {
    this.ingredientesSubForm.removeAt(index);
  }

  cancelarReceta(): void {
    this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'recetas']);
  }

  getIngredientesDisponibles(index: number): Ingrediente[] {
    if (!this.listaIngredientes) return [];
    const seleccionados = this.ingredientesSubForm.controls
      .map((ctrl, i) => i !== index ? ctrl.get('idIngrediente')?.value : null)
      .filter(id => id !== null);
    return this.listaIngredientes.filter(ing => !seleccionados.includes(ing.id));
  }

}
