import json
import os
import psycopg2
import urllib.request
import urllib.parse
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Отправка уведомлений в Telegram о событиях в транспортной системе
    '''
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    event_type = body_data.get('event_type')
    order_data = body_data.get('order_data', {})
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute('''
            SELECT bot_token
            FROM telegram_bot_settings
            WHERE is_active = true
            ORDER BY id DESC
            LIMIT 1
        ''')
        
        bot_settings = cur.fetchone()
        
        if not bot_settings:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'message': 'Telegram bot is not configured'}),
                'isBase64Encoded': False
            }
        
        bot_token = bot_settings[0]
        
        event_type_map = {
            'order_created': 'order_created',
            'order_loaded': 'order_loaded',
            'order_in_transit': 'order_in_transit',
            'order_delivered': 'order_delivered',
            'stage_completed': 'stage_completed'
        }
        
        notification_key = event_type_map.get(event_type)
        
        if not notification_key:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Unknown event type'}),
                'isBase64Encoded': False
            }
        
        cur.execute(f'''
            SELECT u.telegram_chat_id, u.full_name, u.role
            FROM users u
            JOIN roles r ON u.role = r.role_name
            WHERE u.telegram_chat_id IS NOT NULL 
              AND u.is_active = true
              AND r.permissions->'telegram_notifications'->>'{notification_key}' = 'true'
        ''')
        
        recipients = cur.fetchall()
        
        if not recipients:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'No recipients for this event type', 'sent': 0}),
                'isBase64Encoded': False
            }
        
        message = format_message(event_type, order_data)
        
        if not message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Could not format message'}),
                'isBase64Encoded': False
            }
        
        sent_count = 0
        for chat_id, full_name, role in recipients:
            result = send_telegram_message(bot_token, chat_id, message)
            
            cur.execute('''
                INSERT INTO telegram_sent_notifications (order_id, event_type, message, chat_id, is_success, error_message)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                order_data.get('order_id'),
                event_type,
                message,
                chat_id,
                result['success'],
                result.get('error')
            ))
            
            if result['success']:
                sent_count += 1
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'sent': sent_count, 'total_recipients': len(recipients)}),
            'isBase64Encoded': False
        }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Unknown event type'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()

def format_message(event_type: str, order_data: Dict) -> str:
    '''Форматирование сообщения в зависимости от типа события'''
    
    if event_type == 'order_created':
        return f'''🆕 <b>Создан новый заказ</b>

📋 Номер заказа: <b>{order_data.get('order_number', 'N/A')}</b>
📅 Дата: {order_data.get('order_date', 'N/A')}
👤 Заказчики: {order_data.get('customers', 'Не указано')}
🚛 Перевозчик: {order_data.get('carrier', 'Не указан')}
📍 Маршрут: {order_data.get('route', 'Не указан')}'''
    
    elif event_type == 'order_loaded':
        return f'''📦 <b>Груз отгружен</b>

📋 Заказ: <b>{order_data.get('order_number', 'N/A')}</b>
📄 Инвойс: {order_data.get('invoice', 'Не указан')}
🚗 Автомобиль: {order_data.get('vehicle', 'Не указан')}
🚚 Прицеп: {order_data.get('trailer', 'Не указан')}
👨‍✈️ Водитель: {order_data.get('driver', 'Не указан')}
📍 Откуда: {order_data.get('from_location', 'N/A')}'''
    
    elif event_type == 'order_in_transit':
        return f'''🚛 <b>Груз в пути</b>

📋 Заказ: <b>{order_data.get('order_number', 'N/A')}</b>
📄 Инвойс: {order_data.get('invoice', 'Не указан')}
🚗 Автомобиль: {order_data.get('vehicle', 'Не указан')} ({order_data.get('license_plate', 'N/A')})
🚚 Прицеп: {order_data.get('trailer', 'Не указан')}
📍 Маршрут: {order_data.get('from_location', 'N/A')} → {order_data.get('to_location', 'N/A')}
👨‍✈️ Водитель: {order_data.get('driver', 'Не указан')}'''
    
    elif event_type == 'order_delivered':
        return f'''✅ <b>Груз доставлен</b>

📋 Заказ: <b>{order_data.get('order_number', 'N/A')}</b>
📄 Инвойс: {order_data.get('invoice', 'Не указан')}
📍 Место доставки: {order_data.get('to_location', 'N/A')}
🚗 Автомобиль: {order_data.get('vehicle', 'Не указан')}
👨‍✈️ Водитель: {order_data.get('driver', 'Не указан')}'''
    
    elif event_type == 'stage_completed':
        return f'''✔️ <b>Этап выполнен</b>

📋 Заказ: <b>{order_data.get('order_number', 'N/A')}</b>
📌 Этап: {order_data.get('stage_name', 'N/A')}
👤 Выполнил: {order_data.get('completed_by', 'N/A')}'''
    
    return None

def send_telegram_message(bot_token: str, chat_id: str, message: str) -> Dict:
    '''Отправка сообщения в Telegram'''
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'HTML'
    }
    
    try:
        data_encoded = urllib.parse.urlencode(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data_encoded)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {'success': True}
            else:
                return {'success': False, 'error': result.get('description', 'Unknown error')}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}