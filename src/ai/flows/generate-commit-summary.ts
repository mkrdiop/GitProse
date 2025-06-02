'use server';

/**
 * @fileOverview A flow to generate a summary of the latest commits in a GitHub repository.
 *
 * - generateCommitSummary - A function that handles the generation of a commit summary.
 * - GenerateCommitSummaryInput - The input type for the generateCommitSummary function.
 * - GenerateCommitSummaryOutput - The return type for the generateCommitSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCommitSummaryInputSchema = z.object({
  repoName: z.string().describe('The name of the GitHub repository.'),
  ownerName: z.string().describe('The name of the owner of the GitHub repository.'),
  commitData: z.string().describe('A JSON string containing the commit data from the GitHub API.'),
});
export type GenerateCommitSummaryInput = z.infer<typeof GenerateCommitSummaryInputSchema>;

const GenerateCommitSummaryOutputSchema = z.object({
  summary: z.string().describe('A human-readable summary of the latest commits.'),
});
export type GenerateCommitSummaryOutput = z.infer<typeof GenerateCommitSummaryOutputSchema>;

export async function generateCommitSummary(input: GenerateCommitSummaryInput): Promise<GenerateCommitSummaryOutput> {
  return generateCommitSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCommitSummaryPrompt',
  input: {schema: GenerateCommitSummaryInputSchema},
  output: {schema: GenerateCommitSummaryOutputSchema},
  prompt: `You are a software development expert tasked with summarizing recent commit history in a GitHub repository.

  Given the following commit data for the repository {{{ownerName}}}/{{{repoName}}}, provide a concise and informative summary of the key changes and potential impacts. Highlight any significant updates, bug fixes, or new features introduced by these commits.

  Commit Data:
  {{commitData}}

  Summary:
  `,
});

const generateCommitSummaryFlow = ai.defineFlow(
  {
    name: 'generateCommitSummaryFlow',
    inputSchema: GenerateCommitSummaryInputSchema,
    outputSchema: GenerateCommitSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
