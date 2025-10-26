import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestauranteService } from '../restaurante.service';
import { Restaurante } from '../restaurante';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-restaurante-detalle',
  templateUrl: './restaurante-detalle.component.html',
  styleUrls: ['./restaurante-detalle.component.css'],
})
export class RestauranteDetalleComponent implements OnInit {
  restaurante: Restaurante | null = null;
  imagenPreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restauranteService: RestauranteService,
    private toastr: ToastrService,
    private routerPath: Router
  ) {}

  ngOnInit(): void {
    const idRestaurante = parseInt(this.route.snapshot.params['id'], 10);

    this.restauranteService.darRestaurante(idRestaurante).subscribe(
      (restaurante) => {
        this.restaurante = restaurante;

        this.restauranteService.setRestauranteActual(restaurante);

        this.imagenPreview = restaurante.foto
          ? `data:image/png;base64,${restaurante.foto}`
          : null;
      },
      (error) => {
        console.error('Error al cargar el restaurante:', error);
      }
    );
  }

  editarRestaurante(): void {
    if (this.restaurante) {
      this.router.navigate(['/restaurantes', this.restaurante.id, 'editar']);
    }
  }

  verRestaurante(): void {
    this.routerPath.navigate(['/restaurantes', this.restaurante.id, 'recetas']);
  }

  confirmarBorrado(): void {
    const idRestaurante = parseInt(this.route.snapshot.params['id'], 10);
    this.restauranteService.eliminarRestaurante(idRestaurante).subscribe(
      () => {
        this.toastr.success(
          'El restaurante ha sido eliminado exitosamente',
          'Eliminar restaurante'
        );
        this.routerPath.navigate(['/restaurantes']);
      },
      (error) => {
        if (error.statusText === 'UNAUTHORIZED') {
          this.toastr.error(
            'Error',
            'Su sesión ha caducado, por favor vuelva a iniciar sesión.'
          );
        } else if (error.statusText === 'UNPROCESSABLE ENTITY') {
          this.toastr.error(
            'Error',
            'No hemos podido identificarlo, por favor vuelva a iniciar sesión.'
          );
        } else {
          this.toastr.error('Error', 'Ha ocurrido un error. ' + error.message);
        }
      }
    );
  }
}
