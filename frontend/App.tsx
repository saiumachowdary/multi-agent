import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" />;
}

function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };
  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
    >
      Logout
    </button>
  );
}

const App = () => {
  return (
      <BrowserRouter>
      <LogoutButton />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Index />
            </PrivateRoute>
          }
        />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
);
};

export default App;
