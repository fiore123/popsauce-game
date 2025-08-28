'use client';

import { useState, useEffect, FormEvent } from 'react';
import Modal from '../components/Modal';
import QuestionForm from '../components/QuestionForm';

interface Category {
  id: number;
  name: string;
}

interface Question {
  id: number;
  imageUrl: string;
  answers: string;
  category: Category;
  createdAt: string;
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', isError: false });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'question' | 'category' } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchQuestions(), fetchCategories()]);
    setIsLoading(false);
  };

  const fetchQuestions = async () => { /* ...código inalterado... */ 
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error('Falha ao buscar perguntas.');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      setFeedback({ message: 'Erro ao carregar lista de perguntas.', isError: true });
    }
  };
  
  const fetchCategories = async () => { /* ...código inalterado... */ 
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Falha ao buscar categorias.');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setFeedback({ message: 'Erro ao carregar lista de categorias.', isError: true });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleQuestionSubmit = async (data: { imageUrl: string; answers: string; categoryId: string; }) => {
    setIsLoading(true);
    setFeedback({ message: '', isError: false });
    const answersArray = data.answers.split(',').map(ans => ans.trim()).filter(Boolean);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, answers: answersArray }),
      });
      if (!response.ok) throw new Error('Falha ao cadastrar pergunta.');
      setFeedback({ message: 'Pergunta cadastrada com sucesso!', isError: false });
      fetchQuestions();
    } catch (error) {
      setFeedback({ message: 'Ocorreu um erro ao cadastrar. Tente novamente.', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionUpdate = async (data: { imageUrl: string; answers: string; categoryId: string; }) => {
    if (!editingQuestion) return;
    setIsLoading(true);
    const answersArray = data.answers.split(',').map(ans => ans.trim()).filter(Boolean);
    try {
      const response = await fetch(`/api/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, answers: answersArray }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar pergunta.');
      setFeedback({ message: 'Pergunta atualizada com sucesso!', isError: false });
      fetchQuestions();
    } catch (error) {
      setFeedback({ message: 'Ocorreu um erro ao atualizar. Tente novamente.', isError: true });
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(false);
    }
  };

  const handleCategorySubmit = async (event: FormEvent) => { /* ...código inalterado... */
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.error || 'Falha ao criar categoria.'); }
      setFeedback({ message: 'Categoria criada com sucesso!', isError: false });
      setNewCategoryName('');
      fetchCategories();
    } catch (error: unknown) {
      if (error instanceof Error) { setFeedback({ message: error.message, isError: true }); } 
      else { setFeedback({ message: 'Ocorreu um erro desconhecido.', isError: true }); }
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: number, type: 'question' | 'category') => { /* ...código inalterado... */
    setItemToDelete({ id, type });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => { /* ...código inalterado... */
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    const url = type === 'question' ? `/api/questions/${id}` : `/api/categories/${id}`;
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Falha ao excluir ${type}.`);
      setFeedback({ message: `${type === 'question' ? 'Pergunta' : 'Categoria'} excluída com sucesso!`, isError: false });
      if (type === 'question') { setQuestions(questions.filter(q => q.id !== id)); } 
      else { fetchAllData(); }
    } catch (error) {
      setFeedback({ message: `Ocorreu um erro ao excluir. Tente novamente.`, isError: true });
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center bg-gray-900 p-8 text-white">
        <div className="w-full max-w-6xl">
          <h1 className="mb-8 text-center text-5xl font-bold">Painel do Admin</h1>
          {feedback.message && (<p className={`mb-4 text-center font-medium ${feedback.isError ? 'text-red-400' : 'text-green-400'}`}>{feedback.message}</p>)}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-gray-800 p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Gerenciar Categorias</h2>
                <form onSubmit={handleCategorySubmit} className="flex gap-2">
                  <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-grow rounded-md border border-gray-600 bg-gray-700 px-3 py-2 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500" placeholder="Nova categoria" required />
                  <button type="submit" disabled={isLoading} className="rounded-md bg-green-600 px-4 py-2 font-semibold hover:bg-green-700 disabled:bg-gray-500">Criar</button>
                </form>
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between rounded bg-gray-700 p-2">
                      <span>{cat.name}</span>
                      <button onClick={() => openDeleteModal(cat.id, 'category')} className="text-red-400 hover:text-red-300">Excluir</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-gray-800 p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Cadastrar Nova Pergunta</h2>
                <QuestionForm onSubmit={handleQuestionSubmit} isLoading={isLoading} categories={categories} submitButtonText="Cadastrar Pergunta" />
              </div>
            </div>
          </div>
          <div className="mt-12">
            <h2 className="text-3xl font-bold">Perguntas Cadastradas</h2>
            <div className="mt-6 flex flex-col gap-4">
              {questions.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg bg-gray-800 p-4">
                  <div className="flex items-center gap-4"><img src={q.imageUrl} alt="Preview" className="h-16 w-16 rounded-md object-cover"/><div><p className="font-semibold text-white">{q.category.name}</p><p className="text-sm text-gray-400">{JSON.parse(q.answers).join(', ')}</p></div></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(q)} className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold hover:bg-blue-700">Editar</button>
                    <button onClick={() => openDeleteModal(q.id, 'question')} className="rounded bg-red-600 px-3 py-1 text-sm font-semibold hover:bg-red-700">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Pergunta">
        {editingQuestion && (
          <QuestionForm 
            onSubmit={handleQuestionUpdate} 
            isLoading={isLoading} 
            categories={categories}
            submitButtonText="Salvar Alterações"
            initialData={{
              imageUrl: editingQuestion.imageUrl,
              answers: JSON.parse(editingQuestion.answers).join(', '),
              categoryId: String(editingQuestion.category.id)
            }}
          />
        )}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Exclusão">
        <p className="text-gray-300">Tem certeza que deseja excluir? {itemToDelete?.type === 'category' && 'Todas as perguntas nesta categoria também serão excluídas.'} Esta ação não pode ser desfeita.</p>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={() => setIsDeleteModalOpen(false)} className="rounded bg-gray-600 px-4 py-2 font-semibold hover:bg-gray-700">Cancelar</button>
          <button onClick={confirmDelete} className="rounded bg-red-600 px-4 py-2 font-semibold hover:bg-red-700">Confirmar Exclusão</button>
        </div>
      </Modal>
    </>
  );
}