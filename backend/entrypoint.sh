#!/bin/sh
if [ ! -f /app/data/dhcp-flow.db ]; then
    sqlite3 /app/data/dhcp-flow.db < /app/data/scripts.sql
fi
./main 