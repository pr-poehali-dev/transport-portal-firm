import json
import os
import psycopg2
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления транспортным порталом: заказы, водители, автомобили, клиенты
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    path = event.get('path', '/')
    query_params = event.get('queryStringParameters', {}) or {}
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            resource = query_params.get('resource', 'orders')
            
            if resource == 'orders':
                cur.execute('''
                    SELECT 
                        o.id, o.order_number, o.order_date, o.status, o.invoice_number,
                        o.route_from, o.route_to, o.carrier, o.phone, o.border_crossing,
                        o.delivery_address, o.overload,
                        c.name as client_name,
                        v.license_plate, v.model as vehicle_model,
                        d.full_name as driver_name,
                        p.is_ready as fito_ready, p.received_date as fito_received
                    FROM orders o
                    LEFT JOIN clients c ON o.client_id = c.id
                    LEFT JOIN vehicles v ON o.vehicle_id = v.id
                    LEFT JOIN drivers d ON o.driver_id = d.id
                    LEFT JOIN phytosanitary_docs p ON o.id = p.order_id
                    ORDER BY o.order_date DESC
                ''')
                
                columns = [desc[0] for desc in cur.description]
                orders = [dict(zip(columns, row)) for row in cur.fetchall()]
                
                for order in orders:
                    if order.get('order_date'):
                        order['order_date'] = order['order_date'].strftime('%d.%m.%Y')
                    if order.get('fito_received'):
                        order['fito_received'] = order['fito_received'].strftime('%d.%m.%Y')
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'orders': orders}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'drivers':
                cur.execute('SELECT id, full_name, phone, license_number, status FROM drivers ORDER BY full_name')
                columns = [desc[0] for desc in cur.description]
                drivers = [dict(zip(columns, row)) for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'drivers': drivers}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'vehicles':
                cur.execute('SELECT id, license_plate, model, capacity, status FROM vehicles ORDER BY license_plate')
                columns = [desc[0] for desc in cur.description]
                vehicles = [dict(zip(columns, row)) for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'vehicles': vehicles}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'clients':
                cur.execute('SELECT id, name, contact_person, phone, email, address FROM clients ORDER BY name')
                columns = [desc[0] for desc in cur.description]
                clients = [dict(zip(columns, row)) for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'clients': clients}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'order_stages':
                order_id = query_params.get('order_id')
                if not order_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'order_id required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute('''
                    SELECT id, stage_name, stage_order, is_completed, completed_by, completed_at
                    FROM order_stages
                    WHERE order_id = %s
                    ORDER BY stage_order
                ''', (order_id,))
                
                columns = [desc[0] for desc in cur.description]
                stages = [dict(zip(columns, row)) for row in cur.fetchall()]
                
                for stage in stages:
                    if stage.get('completed_at'):
                        stage['completed_at'] = stage['completed_at'].strftime('%d.%m.%Y %H:%M')
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'stages': stages}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'stats':
                cur.execute("SELECT COUNT(*) FROM orders WHERE status != 'delivered'")
                active_orders = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM orders WHERE status = 'in_transit'")
                in_transit = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM drivers")
                total_drivers = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM vehicles")
                total_vehicles = cur.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'active_orders': active_orders,
                        'in_transit': in_transit,
                        'total_drivers': total_drivers,
                        'total_vehicles': total_vehicles
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_order':
                data = body_data.get('data', {})
                
                cur.execute('''
                    INSERT INTO orders (
                        order_number, client_id, carrier, vehicle_id, driver_id,
                        route_from, route_to, order_date, status, invoice_number, phone
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    data.get('order_number'),
                    data.get('client_id'),
                    data.get('carrier'),
                    data.get('vehicle_id'),
                    data.get('driver_id'),
                    data.get('route_from'),
                    data.get('route_to'),
                    data.get('order_date'),
                    'pending',
                    data.get('invoice_number'),
                    data.get('phone')
                ))
                
                order_id = cur.fetchone()[0]
                
                stages = [
                    'Заказ подтвержден поставщиком',
                    'Заказ отгружен',
                    'В пути к клиенту',
                    'Доставлен клиенту'
                ]
                
                for idx, stage_name in enumerate(stages, 1):
                    cur.execute('''
                        INSERT INTO order_stages (order_id, stage_name, stage_order, is_completed)
                        VALUES (%s, %s, %s, %s)
                    ''', (order_id, stage_name, idx, False))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'order_id': order_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'update_stage':
                stage_id = body_data.get('stage_id')
                is_completed = body_data.get('is_completed')
                completed_by = body_data.get('completed_by')
                
                cur.execute('''
                    UPDATE order_stages
                    SET is_completed = %s, completed_by = %s, completed_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (is_completed, completed_by, stage_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
