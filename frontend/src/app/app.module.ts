import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';

import { BookingFormComponent } from './components/booking-form/booking-form.component';
import { BookingListComponent } from './components/booking-form/booking-list/booking-list.component';
import { BookingEditComponent } from './components/booking-edit/booking-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    BookingFormComponent,
    BookingListComponent,
    BookingEditComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    PagesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

