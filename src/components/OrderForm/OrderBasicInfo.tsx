import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DateInput from '@/components/ui/date-input';
import Icon from '@/components/ui/icon';

interface CustomerItem {
  customer_id: string;
  note: string;
}

interface OrderBasicInfoProps {
  orderInfo: {
    order_number: string;
    order_date: string;
    cargo_type: string;
    cargo_weight: string;
    invoice: string;
    track_number: string;
    notes: string;
  };
  direction: string;
  autoRoute: string;
  customerItems: CustomerItem[];
  customers: any[];
  errors: Record<string, string>;
  editOrder?: any;
  onUpdateOrderInfo: (field: string, value: string) => void;
  onUpdateDirection: (value: string) => void;
  onAddCustomerItem: () => void;
  onRemoveCustomerItem: (index: number) => void;
  onUpdateCustomerItem: (index: number, field: keyof CustomerItem, value: string) => void;
}

export default function OrderBasicInfo({
  orderInfo,
  direction,
  autoRoute,
  customerItems,
  customers,
  errors,
  editOrder,
  onUpdateOrderInfo,
  onUpdateDirection,
  onAddCustomerItem,
  onRemoveCustomerItem,
  onUpdateCustomerItem
}: OrderBasicInfoProps) {
  return (
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
                onValueChange={onUpdateDirection}
                disabled={!!editOrder}
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
                onChange={(e) => onUpdateOrderInfo('order_number', e.target.value)}
                className={errors.order_number ? 'border-red-500 flex-1' : 'flex-1'}
                placeholder="EU17122024-001"
                disabled={!!editOrder}
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
                  onUpdateOrderInfo('order_date', `${match[3]}-${match[2]}-${match[1]}`);
                } else {
                  onUpdateOrderInfo('order_date', val);
                }
              }}
              className={errors.order_date ? 'border-red-500' : ''}
              disabled={!!editOrder}
            />
            {errors.order_date && <p className="text-red-500 text-xs mt-1">{errors.order_date}</p>}
          </div>

          <div>
            <Label className="text-sm">Инвойс *</Label>
            <Input
              value={orderInfo.invoice}
              onChange={(e) => onUpdateOrderInfo('invoice', e.target.value)}
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
              onChange={(e) => onUpdateOrderInfo('track_number', e.target.value)}
              placeholder="TRACK123456"
              disabled={!!editOrder}
              className={errors.track_number ? 'border-red-500' : ''}
              required
            />
            {errors.track_number && <p className="text-red-500 text-xs mt-1">{errors.track_number}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm">Заказчики *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddCustomerItem}
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
                    onValueChange={(val) => onUpdateCustomerItem(index, 'customer_id', val)}
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
                    onChange={(e) => onUpdateCustomerItem(index, 'note', e.target.value)}
                  />
                </div>
                {customerItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveCustomerItem(index)}
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
            <Label className="text-sm">Характер груза *</Label>
            <Input
              value={orderInfo.cargo_type}
              onChange={(e) => onUpdateOrderInfo('cargo_type', e.target.value)}
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
              onChange={(e) => onUpdateOrderInfo('cargo_weight', e.target.value)}
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
            onChange={(e) => onUpdateOrderInfo('notes', e.target.value)}
            placeholder="Дополнительная информация о заказе..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
