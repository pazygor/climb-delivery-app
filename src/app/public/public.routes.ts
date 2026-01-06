import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';

export const publicRoutes: Routes = [
  {
    path: ':slug',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        title: 'Cardápio'
      },
      {
        path: 'carrinho',
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
        title: 'Carrinho'
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
        title: 'Finalizar Pedido'
      },
      {
        path: 'pedido/:id',
        loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
        title: 'Pedido Confirmado'
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Restaurante não encontrado'
  }
];
