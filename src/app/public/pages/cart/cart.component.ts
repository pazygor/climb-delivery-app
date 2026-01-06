import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicCartService } from '../../services/public-cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private cartService = inject(PublicCartService);
  
  cart$ = this.cartService.cart$;
  drawerOpen$ = this.cartService.drawerOpen$;

  closeDrawer(): void {
    this.cartService.closeDrawer();
  }

  // TODO: Implementar métodos na Sprint 7
}
