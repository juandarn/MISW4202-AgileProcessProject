import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChefListarComponent } from './chef-listar/chef-listar.component';
import { TablaAppModule } from "src/app/tabla-app/tabla-app.module";
import { EncabezadoAppModule } from "src/app/encabezado-app/encabezado-app.module";
import { ChefCrearComponent } from './chef-crear/chef-crear.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChefDetalleComponent } from './chef-detalle/chef-detalle.component';
import { ChefEditarComponent } from './chef-editar/chef-editar.component'; 



@NgModule({
  declarations: [
    ChefListarComponent,
    ChefCrearComponent,
    ChefDetalleComponent,
    ChefEditarComponent
  ],
  imports: [
    CommonModule,
    TablaAppModule,
    EncabezadoAppModule,
    FormsModule,
    ReactiveFormsModule
]
})
export class ChefModule { }
