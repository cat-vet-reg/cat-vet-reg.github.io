import { useState, useEffect } from 'react';
import supabase from './utils/supabase';
import Routes from "./Routes";

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setUserRole(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle(); // Използвай maybeSingle вместо single

      if (error) {
        console.error("Грешка при взимане на роля:", error.message);
        return;
      }
      
      if (data) setUserRole(data.role);
    } catch (err) {
      console.error("Системна грешка:", err);
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Зареждане...</div>;

  return (
    <div className="app-container">
      <Routes session={session} userRole={userRole} />
    </div>
  );
}

export default App;