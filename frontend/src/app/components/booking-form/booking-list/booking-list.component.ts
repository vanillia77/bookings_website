import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html'
})
export class BookingListComponent implements OnInit, OnChanges {
  @Input() refreshKey = 0;

  bookings: any[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey'] && !changes['refreshKey'].firstChange) {
      this.load();
    }
  }

  load() {
    this.bookingService.getAll().subscribe({
      next: (rows) => this.bookings = rows || [],
      error: (err) => alert(err?.error?.message || 'Erreur chargement')
    });
  }

  isAdmin() {
    return this.bookings?.length > 0 && !!this.bookings[0]?.user_email;
  }

  delete(id: number) {
    if (!confirm('Delete booking ?')) return;
    this.bookingService.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err?.error?.message || 'Erreur delete')
    });
  }

  confirmBooking(b: any) {
    this.bookingService.confirm(b.id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err?.error?.message || 'Erreur confirm')
    });
  }

  badgeStyle(status: string) {
    return {
      padding: '3px 8px',
      borderRadius: '12px',
      display: 'inline-block',
      color: '#000',
      background: status === 'confirmed' ? '#86efac' : '#fde047'
    };
  }
}
