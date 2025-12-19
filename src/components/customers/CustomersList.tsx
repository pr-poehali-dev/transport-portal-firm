import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface CustomersListProps {
  customers: any[];
  onEdit: (customer: any) => void;
  onCreate: () => void;
  onViewAddresses: (customer: any) => void;
  onDelete: (customer: any) => void;
}

export default function CustomersList({ customers, onEdit, onCreate, onViewAddresses, onDelete }: CustomersListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg md:text-xl">Заказчики</CardTitle>
          <CardDescription></CardDescription>
        </div>
        <Button onClick={onCreate}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить заказчика
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Никнейм</TableHead>
              <TableHead>Компания</TableHead>
              <TableHead>ИНН</TableHead>
              <TableHead>КПП</TableHead>
              <TableHead>Директор</TableHead>
              <TableHead>Адреса доставки</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.nickname}</TableCell>
                <TableCell>{customer.company_name}</TableCell>
                <TableCell>{customer.inn}</TableCell>
                <TableCell>{customer.kpp || '—'}</TableCell>
                <TableCell>{customer.director_name}</TableCell>
                <TableCell>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => onViewAddresses(customer)}
                    className="h-auto p-0"
                  >
                    <Icon name="MapPin" size={16} className="mr-1" />
                    Показать адреса
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(customer)}
                    >
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(customer)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}