import { NextRequest, NextResponse } from 'next/server';
import { searchHiringMemory } from '@/lib/ai/vector-search';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params, id } = body;

    switch (method) {
      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: [
              {
                name: 'search_hiring_memory',
                description:
                  'Search semantic historical candidates, interview answers, and domain evidence using vector similarity.',
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
            ],
          },
        });

      case 'tools/call':
        if (params.name === 'search_hiring_memory') {
          let targetCompanyId = params.arguments?.companyId;

          // Dev fallback: Resolve to the existing tenant company if placeholder or unset
          if (!targetCompanyId || targetCompanyId === 'dev-recruiter-bypass') {
            const firstCompany = await prisma.company.findFirst({
              select: { id: true },
            });
            targetCompanyId = firstCompany?.id || targetCompanyId;
          }

          const matches = await searchHiringMemory({
            companyId: targetCompanyId,
            query: params.arguments.query,
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
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Tool not found' },
        });

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