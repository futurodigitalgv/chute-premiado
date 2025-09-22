import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss'],
  imports: [FormsModule, CommonModule]
})
export class AdminLoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  onSubmit() {
    console.log('Tentativa de login:', this.username, this.password);
    this.isLoading = true;
    this.errorMessage = '';

    // Simular validação
    setTimeout(() => {
      console.log('Validando credenciais...');
      if (this.username === 'Davysam' && this.password === 'Davy1009+') {
        console.log('Login aprovado, redirecionando...');
        localStorage.setItem('adminLoggedIn', 'true');
        this.router.navigate(['/admin/dashboard']).then(() => {
          console.log('Navegação concluída');
        }).catch(err => {
          console.error('Erro na navegação:', err);
        });
      } else {
        console.log('Credenciais inválidas');
        this.errorMessage = 'Usuário ou senha incorretos';
      }
      this.isLoading = false;
    }, 1000);
  }
}
