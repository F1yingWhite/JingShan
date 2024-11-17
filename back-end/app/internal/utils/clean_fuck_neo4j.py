import json

from ..models.graph_database import neo4j_driver


def clean():
    with neo4j_driver.session() as session:
        # 查询所有需要清理的节点及其属性
        query = """
            MATCH (n)
            RETURN n
            """
        nodes = session.run(query)

        for record in nodes:
            node = record["n"]
            properties = node._properties

            # 处理每个属性
            updates = {}
            for key, value in properties.items():
                if isinstance(value, str) and value.startswith("[") and value.endswith("]"):
                    try:
                        # 转换为真实的列表
                        parsed_value = json.loads(value.replace("'", '"'))
                        # 将所有值转换为字符串
                        string_value = [str(item) for item in parsed_value]
                        updates[key] = string_value
                        print(f"Updated value for key {key}: {string_value}")
                    except json.JSONDecodeError:
                        print(f"Failed to parse value for key {key}: {value}")

            # 如果有更新的属性，更新回数据库
            if updates:
                update_query = """
                    MATCH (n)
                    WHERE id(n) = $node_id
                    SET n += $updates
                    """
                try:
                    session.run(update_query, node_id=node.id, updates=updates)
                except Exception as e:
                    print(f"Error updating node {node.id} with updates {updates}: {e}")
