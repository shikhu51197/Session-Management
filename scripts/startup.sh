#!/bin/bash

echo "Starting Session Management System..."

# Create .env from .env.example if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
fi

echo "Building and starting Docker containers..."
docker compose up --build

echo "System started successfully! Run 'docker-compose logs -f' to see logs."
