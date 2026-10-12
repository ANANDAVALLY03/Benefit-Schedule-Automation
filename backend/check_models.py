from models.models import TABLE_NAMES, metadata

for table_name in TABLE_NAMES:
    table = metadata.tables[f"public.{table_name}"]

    print(f"\nTable: {table_name}")

    for column in table.columns:
        print(
            f"  {column.name} - {column.type}"
        )

print(f"\nTotal tables: {len(TABLE_NAMES)}")