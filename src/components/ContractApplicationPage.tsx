import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import DateInput from '@/components/ui/date-input';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface ContractApplication {
  id: number;
  contract_number: string;
  contract_date: string;
  customer_id: number;
  carrier_id: number;
  carrier_name: string;
  vehicle_type: string;
  refrigerator: boolean;
  cargo_weight: number;
  cargo_volume: number;
  transport_mode: string;
  additional_conditions: string;
  loading_address: string;
  loading_date: string;
  loading_contact: string;
  unloading_address: string;
  unloading_date: string;
  unloading_contact: string;
  payment_amount: number;
  payment_without_vat: boolean;
  payment_terms: string;
  payment_documents: string;
  driver_name: string;
  driver_license: string;
  driver_passport: string;
  driver_passport_issued: string;
  vehicle_number: string;
  trailer_number: string;
  transport_conditions: string;
  customer_full_name: string;
  customer_inn: string;
  customer_ogrn: string;
  customer_legal_address: string;
  customer_postal_address: string;
  customer_bank_details: string;
  customer_director: string;
  carrier_full_name: string;
  carrier_inn: string;
  carrier_ogrn: string;
  carrier_legal_address: string;
  carrier_postal_address: string;
  carrier_bank_details: string;
  carrier_director: string;
  created_at: string;
}

interface ContractApplicationPageProps {
  customers: any[];
  clients: any[];
  drivers: any[];
  vehicles: any[];
  onRefresh: () => void;
}

const ContractApplicationPage = ({ customers, clients, drivers, vehicles, onRefresh }: ContractApplicationPageProps) => {
  const [contracts, setContracts] = useState<ContractApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editContract, setEditContract] = useState<ContractApplication | null>(null);

  const [formData, setFormData] = useState({
    contract_number: '',
    contract_date: new Date().toISOString().split('T')[0],
    customer_id: '',
    carrier_id: '',
    carrier_name: '',
    vehicle_type: '',
    refrigerator: false,
    cargo_weight: '',
    cargo_volume: '',
    transport_mode: '',
    additional_conditions: '',
    loading_address: '',
    loading_date: '',
    loading_contact: '',
    unloading_address: '',
    unloading_date: '',
    unloading_contact: '',
    payment_amount: '',
    payment_without_vat: false,
    payment_terms: '',
    payment_documents: '',
    driver_name: '',
    driver_license: '',
    driver_passport: '',
    driver_passport_issued: '',
    vehicle_number: '',
    trailer_number: '',
    transport_conditions: '',
    customer_full_name: '',
    customer_inn: '',
    customer_ogrn: '',
    customer_legal_address: '',
    customer_postal_address: '',
    customer_bank_details: '',
    customer_director: '',
    carrier_full_name: '',
    carrier_inn: '',
    carrier_ogrn: '',
    carrier_legal_address: '',
    carrier_postal_address: '',
    carrier_bank_details: '',
    carrier_director: ''
  });

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?resource=contract_applications`);
      const data = await response.json();
      setContracts(data.contracts || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Ошибка загрузки договоров');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editContract ? 'update_contract_application' : 'create_contract_application',
          contract_id: editContract?.id,
          data: formData
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editContract ? 'Договор обновлён' : 'Договор создан');
        setShowForm(false);
        setEditContract(null);
        resetForm();
        loadContracts();
        onRefresh();
      } else {
        toast.error(result.message || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Ошибка сохранения договора');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contract: ContractApplication) => {
    setEditContract(contract);
    setFormData({
      contract_number: contract.contract_number,
      contract_date: contract.contract_date,
      customer_id: contract.customer_id.toString(),
      carrier_id: contract.carrier_id?.toString() || '',
      carrier_name: contract.carrier_name || '',
      vehicle_type: contract.vehicle_type || '',
      refrigerator: contract.refrigerator || false,
      cargo_weight: contract.cargo_weight?.toString() || '',
      cargo_volume: contract.cargo_volume?.toString() || '',
      transport_mode: contract.transport_mode || '',
      additional_conditions: contract.additional_conditions || '',
      loading_address: contract.loading_address || '',
      loading_date: contract.loading_date || '',
      loading_contact: contract.loading_contact || '',
      unloading_address: contract.unloading_address || '',
      unloading_date: contract.unloading_date || '',
      unloading_contact: contract.unloading_contact || '',
      payment_amount: contract.payment_amount?.toString() || '',
      payment_without_vat: contract.payment_without_vat || false,
      payment_terms: contract.payment_terms || '',
      payment_documents: contract.payment_documents || '',
      driver_name: contract.driver_name || '',
      driver_license: contract.driver_license || '',
      driver_passport: contract.driver_passport || '',
      driver_passport_issued: contract.driver_passport_issued || '',
      vehicle_number: contract.vehicle_number || '',
      trailer_number: contract.trailer_number || '',
      transport_conditions: contract.transport_conditions || '',
      customer_full_name: contract.customer_full_name || '',
      customer_inn: contract.customer_inn || '',
      customer_ogrn: contract.customer_ogrn || '',
      customer_legal_address: contract.customer_legal_address || '',
      customer_postal_address: contract.customer_postal_address || '',
      customer_bank_details: contract.customer_bank_details || '',
      customer_director: contract.customer_director || '',
      carrier_full_name: contract.carrier_full_name || '',
      carrier_inn: contract.carrier_inn || '',
      carrier_ogrn: contract.carrier_ogrn || '',
      carrier_legal_address: contract.carrier_legal_address || '',
      carrier_postal_address: contract.carrier_postal_address || '',
      carrier_bank_details: contract.carrier_bank_details || '',
      carrier_director: contract.carrier_director || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить договор?')) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_contract_application',
          contract_id: id
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Договор удалён');
        loadContracts();
      } else {
        toast.error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Ошибка удаления');
    }
  };

  const resetForm = () => {
    setFormData({
      contract_number: '',
      contract_date: new Date().toISOString().split('T')[0],
      customer_id: '',
      carrier_id: '',
      carrier_name: '',
      vehicle_type: '',
      refrigerator: false,
      cargo_weight: '',
      cargo_volume: '',
      transport_mode: '',
      additional_conditions: '',
      loading_address: '',
      loading_date: '',
      loading_contact: '',
      unloading_address: '',
      unloading_date: '',
      unloading_contact: '',
      payment_amount: '',
      payment_without_vat: false,
      payment_terms: '',
      payment_documents: '',
      driver_name: '',
      driver_license: '',
      driver_passport: '',
      driver_passport_issued: '',
      vehicle_number: '',
      trailer_number: '',
      transport_conditions: '',
      customer_full_name: '',
      customer_inn: '',
      customer_ogrn: '',
      customer_legal_address: '',
      customer_postal_address: '',
      customer_bank_details: '',
      customer_director: '',
      carrier_full_name: '',
      carrier_inn: '',
      carrier_ogrn: '',
      carrier_legal_address: '',
      carrier_postal_address: '',
      carrier_bank_details: '',
      carrier_director: ''
    });
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData({ ...formData, customer_id: customerId });
    const customer = customers.find(c => c.id.toString() === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customer_id: customerId,
        customer_full_name: customer.full_legal_name || '',
        customer_inn: customer.inn || '',
        customer_ogrn: customer.ogrn || '',
        customer_legal_address: customer.legal_address || '',
        customer_postal_address: customer.postal_address || '',
        customer_bank_details: customer.bank_details || '',
        customer_director: customer.director_name || ''
      }));
    }
  };

  const handleCarrierChange = (carrierId: string) => {
    setFormData({ ...formData, carrier_id: carrierId });
    const carrier = clients.find(c => c.id.toString() === carrierId);
    if (carrier) {
      setFormData(prev => ({
        ...prev,
        carrier_id: carrierId,
        carrier_name: carrier.name || '',
        carrier_full_name: carrier.full_legal_name || '',
        carrier_inn: carrier.inn || '',
        carrier_ogrn: carrier.ogrn || '',
        carrier_legal_address: carrier.legal_address || '',
        carrier_postal_address: carrier.postal_address || '',
        carrier_bank_details: carrier.bank_details || '',
        carrier_director: carrier.director_name || ''
      }));
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.contract_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.carrier_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={24} />
              Договоры-заявки
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => { setShowForm(true); setEditContract(null); resetForm(); }}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать договор
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ договора</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Заказчик</TableHead>
                  <TableHead>Перевозчик</TableHead>
                  <TableHead>Маршрут</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_number}</TableCell>
                    <TableCell>{new Date(contract.contract_date).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>{contract.customer_full_name}</TableCell>
                    <TableCell>{contract.carrier_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{contract.loading_address}</div>
                        <div className="text-gray-500">→ {contract.unloading_address}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(contract)}>
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(contract.id)}>
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editContract ? 'Редактировать договор-заявку' : 'Создать договор-заявку'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Номер договора-заявки</Label>
                <Input
                  value={formData.contract_number}
                  onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                  placeholder="20120ФМ-1"
                  required
                />
              </div>
              <div>
                <Label>Дата</Label>
                <DateInput
                  value={formData.contract_date}
                  onChange={(value) => setFormData({ ...formData, contract_date: value })}
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Заказчик</h3>
              <div className="space-y-3">
                <div>
                  <Label>Выбрать заказчика</Label>
                  <Select value={formData.customer_id} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите заказчика" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.nickname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Полное наименование"
                  value={formData.customer_full_name}
                  onChange={(e) => setFormData({ ...formData, customer_full_name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="ИНН"
                    value={formData.customer_inn}
                    onChange={(e) => setFormData({ ...formData, customer_inn: e.target.value })}
                  />
                  <Input
                    placeholder="ОГРН"
                    value={formData.customer_ogrn}
                    onChange={(e) => setFormData({ ...formData, customer_ogrn: e.target.value })}
                  />
                </div>
                <Textarea
                  placeholder="Юридический адрес"
                  value={formData.customer_legal_address}
                  onChange={(e) => setFormData({ ...formData, customer_legal_address: e.target.value })}
                  rows={2}
                />
                <Textarea
                  placeholder="Банковские реквизиты"
                  value={formData.customer_bank_details}
                  onChange={(e) => setFormData({ ...formData, customer_bank_details: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Перевозчик</h3>
              <div className="space-y-3">
                <div>
                  <Label>Выбрать перевозчика</Label>
                  <Select value={formData.carrier_id} onValueChange={handleCarrierChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите перевозчика" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Полное наименование перевозчика"
                  value={formData.carrier_full_name}
                  onChange={(e) => setFormData({ ...formData, carrier_full_name: e.target.value })}
                />
                <Textarea
                  placeholder="Банковские реквизиты перевозчика"
                  value={formData.carrier_bank_details}
                  onChange={(e) => setFormData({ ...formData, carrier_bank_details: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Требуемый тип ТС</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Тип кузова</Label>
                  <Input
                    placeholder="тип кузова"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Рефрижератор</Label>
                  <Select
                    value={formData.refrigerator ? 'yes' : 'no'}
                    onValueChange={(value) => setFormData({ ...formData, refrigerator: value === 'yes' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Нет</SelectItem>
                      <SelectItem value="yes">Да</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Вес груза (т.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cargo_weight}
                    onChange={(e) => setFormData({ ...formData, cargo_weight: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Объем (м³)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cargo_volume}
                    onChange={(e) => setFormData({ ...formData, cargo_volume: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label>Режим перевозки</Label>
                <Input
                  placeholder="t режим"
                  value={formData.transport_mode}
                  onChange={(e) => setFormData({ ...formData, transport_mode: e.target.value })}
                />
              </div>
              <div className="mt-3">
                <Label>Дополнительные условия</Label>
                <Input
                  placeholder="+ 2 град, доп. условия"
                  value={formData.additional_conditions}
                  onChange={(e) => setFormData({ ...formData, additional_conditions: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Погрузка</h3>
              <div className="space-y-3">
                <div>
                  <Label>Адрес погрузки</Label>
                  <Textarea
                    placeholder="Московская область, городской округ Люберцы..."
                    value={formData.loading_address}
                    onChange={(e) => setFormData({ ...formData, loading_address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Дата погрузки</Label>
                    <DateInput
                      value={formData.loading_date}
                      onChange={(value) => setFormData({ ...formData, loading_date: value })}
                    />
                  </div>
                  <div>
                    <Label>Контактное лицо</Label>
                    <Input
                      placeholder="Константин, тел. 89104355433"
                      value={formData.loading_contact}
                      onChange={(e) => setFormData({ ...formData, loading_contact: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Разгрузка</h3>
              <div className="space-y-3">
                <div>
                  <Label>Адрес разгрузки</Label>
                  <Textarea
                    placeholder="г. Ижевск, Завьяловский район..."
                    value={formData.unloading_address}
                    onChange={(e) => setFormData({ ...formData, unloading_address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Дата разгрузки</Label>
                    <DateInput
                      value={formData.unloading_date}
                      onChange={(value) => setFormData({ ...formData, unloading_date: value })}
                    />
                  </div>
                  <div>
                    <Label>Контактное лицо</Label>
                    <Input
                      placeholder="Денис 89120120177"
                      value={formData.unloading_contact}
                      onChange={(e) => setFormData({ ...formData, unloading_contact: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Оплата</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Сумма (руб.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.payment_amount}
                    onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Без НДС</Label>
                  <Select
                    value={formData.payment_without_vat ? 'yes' : 'no'}
                    onValueChange={(value) => setFormData({ ...formData, payment_without_vat: value === 'yes' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Нет</SelectItem>
                      <SelectItem value="yes">Да</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Сроки оплаты</Label>
                  <Input
                    placeholder="5-7 б/д"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label>По оригиналам документов</Label>
                <Input
                  placeholder="по оригиналам документов"
                  value={formData.payment_documents}
                  onChange={(e) => setFormData({ ...formData, payment_documents: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Данные водителя</h3>
              <div className="space-y-3">
                <Input
                  placeholder="ФИО водителя"
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="ВУ номер"
                    value={formData.driver_license}
                    onChange={(e) => setFormData({ ...formData, driver_license: e.target.value })}
                  />
                  <Input
                    placeholder="Паспорт"
                    value={formData.driver_passport}
                    onChange={(e) => setFormData({ ...formData, driver_passport: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Паспорт выдан"
                  value={formData.driver_passport_issued}
                  onChange={(e) => setFormData({ ...formData, driver_passport_issued: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Данные ТС</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Номер ТС</Label>
                  <Input
                    placeholder="Вольво H777AP/18"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Номер прицепа</Label>
                  <Input
                    placeholder="прицеп АО0714/18"
                    value={formData.trailer_number}
                    onChange={(e) => setFormData({ ...formData, trailer_number: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label>Условия перевозки</Label>
              <Textarea
                placeholder="Условия перевозки (полный текст из договора)"
                value={formData.transport_conditions}
                onChange={(e) => setFormData({ ...formData, transport_conditions: e.target.value })}
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditContract(null); resetForm(); }}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : editContract ? 'Обновить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractApplicationPage;
