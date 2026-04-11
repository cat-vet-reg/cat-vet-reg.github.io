import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import supabase from 'utils/supabase';

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">
          Вход в Системата - Кастрационен Център
        </h2>
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