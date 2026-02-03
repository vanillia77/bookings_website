import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StatsSummary {
    totalReservations: number;
    reservationsByStatus: { status: string, count: number }[];
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    backgroundColor: string;
}

@Injectable({
    providedIn: 'root'
})
export class StatsService {
    private apiUrl = 'http://localhost:3000/api/stats';

    constructor(private http: HttpClient) { }

    getSummary(filters?: any): Observable<StatsSummary> {
        return this.http.get<StatsSummary>(`${this.apiUrl}/summary`, { params: filters });
    }

    getCalendarEvents(filters?: any): Observable<CalendarEvent[]> {
        return this.http.get<any[]>(`${this.apiUrl}/calendar`, { params: filters }).pipe(
            map(events => events.map(e => ({
                ...e,
                id: String(e.id)
            })))
        );
    }
}
