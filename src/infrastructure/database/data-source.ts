import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { User } from '../../core/domain/entities/user.entity';
import { Plan } from '../../core/domain/entities/plan.entity';
import { Subscription } from '../../core/domain/entities/subscription.entity';
import { Payment } from '../../core/domain/entities/payment.entity';
import { Wallet } from '../../core/domain/entities/wallet.entity';
import { Notification } from '../../core/domain/entities/notification.entity';

// Load environment variables
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Plan, Subscription, Payment, Wallet, Notification],
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
