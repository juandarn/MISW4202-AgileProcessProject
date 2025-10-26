import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestauranteService } from '../../restaurante/restaurante.service';
import { Restaurante } from '../../restaurante/restaurante';

@Component({
  selector: 'app-receta-compartir',
  templateUrl: './receta-compartir.component.html',
  styleUrls: ['./receta-compartir.component.css']
})
export class RecetaCompartirComponent implements OnInit {
  @Input() restaurantes: Restaurante[] = []; 
  recetaId!: number;
  restauranteIdCtx: string | null = null;
  seleccionado: Restaurante | null = null;
  cargando = false;

  restaurantesFiltrados: Restaurante[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit(): void {
    this.recetaId = Number(this.route.snapshot.paramMap.get('id'));
    this.restauranteIdCtx = this.route.parent?.snapshot.paramMap.get('id') ?? null;

    // Filtrar el restaurante actual
    this.restaurantesFiltrados = this.restaurantes.filter(
      r => r.id !== this.restauranteIdCtx
    );
  }

  onSeleccionRestaurante(restaurante: Restaurante) {
    this.seleccionado = restaurante;
  }

  compartir() {
    if (!this.seleccionado || !this.recetaId) return;
    const restauranteDestinoId = Number(this.seleccionado.id);

    this.cargando = true;
    this.restauranteService.asignarRecetaARestaurante(restauranteDestinoId, this.recetaId)
      .subscribe({
        next: () => {
          this.toastr.success('Receta compartida correctamente');
          const rid = this.restauranteIdCtx ?? String(restauranteDestinoId);
          this.router.navigate(['/restaurantes', rid, 'receta', 'detalle', this.recetaId]);
        },
        error: (err) => {
          const msg = err?.error?.mensaje || 'No se pudo compartir la receta';
          this.toastr.error(msg);
          this.cargando = false;
        }
      });
  }

  cancelar() {
    if (this.restauranteIdCtx) {
      this.router.navigate(['/restaurantes', this.restauranteIdCtx, 'receta', 'detalle', this.recetaId]);
    } else {
      this.router.navigate(['/restaurantes']);
    }
  }
}
