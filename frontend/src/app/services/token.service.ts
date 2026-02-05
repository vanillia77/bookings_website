import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
    private TOKEN_KEY = 'token';
    private USER_KEY = 'user';

    save(token: string, user: any) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getUser(): any {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    clear() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
