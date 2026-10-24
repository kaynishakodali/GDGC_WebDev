import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role, PaintingStatus } from '@prisma/client';

const prisma = new PrismaClient();
type Seed = {
  currency: string;
  paintings: Array<{ id: string; title: string; artist: string; description: string; price: number; imageUrl: string; status: 'available' | 'sold' }>;
  potteryItems: Array<{ id: string; name: string }>;
  glazes: Array<{ id: string; name: string }>;
  mural: { ratePerSqFt: number };
};

async function main() {
  const email = process.env.STUDIO_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.STUDIO_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('Set STUDIO_ADMIN_EMAIL and a STUDIO_ADMIN_PASSWORD of at least 12 characters before seeding.');
  const seed = JSON.parse(await readFile(resolve(process.cwd(), 'seedData/seed.json'), 'utf8')) as Seed;
  const paintings = await prisma.painting.createMany({ data: seed.paintings.map((painting) => ({ ...painting, status: painting.status === 'sold' ? PaintingStatus.sold : PaintingStatus.available })), skipDuplicates: true });
  const potteryItems = await prisma.potteryItem.createMany({ data: seed.potteryItems, skipDuplicates: true });
  const glazes = await prisma.glaze.createMany({ data: seed.glazes, skipDuplicates: true });
  await prisma.appConfig.createMany({ data: [{ id: 'default', currency: seed.currency, muralRate: seed.mural.ratePerSqFt }], skipDuplicates: true });
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.createMany({ data: [{ name: process.env.STUDIO_ADMIN_NAME?.trim() || 'Studio Curator', email, passwordHash, role: Role.studio }], skipDuplicates: true });
  console.info(`Inserted ${paintings.count} paintings, ${potteryItems.count} pottery forms, ${glazes.count} glazes${admin.count ? ', and the studio account' : '; the configured studio account already exists and was left unchanged'}. Existing rows and the supplied seed file were not modified.`);
}

main().catch((error) => { console.error(`Seed failed: ${error instanceof Error ? error.message : 'Unknown error'}`); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
