import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { AdminDhasbordComponent } from './components/admin-dhasbord/admin-dhasbord.component';
import { AgentDhasbordComponent } from './components/agent-dhasbord/agent-dhasbord.component';
import { OperatorDhasbordComponent } from './components/operator-dhasbord/operator-dhasbord.component';
import { PassengerDhasbordComponent } from './components/passenger-dhasbord/passenger-dhasbord.component';
import { AdminUserManagementComponent } from './components/admin-dhasbord/admin-user-management/admin-user-management.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
