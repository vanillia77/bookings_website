import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { BookingListComponent } from './components/booking-form/booking-list/booking-list.component';
import { BookingEditComponent } from './components/booking-edit/booking-edit.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'form', component: BookingFormComponent },
  { path: 'list', component: BookingListComponent },
  { path: 'edit/:id', component: BookingEditComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
