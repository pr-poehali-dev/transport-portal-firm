import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import DateInput from '@/components/ui/date-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import OrderForm from '@/components/OrderForm';
import ResourceManager from '@/components/ResourceManager';
import SettingsPage from '@/components/SettingsPage';
import LoginPage from '@/components/LoginPage';

import CustomersPage from './CustomersPage';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';



const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'logist' | 'buyer' | 'manager' | 'director'>('admin');
  const [activeSection, setActiveSection] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState({ active_orders: 0, in_transit: 0, total_drivers: 0, total_vehicles: 0 });
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [driversSearchQuery, setDriversSearchQuery] = useState('');
  const [vehiclesSearchQuery, setVehiclesSearchQuery] = useState('');
  const [clientsSearchQuery, setClientsSearchQuery] = useState('');
  const [customersSearchQuery, setCustomersSearchQuery] = useState('');
  const [logsSearchQuery, setLogsSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [selectedLogOrder, setSelectedLogOrder] = useState<number | null>(null);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [showFitoDialog, setShowFitoDialog] = useState(false);
  const [selectedFitoOrder, setSelectedFitoOrder] = useState<any>(null);
  const [fitoData, setFitoData] = useState({
    fito_order_date: '',
    fito_ready_date: '',
    fito_received_date: ''
  });
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const updateSession = async () => {
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_session',
            user_id: userId,
            section_name: activeSection,
            full_name: userName,
            role: userRole,
            is_editing: showOrderForm || editOrder !== null,
            editing_item_id: editOrder?.id || null
          })
        });

        const sessionsRes = await fetch(`${API_URL}?resource=active_sessions&section=${activeSection}`);
        const sessionsData = await sessionsRes.json();
        setActiveSessions(sessionsData.sessions || []);
      } catch (error) {
        console.error('Session update failed:', error);
      }
    };

    updateSession();
    const interval = setInterval(updateSession, 30000);

    return () => {
      clearInterval(interval);
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_session',
          user_id: userId,
          section_name: activeSection
        })
      }).catch(() => {});
    };
  }, [isLoggedIn, userId, activeSection, showOrderForm, editOrder, userName, userRole]);

  const handleLogin = (role: string, uid: number, fullName?: string) => {
    setUserRole(role as any);
    setUserId(uid);
    setUserName(fullName || '');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setUserRole('admin');
    setActiveSection('orders');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем данные с таймаутом для каждого запроса
      const timeout = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      );

      const fetchWithTimeout = (url: string) => 
        Promise.race([
          fetch(url),
          timeout(10000)
        ]);

      const results = await Promise.allSettled([
        fetchWithTimeout(`${API_URL}?resource=orders`),
        fetchWithTimeout(`${API_URL}?resource=drivers`),
        fetchWithTimeout(`${API_URL}?resource=vehicles`),
        fetchWithTimeout(`${API_URL}?resource=stats`),
        fetchWithTimeout(`${API_URL}?resource=clients`),
        fetchWithTimeout(`${API_URL}?resource=activity_log`),
        fetchWithTimeout(`${API_URL}?resource=customers`)
      ]);

      // Обрабатываем результаты
      if (results[0].status === 'fulfilled') {
        const ordersData = await (results[0].value as Response).json();
        setOrders(ordersData.orders || []);
      }
      if (results[1].status === 'fulfilled') {
        const driversData = await (results[1].value as Response).json();
        setDrivers(driversData.drivers || []);
      }
      if (results[2].status === 'fulfilled') {
        const vehiclesData = await (results[2].value as Response).json();
        setVehicles(vehiclesData.vehicles || []);
      }
      if (results[3].status === 'fulfilled') {
        const statsData = await (results[3].value as Response).json();
        setStats(statsData);
      }
      if (results[4].status === 'fulfilled') {
        const clientsData = await (results[4].value as Response).json();
        setClients(clientsData.clients || []);
      }
      if (results[5].status === 'fulfilled') {
        const logsData = await (results[5].value as Response).json();
        setActivityLogs(logsData.logs || []);
      }
      if (results[6].status === 'fulfilled') {
        const customersData = await (results[6].value as Response).json();
        setCustomers(customersData.customers || []);
      }
      
      // Загружаем права доступа
      try {
        const rolesRes = await fetchWithTimeout(`${API_URL}?resource=roles`);
        const rolesData = await (rolesRes as Response).json();
        const currentRole = rolesData.roles?.find((r: any) => r.role_name === userRole);
        if (currentRole) {
          setUserPermissions(currentRole.permissions || {});
        }
      } catch (err) {
        console.error('Error loading roles:', err);
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getFitoStatus = (order: any) => {
    if (order.fito_received_date) return 'green';
    if (order.fito_ready_date) return 'yellow';
    if (order.fito_order_date) return 'red';
    return 'gray';
  };

  const getFitoTooltip = (order: any) => {
    const parts = [];
    if (order.fito_order_date) parts.push(`Заказано: ${new Date(order.fito_order_date).toLocaleDateString('ru-RU')}`);
    if (order.fito_ready_date) parts.push(`Готово: ${new Date(order.fito_ready_date).toLocaleDateString('ru-RU')}`);
    if (order.fito_received_date) parts.push(`Получено: ${new Date(order.fito_received_date).toLocaleDateString('ru-RU')}`);
    return parts.length > 0 ? parts.join('\n') : 'Нет данных о Фито';
  };

  const convertDateToDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return dateStr;
  };

  const convertDateToISO = (dateStr: string) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return dateStr;
  };

  const handleOpenFitoDialog = (order: any) => {
    setSelectedFitoOrder(order);
    setFitoData({
      fito_order_date: convertDateToDisplay(order.fito_order_date || ''),
      fito_ready_date: convertDateToDisplay(order.fito_ready_date || ''),
      fito_received_date: convertDateToDisplay(order.fito_received_date || '')
    });
    setShowFitoDialog(true);
  };

  const handleSaveFitoDates = async () => {
    if (!selectedFitoOrder) return;

    const isoFitoOrderDate = convertDateToISO(fitoData.fito_order_date);
    const isoFitoReadyDate = convertDateToISO(fitoData.fito_ready_date);
    const isoFitoReceivedDate = convertDateToISO(fitoData.fito_received_date);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_fito_dates',
          order_id: selectedFitoOrder.id,
          data: {
            fito_order_date: isoFitoOrderDate,
            fito_ready_date: isoFitoReadyDate,
            fito_received_date: isoFitoReceivedDate
          }
        })
      });

      if (!response.ok) throw new Error('Failed to update fito dates');
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedFitoOrder.id 
            ? {
                ...order,
                fito_order_date: isoFitoOrderDate,
                fito_ready_date: isoFitoReadyDate,
                fito_received_date: isoFitoReceivedDate
              }
            : order
        )
      );
      
      toast.success('Даты Фито обновлены');
      setShowFitoDialog(false);
    } catch (error) {
      toast.error('Ошибка при сохранении дат');
      console.error(error);
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
                <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <span>Роль: <span className="font-semibold capitalize">{userRole}</span></span>
                  {userRole === 'admin' && activeSessions.filter(s => s.user_id !== userId).length > 0 && (
                    <span className="flex items-center gap-1 ml-2">
                      <Icon name="Users" size={14} className="text-green-500" />
                      <span className="text-green-600 font-medium">{activeSessions.filter(s => s.user_id !== userId).length}</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                {activeSessions.filter(s => s.user_id !== userId).length > 0 && userRole === 'admin' && (
                  <div className="hidden md:flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Icon name="Users" size={14} />
                    <span>{activeSessions.filter(s => s.user_id !== userId).length} {activeSessions.filter(s => s.user_id !== userId).length === 1 ? 'пользователь' : 'пользователей'} в разделе</span>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={loadData}>
                  <Icon name="RefreshCw" size={18} className="mr-0 md:mr-2" />
                  <span className="hidden md:inline">Обновить</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8">


            {activeSection === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Журнал действий</CardTitle>
                    <CardDescription className="text-sm">История операций по заказам</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input 
                      placeholder="Поиск по номеру заказа..." 
                      className="w-full mb-4"
                      value={logsSearchQuery}
                      onChange={(e) => setLogsSearchQuery(e.target.value)}
                    />
                    <div className="space-y-2">
                      {(() => {
                        const filteredLogs = activityLogs.filter(log => {
                          if (logsSearchQuery === '') return true;
                          const query = logsSearchQuery.toLowerCase();
                          const orderNumber = (log.order_number || '').toLowerCase();
                          return orderNumber.includes(query);
                        });
                        
                        const groupedLogs = filteredLogs.reduce((acc, log) => {
                          if (!acc[log.order_id]) {
                            acc[log.order_id] = {
                              order_number: log.order_number,
                              order_id: log.order_id,
                              logs: []
                            };
                          }
                          acc[log.order_id].logs.push(log);
                          return acc;
                        }, {} as Record<number, { order_number: string, order_id: number, logs: any[] }>);

                        return Object.values(groupedLogs).map(({ order_number, order_id, logs }) => (
                          <div key={order_id} className="border rounded-lg overflow-hidden">
                            <div 
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => setSelectedLogOrder(selectedLogOrder === order_id ? null : order_id)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-sm">{order_number}</span>
                                <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
                              </div>
                              <Icon 
                                name={selectedLogOrder === order_id ? "ChevronUp" : "ChevronDown"} 
                                size={18} 
                                className="text-gray-400"
                              />
                            </div>
                            
                            {selectedLogOrder === order_id && (
                              <div className="border-t bg-gray-50">
                                <div className="divide-y">
                                  {logs.map(log => (
                                    <div key={log.id} className="px-3 py-2 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-gray-900">
                                            <span className="font-medium text-primary">{log.user_name || log.user_role}</span>
                                            <span className="text-gray-600"> — {log.description}</span>
                                          </p>
                                        </div>
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{log.created_at}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
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
                      <CardTitle>Заказы</CardTitle>
                      <Button onClick={() => { setEditOrder(null); setShowOrderForm(true); }}>
                        <Icon name="Plus" size={18} className="mr-2" />
                        Новый заказ
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input 
                      placeholder="Поиск заказа..." 
                      className="w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>№ заказа</TableHead>
                          <TableHead>Дата заказа</TableHead>
                          <TableHead>Инвойс / Трак</TableHead>
                          <TableHead>Гос номер</TableHead>
                          <TableHead>Время в пути</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Фито</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders
                          .filter(order => {
                            if (searchQuery === '') return true;
                            
                            const query = searchQuery.replace(/[\s\-]/g, '').toLowerCase();
                            
                            const orderNumber = (order.order_number || '').toLowerCase();
                            const trackNumber = (order.track_number || '').replace(/[\s\-]/g, '').toLowerCase();
                            const invoice = (order.invoice || '').replace(/[\s\-]/g, '').toLowerCase();
                            const licensePlate = (order.license_plate || '').replace(/[\s\-]/g, '').toLowerCase();
                            const trailerPlate = (order.trailer_plate || '').replace(/[\s\-]/g, '').toLowerCase();
                            const driverPhone = (order.driver_phone || '').replace(/[\s\-]/g, '').toLowerCase();
                            const driverAdditionalPhone = (order.driver_additional_phone || '').replace(/[\s\-]/g, '').toLowerCase();
                            
                            return orderNumber.includes(query) ||
                              trackNumber.includes(query) ||
                              invoice.includes(query) ||
                              licensePlate.includes(query) ||
                              trailerPlate.includes(query) ||
                              driverPhone.includes(query) ||
                              driverAdditionalPhone.includes(query);
                          })
                          .map((order) => {
                            const getDaysInTransit = () => {
                              if (!order.first_stage_departure) return '—';
                              const departureDate = new Date(order.first_stage_departure);
                              const today = new Date();
                              const diffTime = Math.abs(today.getTime() - departureDate.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return `${diffDays} дн.`;
                            };

                            const getOrderStatus = () => {
                              if (!order.stages_count || order.stages_count === 0) return 'Создан';
                              if (!order.completed_stages || order.completed_stages === 0) return 'Маршрут 1';
                              if (order.completed_stages >= order.stages_count) return 'Завершён';
                              return `Маршрут ${order.completed_stages + 1}`;
                            };

                            const getVehicleNumber = () => {
                              if (!order.license_plate) return '—';
                              if (order.trailer_plate) return `${order.license_plate} / ${order.trailer_plate}`;
                              return order.license_plate;
                            };

                            const getInvoiceTrack = () => {
                              const invoice = order.invoice || '—';
                              const track = order.track_number || '—';
                              return `${invoice} / ${track}`;
                            };

                            const otherUserEditing = activeSessions.find(
                              s => s.user_id !== userId && s.is_editing && s.editing_item_id === order.id
                            );

                            return (
                              <TableRow key={order.id} className={`hover:bg-gray-50 ${otherUserEditing ? 'bg-yellow-50' : ''}`}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {otherUserEditing && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Icon name="Lock" size={14} className="text-yellow-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {otherUserEditing.full_name} редактирует
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    {order.order_number}
                                  </div>
                                </TableCell>
                                <TableCell>{order.order_date ? new Date(order.order_date).toLocaleDateString('ru-RU') : '—'}</TableCell>
                                <TableCell>{getInvoiceTrack()}</TableCell>
                                <TableCell>{getVehicleNumber()}</TableCell>
                                <TableCell>{getDaysInTransit()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getOrderStatus()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="p-0 h-auto hover:bg-transparent"
                                          onClick={() => handleOpenFitoDialog(order)}
                                        >
                                          <Icon 
                                            name="Clock" 
                                            className={`cursor-pointer ${
                                              getFitoStatus(order) === 'green' ? 'text-green-500' :
                                              getFitoStatus(order) === 'yellow' ? 'text-yellow-500' :
                                              getFitoStatus(order) === 'red' ? 'text-red-500' :
                                              'text-gray-400'
                                            }`}
                                            size={20}
                                          />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="whitespace-pre-line">
                                        {getFitoTooltip(order)}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    {(() => {
                                      const otherUserEditing = activeSessions.find(
                                        s => s.user_id !== userId && s.is_editing && s.editing_item_id === order.id
                                      );
                                      
                                      if (otherUserEditing) {
                                        return (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button variant="ghost" size="sm" disabled>
                                                  <Icon name="Lock" size={16} className="text-gray-400" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                {otherUserEditing.full_name} редактирует
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        );
                                      }
                                      
                                      return (
                                        <Button variant="ghost" size="sm" onClick={async () => { 
                                          const stagesRes = await fetch(`${API_URL}?resource=order_stages&order_id=${order.id}`);
                                          const stagesData = await stagesRes.json();
                                          setEditOrder({...order, stages: stagesData.stages || []}); 
                                          setShowOrderForm(true); 
                                        }}>
                                          <Icon name="Pencil" size={16} />
                                        </Button>
                                      );
                                    })()}
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
                            );
                          })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'drivers' && (
              <div className="space-y-6 animate-fade-in">
                <ResourceManager 
                  type="drivers" 
                  data={drivers} 
                  onRefresh={loadData} 
                  searchQuery={driversSearchQuery}
                  onSearchChange={setDriversSearchQuery}
                />
              </div>
            )}

            {activeSection === 'vehicles' && (
              <div className="space-y-6 animate-fade-in">
                <ResourceManager 
                  type="vehicles" 
                  data={vehicles} 
                  drivers={drivers} 
                  clients={clients} 
                  onRefresh={loadData}
                  searchQuery={vehiclesSearchQuery}
                  onSearchChange={setVehiclesSearchQuery}
                />
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
                <ResourceManager 
                  type="clients" 
                  data={clients} 
                  clients={clients} 
                  onRefresh={loadData}
                  searchQuery={clientsSearchQuery}
                  onSearchChange={setClientsSearchQuery}
                />
              </div>
            )}

            {activeSection === 'customers' && (
              <CustomersPage 
                customers={customers} 
                onRefresh={loadData}
                searchQuery={customersSearchQuery}
                onSearchChange={setCustomersSearchQuery}
              />
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

      <OrderForm
        open={showOrderForm}
        onClose={() => { setShowOrderForm(false); setEditOrder(null); }}
        onSuccess={loadData}
        editOrder={editOrder}
        clients={clients}
        customers={customers}
        drivers={drivers}
        vehicles={vehicles}
        userRole={userRole === 'admin' ? 'Администратор' : userRole === 'logist' ? 'Логист' : userRole === 'buyer' ? 'Байер' : userRole === 'manager' ? 'Менеджер' : 'Руководитель'}
        userName={userName}
      />

      <Dialog open={showFitoDialog} onOpenChange={setShowFitoDialog}>
        <DialogContent className="max-w-md" aria-describedby="fito-dialog-description">
          <DialogHeader>
            <DialogTitle>Даты Фито - {selectedFitoOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <p id="fito-dialog-description" className="sr-only">
            Введите даты для управления фитосанитарными документами заказа
          </p>
          <div className="space-y-4">
            <div>
              <Label>Дата заказа Фито</Label>
              <DateInput
                value={fitoData.fito_order_date}
                onChange={(val) => setFitoData({ ...fitoData, fito_order_date: val })}
                placeholder="дд-мм-гггг"
              />
            </div>
            <div>
              <Label>Дата готовности Фито</Label>
              <DateInput
                value={fitoData.fito_ready_date}
                onChange={(val) => setFitoData({ ...fitoData, fito_ready_date: val })}
                placeholder="дд-мм-гггг"
              />
            </div>
            <div>
              <Label>Дата получения Фито</Label>
              <DateInput
                value={fitoData.fito_received_date}
                onChange={(val) => setFitoData({ ...fitoData, fito_received_date: val })}
                placeholder="дд-мм-гггг"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowFitoDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveFitoDates} className="flex-1">
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;