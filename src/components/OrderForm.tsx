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
  }, [editOrder, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
                required
              />
            </div>

            <div>
              <Label htmlFor="order_date">Дата заказа *</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="client_id">Клиент *</Label>
              <Select value={formData.client_id.toString()} onValueChange={(val) => setFormData({ ...formData, client_id: val })}>
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="carrier">Перевозчик *</Label>
              <Input
                id="carrier"
                value={formData.carrier}
                onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="vehicle_id">Автомобиль *</Label>
              <Select value={formData.vehicle_id.toString()} onValueChange={(val) => setFormData({ ...formData, vehicle_id: val })}>
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="driver_id">Водитель *</Label>
              <Select value={formData.driver_id.toString()} onValueChange={(val) => setFormData({ ...formData, driver_id: val })}>
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="route_from">Откуда *</Label>
              <Input
                id="route_from"
                value={formData.route_from}
                onChange={(e) => setFormData({ ...formData, route_from: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="route_to">Куда *</Label>
              <Input
                id="route_to"
                value={formData.route_to}
                onChange={(e) => setFormData({ ...formData, route_to: e.target.value })}
                required
              />
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

          <div className="flex gap-2 justify-end pt-4">
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
