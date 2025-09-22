import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService, Usuario } from '../../../services/user.service';

@Component({
  selector: 'app-players',
  standalone: true,
  templateUrl: './players.html',
  styleUrls: ['./players.scss'],
  imports: [CommonModule, FormsModule]
})
export class PlayersComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  private destroy$ = new Subject<void>();
  
  selectedUsuario: Usuario | null = null;
  showBlockModal = false;
  showDeleteModal = false;
  motivoBloqueio = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getUsuarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuarios => {
        this.usuarios = usuarios;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectUsuario(usuario: Usuario): void {
    this.selectedUsuario = usuario;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date | undefined | null): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getStatusClass(usuario: Usuario): string {
    return usuario.bloqueado ? 'status-blocked' : 'status-active';
  }

  getStatusText(usuario: Usuario): string {
    return usuario.bloqueado ? 'Bloqueado' : 'Ativo';
  }

  openBlockModal(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.motivoBloqueio = usuario.motivoBloqueio || '';
    this.showBlockModal = true;
  }

  openDeleteModal(usuario: Usuario): void {
    this.selectedUsuario = usuario;
    this.showDeleteModal = true;
  }

  blockUsuario(): void {
    if (this.selectedUsuario && this.motivoBloqueio.trim()) {
      this.userService.bloquearUsuario(this.selectedUsuario.id, this.motivoBloqueio);
      this.closeModals();
    }
  }

  unblockUsuario(usuario: Usuario): void {
    this.userService.desbloquearUsuario(usuario.id);
  }

  deleteUsuario(): void {
    if (this.selectedUsuario) {
      this.userService.excluirUsuario(this.selectedUsuario.id);
      this.closeModals();
    }
  }

  closeModals(): void {
    this.showBlockModal = false;
    this.showDeleteModal = false;
    this.selectedUsuario = null;
    this.motivoBloqueio = '';
  }

  getEstatisticasUsuario(usuario: Usuario): {
    totalGanho: number;
    totalGasto: number;
    saldo: number;
    taxaVitoria: number;
  } {
    const totalGanho = usuario.creditosGanhos;
    const totalGasto = usuario.creditosGastos;
    const saldo = usuario.creditos;
    const taxaVitoria = usuario.totalApostas > 0 ? (usuario.apostasVencedoras / usuario.totalApostas) * 100 : 0;

    return {
      totalGanho,
      totalGasto,
      saldo,
      taxaVitoria
    };
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  getDataBloqueioFormatada(): string {
    if (!this.selectedUsuario?.dataBloqueio) return '';
    return this.formatDate(this.selectedUsuario.dataBloqueio);
  }
}
