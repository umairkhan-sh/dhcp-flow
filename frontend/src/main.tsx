// react imports
import { createRoot } from "react-dom/client";
import React from "react";
// css imports
import "./index.css";
// pages imports
import AuthPage from "@/pages/Auth/Auth";
// external libraries imports
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router";
// components imports
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
// store imports
import { useAuthStore } from "./Store/AuthStore";
import Configuration from "./pages/Configuration/Configuration";
import ShowConfiguration from "./pages/ShowConfiguration/ShowConfiguration";
import CustomConfiguration from "./pages/CustomConfiguration/CustomConfiguration";
import ShowShubnet from "./pages/ShowSubnets/ShowSubnets";
import AddSubnetToExsisting from "./pages/AddSubnetToExsisting/AddSubnetToExsisting";

// ProtectedRoute component
const ProtectedRoute = ({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) => {
  return isAuthenticated ? children : <Navigate to="/" />;
};

// App component
const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  const hideSidebarRoutes = ["/"];
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <SidebarProvider>
      {shouldShowSidebar && <AppSidebar />}
      <Routes>
        <Route index element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              children={<Dashboard />}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              children={<Configuration />}
            />
          }
        />
        <Route
          path="/show-configuration"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              children={<ShowConfiguration />}
            />
          }
        />
        <Route
          path="/custom-configuration"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              children={<CustomConfiguration />}
            />
          }
        />
        <Route
          path="/show-subnets"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              children={<ShowShubnet />}
            />
          }
        />
        <Route
          path="/add-subnet"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              children={<AddSubnetToExsisting />}
            />
          }
        />
      </Routes>
    </SidebarProvider>
  );
};

// root
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
