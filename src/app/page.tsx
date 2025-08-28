'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: number;
  imageUrl: string;
  answers: string;
}

type GameState = 'idle' | 'playing' | 'finished';

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(60);
  const [lives, setLives] = useState(3);
  const [gameOverReason, setGameOverReason] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const correctSoundRef = useRef<HTMLAudioElement>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement>(null);
  const clickSoundRef = useRef<HTMLAudioElement>(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.map((cat: { name: string }) => cat.name));
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
    }
  };

  useEffect(() => {
    if (gameState === 'idle') {
      fetchCategories();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timer === 0) {
      playSound(incorrectSoundRef);
      setGameOverReason('Seu tempo acabou!');
      setGameState('finished');
      return;
    }

    if (lives === 0) {
      playSound(incorrectSoundRef);
      setGameOverReason('Você ficou sem vidas!');
      setGameState('finished');
      return;
    }
    
    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [gameState, timer, lives]);

  const fetchNextQuestion = async () => {
    setFeedback('');
    setInputValue('');
    try {
      const url = `/api/game/question?category=${encodeURIComponent(selectedCategory)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Não foi possível carregar uma nova pergunta.');
      const data = await response.json();
      setCurrentQuestion(data);
      inputRef.current?.focus();
    } catch (error) {
      console.error(error);
      setFeedback('Erro ao carregar pergunta. Tente novamente.');
    }
  };

  const playSound = (soundRef: React.RefObject<HTMLAudioElement>) => {
    soundRef.current?.play().catch(error => console.error("Erro ao tocar o som:", error));
  };

  const startGame = (category: string) => {
    playSound(clickSoundRef);
    setSelectedCategory(category);
    setScore(0);
    setTimer(60);
    setLives(3);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      fetchNextQuestion();
    }
  }, [gameState]);

  const handleAnswerSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!currentQuestion || !inputValue.trim()) return;
    const correctAnswers = JSON.parse(currentQuestion.answers).map((ans: string) => ans.toLowerCase().trim());
    const userAnswer = inputValue.toLowerCase().trim();
    if (correctAnswers.includes(userAnswer)) {
      playSound(correctSoundRef);
      setScore(score + 1);
      setFeedback('Correto!');
      setTimeout(fetchNextQuestion, 500);
    } else {
      playSound(incorrectSoundRef);
      setLives(lives - 1);
      setFeedback('Incorreto!');
      setInputValue('');
    }
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    <>
      <audio ref={correctSoundRef} src="/sounds/som-acerto.mp3" preload="auto" />
      <audio ref={incorrectSoundRef} src="/sounds/som-erro.mp3" preload="auto" />
      <audio ref={clickSoundRef} src="/sounds/som-clique.mp3" preload="auto" />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4 overflow-hidden">
        <div className="w-full max-w-3xl rounded-lg bg-gray-800 p-6 shadow-2xl text-center">
          <AnimatePresence mode="wait">
            {gameState === 'idle' && (
              <motion.div key="idle" variants={pageVariants} initial="initial" animate="in" exit="out">
                <h1 className="text-5xl font-bold text-purple-400">PopSauce</h1>
                <p className="mt-4 text-lg text-gray-300">Selecione uma categoria para começar!</p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startGame('Todas')} className="rounded-lg bg-purple-600 px-6 py-3 text-xl font-semibold">
                    Todas as Categorias
                  </motion.button>
                  {categories.map(cat => (
                    <motion.button key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startGame(cat)} className="rounded-lg bg-gray-600 px-6 py-3 text-xl font-semibold">
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {gameState === 'playing' && currentQuestion && (
              <motion.div key="playing" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-left"><h3 className="text-sm text-gray-400">PONTOS</h3><p className="text-2xl font-bold">{score}</p></div>
                  <div className="text-center"><h3 className="text-sm text-gray-400">VIDAS</h3><p className="text-2xl font-bold text-red-400">{'❤️'.repeat(lives)}</p></div>
                  <div className="text-right"><h3 className="text-sm text-gray-400">TEMPO</h3><p className="text-2xl font-bold">{timer}</p></div>
                </div>
                <motion.div key={currentQuestion.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full aspect-video bg-black rounded-md overflow-hidden mb-4">
                  <img src={currentQuestion.imageUrl} alt="Adivinhe" className="w-full h-full object-contain" />
                </motion.div>
                <form onSubmit={handleAnswerSubmit}>
                  <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="w-full rounded-md border border-gray-600 bg-gray-700 px-4 py-3 text-lg text-center text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-purple-500" placeholder="Qual a sua resposta?" autoFocus/>
                </form>
                <div className="h-8 mt-2 flex items-center justify-center">
                  <AnimatePresence mode="wait">{feedback && <motion.p key={feedback} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className={`text-xl font-semibold ${feedback === 'Correto!' ? 'text-green-400' : 'text-red-400'}`}>{feedback}</motion.p>}</AnimatePresence>
                </div>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div key="finished" variants={pageVariants} initial="initial" animate="in" exit="out">
                <h1 className="text-5xl font-bold">{gameOverReason}</h1>
                <p className="mt-2 text-xl text-gray-400 capitalize">Categoria: {selectedCategory}</p>
                <p className="mt-4 text-2xl text-gray-300">Sua pontuação final foi:</p>
                <p className="my-6 text-7xl font-bold text-purple-400">{score}</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setGameState('idle')} className="mt-4 rounded-lg bg-purple-600 px-8 py-4 text-2xl font-semibold">
                  Voltar ao Início
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}