import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Trash2, Filter, X } from 'lucide-react';
import Toast from '../../components/common/Toast';

const API_BASE_URL = 'https://fixed-mari-dev-master-0c3ca107.koyeb.app';

function Leads() {
  const [leads, setLeads] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [corretorFilter, setCorretorFilter] = useState('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [leadsRes, corretoresRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/leads`, config),
        axios.get(`${API_BASE_URL}/api/admin/corretores`, config),
      ]);

      setLeads(leadsRes.data);
      setCorretores(corretoresRes.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar o lead de ${nome}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/admin/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Lead deletado com sucesso!', 'success');
      fetchData();
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      showToast('Erro ao deletar lead!', 'error');
    }
  };

  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchSearch =
      lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'TODOS' || lead.status === statusFilter;
    const matchCorretor = corretorFilter === 'TODOS' || lead.corretor?.id === parseInt(corretorFilter);
    return matchSearch && matchStatus && matchCorretor;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      NOVO:        { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Novo'        },
      EM_CONTATO:  { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Contato'  },
      INTERESSADO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Interessado' },
      VISITOU:     { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Visitou'     },
      NEGOCIACAO:  { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Negociação'  },
      CONVERTIDO:  { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Convertido'  },
      PERDIDO:     { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Perdido'     },
    };
    const config = statusConfig[status] || statusConfig.NOVO;
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Carregando leads...</div>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leads (Pistas)</h1>
        <p className="text-gray-600 mt-2">Visualize todos os leads da plataforma</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline mr-2" size={16} />Filtrar por Status
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="TODOS">Todos os Status</option>
              <option value="NOVO">Novo</option>
              <option value="EM_CONTATO">Em Contato</option>
              <option value="INTERESSADO">Interessado</option>
              <option value="VISITOU">Visitou</option>
              <option value="NEGOCIACAO">Negociação</option>
              <option value="CONVERTIDO">Convertido</option>
              <option value="PERDIDO">Perdido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline mr-2" size={16} />Filtrar por Corretor
            </label>
            <select value={corretorFilter} onChange={(e) => setCorretorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="TODOS">Todos os Corretores</option>
              {corretores.map(corretor => (
                <option key={corretor.id} value={corretor.id}>{corretor.nomeCompleto}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Corretor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imóvel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">Nenhum lead encontrado</td></tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.telefone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.corretor?.nomeCompleto || 'Não atribuído'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.imovel?.titulo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(lead.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(lead.dataCriacao).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleViewDetails(lead)} className="text-blue-600 hover:text-blue-900" title="Ver Detalhes">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDelete(lead.id, lead.nome)} className="text-red-600 hover:text-red-900" title="Deletar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredLeads.length} de {leads.length} lead(s)
      </div>

      {showModal && selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => { setShowModal(false); setSelectedLead(null); }} />
      )}
    </div>
  );
}

function LeadModal({ lead, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">Detalhes do Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Informações do Cliente</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-sm text-gray-600">Nome</p><p className="font-medium">{lead.nome}</p></div>
              <div><p className="text-sm text-gray-600">Email</p><p className="font-medium">{lead.email}</p></div>
              <div><p className="text-sm text-gray-600">Telefone</p><p className="font-medium">{lead.telefone}</p></div>
              <div><p className="text-sm text-gray-600">Data de Criação</p><p className="font-medium">{new Date(lead.dataCriacao).toLocaleDateString('pt-BR')}</p></div>
            </div>
            {lead.mensagem && (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Mensagem</p>
                <p className="bg-white p-3 rounded mt-1">{lead.mensagem}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">👤 Atribuição</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-sm text-gray-600">Corretor Responsável</p><p className="font-medium">{lead.corretor?.nomeCompleto || 'Não atribuído'}</p></div>
              <div>
                <p className="text-sm text-gray-600">Status Atual</p>
                <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                  lead.status === 'CONVERTIDO' ? 'bg-green-100 text-green-800' :
                  lead.status === 'PERDIDO' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{lead.status}</span>
              </div>
            </div>
          </div>

          {(lead.imovel || lead.tipoImovelInteresse) && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">🏠 Interesse</h3>
              {lead.imovel && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Imóvel de Interesse</p>
                  <p className="font-medium">{lead.imovel.titulo}</p>
                </div>
              )}
              {lead.tipoImovelInteresse && (
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-sm text-gray-600">Tipo de Imóvel</p><p className="font-medium">{lead.tipoImovelInteresse}</p></div>
                  {lead.faixaPrecoMin && (
                    <div>
                      <p className="text-sm text-gray-600">Faixa de Preço</p>
                      <p className="font-medium">R$ {lead.faixaPrecoMin?.toLocaleString('pt-BR')} - R$ {lead.faixaPrecoMax?.toLocaleString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leads;
