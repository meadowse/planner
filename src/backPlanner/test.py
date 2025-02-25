import firebirdsql
import json
# параметры подключения к базе:
database='MPK'
host='10.199.1.11'
user='sysdba'
password='F409mZu5'
charset='UTF8'

def get_mp_id_and_name():
    # with open('dict.json', "r") as f:
    #     data = json.load(f)
    # tableName = data.get("Автомобили").get("TableName")
    with firebirdsql.connect(host=host, database=database, user=user, password=password, charset=charset) as con:
        cur = con.cursor()
        # sql = f"""
        # select * from DX_FORMS
        # """
        # cur.execute(sql)
        # result = cur.fetchone()
        # str = result[1]
        # List = str.split('\r\n')
        # for elem in List:
        #     if
        # Преобразование результата в список словарей
        # result_list = [{'manager_name': row[0], 'total_payments': row[1]} for row in result]

        # Сериализация в JSON
        # json_result = json.dumps(result, ensure_ascii=False)

        sql = """
        select ID, TASKS from EXPORT
        """
        cur.execute(sql)
        result = cur.fetchall()
        for row in result:
            sql = f"""
            update T218 set T218.F4695 = '{row[1]}' where T218.ID = '{row[0]}'
            """
            cur.execute(sql)
            con.commit()
        return 'ok'

        # return List

print(get_mp_id_and_name())