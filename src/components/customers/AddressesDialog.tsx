import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DeliveryAddress {
  id?: number;
  address_name: string;
  address: string;
  contact_person: string;
  phone: string;
  is_primary: boolean;
}

interface AddressesDialogProps {
  open: boolean;
  onClose: () => void;
  customer: any;
  addresses: DeliveryAddress[];
  onAddAddress: () => void;
  onEditAddress: (address: DeliveryAddress) => void;
  onDeleteAddress: (addressId: number) => void;
}

export default function AddressesDialog({
  open,
  onClose,
  customer,
  addresses,
  onAddAddress,
  onEditAddress,
  onDeleteAddress
}: AddressesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Адреса доставки — {customer?.nickname || customer?.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {addresses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Адреса не добавлены</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="border rounded-lg p-4 space-y-2 relative">
                {addr.is_primary && (
                  <Badge variant="default" className="absolute top-3 right-3">
                    Основной
                  </Badge>
                )}
                
                <div>
                  <p className="font-semibold text-sm">{addr.address_name}</p>
                  <p className="text-sm text-gray-600">{addr.address}</p>
                </div>
                
                {addr.contact_person && (
                  <p className="text-sm">
                    <span className="text-gray-500">Контакт:</span> {addr.contact_person}
                  </p>
                )}
                
                {addr.phone && (
                  <p className="text-sm">
                    <span className="text-gray-500">Телефон:</span> {addr.phone}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAddress(addr)}
                  >
                    <Icon name="Pencil" size={14} className="mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addr.id && onDeleteAddress(addr.id)}
                    className="text-red-500"
                  >
                    <Icon name="Trash2" size={14} className="mr-1" />
                    Удалить
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onAddAddress} className="flex-1">
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить адрес
          </Button>
          <Button onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
