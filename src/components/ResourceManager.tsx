import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/ui/phone-input';
import DateInput from '@/components/ui/date-input';
import LicensePlateInput from '@/components/ui/license-plate-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface ResourceManagerProps {
  type: 'drivers' | 'vehicles' | 'clients';
  data: any[];
  drivers?: any[];
  clients?: any[];
  onRefresh: () => void;
}

export default function ResourceManager({ type, data, drivers = [], clients = [], onRefresh }: ResourceManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getEmptyForm = () => {
    switch (type) {
      case 'drivers':
        return { 
          last_name: '', 
          first_name: '', 
          middle_name: '', 
          phone: '', 
          additional_phone: '',
          passport_series: '',
          passport_number: '',
          passport_issued_by: '',
          passport_issue_date: '',
          license_series: '',
          license_number: '', 
          license_issued_by: '',
          license_issue_date: ''
        };
      case 'vehicles':
        return { 
          vehicle_type: '', 
          vehicle_brand: '', 
          license_plate: '', 
          trailer_plate: '', 
          body_type: '', 
          company_name: '', 
          driver_id: null,
          display_name: ''
        };
      case 'clients':
        return { name: '', contact_person: '', phone: '', email: '', address: '' };
    }
  };

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
      if (editItem.driver_id && drivers) {
        const driver = drivers.find(d => d.id === editItem.driver_id);
        setSelectedDriver(driver);
      }
    } else {
      setFormData(getEmptyForm());
      setSelectedDriver(null);
    }
    setErrors({});
  }, [editItem, showForm]);

  useEffect(() => {
    if (type === 'vehicles') {
      const displayName = [
        formData.vehicle_brand,
        formData.license_plate,
        formData.trailer_plate ? `+ ${formData.trailer_plate}` : ''
      ].filter(Boolean).join(' ');
      if (displayName !== formData.display_name) {
        setFormData({ ...formData, display_name: displayName });
      }
    }
  }, [formData.vehicle_brand, formData.license_plate, formData.trailer_plate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (type === 'drivers') {
      if (!formData.last_name?.trim()) newErrors.last_name = 'Обязательное поле';
      if (!formData.first_name?.trim()) newErrors.first_name = 'Обязательное поле';
      if (!formData.phone?.trim()) newErrors.phone = 'Обязательное поле';
      if (!formData.passport_series?.trim()) newErrors.passport_series = 'Обязательное поле';
      if (!formData.passport_number?.trim()) newErrors.passport_number = 'Обязательное поле';
      if (!formData.passport_issued_by?.trim()) newErrors.passport_issued_by = 'Обязательное поле';
      if (!formData.passport_issue_date) newErrors.passport_issue_date = 'Обязательное поле';
      if (!formData.license_series?.trim()) newErrors.license_series = 'Обязательное поле';
      if (!formData.license_number?.trim()) newErrors.license_number = 'Обязательное поле';
      if (!formData.license_issued_by?.trim()) newErrors.license_issued_by = 'Обязательное поле';
      if (!formData.license_issue_date) newErrors.license_issue_date = 'Обязательное поле';
    } else if (type === 'vehicles') {
      if (!formData.vehicle_type) newErrors.vehicle_type = 'Обязательное поле';
      if (!formData.vehicle_brand?.trim()) newErrors.vehicle_brand = 'Обязательное поле';
      if (!formData.license_plate?.trim()) newErrors.license_plate = 'Обязательное поле';
      if (!formData.body_type) newErrors.body_type = 'Обязательное поле';
      if (!formData.company_name?.trim()) newErrors.company_name = 'Обязательное поле';
      if (!formData.driver_id) newErrors.driver_id = 'Обязательное поле';
    } else if (type === 'clients') {
      if (!formData.name?.trim()) newErrors.name = 'Обязательное поле';
      if (!formData.phone?.trim()) newErrors.phone = 'Обязательное поле';
    }
    
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
      if (editItem) {
        const response = await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: type.slice(0, -1),
            id: editItem.id,
            data: formData
          })
        });

        if (!response.ok) throw new Error('Failed to update');
        toast.success('Изменения сохранены');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `create_${type.slice(0, -1)}`,
            data: formData
          })
        });

        if (!response.ok) throw new Error('Failed to create');
        toast.success('Запись создана');
      }

      setShowForm(false);
      setEditItem(null);
      setErrors({});
      onRefresh();
    } catch (error) {
      toast.error('Ошибка при сохранении');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить запись?')) return;

    try {
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: type.slice(0, -1),
          id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка при удалении');
        return;
      }
      
      toast.success('Запись удалена');
      onRefresh();
    } catch (error) {
      toast.error('Ошибка при удалении');
      console.error(error);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'drivers': return 'Водители';
      case 'vehicles': return 'Автомобили';
      case 'clients': return 'Перевозчик';
    }
  };

  const renderTable = () => {
    if (type === 'drivers') {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">ФИО</TableHead>
                <TableHead className="min-w-[140px]">Телефон</TableHead>
                <TableHead className="min-w-[180px]">Водительское удостоверение</TableHead>
                <TableHead className="text-right min-w-[120px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {[item.last_name, item.first_name, item.middle_name].filter(Boolean).join(' ')}
                  </TableCell>
                  <TableCell className="text-sm">{item.phone}</TableCell>
                  <TableCell className="text-sm">
                    {[item.license_series, item.license_number].filter(Boolean).join(' ')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditItem(item);
                          setShowForm(true);
                        }}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (type === 'vehicles') {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Гос. номер</TableHead>
                <TableHead className="min-w-[150px]">Модель</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">Грузоподъемность</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Статус</TableHead>
                <TableHead className="text-right min-w-[120px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm">{item.license_plate}</TableCell>
                  <TableCell className="text-sm">{item.model || item.vehicle_brand}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{item.capacity}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                      {item.status === 'available' ? 'Доступен' : 'В рейсе'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditItem(item);
                          setShowForm(true);
                        }}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (type === 'clients') {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Название перевозчика</TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">Контактное лицо</TableHead>
                <TableHead className="min-w-[120px]">Телефон</TableHead>
                <TableHead className="min-w-[150px] hidden lg:table-cell">Email</TableHead>
                <TableHead className="text-right min-w-[120px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{item.contact_person}</TableCell>
                  <TableCell className="text-sm">{item.phone}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{item.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditItem(item);
                          setShowForm(true);
                        }}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
  };

  const renderForm = () => {
    if (type === 'drivers') {
      return (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Фамилия *</Label>
              <Input
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
            <div>
              <Label>Имя *</Label>
              <Input
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <Label>Отчество</Label>
              <Input
                value={formData.middle_name || ''}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <Label>Номер телефона *</Label>
            <PhoneInput
              value={formData.phone || ''}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label>Дополнительный телефон</Label>
            <PhoneInput
              value={formData.additional_phone || ''}
              onChange={(value) => setFormData({ ...formData, additional_phone: value })}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="CreditCard" size={18} />
              Паспорт
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Серия *</Label>
                <Input
                  value={formData.passport_series || ''}
                  onChange={(e) => setFormData({ ...formData, passport_series: e.target.value })}
                  placeholder="1234 или AB"
                  className={errors.passport_series ? 'border-red-500' : ''}
                />
                {errors.passport_series && <p className="text-red-500 text-xs mt-1">{errors.passport_series}</p>}
              </div>
              <div>
                <Label>Номер *</Label>
                <Input
                  value={formData.passport_number || ''}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  placeholder="567890 или 12345678"
                  className={errors.passport_number ? 'border-red-500' : ''}
                />
                {errors.passport_number && <p className="text-red-500 text-xs mt-1">{errors.passport_number}</p>}
              </div>
            </div>
            <div className="mt-4">
              <Label>Кем выдан *</Label>
              <Input
                value={formData.passport_issued_by || ''}
                onChange={(e) => setFormData({ ...formData, passport_issued_by: e.target.value })}
                className={errors.passport_issued_by ? 'border-red-500' : ''}
              />
              {errors.passport_issued_by && <p className="text-red-500 text-xs mt-1">{errors.passport_issued_by}</p>}
            </div>
            <div className="mt-4">
              <Label>Дата выдачи *</Label>
              <div className="flex gap-2">
                <DateInput
                  value={(() => {
                    if (!formData.passport_issue_date) return '';
                    if (formData.passport_issue_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      const date = new Date(formData.passport_issue_date);
                      if (!isNaN(date.getTime())) {
                        return format(date, 'dd-MM-yyyy');
                      }
                    }
                    return formData.passport_issue_date;
                  })()}
                  onChange={(val) => {
                    const match = val.match(/^(\d{2})-(\d{2})-(\d{4})$/);
                    if (match) {
                      setFormData({ ...formData, passport_issue_date: `${match[3]}-${match[2]}-${match[1]}` });
                    } else {
                      setFormData({ ...formData, passport_issue_date: val });
                    }
                  }}
                  maxDate="today"
                  className={errors.passport_issue_date ? 'border-red-500' : ''}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Icon name="Calendar" size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
                        if (!formData.passport_issue_date || !formData.passport_issue_date.match(/^\d{4}-\d{2}-\d{2}$/)) return undefined;
                        const date = new Date(formData.passport_issue_date);
                        return isNaN(date.getTime()) ? undefined : date;
                      })()}
                      onSelect={(date) => setFormData({ ...formData, passport_issue_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                      locale={ru}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.passport_issue_date && <p className="text-red-500 text-xs mt-1">{errors.passport_issue_date}</p>}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Car" size={18} />
              Водительское удостоверение
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Серия *</Label>
                <Input
                  value={formData.license_series || ''}
                  onChange={(e) => setFormData({ ...formData, license_series: e.target.value })}
                  placeholder="12 АА"
                  className={errors.license_series ? 'border-red-500' : ''}
                />
                {errors.license_series && <p className="text-red-500 text-xs mt-1">{errors.license_series}</p>}
              </div>
              <div>
                <Label>Номер *</Label>
                <Input
                  value={formData.license_number || ''}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="123456"
                  className={errors.license_number ? 'border-red-500' : ''}
                />
                {errors.license_number && <p className="text-red-500 text-xs mt-1">{errors.license_number}</p>}
              </div>
            </div>
            <div className="mt-4">
              <Label>Кем выдан *</Label>
              <Input
                value={formData.license_issued_by || ''}
                onChange={(e) => setFormData({ ...formData, license_issued_by: e.target.value })}
                className={errors.license_issued_by ? 'border-red-500' : ''}
              />
              {errors.license_issued_by && <p className="text-red-500 text-xs mt-1">{errors.license_issued_by}</p>}
            </div>
            <div className="mt-4">
              <Label>Дата выдачи *</Label>
              <div className="flex gap-2">
                <DateInput
                  value={(() => {
                    if (!formData.license_issue_date) return '';
                    if (formData.license_issue_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      const date = new Date(formData.license_issue_date);
                      if (!isNaN(date.getTime())) {
                        return format(date, 'dd-MM-yyyy');
                      }
                    }
                    return formData.license_issue_date;
                  })()}
                  onChange={(val) => {
                    const match = val.match(/^(\d{2})-(\d{2})-(\d{4})$/);
                    if (match) {
                      setFormData({ ...formData, license_issue_date: `${match[3]}-${match[2]}-${match[1]}` });
                    } else {
                      setFormData({ ...formData, license_issue_date: val });
                    }
                  }}
                  maxDate="today"
                  className={errors.license_issue_date ? 'border-red-500' : ''}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Icon name="Calendar" size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
                        if (!formData.license_issue_date || !formData.license_issue_date.match(/^\d{4}-\d{2}-\d{2}$/)) return undefined;
                        const date = new Date(formData.license_issue_date);
                        return isNaN(date.getTime()) ? undefined : date;
                      })()}
                      onSelect={(date) => setFormData({ ...formData, license_issue_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                      locale={ru}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {errors.license_issue_date && <p className="text-red-500 text-xs mt-1">{errors.license_issue_date}</p>}
            </div>
          </div>

        </>
      );
    }

    if (type === 'vehicles') {
      return (
        <>
          <div>
            <Label>Транспорт</Label>
            <Input
              value={formData.display_name || ''}
              disabled
              placeholder="Формируется автоматически"
              className="bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Вид ТС *</Label>
              <Select value={formData.vehicle_type} onValueChange={(val) => setFormData({ ...formData, vehicle_type: val })}>
                <SelectTrigger className={errors.vehicle_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите вид" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Грузовой автомобиль</SelectItem>
                  <SelectItem value="tractor">Седельный тягач</SelectItem>
                  <SelectItem value="van">Фургон</SelectItem>
                  <SelectItem value="flatbed">Бортовой</SelectItem>
                </SelectContent>
              </Select>
              {errors.vehicle_type && <p className="text-red-500 text-xs mt-1">{errors.vehicle_type}</p>}
            </div>
            <div>
              <Label>Марка ТС *</Label>
              <Input
                value={formData.vehicle_brand || ''}
                onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                placeholder="Mercedes-Benz Actros"
                className={errors.vehicle_brand ? 'border-red-500' : ''}
              />
              {errors.vehicle_brand && <p className="text-red-500 text-xs mt-1">{errors.vehicle_brand}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Гос. номер *</Label>
              <LicensePlateInput
                value={formData.license_plate || ''}
                onChange={(value) => setFormData({ ...formData, license_plate: value })}
                placeholder="AB1234-5"
                className={errors.license_plate ? 'border-red-500' : ''}
              />
              {errors.license_plate && <p className="text-red-500 text-xs mt-1">{errors.license_plate}</p>}
            </div>
            <div>
              <Label>Прицеп</Label>
              <LicensePlateInput
                value={formData.trailer_plate || ''}
                onChange={(value) => setFormData({ ...formData, trailer_plate: value })}
                placeholder="AB1234"
              />
            </div>
          </div>

          <div>
            <Label>Тип кузова *</Label>
            <Select value={formData.body_type} onValueChange={(val) => setFormData({ ...formData, body_type: val })}>
              <SelectTrigger className={errors.body_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tent">Тент</SelectItem>
                <SelectItem value="refrigerator">Рефрижератор</SelectItem>
                <SelectItem value="isoterm">Изотерм</SelectItem>
                <SelectItem value="container">Контейнер</SelectItem>
                <SelectItem value="flatbed">Бортовой</SelectItem>
                <SelectItem value="tanker">Цистерна</SelectItem>
              </SelectContent>
            </Select>
            {errors.body_type && <p className="text-red-500 text-xs mt-1">{errors.body_type}</p>}
          </div>

          <div>
            <Label>Фирма ТК *</Label>
            <Select 
              value={formData.company_name || ''} 
              onValueChange={(val) => setFormData({ ...formData, company_name: val })}
            >
              <SelectTrigger className={errors.company_name ? 'border-red-500' : ''}>
                <SelectValue placeholder="Выберите перевозчика" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.name}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="User" size={18} />
              Водитель
            </h3>
            <div>
              <Label>Водитель *</Label>
              <Select 
                value={formData.driver_id?.toString() || ''} 
                onValueChange={(val) => {
                  const driverId = parseInt(val);
                  const driver = drivers.find(d => d.id === driverId);
                  setFormData({ ...formData, driver_id: driverId });
                  setSelectedDriver(driver);
                }}
              >
                <SelectTrigger className={errors.driver_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите водителя" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.last_name} {driver.first_name} {driver.middle_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.driver_id && <p className="text-red-500 text-xs mt-1">{errors.driver_id}</p>}
            </div>

            {selectedDriver && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
                <p className="font-semibold text-sm text-blue-900">Водительское удостоверение:</p>
                <div className="text-sm text-blue-800">
                  <p><strong>Серия:</strong> {selectedDriver.license_series || 'Не указана'}</p>
                  <p><strong>Номер:</strong> {selectedDriver.license_number || 'Не указан'}</p>
                  <p><strong>Дата выдачи:</strong> {selectedDriver.license_issue_date ? format(new Date(selectedDriver.license_issue_date), 'dd.MM.yyyy', { locale: ru }) : 'Не указана'}</p>
                  <p><strong>Кем выдано:</strong> {selectedDriver.license_issued_by || 'Не указано'}</p>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (type === 'clients') {
      return (
        <>
          <div>
            <Label>Название перевозчика *</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Контактное лицо</Label>
            <Input
              value={formData.contact_person || ''}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            />
          </div>
          <div>
            <Label>Телефон *</Label>
            <PhoneInput
              value={formData.phone || ''}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Адрес</Label>
            <Input
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </>
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg md:text-xl">{getTitle()}</CardTitle>
          <Button onClick={() => { setEditItem(null); setShowForm(true); }} size="sm" className="w-full sm:w-auto">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {renderTable()}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditItem(null); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Редактировать' : 'Создать'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderForm()}

            <div className="flex gap-2 justify-end pt-4 sticky bottom-0 bg-white border-t mt-4 -mx-6 px-6 py-3">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditItem(null); }}>
                Отмена
              </Button>
              <Button type="submit">
                {editItem ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}