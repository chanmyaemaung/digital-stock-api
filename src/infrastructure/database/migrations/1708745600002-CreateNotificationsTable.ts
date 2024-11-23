import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1708745600002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
            name: 'type',
            type: 'enum',
            enum: [
              'SUBSCRIPTION_CREATED',
              'SUBSCRIPTION_EXPIRED',
              'SUBSCRIPTION_EXPIRING',
              'PLAN_UPGRADED',
              'PLAN_DOWNGRADED',
              'PLAN_LIMIT_UPDATED',
              'PAYMENT_SUCCESSFUL',
              'PAYMENT_FAILED',
              'PAYMENT_APPROVED',
              'LOGIN_DETECTED',
              'ROLE_UPDATED',
              'WALLET_CREDITED',
              'WALLET_DEBITED',
              'REQUEST_LIMIT_EXCEEDED',
              'DAILY_LIMIT_RESET',
            ],
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'isRead',
            type: 'boolean',
            default: false,
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
            name: 'IDX_NOTIFICATIONS_USER_ID',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_NOTIFICATIONS_IS_READ',
            columnNames: ['isRead'],
          },
          {
            name: 'IDX_NOTIFICATIONS_CREATED_AT',
            columnNames: ['createdAt'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
