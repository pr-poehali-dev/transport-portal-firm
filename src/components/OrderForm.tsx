import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editOrder?: any;
  clients: any[];
  drivers: any[];
  vehicles: any[];
}

export default function OrderForm({ open, onClose, onSuccess, editOrder, clients, drivers, vehicles }: OrderFormProps) {
  const [formData, setFormData] = useState({
    order_number: '',
    client_id: '',
    carrier: '',
    vehicle_id: '',
    driver_id: '',
    route_from: '',
    route_to: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    invoice_number: '',
    phone: '',
    border_crossing: '',
    delivery_address: '',
    overload: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editOrder) {
      setFormData({
        order_number: editOrder.order_number || '',
        client_id: editOrder.client_id || '',
        carrier: editOrder.carrier || '',
        vehicle_id: editOrder.vehicle_id || '',
        driver_id: editOrder.driver_id || '',
        route_from: editOrder.route_from || '',
        route_to: editOrder.route_to || '',
        order_date: editOrder.order_date ? editOrder.order_date.split('.').reverse().join('-') : '',
        status: editOrder.status || 'pending',
        invoice_number: editOrder.invoice_number || '',
        phone: editOrder.phone || '',
        border_crossing: editOrder.border_crossing || '',
        delivery_address: editOrder.delivery_address || '',
        overload: editOrder.overload || false
      });
    } else {
      setFormData({
        order_number: '',
        client_id: '',
        carrier: '',
        vehicle_id: '',
        driver_id: '',
        route_from: '',
        route_to: '',
        order_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        invoice_number: '',
        phone: '',
        border_crossing: '',
        delivery_address: '',
        overload: false
      });
    }
    setErrors({});
  }, [editOrder, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.order_number?.trim()) newErrors.order_number = 'Обязательное поле';
    if (!formData.order_date) newErrors.order_date = 'Обязательное поле';
    if (!formData.client_id) newErrors.client_id = 'Обязательное поле';
    if (!formData.carrier?.trim()) newErrors.carrier = 'Обязательное поле';
    if (!formData.vehicle_id) newErrors.vehicle_id = 'Обязательное поле';
    if (!formData.driver_id) newErrors.driver_id = 'Обязательное поле';
    if (!formData.route_from?.trim()) newErrors.route_from = 'Обязательное поле';
    if (!formData.route_to?.trim()) newErrors.route_to = 'Обязательное поле';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      if (editOrder) {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'order',
            id: editOrder.id,
            data: formData
          })
        });

        if (!response.ok) throw new Error('Failed to update order');
        toast.success('Заказ обновлен');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_order',
            data: formData
          })
        });

        if (!response.ok) throw new Error('Failed to create order');
        toast.success('Заказ создан');
      }

      onSuccess();
      onClose();
      setErrors({});
    } catch (error) {
      toast.error('Ошибка при сохранении заказа');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editOrder ? 'Редактировать заказ' : 'Новый заказ'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order_number">Номер заказа *</Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                className={errors.order_number ? 'border-red-500' : ''}
              />
              {errors.order_number && <p className="text-red-500 text-xs mt-1">{errors.order_number}</p>}
            </div>

            <div>
              <Label htmlFor="order_date">Дата заказа *</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                className={errors.order_date ? 'border-red-500' : ''}
              />
              {errors.order_date && <p className="text-red-500 text-xs mt-1">{errors.order_date}</p>}
            </div>

            <div>
              <Label htmlFor="client_id">Клиент *</Label>
              <Select value={formData.client_id.toString()} onValueChange={(val) => setFormData({ ...formData, client_id: val })}>
                <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
            </div>

            <div>
              <Label htmlFor="carrier">Перевозчик *</Label>
              <Input
                id="carrier"
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                className={errors.carrier ? 'border-red-500' : ''}
              />
              {errors.carrier && <p className="text-red-500 text-xs mt-1">{errors.carrier}</p>}
            </div>

            <div>
              <Label htmlFor="vehicle_id">Автомобиль *</Label>
              <Select value={formData.vehicle_id.toString()} onValueChange={(val) => setFormData({ ...formData, vehicle_id: val })}>
                <SelectTrigger className={errors.vehicle_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите автомобиль" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.license_plate} - {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id}</p>}
            </div>

            <div>
              <Label htmlFor="driver_id">Водитель *</Label>
              <Select value={formData.driver_id.toString()} onValueChange={(val) => setFormData({ ...formData, driver_id: val })}>
                <SelectTrigger className={errors.driver_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите водителя" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.driver_id && <p className="text-red-500 text-xs mt-1">{errors.driver_id}</p>}
            </div>

            <div>
              <Label htmlFor="route_from">Откуда *</Label>
              <Input
                id="route_from"
                value={formData.route_from}
                onChange={(e) => setFormData({ ...formData, route_from: e.target.value })}
                className={errors.route_from ? 'border-red-500' : ''}
              />
              {errors.route_from && <p className="text-red-500 text-xs mt-1">{errors.route_from}</p>}
            </div>

            <div>
              <Label htmlFor="route_to">Куда *</Label>
              <Input
                id="route_to"
                value={formData.route_to}
                onChange={(e) => setFormData({ ...formData, route_to: e.target.value })}
                className={errors.route_to ? 'border-red-500' : ''}
              />
              {errors.route_to && <p className="text-red-500 text-xs mt-1">{errors.route_to}</p>}
            </div>

            <div>
              <Label htmlFor="invoice_number">Номер счета</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="border_crossing">Погранпереход</Label>
              <Input
                id="border_crossing"
                value={formData.border_crossing}
                onChange={(e) => setFormData({ ...formData, border_crossing: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Ожидание</SelectItem>
                  <SelectItem value="loading">Загрузка</SelectItem>
                  <SelectItem value="in_transit">В пути</SelectItem>
                  <SelectItem value="delivered">Доставлен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="delivery_address">Адрес доставки</Label>
            <Input
              id="delivery_address"
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="overload"
              checked={formData.overload}
              onCheckedChange={(checked) => setFormData({ ...formData, overload: checked as boolean })}
            />
            <Label htmlFor="overload">Перегруз</Label>
          </div>

          <div className="flex gap-2 justify-end pt-4 sticky bottom-0 bg-white border-t mt-4 -mx-6 px-6 py-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              {editOrder ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}