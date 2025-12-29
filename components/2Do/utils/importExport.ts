import { Todo } from '../types';

/**
 * Validates and cleans raw data from JSON to match the Todo interface.
 */
export const sanitizeImportedTasks = (data: any): Todo[] => {
  const rawData = Array.isArray(data) ? data : (data.todos || data.tasks || []);
  
  if (!Array.isArray(rawData)) return [];

  return rawData
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      id: String(item.id || Math.random().toString(36).substr(2, 9)),
      text: String(item.text || item.title || item.task || 'Untitled Task'),
      completed: Boolean(item.completed || item.done || false),
      createdAt: Number(item.createdAt || Date.now())
    }));
};

/**
 * Triggers a browser download of the current task list as a JSON file.
 */
export const downloadTasksAsJSON = (todos: Todo[]) => {
  const dataStr = JSON.stringify(todos, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const fileName = `2do-tasks-${new Date().toISOString().split('T')[0]}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
