import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Receta } from '../receta';
import { RecetaService } from '../receta.service';

@Component({
  selector: 'app-receta-detalle',
  templateUrl: './receta-detalle.component.html',
  styleUrls: ['./receta-detalle.component.css']
})
export class RecetaDetalleComponent implements OnInit {

  recetaDetalle: Receta | null = null;
  restauranteIdCtx: string | null = null;

  private rol: string = '';

  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private recetaService: RecetaService
  ) {}

  ngOnInit() {
    this.rol = (sessionStorage.getItem('rol') || '').trim().toLowerCase();

    const recetaId = Number(this.route.snapshot.paramMap.get('rid'));
    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    if (recetaId && this.restauranteIdCtx) {
      this.recetaService.darReceta(recetaId, Number(this.restauranteIdCtx)).subscribe(
        (receta) => {
          receta.duracion = Number(receta.duracion);
          receta.ingredientes = receta.ingredientes.map(i => ({
            ...i,
            cantidad: Number(i.cantidad)
          }));
          this.recetaDetalle = receta;
          this.recetaDetalle.preparacion = this.recetaDetalle.preparacion.replace(/\n/g, '<br/>');
        },
        (error) => {
          this.toastr.error('Error', 'No se pudo cargar la receta. ' + error.message);
        }
      );
    }
  }
  get isAdmin(): boolean {
    return this.rol === 'admin';
  }
}
