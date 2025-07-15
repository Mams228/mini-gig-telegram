import React, { useState } from 'react';
import { Service, CreateOrderData } from '@/types/telegram';
import { useTelegramContext } from '@/context/TelegramContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { ServiceList } from '@/components/ServiceList';
import { OrderForm } from '@/components/OrderForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Settings, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

type ViewMode = 'landing' | 'services' | 'order-form' | 'success';

const Index = () => {
  const { user, sendData, isReady, isInTelegram } = useTelegramContext();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setCurrentView('order-form');
  };

  const handleSubmitOrder = async (orderData: CreateOrderData) => {
    if (!isReady) {
      toast({
        title: 'Error',
        description: 'Telegram WebApp belum siap. Silakan coba lagi.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Call edge function to create order
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          orderData,
          telegramData: {
            user,
            initData: window.Telegram?.WebApp?.initData || null,
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        // Send data to Telegram Bot
        sendData({
          type: 'new_order',
          order: data.data.order,
          service: data.data.service,
          customer: orderData.customer_name,
          contact: orderData.contact_info,
          notes: orderData.notes,
          deadline: orderData.deadline,
          timestamp: new Date().toISOString()
        });

        toast({
          title: 'Pesanan Berhasil!',
          description: data.message,
        });

        setCurrentView('success');
      } else {
        throw new Error(data.message || 'Gagal membuat pesanan');
      }

    } catch (err) {
      console.error('Error submitting order:', err);
      toast({
        title: 'Error',
        description: err.message || 'Gagal mengirim pesanan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToServices = () => {
    setCurrentView('services');
    setSelectedService(null);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedService(null);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto">
        {currentView === 'landing' && (
          <LandingView 
            onViewServices={() => setCurrentView('services')}
            user={user}
            isInTelegram={isInTelegram}
          />
        )}
        
        {currentView === 'services' && (
          <div className="p-4 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Pilih Layanan</h1>
              <p className="text-muted-foreground">Temukan jasa digital yang Anda butuhkan</p>
            </div>
            <ServiceList onSelectService={handleSelectService} />
          </div>
        )}
        
        {currentView === 'order-form' && selectedService && (
          <OrderForm
            service={selectedService}
            onSubmit={handleSubmitOrder}
            onBack={handleBackToServices}
            isSubmitting={isSubmitting}
          />
        )}
        
        {currentView === 'success' && (
          <SuccessView onBackToLanding={handleBackToLanding} />
        )}
      </main>
    </div>
  );
};

const LandingView: React.FC<{
  onViewServices: () => void;
  user: any;
  isInTelegram: boolean;
}> = ({ onViewServices, user, isInTelegram }) => {
  return (
    <div className="space-y-8 p-4">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Selamat datang di <span className="text-primary">FreelanceHub</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform jasa digital terpercaya untuk semua kebutuhan bisnis Anda. 
            Dari desain hingga development, kami siap membantu!
          </p>
        </div>
        
        {user && (
          <div className="bg-primary/10 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-sm text-primary font-medium">
              👋 Halo, {user.first_name}! Siap berkarya bersama kami?
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onViewServices} className="tg-button text-lg px-8 py-6">
            <Sparkles className="h-5 w-5 mr-2" />
            Jelajahi Layanan
          </Button>
          
          <Link to="/admin">
            <Button variant="outline" className="tg-button-outline text-lg px-8 py-6">
              <Settings className="h-5 w-5 mr-2" />
              Admin Panel
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center space-y-3 p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Tim Profesional</h3>
          <p className="text-sm text-muted-foreground">
            Dikerjakan oleh freelancer berpengalaman dan berkualitas tinggi
          </p>
        </Card>

        <Card className="text-center space-y-3 p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Kualitas Terjamin</h3>
          <p className="text-sm text-muted-foreground">
            Revisi unlimited hingga hasil sesuai ekspektasi Anda
          </p>
        </Card>

        <Card className="text-center space-y-3 p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Harga Transparan</h3>
          <p className="text-sm text-muted-foreground">
            Tidak ada biaya tersembunyi, harga sesuai dengan kompleksitas project
          </p>
        </Card>
      </div>

      {/* Popular Services */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-foreground">Layanan Populer</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            'Logo Design',
            'Website',
            'Video Editing',
            'Artikel SEO',
            'Terjemahan'
          ].map((service) => (
            <Badge key={service} variant="secondary" className="justify-center py-2 text-sm">
              {service}
            </Badge>
          ))}
        </div>
      </div>

      {!isInTelegram && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              🚀 Mode Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Anda sedang menggunakan aplikasi di mode development. 
              Untuk pengalaman penuh, buka melalui Telegram Bot.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SuccessView: React.FC<{ onBackToLanding: () => void }> = ({ onBackToLanding }) => {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 text-center py-12">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Pesanan Berhasil Dikirim! 🎉</h1>
          <p className="text-muted-foreground">
            Terima kasih atas kepercayaan Anda. Tim kami akan menghubungi Anda dalam 1x24 jam.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">Langkah Selanjutnya:</h3>
        <ul className="text-left space-y-2 text-sm text-muted-foreground">
          <li>✅ Tim akan review detail pesanan Anda</li>
          <li>📞 Kami akan menghubungi untuk konfirmasi dan pembahasan detail</li>
          <li>💰 Setelah deal, lakukan pembayaran untuk memulai pengerjaan</li>
          <li>🚀 Project dimulai sesuai timeline yang disepakati</li>
        </ul>
      </Card>

      <div className="space-y-3">
        <Button onClick={onBackToLanding} className="tg-button">
          Kembali ke Beranda
        </Button>
        <p className="text-xs text-muted-foreground">
          Atau tutup aplikasi ini dan tunggu kontak dari tim kami
        </p>
      </div>
    </div>
  );
};

export default Index;
