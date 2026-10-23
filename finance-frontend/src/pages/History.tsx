import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/client';
import * as Types from '../api/types';

const getCategoryIcon = (category: string | null) => {
  if (!category) return '💸';
  const text = category.toLowerCase();
  if (text.includes('ед') || text.includes('обед') || text.includes('кафе') || text.includes('продукт')) return '🍔';
  if (text.includes('такс') || text.includes('транспорт') || text.includes('метро')) return '🚕';
  if (text.includes('зарплат') || text.includes('аванс') || text.includes('доход')) return '💰';
  if (text.includes('развлеч') || text.includes('кино') || text.includes('игр')) return '🎮';
  if (text.includes('коммунал') || text.includes('свет') || text.includes('вода')) return '🏠';
  return '🛒';
};

export default function History() {
  const [operations, setOperations] = useState<Types.Operation[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Состояние для пагинации
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchOperations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFrom) params.date_from = new Date(dateFrom).toISOString();
      if (dateTo) params.date_to = new Date(dateTo).toISOString();

      const res = await api.get<Types.Operation[]>('/operations', { params });
      const sorted = res.data.sort((a: Types.Operation, b: Types.Operation) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOperations(sorted);
      setVisibleCount(10); // Сбрасываем пагинацию при новом поиске
    } catch (e) {
      toast.error('Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOperations(); }, []);

  const filteredOperations = operations.filter(op => {
    const matchesSearch = (op.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || op.type === filterType;
    return matchesSearch && matchesType;
  });

  // Логика пагинации
  const visibleOperations = filteredOperations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOperations.length;

  // Экспорт в CSV
  const exportToCSV = () => {
    if (filteredOperations.length === 0) return toast.error('Нет данных для экспорта');

    // Заголовки колонок
    const headers = ['Дата', 'Тип', 'Сумма', 'Валюта', 'Категория', 'ID Кошелька'];

    // Преобразуем данные
    const rows = filteredOperations.map(op => [
      new Date(op.created_at).toLocaleString('ru-RU'),
      op.type === 'income' ? 'Доход' : op.type === 'expense' ? 'Расход' : 'Перевод',
      op.amount,
      op.currency.toUpperCase(),
      op.category || 'Без категории',
      op.wallet_id
    ]);

    // Собираем CSV строку
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Создаем файл и скачиваем
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `История_операций_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Файл скачан!');
  };

  const getTypeColor = (type: string) => {
    if (type === 'income') return 'text-green-600 dark:text-green-400';
    if (type === 'expense') return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getTypeText = (type: string) => {
    if (type === 'income') return 'Доход';
    if (type === 'expense') return 'Расход';
    return 'Перевод';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">История операций</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 px-4 py-2 rounded-lg font-bold text-white hover:bg-green-500 transition-colors flex items-center gap-2"
        >
          📥 Экспорт в CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-end border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Поиск по категории</label>
          <input
            type="text"
            placeholder="Например: Обед"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Тип</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-200 dark:border-gray-600 outline-none"
          >
            <option value="all">Все</option>
            <option value="income">Только доходы</option>
            <option value="expense">Только расходы</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">От</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-200 dark:border-gray-600 outline-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">До</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-200 dark:border-gray-600 outline-none" />
        </div>

        <button onClick={fetchOperations} className="bg-blue-600 px-6 py-2 rounded-lg font-bold text-white hover:bg-blue-500 transition-colors">
          Применить
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <p className="p-8 text-center text-gray-500 dark:text-gray-400">Загрузка...</p>
        ) : filteredOperations.length === 0 ? (
          <p className="p-8 text-center text-gray-500 dark:text-gray-400">Ничего не найдено</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm transition-colors">
                    <th className="p-4 font-medium">Дата</th>
                    <th className="p-4 font-medium">Тип</th>
                    <th className="p-4 font-medium">Сумма</th>
                    <th className="p-4 font-medium">Категория</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOperations.map((op) => (
                    <tr key={op.id} className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(op.created_at).toLocaleString('ru-RU')}
                      </td>
                      <td className={`p-4 font-semibold ${getTypeColor(op.type)}`}>
                        {getTypeText(op.type)}
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">
                        {op.type === 'expense' ? '-' : '+'}
                        {op.amount} {op.currency.toUpperCase()}
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(op.category)}</span>
                        {op.category || 'Без категории'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Кнопка Показать еще */}
            {hasMore && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Показать еще (осталось {filteredOperations.length - visibleCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}