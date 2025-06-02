"use server";

import { answerGithubQuery, type AnswerGithubQueryOutput } from "@/ai/flows/answer-github-query";
import type { Commit } from 'lucide-react'; // Using for type hint, not actual import

const GITHUB_API_BASE_URL = "https://api.github.com";

interface FetchCommitsResult {
  commits?: string; // JSON string of commit data
  error?: string;
}

// Minimal commit info we care about for the context
interface SimplifiedCommitInfo {
  sha: string;
  message: string;
  author: string | null;
  date: string | null;
}

export async function fetchCommitsForRepo(
  owner: string,
  repo: string
): Promise<FetchCommitsResult> {
  if (!owner || !repo) {
    return { error: "Owner and repository name are required." };
  }

  const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits?per_page=10`; // Get last 10 commits

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // Add a GitHub Personal Access Token here for higher rate limits if needed
        // "Authorization": `token YOUR_GITHUB_PAT`
      },
      next: {
        // Revalidate reasonably, e.g. every 10 minutes for active repos. For MVP, 1 hour.
        revalidate: 3600 
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to fetch commits" }));
      console.error(`GitHub API error (${response.status}): ${errorData.message}`);
      return { error: `Failed to fetch commits from GitHub (${response.status}): ${errorData.message || 'Unknown error'}` };
    }

    const commitsData: any[] = await response.json();
    
    const simplifiedCommits: SimplifiedCommitInfo[] = commitsData.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message.split('\\n')[0], // First line of commit message
      author: commit.commit.author?.name || commit.author?.login || 'Unknown',
      date: commit.commit.author?.date || null,
    }));

    // Construct a string representation for the AI
    const commitContextString = simplifiedCommits.map(c => 
      `Commit SHA: ${c.sha.substring(0,7)}\nAuthor: ${c.author}\nDate: ${c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}\nMessage: ${c.message}\n---`
    ).join('\n\n');
    
    return { commits: commitContextString };

  } catch (error) {
    console.error("Error fetching commits:", error);
    return { error: "An unexpected error occurred while fetching commits." };
  }
}

interface GetAIResponseResult {
  data?: AnswerGithubQueryOutput;
  error?: string;
}

export async function getAIResponse(
  repositoryUrl: string,
  query: string,
  relevantData: string // Commit data string
): Promise<GetAIResponseResult> {
  if (!repositoryUrl || !query) {
    return { error: "Repository URL and query are required." };
  }

  try {
    const aiResponse = await answerGithubQuery({
      repositoryUrl,
      query,
      relevantData, 
    });
    return { data: aiResponse };
  } catch (error) {
    console.error("Error getting AI response:", error);
    // Check if error is an object and has a message property
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) 
                         ? String((error as {message: string}).message) 
                         : "An unexpected error occurred while processing your query with AI.";
    return { error: errorMessage };
  }
}
