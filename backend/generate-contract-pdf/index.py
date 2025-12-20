import json
import os
import base64
from datetime import datetime
from io import BytesIO
import psycopg2
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import boto3

def handler(event, context):
    """
    Генерирует PDF договора-заявки и возвращает URL
    Args: event - dict с httpMethod, body (contract_id)
          context - объект с атрибутами request_id и другими
    Returns: HTTP response с URL файла
    """
    method = event.get('httpMethod', 'GET')
    
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
    contract_id = body_data.get('contract_id')
    
    if not contract_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'contract_id required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    # Получаем данные договора с полными данными заказчика и перевозчика
    cur.execute('''
        SELECT 
            ca.contract_number, ca.contract_date,
            cust.nickname, cust.full_legal_name, cust.inn, cust.ogrn, 
            cust.legal_address, cust.bank_details, cust.director_name,
            cl.name as carrier_name, cl.full_legal_name as carrier_full_name,
            cl.inn as carrier_inn, cl.ogrn as carrier_ogrn,
            cl.legal_address as carrier_legal_address, cl.bank_details as carrier_bank_details,
            cl.director_name as carrier_director,
            ca.vehicle_type, ca.refrigerator, ca.cargo_weight, ca.cargo_volume,
            ca.transport_mode, ca.additional_conditions,
            ca.loading_address, ca.loading_date, ca.loading_contact,
            ca.unloading_address, ca.unloading_date, ca.unloading_contact,
            ca.payment_amount, ca.payment_without_vat, ca.payment_terms, ca.payment_documents,
            ca.driver_name, ca.driver_license, ca.driver_passport, ca.driver_passport_issued,
            ca.vehicle_number, ca.trailer_number, ca.transport_conditions
        FROM t_p96093837_transport_portal_fir.contract_applications ca
        LEFT JOIN t_p96093837_transport_portal_fir.customers cust ON ca.customer_id = cust.id
        LEFT JOIN t_p96093837_transport_portal_fir.clients cl ON ca.carrier_id = cl.id
        WHERE ca.id = %s
    ''', (contract_id,))
    
    row = cur.fetchone()
    cur.close()
    conn.close()
    
    if not row:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Contract not found'}),
            'isBase64Encoded': False
        }
    
    # Распаковываем данные
    data = {
        'contract_number': row[0], 'contract_date': row[1],
        'customer_nickname': row[2], 'customer_full_name': row[3],
        'customer_inn': row[4], 'customer_ogrn': row[5],
        'customer_address': row[6], 'customer_bank': row[7],
        'customer_director': row[8],
        'carrier_name': row[9], 'carrier_full_name': row[10],
        'carrier_inn': row[11], 'carrier_ogrn': row[12],
        'carrier_address': row[13], 'carrier_bank': row[14],
        'carrier_director': row[15],
        'vehicle_type': row[16], 'refrigerator': row[17],
        'cargo_weight': row[18], 'cargo_volume': row[19],
        'transport_mode': row[20], 'additional_conditions': row[21],
        'loading_address': row[22], 'loading_date': row[23], 'loading_contact': row[24],
        'unloading_address': row[25], 'unloading_date': row[26], 'unloading_contact': row[27],
        'payment_amount': row[28], 'payment_without_vat': row[29],
        'payment_terms': row[30], 'payment_documents': row[31],
        'driver_name': row[32], 'driver_license': row[33],
        'driver_passport': row[34], 'driver_passport_issued': row[35],
        'vehicle_number': row[36], 'trailer_number': row[37],
        'transport_conditions': row[38]
    }
    
    # Генерируем PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=15*mm, bottomMargin=15*mm)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Заголовок
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.black,
        spaceAfter=10,
        alignment=TA_CENTER
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=9,
        leading=11
    )
    
    # Шапка договора
    header_data = [
        [f"Договор-заявка №", f"{data['contract_number']}", "от", 
         datetime.strptime(str(data['contract_date']), '%Y-%m-%d').strftime('%d.%m.%Y')]
    ]
    
    header_table = Table(header_data, colWidths=[40*mm, 40*mm, 15*mm, 40*mm])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (1, 0), (1, 0), colors.red),
        ('TEXTCOLOR', (3, 0), (3, 0), colors.red),
    ]))
    
    story.append(header_table)
    story.append(Spacer(1, 5*mm))
    
    story.append(Paragraph("на перевозку грузов автомобильным транспортом", normal_style))
    story.append(Spacer(1, 3*mm))
    
    # Заказчик и перевозчик
    parties_data = [
        ["Заказчик:", data['customer_full_name'] or '', "Перевозчик:", data['carrier_director'] or '']
    ]
    parties_table = Table(parties_data, colWidths=[25*mm, 65*mm, 25*mm, 65*mm])
    parties_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.black),
    ]))
    story.append(parties_table)
    story.append(Spacer(1, 3*mm))
    
    # Тип ТС
    vehicle_data = [
        ["Требуемый тип ТС:", data['vehicle_type'] or '', 
         "рефрижератор" if data['refrigerator'] else '',
         str(data['cargo_weight']) if data['cargo_weight'] else '', "т.",
         str(data['cargo_volume']) if data['cargo_volume'] else '', "м3"],
        ["Особые условия:", data['transport_mode'] or '', data['additional_conditions'] or '', 
         "водителю быть на связи", "", "", ""]
    ]
    
    vehicle_table = Table(vehicle_data, colWidths=[35*mm, 30*mm, 30*mm, 15*mm, 10*mm, 15*mm, 15*mm])
    vehicle_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(vehicle_table)
    story.append(Spacer(1, 3*mm))
    
    # Погрузка
    loading_data = [
        ["Погрузка:", {"value": data['loading_address'] or '', "colspan": 6}],
        ["дата", datetime.strptime(str(data['loading_date']), '%Y-%m-%d').strftime('%d.%m.%Y') if data['loading_date'] else '', 
         "", "контактное лицо", data['loading_contact'] or '', "", ""]
    ]
    
    story.append(Paragraph("<b>Погрузка:</b>", normal_style))
    story.append(Paragraph(data['loading_address'] or '', normal_style))
    story.append(Spacer(1, 2*mm))
    
    # Разгрузка
    story.append(Paragraph("<b>Разгрузка:</b>", normal_style))
    story.append(Paragraph(data['unloading_address'] or '', normal_style))
    story.append(Spacer(1, 2*mm))
    
    # Оплата
    payment_data = [
        ["Оплата:", f"{data['payment_amount']} руб." if data['payment_amount'] else '',
         "без НДС" if data['payment_without_vat'] else '',
         data['payment_terms'] or '', data['payment_documents'] or '']
    ]
    payment_table = Table(payment_data, colWidths=[20*mm, 35*mm, 25*mm, 35*mm, 55*mm])
    payment_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.black),
    ]))
    story.append(payment_table)
    story.append(Spacer(1, 3*mm))
    
    # Данные водителя
    story.append(Paragraph(f"<b>Данные водителя:</b> {data['driver_name'] or ''}", normal_style))
    story.append(Paragraph(f"ВУ: {data['driver_license'] or ''}, Паспорт: {data['driver_passport'] or ''}", normal_style))
    story.append(Paragraph(f"{data['driver_passport_issued'] or ''}", normal_style))
    story.append(Spacer(1, 2*mm))
    
    # Данные ТС
    story.append(Paragraph(f"<b>Данные ТС:</b> {data['vehicle_number'] or ''} {data['trailer_number'] or ''}", normal_style))
    story.append(Spacer(1, 3*mm))
    
    # Условия перевозки
    story.append(Paragraph("<b>Условия перевозки:</b>", normal_style))
    story.append(Paragraph(data['transport_conditions'] or '', normal_style))
    story.append(Spacer(1, 5*mm))
    
    # Реквизиты сторон внизу
    story.append(Paragraph("<b>Заказчик:</b>", normal_style))
    story.append(Paragraph(data['customer_full_name'] or '', normal_style))
    story.append(Paragraph(f"ИНН {data['customer_inn'] or ''}", normal_style))
    story.append(Paragraph(data['customer_address'] or '', normal_style))
    story.append(Spacer(1, 3*mm))
    
    story.append(Paragraph("<b>Перевозчик:</b>", normal_style))
    story.append(Paragraph(data['carrier_full_name'] or '', normal_style))
    story.append(Paragraph(f"ИНН {data['carrier_inn'] or ''}", normal_style))
    story.append(Paragraph(data['carrier_address'] or '', normal_style))
    
    doc.build(story)
    
    # Загружаем в S3
    pdf_data = buffer.getvalue()
    buffer.close()
    
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    
    filename = f"contracts/contract_{contract_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    s3.put_object(
        Bucket='files',
        Key=filename,
        Body=pdf_data,
        ContentType='application/pdf'
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'url': cdn_url}),
        'isBase64Encoded': False
    }