// lib/queues.ts
import { Queue, QueueOptions } from 'bullmq';
import { redisConnection } from './redis';

export enum QueueName {
  APPLICATION_INGESTION = 'application-ingestion',
  AI_SCREENING = 'ai-screening',
  KNOWLEDGE_INDEXING = 'knowledge-indexing',
  NOTIFICATION = 'notification',
}

const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600 * 24, // keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 3600 * 24 * 7, // keep failed jobs for 7 days
    },
  },
};

export const queues = {
  applicationIngestion: new Queue(QueueName.APPLICATION_INGESTION, defaultQueueOptions),
  aiScreening: new Queue(QueueName.AI_SCREENING, defaultQueueOptions),
  knowledgeIndexing: new Queue(QueueName.KNOWLEDGE_INDEXING, defaultQueueOptions),
  notification: new Queue(QueueName.NOTIFICATION, defaultQueueOptions),
};