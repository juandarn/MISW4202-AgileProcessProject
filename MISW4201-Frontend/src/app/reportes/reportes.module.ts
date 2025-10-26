import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarReportesComponent } from './listar-reportes/listar-reportes.component';
import { EncabezadoAppModule } from '../encabezado-app/encabezado-app.module';
import { FormsModule } from '@angular/forms';
import { TablaHistorialPreciosComponent } from './tabla-historial-precios/tabla-historial-precios.component';
import { TablaIngredientexproveedorComponent } from './tabla-ingredientexproveedor/tabla-ingredientexproveedor.component';
import { ReporteCompraComponent } from './reporte-compra/reporte-compra.component';
@NgModule({
  imports: [CommonModule, EncabezadoAppModule, FormsModule],
  declarations: [
    ListarReportesComponent,
    TablaHistorialPreciosComponent,
    TablaIngredientexproveedorComponent,
    ReporteCompraComponent,
  ],
})
export class ReportesModule {}
