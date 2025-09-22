import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService, Jogo } from '../../../services/game.service';

@Component({
  selector: 'app-game-form',
  standalone: true,
  templateUrl: './game-form.html',
  styleUrls: ['./game-form.scss'],
  imports: [CommonModule, FormsModule]
})
export class GameFormComponent implements OnInit {
  @Input() jogo: Jogo | null = null;
  @Output() close = new EventEmitter<void>();

  formData = {
    casaNome: '',
    casaLogo: '',
    foraNome: '',
    foraLogo: '',
    data: '',
    horarioEncerramento: '',
    valorAposta: 0
  };

  isEditing = false;
  isLoading = false;
  errorMessage = '';

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    if (this.jogo) {
      this.isEditing = true;
      this.formData = {
        casaNome: this.jogo.casaNome,
        casaLogo: this.jogo.casaLogo,
        foraNome: this.jogo.foraNome,
        foraLogo: this.jogo.foraLogo,
        data: this.formatDateForInput(this.jogo.data),
        horarioEncerramento: this.formatDateForInput(this.jogo.horarioEncerramento),
        valorAposta: this.jogo.valorAposta
      };
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Validações
    if (!this.formData.casaNome || !this.formData.foraNome) {
      this.errorMessage = 'Nome dos times é obrigatório';
      this.isLoading = false;
      return;
    }

    if (!this.formData.data || !this.formData.horarioEncerramento) {
      this.errorMessage = 'Data e horário são obrigatórios';
      this.isLoading = false;
      return;
    }

    if (this.formData.valorAposta <= 0) {
      this.errorMessage = 'Valor da aposta deve ser maior que zero';
      this.isLoading = false;
      return;
    }

    const dataJogo = new Date(this.formData.data);
    const dataEncerramento = new Date(this.formData.horarioEncerramento);

    if (dataEncerramento >= dataJogo) {
      this.errorMessage = 'Horário de encerramento deve ser anterior ao horário da partida';
      this.isLoading = false;
      return;
    }

    // Simular upload de imagens (em produção seria feito via API)
    setTimeout(() => {
      try {
        if (this.isEditing && this.jogo) {
          this.gameService.editarJogo(this.jogo.id, {
            casaNome: this.formData.casaNome,
            casaLogo: this.formData.casaLogo || 'assets/img/default-team.svg',
            foraNome: this.formData.foraNome,
            foraLogo: this.formData.foraLogo || 'assets/img/default-team.svg',
            data: dataJogo,
            horarioEncerramento: dataEncerramento,
            valorAposta: this.formData.valorAposta
          });
        } else {
          this.gameService.criarJogo({
            casaNome: this.formData.casaNome,
            casaLogo: this.formData.casaLogo || 'assets/img/default-team.svg',
            foraNome: this.formData.foraNome,
            foraLogo: this.formData.foraLogo || 'assets/img/default-team.svg',
            data: dataJogo,
            horarioEncerramento: dataEncerramento,
            valorAposta: this.formData.valorAposta
          });
        }

        this.closeForm();
      } catch (error) {
        this.errorMessage = 'Erro ao salvar o jogo';
      }
      this.isLoading = false;
    }, 1000);
  }

  closeForm(): void {
    this.close.emit();
  }

  onFileChange(event: Event, type: 'casa' | 'fora'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Simular upload - em produção seria feito via API
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'casa') {
          this.formData.casaLogo = result;
        } else {
          this.formData.foraLogo = result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
