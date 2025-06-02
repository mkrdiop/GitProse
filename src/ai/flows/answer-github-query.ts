'use server';

/**
 * @fileOverview An AI agent for answering questions about a GitHub repository's history.
 *
 * - answerGithubQuery - A function that answers questions about a GitHub repository's history.
 * - AnswerGithubQueryInput - The input type for the answerGithubQuery function.
 * - AnswerGithubQueryOutput - The return type for the answerGithubQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerGithubQueryInputSchema = z.object({
  repositoryUrl: z.string().describe('The URL of the GitHub repository.'),
  query: z.string().describe('The natural language query about the repository history.'),
  relevantData: z.string().optional().describe('Relevant data from the GitHub API (commits, issues, etc.) to augment the answer.'),
});
export type AnswerGithubQueryInput = z.infer<typeof AnswerGithubQueryInputSchema>;

const AnswerGithubQueryOutputSchema = z.object({
  answer: z.string().describe('The LLM-generated answer to the query.'),
  relevantLinks: z.array(z.string()).describe('An array of direct links to relevant commits or issues on GitHub.'),
});
export type AnswerGithubQueryOutput = z.infer<typeof AnswerGithubQueryOutputSchema>;

export async function answerGithubQuery(input: AnswerGithubQueryInput): Promise<AnswerGithubQueryOutput> {
  return answerGithubQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGithubQueryPrompt',
  input: {schema: AnswerGithubQueryInputSchema},
  output: {schema: AnswerGithubQueryOutputSchema},
  prompt: `You are a helpful assistant that answers questions about a GitHub repository's history.

  You will be provided with a repository URL and a natural language query about the repository's history.
  Optionally, you may also be provided with relevant data from the GitHub API (commits, issues, etc.) to augment your answer.

  Repository URL: {{{repositoryUrl}}}
  Query: {{{query}}}

  {{#if relevantData}}
  Relevant Data:
  {{{relevantData}}}
  {{/if}}

  Answer the query to the best of your ability, providing a concise and informative answer.
  Include direct links to the relevant commits or issues on GitHub to verify the context and source of your answer.`,
});

const answerGithubQueryFlow = ai.defineFlow(
  {
    name: 'answerGithubQueryFlow',
    inputSchema: AnswerGithubQueryInputSchema,
    outputSchema: AnswerGithubQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
