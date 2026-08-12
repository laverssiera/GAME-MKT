# Contributing to GAME MKT Monolito

Thank you for your interest in contributing! This document provides guidelines for contributing.

## Code of Conduct

- Be respectful and inclusive
- Follow existing code style
- Write clear, descriptive commits
- Test your changes before submitting PR

## Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Git

### Quick Setup

```bash
# Clone repository
git clone https://github.com/laverssiera/GAME-MKT.git
cd game-mkt-monolito

# Run setup script
bash scripts/setup.sh

# Or manual setup
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker-compose up -d
```

### Development Workflow

#### Backend Development

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install pytest pytest-asyncio flake8

# Start development server
uvicorn app.main:app --reload

# Run tests
pytest

# Run linting
flake8 app
```

#### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run type-check

# Build
npm run build
```

## Project Structure

```
game-mkt-monolito/
├── frontend/       Vue 3 + Vite application
├── backend/        FastAPI application
├── database/       SQL schemas and migrations
├── infrastructure/ Kubernetes & observability configs
├── scripts/        Helper scripts
└── docs/           Documentation
```

## Feature Development

### Adding a New Feature

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Backend Implementation**
   - Create schema in `app/schemas/`
   - Create model in `app/models/`
   - Create repository in `app/repositories/`
   - Create service in `app/services/`
   - Create routes in `app/api/routes/`
   - Write tests in `app/tests/`

3. **Frontend Implementation**
   - Create component if needed
   - Create page in `src/pages/`
   - Update router in `src/router/`
   - Create service method in `src/services/`
   - Update store if needed

4. **Testing**
   - Backend: `pytest`
   - Frontend: `npm run type-check`

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add my-feature"
   git push origin feature/my-feature
   ```

6. **Create Pull Request**
   - Describe changes
   - Link related issues
   - Wait for review

## Code Style

### Backend (Python)

- Follow PEP 8
- Use type hints
- Max line length: 100
- Use black for formatting (optional)

```python
from typing import Optional
from sqlalchemy.orm import Session

def create_lead(db: Session, email: str, name: str) -> dict:
    """Create a new lead with email validation."""
    # Implementation
    return {"id": "...", "email": email}
```

### Frontend (TypeScript/Vue)

- Use TypeScript
- Follow Vue 3 Composition API
- Use meaningful variable names
- Max line length: 100

```typescript
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Lead {
  id: string
  email: string
  name: string
  score: number
}

const leads = ref<Lead[]>([])

const qualified = computed(() =>
  leads.value.filter(l => l.score >= 40)
)
</script>
```

## Testing

### Backend Tests

```bash
# All tests
pytest

# Specific test file
pytest app/tests/test_leads.py

# Specific test
pytest app/tests/test_leads.py::test_create_lead

# With coverage
pytest --cov=app app/tests
```

### Frontend Tests

To be implemented with vitest.

## Git Workflow

### Branch Naming

- Features: `feature/description`
- Fixes: `fix/description`
- Docs: `docs/description`

### Commit Messages

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
test: add tests
chore: maintenance tasks
```

### Example

```
feat: implement lead qualification

- Add scoring algorithm
- Integrate with John API
- Add tests

Closes #123
```

## Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Testing**: Confirm tests pass
4. **Review**: Tag relevant reviewers
5. **Changelog**: Note breaking changes

## Integration Testing

### With Docker

```bash
# Rebuild and restart
docker-compose down
docker-compose up --build

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### With Real Services

```bash
# Test against multiple services
# (requires JOHN_BASE_URL, CEFEIDA_BASE_URL, etc.)

pytest app/tests/integration
```

## Documentation

### Code Comments

```python
def calculate_score(email: str, phone: str) -> int:
    """
    Calculate lead quality score.
    
    Args:
        email: Validated email address
        phone: Phone number (optional)
    
    Returns:
        Score between 0-100
    
    Examples:
        >>> calculate_score("test@example.com", "123456")
        40
    """
```

### README Updates

Keep [README.md](../README.md) updated with:
- New endpoints
- New features
- Setup changes
- Configuration

## Deployment

### Staging

```bash
git checkout develop
git pull origin develop
docker-compose -f docker-compose.staging.yml up -d
```

### Production

```bash
# Merge to main with review
# GitHub Actions auto-deploys via:
# 1. Run tests
# 2. Build Docker images
# 3. Push to registry
# 4. Deploy to K8s (or VM)
```

## Common Issues

### Database Connection Refused

```bash
# Check if postgres is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Port Already in Use

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install
```

## Performance Tips

### Backend

- Use `@lru_cache` for expensive operations
- Batch database queries
- Index frequently queried fields
- Use connection pooling

### Frontend

- Lazy load routes
- Use `v-memo` for computed values
- Debounce API calls
- Cache API responses

## Security Considerations

- Never commit `.env` files
- Validate all user input (Pydantic)
- Use parameterized SQL queries
- Implement rate limiting
- Add authentication (JWT)

## Questions?

- Check [MONOLITO.md](../docs/MONOLITO.md)
- Review API docs: http://localhost:8000/docs
- Search GitHub Issues
- Ask in PR comments

---

**Happy coding! 🚀**
