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

// Document Management Components
import { DocumentListComponent } from './components/users/documents/document-list/document-list.component';
import { DocumentUploadComponent } from './components/users/documents/document-upload/document-upload.component';
import { DocumentDetailComponent } from './components/users/documents/document-detail/document-detail.component';
import { AdminDocumentListComponent } from './components/admin/documents-admin/admin-document-list/admin-document-list.component';
import { DocumentTypeManagerComponent } from './components/admin/documents-admin/document-type-manager/document-type-manager.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'access-denied', component: AccessDeniedComponent },

  // Admin Dashboard - Only accessible by ADMIN role
  { path: 'admin-dhasbord', component: AdminDhasbordComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin-dhasbord/users', component: AdminUserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/users', component: AdminUserManagementComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },

  // Agent Dashboard - Only accessible by AGENT role
  { path: 'agent-dhasbord', component: AgentDhasbordComponent, canActivate: [AuthGuard], data: { roles: ['AGENT'] } },

  // Operator Dashboard - Only accessible by OPERATOR role
  { path: 'operator-dhasbord', component: OperatorDhasbordComponent, canActivate: [AuthGuard], data: { roles: ['OPERATOR'] } },

  // Passenger Dashboard - Only accessible by PASSENGER role
  { path: 'passenger-dhasbord', component: PassengerDhasbordComponent, canActivate: [AuthGuard], data: { roles: ['PASSENGER'] } },

  // Document Management Routes - User side
  { path: 'documents', component: DocumentListComponent, canActivate: [AuthGuard] },
  { path: 'documents/upload', component: DocumentUploadComponent, canActivate: [AuthGuard] },
  { path: 'documents/:id', component: DocumentDetailComponent, canActivate: [AuthGuard] },
  { path: 'documents/:id/reupload', component: DocumentUploadComponent, canActivate: [AuthGuard] },

  // Document Management Routes - Admin side
  { path: 'admin/documents', component: AdminDocumentListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin/documents/types', component: DocumentTypeManagerComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },

  // Redirect dashboard routes based on role (for convenience)
  { path: 'dashboard', redirectTo: '/admin-dhasbord', pathMatch: 'full' },
  { path: 'dashboard/users', redirectTo: '/admin-dhasbord/users', pathMatch: 'full' },

  // Redirect unknown routes to home
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
