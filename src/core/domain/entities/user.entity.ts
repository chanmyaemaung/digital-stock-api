import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '@app/core/domain/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'uuid',
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @Column()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column()
  ipAddress: string;

  @Column('json')
  deviceInfo: Record<string, any>;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  // Audit fields
  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  // Domain methods
  public updateRole(newRole: Role): void {
    // Add business logic/validation here
    this.role = newRole;
    this.updatedAt = new Date();
  }

  public updatePassword(newPassword: string): void {
    // Add password validation logic here
    this.password = newPassword;
    this.updatedAt = new Date();
  }
}
