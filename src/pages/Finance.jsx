import React, { useState, useRef, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  DollarSign, Activity, TrendingUp, Download, ArrowUpRight, ArrowDownRight, 
  CreditCard, FileText, FileSpreadsheet, ChevronDown
} from 'lucide-react';

// Librerías para Exportación Robusta
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// --- DATOS MOCK ---
const chartData = [
  { fecha: '01 Abr', ingresos: 4500, transacciones: 120, ticket: 37.5 },
  { fecha: '02 Abr', ingresos: 5200, transacciones: 145, ticket: 35.8 },
  { fecha: '03 Abr', ingresos: 4800, transacciones: 130, ticket: 36.9 },
  { fecha: '04 Abr', ingresos: 6100, transacciones: 160, ticket: 38.1 },
  { fecha: '05 Abr', ingresos: 5900, transacciones: 155, ticket: 38.0 },
  { fecha: '06 Abr', ingresos: 7500, transacciones: 190, ticket: 39.4 },
  { fecha: '07 Abr', ingresos: 8200, transacciones: 210, ticket: 39.0 },
];

const providerData = [
  { nombre: 'Tarjetas (Stripe)', valor: 65, color: '#e6ff2a' },
  { nombre: 'Billeteras (PayPal)', valor: 25, color: '#0c4651' },
  { nombre: 'Cripto', valor: 10, color: '#ffffff' },
];

export default function Finance() {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartView, setChartView] = useState('ingresos');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(value);
  };

  // --- LÓGICA DE EXPORTACIÓN ROBUSTA ---
  
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Financiero');

    // Configurar Cabeceras con anchos específicos
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Ingresos (Bs)', key: 'ingresos', width: 20 },
      { header: 'Transacciones', key: 'transacciones', width: 18 },
      { header: 'Ticket Promedio (Bs)', key: 'ticket', width: 25 },
    ];

    // Estilos de la Cabecera (Colores de FrogPay)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0C4651' } // Tu azul/verde oscuro
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar Datos
    chartData.forEach(item => {
      worksheet.addRow({
        fecha: item.fecha,
        ingresos: item.ingresos,
        transacciones: item.transacciones,
        ticket: item.ticket
      });
    });

    // Aplicar Bordes y Centrado a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (rowNumber > 1) {
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    // Generar archivo y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FrogPay_Finanzas_${timeRange}.xlsx`);
    setIsExportMenuOpen(false);
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header oscuro FrogPay en el PDF
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
      doc.text(`Resumen de Actividad (${timeRange})`, 14, 55);

      const tableColumn = ["Fecha", "Ingresos (Bs)", "Transacciones", "Ticket Prom. (Bs)"];
      const tableRows = chartData.map(data => [
        data.fecha, 
        formatCurrency(data.ingresos), 
        data.transacciones.toString(), 
        formatCurrency(data.ticket)
      ]);

      // Generación robusta de tabla
      autoTable(doc, {
        startY: 65,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [12, 70, 81], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 6 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`FrogPay_Finanzas_${timeRange}.pdf`);
      setIsExportMenuOpen(false);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un problema al generar el PDF. Revisa la consola.");
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-white font-bold">
                {entry.name === 'ingresos' ? formatCurrency(entry.value) : entry.value}
                <span className="text-gray-400 text-xs ml-1 font-normal capitalize">
                  {entry.name}
                </span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-[calc(100vh-2rem)] w-full overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* SE ELIMINÓ EL GRADIENTE ANIMADO DE FONDO */}

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 sm:space-y-8 animate-fade-in">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[#e6ff2a]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#e6ff2a]">
                Finanzas
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Rendimiento General</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Rango (Glassmorphism sutil) */}
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.02] p-1 backdrop-blur-md">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    timeRange === range 
                      ? 'bg-[#e6ff2a] text-black shadow-[0_0_15px_rgba(230,255,42,0.15)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Dropdown de Exportación */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 backdrop-blur-md"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0a0a0a] p-2 shadow-2xl animate-fade-in z-50">
                  <button 
                    onClick={exportToPDF}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <FileText size={16} className="text-red-400" />
                    Documento PDF
                  </button>
                  <button 
                    onClick={exportToExcel}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <FileSpreadsheet size={16} className="text-[#e6ff2a]" />
                    Hoja de Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI HERO ROW */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#e6ff2a]/30 hover:bg-white/[0.04]">
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 transform group-hover:scale-110">
              <DollarSign size={150} className="text-[#e6ff2a]" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">Volumen Procesado</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Bs 42,200</h2>
                <span className="flex items-center text-sm font-bold text-[#e6ff2a] bg-[#e6ff2a]/10 border border-[#e6ff2a]/20 px-2.5 py-1 rounded-full">
                  <ArrowUpRight size={14} className="mr-1 stroke-[3]" /> 18.2%
                </span>
              </div>
              <p className="mt-6 text-xs text-gray-500 border-t border-white/5 pt-4">
                Comparado con el periodo anterior (Bs 35,700)
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300 transform group-hover:scale-110">
              <Activity size={150} className="text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">Pagos Exitosos</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">1,110</h2>
                <span className="flex items-center text-sm font-bold text-[#e6ff2a] bg-[#e6ff2a]/10 border border-[#e6ff2a]/20 px-2.5 py-1 rounded-full">
                  <ArrowUpRight size={14} className="mr-1 stroke-[3]" /> 5.4%
                </span>
              </div>
              <p className="mt-6 text-xs text-gray-500 border-t border-white/5 pt-4">
                Tasa de aprobación del 94.2%
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 hover:border-red-500/30 hover:bg-white/[0.04]">
            <div className="absolute -top-10 -right-10 p-4 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-300 transform group-hover:scale-110">
              <CreditCard size={150} className="text-red-500" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-400">Ticket Promedio</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Bs 38.01</h2>
                <span className="flex items-center text-sm font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">
                  <ArrowDownRight size={14} className="mr-1 stroke-[3]" /> 1.2%
                </span>
              </div>
              <p className="mt-6 text-xs text-gray-500 border-t border-white/5 pt-4">
                Ligeramente por debajo del objetivo (Bs 40.00)
              </p>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          <div className="col-span-1 lg:col-span-2 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Evolución de Métricas</h3>
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 self-start sm:self-auto">
                <button 
                  onClick={() => setChartView('ingresos')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${chartView === 'ingresos' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Ingresos
                </button>
                <button 
                  onClick={() => setChartView('transacciones')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${chartView === 'transacciones' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Volumen
                </button>
              </div>
            </div>
            
            <div className="h-[250px] sm:h-[320px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartView === 'ingresos' ? '#e6ff2a' : '#0c4651'} stopOpacity={0.5}/>
                      <stop offset="95%" stopColor={chartView === 'ingresos' ? '#e6ff2a' : '#0c4651'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="fecha" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => chartView === 'ingresos' ? `Bs${val/1000}k` : val} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff10', strokeWidth: 2 }} />
                  <Area 
                    type="monotone" 
                    dataKey={chartView} 
                    stroke={chartView === 'ingresos' ? '#e6ff2a' : '#0c4651'} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPrimary)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-1 rounded-3xl border border-white/5 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl flex flex-col">
            <h3 className="text-xl font-bold text-white tracking-tight mb-8">Origen de Fondos</h3>
            
            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="nombre" type="category" hide />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                  <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={28}>
                    {providerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
              {providerData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-sm shadow-md" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">{item.nombre}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.valor}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}