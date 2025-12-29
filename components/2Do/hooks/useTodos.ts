import { useState, useEffect, useMemo } from 'react';
import { Todo } from '../types';

export type FilterType = 'active' | 'completed';

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const saved = localStorage.getItem('zen_todos_simple');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeFilters, setActiveFilters] = useState<FilterType[]>(['active', 'completed']);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('zen_todos_simple', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const editTodo = (id: string, text: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const moveCompletedToBottom = () => {
    setTodos(prev => {
      const active = prev.filter(t => !t.completed);
      const completed = prev.filter(t => t.completed);
      return [...active, ...completed];
    });
  };

  const toggleFilter = (f: FilterType) => {
    setActiveFilters(prev => 
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
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

  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragEnd = () => setDraggedId(null);
  const handleDragEnter = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setTodos(prev => {
      const newTodos = [...prev];
      const draggedIndex = newTodos.findIndex(t => t.id === draggedId);
      const targetIndex = newTodos.findIndex(t => t.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      const [draggedItem] = newTodos.splice(draggedIndex, 1);
      newTodos.splice(targetIndex, 0, draggedItem);
      return newTodos;
    });
  };

  return {
    todos,
    setTodos,
    filteredTodos,
    activeFilters,
    progress,
    draggedId,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    moveCompletedToBottom,
    toggleFilter,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  };
};
