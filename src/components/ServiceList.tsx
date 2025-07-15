import React, { useEffect, useState } from 'react';
import { Service } from '@/types/telegram';
import { ServiceCard } from '@/components/ServiceCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceListProps {
  onSelectService: (service: Service) => void;
}

export const ServiceList: React.FC<ServiceListProps> = ({ onSelectService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('service_type', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Gagal memuat layanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat layanan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-red-600 text-center">{error}</p>
        <Button onClick={fetchServices} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Belum ada layanan tersedia.</p>
      </div>
    );
  }

  // Group services by type
  const servicesByType = services.reduce((acc, service) => {
    if (!acc[service.service_type]) {
      acc[service.service_type] = [];
    }
    acc[service.service_type].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const serviceTypeNames: Record<string, string> = {
    graphic_design: 'Desain Grafis',
    article_writing: 'Penulisan Artikel',
    translation: 'Penerjemahan',
    video_editing: 'Edit Video',
    website_development: 'Pembuatan Website',
  };

  return (
    <div className="space-y-8">
      {Object.entries(servicesByType).map(([type, typeServices]) => (
        <div key={type} className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-foreground">
              {serviceTypeNames[type] || type}
            </h2>
            <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
              {typeServices.length} layanan
            </span>
          </div>
          
          <div className="grid gap-4">
            {typeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onOrder={onSelectService}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};