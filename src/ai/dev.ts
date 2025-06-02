
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-commit-summary.ts';
import '@/ai/flows/suggest-repo-insights.ts';
import '@/ai/flows/answer-github-query.ts';
import '@/ai/flows/explain-commit-diff.ts';
