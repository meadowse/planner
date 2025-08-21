import json
import firebirdsql
from django.http import JsonResponse
from time import perf_counter
from django.views.decorators.csrf import csrf_exempt
from .config import *
import datetime
import requests

def getAgreements(request):
    start = perf_counter()
    with firebirdsql.connect(
        host=host,
        database=database,
        user=user,
        password=password,
        charset=charset
    ) as con:
        cur = con.cursor()
        sql = """
        SELECT T212.ID AS contractId,
        T212.F4538 AS contractNum,
        T212.F4544 AS stage,
        T212.F4946 AS address,
        T237.F4890 AS services,
        T212.F4648 AS path,
        T212.F4610 AS dateOfStart,
        T212.F4566 AS dateOfEnding,
        T205.F4331 AS customer,
        LIST(DISTINCT T206.F4359 || ';' || T206.F4356 || ';' || T206.F4357 || ';' || T206.F4358, '*') AS contacts,
        LIST(DISTINCT participants.F16 || ';' || participants.F4886) AS participants,
        responsible.F16 AS idResponsible,
        responsible.F4886 AS responsible,
        manager.F16 AS idManager,
        manager.F4886 AS manager,
        LIST(DISTINCT T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F4697 || ';' || director.F16 || ';' || executor.F16 || ';' || T218.ID || ';' || director.F4886 || ';' || executor.F4886 || ';' || CASE WHEN T218.F5646 IS NULL THEN '' ELSE T218.F5646 END, '*') AS tasks
        FROM T212
        LEFT JOIN T237 ON T212.F4948 = T237.ID
        LEFT JOIN T205 ON T212.F4540 = T205.ID
        LEFT JOIN T233 ON T233.F4963 = T212.ID
        LEFT JOIN T206 ON T233.F4870 = T206.ID
        LEFT JOIN T253 ON T212.ID = T253.F5024
        LEFT JOIN T3 participants ON T253.F5022 = participants.ID
        LEFT JOIN T3 responsible ON T212.F4546 = responsible.ID
        LEFT JOIN T3 manager ON T212.F4950 = manager.ID
        LEFT JOIN T218 ON T218.F4691 = T212.ID
        LEFT JOIN T3 director ON T218.F4693 = director.ID
        LEFT JOIN T3 executor ON T218.F4694 = executor.ID
        WHERE T212.ID > 3050
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15
        """  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
        cur.execute(sql)
        result = cur.fetchall()
        # Преобразование результата в список словарей
        columns = ('contractId', 'contractNum', 'stage', 'address', 'services', 'pathToFolder', 'dateOfStart',
                   'dateOfEnding', 'company', 'contacts', 'participants', 'idResponsible', 'responsible',
                   'idManager', 'manager', 'tasks')
        json_result = [
            {col: value for col, value in zip(columns, row)}
            for row in result
        ]  # Создаем список словарей с сериализацией значений
        today = datetime.date.today()
        for obj in json_result:
            status = obj.get('stage')
            stage = {'stage': {'title': status}}
            obj.update(stage)
            services = {'services': [{'title': obj.get('services')}]}
            obj.update(services)
            participants = obj.get('participants')
            if participants is not None:
                participants = participants.split(',')
                data = {'participants': []}
                for participant in participants:
                    data2 = participant.split(';')
                    data.get('participants').append({'participantId': data2[0], 'fullName': data2[1].strip()})
                obj.update(data)
            manager = obj.get('manager')
            if manager is not None:
                manager = {
                    'manager': {'idManager': obj.get('idManager'), 'fullName': manager.strip()}}
            else:
                manager = {'manager': {'idManager': obj.get('idManager'), 'fullName': manager}}
            obj.update(manager)
            obj.pop('idManager')
            responsible = obj.get('responsible')
            if responsible is not None:
                responsible = {'responsible': {'idResponsible': obj.get('idResponsible'), 'fullName': responsible.strip()}}
            else:
                responsible = {'responsible': {'idResponsible': obj.get('idResponsible'), 'fullName': responsible}}
            obj.update(responsible)
            obj.pop('idResponsible')
            if obj.get('dateOfStart') is not None:
                dateOfStart = {'dateOfStart': {'title': '', 'value': datetime.datetime.strftime(obj.get('dateOfStart'), '%Y/%m/%d')}}
            else:
                dateOfStart = {'dateOfStart': {'title': '', 'value': obj.get('dateOfStart')}}
            obj.update(dateOfStart)
            dateOfEnding = obj.get('dateOfEnding')
            if dateOfEnding is not None:
                if status == 'В работе' and dateOfEnding < today:
                    dateOfEnding = {
                        'dateOfEnding': {'title': 'Срок работы', 'value': datetime.datetime.strftime(obj.get('dateOfEnding'), '%Y-%m-%d'), 'expired': True}}
                else:
                    dateOfEnding = {
                        'dateOfEnding': {'title': 'Срок работы', 'value': datetime.datetime.strftime(obj.get('dateOfEnding'), '%Y-%m-%d'), 'expired': False}}
            else:
                dateOfEnding = {
                    'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'), 'expired': False}}
            obj.update(dateOfEnding)
            Str = obj.get('contacts')
            contacts = {'contacts': []}
            if Str is not None:
                List = Str.split('*')
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
            if Str is not None:
                List = Str.split('*')
                for allData in List:
                    list2 = allData.split(';')
                    list2[0].strip()
                    if list2[0] == '' and list2[1] == '' and list2[2] == '':
                        continue
                    elif list2[9] == '':
                        tasks.get('tasks').append(
                            {'id': list2[6], 'title': list2[0], 'dateOfStart': list2[1],
                             'dateOfEnding': list2[2], 'done': list2[3],
                             'director': {'mmId': list2[4], 'fullName': list2[7]},
                             'executor': {'mmId': list2[5], 'fullName': list2[8]}, 'tasks': []})
                for allData in List:
                    list2 = allData.split(';')
                    list2[0].strip()
                    if list2[0] == '' and list2[1] == '' and list2[2] == '':
                        continue
                    elif list2[9] != '':
                        i = 0
                        for item in tasks.get('tasks'):
                            if list2[9] == item.get('id'):
                                tasks.get('tasks')[i].get('tasks').append(
                                    {'id': list2[6], 'title': list2[0], 'dateOfStart': list2[1],
                                     'dateOfEnding': list2[2], 'done': list2[3],
                                     'director': {'mmId': list2[4], 'fullName': list2[7]},
                                     'executor': {'mmId': list2[5], 'fullName': list2[8]}})
                            i += 1
            obj.update(tasks)
        end = perf_counter()
        print(end - start)
        return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})

def employees(request):
    # start = perf_counter()
    with firebirdsql.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            charset=charset
    ) as con:
        cur = con.cursor()
        sql = """select T3.ID as id, 
        T3.F16 as mmId,
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
        columns = ('id', 'mmId', 'fullName', 'post', 'photo', 'phone', 'email')
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
                host=host,
                database=database,
                user=user,
                password=password,
                charset=charset
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
                WHERE F5022 = '{participantId}' AND F5024 = '{contractId}'
                """
                cur.execute(sql)
                con.commit()
            return JsonResponse({'ok': True})

@csrf_exempt
def getAgreement(request):
    start = perf_counter()
    if request.method != "POST":
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)
    else:
        obj = json.loads(request.body)
        contractId = obj.get('contractId')
        with firebirdsql.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            charset=charset
        ) as con:
            cur = con.cursor()
            sql = f"""
            SELECT T212.ID AS id,
            T212.F4538 AS contractNum,
            T212.F4544 AS stage,
            T212.F4946 AS address,
            T237.F4890 AS services,
            T212.F4648 AS path,
            T212.F4610 AS dateOfStart,
            T212.F4566 AS dateOfEnding,
            T205.F4332 AS company,
            LIST(DISTINCT T206.F4359 || ';' || T206.F4356 || ';' || T206.F4357 || ';' || T206.F4358, '*') AS contacts,
            LIST(DISTINCT participants.ID || ';' || participants.F16 || ';' || participants.F4886, '*') AS participants,
            responsible.ID AS responsibleId,
            responsible.F16 AS responsibleMMId,
            responsible.F4886 AS responsible,
            manager.ID AS managerId,
            manager.F16 AS managerMMId,
            manager.F4886 AS manager,
            LIST(T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696, '*') AS tasks, 
            T212.F4644 AS channelId
            FROM T212
            LEFT JOIN T237 ON T212.F4948 = T237.ID
            LEFT JOIN T205 ON T212.F4540 = T205.ID
            LEFT JOIN T233 ON T233.F4963 = T212.ID
            LEFT JOIN T206 ON T233.F4870 = T206.ID
            LEFT JOIN T253 ON T212.ID = T253.F5024
            LEFT JOIN T3 participants ON T253.F5022 = participants.ID
            LEFT JOIN T3 responsible ON T212.F4546 = responsible.ID
            LEFT JOIN T3 manager ON T212.F4950 = manager.ID
            LEFT JOIN T218 ON T218.F4691 = T212.ID
            WHERE T212.ID = {contractId}
            GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 19
            """  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
            cur.execute(sql)
            result = cur.fetchall()
            # Преобразование результата в список словарей
            columns = ('id', 'contractNum', 'stage', 'address', 'services', 'pathToFolder', 'dateOfStart',
                       'dateOfEnding', 'company', 'contacts', 'participants', 'responsibleId', 'responsibleMMId',
                       'responsible', 'managerId', 'managerMMId', 'manager', 'tasks', 'channelId')
            json_result = [
                {col: value for col, value in zip(columns, row)}
                for row in result
            ]  # Создаем список словарей с сериализацией значений
            today = datetime.date.today()
            for obj in json_result:
                status = obj.get('stage')
                stage = {'stage': {'title': status}}
                obj.update(stage)
                services = {'services': [{'title': obj.get('services')}]}
                obj.update(services)
                participants = obj.get('participants')
                if participants is not None:
                    participants = participants.split('*')
                    data = {'participants': []}
                    for participant in participants:
                        data2 = participant.split(';')
                        data.get('participants').append({'id': data2[0], 'mmId': data2[1], 'fullName': data2[2].strip()})
                    obj.update(data)
                responsible = obj.get('responsible')
                if responsible is not None:
                    responsible = {'responsible': {'id': obj.get('responsibleId'), 'mmId': obj.get('responsibleMMId'), 'fullName': responsible.strip()}}
                else:
                    responsible = {'responsible': {'id': obj.get('responsibleId'), 'mmId': obj.get('responsibleMMId'), 'fullName': responsible}}
                obj.update(responsible)
                obj.pop('responsibleId')
                obj.pop('responsibleMMId')
                manager = obj.get('manager')
                if manager is not None:
                    manager = {'manager': {'id': obj.get('managerId'), 'mmId': obj.get('managerMMId'),
                                                   'fullName': manager.strip()}}
                else:
                    manager = {'manager': {'id': obj.get('managerId'), 'mmId': obj.get('managerMMId'),
                                                   'fullName': manager}}
                obj.update(manager)
                obj.pop('managerId')
                obj.pop('managerMMId')
                dateOfStart = {'dateOfStart': {'title': '', 'value': obj.get('dateOfStart')}}
                obj.update(dateOfStart)
                dateOfEnding = obj.get('dateOfEnding')
                if dateOfEnding is not None:
                    if status == 'В работе' and dateOfEnding < today:
                        dateOfEnding = {
                            'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'), 'expired': True}}
                    else:
                        dateOfEnding = {
                            'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'),
                                             'expired': False}}
                else:
                    dateOfEnding = {
                        'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'), 'expired': False}}
                obj.update(dateOfEnding)
                Str = obj.get('contacts')
                contacts = {'contacts': []}
                if Str is not None:
                    List = Str.split('*')
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
                if Str is not None:
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

@csrf_exempt
def addPhoto(request):
    """Process images uploaded by users"""
    if request.method == 'POST':
        data = request.FILES.get('image').read()
        with open(f"images/{request.POST.get('title')}.{request.FILES.get('image').name.split('.')[1]}", mode="wb") as new:
            new.write(data)
        return JsonResponse({'ok': True}, status=200)
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getTypesWork(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        contractId = obj.get('contractId')
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = f"""SELECT 
                F4601 AS NUM, 
                F4600 AS TYPE_OF_WORK, 
                F4597 AS TERM, 
                F4607 AS DONE, 
                F4608 AS DATE_OF_DONE 
                FROM T214 WHERE F4606 = {contractId}"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = ('number', 'typeWork', 'deadline', 'done', 'dateDone')
                json_result = [
                    {col: value for col, value in zip(columns, row)}
                    for row in result
                ]  # Создаем список словарей с сериализацией значений
                today = datetime.date.today()
                for obj in json_result:
                    dateDone = obj.get('dateDone')
                    if dateDone is not None:
                        if obj.get('done') == 0 and dateDone < today:
                            dateDone = {
                                'dateDone': {'value': dateDone,
                                                 'expired': True}}
                        else:
                            dateDone = {
                                'dateDone': {'value': dateDone,
                                                 'expired': False}}
                    else:
                        dateDone = {
                            'dateDone': {'value': dateDone,
                                             'expired': False}}
                    obj.update(dateDone)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить работы договора {ex}")
                result = None
                return result
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getTasksContracts(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        contractId = obj.get('contractId')
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = f"""SELECT
                T218.ID, 
                T218.F4691 AS CONRACT_ID, 
                T218.F4695 AS TASK,
                T218.F5724 AS ID_OF_TYPE_OF_WORK,
                T218.F5569 AS dateStart,
                T218.F4696 AS DEADLINE,
                DIRECTOR.ID AS ID_OF_DIRECTOR,
                DIRECTOR.F16 AS ID_MM_DIRECTOR,
                DIRECTOR.F4886 AS DIRECTOR_NAME,
                EXECUTOR.ID AS ID_OF_EXECUTOR,
                EXECUTOR.F16 AS ID_MM_EXECUTOR,
                EXECUTOR.F4886 AS EXECUTOR_NAME, 
                T218.F4697 AS DONE,
                T218.F5646 AS parent
                FROM T218
                LEFT JOIN T3 AS DIRECTOR ON T218.F4693 = DIRECTOR.ID
                LEFT JOIN T3 AS EXECUTOR ON T218.F4694 = EXECUTOR.ID
                WHERE T218.F4691 = {contractId}"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                'id', 'contractId', 'task', 'idTypeWork', 'dateStart', 'deadlineTask', 'idDirector', 'idMMDirector',
                'directorFIO', 'idExecutor', 'idMMExecutor', 'executorFIO', 'done', 'parent')
                json_result = [
                    {col: value for col, value in zip(columns, row)}
                    for row in result
                ]  # Создаем список словарей с сериализацией значений
                today = datetime.date.today()
                copy = []
                for row in json_result:
                    status = row.get('done')
                    row.update({'director': {'id': row.get('idDirector'), 'mmId': row.get('idMMDirector'),
                                             'fullName': row.get('directorFIO')}})
                    row.update({'executor': {'id': row.get('idExecutor'), 'mmId': row.get('idMMExecutor'),
                                             'fullName': row.get('executorFIO')}})
                    deadlineTask = row.get('deadlineTask')
                    if deadlineTask is not None:
                        if status == 0 and deadlineTask < today:
                            deadlineTask = {
                                'deadlineTask': {'title': 'Срок работы',
                                                 'value': datetime.datetime.strftime(deadlineTask, '%Y-%m-%d'),
                                                 'expired': True}}
                        else:
                            deadlineTask = {
                                'deadlineTask': {'title': 'Срок работы',
                                                 'value': datetime.datetime.strftime(deadlineTask, '%Y-%m-%d'),
                                                 'expired': False}}
                    else:
                        deadlineTask = {
                            'deadlineTask': {'title': 'Срок работы', 'value': deadlineTask,
                                             'expired': False}}
                    row.update(deadlineTask)
                    dateStart = row.get('dateStart')
                    if dateStart is not None:
                        dateStart = {'dateStart': datetime.datetime.strftime(dateStart, '%Y-%m-%d')}
                    else:
                        dateStart = {'dateStart': dateStart}
                    row.update(dateStart)
                    row.pop('idDirector')
                    row.pop('idExecutor')
                    row.pop('idMMDirector')
                    row.pop('idMMExecutor')
                    row.pop('executorFIO')
                    row.pop('directorFIO')
                    if row.get('parent') is None:
                        row.pop('parent')
                        subtasks = {'subtasks': []}
                        row.update(subtasks)
                        copy.append(row)
                for row in json_result:
                    for item in copy:
                        if item.get('id') == row.get('parent'):
                            item.get('subtasks').append(row)
                return JsonResponse(copy, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить задачи по договору {ex}")
                result = None
                return result
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getTask(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        taskId = obj.get('taskId')
        parentId = obj.get('parentId')
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                if parentId is None:
                    parent = ''
                else:
                    parent = f'T218.ID = {parentId} OR'
                sql = f"""SELECT
                                T218.ID, 
                                T218.F4691 AS CONRACT_ID, 
                                T218.F4695 AS TASK,
                                T218.F5724 AS ID_OF_TYPE_OF_WORK,
                                T218.F5569 AS dateStart,
                                T218.F4696 AS DEADLINE,
                                DIRECTOR.ID AS ID_OF_DIRECTOR,
                                DIRECTOR.F16 AS ID_MM_DIRECTOR,
                                DIRECTOR.F4886 AS DIRECTOR_NAME,
                                EXECUTOR.ID AS ID_OF_EXECUTOR,
                                EXECUTOR.F16 AS ID_MM_EXECUTOR,
                                EXECUTOR.F4886 AS EXECUTOR_NAME, 
                                T218.F4697 AS DONE,
                                T218.F5646 AS parentId
                                FROM T218
                                LEFT JOIN T3 AS DIRECTOR ON T218.F4693 = DIRECTOR.ID
                                LEFT JOIN T3 AS EXECUTOR ON T218.F4694 = EXECUTOR.ID
                                WHERE {parent} T218.F5646 = {taskId}"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                    'id', 'contractId', 'task', 'idTypeWork', 'dateStart', 'deadlineTask', 'idDirector', 'idMMDirector',
                    'directorFIO', 'idExecutor', 'idMMExecutor', 'executorFIO', 'done', 'parentId')
                json_result = [
                    {col: value for col, value in zip(columns, row)}
                    for row in result
                ]  # Создаем список словарей с сериализацией значений
                for task in json_result:
                    dateStart = task.get('dateStart')
                    if dateStart is None:
                        dateStart = {'dateStart': dateStart}
                    else:
                        dateStart = {'dateStart': datetime.datetime.strftime(dateStart, '%Y-%m-%d')}
                    task.update(dateStart)
                    deadlineTask = task.get('deadlineTask')
                    if deadlineTask is None:
                        deadlineTask = {'deadlineTask': deadlineTask}
                    else:
                        deadlineTask = {'deadlineTask': datetime.datetime.strftime(deadlineTask, '%Y-%m-%d')}
                    task.update(deadlineTask)
                jsonResult = {'parent': {}, 'daughters': []}
                for row in json_result:
                    if row.get('id') == parentId:
                        jsonResult.get('parent').update(row)
                    else:
                        jsonResult.get('daughters').append(row)
                return JsonResponse(jsonResult, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить задачи по задаче {taskId}: {ex}")
                return ex
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def addTask(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        contractId = obj.get('contractId')
        task = obj.get('task')
        comment = obj.get('comment')
        typeWorkId = obj.get('typeWorkId')
        dateStart = obj.get('dateStart')
        deadline = obj.get('deadline')
        directorId = obj.get('directorId')
        executorId = obj.get('executorId')
        parenId = obj.get('parentId')
        with firebirdsql.connect(host=host, database=database, user=user, password=password,
                                 charset=charset) as con:
            cur = con.cursor()
            cur.execute(f'SELECT GEN_ID(GEN_T218, 1) FROM RDB$DATABASE')
            ID = cur.fetchonemap().get('GEN_ID', None)
            # Подготовка значений для вставки
            values = {
                'id': ID,
                'F4691': contractId,
                'F4695': task,
                'F4698': comment,
                'F5724': typeWorkId,
                'F4970': dateStart,
                'F5569': dateStart,
                'F4696': deadline,
                'F4693': directorId,  # должно быть ID пользователя
                'F4694': executorId,
                'F4697': 0,
                'F5646': parenId,
            }
            # Преобразование значений в SQL-формат
            sql_values = []
            for key, value in values.items():
                if value is None:
                    sql_values.append('NULL')
                elif isinstance(value, (int, float)):  # Числовые значения
                    sql_values.append(str(value))
                elif isinstance(value, str):  # Строковые значения
                    sql_values.append(f"'{value}'")
                else:
                    raise ValueError(f"Unsupported type for value: {value}")
            # Формирование SQL-запроса
            sql = f"""INSERT INTO T218 ({', '.join(values.keys())}) VALUES ({', '.join(sql_values)})"""
            cur.execute(sql)
            con.commit()
            sql = f'select F4644 from T212 where ID = {contractId}'
            cur.execute(sql)
            idChannel = cur.fetchone()
            print(idChannel)
        return JsonResponse({'status': 'Ok'}, status=200)
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def editTask(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        taskId = obj.get('taskId')
        contractId = obj.get('contractId')
        task = obj.get('task')
        comment = obj.get('comment')
        typeWorkId = obj.get('typeWorkId')
        dateStart = obj.get('dateStart')
        deadline = obj.get('deadline')
        directorId = obj.get('directorId')
        executorId = obj.get('executorId')
        done = obj.get('done')
        parenId = obj.get('parentId')
        with firebirdsql.connect(host=host, database=database, user=user, password=password,
                                 charset=charset) as con:
            cur = con.cursor()
            # Подготовка значений для обновления
            values = {
                'F4691': contractId,
                'F4695': task,
                'F4698': comment,
                'F5724': typeWorkId,
                'F5569': dateStart,
                'F4696': deadline,
                'F4697': done,
                'F4708': datetime.date.today().strftime('%Y-%m-%d'),
                'F4693': directorId,  # должно быть ID пользователя
                'F4694': executorId,
                'F5646': parenId,
            }
            # Преобразование значений в SQL-формат
            set_clause = []
            for key, value in values.items():
                if value is None:
                    set_clause.append(f"{key} = NULL")
                elif isinstance(value, (int, float)):  # Числовые значения
                    set_clause.append(f"{key} = {value}")
                elif isinstance(value, str):  # Строковые значения
                    set_clause.append(f"{key} = '{value}'")
                else:
                    raise ValueError(f"Unsupported type for value: {value}")
            # Формирование SQL-запроса
            sql = f"""
            UPDATE T218
            SET {', '.join(set_clause)}
            WHERE id = {taskId}
            """
            cur.execute(sql)
            con.commit()
        return JsonResponse({'status': 'Ok'}, status=200)
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def deleteTask(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        taskId = obj.get('taskId')
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            sql = f"""DELETE FROM T218 WHERE ID = '{taskId}'"""
            cur.execute(sql)
            con.commit()
        return JsonResponse({'status': 'Ok'}, status=200)
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def auth(request):
    if request.method == 'POST':
        payload = json.loads(request.body)
        url = f'{MATTERMOST_URL}/api/v4/users/login'
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            token = response.headers.get('Token')
            Id = response.json().get('id')
            return JsonResponse({'token': f'{token}', 'id': f'{Id}'}, status=200)
        else:
            return JsonResponse({'Failed authentication': f'{response.text}'}, status=response.status_code)
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getAllDepartmentsStaffAndTasks(request):
    with (firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con):
        cur = con.cursor()
        try:
            sql = """
            SELECT 
            sectionId, 
            sectionName, 
            employeeId, 
            employeeName, 
            photo, 
            LIST(contractId || '$' || contractNum || '$' || address || '$' || dateOfStart || '$' || dateOfEnding || '$' || contractStage || '$' || CASE WHEN tasks IS NULL THEN '' ELSE tasks END, '^') AS contracts 
            FROM (SELECT
            T5.ID AS sectionId,
            T5.F26 AS sectionName,
            T3.F16 AS employeeId,
            T3.F4886 AS employeeName,
            T3.F4887SRC as photo,
            T212.ID AS contractId,
            T212.F4538 AS contractNum,
            T212.F4946 AS address,
            T212.F4610 AS dateOfStart,
            T212.F4566 AS dateOfEnding,
            T212.F4544 AS contractStage,
            LIST(T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F4697 || ';' || director.F16 || ';' || executor.F16 || ';' || T218.ID || ';' || director.F4886 || ';' || executor.F4886 || ';' || CASE WHEN T218.F5646 IS NULL THEN '' ELSE T218.F5646 END, '*') AS tasks
            FROM T5
            LEFT JOIN T3 ON T5.ID = T3.F27
            LEFT JOIN T253 ON T3.ID = T253.F5022
            LEFT JOIN T212 ON T253.F5024 = T212.ID
            LEFT JOIN T218 ON T212.ID = T218.F4691
            LEFT JOIN T3 director ON T218.F4693 = director.ID
            LEFT JOIN T3 executor ON T218.F4694 = executor.ID
            WHERE T3.F5383 = 1 AND T212.ID >= 3000
            GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11) tasks GROUP BY 1, 2, 3, 4, 5
            """
            cur.execute(sql)
            result = cur.fetchall()
            columns = ('sectionId', 'sectionName', 'employeeId', 'employeeName', 'photo', 'contracts')
            json_result = [
                {col: value for col, value in zip(columns, row)}
                for row in result
            ]  # Создаем список словарей с сериализацией значений
            # Для каждого отдела получаем информацию о сотрудниках, договорах и задачах
            for obj in json_result:
                section = {'section': {'title': obj.get('sectionName'), 'id': obj.get('sectionId')}}
                obj.update(section)
                obj.pop('sectionId')
                obj.pop('sectionName')
                employee = {'employee': {'fullName': obj.get('employeeName'), 'id': obj.get('employeeId'),
                                         'photo': obj.get('photo')}}
                obj.update(employee)
                obj.pop('employeeName')
                obj.pop('employeeId')
                obj.pop('photo')
                contracts = {'contracts': []}
                data = obj.get('contracts')
                if data is not None:
                    Contracts = data.split('^')
                    count = -1
                    for contract in Contracts:
                        count += 1
                        data = contract.split('$')
                        contracts.get('contracts').append({'contractId': data[0],
                                                           'contractNum': data[1],
                                                           'address': data[2],
                                                           'dateOfStart': {'title': '', 'value': data[3]},
                                                           'dateOfEnding': {'title': 'Срок работы', 'value': data[4]},
                                                           'stage': {'title': data[5]},
                                                           'tasks': []})
                        Str = data[6]
                        if Str != '':
                            List = Str.split('*')
                            for allData in List:
                                list2 = allData.split(';')
                                list2[0].strip()
                                if list2[0] == '' and list2[1] == '' and list2[2] == '':
                                    continue
                                elif list2[9] == '':
                                    contracts.get('contracts')[count].get('tasks').append(
                                        {'id': list2[6], 'title': list2[0], 'dateOfStart': list2[1],
                                         'dateOfEnding': list2[2], 'done': list2[3],
                                         'director': {'mmId': list2[4], 'fullName': list2[7]},
                                         'executor': {'mmId': list2[5], 'fullName': list2[8]}, 'tasks': []})
                            for allData in List:
                                list2 = allData.split(';')
                                list2[0].strip()
                                if list2[0] == '' and list2[1] == '' and list2[2] == '':
                                    continue
                                elif list2[9] != '':
                                    i = 0
                                    for item in contracts.get('contracts')[count].get('tasks'):
                                        if list2[9] == item.get('id'):
                                            contracts.get('contracts')[count].get('tasks')[i].get('tasks').append(
                                                {'id': list2[6], 'title': list2[0], 'dateOfStart': list2[1],
                                                 'dateOfEnding': list2[2], 'done': list2[3],
                                                 'director': {'mmId': list2[4], 'fullName': list2[7]},
                                                 'executor': {'mmId': list2[5], 'fullName': list2[8]}})
                                        i += 1
                obj.update(contracts)
            return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
        except Exception as ex:
            print(f"Не удалось получить данные по отделам и сотрудникам: {ex}")
            return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})

@csrf_exempt
def getTasksEmployee(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        employeeId = obj.get('employeeId')
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = f"""SELECT
            T218.ID, 
            T218.F4695 AS TASK,
            T218.F4698 AS COMMENT,
            T218.F5569 AS START_DATE,
            T218.F4696 AS DEADLINE_DATE,
            T218.F5476 AS DEADLINE_TIME,
            T218.F4697 AS DONE,
            T218.F4708 AS DATE_OF_DONE,
            DIRECTOR.ID AS ID_DIRECTOR,
            DIRECTOR.F16 AS ID_MM_DIRECTOR,
            DIRECTOR.F4886 AS DIRECTOR_NAME,
            EXECUTOR.ID AS ID_EXECUTOR,
            EXECUTOR.F16 AS ID_MM_EXECUTOR,
            EXECUTOR.F4886 AS EXECUTOR_NAME,
            T212.ID AS contractId,
            T212.F4538 AS CONTRACT_NUMBER,
            T212.F4946 AS OBJECT_ADDRESS,
            T205.F4331 AS CUSTOMER_NAME,
            T218.F5646 AS parentId
            FROM T218
            LEFT JOIN T3 AS DIRECTOR ON T218.F4693 = DIRECTOR.ID
            LEFT JOIN T3 AS EXECUTOR ON T218.F4694 = EXECUTOR.ID
            LEFT JOIN T212 ON T218.F4691 = T212.ID
            LEFT JOIN T205 ON T212.F4540 = T205.ID
            WHERE DIRECTOR.F16 = '{employeeId}' OR EXECUTOR.F16 = '{employeeId}'"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                'id', 'task', 'comment', 'startDate', 'deadlineTask', 'deadlineTime', 'done', 'dateDone', 'idDirector',
                'idMMDirector', 'directorName', 'idExecutor', 'idMMExecutor', 'executorName', 'contractId',
                'contractNum', 'address', 'customer', 'parentId')
                json_result = [
                    {col: value for col, value in zip(columns, row)}
                    for row in result
                ]  # Создаем список словарей с сериализацией значений
                today = datetime.date.today()
                copy = []
                for task in json_result:
                    director = {'director': {'idDirector': task.get('idDirector'), 'mmId': task.get('idMMDirector'),
                                             'directorName': task.get('directorName')}}
                    executor = {'executor': {'idExecutor': task.get('idExecutor'), 'mmId': task.get('idMMExecutor'),
                                             'executorName': task.get('executorName')}}
                    task.update(director)
                    task.update(executor)
                    task.pop('idDirector')
                    task.pop('idExecutor')
                    task.pop('idMMDirector')
                    task.pop('idMMExecutor')
                    task.pop('directorName')
                    task.pop('executorName')
                    deadlineTask = task.get('deadlineTask')
                    if deadlineTask is not None:
                        if task.get('done') == 0 and deadlineTask < today:
                            deadlineTask = {
                                'deadlineTask': {'value': datetime.datetime.strftime(deadlineTask, '%Y-%m-%d'),
                                                 'expired': True}}
                        else:
                            deadlineTask = {
                                'deadlineTask': {'value': datetime.datetime.strftime(deadlineTask, '%Y-%m-%d'),
                                                 'expired': False}}
                    else:
                        deadlineTask = {
                            'deadlineTask': {'value': deadlineTask,
                                             'expired': False}}
                    task.update(deadlineTask)
                    startDate = task.get('startDate')
                    if startDate is not None:
                        startDate = {'startDate': datetime.datetime.strftime(startDate, '%Y-%m-%d')}
                    else:
                        startDate = {'startDate': startDate}
                    task.update(startDate)
                    dateDone = task.get('dateDone')
                    if dateDone is not None:
                        dateDone = {'dateDone': datetime.datetime.strftime(dateDone, '%Y-%m-%d')}
                    else:
                        dateDone = {'dateDone': dateDone}
                    task.update(dateDone)
                    if task.get('parentId') is None:
                        task.pop('parentId')
                        subtasks = {'subtasks': []}
                        task.update(subtasks)
                        copy.append(task)
                for row in json_result:
                    for item in copy:
                        if item.get('id') == row.get('parentId'):
                            item.get('subtasks').append(row)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить задачи по договору {ex}")
                return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getContractsEmployee(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        employeeId = obj.get('employeeId')
        start = perf_counter()
        with firebirdsql.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            charset=charset
        ) as con:
            cur = con.cursor()
            sql = f"""
            SELECT T212.ID AS contractId,
            T212.F4538 AS contractNum,
            T212.F4544 AS stage,
            T212.F4946 AS address,
            T237.F4890 AS services,
            T212.F4648 AS path,
            T212.F4610 AS dateOfStart,
            T212.F4566 AS dateOfEnding,
            T205.F4331 AS customer,
            LIST(DISTINCT T206.F4359 || ';' || T206.F4356 || ';' || T206.F4357 || ';' || T206.F4358) AS contacts,
            LIST(DISTINCT participants.F16 || ';' || participants.F4886) AS participants,
            responsible.F16 AS responsibleId,
            responsible.F4886 AS responsible,
            LIST(DISTINCT T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F4697 || ';' || director.F16 || ';' || executor.F16 || ';' || T218.ID || ';' || director.F4886 || ';' || executor.F4886, '*') AS tasks
            FROM T212
            LEFT JOIN T237 ON T212.F4948 = T237.ID
            LEFT JOIN T205 ON T212.F4540 = T205.ID
            LEFT JOIN T233 ON T233.F4963 = T212.ID
            LEFT JOIN T206 ON T233.F4870 = T206.ID
            LEFT JOIN T253 ON T212.ID = T253.F5024
            LEFT JOIN T3 participants ON T253.F5022 = participants.ID
            LEFT JOIN T3 responsible ON T212.F4546 = responsible.ID
            LEFT JOIN T218 ON T218.F4691 = T212.ID
            LEFT JOIN T3 director ON T218.F4693 = director.ID
            LEFT JOIN T3 executor ON T218.F4694 = executor.ID
            WHERE participants.F16 = '{employeeId}' OR responsible.F16 = '{employeeId}'
            GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13
            """  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
            cur.execute(sql)
            result = cur.fetchall()
            # Преобразование результата в список словарей
            columns = ('contractId', 'contractNum', 'stage', 'address', 'services', 'pathToFolder', 'dateOfStart', 'dateOfEnding', 'company', 'contacts', 'participants', 'responsibleId', 'responsible', 'tasks')
            json_result = [
                {col: value for col, value in zip(columns, row)}
                for row in result
            ]  # Создаем список словарей с сериализацией значений
            today = datetime.date.today()
            for obj in json_result:
                status = obj.get('stage')
                stage = {'stage': {'title': status}}
                obj.update(stage)
                services = {'services': [{'title': obj.get('services')}]}
                obj.update(services)
                participants = obj.get('participants')
                if participants is not None:
                    participants = participants.split(',')
                    data = {'participants': []}
                    for participant in participants:
                        data2 = participant.split(';')
                        data.get('participants').append({'participantId': data2[0], 'fullName': data2[1].strip()})
                    obj.update(data)
                responsible = obj.get('responsible')
                if responsible is not None:
                    responsible = {'responsible': {'fullName': obj.get('responsible').strip(), 'id': obj.get('responsibleId')}}
                else:
                    responsible = {'responsible': {'fullName': obj.get('responsible'), 'id': obj.get('responsibleId')}}
                obj.update(responsible)
                obj.pop('responsibleId')
                dateOfStart = {'dateOfStart': {'title': '', 'value': obj.get('dateOfStart')}}
                obj.update(dateOfStart)
                dateOfEnding = obj.get('dateOfEnding')
                if dateOfEnding is not None:
                    if status == 'В работе' and dateOfEnding < today:
                        dateOfEnding = {
                            'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'), 'expired': True}}
                    else:
                        dateOfEnding = {
                            'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'), 'expired': False}}
                else:
                    dateOfEnding = {
                        'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'), 'expired': False}}
                obj.update(dateOfEnding)
                Str = obj.get('contacts')
                contacts = {'contacts': []}
                if Str is not None:
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
                if Str is not None:
                    List = Str.split('*')
                    for allData in List:
                        list2 = allData.split(';')
                        list2[0].strip()
                        if list2[0] == '' and list2[1] == '' and list2[2] == '':
                            continue
                        else:
                            tasks.get('tasks').append(
                                {'id': list2[6],'title': list2[0], 'dateOfStart': list2[1], 'dateOfEnding': list2[2],
                                 'done': list2[3], 'director': {'mmId': list2[4], 'fullName': list2[7]},
                                 'executor': {'mmId': list2[5], 'fullName': list2[8]}})
                obj.update(tasks)
            end = perf_counter()
            print(end - start)
            return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getDataUser(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        employeeId = obj.get('employeeId')
        start = perf_counter()
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = f"""SELECT
                T3.ID as ID,
                T3.F16 as MMID,
                T3.F10 AS FIO,
                T5.F26 AS DEPARTMENT,
                T4.F7 AS JOB_TITLE,
                T3.F12 AS EMAIL,
                T3.F14 AS MOBILE_NUMBER,
                T3.F13 AS JOB_NUMBER,
                T3.F5411 AS ADD_NUMBER,
                T3.F15 AS TELEGRAM_USERNAME,
                T3.F18 AS BIRTHDAY,
                T3.F5572 AS OFFICE
                FROM T3
                LEFT JOIN T5 ON T3.F27 = T5.ID
                LEFT JOIN T4 ON T3.F11 = T4.ID
                WHERE T3.F16 = '{employeeId}'"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                    'id', 'mmId', 'FIO', 'department', 'job', 'email', 'telephone', 'jobTelephone', 'addTelephone',
                    'telegram', 'birthday', 'office')
                json_result = [
                    {col: value for col, value in zip(columns, row)}
                    for row in result
                ]  # Создаем список словарей с сериализацией значений
                end = perf_counter()
                print(end - start)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить данные по сотруднику с id {employeeId}: {ex}")
                return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

def getVacations(request):
    if request.method == 'POST':
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = """
                SELECT
                T5.F26 AS department,
                T3.ID AS id,
                T3.F16 AS mmId,
                T3.F4886 AS employeeFI,
                T4.F7 AS post,
                T302.F5577 AS vacation,
                T302.F5579 AS vacationStart,
                T302.F5581 AS vacationEnd
                FROM T3
                LEFT JOIN T4 ON T4.ID = T3.F11
                LEFT JOIN T5 ON T5.ID = T3.F27
                LEFT JOIN T302 ON T302.F5574 = T3.ID
                WHERE T3.F5383 = 1 AND
                (T302.F5577 = 'отпуск' OR T302.F5577 = 'отпуск без содержания' OR T302.F5577 = 'удаленная работа' OR T302.F5577 = 'работа в выходной' OR T302.F5577 = 'отсутствие на рабочем месте' OR T302.F5577 = 'больничный' OR T302.F5577 IS NULL)
                ORDER BY department, employeeFI, vacation
                """
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                    'department', 'id', 'mmId', 'employeeFI', 'post', 'vacation', 'vacationStart', 'vacationEnd')
                json_result = [
                    {col: value for col, value in zip(columns, row)}
                    for row in result
                ]  # Создаем список словарей с сериализацией значений
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить данные по календарю отпусков")
                return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)