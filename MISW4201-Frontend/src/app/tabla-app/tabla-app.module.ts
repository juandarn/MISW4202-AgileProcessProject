import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TablaComponent } from './tabla/tabla.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TablaComponent
  ],
  imports: [
    CommonModule,
    FormsModule 
  ],
  exports: [
    TablaComponent, 
    FormsModule
  ]
})
export class TablaAppModule { }
