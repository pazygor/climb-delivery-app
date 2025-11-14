import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Components
import { AdminHeaderComponent } from '../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminHeaderComponent,
    AdminSidebarComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  sidebarVisible = true;

  ngOnInit(): void {
    // Verificar localStorage para estado da sidebar
    const savedState = localStorage.getItem('adminSidebarVisible');
    if (savedState !== null) {
      this.sidebarVisible = savedState === 'true';
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    localStorage.setItem('adminSidebarVisible', String(this.sidebarVisible));
  }
}
