import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RestauranteService } from '../../restaurante/restaurante.service';
import { Restaurante } from '../../restaurante/restaurante';
import { UsuarioService } from '../../usuario/usuario.service';
import { Perfil } from '../../usuario/perfil';

@Component({
  selector: 'app-encabezado',
  templateUrl: './encabezado.component.html',
  styleUrls: ['./encabezado.component.css']
})
export class EncabezadoComponent implements OnInit {
  activeLink: string = '';
  rol: string | null = null;
  restauranteSeleccionado: Restaurante | null = null;
  usuario: Perfil | null = null;

  constructor(
    private router: Router,
    private restauranteService: RestauranteService,
    private usuarioService: UsuarioService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const seg = event.urlAfterRedirects.split('?')[0].split('/').filter(Boolean);

        // Mantén tu lógica de activeLink
        if (seg[0] === 'restaurantes' && seg[1]) {
          this.activeLink = seg[2] || 'restaurantes';
        } else {
          this.activeLink = seg[0] || '';
        }

        // 👇 NUEVO: si estamos en restaurantes/:id, carga ese restaurante y publícalo
        if (seg[0] === 'restaurantes' && seg[1]) {
          const id = Number(seg[1]);
          if (!Number.isNaN(id)) {
            this.restauranteService.darRestaurante(id).subscribe({
              next: (r) => {
                this.restauranteSeleccionado = r;
                this.restauranteService.setRestauranteActual(r);
              },
              error: () => {
                this.restauranteSeleccionado = null;
                this.restauranteService.setRestauranteActual(null as any);
              }
            });
          }
        }
      });
  }

  ngOnInit() {
    this.rol = sessionStorage.getItem('rol');

    // Sigue suscrito al restaurante actual (por si lo setean desde otros componentes)
    this.restauranteService.restauranteActual$.subscribe((restaurante) => {
      this.restauranteSeleccionado = restaurante;
    });

    // Cargar perfil/usuario
    const idPerfil = sessionStorage.getItem('idUsuario'); // asegúrate de guardarlo al loguear
    console.log('ID Perfil en encabezado:', idPerfil);
    if (idPerfil) {
      this.usuarioService.darPerfil(idPerfil).subscribe((usuario: Perfil) => {
        this.usuario = usuario;
      });
    }
  }

  private getCurrentRestauranteId(): string | null {
    const seg = this.router.url.split('?')[0].split('/').filter(Boolean);
    return seg[0] === 'restaurantes' && seg[1] ? seg[1] : null;
  }

  // Click en el nombre del restaurante => admin va a editar
  goToEditarRestaurante() {
    if (this.rol !== 'admin') return;

    const rid =
      (this.restauranteSeleccionado as any)?.id || this.getCurrentRestauranteId();

    if (rid) {
      this.router.navigate(['/restaurantes', rid, 'editar']);
    } else {
      this.router.navigate(['/restaurantes']);
    }
  }

  setActive(link: string) {
    this.activeLink = link;

    if (!link) {
      this.router.navigate(['/']);
      return;
    }

    if (link === 'restaurantes') {
      this.router.navigate(['/restaurantes']);
      return;
    }

    const rid = this.getCurrentRestauranteId();
    if (rid) {
      this.router.navigate(['/restaurantes', rid, link]);
    } else {
      this.router.navigate(['/restaurantes']);
    }
  }
}
