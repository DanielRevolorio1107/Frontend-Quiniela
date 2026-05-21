import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class QuinielaSignalrService {
  private hubConnection: signalR.HubConnection | null = null;

  async startConnection(token: string): Promise<void> {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:8080/hubs/quiniela', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    await this.hubConnection.start();
    console.log('SignalR conectado');
  }

  async joinLeague(ligaId: number): Promise<void> {
    if (!this.hubConnection) return;
    await this.hubConnection.invoke('UnirseALiga', ligaId);
    console.log('Unido a la liga', ligaId);
  }

  async leaveLeague(ligaId: number): Promise<void> {
    if (!this.hubConnection) return;
    await this.hubConnection.invoke('SalirDeLiga', ligaId);
  }

  onRankingUpdated(callback: (payload: any) => void): void {
    if (!this.hubConnection) return;

    this.hubConnection.off('RankingActualizado');
    this.hubConnection.on('RankingActualizado', (payload) => {
      console.log('RankingActualizado:', payload);
      callback(payload);
    });
  }

  async stopConnection(): Promise<void> {
    if (!this.hubConnection) return;
    await this.hubConnection.stop();
    this.hubConnection = null;
  }
}