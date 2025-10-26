import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-usuario-registro',
  templateUrl: './usuario-registro.component.html',
  styleUrls: ['./usuario-registro.component.css']
})
export class UsuarioRegistroComponent implements OnInit {

  usuarioForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastrService: ToastrService
  ) {
    this.usuarioForm = new FormGroup({});
  }

  ngOnInit() {
    this.usuarioForm = this.formBuilder.group({
      usuario: ["", [Validators.required, Validators.maxLength(50)]],
      password: ["", [Validators.required, Validators.maxLength(50), Validators.minLength(4)]],
      confirmPassword: ["", [Validators.required, Validators.maxLength(50), Validators.minLength(4)]],
      nombre: ["", [Validators.required, Validators.maxLength(128)]],
      telefono: ["", [Validators.maxLength(128)]],
      correo: ["", [Validators.email, Validators.maxLength(128)]],
      especialidad: ["", [Validators.maxLength(128)]]
    });
  }

  registrarUsuario() {
    if (this.usuarioForm.get('password')?.value !== this.usuarioForm.get('confirmPassword')?.value) {
      this.toastrService.error("Las contraseñas no coinciden", "Error", { closeButton: true });
      return;
    }

    const nuevoUsuario = {
      usuario: this.usuarioForm.get('usuario')?.value,
      contrasena: this.usuarioForm.get('password')?.value,
      nombre: this.usuarioForm.get('nombre')?.value,
      telefono: this.usuarioForm.get('telefono')?.value,
      correo: this.usuarioForm.get('correo')?.value,
      especialidad: this.usuarioForm.get('especialidad')?.value
    };

    this.usuarioService.registro(nuevoUsuario)
      .subscribe({
        next: (res) => {
          this.toastrService.success("Registro exitoso", "Éxito", { closeButton: true });
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.toastrService.error(
            "Error en el registro. Verifique que el usuario no se encuentre ya registrado",
            "Error",
            { closeButton: true }
          );
        },
        complete: () => {
          console.log("Registro completado");
        }
      });

  }

}
