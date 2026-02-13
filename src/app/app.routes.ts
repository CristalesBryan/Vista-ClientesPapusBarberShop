import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'citas',
    loadComponent: () => import('./pages/citas/citas.component').then(m => m.CitasComponent)
  },
  {
    path: 'compra-aqui',
    loadComponent: () => import('./pages/compra-aqui/compra-aqui.component').then(m => m.CompraAquiComponent)
  },
  {
    path: 'acerca-de-nosotros',
    loadComponent: () => import('./pages/acerca-de-nosotros/acerca-de-nosotros.component').then(m => m.AcercaDeNosotrosComponent)
  },
  {
    path: 'academia',
    loadComponent: () => import('./pages/academia/academia.component').then(m => m.AcademiaComponent)
  },
  { path: '**', redirectTo: '' }
];
