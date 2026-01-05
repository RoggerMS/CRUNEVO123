import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartConversationDto, CreateMessageDto } from './dto/messages.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map(c => {
      const otherUser = c.user1Id === userId ? c.user2 : c.user1;
      return {
        id: c.id,
        otherUser,
        lastMessage: c.messages[0] || null,
        updatedAt: c.updatedAt,
      };
    });
  }

  async startConversation(userId: string, startConversationDto: StartConversationDto) {
    const { toUserId } = startConversationDto;
    
    if (userId === toUserId) throw new Error("Cannot chat with yourself");

    // Check if user exists
    const toUser = await this.prisma.user.findUnique({ where: { id: toUserId } });
    if (!toUser) throw new NotFoundException('User not found');

    // Ensure consistent ordering for lookup (user1 < user2 or vice versa, but we need to check both per schema constraints or logic)
    // Actually our schema has @@unique([user1Id, user2Id]) but user1Id and user2Id order matters.
    // So we need to check both (A, B) and (B, A).
    // Or we can enforce convention: user1Id < user2Id lexicographically.
    // Let's check both combinations.

    let conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: toUserId },
          { user1Id: toUserId, user2Id: userId },
        ],
      },
    });

    if (!conversation) {
      // Create new
      conversation = await this.prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: toUserId,
        },
      });
    }

    return conversation;
  }

  async getMessages(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new NotFoundException('Conversation not found'); // Forbidden effectively
    }

    // Mark messages from other user as read
    const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: otherUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }, // Chronological order
      // take: 50, // Limit for MVP if needed
    });
  }

  async sendMessage(userId: string, conversationId: string, createMessageDto: CreateMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: createMessageDto.content,
      },
    });
  }
}
