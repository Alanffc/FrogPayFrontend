import React, { useEffect, useRef, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  DollarSign,
  Activity,
  TrendingUp,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  FilterX,
  Menu,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getKpis, getPayments, getPaymentDetail } from '../services/finance.service';

const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zM6.92 2h-1.51L2.298 21.337h1.51L6.92 2zM19.143 6.097c-1.112-1.267-3.12-1.81-5.69-1.81H5.998L2.886 23.411H7.49l.643-4.08h2.19c4.298 0 7.664-1.748 8.647-6.797.03-.15.054-.294.077-.437.292-1.867-.002-3.137-1.012-4.287z" />
  </svg>
);

const brandColors = {
  all: { income: '#e6ff2a', volume: '#0c4651' },
  tarjeta: { income: '#e6ff2a', volume: '#0c4651' },
  paypal: { income: '#0070ba', volume: '#003087' },
};

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
  { id: 'tarjeta', nombre: 'Tarjeta (Credito/Debito)', valor: 75, color: brandColors.tarjeta.income, Icon: CreditCard },
  { id: 'paypal', nombre: 'Billetera (PayPal)', valor: 25, color: brandColors.paypal.income, Icon: PayPalIcon },
];

const providerFilterMap = {
  tarjeta: 'card',
  paypal: 'paypal',
};

const providerLabelMap = {
  card: 'Tarjeta',
  paypal: 'PayPal',
  qr: 'QR',
  mock: 'Mock',
};

function normalizeProvider(provider) {
  return String(provider || '').toLowerCase();
}

function getProviderLabel(provider) {
  const normalized = normalizeProvider(provider);
  return providerLabelMap[normalized] || (normalized ? normalized.toUpperCase() : 'N/A');
}

function getProviderBadgeClass(provider) {
  const normalized = normalizeProvider(provider);
  if (normalized === 'paypal') return 'bg-[#0070ba]/10 text-[#0070ba] border-[#0070ba]/20';
  if (normalized === 'card') return 'bg-[#e6ff2a]/10 text-[#e6ff2a] border-[#e6ff2a]/20';
  if (normalized === 'qr') return 'bg-cyan-400/10 text-cyan-300 border-cyan-300/20';
  return 'bg-white/5 text-gray-300 border-white/10';
}

function getStatusBadgeClass(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'COMPLETED' || normalized === 'SUCCESS') {
    return 'bg-lime-400/10 text-lime-400 border-lime-400/20';
  }
  if (normalized === 'FAILED') {
    return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
  if (normalized === 'PENDING') {
    return 'bg-amber-400/10 text-amber-300 border-amber-300/20';
  }
  return 'bg-white/10 text-gray-300 border-white/20';
}

function formatDate(dateValue, fallback = 'Sin fecha') {
  if (!dateValue) return fallback;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return String(dateValue);

  return parsed.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getTransactionDateLabel(txn) {
  if (txn?.fecha) return txn.fecha;
  if (txn?.fecha_iso) return formatDate(txn.fecha_iso);
  if (txn?.creado_en) return formatDate(txn.creado_en);
  return 'Sin fecha';
}

export default function Finance({ onToggleSidebar }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [chartView, setChartView] = useState('ingresos');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');
  const [searchPaymentId, setSearchPaymentId] = useState('');
  const [debouncedSearchPaymentId, setDebouncedSearchPaymentId] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1, limit: 20 });

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const dropdownRef = useRef(null);

  const formatCurrency = (value, currency = 'BOB') => {
    const safeValue = Number(value || 0);
    try {
      return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: currency || 'BOB',
        maximumFractionDigits: 2,
      }).format(safeValue);
    } catch (_error) {
      return `${safeValue.toFixed(2)} ${currency || ''}`.trim();
    }
  };

  const activeIncomeColor = brandColors[selectedProvider].income;
  const activeVolumeColor = brandColors[selectedProvider].volume;
  const activeChartColor = chartView === 'ingresos' ? activeIncomeColor : activeVolumeColor;
  const activeDataKey = `${selectedProvider}_${chartView}`;

  const currentKPIs = kpis
    ? {
        volumen: kpis.volumenProcesado?.valor || 0,
        transacciones: kpis.pagosExitosos?.valor || 0,
        ticket: kpis.ticketPromedio?.valor || 0,
        volCrec: kpis.volumenProcesado?.crecimientoPorcentaje || 0,
        txnCrec: kpis.pagosExitosos?.crecimientoPorcentaje || 0,
        tkCrec: kpis.ticketPromedio?.crecimientoPorcentaje || 0,
      }
    : { volumen: 0, transacciones: 0, ticket: 0, volCrec: 0, txnCrec: 0, tkCrec: 0 };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchPaymentId(searchPaymentId.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchPaymentId]);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        const res = await getKpis(timeRange);
        setKpis(res.data);
      } catch (error) {
        console.error('Error cargando KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, [timeRange]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);
        setTransactionsError('');

        const providerFilter = selectedProvider === 'all' ? undefined : providerFilterMap[selectedProvider];

        const response = await getPayments({
          payment_id: debouncedSearchPaymentId || undefined,
          sort_by: 'fecha',
          order: sortOrder,
          provider: providerFilter,
          page: 1,
          limit: 20,
        });

        const items = Array.isArray(response?.data) ? response.data : [];
        setTransactions(items);
        setPagination(response?.pagination || { total: items.length, page: 1, total_pages: 1, limit: 20 });

        if (selectedPaymentId && !items.some((item) => item.payment_id === selectedPaymentId || item.id === selectedPaymentId)) {
          setSelectedPaymentId(null);
          setSelectedPaymentDetail(null);
          setDetailError('');
        }
      } catch (error) {
        setTransactions([]);
        setTransactionsError(error.message || 'No se pudo cargar la lista de transacciones.');
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [debouncedSearchPaymentId, sortOrder, selectedProvider]);

  const handleSelectTransaction = async (paymentId) => {
    if (!paymentId) return;

    try {
      setSelectedPaymentId(paymentId);
      setDetailLoading(true);
      setDetailError('');

      const response = await getPaymentDetail(paymentId);
      const detailPayload = response?.data || response;
      setSelectedPaymentDetail(detailPayload || null);
    } catch (error) {
      setSelectedPaymentDetail(null);
      setDetailError(error.message || 'No se pudo obtener el detalle de la transaccion.');
    } finally {
      setDetailLoading(false);
    }
  };

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

    chartData.forEach((item) => {
      worksheet.addRow({
        fecha: item.fecha,
        ingresos: item[`${selectedProvider}_ingresos`],
        transacciones: item[`${selectedProvider}_transacciones`],
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (rowNumber > 1) {
          cell.alignment = { horizontal: 'center' };
        }
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

    const tableColumn = ['Fecha', 'Ingresos (Bs)', 'Transacciones'];
    const tableRows = chartData.map((data) => [
      data.fecha,
      formatCurrency(data[`${selectedProvider}_ingresos`]),
      data[`${selectedProvider}_transacciones`].toString(),
    ]);

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [12, 70, 81], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 6 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
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

  if (loading) {
    return (
      <div className="text-[#e6ff2a] font-bold flex justify-center items-center h-screen animate-pulse">
        Cargando metricas financieras...
      </div>
    );
  }

  const selectedHistory = Array.isArray(selectedPaymentDetail?.historial_estados)
    ? selectedPaymentDetail.historial_estados
    : [];

  return (
    <div className="relative min-h-[calc(100vh-2rem)] w-full p-4 sm:p-6 lg:p-8">
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

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 sm:space-y-8 pt-24 lg:pt-0">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between animate-fade-in">
          <div className="transition-all duration-500 transform">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} style={{ color: activeIncomeColor }} className="transition-colors duration-500" />
              <span className="text-xs font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: activeIncomeColor }}>
                Finanzas {selectedProvider !== 'all' && `> ${selectedProvider}`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white transition-colors">
              Rendimiento {selectedProvider === 'all' ? 'General' : providerData.find((p) => p.id === selectedProvider)?.nombre}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.02] p-1 backdrop-blur-md shadow-lg">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 focus:outline-none ${
                    timeRange === range ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
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
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{formatCurrency(currentKPIs.ticket)}</h2>
                <span className={`flex items-center text-sm font-bold border px-2.5 py-1 rounded-full ${currentKPIs.tkCrec >= 0 ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                  {currentKPIs.tkCrec >= 0 ? <ArrowUpRight size={14} className="mr-1 stroke-[3]" /> : <ArrowDownRight size={14} className="mr-1 stroke-[3]" />}
                  {Math.abs(currentKPIs.tkCrec)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl flex flex-col transition-all duration-500 hover:border-white/10 hover:shadow-[0_10px_50px_rgba(0,0,0,0.2)] w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Evolucion de Metricas</h3>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 self-start sm:self-auto shadow-inner">
                <button
                  onClick={() => setChartView('ingresos')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 focus:outline-none ${chartView === 'ingresos' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Ingresos
                </button>
                <button
                  onClick={() => setChartView('transacciones')}
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
                      <stop offset="5%" stopColor={activeChartColor} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={activeChartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="fecha" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => (chartView === 'ingresos' ? `Bs${val / 1000}k` : val)} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 2 }} />
                  <Area
                    type="monotone"
                    dataKey={activeDataKey}
                    stroke={activeChartColor}
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorDynamic)"
                    isAnimationActive
                    animationDuration={1500}
                    style={{ filter: `drop-shadow(0 4px 15px ${activeChartColor}30)` }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                  <RechartsTooltip cursor={false} contentStyle={{ display: 'none' }} />
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
                          opacity: selectedProvider === 'all' || selectedProvider === entry.id ? 1 : 0.15,
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

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
                    <span className={`text-lg font-bold transition-colors ${isSelected ? 'text-white' : 'text-gray-600'}`}>{item.valor}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/10 hover:shadow-[0_10px_50px_rgba(0,0,0,0.2)] w-full overflow-hidden animate-fade-in">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">Transacciones</h3>
            <div className="text-xs text-gray-400">{pagination.total || transactions.length} registros</div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchPaymentId}
                onChange={(event) => setSearchPaymentId(event.target.value)}
                placeholder="Buscar por payment_id"
                className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/50"
              />
            </div>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/[0.08] transition-colors"
            >
              <ArrowUpDown size={15} />
              Fecha: {sortOrder === 'desc' ? 'Mas reciente' : 'Mas antigua'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium whitespace-nowrap">Payment ID</th>
                  <th className="p-4 font-medium whitespace-nowrap">Fecha</th>
                  <th className="p-4 font-medium whitespace-nowrap">Proveedor</th>
                  <th className="p-4 font-medium whitespace-nowrap">Referencia proveedor</th>
                  <th className="p-4 font-medium whitespace-nowrap">Estado</th>
                  <th className="p-4 font-medium whitespace-nowrap text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactionsLoading && (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-gray-400 text-center">
                      Cargando transacciones...
                    </td>
                  </tr>
                )}

                {!transactionsLoading && transactionsError && (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-red-400 text-center">
                      {transactionsError}
                    </td>
                  </tr>
                )}

                {!transactionsLoading && !transactionsError && transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-sm text-gray-400 text-center">
                      No hay transacciones para los filtros seleccionados.
                    </td>
                  </tr>
                )}

                {!transactionsLoading &&
                  !transactionsError &&
                  transactions.map((txn) => {
                    const txnId = txn.payment_id || txn.id;
                    const isSelected = selectedPaymentId === txnId;
                    const provider = normalizeProvider(txn.proveedor);

                    return (
                      <tr
                        key={txnId}
                        onClick={() => handleSelectTransaction(txnId)}
                        className={`cursor-pointer transition-colors group ${isSelected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.02]'}`}
                      >
                        <td className="p-4 text-sm text-gray-300 font-mono">{txnId}</td>
                        <td className="p-4 text-sm text-gray-400 whitespace-nowrap">{getTransactionDateLabel(txn)}</td>
                        <td className="p-4 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${getProviderBadgeClass(provider)}`}>
                            {provider === 'paypal' ? <PayPalIcon /> : <CreditCard size={14} />}
                            <span className="text-xs font-bold">{getProviderLabel(provider)}</span>
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-300 font-mono">{txn.provider_transaction_id || '-'}</td>
                        <td className="p-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(txn.estado)}`}>
                            {txn.estado || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-white text-right whitespace-nowrap">
                          {formatCurrency(txn.monto, txn.moneda)} {txn.moneda}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <h4 className="text-sm uppercase tracking-wide text-gray-400 mb-3">Detalle de transaccion</h4>

            {!selectedPaymentId && !detailLoading && (
              <p className="text-sm text-gray-400">Selecciona una transaccion del listado para ver historial de estados, proveedor y timestamps.</p>
            )}

            {detailLoading && <p className="text-sm text-gray-300">Cargando detalle...</p>}
            {detailError && <p className="text-sm text-red-400">{detailError}</p>}

            {!detailLoading && !detailError && selectedPaymentDetail && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Payment ID</p>
                    <p className="text-white font-mono break-all">{selectedPaymentDetail.payment_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Proveedor utilizado</p>
                    <p className="text-white">{getProviderLabel(selectedPaymentDetail.proveedor_utilizado || selectedPaymentDetail.proveedor)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estado actual</p>
                    <p className="text-white">{selectedPaymentDetail.estado || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monto</p>
                    <p className="text-white">{formatCurrency(selectedPaymentDetail.monto, selectedPaymentDetail.moneda)} {selectedPaymentDetail.moneda}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-gray-500 mb-1">Timestamp de creacion</p>
                    <p className="text-white">{selectedPaymentDetail.timestamps?.creado_en_legible || formatDate(selectedPaymentDetail.creado_en)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-gray-500 mb-1">Timestamp de actualizacion</p>
                    <p className="text-white">{selectedPaymentDetail.timestamps?.actualizado_en_legible || formatDate(selectedPaymentDetail.actualizado_en)}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-white mb-2">Historial de estados</h5>
                  {selectedHistory.length === 0 && <p className="text-sm text-gray-400">Sin historial disponible.</p>}
                  {selectedHistory.length > 0 && (
                    <div className="space-y-2">
                      {selectedHistory.map((event, idx) => (
                        <div key={`${event.timestamp || idx}-${idx}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="text-white font-medium">
                              {(event.from_state || 'INIT')}
                              {' -> '}
                              {(event.to_state || event.estado || 'N/A')}
                            </p>
                            <p className="text-gray-400">{event.timestamp_legible || formatDate(event.timestamp)}</p>
                          </div>
                          <p className="text-gray-400 mt-1">
                            Proveedor: {getProviderLabel(event.provider || selectedPaymentDetail.proveedor)}
                            {event.provider_transaction_id ? ` | Ref: ${event.provider_transaction_id}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
