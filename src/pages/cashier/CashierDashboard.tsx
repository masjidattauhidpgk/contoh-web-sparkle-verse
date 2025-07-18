
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, formatDate } from '@/utils/orderUtils';
import { Search, User, Calendar, CreditCard, Receipt, Eye, EyeOff, Printer } from 'lucide-react';
import { CashPayment } from '@/components/cashier/CashPayment';

interface Order {
  id: string;
  child_name: string;
  child_class: string;
  total_amount: number;
  payment_status: string;
  delivery_date: string;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    menu_items: {
      name: string;
      image_url?: string;
    } | null;
  }[];
  children?: {
    nik?: string;
    nis?: string;
  } | null;
}

const CashierDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  console.log('CashierDashboard: Component rendered');

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      console.log('CashierDashboard: Fetching pending orders');
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          child_name,
          child_class,
          total_amount,
          payment_status,
          delivery_date,
          created_at,
          child_id,
          children (
            nik,
            nis
          ),
          order_items (
            id,
            quantity,
            price,
            menu_items (
              name,
              image_url
            )
          )
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('CashierDashboard: Error fetching orders:', error);
        throw error;
      }

      console.log('CashierDashboard: Fetched orders:', data?.length || 0);
      console.log('CashierDashboard: Sample order data:', data?.[0]);
      setOrders(data || []);
    } catch (error) {
      console.error('CashierDashboard: Error in fetchPendingOrders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchOrders = async () => {
    if (!searchTerm.trim()) {
      fetchPendingOrders();
      return;
    }

    try {
      console.log('CashierDashboard: Searching orders with term:', searchTerm);
      setLoading(true);

      // Search in multiple ways: by name, class, NIK, NIS
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, nik, nis, name, class_name')
        .or(`nik.ilike.%${searchTerm}%,nis.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,class_name.ilike.%${searchTerm}%`);

      if (childrenError) {
        console.error('CashierDashboard: Error searching children:', childrenError);
      }

      const childIds = childrenData?.map(child => child.id) || [];
      console.log('CashierDashboard: Found children IDs:', childIds);

      // Build the search query
      let query = supabase
        .from('orders')
        .select(`
          id,
          child_name,
          child_class,
          total_amount,
          payment_status,
          delivery_date,
          created_at,
          child_id,
          children (
            nik,
            nis
          ),
          order_items (
            id,
            quantity,
            price,
            menu_items (
              name,
              image_url
            )
          )
        `)
        .eq('payment_status', 'pending');

      // Add search conditions
      if (childIds.length > 0) {
        query = query.or(`child_name.ilike.%${searchTerm}%,child_class.ilike.%${searchTerm}%,child_id.in.(${childIds.join(',')})`);
      } else {
        query = query.or(`child_name.ilike.%${searchTerm}%,child_class.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('CashierDashboard: Error searching orders:', error);
        throw error;
      }

      console.log('CashierDashboard: Search results:', data?.length || 0);
      setOrders(data || []);

      if (!data || data.length === 0) {
        toast({
          title: "Tidak Ditemukan",
          description: "Tidak ada pesanan yang sesuai dengan pencarian",
        });
      }
    } catch (error) {
      console.error('CashierDashboard: Error in searchOrders:', error);
      toast({
        title: "Error",
        description: "Gagal mencari data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setSelectedOrder(null);
    fetchPendingOrders();
  };

  const toggleOrderDetails = (orderId: string) => {
    console.log('CashierDashboard: Toggling details for order:', orderId);
    console.log('CashierDashboard: Current expanded order:', expandedOrderId);
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDateSafe = (dateString: string | null | undefined) => {
    if (!dateString) return 'Tidak diatur';
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error('CashierDashboard: Error formatting date:', error);
      return 'Format tanggal tidak valid';
    }
  };

  if (selectedOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedOrder(null)}
            className="mb-4"
          >
            ← Kembali ke Daftar Pesanan
          </Button>
        </div>
        <CashPayment 
          order={selectedOrder} 
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Pencarian Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Cari berdasarkan nama siswa, kelas, NIK, atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchOrders()}
              className="flex-1"
            />
            <Button onClick={searchOrders} disabled={loading}>
              {loading ? 'Mencari...' : 'Cari'}
            </Button>
            <Button variant="outline" onClick={fetchPendingOrders}>
              Reset
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>💡 Tips pencarian:</p>
            <ul className="list-disc ml-6 text-xs">
              <li>Masukkan nama siswa (contoh: "Ahmad")</li>
              <li>Masukkan kelas (contoh: "1A")</li>
              <li>Masukkan NIK 16 digit</li>
              <li>Masukkan NIS</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pesanan Pending Pembayaran</CardTitle>
          <p className="text-sm text-gray-600">
            Total: {orders.length} pesanan
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Memuat data pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada pesanan pending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold">{order.child_name}</span>
                          <Badge variant="outline">{order.child_class}</Badge>
                        </div>

                        {order.children && (order.children.nik || order.children.nis) && (
                          <div className="text-sm text-gray-600 mb-2">
                            {order.children.nik && (
                              <span className="mr-4">NIK: {order.children.nik}</span>
                            )}
                            {order.children.nis && (
                              <span>NIS: {order.children.nis}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Katering: {formatDateSafe(order.delivery_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Receipt className="h-4 w-4 mr-1" />
                            <span>{order.order_items?.length || 0} item</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleOrderDetails(order.id)}
                            >
                              {expandedOrderId === order.id ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  Sembunyikan Detail
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Lihat Detail
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              {formatPrice(order.total_amount)}
                            </p>
                            <Button
                              onClick={() => setSelectedOrder(order)}
                              className="mt-2"
                              size="sm"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Bayar Tunai
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {expandedOrderId === order.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium mb-3 text-lg">Detail Pesanan:</h4>
                        {order.order_items && order.order_items.length > 0 ? (
                          <div className="space-y-3">
                            {order.order_items.map((item, index) => (
                              <div key={item.id || index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                                <div className="flex-1">
                                  <span className="font-medium text-base">
                                    {item.menu_items?.name || 'Item Tidak Diketahui'}
                                  </span>
                                  <div className="text-sm text-gray-600 mt-1">
                                    <span>Harga satuan: {formatPrice(item.price)}</span>
                                    <span className="ml-4">Jumlah: {item.quantity}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium text-lg">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p>Tidak ada detail item ditemukan</p>
                          </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <div className="flex justify-between items-center font-bold text-xl">
                            <span>Total Pembayaran:</span>
                            <span className="text-orange-600">
                              {formatPrice(order.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierDashboard;
