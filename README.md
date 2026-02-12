# dhcp-flow

DHCP Flow is a full-stack application designed to visualize and manage DHCP subnets and Kubernetes resources. It provides a user-friendly dashboard to interact with network configurations and container orchestration components.

## Features

-   **DHCP Management**: View and manage DHCP subnets.
-   **Kubernetes Resource Dashboard**: Monitor Pods, ConfigMaps, and Deployments.
-   **Authentication**: Secure login system.
-   **Configuration Management**: Application configuration options.

## Tech Stack

-   **Backend**: Go (Golang), SQLite
-   **Frontend**: React, Vite, TypeScript, Tailwind CSS
-   **Infrastructure**: Docker, Docker Compose
-   **Orchestration**: Kubernetes (optional, for specific features)

## Getting Started

### Prerequisites

-   Docker & Docker Compose
-   Go 1.22+ (for local backend development)
-   Node.js 18+ (for local frontend development)

### Quick Start (Docker Compose)

To run the entire application stack using Docker Compose:

```bash
docker-compose up -d
```

This will start:
-   **Frontend**: accessible at `http://localhost:80`
-   **Backend**: accessible at `http://localhost:8080`

### Local Development

#### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    go mod download
    ```
3.  Run the server:
    ```bash
    go run main.go
    ```
    The server will start on port `8080`.

#### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## Project Structure

```
dhcp-flow/
├── backend/          # Go backend service
│   ├── db/           # Database initialization and connection
│   ├── handlers/     # HTTP request handlers
│   └── main.go       # Entry point
├── frontend/         # React frontend application
│   ├── src/          # Source code
│   └── public/       # Static assets
├── k8s/              # Kubernetes manifests
├── docker-compose.yml # Docker Compose configuration
└── README.md         # Project documentation
```

## Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.
