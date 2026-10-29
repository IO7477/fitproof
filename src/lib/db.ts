import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function setupDatabase(): string {
  // If running in Vercel or AWS Lambda serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = '/tmp';
    const tmpDbPath = path.join(tmpDir, 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
        path.join(__dirname, '..', '..', 'dev.db'),
      ];

      let copied = false;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            copied = true;
            console.log(`[FitProof DB] Copied database from ${candidate} to ${tmpDbPath}`);
            break;
          } catch (err) {
            console.error(`[FitProof DB] Failed to copy from ${candidate}:`, err);
          }
        }
      }

      if (!copied) {
        console.warn('[FitProof DB] Could not find pre-seeded database file. Initializing at /tmp/dev.db');
      }
    }

    const url = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = url;
    return url;
  }

  // Local development / tests
  return process.env.DATABASE_URL || 'file:./dev.db';
}

const dbUrl = setupDatabase();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
