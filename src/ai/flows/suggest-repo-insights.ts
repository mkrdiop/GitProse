'use server';

/**
 * @fileOverview Suggests insightful questions about a GitHub repository based on its recent history.
 *
 * - suggestRepoInsights - A function that suggests questions about a GitHub repository.
 * - SuggestRepoInsightsInput - The input type for the suggestRepoInsights function.
 * - SuggestRepoInsightsOutput - The return type for the suggestRepoInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRepoInsightsInputSchema = z.object({
  repoName: z.string().describe('The name of the GitHub repository (e.g., octocat/Spoon-Knife).'),
  ownerName: z.string().describe('The name of the owner of the GitHub repository (e.g., octocat).'),
});
export type SuggestRepoInsightsInput = z.infer<typeof SuggestRepoInsightsInputSchema>;

const SuggestRepoInsightsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of suggested questions about the repository.'),
});
export type SuggestRepoInsightsOutput = z.infer<typeof SuggestRepoInsightsOutputSchema>;

export async function suggestRepoInsights(input: SuggestRepoInsightsInput): Promise<SuggestRepoInsightsOutput> {
  return suggestRepoInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepoInsightsPrompt',
  input: {schema: SuggestRepoInsightsInputSchema},
  output: {schema: SuggestRepoInsightsOutputSchema},
  prompt: `You are an expert in understanding GitHub repositories and suggesting insightful questions.

  Based on the repository name and owner provided, suggest 3 questions that a user might ask to discover trends or areas of interest in the repository's development history.

  Repository Name: {{{repoName}}}
  Owner Name: {{{ownerName}}}

  Format your response as a JSON object with a "questions" array containing the suggested questions.
  `,
});

const suggestRepoInsightsFlow = ai.defineFlow(
  {
    name: 'suggestRepoInsightsFlow',
    inputSchema: SuggestRepoInsightsInputSchema,
    outputSchema: SuggestRepoInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
