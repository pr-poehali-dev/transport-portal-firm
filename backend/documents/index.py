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
    current_date = datetime.now().strftime('%d.%m.%Y')
    return f'''
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <style>
        @page {{ margin: 20mm; }}
        body {{ 
            font-family: "Times New Roman", Times, serif; 
            margin: 0; 
            padding: 15px;
            font-size: 11pt;
            line-height: 1.3;
        }}
        .form-header {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 9pt;
        }}
        .form-number {{
            text-align: right;
        }}
        .doc-title {{
            text-align: center;
            font-weight: bold;
            font-size: 13pt;
            margin: 20px 0 15px 0;
        }}
        .codes-table {{
            float: right;
            border-collapse: collapse;
            margin-left: 10px;
            margin-bottom: 10px;
            font-size: 9pt;
        }}
        .codes-table td {{
            border: 1px solid #000;
            padding: 3px 8px;
        }}
        .content {{
            clear: both;
            text-align: justify;
            font-size: 11pt;
        }}
        .field {{
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 150px;
            padding: 0 5px;
        }}
        .section {{
            margin: 15px 0;
        }}
        table.data-table {{
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 10pt;
        }}
        table.data-table td, table.data-table th {{
            border: 1px solid #000;
            padding: 4px;
        }}
        .signature-section {{
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }}
        .signature-block {{
            width: 45%;
        }}
        .signature-line {{
            border-bottom: 1px solid #000;
            margin: 15px 0 5px 0;
            height: 20px;
        }}
        .small-text {{
            font-size: 8pt;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="form-header">
        <div>
            <div>Типовая межотраслевая форма № М-2</div>
            <div class="small-text">Утверждена постановлением</div>
            <div class="small-text">Госкомстата России от 30.10.97 № 71а</div>
        </div>
        <table class="codes-table">
            <tr><td colspan="2" style="text-align: center; font-weight: bold;">Коды</td></tr>
            <tr><td>Форма по ОКУД</td><td>0315001</td></tr>
            <tr><td>по ОКПО</td><td>64834458</td></tr>
        </table>
    </div>

    <div class="doc-title">ДОВЕРЕННОСТЬ № {order_data['order_number']}-Д</div>
    
    <div class="content">
        <div class="section">
            <strong>Организация</strong> <span class="field">{order_data['carrier']}</span>
        </div>

        <div class="section">
            <strong>Доверенность выдана</strong> <span class="field">{order_data['driver_name']}</span>
        </div>

        <div class="section">
            <strong>Документ, удостоверяющий личность:</strong><br>
            Паспорт серия <span class="field" style="width: 80px;">____</span> 
            № <span class="field" style="width: 120px;">________</span><br>
            Выдан <span class="field" style="width: 400px;">____________________</span>
        </div>

        <div class="section">
            <strong>Водительское удостоверение:</strong> <span class="field">{order_data['driver_license']}</span>
        </div>

        <div class="section">
            <strong>на получение от</strong> <span class="field">{order_data['client_name']}</span>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 40%;">Наименование груза</th>
                    <th style="width: 20%;">Номер документа</th>
                    <th style="width: 20%;">Дата документа</th>
                    <th style="width: 20%;">Количество</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Груз согласно инвойсу</td>
                    <td>{order_data['invoice_number']}</td>
                    <td>{order_data['order_date']}</td>
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="4" style="height: 30px;">&nbsp;</td>
                </tr>
            </tbody>
        </table>

        <div class="section">
            <strong>Транспортное средство:</strong><br>
            Марка <span class="field">{order_data['vehicle_model']}</span><br>
            Государственный регистрационный знак <span class="field">{order_data['license_plate']}</span>
        </div>

        <div class="section">
            <strong>Маршрут перевозки:</strong><br>
            <span class="field" style="width: 100%;">{order_data['route_from']} → {order_data['route_to']}</span>
        </div>

        <div class="section">
            <strong>Пункт таможенного контроля:</strong> <span class="field">{order_data['border_crossing'] or '___________'}</span>
        </div>

        <div class="section">
            <strong>Срок действия доверенности:</strong> 
            с <span class="field">{current_date}</span> 
            по <span class="field">_________________</span>
        </div>

        <div class="section">
            <strong>Образец подписи лица, получившего доверенность:</strong>
            <div class="signature-line"></div>
        </div>

        <div class="signature-section">
            <div class="signature-block">
                <div><strong>Руководитель организации</strong></div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span style="width: 40%;">
                        <div class="signature-line"></div>
                        <div class="small-text" style="text-align: center;">подпись</div>
                    </span>
                    <span style="width: 55%;">
                        <div class="signature-line"></div>
                        <div class="small-text" style="text-align: center;">расшифровка подписи</div>
                    </span>
                </div>
            </div>
            
            <div class="signature-block">
                <div><strong>Главный бухгалтер</strong></div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <span style="width: 40%;">
                        <div class="signature-line"></div>
                        <div class="small-text" style="text-align: center;">подпись</div>
                    </span>
                    <span style="width: 55%;">
                        <div class="signature-line"></div>
                        <div class="small-text" style="text-align: center;">расшифровка подписи</div>
                    </span>
                </div>
            </div>
        </div>

        <div class="section" style="margin-top: 30px;">
            М.П. (печать организации)
        </div>
    </div>
    
    <div style="margin-top: 50px; font-size: 8pt; color: #999; text-align: center;">
        Документ сформирован {datetime.now().strftime('%d.%m.%Y %H:%M')} | TransHub
    </div>
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