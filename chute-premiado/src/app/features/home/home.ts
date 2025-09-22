import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GameService, Jogo } from '../../services/game.service';
import { UserService, Usuario } from '../../services/user.service';
import { BetService, Aposta } from '../../services/bet.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [CommonModule, DatePipe, FormsModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  jogos: Jogo[] = [];
  isLoggedIn: boolean = false;
  userName: string = '';
  userCredits: number = 0;
  currentUser: Usuario | null = null;
  showBetModal: boolean = false;
  selectedJogo: Jogo | null = null;
  placarCasa: number = 0;
  placarFora: number = 0;
  valorAposta: number = 10;
  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService, 
    private userService: UserService,
    private betService: BetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário está logado
    this.checkLoginStatus();

    this.gameService.getJogos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(jogos => {
        // Filtrar apenas jogos que ainda não foram finalizados e estão dentro do prazo
        this.jogos = jogos.filter(jogo => 
          !jogo.finalizado && 
          new Date() < jogo.horarioEncerramento
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/login']);
  }

  checkLoginStatus(): void {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    const userId = localStorage.getItem('currentUserId');
    const userName = localStorage.getItem('currentUserName') || '';
    
    this.isLoggedIn = isLoggedIn;
    this.userName = userName;
    
    if (isLoggedIn && userId) {
      // Buscar dados atualizados do usuário
      this.userService.getUsuarios()
        .pipe(takeUntil(this.destroy$))
        .subscribe(usuarios => {
          this.currentUser = usuarios.find(u => u.id === userId) || null;
          this.userCredits = this.currentUser?.creditos || 0;
        });
    }
  }

  logout(): void {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('currentUserEmail');
    
    this.isLoggedIn = false;
    this.userName = '';
    this.userCredits = 0;
    this.currentUser = null;
  }

  goToCredits(): void {
    this.router.navigate(['/credits']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  openBetModal(jogo: Jogo): void {
    console.log('Abrindo modal para:', jogo.casaNome, 'x', jogo.foraNome);
    
    if (!this.isLoggedIn) {
      this.goToLogin();
      return;
    }
    
    this.selectedJogo = jogo;
    this.showBetModal = true;
    console.log('Modal deve estar visível agora');
  }

  closeBetModal(): void {
    this.showBetModal = false;
    this.selectedJogo = null;
    this.placarCasa = 0;
    this.placarFora = 0;
    this.valorAposta = 10;
  }

  fazerAposta(): void {
    if (!this.selectedJogo) {
      alert('Erro: jogo não selecionado');
      return;
    }

    if (this.placarCasa < 0 || this.placarFora < 0) {
      alert('Os placares não podem ser negativos');
      return;
    }

    if (this.valorAposta <= 0) {
      alert('O valor da aposta deve ser maior que zero');
      return;
    }

    if (!this.currentUser || this.currentUser.creditos < this.valorAposta) {
      alert('Créditos insuficientes! Vá para a página de créditos.');
      this.goToCredits();
      return;
    }

    // Criar nova aposta
    const novaAposta: Aposta = {
      id: this.generateId(),
      usuarioId: this.currentUser.id,
      jogoId: this.selectedJogo.id,
      placarCasa: this.placarCasa,
      placarFora: this.placarFora,
      valorAposta: this.valorAposta,
      dataAposta: new Date(),
      status: 'ativa'
    };

    // Salvar aposta no serviço de apostas
    this.betService.adicionarAposta(novaAposta);
    
    // Salvar aposta no jogo (para estatísticas)
    this.gameService.adicionarAposta(this.selectedJogo.id, {
      nome: this.currentUser.nomeUsuario,
      telefone: this.currentUser.telefone,
      chavePix: this.currentUser.chavePix,
      placarCasa: this.placarCasa,
      placarFora: this.placarFora,
      valor: this.valorAposta,
      data: new Date()
    });
    
    // Deduzir créditos
    this.userService.adicionarCredito(this.currentUser.id, -this.valorAposta, 'compra', `Aposta no jogo ${this.selectedJogo.casaNome} x ${this.selectedJogo.foraNome}`);
    
    // Atualizar créditos do usuário atual
    this.currentUser.creditos -= this.valorAposta;
    this.userCredits = this.currentUser.creditos;
    
    alert(`Aposta realizada com sucesso!\nJogo: ${this.selectedJogo.casaNome} x ${this.selectedJogo.foraNome}\nPalpite: ${this.placarCasa} x ${this.placarFora}\nValor: R$ ${this.valorAposta}`);
    
    this.closeBetModal();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
