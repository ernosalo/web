
import React from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div className={`group flex items-center gap-4 p-4 mb-3 rounded-2xl border transition-all task-enter
      ${todo.completed ? 'opacity-40' : 'opacity-100'}
      bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm
      dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700`}>
      
      <button 
        onClick={() => onToggle(todo.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          todo.completed 
          ? 'bg-black border-black dark:bg-white dark:border-white' 
          : 'border-slate-200 group-hover:border-black dark:border-zinc-700 dark:group-hover:border-white'
        }`}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white dark:text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <span 
        onClick={() => onToggle(todo.id)}
        className={`flex-1 text-base cursor-pointer transition-all select-none ${
          todo.completed 
          ? 'line-through text-slate-400 dark:text-zinc-600' 
          : 'text-slate-800 dark:text-zinc-200'
        }`}
      >
        {todo.text}
      </span>

      <button 
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all dark:text-zinc-600 dark:hover:text-red-400"
        aria-label="Delete task"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default TodoItem;
