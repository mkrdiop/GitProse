
export interface ParsedRepositoryUrl {
  owner: string | null; // Corresponds to owner for GitHub, namespace/group for GitLab
  repo: string | null;  // Corresponds to repo name for GitHub, project path for GitLab
  source: 'github' | 'gitlab' | 'invalid';
  error?: string;
}

export function parseRepositoryUrl(url: string): ParsedRepositoryUrl {
  if (!url || url.trim() === "") {
    return { owner: null, repo: null, source: 'invalid', error: 'Repository URL cannot be empty.' };
  }

  const trimmedUrl = url.trim();

  // Check for full GitHub URLs
  // Matches https://github.com/owner/repo or github.com/owner/repo
  // Allows .git suffix and trailing slash
  const githubMatch = trimmedUrl.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git|\/)*$/i);
  if (githubMatch) {
    return { owner: githubMatch[1], repo: githubMatch[2].replace(/\/$/, ''), source: 'github', error: undefined };
  }

  // Check for full GitLab URLs
  // Matches https://gitlab.com/namespace/project or gitlab.com/namespace/project
  // Allows .git suffix and trailing slash. Project path can contain subgroups.
  // Example: gitlab.com/group/subgroup/project
  const gitlabMatch = trimmedUrl.match(/^(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([^\/]+)\/(.+?)(?:\.git|\/)*$/i);
  if (gitlabMatch) {
    // repo part might contain more slashes if it's a subgroup/project
    const repoPath = gitlabMatch[2].replace(/\/$/, ''); // Remove trailing slash if any
    return { owner: gitlabMatch[1], repo: repoPath, source: 'gitlab', error: undefined };
  }

  // Check for simple owner/repo (assume GitHub for backward compatibility and common usage)
  // Does not start with http(s)://, does not contain github.com or gitlab.com explicitly
  const simpleRepoMatch = trimmedUrl.match(/^([^\/]+)\/([^\/]+?)(?:\.git)?$/i);
  if (simpleRepoMatch && !trimmedUrl.includes('://') && !trimmedUrl.includes('gitlab.com') && !trimmedUrl.includes('github.com')) {
    return { owner: simpleRepoMatch[1], repo: simpleRepoMatch[2], source: 'github', error: undefined };
  }

  return { owner: null, repo: null, source: 'invalid', error: 'Invalid repository URL. Use format like https://github.com/owner/repo, https://gitlab.com/namespace/project, or owner/repo (for GitHub).' };
}
