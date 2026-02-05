import { Component, EventEmitter, Output } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent {
  @Output() created = new EventEmitter<void>();

  details = '';
  date = '';
  endDate = '';
  time = '';
  phone = '';
  persons = 1;
  status = 'pending';

  constructor(private bookingService: BookingService) { }

  addBooking() {
    if (!this.details || !this.date || !this.time) return;

    const fullDate = `${this.date}T${this.time}:00`;
    const fullEndDate = this.endDate ? `${this.endDate}T${this.time}:00` : undefined;

    this.bookingService.create({
      details: this.details,
      date: fullDate,
      endDate: fullEndDate,
      time: this.time,
      phone: this.phone,
      persons: this.persons,
      status: this.status,
      title: 'Reservation'
    }).subscribe({
      next: () => {
        this.details = '';
        this.date = '';
        this.endDate = '';
        this.time = '';
        this.phone = '';
        this.persons = 1;
        this.status = 'pending';
        this.created.emit();
      },
      error: (err) => alert(err?.error?.message || JSON.stringify(err?.error || err))
    });
  }
}
