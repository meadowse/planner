from django.http import JsonResponse
from django.shortcuts import render
import firebirdsql
import json
import config
from datetime import date, datetime


# Create your views here.
def getAgreements(request):
    with firebirdsql.connect(
            host=config.host,
            database=config.database,
            user=config.user,
            password=config.password,
            charset=config.charset
    ) as con:
        cur = con.cursor()
        sql = """
            SELECT T212.ID AS Contract_ID, T212.F4648 AS Path, T212.F4538 AS Contract_Num, T212.F4544 AS Stadia, T212.F4946 AS Adress, T237.F4890 AS Direction, T212.F4566 AS Date_of_ending, T205.F4332 AS Customer, T206.F4354 AS Contact_Name, T3.F4886 AS Employee_Name
            FROM T212 
            JOIN T237 ON T212.F4948 = T237.ID
            JOIN T205 ON T212.F4540 = T205.ID
            JOIN T233 ON T212.ID = T233.F4963  -- Соединяем T212 с T233 по ID договора
            JOIN T206 ON T233.F4870 = T206.ID  -- Соединяем T233 с T206 по ID контакта
            JOIN T253 ON T212.ID = T253.F5024  -- Соединяем T212 с T253 по ID договора
            JOIN T3 ON T253.F5022 = T3.ID  -- Соединяем T253 с T3 по ID сотрудника
        """  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
        cur.execute(sql)
        result = cur.fetchall()

        # Преобразование результата в список словарей
        columns = [column[0] for column in cur.description]  # Получаем названия столбцов
        json_result = [
            {col: serialize_value(value) for col, value in zip(columns, row)}
            for row in result
        ]  # Создаем список словарей с сериализацией значений

        # return json.dumps(json_result, ensure_ascii=False)  # Сериализуем в JSON
        return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})

def serialize_value(value):
    """Преобразует значения в формат, подходящий для JSON."""
    if isinstance(value, (date, datetime)):
        return value.isoformat()  # Преобразуем в строку формата YYYY-MM-DD или YYYY-MM-DDTHH:MM:SS
    return value
