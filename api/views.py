import json

import firebirdsql
from django.http import JsonResponse
import config
from time import perf_counter
from django.views.decorators.csrf import csrf_exempt

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
        LIST(DISTINCT T206.F4359 || ';' || T206.F4356 || ';' || T206.F4357 || ';' || T206.F4358) AS contacts,
        LIST(DISTINCT participants.ID || ';' || participants.F4886) AS participants,
        responsible.F4886 AS responsible,
        LIST(T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696, '*') AS tasks
        FROM T212
        LEFT JOIN T237 ON T212.F4948 = T237.ID
        LEFT JOIN T205 ON T212.F4540 = T205.ID
        LEFT JOIN T233 ON T233.F4963 = T212.ID
        LEFT JOIN T206 ON T233.F4870 = T206.ID
        LEFT JOIN T253 ON T212.ID = T253.F5024
        LEFT JOIN T3 participants ON T253.F5022 = participants.ID
        LEFT JOIN T3 responsible ON T212.F4546 = responsible.ID
        LEFT JOIN T218 ON T218.F4691 = T212.ID
        WHERE T212.ID > 2530 OR T212.ID = 2361
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
                    data2 = participant.split(';')
                    data.get('participants').append({'participantId': int(data2[0]), 'fullName': data2[1].strip()})
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

@csrf_exempt
def corParticipants(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)
    else:
        obj = json.loads(request.body)
        contractId = obj.get('contractId')
        participants = obj.get('participants')
        with firebirdsql.connect(
                host=config.host,
                database=config.database,
                user=config.user,
                password=config.password,
                charset=config.charset
        ) as con:
            cur = con.cursor()
            cur.execute(f'SELECT T253.F5022 FROM T253 WHERE T253.F5024 = {contractId}')
            List = cur.fetchall()
            List2 = []
            for participantId in List:
                List2.append(participantId[0])
            for data in participants:
                participantId = data.get('participantId')
                if participantId not in List2:
                    cur.execute(f'SELECT GEN_ID(GEN_T253, 1) FROM RDB$DATABASE')
                    Id = cur.fetchonemap().get('GEN_ID', None)
                    values = {
                        'id': Id,
                        'F5022': participantId,
                        'F5024': contractId,
                    }
                    sql = f"""
                    INSERT INTO T253 (
                    {', '.join(values.keys())}
                    ) VALUES (
                    {', '.join(f"'{value}'" for value in values.values())}
                    )
                    """
                    cur.execute(sql)
                    con.commit()
                else:
                    List2.remove(participantId)
            for participantId in List2:
                sql = f"""
                DELETE FROM T253 
                WHERE F5022 = '{participantId[0]}' AND F5024 = '{contractId}'
                """
                cur.execute(sql)
                con.commit()
            return JsonResponse({'ok': True})