import { useState, useEffect } from 'react';
import supabase from './utils/supabase';
import Login from './Login';
import Routes from "./Routes";

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Проверяваме дали имаме активна сесия веднага
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      setLoading(false);
    });

    // 2. Слушаме за промени (Вход/Изход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setUserRole(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Функция за взимане на ролята от таблицата profiles
  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (data) setUserRole(data.role);
  };

  if (loading) return <div className="p-10 text-center text-xl">Зареждане...</div>;

  // АКО НЯМА СЕСИЯ -> Показваме формата за вход
  if (!session) {
    return <Login />;
  }

  // АКО ИМА СЕСИЯ -> Пускаме ги в приложението и им даваме ролята
  // В App.js, накрая:
  return (
    <div className="app-container">
      {/* Подаваме session и userRole към компонента Routes */}
      <Routes session={session} userRole={userRole} />
    </div>
  );
}

export default App;