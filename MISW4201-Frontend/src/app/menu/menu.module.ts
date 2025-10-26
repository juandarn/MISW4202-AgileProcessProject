import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuCrearComponent } from './menu-crear/menu-crear.component';
import { MenuListaComponent } from './menu-lista/menu-lista.component';
import { MenuDetalleComponent } from './menu-detalle/menu-detalle.component';
import { MenuEditarComponent } from './menu-editar/menu-editar.component';
import { EncabezadoAppModule } from '../encabezado-app/encabezado-app.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TablaAppModule } from "src/app/tabla-app/tabla-app.module";


@NgModule({
  declarations: [
    MenuCrearComponent,
    MenuListaComponent,
    MenuDetalleComponent,
    MenuEditarComponent
  ],
  imports: [
    CommonModule,
    EncabezadoAppModule,
    ReactiveFormsModule,
    FormsModule,
    TablaAppModule
],
  exports: [
    MenuCrearComponent,
    MenuListaComponent,
    MenuDetalleComponent,
    MenuEditarComponent
  ]
})
export class MenuModule { }
