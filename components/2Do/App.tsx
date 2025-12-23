
import React, { useState, useEffect, useMemo } from 'react';
import { Todo } from './types';
import TodoItem from './components/TodoItem';

type FilterType = 'active' | 'completed';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zen_todos_simple');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['active', 'completed']);

  useEffect(() => {
    localStorage.setItem('zen_todos_simple', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now()
    };

    setTodos(prev => [newTodo, ...prev]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleFilter = (f: FilterType) => {
    setActiveFilters(prev => 
      prev.includes(f) 
        ? prev.filter(item => item !== f) 
        : [...prev, f]
    );
  };

  const filteredTodos = useMemo(() => {
    const showActive = activeFilters.includes('active');
    const showCompleted = activeFilters.includes('completed');
    
    if (showActive && showCompleted) return todos;
    if (showActive) return todos.filter(t => !t.completed);
    if (showCompleted) return todos.filter(t => t.completed);
    return [];
  }, [todos, activeFilters]);

  const progress = useMemo(() => {
    if (todos.length === 0) return 0;
    return Math.round((todos.filter(t => t.completed).length / todos.length) * 100);
  }, [todos]);

  return (
    <div className="w-full bg-transparent transition-colors duration-300">
      <div className="max-w-xl mx-auto px-6 py-12">
        <header className="mb-12 relative">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">2Do</h1>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-zinc-500 text-sm font-light">Focus on what matters.</p>
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">{progress}% DONE</span>
          </div>
          <div className="mt-4 w-full h-[3px] bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black dark:bg-white transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <form onSubmit={handleAddTodo} className="mb-10 relative flex items-center group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="New task"
            className="w-full bg-transparent text-2xl font-light py-3 border-b-2 border-slate-100 focus:outline-none focus:border-black dark:border-zinc-900 dark:focus:border-white transition-colors placeholder-slate-300 dark:placeholder-zinc-700 dark:text-white pr-10"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className={`absolute right-0 bottom-3 p-2 rounded-full transition-all duration-300 ${
              inputValue.trim() 
                ? 'text-black dark:text-white opacity-100 scale-100 hover:bg-slate-100 dark:hover:bg-zinc-900' 
                : 'text-slate-200 dark:text-zinc-800 opacity-20 scale-90 pointer-events-none'
            }`}
            aria-label="Add task"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </form>

        <nav className="flex gap-6 mb-8 border-b border-slate-50 dark:border-zinc-900 pb-4">
          {(['active', 'completed'] as const).map((f) => {
            const isActive = activeFilters.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  isActive 
                  ? 'text-black dark:text-white' 
                  : 'text-slate-300 dark:text-zinc-700 hover:text-slate-400 dark:hover:text-zinc-500'
                }`}
              >
                <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-black dark:bg-white' : 'bg-transparent border border-slate-200 dark:border-zinc-800'}`} />
                {f}
              </button>
            );
          })}
        </nav>

        <div className="min-h-[300px]">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggle={toggleTodo} 
                onDelete={deleteTodo} 
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-zinc-800">
              <p className="text-sm font-light italic">
                {activeFilters.length === 0 ? "Select a filter to see tasks." : "No tasks found."}
              </p>
            </div>
          )}
        </div>

        <footer className="mt-20 text-center">
          <p className="text-[10px] text-slate-300 dark:text-zinc-800 font-bold uppercase tracking-[0.4em]">DISTRACTION FREE</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
