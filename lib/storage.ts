import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY || 'mock',
    secretAccessKey: env.STORAGE_SECRET_KEY || 'mock',
  },
});

export async function uploadDocument(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'resumes'
): Promise<{ storageKey: string }> {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storageKey = `${folder}/${timestamp}-${sanitizedName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: storageKey,
      Body: fileBuffer,
      ContentType: mimeType,
    })
  );

  return { storageKey };
}

export async function getDocumentDownloadUrl(storageKey: string, expiresInSec = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: storageKey,
  });
  return getSignedUrl(s3, command, { expiresIn: expiresInSec });
}