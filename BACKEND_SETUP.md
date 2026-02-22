# FastAPI Backend Setup Guide

## Installation

The backend API has been created with FastAPI to serve compliance data from the PolicyGuard Excel dataset.

### Prerequisites
- Python 3.12.6+ (already configured in `.venv`)
- FastAPI, uvicorn, pandas, openpyxl (installed)

### Start the Backend Server

Run the following command in a terminal from the project root:

```bash
D:/Hackfest2.0/hackfest-2.0/.venv/Scripts/python.exe backend/main.py
```

Or simply:

```bash
python backend/main.py
```

The API will start at: `http://127.0.0.1:8000`

## API Endpoints

### Dashboard Data
- **GET `/api/dashboard/summary`** - Overall compliance metrics
  ```json
  {
    "total_records": 4000,
    "compliant": 604,
    "violations": 3396,
    "compliance_rate": "15.1%",
    "violation_risk": "HIGH"
  }
  ```

- **GET `/api/dashboard/monthly-violations`** - Monthly violation trends
  ```json
  [
    {"month": "January", "compliant": 699, "violation": 301},
    ...
  ]
  ```

- **GET `/api/dashboard/violation-reasons`** - Breakdown of violation types
  ```json
  [
    {
      "reason": "Low Customer Satisfaction",
      "count": 2614,
      "percentage": 76.9,
      "severity": "HIGH"
    },
    ...
  ]
  ```

### Employee Data
- **GET `/api/employees/{employee_id}`** - Employee-specific compliance data
  - Returns metrics like violations, CSS score, risk level

### Records Management
- **POST `/api/records/upload`** - Upload Excel file with compliance records
- **GET `/api/records`** - Get paginated records (skip, limit parameters)
- **GET `/api/records/stats`** - Get aggregated statistics

### Health Check
- **GET `/api/health`** - API health status

## Frontend Integration

The frontend automatically connects to the API at:
```
http://127.0.0.1:8000/api
```

**Data Flow:**
1. Employee logs in to the frontend
2. Frontend fetches dashboard metrics from `/api/dashboard/summary`
3. Monthly performance data from `/api/dashboard/monthly-violations`
4. Employee profile data from `/api/employees/{id}`
5. Records displayed from `/api/records`

## Running Both Frontend and Backend

**Terminal 1 - Start Backend:**
```bash
D:/Hackfest2.0/hackfest-2.0/.venv/Scripts/python.exe backend/main.py
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Then visit: `http://localhost:3000`

## Dataset Integration

The backend reads from:
```
c:\Users\Acer Nitro 5\Downloads\PolicyGuard_Compliance_Report.xlsx
```

**Key Data Points Extracted:**
- Total Records: 4,000
- Compliant: 604 (15.1%)
- Violations: 3,396 (84.9%)
- Monthly breakdown (Jan-Dec)
- Violation reasons with severity levels

## Database Notes

Currently using in-memory storage. For production:
1. Migrate to PostgreSQL/MongoDB
2. Create proper data models (CID, EIN for employee tracking)
3. Implement authentication with JWT tokens
4. Add role-based access control (RBAC)
5. Create data persistence layer

## Next Steps

- [ ] Add user authentication API endpoint
- [ ] Create database models for employee, records, violations
- [ ] Add CID (Compliance ID) and EIN (Employee ID) tracking
- [ ] Implement file upload and processing pipeline
- [ ] Add real-time notifications
- [ ] Create admin analytics dashboard with API

