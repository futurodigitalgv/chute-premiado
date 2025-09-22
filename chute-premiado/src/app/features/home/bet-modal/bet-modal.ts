import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, Usuario } from '../../../services/user.service';
import { GameService, Jogo } from '../../../services/game.service';
import { BetService, Aposta } from '../../../services/bet.service';

@Component({
  selector: 'app-bet-modal',
  standalone: true,
  templateUrl: './bet-modal.html',
  styleUrls: ['./bet-modal.scss'],
  imports: [CommonModule, FormsModule]
})
export class BetModalComponent implements OnInit {
  @Input() jogo: Jogo | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() betPlaced = new EventEmitter<Aposta>();

  usuario: Usuario | null = null;
  placarCasa: number = 0;
  placarFora: number = 0;
  valorAposta: number = 10;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private gameService: GameService,
    private betService: BetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('BetModalComponent inicializado');
    console.log('isVisible:', this.isVisible);
    console.log('jogo:', this.jogo);
    this.loadUserData();
  }

  loadUserData(): void {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      this.userService.getUsuarios().subscribe(usuarios => {
        this.usuario = usuarios.find(u => u.id === userId) || null;
      });
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  resetForm(): void {
    this.placarCasa = 0;
    this.placarFora = 0;
    this.valorAposta = 10;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.usuario || !this.jogo) {
      this.errorMessage = 'Erro: usuário ou jogo não encontrado';
      return;
    }

    if (this.placarCasa < 0 || this.placarFora < 0) {
      this.errorMessage = 'Os placares não podem ser negativos';
      return;
    }

    if (this.valorAposta <= 0) {
      this.errorMessage = 'O valor da aposta deve ser maior que zero';
      return;
    }

    if (this.usuario.creditos < this.valorAposta) {
      this.errorMessage = 'Créditos insuficientes';
      return;
    }

    this.isLoading = true;

    // Simular processamento da aposta
    setTimeout(() => {
      const novaAposta: Aposta = {
        id: `aposta_${Date.now()}`,
        usuarioId: this.usuario!.id,
        jogoId: this.jogo!.id,
        placarCasa: this.placarCasa,
        placarFora: this.placarFora,
        valorAposta: this.valorAposta,
        dataAposta: new Date(),
        status: 'ativa'
      };

      // Deduzir créditos do usuário
      this.userService.adicionarCredito(this.usuario!.id, -this.valorAposta, 'compra', `Aposta no jogo ${this.jogo!.casaNome} x ${this.jogo!.foraNome}`);

      // Salvar aposta no serviço
      this.betService.adicionarAposta(novaAposta);

      // Emitir evento da aposta
      this.betPlaced.emit(novaAposta);

      this.isLoading = false;
      this.onClose();
    }, 1000);
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
}
