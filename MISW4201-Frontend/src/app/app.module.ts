import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsuarioModule } from './usuario/usuario.module';
import { RecetaModule } from './receta/receta.module';
import { IngredienteModule } from './ingrediente/ingrediente.module';
import { RecetaIngredienteModule } from './receta-ingrediente/receta-ingrediente.module';
import { MenuModule } from './menu/menu.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ReportesModule } from './reportes/reportes.module';
import { RestauranteModule } from './restaurante/restaurante.module';
import { ChefModule } from './chef/chef.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    UsuarioModule,
    RecetaModule,
    MenuModule,
    IngredienteModule,
    RecetaIngredienteModule,
    ProveedorModule,
    ReportesModule,
    RestauranteModule,
    ChefModule,
    ToastrModule.forRoot({
      timeOut: 7000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
