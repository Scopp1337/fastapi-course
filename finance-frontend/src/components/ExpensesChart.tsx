import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/client';
import * as Types from '../api/types';

// Цвета для секторов диаграммы
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

export default function ExpensesChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    api.get<Types.Operation[]>('/operations').then((res) => {
      // Берем только расходы (expense)
      const expenses = res.data.filter((op) => op.type === 'expense');

      // Группируем по категориям (category)
      const grouped = expenses.reduce((acc: any, op: any) => {
        const category = op.category || 'Без категории';
        acc[category] = (acc[category] || 0) + Number(op.amount);
        return acc;
      }, {});

      // Преобразуем в формат для графика
      const chartData = Object.keys(grouped).map((key) => ({
        name: key,
        value: grouped[key],
      }));

      setData(chartData);
    }).catch(console.error);
  }, []);

  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8 transition-colors">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Расходы по категориям</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`${Number(value).toFixed(2)}`, 'Сумма']}
              contentStyle={{ borderRadius: '8px', backgroundColor: '#1f2937', color: '#fff', border: 'none' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}