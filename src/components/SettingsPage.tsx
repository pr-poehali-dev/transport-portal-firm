import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface SettingsPageProps {
  currentUser: string;
}

export default function SettingsPage({ currentUser }: SettingsPageProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'buyer',
    login: '',
    password: '',
    is_active: true
  });

  const [telegramSettings, setTelegramSettings] = useState({
    bot_token: '',
    chat_id: '',
    is_active: false,
    bot_username: null as string | null
  });
  const [testingBot, setTestingBot] = useState(false);

  useEffect(() => {
    loadData();
    loadTelegramSettings();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API_URL}?resource=users`),
        fetch(`${API_URL}?resource=roles`)
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error(error);
    }
  };

  const loadTelegramSettings = async () => {
    try {
      const response = await fetch(`${API_URL}?resource=telegram_settings`);
      const data = await response.json();
      
      if (data.settings) {
        setTelegramSettings(data.settings);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек Telegram:', error);
    }
  };

  const handleSaveTelegramSettings = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_telegram_settings',
          data: telegramSettings
        })
      });

      if (!response.ok) throw new Error('Failed to save settings');
      
      toast.success('Настройки Telegram сохранены');
      loadTelegramSettings();
    } catch (error) {
      toast.error('Ошибка при сохранении настроек');
      console.error(error);
    }
  };

  const handleTestTelegramBot = async () => {
    if (!telegramSettings.bot_token || !telegramSettings.chat_id) {
      toast.error('Укажите токен бота и Chat ID');
      return;
    }

    setTestingBot(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_telegram_bot',
          data: {
            bot_token: telegramSettings.bot_token,
            chat_id: telegramSettings.chat_id
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Тестовое сообщение отправлено в Telegram!');
      } else {
        toast.error(`Ошибка: ${result.error || 'Не удалось отправить сообщение'}`);
      }
    } catch (error) {
      toast.error('Ошибка подключения к боту');
      console.error(error);
    } finally {
      setTestingBot(false);
    }
  };

  const handleRegenerateInviteCode = async (userId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'regenerate_invite_code',
          user_id: userId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Новый код сгенерирован! Telegram отключен.');
        loadData();
        if (editUser && editUser.id === userId) {
          setEditUser({ ...editUser, invite_code: result.invite_code, telegram_connected: false });
        }
      } else {
        toast.error('Ошибка генерации кода');
      }
    } catch (error) {
      toast.error('Ошибка при генерации кода');
      console.error(error);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editUser) {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'user',
            id: editUser.id,
            data: userFormData
          })
        });

        if (!response.ok) throw new Error('Failed to update user');
        toast.success('Пользователь обновлен');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_user',
            data: userFormData
          })
        });

        if (!response.ok) throw new Error('Failed to create user');
        toast.success('Пользователь создан');
      }

      setShowUserForm(false);
      setEditUser(null);
      loadData();
    } catch (error) {
      toast.error('Ошибка при сохранении');
      console.error(error);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_role_permissions',
          role_name: selectedRole.role_name,
          data: { permissions: selectedRole.permissions }
        })
      });

      if (!response.ok) throw new Error('Failed to update permissions');
      toast.success('Права доступа обновлены');
      setShowPermissionsModal(false);
      loadData();
    } catch (error) {
      toast.error('Ошибка при сохранении прав');
      console.error(error);
    }
  };

  const togglePermission = (section: string, action: string) => {
    if (!selectedRole) return;
    
    const newPermissions = { ...selectedRole.permissions };
    if (!newPermissions[section]) {
      newPermissions[section] = {};
    }
    newPermissions[section][action] = !newPermissions[section][action];
    
    setSelectedRole({ ...selectedRole, permissions: newPermissions });
  };

  const getRoleDisplayName = (roleName: string) => {
    const role = roles.find(r => r.role_name === roleName);
    return role ? role.display_name : roleName;
  };

  const openUserForm = (user?: any) => {
    if (user) {
      setEditUser(user);
      setUserFormData({
        username: user.username,
        full_name: user.full_name,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active
      });
    } else {
      setEditUser(null);
      setUserFormData({
        username: '',
        full_name: '',
        email: '',
        phone: '',
        role: 'buyer',
        is_active: true
      });
    }
    setShowUserForm(true);
  };

  const openPermissionsModal = (role: any) => {
    setSelectedRole(JSON.parse(JSON.stringify(role)));
    setShowPermissionsModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <Icon name="Users" size={18} className="mr-2" />
            Пользователи
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Icon name="Shield" size={18} className="mr-2" />
            Права доступа
          </TabsTrigger>
          <TabsTrigger value="telegram">
            <Icon name="Send" size={18} className="mr-2" />
            Telegram Бот
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Управление пользователями</CardTitle>
                <CardDescription>Создавайте и редактируйте пользователей системы</CardDescription>
              </div>
              <Button onClick={() => openUserForm()}>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить пользователя
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя пользователя</TableHead>
                      <TableHead>ФИО</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Telegram</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell className="text-sm">{user.email || '-'}</TableCell>
                        <TableCell className="text-sm">{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.telegram_connected ? (
                            <Badge variant="default" className="bg-green-500">
                              <Icon name="Check" size={12} className="mr-1" />
                              Подключен
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Icon name="X" size={12} className="mr-1" />
                              Не подключен
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Активен' : 'Отключен'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openUserForm(user)}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Управление правами доступа</CardTitle>
              <CardDescription>Настройте права для каждой роли</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openPermissionsModal(role)}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon name="ShieldCheck" size={20} className="text-primary" />
                        {role.display_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon name="Eye" size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            Просмотр: {Object.keys(role.permissions).filter(k => role.permissions[k]?.view).length} разделов
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Edit" size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            Редактирование: {Object.keys(role.permissions).filter(k => role.permissions[k]?.edit).length} разделов
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          <Icon name="Settings" size={16} className="mr-2" />
                          Настроить права
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telegram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройка Telegram Бота</CardTitle>
              <CardDescription>
                Получайте уведомления о событиях заказов в личный чат с ботом
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">📱 Как настроить:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-2">
                  <li>Создайте бота через <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="underline font-medium">@BotFather</a> и скопируйте токен</li>
                  <li>Напишите боту любое сообщение (например, /start)</li>
                  <li>Узнайте свой Chat ID через <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="underline font-medium">@userinfobot</a></li>
                  <li>Введите данные ниже и проверьте подключение</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot_token">Токен бота *</Label>
                    <Input
                      id="bot_token"
                      type="password"
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      value={telegramSettings.bot_token}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, bot_token: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chat_id">Ваш Chat ID *</Label>
                    <Input
                      id="chat_id"
                      placeholder="123456789"
                      value={telegramSettings.chat_id}
                      onChange={(e) => setTelegramSettings({ ...telegramSettings, chat_id: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Ваш личный ID (обычно положительное число, без минуса)
                    </p>
                  </div>


                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestTelegramBot}
                    disabled={testingBot || !telegramSettings.bot_token || !telegramSettings.chat_id}
                  >
                    <Icon name="Send" size={18} className="mr-2" />
                    {testingBot ? 'Отправка...' : 'Проверить подключение'}
                  </Button>
                  <Button onClick={handleSaveTelegramSettings}>
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить настройки
                  </Button>
                </div>
              </div>


            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showUserForm} onOpenChange={(open) => { if (!open) { setShowUserForm(false); setEditUser(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editUser ? 'Редактировать пользователя' : 'Новый пользователь'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Имя пользователя *</Label>
                <Input
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  disabled={!!editUser}
                  required
                />
              </div>
              <div>
                <Label>ФИО *</Label>
                <Input
                  value={userFormData.full_name}
                  onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Телефон</Label>
                <Input
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Роль *</Label>
              <Select value={userFormData.role} onValueChange={(val) => setUserFormData({ ...userFormData, role: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.role_name} value={role.role_name}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Логин *</Label>
                <Input
                  value={userFormData.login}
                  onChange={(e) => setUserFormData({ ...userFormData, login: e.target.value })}
                  disabled={!!editUser}
                  required
                  placeholder="username"
                />
              </div>
              <div>
                <Label>Пароль *</Label>
                <Input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  required={!editUser}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {editUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={userFormData.is_active}
                    onCheckedChange={(checked) => setUserFormData({ ...userFormData, is_active: checked })}
                  />
                  <Label>Активный пользователь</Label>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Icon name="Send" size={16} />
                        Telegram подключение
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {editUser.telegram_connected 
                          ? `Подключен: ${editUser.telegram_connected_at || 'дата неизвестна'}`
                          : 'Не подключен к Telegram'}
                      </p>
                    </div>
                    {editUser.telegram_connected ? (
                      <Badge variant="default" className="bg-green-500">
                        <Icon name="Check" size={12} className="mr-1" />
                        Активен
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Icon name="X" size={12} className="mr-1" />
                        Не активен
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Код приглашения:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={editUser.invite_code || 'Генерируется...'}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(editUser.invite_code || '');
                          toast.success('Код скопирован!');
                        }}
                      >
                        <Icon name="Copy" size={14} />
                      </Button>
                    </div>
                    {telegramSettings.bot_username ? (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          Отправьте пользователю эту ссылку:
                        </p>
                        <div className="flex gap-2">
                          <Input
                            value={`https://t.me/${telegramSettings.bot_username}?start=${editUser.invite_code}`}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = `https://t.me/${telegramSettings.bot_username}?start=${editUser.invite_code}`;
                              navigator.clipboard.writeText(link);
                              toast.success('Ссылка скопирована!');
                            }}
                          >
                            <Icon name="Copy" size={14} />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600">
                          ✓ При переходе по ссылке бот автоматически подключится
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        Отправьте пользователю: <code className="bg-white px-2 py-1 rounded">/start {editUser.invite_code}</code>
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerateInviteCode(editUser.id)}
                    className="w-full"
                  >
                    <Icon name="RefreshCw" size={14} className="mr-2" />
                    Сгенерировать новый код (отключит текущий Telegram)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-blue-50 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Send" size={16} />
                  <h4 className="font-semibold text-sm">Telegram подключение</h4>
                </div>
                <p className="text-xs text-gray-600">
                  После создания пользователя будет автоматически сгенерирован код приглашения для подключения Telegram.
                  Код можно будет найти в разделе редактирования пользователя.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => { setShowUserForm(false); setEditUser(null); }}>
                Отмена
              </Button>
              <Button type="submit">
                {editUser ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPermissionsModal} onOpenChange={(open) => { if (!open) { setShowPermissionsModal(false); setSelectedRole(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Настройка прав доступа: {selectedRole?.display_name}</DialogTitle>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Раздел</TableHead>
                      <TableHead className="text-center">Просмотр</TableHead>
                      <TableHead className="text-center">Создание</TableHead>
                      <TableHead className="text-center">Редактирование</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Заказы</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.orders?.view || false}
                          onCheckedChange={() => togglePermission('orders', 'view')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.orders?.create || false}
                          onCheckedChange={() => togglePermission('orders', 'create')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.orders?.edit || false}
                          onCheckedChange={() => togglePermission('orders', 'edit')}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Водители</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.drivers?.view || false}
                          onCheckedChange={() => togglePermission('drivers', 'view')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.drivers?.create || false}
                          onCheckedChange={() => togglePermission('drivers', 'create')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.drivers?.edit || false}
                          onCheckedChange={() => togglePermission('drivers', 'edit')}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Автомобили</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.vehicles?.view || false}
                          onCheckedChange={() => togglePermission('vehicles', 'view')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.vehicles?.create || false}
                          onCheckedChange={() => togglePermission('vehicles', 'create')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.vehicles?.edit || false}
                          onCheckedChange={() => togglePermission('vehicles', 'edit')}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Перевозчики</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.clients?.view || false}
                          onCheckedChange={() => togglePermission('clients', 'view')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.clients?.create || false}
                          onCheckedChange={() => togglePermission('clients', 'create')}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.clients?.edit || false}
                          onCheckedChange={() => togglePermission('clients', 'edit')}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Обзор (Журнал действий)</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.overview?.view || false}
                          onCheckedChange={() => togglePermission('overview', 'view')}
                        />
                      </TableCell>
                      <TableCell className="text-center text-gray-400">-</TableCell>
                      <TableCell className="text-center text-gray-400">-</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Настройки</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.settings?.view || false}
                          onCheckedChange={() => togglePermission('settings', 'view')}
                        />
                      </TableCell>
                      <TableCell className="text-center text-gray-400">-</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={selectedRole.permissions?.settings?.edit || false}
                          onCheckedChange={() => togglePermission('settings', 'edit')}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Bell" size={18} />
                  Telegram уведомления
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Создание заказа</p>
                      <p className="text-xs text-gray-500">Уведомление при создании нового заказа</p>
                    </div>
                    <Switch
                      checked={selectedRole.permissions?.telegram_notifications?.order_created || false}
                      onCheckedChange={() => togglePermission('telegram_notifications', 'order_created')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Загрузка груза</p>
                      <p className="text-xs text-gray-500">Уведомление о начале погрузки</p>
                    </div>
                    <Switch
                      checked={selectedRole.permissions?.telegram_notifications?.order_loaded || false}
                      onCheckedChange={() => togglePermission('telegram_notifications', 'order_loaded')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">В пути</p>
                      <p className="text-xs text-gray-500">Информация о маршруте и автомобиле</p>
                    </div>
                    <Switch
                      checked={selectedRole.permissions?.telegram_notifications?.order_in_transit || false}
                      onCheckedChange={() => togglePermission('telegram_notifications', 'order_in_transit')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Доставка</p>
                      <p className="text-xs text-gray-500">Уведомление о завершении доставки</p>
                    </div>
                    <Switch
                      checked={selectedRole.permissions?.telegram_notifications?.order_delivered || false}
                      onCheckedChange={() => togglePermission('telegram_notifications', 'order_delivered')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Этапы заказа</p>
                      <p className="text-xs text-gray-500">Уведомление о выполнении этапов</p>
                    </div>
                    <Switch
                      checked={selectedRole.permissions?.telegram_notifications?.stage_completed || false}
                      onCheckedChange={() => togglePermission('telegram_notifications', 'stage_completed')}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Важная информация:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Просмотр</strong> - доступ к разделу и просмотр данных</li>
                      <li><strong>Создание</strong> - возможность добавлять новые записи</li>
                      <li><strong>Редактирование</strong> - возможность изменять существующие записи</li>
                      <li>Без права "Просмотр" раздел не отображается в меню</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowPermissionsModal(false); setSelectedRole(null); }}>
                  Отмена
                </Button>
                <Button type="button" onClick={handleSavePermissions}>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить права
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}