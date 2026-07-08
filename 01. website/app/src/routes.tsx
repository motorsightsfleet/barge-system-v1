import { createBrowserRouter, Navigate, RouteObject } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import MasterArea from "./components/master/MasterArea";
import AreaForm from "./components/master/AreaForm";
import AreaDetail from "./components/master/AreaDetail";
import MasterBarge from "./components/master/MasterBarge";
import BargeForm from "./components/master/BargeForm";
import MasterShift from "./components/master/MasterShift";
import ShiftForm from "./components/master/ShiftForm";
import MasterBrand from "./components/master/MasterBrand";
import BrandForm from "./components/master/BrandForm";
import MasterUnitType from "./components/master/MasterUnitType";
import UnitTypeForm from "./components/master/UnitTypeForm";
import MasterUnitModel from "./components/master/MasterUnitModel";
import UnitModelForm from "./components/master/UnitModelForm";
import MasterEngine from "./components/master/MasterEngine";
import EngineForm from "./components/master/EngineForm";
import MasterUnitModelVariant from "./components/master/MasterUnitModelVariant";
import UnitModelVariantForm from "./components/master/UnitModelVariantForm";
import MasterUnit from "./components/master/MasterUnit";
import UnitForm from "./components/master/UnitForm";
import MasterVariantSpecification from "./components/master/MasterVariantSpecification";
import VariantSpecificationForm from "./components/master/VariantSpecificationForm";
import Planning from "./components/transactional/Planning";
import PlanningDetail from "./components/transactional/PlanningDetail";

export const routeConfig: RouteObject[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "master/area", Component: MasterArea },
      { path: "master/area/create", Component: AreaForm },
      { path: "master/area/:id/edit", Component: AreaForm },
      { path: "master/area/:id", Component: AreaDetail },
      { path: "master/barge", Component: MasterBarge },
      { path: "master/barge/create", Component: BargeForm },
      { path: "master/barge/:id/edit", Component: BargeForm },
      { path: "master/shift", Component: MasterShift },
      { path: "master/shift/create", Component: ShiftForm },
      { path: "master/shift/:id/edit", Component: ShiftForm },

      { path: "master/population/unit", Component: MasterUnit },
      { path: "master/population/unit/create", Component: UnitForm },
      { path: "master/population/unit/:id/edit", Component: UnitForm },

      { path: "master/population/variant-specification", Component: MasterVariantSpecification },
      { path: "master/population/variant-specification/create", Component: VariantSpecificationForm },
      { path: "master/population/variant-specification/:id/edit", Component: VariantSpecificationForm },

      { path: "master/population/brand", Component: MasterBrand },
      { path: "master/population/brand/create", Component: BrandForm },
      { path: "master/population/brand/:id/edit", Component: BrandForm },

      { path: "master/population/unit-type", Component: MasterUnitType },
      { path: "master/population/unit-type/create", Component: UnitTypeForm },
      { path: "master/population/unit-type/:id/edit", Component: UnitTypeForm },

      { path: "master/population/unit-model", Component: MasterUnitModel },
      { path: "master/population/unit-model/create", Component: UnitModelForm },
      { path: "master/population/unit-model/:id/edit", Component: UnitModelForm },

      { path: "master/population/engine", Component: MasterEngine },
      { path: "master/population/engine/create", Component: EngineForm },
      { path: "master/population/engine/:id/edit", Component: EngineForm },

      { path: "master/population/unit-model-variant", Component: MasterUnitModelVariant },
      { path: "master/population/unit-model-variant/create", Component: UnitModelVariantForm },
      { path: "master/population/unit-model-variant/:id/edit", Component: UnitModelVariantForm },

      { path: "transactional/operation", Component: Planning },
      { path: "transactional/operation/:id", Component: PlanningDetail },
    ],
  },
];

export const router = createBrowserRouter(routeConfig);
