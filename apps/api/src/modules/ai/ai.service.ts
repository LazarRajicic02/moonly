import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AiService as Llm } from '../../infrastructure/ai/ai.service';

@Injectable()
export class AssistantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: Llm,
  ) {}

  async chat(userId: string, message: string, conversationId?: string) {
    let conversation = conversationId
      ? await this.prisma.aiConversation.findFirst({ where: { id: conversationId, userId } })
      : null;
    if (!conversation) {
      conversation = await this.prisma.aiConversation.create({
        data: { userId, title: message.slice(0, 60) },
      });
    }

    await this.prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: 'user', content: message },
    });

    const history = await this.prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const reply = await this.llm.chat(history.map((m) => ({ role: m.role, content: m.content })));
    const assistant = await this.prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: 'assistant', content: reply.content },
    });

    return { conversationId: conversation.id, message: assistant, model: reply.model };
  }

  list(userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 50 } },
    });
  }
}
