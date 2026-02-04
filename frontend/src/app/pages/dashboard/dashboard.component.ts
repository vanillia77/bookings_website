import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType, Chart } from 'chart.js';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { StatsService } from '../../services/stats.service';
import { registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  // Stats - Renamed as requested
  totalReservations = 0;
  pendingCount = 0;
  confirmedCount = 0;
  cancelledCount = 0;

  // Chart Config
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

  // Calendar Config
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    eventColor: '#8d6e63', // Default Nude/Terracotta color
    events: []
  };

  // Filters
  startDate: string | null = null;
  endDate: string | null = null;
  status: string = 'all';

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadCalendar();
  }

  applyFilters() {
    const filters: any = {};
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;
    if (this.status && this.status !== 'all') filters.status = this.status;

    this.loadStats(filters);
    this.loadCalendar(filters);
  }

  loadStats(filters: any = {}) {
    this.statsService.getSummary(filters).subscribe({
      next: (data) => {
        this.totalReservations = data.totalReservations;

        // Calculate KPIs - Mapped to new variable names
        this.pendingCount = data.reservationsByStatus.find((s: any) => s.status === 'pending')?.count || 0;
        this.confirmedCount = data.reservationsByStatus.find((s: any) => s.status === 'confirmed')?.count || 0;
        this.cancelledCount = data.reservationsByStatus.find((s: any) => s.status === 'cancelled')?.count || 0;

        // Update Chart
        const labels = data.reservationsByStatus.map((s: any) => s.status);
        const counts = data.reservationsByStatus.map((s: any) => s.count);

        this.barChartData = {
          labels: labels,
          datasets: [
            {
              data: counts,
              label: 'Reservations by Status',
              backgroundColor: [
                '#81c784', // Muted green for confirmed
                '#ffd54f', // Muted yellow for pending
                '#e57373'  // Muted red for cancelled
              ]
            }
          ]
        };
      },
      error: (err) => console.error('Failed to load stats', err)
    });
  }

  loadCalendar(filters: any = {}) {
    this.statsService.getCalendarEvents(filters).subscribe({
      next: (events) => {
        this.calendarOptions.events = events;
      },
      error: (err) => console.error('Failed to load calendar events', err)
    });
  }
}
