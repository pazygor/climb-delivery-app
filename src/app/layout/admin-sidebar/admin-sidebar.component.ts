import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PanelMenuModule
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit {
  menuItems: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/admin/dashboard']
      },
      {
        label: 'Gestão de Clientes',
        icon: 'pi pi-building',
        items: [
          {
            label: 'Lista de Clientes',
            icon: 'pi pi-list',
            routerLink: ['/admin/customers']
          },
          {
            label: 'Novo Cliente',
            icon: 'pi pi-plus-circle',
            routerLink: ['/admin/customers/new']
          }
        ]
      },
      {
        label: 'Assinaturas & Planos',
        icon: 'pi pi-credit-card',
        items: [
          {
            label: 'Planos Disponíveis',
            icon: 'pi pi-tags',
            routerLink: ['/admin/subscriptions/plans']
          },
          {
            label: 'Assinaturas Ativas',
            icon: 'pi pi-check-circle',
            routerLink: ['/admin/subscriptions/active']
          },
          {
            label: 'Histórico de Cobrança',
            icon: 'pi pi-file',
            routerLink: ['/admin/subscriptions/billing']
          }
        ]
      },
      {
        label: 'Relatórios',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'Performance Geral',
            icon: 'pi pi-chart-line',
            routerLink: ['/admin/reports/performance']
          },
          {
            label: 'Receita da Plataforma',
            icon: 'pi pi-dollar',
            routerLink: ['/admin/reports/revenue']
          },
          {
            label: 'Churn Analysis',
            icon: 'pi pi-percentage',
            routerLink: ['/admin/reports/churn']
          },
          {
            label: 'Uso da Plataforma',
            icon: 'pi pi-server',
            routerLink: ['/admin/reports/usage']
          }
        ]
      },
      {
        label: 'Suporte',
        icon: 'pi pi-ticket',
        items: [
          {
            label: 'Tickets Abertos',
            icon: 'pi pi-inbox',
            routerLink: ['/admin/support/tickets']
          },
          {
            label: 'Base de Conhecimento',
            icon: 'pi pi-book',
            routerLink: ['/admin/support/knowledge-base']
          }
        ]
      },
      {
        label: 'Configurações',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Configurações Gerais',
            icon: 'pi pi-sliders-h',
            routerLink: ['/admin/settings/general']
          },
          {
            label: 'Integrações',
            icon: 'pi pi-link',
            routerLink: ['/admin/settings/integrations']
          },
          {
            label: 'Usuários Admin',
            icon: 'pi pi-users',
            routerLink: ['/admin/settings/users']
          },
          {
            label: 'Logs do Sistema',
            icon: 'pi pi-history',
            routerLink: ['/admin/settings/logs']
          }
        ]
      }
    ];
  }
}
