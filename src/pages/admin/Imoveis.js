import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Filter, MapPin, Bed, Bath, Car, DollarSign, X } from 'lucide-react';
import Toast from '../../components/common/Toast';
import API_BASE_URL from '../../services/api';

function Imoveis() {
  const [imoveis, setImoveis]           = useState([]);
  const [corretores, setCorretores]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [corretorFilter, setCorretorFilter] = useState('TODOS');
  const [tipoFilter, setTipoFilter]     = useState('TODOS');
  const [showModal, setShowModal]       = useState(false);
  const [selectedImovel, setSelectedImovel] = useState(null);
  const [toast, setToast]               = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token  = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [imoveisRes, corretoresRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/imoveis`, config),
        axios.get(`${API_BASE_URL}/api/admin/corretores`, config),
      ]);

      const imoveisComFotos = await Promise.all(
        imoveisRes.data.map(async (imovel) => {
          try {
            const fotosRes = await axios.get(`${API_BASE_URL}/api/imoveis/${imovel.id}/fotos`, config);
            return { ...imovel, primeiraFoto: fotosRes.data[0]?.url || null };
          } catch {
            return { ...imovel, primeiraFoto: null };
          }
        })
      );

      setImoveis(imoveisComFotos);
      setCorretores(corretoresRes.data);
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleViewDetails = async (imovel) => {
    try {
      const token   = localStorage.getItem('token');
      const fotosRes = await axios.get(`${API_BASE_URL}/api/imoveis/${imovel.id}/fotos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedImovel({ ...imovel, fotos: fotosRes.data });
    } catch {
      setSelectedImovel({ ...imovel, fotos: [] });
    } finally {
      setShowModal(true);
    }
  };

  const filteredImoveis = imoveis.filter(imovel => {
    const matchSearch =
      imovel.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.bairro?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo     = tipoFilter === 'TODOS' || imovel.tipo === tipoFilter;
    const matchCorretor = corretorFilter === 'TODOS' || imovel.corretor?.id === parseInt(corretorFilter);
    return matchSearch && matchTipo && matchCorretor;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-sm text-gray-500">Carregando imóveis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Imóveis</h1>
        <p className="text-sm text-gray-500 mt-1">Visualize todos os imóveis cadastrados</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Pesquisar por título, cidade ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Filter className="inline mr-1" size={13} /> Tipo
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="CASA">Casa</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="RURAL">Rural</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Filter className="inline mr-1" size={13} /> Corretor
            </label>
            <select
              value={corretorFilter}
              onChange={(e) => setCorretorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Corretores</option>
              {corretores.map(c => (
                <option key={c.id} value={c.id}>{c.nomeCompleto}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de imóveis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredImoveis.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md">
            <span className="text-5xl mb-4">🏠</span>
            <p className="text-gray-500 font-medium">Nenhum imóvel encontrado</p>
          </div>
        ) : filteredImoveis.map((imovel) => (
          <div key={imovel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            {/* Foto */}
            {imovel.primeiraFoto ? (
              <img src={imovel.primeiraFoto} alt={imovel.titulo} className="h-44 w-full object-cover" />
            ) : (
              <div className="h-44 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-4xl">🏠</span>
              </div>
            )}

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-base text-gray-800 mb-1 line-clamp-1">{imovel.titulo}</h3>
              <div className="flex items-center text-gray-500 text-xs mb-2">
                <MapPin size={13} className="mr-1 flex-shrink-0" />
                <span className="truncate">{imovel.bairro}, {imovel.cidade}</span>
              </div>

              {/* Detalhes */}
              {(imovel.quartos > 0 || imovel.banheiros > 0 || imovel.vagas > 0) && (
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  {imovel.quartos   > 0 && <span className="flex items-center gap-1"><Bed  size={13} />{imovel.quartos}</span>}
                  {imovel.banheiros > 0 && <span className="flex items-center gap-1"><Bath size={13} />{imovel.banheiros}</span>}
                  {imovel.vagas     > 0 && <span className="flex items-center gap-1"><Car  size={13} />{imovel.vagas}</span>}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t mt-auto">
                <div className="flex items-center text-green-600 font-bold text-sm">
                  <DollarSign size={15} />
                  R$ {Number(imovel.valor || 0).toLocaleString('pt-BR')}
                </div>
                <button
                  onClick={() => handleViewDetails(imovel)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye size={16} /> Ver
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-400 truncate">
                Corretor: {imovel.corretor?.nomeCompleto || 'Não atribuído'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Mostrando {filteredImoveis.length} de {imoveis.length} imóvel(is)
      </p>

      {showModal && selectedImovel && (
        <ImovelModal imovel={selectedImovel} onClose={() => { setShowModal(false); setSelectedImovel(null); }} />
      )}
    </div>
  );
}

// ── MODAL ────────────────────────────────────────────────────
function ImovelModal({ imovel, onClose }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">

        {/* Header modal */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 pr-4 line-clamp-1">{imovel.titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6">

          {/* Fotos */}
          {imovel.fotos?.length > 0 ? (
            <div className="mb-5">
              <img
                src={imovel.fotos[currentPhoto]?.url || ''}
                alt={`Foto ${currentPhoto + 1}`}
                className="w-full h-56 sm:h-72 md:h-96 object-cover rounded-xl"
              />
              {imovel.fotos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imovel.fotos.map((foto, index) => (
                    <img
                      key={foto.id}
                      src={foto.thumbnailUrl || foto.url}
                      alt={`Miniatura ${index + 1}`}
                      onClick={() => setCurrentPhoto(index)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 object-cover rounded-lg cursor-pointer transition-all ${
                        currentPhoto === index ? 'ring-2 ring-blue-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 sm:h-72 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-5">
              <span className="text-white text-6xl">🏠</span>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Tipo',      value: imovel.tipo    },
              { label: 'Padrão',    value: imovel.padrao  },
              { label: 'Metragem',  value: imovel.metragem ? `${imovel.metragem} m²` : '—' },
              { label: 'Valor',     value: `R$ ${Number(imovel.valor || 0).toLocaleString('pt-BR')}`, green: true },
            ].map(({ label, value, green }) => (
              <div key={label} className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className={`font-semibold text-sm ${green ? 'text-green-600' : 'text-gray-800'}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Endereço */}
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <p className="text-xs text-gray-500 mb-1">Endereço</p>
            <p className="font-medium text-sm text-gray-800">{imovel.endereco || '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{imovel.bairro}, {imovel.cidade}</p>
          </div>

          {/* Descrição */}
          {imovel.descricao && (
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-xs text-gray-500 mb-1">Descrição</p>
              <p className="text-sm text-gray-700 leading-relaxed">{imovel.descricao}</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Imoveis;
