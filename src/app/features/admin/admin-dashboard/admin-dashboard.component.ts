import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

// Services
import { CustomerService } from '../../../core/services/customer.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { SupportService } from '../../../core/services/support.service';

// Models
import { CustomerStats } from '../../../core/models/customer.model';
import { BillingStats } from '../../../core/models/subscription.model';
import { TicketStats } from '../../../core/models/support.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  loading = false;
  
  customerStats: CustomerStats | null = null;
  billingStats: BillingStats | null = null;
  ticketStats: TicketStats | null = null;

  // Gráfico de crescimento
  growthChartData: any;
  growthChartOptions: any;

  // Gráfico de receita
  revenueChartData: any;
  revenueChartOptions: any;

  constructor(
    private customerService: CustomerService,
    private subscriptionService: SubscriptionService,
    private supportService: SupportService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.initializeCharts();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Carregar estatísticas de clientes
    this.customerService.getCustomerStats().subscribe({
      next: (stats) => this.customerStats = stats,
      error: (err) => console.error('Erro ao carregar stats de clientes:', err)
    });

    // Carregar estatísticas de faturamento
    this.subscriptionService.getBillingStats().subscribe({
      next: (stats) => this.billingStats = stats,
      error: (err) => console.error('Erro ao carregar stats de faturamento:', err)
    });

    // Carregar estatísticas de suporte
    this.supportService.getTicketStats().subscribe({
      next: (stats) => {
        this.ticketStats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar stats de suporte:', err);
        this.loading = false;
      }
    });
  }

  initializeCharts(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // Gráfico de Crescimento de Clientes
    this.growthChartData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
      datasets: [
        {
          label: 'Novos Clientes',
          data: [5, 8, 12, 10, 15, 18, 22, 20, 25, 28, 30],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4
        },
        {
          label: 'Cancelamentos',
          data: [1, 2, 1, 3, 2, 2, 3, 4, 2, 3, 2],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--red-500'),
          tension: 0.4
        }
      ]
    };

    this.growthChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };

    // Gráfico de Receita
    this.revenueChartData = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
      datasets: [
        {
          label: 'Receita Mensal (R$)',
          data: [15000, 22000, 28000, 32000, 38000, 45000, 52000, 58000, 65000, 72000, 78000],
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          borderWidth: 1
        }
      ]
    };

    this.revenueChartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}
