import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { VehicleProvider } from "./context/VehicleContext";
import { StaffNotificationProvider } from "./context/StaffNotificationContext";
import { CustomerNotificationProvider } from "./context/CustomerNotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <VehicleProvider>
        <StaffNotificationProvider>
          <CustomerNotificationProvider>
            <App />
          </CustomerNotificationProvider>
        </StaffNotificationProvider>
      </VehicleProvider>
    </BrowserRouter>
  </React.StrictMode>
);