import jsPDF from 'jspdf';

interface OrderData {
  order_number: string;
  client_name: string;
  order_date: string;
  stages?: any[];
}

export const generateOrderPDF = (order: OrderData) => {
  const doc = new jsPDF();
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Информация о заказе', 105, 20, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  
  let y = 40;
  doc.text(`Номер заказа: ${order.order_number}`, 20, y);
  y += 10;
  doc.text(`Клиент: ${order.client_name}`, 20, y);
  y += 10;
  doc.text(`Дата: ${order.order_date}`, 20, y);
  y += 20;
  
  if (order.stages && order.stages.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Этапы доставки:', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    order.stages.forEach((stage, idx) => {
      doc.text(`${idx + 1}. ${stage.from_location} → ${stage.to_location}`, 25, y);
      y += 7;
      if (stage.vehicle_number) {
        doc.text(`   ТС: ${stage.vehicle_number}, Водитель: ${stage.driver_name}`, 25, y);
        y += 7;
      }
    });
  }
  
  doc.save(`order-${order.order_number}.pdf`);
};

export const generateWaybillPDF = (order: OrderData, stage: any) => {
  const doc = new jsPDF();
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Путевой лист', 105, 20, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  let y = 40;
  doc.text(`Заказ: ${order.order_number}`, 20, y);
  y += 8;
  doc.text(`Маршрут: ${stage.from_location} → ${stage.to_location}`, 20, y);
  y += 8;
  doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 20, y);
  y += 15;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Информация о перевозке:', 20, y);
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Транспортное средство: ${stage.vehicle_number || 'Не указано'}`, 20, y);
  y += 8;
  doc.text(`Водитель: ${stage.driver_name || 'Не указан'}`, 20, y);
  y += 8;
  doc.text(`Клиент: ${order.client_name}`, 20, y);
  
  doc.save(`waybill-${order.order_number}-${stage.stage_number}.pdf`);
};
