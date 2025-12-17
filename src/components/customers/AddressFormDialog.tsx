import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';

interface DeliveryAddress {
  id?: number;
  address_name: string;
  address: string;
  contact_person: string;
  phone: string;
  is_primary: boolean;
}

interface AddressFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: DeliveryAddress;
  setFormData: React.Dispatch<React.SetStateAction<DeliveryAddress>>;
  editMode: boolean;
}

export default function AddressFormDialog({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editMode
}: AddressFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? 'Редактирование адреса' : 'Новый адрес доставки'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Название адреса *</Label>
            <Input
              value={formData.address_name}
              onChange={(e) => setFormData({ ...formData, address_name: e.target.value })}
              placeholder="Склад №1"
              required
            />
          </div>

          <div>
            <Label>Адрес *</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="г. Москва, ул. Складская, 10"
              required
            />
          </div>

          <div>
            <Label>Контактное лицо</Label>
            <Input
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="Петров П.П."
            />
          </div>

          <div>
            <Label>Телефон</Label>
            <PhoneInput
              value={formData.phone}
              onChange={(val) => setFormData({ ...formData, phone: val })}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Сделать основным адресом</span>
          </label>

          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1">
              {editMode ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
