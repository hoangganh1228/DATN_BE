import * as path from 'path';
import * as fs from 'fs';
import { AppDataSource } from '../data-source';

async function main(): Promise<void> {
  await AppDataSource.initialize();

  const seedDir = __dirname;
  const files = fs
    .readdirSync(seedDir)
    .filter((f) => f.endsWith('.seed.ts'))
    .sort();
  console.log(files);

  for (const file of files) {
    const filePath = path.join(seedDir, file);
    const module = await import(filePath);

    const seedFn = Object.values(module)[0] as (ds: typeof AppDataSource) => Promise<void>;

    console.log(`📦 Running ${file}...`);
    await seedFn(AppDataSource);
    console.log(`✅ ${file} completed!`);
  }

  console.log('✅ Seed completed!');
  await AppDataSource.destroy();
}

main().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
