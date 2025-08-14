# from django.test import TestCase
import firebirdsql
from config import host, database, user, password, charset
from time import perf_counter


# Create your tests here.

def recalculationIndexes():
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
        LIST(DISTINCT T218.F4695 || ';' || T218.F5569 || ';' || T218.F4696 || ';' || T218.F4697 || ';' || director.F16 || ';' || executor.F16 || ';' || T218.ID || ';' || director.F4886 || ';' || executor.F4886, '*') AS tasks
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
        GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15
        """
        cur.execute(sql)
        results = cur.fetchall()
        print(results)
    end = perf_counter()
    print(end - start)

recalculationIndexes()