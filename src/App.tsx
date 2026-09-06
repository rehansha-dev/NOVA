import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CampusCopilot from "./components/CampusCopilot";

import Calendar from "./pages/Calendar";
import CreateEvent from "./pages/CreateEvent";
import Discover from "./pages/Discover";
import EditEvent from "./pages/EditEvent";
import EventDetails from "./pages/EventDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Saved from "./pages/Saved";
import Signup from "./pages/Signup";
import OrganizerDashboard from "./pages/OrganizerDashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        {/* =========================================
            NAVIGATION
        ========================================= */}

        <Navbar />


        {/* =========================================
            APPLICATION ROUTES
        ========================================= */}

        <Routes>

          {/* ==============================
              AUTHENTICATION
          ============================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* ==============================
              PUBLIC PAGES
          ============================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/discover"
            element={<Discover />}
          />

          <Route
            path="/event/:id"
            element={<EventDetails />}
          />


          {/* ==============================
              PROTECTED PAGES
          ============================== */}

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer"
            element={
              <ProtectedRoute>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/edit/:id"
            element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            }
          />


          {/* ==============================
              UNKNOWN ROUTES
          ============================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>


        {/* =========================================
            NOVA CAMPUS COPILOT
            Global floating assistant
        ========================================= */}

        <CampusCopilot />

      </div>
    </BrowserRouter>
  );
}

export default App;