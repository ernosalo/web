import React, { useState, useRef, useEffect } from 'react';
import { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  isDragging?: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  isDragging,
  onToggle, 
  onEdit,
  onDelete, 
  onDragStart, 
  onDragEnter, 
  onDragEnd 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== todo.text) {
      onEdit(todo.id, editText.trim());
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(todo.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div 
      draggable={!isEditing}
      onDragStart={() => onDragStart(todo.id)}
      onDragEnter={() => onDragEnter(todo.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`group flex items-center gap-4 p-4 mb-1 border-b transition-all cursor-default bg-transparent
        ${todo.completed ? 'opacity-40' : 'opacity-100'}
        ${isDragging ? 'scale-[1.02] bg-slate-100/50 dark:bg-zinc-900/50 border-black dark:border-white z-50' : 'border-slate-100 dark:border-zinc-900/50'}
        hover:bg-slate-100/30 dark:hover:bg-zinc-900/30 task-enter`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`cursor-grab active:cursor-grabbing p-1 text-slate-300 dark:text-zinc-800 hover:text-slate-500 dark:hover:text-zinc-600 transition-colors shrink-0 ${isEditing ? 'invisible' : ''}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>

        <button 
          onClick={() => onToggle(todo.id)}
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ${
            todo.completed 
            ? 'bg-black border-black dark:bg-white dark:border-white' 
            : 'border-slate-300 group-hover:border-black dark:border-zinc-700 dark:group-hover:border-white'
          }`}
        >
          {todo.completed && (
            <svg className="w-2.5 h-2.5 text-white dark:text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-base text-slate-800 dark:text-zinc-200 font-normal p-0 focus:ring-0"
          />
        ) : (
          <span 
            onClick={() => onToggle(todo.id)}
            className={`text-base cursor-pointer transition-all select-none flex-1 truncate ${
              todo.completed 
              ? 'line-through text-slate-400 dark:text-zinc-600' 
              : 'text-slate-700 dark:text-zinc-300'
            }`}
          >
            {todo.text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button 
          onClick={handleCopy}
          className={`opacity-0 group-hover:opacity-100 p-2 transition-all ${copied ? 'text-green-500' : 'text-slate-300 dark:text-zinc-700 hover:text-slate-500 dark:hover:text-zinc-400'}`}
          title="Copy text"
        >
          {copied ? (
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          )}
        </button>

        <button 
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-slate-500 transition-all dark:text-zinc-700 dark:hover:text-zinc-400"
          title="Edit task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M18.364 5.364a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728zM15.536 8.464L10 14" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3l5 5-11 11-5-5L16 3z" />
          </svg>
        </button>

        <button 
          onClick={() => onDelete(todo.id)}
          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all dark:text-zinc-700 dark:hover:text-red-400"
          aria-label="Delete task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TodoItem;