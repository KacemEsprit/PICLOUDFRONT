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

// Document Management Components
import { DocumentListComponent } from './components/users/documents/document-list/document-list.component';
import { DocumentUploadComponent } from './components/users/documents/document-upload/document-upload.component';
import { DocumentDetailComponent } from './components/users/documents/document-detail/document-detail.component';
import { AdminDocumentListComponent } from './components/admin/documents-admin/admin-document-list/admin-document-list.component';
import { DocumentTypeManagerComponent } from './components/admin/documents-admin/document-type-manager/document-type-manager.component';
import { ProfileComponent } from './components/users/profile/profile.component';

const routes: Routes = [
  // Authentication routes (without layout)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'access-denied', component: AccessDeniedComponent },

  // Frontoffice routes (with frontoffice layout for users: AGENT, OPERATOR, PASSENGER)
  {
    path: '',
    component: FrontofficeLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'transit', component: HomeComponent }, // Placeholder
      { path: 'carpool', component: HomeComponent }, // Placeholder
      { path: 'community', component: HomeComponent }, // Placeholder

      // Agent routes
      { path: 'agent-dhasbord', component: AgentDhasbordComponent, canActivate: [AuthGuard], data: { roles: ['AGENT'] } },

      // Operator routes
      { path: 'operator-dhasbord', component: OperatorDhasbordComponent, canActivate: [AuthGuard], data: { roles: ['OPERATOR'] } },

      // Passenger routes
      { path: 'passenger-dhasbord', component: PassengerDhasbordComponent, canActivate: [AuthGuard], data: { roles: ['PASSENGER'] } },

      // User Profile - Accessible by all authenticated users (AGENT, OPERATOR, PASSENGER)
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { roles: ['AGENT', 'OPERATOR', 'PASSENGER'] } },

      // Document Management Routes - User side
      { path: 'documents', component: DocumentListComponent, canActivate: [AuthGuard] },
      { path: 'documents/upload', component: DocumentUploadComponent, canActivate: [AuthGuard] },
      { path: 'documents/:id', component: DocumentDetailComponent, canActivate: [AuthGuard] },
      { path: 'documents/:id/reupload', component: DocumentUploadComponent, canActivate: [AuthGuard] }
    ]
  },

  // Backoffice routes (with backoffice layout for admin)
  {
    path: 'admin',
    component: BackofficeLayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'dashboard', component: AdminDhasbordComponent },
      { path: 'admin-dhasbord', component: AdminDhasbordComponent },
      { path: 'users', component: AdminUserManagementComponent },
      { path: 'admin-dhasbord/users', component: AdminUserManagementComponent },
      { path: 'documents', component: AdminDocumentListComponent },
      { path: 'documents/types', component: DocumentTypeManagerComponent }
    ]
  },

  // Old admin routes (redirect to new structure for backwards compatibility)
  { path: 'admin-dhasbord', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: 'admin-dhasbord/users', redirectTo: '/admin/users', pathMatch: 'full' },

  // Legacy redirect routes
  { path: 'dashboard', redirectTo: '/admin/dashboard', pathMatch: 'full' },

  // Redirect unknown routes to home
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
