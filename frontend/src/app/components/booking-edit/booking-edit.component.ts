import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-edit',
  templateUrl: './booking-edit.component.html'
})
export class BookingEditComponent implements OnInit {
  id!: number;
  details = '';
  date = '';
  endDate = '';
  time = '';
  phone = '';
  persons = 1;
  status = 'pending';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookingService.getAll().subscribe(bookings => {
      const booking = bookings.find(b => b.id === this.id);
      if (booking) {
        this.details = booking.details;
        this.date = booking.date.split('T')[0];
        this.time = booking.date.split('T')[1]?.substring(0, 5) || booking.time || '';
        this.endDate = booking.endDate ? booking.endDate.split('T')[0] : '';
        this.phone = booking.phone || '';
        this.persons = booking.persons || 1;
        this.status = booking.status || 'pending';
      }
    });
  }

  save() {
    const fullDate = `${this.date}T${this.time}:00`;
    const fullEndDate = this.endDate ? `${this.endDate}T${this.time}:00` : undefined;

    this.bookingService.update(this.id, {
      details: this.details,
      date: fullDate,
      endDate: fullEndDate,
      time: this.time,
      phone: this.phone,
      persons: this.persons,
      status: this.status
    }).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => alert(err?.error?.message || 'Erreur update')
    });
  }
}
