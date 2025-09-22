import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, Usuario } from '../../services/user.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.scss'],
  imports: [CommonModule, FormsModule]
})
export class UserLoginComponent {
  nomeUsuario: string = '';
  senha: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showRegisterForm = false;

  // Dados do formulário de cadastro
  registerData = {
    nome: '',
    nomeUsuario: '',
    email: '',
    telefone: '',
    chavePix: '',
    senha: '',
    confirmarSenha: ''
  };

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    // Simular validação de login
    setTimeout(() => {
      const usuarios = this.userService['usuariosSubject'].value;
      const usuario = usuarios.find((u: Usuario) => u.nomeUsuario.toLowerCase() === this.nomeUsuario.toLowerCase());

      if (!usuario) {
        this.errorMessage = 'Usuário não encontrado';
      } else if (usuario.bloqueado) {
        this.errorMessage = `Usuário bloqueado. Motivo: ${usuario.motivoBloqueio}`;
      } else if (this.senha !== '123456') { // Senha padrão para demonstração
        this.errorMessage = 'Senha incorreta';
      } else {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('currentUserId', usuario.id);
        localStorage.setItem('currentUserName', usuario.nomeUsuario); // Usar nomeUsuario
        localStorage.setItem('currentUserEmail', usuario.email);
        this.router.navigate(['/home']);
      }
      
      this.isLoading = false;
    }, 1000);
  }

  onRegister() {
    if (this.registerData.senha !== this.registerData.confirmarSenha) {
      this.errorMessage = 'As senhas não coincidem';
      return;
    }

    if (!this.registerData.nome || !this.registerData.nomeUsuario || !this.registerData.email || !this.registerData.telefone || !this.registerData.chavePix) {
      this.errorMessage = 'Todos os campos são obrigatórios';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Criar usuário
    setTimeout(() => {
      const resultado = this.userService.criarUsuario({
        nome: this.registerData.nome,
        nomeUsuario: this.registerData.nomeUsuario,
        email: this.registerData.email,
        telefone: this.registerData.telefone,
        chavePix: this.registerData.chavePix
      });

      if (resultado.success) {
        // Fazer login automático
        localStorage.setItem('userLoggedIn', 'true');
        const usuarios = this.userService['usuariosSubject'].value;
        const novoUsuario = usuarios[usuarios.length - 1];
        localStorage.setItem('currentUserId', novoUsuario.id);
        localStorage.setItem('currentUserName', novoUsuario.nomeUsuario); // Usar nomeUsuario
        localStorage.setItem('currentUserEmail', novoUsuario.email);

        this.isLoading = false;
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = resultado.message;
        this.isLoading = false;
      }
    }, 1000);
  }

  toggleRegisterForm() {
    this.showRegisterForm = !this.showRegisterForm;
    this.errorMessage = '';
    this.registerData = {
      nome: '',
      nomeUsuario: '',
      email: '',
      telefone: '',
      chavePix: '',
      senha: '',
      confirmarSenha: ''
    };
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}
