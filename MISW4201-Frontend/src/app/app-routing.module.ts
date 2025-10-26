import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsuarioLoginComponent } from './usuario/usuario-login/usuario-login.component';
import { UsuarioRegistroComponent } from './usuario/usuario-registro/usuario-registro.component';

// Recetas
import { RecetaListaComponent } from './receta/receta-lista/receta-lista.component';
import { RecetaCrearComponent } from './receta/receta-crear/receta-crear.component';
import { RecetaEditarComponent } from './receta/receta-editar/receta-editar.component';
import { RecetaDetalleComponent } from './receta/receta-detalle/receta-detalle.component';
import { RecetaCompartirComponent } from './receta/receta-compartir/receta-compartir.component';

// Ingredientes
import { IngredienteListaComponent } from './ingrediente/ingrediente-lista/ingrediente-lista.component';
import { IngredienteCrearComponent } from './ingrediente/ingrediente-crear/ingrediente-crear.component';
import { IngredienteEditarComponent } from './ingrediente/ingrediente-editar/ingrediente-editar.component';
import { IngredienteDetalleComponent } from './ingrediente/ingrediente-detalle/ingrediente-detalle.component';

// Menús
import { MenuListaComponent } from './menu/menu-lista/menu-lista.component';
import { MenuCrearComponent } from './menu/menu-crear/menu-crear.component';
import { MenuEditarComponent } from './menu/menu-editar/menu-editar.component';
import { MenuDetalleComponent } from './menu/menu-detalle/menu-detalle.component';

// Proveedores
import { ProveedorListaComponent } from './proveedor/proveedor-lista/proveedor-lista.component';
import { ProveedorCrearComponent } from './proveedor/proveedor-crear/proveedor-crear.component';
import { ProveedorEditarComponent } from './proveedor/proveedor-editar/proveedor-editar.component';
import { ProveedorDetalleComponent } from './proveedor/proveedor-detalle/proveedor-detalle.component';

// Chefs
import { ChefListarComponent } from './chef/chef-listar/chef-listar.component';
import { ChefCrearComponent } from './chef/chef-crear/chef-crear.component';
import { ChefDetalleComponent } from './chef/chef-detalle/chef-detalle.component';
import { ChefEditarComponent } from './chef/chef-editar/chef-editar.component';

// Reportes
import { ListarReportesComponent } from './reportes/listar-reportes/listar-reportes.component';
import { ReporteCompraComponent } from './reportes/reporte-compra/reporte-compra.component';

// Restaurantes
import { RestauranteListarComponent } from './restaurante/restaurante-listar/restaurante-listar.component';
import { RestauranteCrearComponent } from './restaurante/restaurante-crear/restaurante-crear.component';
import { RestauranteEditarComponent } from './restaurante/restaurante-editar/restaurante-editar.component';
import { RestauranteDetalleComponent } from './restaurante/restaurante-detalle/restaurante-detalle.component';

import { RoleGuard } from './auth/role.guard';
import { PerfilEditarComponent } from './usuario/perfil-editar/perfil-editar.component';

const routes: Routes = [
  // Login / Registro
  { path: '', component: UsuarioLoginComponent, pathMatch: 'full' },
  { path: 'registro', component: UsuarioRegistroComponent, pathMatch: 'full' },

  // --- Restaurantes (primero lista, luego contexto :id) ---
  {
    path: 'restaurantes',
    children: [
      // Lista de todos los restaurantes
      {
        path: '',
        component: RestauranteListarComponent,
        canActivate: [RoleGuard],
        data: { expectedRoles: ['admin', 'chef'] },
      },
      // Crear restaurante (no depende de id)
      {
        path: 'crear',
        component: RestauranteCrearComponent,
        canActivate: [RoleGuard],
        data: { expectedRoles: ['admin'] },
      },
      // Contexto de un restaurante específico
      {
        path: ':id',
        children: [
          { path: '', redirectTo: 'detalle', pathMatch: 'full' },

          // Detalle / Editar del propio restaurante
          {
            path: 'detalle',
            component: RestauranteDetalleComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin', 'chef'] },
          },
          {
            path: 'editar',
            component: RestauranteEditarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },

          // --- Recetas ---
          {
            path: 'recetas',
            component: RecetaListaComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['chef', 'admin'] },
          },
          {
            path: 'receta/crear',
            component: RecetaCrearComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin', 'chef'] },
          },
          {
            path: 'receta/editar/:rid',
            component: RecetaEditarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin', 'chef'] },
          },
          {
            path: 'receta/detalle/:rid',
            component: RecetaDetalleComponent,
          },
          {
            path: 'receta/compartir/:rid',
            component: RecetaCompartirComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },

          // --- Menús ---
          {
            path: 'menus',
            component: MenuListaComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['chef', 'admin'] },
          },
          {
            path: 'menu/crear',
            component: MenuCrearComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['chef', 'admin'] },
          },
          {
            path: 'menu/detalle/:mid',
            component: MenuDetalleComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['chef', 'admin'] },
          },
          {
            path: 'menu/editar/:mid',
            component: MenuEditarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['chef', 'admin'] },
          },

          // --- Ingredientes ---
          {
            path: 'ingredientes',
            component: IngredienteListaComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['chef', 'admin'] },
          },
          {
            path: 'ingrediente/crear',
            component: IngredienteCrearComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'ingrediente/editar/:iid',
            component: IngredienteEditarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'ingrediente/detalle/:iid',
            component: IngredienteDetalleComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin', 'chef'] },
          },

          // --- Proveedores ---
          {
            path: 'proveedores',
            component: ProveedorListaComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'proveedor/crear',
            component: ProveedorCrearComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'proveedor/editar/:pid',
            component: ProveedorEditarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'proveedor/detalle/:pid',
            component: ProveedorDetalleComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },

          // --- Chefs ---
          {
            path: 'chefs',
            component: ChefListarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'chef/crear',
            component: ChefCrearComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'chef/editar/:cid',
            component: ChefEditarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'chef/detalle/:cid',
            component: ChefDetalleComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },

          // --- Reportes ---
          {
            path: 'reportes',
            component: ListarReportesComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },
          {
            path: 'reportecompra/:mid',
            component: ReporteCompraComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin'] },
          },

          // --- perfil ---
          {
            path: 'perfil',
            component: PerfilEditarComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: ['admin', 'chef'] },
          },
        ],
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
