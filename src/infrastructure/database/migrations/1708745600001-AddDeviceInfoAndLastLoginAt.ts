import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceInfoAndLastLoginAt1708745600001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add columns as nullable
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "deviceInfo" jsonb,
      ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "ipAddress" VARCHAR;
    `);

    // Set default values for existing records
    await queryRunner.query(`
      UPDATE "users" 
      SET 
        "deviceInfo" = '{"userAgent": "migration-default"}',
        "ipAddress" = '0.0.0.0'
      WHERE "deviceInfo" IS NULL OR "ipAddress" IS NULL;
    `);

    // Then make them non-nullable
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "deviceInfo" SET NOT NULL,
      ALTER COLUMN "ipAddress" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "deviceInfo",
      DROP COLUMN IF EXISTS "lastLoginAt",
      DROP COLUMN IF EXISTS "ipAddress";
    `);
  }
}
