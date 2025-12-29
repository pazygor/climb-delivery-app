import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportData {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  resumo: {
    totalPedidos: number;
    faturamentoTotal: number;
    ticketMedio: number;
    tempoMedioEntrega: number;
  };
  pedidosPorStatus: {
    status: string;
    quantidade: number;
    percentual: number;
  }[];
  produtosMaisVendidos: {
    id: number;
    nome: string;
    quantidade: number;
    faturamento: number;
  }[];
  pedidosPorDia: {
    data: string;
    quantidade: number;
    faturamento: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.api.baseUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  getReport(empresaId: number, dataInicio: string, dataFim: string): Observable<ReportData> {
    return this.http.get<ReportData>(
      `${this.apiUrl}/relatorio/empresa/${empresaId}`,
      {
        params: {
          dataInicio,
          dataFim
        }
      }
    );
  }
}
