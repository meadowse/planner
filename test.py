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
        sql = f"""
        select * from DX_FORMS
        """
        cur.execute(sql)
        result = cur.fetchone()

        # Преобразование результата в список словарей
        # result_list = [{'manager_name': row[0], 'total_payments': row[1]} for row in result]

        # Сериализация в JSON
        json_result = json.dumps(result, ensure_ascii=False)

        return json_result

print(get_mp_id_and_name())