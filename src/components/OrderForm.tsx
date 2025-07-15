import React, { useState } from 'react';
import { Service, CreateOrderData } from '@/types/telegram';
import { useTelegramContext } from '@/context/TelegramContext';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, MessageSquare, Phone, User } from 'lucide-react';

interface OrderFormProps {
  service: Service;
  onSubmit: (orderData: CreateOrderData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ 
  service, 
  onSubmit, 
  onBack, 
  isSubmitting = false 
}) => {
  const { user } = useTelegramContext();
  const [formData, setFormData] = useState<CreateOrderData>({
    customer_name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    contact_info: '',
    service_id: service.id,
    deadline: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateOrderData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate minimum deadline (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Form Pemesanan</h1>
          <p className="text-sm text-muted-foreground">Isi detail pesanan Anda</p>
        </div>
      </div>

      {/* Service Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Layanan yang Dipilih</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">{service.name}</h3>
            <p className="text-sm text-muted-foreground">{service.description}</p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-muted-foreground">Harga mulai dari:</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(service.starting_price)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimasi pengerjaan:</span>
              <span className="text-sm font-medium">{service.delivery_time_days} hari</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Pemesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customer_name" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Nama Lengkap *</span>
              </Label>
              <Input
                id="customer_name"
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                required
                className="tg-input"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contact_info" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Email atau WhatsApp *</span>
              </Label>
              <Input
                id="contact_info"
                type="text"
                value={formData.contact_info}
                onChange={(e) => handleChange('contact_info', e.target.value)}
                placeholder="email@example.com atau +62812345678"
                required
                className="tg-input"
              />
              <p className="text-xs text-muted-foreground">
                Kami akan menghubungi Anda melalui kontak ini untuk update progress
              </p>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Deadline (Opsional)</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                min={minDate}
                className="tg-input"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan jika tidak ada deadline khusus
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Catatan Tambahan</span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Jelaskan requirement, style, referensi, atau detail khusus lainnya..."
                rows={4}
                className="tg-input resize-none"
              />
            </div>

            <div className="pt-4 space-y-3">
              <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">📝 Catatan Penting:</p>
                <ul className="space-y-1">
                  <li>• Pesanan akan diproses setelah konfirmasi dan pembayaran</li>
                  <li>• Tim kami akan menghubungi Anda dalam 1x24 jam</li>
                  <li>• Harga final akan disesuaikan dengan kompleksitas project</li>
                </ul>
              </div>
              
              <Button 
                type="submit" 
                className="w-full tg-button"
                disabled={isSubmitting || !formData.customer_name || !formData.contact_info}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Pesanan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};