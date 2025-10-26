import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Ingrediente } from '../ingrediente';
import { IngredienteService } from '../ingrediente.service';

@Component({
  selector: 'app-ingrediente-editar',
  templateUrl: './ingrediente-editar.component.html',
  styleUrls: ['./ingrediente-editar.component.css']
})
export class IngredienteEditarComponent implements OnInit {

  ingrediente: Ingrediente;
  ingredienteForm: FormGroup;
  // Guardamos objetos con { precio, proveedor, ... } para poder elegir el más barato
  proveedores: any[] = [];

  // id del restaurante en contexto (ruta padre)
  restauranteIdCtx: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private routerPath: Router,
    private toastr: ToastrService,
    private ingredienteService: IngredienteService
  ) { }

  ngOnInit() {
    // param de ingrediente en las rutas anidadas es :iid
    const idIngrediente = parseInt(this.router.snapshot.paramMap.get('iid') || '0', 10);
    // id del restaurante viene del padre :id
    this.restauranteIdCtx = this.router.parent?.snapshot.paramMap.get('id') ?? null;

    this.ingredienteService.darIngrediente(idIngrediente).subscribe((ingrediente) => {
      this.ingrediente = ingrediente;

      // Mantén la lista completa para poder acceder a precio y proveedor
      this.proveedores = ingrediente.proveedores ?? [];

      this.ingredienteForm = this.formBuilder.group({
        id: [this.ingrediente.id, []],
        nombre: [this.ingrediente.nombre, [Validators.required, Validators.minLength(2)]],
        // el backend espera proveedorId cuando se elige proveedor
        proveedorId: [this.ingrediente.mejor_proveedor?.id || null, [Validators.required]]
      });
    });
  }

  editarIngrediente(ingrediente: Ingrediente): void {
    this.ingredienteService.editarIngrediente(ingrediente).subscribe(() => {
      this.toastr.success("Información editada", "Confirmation");
      this.ingredienteForm.reset();
      // volver a la lista anidada dentro del restaurante
      this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'ingredientes']);
    },
    error => {
      if (error.statusText === "UNAUTHORIZED") {
        this.toastr.error("Su sesión ha caducado, por favor vuelva a iniciar sesión.", "Error");
      } else if (error.statusText === "UNPROCESSABLE ENTITY") {
        this.toastr.error("No hemos podido identificarlo, por favor vuelva a iniciar sesión.", "Error");
      } else {
        this.toastr.error("Ha ocurrido un error. " + error.message, "Error");
      }
    });
  }

  cancelarIngrediente(): void {
    this.ingredienteForm.reset();
    this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'ingredientes']);
  }

  seleccionarMasBarato(): void {
    if (this.proveedores.length > 0) {
      // cada item tiene forma { precio, proveedor, cantidad, ... }
      const proveedorMasBarato = this.proveedores.reduce((prev, curr) => {
        const pPrev = Number(prev?.precio ?? Infinity);
        const pCurr = Number(curr?.precio ?? Infinity);
        return pPrev <= pCurr ? prev : curr;
      });

      const proveedorId = proveedorMasBarato?.proveedor?.id ?? null;
      const proveedorNombre = proveedorMasBarato?.proveedor?.nombre ?? 'Proveedor';

      if (proveedorId) {
        this.ingredienteForm.get('proveedorId')?.setValue(proveedorId);
        this.toastr.info(`Proveedor más barato seleccionado: ${proveedorNombre}`, "Info");
      }
    }
  }
}
