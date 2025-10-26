import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncabezadoComponent } from './encabezado/encabezado.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
      EncabezadoComponent
   ],
  exports: [
    EncabezadoComponent
  ]
})
export class EncabezadoAppModule { }
