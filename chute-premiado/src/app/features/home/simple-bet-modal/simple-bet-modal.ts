import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simple-bet-modal',
  standalone: true,
  template: `
    <div *ngIf="isVisible" class="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
      <div class="modal-content" style="background: white; padding: 20px; border-radius: 10px; max-width: 400px; width: 90%;">
        <h3>Fazer Aposta</h3>
        
        <div *ngIf="jogo">
          <p><strong>{{ jogo.casaNome }} x {{ jogo.foraNome }}</strong></p>
          <p>{{ jogo.data | date:'dd/MM/yyyy · HH:mm' }}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <label>Seu palpite:</label><br>
          <input type="number" [(ngModel)]="placarCasa" placeholder="Casa" style="width: 60px; margin: 5px;"> 
          X 
          <input type="number" [(ngModel)]="placarFora" placeholder="Fora" style="width: 60px; margin: 5px;">
        </div>
        
        <div style="margin: 20px 0;">
          <label>Valor da aposta:</label><br>
          <input type="number" [(ngModel)]="valorAposta" placeholder="R$" style="width: 100px; margin: 5px;">
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <button (click)="fazerAposta()" style="background: #0F2E22; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px;">
            Apostar
          </button>
          <button (click)="fechar()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px;">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `,
  imports: [CommonModule, FormsModule]
})
export class SimpleBetModalComponent {
  @Input() jogo: any = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() betPlaced = new EventEmitter<any>();

  placarCasa: number = 0;
  placarFora: number = 0;
  valorAposta: number = 10;

  fazerAposta(): void {
    const aposta = {
      jogo: this.jogo,
      placarCasa: this.placarCasa,
      placarFora: this.placarFora,
      valorAposta: this.valorAposta
    };
    
    console.log('Aposta feita:', aposta);
    this.betPlaced.emit(aposta);
    this.fechar();
  }

  fechar(): void {
    this.close.emit();
  }
}
