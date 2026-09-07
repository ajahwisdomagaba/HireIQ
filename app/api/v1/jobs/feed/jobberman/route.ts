import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fetch jobs safely without hardcoded status enum conflicts
    const allJobs = await prisma.job.findMany({
      include: {
        company: true,
      } as any,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Accept any active or open requisition status
    const jobs = (allJobs as any[]).filter((j) => {
      const s = String(j.status || '').toUpperCase();
      return s === 'ACTIVE' || s === 'OPEN' || s === 'PUBLISHED';
    });

    const escapeXml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const xmlItems = jobs
      .map((job) => {
        const applyUrl = `${baseUrl}/jobs/${job.id}`;
        const descriptionText =
          job.description ||
          job.contextText ||
          job.rawText ||
          `${job.title} role in Nigeria.`;

        const rawReqs = job.requirements || job.jobRequirements || [];
        const requirementsText = Array.isArray(rawReqs)
          ? rawReqs
              .map((r: any) => (typeof r === 'string' ? r : r.title || r.name || ''))
              .filter(Boolean)
              .join(', ')
          : '';

        const pubDate = new Date(job.createdAt).toUTCString();

        return `
    <job>
      <title><![CDATA[${job.title}]]></title>
      <date><![CDATA[${pubDate}]]></date>
      <referencenumber><![CDATA[${job.id}]]></referencenumber>
      <url><![CDATA[${applyUrl}]]></url>
      <company><![CDATA[${job.company?.name || 'HireIQ Network'}]]></company>
      <city><![CDATA[${job.location || 'Lagos'}]]></city>
      <country><![CDATA[Nigeria]]></country>
      <postalcode><![CDATA[100001]]></postalcode>
      <description><![CDATA[${escapeXml(descriptionText)}]]></description>
      <requirements><![CDATA[${escapeXml(requirementsText)}]]></requirements>
      <jobtype><![CDATA[${job.employmentType || 'Full-Time'}]]></jobtype>
    </job>`;
      })
      .join('');

    const xmlFeed = `<?xml version="1.0" encoding="UTF-8"?>
<source>
  <publisher>HireIQ Recruitment Intelligence</publisher>
  <publisherurl>${baseUrl}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${xmlItems}
</source>`;

    return new Response(xmlFeed, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate feed' },
      { status: 500 }
    );
  }
}