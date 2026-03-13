import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import Toast from '../../components/common/Toast';

const API_BASE_URL = 'https://fixed-mari-dev-master-0c3ca107.koyeb.app';

function Corretores() {
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCorretor, setEditingCorretor] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCorretores();
  }, []);

  const fetchCorretores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/corretores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCorretores(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao buscar corretores:', error);
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDelete = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar o corretor ${nome}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/admin/corretores/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Corretor deletado com sucesso!', 'success');
      fetchCorretores();
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      showToast('Erro ao deletar corretor!', 'error');
    }
  };

  const handleEdit = (corretor) => {
    setEditingCorretor(corretor);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingCorretor(null);
    setShowModal(true);
  };

  const filteredCorretores = corretores.filter(corretor =>
    corretor.nomeCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.creci?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Carregando corretores...</div>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Corretores</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Adicionar Corretor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou CRECI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRECI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCorretores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Nenhum corretor encontrado
                  </td>
                </tr>
              ) : (
                filteredCorretores.map((corretor) => (
                  <tr key={corretor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{corretor.nomeCompleto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{corretor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{corretor.telefone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{corretor.creci}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        corretor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {corretor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(corretor)} className="text-blue-600 hover:text-blue-900" title="Editar">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(corretor.id, corretor.nomeCompleto)} className="text-red-600 hover:text-red-900" title="Deletar">
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

function CorretorModal({ corretor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nomeCompleto: corretor?.nomeCompleto || '',
    email: corretor?.email || '',
    senha: '',
    telefone: corretor?.telefone || '',
    creci: corretor?.creci || '',
    bio: corretor?.bio || '',
    ativo: corretor?.ativo !== undefined ? corretor.ativo : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (corretor) {
        const dataToSend = {
          nomeCompleto: formData.nomeCompleto,
          telefone: formData.telefone,
          creci: formData.creci,
          bio: formData.bio,
          ativo: formData.ativo,
        };
        if (formData.senha && formData.senha.trim() !== '') {
          dataToSend.senha = formData.senha;
        }
        await axios.put(`${API_BASE_URL}/api/admin/corretores/${corretor.id}`, dataToSend, config);
        onSuccess('Corretor atualizado com sucesso!', 'success');
      } else {
        if (!formData.senha || formData.senha.trim() === '') {
          setError('Senha é obrigatória para criar novo corretor');
          setLoading(false);
          return;
        }
        const dataToSend = {
          nomeCompleto: formData.nomeCompleto,
          email: formData.email,
          senha: formData.senha,
          telefone: formData.telefone,
          creci: formData.creci,
          bio: formData.bio
        };
        await axios.post(`${API_BASE_URL}/api/admin/corretores`, dataToSend, config);
        onSuccess('Corretor criado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      console.error('❌ Resposta do backend:', error.response?.data);
      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || 'Erro ao salvar corretor. Verifique os dados.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {corretor ? 'Editar Corretor' : 'Adicionar Corretor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="João Silva Santos" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={!!corretor}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="joao@movvcorretores.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha {!corretor && '*'}</label>
              <input type="password" name="senha" value={formData.senha} onChange={handleChange} required={!corretor}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={corretor ? 'Deixe vazio para não alterar' : 'Senha@123'} />
              {corretor && <p className="text-xs text-gray-500 mt-1">Deixe vazio para manter a senha atual</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(79) 98765-4321" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CRECI *</label>
              <input type="text" name="creci" value={formData.creci} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CRECI-SE 12345" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Corretor experiente com 5 anos de atuação..." />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700">Corretor Ativo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400">
              {loading ? 'Salvando...' : corretor ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Corretores;
