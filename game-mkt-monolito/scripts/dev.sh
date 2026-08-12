#!/bin/bash

# Development server startup script
# Run both frontend and backend in watch mode

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

RUN_P15_EXAMPLES=false
for arg in "$@"; do
	if [[ "$arg" == "--run-p15-examples" ]]; then
		RUN_P15_EXAMPLES=true
	fi
done

echo -e "${BLUE}Starting GAME MKT development environment...${NC}"

# Start Docker containers
echo -e "${GREEN}1. Starting Docker containers...${NC}"
docker-compose up -d postgres redis nats jaeger

# Wait for services
sleep 5

# Terminal 1: Backend
echo -e "${GREEN}2. Starting backend API...${NC}"
(cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) &
BACKEND_PID=$!

# Terminal 2: Frontend
echo -e "${GREEN}3. Starting frontend dev server...${NC}"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Development environment started!${NC}"
echo ""
echo "Services:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Docs:     http://localhost:8000/docs"
echo "  Jaeger:   http://localhost:16686"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

if [[ "$RUN_P15_EXAMPLES" == true ]]; then
	echo -e "${GREEN}4. Running P15 API examples...${NC}"

	# Retry health check until backend is ready.
	if curl -fsS --retry 20 --retry-delay 1 --retry-connrefused "http://localhost:8000/health" >/dev/null; then
		(cd backend && bash EXAMPLES.sh)
	else
		echo -e "${BLUE}Backend did not become ready in time. Skipping P15 examples.${NC}"
	fi

	echo ""
fi

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
