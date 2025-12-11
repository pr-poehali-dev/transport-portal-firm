import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import OrderForm from '@/components/OrderForm';
import MultiStageOrderForm from '@/components/MultiStageOrderForm';
import ResourceManager from '@/components/ResourceManager';
import SettingsPage from '@/components/SettingsPage';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';
const DOCS_URL = 'https://functions.poehali.dev/7a5d7ce6-72d6-4fb9-8c89-2adabbad28c2';

const statusMap: Record<string, { label: string; color: string }> = {
  'pending': { label: 'Ожидание', color: 'bg-gray-500' },
  'loading': { label: 'Загрузка', color: 'bg-yellow-500' },
  'in_transit': { label: 'В пути', color: 'bg-blue-500' },
  'delivered': { label: 'Доставлен', color: 'bg-green-500' }
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'logist' | 'buyer' | 'manager' | 'director'>('admin');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState({ active_orders: 0, in_transit: 0, total_drivers: 0, total_vehicles: 0 });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStages, setOrderStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showMultiStageForm, setShowMultiStageForm] = useState(false);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [selectedLogOrder, setSelectedLogOrder] = useState<number | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>({});

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleLogin = (role: string, uid: number) => {
    setUserRole(role as any);
    setUserId(uid);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setUserRole('admin');
    setActiveSection('dashboard');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, driversRes, vehiclesRes, statsRes, clientsRes, logsRes] = await Promise.all([
        fetch(`${API_URL}?resource=orders`),
        fetch(`${API_URL}?resource=drivers`),
        fetch(`${API_URL}?resource=vehicles`),
        fetch(`${API_URL}?resource=stats`),
        fetch(`${API_URL}?resource=clients`),
        fetch(`${API_URL}?resource=activity_log`)
      ]);

      const ordersData = await ordersRes.json();
      const driversData = await driversRes.json();
      const clientsData = await clientsRes.json();
      const vehiclesData = await vehiclesRes.json();
      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      setOrders(ordersData.orders || []);
      setDrivers(driversData.drivers || []);
      setVehicles(vehiclesData.vehicles || []);
      setStats(statsData);
      setClients(clientsData.clients || []);
      setActivityLogs(logsData.logs || []);
      
      const rolesRes = await fetch(`${API_URL}?resource=roles`);
      const rolesData = await rolesRes.json();
      const currentRole = rolesData.roles?.find((r: any) => r.role_name === userRole);
      if (currentRole) {
        setUserPermissions(currentRole.permissions || {});
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStages = async (orderId: number) => {
    try {
      const res = await fetch(`${API_URL}?resource=order_stages&order_id=${orderId}`);
      const data = await res.json();
      setOrderStages(data.stages || []);
    } catch (error) {
      toast.error('Ошибка загрузки этапов');
    }
  };

  const updateStage = async (stageId: number, isCompleted: boolean) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_stage',
          stage_id: stageId,
          is_completed: isCompleted,
          completed_by: userRole === 'admin' ? 'Администратор' : userRole === 'logist' ? 'Логист' : userRole === 'buyer' ? 'Байер' : userRole === 'manager' ? 'Менеджер' : 'Руководитель'
        })
      });
      
      toast.success('Этап обновлен');
      if (selectedOrder) {
        loadOrderStages(selectedOrder.id);
      }
      loadData();
    } catch (error) {
      toast.error('Ошибка обновления этапа');
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    loadOrderStages(order.id);
  };

  const generateDocument = (orderId: number, docType: 'waybill' | 'power_of_attorney') => {
    const url = `${DOCS_URL}?order_id=${orderId}&type=${docType}`;
    window.open(url, '_blank');
  };

  const statsDisplay = [
    { title: 'Активные заказы', value: stats.active_orders.toString(), icon: 'TruckIcon', color: 'text-blue-500' },
    { title: 'В пути', value: stats.in_transit.toString(), icon: 'Navigation', color: 'text-green-500' },
    { title: 'Водители', value: stats.total_drivers.toString(), icon: 'Users', color: 'text-purple-500' },
    { title: 'Автомобили', value: stats.total_vehicles.toString(), icon: 'Truck', color: 'text-orange-500' }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen flex-col md:flex-row">
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center justify-between bg-sidebar p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Truck" className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-bold text-sidebar-foreground">TransHub</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-sidebar-foreground"
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={24} />
          </Button>
        </div>

        <aside className={`w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl fixed md:relative z-50 h-full transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="hidden md:block p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Truck" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">TransHub</h1>
                <p className="text-xs text-sidebar-foreground/70">Управление грузоперевозками</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Button
              variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('dashboard'); setMobileMenuOpen(false); }}
            >
              <Icon name="LayoutDashboard" size={20} className="mr-3" />
              Панель
            </Button>
            <Button
              variant={activeSection === 'orders' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('orders'); setMobileMenuOpen(false); }}
            >
              <Icon name="ClipboardList" size={20} className="mr-3" />
              Заказы
            </Button>
            <Button
              variant={activeSection === 'drivers' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('drivers'); setMobileMenuOpen(false); }}
            >
              <Icon name="Users" size={20} className="mr-3" />
              Водители
            </Button>
            <Button
              variant={activeSection === 'vehicles' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('vehicles'); setMobileMenuOpen(false); }}
            >
              <Icon name="Truck" size={20} className="mr-3" />
              Автомобили
            </Button>
            <Button
              variant={activeSection === 'clients' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('clients'); setMobileMenuOpen(false); }}
            >
              <Icon name="Briefcase" size={20} className="mr-3" />
              Перевозчик
            </Button>
            <Button
              variant={activeSection === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('overview'); setMobileMenuOpen(false); }}
            >
              <Icon name="Activity" size={20} className="mr-3" />
              Обзор
            </Button>
            {userPermissions?.settings?.view && (
              <Button
                variant={activeSection === 'settings' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => { setActiveSection('settings'); setMobileMenuOpen(false); }}
              >
                <Icon name="Settings" size={20} className="mr-3" />
                Настройки
              </Button>
            )}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto w-full">
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {activeSection === 'overview' && 'Журнал действий'}
                  {activeSection === 'orders' && 'Управление заказами'}
                  {activeSection === 'vehicles' && 'Автопарк'}
                  {activeSection === 'drivers' && 'База водителей'}
                  {activeSection === 'clients' && 'Перевозчик'}
                  {activeSection === 'settings' && 'Настройки'}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Роль: <span className="font-semibold capitalize">{userRole}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <Button variant="outline" size="sm" onClick={loadData}>
                  <Icon name="RefreshCw" size={18} className="mr-0 md:mr-2" />
                  <span className="hidden md:inline">Обновить</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8">
            {activeSection === 'dashboard' && (
              <Dashboard 
                orders={filteredOrders} 
                onOrderClick={(order) => {
                  setSelectedOrder(order);
                  loadOrderStages(order.id);
                }}
              />
            )}

            {activeSection === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>Журнал действий</CardTitle>
                    <CardDescription>История всех операций по заказам</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="border-l-4 border-primary pl-4 py-2">
                          <div 
                            className="flex items-start justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            onClick={() => setSelectedLogOrder(selectedLogOrder === log.order_id ? null : log.order_id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <Badge variant="outline" className="text-xs">{log.order_number}</Badge>
                                <span className="text-xs text-gray-500">{log.created_at}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{log.description}</p>
                            </div>
                            <Icon 
                              name={selectedLogOrder === log.order_id ? "ChevronUp" : "ChevronDown"} 
                              size={20} 
                              className="text-gray-400 flex-shrink-0 ml-2"
                            />
                          </div>
                          
                          {selectedLogOrder === log.order_id && (
                            <div className="mt-3 ml-2 space-y-2 animate-fade-in">
                              {activityLogs
                                .filter(l => l.order_id === log.order_id)
                                .map(l => (
                                  <div key={l.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                                    <Icon name="Circle" size={8} className="text-primary mt-1.5" />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-700">{l.description}</p>
                                      <p className="text-xs text-gray-500 mt-1">{l.created_at}</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {activityLogs.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Icon name="Activity" size={48} className="mx-auto mb-3 text-gray-300" />
                          <p>Пока нет записей в журнале</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'orders' && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Все заказы</CardTitle>
                        <CardDescription>Управление перевозками и отчетность</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Поиск заказа..." 
                          className="w-64"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Все статусы</SelectItem>
                            <SelectItem value="pending">Ожидание</SelectItem>
                            <SelectItem value="loading">Загрузка</SelectItem>
                            <SelectItem value="in_transit">В пути</SelectItem>
                            <SelectItem value="delivered">Доставлен</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={() => { setEditOrder(null); setShowOrderForm(true); }}>
                          <Icon name="Plus" size={18} className="mr-2" />
                          Новый заказ
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>№</TableHead>
                          <TableHead>Клиент</TableHead>
                          <TableHead>Перевозчик</TableHead>
                          <TableHead>Гос номер</TableHead>
                          <TableHead>Маршрут</TableHead>
                          <TableHead>Дата заказа</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Фито</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders
                          .filter(order => {
                            const matchesSearch = searchQuery === '' || 
                              order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              order.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              order.carrier.toLowerCase().includes(searchQuery.toLowerCase());
                            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
                            return matchesSearch && matchesStatus;
                          })
                          .map((order) => (
                          <TableRow key={order.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell>{order.client_name}</TableCell>
                            <TableCell>{order.carrier}</TableCell>
                            <TableCell>{order.license_plate}</TableCell>
                            <TableCell>{order.route_from} - {order.route_to}</TableCell>
                            <TableCell>{order.order_date}</TableCell>
                            <TableCell>
                              <Badge className={`${statusMap[order.status]?.color} text-white`}>
                                {statusMap[order.status]?.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.fito_ready ? (
                                <Icon name="CheckCircle2" className="text-green-500" size={20} />
                              ) : (
                                <Icon name="Clock" className="text-yellow-500" size={20} />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => openOrderDetails(order)}>
                                  <Icon name="Eye" size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setEditOrder(order); setShowOrderForm(true); }}>
                                  <Icon name="Pencil" size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={async () => {
                                    if (confirm(`Удалить заказ ${order.order_number}?`)) {
                                      try {
                                        const res = await fetch(API_URL, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            action: 'delete_order',
                                            order_id: order.id,
                                            user_role: userRole
                                          })
                                        });
                                        const result = await res.json();
                                        if (result.success) {
                                          toast.success('Заказ удален');
                                          loadData();
                                        } else {
                                          toast.error('Ошибка удаления');
                                        }
                                      } catch (error) {
                                        toast.error('Ошибка удаления');
                                      }
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'drivers' && (
              <div className="space-y-6 animate-fade-in">
                <ResourceManager type="drivers" data={drivers} onRefresh={loadData} />
              </div>
            )}

            {activeSection === 'vehicles' && (
              <div className="space-y-6 animate-fade-in">
                <ResourceManager type="vehicles" data={vehicles} drivers={drivers} clients={clients} onRefresh={loadData} />
              </div>
            )}

            {activeSection === 'documents' && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>Генерация документов</CardTitle>
                    <CardDescription>Выберите заказ для создания документов</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>№ Заказа</TableHead>
                          <TableHead>Клиент</TableHead>
                          <TableHead>Маршрут</TableHead>
                          <TableHead>Дата</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell>{order.client_name}</TableCell>
                            <TableCell>{order.route_from} → {order.route_to}</TableCell>
                            <TableCell>{order.order_date}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => generateDocument(order.id, 'waybill')}
                                >
                                  <Icon name="FileText" size={16} className="mr-1" />
                                  Накладная
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => generateDocument(order.id, 'power_of_attorney')}
                                >
                                  <Icon name="FileCheck" size={16} className="mr-1" />
                                  Доверенность
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'clients' && (
              <div className="space-y-6 animate-fade-in">
                <ResourceManager type="clients" data={clients} clients={clients} onRefresh={loadData} />
              </div>
            )}

            {activeSection === 'settings' && userPermissions?.settings?.view && (
              <SettingsPage currentUser={userRole} />
            )}

            {(activeSection === 'routes' || activeSection === 'reports') && (
              <div className="animate-fade-in">
                <Card className="text-center py-16">
                  <CardContent>
                    <Icon name="Construction" size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Раздел в разработке</h3>
                    <p className="text-gray-600">
                      Функционал "{activeSection === 'routes' && 'Маршруты'}
                      {activeSection === 'reports' && 'Отчеты'}" будет доступен в следующей версии
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали заказа {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Поэтапный контроль выполнения заказа
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Клиент</p>
                  <p className="font-semibold">{selectedOrder.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Перевозчик</p>
                  <p className="font-semibold">{selectedOrder.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Маршрут</p>
                  <p className="font-semibold">{selectedOrder.route_from} → {selectedOrder.route_to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Автомобиль</p>
                  <p className="font-semibold">{selectedOrder.license_plate} ({selectedOrder.vehicle_model})</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Водитель</p>
                  <p className="font-semibold">{selectedOrder.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Статус</p>
                  <Badge className={`${statusMap[selectedOrder.status]?.color} text-white`}>
                    {statusMap[selectedOrder.status]?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Этапы выполнения</h3>
                <div className="space-y-3">
                  {orderStages.map((stage) => (
                    <div key={stage.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        checked={stage.is_completed}
                        onCheckedChange={(checked) => updateStage(stage.id, checked as boolean)}
                        disabled={stage.is_completed}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{stage.stage_name}</p>
                        {stage.is_completed && stage.completed_by && (
                          <p className="text-xs text-gray-500">
                            Выполнил: {stage.completed_by} • {stage.completed_at}
                          </p>
                        )}
                      </div>
                      {stage.is_completed && (
                        <Icon name="CheckCircle2" className="text-green-500" size={20} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-4">Документы</h3>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => generateDocument(selectedOrder.id, 'waybill')}
                  >
                    <Icon name="FileText" size={18} className="mr-2" />
                    Транспортная накладная
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => generateDocument(selectedOrder.id, 'power_of_attorney')}
                  >
                    <Icon name="FileCheck" size={18} className="mr-2" />
                    Доверенность
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <OrderForm
        open={showOrderForm}
        onClose={() => { setShowOrderForm(false); setEditOrder(null); }}
        onSuccess={loadData}
        editOrder={editOrder}
        clients={clients}
        drivers={drivers}
        vehicles={vehicles}
        userRole={userRole === 'admin' ? 'Администратор' : userRole === 'logist' ? 'Логист' : userRole === 'buyer' ? 'Байер' : userRole === 'manager' ? 'Менеджер' : 'Руководитель'}
      />

      <MultiStageOrderForm
        open={showMultiStageForm}
        onClose={() => setShowMultiStageForm(false)}
        onSuccess={loadData}
        clients={clients}
        drivers={drivers}
        vehicles={vehicles}
        userRole={userRole === 'admin' ? 'Администратор' : userRole === 'logist' ? 'Логист' : userRole === 'buyer' ? 'Байер' : userRole === 'manager' ? 'Менеджер' : 'Руководитель'}
      />
    </div>
  );
};

export default Index;