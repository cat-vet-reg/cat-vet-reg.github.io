import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import supabase from 'utils/supabase';

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        {/* Секция за Логото */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/nkc-logo.jpg" // Увери се, че логото е в папката public или използваш правилния път
            alt="Лого Кастрационен Център" 
            className="h-20 w-auto mb-4" // Регулирай височината според нуждите
          />
          <h2 className="text-2xl font-bold text-center text-slate-800">
            Вход в Системата
          </h2>
          <p className="text-slate-500 text-sm mt-1">Немски кастрационен център - Пловдив</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]} // Изключваме Google/Facebook за по-голяма сигурност
          localization={{
            variables: {
              sign_in: {
                email_label: 'Имейл адрес',
                password_label: 'Парола',
                button_label: 'Влез',
                loading_button_label: 'Влизане...',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;