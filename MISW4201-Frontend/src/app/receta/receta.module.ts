import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EncabezadoAppModule } from '../encabezado-app/encabezado-app.module';
import { RecetaListaComponent } from './receta-lista/receta-lista.component';
import { RecetaDetalleComponent } from './receta-detalle/receta-detalle.component';
import { RecetaCrearComponent } from './receta-crear/receta-crear.component';
import { RecetaEditarComponent } from './receta-editar/receta-editar.component';
import { TablaAppModule } from "src/app/tabla-app/tabla-app.module";
import { RecetaCompartirComponent } from './receta-compartir/receta-compartir.component';
import { RouterModule } from '@angular/router';
import { RestauranteModule } from '../restaurante/restaurante.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    RestauranteModule,
    EncabezadoAppModule,
    TablaAppModule,
],
  declarations: [
    RecetaListaComponent,
    RecetaDetalleComponent,
    RecetaCrearComponent,
    RecetaEditarComponent,
    RecetaCompartirComponent,
  ],
  exports: [
    RecetaListaComponent,
    RecetaDetalleComponent,
    RecetaCrearComponent,
    RecetaEditarComponent
  ]
})
export class RecetaModule { }
