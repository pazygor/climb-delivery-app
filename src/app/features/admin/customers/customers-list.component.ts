import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

// PrimeNG Services
import { ConfirmationService, MessageService } from 'primeng/api';

// Services
import { CustomerService } from '../../../core/services/customer.service';

// Models
import { Customer, CustomerStatus } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    CardModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  
  customers: Customer[] = [];
  loading = false;
  searchValue = '';

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Ativo', value: CustomerStatus.ACTIVE },
    { label: 'Trial', value: CustomerStatus.TRIAL },
    { label: 'Inativo', value: CustomerStatus.INACTIVE },
    { label: 'Suspenso', value: CustomerStatus.SUSPENDED }
  ];

  selectedStatus: CustomerStatus | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar clientes'
        });
        this.loading = false;
      }
    });
  }

  filterByStatus(): void {
    if (!this.selectedStatus) {
      this.loadCustomers();
      return;
    }

    this.loading = true;
    this.customerService.getCustomersByStatus(this.selectedStatus).subscribe({
      next: (customers) => {
        this.customers = customers;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao filtrar clientes:', err);
        this.loading = false;
      }
    });
  }

  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dt?.filterGlobal(value, 'contains');
  }

  createNewCustomer(): void {
    this.router.navigate(['/admin/customers/new']);
  }

  viewCustomerDetails(customer: Customer): void {
    this.router.navigate(['/admin/customers', customer.id]);
  }

  activateCustomer(customer: Customer): void {
    this.confirmationService.confirm({
      message: `Deseja ativar o cliente ${customer.restaurantName}?`,
      header: 'Confirmar Ativação',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.customerService.updateCustomerStatus(customer.id, CustomerStatus.ACTIVE).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente ativado com sucesso'
            });
            this.loadCustomers();
          },
          error: (err) => {
            console.error('Erro ao ativar cliente:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao ativar cliente'
            });
          }
        });
      }
    });
  }

  suspendCustomer(customer: Customer): void {
    this.confirmationService.confirm({
      message: `Deseja suspender o cliente ${customer.restaurantName}?`,
      header: 'Confirmar Suspensão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.customerService.updateCustomerStatus(customer.id, CustomerStatus.SUSPENDED).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'warn',
              summary: 'Suspenso',
              detail: 'Cliente suspenso com sucesso'
            });
            this.loadCustomers();
          },
          error: (err) => {
            console.error('Erro ao suspender cliente:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao suspender cliente'
            });
          }
        });
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o cliente ${customer.restaurantName}? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Excluído',
              detail: 'Cliente excluído com sucesso'
            });
            this.loadCustomers();
          },
          error: (err) => {
            console.error('Erro ao excluir cliente:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir cliente'
            });
          }
        });
      }
    });
  }

  getStatusSeverity(status: CustomerStatus): 'success' | 'info' | 'warn' | 'danger' {
    const severityMap: Record<CustomerStatus, 'success' | 'info' | 'warn' | 'danger'> = {
      [CustomerStatus.ACTIVE]: 'success',
      [CustomerStatus.TRIAL]: 'info',
      [CustomerStatus.INACTIVE]: 'warn',
      [CustomerStatus.SUSPENDED]: 'danger'
    };
    return severityMap[status];
  }

  getStatusLabel(status: CustomerStatus): string {
    const labelMap: Record<CustomerStatus, string> = {
      [CustomerStatus.ACTIVE]: 'Ativo',
      [CustomerStatus.TRIAL]: 'Trial',
      [CustomerStatus.INACTIVE]: 'Inativo',
      [CustomerStatus.SUSPENDED]: 'Suspenso'
    };
    return labelMap[status];
  }

  getPlanLabel(plan: string): string {
    const planMap: Record<string, string> = {
      'basic': 'Básico',
      'pro': 'Pro',
      'enterprise': 'Enterprise'
    };
    return planMap[plan] || plan;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
