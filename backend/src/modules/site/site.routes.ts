import { Router } from "express";
import * as siteController from "./site.controller";

export const siteRouter = Router();

siteRouter.get("/", siteController.list);
