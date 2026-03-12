import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Trash2, X, User, Phone, Mail, MessageSquare, Building2, Edit, Save } from 'lucide-react';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:8080';

function logAxiosError(prefix, err) {
  console.error(prefix, err);
  console.error('❌ status:', err.response?.status);
  console.error('❌ data:', err.response?.data);
}

const STATUS_LABELS = {
  NOVO:             { label: 'Novo',              color: 'bg-blue-50 text-blue-700'     },
  CONTATO_INICIAL:  { label: 'Contato Inicial',   color: 'bg-cyan-50 text-cyan-700'     },
  VISITOU:          { label: 'Visitou',            color: 'bg-purple-50 text-purple-700' },
  NEGOCIANDO:       { label: 'Negociando',         color: 'bg-orange-50 text-orange-700' },
  PROPOSTA_ENVIADA: { label: 'Proposta Enviada',   color: 'bg-yellow-50 text-yellow-700' },
  ANALISE_CREDITO:  { label: 'Análise de Crédito', color: 'bg-indigo-50 text-indigo-700' },
  FECHADO:          { label: 'Fechado',            color: 'bg-green-50 text-green-700'   },
  PERDIDO:          { label: 'Perdido',            color: 'bg-red-50 text-red-700'       },
};

const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:opacity-50 transition-all";

export default function CorretorLeads() {
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [leads, setLeads]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [toast, setToast]               = useState(null);
  const [viewLead, setViewLead]         = useState(null);
  const [editLead, setEditLead]         = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const getToken = () => {
    const t = localStorage.getItem('token');
    if (!t) throw new Error('Sem token. Faça login novamente.');
    return t;
  };

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/leads`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setLeads(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      logAxiosError('❌ Erro ao buscar leads:', err);
      const s = err.response?.status;
      if (err.message?.includes('Sem token') || s === 401 || s === 403) {
        showToast('Sessão expirada. Faça login novamente.', 'error');
        navigate('/login');
        return;
      }
      showToast(err.response?.data?.message || 'Erro ao carregar leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`${API}/api/leads/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setDeleteConfirm(null);
      showToast('Lead deletado com sucesso!');
      fetchLeads();
    } catch (err) {
      logAxiosError('❌ Erro ao deletar lead:', err);
      showToast(err.response?.status === 403 ? 'Sem permissão para deletar.' : err.response?.data?.message || 'Erro ao deletar', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeads();
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        const timer = setTimeout(() => fetchLeads(), 400);
        return () => clearTimeout(timer);
      } else {
        setLoading(false);
      }
    }
  }, [user, fetchLeads]);

  const filteredLeads = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return leads.filter(lead => {
      const matchSearch =
        (lead.nome || '').toLowerCase().includes(term) ||
        (lead.email || '').toLowerCase().includes(term) ||
        (lead.telefone || '').toLowerCase().includes(term) ||
        (lead.mensagem || '').toLowerCase().includes(term);
      return matchSearch && (filtroStatus === 'TODOS' || lead.status === filtroStatus);
    });
  }, [leads, searchTerm, filtroStatus]);

  const contadores = useMemo(() => {
    const c = { TODOS: leads.length };
    Object.keys(STATUS_LABELS).forEach(s => { c[s] = leads.filter(l => l.status === s).length; });
    return c;
  }, [leads]);

  const filterCards = [
    { key: 'TODOS',            label: 'Todos',      dot: 'bg-gray-400'   },
    { key: 'NOVO',             label: 'Novos',      dot: 'bg-blue-500'   },
    { key: 'CONTATO_INICIAL',  label: 'Contato',    dot: 'bg-cyan-500'   },
    { key: 'VISITOU',          label: 'Visita',     dot: 'bg-purple-500' },
    { key: 'NEGOCIANDO',       label: 'Negociando', dot: 'bg-orange-500' },
    { key: 'PROPOSTA_ENVIADA', label: 'Proposta',   dot: 'bg-yellow-500' },
    { key: 'ANALISE_CREDITO',  label: 'Análise',    dot: 'bg-indigo-500' },
    { key: 'FECHADO',          label: 'Fechados',   dot: 'bg-green-500'  },
    { key: 'PERDIDO',          label: 'Perdidos',   dot: 'bg-red-400'    },
  ];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Meus Leads</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gerencie os contatos dos seus imóveis</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filterCards.map(({ key, label, dot }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFiltroStatus(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filtroStatus === key
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${filtroStatus === key ? 'bg-white' : dot}`} />
            {label}
            <span className={`ml-0.5 ${filtroStatus === key ? 'text-white/60' : 'text-gray-400'}`}>
              {contadores[key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Pesquise por nome, email, telefone ou mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <svg className="animate-spin h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-gray-400">Carregando leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold">Nenhum lead encontrado</p>
          <p className="text-gray-400 text-xs mt-1">
            {filtroStatus !== 'TODOS' ? 'Tente outro filtro de status.' : 'Os leads aparecerão aqui quando clientes entrarem em contato.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Cabeçalho da tabela */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
              {['Cliente','Contato','Imóvel','Status','Data',''].map((h, i) => (
                <div key={i} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wider ${
                  i === 0 ? 'col-span-3' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-3' : i === 3 ? 'col-span-2' : i === 4 ? 'col-span-1' : 'col-span-1 text-right'
                }`}>{h}</div>
              ))}
            </div>

            {filteredLeads.map((lead, idx) => {
              const si = STATUS_LABELS[lead.status] || { label: lead.status, color: 'bg-gray-100 text-gray-600' };
              return (
                <div key={lead.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-2 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/30' : ''}`}>

                  {/* Cliente */}
                  <div className="md:col-span-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-blue-500" />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">{lead.nome || '—'}</p>
                  </div>

                  {/* Contato */}
                  <div className="md:col-span-2 flex flex-col justify-center gap-0.5">
                    {lead.email && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail size={11} className="flex-shrink-0" /><span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.telefone && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone size={11} className="flex-shrink-0" /><span>{lead.telefone}</span>
                      </div>
                    )}
                  </div>

                  {/* Imóvel */}
                  <div className="md:col-span-3 flex items-center gap-1.5">
                    <Building2 size={13} className="text-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-500 truncate">{lead.imovel?.titulo || '—'}</span>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 flex items-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${si.color}`}>{si.label}</span>
                  </div>

                  {/* Data */}
                  <div className="md:col-span-1 flex items-center">
                    <span className="text-xs text-gray-400">
                      {lead.dataCriacao ? new Date(lead.dataCriacao).toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="md:col-span-1 flex items-center justify-end gap-1">
                    <button type="button" title="Visualizar" onClick={() => setViewLead(lead)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"><Eye size={15} /></button>
                    <button type="button" title="Editar" onClick={() => setEditLead(lead)}
                      className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"><Edit size={15} /></button>
                    <button type="button" title="Deletar" onClick={() => setDeleteConfirm(lead)}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Mostrando {filteredLeads.length} de {leads.length} lead(s)
          </p>
        </>
      )}

      {/* MODAIS */}
      {viewLead   && <VisualizarLeadModal lead={viewLead} onClose={() => setViewLead(null)} />}
      {editLead   && (
        <EditarLeadModal
          lead={editLead}
          onClose={() => setEditLead(null)}
          onSuccess={() => { setEditLead(null); showToast('Lead atualizado com sucesso!'); fetchLeads(); }}
          onError={(msg) => showToast(msg || 'Erro ao atualizar lead', 'error')}
        />
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onMouseDown={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirmar exclusão</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja deletar o lead de <strong className="text-gray-800">"{deleteConfirm.nome}"</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="button" disabled={deletingId === deleteConfirm.id} onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
                {deletingId === deleteConfirm.id ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MODAL VISUALIZAR ──────────────────────────────────────────
function VisualizarLeadModal({ lead, onClose }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const si = STATUS_LABELS[lead.status] || { label: lead.status, color: 'bg-gray-100 text-gray-600' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden" onMouseDown={e => e.stopPropagation()}>

        {/* Header colorido */}
        <div className="bg-gray-900 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{lead.nome || '—'}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${si.color}`}>{si.label}</span>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Contato */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contato</p>
            <div className="space-y-2">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Mail size={15} className="text-blue-400 flex-shrink-0" />{lead.email}
                </a>
              )}
              {lead.telefone && (
                <a href={`tel:${lead.telefone}`} className="flex items-center gap-2 text-sm text-green-600 hover:underline">
                  <Phone size={15} className="text-green-400 flex-shrink-0" />{lead.telefone}
                </a>
              )}
            </div>
          </div>

          {lead.imovel && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Imóvel de Interesse</p>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Building2 size={16} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">{lead.imovel.titulo}</span>
              </div>
            </div>
          )}

          {lead.mensagem && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mensagem</p>
              <p className="text-sm text-gray-600 leading-relaxed p-3 bg-gray-50 rounded-xl">{lead.mensagem}</p>
            </div>
          )}

          {lead.bairroInteresse && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bairro de Interesse</p>
              <p className="text-sm text-gray-700">{lead.bairroInteresse}</p>
            </div>
          )}

          {(lead.faixaPrecoMin || lead.faixaPrecoMax) && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Faixa de Preço</p>
              <p className="text-sm text-gray-700">
                R$ {Number(lead.faixaPrecoMin || 0).toLocaleString('pt-BR')} — R$ {Number(lead.faixaPrecoMax || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          {lead.dataCriacao && (
            <p className="text-xs text-gray-400 text-right pt-2 border-t border-gray-50">
              Recebido em {new Date(lead.dataCriacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MODAL EDITAR ──────────────────────────────────────────────
function EditarLeadModal({ lead, onClose, onSuccess, onError }) {
  const [form, setForm] = useState({
    nome: lead.nome || '', email: lead.email || '', telefone: lead.telefone || '',
    mensagem: lead.mensagem || '', bairroInteresse: lead.bairroInteresse || '',
    status: lead.status || 'NOVO', origem: lead.origem || 'SITE',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Sem token. Faça login novamente.');
      const payload = { nome: form.nome, email: form.email, telefone: form.telefone, mensagem: form.mensagem || '', bairroInteresse: form.bairroInteresse || '', status: form.status, origem: form.origem || 'SITE' };
      await axios.put(`${API}/api/leads/${lead.id}`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      onSuccess?.();
    } catch (err) {
      logAxiosError('❌ Erro ao editar lead:', err);
      const msg = err.response?.data?.message || err.message || 'Erro ao editar';
      setError(msg); onError?.(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Editar Lead</h2>
            <p className="text-xs text-gray-400 mt-0.5">Atualize os dados e status do lead.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status *</label>
              <select name="status" value={form.status} onChange={onChange} className={inputCls} disabled={saving}>
                <option value="NOVO">Novo</option>
                <option value="CONTATO_INICIAL">Contato Inicial</option>
                <option value="VISITOU">Visitou</option>
                <option value="NEGOCIANDO">Negociando</option>
                <option value="PROPOSTA_ENVIADA">Proposta Enviada</option>
                <option value="ANALISE_CREDITO">Análise de Crédito</option>
                <option value="FECHADO">Fechado</option>
                <option value="PERDIDO">Perdido</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nome</label>
              <input name="nome" value={form.nome} onChange={onChange} className={inputCls} disabled={saving} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input name="email" type="email" value={form.email} onChange={onChange} className={inputCls} disabled={saving} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Telefone</label>
                <input name="telefone" value={form.telefone} onChange={onChange} className={inputCls} disabled={saving} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mensagem</label>
              <textarea name="mensagem" value={form.mensagem} onChange={onChange} className={inputCls} rows={3} disabled={saving} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Bairro de Interesse</label>
              <input name="bairroInteresse" value={form.bairroInteresse} onChange={onChange} className={inputCls} disabled={saving} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 active:scale-95 transition-all">
                <Save size={15} />{saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button type="button" onClick={onClose} disabled={saving}
                className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}