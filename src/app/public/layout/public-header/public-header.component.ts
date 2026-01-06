import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-header.component.html',
  styleUrl: './public-header.component.scss'
})
export class PublicHeaderComponent {
  // TODO: Implementar na Sprint 6
  // Incluirá: logo, nome restaurante, status aberto/fechado, badge carrinho
}
