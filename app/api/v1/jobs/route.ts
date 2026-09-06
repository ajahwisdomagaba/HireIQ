import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        department: true,
        requirements: true,
        _count: {
          select: { applications: true },
        },
      },
    });
    return NextResponse.json({ success: true, jobs });
  } catch (err: any) {
    console.error('GET /api/v1/jobs error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      department,
      experienceLevel,
      location,
      employmentType,
      rawDescription,
      skills,
      salaryMin,
      salaryMax,
    } = body;

    // 1. Ensure fallback Company exists
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'HireIQ Engineering',
          slug: `hireiq-${Date.now()}`,
          industry: 'FINTECH',
        },
      });
    }

    // 2. Ensure Department exists
    let dept = await prisma.department.findFirst({
      where: { companyId: company.id },
    });
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: department || 'Engineering',
          companyId: company.id,
        },
      });
    }

   // 3. Format relational requirements array using schema field 'title'
    const skillsList: string[] = Array.isArray(skills) ? skills : [];
    const requirementsData = skillsList.map((skill: string) => ({
      title: skill,
    }));

    // 4. Create Job
    const job = await prisma.job.create({
      data: {
        title: title || 'Software Engineer',
        companyId: company.id,
        departmentId: dept.id,
        location: location || 'Lagos, Nigeria (Hybrid)',
        employmentType: employmentType || 'Full-Time',
        experienceLevel: experienceLevel || 'ENTRY',
        status: JobStatus.ACTIVE,
        rawDescription: rawDescription || title,
        salaryMinNGN: Number(salaryMin) || 350000,
        salaryMaxNGN: Number(salaryMax) || 700000,
        ...(requirementsData.length > 0
          ? {
              requirements: {
                create: requirementsData,
              },
            }
          : {}),
      },
    });

    console.log('✅ Job requisition created:', job.id, job.title);
    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (err: any) {
    console.error('❌ Job creation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}