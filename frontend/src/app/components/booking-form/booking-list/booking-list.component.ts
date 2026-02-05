import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-booking-list',
  templateUrl: './booking-list.component.html'
})
export class BookingListComponent implements OnInit, OnChanges {
  @Input() refreshKey = 0;

  bookings: any[] = [];

  constructor(
    private bookingService: BookingService
  ) { }

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
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'Admin';
    } catch {
      return false;
    }
  }

  delete(id: number) {
    if (!confirm('Supprimer cette réservation ?')) return;
    this.bookingService.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err?.error?.message || 'Erreur suppression')
    });
  }

  confirmBooking(b: any) {
    this.bookingService.confirm(b.id).subscribe({
      next: () => this.load(),
      error: (err) => alert(err?.error?.message || 'Erreur confirmation')
    });
  }

  badgeStyle(status: string) {
    let bg = '#eee';
    let color = '#444';

    if (status === 'confirmed') {
      bg = '#e8f5e9'; // Light Green
      color = '#2e7d32'; // Dark Green
    } else if (status === 'pending') {
      bg = '#fff8e1'; // Light Amber
      color = '#f57c00'; // Dark Orange
    } else if (status === 'cancelled') {
      bg = '#ffebee'; // Light Red
      color = '#c62828'; // Dark Red
    }

    return {
      padding: '6px 14px',
      borderRadius: '20px',
      display: 'inline-block',
      color: color,
      background: bg,
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    };
  }

  formatTime(b: any) {
    if (b.time) return b.time;
    if (b.date && b.date.includes('T')) {
      const t = b.date.split('T')[1];
      return t.substring(0, 5);
    }
    return '-';
  }
}
