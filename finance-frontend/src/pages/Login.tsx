import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Login() {
  const [login, setLogin] = useState('');
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      // Пытаемся создать пользователя (если его еще нет)
      await api.post('/users', { login });
      // Сохраняем введенный логин как токен
      localStorage.setItem('token', login);
      navigate('/dashboard');
    } catch (error: any) {
      // Если бэкенд вернул 400 (Bad Request), значит юзер уже существует
      if (error.response?.status === 400) {
        // Все равно сохраняем логин как токен и пускаем внутрь
        localStorage.setItem('token', login);
        navigate('/dashboard');
      } else {
        // Если это какая-то другая ошибка (например, сервер выключен)
        alert('Ошибка сервера: ' + error.message);
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl mb-6 text-center font-bold">Вход в FinApp</h1>
        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full bg-gray-700 p-3 rounded mb-4 outline-none"
        />
        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-500"
        >
          Войти
        </button>
      </div>
    </div>
  );
}