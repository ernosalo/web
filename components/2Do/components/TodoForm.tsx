import React, { useState } from 'react';

interface TodoFormProps {
  onAdd: (text: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10 relative flex items-center group">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="New task"
        className="w-full bg-transparent text-xl font-light py-2 border-b-2 border-slate-100 focus:outline-none focus:border-black dark:border-zinc-900 dark:focus:border-white transition-colors placeholder-slate-300 dark:placeholder-zinc-700 dark:text-white pr-10"
      />
      <button 
        type="submit"
        disabled={!value.trim()}
        className={`absolute right-0 bottom-2 p-2 rounded-full transition-all duration-300 ${
          value.trim() 
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
  );
};

export default TodoForm;
