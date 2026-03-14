import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  
  constructor() { }

  /**
   * Imprime um pedido
   */
  printOrder(pedido: Order, nomeRestaurante: string = 'ClimbDelivery'): void {
    // Criar conteúdo HTML para impressão
    const printContent = this.generatePrintHTML(pedido, nomeRestaurante);
    
    // Abrir janela de impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir');
      return;
    }

    // Escrever HTML na janela
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Fechar janela após impressão (opcional)
      setTimeout(() => {
        printWindow.close();
      }, 500);
    };
  }

  /**
   * Gera HTML completo para impressão
   */
  private generatePrintHTML(pedido: Order, nomeRestaurante: string): string {
    const dataImpressao = new Date().toLocaleString('pt-BR');
    const dataPedido = new Date(pedido.createdAt).toLocaleString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${pedido.numero}</title>
        <style>
          ${this.getStyles()}
        </style>
      </head>
      <body>
        <div class="print-container">
          ${this.generateHeader(pedido, nomeRestaurante, dataPedido)}
          <div class="divider"></div>
          ${this.generateClienteSection(pedido)}
          ${this.generateEnderecoSection(pedido)}
          <div class="divider"></div>
          ${this.generateItensSection(pedido)}
          <div class="divider"></div>
          ${this.generateTotaisSection(pedido)}
          <div class="divider"></div>
          ${this.generatePagamentoSection(pedido)}
          ${this.generateObservacoesSection(pedido)}
          <div class="divider"></div>
          ${this.generateFooter(pedido, dataImpressao)}
        </div>
      </body>
      </html>
    `;
  }

  private generateHeader(pedido: Order, nomeRestaurante: string, dataPedido: string): string {
    return `
      <div class="print-header">
        <h1>${nomeRestaurante}</h1>
        <h2>Pedido Nº ${pedido.numero}</h2>
        <p class="date">${dataPedido}</p>
      </div>
    `;
  }

  private generateClienteSection(pedido: Order): string {
    const cliente = pedido.cliente;
    if (!cliente) return '';

    const tipoIcon = pedido.tipoPedido === 'entrega' ? '🚚' : '📦';
    const tipoLabel = pedido.tipoPedido === 'entrega' ? 'ENTREGA' : 'RETIRADA';

    return `
      <div class="section">
        <h3>CLIENTE</h3>
        <p class="customer-name">${cliente.nome || 'Cliente'}</p>
        <p>Tel: ${this.formatPhone(cliente.telefone)}</p>
        <p class="order-type">${tipoIcon} ${tipoLabel}</p>
      </div>
    `;
  }

  private generateEnderecoSection(pedido: Order): string {
    if (pedido.tipoPedido !== 'entrega' || !pedido.cliente) return '';

    const cliente = pedido.cliente;
    let html = `
      <div class="section">
        <h3>ENDEREÇO DE ENTREGA</h3>
        <p>${cliente.logradouro}, ${cliente.numero}</p>
    `;

    if (cliente.complemento) {
      html += `<p>${cliente.complemento}</p>`;
    }

    html += `<p>${cliente.bairro} - ${cliente.cidade}/${cliente.uf}</p>`;

    if (cliente.cep) {
      html += `<p>CEP: ${this.formatCEP(cliente.cep)}</p>`;
    }

    if (cliente.referencia) {
      html += `<p class="reference"><strong>Ref:</strong> ${cliente.referencia}</p>`;
    }

    html += `</div>`;
    return html;
  }

  private generateItensSection(pedido: Order): string {
    let html = `
      <div class="section">
        <h3>ITENS DO PEDIDO</h3>
        <div class="items-list">
    `;

    pedido.itens?.forEach(item => {
      html += `
        <div class="item">
          <div class="item-header">
            <span class="quantity">${item.quantidade}x</span>
            <span class="product-name">${item.produto?.nome}</span>
            <span class="price">${this.formatCurrency(item.subtotal)}</span>
          </div>
      `;

      // Adicionais
      if (item.adicionais && item.adicionais.length > 0) {
        html += `<div class="adicionais">`;
        item.adicionais.forEach(adicional => {
          html += `
            <div class="adicional">
              <span>+ ${adicional.adicional?.nome} (${adicional.quantidade}x)</span>
              <span>${this.formatCurrency(adicional.preco)}</span>
            </div>
          `;
        });
        html += `</div>`;
      }

      // Observações
      if (item.observacoes) {
        html += `<p class="observation"><strong>Obs:</strong> ${item.observacoes}</p>`;
      }

      html += `</div>`;
    });

    html += `</div></div>`;
    return html;
  }

  private generateTotaisSection(pedido: Order): string {
    let html = `
      <div class="section totals">
        <div class="total-line">
          <span>Subtotal</span>
          <span>${this.formatCurrency(pedido.subtotal)}</span>
        </div>
    `;

    if (pedido.taxaEntrega > 0) {
      html += `
        <div class="total-line">
          <span>Taxa de Entrega</span>
          <span>${this.formatCurrency(pedido.taxaEntrega)}</span>
        </div>
      `;
    }

    html += `
        <div class="total-line total-final">
          <span><strong>TOTAL</strong></span>
          <span><strong>${this.formatCurrency(pedido.total)}</strong></span>
        </div>
      </div>
    `;

    return html;
  }

  private generatePagamentoSection(pedido: Order): string {
    const forma = this.getFormaPagamentoLabel(pedido.formaPagamento);
    
    let html = `
      <div class="section">
        <h3>PAGAMENTO</h3>
        <p><strong>${forma}</strong></p>
    `;

    if (pedido.trocoPara && pedido.trocoPara > 0) {
      const troco = pedido.trocoPara - pedido.total;
      html += `
        <p>Troco para: ${this.formatCurrency(pedido.trocoPara)}</p>
        <p class="troco-calculado">Troco: ${this.formatCurrency(troco)}</p>
      `;
    }

    html += `</div>`;
    return html;
  }

  private generateObservacoesSection(pedido: Order): string {
    if (!pedido.observacoes) return '';

    return `
      <div class="section">
        <h3>OBSERVAÇÕES</h3>
        <p class="observations">${pedido.observacoes}</p>
      </div>
    `;
  }

  private generateFooter(pedido: Order, dataImpressao: string): string {
    const status = pedido.status?.nome || 'pendente';
    
    return `
      <div class="print-footer">
        <p>Status: ${this.getStatusLabel(status)}</p>
        <p class="timestamp">Impresso em: ${dataImpressao}</p>
        <p class="powered-by">climbdelivery.app</p>
      </div>
    `;
  }

  private getStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #000;
      }

      .print-container {
        width: 80mm;
        padding: 10px;
        margin: 0 auto;
      }

      .print-header {
        text-align: center;
        margin-bottom: 10px;
      }

      .print-header h1 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        text-transform: uppercase;
      }

      .print-header h2 {
        font-size: 16px;
        margin: 5px 0;
      }

      .print-header .date {
        font-size: 10px;
      }

      .divider {
        border-top: 1px dashed #000;
        margin: 10px 0;
      }

      .section {
        margin: 10px 0;
      }

      .section h3 {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 5px;
        text-transform: uppercase;
        border-bottom: 1px solid #000;
        padding-bottom: 2px;
      }

      .section p {
        margin: 3px 0;
        font-size: 11px;
      }

      .customer-name {
        font-weight: bold !important;
        font-size: 12px !important;
      }

      .order-type {
        font-weight: bold;
        margin-top: 5px !important;
      }

      .reference {
        font-style: italic;
        margin-top: 5px !important;
      }

      .item {
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px dotted #ccc;
      }

      .item:last-child {
        border-bottom: none;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 3px;
      }

      .item-header .quantity {
        width: 30px;
      }

      .item-header .product-name {
        flex: 1;
        padding: 0 5px;
      }

      .item-header .price {
        white-space: nowrap;
      }

      .adicionais {
        margin-left: 35px;
        font-size: 10px;
      }

      .adicional {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }

      .observation {
        margin-left: 35px !important;
        margin-top: 5px !important;
        font-size: 10px !important;
        font-style: italic;
      }

      .totals .total-line {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        font-size: 12px;
      }

      .totals .total-final {
        font-size: 14px;
        margin-top: 8px;
        padding-top: 5px;
        border-top: 2px solid #000;
      }

      .observations {
        padding: 5px;
        border: 1px solid #000;
        font-style: italic;
        background: #f9f9f9;
      }

      .troco-calculado {
        font-weight: bold;
        margin-top: 3px !important;
      }

      .print-footer {
        text-align: center;
        margin-top: 15px;
        font-size: 10px;
      }

      .print-footer .timestamp {
        margin: 5px 0;
        font-style: italic;
      }

      .print-footer .powered-by {
        margin-top: 10px;
        font-weight: bold;
      }

      @page {
        size: 80mm auto;
        margin: 0;
      }
    `;
  }

  // Helpers
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }

  private formatCEP(cep: string): string {
    if (!cep) return '';
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  }

  private getFormaPagamentoLabel(forma: string): string {
    const formas: { [key: string]: string } = {
      'dinheiro': '💵 Dinheiro',
      'cartao': '💳 Cartão',
      'pix': '📱 PIX',
      'cartao_debito': '💳 Cartão de Débito',
      'cartao_credito': '💳 Cartão de Crédito'
    };
    return formas[forma] || forma.toUpperCase();
  }

  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pendente': 'EM ANÁLISE',
      'confirmado': 'CONFIRMADO',
      'em_preparo': 'EM PREPARO',
      'pronto': 'PRONTO',
      'em_entrega': 'EM ENTREGA',
      'entregue': 'ENTREGUE',
      'cancelado': 'CANCELADO'
    };
    return statusMap[status] || status.toUpperCase();
  }
}
