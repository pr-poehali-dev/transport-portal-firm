import { useState } from 'react';
import { toast } from 'sonner';
import CustomersList from '@/components/customers/CustomersList';
import CustomerForm from '@/components/customers/CustomerForm';
import AddressesDialog from '@/components/customers/AddressesDialog';
import AddressFormDialog from '@/components/customers/AddressFormDialog';

const API_URL = 'https://functions.poehali.dev/626acb06-0cc7-4734-8340-e2c53e44ca0e';

interface DeliveryAddress {
  id?: number;
  address_name: string;
  address: string;
  contact_person: string;
  phone: string;
  is_primary: boolean;
}

interface CustomersPageProps {
  customers: any[];
  onRefresh: () => void;
}

export default function CustomersPage({ customers, onRefresh }: CustomersPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddress, setEditAddress] = useState<DeliveryAddress | null>(null);
  const [newAddresses, setNewAddresses] = useState<DeliveryAddress[]>([]);
  
  const [formData, setFormData] = useState({
    company_name: '',
    inn: '',
    kpp: '',
    legal_address: '',
    director_name: '',
    nickname: '',
    connection_basis: ''
  });

  const [addressFormData, setAddressFormData] = useState<DeliveryAddress>({
    address_name: '',
    address: '',
    contact_person: '',
    phone: '',
    is_primary: false
  });

  const resetForm = () => {
    setFormData({
      company_name: '',
      inn: '',
      kpp: '',
      legal_address: '',
      director_name: '',
      nickname: '',
      connection_basis: ''
    });
    setNewAddresses([{
      address_name: '',
      address: '',
      contact_person: '',
      phone: '',
      is_primary: true
    }]);
    setEditCustomer(null);
  };

  const resetAddressForm = () => {
    setAddressFormData({
      address_name: '',
      address: '',
      contact_person: '',
      phone: '',
      is_primary: false
    });
    setEditAddress(null);
  };

  const loadAddresses = async (customerId: number) => {
    try {
      const response = await fetch(`${API_URL}?resource=customer_addresses&customer_id=${customerId}`);
      const data = await response.json();
      setDeliveryAddresses(data.addresses || []);
    } catch (error) {
      toast.error('Ошибка загрузки адресов');
    }
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = async (customer: any) => {
    setFormData({
      company_name: customer.company_name || '',
      inn: customer.inn || '',
      kpp: customer.kpp || '',
      legal_address: customer.legal_address || '',
      director_name: customer.director_name || '',
      nickname: customer.nickname || '',
      connection_basis: customer.connection_basis || ''
    });
    
    try {
      const response = await fetch(`${API_URL}?resource=customer_addresses&customer_id=${customer.id}`);
      const data = await response.json();
      const addresses = data.addresses || [];
      
      if (addresses.length === 0) {
        setNewAddresses([{
          address_name: '',
          address: '',
          contact_person: '',
          phone: '',
          is_primary: true
        }]);
      } else {
        setNewAddresses(addresses);
      }
    } catch (error) {
      setNewAddresses([{
        address_name: '',
        address: '',
        contact_person: '',
        phone: '',
        is_primary: true
      }]);
    }
    
    setEditCustomer(customer);
    setShowForm(true);
  };

  const handleViewAddresses = async (customer: any) => {
    setSelectedCustomer(customer);
    await loadAddresses(customer.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_name || !formData.inn || !formData.legal_address || !formData.director_name || !formData.nickname) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      if (editCustomer) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'customer',
            id: editCustomer.id,
            data: formData
          })
        });
        
        for (const addr of newAddresses) {
          if (addr.id) {
            await fetch(API_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                resource: 'customer_address',
                id: addr.id,
                data: addr
              })
            });
          } else {
            if (addr.address_name && addr.address) {
              await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'create_customer_address',
                  customer_id: editCustomer.id,
                  data: addr
                })
              });
            }
          }
        }
        
        toast.success('Заказчик обновлен');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_customer',
            data: formData
          })
        });
        const result = await response.json();
        const customerId = result.id;
        
        if (newAddresses.length > 0) {
          for (const addr of newAddresses) {
            if (addr.address_name && addr.address) {
              await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'create_customer_address',
                  customer_id: customerId,
                  data: addr
                })
              });
            }
          }
        }
        
        toast.success('Заказчик добавлен');
      }
      setShowForm(false);
      resetForm();
      onRefresh();
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const addNewAddress = () => {
    setNewAddresses([...newAddresses, {
      address_name: '',
      address: '',
      contact_person: '',
      phone: '',
      is_primary: newAddresses.length === 0
    }]);
  };

  const removeNewAddress = async (index: number) => {
    const addrToRemove = newAddresses[index];
    
    if (addrToRemove.id && editCustomer) {
      if (!confirm('Удалить этот адрес?')) return;
      
      try {
        await fetch(API_URL, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'customer_address',
            id: addrToRemove.id
          })
        });
        toast.success('Адрес удален');
      } catch (error) {
        toast.error('Ошибка удаления адреса');
        return;
      }
    }
    
    const updated = newAddresses.filter((_, i) => i !== index);
    if (updated.length === 0) {
      updated.push({
        address_name: '',
        address: '',
        contact_person: '',
        phone: '',
        is_primary: true
      });
    } else if (!updated.some(a => a.is_primary)) {
      updated[0].is_primary = true;
    }
    setNewAddresses(updated);
  };

  const updateNewAddress = (index: number, field: keyof DeliveryAddress, value: string | boolean) => {
    const updated = [...newAddresses];
    if (field === 'is_primary' && value === true) {
      updated.forEach((addr, i) => {
        if (i !== index) addr.is_primary = false;
      });
    }
    updated[index] = { ...updated[index], [field]: value };
    setNewAddresses(updated);
  };

  const handleAddAddress = () => {
    resetAddressForm();
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setAddressFormData(address);
    setEditAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Удалить адрес?')) return;
    
    try {
      await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'customer_address',
          id: addressId
        })
      });
      toast.success('Адрес удален');
      if (selectedCustomer) {
        await loadAddresses(selectedCustomer.id);
      }
    } catch (error) {
      toast.error('Ошибка удаления адреса');
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressFormData.address_name || !addressFormData.address) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      if (editAddress?.id) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resource: 'customer_address',
            id: editAddress.id,
            data: addressFormData
          })
        });
        toast.success('Адрес обновлен');
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_customer_address',
            customer_id: selectedCustomer.id,
            data: addressFormData
          })
        });
        toast.success('Адрес добавлен');
      }
      
      setShowAddressForm(false);
      resetAddressForm();
      if (selectedCustomer) {
        await loadAddresses(selectedCustomer.id);
      }
    } catch (error) {
      toast.error('Ошибка сохранения адреса');
    }
  };

  const handleDelete = async (customer: any) => {
    if (!confirm(`Удалить заказчика "${customer.nickname || customer.company_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_customer',
          customer_id: customer.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error && result.error.includes('используется')) {
          toast.error(result.error);
        } else {
          throw new Error(result.error || 'Ошибка удаления');
        }
        return;
      }

      toast.success('Заказчик удален');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления заказчика');
    }
  };

  return (
    <div className="space-y-6">
      <CustomersList
        customers={customers}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onViewAddresses={handleViewAddresses}
        onDelete={handleDelete}
      />

      <CustomerForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        newAddresses={newAddresses}
        updateNewAddress={updateNewAddress}
        addNewAddress={addNewAddress}
        removeNewAddress={removeNewAddress}
        editCustomer={editCustomer}
      />

      <AddressesDialog
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        addresses={deliveryAddresses}
        onAddAddress={handleAddAddress}
        onEditAddress={handleEditAddress}
        onDeleteAddress={handleDeleteAddress}
      />

      <AddressFormDialog
        open={showAddressForm}
        onClose={() => {
          setShowAddressForm(false);
          resetAddressForm();
        }}
        onSubmit={handleAddressSubmit}
        formData={addressFormData}
        setFormData={setAddressFormData}
        editMode={!!editAddress}
      />
    </div>
  );
}