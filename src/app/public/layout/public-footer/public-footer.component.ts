import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-footer.component.html',
  styleUrl: './public-footer.component.scss'
})
export class PublicFooterComponent {
  // TODO: Implementar na Sprint 6
  currentYear = new Date().getFullYear();
}
