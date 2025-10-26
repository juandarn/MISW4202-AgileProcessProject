import { Component } from '@angular/core';

@Component({
  selector: 'app-listar-reportes',
  templateUrl: './listar-reportes.component.html',
  styleUrls: ['./listar-reportes.component.css'],
})
export class ListarReportesComponent {
  reporteSeleccionado: 'historial' | 'ingredientexproveedor' | null = null;

  mostrarHistorial() {
    this.reporteSeleccionado = 'historial';
  }

  mostrarIngredienteProveedor() {
    this.reporteSeleccionado = 'ingredientexproveedor';
  }
}
