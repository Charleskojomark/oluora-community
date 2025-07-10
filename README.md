Oluora Civic Engagement Platform API
A RESTful API for the Oluora Civic Engagement Platform, enabling community project suggestions, voting, digital townhall meetings, and live X updates for Abia State.
Technology Stack

Framework: Express.js
Database: PostgreSQL
ORM: Prisma
Authentication: JSON Web Tokens (JWT)
Validation: express-validator
Logging: Winston
API Docs: Swagger/OpenAPI
Testing: Jest
External API: X API (live integration)

Prerequisites

Node.js (v18 or higher)
PostgreSQL (v14 or higher)
npm
X API credentials (required for live X API integration)

Setup Instructions

Clone the Repository
git clone https://github.com/your-repo/oluora-api.git
cd oluora-api


Install Dependencies
npm install


Configure Environment VariablesCopy .env.example to .env and update the values:
cp .env.example .env

Example .env:
DATABASE_URL=postgresql://user:password@localhost:5432/oluora_db
JWT_SECRET=your_jwt_secret_key
X_API_KEY=your_x_api_key
X_API_SECRET=your_x_api_secret
X_ACCESS_TOKEN=your_x_access_token
X_ACCESS_TOKEN_SECRET=your_x_access_token_secret
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info

Note: Ensure valid X API credentials (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET) are provided for live X API integration.

Set Up PostgreSQL DatabaseCreate a database named oluora_db:
psql -U postgres -c "CREATE DATABASE oluora_db;"


Run Prisma MigrationsApply the database schema:
npx prisma migrate dev


Generate Prisma Client
npx prisma generate


Start the ServerFor development (with hot-reload):
npm run dev

For production:
npm start


Access API DocumentationOpen http://localhost:3000/api-docs in your browser to view Swagger documentation.

Run Tests
npm test



Project Structure
oluora-api/
├── src/
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Authentication, validation, error handling
│   ├── models/            # Prisma schema and model logic
│   ├── routes/            # Express route definitions
│   ├── services/          # Business logic and X API integration
│   ├── utils/             # Helpers (JWT, logging)
│   ├── tests/             # Jest unit tests
│   ├── app.js             # Express app setup
│   ├── server.js          # Server entry point
│   └── swagger.js         # Swagger setup
├── prisma/
│   └── schema.prisma      # Prisma schema
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation

API Endpoints

Auth: /api/auth/register, /api/auth/login
Projects: /api/projects, /api/projects/:id, /api/projects/:id/vote, /api/projects/:id/votes
Townhalls: /api/townhalls, /api/townhalls/:id
X Updates: /api/x-updates, /api/x-updates/:id, /api/x-updates/refresh (admin only)

See /api-docs for detailed endpoint documentation.
Notes

X API Integration: The X API is now integrated with live data in services/xUpdateService.js. Ensure valid X API credentials are set in the .env file to fetch real-time updates.
Caching: X updates are cached for 10 minutes to reduce API calls. The /api/x-updates/refresh endpoint (admin only) triggers a cache refresh via a cron job.
Authentication: All endpoints except /api/x-updates and auth routes require JWT authentication.
Rate Limiting: Applied to prevent abuse (configured via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX in .env).
Logging: Logs are stored in logs/error.log and logs/combined.log.
Testing: Tests in src/tests cover all endpoints. For faster test execution, consider mocking the X API in src/tests/xUpdates.test.js to avoid live API calls, as they can slow down tests.

Contributing

Fork the repository
Create a feature branch (git checkout -b feature/your-feature)
Commit changes (git commit -m 'Add feature')
Push to the branch (git push origin feature/your-feature)
Open a pull request

License
MIT License