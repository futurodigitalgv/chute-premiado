import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Jogo {
  id: string;
  casaNome: string;
  casaLogo: string;
  foraNome: string;
  foraLogo: string;
  data: Date;
  horarioEncerramento: Date;
  valorAposta: number;
  placarCasa?: number;
  placarFora?: number;
  finalizado: boolean;
  apostas: Aposta[];
}

export interface Aposta {
  id: string;
  nome: string;
  telefone: string;
  chavePix: string;
  placarCasa: number;
  placarFora: number;
  valor: number;
  data: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private jogosSubject = new BehaviorSubject<Jogo[]>([]);
  public jogos$ = this.jogosSubject.asObservable();

  constructor() {
    // Carregar dados do localStorage se existirem
    this.loadFromStorage();
    this.initializeTestData();
  }

  // Método para limpar dados e recriar (para debug)
  resetData(): void {
    localStorage.removeItem('jogos');
    this.jogosSubject.next([]);
    this.initializeTestData();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('jogos');
    if (stored) {
      const jogos = JSON.parse(stored).map((jogo: any) => ({
        ...jogo,
        data: new Date(jogo.data),
        horarioEncerramento: new Date(jogo.horarioEncerramento),
        apostas: jogo.apostas?.map((aposta: any) => ({
          ...aposta,
          data: new Date(aposta.data)
        })) || []
      }));
      this.jogosSubject.next(jogos);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('jogos', JSON.stringify(this.jogosSubject.value));
  }

  getJogos(): Observable<Jogo[]> {
    return this.jogos$;
  }

  criarJogo(jogo: Omit<Jogo, 'id' | 'apostas' | 'finalizado'>): void {
    const novoJogo: Jogo = {
      ...jogo,
      id: this.generateId(),
      apostas: [],
      finalizado: false
    };

    const jogos = [...this.jogosSubject.value, novoJogo];
    this.jogosSubject.next(jogos);
    this.saveToStorage();
  }

  editarJogo(id: string, jogo: Partial<Jogo>): void {
    const jogos = this.jogosSubject.value.map(j => 
      j.id === id ? { ...j, ...jogo } : j
    );
    this.jogosSubject.next(jogos);
    this.saveToStorage();
  }

  excluirJogo(id: string): void {
    const jogos = this.jogosSubject.value.filter(j => j.id !== id);
    this.jogosSubject.next(jogos);
    this.saveToStorage();
  }

  adicionarAposta(jogoId: string, aposta: Omit<Aposta, 'id'>): void {
    const jogos = this.jogosSubject.value.map(jogo => {
      if (jogo.id === jogoId) {
        const novaAposta: Aposta = {
          ...aposta,
          id: this.generateId()
        };
        return {
          ...jogo,
          apostas: [...jogo.apostas, novaAposta]
        };
      }
      return jogo;
    });
    this.jogosSubject.next(jogos);
    this.saveToStorage();
  }

  finalizarJogo(id: string, placarCasa: number, placarFora: number): void {
    const jogos = this.jogosSubject.value.map(jogo => {
      if (jogo.id === id) {
        return {
          ...jogo,
          placarCasa,
          placarFora,
          finalizado: true
        };
      }
      return jogo;
    });
    this.jogosSubject.next(jogos);
    this.saveToStorage();
  }

  getGanhadores(jogoId: string): Aposta[] {
    const jogo = this.jogosSubject.value.find(j => j.id === jogoId);
    if (!jogo || !jogo.finalizado) return [];

    return jogo.apostas.filter(aposta => 
      aposta.placarCasa === jogo.placarCasa && 
      aposta.placarFora === jogo.placarFora
    );
  }

  getEstatisticas(jogoId: string): {
    totalApostas: number;
    valorTotal: number;
    valorCasa: number;
    valorPremio: number;
    valorCasaTotal: number; // Valor total que fica com a casa (10% + valor quando não há ganhadores)
  } {
    const jogo = this.jogosSubject.value.find(j => j.id === jogoId);
    if (!jogo) return { totalApostas: 0, valorTotal: 0, valorCasa: 0, valorPremio: 0, valorCasaTotal: 0 };

    const valorTotal = jogo.apostas.reduce((sum, aposta) => sum + aposta.valor, 0);
    const valorCasa = valorTotal * 0.1; // 10% da casa
    const valorPremio = valorTotal - valorCasa;
    
    // Se não há ganhadores, o valor do prêmio também fica com a casa
    const ganhadores = this.getGanhadores(jogoId);
    const valorCasaTotal = valorCasa + (ganhadores.length === 0 && jogo.finalizado ? valorPremio : 0);

    return {
      totalApostas: jogo.apostas.length,
      valorTotal,
      valorCasa,
      valorPremio,
      valorCasaTotal
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeTestData(): void {
    // Verificar se já existem jogos
    if (this.jogosSubject.value.length === 0) {
      // Criar datas futuras para os jogos de teste
      const agora = new Date();
      const amanha = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // Amanhã
      const depoisAmanha = new Date(agora.getTime() + 48 * 60 * 60 * 1000); // Depois de amanhã
      
      const jogosIniciais: Jogo[] = [
        {
          id: 'jogo_1',
          casaNome: 'Cruzeiro',
          casaLogo: 'assets/img/default-team.svg',
          foraNome: 'Bragantino',
          foraLogo: 'assets/img/default-team.svg',
          data: new Date(amanha.getTime() + 19 * 60 * 60 * 1000), // Amanhã às 19:00
          horarioEncerramento: new Date(amanha.getTime() + 18 * 60 * 60 * 1000), // Amanhã às 18:00
          valorAposta: 10,
          finalizado: false,
          apostas: []
        },
        {
          id: 'jogo_2',
          casaNome: 'Flamengo',
          casaLogo: 'assets/img/default-team.svg',
          foraNome: 'Vasco',
          foraLogo: 'assets/img/default-team.svg',
          data: new Date(depoisAmanha.getTime() + 20 * 60 * 60 * 1000), // Depois de amanhã às 20:00
          horarioEncerramento: new Date(depoisAmanha.getTime() + 19 * 60 * 60 * 1000), // Depois de amanhã às 19:00
          valorAposta: 10,
          finalizado: false,
          apostas: []
        }
      ];

      this.jogosSubject.next(jogosIniciais);
      this.saveToStorage();
    }
  }
}
