import firebirdsql
from django.http import JsonResponse
import config
from datetime import date, datetime
# from time import perf_counter

def serialize_value(value):
    """Преобразует значения в формат, подходящий для JSON."""
    if isinstance(value, (date, datetime)):
        return value.isoformat()  # Преобразуем в строку формата YYYY-MM-DD или YYYY-MM-DDTHH:MM:SS
    return value

def getAgreements(request):
    # start = perf_counter()
    with firebirdsql.connect(
        host=config.host,
        database=config.database,
        user=config.user,
        password=config.password,
        charset=config.charset
    ) as con:
        cur = con.cursor()
        sql = """
        SELECT T212.ID AS ID, 
        T212.F4538 AS Contract_Num, 
        T212.F4544 AS Stage, 
        T212.F4946 AS Address, 
        T237.F4890 AS services, 
        T212.F4648 AS Path, 
        T212.F4566 AS Date_of_ending, 
        T205.F4332 AS Company, 
        '' AS Contact_Name,
        (SELECT LIST(T3.F4886) 
        FROM T253 
        LEFT JOIN T3 ON T253.F5022 = T3.ID 
        WHERE T212.ID = T253.F5024) AS participants, 
        T3.F4886 AS responsible 
        FROM T212 
        LEFT JOIN T237 ON T212.F4948 = T237.ID -- Направление работ
        LEFT JOIN T205 ON T212.F4540 = T205.ID -- Контрагент
        JOIN T3 ON T212.F4546 = T3.ID
        WHERE T212.ID > 2530
        """  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
        cur.execute(sql)
        result = cur.fetchall()
        # Преобразование результата в список словарей
        columns = ('id', 'contractNum', 'stage', 'address', 'services', 'pathToFolder', 'date', 'company', 'contacts', 'participants', 'responsible')
        json_result = [
            {col: serialize_value(value) for col, value in zip(columns, row)}
            for row in result
        ]  # Создаем список словарей с сериализацией значений
        for obj in json_result:
            title = obj.get('stage')
            stage = {'stage': {'title': title}}
            obj.update(stage)
            services = {'services': [{'title': obj.get('services')}]}
            obj.update(services)
            date = {'date': {'title': 'Срок работы', 'value': obj.get('date')}}
            obj.update(date)
            cur = con.cursor()
            sql = "select T206.F4359 as fullName, T206.F4356 as tel1, T206.F4357 as tel2, T206.F4358 as email from T233 left join T206 on T233.F4870 = T206.ID where T233.F4963 = " + str(obj.get('id'))
            cur.execute(sql)
            result = cur.fetchall()
            if len(result) > 0:
                contacts = {'contacts': []}
                for allData in result:
                    for data in allData:
                        if data is not None:
                            data.strip()
                    contacts.get('contacts').append({'fullName': allData[0], 'phone': [allData[1], allData[2]], 'post': '', 'email': allData[3]})
            else:
                contacts = {'contacts': [{'fullName': '', 'phone': ['', ''], 'post': '', 'email': ''}]}
            obj.update(contacts)
        # end = perf_counter()
        # print(end - start)
        return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})