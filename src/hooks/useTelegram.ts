import { useEffect, useState } from 'react';
import { TelegramWebApp, TelegramUser } from '@/types/telegram';

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const app = window.Telegram?.WebApp;
    if (app) {
      app.ready();
      app.expand();
      
      setWebApp(app);
      setUser(app.initDataUnsafe?.user || null);
      setIsReady(true);

      // Set theme based on Telegram's color scheme
      if (app.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Development mode fallback
      console.warn('Telegram WebApp not available. Running in development mode.');
      setIsReady(true);
      // Mock user for development
      setUser({
        id: 123456789,
        first_name: 'John',
        last_name: 'Doe',
        username: 'johndoe',
        language_code: 'en'
      });
    }
  }, []);

  const sendData = (data: any) => {
    if (webApp) {
      webApp.sendData(JSON.stringify(data));
    } else {
      console.log('Would send data to Telegram:', data);
    }
  };

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      } else {
        resolve(confirm(message));
      }
    });
  };

  const close = () => {
    if (webApp) {
      webApp.close();
    } else {
      window.close();
    }
  };

  return {
    webApp,
    user,
    isReady,
    sendData,
    showAlert,
    showConfirm,
    close,
    isInTelegram: !!webApp
  };
};