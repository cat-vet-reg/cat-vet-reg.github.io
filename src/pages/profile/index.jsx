import React, { useState } from 'react';
import supabase from '../../utils/supabase';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button  from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const Profile = ({ userEmail, userRole }) => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage('❌ Грешка: ' + error.message);
    } else {
      setMessage('✅ Паролата е обновена успешно!');
      setNewPassword('');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-red-500 p-4 text-white">Тест: Трябва да виждам червен блок тук</div>
      <Header />
      <main className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Настройки на профила</h1>
          <p className="text-base md:text-lg text-muted-foreground">Управление на вашия достъп до системата</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Карта с информация за потребителя */}
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Icon name="User" size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Информация</h3>
                <p className="text-sm text-muted-foreground italic">Вашият профил в центъра</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Имейл</label>
                <p className="text-foreground font-medium">{userEmail}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Роля</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary uppercase tracking-wider">
                  {userRole || 'staff'}
                </span>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-border">
               <Button 
                variant="outline" 
                className="w-full text-destructive border-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                Изход от системата
              </Button>
            </div>
          </div>

          {/* Карта за смяна на парола */}
          <div className="lg:col-span-2 bg-card rounded-lg p-6 shadow-sm border border-border">
            <div className="flex items-center gap-4 mb-6">
               <div className="bg-primary/10 p-3 rounded-full">
                <Icon name="Lock" size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Сигурност</h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Нова парола за достъп</label>
                <input
                  type="password"
                  placeholder="Минимум 6 символа"
                  className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary outline-none text-foreground"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="default"
                disabled={loading}
              >
                {loading ? 'Запазване...' : 'Обнови паролата'}
              </Button>

              {message && (
                <div className={`p-3 rounded-md text-sm font-medium ${message.includes('Грешка') ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                  {message}
                </div>
              )}
            </form>
            
            <div className="mt-8 p-4 bg-muted/50 rounded-md border border-dashed border-border text-sm text-muted-foreground">
              <strong>Важно:</strong> Промяната на паролата ще влезе в сила веднага. При следващо влизане използвайте новите данни.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;