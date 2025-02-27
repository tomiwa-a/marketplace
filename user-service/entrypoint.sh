#!/bin/sh
set -e

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! pg_isready -h user-db -p 5432 -U postgres
do
    sleep 2
done

make db/migrations/up 

# Start the application
echo "Starting the application..."
go run cmd/main.go