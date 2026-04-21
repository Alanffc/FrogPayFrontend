import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Genera y descarga un archivo Excel con las transacciones y KPIs de FrogPay.
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
export async function exportTransactionsExcel({
  transactions,
  kpis,
  timeRange,
  formatCurrency,
  getTransactionDateLabel,
  getProviderLabel,
  normalizeProvider,
}) {
  const workbook  = new ExcelJS.Workbook();
  workbook.creator = 'FrogPay';
  workbook.created = new Date();

  const now = new Date();
  const rangeLabel =
    { '24h': 'Últimas 24 horas', '7d': 'Últimos 7 días', '30d': 'Últimos 30 días' }[timeRange] || timeRange;

  /* ══════════════════════════════════════════════════════
     Hoja 1: Transacciones
     ══════════════════════════════════════════════════════ */
  const sheet = workbook.addWorksheet('Transacciones', {
    properties: { tabColor: { argb: 'FFE6FF2A' } },
    views: [{ state: 'frozen', ySplit: 5 }],
  });

  /* Fila 1 – título principal */
  sheet.mergeCells('A1:F1');
  const titleCell    = sheet.getCell('A1');
  titleCell.value    = 'FrogPay — Reporte de Transacciones';
  titleCell.font     = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF0C4651' } };
  titleCell.fill     = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FF2A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 32;

  /* Fila 2 – subtítulo */
  sheet.mergeCells('A2:F2');
  const subCell    = sheet.getCell('A2');
  subCell.value    = `Período: ${rangeLabel}  |  Generado: ${now.toLocaleString('es-BO')}  |  Total: ${transactions.length} registros`;
  subCell.font     = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF888888' } };
  subCell.fill     = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A0A0A' } };
  subCell.alignment = { horizontal: 'center' };
  sheet.getRow(2).height = 18;

  /* Fila 3 – KPIs inline */
  sheet.mergeCells('A3:B3');
  sheet.mergeCells('C3:D3');
  sheet.mergeCells('E3:F3');

  const applyKpiStyle = (cell, label, value) => {
    cell.value     = `${label}: ${value}`;
    cell.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFE6FF2A' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border    = {
      top:    { style: 'thin', color: { argb: 'FF333333' } },
      bottom: { style: 'thin', color: { argb: 'FF333333' } },
      left:   { style: 'thin', color: { argb: 'FF333333' } },
      right:  { style: 'thin', color: { argb: 'FF333333' } },
    };
  };
  applyKpiStyle(sheet.getCell('A3'), 'Volumen', formatCurrency(kpis.volumen));
  applyKpiStyle(sheet.getCell('C3'), 'Pagos Exitosos', kpis.transacciones);
  applyKpiStyle(sheet.getCell('E3'), 'Ticket Promedio', formatCurrency(kpis.ticket));
  sheet.getRow(3).height = 22;

  /* Fila 4 – vacía separadora */
  sheet.getRow(4).height = 6;

  /* Fila 5 – Headers de columnas */
  const headers   = ['Payment ID', 'Fecha', 'Proveedor', 'Referencia Proveedor', 'Estado', 'Monto'];
  const headerRow = sheet.getRow(5);
  headers.forEach((h, i) => {
    const cell     = headerRow.getCell(i + 1);
    cell.value     = h;
    cell.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0A0A0A' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FF2A' } };
    cell.alignment = { vertical: 'middle', horizontal: i === 5 ? 'right' : 'left' };
    cell.border    = { bottom: { style: 'medium', color: { argb: 'FF0C4651' } } };
  });
  headerRow.height = 20;

  /* Columnas – anchos fijos */
  sheet.columns = [
    { key: 'payment_id',              width: 36 },
    { key: 'fecha',                   width: 22 },
    { key: 'proveedor',               width: 14 },
    { key: 'provider_transaction_id', width: 36 },
    { key: 'estado',                  width: 14 },
    { key: 'monto',                   width: 18 },
  ];

  /* ── Helpers de color ── */
  const statusColor = (estado) => {
    const s = String(estado || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'SUCCESS') return 'FFA3E635';
    if (s === 'FAILED')  return 'FFF87171';
    if (s === 'PENDING') return 'FFFBBF24';
    return 'FFD1D5DB';
  };
  const providerColor = (p) => {
    const n = String(p || '').toLowerCase();
    if (n === 'paypal') return 'FF0070BA';
    if (n === 'card')   return 'FFE6FF2A';
    if (n === 'qr')     return 'FF22D3EE';
    return 'FFD1D5DB';
  };

  /* Filas de datos */
  transactions.forEach((txn, index) => {
    const rowNum = index + 6; // datos desde fila 6
    const row    = sheet.getRow(rowNum);
    const isEven = index % 2 === 0;
    const bgArgb = isEven ? 'FF141414' : 'FF0A0A0A';

    const vals = [
      txn.payment_id || txn.id || '-',
      getTransactionDateLabel(txn),
      getProviderLabel(normalizeProvider(txn.proveedor)),
      txn.provider_transaction_id || '-',
      txn.estado || 'N/A',
      `${formatCurrency(txn.monto, txn.moneda)} ${txn.moneda || ''}`.trim(),
    ];

    vals.forEach((val, ci) => {
      const cell     = row.getCell(ci + 1);
      cell.value     = val;
      cell.font      = { name: 'Calibri', size: 9, color: { argb: 'FFD1D5DB' } };
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
      cell.alignment = { vertical: 'middle', horizontal: ci === 5 ? 'right' : 'left' };
      cell.border    = { bottom: { style: 'hair', color: { argb: 'FF222222' } } };

      /* colores de estado y proveedor */
      if (ci === 4) cell.font = { ...cell.font, bold: true, color: { argb: statusColor(txn.estado) } };
      if (ci === 2) cell.font = { ...cell.font, bold: true, color: { argb: providerColor(normalizeProvider(txn.proveedor)) } };
      if (ci === 5) cell.font = { ...cell.font, bold: true, color: { argb: 'FFE6FF2A' } };
      if (ci === 0) cell.font = { ...cell.font, name: 'Courier New', size: 8 };
      if (ci === 3) cell.font = { ...cell.font, name: 'Courier New', size: 8 };
    });
    row.height = 16;
  });

  /* Fila total al final */
  const totalRow = sheet.getRow(transactions.length + 6);
  sheet.mergeCells(`A${transactions.length + 6}:E${transactions.length + 6}`);
  const totalLabelCell  = totalRow.getCell(1);
  totalLabelCell.value  = `Total de registros exportados: ${transactions.length}`;
  totalLabelCell.font   = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF888888' } };
  totalLabelCell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A0A0A' } };

  /* ══════════════════════════════════════════════════════
     Hoja 2: Resumen KPIs
     ══════════════════════════════════════════════════════ */
  const summarySheet = workbook.addWorksheet('Resumen KPIs', {
    properties: { tabColor: { argb: 'FF0C4651' } },
  });
  summarySheet.mergeCells('A1:C1');
  const sumTitle      = summarySheet.getCell('A1');
  sumTitle.value      = 'Resumen de KPIs — FrogPay';
  sumTitle.font       = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFE6FF2A' } };
  sumTitle.fill       = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A0A0A' } };
  sumTitle.alignment  = { horizontal: 'center' };
  summarySheet.getRow(1).height = 28;

  const kpiRows = [
    ['Período',                    rangeLabel],
    ['Fecha de Generación',        now.toLocaleString('es-BO')],
    ['Volumen Procesado',          formatCurrency(kpis.volumen)],
    ['Pagos Exitosos',             kpis.transacciones],
    ['Ticket Promedio',            formatCurrency(kpis.ticket)],
    ['Crecimiento Volumen',        `${kpis.volCrec >= 0 ? '+' : ''}${kpis.volCrec}%`],
    ['Crecimiento Transacciones',  `${kpis.txnCrec >= 0 ? '+' : ''}${kpis.txnCrec}%`],
    ['Crecimiento Ticket',         `${kpis.tkCrec >= 0 ? '+' : ''}${kpis.tkCrec}%`],
    ['Registros en tabla',         transactions.length],
  ];
  kpiRows.forEach(([label, value], i) => {
    const r      = summarySheet.getRow(i + 3);
    const labelC = r.getCell(1);
    const valueC = r.getCell(2);
    labelC.value = label;
    labelC.font  = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF9CA3AF' } };
    labelC.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FF0A0A0A' : 'FF141414' } };
    valueC.value = value;
    valueC.font  = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFE6FF2A' } };
    valueC.fill  = labelC.fill;
    valueC.alignment = { horizontal: 'left' };
    r.height = 18;
  });
  summarySheet.getColumn(1).width = 30;
  summarySheet.getColumn(2).width = 28;

  /* ── Guardar ── */
  const buffer   = await workbook.xlsx.writeBuffer();
  const blob     = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `FrogPay_Transacciones_${timeRange}_${now.toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, fileName);
}
