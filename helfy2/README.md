###### Access
Frontend: http://localhost:8080

Backend API: http://localhost:3001/api

Notes
Default admin user:
email: admin@example.com
password: admin123

Logs user login and database changes in structured JSON format




## Environment Variables
The backend and CDC consumer use a `.env` file for configuration.  
If no `.env` file exists, it will be automatically created with default values when you run the setup script.

Default values:
DB_HOST=tidb
DB_USER=root
DB_PASSWORD=
DB_NAME=testdb
JWT_SECRET=your-very-secure-secret
KAFKA_BROKER=kafka:9092
KAFKA_TOPIC=tidb-cdc-topic
PORT=3001

bash
Copy
Edit

---

###  setup script (`setup.sh`)

```bash
#!/bin/bash

if [ ! -f .env ]; then
  echo "Creating default .env file..."
  cat <<EOL > .env
DB_HOST=tidb
DB_USER=root
DB_PASSWORD=
DB_NAME=testdb
JWT_SECRET=your-very-secure-secret
KAFKA_BROKER=kafka:9092
KAFKA_TOPIC=tidb-cdc-topic
PORT=3001
EOL
else
  echo ".env file already exists, skipping creation."
fi
Make it executable and run it before docker-compose up:

bash
Copy
Edit
chmod +x setup.sh
./setup.sh
docker-compose up --build


