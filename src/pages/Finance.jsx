import React, { useState, useRef, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  DollarSign, Activity, TrendingUp, Download, ArrowUpRight, ArrowDownRight, 
  CreditCard, FileText, FileSpreadsheet, ChevronDown, FilterX, Menu
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getKpis } from '../services/finance.service';

// --- SVGs DE MARCAS INTEGADOS ---
const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zM6.92 2h-1.51L2.298 21.337h1.51L6.92 2zM19.143 6.097c-1.112-1.267-3.12-1.81-5.69-1.81H5.998L2.886 23.411H7.49l.643-4.08h2.19c4.298 0 7.664-1.748 8.647-6.797.03-.15.054-.294.077-.437.292-1.867-.002-3.137-1.012-4.287z"/>
  </svg>
);

// --- COLORES CORPORATIVOS ESTRICTOS ---
const brandColors = {
  all:     { income: '#e6ff2a', volume: '#0c4651' }, // Default FrogPay
  tarjeta: { income: '#e6ff2a', volume: '#0c4651' }, // Tarjetas usan los colores de FrogPay
  paypal:  { income: '#0070ba', volume: '#003087' }  // PayPal usa sus azules clásicos
};

// --- DATOS MOCK DE GRÁFICOS ---
const chartData = [
  { fecha: '01 Abr', all_ingresos: 4500, all_transacciones: 120, tarjeta_ingresos: 3375, tarjeta_transacciones: 90, paypal_ingresos: 1125, paypal_transacciones: 30 },
  { fecha: '02 Abr', all_ingresos: 5200, all_transacciones: 145, tarjeta_ingresos: 3900, tarjeta_transacciones: 109, paypal_ingresos: 1300, paypal_transacciones: 36 },
  { fecha: '03 Abr', all_ingresos: 4800, all_transacciones: 130, tarjeta_ingresos: 3600, tarjeta_transacciones: 98, paypal_ingresos: 1200, paypal_transacciones: 32 },
  { fecha: '04 Abr', all_ingresos: 6100, all_transacciones: 160, tarjeta_ingresos: 4575, tarjeta_transacciones: 120, paypal_ingresos: 1525, paypal_transacciones: 40 },
  { fecha: '05 Abr', all_ingresos: 5900, all_transacciones: 155, tarjeta_ingresos: 4425, tarjeta_transacciones: 116, paypal_ingresos: 1475, paypal_transacciones: 39 },
  { fecha: '06 Abr', all_ingresos: 7500, all_transacciones: 190, tarjeta_ingresos: 5625, tarjeta_transacciones: 143, paypal_ingresos: 1875, paypal_transacciones: 47 },
  { fecha: '07 Abr', all_ingresos: 8200, all_transacciones: 210, tarjeta_ingresos: 6150, tarjeta_transacciones: 158, paypal_ingresos: 2050, paypal_transacciones: 52 },
];

const providerData = [
  { id: 'tarjeta', nombre: 'Tarjeta (Crédito/Débito)', valor: 75, color: brandColors.tarjeta.income, Icon: CreditCard },
  { id: 'paypal', nombre: 'Billetera (PayPal)', valor: 25, color: brandColors.paypal.income, Icon: PayPalIcon },
];

// --- DATOS MOCK: ÚLTIMAS TRANSACCIONES (Basado en DB) ---
const recentTransactions = [
  { id: 'txn_9A8b7C6d', monto: 150.00, moneda: 'BOB', estado: 'COMPLETED', proveedor: 'tarjeta', ultimos_cuatro: '4242', red: 'Visa', fecha: '2026-04-14 14:30' },
  { id: 'txn_3F4e5D2a', monto: 45.50, moneda: 'BOB', estado: 'COMPLETED', proveedor: 'paypal', ultimos_cuatro: null, red: null, fecha: '2026-04-14 13:15' },
  { id: 'txn_7G8h9J0k', monto: 320.00, moneda: 'BOB', estado: 'FAILED', proveedor: 'tarjeta', ultimos_cuatro: '0004', red: 'Mastercard', fecha: '2026-04-14 11:45' },
  { id: 'txn_1M2n3P4q', monto: 85.00, moneda: 'BOB', estado: 'COMPLETED', proveedor: 'tarjeta', ultimos_cuatro: '1234', red: 'Visa', fecha: '2026-04-14 09:20' },
  { id: 'txn_5R6s7T8u', monto: 12.00, moneda: 'USD', estado: 'COMPLETED', proveedor: 'paypal', ultimos_cuatro: null, red: null, fecha: '2026-04-13 18:05' },
];

// IMPORTANTE: Recibimos la prop onToggleSidebar desde App.jsx
export default function Finance({ onToggleSidebar }) {

  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [chartView, setChartView] = useState('ingresos');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCurrency = (value, currency = 'BOB') => {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: currency, maximumFractionDigits: 2 }).format(value);
  };

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        // Aquí idealmente pasaríamos selectedProvider al backend para filtrar
        const res = await getKpis(timeRange); 
        setKpis(res.data);
      } catch (error) {
        console.error("Error cargando KPIs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, [timeRange]);

  const activeIncomeColor = brandColors[selectedProvider].income;
  const activeVolumeColor = brandColors[selectedProvider].volume;
  const activeChartColor = chartView === 'ingresos' ? activeIncomeColor : activeVolumeColor;

  const currentKPIs = kpis
  ? {
      volumen: kpis.volumenProcesado?.valor || 0,
      transacciones: kpis.pagosExitosos?.valor || 0,
      ticket: kpis.ticketPromedio?.valor || 0,
      volCrec: kpis.volumenProcesado?.crecimientoPorcentaje || 0,
      txnCrec: kpis.pagosExitosos?.crecimientoPorcentaje || 0,
      tkCrec: kpis.ticketPromedio?.crecimientoPorcentaje || 0
    }
  : { volumen: 0, transacciones: 0, ticket: 0, volCrec: 0, txnCrec: 0, tkCrec: 0 };
  
  const activeDataKey = `${selectedProvider}_${chartView}`;
  
  if (loading) {
    return (
      <div className="text-[#e6ff2a] font-bold flex justify-center items-center h-screen animate-pulse">
        Cargando métricas financieras...
      </div>
    );
  }

  // --- EXPORTACIÓN ---
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Financiero');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: `Ingresos (${selectedProvider.toUpperCase()})`, key: 'ingresos', width: 25 },
      { header: `Transacciones (${selectedProvider.toUpperCase()})`, key: 'transacciones', width: 25 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C4651' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    chartData.forEach(item => {
      worksheet.addRow({
        fecha: item.fecha,
        ingresos: item[`${selectedProvider}_ingresos`],
        transacciones: item[`${selectedProvider}_transacciones`]
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if (rowNumber > 1) cell.alignment = { horizontal: 'center' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FrogPay_${selectedProvider}_${timeRange}.xlsx`);
    setIsExportMenuOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(4, 10, 11);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte Financiero', 14, 20);
    doc.setTextColor(230, 255, 42); 
    doc.setFontSize(12);
    doc.text('FrogPay SaaS', 14, 28);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Actividad: ${selectedProvider.toUpperCase()} (${timeRange})`, 14, 55);

    const tableColumn = ["Fecha", "Ingresos (Bs)", "Transacciones"];
    const tableRows = chartData.map(data => [
      data.fecha, 
      formatCurrency(data[`${selectedProvider}_ingresos`]), 
      data[`${selectedProvider}_transacciones`].toString()
    ]);

    autoTable(doc, {
      startY: 65, head: [tableColumn], body: tableRows, theme: 'striped',
      headStyles: { fillColor: [12, 70, 81], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 6 }, alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`FrogPay_${selectedProvider}_${timeRange}.pdf`);
    setIsExportMenuOpen(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a]/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in z-50 relative">
          <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: activeChartColor }} />
            <p className="text-white font-bold text-lg">
              {chartView === 'ingresos' ? formatCurrency(payload[0].value) : payload[0].value}
              <span className="text-gray-400 text-xs ml-2 font-normal capitalize">
                {chartView} {selectedProvider !== 'all' && `(${selectedProvider})`}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-[calc(100vh-2rem)] w-full p-4 sm:p-6 lg:p-8">

      {/* --- CORRECCIÓN CLAVE AQUÍ: Usamos `fixed top-4 left-4 right-4 z-[100]` en lugar de `sticky` --- */}
      <div className="fixed top-4 left-4 right-4 z-[100] flex items-center justify-between lg:hidden bg-black/70 border border-white/10 p-4 rounded-2xl backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black shadow-[0_0_15px_rgba(230,255,42,0.15)] border border-white/10">
            <span className="text-[#e6ff2a] font-bold">F</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Frog<span className="text-[#e6ff2a]">Pay</span>
          </span>
        </div>
        <button 
          onClick={onToggleSidebar}
          className="p-2 bg-white/5 rounded-xl border border-white/10 text-white transition-colors hover:bg-white/10 focus:outline-none"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* --- CORRECCIÓN CLAVE AQUÍ: Añadimos `pt-24 lg:pt-0` para que el contenido baje y no quede oculto detrás de la barra fixed --- */}
      <div className="relative z-10 mx-auto max-w-7xl space-y-6 sm:space-y-8 pt-24 lg:pt-0">

        {/* ENCABEZADO DE SECCIÓN */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between animate-fade-in">
          <div className="transition-all duration-500 transform">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} style={{ color: activeIncomeColor }} className="transition-colors duration-500" />
              <span className="text-xs font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: activeIncomeColor }}>
                Finanzas {selectedProvider !== 'all' && `> ${selectedProvider}`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white transition-colors">
              Rendimiento {selectedProvider === 'all' ? 'General' : providerData.find(p => p.id === selectedProvider).nombre}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.02] p-1 backdrop-blur-md shadow-lg">
              {['24h', '7d', '30d'].map((range) => (
                <button key={range} onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 focus:outline-none ${
                    timeRange === range ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 backdrop-blur-md shadow-lg focus:outline-none"
              >
                <Download size={16} /> <span className="hidden sm:inline">Exportar</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 shadow-2xl animate-fade-in z-50">
                  <button onClick={exportToPDF} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none">
                    <FileText size={16} className="text-red-400" /> Documento PDF
                  </button>
                  <button onClick={exportToExcel} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white focus:outline-none">
                    <FileSpreadsheet size={16} className="text-[#e6ff2a]" /> Hoja de Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI HERO ROW */}
        <div key={selectedProvider} className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 animate-fade-in">
          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] w-full">
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] transition-all duration-500 group-hover:scale-125 group-hover:-rotate-12 group-hover:opacity-[0.08]">
              <DollarSign size={150} style={{ color: activeIncomeColor }} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">Volumen Procesado</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{formatCurrency(currentKPIs.volumen)}</h2>
                <span className={`flex items-center text-sm font-bold border px-2.5 py-1 rounded-full ${currentKPIs.volCrec >= 0 ? 'text-[#e6ff2a] bg-[#e6ff2a]/10 border-[#e6ff2a]/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                  {currentKPIs.volCrec >= 0 ? <ArrowUpRight size={14} className="mr-1 stroke-[3]" /> : <ArrowDownRight size={14} className="mr-1 stroke-[3]" />} 
                  {Math.abs(currentKPIs.volCrec)}%
                </span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] w-full">
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.02] transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:opacity-[0.06]">
              <Activity size={150} className="text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">Pagos Exitosos</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{currentKPIs.transacciones}</h2>
                <span className={`flex items-center text-sm font-bold border px-2.5 py-1 rounded-full ${currentKPIs.txnCrec >= 0 ? 'text-[#e6ff2a] bg-[#e6ff2a]/10 border-[#e6ff2a]/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                  {currentKPIs.txnCrec >= 0 ? <ArrowUpRight size={14} className="mr-1 stroke-[3]" /> : <ArrowDownRight size={14} className="mr-1 stroke-[3]" />} 
                  {Math.abs(currentKPIs.txnCrec)}%
                </span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)] w-full">
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.02] transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 group-hover:opacity-[0.06]">
              <CreditCard size={150} className="text-gray-400" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">Ticket Promedio</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  {formatCurrency(currentKPIs.ticket)}
                </h2>
                <span className={`flex items-center text-sm font-bold border px-2.5 py-1 rounded-full ${currentKPIs.tkCrec >= 0 ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                  {currentKPIs.tkCrec >= 0 ? <ArrowUpRight size={14} className="mr-1 stroke-[3]" /> : <ArrowDownRight size={14} className="mr-1 stroke-[3]" />} 
                  {Math.abs(currentKPIs.tkCrec)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main Chart */}
          <div className="col-span-1 lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl flex flex-col transition-all duration-500 hover:border-white/10 hover:shadow-[0_10px_50px_rgba(0,0,0,0.2)] w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Evolución de Métricas</h3>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 self-start sm:self-auto shadow-inner">
                <button onClick={() => setChartView('ingresos')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 focus:outline-none ${chartView === 'ingresos' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Ingresos
                </button>
                <button onClick={() => setChartView('transacciones')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 focus:outline-none ${chartView === 'transacciones' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Volumen
                </button>
              </div>
            </div>

            <div className="w-full min-h-[300px] sm:min-h-[350px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDynamic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeChartColor} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={activeChartColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="fecha" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => chartView === 'ingresos' ? `Bs${val/1000}k` : val} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 2 }} />
                  <Area 
                    type="monotone" 
                    dataKey={activeDataKey} 
                    stroke={activeChartColor} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorDynamic)" 
                    isAnimationActive={true}
                    animationDuration={1500}
                    style={{ filter: `drop-shadow(0 4px 15px ${activeChartColor}30)` }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selector interactivo de Origen de Fondos */}
          <div className="col-span-1 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl flex flex-col relative transition-all duration-500 hover:border-white/10 hover:shadow-[0_10px_50px_rgba(0,0,0,0.2)] w-full">

            {selectedProvider !== 'all' && (
              <button 
                onClick={() => setSelectedProvider('all')}
                className="absolute top-6 right-6 flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all animate-fade-in focus:outline-none"
              >
                <FilterX size={14} /> Quitar
              </button>
            )}

            <h3 className="text-xl font-bold text-white tracking-tight mb-8">Origen de Fondos</h3>

            <div className="w-full min-h-[250px] sm:h-[200px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="nombre" type="category" hide />
                  <RechartsTooltip cursor={false} contentStyle={{display: 'none'}} />
                  <Bar 
                    dataKey="valor" 
                    radius={[0, 6, 6, 0]} 
                    barSize={32} 
                    onClick={(data) => setSelectedProvider(data.id)} 
                    className="cursor-pointer outline-none focus:outline-none"
                    activeBar={false}
                  >
                    {providerData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="none"
                        className="outline-none focus:outline-none"
                        style={{ 
                          outline: 'none',
                          transition: 'opacity 0.4s ease',
                          opacity: selectedProvider === 'all' || selectedProvider === entry.id ? 1 : 0.15 
                        }} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda interactiva con LOGOS */}
            <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
              {providerData.map((item) => {
                const IconComponent = item.Icon;
                const isSelected = selectedProvider === 'all' || selectedProvider === item.id;

                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedProvider(selectedProvider === item.id ? 'all' : item.id)}
                    className={`flex items-center justify-between group cursor-pointer p-3 -mx-3 rounded-2xl transition-all duration-300 ${
                      selectedProvider === item.id ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-xl shadow-md flex items-center justify-center transition-transform duration-500 group-hover:scale-110" 
                        style={{ backgroundColor: item.color, color: item.id === 'all' ? '#000' : '#fff' }}
                      >
                         <IconComponent size={16} />
                      </div>
                      <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                        {item.nombre}
                      </span>
                    </div>
                    <span className={`text-lg font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                      {item.valor}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ÚLTIMAS TRANSACCIONES */}
        <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/10 hover:shadow-[0_10px_50px_rgba(0,0,0,0.2)] w-full overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Últimas Transacciones</h3>
            <button className="text-sm font-bold text-[#e6ff2a] hover:text-[#c4d920] transition-colors focus:outline-none">
              Ver historial completo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium whitespace-nowrap">ID Transacción</th>
                  <th className="p-4 font-medium whitespace-nowrap">Fecha</th>
                  <th className="p-4 font-medium whitespace-nowrap">Proveedor</th>
                  <th className="p-4 font-medium whitespace-nowrap">Detalles de Pago</th>
                  <th className="p-4 font-medium whitespace-nowrap">Estado</th>
                  <th className="p-4 font-medium whitespace-nowrap text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTransactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 text-sm text-gray-400 font-mono">{txn.id}</td>
                    <td className="p-4 text-sm text-gray-400 whitespace-nowrap">{txn.fecha}</td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
                        txn.proveedor === 'tarjeta' ? 'bg-[#e6ff2a]/10 text-[#e6ff2a] border-[#e6ff2a]/20' : 'bg-[#0070ba]/10 text-[#0070ba] border-[#0070ba]/20'
                      }`}>
                        {txn.proveedor === 'tarjeta' ? <CreditCard size={14}/> : <PayPalIcon />}
                        <span className="capitalize text-xs font-bold">{txn.proveedor}</span>
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {txn.proveedor === 'tarjeta' ? `**** ${txn.ultimos_cuatro} (${txn.red})` : 'Cuenta Vinculada'}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        txn.estado === 'COMPLETED' ? 'bg-lime-400/10 text-lime-400 border-lime-400/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {txn.estado}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-white text-right whitespace-nowrap">
                      {formatCurrency(txn.monto, txn.moneda)} {txn.moneda}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}