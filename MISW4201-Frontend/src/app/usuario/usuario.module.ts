import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioLoginComponent } from './usuario-login/usuario-login.component';
import { UsuarioRegistroComponent } from './usuario-registro/usuario-registro.component';
import { PerfilEditarComponent } from './perfil-editar/perfil-editar.component';
import { EncabezadoAppModule } from '../encabezado-app/encabezado-app.module';
import { RestauranteModule } from "src/app/restaurante/restaurante.module";

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, EncabezadoAppModule, RestauranteModule],
  exports: [
    UsuarioLoginComponent,
    UsuarioRegistroComponent,
    PerfilEditarComponent,
  ],
  declarations: [
    UsuarioLoginComponent,
    UsuarioRegistroComponent,
    PerfilEditarComponent,
  ],
})
export class UsuarioModule {}
