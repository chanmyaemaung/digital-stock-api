import { DataSource } from 'typeorm';
import { Plan } from '@app/core/domain/entities/plan.entity';
import { User } from '@app/core/domain/entities/user.entity';
import { Role } from '@app/core/domain/enums/role.enum';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';

const seed = async () => {
  // Initialize the DataSource
  await dataSource.initialize();

  try {
    // Create default plans
    const planRepository = dataSource.getRepository(Plan);
    const plans = [
      planRepository.create({
        name: 'Basic',
        price: 5,
        requestLimit: 500,
        features: { apis: ['basic'] },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      planRepository.create({
        name: 'Premium',
        price: 15,
        requestLimit: 1500,
        features: { apis: ['basic', 'premium'] },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      planRepository.create({
        name: 'Business',
        price: 25,
        requestLimit: 10000,
        features: { apis: ['basic', 'premium', 'business'] },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    await planRepository.save(plans);

    // Create super admin user
    const userRepository = dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = userRepository.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      phone: '123456789',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      ipAddress: '127.0.0.1',
      deviceInfo: { userAgent: 'Seed Script' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await userRepository.save(admin);

    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Close the connection
    await dataSource.destroy();
  }
};

// Run the seed function
seed();
