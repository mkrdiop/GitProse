
"use server";

import { answerGithubQuery, type AnswerGithubQueryOutput } from "@/ai/flows/answer-github-query";
import { suggestRepoInsights, type SuggestRepoInsightsOutput } from "@/ai/flows/suggest-repo-insights";

const GITHUB_API_BASE_URL = "https://api.github.com";

interface FetchDataResult {
  dataString?: string; 
  error?: string;
}

// Minimal commit info we care about for the context
interface SimplifiedCommitInfo {
  sha: string;
  message: string;
  author: string | null;
  date: string | null;
  url: string;
}

// Minimal issue info
interface SimplifiedIssueInfo {
  number: number;
  title: string;
  user: string | null;
  state: string;
  createdAt: string | null;
  labels: string[];
  url: string;
}

// Minimal PR info
interface SimplifiedPullRequestInfo {
  number: number;
  title: string;
  user: string | null;
  state: string;
  createdAt: string | null;
  labels: string[];
  url: string;
}

async function fetchDataFromGitHub(url: string, dataTypeName: string): Promise<any[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_PAT) {
    headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;
  }

  const response = await fetch(url, {
    headers: headers,
    next: {
      revalidate: 3600 // Revalidate every 1 hour
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch ${dataTypeName}` }));
    let errorMessage = `Failed to fetch ${dataTypeName} from GitHub (${response.status}): ${errorData.message || 'Unknown error'}`;
    if (response.status === 403 && errorData.message && errorData.message.includes('API rate limit exceeded')) {
      errorMessage += " (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)";
      if (!process.env.GITHUB_PAT) {
        errorMessage += " Consider adding a GITHUB_PAT environment variable.";
      }
    }
    console.error(`GitHub API error for ${dataTypeName} (${response.status}): ${errorData.message}`);
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchCommitsForRepo(
  owner: string,
  repo: string
): Promise<FetchDataResult> {
  if (!owner || !repo) {
    return { error: "Owner and repository name are required for fetching commits." };
  }
  const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits?per_page=10`; 

  try {
    const commitsData: any[] = await fetchDataFromGitHub(url, "commits");
    
    const simplifiedCommits: SimplifiedCommitInfo[] = commitsData.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message.split('\n')[0], 
      author: commit.commit.author?.name || commit.author?.login || 'Unknown',
      date: commit.commit.author?.date || null,
      url: commit.html_url,
    }));

    const commitContextString = simplifiedCommits.map(c => 
      `Commit SHA: ${c.sha.substring(0,7)}\nAuthor: ${c.author}\nDate: ${c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}\nMessage: ${c.message}\nURL: ${c.url}\n---`
    ).join('\n\n');
    
    return { dataString: commitContextString };

  } catch (error: any) {
    console.error("Error fetching commits:", error);
    return { error: error.message || "An unexpected error occurred while fetching commits." };
  }
}

export async function fetchOpenIssuesForRepo(
  owner: string,
  repo: string
): Promise<FetchDataResult> {
  if (!owner || !repo) {
    return { error: "Owner and repository name are required for fetching issues." };
  }
  const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues?state=open&per_page=10&sort=created&direction=desc`;

  try {
    const issuesData: any[] = await fetchDataFromGitHub(url, "issues");

    const simplifiedIssues: SimplifiedIssueInfo[] = issuesData
      .filter(issue => !issue.pull_request) // Filter out pull requests, as they are also returned by /issues
      .map(issue => ({
        number: issue.number,
        title: issue.title,
        user: issue.user?.login || 'Unknown',
        state: issue.state,
        createdAt: issue.created_at || null,
        labels: issue.labels.map((label: any) => label.name),
        url: issue.html_url,
      }));

    const issuesContextString = simplifiedIssues.map(i =>
      `Issue #${i.number}: ${i.title}\nUser: ${i.user}\nState: ${i.state}\nCreated: ${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : 'N/A'}\nLabels: ${i.labels.join(', ') || 'None'}\nURL: ${i.url}\n---`
    ).join('\n\n');

    return { dataString: issuesContextString };
  } catch (error: any) {
    console.error("Error fetching issues:", error);
    return { error: error.message || "An unexpected error occurred while fetching issues." };
  }
}

export async function fetchOpenPullRequestsForRepo(
  owner: string,
  repo: string
): Promise<FetchDataResult> {
  if (!owner || !repo) {
    return { error: "Owner and repository name are required for fetching pull requests." };
  }
  const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/pulls?state=open&per_page=10&sort=created&direction=desc`;

  try {
    const prsData: any[] = await fetchDataFromGitHub(url, "pull requests");

    const simplifiedPRs: SimplifiedPullRequestInfo[] = prsData.map(pr => ({
      number: pr.number,
      title: pr.title,
      user: pr.user?.login || 'Unknown',
      state: pr.state,
      createdAt: pr.created_at || null,
      labels: pr.labels.map((label: any) => label.name),
      url: pr.html_url,
    }));

    const prsContextString = simplifiedPRs.map(p =>
      `PR #${p.number}: ${p.title}\nUser: ${p.user}\nState: ${p.state}\nCreated: ${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}\nLabels: ${p.labels.join(', ') || 'None'}\nURL: ${p.url}\n---`
    ).join('\n\n');

    return { dataString: prsContextString };
  } catch (error: any) {
    console.error("Error fetching pull requests:", error);
    return { error: error.message || "An unexpected error occurred while fetching pull requests." };
  }
}


interface GetAIResponseResult {
  data?: AnswerGithubQueryOutput;
  error?: string;
}

export async function getAIResponse(
  repositoryUrl: string,
  query: string,
  relevantData: string 
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
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) 
                         ? String((error as {message: string}).message) 
                         : "An unexpected error occurred while processing your query with AI.";
    return { error: errorMessage };
  }
}

interface GetSuggestedQuestionsResult {
  data?: SuggestRepoInsightsOutput;
  error?: string;
}

export async function getSuggestedQuestions(
  owner: string,
  repo: string
): Promise<GetSuggestedQuestionsResult> {
  if (!owner || !repo) {
    return { error: "Owner and repository name are required for suggestions." };
  }
  try {
    const suggestions = await suggestRepoInsights({ ownerName: owner, repoName: repo });
    return { data: suggestions };
  } catch (error) {
    console.error("Error getting suggested questions:", error);
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error)
                         ? String((error as {message: string}).message)
                         : "An unexpected error occurred while fetching suggestions.";
    return { error: errorMessage };
  }
}
    
