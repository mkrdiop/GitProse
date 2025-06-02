
'use server';

/**
 * @fileOverview An AI flow to explain the functional impact of a commit diff.
 *
 * - explainCommitDiff - A function that explains a commit diff.
 * - ExplainCommitDiffInput - The input type for the explainCommitDiff function.
 * - ExplainCommitDiffOutput - The return type for the explainCommitDiff function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCommitDiffInputSchema = z.object({
  ownerName: z.string().describe('The name of the owner of the GitHub repository.'),
  repoName: z.string().describe('The name of the GitHub repository.'),
  commitSha: z.string().describe('The SHA of the commit.'),
  diffContent: z.string().describe('The raw diff content of the commit.'),
});
export type ExplainCommitDiffInput = z.infer<typeof ExplainCommitDiffInputSchema>;

const ExplainCommitDiffOutputSchema = z.object({
  explanation: z.string().describe('A natural language explanation of the functional impact of the commit diff, formatted in Markdown.'),
});
export type ExplainCommitDiffOutput = z.infer<typeof ExplainCommitDiffOutputSchema>;

export async function explainCommitDiff(input: ExplainCommitDiffInput): Promise<ExplainCommitDiffOutput> {
  return explainCommitDiffFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCommitDiffPrompt',
  input: {schema: ExplainCommitDiffInputSchema},
  output: {schema: ExplainCommitDiffOutputSchema},
  prompt: `You are an expert software developer tasked with explaining the functional impact of code changes.
Given the following diff for commit {{{commitSha}}} in the repository {{{ownerName}}}/{{{repoName}}}, provide a concise natural language explanation of what these changes achieve.
Focus on the *purpose* and *functional outcome* of the modifications, rather than just a line-by-line description or a list of changed files.
For example, instead of saying "added a null check", explain "this change prevents potential errors by ensuring the user object exists before accessing its properties."
If the diff is very large or complex, summarize the most significant functional changes.
Format your explanation in Markdown.

Diff:
\`\`\`diff
{{{diffContent}}}
\`\`\`

Explanation of functional impact:
`,
});

const explainCommitDiffFlow = ai.defineFlow(
  {
    name: 'explainCommitDiffFlow',
    inputSchema: ExplainCommitDiffInputSchema,
    outputSchema: ExplainCommitDiffOutputSchema,
  },
  async input => {
    // Potentially add logic here to truncate or summarize diffContent if it's extremely long
    // to avoid exceeding model token limits, though the prompt already asks the AI to summarize.
    const {output} = await prompt(input);
    return output!;
  }
);
