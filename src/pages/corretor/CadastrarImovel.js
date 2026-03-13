import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Search, Plus, Eye, Edit, Trash2, Building2, MapPin, DollarSign, X } from 'lucide-react';
import Toast from '../../components/common/Toast';

const API = 'https://fixed-mari-dev-master-0c3ca107.koyeb.app';

function toNumberOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toIntOrNull(v) {
  const n = toNumberOrNull(v);
  if (n === null) return null;
  return parseInt(String(n), 10);
}

function buildImovelPayload(form) {
  const payload = {
    titulo: form.titulo?.trim(),
    descricao: form.descricao?.trim() || 'Sem descrição',
    tipo: form.tipo,
    padrao: form.padrao || null,
    cidade: form.cidade?.trim(),
    bairro: form.bairro?.trim(),
    endereco: form.endereco?.trim() ? form.endereco.trim() : null,
    metragem: toNumberOrNull(form.metragem),
    quartos: toIntOrNull(form.quartos),
    banheiros: toIntOrNull(form.banheiros),
    vagas: toIntOrNull(form.vagas),
    valor: form.valor === '' ? null : String(form.valor),
    ativo: !!form.ativo,
  };
  Object.keys(payload).forEach((k) => payload[k] == null && delete payload[k]);
  return payload;
}

export default function CorretorImoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchImoveis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToastMessage = (message, type = 'success') => setToast({ message, type });

  const fetchImoveis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API}/api/imoveis`, config);
      setImoveis(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Erro ao buscar imóveis:', error);
      showToastMessage('Erro ao carregar imóveis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredImoveis = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return imoveis.filter((imovel) =>
      (imovel.titulo || '').toLowerCase().includes(term) ||
      (imovel.cidade || '').toLowerCase().includes(term) ||
      (imovel.bairro || '').toLowerCase().includes(term)
    );
  }, [imoveis, searchTerm]);

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meus Imóveis</h1>
          <p className="text-gray-600 mt-2">Gerencie seus imóveis cadastrados</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Imóvel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por título, cidade ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-xl text-gray-600">Carregando imóveis...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImoveis.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">Nenhum imóvel encontrado</p>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Cadastrar Primeiro Imóvel
                </button>
              </div>
            ) : (
              filteredImoveis.map((imovel) => (
                <div key={imovel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {imovel.fotos && imovel.fotos.length > 0 ? (
                    <img src={imovel.fotos[0].url} alt={imovel.titulo} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Building2 className="text-white" size={48} />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{imovel.titulo}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin size={16} className="mr-1" />
                      {imovel.bairro}, {imovel.cidade}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center text-green-600 font-bold">
                        <DollarSign size={18} />
                        <span>R$ {Number(imovel.valor || 0).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                        <button type="button" className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"><Edit size={18} /></button>
                        <button type="button" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${imovel.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {imovel.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 text-sm text-gray-600">
            Mostrando {filteredImoveis.length} de {imoveis.length} imóvel(is)
          </div>
        </>
      )}

      {showCreateModal && (
        <CadastrarImovelModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            showToastMessage('Imóvel cadastrado com sucesso!', 'success');
            fetchImoveis();
          }}
          onError={(msg) => showToastMessage(msg || 'Erro ao cadastrar imóvel', 'error')}
        />
      )}
    </div>
  );
}

function CadastrarImovelModal({ onClose, onSuccess, onError }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '', tipo: 'CASA', padrao: 'ALTOPADRAO',
    cidade: '', bairro: '', endereco: '', metragem: '',
    quartos: '', banheiros: '', vagas: '', valor: '', ativo: true,
  });
  const [fotos, setFotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onFotosChange = (e) => setFotos(Array.from(e.target.files || []));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado. Faça login novamente.');

      const payload = buildImovelPayload(form);

      const createRes = await axios.post(`${API}/api/imoveis`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = createRes.data;
      const imovelId = body?.id ?? body?.data ?? body;
      if (!imovelId) throw new Error('Não consegui obter o ID do imóvel criado.');

      for (const file of fotos) {
        const fd = new FormData();
        fd.append('file', file);
        await axios.post(`${API}/api/imoveis/${imovelId}/fotos`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onSuccess?.();
    } catch (err) {
      console.error('❌ Erro ao cadastrar imóvel:', err);
      console.error('❌ Resposta:', err.response?.data);
      const msg = err.response?.data?.message || err.message || 'Erro ao cadastrar imóvel';
      setError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl border border-white/30 bg-white/70 shadow-2xl backdrop-blur-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/30">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cadastrar imóvel</h2>
            <p className="text-sm text-gray-600">Preencha os dados e envie fotos (opcional).</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/60 transition" title="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input name="titulo" value={form.titulo} onChange={onChange} required disabled={saving}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
              <textarea name="descricao" value={form.descricao} onChange={onChange} rows={3} disabled={saving}
                placeholder="Obrigatório (o backend não aceita vazio)."
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select name="tipo" value={form.tipo} onChange={onChange} disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80">
                  <option value="CASA">CASA</option>
                  <option value="APARTAMENTO">APARTAMENTO</option>
                  <option value="TERRENO">TERRENO</option>
                  <option value="COMERCIAL">COMERCIAL</option>
                  <option value="OUTRO">OUTRO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Padrão</label>
                <select name="padrao" value={form.padrao} onChange={onChange} disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80">
                  <option value="ALTOPADRAO">ALTOPADRAO</option>
                  <option value="MEDIO">MEDIO</option>
                  <option value="POPULAR">POPULAR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                <input name="cidade" value={form.cidade} onChange={onChange} required disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                <input name="bairro" value={form.bairro} onChange={onChange} required disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                <input name="valor" type="number" value={form.valor} onChange={onChange} required min="0" step="0.01" disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input name="endereco" value={form.endereco} onChange={onChange} disabled={saving}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metragem</label>
                <input name="metragem" type="number" value={form.metragem} onChange={onChange} step="0.01" disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
                <input name="quartos" type="number" value={form.quartos} onChange={onChange} min="0" disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
                <input name="banheiros" type="number" value={form.banheiros} onChange={onChange} min="0" disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
                <input name="vagas" type="number" value={form.vagas} onChange={onChange} min="0" disabled={saving}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-white/80" />
              </div>
              <div className="flex items-end gap-2">
                <input id="ativo" name="ativo" type="checkbox" checked={form.ativo} onChange={onChange} className="h-4 w-4" disabled={saving} />
                <label htmlFor="ativo" className="text-sm text-gray-700">Ativo</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
              <input type="file" multiple accept="image/*" onChange={onFotosChange} disabled={saving} />
              <p className="text-xs text-gray-500 mt-1">
                Upload via <code>POST /api/imoveis/{'{id}'}/fotos</code> com campo <code>file</code>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={onClose} disabled={saving}
                className="px-4 py-2 rounded border border-gray-300 bg-white/70 hover:bg-white">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
