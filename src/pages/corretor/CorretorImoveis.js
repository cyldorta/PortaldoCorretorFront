import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye, Edit, Trash2, Building2, MapPin,
  DollarSign, X, Save, Star, Upload, Image
} from 'lucide-react';
import Toast from '../../components/common/Toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
    descricao: form.descricao?.trim() || 'Sem descricao',
    tipo: form.tipo,
    padrao: form.padrao || null,
    cidade: form.cidade?.trim(),
    bairro: form.bairro?.trim(),
    endereco: form.endereco?.trim() || null,
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

const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 disabled:opacity-50 transition-all";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

// ── GERENCIADOR DE FOTOS ──────────────────────────────────────
function GerenciadorFotos({ imovelId, fotosIniciais = [], token, onChange }) {
  const [fotos, setFotos] = useState(fotosIniciais);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  const handleUpload = async (files) => {
    if (!files.length) return;
    setError('');
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        await axios.post(`${API}/api/imoveis/${imovelId}/fotos`, fd, { headers });
      }
      const listRes = await axios.get(`${API}/api/imoveis/${imovelId}`, { headers });
      const atualizadas = listRes.data?.fotos || [];
      setFotos(atualizadas);
      onChange?.(atualizadas);
      setPreviews([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer upload das fotos');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fotoId) => {
    setError('');
    setDeletingId(fotoId);
    try {
      await axios.delete(`${API}/api/imoveis/${imovelId}/fotos/${fotoId}`, { headers });
      const atualizadas = fotos.filter(f => f.id !== fotoId);
      setFotos(atualizadas);
      onChange?.(atualizadas);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao deletar foto');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrincipal = async (fotoId) => {
    setError('');
    try {
      await axios.patch(`${API}/api/imoveis/${imovelId}/fotos/${fotoId}/principal`, {}, { headers });
      const atualizadas = fotos.map(f => ({ ...f, principal: f.id === fotoId }));
      setFotos(atualizadas);
      onChange?.(atualizadas);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao definir foto principal');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const ps = files.map(f => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    setPreviews(ps);
    handleUpload(files);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">{error}</div>
      )}

      <label className={`
        flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200
        rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all
        ${uploading ? 'opacity-50 pointer-events-none' : ''}
      `}>
        <Upload size={22} className="text-gray-400 mb-2" />
        <span className="text-sm font-semibold text-gray-500">
          {uploading ? 'Enviando fotos...' : 'Clique para adicionar fotos'}
        </span>
        <span className="text-xs text-gray-400 mt-0.5">PNG, JPG até 10MB cada</span>
        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>

      {uploading && previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-blue-200">
              <img src={p.previewUrl} alt="preview" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {fotos.length === 0 && !uploading ? (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-gray-100">
          <Image size={32} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Nenhuma foto cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                foto.principal ? 'border-amber-400 shadow-md shadow-amber-100' : 'border-gray-100'
              }`}
            >
              <img src={foto.thumbnailUrl || foto.url} alt="foto imovel" className="w-full h-24 object-cover" />

              {foto.principal && (
                <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={9} fill="white" /> CAPA
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!foto.principal && (
                  <button
                    type="button"
                    title="Definir como foto principal"
                    onClick={() => handleSetPrincipal(foto.id)}
                    className="p-1.5 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors"
                  >
                    <Star size={13} />
                  </button>
                )}
                <button
                  type="button"
                  title="Deletar foto"
                  onClick={() => handleDelete(foto.id)}
                  disabled={deletingId === foto.id}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deletingId === foto.id ? (
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : <Trash2 size={13} />}
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                <p className="text-[9px] text-white/70 truncate">
                  {foto.dataUpload ? new Date(foto.dataUpload).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {fotos.length} foto(s) · Passe o mouse sobre uma foto para gerenciá-la · ⭐ = foto de capa
      </p>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
export default function CorretorImoveis() {
  const navigate = useNavigate();

  const [imoveis, setImoveis]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterTipo, setFilterTipo]       = useState('TODOS');
  const [filterAtivo, setFilterAtivo]     = useState('TODOS');
  const [toast, setToast]                 = useState(null);
  const [showCreateModal, setShowCreate]  = useState(false);
  const [viewImovel, setViewImovel]       = useState(null);
  const [editImovel, setEditImovel]       = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId]       = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const getToken = () => {
    const t = localStorage.getItem('token');
    if (!t) throw new Error('Sem token. Faca login novamente.');
    return t;
  };

  const fetchImoveis = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/imoveis`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setImoveis(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const s = err.response?.status;
      if (err.message?.includes('Sem token') || s === 401 || s === 403) {
        showToast('Sessao expirada. Faca login novamente.', 'error');
        navigate('/login');
        return;
      }
      showToast(err.response?.data?.message || 'Erro ao carregar imoveis', 'error');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await axios.delete(`${API}/api/imoveis/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setDeleteConfirm(null);
      showToast('Imovel deletado com sucesso!');
      fetchImoveis();
    } catch (err) {
      const s = err.response?.status;
      showToast(
        s === 403 ? 'Sem permissao para deletar.' : err.response?.data?.message || 'Erro ao deletar',
        'error'
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => { fetchImoveis(); }, [fetchImoveis]);

  const filteredImoveis = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return imoveis.filter((im) => {
      const matchSearch =
        (im.titulo || '').toLowerCase().includes(term) ||
        (im.cidade || '').toLowerCase().includes(term) ||
        (im.bairro || '').toLowerCase().includes(term);
      const matchTipo  = filterTipo  === 'TODOS' || im.tipo  === filterTipo;
      const matchAtivo =
        filterAtivo === 'TODOS' ||
        (filterAtivo === 'ATIVO'   && im.ativo === true) ||
        (filterAtivo === 'INATIVO' && im.ativo === false);
      return matchSearch && matchTipo && matchAtivo;
    });
  }, [imoveis, searchTerm, filterTipo, filterAtivo]);

  const getFotoCapa = (imovel) => {
    const fotos = imovel.fotos || [];
    return fotos.find(f => f.principal)?.url || fotos[0]?.url || null;
  };

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Meus Imoveis</h1>
          <p className="text-sm text-gray-400 mt-0.5">{imoveis.length} imovel(is) cadastrado(s)</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-900/20 flex-shrink-0"
        >
          <Plus size={18} /> Novo Imovel
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por titulo, cidade ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['TODOS','CASA','APARTAMENTO','TERRENO','COMERCIAL','OUTRO'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterTipo(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterTipo === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t === 'TODOS' ? 'Todos tipos' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {[['TODOS','Todos'],['ATIVO','Ativos'],['INATIVO','Inativos']].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFilterAtivo(val)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterAtivo === val ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImoveis.length === 0 ? (
              <div className="col-span-full flex flex-col items-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold">Nenhum imovel encontrado</p>
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all"
                >
                  Cadastrar Primeiro Imovel
                </button>
              </div>
            ) : filteredImoveis.map((imovel) => {
              const capa = getFotoCapa(imovel);
              const totalFotos = (imovel.fotos || []).length;
              return (
                <div
                  key={imovel.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="relative">
                    {capa ? (
                      <img src={capa} alt={imovel.titulo} className="h-44 w-full object-cover" />
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Building2 size={40} className="text-gray-300" />
                      </div>
                    )}
                    {totalFotos > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Image size={9} /> {totalFotos} foto{totalFotos > 1 ? 's' : ''}
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      imovel.ativo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {imovel.ativo ? '● Ativo' : '○ Inativo'}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      {imovel.tipo && (
                        <span className="text-[11px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                          {imovel.tipo}
                        </span>
                      )}
                      {imovel.padrao && (
                        <span className="text-[11px] text-amber-600 font-medium">
                          {imovel.padrao.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 my-1.5 leading-tight line-clamp-1">{imovel.titulo}</h3>

                    <div className="flex items-center text-gray-400 text-xs mb-3">
                      <MapPin size={12} className="mr-1 flex-shrink-0" />
                      {imovel.bairro}, {imovel.cidade}
                    </div>

                    {(imovel.quartos || imovel.banheiros || imovel.vagas || imovel.metragem) && (
                      <div className="flex gap-3 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-50">
                        {imovel.quartos   != null && <span>🛏 {imovel.quartos}</span>}
                        {imovel.banheiros != null && <span>🚿 {imovel.banheiros}</span>}
                        {imovel.vagas     != null && <span>🚗 {imovel.vagas}</span>}
                        {imovel.metragem  != null && <span>📐 {imovel.metragem}m²</span>}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-900 font-black text-base">
                        <DollarSign size={16} className="text-green-500" />
                        R$ {Number(imovel.valor || 0).toLocaleString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" title="Visualizar"
                          onClick={() => setViewImovel(imovel)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                          <Eye size={16} />
                        </button>
                        <button type="button" title="Editar"
                          onClick={() => setEditImovel(imovel)}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-colors">
                          <Edit size={16} />
                        </button>
                        <button type="button" title="Deletar"
                          onClick={() => setDeleteConfirm(imovel)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-gray-400">
            Mostrando {filteredImoveis.length} de {imoveis.length} imovel(is)
          </p>
        </>
      )}

      {/* MODAIS */}
      {showCreateModal && (
        <CadastrarImovelModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); showToast('Imovel cadastrado com sucesso!'); fetchImoveis(); }}
          onError={(msg) => showToast(msg || 'Erro ao cadastrar imovel', 'error')}
          getToken={getToken}
        />
      )}

      {viewImovel && (
        <VisualizarImovelModal
          imovel={viewImovel}
          onClose={() => setViewImovel(null)}
          getToken={getToken}
          onFotosChange={(fotos) => {
            setImoveis(prev => prev.map(im => im.id === viewImovel.id ? { ...im, fotos } : im));
            setViewImovel(prev => ({ ...prev, fotos }));
          }}
        />
      )}

      {editImovel && (
        <EditarImovelModal
          imovel={editImovel}
          onClose={() => setEditImovel(null)}
          onSuccess={() => { setEditImovel(null); showToast('Imovel atualizado com sucesso!'); fetchImoveis(); }}
          onError={(msg) => showToast(msg || 'Erro ao editar imovel', 'error')}
          getToken={getToken}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* ✅ Overlay separado com onClick */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirmar exclusao</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tem certeza que deseja deletar <strong className="text-gray-800">"{deleteConfirm.titulo}"</strong>? Isso tambem apagara todas as fotos.
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirm.id}
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
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
function VisualizarImovelModal({ imovel, onClose, getToken, onFotosChange }) {
  const [fotoIndex, setFotoIndex] = useState(0);
  const [fotos, setFotos] = useState(imovel.fotos || []);
  const [abaAtiva, setAbaAtiva] = useState('detalhes');

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const fotoAtual = fotos[fotoIndex]?.url || null;

  const handleFotosChange = (novasFotos) => {
    setFotos(novasFotos);
    onFotosChange?.(novasFotos);
    if (fotoIndex >= novasFotos.length) setFotoIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ✅ Overlay separado com onClick */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl">

        {/* Abas */}
        <div className="flex border-b border-gray-100">
          {[['detalhes','Detalhes'],['fotos',`Fotos (${fotos.length})`]].map(([aba, label]) => (
            <button
              key={aba}
              type="button"
              onClick={() => setAbaAtiva(aba)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                abaAtiva === aba ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={onClose}
            className="px-4 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {abaAtiva === 'detalhes' ? (
          <>
            <div className="relative">
              {fotoAtual ? (
                <img src={fotoAtual} alt={imovel.titulo} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Building2 size={56} className="text-gray-300" />
                </div>
              )}
              {fotos.length > 1 && (
                <>
                  <button type="button"
                    onClick={() => setFotoIndex(p => p === 0 ? fotos.length - 1 : p - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70">
                    ‹
                  </button>
                  <button type="button"
                    onClick={() => setFotoIndex(p => p === fotos.length - 1 ? 0 : p + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70">
                    ›
                  </button>
                  <span className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {fotoIndex + 1} / {fotos.length}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => setAbaAtiva('fotos')}
                className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-black/80 transition-colors"
              >
                <Image size={11} /> Gerenciar fotos
              </button>
            </div>

            {fotos.length > 1 && (
              <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
                {fotos.map((foto, idx) => (
                  <img key={foto.id} src={foto.thumbnailUrl || foto.url} alt={`thumb-${idx}`}
                    onClick={() => setFotoIndex(idx)}
                    className={`h-14 w-14 object-cover rounded-xl flex-shrink-0 cursor-pointer border-2 transition-all ${
                      idx === fotoIndex ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-black text-gray-900">{imovel.titulo}</h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                  imovel.ativo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {imovel.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900">
                R$ {Number(imovel.valor || 0).toLocaleString('pt-BR')}
              </p>
              {imovel.descricao && (
                <p className="text-sm text-gray-500 leading-relaxed">{imovel.descricao}</p>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  ['Tipo', imovel.tipo],
                  ['Padrao', imovel.padrao?.replace('_',' ')],
                  ['Cidade', imovel.cidade],
                  ['Bairro', imovel.bairro],
                  imovel.endereco   ? ['Endereco', imovel.endereco]           : null,
                  imovel.metragem   ? ['Metragem', `${imovel.metragem} m²`]   : null,
                  imovel.quartos   != null ? ['Quartos', imovel.quartos]       : null,
                  imovel.banheiros != null ? ['Banheiros', imovel.banheiros]   : null,
                  imovel.vagas     != null ? ['Vagas', imovel.vagas]           : null,
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              Gerencie as fotos de <strong className="text-gray-800">{imovel.titulo}</strong>.
              Passe o mouse sobre uma foto para ver as opcoes.
            </p>
            <GerenciadorFotos
              imovelId={imovel.id}
              fotosIniciais={fotos}
              token={getToken()}
              onChange={handleFotosChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── MODAL EDITAR ──────────────────────────────────────────────
function EditarImovelModal({ imovel, onClose, onSuccess, onError, getToken }) {
  const [form, setForm] = useState({
    titulo:    imovel.titulo    || '',
    descricao: imovel.descricao || '',
    tipo:      imovel.tipo      || 'CASA',
    padrao:    imovel.padrao    || 'ALTO_PADRAO',
    cidade:    imovel.cidade    || '',
    bairro:    imovel.bairro    || '',
    endereco:  imovel.endereco  || '',
    metragem:  imovel.metragem  ?? '',
    quartos:   imovel.quartos   ?? '',
    banheiros: imovel.banheiros ?? '',
    vagas:     imovel.vagas     ?? '',
    valor:     imovel.valor     ?? '',
    ativo:     imovel.ativo     ?? true,
  });
  const [fotos, setFotos]       = useState(imovel.fotos || []);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [abaAtiva, setAbaAtiva] = useState('dados');

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      await axios.put(`${API}/api/imoveis/${imovel.id}`, buildImovelPayload(form), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao editar';
      setError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ✅ Overlay separado com onClick */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center border-b border-gray-100">
          <div className="px-6 py-4 flex-1">
            <h2 className="text-lg font-bold text-gray-900">Editar imovel</h2>
            <p className="text-xs text-gray-400 mt-0.5">{imovel.titulo}</p>
          </div>
          {[['dados','Dados'],['fotos',`Fotos (${fotos.length})`]].map(([aba, label]) => (
            <button
              key={aba}
              type="button"
              onClick={() => setAbaAtiva(aba)}
              className={`px-5 py-4 text-sm font-semibold transition-colors border-b-2 ${
                abaAtiva === aba
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={onClose}
            className="px-4 py-4 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-b-2 border-transparent">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">{error}</div>
          )}

          {abaAtiva === 'dados' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Titulo *</label>
                <input name="titulo" value={form.titulo} onChange={onChange} className={inputCls} required disabled={saving} />
              </div>
              <div>
                <label className={labelCls}>Descricao</label>
                <textarea name="descricao" value={form.descricao} onChange={onChange} className={inputCls} rows={3} disabled={saving} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tipo *</label>
                  <select name="tipo" value={form.tipo} onChange={onChange} className={inputCls} disabled={saving}>
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="TERRENO">Terreno</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Padrao</label>
                  <select name="padrao" value={form.padrao} onChange={onChange} className={inputCls} disabled={saving}>
                    <option value="ALTO_PADRAO">Alto Padrão</option>
                    <option value="MEDIO">Médio</option>
                    <option value="POPULAR">Popular</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Cidade *</label>
                  <input name="cidade" value={form.cidade} onChange={onChange} className={inputCls} required disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Bairro *</label>
                  <input name="bairro" value={form.bairro} onChange={onChange} className={inputCls} required disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Valor (R$) *</label>
                  <input name="valor" type="number" value={form.valor} onChange={onChange} className={inputCls} required min="0" step="0.01" disabled={saving} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Endereco</label>
                <input name="endereco" value={form.endereco} onChange={onChange} className={inputCls} disabled={saving} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={labelCls}>Metragem</label>
                  <input name="metragem" type="number" value={form.metragem} onChange={onChange} className={inputCls} step="0.01" disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Quartos</label>
                  <input name="quartos" type="number" value={form.quartos} onChange={onChange} className={inputCls} min="0" disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Banheiros</label>
                  <input name="banheiros" type="number" value={form.banheiros} onChange={onChange} className={inputCls} min="0" disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Vagas</label>
                  <input name="vagas" type="number" value={form.vagas} onChange={onChange} className={inputCls} min="0" disabled={saving} />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <input id="ativoEdit" name="ativo" type="checkbox" checked={form.ativo} onChange={onChange} className="h-4 w-4 rounded" disabled={saving} />
                  <label htmlFor="ativoEdit" className="text-sm text-gray-600 font-medium">Ativo</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 active:scale-95 transition-all">
                  <Save size={15} />
                  {saving ? 'Salvando...' : 'Salvar alteracoes'}
                </button>
                <button type="button" onClick={onClose} disabled={saving}
                  className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <GerenciadorFotos
              imovelId={imovel.id}
              fotosIniciais={fotos}
              token={getToken()}
              onChange={setFotos}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── MODAL CADASTRAR ───────────────────────────────────────────
function CadastrarImovelModal({ onClose, onSuccess, onError, getToken }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '', tipo: 'CASA', padrao: 'ALTO_PADRAO',
    cidade: '', bairro: '', endereco: '', metragem: '', quartos: '',
    banheiros: '', vagas: '', valor: '', ativo: true,
  });
  const [fotos, setFotos]               = useState([]);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [imovelCriado, setImovelCriado] = useState(null);

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      const token   = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const res     = await axios.post(`${API}/api/imoveis`, buildImovelPayload(form), { headers });
      const body    = res.data;
      const imovelId = body?.id ?? body?.data ?? body;
      if (!imovelId) throw new Error('Nao consegui obter o ID do imovel criado.');

      for (const file of fotos) {
        const fd = new FormData();
        fd.append('file', file);
        await axios.post(`${API}/api/imoveis/${imovelId}/fotos`, fd, { headers });
      }

      const imovelRes = await axios.get(`${API}/api/imoveis/${imovelId}`, { headers });
      setImovelCriado(imovelRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao cadastrar imovel';
      setError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ✅ Overlay separado com onClick — só fecha se imovel ainda não foi criado */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={imovelCriado ? undefined : onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {imovelCriado ? '✅ Imovel criado!' : 'Cadastrar imovel'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {imovelCriado ? 'Adicione mais fotos ou finalize' : 'Preencha os dados do imovel'}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">{error}</div>
          )}

          {!imovelCriado ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Titulo *</label>
                <input name="titulo" value={form.titulo} onChange={onChange} className={inputCls} required disabled={saving} />
              </div>
              <div>
                <label className={labelCls}>Descricao</label>
                <textarea name="descricao" value={form.descricao} onChange={onChange} className={inputCls} rows={3} disabled={saving} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Tipo *</label>
                  <select name="tipo" value={form.tipo} onChange={onChange} className={inputCls} disabled={saving}>
                    <option value="CASA">Casa</option>
                    <option value="APARTAMENTO">Apartamento</option>
                    <option value="TERRENO">Terreno</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Padrao</label>
                  <select name="padrao" value={form.padrao} onChange={onChange} className={inputCls} disabled={saving}>
                    <option value="ALTO_PADRAO">Alto Padrão</option>
                    <option value="MEDIO">Médio</option>
                    <option value="POPULAR">Popular</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Cidade *</label>
                  <input name="cidade" value={form.cidade} onChange={onChange} className={inputCls} required disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Bairro *</label>
                  <input name="bairro" value={form.bairro} onChange={onChange} className={inputCls} required disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Valor (R$) *</label>
                  <input name="valor" type="number" value={form.valor} onChange={onChange} className={inputCls} required min="0" step="0.01" disabled={saving} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Endereco</label>
                <input name="endereco" value={form.endereco} onChange={onChange} className={inputCls} disabled={saving} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className={labelCls}>Metragem</label>
                  <input name="metragem" type="number" value={form.metragem} onChange={onChange} className={inputCls} step="0.01" disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Quartos</label>
                  <input name="quartos" type="number" value={form.quartos} onChange={onChange} className={inputCls} min="0" disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Banheiros</label>
                  <input name="banheiros" type="number" value={form.banheiros} onChange={onChange} className={inputCls} min="0" disabled={saving} />
                </div>
                <div>
                  <label className={labelCls}>Vagas</label>
                  <input name="vagas" type="number" value={form.vagas} onChange={onChange} className={inputCls} min="0" disabled={saving} />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <input id="ativo" name="ativo" type="checkbox" checked={form.ativo} onChange={onChange} className="h-4 w-4 rounded" disabled={saving} />
                  <label htmlFor="ativo" className="text-sm text-gray-600 font-medium">Ativo</label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Fotos iniciais (opcional)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all">
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-sm text-gray-500 font-medium">
                    {fotos.length > 0 ? `${fotos.length} foto(s) selecionada(s)` : 'Clique para selecionar fotos'}
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden"
                    onChange={e => setFotos(Array.from(e.target.files || []))} disabled={saving} />
                </label>
                {fotos.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {fotos.map((f, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(f)} alt="prev" className="h-14 w-14 object-cover rounded-xl border border-gray-200" />
                        <button type="button"
                          onClick={() => setFotos(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 active:scale-95 transition-all">
                  {saving ? 'Salvando...' : 'Criar Imovel'}
                </button>
                <button type="button" onClick={onClose} disabled={saving}
                  className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium">
                ✅ Imovel <strong>"{imovelCriado.titulo}"</strong> criado! Adicione mais fotos ou finalize.
              </div>
              <GerenciadorFotos
                imovelId={imovelCriado.id}
                fotosIniciais={imovelCriado.fotos || []}
                token={getToken()}
                onChange={(novasFotos) => setImovelCriado(prev => ({ ...prev, fotos: novasFotos }))}
              />
              <button
                type="button"
                onClick={() => onSuccess?.()}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
