import JobPipelineClient from '@/components/recruiter/JobPipelineClient';

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <JobPipelineClient jobId={jobId} />;
}