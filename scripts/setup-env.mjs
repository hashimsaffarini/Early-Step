import { constants, copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// A fresh clone has no .env (it must remain gitignored). Initialize only public defaults,
// never overwrite a student's configuration and never print environment values.
const destination = resolve(process.cwd(), '.env');
const template = resolve(process.cwd(), '.env.example');

if (!existsSync(destination) && !process.env.VITE_API_BASE_URL?.trim()) {
  if (!existsSync(template)) {
    console.error('[Early Step] Missing .env.example. Run npm run dev from the project folder.');
    process.exitCode = 1;
  } else {
    try {
      copyFileSync(template, destination, constants.COPYFILE_EXCL);
      console.info('[Early Step] Created local .env from public defaults in .env.example.');
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('[Early Step] Could not create .env. Copy .env.example to .env manually.');
        process.exitCode = 1;
      }
    }
  }
}
