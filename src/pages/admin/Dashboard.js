import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Home, MessageSquare, TrendingUp } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCorretores: 0,
    totalImoveis: 0,
    totalLeads: 0,
    leadsNovos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('📡 Buscando estatísticas...');
      
      // Buscar dados dos 3 endpoints
      const [corretoresRes, imoveisRes, leadsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/corretores', config),
        axios.get('http://localhost:8080/api/admin/imoveis', config),
        axios.get('http://localhost:8080/api/admin/leads', config),
      ]);

      console.log('✅ Corretores:', corretoresRes.data);
      console.log('✅ Imóveis:', imoveisRes.data);
      console.log('✅ Leads:', leadsRes.data);

      // Contar leads novos (status === "NOVO")
      const leadsNovos = leadsRes.data.filter(lead => lead.status === 'NOVO').length;

      setStats({
        totalCorretores: corretoresRes.data.length,
        totalImoveis: imoveisRes.data.length,
        totalLeads: leadsRes.data.length,
        leadsNovos: leadsNovos,
      });
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      console.error('❌ Detalhes:', error.response?.data);
      setError('Erro ao carregar estatísticas. Verifique o console.');
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Total de Corretores',
      value: stats.totalCorretores,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total de Imóveis',
      value: stats.totalImoveis,
      icon: Home,
      color: 'bg-green-500',
    },
    {
      title: 'Total de Leads',
      value: stats.totalLeads,
      icon: MessageSquare,
      color: 'bg-purple-500',
    },
    {
      title: 'Leads Novos',
      value: stats.leadsNovos,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Carregando estatísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Bem-vindo ao Painel MOVV! 🎉
        </h2>
        <p className="text-gray-600 mb-4">
          Aqui você pode gerenciar todos os corretores, imóveis e leads da plataforma.
          Use o menu lateral para navegar entre as diferentes seções.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Estatísticas</h3>
            <p className="text-sm text-gray-600">Visualize métricas importantes do sistema</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">👥 Corretores</h3>
            <p className="text-sm text-gray-600">Gerencie todos os corretores cadastrados</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🏠 Imóveis</h3>
            <p className="text-sm text-gray-600">Veja todos os imóveis da plataforma</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
