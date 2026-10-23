import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/client';
import * as Types from '../api/types';
import ExpensesChart from '../components/ExpensesChart'; // Импорт графика

export default function Dashboard() {
  const [wallets, setWallets] = useState<Types.Wallet[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState('rub');
  const [showOpModal, setShowOpModal] = useState(false);
  const [opType, setOpType] = useState<'income' | 'expense'>('income');
  const [activeWallet, setActiveWallet] = useState<Types.Wallet | null>(null);
  const [opAmount, setOpAmount] = useState('');
  const [opDesc, setOpDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWallets = async () => {
    try {
      const res = await api.get<Types.Wallet[]>('/wallets');
      setWallets(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchWallets(); }, []);

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID скопирован!');
  };

  const createWallet = async () => {
    if (!newName.trim()) return toast.error('Введите название');
    setLoading(true);
    try {
      await api.post('/wallets', { name: newName, currency: newCurrency, initial_balance: 0 });
      toast.success('Кошелек создан!');
      setShowCreate(false); setNewName(''); fetchWallets();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Ошибка');
    } finally { setLoading(false); }
  };

  const openOperationModal = (wallet: Types.Wallet, type: 'income' | 'expense') => {
    setActiveWallet(wallet); setOpType(type); setOpAmount(''); setOpDesc(''); setShowOpModal(true);
  };

  const handleOperation = async () => {
    if (!opAmount || Number(opAmount) <= 0) return toast.error('Введите сумму');
    setLoading(true);
    try {
      const url = opType === 'income' ? '/operations/income' : '/operations/expense';
      await api.post(url, { wallet_name: activeWallet?.name, amount: opAmount, description: opDesc });
      toast.success(opType === 'income' ? 'Счет пополнен!' : 'Деньги списаны!');
      setShowOpModal(false); fetchWallets();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Ошибка');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Приветствие и Общий баланс */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Привет! 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          У тебя {wallets.length} кошельков. Общий баланс: <span className="font-bold text-blue-600 dark:text-blue-400">{totalBalance.toFixed(2)}</span>
        </p>
      </div>

      {/* Вставляем компонент графика */}
      <ExpensesChart />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Мои счета</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition-colors">
          + Создать
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl mb-8 flex gap-4 items-end border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="flex-1">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Название</label>
            <input placeholder="Зарплата" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
          </div>
          <div className="w-32">
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Валюта</label>
            <select value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <option value="rub">RUB</option><option value="usd">USD</option><option value="eur">EUR</option>
            </select>
          </div>
          <button onClick={createWallet} disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {loading ? '...' : 'Создать'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((w) => (
          <div key={w.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between transition-colors group">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{w.name}</h3>
                <button onClick={() => copyToClipboard(String(w.id))} className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Скопировать ID">
                  📋
                </button>
              </div>
              <p className="text-3xl font-bold mt-3 mb-4 text-gray-900 dark:text-white">
                {w.balance} <span className="text-lg text-gray-500 dark:text-gray-400">{w.currency.toUpperCase()}</span>
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => openOperationModal(w, 'income')} className="flex-1 bg-green-50 dark:bg-green-600/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-600/50 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-colors text-sm font-medium">+ Пополнить</button>
              <button onClick={() => openOperationModal(w, 'expense')} className="flex-1 bg-red-50 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-600/50 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-medium">- Списать</button>
            </div>
          </div>
        ))}
      </div>

      {showOpModal && activeWallet && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm shadow-xl transition-colors">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {opType === 'income' ? 'Пополнение' : 'Списание'} — {activeWallet.name}
            </h3>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Сумма</label>
            <input type="number" placeholder="0.00" value={opAmount} onChange={(e) => setOpAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Описание (категория)</label>
            <input placeholder="Например: Продукты" value={opDesc} onChange={(e) => setOpDesc(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-6 outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
            <div className="flex gap-3">
              <button onClick={() => setShowOpModal(false)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Отмена</button>
              <button onClick={handleOperation} disabled={loading} className={`flex-1 py-2 rounded-lg font-bold text-white transition-colors ${opType === 'income' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} disabled:opacity-50`}>
                {loading ? '...' : 'ОК'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}