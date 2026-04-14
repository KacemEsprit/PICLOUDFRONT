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
