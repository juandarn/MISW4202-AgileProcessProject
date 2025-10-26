import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Chef } from '../chef';
import { ChefService } from '../chef.service';

@Component({
  selector: 'app-chef-editar',
  templateUrl: './chef-editar.component.html',
  styleUrls: ['./chef-editar.component.css'],
})
export class ChefEditarComponent implements OnInit {
  chef: Chef;
  chefForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private routerPath: Router,
    private toastr: ToastrService,
    private chefService: ChefService
  ) {}

  ngOnInit() {
    const idChef = parseInt(this.router.snapshot.params['id']);
    this.chefService.darChef(idChef).subscribe((chef) => {
      this.chef = chef;

      this.chefForm = this.formBuilder.group({
        id: [this.chef.id, []],
        nombre: [
          this.chef.nombre,
          [Validators.required, Validators.minLength(2)],
        ],
        telefono: [
          this.chef.telefono,
          [Validators.required, Validators.pattern('^\\d{10}$')],
        ],
        correo: [this.chef.correo, [Validators.required, Validators.email]],
        especialidad: [
          this.chef.especialidad,
          [Validators.required, Validators.minLength(3)],
        ],
      });
    });
  }

  editarChef(chef: Chef): void {
    this.chefService.editarChef(chef).subscribe(
      () => {
        this.toastr.success('Información editada', 'Confirmation');
        this.chefForm.reset();
        this.routerPath.navigate(['/chefs/']);
      },
      (error) => {
        if (error.statusText === 'UNAUTHORIZED') {
          this.toastr.error(
            'Su sesión ha caducado, por favor vuelva a iniciar sesión.',
            'Error'
          );
        } else if (error.statusText === 'UNPROCESSABLE ENTITY') {
          this.toastr.error(
            'No hemos podido identificarlo, por favor vuelva a iniciar sesión.',
            'Error'
          );
        } else {
          this.toastr.error('Ha ocurrido un error. ' + error.message, 'Error');
        }
      }
    );
  }

  cancelarChef(): void {
    this.chefForm.reset();
    this.routerPath.navigate(['/chefs/']);
  }
}
