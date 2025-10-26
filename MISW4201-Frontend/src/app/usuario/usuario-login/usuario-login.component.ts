import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-usuario-login',
  templateUrl: './usuario-login.component.html',
  styleUrls: ['./usuario-login.component.css']
})

export class UsuarioLoginComponent implements OnInit {

  error: string = "";
  helper = new JwtHelperService();

  constructor(
    private usuarioService: UsuarioService,
    private toastrService: ToastrService,
    private router: Router) { }

  ngOnInit() {
    sessionStorage.setItem('decodedToken', '');
    sessionStorage.setItem('token', '');
    sessionStorage.setItem('idUsuario', '');
  }

  loginUsuario(usuario: string, contrasena: string) {
    this.error = ""

    this.usuarioService.login(usuario, contrasena)
      .subscribe(res => {
        sessionStorage.setItem('decodedToken', this.helper.decodeToken(res.token));
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('idUsuario', res.id);
        sessionStorage.setItem('rol', res.rol);
        this.toastrService.success("Login ok", "Información", {closeButton: true});
        this.router.navigate([`/restaurantes`]);
      },
        error => {
          this.error = "Usuario o contraseña incorrectos";
        })
  }
}
