import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface TransportStage {
  id?: number;
  stage_number: number;
  vehicle_id: string;
  driver_id: string;
  from_location: string;
  to_location: string;
  planned_departure: string;
  planned_arrival: string;
  distance_km: string;
  notes: string;
}

interface CustomsPoint {
  id?: number;
  stage_id?: number;
  customs_name: string;
  country: string;
  crossing_date: string;
  notes: string;
}

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: any[];
  drivers: any[];
  vehicles: any[];
  userRole?: string;
}

export default function MultiStageOrderForm({ open, onClose, onSuccess, clients, drivers, vehicles, userRole = 'Пользователь' }: OrderFormProps) {
  const [formData, setFormData] = useState({
    order_number: '',
    client_id: '',
    order_date: new Date().toISOString().split('T')[0],
    planned_route: '',
    cargo_description: '',
    cargo_weight: '',
    cargo_volume: '',
    total_price: '',
    status: 'pending'
  });

  const [stages, setStages] = useState<TransportStage[]>([{
    stage_number: 1,
    vehicle_id: '',
    driver_id: '',
    from_location: '',
    to_location: '',
    planned_departure: '',
    planned_arrival: '',
    distance_km: '',
    notes: ''
  }]);

  const [customsPoints, setCustomsPoints] = useState<CustomsPoint[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setFormData({
        order_number: '',
        client_id: '',
        order_date: new Date().toISOString().split('T')[0],
        planned_route: '',
        cargo_description: '',
        cargo_weight: '',
        cargo_volume: '',
        total_price: '',
        status: 'pending'
      });
      setStages([{
        stage_number: 1,
        vehicle_id: '',
        driver_id: '',
        from_location: '',
        to_location: '',
        planned_departure: '',
        planned_arrival: '',
        distance_km: '',
        notes: ''
      }]);
      setCustomsPoints([]);
      setErrors({});
    }
  }, [open]);

  const addStage = () => {
    const newStage: TransportStage = {
      stage_number: stages.length + 1,
      vehicle_id: '',
      driver_id: '',
      from_location: stages[stages.length - 1]?.to_location || '',
      to_location: '',
      planned_departure: '',
      planned_arrival: '',
      distance_km: '',
      notes: ''
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      const newStages = stages.filter((_, i) => i !== index);
      newStages.forEach((stage, i) => {
        stage.stage_number = i + 1;
      });
      setStages(newStages);
    }
  };

  const updateStage = (index: number, field: keyof TransportStage, value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const addCustomsPoint = () => {
    setCustomsPoints([...customsPoints, {
      customs_name: '',
      country: '',
      crossing_date: '',
      notes: ''
    }]);
  };

  const removeCustomsPoint = (index: number) => {
    setCustomsPoints(customsPoints.filter((_, i) => i !== index));
  };

  const updateCustomsPoint = (index: number, field: keyof CustomsPoint, value: string) => {
    const newPoints = [...customsPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setCustomsPoints(newPoints);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.order_number?.trim()) newErrors.order_number = 'Обязательное поле';
    if (!formData.client_id) newErrors.client_id = 'Обязательное поле';
    if (!formData.planned_route?.trim()) newErrors.planned_route = 'Обязательное поле';
    if (!formData.cargo_description?.trim()) newErrors.cargo_description = 'Обязательное поле';
    
    stages.forEach((stage, i) => {
      if (!stage.from_location?.trim()) newErrors[`stage_${i}_from`] = 'Укажите откуда';
      if (!stage.to_location?.trim()) newErrors[`stage_${i}_to`] = 'Укажите куда';
      if (!stage.vehicle_id) newErrors[`stage_${i}_vehicle`] = 'Выберите ТС';
      if (!stage.driver_id) newErrors[`stage_${i}_driver`] = 'Выберите водителя';
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
          data: {
            order: formData,
            stages: stages,
            customs_points: customsPoints
          },
          user_role: userRole
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      toast.success('Многоэтапный заказ создан');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Ошибка при создании заказа');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый многоэтапный заказ</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                  />
                </div>

                <div>
                  <Label htmlFor="client_id">Клиент *</Label>
                  <Select value={formData.client_id} onValueChange={(val) => setFormData({ ...formData, client_id: val })}>
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
              </div>

              <div>
                <Label htmlFor="planned_route">Плановый маршрут *</Label>
                <Input
                  id="planned_route"
                  placeholder="Например: Нидерланды → Польша → Беларусь → Москва"
                  value={formData.planned_route}
                  onChange={(e) => setFormData({ ...formData, planned_route: e.target.value })}
                  className={errors.planned_route ? 'border-red-500' : ''}
                />
                {errors.planned_route && <p className="text-red-500 text-xs mt-1">{errors.planned_route}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cargo_description">Описание груза *</Label>
                  <Input
                    id="cargo_description"
                    placeholder="Например: Электроника"
                    value={formData.cargo_description}
                    onChange={(e) => setFormData({ ...formData, cargo_description: e.target.value })}
                    className={errors.cargo_description ? 'border-red-500' : ''}
                  />
                  {errors.cargo_description && <p className="text-red-500 text-xs mt-1">{errors.cargo_description}</p>}
                </div>

                <div>
                  <Label htmlFor="cargo_weight">Вес (кг)</Label>
                  <Input
                    id="cargo_weight"
                    type="number"
                    step="0.01"
                    placeholder="1000"
                    value={formData.cargo_weight}
                    onChange={(e) => setFormData({ ...formData, cargo_weight: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cargo_volume">Объем (м³)</Label>
                  <Input
                    id="cargo_volume"
                    type="number"
                    step="0.01"
                    placeholder="15.5"
                    value={formData.cargo_volume}
                    onChange={(e) => setFormData({ ...formData, cargo_volume: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_price">Стоимость (₽)</Label>
                  <Input
                    id="total_price"
                    type="number"
                    step="0.01"
                    placeholder="150000"
                    value={formData.total_price}
                    onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Статус</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="in_transit">В пути</SelectItem>
                      <SelectItem value="delivered">Доставлен</SelectItem>
                      <SelectItem value="cancelled">Отменен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Этапы перевозки</CardTitle>
              <Button type="button" size="sm" onClick={addStage}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить этап
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {stages.map((stage, index) => (
                <Card key={index} className="bg-slate-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Этап {stage.stage_number}</CardTitle>
                      {stages.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeStage(index)}>
                          <Icon name="X" size={16} />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Откуда *</Label>
                        <Input
                          placeholder="Город отправления"
                          value={stage.from_location}
                          onChange={(e) => updateStage(index, 'from_location', e.target.value)}
                          className={errors[`stage_${index}_from`] ? 'border-red-500' : ''}
                        />
                        {errors[`stage_${index}_from`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${index}_from`]}</p>}
                      </div>

                      <div>
                        <Label>Куда *</Label>
                        <Input
                          placeholder="Город назначения"
                          value={stage.to_location}
                          onChange={(e) => updateStage(index, 'to_location', e.target.value)}
                          className={errors[`stage_${index}_to`] ? 'border-red-500' : ''}
                        />
                        {errors[`stage_${index}_to`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${index}_to`]}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Автомобиль *</Label>
                        <Select value={stage.vehicle_id} onValueChange={(val) => updateStage(index, 'vehicle_id', val)}>
                          <SelectTrigger className={errors[`stage_${index}_vehicle`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Выберите ТС" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                {vehicle.license_plate} - {vehicle.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`stage_${index}_vehicle`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${index}_vehicle`]}</p>}
                      </div>

                      <div>
                        <Label>Водитель *</Label>
                        <Select value={stage.driver_id} onValueChange={(val) => updateStage(index, 'driver_id', val)}>
                          <SelectTrigger className={errors[`stage_${index}_driver`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Выберите водителя" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id.toString()}>
                                {driver.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`stage_${index}_driver`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${index}_driver`]}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Дата отправления</Label>
                        <Input
                          type="datetime-local"
                          value={stage.planned_departure}
                          onChange={(e) => updateStage(index, 'planned_departure', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Дата прибытия</Label>
                        <Input
                          type="datetime-local"
                          value={stage.planned_arrival}
                          onChange={(e) => updateStage(index, 'planned_arrival', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Расстояние (км)</Label>
                        <Input
                          type="number"
                          placeholder="500"
                          value={stage.distance_km}
                          onChange={(e) => updateStage(index, 'distance_km', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Примечания</Label>
                      <Textarea
                        placeholder="Дополнительная информация об этом этапе"
                        value={stage.notes}
                        onChange={(e) => updateStage(index, 'notes', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Таможенные пункты</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addCustomsPoint}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить таможню
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {customsPoints.length === 0 && (
                <p className="text-sm text-muted-foreground">Таможенные пункты не добавлены</p>
              )}
              {customsPoints.map((point, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <Label>Название таможни</Label>
                      <Input
                        placeholder="Например: Брест"
                        value={point.customs_name}
                        onChange={(e) => updateCustomsPoint(index, 'customs_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Страна</Label>
                      <Input
                        placeholder="Беларусь"
                        value={point.country}
                        onChange={(e) => updateCustomsPoint(index, 'country', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Дата прохождения</Label>
                      <Input
                        type="datetime-local"
                        value={point.crossing_date}
                        onChange={(e) => updateCustomsPoint(index, 'crossing_date', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCustomsPoint(index)} className="mt-6">
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit">
              Создать заказ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
