import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchHiringMemory } from '@/lib/ai/vector-search';
import { calculateNigerianPayroll } from '@/lib/payroll/statutory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params, id } = body;

    switch (method) {
      // 1. Tool Discovery Specification
      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'search_hiring_memory',
                description:
                  'Search semantic historical candidates, interview answers, and domain evidence using pgvector similarity.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    companyId: {
                      type: 'string',
                      description: 'HireIQ Tenant Company ID (optional in local dev)',
                    },
                    query: {
                      type: 'string',
                      description: 'Semantic criteria (e.g. Distributed lock experience)',
                    },
                  },
                  required: ['query'],
                },
              },
              {
                name: 'list_candidates_in_stage',
                description:
                  'Retrieve active candidates filtered by recruitment pipeline stage (e.g., OFFER, INTERVIEW).',
                inputSchema: {
                  type: 'object',
                  properties: {
                    stage: {
                      type: 'string',
                      enum: ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'],
                      description: 'Recruitment pipeline stage to filter by (default: OFFER)',
                    },
                  },
                },
              },
              {
                name: 'calculate_statutory_offer',
                description:
                  'Calculate Nigerian Labour Act compensation, Pension Reform Act 2014 (8% RSA), and NAFEM FX pegging.',
                inputSchema: {
                  type: 'object',
                  properties: {
                    annualGrossNGN: {
                      type: 'number',
                      description: 'Annual Gross Salary in Nigerian Naira (₦)',
                    },
                    nafemRate: {
                      type: 'number',
                      description: 'CBN NAFEM exchange rate conversion index (default: 1450)',
                    },
                  },
                  required: ['annualGrossNGN'],
                },
              },
            ],
          },
        });

      // 2. Tool Execution Dispatcher
      case 'tools/call': {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};

        if (toolName === 'search_hiring_memory') {
          let targetCompanyId = toolArgs.companyId;

          // Dev fallback: Resolve to the existing tenant company if placeholder or unset
          if (!targetCompanyId || targetCompanyId === 'dev-recruiter-bypass') {
            const firstCompany = await prisma.company.findFirst({
              select: { id: true },
            });
            targetCompanyId = firstCompany?.id || targetCompanyId;
          }

          const matches = await searchHiringMemory({
            companyId: targetCompanyId,
            query: toolArgs.query,
            limit: 5,
            threshold: 0.01,
          });

          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(matches, null, 2),
                },
              ],
            },
          });
        }

        if (toolName === 'list_candidates_in_stage') {
          const targetStage = toolArgs.stage || 'OFFER';
          const applications = await prisma.application.findMany({
            where: { stage: targetStage },
            include: {
              candidateProfile: { include: { user: true } },
              job: true,
            },
            orderBy: { updatedAt: 'desc' },
          });

          const formatted = applications.map((app) => ({
            applicationId: app.id,
            candidateName: app.candidateProfile?.user?.name || 'Unnamed',
            candidateEmail: app.candidateProfile?.user?.email || 'N/A',
            jobTitle: app.job?.title || 'Unassigned Role',
            stage: app.stage,
          }));

          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(formatted, null, 2),
                },
              ],
            },
          });
        }

        if (toolName === 'calculate_statutory_offer') {
          const salary = Number(toolArgs.annualGrossNGN);
          const nafemRate = Number(toolArgs.nafemRate) || 1450;
          const breakdown = calculateNigerianPayroll(salary);
          const usdMonthly = Math.round(breakdown.monthlyGross / nafemRate);

          const result = {
            ...breakdown,
            usdMonthlyEquivalent: `$${usdMonthly.toLocaleString()} / mo @ ₦${nafemRate}/$`,
          };

          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            },
          });
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${toolName}` },
        });
      }

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' },
        });
    }
  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: err.message },
    });
  }
}