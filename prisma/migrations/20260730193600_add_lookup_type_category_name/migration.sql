ALTER TABLE "lookup_types"
ADD COLUMN "category_name" VARCHAR(255);

UPDATE "lookup_types"
SET "category_name" = "category_code"
WHERE "category_name" IS NULL;

ALTER TABLE "lookup_types"
ALTER COLUMN "category_name" SET NOT NULL;
