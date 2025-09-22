import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  id: string;
  nome: string;
  nomeUsuario: string; // Nome de usuário único
  email: string;
  telefone: string;
  chavePix: string;
  creditos: number;
  creditosGastos: number;
  creditosGanhos: number;
  totalApostas: number;
  apostasVencedoras: number;
  dataCadastro: Date;
  bloqueado: boolean;
  motivoBloqueio?: string;
  dataBloqueio?: Date;
}

export interface TransacaoCredito {
  id: string;
  usuarioId: string;
  tipo: 'compra' | 'aposta' | 'ganho' | 'reembolso';
  valor: number;
  creditos: number;
  descricao: string;
  data: Date;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  mercadoPagoId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  public usuarios$ = this.usuariosSubject.asObservable();

  private transacoesSubject = new BehaviorSubject<TransacaoCredito[]>([]);
  public transacoes$ = this.transacoesSubject.asObservable();

  constructor() {
    this.initializeTestData();
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // Carregar usuários
    const storedUsers = localStorage.getItem('usuarios');
    if (storedUsers) {
      const usuarios = JSON.parse(storedUsers).map((user: any) => ({
        ...user,
        dataCadastro: new Date(user.dataCadastro),
        dataBloqueio: user.dataBloqueio ? new Date(user.dataBloqueio) : undefined
      }));
      this.usuariosSubject.next(usuarios);
    }

    // Carregar transações
    const storedTransactions = localStorage.getItem('transacoes');
    if (storedTransactions) {
      const transacoes = JSON.parse(storedTransactions).map((trans: any) => ({
        ...trans,
        data: new Date(trans.data)
      }));
      this.transacoesSubject.next(transacoes);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('usuarios', JSON.stringify(this.usuariosSubject.value));
    localStorage.setItem('transacoes', JSON.stringify(this.transacoesSubject.value));
  }

  // Métodos de usuários
  getUsuarios(): Observable<Usuario[]> {
    return this.usuarios$;
  }

  criarUsuario(usuario: Omit<Usuario, 'id' | 'creditos' | 'creditosGastos' | 'creditosGanhos' | 'totalApostas' | 'apostasVencedoras' | 'dataCadastro' | 'bloqueado'>): { success: boolean; message: string } {
    // Verificar se o nome de usuário já existe
    const nomeUsuarioExiste = this.usuariosSubject.value.some(u => u.nomeUsuario.toLowerCase() === usuario.nomeUsuario.toLowerCase());
    
    if (nomeUsuarioExiste) {
      return { success: false, message: 'Nome de usuário já existe. Escolha outro.' };
    }

    const novoUsuario: Usuario = {
      ...usuario,
      id: this.generateId(),
      creditos: 0,
      creditosGastos: 0,
      creditosGanhos: 0,
      totalApostas: 0,
      apostasVencedoras: 0,
      dataCadastro: new Date(),
      bloqueado: false
    };

    const usuarios = [...this.usuariosSubject.value, novoUsuario];
    this.usuariosSubject.next(usuarios);
    this.saveToStorage();
    
    return { success: true, message: 'Usuário criado com sucesso!' };
  }

  atualizarUsuario(id: string, usuario: Partial<Usuario>): void {
    const usuarios = this.usuariosSubject.value.map(u => 
      u.id === id ? { ...u, ...usuario } : u
    );
    this.usuariosSubject.next(usuarios);
    this.saveToStorage();
  }

  bloquearUsuario(id: string, motivo: string): void {
    this.atualizarUsuario(id, {
      bloqueado: true,
      motivoBloqueio: motivo,
      dataBloqueio: new Date()
    });
  }

  desbloquearUsuario(id: string): void {
    this.atualizarUsuario(id, {
      bloqueado: false,
      motivoBloqueio: undefined,
      dataBloqueio: undefined
    });
  }

  excluirUsuario(id: string): void {
    const usuarios = this.usuariosSubject.value.filter(u => u.id !== id);
    this.usuariosSubject.next(usuarios);
    this.saveToStorage();
  }

  // Métodos de créditos
  adicionarCredito(usuarioId: string, valor: number, tipo: 'compra' | 'ganho' | 'reembolso', descricao: string, mercadoPagoId?: string): void {
    const usuarios = this.usuariosSubject.value.map(usuario => {
      if (usuario.id === usuarioId) {
        const creditosAdicionados = valor; // 1 real = 1 crédito
        
        // Criar transação
        const transacao: TransacaoCredito = {
          id: this.generateId(),
          usuarioId,
          tipo,
          valor,
          creditos: creditosAdicionados,
          descricao,
          data: new Date(),
          status: 'aprovado',
          mercadoPagoId
        };

        const transacoes = [...this.transacoesSubject.value, transacao];
        this.transacoesSubject.next(transacoes);

        return {
          ...usuario,
          creditos: usuario.creditos + creditosAdicionados,
          creditosGanhos: tipo === 'ganho' ? usuario.creditosGanhos + creditosAdicionados : usuario.creditosGanhos
        };
      }
      return usuario;
    });

    this.usuariosSubject.next(usuarios);
    this.saveToStorage();
  }

  debitarCredito(usuarioId: string, valor: number, descricao: string): boolean {
    const usuarios = this.usuariosSubject.value.map(usuario => {
      if (usuario.id === usuarioId) {
        if (usuario.creditos >= valor) {
          // Criar transação
          const transacao: TransacaoCredito = {
            id: this.generateId(),
            usuarioId,
            tipo: 'aposta',
            valor,
            creditos: valor,
            descricao,
            data: new Date(),
            status: 'aprovado'
          };

          const transacoes = [...this.transacoesSubject.value, transacao];
          this.transacoesSubject.next(transacoes);

          return {
            ...usuario,
            creditos: usuario.creditos - valor,
            creditosGastos: usuario.creditosGastos + valor,
            totalApostas: usuario.totalApostas + 1
          };
        }
        return usuario;
      }
      return usuario;
    });

    this.usuariosSubject.next(usuarios);
    this.saveToStorage();
    
    // Verificar se o usuário tem créditos suficientes
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.creditos >= valor : false;
  }

  creditarGanho(usuarioId: string, valor: number, descricao: string): void {
    this.adicionarCredito(usuarioId, valor, 'ganho', descricao);
    
    // Atualizar estatísticas de apostas vencedoras
    const usuarios = this.usuariosSubject.value.map(usuario => {
      if (usuario.id === usuarioId) {
        return {
          ...usuario,
          apostasVencedoras: usuario.apostasVencedoras + 1
        };
      }
      return usuario;
    });
    this.usuariosSubject.next(usuarios);
    this.saveToStorage();
  }

  // Métodos de transações
  getTransacoes(): Observable<TransacaoCredito[]> {
    return this.transacoes$;
  }

  getTransacoesPorUsuario(usuarioId: string): TransacaoCredito[] {
    return this.transacoesSubject.value.filter(t => t.usuarioId === usuarioId);
  }

  // Métodos de finanças
  getEstatisticasFinanceiras(): {
    totalCreditosVendidos: number;
    totalCreditosGastos: number;
    totalCreditosGanhos: number;
    valorCasa: number;
    creditosDisponiveis: number;
  } {
    const usuarios = this.usuariosSubject.value;
    const transacoes = this.transacoesSubject.value;

    const totalCreditosVendidos = transacoes
      .filter(t => t.tipo === 'compra' && t.status === 'aprovado')
      .reduce((sum, t) => sum + t.valor, 0);

    const totalCreditosGastos = transacoes
      .filter(t => t.tipo === 'aposta' && t.status === 'aprovado')
      .reduce((sum, t) => sum + t.valor, 0);

    const totalCreditosGanhos = transacoes
      .filter(t => t.tipo === 'ganho' && t.status === 'aprovado')
      .reduce((sum, t) => sum + t.valor, 0);

    // Valor da casa = créditos gastos - créditos ganhos (10% + jogos sem ganhadores)
    const valorCasa = totalCreditosGastos - totalCreditosGanhos;

    const creditosDisponiveis = usuarios.reduce((sum, u) => sum + u.creditos, 0);

    return {
      totalCreditosVendidos,
      totalCreditosGastos,
      totalCreditosGanhos,
      valorCasa,
      creditosDisponiveis
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeTestData(): void {
    // Sempre recriar dados de teste para garantir que KJgv tenha 100 créditos
    const usuariosIniciais: Usuario[] = [
        {
          id: 'user_1',
          nome: 'Samuel Albino',
          nomeUsuario: 'samuel',
          email: 'samuel@teste.com',
          telefone: '(11) 99999-9999',
          chavePix: 'samuel@teste.com',
          creditos: 0,
          creditosGastos: 0,
          creditosGanhos: 0,
          totalApostas: 0,
          apostasVencedoras: 0,
          dataCadastro: new Date(),
          bloqueado: false
        },
        {
          id: 'user_2',
          nome: 'KJgv',
          nomeUsuario: 'KJgv',
          email: 'samueljuniorgv2@gmail.com',
          telefone: '(11) 88888-8888',
          chavePix: 'samueljuniorgv2@gmail.com',
          creditos: 100, // 100 créditos para teste
          creditosGastos: 0,
          creditosGanhos: 0,
          totalApostas: 0,
          apostasVencedoras: 0,
          dataCadastro: new Date(),
          bloqueado: false
        }
      ];

    this.usuariosSubject.next(usuariosIniciais);
    this.saveToStorage();
  }
}
