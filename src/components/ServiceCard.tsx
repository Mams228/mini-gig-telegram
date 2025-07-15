import React from 'react';
import { Service } from '@/types/telegram';
import { formatPrice, getServiceTypeName } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Clock, Star } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onOrder: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onOrder }) => {
  return (
    <div className="service-card fade-in">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {service.name}
          </h3>
          <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm rounded-full mb-2">
            {getServiceTypeName(service.service_type)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {formatPrice(service.starting_price)}
          </div>
          <div className="text-sm text-muted-foreground">mulai dari</div>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {service.description}
      </p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          {service.delivery_time_days} hari pengerjaan
        </div>
        <div className="flex items-center text-sm text-yellow-600">
          <Star className="h-4 w-4 mr-1 fill-current" />
          5.0
        </div>
      </div>
      
      <Button 
        onClick={() => onOrder(service)}
        className="w-full tg-button"
      >
        Pesan Sekarang
      </Button>
    </div>
  );
};