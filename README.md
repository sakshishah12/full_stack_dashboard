DASHBOARD_FULL/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── kpi_logs/                   # Source folder for sections 7
│   ├── comp_logs/
│   ├── event_logs/
│   ├── forecast_logs/
│   ├── review_logs/
│   ├── section6.py                 # Logic for section 6
│   ├── section7.py                 # Logic for section 7
│   └── ...
├── frontend/
│   ├── hotel-dashboard/           # Main React App
│   ├── my-form-app/               # Optional form-based sub-app
│   └── ...
├── README.md
└── package-lock.json
⚙️ Backend Setup (Python API)
✅ Prerequisites
Python 3.8+
pip

🔧 Steps
Navigate to backend directory:
cd DASHBOARD_FULL/backend
Install dependencies:
pip install -r requirements.txt
Run the server (assumes FastAPI or similar framework):
uvicorn main:app --reload
If successful, the server runs at:
http://127.0.0.1:8000

💻 Frontend Setup (React)
✅ Prerequisites
Node.js (v14+)

npm

🔧 Steps
Navigate to hotel dashboard React app:
cd DASHBOARD_FULL/frontend/hotel-dashboard
Install dependencies:
npm install
Run frontend:
npm start
Open http://localhost:3000 to view the dashboard.

🧠 Data Flow Summary
Hardcoded hotel data is used as the data source (e.g., hotel_name, daily data).
Section 6 & Section 7 fetch and process data directly from the kpi_logs/ directory.
Sub-components (e.g., competitive prices, event trends) store results into:

comp_logs/

event_logs/

forecast_logs/

review_logs/

🔄 Sections Breakdown
Section	Script	Source Folder	Description
6	section6.py	kpi_logs/	Loads KPIs like ADR, RevPAR
7	section7.py	kpi_logs/	Aggregates KPIs and stores results

🧪 Sample API Endpoints
Method	Endpoint	Description
GET	/section6	Returns KPIs for dashboard section 6
GET	/section7	Returns KPIs for section 7

KPIs such as ADR, Occupancy Rate, and Forecast Accuracy are computed and visualized in the frontend.
