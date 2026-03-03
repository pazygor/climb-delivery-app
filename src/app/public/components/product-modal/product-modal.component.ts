import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextarea } from 'primeng/inputtextarea';

// Models
import { PublicProduto, PublicGrupoAdicional, PublicAdicional } from '../../models/public-restaurant.model';

export interface ProductModalCartItem {
  produto: PublicProduto;
  quantidade: number;
  adicionaisSelecionados: {
    grupoId: number;
    grupoNome: string;
    adicionais: PublicAdicional[];
  }[];
  observacao: string;
  precoTotal: number;
}

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    RadioButtonModule,
    CheckboxModule,
    InputTextarea
  ],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss'
})
export class ProductModalComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() produto: PublicProduto | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() addToCart = new EventEmitter<ProductModalCartItem>();

  quantidade: number = 1;
  observacao: string = '';
  adicionaisSelecionados: Map<number, PublicAdicional[]> = new Map();
  selectedRadioValues: { [grupoId: number]: number } = {};

  ngOnInit(): void {
    this.resetarSelecoes();
  }

  ngOnChanges(): void {
    if (this.produto && this.visible) {
      this.resetarSelecoes();
    }
  }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetarSelecoes();
  }

  resetarSelecoes(): void {
    this.quantidade = 1;
    this.observacao = '';
    this.adicionaisSelecionados.clear();
    this.selectedRadioValues = {};
  }

  aumentarQuantidade(): void {
    this.quantidade++;
  }

  diminuirQuantidade(): void {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }

  onRadioChange(grupo: PublicGrupoAdicional, adicionalId: number): void {
    const adicional = grupo.adicionais.find(a => a.id === adicionalId);
    if (adicional) {
      this.selectedRadioValues[grupo.id] = adicionalId;
      this.adicionaisSelecionados.set(grupo.id, [adicional]);
    }
  }

  onAdicionalRadioChange(grupo: PublicGrupoAdicional, adicional: PublicAdicional): void {
    // Para radio, sempre substitui a seleção
    this.selectedRadioValues[grupo.id] = adicional.id;
    this.adicionaisSelecionados.set(grupo.id, [adicional]);
  }

  onAdicionalCheckboxChange(grupo: PublicGrupoAdicional, adicional: PublicAdicional, checked: boolean): void {
    let selecionados = this.adicionaisSelecionados.get(grupo.id) || [];

    if (checked) {
      // Verifica se não excedeu o máximo
      if (selecionados.length < grupo.maximoSelecao) {
        selecionados = [...selecionados, adicional];
      }
    } else {
      selecionados = selecionados.filter(a => a.id !== adicional.id);
    }

    this.adicionaisSelecionados.set(grupo.id, selecionados);
  }

  isAdicionalSelecionado(grupoId: number, adicionalId: number): boolean {
    const selecionados = this.adicionaisSelecionados.get(grupoId);
    return selecionados?.some(a => a.id === adicionalId) || false;
  }

  getAdicionalSelecionadoRadio(grupoId: number): number | null {
    const selecionados = this.adicionaisSelecionados.get(grupoId);
    return selecionados && selecionados.length > 0 ? selecionados[0].id : null;
  }

  validarSelecoes(): { valido: boolean; mensagem: string } {
    if (!this.produto || !this.produto.gruposProduto) {
      return { valido: true, mensagem: '' };
    }

    for (const grupoProduto of this.produto.gruposProduto) {
      const grupo = grupoProduto.grupoAdicional;
      const selecionados = this.adicionaisSelecionados.get(grupo.id) || [];

      // Valida obrigatoriedade
      if (grupo.obrigatorio && selecionados.length === 0) {
        return {
          valido: false,
          mensagem: `Por favor, selecione uma opção em "${grupo.nome}"`
        };
      }

      // Valida mínimo
      if (selecionados.length < grupo.minimoSelecao) {
        return {
          valido: false,
          mensagem: `Selecione pelo menos ${grupo.minimoSelecao} opção(ões) em "${grupo.nome}"`
        };
      }

      // Valida máximo
      if (selecionados.length > grupo.maximoSelecao) {
        return {
          valido: false,
          mensagem: `Selecione no máximo ${grupo.maximoSelecao} opção(ões) em "${grupo.nome}"`
        };
      }
    }

    return { valido: true, mensagem: '' };
  }

  calcularPrecoAdicionais(): number {
    let total = 0;
    this.adicionaisSelecionados.forEach((adicionais) => {
      adicionais.forEach((adicional) => {
        total += Number(adicional.preco) || 0;
      });
    });
    return total;
  }

  calcularPrecoTotal(): number {
    if (!this.produto) return 0;
    const precoBase = Number(this.produto.preco) || 0;
    const precoAdicionais = this.calcularPrecoAdicionais();
    return (precoBase + precoAdicionais) * this.quantidade;
  }

  adicionarAoCarrinho(): void {
    if (!this.produto) return;

    const validacao = this.validarSelecoes();
    if (!validacao.valido) {
      alert(validacao.mensagem);
      return;
    }

    const item: ProductModalCartItem = {
      produto: this.produto,
      quantidade: this.quantidade,
      adicionaisSelecionados: Array.from(this.adicionaisSelecionados.entries())
        .filter(([_, adicionais]) => adicionais.length > 0)
        .map(([grupoId, adicionais]) => {
          const grupoProduto = this.produto!.gruposProduto!.find(gp => gp.grupoAdicional.id === grupoId);
          return {
            grupoId,
            grupoNome: grupoProduto?.grupoAdicional.nome || '',
            adicionais
          };
        }),
      observacao: this.observacao,
      precoTotal: this.calcularPrecoTotal()
    };

    this.addToCart.emit(item);
    this.onHide();
  }

  formatPrice(value: number | string | undefined | null): string {
    const numValue = Number(value) || 0;
    return numValue.toFixed(2).replace('.', ',');
  }
}
