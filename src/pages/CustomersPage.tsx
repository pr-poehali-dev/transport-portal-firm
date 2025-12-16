import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface DeliveryAddress {
  id?: number;
  address_name: string;
  address: string;
  contact_person: string;
  phone: string;
  is_primary: boolean;
}

interface CustomersPageProps {
  customers: any[];
  onRefresh: () => void;
}

export default function CustomersPage({ customers, onRefresh }: CustomersPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState<DeliveryAddress | null>(null);
  
  const [formData, setFormData] = useState({
    company_name: '',
    inn: '',
    kpp: '',
    legal_address: '',
    director_name: '',
    delivery_address: '',
    nickname: '',
    contact_person: '',
    phone: '',
    email: ''
  });

  const [addressFormData, setAddressFormData] = useState<DeliveryAddress>({
    address_name: '',
    address: '',
    contact_person: '',
    phone: '',
    is_primary: false
  });

  const resetForm = () => {
    setFormData({
      company_name: '',
      inn: '',
      kpp: '',
      legal_address: '',
      director_name: '',
      delivery_address: '',
      nickname: '',
      contact_person: '',
      phone: '',
      email: ''
    });
    setEditCustomer(null);
  };

  const resetAddressForm = () => {
    setAddressFormData({
      address_name: '',
      address: '',
      contact_person: '',
      phone: '',
      is_primary: false
    });
    setEditAddress(null);
  };

  const loadAddresses = async (customerId: number) => {
    try {
      const response = await fetch(`${API_URL}?resource=customer_addresses&customer_id=${customerId}`);
      const data = await response.json();
      setDeliveryAddresses(data.addresses || []);
    } catch (error) {
      toast.error('Ошибка загрузки адресов');
    }
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (customer: any) => {
    setFormData({
      company_name: customer.company_name || '',
      inn: customer.inn || '',
      kpp: customer.kpp || '',
      legal_address: customer.legal_address || '',
      director_name: customer.director_name || '',
      delivery_address: customer.delivery_address || '',
      nickname: customer.nickname || '',
      contact_person: customer.contact_person || '',
      phone: customer.phone || '',
      email: customer.email || ''
    });
    setEditCustomer(customer);
    setShowForm(true);
  };

  const handleViewAddresses = async (customer: any) => {
    setSelectedCustomer(customer);
    await loadAddresses(customer.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name || !formData.inn || !formData.legal_address || !formData.director_name || !formData.nickname) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      if (editCustomer) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'customer',
            id: editCustomer.id,
            data: formData
          })
        });
        toast.success('Заказчик обновлен');
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_customer',
            data: formData
          })
        });
        toast.success('Заказчик добавлен');
      }
      setShowForm(false);
      resetForm();
      onRefresh();
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressFormData.address_name || !addressFormData.address) {
      toast.error('Заполните название и адрес');
      return;
    }

    try {
      if (editAddress && editAddress.id) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'customer_address',
            id: editAddress.id,
            data: addressFormData
          })
        });
        toast.success('Адрес обновлен');
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_customer_address',
            customer_id: selectedCustomer.id,
            data: addressFormData
          })
        });
        toast.success('Адрес добавлен');
      }
      setShowAddressForm(false);
      resetAddressForm();
      await loadAddresses(selectedCustomer.id);
    } catch (error) {
      toast.error('Ошибка сохранения адреса');
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Удалить адрес доставки?')) return;

    try {
      await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer_address',
          id: addressId
        })
      });
      toast.success('Адрес удален');
      await loadAddresses(selectedCustomer.id);
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить заказчика?')) return;

    try {
      await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer',
          id
        })
      });
      toast.success('Заказчик удален');
      onRefresh();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>База заказчиков</CardTitle>
              <CardDescription>Управление информацией о компаниях-заказчиках</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить заказчика
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="Building2" size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Нет заказчиков</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Псевдоним</TableHead>
                  <TableHead>Название компании</TableHead>
                  <TableHead>ИНН</TableHead>
                  <TableHead>КПП</TableHead>
                  <TableHead>Руководитель</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.nickname}</TableCell>
                    <TableCell>{customer.company_name}</TableCell>
                    <TableCell>{customer.inn}</TableCell>
                    <TableCell>{customer.kpp || '—'}</TableCell>
                    <TableCell>{customer.director_name}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {customer.contact_person && <div>{customer.contact_person}</div>}
                        {customer.phone && <div>{customer.phone}</div>}
                        {customer.email && <div className="text-gray-500">{customer.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAddresses(customer)}
                          title="Адреса доставки"
                        >
                          <Icon name="MapPin" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Icon name="Trash2" size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCustomer ? 'Редактировать заказчика' : 'Новый заказчик'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="company_name">Название компании *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="nickname">Псевдоним *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="Краткое название для поиска"
                  required
                />
              </div>

              <div>
                <Label htmlFor="inn">ИНН *</Label>
                <Input
                  id="inn"
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  maxLength={12}
                  required
                />
              </div>

              <div>
                <Label htmlFor="kpp">КПП</Label>
                <Input
                  id="kpp"
                  value={formData.kpp}
                  onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                  maxLength={9}
                />
              </div>

              <div>
                <Label htmlFor="director_name">Руководитель *</Label>
                <Input
                  id="director_name"
                  value={formData.director_name}
                  onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="legal_address">Юридический адрес *</Label>
                <Input
                  id="legal_address"
                  value={formData.legal_address}
                  onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="delivery_address">Адрес доставки</Label>
                <Input
                  id="delivery_address"
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="Можно добавить позже через кнопку 📍"
                />
              </div>

              <div>
                <Label htmlFor="contact_person">Контактное лицо</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {editCustomer ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCustomer && !showAddressForm} onOpenChange={(open) => {
        if (!open) {
          setSelectedCustomer(null);
          setDeliveryAddresses([]);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Адреса доставки: {selectedCustomer?.nickname}</DialogTitle>
            <DialogDescription>
              Управление адресами доставки заказчика
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {selectedCustomer?.company_name}
              </p>
              <Button size="sm" onClick={() => setShowAddressForm(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить адрес
              </Button>
            </div>

            {deliveryAddresses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon name="MapPin" size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Нет адресов доставки</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deliveryAddresses.map((addr) => (
                  <Card key={addr.id} className={addr.is_primary ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{addr.address_name}</h4>
                            {addr.is_primary && (
                              <Badge variant="default" className="text-xs">Основной</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{addr.address}</p>
                          {addr.contact_person && (
                            <p className="text-sm text-gray-600">
                              <Icon name="User" size={14} className="inline mr-1" />
                              {addr.contact_person}
                            </p>
                          )}
                          {addr.phone && (
                            <p className="text-sm text-gray-600">
                              <Icon name="Phone" size={14} className="inline mr-1" />
                              {addr.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditAddress(addr);
                              setAddressFormData(addr);
                              setShowAddressForm(true);
                            }}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(addr.id!)}
                          >
                            <Icon name="Trash2" size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddressForm} onOpenChange={(open) => {
        if (!open) {
          setShowAddressForm(false);
          resetAddressForm();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editAddress ? 'Редактировать адрес' : 'Новый адрес доставки'}</DialogTitle>
            <DialogDescription>
              {editAddress ? 'Изменить данные адреса доставки' : 'Добавить новый адрес доставки для заказчика'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div>
              <Label htmlFor="address_name">Название адреса *</Label>
              <Input
                id="address_name"
                value={addressFormData.address_name}
                onChange={(e) => setAddressFormData({ ...addressFormData, address_name: e.target.value })}
                placeholder="Основной склад, Офис и т.д."
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Адрес *</Label>
              <Input
                id="address"
                value={addressFormData.address}
                onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="addr_contact_person">Контактное лицо</Label>
              <Input
                id="addr_contact_person"
                value={addressFormData.contact_person}
                onChange={(e) => setAddressFormData({ ...addressFormData, contact_person: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="addr_phone">Телефон</Label>
              <Input
                id="addr_phone"
                value={addressFormData.phone}
                onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={addressFormData.is_primary}
                onChange={(e) => setAddressFormData({ ...addressFormData, is_primary: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_primary" className="cursor-pointer">
                Сделать основным адресом
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddressForm(false);
                resetAddressForm();
              }}>
                Отмена
              </Button>
              <Button type="submit">
                {editAddress ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}