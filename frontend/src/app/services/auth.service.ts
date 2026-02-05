import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';

type LoginResponse = {
  token: string;
  user: { id: number; fullName: string; email: string; role: 'User' | 'Admin' };
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api';

  constructor(private http: HttpClient, private tokenService: TokenService) { }

  register(fullName: string, email: string, password: string, role: 'User' | 'Admin' = 'User') {
    return this.http.post<any>(`${this.apiUrl}/register`, { fullName, email, password, role })
      .pipe(tap(res => this.saveAuth(res)));
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.saveAuth(res)));
  }

  saveAuth(res: any) {
    if (res?.token && res?.user) {
      this.tokenService.save(res.token, res.user);
    }
  }

  logout() {
    this.tokenService.clear();
  }

  isLoggedIn(): boolean {
    return this.tokenService.isLoggedIn();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  getUser(): any {
    return this.tokenService.getUser();
  }

  updateProfile(data: { fullName?: string, password?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data).pipe(
      tap(() => {
        if (data.fullName) {
          const user = this.getUser();
          if (user) {
            user.fullName = data.fullName;
            this.tokenService.save(this.getToken()!, user);
          }
        }
      })
    );
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'Admin';
  }

  testConnection() {
    return this.http.get<any>(`${this.apiUrl}/test`);
  }
}
