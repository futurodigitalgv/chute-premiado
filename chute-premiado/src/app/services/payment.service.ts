import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface PaymentRequest {
  amount: number;
  description: string;
  userId: string;
  credits: number;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_url?: string;
  qr_code?: string;
  qr_code_base64?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  amount: number;
  description: string;
  date_created: string;
  date_approved?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // Chaves de teste do Mercado Pago
  private readonly TEST_ACCESS_TOKEN = 'TEST-1234567890-abcdef-1234567890abcdef-12345678';
  private readonly TEST_PUBLIC_KEY = 'TEST-12345678-1234-1234-1234-123456789012';
  
  // URLs da API do Mercado Pago
  private readonly BASE_URL = 'https://api.mercadopago.com';
  private readonly PAYMENTS_URL = `${this.BASE_URL}/v1/payments`;
  private readonly PREFERENCE_URL = `${this.BASE_URL}/checkout/preferences`;
  
  private paymentStatusSubject = new BehaviorSubject<PaymentStatus[]>([]);
  public paymentStatus$ = this.paymentStatusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Criar preferência de pagamento (Checkout Pro)
   */
  createPreference(paymentRequest: PaymentRequest): Observable<any> {
    const preference = {
      items: [
        {
          title: `Compra de ${paymentRequest.credits} créditos - Chute Premiado`,
          description: paymentRequest.description,
          quantity: 1,
          unit_price: paymentRequest.amount,
          currency_id: 'BRL'
        }
      ],
      payer: {
        email: 'test@example.com' // Em produção, usar email do usuário
      },
      back_urls: {
        success: `${window.location.origin}/credits?status=success`,
        failure: `${window.location.origin}/credits?status=failure`,
        pending: `${window.location.origin}/credits?status=pending`
      },
      auto_return: 'approved',
      external_reference: paymentRequest.userId,
      notification_url: `${window.location.origin}/api/notifications`, // Webhook para notificações
      metadata: {
        user_id: paymentRequest.userId,
        credits: paymentRequest.credits.toString()
      }
    };

    return this.http.post(this.PREFERENCE_URL, preference, {
      headers: {
        'Authorization': `Bearer ${this.TEST_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Criar pagamento via PIX (QR Code)
   */
  createPixPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    const paymentData = {
      transaction_amount: paymentRequest.amount,
      description: paymentRequest.description,
      payment_method_id: 'pix',
      payer: {
        email: 'test@example.com'
      },
      external_reference: paymentRequest.userId,
      metadata: {
        user_id: paymentRequest.userId,
        credits: paymentRequest.credits.toString()
      }
    };

    return this.http.post<PaymentResponse>(this.PAYMENTS_URL, paymentData, {
      headers: {
        'Authorization': `Bearer ${this.TEST_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Verificar status do pagamento
   */
  getPaymentStatus(paymentId: string): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(`${this.PAYMENTS_URL}/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.TEST_ACCESS_TOKEN}`
      }
    });
  }

  /**
   * Simular pagamento para modo de teste
   */
  simulatePayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    // Simular delay da API
    return new Observable(observer => {
      setTimeout(() => {
        // Simular 90% de aprovação
        const isApproved = Math.random() > 0.1;
        
        const response: PaymentResponse = {
          id: `MP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: isApproved ? 'approved' : 'rejected',
          payment_url: isApproved ? `${window.location.origin}/credits?status=success` : undefined,
          qr_code: isApproved ? `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substr(2, 36)}520400005303986540${paymentRequest.amount.toFixed(2)}5802BR5913Chute Premiado6009Sao Paulo62070503***6304` : undefined,
          qr_code_base64: isApproved ? this.generateMockQRCode() : undefined
        };

        // Atualizar status local
        this.updatePaymentStatus({
          id: response.id,
          status: response.status,
          amount: paymentRequest.amount,
          description: paymentRequest.description,
          date_created: new Date().toISOString(),
          date_approved: response.status === 'approved' ? new Date().toISOString() : undefined
        });

        observer.next(response);
        observer.complete();
      }, 2000);
    });
  }

  /**
   * Atualizar status do pagamento localmente
   */
  private updatePaymentStatus(status: PaymentStatus): void {
    const currentStatuses = this.paymentStatusSubject.value;
    const existingIndex = currentStatuses.findIndex(p => p.id === status.id);
    
    if (existingIndex >= 0) {
      currentStatuses[existingIndex] = status;
    } else {
      currentStatuses.push(status);
    }
    
    this.paymentStatusSubject.next([...currentStatuses]);
  }

  /**
   * Gerar QR Code mock para teste
   */
  private generateMockQRCode(): string {
    // Simular QR Code em base64 (em produção seria gerado pelo Mercado Pago)
    const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    return mockQRCode;
  }

  /**
   * Verificar se o pagamento foi aprovado
   */
  isPaymentApproved(paymentId: string): boolean {
    const payment = this.paymentStatusSubject.value.find(p => p.id === paymentId);
    return payment?.status === 'approved';
  }

  /**
   * Obter histórico de pagamentos
   */
  getPaymentHistory(): PaymentStatus[] {
    return this.paymentStatusSubject.value;
  }

  /**
   * Limpar histórico de pagamentos (para teste)
   */
  clearPaymentHistory(): void {
    this.paymentStatusSubject.next([]);
  }
}
