import json
import firebirdsql
from django.http import JsonResponse
from time import perf_counter
from django.views.decorators.csrf import csrf_exempt
from .config import *
import datetime
import requests

def timeToFloat(t: datetime.time) -> float:
    """Переводит время в вещественное число (часы с дробной частью)."""
    return t.hour + t.minute / 60 + t.second / 3600 + t.microsecond / 3_600_000_000

def getAgreements(request):
    start = perf_counter()
    with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
        cur = con.cursor()
        sql = """SELECT T212.ID AS contractId,
        T212.F4538 AS contractNum,
        T212.F4544 AS stage,
        T212.F4946 AS address,
        T212.F4648 AS path,
        T212.F4610 AS dateOfStart,
        T212.F4566 AS dateOfEnding,
        T237.F4890 AS services,
        T205.F4331 AS customer,
        LIST(DISTINCT T206.F4359 || ';' || T206.F4356 || ';' || T206.F4357 || ';' || T206.F4358, '*') AS contacts,
        LIST(DISTINCT participants.F16 || ';' || participants.F4886) AS participants,
        responsible.F16 AS idMMResponsible,
        responsible.F4886 AS responsible,
        manager.F16 AS idMMManager,
        manager.F4886 AS manager,
        LIST(DISTINCT T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F4697 || ';' || T218.ID || ';' || CASE WHEN T218.F5646 IS NULL THEN '' ELSE T218.F5646 END || ';' || CASE WHEN T218.F5872 IS NULL THEN '' ELSE T218.F5872 END || ';' || director.F16 || ';' || director.F4886 || ';' || executor.F16 || ';' || executor.F4886, '*') AS tasks
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
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15"""  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
        cur.execute(sql)
        result = cur.fetchall()
        # Преобразование результата в список словарей
        columns = ('contractId', 'contractNum', 'stage', 'address', 'pathToFolder', 'dateOfStart', 'dateOfEnding',
                   'services', 'company', 'contacts', 'participants', 'idMMResponsible', 'responsible', 'idMMManager',
                   'manager', 'tasks')
        json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
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
                    data.get('participants').append({'idMM': data2[0], 'fullName': data2[1].strip()})
                obj.update(data)
            manager = obj.get('manager')
            if manager is not None:
                manager = {'manager': {'idMM': obj.get('idMMManager'), 'fullName': manager.strip()}}
            else:
                manager = {'manager': {'idMM': obj.get('idMMManager'), 'fullName': manager}}
            obj.update(manager)
            obj.pop('idMMManager')
            responsible = obj.get('responsible')
            if responsible is not None:
                responsible = {'responsible': {'idMM': obj.get('idMMResponsible'), 'fullName': responsible.strip()}}
            else:
                responsible = {'responsible': {'idMM': obj.get('idMMResponsible'), 'fullName': responsible}}
            obj.update(responsible)
            obj.pop('idMMResponsible')
            if obj.get('dateOfStart') is not None:
                dateOfStart = {'dateOfStart': {'title': '',
                                               'value': datetime.datetime.strftime(obj.get('dateOfStart'), '%Y-%m-%d')}}
            else:
                dateOfStart = {'dateOfStart': {'title': '', 'value': obj.get('dateOfStart')}}
            obj.update(dateOfStart)
            dateOfEnding = obj.get('dateOfEnding')
            if dateOfEnding is not None:
                if status == 'В работе' and dateOfEnding < today:
                    dateOfEnding = {'dateOfEnding': {'title': 'Срок работы',
                                                     'value': datetime.datetime.strftime(obj.get('dateOfEnding'),
                                                                                         '%Y-%m-%d'),
                                                     'expired': True}}
                else:
                    dateOfEnding = {'dateOfEnding': {'title': 'Срок работы',
                                                     'value': datetime.datetime.strftime(obj.get('dateOfEnding'),
                                                                                         '%Y-%m-%d'),
                                                     'expired': False}}
            else:
                dateOfEnding = {'dateOfEnding': {'title': 'Срок работы', 'value': obj.get('dateOfEnding'),
                                                 'expired': False}}
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
                    tasks.get('tasks').append(
                        {'id': list2[4], 'title': list2[0], 'dateOfStart': list2[1], 'dateOfEnding': list2[2],
                         'done': list2[3], 'director': {'mmId': list2[7], 'fullName': list2[8]}, 'parentId': list2[5],
                         'executor': {'mmId': list2[9], 'fullName': list2[10]}, 'status': list2[6], 'tasks': []})
                indexSubtask = 0
                removeIndexesSubtasks = []
                for subtask in tasks.get('tasks'):
                    for task in tasks.get('tasks'):
                        if task.get('id') == subtask.get('parentId') and task.get('id') != task.get('parentId'):
                            task.get('tasks').append(subtask)
                            removeIndexesSubtasks.append(indexSubtask)
                    indexSubtask += 1
                removeIndexesSubtasks = sorted(removeIndexesSubtasks, reverse=True)
                for indexSubtask in removeIndexesSubtasks:
                    tasks.get('tasks').pop(indexSubtask)
            obj.update(tasks)
        end = perf_counter()
        print(f'GET /api/ {end - start}')
        return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})

def employees(request):
    # start = perf_counter()
    with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
        cur = con.cursor()
        sql = """SELECT T3.ID AS id,
        T3.F16 AS mmId,
        T3.F4932 AS nickMame,
        T3.F4886 AS fullName,
        T3.F4887SRC AS photo,
        T3.F14 AS phone,
        T3.F12 AS email,
        T4.F7 AS post
        FROM T3
        LEFT JOIN T4 ON T3.F11 = T4.ID
        WHERE T3.F5383 = 1"""
        cur.execute(sql)
        result = cur.fetchall()
        # Преобразование результата в список словарей
        columns = ('id', 'mmId', 'nickName', 'fullName', 'photo', 'phone', 'email', 'post')
        json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
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
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
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
                    values = {'id': Id, 'F5022': participantId, 'F5024': contractId,}
                    sql = f"""INSERT INTO T253 ({', '.join(values.keys())})
                    VALUES ({', '.join(f"'{value}'" for value in values.values())})"""
                    cur.execute(sql)
                    con.commit()
                else:
                    List2.remove(participantId)
            for participantId in List2:
                sql = f"""DELETE FROM T253 WHERE F5022 = '{participantId}' AND F5024 = '{contractId}'"""
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
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            sql = f"""SELECT T212.ID AS id,
            T212.F4538 AS contractNum,
            T212.F4544 AS stage,
            T212.F4946 AS address,
            T212.F4648 AS path,
            T212.F4610 AS dateOfStart,
            T212.F4566 AS dateOfEnding,
            T212.F4644 AS channelId,
            T237.F4890 AS services,
            T205.F4332 AS company,
            LIST(DISTINCT T206.F4359 || ';' || T206.F4356 || ';' || T206.F4357 || ';' || T206.F4358, '*') AS contacts,
            LIST(DISTINCT participants.ID || ';' || participants.F16 || ';' || participants.F4886, '*') AS participants,
            responsible.ID AS responsibleId,
            responsible.F16 AS responsibleMMId,
            responsible.F4886 AS responsible,
            manager.ID AS managerId,
            manager.F16 AS managerMMId,
            manager.F4886 AS manager,
            LIST(T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F5872, '*') AS tasks
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
            GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18"""  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
            cur.execute(sql)
            result = cur.fetchall()
            # Преобразование результата в список словарей
            columns = ('id', 'contractNum', 'stage', 'address', 'pathToFolder', 'dateOfStart', 'dateOfEnding',
                       'channelId', 'services', 'company', 'contacts', 'participants', 'responsibleId',
                       'responsibleMMId', 'responsible', 'managerId', 'managerMMId', 'manager', 'tasks')
            json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
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
                        data.get('participants').append({'id': data2[0], 'idMM': data2[1],
                                                         'fullName': data2[2].strip()})
                    obj.update(data)
                responsible = obj.get('responsible')
                if responsible is not None:
                    responsible = {'responsible': {'id': obj.get('responsibleId'), 'idMM': obj.get('responsibleMMId'),
                                                   'fullName': responsible.strip()}}
                else:
                    responsible = {'responsible': {'id': obj.get('responsibleId'), 'idMM': obj.get('responsibleMMId'),
                                                   'fullName': responsible}}
                obj.update(responsible)
                obj.pop('responsibleId')
                obj.pop('responsibleMMId')
                manager = obj.get('manager')
                if manager is not None:
                    manager = {'manager': {'id': obj.get('managerId'), 'idMM': obj.get('managerMMId'),
                                           'fullName': manager.strip()}}
                else:
                    manager = {'manager': {'id': obj.get('managerId'), 'idMM': obj.get('managerMMId'),
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
                            contacts.get('contacts').append({'fullName': list2[0], 'phone': [list2[1], list2[2]],
                                                             'post': '', 'email': list2[3]})
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
                            tasks.get('tasks').append({'title': list2[0], 'dateOfStart': list2[1],
                                                       'dateOfEnding': list2[2], 'status': list2[3]})
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
                sql = f"""SELECT F4601 AS NUM,
                F4600 AS TYPE_OF_WORK,
                F4597 AS TERM,
                F4607 AS DONE,
                F4608 AS DATE_OF_DONE
                FROM T214 WHERE F4606 = {contractId}"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = ('number', 'typeWork', 'deadline', 'done', 'dateDone')
                json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
                today = datetime.date.today()
                for obj in json_result:
                    dateDone = obj.get('dateDone')
                    if dateDone is not None:
                        if obj.get('done') == 0 and dateDone < today:
                            dateDone = {'dateDone': {'value': dateDone, 'expired': True}}
                        else:
                            dateDone = {'dateDone': {'value': dateDone, 'expired': False}}
                    else:
                        dateDone = {'dateDone': {'value': dateDone, 'expired': False}}
                    obj.update(dateDone)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить работы договора {ex}")
                return JsonResponse({'error': f'НЕ удалось получить работы договора {ex}'}, status=404)
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
                sql = f"""SELECT T218.ID,
                T218.F4691 AS CONRACT_ID,
                T218.F4695 AS TASK,
                T218.F5724 AS ID_OF_TYPE_OF_WORK,
                T218.F5569 AS dateStart,
                T218.F4696 AS DEADLINE,
                T218.F4697 AS DONE,
                T218.F5646 AS parentId,
                T218.F5872 AS status,
                DIRECTOR.ID AS ID_OF_DIRECTOR,
                DIRECTOR.F16 AS ID_MM_DIRECTOR,
                DIRECTOR.F4886 AS DIRECTOR_NAME,
                EXECUTOR.ID AS ID_OF_EXECUTOR,
                EXECUTOR.F16 AS ID_MM_EXECUTOR,
                EXECUTOR.F4886 AS EXECUTOR_NAME
                FROM T218
                LEFT JOIN T3 AS DIRECTOR ON T218.F4693 = DIRECTOR.ID
                LEFT JOIN T3 AS EXECUTOR ON T218.F4694 = EXECUTOR.ID
                WHERE T218.F4691 = {contractId}"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                    'id', 'contractId', 'task', 'idTypeWork', 'dateStart', 'deadlineTask', 'done', 'parentId', 'status',
                    'idDirector', 'idMMDirector', 'directorFIO', 'idExecutor', 'idMMExecutor', 'executorFIO')
                json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
                today = datetime.date.today()
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
                    row.update({'subtasks': []})
                indexSubtask = 0
                removeIndexesSubtasks = []
                for subtask in json_result:
                    for task in json_result:
                        if task.get('id') == subtask.get('parentId') and task.get('id') != task.get('parentId'):
                            task.get('subtasks').append(subtask)
                            removeIndexesSubtasks.append(indexSubtask)
                    indexSubtask += 1
                removeIndexesSubtasks = sorted(removeIndexesSubtasks, reverse=True)
                for indexSubtask in removeIndexesSubtasks:
                    json_result.pop(indexSubtask)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
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
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = f'SELECT F5646 AS parentId FROM T218 WHERE ID = {taskId}'
                cur.execute(sql)
                parentId = cur.fetchone()[0]
                sql = f"""SELECT T218.ID,
                T218.F4691 AS CONRACT_ID,
                T218.F4695 AS TASK,
                T218.F5724 AS ID_OF_TYPE_OF_WORK,
                T218.F5569 AS dateStart,
                T218.F4696 AS DEADLINE,
                T218.F4697 AS DONE,
                T218.F5646 AS parentId,
                T218.F4698 AS comment,
                T218.F5872 AS status,
                T218.F5889 AS plannedTimeCosts,
                T218.F5451 AS idPost,
                DIRECTOR.ID AS ID_OF_DIRECTOR,
                DIRECTOR.F16 AS ID_MM_DIRECTOR,
                DIRECTOR.F4886 AS DIRECTOR_NAME,
                EXECUTOR.ID AS ID_OF_EXECUTOR,
                EXECUTOR.F16 AS ID_MM_EXECUTOR,
                EXECUTOR.F4886 AS EXECUTOR_NAME,
                LIST(coExecutor.ID || ';' || coExecutor.F16 || ';' || coExecutor.F10) AS coExecutor
                FROM T218
                LEFT JOIN T3 AS DIRECTOR ON T218.F4693 = DIRECTOR.ID
                LEFT JOIN T3 AS EXECUTOR ON T218.F4694 = EXECUTOR.ID
                LEFT JOIN T313 ON T218.ID = T313.F5750
                LEFT JOIN T3 AS coExecutor ON T313.F5751 = coExecutor.ID
                WHERE T218.F5646 = {taskId} OR T218.ID = {taskId}""" + (f' OR T218.ID = {parentId}' if parentId is not None else '') + ' GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18'
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                    'id', 'contractId', 'task', 'idTypeWork', 'dateStart', 'deadlineTask', 'done', 'parentId',
                    'comment', 'status', 'plannedTimeCosts', 'idPost', 'idDirector', 'idMMDirector', 'directorFIO',
                    'idExecutor', 'idMMExecutor', 'executorFIO', 'coExecutors')
                json_result = {
                    'parent': {}, 'subtasks': [{col: value for col, value in zip(columns, row)} for row in result]}  # Создаем список словарей с сериализацией значений
                i = 0
                removeIndexes = []
                for task in json_result.get('subtasks'):
                    strCoExecutor = task.get('coExecutors')
                    if strCoExecutor is not None:
                        listCoExecutor = strCoExecutor.split(',')
                        coExecutor = {'coExecutors': []}
                        for strDataCoExecutor in listCoExecutor:
                            dataCoExecutor = strDataCoExecutor.split(';')
                            coExecutor.get('coExecutors').append({'id': dataCoExecutor[0], 'idMM': dataCoExecutor[1],
                                                                  'fio': dataCoExecutor[2]})
                        task.update(coExecutor)
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
                    if task.get('id') == taskId:
                        json_result.update(task)
                        removeIndexes.append(i)
                    if task.get('id') == parentId:
                        json_result.get('parent').update(task)
                        removeIndexes.append(i)
                    i += 1
                removeIndexes = sorted(removeIndexes, reverse=True)
                for i in removeIndexes:
                    json_result.get('subtasks').pop(i)
                sql = f"""SELECT T320.ID AS id,
                T320.F5863 AS spent,
                T320.F5869 AS dateReport,
                T320.F5870 AS report,
                T320.F5882 AS timeHours,
                T3.ID AS idExecutor,
                T3.F16 AS idMMExecutor,
                T3.F4886 AS executorFIO
                FROM T320 LEFT JOIN T3 ON T3.ID = T320.F5881 WHERE T320.F5862 = {taskId}"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = ('id', 'spent', 'dateReport', 'report', 'timeHours', 'idExecutor', 'idMMExecutor',
                           'executorFIO')
                jsonResult = {'timeCosts': [
                    {col: value for col, value in zip(columns, row)}
                    for row in result
                ]}  # Создаем список словарей с сериализацией значений
                for task in jsonResult.get('timeCosts'):
                    dateReport = task.get('dateReport')
                    if dateReport is not None:
                        dateReport = {'dateReport': datetime.datetime.strftime(dateReport, '%Y-%m-%d')}
                        task.update(dateReport)
                    spent = task.get('spent')
                    if spent is not None:
                        spent = {'spent': datetime.time.strftime(spent, '%H:%M')}
                        task.update(spent)
                json_result.update(jsonResult)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
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
        plannedTimeCosts = obj.get('plannedTimeCosts')
        with firebirdsql.connect(host=host, database=database, user=user, password=password,
                                 charset=charset) as con:
            cur = con.cursor()
            if contractId is None:
                idChannel = 'fd9nra9nx3n47jk7eyo1fg5t7o'
            else:
                sql = f'select F4644 from T212 where ID = {contractId}'
                cur.execute(sql)
                idChannel = cur.fetchone()[0]
            sql = f"""SELECT F4932 FROM T3 WHERE ID = '{directorId}'"""
            cur.execute(sql)
            directorData = cur.fetchone()
            director = directorData[0]
            sql = f"""SELECT F4932 FROM T3 WHERE ID = '{executorId}'"""
            cur.execute(sql)
            executorData = cur.fetchone()
            executor = executorData[0]
            message = f'**Добавлена :hammer_and_wrench: Задача :hammer_and_wrench: by @{director}**\n'
            message += f'Дата добавления: *{dateStart}*\n' if dateStart is not None else ''
            message += f'Постановщик: *@{director}*\n' if director is not None else ''
            message += f'Исполнитель: *@{executor}*\n' if executor is not None else ''
            message += f'Задача: :hammer: *{task}*\n' if task is not None else ''
            message += f'Deadline: :calendar: *{deadline}*\n' if deadline is not None else ''
            message += f'Комментарий: :speech_balloon: *{comment}*\n' if comment is not None else ''
            message += f'Планируемые времязатраты: :clock3: *{plannedTimeCosts}ч.*\n' if plannedTimeCosts is not None else ''
            message += 'Статус: :new: *Новая* :new:\n:large_yellow_circle: *Задача ожидает исполнения...*'
            data = {'channel_id': idChannel, 'message': message}
            response = requests.post(
                f"{MATTERMOST_URL}:{MATTERMOST_PORT}/api/v4/posts", json=data, headers=headers)
            idMessage = response.json().get('id')
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
                'F5872': 'Новая',
                'F5451': idMessage,
                'F5889': plannedTimeCosts,
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
        return JsonResponse({'status': response.json()}, status=response.status_code)
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def editTask(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        taskId = obj.get('taskId')
        task = obj.get('task')
        comment = obj.get('comment')
        typeWorkId = obj.get('typeWorkId')
        dateStart = obj.get('dateStart')
        deadline = obj.get('deadline')
        directorId = obj.get('directorId')
        executorId = obj.get('executorId')
        done = obj.get('done')
        parenId = obj.get('parentId')
        status = obj.get('status')
        today = datetime.date.today().strftime('%Y-%m-%d')
        plannedTimeCosts = obj.get('plannedTimeCosts')
        with firebirdsql.connect(host=host, database=database, user=user, password=password,
                                 charset=charset) as con:
            cur = con.cursor()
            # Подготовка значений для обновления
            values = {
                'F4695': task,
                'F4698': comment,
                'F5724': typeWorkId,
                'F5569': dateStart,
                'F4696': deadline,
                'F4697': done,
                'F4708': today,
                'F4693': directorId,  # должно быть ID пользователя
                'F4694': executorId,
                'F5646': parenId,
                'F5872': status,
                'F5889': plannedTimeCosts,
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
            sql = f'SELECT F4691 FROM T218 WHERE ID = {taskId}'
            cur.execute(sql)
            contractId = cur.fetchone()[0]
            if contractId is None:
                idChannel = 'fd9nra9nx3n47jk7eyo1fg5t7o'
            else:
                sql = f'select F4644 from T212 where ID = {contractId}'
                cur.execute(sql)
                idChannel = cur.fetchone()[0]
            sql = f"""SELECT F4932 FROM T3 WHERE ID = '{directorId}'"""
            cur.execute(sql)
            director = cur.fetchone()[0]
            sql = f"""SELECT F4932 FROM T3 WHERE ID = '{executorId}'"""
            cur.execute(sql)
            executor = cur.fetchone()[0]
            message = f"**{'Изменена' if done != 1 else 'Завершена'} :hammer_and_wrench: Задача :hammer_and_wrench: by @{director}**\n"
            message += f'Дата добавления: *{dateStart}*\n' if dateStart is not None else ''
            message += f'Постановщик: *@{director}*\n' if director is not None else ''
            message += f'Исполнитель: *@{executor}*\n' if executor is not None else ''
            message += f'Задача: :hammer: *{task}*\n' if task is not None else ''
            message += f'Deadline: :calendar: *{deadline}*\n' if deadline is not None else ''
            message += f'Комментарий: :speech_balloon: *{comment}*\n' if comment is not None and comment != '' else ''
            sql = f"""SELECT F5889 FROM T218 WHERE ID = {taskId}"""
            cur.execute(sql)
            time = cur.fetchone()[0]
            message += f'Планируемые времязатраты: :clock3: *{time}ч.*\n' if time is not None else ''
            sql = f"SELECT SUM(F5882) FROM T320 WHERE F5862 = {taskId}"
            cur.execute(sql)
            currentTimeCosts = cur.fetchone()[0]
            message += f'Текущие времязатраты: :clock3: *{currentTimeCosts}ч.*\n' if currentTimeCosts is not None else ''
            statusEmoji = ''
            match status:
                case 'Новая':
                    statusEmoji = ':new:'
                case 'В работе':
                    statusEmoji = ':molot:'
                case 'Выполненная':
                    statusEmoji = ':white_check_mark:'
                case 'Завершенная':
                    statusEmoji = ':thumbsup:'
                case 'Отмененная':
                    statusEmoji = ':x:'
            message += f'Статус: {statusEmoji} *{status}* {statusEmoji}\n'
            message += ':large_yellow_circle: *Задача ожидает завершения...*' if done != 1 else f':large_green_circle: *Задача завершена {today}*'
            sql = f"""SELECT F5451 FROM T218 WHERE ID = {taskId}"""
            cur.execute(sql)
            rootId = cur.fetchone()[0]
            data = {'channel_id': idChannel, 'message': message, 'root_id': rootId}
            response = requests.post(
                f"{MATTERMOST_URL}:{MATTERMOST_PORT}/api/v4/posts",
                json=data, headers=headers)
        return JsonResponse({'status': response.json()}, status=response.status_code)
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def deleteTask(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        taskId = obj.get('taskId')
        idMM = obj.get('idMM')
        try:
            with firebirdsql.connect(host=host, database=database, user=user, password=password,
                                     charset=charset) as con:
                cur = con.cursor()
                sql = f'SELECT F4691 FROM T218 WHERE ID = {taskId}'
                cur.execute(sql)
                contractId = cur.fetchone()[0]
                sql = f"""SELECT F5451 FROM T218 WHERE ID = {taskId}"""
                cur.execute(sql)
                rootId = cur.fetchone()[0]
                sql = f"DELETE FROM T218 WHERE ID = {taskId}"
                cur.execute(sql)
                con.commit()
                if contractId is None:
                    idChannel = 'fd9nra9nx3n47jk7eyo1fg5t7o'
                else:
                    sql = f'select F4644 from T212 where ID = {contractId}'
                    cur.execute(sql)
                    idChannel = cur.fetchone()[0]
                sql = f"SELECT ID FROM T3 WHERE F16 = '{idMM}'"
                cur.execute(sql)
                director = cur.fetchone()[0]
                sql = f"SELECT F4932 FROM T3 WHERE ID = {director}"
                cur.execute(sql)
                director = cur.fetchone()[0]
                message = f"**Удалена :hammer_and_wrench: Задача :hammer_and_wrench: by @{director}**"
                data = {'channel_id': idChannel, 'message': message, 'root_id': rootId}
                response = requests.post(
                    f"{MATTERMOST_URL}:{MATTERMOST_PORT}/api/v4/posts",
                    json=data, headers=headers)
            return JsonResponse({'status': response.json()}, status=response.status_code)
        except Exception as ex:
            print(f"НЕ удалось удалить задачу {taskId}: {ex}")
            return ex
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
    start = perf_counter()
    with (firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con):
        cur = con.cursor()
        try:
            sql = """SELECT sectionId,
            sectionName,
            employeeId,
            employeeName,
            photo,
            LIST(contractId || '$' || contractNum || '$' || address || '$' || dateOfStart || '$' || dateOfEnding || '$' || contractStage || '$' || CASE WHEN tasks IS NULL THEN '' ELSE tasks END, '^') AS contracts
            FROM (SELECT T5.ID AS sectionId,
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
            LIST(T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F4697 || ';' || T218.ID || ';' || CASE WHEN T218.F5646 IS NULL THEN '' ELSE T218.F5646 END || ';' || CASE WHEN T218.F5872 IS NULL THEN '' ELSE T218.F5872 END || ';' || director.F16 || ';' || director.F4886 || ';' || executor.F16 || ';' || executor.F4886, '*') AS tasks
            FROM T5
            LEFT JOIN T3 ON T5.ID = T3.F27
            LEFT JOIN T253 ON T3.ID = T253.F5022
            LEFT JOIN T212 ON T253.F5024 = T212.ID
            LEFT JOIN T218 ON T212.ID = T218.F4691
            LEFT JOIN T3 director ON T218.F4693 = director.ID
            LEFT JOIN T3 executor ON T218.F4694 = executor.ID
            WHERE T3.F5383 = 1
            GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11) tasks GROUP BY 1, 2, 3, 4, 5"""
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
                        contracts.get('contracts').append({'contractId': data[0], 'contractNum': data[1],
                                                           'address': data[2],
                                                           'dateOfStart': {'title': '', 'value': data[3]},
                                                           'dateOfEnding': {'title': 'Срок работы', 'value': data[4]},
                                                           'stage': {'title': data[5]}, 'tasks': []})
                        Str = data[6]
                        if Str != '':
                            List = Str.split('*')
                            for allData in List:
                                list2 = allData.split(';')
                                list2[0].strip()
                                if list2[0] == '' and list2[1] == '' and list2[2] == '':
                                    continue
                                contracts.get('contracts')[count].get('tasks').append(
                                    {'id': list2[4], 'title': list2[0], 'dateOfStart': list2[1],
                                     'dateOfEnding': list2[2], 'done': list2[3],
                                     'director': {'mmId': list2[7], 'fullName': list2[8]},
                                     'executor': {'mmId': list2[9], 'fullName': list2[10]}, 'status': list2[6],
                                     'parentId': list2[5], 'tasks': []})
                                indexSubtask = 0
                                removeIndexesSubtasks = []
                                for subtask in contracts.get('contracts')[count].get('tasks'):
                                    for task in contracts.get('contracts')[count].get('tasks'):
                                        if task.get('id') == subtask.get('parentId') and task.get('id') != task.get('parentId'):
                                            task.get('tasks').append(subtask)
                                            removeIndexesSubtasks.append(indexSubtask)
                                    indexSubtask += 1
                                removeIndexesSubtasks = sorted(removeIndexesSubtasks, reverse=True)
                                for indexSubtask in removeIndexesSubtasks:
                                    contracts.get('contracts')[count].get('tasks').pop(indexSubtask)
                obj.update(contracts)
            end = perf_counter()
            print(f'GET /api/getAllDepartmentsStaffAndTasks {end - start}')
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
                sql = f"""SELECT T218.ID,
                T218.F4695 AS TASK,
                T218.F5569 AS START_DATE,
                T218.F4696 AS DEADLINE_DATE,
                T218.F5476 AS DEADLINE_TIME,
                T218.F4697 AS DONE,
                T218.F4708 AS DATE_OF_DONE,
                T218.F5646 AS parentId,
                T218.F5872 AS status,
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
                co_executor.ID AS ID_CO_EXECUTOR,
                co_executor.F16 AS ID_MM_CO_EXECUTOR,
                co_executor.F4886 AS CO_EXECUTOR_NAME
                FROM T218
                LEFT JOIN T3 AS DIRECTOR ON T218.F4693 = DIRECTOR.ID
                LEFT JOIN T3 AS EXECUTOR ON T218.F4694 = EXECUTOR.ID
                LEFT JOIN T212 ON T218.F4691 = T212.ID
                LEFT JOIN T205 ON T212.F4540 = T205.ID
                LEFT JOIN T313 ON T218.ID = T313.F5750
                LEFT JOIN T3 AS co_executor ON co_executor.ID = T313.F5751
                WHERE EXECUTOR.F16 = '{employeeId}' OR DIRECTOR.F16 = '{employeeId}' OR co_executor.F16 = '{employeeId}'"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = (
                    'id', 'task', 'startDate', 'deadlineTask', 'deadlineTime', 'done', 'dateDone', 'parentId', 'status',
                    'idDirector', 'idMMDirector', 'directorName', 'idExecutor', 'idMMExecutor', 'executorName',
                    'contractId', 'contractNum', 'address', 'customer', 'idCoExecutor', 'idMMCoExecutor',
                    'coExecutorName')
                json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
                today = datetime.date.today()
                for task in json_result:
                    director = {'director': {'idDirector': task.get('idDirector'), 'mmId': task.get('idMMDirector'),
                                             'directorName': task.get('directorName')}}
                    executor = {'executor': {'idExecutor': task.get('idExecutor'), 'mmId': task.get('idMMExecutor'),
                                             'executorName': task.get('executorName')}}
                    coExecutor = {'coExecutor': {'idCoExecutor': task.get('idCoExecutor'),
                                                 'mmId': task.get('idMMCoExecutor'),
                                                 'coExecutorName': task.get('coExecutorName')}}
                    task.update(director)
                    task.update(executor)
                    task.update(coExecutor)
                    task.pop('idDirector')
                    task.pop('idExecutor')
                    task.pop('idCoExecutor')
                    task.pop('idMMDirector')
                    task.pop('idMMExecutor')
                    task.pop('idMMCoExecutor')
                    task.pop('directorName')
                    task.pop('executorName')
                    task.pop('coExecutorName')
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
                            'deadlineTask': {'value': deadlineTask, 'expired': False}}
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
                    subtasks = {'subtasks': []}
                    task.update(subtasks)
                indexSubtask = 0
                removeIndexesSubtasks = []
                for subtask in json_result:
                    for task in json_result:
                        if task.get('id') == subtask.get('parentId') and task.get('id') != task.get('parentId'):
                            task.get('subtasks').append(subtask)
                            removeIndexesSubtasks.append(indexSubtask)
                    indexSubtask += 1
                removeIndexesSubtasks = sorted(removeIndexesSubtasks, reverse=True)
                for indexSubtask in removeIndexesSubtasks:
                    json_result.pop(indexSubtask)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить задачи сотрудника {employeeId}: {ex}")
                return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False,
                                                                                       'indent': 4})
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getContractsEmployee(request):
    if request.method == 'POST':
        start = perf_counter()
        obj = json.loads(request.body)
        employeeId = obj.get('employeeId')
        with firebirdsql.connect(
                host=host,
                database=database,
                user=user,
                password=password,
                charset=charset
        ) as con:
            cur = con.cursor()
            sql = f"""SELECT T212.ID AS contractId,
            T212.F4538 AS contractNum,
            T212.F4544 AS stage,
            T212.F4946 AS address,
            T212.F4648 AS path,
            T212.F4610 AS dateOfStart,
            T212.F4566 AS dateOfEnding,
            T237.F4890 AS services,
            T205.F4331 AS customer,
            LIST(DISTINCT T206.F4359 || ';' || T206.F4356 || ';' || T206.F4357 || ';' || T206.F4358) AS contacts,
            LIST(DISTINCT participants.F16 || ';' || participants.F4886) AS participants,
            responsible.F16 AS responsibleId,
            responsible.F4886 AS responsible,
            LIST(DISTINCT T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F4697 || ';' || T218.ID || ';' || CASE WHEN T218.F5872 IS NULL THEN '' ELSE T218.F5872 END || ';' || CASE WHEN T218.F5646 IS NULL THEN '' ELSE T218.F5646 END || ';' || director.F16 || ';' || director.F4886 || ';' || executor.F16 || ';' || executor.F4886, '*') AS tasks
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
            GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13"""  # F4648 - путь, F4538 - номер договора, F4544 - стадия, F4946 - адрес, F4948 - направление, F4566 - дата окончания
            cur.execute(sql)
            result = cur.fetchall()
            # Преобразование результата в список словарей
            columns = ('contractId', 'contractNum', 'stage', 'address', 'pathToFolder', 'dateOfStart', 'dateOfEnding',
                       'services', 'company', 'contacts', 'participants', 'responsibleId', 'responsible', 'tasks')
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
                    responsible = {'responsible': {'fullName': responsible.strip(), 'id': obj.get('responsibleId')}}
                else:
                    responsible = {'responsible': {'fullName': responsible, 'id': obj.get('responsibleId')}}
                obj.update(responsible)
                obj.pop('responsibleId')
                dateOfStart = {'dateOfStart': {'title': '', 'value': obj.get('dateOfStart')}}
                obj.update(dateOfStart)
                dateOfEnding = obj.get('dateOfEnding')
                if dateOfEnding is not None and status == 'В работе' and dateOfEnding < today:
                    dateOfEnding = {'dateOfEnding': {'title': 'Срок работы', 'value': dateOfEnding, 'expired': True}}
                else:
                    dateOfEnding = {'dateOfEnding': {'title': 'Срок работы', 'value': dateOfEnding, 'expired': False}}
                obj.update(dateOfEnding)
                Str = obj.get('contacts')
                contacts = {'contacts': []}
                if Str is not None:
                    List = Str.split(',')
                    for allData in List:
                        list2 = allData.split(';')
                        count = 0
                        for data in list2:
                            data.strip()
                            if data == '':
                                count += 1
                        if count < 4:
                            contacts.get('contacts').append({'fullName': list2[0], 'phone': [list2[1], list2[2]],
                                                             'post': '', 'email': list2[3]})
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
                            tasks.get('tasks').append({'id': list2[4], 'title': list2[0], 'dateOfStart': list2[1],
                                                       'dateOfEnding': list2[2], 'done': list2[3],
                                                       'director': {'mmId': list2[7], 'fullName': list2[8]},
                                                       'executor': {'mmId': list2[9], 'fullName': list2[10]},
                                                       'status': list2[5], 'parentId': list2[6], 'tasks': []})
                        indexSubtask = 0
                        removeIndexesSubtasks = []
                        for subtask in tasks.get('tasks'):
                            for task in tasks.get('tasks'):
                                if task.get('id') == subtask.get('parentId') and task.get('id') != task.get('parentId'):
                                    task.get('tasks').append(subtask)
                                    removeIndexesSubtasks.append(indexSubtask)
                            indexSubtask += 1
                        removeIndexesSubtasks = sorted(removeIndexesSubtasks, reverse=True)
                        for indexSubtask in removeIndexesSubtasks:
                            tasks.get('tasks').pop(indexSubtask)
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
                sql = f"""SELECT T3.ID as ID,
                T3.F16 as MMID,
                T3.F10 AS FIO,
                T3.F12 AS EMAIL,
                T3.F14 AS MOBILE_NUMBER,
                T3.F13 AS JOB_NUMBER,
                T3.F5411 AS ADD_NUMBER,
                T3.F15 AS TELEGRAM_USERNAME,
                T3.F18 AS BIRTHDAY,
                T3.F5572 AS OFFICE,
                T3.F4932 AS login,
                T5.F26 AS DEPARTMENT,
                T4.F7 AS JOB_TITLE,
                director.ID AS idDirector,
                director.F16 AS idMMDirector,
                director.F10 AS fioDirector
                FROM T3
                LEFT JOIN T5 ON T3.F27 = T5.ID
                LEFT JOIN T4 ON T3.F11 = T4.ID
                LEFT JOIN T3 AS director ON director.F27 = T3.F27 AND director.F5846 = 1
                WHERE T3.F16 = '{employeeId}'"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = ('id', 'mmId', 'FIO', 'email', 'telephone', 'jobTelephone', 'addTelephone', 'telegram',
                           'birthday', 'office', 'login', 'department', 'job', 'idDirector', 'idMMDirector',
                           'fioDirector')
                json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
                end = perf_counter()
                print(end - start)
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить данные по сотруднику с id {employeeId}: {ex}")
                return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False,
                                                                                       'indent': 4})
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def getVacations(request):
    if request.method == 'POST':
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = """SELECT T3.ID AS id,
                T3.F16 AS mmId,
                T3.F4886 AS employeeFI,
                T302.F5577 AS vacation,
                T302.F5579 AS vacationStart,
                T302.F5581 AS vacationEnd,
                T4.F7 AS post,
                T5.F26 AS department
                FROM T3
                LEFT JOIN T4 ON T4.ID = T3.F11
                LEFT JOIN T5 ON T5.ID = T3.F27
                LEFT JOIN T302 ON T302.F5574 = T3.ID
                WHERE T3.F5383 = 1 AND
                (T302.F5577 = 'отпуск' OR T302.F5577 = 'отпуск без содержания' OR T302.F5577 = 'удаленная работа' OR T302.F5577 = 'работа в выходной' OR T302.F5577 = 'отсутствие на рабочем месте' OR T302.F5577 = 'больничный' OR T302.F5577 IS NULL)
                ORDER BY department, employeeFI, vacation"""
                cur.execute(sql)
                result = cur.fetchall()
                columns = ('id', 'mmId', 'employeeFI', 'vacation', 'vacationStart', 'vacationEnd', 'post', 'department')
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

@csrf_exempt
def getContracts(request):
    if request.method == 'POST':
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = 'SELECT T212.ID AS id, T212.F4538 AS contractNum FROM T212'
                cur.execute(sql)
                result = cur.fetchall()
                columns = ('id', 'contractNum')
                json_result = [{col: value for col, value in zip(columns, row)} for row in result]  # Создаем список словарей с сериализацией значений
                return JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"НЕ удалось получить данные по договорам")
                return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def addTimeCost(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        idMM = obj.get('idMM')
        taskId = obj.get('taskId')
        dataReport = obj.get('dataReport')
        report = obj.get('report')
        spent = obj.get('spent')
        strToTime = datetime.datetime.strptime(spent, '%H:%M').time()
        timeHours = timeToFloat(strToTime)
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                cur.execute(f'SELECT GEN_ID(GEN_T320, 1) FROM RDB$DATABASE')
                ID = cur.fetchonemap().get('GEN_ID', None)
                sql = f"SELECT ID FROM T3 WHERE F16 = '{idMM}'"
                cur.execute(sql)
                idExecutor = cur.fetchone()[0]
                values = {
                    'ID': ID,
                    'F5881': idExecutor,
                    'F5862': taskId,
                    'F5869': dataReport,
                    'F5870': report,
                    'F5882': timeHours,
                    'F5863': spent,
                }
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
                sql = f"""INSERT INTO T320 ({', '.join(values.keys())}) VALUES ({', '.join(sql_values)})"""
                cur.execute(sql)
                con.commit()
                return JsonResponse({'result': 'Ok'}, status=200)
            except Exception as ex:
                print(f"Не удалось добавить отчёт по задаче {taskId}: {ex}")
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def editTimeCost(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        Id = obj.get('Id')
        dataReport = obj.get('dataReport')
        report = obj.get('report')
        spent = obj.get('spent')
        strToTime = datetime.datetime.strptime(spent, '%H:%M').time()
        timeHours = timeToFloat(strToTime)
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                values = {
                    'F5869': dataReport,
                    'F5870': report,
                    'F5882': timeHours,
                    'F5863': spent,
                }
                sql_values = []
                for key, value in values.items():
                    if value is None:
                        sql_values.append(key + ' = ' + 'NULL')
                    elif isinstance(value, (int, float)):  # Числовые значения
                        sql_values.append(key + ' = ' + str(value))
                    elif isinstance(value, str):  # Строковые значения
                        sql_values.append(key + ' = ' + f"'{value}'")
                    else:
                        raise ValueError(f"Unsupported type for value: {value}")
                sql = f"UPDATE T320 SET {', '.join(sql_values)} WHERE ID = {Id}"
                print(sql)
                cur.execute(sql)
                con.commit()
                return JsonResponse({'result': 'Ok'}, status=200)
            except Exception as ex:
                print(f"Не удалось изменить отчёт {Id}: {ex}")
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)

@csrf_exempt
def deleteTimeCost(request):
    if request.method == 'POST':
        obj = json.loads(request.body)
        Id = obj.get('Id')
        try:
            with firebirdsql.connect(host=host, database=database, user=user, password=password,
                                     charset=charset) as con:
                cur = con.cursor()
                sql = f"""DELETE FROM T320 WHERE ID = {Id}"""
                cur.execute(sql)
                con.commit()
            return JsonResponse({'status': 'Ok'}, status=200)
        except Exception as ex:
            print(f"НЕ удалось удалить отчёт {Id}: {ex}")
            return ex
    else:
        return JsonResponse({'error': 'Method Not Allowed'}, status=405)