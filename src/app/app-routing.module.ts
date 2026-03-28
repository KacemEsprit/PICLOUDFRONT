import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDhasbordComponent } from './components/admin-dhasbord/admin-dhasbord.component';
import { AgentDhasbordComponent } from './components/agent-dhasbord/agent-dhasbord.component';
import { OperatorDhasbordComponent } from './components/operator-dhasbord/operator-dhasbord.component';
import { PassengerDhasbordComponent } from './components/passenger-dhasbord/passenger-dhasbord.component';
import { AdminUserManagementComponent } from './components/admin-dhasbord/admin-user-management/admin-user-management.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin-dhasbord', component: AdminDhasbordComponent, canActivate: [AuthGuard] },
  { path: 'admin-dhasbord/users', component: AdminUserManagementComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: AdminUserManagementComponent, canActivate: [AuthGuard] },
  { path: 'agent-dhasbord', component: AgentDhasbordComponent, canActivate: [AuthGuard] },
  { path: 'operator-dhasbord', component: OperatorDhasbordComponent, canActivate: [AuthGuard] },
  { path: 'passenger-dhasbord', component: PassengerDhasbordComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', redirectTo: '/admin-dhasbord', pathMatch: 'full' },
  { path: 'dashboard/users', redirectTo: '/admin-dhasbord/users', pathMatch: 'full' },

  // Redirect unknown routes to login
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
