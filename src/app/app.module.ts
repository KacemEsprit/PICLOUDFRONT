import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { UserModalComponent } from './components/shared/user-modal/user-modal.component';
import { ConfirmationModalComponent } from './components/shared/confirmation-modal/confirmation-modal.component';
import { ToastNotificationComponent } from './components/shared/toast-notification/toast-notification.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ProfileComponent } from './components/users/profile/profile.component';

import { BackofficeSidebarComponent } from './components/shared/backoffice-sidebar/backoffice-sidebar.component';
import { FrontofficeLayoutComponent } from './components/shared/frontoffice-layout/frontoffice-layout.component';
import { BackofficeLayoutComponent } from './components/shared/backoffice-layout/backoffice-layout.component';

// Shared Components
// StatusBadgeComponent is now standalone

// Pipes
import { StatusLabelPipe, StatusColorPipe, StatusHexColorPipe } from './pipes/status.pipe';

import { AuthService } from './services/auth/auth.service';
import { JwtInterceptor } from './services/auth/jwt.interceptor';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AccessDeniedComponent,
    AdminDhasbordComponent,
    AgentDhasbordComponent,
    OperatorDhasbordComponent,
    PassengerDhasbordComponent,
    AdminUserManagementComponent,
    UserModalComponent,
    ConfirmationModalComponent,
    ToastNotificationComponent,
    HeaderComponent,
    FooterComponent,
    ProfileComponent,
    BackofficeSidebarComponent,
    FrontofficeLayoutComponent,
    BackofficeLayoutComponent,
    // Pipes
    StatusLabelPipe,
    StatusColorPipe,
    StatusHexColorPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
