import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../usuario.service';
import { Perfil } from '../perfil';

@Component({
  selector: 'app-perfil-editar',
  templateUrl: './perfil-editar.component.html',
  styleUrls: ['./perfil-editar.component.css'],
})
export class PerfilEditarComponent implements OnInit {
  perfilForm!: FormGroup;
  perfil!: Perfil;
  modo: 'perfil' | 'restaurantes' = 'perfil';

  chefCampos = [
    { label: 'Nombre', control: 'nombre', type: 'text' },
    { label: 'Teléfono', control: 'telefono', type: 'text' },
    { label: 'Correo', control: 'correo', type: 'email' },
    { label: 'Especialidad', control: 'especialidad', type: 'text' },
  ];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    const idUsuario = sessionStorage.getItem('idUsuario') || '';

    this.perfilForm = this.fb.group({
      usuario: ['', Validators.required],
      pwd: ['', Validators.required],
      nombre: [''],
      telefono: [''],
      correo: ['', Validators.email],
      especialidad: [''],
      tipo: [''],
    });
    this.usuarioService.darPerfil(idUsuario).subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.perfilForm.patchValue(perfil);
        this.perfilForm.markAsPristine();

        sessionStorage.setItem('usuario', perfil.usuario);

        this.toastrService.success(
          'Información cargada exitosamente',
          'Perfil',
          { closeButton: true }
        );
      },
    });
  }

  guardarPerfil() {
    if (this.perfilForm.invalid || !this.perfilForm.dirty) {
      this.toastrService.warning(
        'No hay cambios o faltan campos requeridos',
        'Validación'
      );
      return;
    }

    const idUsuario = sessionStorage.getItem('idUsuario') || '';
    const formValue = this.perfilForm.getRawValue();

    this.usuarioService.actualizarPerfil(idUsuario, formValue).subscribe({
      next: () => {
        this.toastrService.success('Perfil actualizado correctamente', 'Éxito');
        this.perfilForm.markAsPristine();
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.toastrService.error('No se pudo actualizar el perfil', 'Error');
      },
    });
  }

  cancelar() {
    if (this.perfil) {
      this.perfilForm.reset(this.perfil);
      this.perfilForm.markAsPristine();
      this.toastrService.info('Cambios descartados', 'Perfil');
    }
  }

  cerrarSesion() {
    sessionStorage.clear();
    this.router.navigate(['/']);
  }
}
