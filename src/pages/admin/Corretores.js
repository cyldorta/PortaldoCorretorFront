import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import Toast from '../../components/common/Toast';

const API_BASE_URL = 'https://fixed-mari-dev-master-0c3ca107.koyeb.app';

function Corretores() {
  const [corretores, setCorretores]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [editingCorretor, setEditingCorretor] = useState(null);
  const [toast, setToast]                   = useState(null);

  useEffect(() => { fetchCorretores(); }, []);

  const fetchCorretores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/corretores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCorretores(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar corretores:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar o corretor ${nome}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/admin/corretores/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Corretor deletado com sucesso!');
      fetchCorretores();
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      showToast('Erro ao deletar corretor!', 'error');
    }
  };

  const filteredCorretores = corretores.filter(c =>
    c.nomeCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.creci?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-600">Carregando corretores...</div>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Corretores</h1>
        <button
          onClick={() => { setEditingCorretor(null); setShowModal(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={20} />
          Adicionar Corretor
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou CRECI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabela desktop / Cards mobile */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">

        {/* Tabela — md+ */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nome','Email','Telefone','CRECI','Status','Ações'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCorretores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Nenhum corretor encontrado
                  </td>
                </tr>
              ) : filteredCorretores.map((corretor) => (
                <tr key={corretor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {corretor.nomeCompleto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {corretor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {corretor.telefone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {corretor.creci}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                      corretor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {corretor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingCorretor(corretor); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-900" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(corretor.id, corretor.nomeCompleto)}
                        className="text-red-600 hover:text-red-900" title="Deletar">
                        <Trash2 size={18} />
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
          {filteredCorretores.length === 0 ? (
            <p className="px-4 py-8 text-center text-gray-500">Nenhum corretor encontrado</p>
          ) : filteredCorretores.map((corretor) => (
            <div key={corretor.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{corretor.nomeCompleto}</p>
                  <p className="text-xs text-gray-500">{corretor.email}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${
                  corretor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {corretor.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>📞 {corretor.telefone}</span>
                <span>🏷️ {corretor.creci}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setEditingCorretor(corretor); setShowModal(true); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={15} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(corretor.id, corretor.nomeCompleto)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} /> Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Total: {filteredCorretores.length} corretor(es)
      </div>

      {showModal && (
        <CorretorModal
          corretor={editingCorretor}
          onClose={() => { setShowModal(false); setEditingCorretor(null); }}
          onSuccess={(message, type) => {
            setShowModal(false);
            setEditingCorretor(null);
            showToast(message, type);
            fetchCorretores();
          }}
        />
      )}
    </div>
  );
}

// ── MODAL ────────────────────────────────────────────────────
function CorretorModal({ corretor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nomeCompleto: corretor?.nomeCompleto || '',
    email:        corretor?.email        || '',
    senha:        '',
    telefone:     corretor?.telefone     || '',
    creci:        corretor?.creci        || '',
    bio:          corretor?.bio          || '',
    ativo:        corretor?.ativo !== undefined ? corretor.ativo : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token  = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (corretor) {
        const dataToSend = {
          nomeCompleto: formData.nomeCompleto,
          telefone:     formData.telefone,
          creci:        formData.creci,
          bio:          formData.bio,
          ativo:        formData.ativo,
        };
        if (formData.senha?.trim()) dataToSend.senha = formData.senha;
        await axios.put(`${API_BASE_URL}/api/admin/corretores/${corretor.id}`, dataToSend, config);
        onSuccess('Corretor atualizado com sucesso!', 'success');
      } else {
        if (!formData.senha?.trim()) {
          setError('Senha é obrigatória para criar novo corretor');
          setLoading(false);
          return;
        }
        await axios.post(`${API_BASE_URL}/api/admin/corretores`, {
          nomeCompleto: formData.nomeCompleto,
          email:        formData.email,
          senha:        formData.senha,
          telefone:     formData.telefone,
          creci:        formData.creci,
          bio:          formData.bio,
        }, config);
        onSuccess('Corretor criado com sucesso!', 'success');
      }
    } catch (err) {
      console.error('❌ Erro ao salvar:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao salvar corretor.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {corretor ? 'Editar Corretor' : 'Adicionar Corretor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleChange} required
                placeholder="João Silva Santos"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!corretor}
                placeholder="joao@movv.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha {!corretor && '*'}
              </label>
              <input type="password" name="senha" value={formData.senha} onChange={handleChange} required={!corretor}
                placeholder={corretor ? 'Deixe vazio para não alterar' : 'Senha@123'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {corretor && <p className="text-xs text-gray-500 mt-1">Deixe vazio para manter a senha atual</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} required
                placeholder="(79) 98765-4321"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CRECI *</label>
              <input type="text" name="creci" value={formData.creci} onChange={handleChange} required
                placeholder="CRECI-SE 12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                placeholder="Corretor experiente com 5 anos de atuação..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700">Corretor Ativo</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400">
              {loading ? 'Salvando...' : corretor ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Corretores;
