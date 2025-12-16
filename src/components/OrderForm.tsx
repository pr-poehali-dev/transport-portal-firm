import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateInput from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface CustomerItem {
  customer_id: string;
  note: string;
}

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editOrder?: any;
  clients: any[];
  customers: any[];
  drivers: any[];
  vehicles: any[];
  userRole?: string;
}

interface Customs {
  id: string;
  customs_name: string;
}

interface Stage {
  id: string;
  stage_number: number;
  from_location: string;
  to_location: string;
  vehicle_id: string;
  driver_id: string;
  driver_phone: string;
  driver_additional_phone: string;
  customs: Customs[];
  notes: string;
}

interface UploadedFile {
  name: string;
  data: string;
  size: number;
  type: string;
}

export default function OrderForm({ open, onClose, onSuccess, editOrder, clients, customers, drivers, vehicles, userRole = 'Пользователь' }: OrderFormProps) {
  const [orderInfo, setOrderInfo] = useState({
    order_number: '',
    client_id: '',
    order_date: new Date().toISOString().split('T')[0],
    cargo_type: '',
    cargo_weight: '',
    invoice: '',
    track_number: '',
    notes: ''
  });

  const [customerItems, setCustomerItems] = useState<CustomerItem[]>([{
    customer_id: '',
    note: ''
  }]);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const [stages, setStages] = useState<Stage[]>([{
    id: '1',
    stage_number: 1,
    from_location: '',
    to_location: '',
    vehicle_id: '',
    driver_id: '',
    driver_phone: '',
    driver_additional_phone: '',
    customs: [],
    notes: ''
  }]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoRoute, setAutoRoute] = useState('');

  useEffect(() => {
    if (open) {
      if (editOrder) {
        setOrderInfo({
          order_number: editOrder.order_number || '',
          client_id: editOrder.client_id?.toString() || '',
          order_date: editOrder.order_date || new Date().toISOString().split('T')[0],
          cargo_type: editOrder.cargo_type || '',
          cargo_weight: editOrder.cargo_weight || '',
          invoice: editOrder.invoice || '',
          track_number: editOrder.track_number || '',
          notes: editOrder.notes || ''
        });
        setOrderCreated(false);
        setCreatedOrderId(editOrder.id);
        
        if (editOrder.customer_items && editOrder.customer_items.length > 0) {
          setCustomerItems(editOrder.customer_items.map((ci: any) => ({
            customer_id: ci.customer_id?.toString() || '',
            note: ci.note || ''
          })));
        } else {
          setCustomerItems([{ customer_id: '', note: '' }]);
        }
      } else {
        setOrderInfo({
          order_number: '',
          client_id: '',
          order_date: new Date().toISOString().split('T')[0],
          cargo_type: '',
          cargo_weight: '',
          invoice: '',
          track_number: '',
          notes: ''
        });
        setUploadedFiles([]);
        setOrderCreated(false);
        setCreatedOrderId(null);
        setCustomerItems([{ customer_id: '', note: '' }]);
      }
      
      setStages([{
        id: '1',
        stage_number: 1,
        from_location: '',
        to_location: '',
        vehicle_id: '',
        driver_id: '',
        driver_phone: '',
        driver_additional_phone: '',
        customs: [],
        notes: ''
      }]);
      setErrors({});
    }
  }, [open, editOrder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            const base64 = reader.result as string;
            
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              data: base64,
              size: file.size,
              type: file.type || 'application/octet-stream'
            }]);

            resolve();
          };

          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      toast.success('Файлы добавлены');
    } catch (error) {
      toast.error('Ошибка загрузки файлов');
      console.error(error);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addCustomerItem = () => {
    setCustomerItems([...customerItems, { customer_id: '', note: '' }]);
  };

  const removeCustomerItem = (index: number) => {
    setCustomerItems(customerItems.filter((_, i) => i !== index));
  };

  const updateCustomerItem = (index: number, field: keyof CustomerItem, value: string) => {
    const newItems = [...customerItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setCustomerItems(newItems);
  };

  const addStage = () => {
    const newStage: Stage = {
      id: Date.now().toString(),
      stage_number: stages.length + 1,
      from_location: '',
      to_location: '',
      vehicle_id: '',
      driver_id: '',
      driver_phone: '',
      driver_additional_phone: '',
      customs: [],
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
    setStages(stages.map(s => {
      if (s.id !== id) return s;
      
      // При выборе автомобиля автоматически подгружаем водителя и его телефоны
      if (field === 'vehicle_id') {
        const selectedVehicle = vehicles.find(v => v.id.toString() === value);
        console.log('Selected vehicle:', selectedVehicle);
        
        if (selectedVehicle && selectedVehicle.driver_id) {
          const driver = drivers.find(d => d.id === selectedVehicle.driver_id);
          console.log('Found driver:', driver);
          console.log('All drivers:', drivers);
          
          if (driver) {
            const updatedStage = {
              ...s,
              vehicle_id: value,
              driver_id: selectedVehicle.driver_id.toString(),
              driver_phone: driver.phone || '',
              driver_additional_phone: driver.additional_phone || ''
            };
            console.log('Updated stage:', updatedStage);
            return updatedStage;
          }
        }
      }
      
      return { ...s, [field]: value };
    }));
  };

  const addCustomsToStage = (stageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          customs: [...s.customs, { id: Date.now().toString(), customs_name: '' }]
        };
      }
      return s;
    }));
  };

  const removeCustomsFromStage = (stageId: string, customsId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          customs: s.customs.filter(c => c.id !== customsId)
        };
      }
      return s;
    }));
  };

  const updateCustomsInStage = (stageId: string, customsId: string, value: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          customs: s.customs.map(c => c.id === customsId ? { ...c, customs_name: value } : c)
        };
      }
      return s;
    }));
  };

  // Автоматическое формирование маршрута из этапов
  useEffect(() => {
    if (stages.length === 0) {
      setAutoRoute('');
      return;
    }

    const routeParts: string[] = [];
    
    // Добавляем начальную точку первого этапа
    if (stages[0]?.from_location) {
      routeParts.push(stages[0].from_location);
    }
    
    // Добавляем конечные точки всех этапов
    stages.forEach((stage) => {
      if (stage.to_location) {
        routeParts.push(stage.to_location);
      }
    });
    
    const route = routeParts.filter(Boolean).join(' → ');
    setAutoRoute(route);
  }, [stages]);

  const validateOrderInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!orderInfo.order_number?.trim()) newErrors.order_number = 'Обязательное поле';
    if (!orderInfo.order_date) newErrors.order_date = 'Обязательное поле';
    
    customerItems.forEach((item, i) => {
      if (!item.customer_id) newErrors[`customer_${i}_id`] = 'Выберите заказчика';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStages = (): boolean => {
    const newErrors: Record<string, string> = {};

    stages.forEach((stage, idx) => {
      if (!stage.from_location?.trim()) newErrors[`stage_${idx}_from`] = 'Обязательное поле';
      if (!stage.to_location?.trim()) newErrors[`stage_${idx}_to`] = 'Обязательное поле';
      if (!stage.vehicle_id) newErrors[`stage_${idx}_vehicle`] = 'Обязательное поле';
      if (!stage.driver_id) newErrors[`stage_${idx}_driver`] = 'Выберите автомобиль с назначенным водителем';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateOrder = async () => {
    if (!validateOrderInfo()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_order',
          order_id: editOrder.id,
          order: {
            order_number: orderInfo.order_number,
            order_date: orderInfo.order_date,
            cargo_type: orderInfo.cargo_type || null,
            cargo_weight: orderInfo.cargo_weight || null,
            invoice: orderInfo.invoice || null,
            track_number: orderInfo.track_number || null,
            notes: orderInfo.notes || null,
            customer_items: customerItems
          }
        })
      });

      if (!response.ok) throw new Error('Failed to update order');
      
      toast.success('Заказ обновлен');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Ошибка при обновлении заказа');
      console.error(error);
    }
  };

  const handleCreateOrder = async () => {
    if (!validateOrderInfo()) {
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
              client_id: null,
              order_date: orderInfo.order_date,
              status: 'pending',
              attachments: uploadedFiles,
              customer_items: customerItems
            },
            stages: [],
            customs_points: []
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const result = await response.json();
      
      setOrderCreated(true);
      setCreatedOrderId(result.order_id);
      toast.success('Заказ создан! Теперь добавьте этапы');
    } catch (error) {
      toast.error('Ошибка при создании заказа');
      console.error(error);
    }
  };

  const handleSaveOrderOnly = async () => {
    if (uploadedFiles.length > 0) {
      const filesInfo = uploadedFiles.map(f => `${f.name}: ${f.url}`).join('\n');
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_order_note',
          order_id: createdOrderId,
          note: `Прикрепленные файлы:\n${filesInfo}`
        })
      });
    }

    toast.success('Заказ сохранен без этапов');
    onSuccess();
    onClose();
  };

  const handleAddStages = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStages()) {
      toast.error('Заполните все обязательные поля этапов');
      return;
    }

    try {
      for (const stage of stages) {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_order_stage',
            order_id: createdOrderId,
            stage: {
              stage_number: stage.stage_number,
              vehicle_id: parseInt(stage.vehicle_id),
              driver_id: parseInt(stage.driver_id),
              from_location: stage.from_location,
              to_location: stage.to_location,
              notes: `Инвойс: ${orderInfo.invoice || '-'}, Трак: ${orderInfo.track_number || '-'}, Характер груза: ${orderInfo.cargo_type || '-'}, Вес: ${orderInfo.cargo_weight || '-'}, Примечание: ${orderInfo.notes || '-'}${stage.notes ? ', ' + stage.notes : ''}`
            }
          })
        });

        for (const customs of stage.customs) {
          if (customs.customs_name?.trim()) {
            await fetch(API_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'add_customs_point',
                order_id: createdOrderId,
                customs: {
                  customs_name: customs.customs_name,
                  country: '',
                  crossing_date: null,
                  notes: ''
                }
              })
            });
          }
        }
      }

      if (uploadedFiles.length > 0) {
        const filesInfo = uploadedFiles.map(f => `${f.name}: ${f.url}`).join('\n');
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_order_note',
            order_id: createdOrderId,
            note: `Прикрепленные файлы:\n${filesInfo}`
          })
        });
      }

      toast.success('Этапы добавлены');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Ошибка при добавлении этапов');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editOrder ? `Редактирование заказа ${orderInfo.order_number}` : 'Новый заказ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddStages} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Информация о заказе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Номер заказа *</Label>
                  <Input
                    value={orderInfo.order_number}
                    onChange={(e) => setOrderInfo({ ...orderInfo, order_number: e.target.value })}
                    className={errors.order_number ? 'border-red-500' : ''}
                    placeholder="2024-001"
                    disabled={orderCreated && !editOrder}
                  />
                  {errors.order_number && <p className="text-red-500 text-xs mt-1">{errors.order_number}</p>}
                </div>

                <div>
                  <Label>Дата заказа *</Label>
                  <DateInput
                    value={orderInfo.order_date && orderInfo.order_date.match(/^\d{4}-\d{2}-\d{2}$/) 
                      ? orderInfo.order_date.split('-').reverse().join('-')
                      : orderInfo.order_date}
                    onChange={(val) => {
                      const match = val.match(/^(\d{2})-(\d{2})-(\d{4})$/);
                      if (match) {
                        setOrderInfo({ ...orderInfo, order_date: `${match[3]}-${match[2]}-${match[1]}` });
                      } else {
                        setOrderInfo({ ...orderInfo, order_date: val });
                      }
                    }}
                    className={errors.order_date ? 'border-red-500' : ''}
                    disabled={orderCreated && !editOrder}
                  />
                  {errors.order_date && <p className="text-red-500 text-xs mt-1">{errors.order_date}</p>}
                </div>
              </div>

              <div>
                <Label>Маршрут</Label>
                <Input
                  value={autoRoute}
                  disabled
                  placeholder="Формируется автоматически из этапов"
                  className="bg-gray-50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Заказчики *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomerItem}
                    disabled={orderCreated && !editOrder}
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    Добавить заказчика
                  </Button>
                </div>
                <div className="space-y-3">
                  {customerItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Select 
                          value={item.customer_id} 
                          onValueChange={(val) => updateCustomerItem(index, 'customer_id', val)}
                          disabled={orderCreated && !editOrder}
                        >
                          <SelectTrigger className={errors[`customer_${index}_id`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Выберите заказчика" />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.nickname} - {customer.company_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`customer_${index}_id`] && <p className="text-red-500 text-xs mt-1">{errors[`customer_${index}_id`]}</p>}
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Примечание (7 тонн, 5 паллет)"
                          value={item.note}
                          onChange={(e) => updateCustomerItem(index, 'note', e.target.value)}
                          disabled={orderCreated && !editOrder}
                        />
                      </div>
                      {customerItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomerItem(index)}
                          disabled={orderCreated && !editOrder}
                        >
                          <Icon name="Trash2" size={16} className="text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Инвойс</Label>
                  <Input
                    value={orderInfo.invoice}
                    onChange={(e) => setOrderInfo({ ...orderInfo, invoice: e.target.value })}
                    placeholder="INV-2024-001"
                    disabled={orderCreated && !editOrder}
                  />
                </div>

                <div>
                  <Label>Трак</Label>
                  <Input
                    value={orderInfo.track_number}
                    onChange={(e) => setOrderInfo({ ...orderInfo, track_number: e.target.value })}
                    placeholder="TRACK123456"
                    disabled={orderCreated && !editOrder}
                  />
                </div>

                <div>
                  <Label>Характер груза</Label>
                  <Input
                    value={orderInfo.cargo_type}
                    onChange={(e) => setOrderInfo({ ...orderInfo, cargo_type: e.target.value })}
                    placeholder="Фрукты, овощи..."
                    disabled={orderCreated && !editOrder}
                  />
                </div>

                <div>
                  <Label>Вес груза (кг)</Label>
                  <Input
                    type="number"
                    value={orderInfo.cargo_weight}
                    onChange={(e) => setOrderInfo({ ...orderInfo, cargo_weight: e.target.value })}
                    placeholder="20000"
                    disabled={orderCreated && !editOrder}
                  />
                </div>
              </div>

              <div>
                <Label>Примечание</Label>
                <Textarea
                  value={orderInfo.notes}
                  onChange={(e) => setOrderInfo({ ...orderInfo, notes: e.target.value })}
                  placeholder="Дополнительная информация о заказе..."
                  rows={3}
                  disabled={orderCreated}
                />
              </div>

              <div>
                <Label>Прикрепить файлы (накладные, заявки)</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading || orderCreated}
                    className="cursor-pointer"
                  />
                  {uploading && <p className="text-sm text-blue-500 mt-2">Загрузка...</p>}
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Загруженные файлы:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded border">
                          <Icon name="File" size={16} className="text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          {!orderCreated && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(idx)}
                              className="h-6 w-6 p-0"
                            >
                              <Icon name="X" size={14} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!orderCreated && (
                <Button type="button" onClick={handleCreateOrder} className="w-full">
                  Создать заказ
                </Button>
              )}
            </CardContent>
          </Card>

          {orderCreated && (
            <>
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
                    <div className="space-y-4">
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
                          <Label>Водитель *</Label>
                          <Input
                            value={stage.driver_id ? drivers.find(d => d.id === parseInt(stage.driver_id))?.full_name || '' : ''}
                            disabled
                            placeholder="Автоматически"
                            className="bg-gray-50"
                          />
                          {errors[`stage_${idx}_driver`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_driver`]}</p>}
                        </div>

                        <div>
                          <Label>Телефон водителя</Label>
                          <Input
                            value={stage.driver_phone}
                            disabled
                            placeholder="Автоматически"
                            className="bg-gray-50"
                          />
                        </div>

                        <div>
                          <Label>Дополнительный телефон</Label>
                          <Input
                            value={stage.driver_additional_phone}
                            disabled
                            placeholder="Автоматически"
                            className="bg-gray-50"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label>Примечания этапа</Label>
                          <Input
                            value={stage.notes}
                            onChange={(e) => updateStage(stage.id, 'notes', e.target.value)}
                            placeholder="Дополнительная информация"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Таможни</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomsToStage(stage.id)}
                          >
                            <Icon name="Plus" size={14} className="mr-1" />
                            Добавить таможню
                          </Button>
                        </div>
                        {stage.customs.length > 0 && (
                          <div className="space-y-2">
                            {stage.customs.map((customs, customsIdx) => (
                              <div key={customs.id} className="flex gap-2 items-center">
                                <Input
                                  value={customs.customs_name}
                                  onChange={(e) => updateCustomsInStage(stage.id, customs.id, e.target.value)}
                                  placeholder="Торфяновка"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCustomsFromStage(stage.id, customs.id)}
                                >
                                  <Icon name="Trash2" size={16} className="text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {stage.customs.length === 0 && (
                          <p className="text-sm text-gray-500 italic">Таможни не добавлены</p>
                        )}
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
                <Button type="button" variant="outline" onClick={onClose}>
                  Отмена
                </Button>
                <Button type="button" variant="secondary" onClick={handleSaveOrderOnly} className="flex-1">
                  Сохранить без этапов
                </Button>
                <Button type="submit" className="flex-1">
                  Добавить этапы
                </Button>
              </div>
            </>
          )}

          {!orderCreated && (
            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              {editOrder ? (
                <>
                  <Button type="button" onClick={handleUpdateOrder} className="flex-1">
                    Сохранить изменения
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setOrderCreated(true);
                    }}
                    className="flex-1"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить этапы
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={handleCreateOrder} className="flex-1">
                  Создать заказ
                </Button>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}