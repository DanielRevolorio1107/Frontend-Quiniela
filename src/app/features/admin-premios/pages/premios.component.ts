import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PremiosService } from '../services/premios.service';
import { PremiosGlobales } from '../interfaces/premios-globales.interface';
import { PremioDistribuido } from '../interfaces/premio-distribuido.interface';
import { TorneoSelect } from '../interfaces/torneo-select.interface';

@Component({
    selector: 'app-premios',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './premios.component.html',
    styleUrl: './premios.component.css',
})
export class PremiosComponent implements OnInit {
    private premiosService = inject(PremiosService);

    premios: PremiosGlobales | null = null;
    isLoadingPremios = true;

    torneos: TorneoSelect[] = [];
    isLoadingTorneos = true;
    torneoSeleccionado: number | null = null;

    historial: PremioDistribuido[] = [];
    isLoadingHistorial = false;
    historialCargado = false;

    resultadoCierre: PremioDistribuido[] = [];
    isCerrando = false;

    isDescargandoPremios = false;


    errorMessage = '';
    successMessage = '';

    ngOnInit(): void {
        this.loadPremios();
        this.loadTorneos();
    }

    loadPremios(): void {
        this.isLoadingPremios = true;
        this.premiosService.getPremiosGlobales().subscribe({
            next: (data) => {
                this.premios = data;
                this.isLoadingPremios = false;
            },
            error: (error) => {
                this.isLoadingPremios = false;
                this.errorMessage = this.parseError(error, 'No se pudieron cargar los premios globales.');
            },
        });
    }

    loadTorneos(): void {
        this.premiosService.getTorneos().subscribe({
            next: (data) => {
                this.torneos = data;
                this.isLoadingTorneos = false;
            },
            error: () => {
                this.isLoadingTorneos = false;
            },
        });
    }

    onTorneoChange(): void {
        this.historial = [];
        this.historialCargado = false;
        this.resultadoCierre = [];
        this.clearMessages();
    }

    verHistorial(): void {
        if (!this.torneoSeleccionado) return;
        this.isLoadingHistorial = true;
        this.historialCargado = false;
        this.clearMessages();

        this.premiosService.getHistorial(this.torneoSeleccionado).subscribe({
            next: (data) => {
                this.historial = data;
                this.historialCargado = true;
                this.isLoadingHistorial = false;
            },
            error: (error) => {
                this.isLoadingHistorial = false;
                this.errorMessage = this.parseError(error, 'No se pudo cargar el historial.');
            },
        });
    }

    cerrarTorneo(): void {
        if (!this.torneoSeleccionado) return;

        const torneo = this.torneos.find(t => t.id === this.torneoSeleccionado);
        const ok = confirm(
            `¿Cerrar el torneo "${torneo?.nombre}"?\n\n` +
            `⚠️ Esta acción es IRREVERSIBLE.\n` +
            `Se calcularán y registrarán todos los premios definitivos.`
        );
        if (!ok) return;

        this.isCerrando = true;
        this.clearMessages();

        this.premiosService.cerrarTorneo(this.torneoSeleccionado).subscribe({
            next: (premiosDistribuidos) => {
                this.isCerrando = false;
                this.resultadoCierre = premiosDistribuidos;
                this.successMessage =
                    `Torneo cerrado correctamente. Se distribuyeron ${premiosDistribuidos.length} premios.`;
                this.loadPremios();
            },
            error: (error) => {
                this.isCerrando = false;
                this.errorMessage = this.parseError(error, 'No se pudo cerrar el torneo.');
            },
        });
    }

    descargarPremios(): void {
        if (!this.torneoSeleccionado) return;
        this.isDescargandoPremios = true;
        this.clearMessages();

        this.premiosService.descargarPremios(this.torneoSeleccionado).subscribe({
            next: (blob) => {
                this.isDescargandoPremios = false;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `premios_torneo_${this.torneoSeleccionado}_${this.timestamp()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            },
            error: (error) => {
                this.isDescargandoPremios = false;
                this.errorMessage = this.parseError(error, 'No se pudo generar el reporte de premios.');
            },
        });
    }

    private timestamp(): string {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
    }





    private clearMessages(): void {
        this.errorMessage = '';
        this.successMessage = '';
    }

    private parseError(error: any, fallback: string): string {
        if (error.status === 0) return 'No se pudo conectar con el servidor.';
        if (error.status === 401 || error.status === 403) return 'No tienes permisos para esta acción.';
        return error?.error?.error || error?.error?.message || fallback;
    }
}