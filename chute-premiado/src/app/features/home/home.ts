import { Component } from '@angular/core';
import { NgFor, DatePipe } from '@angular/common';

type Jogo = {
  casaNome: string;
  casaLogo: string;
  foraNome: string;
  foraLogo: string;
  data: Date;
};

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [NgFor, DatePipe]
})
export class HomeComponent {
  jogos: Jogo[] = [
    {
      casaNome: 'Cruzeiro',
      casaLogo: 'assets/img/cruzeiro.png',
      foraNome: 'Atlético-MG',
      foraLogo: 'assets/img/atletico-mg.png',
      data: new Date('2025-09-18T21:30:00')
    },
    {
      casaNome: 'Palmeiras',
      casaLogo: 'assets/img/palmeiras.png',
      foraNome: 'São Paulo',
      foraLogo: 'assets/img/saopaulo.png',
      data: new Date('2025-09-20T16:00:00')
    }
  ];
}
