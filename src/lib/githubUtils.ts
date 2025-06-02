export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  error?: string;
}

export function parseGitHubUrl(url: string): ParsedGitHubUrl {
  if (!url) {
    return { owner: '', repo: '', error: 'GitHub repository URL cannot be empty.' };
  }
  try {
    // Attempt to construct a URL object to handle various forms and extract pathname
    // This also helps validate if it's a somewhat valid URL structure
    let path;
    if (url.startsWith('https://') || url.startsWith('http://')) {
        const urlObject = new URL(url);
        if (urlObject.hostname !== 'github.com' && urlObject.hostname !== 'www.github.com') {
            throw new Error('URL must be a github.com URL.');
        }
        path = urlObject.pathname;
    } else {
        // Handle owner/repo format
        path = `/${url}`;
    }
    
    const cleanedPath = path.trim().replace(/\.git$/, '').replace(/^\//, ''); // Remove .git suffix and leading slash
    const parts = cleanedPath.split('/');
    
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return { owner: parts[0], repo: parts[1] };
    }
    throw new Error();
  } catch (e) {
    return { owner: '', repo: '', error: 'Invalid GitHub repository URL. Expected format: https://github.com/owner/repo or owner/repo' };
  }
}
