import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    fullName = '';
    email = '';
    password = '';
    message = '';
    error = '';

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        const user = this.authService.getUser();
        if (user) {
            this.fullName = user.fullName;
            this.email = user.email;
        }
    }

    updateProfile() {
        this.authService.updateProfile({
            fullName: this.fullName,
            password: this.password || undefined
        }).subscribe({
            next: (res: any) => {
                this.message = 'Profil mis à jour !';
                this.error = '';
                this.password = '';
            },
            error: (err: any) => {
                this.error = err?.error?.message || 'Erreur lors de la mise à jour';
                this.message = '';
            }
        });
    }
}
