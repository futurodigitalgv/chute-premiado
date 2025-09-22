import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Jogo } from '../../../services/game.service';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  templateUrl: './stats-modal.html',
  styleUrls: ['./stats-modal.scss'],
  imports: [CommonModule]
})
export class StatsModalComponent implements OnInit {
  @Input() jogo: Jogo | null = null;
  @Output() close = new EventEmitter<void>();

  stats = {
    totalApostas: 0,
    valorTotal: 0,
    valorCasa: 0,
    valorPremio: 0,
    valorCasaTotal: 0
  };

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    if (this.jogo) {
      this.stats = this.gameService.getEstatisticas(this.jogo.id);
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
}
