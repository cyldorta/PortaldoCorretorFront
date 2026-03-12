import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, Filter, MapPin, Bed, Bath, Car, DollarSign, X } from 'lucide-react';
import Toast from '../../components/common/Toast';
import API_BASE_URL from '../../services/api';

function Imoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [corretorFilter, setCorretorFilter] = useState('TODOS');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [selectedImovel, setSelectedImovel] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [imoveisRes, corretoresRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/imoveis`, config),
        axios.get(`${API_BASE_URL}/api/admin/corretores`, config),
      ]);

      const imoveisComFotos = await Promise.all(
        imoveisRes.data.map(async (imovel) => {
          try {
            const fotosRes = await axios.get(
              `${API_BASE_URL}/api/imoveis/${imovel.id}/fotos`,
              config
            );
            return {
              ...imovel,
              primeiraFoto: fotosRes.data[0]?.url || null
            };
          } catch (error) {
            console.error(`❌ Erro ao buscar fotos do imóvel ${imovel.id}:`, error);
            return { ...imovel, primeiraFoto: null };
          }
        })
      );

      setImoveis(imoveisComFotos);
      setCorretores(corretoresRes.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleViewDetails = async (imovel) => {
    try {
      const token = localStorage.getItem('token');
      const fotosRes = await axios.get(
        `${API_BASE_URL}/api/imoveis/${imovel.id}/fotos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedImovel({ ...imovel, fotos: fotosRes.data });
      setShowModal(true);
    } catch (error) {
      console.error('❌ Erro ao buscar fotos:', error);
      setSelectedImovel({ ...imovel, fotos: [] });
      setShowModal(true);
    }
  };

  const filteredImoveis = imoveis.filter(imovel => {
    const matchSearch =
      imovel.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imovel.bairro?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTipo = tipoFilter === 'TODOS' || imovel.tipo === tipoFilter;
    const matchCorretor = corretorFilter === 'TODOS' || imovel.corretor?.id === parseInt(corretorFilter);

    return matchSearch && matchTipo && matchCorretor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Carregando imóveis...</div>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Imóveis</h1>
        <p className="text-gray-600 mt-2">Visualize todos os imóveis cadastrados</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline mr-2" size={16} />
              Filtrar por Tipo
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline mr-2" size={16} />
              Filtrar por Corretor
            </label>
            <select
              value={corretorFilter}
              onChange={(e) => setCorretorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos os Corretores</option>
              {corretores.map(corretor => (
                <option key={corretor.id} value={corretor.id}>
                  {corretor.nomeCompleto}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImoveis.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhum imóvel encontrado
          </div>
        ) : (
          filteredImoveis.map((imovel) => (
            <div key={imovel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {imovel.primeiraFoto ? (
                <img src={imovel.primeiraFoto} alt={imovel.titulo} className="h-48 w-full object-cover" />
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-4xl">🏠</span>
                </div>
              )}

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{imovel.titulo}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin size={16} className="mr-1" />
                  {imovel.bairro}, {imovel.cidade}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  {imovel.quartos > 0 && <span className="flex items-center gap-1"><Bed size={16} /> {imovel.quartos}</span>}
                  {imovel.banheiros > 0 && <span className="flex items-center gap-1"><Bath size={16} /> {imovel.banheiros}</span>}
                  {imovel.vagas > 0 && <span className="flex items-center gap-1"><Car size={16} /> {imovel.vagas}</span>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center text-green-600 font-bold">
                    <DollarSign size={18} />
                    <span>R$ {imovel.valor?.toLocaleString('pt-BR')}</span>
                  </div>
                  <button onClick={() => handleViewDetails(imovel)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                    <Eye size={18} /> Ver
                  </button>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Corretor: {imovel.corretor?.nomeCompleto || 'Não atribuído'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Mostrando {filteredImoveis.length} de {imoveis.length} imóvel(is)
      </div>

      {showModal && selectedImovel && (
        <ImovelModal imovel={selectedImovel} onClose={() => { setShowModal(false); setSelectedImovel(null); }} />
      )}
    </div>
  );
}

function ImovelModal({ imovel, onClose }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-2xl font-bold">{imovel.titulo}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="p-6">
          {imovel.fotos && imovel.fotos.length > 0 ? (
            <div className="mb-6">
              <img src={imovel.fotos[currentPhoto]?.url || ''} alt={`Foto ${currentPhoto + 1}`} className="w-full h-96 object-cover rounded-lg" />
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {imovel.fotos.map((foto, index) => (
                  <img
                    key={foto.id}
                    src={foto.thumbnailUrl || foto.url}
                    alt={`Miniatura ${index + 1}`}
                    onClick={() => setCurrentPhoto(index)}
                    className={`w-20 h-20 object-cover rounded cursor-pointer ${currentPhoto === index ? 'ring-2 ring-blue-500' : ''}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white text-6xl">🏠</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Tipo</p><p className="font-medium">{imovel.tipo}</p></div>
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Padrão</p><p className="font-medium">{imovel.padrao}</p></div>
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Metragem</p><p className="font-medium">{imovel.metragem} m²</p></div>
            <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Valor</p><p className="font-medium text-green-600">R$ {imovel.valor?.toLocaleString('pt-BR')}</p></div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-1">Endereço</p>
            <p className="font-medium">{imovel.endereco}</p>
            <p className="text-sm text-gray-600">{imovel.bairro}, {imovel.cidade}</p>
          </div>

          {imovel.descricao && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Descrição</p>
              <p>{imovel.descricao}</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Imoveis;
