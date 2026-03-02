import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EstadoCuenta } from '../../core/models/estado-cuenta.model';
import { Movimiento } from '../../core/models/movimiento.model';

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {
  private http = inject(HttpClient);

  /**
   * Genera un reporte PDF de estado de cuenta con movimientos filtrados por fecha
   */
  generarReporteCuenta(
    cuenta: EstadoCuenta,
    fechaInicio: string,
    fechaFin: string
  ): Observable<void> {
    // Obtener movimientos de la cuenta
    return this.http.get<Movimiento[]>(`/movimientos`).pipe(
      map((movimientos) => {
        // Filtrar movimientos por cuenta y rango de fechas
        const movimientosFiltrados = this.filtrarMovimientos(
          movimientos,
          cuenta.numeroCuenta,
          fechaInicio,
          fechaFin
        );

        // Generar el PDF
        this.generarPDF(cuenta, movimientosFiltrados, fechaInicio, fechaFin);
      })
    );
  }

  /**
   * Filtra movimientos por número de cuenta y rango de fechas
   */
  private filtrarMovimientos(
    movimientos: Movimiento[],
    numeroCuenta: string,
    fechaInicio: string,
    fechaFin: string
  ): Movimiento[] {
    return movimientos.filter((mov) => {
      // Filtrar por número de cuenta
      if (mov.cuenta?.numeroCuenta !== numeroCuenta) {
        return false;
      }

      // Filtrar por rango de fechas (comparación de strings YYYY-MM-DD funciona correctamente)
      const fechaMov = mov.fecha.split('T')[0]; // Obtener solo la parte de fecha YYYY-MM-DD

      return fechaMov >= fechaInicio && fechaMov <= fechaFin;
    });
  }

  /**
   * Genera el PDF con la información de la cuenta y sus movimientos
   */
  private generarPDF(
    cuenta: EstadoCuenta,
    movimientos: Movimiento[],
    fechaInicio: string,
    fechaFin: string
  ): void {
    const doc = new jsPDF();

    // Configuración de fuentes
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Título del reporte
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE ESTADO DE CUENTA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Período del reporte
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Período: ${this.formatFecha(fechaInicio)} - ${this.formatFecha(fechaFin)}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    );
    yPos += 15;

    // Información de la cuenta (Cabecera)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DE LA CUENTA', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const infoCuenta = [
      ['Número de Cuenta:', cuenta.numeroCuenta],
      ['Tipo de Cuenta:', cuenta.tipoCuenta],
      ['Cliente:', cuenta.nombreCliente],
      ['Saldo Inicial:', this.formatCurrency(cuenta.saldoInicial)],
      ['Total Créditos:', this.formatCurrency(cuenta.credito)],
      ['Total Débitos:', this.formatCurrency(cuenta.debito)],
      ['Saldo Final:', this.formatCurrency(cuenta.saldo)],
      ['Último Movimiento:', cuenta.ultimoMovimiento || 'N/A']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: infoCuenta,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Tabla de movimientos
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE MOVIMIENTOS', 14, yPos);
    yPos += 5;

    if (movimientos.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No hay movimientos en el período seleccionado', 14, yPos + 10);
    } else {
      // Preparar datos para la tabla
      const tableData = movimientos.map((mov) => [
        this.formatFecha(mov.fecha),
        mov.tipoMovimiento,
        this.formatCurrency(mov.valor),
        this.formatCurrency(mov.saldo)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Tipo', 'Valor', 'Saldo']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });

      // Totales al final
      yPos = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      const totalCreditos = movimientos
        .filter(m => m.tipoMovimiento === 'CREDITO')
        .reduce((sum, m) => sum + m.valor, 0);

      const totalDebitos = movimientos
        .filter(m => m.tipoMovimiento === 'DEBITO')
        .reduce((sum, m) => sum + m.valor, 0);

      doc.text(`Total Créditos: ${this.formatCurrency(totalCreditos)}`, 14, yPos);
      doc.text(`Total Débitos: ${this.formatCurrency(totalDebitos)}`, 14, yPos + 6);
      doc.text(`Cantidad de Movimientos: ${movimientos.length}`, 14, yPos + 12);
    }

    // Footer con fecha de generación
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generado el: ${new Date().toLocaleString('es-CO')}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' }
      );
    }

    // Descargar el PDF
    const fileName = `reporte-${cuenta.numeroCuenta}-${fechaInicio}-${fechaFin}.pdf`;
    doc.save(fileName);
  }

  /**
   * Formatea un valor como moneda
   */
  private formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formatea una fecha en formato DD/MM/YYYY
   * Parsea directamente el string para evitar problemas de zona horaria
   */
  private formatFecha(fecha: string): string {
    if (!fecha) return 'N/A';

    // Si la fecha viene en formato YYYY-MM-DD, parsear directamente
    if (fecha.includes('-')) {
      const [year, month, day] = fecha.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }

    // Fallback para otros formatos
    const date = new Date(fecha + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
