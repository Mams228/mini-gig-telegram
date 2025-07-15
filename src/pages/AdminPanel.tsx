import React, { useEffect, useState } from 'react';
import { Order, Service } from '@/types/telegram';
import { useTelegramContext } from '@/context/TelegramContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatPrice, getStatusColor, getStatusName } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, DollarSign, Eye, FileText, Loader2, MessageSquare, Phone, Settings, User } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { user } = useTelegramContext();
  const { toast } = useToast();
  const [orders, setOrders] = useState<(Order & { service?: Service })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { service?: Service }) | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Set user context for RLS - skipped for now as we'll use direct queries

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast({
        title: 'Error',
        description: 'Gagal memuat data pesanan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, adminNotes?: string, resultLink?: string) => {
    try {
      setUpdating(true);
      
      const updateData: any = { status };
      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
      if (resultLink !== undefined) updateData.result_link = resultLink;

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Status pesanan berhasil diperbarui',
      });

      fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status pesanan',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Memuat data admin panel...</p>
        </div>
      </div>
    );
  }

  const ordersByStatus = {
    new: orders.filter(o => o.status === 'new'),
    in_progress: orders.filter(o => o.status === 'in_progress'),
    completed: orders.filter(o => o.status === 'completed'),
    cancelled: orders.filter(o => o.status === 'cancelled'),
  };

  const OrderCard: React.FC<{ order: Order & { service?: Service } }> = ({ order }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{order.service?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">ID: {order.id.slice(0, 8)}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusName(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{order.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{order.contact_info}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(order.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatPrice(order.service?.starting_price || 0)}</span>
          </div>
        </div>
        
        {order.deadline && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Deadline: {formatDate(order.deadline)}</span>
          </div>
        )}

        {order.notes && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>Catatan Client:</span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              {order.notes}
            </p>
          </div>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Kelola Pesanan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Kelola Pesanan</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <OrderManagement 
                order={selectedOrder} 
                onUpdate={updateOrderStatus}
                isUpdating={updating}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">Kelola pesanan dan layanan</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Pesanan</p>
          <p className="text-2xl font-bold text-primary">{orders.length}</p>
        </div>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new" className="relative">
            Baru
            {ordersByStatus.new.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {ordersByStatus.new.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            Diproses
            {ordersByStatus.in_progress.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {ordersByStatus.in_progress.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Selesai
            {ordersByStatus.completed.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {ordersByStatus.completed.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Dibatalkan
            {ordersByStatus.cancelled.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {ordersByStatus.cancelled.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
          <TabsContent key={status} value={status}>
            {statusOrders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  Tidak ada pesanan dengan status "{getStatusName(status)}"
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {statusOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const OrderManagement: React.FC<{
  order: Order & { service?: Service };
  onUpdate: (orderId: string, status: string, adminNotes?: string, resultLink?: string) => void;
  isUpdating: boolean;
}> = ({ order, onUpdate, isUpdating }) => {
  const [status, setStatus] = useState<'new' | 'in_progress' | 'completed' | 'cancelled'>(order.status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [resultLink, setResultLink] = useState(order.result_link || '');

  const handleSubmit = () => {
    onUpdate(order.id, status, adminNotes, resultLink);
  };

  const handleStatusChange = (value: string) => {
    if (value === 'new' || value === 'in_progress' || value === 'completed' || value === 'cancelled') {
      setStatus(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Status Pesanan</Label>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Baru</SelectItem>
            <SelectItem value="in_progress">Diproses</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Catatan Admin</Label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Tambahkan catatan internal atau update untuk client..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Link Hasil Kerja</Label>
        <Input
          value={resultLink}
          onChange={(e) => setResultLink(e.target.value)}
          placeholder="https://... (Google Drive, Figma, dll)"
          type="url"
        />
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        disabled={isUpdating}
      >
        {isUpdating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Memperbarui...
          </>
        ) : (
          <>
            <Settings className="h-4 w-4 mr-2" />
            Perbarui Pesanan
          </>
        )}
      </Button>
    </div>
  );
};