import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) { }

  onSubmit() {
    console.log('[DEBUG] Register onSubmit called');
    this.error = '';
    this.loading = true;

    if (!this.fullName || !this.email || !this.password) {
      console.warn('[DEBUG] Validation failed: missing fields', { fullName: this.fullName, email: this.email });
      this.error = 'Veuillez remplir tous les champs';
      this.loading = false;
      return;
    }

    console.log('[DEBUG] Calling auth.register...', { fullName: this.fullName, email: this.email });
    this.auth.register(this.fullName, this.email, this.password).subscribe({
      next: (res) => {
        console.log('[DEBUG] Registration success:', res);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('[DEBUG] Registration error:', err);
        if (err.status === 0) {
          this.error = "Impossible de contacter le serveur. Vérifiez que le backend est lancé.";
        } else {
          this.error = err?.error?.message || `Erreur d'inscription (${err.status})`;
        }
      }
    });
  }
}
