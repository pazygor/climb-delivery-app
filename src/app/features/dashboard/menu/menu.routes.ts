import { Routes } from '@angular/router';

export const MENU_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'gestor',
    pathMatch: 'full'
  },
  {
    path: 'gestor',
    loadComponent: () =>
      import('./menu-gestor/menu-gestor.component').then(m => m.MenuGestorComponent)
  },
  {
    path: 'adicionais',
    loadComponent: () =>
      import('./menu-adicionais/menu-adicionais.component').then(m => m.MenuAdicionaisComponent)
  }
];
