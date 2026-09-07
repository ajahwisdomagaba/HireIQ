import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { prisma } from '../prisma';
import { ApplicationStage } from '@prisma/client';
import { calculateNigerianPayroll } from '../payroll/statutory';

export function createHireIqMcpServer() {
  const server = new McpServer({
    name: 'hireiq-recruitment-intelligence',
    version: '1.0.0',
  });

  // TOOL 1: List Candidates by Pipeline Stage
  server.tool(
    'list_candidates_in_stage',
    'Retrieve applicants currently in a specific recruitment pipeline stage',
    {
      stage: z.nativeEnum(ApplicationStage),
    },
    async ({ stage }) => {
      const applications = await prisma.application.findMany({
        where: { stage },
        include: {
          candidateProfile: {
            include: { user: true },
          },
          job: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      const data = applications.map((app: any) => ({
        applicationId: app.id,
        candidateName:
          app.candidateProfile?.user?.name ||
          app.candidate?.user?.name ||
          app.candidateName ||
          'Unnamed',
        candidateEmail:
          app.candidateProfile?.user?.email ||
          app.candidate?.user?.email ||
          'N/A',
        jobTitle: app.job?.title || 'Unassigned Role',
        stage: app.stage,
      }));

      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    }
  );

  // TOOL 2: Candidate Intelligence & Reference Verification
  server.tool(
    'get_candidate_intelligence',
    'Fetch screening telemetry and offer status for an application',
    {
      applicationId: z.string().describe('The application ID'),
    },
    async ({ applicationId }) => {
      const application: any = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          candidateProfile: {
            include: { user: true },
          },
          job: true,
          offers: true,
        },
      });

      if (!application) {
        return {
          content: [{ type: 'text', text: `Error: Application ${applicationId} not found.` }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                candidateName:
                  application.candidateProfile?.user?.name ||
                  application.candidate?.user?.name ||
                  'Candidate',
                jobTitle: application.job?.title,
                stage: application.stage,
                offers: application.offers,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // TOOL 3: Nigerian Statutory Compensation Calculator
  server.tool(
    'calculate_statutory_offer',
    'Calculate Nigerian Labour Act and Pension Reform Act 2014 deductions and NAFEM USD pegging for gross salaries',
    {
      annualGrossNGN: z.number().describe('Annual Gross Salary in Nigerian Naira (₦)'),
      nafemBenchmarkRate: z.number().default(1450).describe('CBN NAFEM exchange rate conversion index'),
    },
    async ({ annualGrossNGN, nafemBenchmarkRate }) => {
      const breakdown = calculateNigerianPayroll(annualGrossNGN);
      const monthlyGross = breakdown.monthlyGross;
      const usdEquivalent = Math.round(monthlyGross / nafemBenchmarkRate);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                annualGrossNGN,
                monthlyGrossNGN: monthlyGross,
                usdPeggingBaseline: `$${usdEquivalent.toLocaleString()} / mo @ ₦${nafemBenchmarkRate}/$`,
                employeePensionRSA: `₦${breakdown.employeePension.toLocaleString()} (8% employee contribution)`,
                employerPensionRSA: `₦${breakdown.employerPension.toLocaleString()} (10% employer contribution)`,
                monthlyPAYETaxEstimate: `₦${breakdown.monthlyTax.toLocaleString()}`,
                monthlyNetEstimatedTakeHome: `₦${breakdown.monthlyNetSalary.toLocaleString()}`,
                complianceNotice:
                  'Computed per Pension Reform Act 2014 & Lagos State Internal Revenue Service (LIRS) tables',
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // TOOL 4: Draft Statutory Offer
  server.tool(
    'draft_statutory_offer',
    'Generate a DRAFT offer contract for an application in the OFFER stage',
    {
      applicationId: z.string(),
      baseSalaryNGN: z.number(),
    },
    async ({ applicationId, baseSalaryNGN }) => {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      });

      if (!application || application.stage !== ApplicationStage.OFFER) {
        return {
          content: [
            {
              type: 'text',
              text: `Rejected: Candidate must be in the OFFER stage. Current stage: ${application?.stage || 'Unknown'}`,
            },
          ],
        };
      }

      const offer = await prisma.offer.create({
        data: {
          applicationId,
          baseSalaryNGN,
          currency: 'NGN',
          status: 'DRAFT',
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: `Success: Draft offer created with ID ${offer.id}. Status: DRAFT`,
          },
        ],
      };
    }
  );

  return server;
}