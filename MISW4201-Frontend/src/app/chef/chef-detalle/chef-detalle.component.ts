import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChefService } from '../chef.service';
import { Chef } from '../chef';

@Component({
  selector: 'app-chef-detalle',
  templateUrl: './chef-detalle.component.html',
  styleUrls: ['./chef-detalle.component.css'],
})
export class ChefDetalleComponent implements OnInit {
  chef!: Chef;

  constructor(
    private chefService: ChefService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idChef = parseInt(this.route.snapshot.params['id']);

    this.chefService.darChef(idChef).subscribe((ch) => {
      this.chef = {
        ...ch,
        telefono: ch.telefono ?? '',
        correo: ch.correo ?? '',
        especialidad: ch.especialidad ?? '',
      };
    });
  }
}
