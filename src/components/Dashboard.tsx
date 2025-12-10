import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DashboardProps {
  orders: any[];
  onOrderClick?: (order: any) => void;
}

const statusMap: Record<string, { label: string; color: string; icon: string }> = {
  'pending': { label: 'Ожидает отгрузки', color: 'bg-gray-500', icon: 'Clock' },
  'loading': { label: 'Загрузка', color: 'bg-yellow-500', icon: 'PackageOpen' },
  'in_transit': { label: 'В пути', color: 'bg-blue-500', icon: 'Truck' },
  'delivered': { label: 'Доставлен', color: 'bg-green-500', icon: 'CheckCircle2' }
};

export default function Dashboard({ orders, onOrderClick }: DashboardProps) {
  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const getStats = () => {
    return {
      pending: getOrdersByStatus('pending').length,
      loading: getOrdersByStatus('loading').length,
      in_transit: getOrdersByStatus('in_transit').length,
      delivered: getOrdersByStatus('delivered').length,
      total: orders.length
    };
  };

  const stats = getStats();

  const renderOrderCard = (order: any) => (
    <Card 
      key={order.id} 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: statusMap[order.status]?.color.replace('bg-', '#') }}
      onClick={() => onOrderClick?.(order)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{order.order_number}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {order.order_date}
            </CardDescription>
          </div>
          <Badge className={`${statusMap[order.status]?.color} text-white`}>
            {statusMap[order.status]?.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Icon name="MapPin" size={14} />
          <span className="truncate">{order.route_from} → {order.route_to}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Icon name="Building2" size={14} />
          <span className="truncate">{order.client_name}</span>
        </div>
        {order.driver_name && (
          <div className="flex items-center gap-2 text-gray-600">
            <Icon name="User" size={14} />
            <span className="truncate">{order.driver_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ожидает отгрузки
              </CardTitle>
              <div className="p-2 bg-gray-500 rounded-lg">
                <Icon name="Clock" size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700">
                Загрузка
              </CardTitle>
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Icon name="PackageOpen" size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.loading}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">
                В пути
              </CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Icon name="Truck" size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{stats.in_transit}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">
                Доставлен
              </CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <Icon name="CheckCircle2" size={20} className="text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="Clock" size={20} className="text-gray-500" />
            Ожидает отгрузки ({stats.pending})
          </h3>
          <div className="space-y-3">
            {getOrdersByStatus('pending').length > 0 ? (
              getOrdersByStatus('pending').map(renderOrderCard)
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  Нет заказов
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="PackageOpen" size={20} className="text-yellow-500" />
            Загрузка ({stats.loading})
          </h3>
          <div className="space-y-3">
            {getOrdersByStatus('loading').length > 0 ? (
              getOrdersByStatus('loading').map(renderOrderCard)
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  Нет заказов
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="Truck" size={20} className="text-blue-500" />
            В пути ({stats.in_transit})
          </h3>
          <div className="space-y-3">
            {getOrdersByStatus('in_transit').length > 0 ? (
              getOrdersByStatus('in_transit').map(renderOrderCard)
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  Нет заказов
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon name="CheckCircle2" size={20} className="text-green-500" />
            Доставлен ({stats.delivered})
          </h3>
          <div className="space-y-3">
            {getOrdersByStatus('delivered').length > 0 ? (
              getOrdersByStatus('delivered').map(renderOrderCard)
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  Нет заказов
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
