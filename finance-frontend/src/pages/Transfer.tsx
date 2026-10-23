import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import * as Types from '../api/types';

export default function Transfer() {
  const [wallets, setWallets] = useState<Types.Wallet[]>([]);
  const [fromWallet, setFromWallet] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Types.Wallet[]>('/wallets').then((res) => setWallets(res.data)).catch(console.error);
  }, []);

  const handleTransfer = async () => {
    if (!fromWallet || !toWallet || !amount) {
      return alert('Заполните все поля');
    }
    if (fromWallet === toWallet) {
      return alert('Кошельки должны быть разными');
    }

    setLoading(true);
    try {
      await api.post('/operations/transfer', {
        from_wallet_id: Number(fromWallet),
        to_wallet_id: Number(toWallet),
        amount: amount
      });
      alert('Перевод успешно выполнен!');
      navigate('/dashboard');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ошибка перевода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md w-full shadow-lg transition-colors">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Перевод средств</h2>

        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Откуда</label>
        <select
          value={fromWallet}
          onChange={(e) => setFromWallet(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">Выберите кошелек</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.balance} {w.currency.toUpperCase()})
            </option>
          ))}
        </select>

        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Куда</label>
        <select
          value={toWallet}
          onChange={(e) => setToWallet(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">Выберите кошелек</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name} ({w.currency.toUpperCase()})
            </option>
          ))}
        </select>

        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Сумма</label>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-6 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />

        <button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full bg-blue-600 p-3 rounded-lg font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Перевод...' : 'Перевести'}
        </button>
      </div>
    </div>
  );
}