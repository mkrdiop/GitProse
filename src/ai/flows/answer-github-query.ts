
'use server';

/**
 * @fileOverview An AI agent for answering questions about a GitHub repository's history, issues, and pull requests.
 *
 * - answerGithubQuery - A function that answers questions about a GitHub repository.
 * - AnswerGithubQueryInput - The input type for the answerGithubQuery function.
 * - AnswerGithubQueryOutput - The return type for the answerGithubQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerGithubQueryInputSchema = z.object({
  repositoryUrl: z.string().describe('The URL of the GitHub repository.'),
  query: z.string().describe('The natural language query about the repository history, issues, or pull requests.'),
  relevantData: z.string().optional().describe('Relevant data from the GitHub API (commits, issues, pull requests, etc.) to augment the answer. This data will be structured with headers like "COMMITS:", "ISSUES:", "PULL REQUESTS:" followed by their respective details.'),
});
export type AnswerGithubQueryInput = z.infer<typeof AnswerGithubQueryInputSchema>;

const AnswerGithubQueryOutputSchema = z.object({
  answer: z.string().describe('The LLM-generated answer to the query.'),
  relevantLinks: z.array(z.string().url()).describe('An array of direct links to relevant commits, issues, or pull requests on GitHub.'),
});
export type AnswerGithubQueryOutput = z.infer<typeof AnswerGithubQueryOutputSchema>;

export async function answerGithubQuery(input: AnswerGithubQueryInput): Promise<AnswerGithubQueryOutput> {
  return answerGithubQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerGithubQueryPrompt',
  input: {schema: AnswerGithubQueryInputSchema},
  output: {schema: AnswerGithubQueryOutputSchema},
  prompt: `You are a helpful assistant that answers questions about a GitHub repository's history, issues, and pull requests.

  You will be provided with a repository URL and a natural language query.
  Optionally, you may also be provided with relevant data from the GitHub API (formatted sections for COMMITS, ISSUES, PULL REQUESTS) to augment your answer.

  Repository URL: {{{repositoryUrl}}}
  Query: {{{query}}}

  {{#if relevantData}}
  Relevant Data:
  {{{relevantData}}}
  {{/if}}

  Analyze the query and the provided relevant data.
  Answer the query to the best of your ability, providing a concise and informative answer.
  If the query is about commits, focus on commit data. If about issues, focus on issue data, and so on.
  Include direct links (URLs provided in the relevant data) to the relevant commits, issues, or pull requests on GitHub that support your answer.
  If the relevant data is insufficient or not provided for the specific type of query (e.g., asking about issues but only commit data is available), state that you need more specific information or cannot answer based on the provided context.`,
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

    