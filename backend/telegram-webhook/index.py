import json
import os
import psycopg2
import urllib.request
import urllib.parse
from typing import Dict, Any
# Force redeploy

def get_db_connection():
    dsn = os.environ['DATABASE_URL']
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обработка входящих сообщений от пользователей Telegram бота
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
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    try:
        update = json.loads(event.get('body', '{}'))
        
        if 'message' not in update:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        user = message.get('from', {})
        username = user.get('username', user.get('first_name', 'Пользователь'))
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            SELECT bot_token FROM telegram_bot_settings
            WHERE is_active = true
            ORDER BY id DESC LIMIT 1
        ''')
        
        bot_settings = cur.fetchone()
        
        if not bot_settings:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        bot_token = bot_settings[0]
        
        if text.startswith('/start'):
            parts = text.split()
            invite_code = parts[1] if len(parts) > 1 else None
            
            if invite_code:
                cur.execute('''
                    SELECT username, full_name FROM users 
                    WHERE invite_code = %s
                ''', (invite_code,))
                
                user_data = cur.fetchone()
                
                if user_data:
                    username, full_name = user_data
                    
                    cur.execute('''
                        UPDATE users 
                        SET telegram_chat_id = %s, telegram_connected_at = NOW()
                        WHERE invite_code = %s
                    ''', (str(chat_id), invite_code))
                    
                    conn.commit()
                    response_text = f'''✅ <b>Telegram успешно подключен!</b>

Привет, <b>{full_name}</b>!

Теперь вы будете получать уведомления о заказах согласно настройкам вашей роли.

Доступные команды:
/orders - Список активных заказов
/stats - Статистика по заказам
/help - Справка по командам'''
                else:
                    response_text = f'''❌ <b>Неверный код приглашения</b>

Код <code>{invite_code}</code> не найден или уже использован.

Обратитесь к администратору для получения нового кода.'''
            else:
                response_text = f'''👋 Добро пожаловать в TransHub!

Я бот для управления транспортными заказами.

<b>Как подключиться:</b>
1. Получите код приглашения у администратора
2. Отправьте команду: <code>/start ВАШ_КОД</code>

После подключения вы будете получать уведомления о заказах.

Ваш Chat ID: <code>{chat_id}</code>'''
            
        elif text.startswith('/orders'):
            cur.execute('''
                SELECT order_number, status, from_location, to_location
                FROM orders
                WHERE status NOT IN ('delivered', 'cancelled')
                ORDER BY order_date DESC
                LIMIT 10
            ''')
            
            orders = cur.fetchall()
            
            if orders:
                response_text = '📦 <b>Активные заказы:</b>\n\n'
                for order in orders:
                    order_num, status, from_loc, to_loc = order
                    status_emoji = {
                        'new': '🆕',
                        'loaded': '📦',
                        'in_transit': '🚛',
                        'unloaded': '📭'
                    }.get(status, '❓')
                    
                    response_text += f'{status_emoji} <b>{order_num}</b>\n'
                    response_text += f'   {from_loc or "?"} → {to_loc or "?"}\n\n'
            else:
                response_text = 'Нет активных заказов'
        
        elif text.startswith('/stats'):
            cur.execute('''
                SELECT 
                    COUNT(*) FILTER (WHERE status = 'new') as new_orders,
                    COUNT(*) FILTER (WHERE status = 'in_transit') as in_transit,
                    COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
                    COUNT(*) as total
                FROM orders
            ''')
            
            stats = cur.fetchone()
            new_cnt, transit_cnt, delivered_cnt, total_cnt = stats
            
            response_text = f'''📊 <b>Статистика заказов:</b>

🆕 Новых: {new_cnt}
🚛 В пути: {transit_cnt}
✅ Доставлено: {delivered_cnt}
📦 Всего: {total_cnt}'''
        
        elif text.startswith('/help'):
            response_text = '''ℹ️ <b>Справка по командам:</b>

/start - Начало работы
/orders - Список активных заказов
/stats - Статистика по заказам
/help - Эта справка

💡 Бот автоматически отправляет уведомления о:
• Создании заказа
• Отгрузке груза
• Начале перевозки
• Доставке груза'''
        
        else:
            response_text = f'Не понимаю команду "{text}". Используйте /help для списка команд.'
        
        send_telegram_message(bot_token, chat_id, response_text)
        
        cur.execute('''
            INSERT INTO telegram_received_messages (chat_id, username, message, command)
            VALUES (%s, %s, %s, %s)
        ''', (str(chat_id), username, text, text.split()[0] if text else None))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'error': str(e)}),
            'isBase64Encoded': False
        }

def send_telegram_message(bot_token: str, chat_id: int, message: str) -> Dict:
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
            return {'success': result.get('ok', False)}
    
    except Exception:
        return {'success': False}