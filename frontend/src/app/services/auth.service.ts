import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string; role: 'user' | 'admin' };
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.api}/login`, { email, password });
  }

  register(name: string, email: string, password: string, role: 'user' | 'admin' = 'user') {
    return this.http.post(`${this.api}/register`, { name, email, password, role });
  }

  saveSession(res: LoginResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
