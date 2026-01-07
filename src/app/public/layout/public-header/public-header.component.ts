import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicRestaurantService } from '../../services/public-restaurant.service';
import { PublicCartService } from '../../services/public-cart.service';
import { PublicRestaurant } from '../../models/public-restaurant.model';
import { Cart } from '../../models/cart.model';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss'
})
export class PublicHeaderComponent implements OnInit, OnDestroy {
  restaurant: PublicRestaurant | null = null;
  cart: Cart | null = null;
  isOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private restaurantService: PublicRestaurantService,
    private cartService: PublicCartService
  ) {}

  ngOnInit(): void {
    this.restaurantService.restaurant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(restaurant => {
        this.restaurant = restaurant;
        if (restaurant) {
          this.isOpen = this.restaurantService.isRestauranteAberto(restaurant);
        }
      });

    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCart(): void {
    this.cartService.openDrawer();
  }
}
