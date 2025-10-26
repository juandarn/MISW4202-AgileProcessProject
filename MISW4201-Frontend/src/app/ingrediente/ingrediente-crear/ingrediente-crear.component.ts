import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Ingrediente } from '../ingrediente';
import { IngredienteService } from '../ingrediente.service';

@Component({
  selector: 'app-ingrediente-crear',
  templateUrl: './ingrediente-crear.component.html',
  styleUrls: ['./ingrediente-crear.component.css']
})
export class IngredienteCrearComponent implements OnInit {

  ingredienteForm: FormGroup;
  restauranteIdCtx: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private routerPath: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ingredienteService: IngredienteService
  ) { }

  ngOnInit() {
    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    this.ingredienteForm = this.formBuilder.group({
      nombre: ["", [Validators.required, Validators.minLength(2)]],
    });
  }

  crearIngrediente(ingrediente: Ingrediente): void {
    this.ingredienteService.crearIngrediente(ingrediente).subscribe(
      () => {
        this.toastr.success("Confirmación", "Ingrediente creado");
        this.ingredienteForm.reset();
        this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'ingredientes']);
      },
      error => {
        if (error.status === 400 && error.error?.mensaje === "El ingrediente ya existe") {
          this.toastr.warning("Advertencia", "Ese ingrediente ya existe.");
        }
        else if (error.statusText === "UNAUTHORIZED") {
          this.toastr.error("Error", "Su sesión ha caducado, por favor vuelva a iniciar sesión.");
        }
        else if (error.statusText === "UNPROCESSABLE ENTITY") {
          this.toastr.error("Error", "No hemos podido identificarlo, por favor vuelva a iniciar sesión.");
        }
        else {
          this.toastr.error("Error", "Ha ocurrido un error. " + error.message);
        }
      }
    );
  }

  cancelarIngrediente(): void {
    this.ingredienteForm.reset();
    this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'ingredientes']);
  }

}
