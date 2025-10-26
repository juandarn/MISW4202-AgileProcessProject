import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProveedorService } from '../proveedor.service';
import { Proveedor } from '../proveedor';

@Component({
  selector: 'app-proveedor-crear',
  templateUrl: './proveedor-crear.component.html',
  styleUrls: ['./proveedor-crear.component.css'],
})
export class ProveedorCrearComponent implements OnInit {
  proveedorForm: FormGroup;
  // id del restaurante en contexto
  restauranteIdCtx: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private routerPath: Router,
    private toastr: ToastrService,
    private proveedorService: ProveedorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    this.proveedorForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', [Validators.required]],
      calificacion: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  crearProveedor(proveedor: Proveedor): void {
    if (this.proveedorForm.valid) {
      this.proveedorService.crearProveedor(this.proveedorForm.value).subscribe(
        () => {
          this.toastr.success('Proveedor creado exitosamente');
          this.proveedorForm.reset();
          this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'proveedores']);
        },
        (error) => {
          if (String(error.statusText).toUpperCase() === 'UNAUTHORIZED') {
            this.toastr.error('No autorizado');
          } else {
            this.toastr.error('Error al crear proveedor');
          }
        }
      );
    } else {
      this.toastr.warning('Por favor, complete el formulario correctamente');
    }
  }

  cancelarProveedor(): void {
    this.proveedorForm.reset();
    this.routerPath.navigate(['/restaurantes', this.restauranteIdCtx, 'proveedores']);
  }
}
