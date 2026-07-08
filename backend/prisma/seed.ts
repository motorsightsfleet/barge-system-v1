import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedBarges = [
  { code: "MS-BS-001", name: "MOTORSIGHTS ALPHA", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-002", name: "MOTORSIGHTS BETA", owner: "PT. Koninis Fajar Mineral", capacityMt: 11500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-111", name: "MOTORSIGHTS OMEGA", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-201", name: "MOTORSIGHTS WOLF", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-511", name: "MOTORSIGHTS LION", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-512", name: "MOTORSIGHTS ELEPHANT", owner: "PT. Koninis Fajar Mineral", capacityMt: 11500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-513", name: "MOTORSIGHTS GOLD", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-211", name: "MOTORSIGHTS ROYAL", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "UNAVAILABLE" as const },
  { code: "MS-BS-221", name: "MOTORSIGHTS SUPREME", owner: "PT. Koninis Fajar Mineral", capacityMt: 10500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-251", name: "MOTORSIGHTS ULTIMATE", owner: "PT. Koninis Fajar Mineral", capacityMt: 11500, type: "Nickel Carrier", status: "AVAILABLE" as const },
  { code: "MS-BS-069", name: "CITRA 339", owner: "PT Hartono Wijaya", capacityMt: 11500, type: "Coal Carrier", status: "AVAILABLE" as const },
];

const SAMPLE_POLYGON =
  "POLYGON((116.4500 -3.1200, 116.4521 -3.1192, 116.4548 -3.1195, 116.4572 -3.1208, 116.4591 -3.1230, 116.4595 -3.1257, 116.4583 -3.1281, 116.4560 -3.1294, 116.4532 -3.1298, 116.4509 -3.1287, 116.4495 -3.1264, 116.4493 -3.1237, 116.4500 -3.1200))";

const seedSites = ["Bunta", "Buleleng", "Kabaena"];

const seedAreas = [
  { areaName: "EFO 1", site: "Bunta", category: "Loading", isActive: true },
  { areaName: "EFO 2", site: "Bunta", category: "Loading", isActive: true },
  { areaName: "EFO 3", site: "Bunta", category: "Loading", isActive: true },
  { areaName: "EFO 4", site: "Buleleng", category: "Loading", isActive: true },
  { areaName: "EFO 5", site: "Buleleng", category: "Loading", isActive: true },
  { areaName: "JETTY 1", site: "Buleleng", category: "Unloading", isActive: true },
  { areaName: "JETTY 2", site: "Kabaena", category: "Unloading", isActive: true },
  { areaName: "JETTY 3", site: "Kabaena", category: "Unloading", isActive: false },
  { areaName: "JETTY 4", site: "Kabaena", category: "Unloading", isActive: true },
  { areaName: "JETTY 5", site: "Kabaena", category: "Unloading", isActive: true },
  { areaName: "ANCHOR 1", site: "Bunta", category: "Anchorage", isActive: true },
  { areaName: "ANCHOR 2", site: "Kabaena", category: "Anchorage", isActive: true },
];

const seedShifts = [
  { shiftName: "Shift A (Day Shift)", shiftStart: "07:00", shiftEnd: "19:00", isActive: true },
  { shiftName: "Shift B (Night Shift)", shiftStart: "19:00", shiftEnd: "07:00", isActive: true },
  { shiftName: "Shift C (Morning)", shiftStart: "06:00", shiftEnd: "14:00", isActive: false },
];

const seedBrands = ["Cummins", "Komatsu"];
const seedUnitTypes = ["Dump Truck", "Excavator"];
const seedUnitModels = ["MS700", "PC2000"];

const seedEngines = [
  { name: "Cummins QSX15", brand: "Cummins" },
  { name: "Komatsu SAA6D170", brand: "Komatsu" },
];

const seedUnitModelVariants = [
  { name: "8x4", unitModel: "MS700" },
  { name: "6x4", unitModel: "MS700" },
  { name: "Standard", unitModel: "PC2000" },
];

const seedVariantSpecs = [
  {
    unitType: "Dump Truck",
    unitModel: "MS700",
    unitModelVariant: "8x4",
    engine: "Cummins QSX15",
    capacityVessel: 20,
    axleConfiguration: "8x4",
    totalWheel: 12,
    wheelSize: 24,
  },
  {
    unitType: "Dump Truck",
    unitModel: "MS700",
    unitModelVariant: "6x4",
    engine: "Cummins QSX15",
    capacityVessel: 15,
    axleConfiguration: "6x4",
    totalWheel: 10,
    wheelSize: 22,
  },
  {
    unitType: "Excavator",
    unitModel: "PC2000",
    unitModelVariant: "Standard",
    engine: "Komatsu SAA6D170",
    capacityVessel: 11,
    axleConfiguration: "N/A",
    totalWheel: 0,
    wheelSize: 0,
  },
];

const seedUnits = [
  { unitCode: "MS-DT-001", site: "Bunta", specIndex: 0, unitStatus: "Ready for Use (RFU)", serialNumber: "SN-DT-001", arriveDate: "2026-01-15", isActive: true },
  { unitCode: "MS-DT-002", site: "Bunta", specIndex: 0, unitStatus: "Operating", serialNumber: "SN-DT-002", arriveDate: "2026-01-18", isActive: true },
  { unitCode: "MS-DT-003", site: "Buleleng", specIndex: 1, unitStatus: "Ready for Use (RFU)", serialNumber: "SN-DT-003", arriveDate: "2026-02-02", isActive: true },
  { unitCode: "MS-DT-004", site: "Buleleng", specIndex: 1, unitStatus: "Under Maintenance", serialNumber: "SN-DT-004", arriveDate: "2026-02-10", isActive: true },
  { unitCode: "MS-DT-005", site: "Kabaena", specIndex: 0, unitStatus: "Breakdown", serialNumber: "SN-DT-005", arriveDate: "2025-11-20", isActive: false },
  { unitCode: "MS-EX-001", site: "Kabaena", specIndex: 2, unitStatus: "Ready for Use (RFU)", serialNumber: "SN-EX-001", arriveDate: "2025-11-05", isActive: true },
  { unitCode: "MS-EX-002", site: "Bunta", specIndex: 2, unitStatus: "Operating", serialNumber: "SN-EX-002", arriveDate: "2026-03-01", isActive: true },
];

async function main() {
  for (const barge of seedBarges) {
    await prisma.barge.upsert({
      where: { code: barge.code },
      update: {},
      create: barge,
    });
  }
  console.log(`Seeded ${seedBarges.length} barges.`);

  const siteByName = new Map<string, string>();
  for (const name of seedSites) {
    const site = await prisma.site.upsert({ where: { name }, update: {}, create: { name } });
    siteByName.set(name, site.id);
  }
  console.log(`Seeded ${seedSites.length} sites.`);

  for (const area of seedAreas) {
    const siteId = siteByName.get(area.site)!;
    await prisma.area.upsert({
      where: { areaName_siteId: { areaName: area.areaName, siteId } },
      update: {},
      create: {
        areaName: area.areaName,
        siteId,
        category: area.category,
        isActive: area.isActive,
        polygonCoordinates: SAMPLE_POLYGON,
      },
    });
  }
  console.log(`Seeded ${seedAreas.length} areas.`);

  for (const shift of seedShifts) {
    await prisma.shift.upsert({
      where: { shiftName: shift.shiftName },
      update: {},
      create: shift,
    });
  }
  console.log(`Seeded ${seedShifts.length} shifts.`);

  const brandByName = new Map<string, string>();
  for (const name of seedBrands) {
    const brand = await prisma.brand.upsert({ where: { name }, update: {}, create: { name } });
    brandByName.set(name, brand.id);
  }
  console.log(`Seeded ${seedBrands.length} brands.`);

  const unitTypeByName = new Map<string, string>();
  for (const name of seedUnitTypes) {
    const unitType = await prisma.unitType.upsert({ where: { name }, update: {}, create: { name } });
    unitTypeByName.set(name, unitType.id);
  }
  console.log(`Seeded ${seedUnitTypes.length} unit types.`);

  const unitModelByName = new Map<string, string>();
  for (const name of seedUnitModels) {
    const unitModel = await prisma.unitModel.upsert({ where: { name }, update: {}, create: { name } });
    unitModelByName.set(name, unitModel.id);
  }
  console.log(`Seeded ${seedUnitModels.length} unit models.`);

  const engineByName = new Map<string, string>();
  for (const e of seedEngines) {
    const brandId = brandByName.get(e.brand)!;
    const engine = await prisma.engine.upsert({
      where: { name_brandId: { name: e.name, brandId } },
      update: {},
      create: { name: e.name, brandId },
    });
    engineByName.set(e.name, engine.id);
  }
  console.log(`Seeded ${seedEngines.length} engines.`);

  const variantByName = new Map<string, string>();
  for (const v of seedUnitModelVariants) {
    const unitModelId = unitModelByName.get(v.unitModel)!;
    const variant = await prisma.unitModelVariant.upsert({
      where: { name_unitModelId: { name: v.name, unitModelId } },
      update: {},
      create: { name: v.name, unitModelId },
    });
    variantByName.set(`${v.unitModel}/${v.name}`, variant.id);
  }
  console.log(`Seeded ${seedUnitModelVariants.length} unit model variants.`);

  const specIds: string[] = [];
  for (const spec of seedVariantSpecs) {
    const unitTypeId = unitTypeByName.get(spec.unitType)!;
    const unitModelId = unitModelByName.get(spec.unitModel)!;
    const unitModelVariantId = variantByName.get(`${spec.unitModel}/${spec.unitModelVariant}`)!;
    const engineId = engineByName.get(spec.engine)!;
    const created = await prisma.variantSpecification.upsert({
      where: {
        unitTypeId_unitModelId_unitModelVariantId_engineId: { unitTypeId, unitModelId, unitModelVariantId, engineId },
      },
      update: {},
      create: {
        unitTypeId,
        unitModelId,
        unitModelVariantId,
        engineId,
        capacityVessel: spec.capacityVessel,
        axleConfiguration: spec.axleConfiguration,
        totalWheel: spec.totalWheel,
        wheelSize: spec.wheelSize,
      },
    });
    specIds.push(created.id);
  }
  console.log(`Seeded ${seedVariantSpecs.length} variant specifications.`);

  for (const unit of seedUnits) {
    const siteId = siteByName.get(unit.site)!;
    const variantSpecificationId = specIds[unit.specIndex];
    await prisma.unit.upsert({
      where: { unitCode: unit.unitCode },
      update: {},
      create: {
        unitCode: unit.unitCode,
        siteId,
        variantSpecificationId,
        unitStatus: unit.unitStatus,
        serialNumber: unit.serialNumber,
        arriveDate: new Date(unit.arriveDate),
        isActive: unit.isActive,
      },
    });
  }
  console.log(`Seeded ${seedUnits.length} units.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
