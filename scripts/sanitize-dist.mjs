import { rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const outputDir = resolve('dist');
for (const relativePath of ['seed/seed.json', 'assets/aistudio']) {
  const target = resolve(outputDir, relativePath);
  if (target !== outputDir && target.startsWith(`${outputDir}${process.platform === 'win32' ? '\\' : '/'}`) && existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
}
