import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EncabezadoAppModule } from '../encabezado-app/encabezado-app.module';
import { ProveedorCrearComponent } from './proveedor-crear/proveedor-crear.component';
import { ProveedorListaComponent } from './proveedor-lista/proveedor-lista.component';
import { ProveedorEditarComponent } from './proveedor-editar/proveedor-editar.component';
import { ProveedorDetalleComponent } from './proveedor-detalle/proveedor-detalle.component';
import { TablaAppModule } from "src/app/tabla-app/tabla-app.module";



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EncabezadoAppModule,
    TablaAppModule
],
  declarations: [
    ProveedorCrearComponent,
    ProveedorListaComponent,
    ProveedorEditarComponent,
    ProveedorDetalleComponent
  ],
  exports: [
    ProveedorCrearComponent
  ]
})
export class ProveedorModule { }
