// lib/events.ts
import { queues } from './queues';
import { logger } from './logger';
import { prisma } from './prisma';

export enum DomainEventType {
  APPLICATION_SUBMITTED = 'application.submitted',
  SCREENING_COMPLETED = 'screening.completed',
  INTERVIEW_FINISHED = 'interview.finished',
  ASSESSMENT_COMPLETED = 'assessment.completed',
  HIRING_OUTCOME_RECORDED = 'hiring.outcome_recorded',
}

export interface DomainEventPayloadMap {
  [DomainEventType.APPLICATION_SUBMITTED]: {
    applicationId: string;
    candidateProfileId: string;
    jobId: string;
    resumeId: string;
    storageKey: string;
  };
  [DomainEventType.SCREENING_COMPLETED]: {
    applicationId: string;
    screeningSessionId: string;
    overallScore: number;
    verdict: string;
  };
  [DomainEventType.INTERVIEW_FINISHED]: {
    interviewId: string;
    applicationId: string;
    transcriptText: string;
  };
  [DomainEventType.ASSESSMENT_COMPLETED]: {
    submissionId: string;
    applicationId: string;
    score: number;
  };
  [DomainEventType.HIRING_OUTCOME_RECORDED]: {
    applicationId: string;
    companyId: string;
    jobTitle: string;
    outcome: string;
  };
}

export async function publishDomainEvent<T extends DomainEventType>(
  eventType: T,
  companyId: string,
  payload: DomainEventPayloadMap[T],
  actorUserId?: string
) {
  logger.info({ eventType, companyId }, `Emitting domain event: ${eventType}`);

  // 1. Audit Log Persistence
  await prisma.activityLog.create({
    data: {
      companyId,
      userId: actorUserId,
      action: eventType,
      entityType: eventType.split('.')[0].toUpperCase(),
      entityId: (payload as any).applicationId || (payload as any).interviewId || (payload as any).submissionId || 'SYSTEM',
      description: `Domain event triggered: ${eventType}`,
      metadata: payload,
    },
  });

  // 2. Queue Routing
  switch (eventType) {
    case DomainEventType.APPLICATION_SUBMITTED: {
      const data = payload as DomainEventPayloadMap[DomainEventType.APPLICATION_SUBMITTED];
      await queues.applicationIngestion.add('parse-resume', data, {
        jobId: `app-ingest-${data.applicationId}`,
      });
      break;
    }

    case DomainEventType.SCREENING_COMPLETED: {
      const data = payload as DomainEventPayloadMap[DomainEventType.SCREENING_COMPLETED];
      // Send notifications or trigger follow-up tasks
      await queues.notification.add('send-screening-alerts', data);
      break;
    }

    case DomainEventType.INTERVIEW_FINISHED: {
      const data = payload as DomainEventPayloadMap[DomainEventType.INTERVIEW_FINISHED];
      // Day 1 Knowledge Collection: Auto-chunk and index transcript
      await queues.knowledgeIndexing.add('index-interview-transcript', {
        companyId,
        sourceType: 'INTERVIEW_TRANSCRIPT',
        ...data,
      });
      break;
    }

    case DomainEventType.HIRING_OUTCOME_RECORDED: {
      const data = payload as DomainEventPayloadMap[DomainEventType.HIRING_OUTCOME_RECORDED];
      // Push into Hiring Memory learning queue
      await queues.knowledgeIndexing.add('update-hiring-memory', data);
      break;
    }

    default:
      break;
  }
}