import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera y descarga un PDF con las transacciones y KPIs de FrogPay.
 *
 * @param {Object}   params
 * @param {Array}    params.transactions  – filas de la tabla (objetos con payment_id, fecha, proveedor, etc.)
 * @param {Object}   params.kpis          – { volumen, transacciones, ticket, volCrec, txnCrec, tkCrec }
 * @param {string}   params.timeRange     – '24h' | '7d' | '30d'
 * @param {Function} params.formatCurrency
 * @param {Function} params.getTransactionDateLabel
 * @param {Function} params.getProviderLabel
 * @param {Function} params.normalizeProvider
 */
export function exportTransactionsPDF({
  transactions,
  kpis,
  timeRange,
  formatCurrency,
  getTransactionDateLabel,
  getProviderLabel,
  normalizeProvider,
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  /* ── Paleta ── */
  const LIME  = [230, 255, 42];
  const DARK  = [10,  10,  10];
  const MID   = [30,  30,  30];
  const GRAY  = [100, 100, 100];
  const WHITE = [255, 255, 255];

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const now   = new Date();

  const rangeLabel =
    { '24h': 'Últimas 24 horas', '7d': 'Últimos 7 días', '30d': 'Últimos 30 días' }[timeRange] || timeRange;

  /* ── Fondo negro ── */
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageW, pageH, 'F');

  /* ── Banda superior lima ── */
  doc.setFillColor(...LIME);
  doc.rect(0, 0, pageW, 22, 'F');

  /* ── Logo / título en banda ── */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text('Frog', 14, 14);
  doc.setTextColor(12, 70, 81); // verde oscuro FrogPay
  doc.text('Pay', 14 + doc.getTextWidth('Frog'), 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK);
  doc.text('Reporte Financiero de Transacciones', 14 + doc.getTextWidth('FrogPay') + 6, 14);

  /* ── Fecha generación (derecha) ── */
  const fechaTexto = `Generado: ${now.toLocaleString('es-BO')}`;
  doc.setFontSize(8);
  doc.text(fechaTexto, pageW - 14, 14, { align: 'right' });

  /* ── Subtítulo rango ── */
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Período: ${rangeLabel}`, 14, 30);

  /* ── KPI boxes ── */
  const kpiItems = [
    { label: 'Volumen Procesado',   value: formatCurrency(kpis.volumen) },
    { label: 'Pagos Exitosos',      value: String(kpis.transacciones) },
    { label: 'Ticket Promedio',     value: formatCurrency(kpis.ticket) },
    { label: 'Transacciones Tabla', value: String(transactions.length) },
  ];
  const boxW = (pageW - 28 - 9) / 4;
  kpiItems.forEach((k, i) => {
    const x = 14 + i * (boxW + 3);
    doc.setFillColor(...MID);
    doc.roundedRect(x, 35, boxW, 22, 3, 3, 'F');
    doc.setDrawColor(...LIME);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, 35, boxW, 22, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...LIME);
    doc.text(k.value, x + boxW / 2, 45, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(k.label, x + boxW / 2, 52, { align: 'center' });
  });

  /* ── Tabla de transacciones ── */
  const head = [['Payment ID', 'Fecha', 'Proveedor', 'Referencia Proveedor', 'Estado', 'Monto']];
  const body = transactions.map((txn) => [
    txn.payment_id || txn.id || '-',
    getTransactionDateLabel(txn),
    getProviderLabel(normalizeProvider(txn.proveedor)),
    txn.provider_transaction_id || '-',
    txn.estado || 'N/A',
    `${formatCurrency(txn.monto, txn.moneda)} ${txn.moneda || ''}`.trim(),
  ]);

  autoTable(doc, {
    startY: 63,
    head,
    body,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: WHITE,
      fillColor: DARK,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      lineColor: [40, 40, 40],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: LIME,
      textColor: DARK,
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    alternateRowStyles: { fillColor: MID },
    columnStyles: {
      0: { cellWidth: 50, font: 'courier' },
      1: { cellWidth: 38 },
      3: { cellWidth: 50, font: 'courier' },
      5: { halign: 'right', fontStyle: 'bold', textColor: LIME },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const estado = String(data.cell.raw || '').toUpperCase();
        if (estado === 'COMPLETED' || estado === 'SUCCESS') {
          data.cell.styles.textColor = [163, 230, 53];
        } else if (estado === 'FAILED') {
          data.cell.styles.textColor = [248, 113, 113];
        } else if (estado === 'PENDING') {
          data.cell.styles.textColor = [251, 191, 36];
        }
      }
    },
    /* pie de página en cada hoja */
    didDrawPage: () => {
      const pN = doc.internal.getCurrentPageInfo().pageNumber;
      const pT = doc.internal.getNumberOfPages();
      doc.setFillColor(...DARK);
      doc.rect(0, pageH - 8, pageW, 8, 'F');
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(`FrogPay — Reporte Financiero | ${rangeLabel}`, 14, pageH - 3);
      doc.text(`Página ${pN} de ${pT}`, pageW - 14, pageH - 3, { align: 'right' });
    },
  });

  const fileName = `FrogPay_Transacciones_${timeRange}_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
