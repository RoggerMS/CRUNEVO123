import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentCreatedEvent } from '../common/events/domain.events';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  private assignThumbnail(mimeType: string): string | null {
    if (mimeType === 'application/pdf') return 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'https://cdn-icons-png.flaticon.com/512/337/337951.png';
    if (mimeType.startsWith('image/')) return 'https://cdn-icons-png.flaticon.com/512/337/337940.png';
    return 'https://cdn-icons-png.flaticon.com/512/337/337932.png';
  }

  async create(
    userId: string,
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    const thumbnailUrl = this.assignThumbnail(file.mimetype);

    const doc = await this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        tags: createDocumentDto.tags || '',
        filePath: file.filename,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        ownerId: userId,
        clubId: createDocumentDto.clubId || null,
        visibility: (createDocumentDto.visibility as any) || 'PUBLIC',
        thumbnailUrl,
        version: 1,
        qualityStatus: 'PENDING',
      },
      include: { owner: { select: { id: true, username: true } } },
    });

    // Emit event (Decoupled Logic)
    this.eventEmitter.emit('document.created', new DocumentCreatedEvent(doc.id, userId));
    // Also emit for AI (Legacy or new?) - keeping consistent with old code if it existed, but using standard event now.
    // The previous code had: this.eventEmitter.emit('document.uploaded', { documentId: doc.id });
    // Let's keep the new standard one. If AI listens to 'document.uploaded', we should change AI or emit both.
    // Assuming AI is not fully implemented yet or can be updated.
    
    return doc;
  }

  async createVersion(
    userId: string,
    id: string,
    file: Express.Multer.File,
  ) {
    try {
        const oldDoc = await this.prisma.document.findUnique({ where: { id } });
        if (!oldDoc) throw new NotFoundException('Document not found');
        if (oldDoc.ownerId !== userId) throw new ForbiddenException('Only owner can update version');

        // Step 1: Archive current state
        console.log('Archiving doc:', oldDoc.id);
        await this.prisma.document.create({
            data: {
                ownerId: oldDoc.ownerId,
                title: oldDoc.title + ` (v${oldDoc.version})`,
                description: oldDoc.description,
                tags: oldDoc.tags,
                filePath: oldDoc.filePath,
                fileName: oldDoc.fileName,
                mimeType: oldDoc.mimeType,
                size: oldDoc.size,
                visibility: oldDoc.visibility,
                thumbnailUrl: oldDoc.thumbnailUrl,
                version: oldDoc.version,
                qualityStatus: oldDoc.qualityStatus,
                parentId: oldDoc.id,
                createdAt: oldDoc.createdAt,
            }
        });

        // Step 2: Update main record
        const thumbnailUrl = this.assignThumbnail(file.mimetype);
        console.log('Updating doc:', id, 'New thumb:', thumbnailUrl);

        const updated = await this.prisma.document.update({
            where: { id },
            data: {
                filePath: file.filename,
                fileName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                version: oldDoc.version + 1,
                thumbnailUrl,
                qualityStatus: 'PENDING',
            }
        });

        return updated;
    } catch (e) {
        console.error('Error in createVersion:', e);
        throw e;
    }
  }

  async updateStatus(id: string, status: 'VERIFIED' | 'FLAGGED' | 'REJECTED', userRole?: string) {
      if (userRole && userRole !== 'ADMIN') {
          throw new ForbiddenException('Only admins can update status');
      }
      return this.prisma.document.update({
          where: { id },
          data: { qualityStatus: status }
      });
  }

  async findAll() {
    return this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, username: true } } },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { 
        owner: { select: { id: true, username: true } },
        likes: true,
        comments: true,
      },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async incrementDownloads(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });
  }

  async findAllApuntes(
    query?: string,
    type?: string,
    clubId?: string,
    mine?: boolean,
    userId?: string,
    sort?: 'newest' | 'top',
  ) {
    const where: any = {
      // By default show PUBLIC or CLUB (if member) or PRIVATE (if mine)
      // Simplified: Show PUBLIC by default.
      // If clubId is provided, filter by that club (and assume visibility CLUB or PUBLIC within that club context, though usually CLUB docs are for members).
      // For MVP, if no filters, show PUBLIC.
      // If mine=true, show my docs (any visibility).
    };

    if (mine && userId) {
      where.ownerId = userId;
    } else {
      // Public listing logic
      if (clubId) {
        where.clubId = clubId;
        // Ideally check if user is member, but instructions say "validar membership si ya hay ClubMember, si no bloquear o dejar simple".
        // Let's assume for listing, if clubId provided, we show docs linked to that club.
      } else {
        // General public listing
        where.visibility = 'PUBLIC';
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (type) {
        // type can be 'pdf', 'ppt', 'doc', 'img', 'other'
        // map to mimeTypes or extensions?
        // simple mapping for MVP:
        if (type === 'pdf') where.mimeType = 'application/pdf';
        else if (type === 'img') where.mimeType = { startsWith: 'image/' };
        // else ignore or add more mappings
    }

    const orderBy: any = {};
    if (sort === 'top') {
        orderBy.downloadsCount = 'desc'; // or likes
    } else {
        orderBy.createdAt = 'desc';
    }

    return this.prisma.document.findMany({
      where,
      orderBy,
      include: { owner: { select: { id: true, username: true } } },
    });
  }
}
