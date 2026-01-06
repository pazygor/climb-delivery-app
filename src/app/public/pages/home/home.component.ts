import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicRestaurantService } from '../../services/public-restaurant.service';
import { PublicCartService } from '../../services/public-cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(PublicRestaurantService);
  private cartService = inject(PublicCartService);

  slug: string = '';
  loading = true;
  error = false;

  ngOnInit(): void {
    this.slug = this.route.snapshot.params['slug'];
    // TODO: Implementar carregamento do cardápio na Sprint 6
    console.log('HomeComponent inicializado com slug:', this.slug);
    this.loading = false;
  }
}
