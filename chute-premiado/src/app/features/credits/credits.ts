import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService, Usuario } from '../../services/user.service';
import { PaymentService, PaymentRequest, PaymentResponse } from '../../services/payment.service';

@Component({
  selector: 'app-credits',
  standalone: true,
  templateUrl: './credits.html',
  styleUrls: ['./credits.scss'],
  imports: [CommonModule, FormsModule]
})
export class CreditsComponent implements OnInit, OnDestroy {
  usuario: Usuario | null = null;
  valorCompra: number = 0;
  creditosCompra: number = 0;
  isLoading: boolean = false;
  showPaymentModal: boolean = false;
  showPixModal: boolean = false;
  currentPayment: PaymentResponse | null = null;
  paymentMethod: 'checkout' | 'pix' = 'checkout';
  private destroy$ = new Subject<void>();

  // Opções pré-definidas de compra
  opcoesCompra = [
    { valor: 10, creditos: 10, label: 'R$ 10,00' },
    { valor: 25, creditos: 25, label: 'R$ 25,00' },
    { valor: 50, creditos: 50, label: 'R$ 50,00' },
    { valor: 100, creditos: 100, label: 'R$ 100,00' },
    { valor: 200, creditos: 200, label: 'R$ 200,00' },
    { valor: 500, creditos: 500, label: 'R$ 500,00' }
  ];

  constructor(
    private userService: UserService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar se está logado
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // Verificar status de pagamento via URL
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['status'] === 'success') {
          this.handlePaymentSuccess();
        } else if (params['status'] === 'failure') {
          this.handlePaymentFailure();
        } else if (params['status'] === 'pending') {
          this.handlePaymentPending();
        }
      });

    this.userService.getUsuarios()
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuarios => {
        this.usuario = usuarios.find(u => u.id === userId) || null;
        if (!this.usuario) {
          this.router.navigate(['/login']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectOption(opcao: any): void {
    this.valorCompra = opcao.valor;
    this.creditosCompra = opcao.creditos;
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

  iniciarCompra(): void {
    if (this.valorCompra <= 0) {
      alert('Selecione um valor para compra');
      return;
    }

    this.showPaymentModal = true;
  }

  selecionarMetodoPagamento(metodo: 'checkout' | 'pix'): void {
    this.paymentMethod = metodo;
  }

  processarPagamento(): void {
    if (!this.usuario) return;

    this.isLoading = true;

    const paymentRequest: PaymentRequest = {
      amount: this.valorCompra,
      description: `Compra de ${this.creditosCompra} créditos - Chute Premiado`,
      userId: this.usuario.id,
      credits: this.creditosCompra
    };

    if (this.paymentMethod === 'pix') {
      this.processarPixPayment(paymentRequest);
    } else {
      this.processarCheckoutPayment(paymentRequest);
    }
  }

  private processarCheckoutPayment(paymentRequest: PaymentRequest): void {
    // Em modo de teste, usar simulação
    this.paymentService.simulatePayment(paymentRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentPayment = response;
          
          if (response.status === 'approved') {
            // Redirecionar para o checkout do Mercado Pago (simulado)
            window.open(response.payment_url, '_blank');
            
            // Simular aprovação após 3 segundos
            setTimeout(() => {
              this.finalizarPagamento(response.id);
            }, 3000);
          } else {
            alert('Pagamento rejeitado. Tente novamente.');
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Erro no pagamento:', error);
          alert('Erro ao processar pagamento. Tente novamente.');
          this.isLoading = false;
        }
      });
  }

  private processarPixPayment(paymentRequest: PaymentRequest): void {
    this.paymentService.simulatePayment(paymentRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.currentPayment = response;
          
          if (response.status === 'approved') {
            this.showPaymentModal = false;
            this.showPixModal = true;
            
            // Simular aprovação após 5 segundos
            setTimeout(() => {
              this.finalizarPagamento(response.id);
            }, 5000);
          } else {
            alert('Pagamento rejeitado. Tente novamente.');
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Erro no pagamento PIX:', error);
          alert('Erro ao processar pagamento PIX. Tente novamente.');
          this.isLoading = false;
        }
      });
  }

  private finalizarPagamento(paymentId: string): void {
    if (!this.usuario) return;

    // Adicionar créditos ao usuário
    this.userService.adicionarCredito(
      this.usuario.id,
      this.valorCompra,
      'compra',
      `Compra de ${this.creditosCompra} créditos`,
      paymentId
    );

    alert(`Pagamento aprovado! ${this.creditosCompra} créditos foram adicionados à sua conta.`);
    this.limparCompra();
  }

  private handlePaymentSuccess(): void {
    alert('Pagamento aprovado! Seus créditos foram adicionados à sua conta.');
    this.limparCompra();
  }

  private handlePaymentFailure(): void {
    alert('Pagamento rejeitado. Tente novamente.');
    this.limparCompra();
  }

  private handlePaymentPending(): void {
    alert('Pagamento pendente. Aguarde a confirmação.');
    this.limparCompra();
  }

  private limparCompra(): void {
    this.showPaymentModal = false;
    this.showPixModal = false;
    this.currentPayment = null;
    this.valorCompra = 0;
    this.creditosCompra = 0;
    this.isLoading = false;
  }

  cancelarCompra(): void {
    this.limparCompra();
  }

  fecharPixModal(): void {
    this.showPixModal = false;
    this.limparCompra();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getTransacoesRecentes(): any[] {
    if (!this.usuario) return [];
    
    return this.userService.getTransacoesPorUsuario(this.usuario!.id)
      .filter(t => t.tipo === 'compra')
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }
}
