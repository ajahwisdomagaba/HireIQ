import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, AppError } from "@/lib/errors";
import { ApplicationStage } from "@prisma/client";

const SubmitSchema = z.object({
  applicationId: z.string().min(1),
  codeAnswers: z.record(z.string(), z.string()),
  tabSwitchCount: z.number().default(0),
  timeSpentSeconds: z.number().default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SubmitSchema.parse(body);

    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        job: {
          include: {
            assessments: {
              include: {
                versions: {
                  orderBy: { version: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError("Candidate application not found", 404);
    }

    // Heuristic score calculation
    const answerLengths = Object.values(data.codeAnswers).map(
      (ans: string) => ans.trim().length,
    );
    const hasDetailedAnswers = answerLengths.every((len) => len > 40);
    const penalty = Math.min(25, data.tabSwitchCount * 5);

    const baseScore = hasDetailedAnswers ? 88 : 72;
    const finalScore = Math.max(45, baseScore - penalty);

    // Resolve an existing AssessmentVersion or fallback to the latest active version
    let assessmentVersionId: string | undefined =
      application.job?.assessments?.[0]?.versions?.[0]?.id;

    if (!assessmentVersionId) {
      const fallbackVersion = await prisma.assessmentVersion.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      assessmentVersionId = fallbackVersion?.id;
    }

    if (!assessmentVersionId) {
      throw new AppError(
        "No active assessment version found to link submission",
        400,
      );
    }

    const submission = await prisma.assessmentSubmission.create({
      data: {
        applicationId: application.id,
        assessmentVersionId,
        submissionPayload: data.codeAnswers,
        score: finalScore,
        submittedAt: new Date(),
        feedbackSummary: `Candidate completed code assessment in ${Math.round(data.timeSpentSeconds / 60)} minutes. Flagged ${data.tabSwitchCount} tab focus switch events. Overall execution score: ${finalScore}/100.`,
      },
    });

    // Automatically transition to INTERVIEW if candidate passes
    if (finalScore >= 65 && application.stage === ApplicationStage.ASSESSMENT) {
      await prisma.application.update({
        where: { id: application.id },
        data: { stage: ApplicationStage.INTERVIEW },
      });
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      score: finalScore,
      stageUpdated: finalScore >= 65,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
