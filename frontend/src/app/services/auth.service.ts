import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

type Role = 'User' | 'Admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(fullName: string, email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/register`, { fullName, email, password })
      .pipe(tap(res => this.saveAuth(res)));
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.saveAuth(res)));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'Admin';
  }

  private saveAuth(res: any) {
    if (res?.token) localStorage.setItem('token', res.token);
    if (res?.user) localStorage.setItem('user', JSON.stringify(res.user));
  }
}
