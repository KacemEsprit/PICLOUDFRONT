import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { RegisterComponent } from './components/authentication/register/register.component';
import { ForgotPasswordComponent } from './components/authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/authentication/reset-password/reset-password.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { AdminDhasbordComponent } from './components/admin/admin-dhasbord.component';
import { AgentDhasbordComponent } from './components/users/agent/agent-dhasbord/agent-dhasbord.component';
import { OperatorDhasbordComponent } from './components/users/operator/operator-dhasbord/operator-dhasbord.component';
import { PassengerDhasbordComponent } from './components/users/passenger/passenger-dhasbord/passenger-dhasbord.component';
import { AdminUserManagementComponent } from './components/admin/users/admin-user-management.component';
import { AuthGuard } from './guards/auth.guard';
import { FrontofficeLayoutComponent } from './components/shared/frontoffice-layout/frontoffice-layout.component';
import { BackofficeLayoutComponent } from './components/shared/backoffice-layout/backoffice-layout.component';
import { DocumentListComponent } from './components/users/documents/document-list/document-list.component';
import { DocumentUploadComponent } from './components/users/documents/document-upload/document-upload.component';
import { DocumentDetailComponent } from './components/users/documents/document-detail/document-detail.component';
import { AdminDocumentListComponent } from './components/admin/documents-admin/admin-document-list/admin-document-list.component';
import { DocumentTypeManagerComponent } from './components/admin/documents-admin/document-type-manager/document-type-manager.component';
import { ProfileComponent } from './components/users/profile/profile.component';
import { OrganizationListComponent } from './components/admin/organization/organization-list/organization-list.component';
import { OrganizationFormComponent } from './components/admin/organization/organization-form/organization-form.component';
import { OrganizationDetailComponent } from './components/admin/organization/organization-detail/organization-detail.component';
import { PartnerListComponent as AdminPartnerListComponent } from './components/admin/partner/partner-list/partner-list.component';
import { PartnerFormComponent } from './components/admin/partner/partner-form/partner-form.component';
import { ContractListComponent } from './components/admin/contract/contract-list/contract-list.component';
import { ContractFormComponent } from './components/admin/contract/contract-form/contract-form.component';
import { OperatorListComponent } from './components/users/operator-partner/operator-list/operator-list.component';
import { OperatorDetailComponent } from './components/users/operator-partner/operator-detail/operator-detail.component';
import { PartnerListComponent as UserPartnerListComponent } from './components/users/operator-partner/partner-list/partner-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'access-denied', component: AccessDeniedComponent },

  // Frontoffice
  {
    path: '',
    component: FrontofficeLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'agent-dhasbord', component: AgentDhasbordComponent, canActivate: [AuthGuard] },
      { path: 'operator-dhasbord', component: OperatorDhasbordComponent, canActivate: [AuthGuard] },
      { path: 'passenger-dhasbord', component: PassengerDhasbordComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'documents', component: DocumentListComponent, canActivate: [AuthGuard] },
      { path: 'documents/upload', component: DocumentUploadComponent, canActivate: [AuthGuard] },
      { path: 'documents/:id', component: DocumentDetailComponent, canActivate: [AuthGuard] },
      { path: 'documents/:id/reupload', component: DocumentUploadComponent, canActivate: [AuthGuard] },
      { path: 'operators', component: OperatorListComponent, canActivate: [AuthGuard] },
      { path: 'operators/:id', component: OperatorDetailComponent, canActivate: [AuthGuard] },
      { path: 'partners', component: UserPartnerListComponent, canActivate: [AuthGuard] }
    ]
  },

  // Ticket frontoffice (user)
  {
    path: 'ticket',
    component: FrontofficeLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'covoiturages', loadComponent: () => import('./user-ticket/covoiturage/covoiturage-list/covoiturage-list').then(m => m.CovoiturageListComponent) },
      { path: 'covoiturages/new', loadComponent: () => import('./user-ticket/covoiturage/covoiturage-form/covoiturage-form').then(m => m.CovoiturageFormComponent) },
      { path: 'my-covoiturages', loadComponent: () => import('./user-ticket/my-covoiturages/my-covoiturages').then(m => m.MyCovoituragesComponent) },
      { path: 'reservations', loadComponent: () => import('./user-ticket/reservation/reservation-list/reservation-list').then(m => m.ReservationListComponent) },
      { path: 'reservations/new', loadComponent: () => import('./user-ticket/reservation/reservation-form/reservation-form').then(m => m.ReservationFormComponent) },
      { path: 'tickets', loadComponent: () => import('./user-ticket/ticket/ticket-list/ticket-list').then(m => m.TicketListComponent) },
      { path: 'ai', loadComponent: () => import('./user-ticket/ai-dashboard/ai-dashboard').then(m => m.AIDashboardComponent) }
    ]
  },

  // Admin backoffice (tout en un seul bloc)
  {
    path: 'admin',
    component: BackofficeLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDhasbordComponent },
      { path: 'users', component: AdminUserManagementComponent },
      { path: 'documents', component: AdminDocumentListComponent },
      { path: 'documents/types', component: DocumentTypeManagerComponent },
      { path: 'organizations', component: OrganizationListComponent },
      { path: 'organizations/new', component: OrganizationFormComponent },
      { path: 'organizations/edit/:id', component: OrganizationFormComponent },
      { path: 'organizations/:id', component: OrganizationDetailComponent },
      { path: 'partners', component: AdminPartnerListComponent },
      { path: 'partners/new', component: PartnerFormComponent },
      { path: 'partners/edit/:id', component: PartnerFormComponent },
      { path: 'contracts', component: ContractListComponent },
      { path: 'contracts/new', component: ContractFormComponent },
      { path: 'contracts/edit/:id', component: ContractFormComponent },
      { path: 'ticket/covoiturages', loadComponent: () => import('./admin-ticket/covoiturage/covoiturage-list/covoiturage-list').then(m => m.CovoiturageListComponent) },
      { path: 'ticket/covoiturages/new', loadComponent: () => import('./admin-ticket/covoiturage/covoiturage-form/covoiturage-form').then(m => m.CovoiturageFormComponent) },
      { path: 'ticket/covoiturages/edit/:id', loadComponent: () => import('./admin-ticket/covoiturage/covoiturage-form/covoiturage-form').then(m => m.CovoiturageFormComponent) },
      { path: 'ticket/reservations', loadComponent: () => import('./admin-ticket/reservation/reservation-list/reservation-list').then(m => m.ReservationListComponent) },
      { path: 'ticket/tickets', loadComponent: () => import('./admin-ticket/ticket/ticket-list/ticket-list').then(m => m.TicketListComponent) },
      { path: 'ticket/tickets/new', loadComponent: () => import('./admin-ticket/ticket/ticket-form/ticket-form').then(m => m.TicketFormComponent) },
      { path: 'ticket/tickets/edit/:id', loadComponent: () => import('./admin-ticket/ticket/ticket-form/ticket-form').then(m => m.TicketFormComponent) },
      { path: 'ai-stats', loadComponent: () => import('./admin-ticket/ai-stats/ai-stats').then(m => m.AIStatsComponent) }
    ]
  },

  { path: 'admin-dhasbord', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
