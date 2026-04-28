import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-backoffice-sidebar',
  templateUrl: './backoffice-sidebar.component.html',
  styleUrls: ['./backoffice-sidebar.component.css']
})
export class BackofficeSidebarComponent implements OnInit {
  sidebarSections = [
    {
      label: 'Main',
      items: [
        { icon: 'fa-th-large', label: 'Dashboard', path: '/admin/dashboard' }
      ]
    },
    {
      label: 'Admin',
      items: [
        { icon: 'fa-users', label: 'User Management', path: '/admin/users' },
        { icon: 'fa-file', label: 'Document Management', path: '/admin/documents' }
      ]
    },
    {
      label: 'Management',
      items: [
        { icon: 'fa-building', label: 'Organizations', path: '/admin/organizations' },
        { icon: 'fa-handshake-o', label: 'Partners', path: '/admin/partners' },
        { icon: 'fa-file-text', label: 'Contracts', path: '/admin/contracts' }
      ]
    },
    {
      label: 'Ticket & Transport',
      items: [
        { icon: 'fa-car', label: 'Carpools', path: '/admin/ticket/covoiturages' },
        { icon: 'fa-calendar', label: 'Reservations', path: '/admin/ticket/reservations' },
        { icon: 'fa-ticket', label: 'Tickets', path: '/admin/ticket/tickets' }
      ]
    },
    {
      label: 'Artificial Intelligence',
      items: [
        { icon: 'fa-brain', label: 'AI Stats & Models', path: '/admin/ai-stats' }
      ]
    }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}
