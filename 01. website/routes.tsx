import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import MasterArea from "./components/master/MasterArea";
import MasterBarge from "./components/master/MasterBarge";
import MasterShift from "./components/master/MasterShift";
import MasterPopulation from "./components/master/MasterPopulation";
import Planning from "./components/transactional/Planning";
import PlanningDetail from "./components/transactional/PlanningDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "master/area", Component: MasterArea },
      { path: "master/barge", Component: MasterBarge },
      { path: "master/shift", Component: MasterShift },
      { path: "master/population", Component: MasterPopulation },
      { path: "transactional/operation", Component: Planning },
      { path: "transactional/operation/:id", Component: PlanningDetail },
    ],
  },
]);