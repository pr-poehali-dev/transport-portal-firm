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
                cur.execute('''
                    SELECT id, full_name as last_name, '' as first_name, '' as middle_name, 
                           phone, '' as passport_series, '' as passport_number, 
                           '' as passport_issued_by, NULL as passport_issue_date,
                           '' as license_series, license_number, 
                           '' as license_issued_by, NULL as license_issue_date, 
                           status 
                    FROM drivers 
                    ORDER BY full_name
                ''')
                columns = [desc[0] for desc in cur.description]
                drivers = [dict(zip(columns, row)) for row in cur.fetchall()]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'drivers': drivers}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'vehicles':
                cur.execute('''
                    SELECT id, license_plate, model, capacity, status, 
                           '' as vehicle_type, model as vehicle_brand, 
                           '' as trailer_plate, '' as body_type, 
                           '' as company_name, NULL as driver_id, 
                           license_plate as display_name
                    FROM vehicles 
                    ORDER BY license_plate
                ''')
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
            
            elif resource == 'activity_log':
                order_id = query_params.get('order_id')
                if order_id:
                    cur.execute('''
                        SELECT id, order_id, user_role, action_type, description, created_at
                        FROM activity_log
                        WHERE order_id = %s
                        ORDER BY created_at DESC
                    ''', (order_id,))
                else:
                    cur.execute('''
                        SELECT al.id, al.order_id, al.user_role, al.action_type, al.description, al.created_at,
                               o.order_number
                        FROM activity_log al
                        LEFT JOIN orders o ON al.order_id = o.id
                        ORDER BY al.created_at DESC
                        LIMIT 100
                    ''')
                
                columns = [desc[0] for desc in cur.description]
                logs = [dict(zip(columns, row)) for row in cur.fetchall()]
                
                for log in logs:
                    if log.get('created_at'):
                        log['created_at'] = log['created_at'].strftime('%d.%m.%Y %H:%M')
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'logs': logs}),
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
                        route_from, route_to, order_date, status, invoice_number, phone,
                        border_crossing, delivery_address, overload
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                    data.get('phone'),
                    data.get('border_crossing'),
                    data.get('delivery_address'),
                    data.get('overload')
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
                
                user_role = body_data.get('user_role', 'Пользователь')
                cur.execute('''
                    INSERT INTO activity_log (order_id, user_role, action_type, description)
                    VALUES (%s, %s, %s, %s)
                ''', (order_id, user_role, 'create_order', f'{user_role} создал заказ {data.get("order_number")}'))
                
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
                completed_by = body_data.get('completed_by', 'Пользователь')
                
                cur.execute('''
                    SELECT os.stage_name, os.order_id, o.order_number
                    FROM order_stages os
                    JOIN orders o ON os.order_id = o.id
                    WHERE os.id = %s
                ''', (stage_id,))
                stage_info = cur.fetchone()
                
                if is_completed:
                    cur.execute('''
                        UPDATE order_stages
                        SET is_completed = true, completed_by = %s, completed_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    ''', (completed_by, stage_id))
                    
                    if stage_info:
                        stage_name, order_id, order_number = stage_info
                        cur.execute('''
                            INSERT INTO activity_log (order_id, user_role, action_type, description)
                            VALUES (%s, %s, %s, %s)
                        ''', (order_id, completed_by, 'update_stage', f'{completed_by} выполнил этап "{stage_name}" в заказе {order_number}'))
                else:
                    cur.execute('''
                        UPDATE order_stages
                        SET is_completed = false, completed_by = NULL, completed_at = NULL
                        WHERE id = %s
                    ''', (stage_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'create_driver':
                data = body_data.get('data', {})
                full_name = f"{data.get('last_name', '')} {data.get('first_name', '')} {data.get('middle_name', '')}".strip()
                license_num = f"{data.get('license_series', '')} {data.get('license_number', '')}".strip()
                
                cur.execute('''
                    INSERT INTO drivers (full_name, phone, license_number, status)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                ''', (full_name, data.get('phone'), license_num, 'available'))
                
                driver_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': driver_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'create_vehicle':
                data = body_data.get('data', {})
                capacity = data.get('body_type', '')
                
                cur.execute('''
                    INSERT INTO vehicles (license_plate, model, capacity, status)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                ''', (data.get('license_plate'), data.get('vehicle_brand'), capacity, 'available'))
                
                vehicle_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': vehicle_id}),
                    'isBase64Encoded': False
                }
            
            elif action == 'create_client':
                data = body_data.get('data', {})
                cur.execute('''
                    INSERT INTO clients (name, contact_person, phone, email, address)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                ''', (data.get('name'), data.get('contact_person'), data.get('phone'), 
                      data.get('email'), data.get('address')))
                
                client_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'id': client_id}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            resource = body_data.get('resource')
            data = body_data.get('data', {})
            item_id = body_data.get('id')
            
            if resource == 'order':
                cur.execute('SELECT order_number, driver_id, vehicle_id FROM orders WHERE id = %s', (item_id,))
                old_data = cur.fetchone()
                old_order_number, old_driver_id, old_vehicle_id = old_data if old_data else (None, None, None)
                
                cur.execute('''
                    UPDATE orders SET
                        order_number = %s, client_id = %s, carrier = %s, vehicle_id = %s,
                        driver_id = %s, route_from = %s, route_to = %s, status = %s,
                        invoice_number = %s, phone = %s, border_crossing = %s,
                        delivery_address = %s, overload = %s
                    WHERE id = %s
                ''', (
                    data.get('order_number'), data.get('client_id'), data.get('carrier'),
                    data.get('vehicle_id'), data.get('driver_id'), data.get('route_from'),
                    data.get('route_to'), data.get('status'), data.get('invoice_number'),
                    data.get('phone'), data.get('border_crossing'), data.get('delivery_address'),
                    data.get('overload'), item_id
                ))
                
                user_role = body_data.get('user_role', 'Пользователь')
                changes = []
                if old_driver_id != data.get('driver_id'):
                    cur.execute('SELECT full_name FROM drivers WHERE id = %s', (data.get('driver_id'),))
                    driver_name = cur.fetchone()
                    if driver_name:
                        changes.append(f'назначил водителя {driver_name[0]}')
                if old_vehicle_id != data.get('vehicle_id'):
                    cur.execute('SELECT license_plate FROM vehicles WHERE id = %s', (data.get('vehicle_id'),))
                    vehicle_plate = cur.fetchone()
                    if vehicle_plate:
                        changes.append(f'назначил автомобиль {vehicle_plate[0]}')
                
                if changes:
                    description = f'{user_role} {" и ".join(changes)} в заказе {old_order_number}'
                    cur.execute('''
                        INSERT INTO activity_log (order_id, user_role, action_type, description)
                        VALUES (%s, %s, %s, %s)
                    ''', (item_id, user_role, 'update_order', description))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'driver':
                cur.execute('''
                    UPDATE drivers SET full_name = %s, phone = %s, license_number = %s, status = %s
                    WHERE id = %s
                ''', (data.get('full_name'), data.get('phone'), data.get('license_number'), 
                      data.get('status'), item_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'vehicle':
                cur.execute('''
                    UPDATE vehicles SET license_plate = %s, model = %s, capacity = %s, status = %s
                    WHERE id = %s
                ''', (data.get('license_plate'), data.get('model'), data.get('capacity'), 
                      data.get('status'), item_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            elif resource == 'client':
                cur.execute('''
                    UPDATE clients SET name = %s, contact_person = %s, phone = %s, email = %s, address = %s
                    WHERE id = %s
                ''', (data.get('name'), data.get('contact_person'), data.get('phone'), 
                      data.get('email'), data.get('address'), item_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            resource = body_data.get('resource')
            item_id = body_data.get('id')
            
            if resource == 'order':
                cur.execute('DELETE FROM order_stages WHERE order_id = %s', (item_id,))
                cur.execute('DELETE FROM orders WHERE id = %s', (item_id,))
            elif resource == 'driver':
                cur.execute('SELECT COUNT(*) FROM orders WHERE driver_id = %s', (item_id,))
                count = cur.fetchone()[0]
                if count > 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Невозможно удалить водителя. Он задействован в заказах.'}),
                        'isBase64Encoded': False
                    }
                cur.execute('DELETE FROM drivers WHERE id = %s', (item_id,))
            elif resource == 'vehicle':
                cur.execute('SELECT COUNT(*) FROM orders WHERE vehicle_id = %s', (item_id,))
                count = cur.fetchone()[0]
                if count > 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Невозможно удалить автомобиль. Он задействован в заказах.'}),
                        'isBase64Encoded': False
                    }
                cur.execute('DELETE FROM vehicles WHERE id = %s', (item_id,))
            elif resource == 'client':
                cur.execute('SELECT COUNT(*) FROM orders WHERE client_id = %s', (item_id,))
                count = cur.fetchone()[0]
                if count > 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Невозможно удалить перевозчика. Он задействован в заказах.'}),
                        'isBase64Encoded': False
                    }
                cur.execute('DELETE FROM clients WHERE id = %s', (item_id,))
            
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