import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-backoffice-sidebar',
  templateUrl: './backoffice-sidebar.component.html',
  styleUrls: ['./backoffice-sidebar.component.css']
})
export class BackofficeSidebarComponent implements OnInit {
  userRole: string = '';

  sidebarSections: any[] = [];

  adminSections = [
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
        { icon: 'fa-file', label: 'Document Management', path: '/admin/documents' },
        { icon: 'fa-calendar-times', label: 'Document Expiry Alerts', path: '/admin/expiry-alerts' },
        { icon: 'fa-history', label: 'Audit Log', path: '/admin/audit-log' },
        { icon: 'fa-file', label: 'Document Management', path: '/admin/documents' }
      ]
    },
    {
      label: 'Management',
      items: [
        { icon: 'fa-building', label: 'Organizations', path: '/admin/organizations' },
        { icon: 'fa-handshake', label: 'Partners', path: '/admin/partners' },
        { icon: 'fa-file-text', label: 'Contracts', path: '/admin/contracts' },
        { icon: 'fa-bell', label: 'Contract Reminders', path: '/admin/contracts/reminders' }
      ]
    }
  ];

  operatorSections = [
    {
      label: 'Main',
      items: [
        { icon: 'fa-th-large', label: 'Dashboard', path: '/operator/dashboard' }
      ]
    },
    {
      label: 'Subscriptions & Plans',
      items: [
        { icon: 'fa-tags', label: 'Pricing Plans', path: '/operator/pricing-plans' },
        { icon: 'fa-id-card', label: 'Subscriptions', path: '/operator/subscriptions' },
        { icon: 'fa-percent', label: 'Discounts', path: '/operator/reductions' }
      ]
    },
    {
      label: 'Analytics & Loyalty',
      items: [
        { icon: 'fa-star', label: 'Loyalty Program', path: '/operator/loyalty' },
        { icon: 'fa-brain', label: 'ML Analysis', path: '/operator/ml' }
      ]
    }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userRole = user?.role?.toUpperCase() || '';

    if (this.userRole === 'OPERATOR') {
      this.sidebarSections = this.operatorSections;
    } else {
      this.sidebarSections = this.adminSections;
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}


