import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Users, CheckCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';

function CorretorDashboard() {
  const [stats, setStats] = useState({
    totalImoveis: 0,
    totalLeads: 0,
    leadsConvertidos: 0,
    leadsEmAndamento: 0,
    valorTotal: 0,
    metaMes: 5,
  });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado. Faça login novamente.');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [imoveisRes, leadsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/imoveis', config),
        axios.get('http://localhost:8080/api/leads', config),
      ]);

      const imoveis = Array.isArray(imoveisRes.data) ? imoveisRes.data : [];
      const leads   = Array.isArray(leadsRes.data)   ? leadsRes.data   : [];

      const leadsConvertidos  = leads.filter(l => l.status === 'FECHADO' || l.status === 'CONVERTIDO').length;
      const leadsEmAndamento  = leads.filter(l => l.status !== 'FECHADO' && l.status !== 'PERDIDO').length;
      const imoveisAtivos     = imoveis.filter(i => i.ativo === true);
      const valorTotal        = imoveisAtivos.reduce((sum, i) => sum + (Number(i.valor) || 0), 0);
      const leadsOrdenados    = [...leads].sort((a, b) => {
        const da = a?.dataCriacao ? new Date(a.dataCriacao).getTime() : 0;
        const db = b?.dataCriacao ? new Date(b.dataCriacao).getTime() : 0;
        return db - da;
      });

      setStats({ totalImoveis: imoveis.length, totalLeads: leads.length, leadsConvertidos, leadsEmAndamento, valorTotal, metaMes: 5 });
      setRecentLeads(leadsOrdenados.slice(0, 5));
    } catch (error) {
      console.error('❌ Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Building2,    label: 'Meus Imóveis',      value: stats.totalImoveis,     iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   valuColor: 'text-blue-600'   },
    { icon: Users,        label: 'Total de Leads',     value: stats.totalLeads,       iconBg: 'bg-purple-50', iconColor: 'text-purple-500', valuColor: 'text-purple-600' },
    { icon: CheckCircle,  label: 'Leads Convertidos',  value: stats.leadsConvertidos, iconBg: 'bg-green-50',  iconColor: 'text-green-500',  valuColor: 'text-green-600'  },
    { icon: Clock,        label: 'Em Andamento',       value: stats.leadsEmAndamento, iconBg: 'bg-orange-50', iconColor: 'text-orange-500', valuColor: 'text-orange-600' },
  ];

  const statusBadge = (status) => {
    const map = {
      NOVO:        'bg-blue-100 text-blue-700',
      CONTATADO:   'bg-yellow-100 text-yellow-700',
      NEGOCIACAO:  'bg-orange-100 text-orange-700',
      CONVERTIDO:  'bg-green-100 text-green-700',
      FECHADO:     'bg-green-100 text-green-700',
      PERDIDO:     'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const convRate = stats.totalLeads > 0 ? Math.round((stats.leadsConvertidos / stats.totalLeads) * 100) : 0;
  const metaRate = Math.min((stats.leadsConvertidos / stats.metaMes) * 100, 100);

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/[0.04] p-5 flex items-center gap-4">
            <div className={`${card.iconBg} p-3 rounded-xl flex-shrink-0`}>
              <card.icon size={22} className={card.iconColor} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{card.label}</p>
              <p className={`text-2xl font-black ${card.valuColor}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desempenho + Valor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Desempenho */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/[0.04] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-blue-50 p-2 rounded-lg">
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-gray-800">Desempenho do Mês</h3>
          </div>

          <div className="space-y-5">
            {/* Taxa de conversão */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Taxa de Conversão</span>
                <span className="text-sm font-bold text-green-600">{convRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${convRate}%` }}
                />
              </div>
            </div>

            {/* Meta do mês */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Meta do Mês</span>
                <span className="text-sm font-bold text-blue-600">
                  {stats.leadsConvertidos}/{stats.metaMes}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${metaRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Valor total */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <DollarSign size={18} className="text-white" />
            </div>
            <h3 className="font-bold">Valor Total em Carteira</h3>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight">
              R$ {stats.valorTotal.toLocaleString('pt-BR')}
            </p>
            <p className="text-white/40 text-sm mt-1">Soma dos imóveis ativos</p>
          </div>
        </div>
      </div>

      {/* ── Leads Recentes ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/[0.04] p-6">
        <h3 className="font-bold text-gray-800 mb-5">Leads Recentes</h3>

        {recentLeads.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Nenhum lead encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 text-sm font-semibold text-gray-800">{lead.nome}</td>
                    <td className="py-3 text-sm text-gray-500 hidden sm:table-cell">{lead.email}</td>
                    <td className="py-3 text-sm text-gray-500 hidden md:table-cell">{lead.telefone}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-400 hidden lg:table-cell">
                      {lead.dataCriacao ? new Date(lead.dataCriacao).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CorretorDashboard;