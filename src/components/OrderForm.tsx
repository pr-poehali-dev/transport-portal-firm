import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editOrder?: any;
  clients: any[];
  drivers: any[];
  vehicles: any[];
  userRole?: string;
}

interface Stage {
  id: string;
  stage_number: number;
  from_location: string;
  to_location: string;
  vehicle_id: string;
  driver_id: string;
  customs_name: string;
  notes: string;
}

export default function OrderForm({ open, onClose, onSuccess, editOrder, clients, drivers, vehicles, userRole = 'Пользователь' }: OrderFormProps) {
  const [orderInfo, setOrderInfo] = useState({
    order_number: '',
    client_id: '',
    order_date: new Date().toISOString().split('T')[0],
    cargo_type: '',
    cargo_weight: ''
  });

  const [stages, setStages] = useState<Stage[]>([{
    id: '1',
    stage_number: 1,
    from_location: '',
    to_location: '',
    vehicle_id: '',
    driver_id: '',
    customs_name: '',
    notes: ''
  }]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && !editOrder) {
      setOrderInfo({
        order_number: '',
        client_id: '',
        order_date: new Date().toISOString().split('T')[0],
        cargo_type: '',
        cargo_weight: ''
      });
      setStages([{
        id: '1',
        stage_number: 1,
        from_location: '',
        to_location: '',
        vehicle_id: '',
        driver_id: '',
        customs_name: '',
        notes: ''
      }]);
      setErrors({});
    }
  }, [open, editOrder]);

  const addStage = () => {
    const newStage: Stage = {
      id: Date.now().toString(),
      stage_number: stages.length + 1,
      from_location: '',
      to_location: '',
      vehicle_id: '',
      driver_id: '',
      customs_name: '',
      notes: ''
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (id: string) => {
    if (stages.length === 1) {
      toast.error('Должен быть минимум 1 этап');
      return;
    }
    setStages(stages.filter(s => s.id !== id).map((s, idx) => ({ ...s, stage_number: idx + 1 })));
  };

  const updateStage = (id: string, field: keyof Stage, value: string) => {
    setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!orderInfo.order_number?.trim()) newErrors.order_number = 'Обязательное поле';
    if (!orderInfo.client_id) newErrors.client_id = 'Обязательное поле';
    if (!orderInfo.order_date) newErrors.order_date = 'Обязательное поле';

    stages.forEach((stage, idx) => {
      if (!stage.from_location?.trim()) newErrors[`stage_${idx}_from`] = 'Обязательное поле';
      if (!stage.to_location?.trim()) newErrors[`stage_${idx}_to`] = 'Обязательное поле';
      if (!stage.vehicle_id) newErrors[`stage_${idx}_vehicle`] = 'Обязательное поле';
      if (!stage.driver_id) newErrors[`stage_${idx}_driver`] = 'Обязательное поле';
    });

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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_multi_stage_order',
          user_role: userRole,
          data: {
            order: {
              order_number: orderInfo.order_number,
              client_id: parseInt(orderInfo.client_id),
              order_date: orderInfo.order_date,
              status: 'pending'
            },
            stages: stages.map(stage => ({
              stage_number: stage.stage_number,
              vehicle_id: parseInt(stage.vehicle_id),
              driver_id: parseInt(stage.driver_id),
              from_location: stage.from_location,
              to_location: stage.to_location,
              notes: `Характер груза: ${orderInfo.cargo_type || '-'}, Вес: ${orderInfo.cargo_weight || '-'}${stage.notes ? ', ' + stage.notes : ''}`
            })),
            customs_points: stages
              .filter(s => s.customs_name?.trim())
              .map(s => ({
                customs_name: s.customs_name,
                country: '',
                crossing_date: null,
                notes: ''
              }))
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      toast.success('Заказ создан');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Ошибка при создании заказа');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editOrder ? 'Редактировать заказ' : 'Новый заказ'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Информация о заказе</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Номер заказа *</Label>
                <Input
                  value={orderInfo.order_number}
                  onChange={(e) => setOrderInfo({ ...orderInfo, order_number: e.target.value })}
                  className={errors.order_number ? 'border-red-500' : ''}
                  placeholder="2024-001"
                />
                {errors.order_number && <p className="text-red-500 text-xs mt-1">{errors.order_number}</p>}
              </div>

              <div>
                <Label>Дата заказа *</Label>
                <Input
                  type="date"
                  value={orderInfo.order_date}
                  onChange={(e) => setOrderInfo({ ...orderInfo, order_date: e.target.value })}
                  className={errors.order_date ? 'border-red-500' : ''}
                />
                {errors.order_date && <p className="text-red-500 text-xs mt-1">{errors.order_date}</p>}
              </div>

              <div>
                <Label>Клиент *</Label>
                <Select value={orderInfo.client_id} onValueChange={(val) => setOrderInfo({ ...orderInfo, client_id: val })}>
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
                <Label>Характер груза</Label>
                <Input
                  value={orderInfo.cargo_type}
                  onChange={(e) => setOrderInfo({ ...orderInfo, cargo_type: e.target.value })}
                  placeholder="Фрукты, овощи..."
                />
              </div>

              <div>
                <Label>Вес груза (кг)</Label>
                <Input
                  type="number"
                  value={orderInfo.cargo_weight}
                  onChange={(e) => setOrderInfo({ ...orderInfo, cargo_weight: e.target.value })}
                  placeholder="20000"
                />
              </div>
            </CardContent>
          </Card>

          {stages.map((stage, idx) => (
            <Card key={stage.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Этап {stage.stage_number}</CardTitle>
                {stages.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStage(stage.id)}
                    className="text-red-500"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Откуда *</Label>
                    <Input
                      value={stage.from_location}
                      onChange={(e) => updateStage(stage.id, 'from_location', e.target.value)}
                      className={errors[`stage_${idx}_from`] ? 'border-red-500' : ''}
                      placeholder="Москва"
                    />
                    {errors[`stage_${idx}_from`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_from`]}</p>}
                  </div>

                  <div>
                    <Label>Куда *</Label>
                    <Input
                      value={stage.to_location}
                      onChange={(e) => updateStage(stage.id, 'to_location', e.target.value)}
                      className={errors[`stage_${idx}_to`] ? 'border-red-500' : ''}
                      placeholder="Санкт-Петербург"
                    />
                    {errors[`stage_${idx}_to`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_to`]}</p>}
                  </div>

                  <div>
                    <Label>Водитель *</Label>
                    <Select value={stage.driver_id} onValueChange={(val) => updateStage(stage.id, 'driver_id', val)}>
                      <SelectTrigger className={errors[`stage_${idx}_driver`] ? 'border-red-500' : ''}>
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
                    {errors[`stage_${idx}_driver`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_driver`]}</p>}
                  </div>

                  <div>
                    <Label>Автомобиль *</Label>
                    <Select value={stage.vehicle_id} onValueChange={(val) => updateStage(stage.id, 'vehicle_id', val)}>
                      <SelectTrigger className={errors[`stage_${idx}_vehicle`] ? 'border-red-500' : ''}>
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
                    {errors[`stage_${idx}_vehicle`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_vehicle`]}</p>}
                  </div>

                  <div>
                    <Label>Таможня</Label>
                    <Input
                      value={stage.customs_name}
                      onChange={(e) => updateStage(stage.id, 'customs_name', e.target.value)}
                      placeholder="Торфяновка"
                    />
                  </div>

                  <div>
                    <Label>Примечания</Label>
                    <Input
                      value={stage.notes}
                      onChange={(e) => updateStage(stage.id, 'notes', e.target.value)}
                      placeholder="Дополнительная информация"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={addStage} className="flex-1">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить перегруз / продолжить маршрут
            </Button>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              Создать заказ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
