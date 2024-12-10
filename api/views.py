import firebirdsql
from django.http import JsonResponse
import config
from time import perf_counter

def getAgreements(request):
    start = perf_counter()
    with firebirdsql.connect(
        host=config.host,
        database=config.database,
        user=config.user,
        password=config.password,
        charset=config.charset
    ) as con:
        cur = con.cursor()
        sql = """
        SELECT T212.ID AS id, 
        T212.F4538 AS contractNum, 
        T212.F4544 AS stage, 
        T212.F4946 AS address, 
        T237.F4890 AS services, 
        T212.F4648 AS path, 
        T212.F4610 AS dateOfStart, 
        T212.F4566 AS dateOfEnding, 
        T205.F4332 AS company, 
        LIST(DISTINCT CASE WHEN T206.F4359 IS NULL THEN '' ELSE T206.F4359 END || ';' || 
        CASE WHEN T206.F4356 IS NULL THEN '' ELSE T206.F4356 END || ';' || 
        CASE WHEN T206.F4357 IS NULL THEN '' ELSE T206.F4357 END || ';' || 
        CASE WHEN T206.F4358 IS NULL THEN '' ELSE T206.F4358 END) AS contacts, 
        LIST(DISTINCT participants.F4886) AS participants, 
        responsible.F4886 AS responsible, 
        LIST(CASE WHEN T218.F4695 IS NULL THEN '' ELSE T218.F4695 END || ';' || 
        CASE WHEN T218.F5569 IS NULL THEN (CASE WHEN T218.F4970 IS NULL THEN '' ELSE T218.F4970 END) ELSE T218.F5569 END || ';' || 
        CASE WHEN T218.F4696 IS NULL THEN '' ELSE T218.F4696 END, '*') AS tasks 
        FROM T212 
        LEFT JOIN T237 ON T212.F4948 = T237.ID 
        LEFT JOIN T205 ON T212.F4540 = T205.ID 
        LEFT JOIN T233 ON T233.F4963 = T212.ID 
        LEFT JOIN T206 ON T233.F4870 = T206.ID 
        LEFT JOIN T253 ON T212.ID = T253.F5024 
        LEFT JOIN T3 participants ON T253.F5022 = participants.ID 
        LEFT JOIN T3 responsible ON T212.F4546 = responsible.ID 
        LEFT JOIN T218 ON T218.F4691 = T212.ID 
        WHERE T212.ID > 2530 
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 12
        """  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
        cur.execute(sql)
        result = cur.fetchall()
        # Преобразование результата в список словарей
        columns = ('id', 'contractNum', 'stage', 'address', 'services', 'pathToFolder', 'dateOfStart', 'dateOfEnding', 'company', 'contacts', 'participants', 'responsible', 'tasks')
        json_result = [
            {col: value for col, value in zip(columns, row)}
            for row in result
        ]  # Создаем список словарей с сериализацией значений
        for obj in json_result:
            stage = {'stage': {'title': obj.get('stage')}}
            obj.update(stage)
            services = {'services': [{'title': obj.get('services')}]}
            obj.update(services)
            participants = obj.get('participants')
            if participants is not None:
                participants = participants.split(',')
                data = {'participants': []}
                for participant in participants:
                    data.get('participants').append({'fullName': participant.strip()})
                obj.update(data)
            responsible = {'responsible': {'fullName': obj.get('responsible').strip()}}
            obj.update(responsible)
            dateOfStart = {'dateOfStart': {'title': '', 'value': obj.get('dateOfStart')}}
            obj.update(dateOfStart)
            dateOfEnding = {'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding')}}
            obj.update(dateOfEnding)
            Str = obj.get('contacts')
            contacts = {'contacts': []}
            List = Str.split(',')
            for allData in List:
                list2 = allData.split(';')
                flag = 0
                for data in list2:
                    data.strip()
                    if data == '':
                        flag += 1
                if flag < 4:
                    contacts.get('contacts').append({'fullName': list2[0], 'phone': [list2[1], list2[2]], 'post': '', 'email': list2[3]})
            obj.update(contacts)
            Str = obj.get('tasks')
            tasks = {'tasks': []}
            List = Str.split('*')
            for allData in List:
                list2 = allData.split(';')
                list2[0].strip()
                if list2[0] == '' and list2[1] == '' and list2[2] == '':
                    continue
                else:
                    tasks.get('tasks').append({'title': list2[0], 'dateOfStart': list2[1], 'dateOfEnding': list2[2]})
            obj.update(tasks)
        end = perf_counter()
        print(end - start)
        return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})

def employees(request):
    # start = perf_counter()
    with firebirdsql.connect(
            host=config.host,
            database=config.database,
            user=config.user,
            password=config.password,
            charset=config.charset
    ) as con:
        cur = con.cursor()
        sql = """select T3.ID as id, 
        T3.F4886 as fullName, 
        T4.F7 as post, 
        T3.F4887SRC as photo, 
        T3.F14 as phone, 
        T3.F12 as email 
        from T3 
        left join T4 on T3.F11 = T4.ID 
        where T3.F5383 = 1"""
        cur.execute(sql)
        result = cur.fetchall()
        # Преобразование результата в список словарей
        columns = ('id', 'fullName', 'post', 'photo', 'phone', 'email')
        json_result = [
            {col: value for col, value in zip(columns, row)}
            for row in result
        ]  # Создаем список словарей с сериализацией значений
        # end = perf_counter()
        # print(end - start)
        return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})