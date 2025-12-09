import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const mockOrders = [
  {
    id: 1,
    number: '2024-001',
    client: 'ООО "Агропром"',
    carrier: 'Транс-Логистик',
    vehicle: 'А123ВС 77',
    route: 'Москва - Санкт-Петербург',
    orderDate: '15.12.2024',
    status: 'В пути',
    statusColor: 'bg-blue-500',
    phone: '+7 (999) 123-45-67',
    invoice: 'INV-2024-001',
    overload: false,
    fitoReady: true,
    fitoReceived: '14.12.2024',
    border: 'Торфяновка'
  },
  {
    id: 2,
    number: '2024-002',
    client: 'ООО "ТрансЕвро"',
    carrier: 'Быстрая доставка',
    vehicle: 'В456ГД 99',
    route: 'Казань - Екатеринбург',
    orderDate: '14.12.2024',
    status: 'Загрузка',
    statusColor: 'bg-yellow-500',
    phone: '+7 (999) 234-56-78',
    invoice: 'INV-2024-002',
    overload: true,
    fitoReady: false,
    fitoReceived: null,
    border: 'Красная Горка'
  },
  {
    id: 3,
    number: '2024-003',
    client: 'ИП Соколов',
    carrier: 'Мега-Транс',
    vehicle: 'Е789ЖЗ 50',
    route: 'Новосибирск - Омск',
    orderDate: '13.12.2024',
    status: 'Доставлен',
    statusColor: 'bg-green-500',
    phone: '+7 (999) 345-67-89',
    invoice: 'INV-2024-003',
    overload: false,
    fitoReady: true,
    fitoReceived: '12.12.2024',
    border: 'Ташанта'
  }
];

const mockDrivers = [
  { id: 1, name: 'Иванов Иван Иванович', phone: '+7 (999) 111-11-11', license: 'В123456789', status: 'Доступен' },
  { id: 2, name: 'Петров Петр Петрович', phone: '+7 (999) 222-22-22', license: 'В987654321', status: 'В рейсе' },
  { id: 3, name: 'Сидоров Сергей Сергеевич', phone: '+7 (999) 333-33-33', license: 'В456789123', status: 'Отдых' }
];

const mockVehicles = [
  { id: 1, number: 'А123ВС 77', model: 'MAN TGX', capacity: '20т', status: 'В рейсе' },
  { id: 2, number: 'В456ГД 99', model: 'Volvo FH', capacity: '22т', status: 'На базе' },
  { id: 3, number: 'Е789ЖЗ 50', model: 'Scania R450', capacity: '24т', status: 'Техобслуживание' }
];

const Index = () => {
  const [userRole, setUserRole] = useState<'logist' | 'buyer' | 'manager'>('logist');
  const [activeSection, setActiveSection] = useState('overview');

  const stats = [
    { title: 'Активные заказы', value: '23', icon: 'TruckIcon', color: 'text-blue-500' },
    { title: 'В пути', value: '15', icon: 'Navigation', color: 'text-green-500' },
    { title: 'Водители', value: '47', icon: 'Users', color: 'text-purple-500' },
    { title: 'Автомобили', value: '32', icon: 'Truck', color: 'text-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen">
        <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl">
          <div className="p-6 border-b border-sidebar-border">
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

          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={activeSection === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('overview')}
            >
              <Icon name="LayoutDashboard" size={20} className="mr-3" />
              Обзор
            </Button>
            <Button
              variant={activeSection === 'orders' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('orders')}
            >
              <Icon name="ClipboardList" size={20} className="mr-3" />
              Заказы
            </Button>
            <Button
              variant={activeSection === 'vehicles' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('vehicles')}
            >
              <Icon name="Truck" size={20} className="mr-3" />
              Автомобили
            </Button>
            <Button
              variant={activeSection === 'drivers' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('drivers')}
            >
              <Icon name="Users" size={20} className="mr-3" />
              Водители
            </Button>
            <Button
              variant={activeSection === 'routes' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('routes')}
            >
              <Icon name="MapPin" size={20} className="mr-3" />
              Маршруты
            </Button>
            <Button
              variant={activeSection === 'clients' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('clients')}
            >
              <Icon name="Briefcase" size={20} className="mr-3" />
              Клиенты
            </Button>
            <Button
              variant={activeSection === 'documents' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('documents')}
            >
              <Icon name="FileText" size={20} className="mr-3" />
              Документы
            </Button>
            <Button
              variant={activeSection === 'reports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('reports')}
            >
              <Icon name="BarChart3" size={20} className="mr-3" />
              Отчеты
            </Button>
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Select value={userRole} onValueChange={(value: any) => setUserRole(value)}>
              <SelectTrigger className="bg-sidebar-accent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logist">Логист</SelectItem>
                <SelectItem value="buyer">Байер</SelectItem>
                <SelectItem value="manager">Менеджер</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeSection === 'overview' && 'Панель управления'}
                  {activeSection === 'orders' && 'Управление заказами'}
                  {activeSection === 'vehicles' && 'Автопарк'}
                  {activeSection === 'drivers' && 'База водителей'}
                  {activeSection === 'routes' && 'Маршруты'}
                  {activeSection === 'clients' && 'Клиенты'}
                  {activeSection === 'documents' && 'Документы'}
                  {activeSection === 'reports' && 'Отчеты'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Роль: <span className="font-semibold capitalize">{userRole}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Icon name="Bell" size={18} className="mr-2" />
                  Уведомления
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Создать заказ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Создание нового заказа</DialogTitle>
                      <DialogDescription>
                        Заполните информацию о новом заказе
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Клиент</Label>
                        <Input placeholder="Название компании" />
                      </div>
                      <div className="space-y-2">
                        <Label>Перевозчик</Label>
                        <Input placeholder="Выберите перевозчика" />
                      </div>
                      <div className="space-y-2">
                        <Label>Маршрут</Label>
                        <Input placeholder="Откуда - Куда" />
                      </div>
                      <div className="space-y-2">
                        <Label>Дата заказа</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Гос. номер</Label>
                        <Input placeholder="А123ВС 77" />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон</Label>
                        <Input placeholder="+7 (999) 123-45-67" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Отмена</Button>
                      <Button>Создать</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          <div className="p-8">
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </CardTitle>
                          <Icon name={stat.icon as any} className={stat.color} size={24} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Последние заказы</CardTitle>
                      <CardDescription>Актуальные перевозки</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockOrders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold">{order.number}</p>
                              <p className="text-sm text-gray-600">{order.route}</p>
                              <p className="text-xs text-gray-500">{order.client}</p>
                            </div>
                            <Badge className={`${order.statusColor} text-white`}>
                              {order.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Статус автопарка</CardTitle>
                      <CardDescription>Текущее состояние транспорта</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-semibold">{vehicle.number}</p>
                              <p className="text-sm text-gray-600">{vehicle.model}</p>
                              <p className="text-xs text-gray-500">Грузоподъемность: {vehicle.capacity}</p>
                            </div>
                            <Badge variant="outline">{vehicle.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                        <Input placeholder="Поиск заказа..." className="w-64" />
                        <Button variant="outline">
                          <Icon name="Filter" size={18} />
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
                        {mockOrders.map((order) => (
                          <TableRow key={order.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{order.number}</TableCell>
                            <TableCell>{order.client}</TableCell>
                            <TableCell>{order.carrier}</TableCell>
                            <TableCell>{order.vehicle}</TableCell>
                            <TableCell>{order.route}</TableCell>
                            <TableCell>{order.orderDate}</TableCell>
                            <TableCell>
                              <Badge className={`${order.statusColor} text-white`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.fitoReady ? (
                                <Icon name="CheckCircle2" className="text-green-500" size={20} />
                              ) : (
                                <Icon name="Clock" className="text-yellow-500" size={20} />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Icon name="Eye" size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="Edit" size={16} />
                              </Button>
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
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>База водителей</CardTitle>
                        <CardDescription>Информация о водительском составе</CardDescription>
                      </div>
                      <Button>
                        <Icon name="UserPlus" size={18} className="mr-2" />
                        Добавить водителя
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ФИО</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>Водит. удостоверение</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockDrivers.map((driver) => (
                          <TableRow key={driver.id}>
                            <TableCell className="font-medium">{driver.name}</TableCell>
                            <TableCell>{driver.phone}</TableCell>
                            <TableCell>{driver.license}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{driver.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Icon name="Eye" size={16} />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="Edit" size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'vehicles' && (
              <div className="space-y-6 animate-fade-in">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Автопарк компании</CardTitle>
                        <CardDescription>Управление транспортными средствами</CardDescription>
                      </div>
                      <Button>
                        <Icon name="Plus" size={18} className="mr-2" />
                        Добавить автомобиль
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockVehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="hover:shadow-lg transition-all">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{vehicle.number}</CardTitle>
                              <Badge variant="outline">{vehicle.status}</Badge>
                            </div>
                            <CardDescription>{vehicle.model}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Грузоподъемность:</span>
                                <span className="font-semibold">{vehicle.capacity}</span>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Icon name="Eye" size={14} className="mr-1" />
                                  Детали
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Icon name="Edit" size={14} className="mr-1" />
                                  Изменить
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {(activeSection === 'routes' || activeSection === 'clients' || activeSection === 'documents' || activeSection === 'reports') && (
              <div className="animate-fade-in">
                <Card className="text-center py-16">
                  <CardContent>
                    <Icon name="Construction" size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Раздел в разработке</h3>
                    <p className="text-gray-600">
                      Функционал "{activeSection === 'routes' && 'Маршруты'}
                      {activeSection === 'clients' && 'Клиенты'}
                      {activeSection === 'documents' && 'Документы'}
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
