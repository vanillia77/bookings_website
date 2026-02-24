import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './guards/auth.guard';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { BookingListComponent } from './components/booking-form/booking-list/booking-list.component';
import { BookingEditComponent } from './components/booking-edit/booking-edit.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'bookings', component: BookingListComponent, canActivate: [authGuard] },
  { path: 'bookings/new', component: BookingFormComponent, canActivate: [authGuard] },
  { path: 'bookings/edit/:id', component: BookingEditComponent, canActivate: [authGuard] },

  { path: 'form', redirectTo: 'bookings/new' },
  { path: 'list', redirectTo: 'bookings' },
  { path: 'edit/:id', redirectTo: 'bookings/edit/:id' },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

