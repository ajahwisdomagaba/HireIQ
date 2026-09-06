import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, AppError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { generateInterviewReport } from "@/lib/ai/report-agent";
import { publishDomainEvent, DomainEventType } from "@/lib/events";

const CompleteSchema = z.object({
  transcript: z.string().min(1),
  recruiterNotes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { interviewId: string } },
) {
  try {
    const body = await req.json();
    const { transcript, recruiterNotes } = CompleteSchema.parse(body);

    // Retrieve interview with related entities
    const interview = await prisma.interview.findUnique({
      where: { id: params.interviewId },
      include: {
        interviewer: true,
        application: {
          include: {
            candidateProfile: { include: { user: true } },
            job: { include: { company: true } },
          },
        },
      },
    });

    if (!interview) {
      throw new AppError("Interview session not found", 404);
    }

    const session = await requireAuth();
    const companyId = interview.application.job.companyId;
    const actorUserId = session?.userId || interview.interviewer.userId;

    // 1. Update Interview Record
    await prisma.interview.update({
      where: { id: params.interviewId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        transcript,
        recruiterNotes: recruiterNotes || "",
      },
    });

    // 2. Run Interview Intelligence Report Agent (via Qorebit)
    const { report } = await generateInterviewReport({
      candidateName: interview.application.candidateProfile.user.name,
      jobTitle: interview.application.job.title,
      stage: interview.stage,
      transcript,
      recruiterNotes: recruiterNotes || "",
    });

    // 3. Upsert Candidate Report
    const existingReport = await prisma.candidateReport.findFirst({
      where: { applicationId: interview.applicationId },
    });

    if (existingReport) {
      await prisma.candidateReport.update({
        where: { id: existingReport.id },
        data: {
          matchScore: report.overallInterviewScore,
          verdict: report.hiringVerdict,
          executiveSummary: report.executiveSummary,
          strengths: report.keyStrengthsObserved,
          weaknesses: report.redFlagsAndInconsistencies,
        },
      });
    } else {
      await prisma.candidateReport.create({
        data: {
          applicationId: interview.applicationId,
          matchScore: report.overallInterviewScore,
          verdict: report.hiringVerdict,
          executiveSummary: report.executiveSummary,
          strengths: report.keyStrengthsObserved,
          weaknesses: report.redFlagsAndInconsistencies,
          growthRoadmap: [],
          marketSalaryBand: report.suggestedSalaryBandNGN,
        },
      });
    }

    // 4. Day 1 Knowledge Flywheel: Index transcript into KnowledgeChunk
    // Line 93 of your complete route:
    await prisma.knowledgeChunk.create({
      data: {
        knowledgeSource: {
          create: {
            companyId,
            title: `Interview Transcript - ${interview.application.candidateProfile.user.name} (${interview.application.job.title})`,
            category: "INTERVIEW_TRANSCRIPT",
            rawContent: transcript,
          },
        },
        chunkContent: transcript.slice(0, 1500),
      },
    });

    // 5. Emit Domain Event to BullMQ
    await publishDomainEvent(
      DomainEventType.INTERVIEW_FINISHED,
      companyId,
      {
        interviewId: interview.id,
        applicationId: interview.applicationId,
        transcriptText: transcript,
      },
      actorUserId,
    );

    return NextResponse.json({
      message: "Interview completed and synthesized successfully",
      report,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
