import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  DollarSign, Activity, TrendingUp, Download, ArrowUpRight, ArrowDownRight, 
  CreditCard, Wallet, Calendar
} from 'lucide-react';

// --- DATOS DE PRUEBA (Mock) BASADOS EN TU TABLA 'pagos' e 'uso' ---
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
  const [chartView, setChartView] = useState('ingresos'); // 'ingresos' | 'transacciones'

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(value);
  };

  // Tooltip personalizado para Recharts adaptado al Dark Mode Fintech
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 text-sm mb-2 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-white font-bold">
                {entry.name === 'ingresos' ? formatCurrency(entry.value) : entry.value}
                <span className="text-gray-500 text-xs ml-1 font-normal capitalize">
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
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in p-6 lg:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-[#e6ff2a]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#e6ff2a]">Finanzas</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Rendimiento General</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selector de Rango */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#0a0a0a] p-1">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  timeRange === range 
                    ? 'bg-[#e6ff2a] text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {/* Botón Exportar */}
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/5 hover:border-white/20">
            <Download size={16} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI HERO ROW */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* KPI 1: Volumen Bruto */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 transition-all hover:border-[#e6ff2a]/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} className="text-[#e6ff2a]" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-400">Volumen Procesado</p>
            <div className="mt-2 flex items-baseline gap-3">
              <h2 className="text-4xl font-bold text-white">Bs 42,200</h2>
              <span className="flex items-center text-sm font-medium text-[#e6ff2a] bg-[#e6ff2a]/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={14} className="mr-1" /> 18.2%
              </span>
            </div>
            <p className="mt-4 text-xs text-gray-500 border-t border-white/5 pt-3">
              Comparado con el periodo anterior (Bs 35,700)
            </p>
          </div>
        </div>

        {/* KPI 2: Transacciones */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 transition-all hover:border-white/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={80} className="text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-400">Pagos Exitosos</p>
            <div className="mt-2 flex items-baseline gap-3">
              <h2 className="text-4xl font-bold text-white">1,110</h2>
              <span className="flex items-center text-sm font-medium text-[#e6ff2a] bg-[#e6ff2a]/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={14} className="mr-1" /> 5.4%
              </span>
            </div>
            <p className="mt-4 text-xs text-gray-500 border-t border-white/5 pt-3">
              Tasa de aprobación del 94.2%
            </p>
          </div>
        </div>

        {/* KPI 3: Ticket Promedio */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 transition-all hover:border-red-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard size={80} className="text-red-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-400">Ticket Promedio</p>
            <div className="mt-2 flex items-baseline gap-3">
              <h2 className="text-4xl font-bold text-white">Bs 38.01</h2>
              <span className="flex items-center text-sm font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                <ArrowDownRight size={14} className="mr-1" /> 1.2%
              </span>
            </div>
            <p className="mt-4 text-xs text-gray-500 border-t border-white/5 pt-3">
              Ligeramente por debajo del objetivo (Bs 40.00)
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Main Chart (Ingresos/Transacciones) */}
        <div className="col-span-1 rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Métricas de Crecimiento</h3>
            {/* Chart Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1">
              <button 
                onClick={() => setChartView('ingresos')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartView === 'ingresos' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Ingresos
              </button>
              <button 
                onClick={() => setChartView('transacciones')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartView === 'transacciones' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Volumen
              </button>
            </div>
          </div>
          
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartView === 'ingresos' ? '#e6ff2a' : '#0c4651'} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={chartView === 'ingresos' ? '#e6ff2a' : '#0c4651'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="fecha" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => chartView === 'ingresos' ? `Bs ${val/1000}k` : val} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={chartView} 
                  stroke={chartView === 'ingresos' ? '#e6ff2a' : '#0c4651'} 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorPrimary)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución por Proveedor (Basado en tu tabla 'proveedores') */}
        <div className="col-span-1 rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Origen de Fondos</h3>
          
          <div className="h-[180px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="nombre" type="category" hide />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#ffffff05'}} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={24}>
                  {providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
            {providerData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-400">{item.nombre}</span>
                </div>
                <span className="text-sm font-bold text-white">{item.valor}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}