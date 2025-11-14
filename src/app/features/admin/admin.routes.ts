import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout.component';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent),
        title: 'Dashboard Administrativo'
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Gestão de Clientes'
      },
      {
        path: 'customers/new',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Novo Cliente'
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Detalhes do Cliente'
      },
      {
        path: 'subscriptions/plans',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Planos Disponíveis'
      },
      {
        path: 'subscriptions/active',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Assinaturas Ativas'
      },
      {
        path: 'subscriptions/billing',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Histórico de Cobrança'
      },
      {
        path: 'reports/performance',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Performance Geral'
      },
      {
        path: 'reports/revenue',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Receita da Plataforma'
      },
      {
        path: 'reports/churn',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Análise de Churn'
      },
      {
        path: 'reports/usage',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Uso da Plataforma'
      },
      {
        path: 'support/tickets',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Tickets de Suporte'
      },
      {
        path: 'support/knowledge-base',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Base de Conhecimento'
      },
      {
        path: 'settings/general',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Configurações Gerais'
      },
      {
        path: 'settings/integrations',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Integrações'
      },
      {
        path: 'settings/users',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Usuários Admin'
      },
      {
        path: 'settings/logs',
        loadComponent: () => import('./customers/customers-list.component')
          .then(m => m.CustomersListComponent),
        title: 'Logs do Sistema'
      }
    ]
  }
];
