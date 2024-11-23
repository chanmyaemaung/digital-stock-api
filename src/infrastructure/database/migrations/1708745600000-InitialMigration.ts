import { Role } from '@app/core/domain/enums/role.enum';
import { SubscriptionStatus } from '@app/core/domain/enums/subscription-status.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialMigration1708745600000 implements MigrationInterface {
  name = 'InitialMigration1708745600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create role enum
    await queryRunner.query(`
      CREATE TYPE "public"."role_enum" AS ENUM('${Role.USER}', '${Role.ADMIN}', '${Role.SUPER_ADMIN}')
    `);

    // Create subscription status enum
    await queryRunner.query(`
      CREATE TYPE "public"."subscription_status_enum" AS ENUM('${SubscriptionStatus.ACTIVE}', '${SubscriptionStatus.EXPIRED}', '${SubscriptionStatus.CANCELLED}', '${SubscriptionStatus.TRIAL}')
    `);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'role_enum',
            default: `'${Role.USER}'`,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'device_info',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create plans table
    await queryRunner.createTable(
      new Table({
        name: 'plans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'request_limit',
            type: 'integer',
          },
          {
            name: 'features',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'plan_id',
            type: 'uuid',
          },
          {
            name: 'start_date',
            type: 'timestamp',
          },
          {
            name: 'end_date',
            type: 'timestamp',
          },
          {
            name: 'status',
            type: 'subscription_status_enum',
            default: `'${SubscriptionStatus.TRIAL}'`,
          },
          {
            name: 'daily_request_count',
            type: 'integer',
            default: 0,
          },
          {
            name: 'last_request_reset',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['plan_id'],
            referencedTableName: 'plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
    await queryRunner.dropTable('plans');
    await queryRunner.dropTable('users');
    await queryRunner.query('DROP TYPE "public"."subscription_status_enum"');
    await queryRunner.query('DROP TYPE "public"."role_enum"');
  }
}
