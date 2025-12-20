import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления транспортным порталом: заказы, водители, автомобили, клиенты, настройки Telegram бота
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return options_response()
    
    query_params = event.get('queryStringParameters', {}) or {}
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            resource = query_params.get('resource', 'orders')
            
            if resource == 'orders':
                return orders.get_orders(cur)
            
            elif resource == 'drivers':
                return drivers.get_drivers(cur)
            
            elif resource == 'vehicles':
                return vehicles.get_vehicles(cur)
            
            elif resource == 'clients':
                return clients.get_clients(cur)
            
            elif resource == 'customer_addresses':
                customer_id = query_params.get('customer_id')
                return customers.get_customer_addresses(cur, customer_id)
            
            elif resource == 'order_stages':
                order_id = query_params.get('order_id')
                return orders.get_order_stages(cur, order_id)
            
            elif resource == 'stats':
                return activity.get_stats(cur)
            
            elif resource == 'activity_log':
                order_id = query_params.get('order_id')
                return activity.get_activity_log(cur, order_id)
            
            elif resource == 'last_order_number':
                direction = query_params.get('direction', 'EU')
                date_str = query_params.get('date', '')
                return orders.get_last_order_number(cur, direction, date_str)
            
            elif resource == 'users':
                return users.get_users(cur)
            
            elif resource == 'roles':
                return users.get_roles(cur)
            
            elif resource == 'customers':
                return customers.get_customers(cur)
            
            elif resource == 'telegram_settings':
                return settings.get_telegram_settings(cur)
            
            elif resource == 'active_sessions':
                section_name = query_params.get('section')
                return sessions.get_active_sessions(cur, section_name)
            
            elif resource == 'contract_applications':
                return contracts.get_contract_applications(cur)
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_multi_stage_order':
                return orders.create_multi_stage_order(cur, conn, body_data)
            
            elif action == 'update_order':
                return orders.update_order(cur, conn, body_data)
            
            elif action == 'delete_order':
                return orders.delete_order(cur, conn, body_data)
            
            elif action == 'update_fito_dates':
                return orders.update_fito_dates(cur, conn, body_data)
            
            elif action == 'update_stage':
                return orders.update_stage(cur, conn, body_data)
            
            elif action == 'create_driver':
                data = body_data.get('data', {})
                return drivers.create_driver(cur, conn, data)
            
            elif action == 'create_vehicle':
                data = body_data.get('data', {})
                return vehicles.create_vehicle(cur, conn, data)
            
            elif action == 'create_client':
                data = body_data.get('data', {})
                return clients.create_client(cur, conn, data)
            
            elif action == 'create_customer':
                data = body_data.get('data', {})
                return customers.create_customer(cur, conn, data)
            
            elif action == 'delete_customer':
                customer_id = body_data.get('customer_id')
                return customers.delete_customer(cur, conn, customer_id)
            
            elif action == 'create_customer_address':
                customer_id = body_data.get('customer_id')
                data = body_data.get('data', {})
                return customers.create_customer_address(cur, conn, customer_id, data)
            
            elif action == 'login':
                username = body_data.get('username')
                password = body_data.get('password')
                return users.login(cur, username, password)
            
            elif action == 'create_user':
                data = body_data.get('data', {})
                return users.create_user(cur, conn, data)
            
            elif action == 'update_role_permissions':
                data = body_data.get('data', {})
                role_name = body_data.get('role_name')
                return users.update_role_permissions(cur, conn, role_name, data.get('permissions'))
            
            elif action == 'save_telegram_settings':
                data = body_data.get('data', {})
                return settings.save_telegram_settings(cur, conn, data)
            
            elif action == 'test_telegram_bot':
                data = body_data.get('data', {})
                return settings.test_telegram_bot(data)
            
            elif action == 'regenerate_invite_code':
                user_id = body_data.get('user_id')
                return users.regenerate_invite_code(cur, conn, user_id)
            
            elif action == 'update_session':
                return sessions.update_session(cur, conn, body_data)
            
            elif action == 'remove_session':
                return sessions.remove_session(cur, conn, body_data)
            
            elif action == 'complete_stage':
                return orders.complete_stage(cur, conn, body_data)
            
            elif action == 'add_customs_point':
                return orders.add_customs_point(cur, conn, body_data)
            
            elif action == 'create_contract_application':
                data = body_data.get('data', {})
                return contracts.create_contract_application(cur, conn, data)
            
            elif action == 'update_contract_application':
                contract_id = body_data.get('contract_id')
                data = body_data.get('data', {})
                return contracts.update_contract_application(cur, conn, contract_id, data)
            
            elif action == 'delete_contract_application':
                contract_id = body_data.get('contract_id')
                return contracts.delete_contract_application(cur, conn, contract_id)
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            resource = body_data.get('resource')
            data = body_data.get('data', {})
            item_id = body_data.get('id')
            
            if resource == 'driver':
                return drivers.update_driver(cur, conn, item_id, data)
            
            elif resource == 'vehicle':
                return vehicles.update_vehicle(cur, conn, item_id, data)
            
            elif resource == 'customer':
                return customers.update_customer(cur, conn, item_id, data)
            
            elif resource == 'customer_address':
                return customers.update_customer_address(cur, conn, item_id, data)
            
            elif resource == 'client':
                return clients.update_client(cur, conn, item_id, data)
            
            elif resource == 'user':
                return users.update_user(cur, conn, item_id, data)
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            resource = body_data.get('resource')
            item_id = body_data.get('id')
            
            if resource == 'driver':
                return drivers.delete_driver(cur, conn, item_id)
            
            elif resource == 'vehicle':
                return vehicles.delete_vehicle(cur, conn, item_id)
            
            elif resource == 'client':
                return clients.delete_client(cur, conn, item_id)
            
            elif resource == 'user':
                return users.delete_user(cur, conn, item_id)
            
            elif resource == 'customer_address':
                return customers.delete_customer_address(cur, conn, item_id)
        
        return error_response(400, 'Unknown action or resource')
    
    finally:
        cur.close()
        conn.close()