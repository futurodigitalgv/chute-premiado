import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService, TransacaoCredito } from '../../../services/user.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  templateUrl: './finance.html',
  styleUrls: ['./finance.scss'],
  imports: [CommonModule]
})
export class FinanceComponent implements OnInit, OnDestroy {
  estatisticas: any = {};
  transacoes: TransacaoCredito[] = [];
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.userService.getEstatisticasFinanceiras();
    this.userService.getTransacoes()
      .pipe(takeUntil(this.destroy$))
      .subscribe(transacoes => {
        this.transacoes = transacoes;
        this.estatisticas = this.userService.getEstatisticasFinanceiras();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getTipoTransacaoClass(tipo: string): string {
    switch (tipo) {
      case 'compra': return 'tipo-compra';
      case 'aposta': return 'tipo-aposta';
      case 'ganho': return 'tipo-ganho';
      case 'reembolso': return 'tipo-reembolso';
      default: return '';
    }
  }

  getTipoTransacaoText(tipo: string): string {
    switch (tipo) {
      case 'compra': return 'Compra de Créditos';
      case 'aposta': return 'Aposta Realizada';
      case 'ganho': return 'Ganho de Aposta';
      case 'reembolso': return 'Reembolso';
      default: return tipo;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'aprovado': return 'status-aprovado';
      case 'pendente': return 'status-pendente';
      case 'rejeitado': return 'status-rejeitado';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'pendente': return 'Pendente';
      case 'rejeitado': return 'Rejeitado';
      default: return status;
    }
  }

  getTransacoesRecentes(): TransacaoCredito[] {
    return this.transacoes
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 10);
  }

  getTransacoesPorTipo(tipo: string): TransacaoCredito[] {
    return this.transacoes.filter(t => t.tipo === tipo);
  }

  getTotalPorTipo(tipo: string): number {
    return this.getTransacoesPorTipo(tipo)
      .filter(t => t.status === 'aprovado')
      .reduce((sum, t) => sum + t.valor, 0);
  }

  getResumoFinanceiro(): {
    receitaTotal: number;
    despesaTotal: number;
    lucroLiquido: number;
    margemLucro: number;
  } {
    const receitaTotal = this.getTotalPorTipo('compra');
    const despesaTotal = this.getTotalPorTipo('ganho') + this.getTotalPorTipo('reembolso');
    const lucroLiquido = receitaTotal - despesaTotal;
    const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    return {
      receitaTotal,
      despesaTotal,
      lucroLiquido,
      margemLucro
    };
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
