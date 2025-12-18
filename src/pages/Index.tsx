import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import ResourceManager from '@/components/ResourceManager';
import SettingsPage from '@/components/SettingsPage';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import CustomersPage from './CustomersPage';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';



const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'logist' | 'buyer' | 'manager' | 'director'>('admin');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState({ active_orders: 0, in_transit: 0, total_drivers: 0, total_vehicles: 0 });
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
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
      const [ordersRes, driversRes, vehiclesRes, statsRes, clientsRes, logsRes, customersRes] = await Promise.all([
        fetch(`${API_URL}?resource=orders`),
        fetch(`${API_URL}?resource=drivers`),
        fetch(`${API_URL}?resource=vehicles`),
        fetch(`${API_URL}?resource=stats`),
        fetch(`${API_URL}?resource=clients`),
        fetch(`${API_URL}?resource=activity_log`),
        fetch(`${API_URL}?resource=customers`)
      ]);

      const ordersData = await ordersRes.json();
      const driversData = await driversRes.json();
      const clientsData = await clientsRes.json();
      const vehiclesData = await vehiclesRes.json();
      const statsData = await statsRes.json();
      const logsData = await logsRes.json();
      const customersData = await customersRes.json();

      setOrders(ordersData.orders || []);
      setDrivers(driversData.drivers || []);
      setVehicles(vehiclesData.vehicles || []);
      setStats(statsData);
      setClients(clientsData.clients || []);
      setActivityLogs(logsData.logs || []);
      setCustomers(customersData.customers || []);
      
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
              variant={activeSection === 'clients' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('clients'); setMobileMenuOpen(false); }}
            >
              <Icon name="Briefcase" size={20} className="mr-3" />
              Перевозчик
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
              variant={activeSection === 'customers' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => { setActiveSection('customers'); setMobileMenuOpen(false); }}
            >
              <Icon name="Building2" size={20} className="mr-3" />
              Заказчики
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
                  {activeSection === 'customers' && 'Заказчики'}
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
                orders={orders} 
                onOrderClick={(order) => {}}
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
                <Card className="text-center py-16">
                  <CardContent>
                    <Icon name="ClipboardList" size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Раздел в разработке</h3>
                    <p className="text-gray-600">Панель заказов скоро будет готова</p>
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

            {activeSection === 'customers' && (
              <CustomersPage customers={customers} onRefresh={loadData} />
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


    </div>
  );
};

export default Index;