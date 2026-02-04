import { Component, EventEmitter, Output } from '@angular/core';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html'
})
export class BookingFormComponent {
  @Output() created = new EventEmitter<void>();

  title = '';
  description = '';
  date = '';
  time = '';

  constructor(private bookingService: BookingService) {}

  addBooking() {
    if (!this.title || !this.date || !this.time) return;

    this.bookingService.create({
      title: this.title,
      description: this.description,
      date: this.date,
      time: this.time
    }).subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.date = '';
        this.time = '';
        this.created.emit(); // ✅ refresh list
      },
      error: (err) => alert(err?.error?.message || JSON.stringify(err?.error || err))

    });
  }
}
