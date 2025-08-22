# from django.test import TestCase
import datetime
import json
import firebirdsql
from time import perf_counter
from config import host, database, user, password, charset
# from time import perf_counter
# from pathlib import Path


# Create your tests here.

def getTask():
        # taskId = 3668
        # parentId = 2675
        start = perf_counter()
        with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
            cur = con.cursor()
            try:
                sql = f"""SELECT * from T212"""
                cur.execute(sql)
                result = cur.fetchall()
                # columns = (
                #     'id', 'contractId', 'task', 'idTypeWork', 'dateStart', 'deadlineTask', 'idDirector', 'idMMDirector',
                #     'directorFIO', 'idExecutor', 'idMMExecutor', 'executorFIO', 'done', 'parentId')
                # json_result = [
                #     {col: value for col, value in zip(columns, row)}
                #     for row in result
                # ]  # Создаем список словарей с сериализацией значений
                # for task in json_result:
                #     dateStart = task.get('dateStart')
                #     if dateStart is None:
                #         dateStart = {'dateStart': dateStart}
                #     else:
                #         dateStart = {'dateStart': datetime.datetime.strftime(dateStart, '%Y-%m-%d')}
                #     task.update(dateStart)
                #     deadlineTask = task.get('deadlineTask')
                #     if deadlineTask is None:
                #         deadlineTask = {'deadlineTask': deadlineTask}
                #     else:
                #         deadlineTask = {'deadlineTask': datetime.datetime.strftime(deadlineTask, '%Y-%m-%d')}
                #     task.update(deadlineTask)
                # jsonResult = {'parent': {}, 'daughters' : []}
                # for row in json_result:
                #     if row.get('id') == parentId:
                #         jsonResult.get('parent').update(row)
                #     else:
                #         jsonResult.get('daughters').append(row)
                end = perf_counter()
                print(end - start)
                with open('json.txt', 'w', encoding='utf-8') as f:
                    json.dump(result, f, ensure_ascii=False, indent=4)
                return json.dumps(result, ensure_ascii=False, indent=4)
            # JsonResponse(json_result, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})
            except Exception as ex:
                print(f"Не удалось получить данные по отделам и сотрудникам: {ex}")
            # return JsonResponse({"error": str(ex)}, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 4})

print(getTask())