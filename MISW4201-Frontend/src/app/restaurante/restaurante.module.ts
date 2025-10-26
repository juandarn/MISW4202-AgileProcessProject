import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestauranteCrearComponent } from './restaurante-crear/restaurante-crear.component';
import { RestauranteListarComponent } from './restaurante-listar/restaurante-listar.component';
import { RestauranteEditarComponent } from './restaurante-editar/restaurante-editar.component';
import { EncabezadoAppModule } from '../encabezado-app/encabezado-app.module';
import { TablaAppModule } from '../tabla-app/tabla-app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestauranteDetalleComponent } from './restaurante-detalle/restaurante-detalle.component';


@NgModule({
  imports: [
    CommonModule,
    EncabezadoAppModule,
    TablaAppModule,
    FormsModule,
    ReactiveFormsModule,
    TablaAppModule,
  ],
  declarations: [
    RestauranteCrearComponent,
    RestauranteListarComponent,
    RestauranteEditarComponent,
    RestauranteDetalleComponent,
  ],
  exports: [
    RestauranteListarComponent,
  ]
})
export class RestauranteModule {}
