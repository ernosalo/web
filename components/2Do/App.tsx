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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('zen_theme');
    return (savedTheme as 'light' | 'dark') || 'dark';
  });
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('zen_todos_simple', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('zen_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const editTodo = (id: string, newText: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, text: newText } : t
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

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnter = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const newTodos = [...todos];
    const draggedIndex = newTodos.findIndex(t => t.id === draggedId);
    const targetIndex = newTodos.findIndex(t => t.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [draggedItem] = newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);
    
    setTodos(newTodos);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12 relative">
          <button 
            onClick={toggleTheme}
            className="absolute -top-4 -right-2 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors text-slate-500 dark:text-zinc-400"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 font-mono italic">2Do</h1>
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-zinc-500 text-sm font-light">Focus on what matters.</p>
            <span className="text-xs font-medium text-slate-400 dark:text-zinc-600 uppercase tracking-widest">{progress}% DONE</span>
          </div>
          <div className="mt-4 w-full h-[2px] bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
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
            className="w-full bg-transparent text-xl font-light py-2 border-b-2 border-slate-100 focus:outline-none focus:border-black dark:border-zinc-900 dark:focus:border-white transition-colors placeholder-slate-300 dark:placeholder-zinc-700 dark:text-white pr-10"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className={`absolute right-0 bottom-2 p-2 rounded-full transition-all duration-300 ${
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

        <nav className="flex gap-6 mb-8 border-b border-slate-100 dark:border-zinc-900 pb-4">
          {(['active', 'completed'] as const).map((f) => {
            const isActive = activeFilters.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isActive 
                  ? 'text-black dark:text-white' 
                  : 'text-slate-300 dark:text-zinc-700 hover:text-slate-400 dark:hover:text-zinc-500'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-black dark:bg-white' : 'bg-transparent border border-slate-200 dark:border-zinc-800'}`} />
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
                isDragging={draggedId === todo.id}
                onToggle={toggleTodo} 
                onEdit={editTodo}
                onDelete={deleteTodo}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
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
          <p className="text-[10px] text-slate-300 dark:text-zinc-800 font-bold uppercase tracking-[0.3em]">DISTRACTION FREE</p>
        </footer>
      </div>
    </div>
  );
};

export default App;