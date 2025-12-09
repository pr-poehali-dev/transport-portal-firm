import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  onRefresh: () => void;
}

export default function ResourceManager({ type, data, onRefresh }: ResourceManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const getEmptyForm = () => {
    switch (type) {
      case 'drivers':
        return { 
          last_name: '', 
          first_name: '', 
          middle_name: '', 
          phone: '', 
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
        return { license_plate: '', model: '', capacity: '', status: 'available' };
      case 'clients':
        return { name: '', contact_person: '', phone: '', email: '', address: '' };
    }
  };

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
    } else {
      setFormData(getEmptyForm());
    }
  }, [editItem, showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      if (!response.ok) throw new Error('Failed to delete');
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
      case 'clients': return 'Клиенты';
    }
  };

  const renderTable = () => {
    if (type === 'drivers') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Водительское удостоверение</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.full_name}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.license_number}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                    {item.status === 'available' ? 'Доступен' : 'Занят'}
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
      );
    }

    if (type === 'vehicles') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Гос. номер</TableHead>
              <TableHead>Модель</TableHead>
              <TableHead>Грузоподъемность</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.license_plate}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.capacity}</TableCell>
                <TableCell>
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
      );
    }

    if (type === 'clients') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Контактное лицо</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.contact_person}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.email}</TableCell>
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
                required
              />
            </div>
            <div>
              <Label>Имя *</Label>
              <Input
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
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
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (___) ___-__-__"
              required
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
                  placeholder="1234"
                  maxLength={4}
                  required
                />
              </div>
              <div>
                <Label>Номер *</Label>
                <Input
                  value={formData.passport_number || ''}
                  onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                  placeholder="567890"
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Кем выдан *</Label>
              <Input
                value={formData.passport_issued_by || ''}
                onChange={(e) => setFormData({ ...formData, passport_issued_by: e.target.value })}
                required
              />
            </div>
            <div className="mt-4">
              <Label>Дата выдачи *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Icon name="Calendar" className="mr-2" size={16} />
                    {formData.passport_issue_date ? format(new Date(formData.passport_issue_date), 'dd-MM-yyyy', { locale: ru }) : 'Выберите дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.passport_issue_date ? new Date(formData.passport_issue_date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, passport_issue_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    locale={ru}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                  required
                />
              </div>
              <div>
                <Label>Номер *</Label>
                <Input
                  value={formData.license_number || ''}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="123456"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Кем выдан *</Label>
              <Input
                value={formData.license_issued_by || ''}
                onChange={(e) => setFormData({ ...formData, license_issued_by: e.target.value })}
                required
              />
            </div>
            <div className="mt-4">
              <Label>Дата выдачи *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Icon name="Calendar" className="mr-2" size={16} />
                    {formData.license_issue_date ? format(new Date(formData.license_issue_date), 'dd-MM-yyyy', { locale: ru }) : 'Выберите дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.license_issue_date ? new Date(formData.license_issue_date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, license_issue_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    locale={ru}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

        </>
      );
    }

    if (type === 'vehicles') {
      return (
        <>
          <div>
            <Label>Гос. номер *</Label>
            <Input
              value={formData.license_plate || ''}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Модель *</Label>
            <Input
              value={formData.model || ''}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Грузоподъемность *</Label>
            <Input
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Статус</Label>
            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Доступен</SelectItem>
                <SelectItem value="in_use">В рейсе</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      );
    }

    if (type === 'clients') {
      return (
        <>
          <div>
            <Label>Название *</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
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
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{getTitle()}</CardTitle>
          <Button onClick={() => { setEditItem(null); setShowForm(true); }}>
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {renderTable()}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditItem(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Редактировать' : 'Создать'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {renderForm()}

            <div className="flex gap-2 justify-end pt-4">
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