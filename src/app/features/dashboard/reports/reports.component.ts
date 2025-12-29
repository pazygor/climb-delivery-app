import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PedidoService, ReportData } from '../../../core/services/pedido.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePickerModule,
    ButtonModule,
    CardModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  dateRange: Date[] = [];
  reportData: ReportData | null = null;
  loading = false;
  maxDate = new Date();
  minDate = new Date();

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    // Define data mínima como 31 dias atrás
    this.minDate.setDate(this.maxDate.getDate() - 31);
  }

  ngOnInit() {
    // Inicializa com últimos 7 dias
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    this.dateRange = [startDate, endDate];
    
    this.loadReport();
  }

  loadReport() {
    if (!this.dateRange || this.dateRange.length !== 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um período de datas'
      });
      return;
    }

    const [startDate, endDate] = this.dateRange;
    
    // Valida se o período não excede 31 dias
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 31) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'O período não pode exceder 31 dias'
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.empresaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Empresa não encontrada'
      });
      return;
    }

    this.loading = true;
    const dataInicio = startDate.toISOString().split('T')[0];
    const dataFim = endDate.toISOString().split('T')[0];

    console.log('Iniciando requisição de relatório...', { dataInicio, dataFim });

    this.pedidoService.getReport(currentUser.empresaId, dataInicio, dataFim).subscribe({
      next: (data) => {
        console.log('Relatório recebido:', data);
        this.reportData = data;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Relatório carregado com sucesso'
        });
      },
      error: (error) => {
        console.error('Erro ao carregar relatório:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao carregar relatório'
        });
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    // Para evitar problemas de timezone, vamos extrair dia e mês diretamente da string
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}`;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pendente': 'orange',
      'confirmado': 'blue',
      'em_preparo': 'purple',
      'saiu_para_entrega': 'cyan',
      'entregue': 'green',
      'cancelado': 'red'
    };
    return colors[status] || 'gray';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'em_preparo': 'Em Preparo',
      'saiu_para_entrega': 'Saiu para Entrega',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }
}

