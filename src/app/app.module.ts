import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminDhasbordComponent } from './components/admin-dhasbord/admin-dhasbord.component';
import { AgentDhasbordComponent } from './components/agent-dhasbord/agent-dhasbord.component';
import { OperatorDhasbordComponent } from './components/operator-dhasbord/operator-dhasbord.component';
import { PassengerDhasbordComponent } from './components/passenger-dhasbord/passenger-dhasbord.component';
import { AdminUserManagementComponent } from './components/admin-dhasbord/admin-user-management/admin-user-management.component';
import { UserModalComponent } from './components/shared/user-modal/user-modal.component';
import { ConfirmationModalComponent } from './components/shared/confirmation-modal/confirmation-modal.component';
import { ToastNotificationComponent } from './components/shared/toast-notification/toast-notification.component';

import { AuthService } from './services/auth.service';
import { JwtInterceptor } from './services/jwt.interceptor';
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AdminDhasbordComponent,
    AgentDhasbordComponent,
    OperatorDhasbordComponent,
    PassengerDhasbordComponent,
    AdminUserManagementComponent,
    UserModalComponent,
    ConfirmationModalComponent,
    ToastNotificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
