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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  userName?: string;
}

interface Customs {
  id: string;
  customs_name: string;
}

interface Waypoint {
  id: string;
  waypoint_order: number;
  location: string;
  waypoint_type: 'loading' | 'unloading';
  notes: string;
}

interface Stage {
  id: string;
  stage_number: number;
  from_location: string;
  to_location: string;
  planned_departure: string;
  vehicle_id: string;
  driver_id: string;
  driver_phone: string;
  driver_additional_phone: string;
  customs: Customs[];
  waypoints: Waypoint[];
  notes: string;
  saved?: boolean;
  started?: boolean;
}

interface UploadedFile {
  name: string;
  data: string;
  size: number;
  type: string;
}

export default function OrderForm({ open, onClose, onSuccess, editOrder, clients, customers, drivers, vehicles, userRole = 'Пользователь', userName = 'Пользователь' }: OrderFormProps) {
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
  
  const [direction, setDirection] = useState<string>('EU');
  const [orderSequence, setOrderSequence] = useState<string>('001');

  const [customerItems, setCustomerItems] = useState<CustomerItem[]>([{
    customer_id: '',
    note: ''
  }]);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [stages, setStages] = useState<Stage[]>([]);
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState<Record<string, boolean>>({});
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoRoute, setAutoRoute] = useState('');


  useEffect(() => {
    if (open && !editOrder) {
      generateOrderNumber();
    }
  }, [open]);



  const generateOrderNumber = async () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}${month}${year}`;
    
    try {
      const res = await fetch(`${API_URL}?resource=last_order_number&direction=${direction}&date=${dateStr}`);
      const data = await res.json();
      const nextNum = data.next_number || '001';
      setOrderSequence(nextNum);
      setOrderInfo(prev => ({ ...prev, order_number: `${direction}${dateStr}-${nextNum}` }));
    } catch (error) {
      console.error('Error generating order number:', error);
      setOrderSequence('001');
      setOrderInfo(prev => ({ ...prev, order_number: `${direction}${dateStr}-001` }));
    }
  };

  useEffect(() => {
    if (open && !editOrder) {
      generateOrderNumber();
    }
  }, [direction]);

  useEffect(() => {
    if (open) {
      if (editOrder) {
        console.log('Edit Order data:', editOrder);
        console.log('Edit Order stages:', editOrder.stages);
        console.log('Vehicles:', vehicles);
        console.log('Drivers:', drivers);
        
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
        
        if (editOrder.customer_items && editOrder.customer_items.length > 0) {
          setCustomerItems(editOrder.customer_items.map((ci: any) => ({
            customer_id: ci.customer_id?.toString() || '',
            note: ci.note || ''
          })));
        } else {
          setCustomerItems([{ customer_id: '', note: '' }]);
        }

        // Загружаем этапы из editOrder
        if (editOrder.stages && editOrder.stages.length > 0) {
          const mappedStages = editOrder.stages.map((stage: any, idx: number) => {
            const vehicle = vehicles.find(v => v.id === stage.vehicle_id);
            const driver = drivers.find(d => d.id === stage.driver_id);
            
            // Преобразуем дату из YYYY-MM-DD в DD-MM-YYYY для DateInput
            let plannedDeparture = '';
            if (stage.planned_departure) {
              const dateStr = stage.planned_departure.split(' ')[0]; // Убираем время если есть
              if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = dateStr.split('-');
                plannedDeparture = `${day}-${month}-${year}`;
              } else {
                plannedDeparture = dateStr;
              }
            }
            
            return {
              id: `existing_${stage.id}`,
              stage_number: stage.stage_number || idx + 1,
              from_location: stage.from_location || '',
              to_location: stage.to_location || '',
              planned_departure: plannedDeparture,
              vehicle_id: stage.vehicle_id?.toString() || '',
              driver_id: stage.driver_id?.toString() || '',
              driver_phone: driver?.phone || '',
              driver_additional_phone: driver?.additional_phone || '',
              customs: stage.customs_points ? stage.customs_points.map((cp: any) => ({
                id: cp.id?.toString() || Date.now().toString(),
                customs_name: cp.customs_name || ''
              })) : [],
              waypoints: stage.waypoints ? stage.waypoints.map((wp: any) => ({
                id: wp.id?.toString() || Date.now().toString(),
                waypoint_order: wp.waypoint_order || 0,
                location: wp.location || '',
                waypoint_type: wp.waypoint_type || 'loading',
                notes: wp.notes || ''
              })) : [],
              notes: stage.notes || '',
              saved: true
            };
          });
          setStages(mappedStages);
        } else {
          setStages([]);
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
        setCustomerItems([{ customer_id: '', note: '' }]);
        
        setStages([]);
      }
      
      setErrors({});
    }
  }, [open, editOrder, vehicles, drivers]);

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
      planned_departure: '',
      vehicle_id: '',
      driver_id: '',
      driver_phone: '',
      driver_additional_phone: '',
      customs: [],
      waypoints: [],
      notes: '',
      started: false
    };
    setStages([...stages, newStage]);
  };

  const removeStage = (id: string) => {
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

  const addWaypointToStage = (stageId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        const maxOrder = s.waypoints.length > 0 
          ? Math.max(...s.waypoints.map(w => w.waypoint_order))
          : 0;
        return {
          ...s,
          waypoints: [...s.waypoints, {
            id: Date.now().toString(),
            waypoint_order: maxOrder + 1,
            location: '',
            waypoint_type: 'loading' as const,
            notes: ''
          }]
        };
      }
      return s;
    }));
  };

  const removeWaypointFromStage = (stageId: string, waypointId: string) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          waypoints: s.waypoints.filter(w => w.id !== waypointId)
        };
      }
      return s;
    }));
  };

  const updateWaypointField = (stageId: string, waypointId: string, field: keyof Waypoint, value: any) => {
    setStages(stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          waypoints: s.waypoints.map(w => w.id === waypointId ? { ...w, [field]: value } : w)
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

  // Автоматическое формирование маршрута из этапов с промежуточными точками
  useEffect(() => {
    if (stages.length === 0) {
      setAutoRoute('');
      return;
    }

    const routeParts: string[] = [];
    
    stages.forEach((stage, idx) => {
      // Добавляем начальную точку первого этапа
      if (idx === 0 && stage.from_location) {
        routeParts.push(stage.from_location);
      }
      
      // Добавляем промежуточные точки этапа
      if (stage.waypoints && stage.waypoints.length > 0) {
        stage.waypoints
          .sort((a, b) => a.waypoint_order - b.waypoint_order)
          .forEach((waypoint) => {
            if (waypoint.location) {
              routeParts.push(waypoint.location);
            }
          });
      }
      
      // Добавляем конечную точку этапа
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
    if (!orderInfo.invoice?.trim()) newErrors.invoice = 'Обязательное поле';
    if (!orderInfo.track_number?.trim()) newErrors.track_number = 'Обязательное поле';
    if (!orderInfo.cargo_type?.trim()) newErrors.cargo_type = 'Обязательное поле';
    if (!orderInfo.cargo_weight?.trim()) newErrors.cargo_weight = 'Обязательное поле';
    
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
      if (!stage.planned_departure?.trim()) newErrors[`stage_${idx}_date`] = 'Укажите дату погрузки';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateOrder = async () => {
    if (!validateOrderInfo()) {
      toast.error('Заполните все обязательные поля заказа');
      return;
    }
    
    // Валидация маршрутов (если есть)
    if (stages.length > 0 && !validateStages()) {
      toast.error('Заполните все обязательные поля маршрутов');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_order',
          order_id: editOrder.id,
          user_role: userRole,
          user_name: userName,
          order: {
            order_number: orderInfo.order_number,
            order_date: orderInfo.order_date,
            status: editOrder.status || 'pending',
            client_id: editOrder.client_id || null,
            customer_items: customerItems,
            cargo_type: orderInfo.cargo_type || null,
            cargo_weight: orderInfo.cargo_weight || null,
            invoice: orderInfo.invoice || null,
            track_number: orderInfo.track_number || null,
            notes: orderInfo.notes || null
          },
          stages: stages.map(stage => {
            // Преобразуем дату из DD-MM-YYYY в YYYY-MM-DD
            let plannedDeparture = stage.planned_departure?.trim() || null;
            if (plannedDeparture && plannedDeparture.match(/^\d{2}-\d{2}-\d{4}$/)) {
              const [day, month, year] = plannedDeparture.split('-');
              plannedDeparture = `${year}-${month}-${day}`;
            }
            
            return {
              stage_number: stage.stage_number,
              from_location: stage.from_location,
              to_location: stage.to_location,
              planned_departure: plannedDeparture,
              vehicle_id: parseInt(stage.vehicle_id),
              driver_id: parseInt(stage.driver_id),
              customs_points: stage.customs.map(c => ({
                customs_name: c.customs_name
              })),
              waypoints: stage.waypoints.map(w => ({
                waypoint_order: w.waypoint_order,
                location: w.location,
                waypoint_type: w.waypoint_type,
                notes: w.notes || null
              })),
              notes: stage.notes
            };
          })
        })
      });

      const result = await response.json();
      console.log('Update order response:', response.status, result);
      
      if (!response.ok) {
        console.error('Failed to update order:', response.status, result);
        throw new Error(`Failed to update order: ${response.status}`);
      }
      
      toast.success('Заказ обновлен');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error?.message || 'Неизвестная ошибка';
      toast.error(`Ошибка при обновлении заказа: ${errorMsg}`);
      console.error('Update order error:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!validateOrderInfo()) {
      toast.error('Заполните все обязательные поля заказа');
      return;
    }

    // Если маршрутов нет, спросить пользователя
    if (stages.length === 0) {
      const addRoute = confirm('Добавить маршрут?');
      if (addRoute) {
        addStage();
        return;
      }
    }

    // Валидация этапов (только если они есть)
    if (stages.length > 0) {
      const stageErrors: Record<string, string> = {};
      stages.forEach((stage, idx) => {
        if (!stage.from_location?.trim()) stageErrors[`stage_${idx}_from`] = 'Обязательное поле';
        if (!stage.to_location?.trim()) stageErrors[`stage_${idx}_to`] = 'Обязательное поле';
        if (!stage.vehicle_id) stageErrors[`stage_${idx}_vehicle`] = 'Обязательное поле';
        if (!stage.driver_id) stageErrors[`stage_${idx}_driver`] = 'Выберите автомобиль с назначенным водителем';
        if (!stage.planned_departure?.trim()) stageErrors[`stage_${idx}_date`] = 'Укажите дату погрузки';
      });

      if (Object.keys(stageErrors).length > 0) {
        setErrors(stageErrors);
        toast.error('Заполните все обязательные поля этапов');
        return;
      }
    }

    setSaving(true);
    try {
      // Подготовка этапов (если есть)
      const stagesData = stages.map(stage => {
        // Преобразуем дату из DD-MM-YYYY в YYYY-MM-DD
        let plannedDeparture = stage.planned_departure?.trim() || null;
        if (plannedDeparture && plannedDeparture.match(/^\d{2}-\d{2}-\d{4}$/)) {
          const [day, month, year] = plannedDeparture.split('-');
          plannedDeparture = `${year}-${month}-${day}`;
        }
        
        return {
          stage_number: stage.stage_number,
          vehicle_id: parseInt(stage.vehicle_id),
          driver_id: parseInt(stage.driver_id),
          from_location: stage.from_location,
          to_location: stage.to_location,
          planned_departure: plannedDeparture,
          waypoints: stage.waypoints.map(w => ({
            waypoint_order: w.waypoint_order,
            location: w.location,
            waypoint_type: w.waypoint_type,
            notes: w.notes || null
          })),
          notes: stage.notes || ''
        };
      });

      // Подготовка таможен
      const customsData: any[] = [];
      stages.forEach(stage => {
        stage.customs.forEach(customs => {
          if (customs.customs_name?.trim()) {
            customsData.push({
              customs_name: customs.customs_name,
              country: '',
              crossing_date: null,
              notes: ''
            });
          }
        });
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_multi_stage_order',
          user_role: userRole,
          user_name: userName,
          data: {
            order: {
              order_number: orderInfo.order_number,
              client_id: null,
              order_date: orderInfo.order_date,
              status: 'pending',
              attachments: uploadedFiles,
              customer_items: customerItems,
              cargo_type: orderInfo.cargo_type || null,
              cargo_weight: orderInfo.cargo_weight || null,
              invoice: orderInfo.invoice || null,
              track_number: orderInfo.track_number || null,
              notes: orderInfo.notes || null
            },
            stages: stagesData,
            customs_points: customsData
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      toast.success('Заказ успешно создан!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Ошибка при создании заказа');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const hasData = orderInfo.order_number || customerItems.some(c => c.customer_id) || stages.some(s => s.from_location || s.to_location);
    
    if (hasData && !editOrder) {
      const confirmed = confirm('Данные заказа будут потеряны. Закрыть форму?');
      if (!confirmed) return;
    }
    
    onClose();
  };

  const handleDeleteStage = (stageId: string) => {
    setStages(stages.filter(s => s.id !== stageId).map((s, idx) => ({ ...s, stage_number: idx + 1 })));
    toast.success('Маршрут удалён');
  };





  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editOrder ? `Редактирование заказа ${orderInfo.order_number}` : 'Новый заказ'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Информация о заказе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Маршрут</Label>
                <Input
                  value={autoRoute}
                  disabled
                  placeholder="Формируется автоматически из этапов"
                  className="bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Номер заказа *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={direction} 
                      onValueChange={(val) => setDirection(val)}
                      disabled={false || !!editOrder}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EU">EU</SelectItem>
                        <SelectItem value="RF">RF</SelectItem>
                        <SelectItem value="CH">CH</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={orderInfo.order_number}
                      onChange={(e) => setOrderInfo({ ...orderInfo, order_number: e.target.value })}
                      className={errors.order_number ? 'border-red-500 flex-1' : 'flex-1'}
                      placeholder="EU17122024-001"
                      disabled={false || !!editOrder}
                    />
                  </div>
                  {errors.order_number && <p className="text-red-500 text-xs mt-1">{errors.order_number}</p>}
                </div>

                <div>
                  <Label className="text-sm">Дата заказа *</Label>
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
                    disabled={!!editOrder}
                  />
                  {errors.order_date && <p className="text-red-500 text-xs mt-1">{errors.order_date}</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Заказчики *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomerItem}
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    Добавить
                  </Button>
                </div>
                <div className="space-y-2">
                  {customerItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Select 
                          value={item.customer_id} 
                          onValueChange={(val) => updateCustomerItem(index, 'customer_id', val)}
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
                        />
                      </div>
                      {customerItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomerItem(index)}
                        >
                          <Icon name="Trash2" size={16} className="text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Инвойс *</Label>
                  <Input
                    value={orderInfo.invoice}
                    onChange={(e) => setOrderInfo({ ...orderInfo, invoice: e.target.value })}
                    placeholder="INV-2024-001"
                    disabled={!!editOrder}
                    className={errors.invoice ? 'border-red-500' : ''}
                    required
                  />
                  {errors.invoice && <p className="text-red-500 text-xs mt-1">{errors.invoice}</p>}
                </div>

                <div>
                  <Label className="text-sm">Трак *</Label>
                  <Input
                    value={orderInfo.track_number}
                    onChange={(e) => setOrderInfo({ ...orderInfo, track_number: e.target.value })}
                    placeholder="TRACK123456"
                    disabled={!!editOrder}
                    className={errors.track_number ? 'border-red-500' : ''}
                    required
                  />
                  {errors.track_number && <p className="text-red-500 text-xs mt-1">{errors.track_number}</p>}
                </div>

                <div>
                  <Label className="text-sm">Характер груза *</Label>
                  <Input
                    value={orderInfo.cargo_type}
                    onChange={(e) => setOrderInfo({ ...orderInfo, cargo_type: e.target.value })}
                    placeholder="Лук, Нобилис"
                    disabled={!!editOrder}
                    className={errors.cargo_type ? 'border-red-500' : ''}
                    required
                  />
                  {errors.cargo_type && <p className="text-red-500 text-xs mt-1">{errors.cargo_type}</p>}
                </div>

                <div>
                  <Label className="text-sm">Вес груза (кг) *</Label>
                  <Input
                    type="text"
                    value={orderInfo.cargo_weight}
                    onChange={(e) => setOrderInfo({ ...orderInfo, cargo_weight: e.target.value })}
                    placeholder="20000"
                    disabled={!!editOrder}
                    className={errors.cargo_weight ? 'border-red-500' : ''}
                    required
                  />
                  {errors.cargo_weight && <p className="text-red-500 text-xs mt-1">{errors.cargo_weight}</p>}
                </div>
              </div>

              <div>
                <Label className="text-sm">Примечание</Label>
                <Textarea
                  value={orderInfo.notes}
                  onChange={(e) => setOrderInfo({ ...orderInfo, notes: e.target.value })}
                  placeholder="Дополнительная информация о заказе..."
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sm">Прикрепить файлы (накладные, заявки)</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading || !!editOrder}
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
                          {!editOrder && (
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

            </CardContent>
          </Card>

          {/* Этапы маршрута */}
          <>
              {stages.map((stage, idx) => (
                <Card key={stage.id} className="relative">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                    <CardTitle className="text-base">Маршрут {stage.stage_number}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStage(stage.id)}
                      className="text-red-500"
                      disabled={stage.started}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Дата погрузки *</Label>
                        <DateInput
                          value={stage.planned_departure}
                          onChange={(value) => updateStage(stage.id, 'planned_departure', value)}
                          disabled={stage.started}
                          className={errors[`stage_${idx}_date`] ? 'border-red-500' : ''}
                        />
                        {errors[`stage_${idx}_date`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_date`]}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Откуда *</Label>
                          <Input
                            value={stage.from_location}
                            onChange={(e) => updateStage(stage.id, 'from_location', e.target.value)}
                            className={errors[`stage_${idx}_from`] ? 'border-red-500' : ''}
                            placeholder="Москва"
            
                          />
                          {errors[`stage_${idx}_from`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_from`]}</p>}
                        </div>

                        <div>
                          <Label className="text-sm">Куда *</Label>
                          <Input
                            value={stage.to_location}
                            onChange={(e) => updateStage(stage.id, 'to_location', e.target.value)}
                            className={errors[`stage_${idx}_to`] ? 'border-red-500' : ''}
                            placeholder="Санкт-Петербург"
            
                          />
                          {errors[`stage_${idx}_to`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_to`]}</p>}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Промежуточные точки погрузки/разгрузки</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addWaypointToStage(stage.id)}
                          >
                            <Icon name="Plus" size={14} className="mr-1" />
                            Добавить
                          </Button>
                        </div>
                        {stage.waypoints.length > 0 && (
                          <div className="space-y-2">
                            {stage.waypoints.map((waypoint) => (
                              <div key={waypoint.id} className="p-3 border rounded-lg space-y-3 bg-gray-50">
                                <div className="flex gap-2 items-start">
                                  <div className="w-40">
                                    <Label className="text-xs mb-1 block">Тип</Label>
                                    <Select 
                                      value={waypoint.waypoint_type} 
                                      onValueChange={(val) => updateWaypointField(stage.id, waypoint.id, 'waypoint_type', val)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="loading">Погрузка</SelectItem>
                                        <SelectItem value="unloading">Разгрузка</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-xs mb-1 block">Город</Label>
                                    <Input
                                      value={waypoint.location}
                                      onChange={(e) => updateWaypointField(stage.id, waypoint.id, 'location', e.target.value)}
                                      placeholder="Название города"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeWaypointFromStage(stage.id, waypoint.id)}
                                    className="mt-5"
                                  >
                                    <Icon name="Trash2" size={16} className="text-red-500" />
                                  </Button>
                                </div>
                                <div>
                                  <Label className="text-xs mb-1 block">Примечание</Label>
                                  <Input
                                    value={waypoint.notes}
                                    onChange={(e) => updateWaypointField(stage.id, waypoint.id, 'notes', e.target.value)}
                                    placeholder="Доп. информация"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {stage.waypoints.length === 0 && (
                          <p className="text-sm text-gray-500 italic">Промежуточные точки не добавлены</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Таможня</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addCustomsToStage(stage.id)}
                          >
                            <Icon name="Plus" size={14} className="mr-1" />
                            Добавить
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
                          <p className="text-sm text-gray-500 italic">Таможня не добавлена</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Автомобиль *</Label>
                          <Popover open={vehicleSearchOpen[stage.id]} onOpenChange={(open) => {
                            setVehicleSearchOpen({ ...vehicleSearchOpen, [stage.id]: open });
                            if (!open) setVehicleSearchQuery({ ...vehicleSearchQuery, [stage.id]: '' });
                          }}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                
                                className={`w-full justify-between ${errors[`stage_${idx}_vehicle`] ? 'border-red-500' : ''}`}
                              >
                                {stage.vehicle_id ? (() => {
                                  const vehicle = vehicles.find(v => v.id.toString() === stage.vehicle_id);
                                  if (!vehicle) return 'Выберите автомобиль';
                                  const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                                  return `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`;
                                })() : 'Выберите автомобиль'}
                                <Icon name="ChevronsUpDown" size={16} className="ml-2 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                              <div className="p-2 border-b">
                                <Input
                                  placeholder="Поиск автомобиля..."
                                  value={vehicleSearchQuery[stage.id] || ''}
                                  onChange={(e) => setVehicleSearchQuery({ ...vehicleSearchQuery, [stage.id]: e.target.value })}
                                  className="h-9"
                                />
                              </div>
                              <div className="max-h-[300px] overflow-y-auto p-1">
                                {vehicles
                                  .filter(vehicle => {
                                    const query = (vehicleSearchQuery[stage.id] || '').toLowerCase();
                                    if (!query) return true;
                                    const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                                    const displayText = `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`.toLowerCase();
                                    return displayText.includes(query);
                                  })
                                  .map((vehicle) => {
                                    const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                                    const displayText = `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`;
                                    const isSelected = stage.vehicle_id === vehicle.id.toString();
                                    return (
                                      <div
                                        key={vehicle.id}
                                        onClick={() => {
                                          updateStage(stage.id, 'vehicle_id', vehicle.id.toString());
                                          setVehicleSearchOpen({ ...vehicleSearchOpen, [stage.id]: false });
                                        }}
                                        className={`flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent ${
                                          isSelected ? 'bg-accent' : ''
                                        }`}
                                      >
                                        <Icon 
                                          name="Check" 
                                          size={16}
                                          className={`mr-2 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                        {displayText}
                                      </div>
                                    );
                                  })}
                                {vehicles.filter(vehicle => {
                                  const query = (vehicleSearchQuery[stage.id] || '').toLowerCase();
                                  if (!query) return false;
                                  const trailerPart = vehicle.trailer_plate ? ` / ${vehicle.trailer_plate}` : '';
                                  const displayText = `${vehicle.vehicle_brand || vehicle.model} ${vehicle.license_plate}${trailerPart}`.toLowerCase();
                                  return displayText.includes(query);
                                }).length === 0 && vehicleSearchQuery[stage.id] && (
                                  <div className="py-6 text-center text-sm text-muted-foreground">
                                    Автомобиль не найден
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
                          {errors[`stage_${idx}_vehicle`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_vehicle`]}</p>}
                        </div>

                        <div>
                          <Label className="text-sm">Водитель *</Label>
                          <Input
                            value={stage.driver_id ? (() => {
                              const driver = drivers.find(d => d.id === parseInt(stage.driver_id));
                              return driver ? `${driver.last_name} ${driver.first_name} ${driver.middle_name}`.trim() : '';
                            })() : ''}
                            disabled
                            placeholder="Автоматически"
                            className="bg-gray-50"
                          />
                          {errors[`stage_${idx}_driver`] && <p className="text-red-500 text-xs mt-1">{errors[`stage_${idx}_driver`]}</p>}
                        </div>

                        <div>
                          <Label className="text-sm">Телефон водителя</Label>
                          <Input
                            value={stage.driver_phone}
                            disabled
                            placeholder="Автоматически"
                            className="bg-gray-50"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Доп. телефон</Label>
                          <Input
                            value={stage.driver_additional_phone}
                            disabled
                            placeholder="Автоматически"
                            className="bg-gray-50"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="text-sm">Примечания этапа</Label>
                          <Input
                            value={stage.notes}
                            onChange={(e) => updateStage(stage.id, 'notes', e.target.value)}
                            placeholder="Дополнительная информация"
                          />
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-3">
                <Button type="button" onClick={addStage} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить маршрут
                </Button>
              </div>
          </>
        </div>

        {/* Закрепленные кнопки внизу */}
        <div className="flex gap-3 pt-4 border-t mt-auto shrink-0">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          {!editOrder ? (
            <Button type="button" onClick={handleCreateOrder} className="flex-1" disabled={saving}>
              {saving ? 'Сохранение...' : 'Создать заказ'}
            </Button>
          ) : (
            <Button type="button" onClick={handleUpdateOrder} className="flex-1">
              Сохранить изменения
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}