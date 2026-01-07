import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PublicRestaurantService } from '../../services/public-restaurant.service';
import { PublicRestaurant } from '../../models/public-restaurant.model';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.scss'
})
export class PublicFooterComponent implements OnInit, OnDestroy {
  currentYear = new Date().getFullYear();
  restaurant: PublicRestaurant | null = null;
  private destroy$ = new Subject<void>();

  constructor(private restaurantService: PublicRestaurantService) {}

  ngOnInit(): void {
    this.restaurantService.restaurant$
      .pipe(takeUntil(this.destroy$))
      .subscribe(restaurant => {
        this.restaurant = restaurant;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openWhatsApp(): void {
    if (this.restaurant?.whatsapp) {
      const url = `https://wa.me/${this.restaurant.whatsapp}`;
      window.open(url, '_blank');
    }
  }

  openSocial(url: string | undefined): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
