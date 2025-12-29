import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  items?: MenuItem[];
  expanded?: boolean;
  action?: () => void;
  separator?: boolean;
  styleClass?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Meus Pedidos',
        icon: 'pi pi-shopping-bag',
        routerLink: '/dashboard/orders'
      },
      {
        label: 'Gestor de Cardápio',
        icon: 'pi pi-book',
        expanded: false,
        items: [
          {
            label: 'Gestor',
            icon: 'pi pi-list',
            routerLink: '/dashboard/menu/gestor'
          }
        ]
      },
      {
        label: 'Configurações',
        icon: 'pi pi-cog',
        expanded: false,
        items: [
          {
            label: 'Estabelecimento',
            icon: 'pi pi-building',
            routerLink: '/dashboard/settings/establishment'
          }
        ]
      },
      {
        label: 'Minha Conta',
        icon: 'pi pi-user',
        routerLink: '/dashboard/account'
      },
      {
        label: 'Entregadores',
        icon: 'pi pi-car',
        routerLink: '/dashboard/delivery'
      },
      {
        label: 'Relatórios',
        icon: 'pi pi-chart-bar',
        expanded: false,
        items: [
          {
            label: 'Pedidos',
            icon: 'pi pi-list',
            routerLink: '/dashboard/reports/orders'
          }
        ]
      },
      {
        label: '',
        icon: '',
        separator: true
      },
      {
        label: 'Sair',
        icon: 'pi pi-sign-out',
        styleClass: 'text-red-500',
        action: () => this.logout()
      }
    ];
  }

  toggleItem(item: MenuItem): void {
    if (item.action) {
      item.action();
    } else if (item.items) {
      item.expanded = !item.expanded;
    } else if (item.routerLink) {
      this.router.navigate([item.routerLink]);
    }
  }

  logout(): void {
    this.confirmationService.confirm({
      message: 'Deseja realmente sair do sistema?',
      header: 'Confirmar Saída',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, sair',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.authService.logout();
      }
    });
  }

  isActiveRoute(routerLink: string): boolean {
    return this.router.url === routerLink;
  }
}
