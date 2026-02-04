import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = 'http://localhost:3000/bookings';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  create(data: { title: string; description?: string; date: string; time: string }): Observable<any> {
    return this.http.post(this.api, data);
  }

  update(id: number, data: { title: string; description?: string; date: string; time: string }): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  confirm(id: number): Observable<any> {
    return this.http.patch(`${this.api}/${id}/confirm`, {});
  }
}
