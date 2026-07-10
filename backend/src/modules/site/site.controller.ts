import { Request, Response, NextFunction } from "express";
import { ok } from "../../lib/apiResponse";
import * as siteService from "./site.service";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const sites = await siteService.listSites();
    return ok(res, sites, "Sites retrieved");
  } catch (err) {
    next(err);
  }
}
