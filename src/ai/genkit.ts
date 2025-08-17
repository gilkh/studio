
import { genkit, type GenkitError } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';

export function isGenkitError(
  err: unknown,
): err is GenkitError<Record<string, unknown>> {
  return (
    typeof err === 'object' &&
    err !== null &&
    '__isGenkitError' in err &&
    err.__isGenkitError === true
  );
}

const ai = genkit({
  plugins: [firebase(), googleAI()],
});

export { ai };
