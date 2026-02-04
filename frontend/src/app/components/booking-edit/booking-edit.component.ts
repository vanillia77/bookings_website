import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-edit',
  templateUrl: './booking-edit.component.html'
})
export class BookingEditComponent implements OnInit {
  id!: number;
  title = '';
  description = '';
  date = '';
  time = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    // إذا ماعندكش GET by id ف backend، خلي edit يعتمد على list فقط
  }

  save() {
    this.bookingService.update(this.id, {
      title: this.title,
      description: this.description,
      date: this.date,
      time: this.time
    }).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => alert(err?.error?.message || 'Erreur update')
    });
  }
}
