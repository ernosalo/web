import React from 'react';
import Header from './components/Header';
import TodoForm from './components/TodoForm';
import FilterBar from './components/FilterBar';
import TodoItem from './components/TodoItem';
import { useTodos } from './hooks/useTodos';
import { useTheme } from './hooks/useTheme';
import { sanitizeImportedTasks, downloadTasksAsJSON } from './utils/importExport';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useTodos();

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') return;
        const json = JSON.parse(result);
        const sanitized = sanitizeImportedTasks(json);

        if (sanitized.length > 0) {
          setTodos(sanitized);
          // Alert removed as requested for a cleaner experience
        } else {
          alert("The file does not contain any valid tasks.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExport = () => downloadTasksAsJSON(todos);

  const showMoveCompleted = activeFilters.includes('active') && 
                            activeFilters.includes('completed') && 
                            todos.some(t => !t.completed) && 
                            todos.some(t => t.completed);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
        <Header 
          progress={progress} 
          theme={theme} 
          onToggleTheme={toggleTheme}
          onImport={handleImport}
          onExport={handleExport}
        />

        <TodoForm onAdd={addTodo} />

        <FilterBar 
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          onMoveCompleted={moveCompletedToBottom}
          showMoveCompleted={showMoveCompleted}
        />

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