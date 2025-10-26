import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Chef } from '../chef';
import { ChefService } from '../chef.service';

@Component({
  selector: 'app-chef-crear',
  templateUrl: './chef-crear.component.html',
  styleUrls: ['./chef-crear.component.css']
})
export class ChefCrearComponent implements OnInit {

  chefForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private routerPath: Router,
    private toastr: ToastrService,
    private chefService: ChefService
  ) { }

  ngOnInit() {
    this.chefForm = this.formBuilder.group({
      nombre: ["", [Validators.required, Validators.minLength(2)]],
      telefono: ["", [Validators.required, Validators.pattern("^[0-9]{7,15}$")]],
      correo: ["", [Validators.required, Validators.email]],
      especialidad: ["", [Validators.required, Validators.minLength(3)]],
    });
  }

  crearChef(chef: Chef): void {
    this.chefService.crearChef(chef).subscribe(
      () => {
        this.toastr.success("Confirmación", "Chef creado");
        this.chefForm.reset();
        this.routerPath.navigate(['/chefs/']);
      },
      error => {
        if (error.status === 400 && error.error.mensaje === "El chef ya existe") {
          this.toastr.warning("Advertencia", "Ese chef ya existe.");
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

  cancelarChef(): void {
    this.chefForm.reset();
    this.routerPath.navigate(['/chefs/']);
  }
}
