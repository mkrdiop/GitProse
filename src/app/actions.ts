
"use server";

import { answerGithubQuery, type AnswerGithubQueryOutput } from "@/ai/flows/answer-github-query";
import { suggestRepoInsights, type SuggestRepoInsightsOutput } from "@/ai/flows/suggest-repo-insights";
import { explainCommitDiff, type ExplainCommitDiffOutput } from "@/ai/flows/explain-commit-diff";

const GITHUB_API_BASE_URL = "https://api.github.com";
const GITLAB_API_BASE_URL = "https://gitlab.com/api/v4";

interface FetchDataResult {
  dataString?: string;
  error?: string;
}

interface FetchDiffResult {
  diff?: string;
  error?: string;
}

interface SimplifiedCommitInfo {
  sha: string;
  message: string;
  author: string | null;
  date: string | null;
  url: string;
}

interface SimplifiedIssueInfo {
  number: number; // Corresponds to 'iid' in GitLab
  title: string;
  user: string | null; // GitLab 'author.username'
  state: string;
  createdAt: string | null;
  labels: string[];
  url: string; // GitLab 'web_url'
}

interface SimplifiedPullRequestInfo { // For GitLab, this will represent Merge Requests
  number: number; // Corresponds to 'iid' in GitLab
  title: string;
  user: string | null; // GitLab 'author.username'
  state: string; // GitLab state (e.g., 'opened', 'merged', 'closed')
  createdAt: string | null;
  labels: string[];
  url: string; // GitLab 'web_url'
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

async function fetchDataFromGitLab(url: string, dataTypeName: string): Promise<any[]> {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (process.env.GITLAB_PAT) {
    headers["PRIVATE-TOKEN"] = process.env.GITLAB_PAT;
  }

  const response = await fetch(url, {
    headers: headers,
    next: {
      revalidate: 3600 // Revalidate every 1 hour
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch ${dataTypeName}` }));
    let errorMessage = `Failed to fetch ${dataTypeName} from GitLab (${response.status}): ${errorData.message || 'Unknown error'}`;
     if (response.status === 403 && errorData.message && errorData.message.includes('rate limit')) {
      errorMessage += " (But here's the good news: Authenticated requests get a higher rate limit. Check out the documentation for more details.)";
       if (!process.env.GITLAB_PAT) {
        errorMessage += " Consider adding a GITLAB_PAT environment variable.";
      }
    }
    console.error(`GitLab API error for ${dataTypeName} (${response.status}): ${JSON.stringify(errorData)}`);
    throw new Error(errorMessage);
  }
  return response.json();
}


export async function fetchCommitsForRepo(
  owner: string,
  repo: string,
  source: 'github' | 'gitlab'
): Promise<FetchDataResult> {
  if (!owner || !repo) {
    return { error: "Owner/namespace and repository/project name are required for fetching commits." };
  }

  if (source === 'github') {
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
      console.error("Error fetching GitHub commits:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitHub commits." };
    }
  } else if (source === 'gitlab') {
    const projectId = encodeURIComponent(`${owner}/${repo}`);
    const url = `${GITLAB_API_BASE_URL}/projects/${projectId}/repository/commits?per_page=10`;
    try {
      const commitsData: any[] = await fetchDataFromGitLab(url, "commits");
      const simplifiedCommits: SimplifiedCommitInfo[] = commitsData.map(commit => ({
        sha: commit.id,
        message: commit.title, // GitLab uses 'title' for the first line of the commit message
        author: commit.author_name || 'Unknown',
        date: commit.authored_date || null,
        url: commit.web_url,
      }));
      const commitContextString = simplifiedCommits.map(c =>
        `Commit SHA: ${c.sha.substring(0,7)}\nAuthor: ${c.author}\nDate: ${c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}\nMessage: ${c.message}\nURL: ${c.url}\n---`
      ).join('\n\n');
      return { dataString: commitContextString };
    } catch (error: any) {
      console.error("Error fetching GitLab commits:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitLab commits." };
    }
  }
  return { error: "Unsupported repository source specified." };
}

export async function fetchOpenIssuesForRepo(
  owner: string,
  repo: string,
  source: 'github' | 'gitlab'
): Promise<FetchDataResult> {
  if (!owner || !repo) {
    return { error: "Owner/namespace and repository/project name are required for fetching issues." };
  }

  if (source === 'github') {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues?state=open&per_page=10&sort=created&direction=desc`;
    try {
      const issuesData: any[] = await fetchDataFromGitHub(url, "issues");
      const simplifiedIssues: SimplifiedIssueInfo[] = issuesData
        .filter(issue => !issue.pull_request) // Exclude pull requests from issues list
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
      console.error("Error fetching GitHub issues:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitHub issues." };
    }
  } else if (source === 'gitlab') {
    const projectId = encodeURIComponent(`${owner}/${repo}`);
    // GitLab API uses 'opened' for open issues. Corrected 'sort' and 'order_by'.
    const url = `${GITLAB_API_BASE_URL}/projects/${projectId}/issues?state=opened&per_page=10&order_by=created_at&sort=desc`;
    try {
      const issuesData: any[] = await fetchDataFromGitLab(url, "issues");
      const simplifiedIssues: SimplifiedIssueInfo[] = issuesData.map(issue => ({
        number: issue.iid, // GitLab uses 'iid' for issue internal ID
        title: issue.title,
        user: issue.author?.username || 'Unknown',
        state: issue.state, // e.g., 'opened', 'closed'
        createdAt: issue.created_at || null,
        labels: issue.labels || [],
        url: issue.web_url,
      }));
      const issuesContextString = simplifiedIssues.map(i =>
        `Issue #${i.number}: ${i.title}\nUser: ${i.user}\nState: ${i.state}\nCreated: ${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : 'N/A'}\nLabels: ${i.labels.join(', ') || 'None'}\nURL: ${i.url}\n---`
      ).join('\n\n');
      return { dataString: issuesContextString };
    } catch (error: any) {
      console.error("Error fetching GitLab issues:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitLab issues." };
    }
  }
  return { error: "Unsupported repository source specified." };
}

export async function fetchOpenPullRequestsForRepo( // For GitLab, this means Merge Requests
  owner: string,
  repo: string,
  source: 'github' | 'gitlab'
): Promise<FetchDataResult> {
  if (!owner || !repo) {
    return { error: "Owner/namespace and repository/project name are required for fetching pull/merge requests." };
  }

  if (source === 'github') {
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
    } catch (error: any)      {
      console.error("Error fetching GitHub pull requests:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitHub pull requests." };
    }
  } else if (source === 'gitlab') {
    const projectId = encodeURIComponent(`${owner}/${repo}`);
    // GitLab API uses 'opened' for open merge requests. Corrected 'sort' and 'order_by'.
    const url = `${GITLAB_API_BASE_URL}/projects/${projectId}/merge_requests?state=opened&per_page=10&order_by=created_at&sort=desc`;
    try {
      const mrsData: any[] = await fetchDataFromGitLab(url, "merge requests");
      const simplifiedMRs: SimplifiedPullRequestInfo[] = mrsData.map(mr => ({
        number: mr.iid, // GitLab uses 'iid'
        title: mr.title,
        user: mr.author?.username || 'Unknown',
        state: mr.state, // e.g., 'opened', 'merged', 'closed'
        createdAt: mr.created_at || null,
        labels: mr.labels || [],
        url: mr.web_url,
      }));
      const mrsContextString = simplifiedMRs.map(m =>
        `PR #${m.number}: ${m.title}\nUser: ${m.user}\nState: ${m.state}\nCreated: ${m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}\nLabels: ${m.labels.join(', ') || 'None'}\nURL: ${m.url}\n---`
      ).join('\n\n');
      return { dataString: mrsContextString };
    } catch (error: any) {
      console.error("Error fetching GitLab merge requests:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitLab merge requests." };
    }
  }
  return { error: "Unsupported repository source specified." };
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
  repo: string,
  source: 'github' | 'gitlab'
): Promise<GetSuggestedQuestionsResult> {
  if (!owner || !repo) {
    return { error: "Owner/namespace and repository/project name are required for suggestions." };
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

export async function fetchCommitDiff(
  owner: string,
  repo: string,
  sha: string,
  source: 'github' | 'gitlab'
): Promise<FetchDiffResult> {
  if (!owner || !repo || !sha) {
    return { error: "Owner/namespace, repository/project name, and commit SHA are required for fetching diff." };
  }

  if (source === 'github') {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits/${sha}`;
    const headers: HeadersInit = { Accept: "application/vnd.github.diff" };
    if (process.env.GITHUB_PAT) {
      headers["Authorization"] = `token ${process.env.GITHUB_PAT}`;
    }
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        let errorResponseMessage = `Failed to fetch diff for commit ${sha} from GitHub`;
        try { const errorData = await response.json(); errorResponseMessage = errorData.message || errorResponseMessage; }
        catch (e) { const textError = await response.text(); errorResponseMessage = textError || errorResponseMessage; }
        throw new Error(`GitHub API error for diff (${response.status}): ${errorResponseMessage}`);
      }
      const diffContent = await response.text();
      return { diff: diffContent };
    } catch (error: any) {
      console.error("Error fetching GitHub commit diff:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitHub commit diff." };
    }
  } else if (source === 'gitlab') {
    const projectId = encodeURIComponent(`${owner}/${repo}`);
    const url = `${GITLAB_API_BASE_URL}/projects/${projectId}/repository/commits/${sha}/diff`;
    const headers: HeadersInit = { Accept: "application/json" }; 
    if (process.env.GITLAB_PAT) {
      headers["PRIVATE-TOKEN"] = process.env.GITLAB_PAT;
    }
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        let errorResponseMessage = `Failed to fetch diff for commit ${sha} from GitLab`;
        try { const errorData = await response.json(); errorResponseMessage = errorData.message || errorResponseMessage; }
        catch (e) { const textError = await response.text(); errorResponseMessage = textError || errorResponseMessage; }
        throw new Error(`GitLab API error for diff (${response.status}): ${errorResponseMessage}`);
      }
      const diffDataArray: any[] = await response.json();
      const diffContent = diffDataArray.map(d => d.diff).join('\n');
      return { diff: diffContent };
    } catch (error: any) {
      console.error("Error fetching GitLab commit diff:", error);
      return { error: error.message || "An unexpected error occurred while fetching GitLab commit diff." };
    }
  }
  return { error: "Unsupported repository source specified for fetching diff." };
}

interface GetCommitDiffExplanationResult {
  data?: ExplainCommitDiffOutput;
  error?: string;
}

export async function getCommitDiffExplanation(
  owner: string,
  repo: string,
  commitSha: string,
  source: 'github' | 'gitlab'
): Promise<GetCommitDiffExplanationResult> {
  if (!owner || !repo || !commitSha) {
    return { error: "Owner, repository, and commit SHA are required." };
  }

  try {
    const diffResult = await fetchCommitDiff(owner, repo, commitSha, source);
    if (diffResult.error || !diffResult.diff) {
      return { error: diffResult.error || "Could not fetch diff content." };
    }

    const aiResponse = await explainCommitDiff({
      ownerName: owner,
      repoName: repo, 
      commitSha: commitSha,
      diffContent: diffResult.diff,
    });
    return { data: aiResponse };
  } catch (error) {
    console.error("Error getting commit diff explanation:", error);
    const errorMessage = (typeof error === 'object' && error !== null && 'message' in error)
                         ? String((error as {message: string}).message)
                         : "An unexpected error occurred while explaining the commit diff.";
    return { error: errorMessage };
  }
}

    