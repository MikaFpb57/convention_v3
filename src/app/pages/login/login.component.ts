import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import pkg from '../../../../package.json';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string | null = null;
  centeredAlertMessage: string | null = null;
  isLoading: boolean = false;
  appVersion: string = pkg.version;

  // Inscription
  isRegisterMode = false;
  registerNom = '';
  registerPrenom = '';
  registerEmail = '';
  registerFonction = '';
  registerPassword = '';
  registerPasswordConfirm = '';
  registerError: string | null = null;
  isRegistering = false;
  private readonly PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{14,}$/;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'account_disabled') {
        this.errorMessage = 'Compte désactivé. Contactez votre administrateur.';
        this.centeredAlertMessage = 'Compte désactivé. Contactez votre administrateur.';
        this.successMessage = null;
      } else if (params['reason'] === 'password_changed') {
        this.errorMessage = '';
        this.successMessage = 'Mot de passe modifié avec succès ! Vous pouvez vous reconnecter.';
        this.centeredAlertMessage = null;
      }
    });
  }

  login() {
    this.isLoading = true;
    this.successMessage = null;
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        const token = response.token;
        // Décoder le token pour récupérer le rôle
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userRole = tokenPayload.role;

        this.authService.setToken(token, this.username, userRole);
        this.router.navigate(['/gestion']);
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    );
  }

  getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Le serveur est injoignable, veuillez vérifier votre connexion ou réessayer plus tard.';
    } else if (error.status >= 500) {
      return 'Erreur du serveur, veuillez réessayer plus tard.';
    } else if (error.status === 401) {
      return 'Identifiant ou mot de passe incorrect.';
    } else if (error.status === 403 && error.error?.error === 'account_disabled') {
      return 'Compte désactivé. Contactez votre administrateur.';
    } else {
      return `Erreur inattendue (${error.status}), veuillez réessayer.`;
    }
  }

  toggleRegisterMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.registerError = null;
    this.errorMessage = '';
    this.successMessage = null;
  }

  register() {
    this.registerError = null;

    if (!this.registerNom || !this.registerPrenom || !this.registerEmail || !this.registerPassword) {
      this.registerError = 'Merci de renseigner nom, prénom, email et mot de passe.';
      return;
    }

    if (this.registerPassword !== this.registerPasswordConfirm) {
      this.registerError = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.PASSWORD_REGEX.test(this.registerPassword)) {
      this.registerError = 'Le mot de passe doit contenir au moins 14 caractères, une lettre, un chiffre et un caractère spécial.';
      return;
    }

    this.isRegistering = true;
    this.authService.register({
      nom: this.registerNom,
      prenom: this.registerPrenom,
      email: this.registerEmail,
      fonction: this.registerFonction,
      password: this.registerPassword
    }).subscribe({
      next: (response) => {
        const token = response.token;
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.authService.setToken(token, this.registerEmail.trim().toLowerCase(), tokenPayload.role);
        this.isRegistering = false;
        this.router.navigate(['/gestion']);
      },
      error: (error) => {
        this.isRegistering = false;
        this.registerError = error?.error?.message || this.getErrorMessage(error);
      }
    });
  }
}
