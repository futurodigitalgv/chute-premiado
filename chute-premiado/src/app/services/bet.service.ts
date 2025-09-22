import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Aposta {
  id: string;
  usuarioId: string;
  jogoId: string;
  placarCasa: number;
  placarFora: number;
  valorAposta: number;
  dataAposta: Date;
  status: 'ativa' | 'ganhou' | 'perdeu' | 'cancelada';
}

@Injectable({
  providedIn: 'root'
})
export class BetService {
  private apostasSubject = new BehaviorSubject<Aposta[]>([]);
  public apostas$ = this.apostasSubject.asObservable();

  constructor() {
    this.loadApostasFromStorage();
  }

  private loadApostasFromStorage(): void {
    const stored = localStorage.getItem('apostas');
    if (stored) {
      try {
        const apostas = JSON.parse(stored).map((aposta: any) => ({
          ...aposta,
          dataAposta: new Date(aposta.dataAposta)
        }));
        this.apostasSubject.next(apostas);
      } catch (error) {
        console.error('Erro ao carregar apostas do localStorage:', error);
        this.apostasSubject.next([]);
      }
    }
  }

  private saveApostasToStorage(apostas: Aposta[]): void {
    localStorage.setItem('apostas', JSON.stringify(apostas));
  }

  getApostas(): Observable<Aposta[]> {
    return this.apostas$;
  }

  getApostasPorUsuario(usuarioId: string): Observable<Aposta[]> {
    return new Observable(observer => {
      this.apostas$.subscribe(apostas => {
        const apostasUsuario = apostas.filter(aposta => aposta.usuarioId === usuarioId);
        observer.next(apostasUsuario);
      });
    });
  }

  getApostasPorJogo(jogoId: string): Observable<Aposta[]> {
    return new Observable(observer => {
      this.apostas$.subscribe(apostas => {
        const apostasJogo = apostas.filter(aposta => aposta.jogoId === jogoId);
        observer.next(apostasJogo);
      });
    });
  }

  adicionarAposta(aposta: Aposta): void {
    const apostasAtuais = this.apostasSubject.value;
    const novasApostas = [...apostasAtuais, aposta];
    this.apostasSubject.next(novasApostas);
    this.saveApostasToStorage(novasApostas);
  }

  atualizarStatusAposta(apostaId: string, status: 'ativa' | 'ganhou' | 'perdeu' | 'cancelada'): void {
    const apostasAtuais = this.apostasSubject.value;
    const apostasAtualizadas = apostasAtuais.map(aposta => 
      aposta.id === apostaId ? { ...aposta, status } : aposta
    );
    this.apostasSubject.next(apostasAtualizadas);
    this.saveApostasToStorage(apostasAtualizadas);
  }

  getEstatisticasApostas(usuarioId: string): {
    totalApostas: number;
    apostasGanhas: number;
    apostasPerdidas: number;
    valorTotalApostado: number;
    valorTotalGanho: number;
  } {
    const apostas = this.apostasSubject.value.filter(aposta => aposta.usuarioId === usuarioId);
    
    return {
      totalApostas: apostas.length,
      apostasGanhas: apostas.filter(a => a.status === 'ganhou').length,
      apostasPerdidas: apostas.filter(a => a.status === 'perdeu').length,
      valorTotalApostado: apostas.reduce((sum, a) => sum + a.valorAposta, 0),
      valorTotalGanho: apostas.filter(a => a.status === 'ganhou').reduce((sum, a) => sum + a.valorAposta, 0)
    };
  }
}
