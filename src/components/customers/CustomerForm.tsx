import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface DeliveryAddress {
  id?: number;
  address_name: string;
  address: string;
  contact_person: string;
  phone: string;
  is_primary: boolean;
}

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    company_name: string;
    inn: string;
    kpp: string;
    legal_address: string;
    director_name: string;
    nickname: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  newAddresses: DeliveryAddress[];
  updateNewAddress: (index: number, field: keyof DeliveryAddress, value: string | boolean) => void;
  addNewAddress: () => void;
  removeNewAddress: (index: number) => void;
  editCustomer: any;
}

export default function CustomerForm({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  newAddresses,
  updateNewAddress,
  addNewAddress,
  removeNewAddress,
  editCustomer
}: CustomerFormProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editCustomer ? 'Редактирование заказчика' : 'Новый заказчик'}</DialogTitle>
          <DialogDescription>
            {editCustomer ? 'Измените информацию о заказчике' : 'Введите данные нового заказчика'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Никнейм *</Label>
                <Input
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="ООО Ромашка"
                  required
                />
              </div>
              <div>
                <Label>Название компании *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder='ООО "Ромашка"'
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ИНН *</Label>
                <Input
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  placeholder="1234567890"
                  required
                />
              </div>
              <div>
                <Label>КПП</Label>
                <Input
                  value={formData.kpp}
                  onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div>
              <Label>Юридический адрес *</Label>
              <Input
                value={formData.legal_address}
                onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                placeholder="г. Москва, ул. Ленина, д. 1"
                required
              />
            </div>

            <div>
              <Label>ФИО Директора *</Label>
              <Input
                value={formData.director_name}
                onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
                placeholder="Иванов Иван Иванovich"
                required
              />
            </div>

            <div>
              <Label>Основание связи</Label>
              <Input
                value={formData.connection_basis || ''}
                onChange={(e) => setFormData({ ...formData, connection_basis: e.target.value })}
                placeholder="Договор №123 от 01.01.2024"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Адреса доставки</h3>
                <p className="text-sm text-gray-500">Добавьте один или несколько адресов</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addNewAddress}>
                <Icon name="Plus" size={14} className="mr-1" />
                Добавить адрес
              </Button>
            </div>

            <div className="space-y-4">
              {newAddresses.map((addr, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  {addr.is_primary && (
                    <Badge variant="default" className="absolute top-2 right-2">
                      Основной
                    </Badge>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Название адреса *</Label>
                      <Input
                        value={addr.address_name}
                        onChange={(e) => updateNewAddress(index, 'address_name', e.target.value)}
                        placeholder="Склад №1"
                        size={3}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Адрес *</Label>
                      <Input
                        value={addr.address}
                        onChange={(e) => updateNewAddress(index, 'address', e.target.value)}
                        placeholder="г. Москва, ул. Складская, 10"
                        size={3}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Контактное лицо</Label>
                      <Input
                        value={addr.contact_person}
                        onChange={(e) => updateNewAddress(index, 'contact_person', e.target.value)}
                        placeholder="Петров П.П."
                        size={3}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Телефон</Label>
                      <PhoneInput
                        value={addr.phone}
                        onChange={(val) => updateNewAddress(index, 'phone', val)}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addr.is_primary}
                        onChange={(e) => updateNewAddress(index, 'is_primary', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Сделать основным адресом</span>
                    </label>
                    
                    {newAddresses.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNewAddress(index)}
                        className="text-red-500"
                      >
                        <Icon name="Trash2" size={14} className="mr-1" />
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              {editCustomer ? 'Сохранить изменения' : 'Добавить заказчика'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}