from connection import test_connection, get_table_count

print("Connected to:", test_connection())
print("Total tables:", get_table_count())