import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ example: 100 })
  totalUsers: number;

  @ApiProperty({ example: 80 })
  activeSubscriptions: number;

  @ApiProperty({ example: 5 })
  expiringSubscriptions: number;

  @ApiProperty({ example: 10 })
  pendingPayments: number;

  @ApiProperty({
    example: {
      basic: 30,
      premium: 40,
      business: 10,
    },
  })
  planDistribution: Record<string, number>;

  @ApiProperty({
    example: {
      total: 5000,
      thisMonth: 1000,
    },
  })
  revenue: {
    total: number;
    thisMonth: number;
  };

  @ApiProperty({
    example: [
      { date: '2024-03-01', count: 10 },
      { date: '2024-03-02', count: 15 },
    ],
  })
  userGrowth: Array<{ date: string; count: number }>;

  @ApiProperty({
    example: [
      { date: '2024-03-01', amount: 500 },
      { date: '2024-03-02', amount: 700 },
    ],
  })
  revenueGrowth: Array<{ date: string; amount: number }>;
}
