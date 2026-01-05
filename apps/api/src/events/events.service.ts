import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, EventStatus, Visibility } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, data: any) {
    const isAdmin = user.role === Role.ADMIN;
    
    // If user is admin, use provided status/visibility or default to APPROVED/PUBLIC
    // If user is NOT admin, force PENDING and PUBLIC (or allow them to request visibility?)
    // Let's force PENDING for non-admins.
    
    const status = isAdmin ? (data.status || EventStatus.APPROVED) : EventStatus.PENDING;
    // Admins can create ADMIN_ONLY events. Users can only create PUBLIC events (for now).
    const visibility = isAdmin ? (data.visibility || Visibility.PUBLIC) : Visibility.PUBLIC;

    return this.prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        location: data.location,
        organizerId: user.userId,
        status,
        visibility,
      },
      include: { organizer: { select: { username: true } } },
    });
  }

  async findAllPublic() {
    return this.prisma.event.findMany({
      where: { 
        status: EventStatus.APPROVED,
        visibility: Visibility.PUBLIC 
      },
      orderBy: { date: 'asc' },
      include: { organizer: { select: { username: true } } },
    });
  }

  async findAllForAdmin() {
    return this.prisma.event.findMany({
      orderBy: { date: 'asc' },
      include: { organizer: { select: { username: true } } },
    });
  }

  async updateStatus(id: string, status: EventStatus) {
    return this.prisma.event.update({
      where: { id },
      data: { status },
    });
  }
  
  async delete(id: string) {
      return this.prisma.event.delete({ where: { id } });
  }
}
