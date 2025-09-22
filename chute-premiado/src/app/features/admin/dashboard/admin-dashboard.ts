import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GameService, Jogo } from '../../../services/game.service';
import { GameFormComponent } from '../game-form/game-form';
import { StatsModalComponent } from '../stats-modal/stats-modal';
import { ScoreModalComponent } from '../score-modal/score-modal';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
  imports: [CommonModule, GameFormComponent, StatsModalComponent, ScoreModalComponent]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  jogos: Jogo[] = [];
  private destroy$ = new Subject<void>();
  showCreateForm = false;
  editingJogo: Jogo | null = null;
  selectedJogoForStats: Jogo | null = null;
  selectedJogoForScore: Jogo | null = null;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se está logado
    if (!localStorage.getItem('adminLoggedIn')) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.gameService.getJogos()
      .pipe(takeUntil(this.destroy$))
      .subscribe(jogos => {
        this.jogos = jogos;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    localStorage.removeItem('adminLoggedIn');
    this.router.navigate(['/admin/login']);
  }

  goToPlayers(): void {
    this.router.navigate(['/admin/players']);
  }

  goToFinance(): void {
    this.router.navigate(['/admin/finance']);
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.editingJogo = null;
  }

  editJogo(jogo: Jogo): void {
    this.editingJogo = jogo;
    this.showCreateForm = true;
  }

  deleteJogo(jogo: Jogo): void {
    if (confirm(`Tem certeza que deseja excluir o jogo ${jogo.casaNome} x ${jogo.foraNome}?`)) {
      this.gameService.excluirJogo(jogo.id);
    }
  }

  onFormClose(): void {
    this.showCreateForm = false;
    this.editingJogo = null;
  }

  canBet(jogo: Jogo): boolean {
    return new Date() < jogo.horarioEncerramento;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  getStatus(jogo: Jogo): string {
    if (jogo.finalizado) return 'Finalizado';
    if (!this.canBet(jogo)) return 'Apostas Encerradas';
    return 'Apostas Abertas';
  }

  getStatusClass(jogo: Jogo): string {
    if (jogo.finalizado) return 'status-finalizado';
    if (!this.canBet(jogo)) return 'status-encerrado';
    return 'status-aberto';
  }

  showStats(jogo: Jogo): void {
    this.selectedJogoForStats = jogo;
  }

  closeStatsModal(): void {
    this.selectedJogoForStats = null;
  }

  showScoreModal(jogo: Jogo): void {
    this.selectedJogoForScore = jogo;
  }

  closeScoreModal(): void {
    this.selectedJogoForScore = null;
  }
}
