import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService, Jogo, Aposta } from '../../../services/game.service';

@Component({
  selector: 'app-score-modal',
  standalone: true,
  templateUrl: './score-modal.html',
  styleUrls: ['./score-modal.scss'],
  imports: [CommonModule, FormsModule]
})
export class ScoreModalComponent implements OnInit {
  @Input() jogo: Jogo | null = null;
  @Output() close = new EventEmitter<void>();

  placarCasa: number = 0;
  placarFora: number = 0;
  ganhadores: Aposta[] = [];
  showWinners = false;
  isLoading = false;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    if (this.jogo && this.jogo.finalizado) {
      this.placarCasa = this.jogo.placarCasa || 0;
      this.placarFora = this.jogo.placarFora || 0;
      this.showWinners = true;
      this.carregarGanhadores();
    }
  }

  inserirPlacar(): void {
    if (this.placarCasa < 0 || this.placarFora < 0) {
      alert('Os placares não podem ser negativos');
      return;
    }

    this.isLoading = true;
    
    // Simular processamento
    setTimeout(() => {
      if (this.jogo) {
        this.gameService.finalizarJogo(this.jogo.id, this.placarCasa, this.placarFora);
        this.carregarGanhadores();
        this.showWinners = true;
      }
      this.isLoading = false;
    }, 1000);
  }

  carregarGanhadores(): void {
    if (this.jogo) {
      this.ganhadores = this.gameService.getGanhadores(this.jogo.id);
    }
  }

  finalizarJogo(): void {
    if (confirm('Tem certeza que deseja finalizar este jogo? Esta ação não pode ser desfeita.')) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  calcularPremioPorGanhador(): number {
    if (this.ganhadores.length === 0) return 0;
    
    const stats = this.gameService.getEstatisticas(this.jogo?.id || '');
    return stats.valorPremio / this.ganhadores.length;
  }
}
