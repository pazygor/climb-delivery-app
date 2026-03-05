import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { PublicCartService } from '../../services/public-cart.service';
import { PublicOrderService } from '../../services/public-order.service';
import { CepService } from '../../../core/services/cep.service';
import { PublicRestaurantService } from '../../services/public-restaurant.service';

// Models
import { CheckoutFormData, CreatePedidoDto } from '../../models/checkout.model';
import { CartItem, CartAdicional } from '../../models/cart.model';
import { PublicRestaurant } from '../../models/public-restaurant.model';
import { CurrencyUtil } from '../../../core/utils/currency.util';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputTextarea,
    ButtonModule,
    RadioButtonModule,
    DropdownModule,
    DividerModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cartService = inject(PublicCartService);
  private orderService = inject(PublicOrderService);
  private cepService = inject(CepService);
  private restaurantService = inject(PublicRestaurantService);
  private messageService = inject(MessageService);

  private destroy$ = new Subject<void>();

  checkoutForm!: FormGroup;
  items: CartItem[] = [];
  restaurant: PublicRestaurant | null = null;
  loading = false;
  buscandoCep = false;
  slug = '';

  // Opções de formulário
  tiposPedido = [
    { label: 'Entrega', value: 'entrega' },
    { label: 'Retirada', value: 'retirada' },
  ];

  formasPagamento = [
    { label: 'Dinheiro', value: 'dinheiro' },
    { label: 'Cartão', value: 'cartao' },
    { label: 'PIX', value: 'pix' },
  ];

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    
   // Carregar restaurante
    this.restaurantService.restaurant$
      .pipe(takeUntil(this.destroy$))
      .subscribe((restaurant: PublicRestaurant | null) => {
        this.restaurant = restaurant;
      });

    // Carregar itens do carrinho
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cart) => {
        this.items = cart.items;
        
        // Validar se carrinho não está vazio
        if (this.items.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Carrinho vazio',
            detail: 'Adicione produtos ao carrinho antes de finalizar o pedido',
          });
          this.router.navigate(['/p', this.slug]);
        }
      });

    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.checkoutForm = this.fb.group({
      // Cliente
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      nome: [''],
      email: ['', [Validators.email]],
      cpf: ['', [Validators.pattern(/^\d{11}$/)]],

      // Tipo de Pedido
      tipoPedido: ['entrega', [Validators.required]],

      // Endereço (condicional)
      cep: [''],
      logradouro: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      uf: [''],
      referencia: [''],

      // Pagamento
      formaPagamento: ['dinheiro', [Validators.required]],
      trocoPara: [''],

      // Observações
      observacoes: [''],
    });

    // Monitorar mudança no tipo de pedido
    this.checkoutForm.get('tipoPedido')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((tipo) => {
        this.updateEnderecoValidators(tipo);
      });

    // Monitorar mudança na forma de pagamento
    this.checkoutForm.get('formaPagamento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((forma) => {
        this.updateTrocoValidators(forma);
      });

    // Monitorar mudança no CEP
    this.checkoutForm.get('cep')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((cep) => {
        if (cep && cep.replace(/\D/g, '').length === 8) {
          this.buscarCep(cep);
        }
      });

    // Inicializar validadores
    this.updateEnderecoValidators('entrega');
    this.updateTrocoValidators('dinheiro');
  }

  updateEnderecoValidators(tipoPedido: string): void {
    const enderecoFields = ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf'];
    
    if (tipoPedido === 'entrega') {
      enderecoFields.forEach((field) => {
        this.checkoutForm.get(field)?.setValidators([Validators.required]);
        this.checkoutForm.get(field)?.updateValueAndValidity();
      });
    } else {
      enderecoFields.forEach((field) => {
        this.checkoutForm.get(field)?.clearValidators();
        this.checkoutForm.get(field)?.updateValueAndValidity();
      });
    }
  }

  updateTrocoValidators(formaPagamento: string): void {
    const trocoControl = this.checkoutForm.get('trocoPara');
    
    if (formaPagamento === 'dinheiro') {
      trocoControl?.setValidators([Validators.required, Validators.min(this.calcularTotal())]);
    } else {
      trocoControl?.clearValidators();
    }
    trocoControl?.updateValueAndValidity();
  }

  buscarCep(cep: string): void {
    this.buscandoCep = true;
    
    this.cepService.buscarCep(cep).subscribe({
      next: (endereco) => {
        this.buscandoCep = false;
        
        if (endereco) {
          this.checkoutForm.patchValue({
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            uf: endereco.uf,
          });
          
          this.messageService.add({
            severity: 'success',
            summary: 'CEP encontrado',
            detail: 'Endereço preenchido automaticamente',
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'CEP não encontrado',
            detail: 'Preencha o endereço manualmente',
          });
        }
      },
      error: () => {
        this.buscandoCep = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao buscar CEP',
          detail: 'Tente novamente mais tarde',
        });
      },
    });
  }

  calcularSubtotal(): number {
    const valores = this.items.map(item => CurrencyUtil.toNumber(item.precoTotal));
    return CurrencyUtil.add(...valores);
  }

  calcularTaxaEntrega(): number {
    if (this.checkoutForm.get('tipoPedido')?.value === 'retirada') {
      return 0;
    }
    return this.restaurant ? CurrencyUtil.toNumber(this.restaurant.taxaEntrega) : 0;
  }

  calcularTotal(): number {
    const subtotal = this.calcularSubtotal();
    const taxa = this.calcularTaxaEntrega();
    return CurrencyUtil.add(subtotal, taxa);
  }

  formatarValor(valor: number): string {
    return CurrencyUtil.format(valor);
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulário inválido',
        detail: 'Preencha todos os campos obrigatórios',
      });
      return;
    }

    if (this.items.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrinho vazio',
        detail: 'Adicione produtos ao carrinho',
      });
      return;
    }

    // Validar troco
    if (this.checkoutForm.value.formaPagamento === 'dinheiro') {
      const trocoPara = CurrencyUtil.toNumber(this.checkoutForm.value.trocoPara);
      const total = this.calcularTotal();
      
      if (trocoPara < total) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Troco insuficiente',
          detail: 'O valor do troco deve ser maior ou igual ao total do pedido',
        });
        return;
      }
    }

    this.loading = true;

    const formValue = this.checkoutForm.value;
    
    // Preparar DTO
    const pedidoDto: CreatePedidoDto = {
      cliente: {
        telefone: formValue.telefone,
        nome: formValue.nome || undefined,
        email: formValue.email || undefined,
        cpf: formValue.cpf || undefined,
      },
      tipoPedido: formValue.tipoPedido,
      endereco: formValue.tipoPedido === 'entrega' ? {
        cep: formValue.cep,
        logradouro: formValue.logradouro,
        numero: formValue.numero,
        complemento: formValue.complemento || undefined,
        bairro: formValue.bairro,
        cidade: formValue.cidade,
        uf: formValue.uf,
        referencia: formValue.referencia || undefined,
      } : undefined,
      itens: this.items.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
        observacoes: item.observacoes || undefined,
        adicionais: item.adicionaisSelecionados.map((adic: CartAdicional) => ({
          adicionalId: adic.adicional.id,
          quantidade: adic.quantidade,
        })),
      })),
      formaPagamento: formValue.formaPagamento,
      trocoPara: formValue.formaPagamento === 'dinheiro' ? formValue.trocoPara : undefined,
      observacoes: formValue.observacoes || undefined,
    };

    // Enviar pedido
    this.orderService.createPedido(this.slug, pedidoDto).subscribe({
      next: (pedido) => {
        this.loading = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Pedido realizado!',
          detail: `Pedido #${pedido.numero} criado com sucesso`,
        });

        // Limpar carrinho
        this.cartService.clearCart();

        // Navegar para página de confirmação
        setTimeout(() => {
          this.router.navigate(['/p', this.slug, 'pedido', pedido.numero]);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        
        const errorMessage = error.error?.message || 'Erro ao criar pedido. Tente novamente.';
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage,
        });
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
