import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class QuinielaSignalrService {
  private hubConnection: signalR.HubConnection | null = null;

  async startConnection(token: string): Promise<void> {
    if (this.hubConnection) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:8080/quinielahub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    await this.hubConnection.start();
  }

  async joinLeague(ligaId: number): Promise<void> {
    if (!this.hubConnection) return;
    await this.hubConnection.invoke('UnirseALiga', ligaId);
  }

  async leaveLeague(ligaId: number): Promise<void> {
    if (!this.hubConnection) return;
    await this.hubConnection.invoke('SalirDeLiga', ligaId);
  }

  onRankingUpdated(callback: (payload: any) => void): void {
    if (!this.hubConnection) return;

    this.hubConnection.off('RankingActualizado');
    this.hubConnection.on('RankingActualizado', callback);
  }

  async stopConnection(): Promise<void> {
    if (!this.hubConnection) return;
    await this.hubConnection.stop();
    this.hubConnection = null;
  }
}