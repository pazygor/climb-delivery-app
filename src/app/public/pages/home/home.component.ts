import { Component, OnInit, OnDestroy, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { PublicRestaurantService } from '../../services/public-restaurant.service';
import { PublicCartService } from '../../services/public-cart.service';
import { PublicRestaurant, CardapioResponse, PublicCategoria, PublicProduto } from '../../models/public-restaurant.model';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private restaurantService = inject(PublicRestaurantService);
  private cartService = inject(PublicCartService);
  private destroy$ = new Subject<void>();

  slug: string = '';
  loading = true;
  error = false;
  errorMessage = '';
  
  restaurant: PublicRestaurant | null = null;
  cardapio: CardapioResponse | null = null;
  categorias: PublicCategoria[] = [];
  searchTerm = '';
  selectedCategory: number | null = null;

  ngOnInit(): void {
    this.slug = this.route.snapshot.params['slug'];
    this.loadRestaurant();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRestaurant(): void {
    this.loading = true;
    this.error = false;

    this.restaurantService.getRestaurante(this.slug)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (restaurant) => {
          this.restaurant = restaurant;
          if (restaurant.configuracao) {
            this.applyCustomTheme(restaurant.configuracao);
          }
          this.loadCardapio();
        },
        error: (err) => {
          console.error('Erro ao carregar restaurante:', err);
          this.error = true;
          this.errorMessage = 'Restaurante não encontrado';
        }
      });
  }

  loadCardapio(): void {
    this.restaurantService.getCardapio(this.slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cardapio) => {
          this.cardapio = cardapio;
          this.categorias = cardapio.categorias;
        },
        error: (err) => {
          console.error('Erro ao carregar cardápio:', err);
          this.errorMessage = 'Erro ao carregar cardápio';
        }
      });
  }

  applyCustomTheme(config: any): void {
    const root = document.documentElement;
    
    if (config.corPrimaria) {
      root.style.setProperty('--primary-color', config.corPrimaria);
    }
    if (config.corSecundaria) {
      root.style.setProperty('--secondary-color', config.corSecundaria);
    }
    if (config.corAcento) {
      root.style.setProperty('--accent-color', config.corAcento);
    }
    if (config.corTexto) {
      root.style.setProperty('--text-color', config.corTexto);
    }
    if (config.corFundo) {
      root.style.setProperty('--background-color', config.corFundo);
    }
    if (config.corHeaderBackground) {
      root.style.setProperty('--header-background', config.corHeaderBackground);
    }
    if (config.corHeaderTexto) {
      root.style.setProperty('--header-text', config.corHeaderTexto);
    }
  }

  get filteredCategorias(): PublicCategoria[] {
    if (!this.categorias) return [];

    return this.categorias.map(categoria => ({
      ...categoria,
      produtos: categoria.produtos.filter(produto => 
        produto.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        produto.descricao?.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    })).filter(categoria => categoria.produtos.length > 0);
  }

  get destaques(): PublicProduto[] {
    if (!this.cardapio) return [];
    return this.categorias
      .flatMap(cat => cat.produtos)
      .filter(prod => prod.destaque && prod.disponivel);
  }

  scrollToCategory(categoryId: number): void {
    this.selectedCategory = categoryId;
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerHeight = 70;
      const categoryNavHeight = 60;
      const offset = headerHeight + categoryNavHeight + 20;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  isRestaurantOpen(): boolean {
    return this.restaurant ? this.restaurantService.isRestauranteAberto(this.restaurant) : false;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

