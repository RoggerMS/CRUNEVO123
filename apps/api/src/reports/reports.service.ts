import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReportDto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        ...createReportDto,
        reporterId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { id: true, username: true } } },
    });
  }
}
