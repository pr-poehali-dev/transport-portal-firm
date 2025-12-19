import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import OrderBasicInfo from './OrderForm/OrderBasicInfo';
import OrderFileUpload from './OrderForm/OrderFileUpload';
import OrderStageCard from './OrderForm/OrderStageCard';

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

        if (editOrder.stages && editOrder.stages.length > 0) {
          const mappedStages = editOrder.stages.map((stage: any, idx: number) => {
            const vehicle = vehicles.find(v => v.id === stage.vehicle_id);
            const driver = drivers.find(d => d.id === stage.driver_id);
            
            let plannedDeparture = '';
            if (stage.planned_departure) {
              const dateStr = stage.planned_departure.split(' ')[0];
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

  useEffect(() => {
    if (stages.length === 0) {
      setAutoRoute('');
      return;
    }

    const routeParts: string[] = [];
    
    stages.forEach((stage, idx) => {
      if (idx === 0 && stage.from_location) {
        routeParts.push(stage.from_location);
      }
      
      if (stage.waypoints && stage.waypoints.length > 0) {
        stage.waypoints
          .sort((a, b) => a.waypoint_order - b.waypoint_order)
          .forEach((waypoint) => {
            if (waypoint.location) {
              routeParts.push(waypoint.location);
            }
          });
      }
      
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
            cargo_type: orderInfo.cargo_type,
            cargo_weight: orderInfo.cargo_weight,
            invoice: orderInfo.invoice,
            track_number: orderInfo.track_number,
            notes: orderInfo.notes,
            customer_items: customerItems,
            client_id: orderInfo.client_id || null
          },
          stages: stages.map(stage => {
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
              customs_points: stage.customs.filter(c => c.customs_name?.trim()).map(c => ({
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

    if (stages.length === 0) {
      const addRoute = confirm('Добавить маршрут?');
      if (addRoute) {
        addStage();
        return;
      }
    }

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
      const stagesData = stages.map(stage => {
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
          <OrderBasicInfo
            orderInfo={orderInfo}
            direction={direction}
            autoRoute={autoRoute}
            customerItems={customerItems}
            customers={customers}
            errors={errors}
            editOrder={editOrder}
            onUpdateOrderInfo={(field, value) => setOrderInfo({ ...orderInfo, [field]: value })}
            onUpdateDirection={setDirection}
            onAddCustomerItem={addCustomerItem}
            onRemoveCustomerItem={removeCustomerItem}
            onUpdateCustomerItem={updateCustomerItem}
          />

          <OrderFileUpload
            uploadedFiles={uploadedFiles}
            uploading={uploading}
            editOrder={editOrder}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
          />

          {stages.map((stage, idx) => (
            <OrderStageCard
              key={stage.id}
              stage={stage}
              idx={idx}
              vehicles={vehicles}
              drivers={drivers}
              errors={errors}
              vehicleSearchOpen={vehicleSearchOpen}
              vehicleSearchQuery={vehicleSearchQuery}
              onUpdateStage={updateStage}
              onDeleteStage={handleDeleteStage}
              onAddWaypoint={addWaypointToStage}
              onRemoveWaypoint={removeWaypointFromStage}
              onUpdateWaypoint={updateWaypointField}
              onAddCustoms={addCustomsToStage}
              onRemoveCustoms={removeCustomsFromStage}
              onUpdateCustoms={updateCustomsInStage}
              onVehicleSearchOpenChange={(stageId, open) => {
                setVehicleSearchOpen({ ...vehicleSearchOpen, [stageId]: open });
                if (!open) setVehicleSearchQuery({ ...vehicleSearchQuery, [stageId]: '' });
              }}
              onVehicleSearchQueryChange={(stageId, query) => {
                setVehicleSearchQuery({ ...vehicleSearchQuery, [stageId]: query });
              }}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addStage}
            className="w-full"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить маршрут
          </Button>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Отмена
          </Button>
          <Button 
            onClick={editOrder ? handleUpdateOrder : handleCreateOrder} 
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Сохранение...' : (editOrder ? 'Сохранить изменения' : 'Создать заказ')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
