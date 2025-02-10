

# Whiteboard AI Report System

## Overview

The Whiteboard AI Report System is a full-stack application that allows users to create, interact with, and manage dynamic whiteboards. The application leverages a FastAPI backend and a React-based frontend to manage nodes, subjects, connections, and reports. An AI language model (OpenAI) is integrated to generate summaries, introductions, detailed report bodies, and responses based on user interactions.

## Features

- **Dynamic Whiteboard Management:** Create nodes, subjects, and connections in real time.
- **AI-Powered Text Generation:** Use OpenAI’s API to generate summaries, introductions, responses, and comprehensive reports.
- **Report Generation:** Automatically generate detailed reports by aggregating node data and interactions.
- **Dockerized Environment:** Easily build and deploy the application using Docker Compose.

## Project Structure

```
.
├── backend
│   ├── app
│   │   ├── models         # SQLAlchemy models for whiteboard, node, subject, report, etc.
│   │   ├── schemas        # Pydantic schemas for request and response validation
│   │   ├── services       # Business logic and AI (LLMHelper) integration
│   │   ├── db.py          # Database configuration and session creation
│   │   └── main.py        # FastAPI application entry point
│   └── Dockerfile         # Dockerfile for building the backend image
├── frontend
│   └── Dockerfile         # Dockerfile for building the frontend image
├── docker-compose.yml     # Docker Compose configuration for multi-container deployment
└── README.md              # This file
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Variables

The application uses the following environment variables (set in the Docker Compose file):

- **DATABASE_URL**: Connection string for PostgreSQL.  
  Example: `postgresql://my_user:my_password@db:5432/my_database`
- **OPENAI_API_KEY**: Your OpenAI API key for generating AI-powered responses and summaries.

## Docker Compose Configuration

The provided `docker-compose.yml` file defines three services:

- **backend**:  
  - Builds from the `./backend` directory.
  - Exposes port `8000` for the FastAPI backend.
  - Mounts the local `./backend` directory into the container.
  - Sets environment variables for the database URL and OpenAI API key.
  - Depends on the `db` service.

- **frontend**:  
  - Builds from the `./frontend` directory.
  - Exposes port `4173` for the React application.
  - Depends on the `backend` service.

- **db**:  
  - Uses the official PostgreSQL image (version 15).
  - Exposes port `5433` on the host (mapped from container port `5432`).
  - Sets up database credentials and the database name.
  - Uses a volume (`pgdata`) for persistent storage.
  - Includes a healthcheck to ensure the database is ready.

```yaml
services:
  backend:
    build:
      context: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://my_user:my_password@db:5432/my_database
      - OPENAI_API_KEY=your-open-ai-key
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
    ports:
      - "4173:4173"
    depends_on:
      - backend

  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: my_user
      POSTGRES_PASSWORD: my_password
      POSTGRES_DB: my_database
    ports:
      - "5433:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "my_user", "-d", "my_database"]
      interval: 10s
      retries: 5

volumes:
  pgdata:
```

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Configure Environment Variables**

   Ensure the environment variables for the database and OpenAI API key are correctly set in the `docker-compose.yml` file. Update them if needed.

3. **Run Docker Compose**

   Build and start the application by running:

   ```bash
   docker-compose up --build
   ```

   This command will build the backend and frontend images, start the PostgreSQL database, and launch the services.

4. **Access the Application**

   - **Frontend:** Open your web browser and navigate to `http://localhost:4173`
   - **Backend API:** Access the API at `http://localhost:8000`

## Additional Information

- **Backend Documentation:**  
  The backend (FastAPI) includes comprehensive endpoints for managing nodes, subjects, interactions, and reports. Documentation for individual endpoints and components is available through code comments and docstrings.

- **Frontend Documentation:**  
  The React-based frontend uses libraries such as React Flow and Redux to manage the whiteboard UI and state.

- **AI Integration:**  
  The `LLMHelper` class in the backend handles calls to OpenAI's API for generating summaries, introductions, detailed bodies, responses, and extracting relevant context from interactions.

## Troubleshooting

- **Database Issues:**  
  Ensure that the PostgreSQL container is running and that the credentials in `DATABASE_URL` match the configuration in the `db` service.

- **OpenAI API Issues:**  
  Verify that your OpenAI API key is valid and that you have not exceeded your API limits.

- **Port Conflicts:**  
  If the default ports (`8000`, `4173`, or `5433`) are in use, modify the `docker-compose.yml` file accordingly.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or support, please contact [Pedro Ferreira] at [pedroferreira1142@gmail.com].
