import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EstadoCuenta } from '../../core/models/estado-cuenta.model';

@Injectable({
  providedIn: 'root'
})
export class EstadoCuentaService {
  private http = inject(HttpClient);
  private readonly API_URL = '/movimientos/estado-cuenta';

  loading = signal(false);
  errorSignal = signal<string | null>(null);

  /**
   * Obtiene todos los estados de cuenta
   */
  getAll(): Observable<EstadoCuenta[]> {
    this.loading.set(true);
    return this.http.get<EstadoCuenta[]>(this.API_URL).pipe(
      tap(() => {
        this.loading.set(false);
        this.errorSignal.set(null);
      })
    );
  }

  /**
   * Genera reporte de estados de cuenta por rango de fechas
   * @param fechaInicio - Fecha inicial del reporte
   * @param fechaFin - Fecha final del reporte
   */
  generarReporte(fechaInicio: string, fechaFin: string): Observable<Blob> {
    const params = `fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get(`/reportes?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Genera reporte de estado de cuenta para una cuenta específica
   * @param numeroCuenta - Número de la cuenta
   * @param fechaInicio - Fecha inicial del reporte
   * @param fechaFin - Fecha final del reporte
   */
  generarReportePorCuenta(numeroCuenta: string, fechaInicio: string, fechaFin: string): Observable<Blob> {
    const params = `numeroCuenta=${numeroCuenta}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get(`/reportes?${params}`, {
      responseType: 'blob'
    });
  }
}
