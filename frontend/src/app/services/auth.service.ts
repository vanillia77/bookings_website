import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

type LoginResponse = {
  token: string;
  user: { id: number; fullName: string; email: string; role: 'User' | 'Admin' };
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  register(fullName: string, email: string, password: string, role: 'User' | 'Admin' = 'User') {
    return this.http.post<any>(`${this.apiUrl}/register`, { fullName, email, password, role })
      .pipe(tap(res => this.saveAuth(res)));
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.saveAuth(res)));
  }

  saveAuth(res: any) {
    if (res?.token) localStorage.setItem('token', res.token);
    if (res?.user) localStorage.setItem('user', JSON.stringify(res.user));
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
}

