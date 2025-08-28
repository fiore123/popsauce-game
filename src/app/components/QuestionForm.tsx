'use client';

import { useState, FormEvent, useRef } from 'react';

interface Category {
  id: number;
  name: string;
}

interface QuestionFormData {
  imageUrl: string;
  answers: string;
  categoryId: string;
}

interface QuestionFormProps {
  onSubmit: (data: QuestionFormData) => Promise<void>;
  initialData?: Partial<QuestionFormData>;
  isLoading: boolean;
  categories: Category[];
  submitButtonText: string;
}

export default function QuestionForm({ onSubmit, initialData = {}, isLoading, categories, submitButtonText }: QuestionFormProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>(initialData.imageUrl ? 'url' : 'upload');
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || '');
  const [answers, setAnswers] = useState(initialData.answers || '');
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    let finalImageUrl = imageUrl;

    if (uploadMode === 'upload') {
      if (!selectedFile) {
        alert('Por favor, selecione um arquivo para fazer upload.');
        return;
      }
      try {
        const response = await fetch(`/api/upload?filename=${encodeURIComponent(selectedFile.name)}`, {
          method: 'POST',
          body: selectedFile,
        });
        const newBlob = await response.json();
        if (!response.ok) {
          throw new Error('Falha no upload da imagem.');
        }
        finalImageUrl = newBlob.url;
      } catch (error) {
        alert('Erro ao fazer upload da imagem.');
        return;
      }
    }
    await onSubmit({ imageUrl: finalImageUrl, answers, categoryId });
    if (!initialData.imageUrl) {
      setImageUrl('');
      setAnswers('');
      setCategoryId('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex rounded-md bg-gray-700 p-1">
        <button type="button" onClick={() => setUploadMode('url')} className={`w-1/2 rounded p-2 text-center text-sm font-semibold ${uploadMode === 'url' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}>
          Usar URL
        </button>
        <button type="button" onClick={() => setUploadMode('upload')} className={`w-1/2 rounded p-2 text-center text-sm font-semibold ${uploadMode === 'upload' ? 'bg-purple-600 text-white' : 'text-gray-300'}`}>
          Fazer Upload
        </button>
      </div>

      {uploadMode === 'url' ? (
        <div>
          <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-gray-300">URL da Imagem</label>
          <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 placeholder-gray-400" required={uploadMode === 'url'} />
        </div>
      ) : (
        <div>
          <label htmlFor="fileUpload" className="mb-1 block text-sm font-medium text-gray-300">Arquivo da Imagem</label>
          <input type="file" id="fileUpload" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-gray-600 file:px-4 file:py-2 file:text-white hover:file:bg-gray-500" required={uploadMode === 'upload'} />
        </div>
      )}
      
      <div>
        <label htmlFor="answers" className="mb-1 block text-sm font-medium text-gray-300">Respostas (separadas por vírgula)</label>
        <input type="text" id="answers" value={answers} onChange={(e) => setAnswers(e.target.value)} className="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2 placeholder-gray-400" required />
      </div>
      
      <div>
        <label htmlFor="categorySelect" className="mb-1 block text-sm font-medium text-gray-300">Categoria</label>
        <select id="categorySelect" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-2" required>
          <option value="" disabled>Selecione uma categoria</option>
          {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
        </select>
      </div>
      
      <button type="submit" disabled={isLoading} className="w-full mt-2 rounded-md bg-purple-600 px-4 py-3 text-lg font-semibold transition-colors hover:bg-purple-700 disabled:bg-gray-500">
        {isLoading ? 'Salvando...' : submitButtonText}
      </button>
    </form>
  );
}