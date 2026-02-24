import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType, Chart } from 'chart.js';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { StatsService } from '../../services/stats.service';
import { registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  totalReservations = 0;
  pendingCount = 0;
  confirmedCount = 0;
  cancelledCount = 0;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Reservations' }
    ]
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    eventColor: '#8d6e63',
    events: []
  };

  startDate: string | null = null;
  endDate: string | null = null;
  status: string = 'all';

  constructor(private statsService: StatsService) {
    if (Chart) {
      Chart.register(...registerables);
    }
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadCalendar();
  }

  applyFilters() {
    const filters: any = {};
    if (this.startDate) {
      filters.startDate = this.formatDate(this.startDate);
    }
    if (this.endDate) {
      filters.endDate = this.formatDate(this.endDate);
    }
    if (this.status && this.status !== 'all') filters.status = this.status;

    this.loadStats(filters);
    this.loadCalendar(filters);
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  loadStats(filters: any = {}) {
    this.statsService.getSummary(filters).subscribe({
      next: (data) => {
        this.totalReservations = data.totalReservations;

        this.pendingCount = data.reservationsByStatus.find((s: any) => s.status === 'pending')?.count || 0;
        this.confirmedCount = data.reservationsByStatus.find((s: any) => s.status === 'confirmed')?.count || 0;
        this.cancelledCount = data.reservationsByStatus.find((s: any) => s.status === 'cancelled')?.count || 0;

        const statusOrder = ['confirmed', 'pending', 'cancelled'];
        const counts = statusOrder.map(status => {
          const item = data.reservationsByStatus.find((s: any) => s.status === status);
          return item ? item.count : 0;
        });

        this.barChartData = {
          labels: ['Confirmé', 'En attente', 'Annulé'],
          datasets: [
            {
              data: counts,
              label: 'Réservations',
              backgroundColor: [
                '#81c784',
                '#ffd54f',
                '#e57373'
              ]
            }
          ]
        };
      },
      error: (err) => console.error(err)
    });
  }

  loadCalendar(filters: any = {}) {
    this.statsService.getCalendarEvents(filters).subscribe({
      next: (events) => {
        this.calendarOptions.events = events;
      },
      error: (err) => console.error(err)
    });
  }
}
