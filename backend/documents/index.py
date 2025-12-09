import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn)

def generate_waybill_html(order_data: Dict[str, Any]) -> str:
    return f'''
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .header h1 {{ font-size: 20px; margin: 10px 0; }}
        .content {{ margin-top: 20px; }}
        .row {{ margin: 10px 0; display: flex; }}
        .label {{ font-weight: bold; width: 200px; }}
        .value {{ flex: 1; border-bottom: 1px solid #000; }}
        .signature-block {{ margin-top: 50px; display: flex; justify-content: space-between; }}
        .signature {{ text-align: center; }}
        .signature-line {{ border-bottom: 1px solid #000; width: 200px; margin: 10px auto; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th, td {{ border: 1px solid #000; padding: 8px; text-align: left; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>ТРАНСПОРТНАЯ НАКЛАДНАЯ</h1>
        <p>№ {order_data['order_number']} от {order_data['order_date']}</p>
    </div>
    
    <div class="content">
        <div class="row">
            <div class="label">Грузоотправитель:</div>
            <div class="value">{order_data['client_name']}</div>
        </div>
        <div class="row">
            <div class="label">Перевозчик:</div>
            <div class="value">{order_data['carrier']}</div>
        </div>
        <div class="row">
            <div class="label">Водитель:</div>
            <div class="value">{order_data['driver_name']}</div>
        </div>
        <div class="row">
            <div class="label">Телефон водителя:</div>
            <div class="value">{order_data['driver_phone']}</div>
        </div>
        <div class="row">
            <div class="label">Транспортное средство:</div>
            <div class="value">{order_data['vehicle_model']} ({order_data['license_plate']})</div>
        </div>
        <div class="row">
            <div class="label">Маршрут:</div>
            <div class="value">{order_data['route_from']} → {order_data['route_to']}</div>
        </div>
        <div class="row">
            <div class="label">Дата отгрузки:</div>
            <div class="value">{order_data['order_date']}</div>
        </div>
        <div class="row">
            <div class="label">Инвойс:</div>
            <div class="value">{order_data['invoice_number']}</div>
        </div>
        <div class="row">
            <div class="label">Пункт назначения:</div>
            <div class="value">{order_data['delivery_address'] or order_data['route_to']}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Наименование груза</th>
                <th>Количество</th>
                <th>Вес (кг)</th>
                <th>Примечание</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
            </tr>
        </tbody>
    </table>

    <div class="signature-block">
        <div class="signature">
            <p>Грузоотправитель</p>
            <div class="signature-line"></div>
            <p style="font-size: 12px;">Подпись / Печать</p>
        </div>
        <div class="signature">
            <p>Водитель</p>
            <div class="signature-line"></div>
            <p style="font-size: 12px;">Подпись</p>
        </div>
        <div class="signature">
            <p>Грузополучатель</p>
            <div class="signature-line"></div>
            <p style="font-size: 12px;">Подпись / Печать</p>
        </div>
    </div>
    
    <p style="margin-top: 50px; font-size: 12px; color: #666;">
        Документ создан автоматически системой TransHub {datetime.now().strftime('%d.%m.%Y %H:%M')}
    </p>
</body>
</html>
'''

def generate_power_of_attorney_html(order_data: Dict[str, Any]) -> str:
    return f'''
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .header h1 {{ font-size: 20px; margin: 10px 0; }}
        .content {{ margin-top: 20px; text-align: justify; }}
        .row {{ margin: 15px 0; }}
        .underline {{ border-bottom: 1px solid #000; display: inline-block; min-width: 200px; }}
        .signature-block {{ margin-top: 80px; display: flex; justify-content: space-between; }}
        .signature {{ text-align: center; }}
        .signature-line {{ border-bottom: 1px solid #000; width: 200px; margin: 10px auto; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>ДОВЕРЕННОСТЬ</h1>
        <p>№ {order_data['order_number']}-Д от {order_data['order_date']}</p>
    </div>
    
    <div class="content">
        <p>
            Настоящая доверенность выдана <span class="underline">{order_data['driver_name']}</span>
        </p>
        <p>
            Паспорт: <span class="underline">серия ____ № ________</span>, выдан <span class="underline">____________________</span>
        </p>
        <p>
            Водительское удостоверение: <span class="underline">{order_data['driver_license']}</span>
        </p>
        <p style="margin-top: 30px;">
            на право управления транспортным средством <span class="underline">{order_data['vehicle_model']}</span>,
            государственный регистрационный знак <span class="underline">{order_data['license_plate']}</span>
        </p>
        <p style="margin-top: 30px;">
            и на совершение следующих действий:
        </p>
        <ul>
            <li>Получение груза от грузоотправителя <span class="underline">{order_data['client_name']}</span></li>
            <li>Транспортировку груза по маршруту <span class="underline">{order_data['route_from']} → {order_data['route_to']}</span></li>
            <li>Прохождение таможенного контроля на пункте пропуска <span class="underline">{order_data['border_crossing'] or '___________'}</span></li>
            <li>Передачу груза грузополучателю</li>
            <li>Подписание всех необходимых документов от имени перевозчика</li>
        </ul>
        
        <p style="margin-top: 30px;">
            Доверенность выдана сроком до <span class="underline">_________________</span> без права передоверия.
        </p>
        
        <p style="margin-top: 20px;">
            Инвойс: <span class="underline">{order_data['invoice_number']}</span>
        </p>
        <p>
            Контактный телефон: <span class="underline">{order_data['driver_phone']}</span>
        </p>
    </div>

    <div class="signature-block">
        <div class="signature">
            <p>Перевозчик: {order_data['carrier']}</p>
            <div class="signature-line"></div>
            <p style="font-size: 12px;">Директор / Печать</p>
        </div>
    </div>
    
    <p style="margin-top: 50px; font-size: 12px; color: #666;">
        Документ создан автоматически системой TransHub {datetime.now().strftime('%d.%m.%Y %H:%M')}
    </p>
</body>
</html>
'''

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерация транспортных документов: накладные и доверенности
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        query_params = event.get('queryStringParameters', {}) or {}
        order_id = query_params.get('order_id')
        doc_type = query_params.get('type', 'waybill')
        
        if not order_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'order_id required'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute('''
                SELECT 
                    o.order_number, o.order_date, o.invoice_number, o.border_crossing,
                    o.route_from, o.route_to, o.carrier, o.delivery_address,
                    c.name as client_name,
                    v.license_plate, v.model as vehicle_model,
                    d.full_name as driver_name, d.phone as driver_phone, d.license_number as driver_license
                FROM orders o
                LEFT JOIN clients c ON o.client_id = c.id
                LEFT JOIN vehicles v ON o.vehicle_id = v.id
                LEFT JOIN drivers d ON o.driver_id = d.id
                WHERE o.id = %s
            ''', (order_id,))
            
            row = cur.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Order not found'}),
                    'isBase64Encoded': False
                }
            
            columns = [desc[0] for desc in cur.description]
            order_data = dict(zip(columns, row))
            
            if order_data.get('order_date'):
                order_data['order_date'] = order_data['order_date'].strftime('%d.%m.%Y')
            
            if doc_type == 'waybill':
                html_content = generate_waybill_html(order_data)
            elif doc_type == 'power_of_attorney':
                html_content = generate_power_of_attorney_html(order_data)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid document type'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': f'inline; filename="{doc_type}_{order_data["order_number"]}.html"'
                },
                'body': html_content,
                'isBase64Encoded': False
            }
        
        finally:
            cur.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
