import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EncabezadoAppModule } from '../encabezado-app/encabezado-app.module';
import { IngredienteListaComponent } from './ingrediente-lista/ingrediente-lista.component';
import { IngredienteCrearComponent } from './ingrediente-crear/ingrediente-crear.component';
import { IngredienteEditarComponent } from './ingrediente-editar/ingrediente-editar.component';
import { TablaAppModule } from "src/app/tabla-app/tabla-app.module";
import { IngredienteDetalleComponent } from './ingrediente-detalle/ingrediente-detalle.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EncabezadoAppModule,
    TablaAppModule
],
  declarations: [
    IngredienteListaComponent,
    IngredienteCrearComponent,
    IngredienteEditarComponent,
    IngredienteDetalleComponent
  ],
  exports: [
    IngredienteListaComponent,
    IngredienteCrearComponent,
    IngredienteEditarComponent
  ]
})
export class IngredienteModule { }
