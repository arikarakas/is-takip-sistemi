import React, { useActionState, useEffect, useState } from 'react'
import logo from '../assets/logo.png';
import { API_ROOT } from '../utils/api';

async function loginAction(prevState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  const fail = (error) => ({
    success: false,
    error,
    username: username ?? '',
    passwordResetKey: (prevState.passwordResetKey ?? 0) + 1,
  });

  if (!username || !password){
    return fail("Lütfen kullanıcı adı veya şifre giriniz.");
  }

  try{
    const response = await fetch(`${API_ROOT}/auth/login`, {method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
    });

    const data = await response.json();

    if(!response.ok){
        return fail(data.detail || "Giriş başarısız. Bilgilerinizi kontrol edin.");
    }
    localStorage.setItem("token", data.access_token);

    return { success: true, error: null };
  }catch(err){
    console.error("Bağlantı hatası:", err);
    return fail("Sunucuya bağlanılamadı.");
  }
}

function Login({ onLoginSuccess }) {
  const [state, formAction, isPending] = useActionState(loginAction, {
    success: false,
    error: null,
    passwordResetKey: 0,
  });
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (state?.error && state.username !== undefined) {
      setUsername(state.username);
    }
  }, [state?.error, state?.username, state?.passwordResetKey]);

  if (state?.success) {
    onLoginSuccess();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Şirket İkonu */}
        <div className="mx-auto mb-6 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm">
          <img src={logo} alt='Şirket Logosu' className="object-contain filter drop-shadow-sm" />
        </div>

        <h2 className="text-center text-2xl font-black text-gray-800 tracking-tight">
          Sungurlar İş Takip
        </h2>
        <p className="text-center text-sm text-gray-400 mt-1 mb-8">
          Yönetim paneline erişmek için giriş yapın
        </p>

        {/* Dinamik Bildirim Alanları */}
        {state?.error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-pulse">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-600 border border-green-100">
            Giriş başarılı! Ana panele bağlanıyorsunuz...
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Kullanıcı Adı
            </label>
            <input
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adı"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Şifre
            </label>
            <input
              key={state.passwordResetKey ?? 0}
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Doğrulanıyor..." : "Giriş Yap"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login
