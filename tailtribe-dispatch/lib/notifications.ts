import prisma from './prisma'

export type CreateNotificationInput = {
  userId: string
  type: string
  title: string
  message: string
  entityId?: string | null
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityId: input.entityId ?? null,
    },
  })
}
