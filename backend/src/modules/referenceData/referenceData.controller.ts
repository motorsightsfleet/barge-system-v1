import { Request, Response, NextFunction } from "express";
import { created, ok } from "../../lib/apiResponse";
import { AppError } from "../../lib/AppError";
import { referenceDataListQuerySchema } from "./referenceData.validation";
import { isReferenceDataType, type ReferenceDataType } from "./referenceData.constants";
import { REFERENCE_DATA_CONFIG } from "./referenceData.config";
import * as referenceDataService from "./referenceData.service";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

// `fixedType` binds a router instance to one type (e.g. mounted at /api/brands) so the
// legacy per-type paths keep behaving exactly as before. Omit it for the consolidated
// /api/reference-data/:type router, which resolves the type from the URL instead.
export function createReferenceDataController(fixedType?: ReferenceDataType) {
  function resolveType(req: Request): ReferenceDataType {
    if (fixedType) return fixedType;
    const { type } = req.params;
    if (!isReferenceDataType(type)) throw AppError.notFound("Reference data type not found");
    return type;
  }

  return {
    async list(req: Request, res: Response, next: NextFunction) {
      try {
        const type = resolveType(req);
        const query = referenceDataListQuerySchema.parse(req.query);
        const result = await referenceDataService.list(type, query);
        return res.status(200).json({
          status: "success",
          message: `${REFERENCE_DATA_CONFIG[type].entityLabelPlural} retrieved`,
          data: result.data,
          pagination: result.pagination,
        });
      } catch (err) {
        next(err);
      }
    },

    async getOne(req: Request, res: Response, next: NextFunction) {
      try {
        const type = resolveType(req);
        const entity = await referenceDataService.getById(type, req.params.id);
        return ok(res, entity, `${REFERENCE_DATA_CONFIG[type].entityLabel} retrieved`);
      } catch (err) {
        next(err);
      }
    },

    async create(req: Request, res: Response, next: NextFunction) {
      try {
        const type = resolveType(req);
        const entity = await referenceDataService.create(type, req.body);
        return created(res, entity, `${REFERENCE_DATA_CONFIG[type].entityLabel} successfully created`);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction) {
      try {
        const type = resolveType(req);
        const entity = await referenceDataService.update(type, req.params.id, req.body);
        return ok(res, entity, `${REFERENCE_DATA_CONFIG[type].entityLabel} successfully updated`);
      } catch (err) {
        next(err);
      }
    },

    async remove(req: Request, res: Response, next: NextFunction) {
      try {
        const type = resolveType(req);
        await referenceDataService.softDelete(type, req.params.id);
        return ok(res, null, `${REFERENCE_DATA_CONFIG[type].entityLabel} successfully deleted`);
      } catch (err) {
        next(err);
      }
    },

    async exportCsv(req: Request, res: Response, next: NextFunction) {
      try {
        const type = resolveType(req);
        const config = REFERENCE_DATA_CONFIG[type];
        const entities = await referenceDataService.listForExport(type);
        const header = ["Name", "Status"];
        const rows = entities.map((e) => [e.name, e.isActive ? "Active" : "Inactive"].map((v) => csvEscape(String(v))).join(","));
        const csv = [header.join(","), ...rows].join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=${config.exportFilename}`);
        return res.status(200).send(csv);
      } catch (err) {
        next(err);
      }
    },
  };
}
