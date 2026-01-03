'use client';

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Todo, FilterType } from '@/types/todo';

export default function Home() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [newTodo, setNewTodo] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDueDate, setEditingDueDate] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(todos.map(todo => todo.category).filter(Boolean));
    return Array.from(cats);
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const statusMatch = filter === 'all' ||
        (filter === 'active' && !todo.completed) ||
        (filter === 'completed' && todo.completed);

      const categoryMatch = categoryFilter === 'all' || todo.category === categoryFilter;

      return statusMatch && categoryMatch;
    });
  }, [todos, filter, categoryFilter]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        title: newTodo,
        completed: false,
        category: newCategory,
        dueDate: newDueDate || undefined,
        createdAt: new Date().toISOString(),
      };
      setTodos([...todos, todo]);
      setNewTodo('');
      setNewCategory('');
      setNewDueDate('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
    setEditingDueDate(todo.dueDate || '');
  };

  const saveEdit = (id: string) => {
    if (editingTitle.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, title: editingTitle, dueDate: editingDueDate || undefined } : todo
      ));
    }
    setEditingId(null);
    setEditingTitle('');
    setEditingDueDate('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingDueDate('');
  };

  const activeTodosCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
            予定管理アプリ
          </h1>

          {/* Add Todo Form */}
          <div className="mb-8 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="新しいタスクを入力..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTodo}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium sm:w-auto whitespace-nowrap"
              >
                追加
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="カテゴリ（オプション）"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                すべて ({todos.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                未完了 ({activeTodosCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                完了済み ({todos.length - activeTodosCount})
              </button>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm text-gray-600 font-medium">カテゴリ:</span>
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  すべて
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      categoryFilter === category
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Todo List */}
          <div className="space-y-2">
            {filteredTodos.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                タスクがありません
              </p>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                  />

                  {editingId === todo.id ? (
                    <div className="flex-1 flex flex-col gap-2 w-full">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <input
                          type="date"
                          value={editingDueDate}
                          onChange={(e) => setEditingDueDate(e.target.value)}
                          className="sm:w-auto px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(todo.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
                        >
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 flex-1 w-full sm:w-auto">
                        <div className="flex-1 min-w-0">
                          <div className="break-words">
                            <span
                              className={`${
                                todo.completed
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-800'
                              }`}
                            >
                              {todo.title}
                            </span>
                            {todo.category && (
                              <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                {todo.category}
                              </span>
                            )}
                          </div>
                          {todo.dueDate && (
                            <div className="mt-1 text-xs text-gray-500">
                              期日: {new Date(todo.dueDate).toLocaleDateString('ja-JP')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-row sm:w-auto w-full">
                        <button
                          onClick={() => startEditing(todo)}
                          className="flex-1 sm:flex-none px-4 py-2 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium border border-blue-200"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="flex-1 sm:flex-none px-4 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-medium border border-red-200"
                        >
                          削除
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          {todos.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
              全{todos.length}件のタスク（未完了: {activeTodosCount}件）
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
