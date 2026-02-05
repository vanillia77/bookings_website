import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  onSubmit() {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Veuillez saisir votre email et mot de passe';
      return;
    }

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        this.error = err?.error?.message || `Erreur de connexion (${err.status})`;
      }
    });
  }

  testConnection() {
    this.auth.testConnection().subscribe({
      next: (res: any) => alert('Backend OK: ' + res.message),
      error: (err: any) => alert('Backend Erreur (' + err.status + '): ' + (err.error?.message || 'Inaccessible'))
    });
  }
}
