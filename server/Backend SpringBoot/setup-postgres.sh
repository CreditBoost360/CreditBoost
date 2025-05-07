#!/bin/bash

echo "Installing PostgreSQL..."
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

echo "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE creditboost;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

echo "PostgreSQL setup complete!"
echo "You can now run your Spring Boot application."