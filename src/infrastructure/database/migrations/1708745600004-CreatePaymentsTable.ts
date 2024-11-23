import { PaymentStatus } from '@app/core/domain/enums/payment-status.enum';
import { PaymentType } from '@app/core/domain/enums/payment-type.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentsTable1708745600004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create payment type enum
    await queryRunner.query(`
      CREATE TYPE "public"."payment_type_enum" AS ENUM('${PaymentType.MANUAL}', '${PaymentType.STRIPE}')
    `);

    // Create payment status enum
    await queryRunner.query(`
      CREATE TYPE "public"."payment_status_enum" AS ENUM('${PaymentStatus.PENDING}', '${PaymentStatus.COMPLETED}', '${PaymentStatus.FAILED}', '${PaymentStatus.REFUNDED}')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'type',
            type: 'payment_type_enum',
          },
          {
            name: 'status',
            type: 'payment_status_enum',
            default: `'${PaymentStatus.PENDING}'`,
          },
          {
            name: 'stripePaymentId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripeSessionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_PAYMENTS_USER_ID',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_PAYMENTS_STATUS',
            columnNames: ['status'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
    await queryRunner.query('DROP TYPE "public"."payment_type_enum"');
    await queryRunner.query('DROP TYPE "public"."payment_status_enum"');
  }
}
