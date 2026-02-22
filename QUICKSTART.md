# PolicyGuard Compliance Platform - Quick Start Guide

## 🚀 Setup Instructions

### 1. Start the Backend API Server

Open a PowerShell terminal in the project directory and run:

```bash
D:/Hackfest2.0/hackfest-2.0/.venv/Scripts/python.exe backend/main.py
```

Or simply double-click `start_backend.bat`

**Expected output:**
```
============================================================
🛡  PolicyGuard API Server
============================================================
Starting FastAPI server...
📍 API will be available at: http://127.0.0.1:8000
📚 API Docs at: http://127.0.0.1:8000/docs
⚙️  ReDoc at: http://127.0.0.1:8000/redoc
============================================================
```

### 2. Start the Frontend Development Server

In a new terminal, run:

```bash
npm run dev
```

Then visit: `http://localhost:3000`

---

## 📊 Data Integration

The system automatically loads data from:
```
c:\Users\Acer Nitro 5\Downloads\PolicyGuard_Compliance_Report.xlsx
```

**Key Statistics from Dataset:**
- **Total Records:** 4,000
- **Compliant:** 604 (15.1%)
- **Violations:** 3,396 (84.9%)
- **Violation Reasons:**
  - Low Customer Satisfaction: 2,614 (76.9%)
  - Policy Exception: 431 (12.7%)
  - Training Gap: 351 (10.3%)

---

## 👤 Default Login Credentials

### Employee Login
- **Username:** EMP-001
- **Password:** pass123

### Admin Login
- **Username:** admin
- **Password:** admin123

---

## 🔌 API Endpoints

### Dashboard Data
- `GET /api/dashboard/summary` - Overall compliance metrics
- `GET /api/dashboard/monthly-violations` - Monthly trends
- `GET /api/dashboard/violation-reasons` - Violation breakdown

### Employee Data
- `GET /api/employees/{employee_id}` - Employee metrics (e.g., `/api/employees/EMP-001`)

### Records Management
- `POST /api/records/upload` - Upload Excel file
- `GET /api/records` - Get paginated records
- `GET /api/records/stats` - Aggregated statistics

### Health Check
- `GET /api/health` - API status

---

## 🎯 Features

### Employee Dashboard
1. **Profile Overview** - Employee info with risk assessment
2. **4 Metric Cards:**
   - Your Violations: 11/12 records
   - Violation Rate: 92% (Org avg: 86.9%)
   - Avg CSS Score: 2.4 (Policy min: 3.5)
   - Targets Met: 7/12 months

3. **Monthly Performance Chart** - Vertical bar chart showing compliant vs violation trends
4. **Your Risk Level** - Circular progress chart with risk badge
5. **Record History** - Table of recent compliance records

### Side Navigation
- 🛡️ Dashboard (default view with metrics)
- 📄 My Reports (dataset table)
- ⚠️ Violations (violation summaries)
- 📈 Performance (compliance metrics)
- 🏆 Leaderboard (department rankings)

### Admin Dashboard
- Dataset upload and management
- User management
- Compliance metrics
- Sidebar navigation

---

## 🔐 Authentication Flow

1. User lands on login page (`/`)
2. Selects role (Admin or Employee)
3. Enters credentials
4. System validates against hardcoded or stored users
5. Sets auth token in localStorage
6. Redirects to appropriate dashboard (`/admin` or `/employee`)
7. API automatically fetches user-specific data

---

## 📝 Data Structure

### Employee Profile (from API)
```json
{
  "id": "EMP-001",
  "name": "Ahmed Tariq",
  "department": "Sales Department",
  "violations": 11,
  "total_records": 12,
  "violation_rate": 92,
  "css_avg": 2.4,
  "targets_hit": 7,
  "total_targets": 12,
  "risk_level": "HIGH",
  "monthlyData": [...]
}
```

### Monthly Data
```json
{
  "month": "January",
  "compliant": 699,
  "violation": 301
}
```

---

## 🔄 Frontend-Backend Communication

**Flow:**
1. Login → Save token to localStorage
2. Navigate to Employee Dashboard
3. `useEffect` fetches: `/api/employees/EMP-001`
4. Component receives real data from backend
5. Renders monthly chart with API data
6. Record table displays uploaded records

---

## 🛠️ Technologies Used

### Frontend
- **Framework:** Next.js 16.1.6
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State:** React Hooks (useState, useEffect)
- **Data Import:** XLSX client-side parsing

### Backend
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **Data:** Pandas, openpyxl (Excel parsing)
- **API:** RESTful endpoints with JSON

---

## 🚨 Troubleshooting

**Backend won't start:**
- Ensure Python 3.12.6+ is active: `python --version`
- Check if port 8000 is available: `netstat -ano | findstr :8000`
- Verify FastAPI is installed: `pip list | grep fastapi`

**Frontend can't connect to API:**
- Ensure backend is running on `http://127.0.0.1:8000`
- Check browser console for CORS errors
- Verify API docs work: `http://127.0.0.1:8000/docs`

**Missing Excel file:**
- System uses default data if file not found
- Update path in `backend/main.py` line with `excel_path`

---

## 📈 Next Steps

- [ ] Connect to production database (PostgreSQL/MongoDB)
- [ ] Implement JWT authentication
- [ ] Add real-time notifications
- [ ] Create advanced analytics dashboard
- [ ] Add file upload processing pipeline
- [ ] Implement CID (Compliance ID) tracking
- [ ] Add role-based access control

---

## 📞 Support

For issues or questions:
1. Check API docs: `http://127.0.0.1:8000/docs`
2. Review `BACKEND_SETUP.md` for detailed API info
3. Check frontend logs in browser console
4. Review backend output in terminal

