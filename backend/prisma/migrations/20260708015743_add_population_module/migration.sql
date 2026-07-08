-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "engines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_model_variants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitModelId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "unit_model_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_specifications" (
    "id" TEXT NOT NULL,
    "unitTypeId" TEXT NOT NULL,
    "unitModelId" TEXT NOT NULL,
    "unitModelVariantId" TEXT NOT NULL,
    "engineId" TEXT NOT NULL,
    "capacityVessel" DOUBLE PRECISION NOT NULL,
    "axleConfiguration" TEXT NOT NULL,
    "totalWheel" INTEGER NOT NULL,
    "wheelSize" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "variant_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "variantSpecificationId" TEXT NOT NULL,
    "unitStatus" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "arriveDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "engineOverrideId" TEXT,
    "capacityVesselOverride" DOUBLE PRECISION,
    "axleConfigurationOverride" TEXT,
    "totalWheelOverride" INTEGER,
    "wheelSizeOverride" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE INDEX "brands_deletedAt_idx" ON "brands"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_name_key" ON "unit_types"("name");

-- CreateIndex
CREATE INDEX "unit_types_deletedAt_idx" ON "unit_types"("deletedAt");

-- CreateIndex
CREATE INDEX "engines_deletedAt_idx" ON "engines"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "engines_name_brandId_key" ON "engines"("name", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "unit_models_name_key" ON "unit_models"("name");

-- CreateIndex
CREATE INDEX "unit_models_deletedAt_idx" ON "unit_models"("deletedAt");

-- CreateIndex
CREATE INDEX "unit_model_variants_deletedAt_idx" ON "unit_model_variants"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "unit_model_variants_name_unitModelId_key" ON "unit_model_variants"("name", "unitModelId");

-- CreateIndex
CREATE INDEX "variant_specifications_deletedAt_idx" ON "variant_specifications"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "variant_specifications_unitTypeId_unitModelId_unitModelVari_key" ON "variant_specifications"("unitTypeId", "unitModelId", "unitModelVariantId", "engineId");

-- CreateIndex
CREATE UNIQUE INDEX "units_unitCode_key" ON "units"("unitCode");

-- CreateIndex
CREATE INDEX "units_deletedAt_idx" ON "units"("deletedAt");

-- AddForeignKey
ALTER TABLE "engines" ADD CONSTRAINT "engines_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_model_variants" ADD CONSTRAINT "unit_model_variants_unitModelId_fkey" FOREIGN KEY ("unitModelId") REFERENCES "unit_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_specifications" ADD CONSTRAINT "variant_specifications_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "unit_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_specifications" ADD CONSTRAINT "variant_specifications_unitModelId_fkey" FOREIGN KEY ("unitModelId") REFERENCES "unit_models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_specifications" ADD CONSTRAINT "variant_specifications_unitModelVariantId_fkey" FOREIGN KEY ("unitModelVariantId") REFERENCES "unit_model_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_specifications" ADD CONSTRAINT "variant_specifications_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "engines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_variantSpecificationId_fkey" FOREIGN KEY ("variantSpecificationId") REFERENCES "variant_specifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_engineOverrideId_fkey" FOREIGN KEY ("engineOverrideId") REFERENCES "engines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
