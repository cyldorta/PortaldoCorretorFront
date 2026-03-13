import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Trash2, Filter, X } from 'lucide-react';
import Toast from '../../components/common/Toast';

const API_BASE_URL = 'https://fixed-mari-dev-master-0c3ca107.koyeb.app';

const STATUS_CONFIG = {
  NOVO:        { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Novo'        },
  EM_CONTATO:  { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Em Contato'  },
  INTERESSADO: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Interessado' },
  VISITOU:     { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Visitou'     },
  NEGOCIACAO:  { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Negociação'  },
  CONVERTIDO:  { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Convertido'  },
  PERDIDO:     { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Perdido'     },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.NOVO;
  return (
    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

function Leads() {
  const [leads, setLeads]               = useState([]);
  const [corretores, setCorretores]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [corretorFilter, setCorretorFilter] = useState('TODOS');
  const [showModal, setShowModal]       = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [toast, setToast]               = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token  = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [leadsRes, corretoresRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/leads`, config),
        axios.get(`${API_BASE_URL}/api/admin/corretores`, config),
      ]);
      setLeads(leadsRes.data);
      setCorretores(corretoresRes.data);
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar o lead de ${nome}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/admin/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Lead deletado com sucesso!');
      fetchData();
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      showToast('Erro ao deletar lead!', 'error');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      lead.nome?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.telefone?.toLowerCase().includes(term);
    const matchStatus   = statusFilter === 'TODOS'   || lead.status === statusFilter;
    const matchCorretor = corretorFilter === 'TODOS' || lead.corretor?.id === parseInt(corretorFilter);
    return matchSearch && matchStatus && matchCorretor;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-sm text-gray-500">Carregando leads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Leads</h1>
        <p className="text-sm text-gray-500 mt-1">Visualize todos os leads da plataforma</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Filter className="inline mr-1" size={13} /> Status
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Filter className="inline mr-1" size={13} /> Corretor
            </label>
            <select value={corretorFilter} onChange={(e) => setCorretorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="TODOS">Todos os Corretores</option>
              {corretores.map(c => (
                <option key={c.id} value={c.id}>{c.nomeCompleto}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela desktop / Cards mobile */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        {/* Tabela — md+ */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Cliente','Contato','Corretor','Imóvel','Status','Data','Ações'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Nenhum lead encontrado
                  </td>
                </tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.nome}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-xs text-gray-600">{lead.email}</p>
                    <p className="text-xs text-gray-500">{lead.telefone}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                    {lead.corretor?.nomeCompleto || '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 max-w-[160px] truncate">
                    {lead.imovel?.titulo || '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                    {lead.dataCriacao ? new Date(lead.dataCriacao).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSelectedLead(lead); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-900" title="Ver Detalhes">
                        <Eye size={17} />
                      </button>
                      <button onClick={() => handleDelete(lead.id, lead.nome)}
                        className="text-red-600 hover:text-red-900" title="Deletar">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile (< md) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredLeads.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum lead encontrado</p>
          ) : filteredLeads.map((lead) => (
            <div key={lead.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{lead.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                  {lead.telefone && <p className="text-xs text-gray-400">{lead.telefone}</p>}
                </div>
                <StatusBadge status={lead.status} />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {lead.corretor?.nomeCompleto && <span>👤 {lead.corretor.nomeCompleto}</span>}
                {lead.imovel?.titulo         && <span className="truncate max-w-[180px]">🏠 {lead.imovel.titulo}</span>}
                {lead.dataCriacao            && <span>📅 {new Date(lead.dataCriacao).toLocaleDateString('pt-BR')}</span>}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setSelectedLead(lead); setShowModal(true); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Eye size={14} /> Ver
                </button>
                <button
                  onClick={() => handleDelete(lead.id, lead.nome)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Mostrando {filteredLeads.length} de {leads.length} lead(s)
      </p>

      {showModal && selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => { setShowModal(false); setSelectedLead(null); }} />
      )}
    </div>
  );
}

// ── MODAL ────────────────────────────────────────────────────
function LeadModal({ lead, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Detalhes do Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">

          {/* Informações do cliente */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">📋 Informações do Cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Nome',            value: lead.nome      },
                { label: 'Email',           value: lead.email     },
                { label: 'Telefone',        value: lead.telefone  },
                { label: 'Data de Criação', value: lead.dataCriacao ? new Date(lead.dataCriacao).toLocaleDateString('pt-BR') : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-800 break-words">{value || '—'}</p>
                </div>
              ))}
            </div>
            {lead.mensagem && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Mensagem</p>
                <p className="bg-white p-3 rounded-lg text-sm text-gray-700 leading-relaxed">{lead.mensagem}</p>
              </div>
            )}
          </div>

          {/* Atribuição */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">👤 Atribuição</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Corretor Responsável</p>
                <p className="text-sm font-medium text-gray-800">{lead.corretor?.nomeCompleto || 'Não atribuído'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status Atual</p>
                <StatusBadge status={lead.status} />
              </div>
            </div>
          </div>

          {/* Interesse */}
          {(lead.imovel || lead.tipoImovelInteresse) && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">🏠 Interesse</h3>
              {lead.imovel && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500">Imóvel de Interesse</p>
                  <p className="text-sm font-medium text-gray-800">{lead.imovel.titulo}</p>
                </div>
              )}
              {lead.tipoImovelInteresse && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Imóvel</p>
                    <p className="text-sm font-medium text-gray-800">{lead.tipoImovelInteresse}</p>
                  </div>
                  {lead.faixaPrecoMin && (
                    <div>
                      <p className="text-xs text-gray-500">Faixa de Preço</p>
                      <p className="text-sm font-medium text-gray-800">
                        R$ {Number(lead.faixaPrecoMin).toLocaleString('pt-BR')} — R$ {Number(lead.faixaPrecoMax).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t">
            <button onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leads;
