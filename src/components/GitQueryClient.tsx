
"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchCommitsForRepo, fetchOpenIssuesForRepo, fetchOpenPullRequestsForRepo, getAIResponse, getSuggestedQuestions } from "@/app/actions";
import { parseGitHubUrl, type ParsedGitHubUrl } from "@/lib/githubUtils";
import type { AnswerGithubQueryOutput } from "@/ai/flows/answer-github-query";
import { Github, Send, Link as LinkIcon, Loader2, AlertCircle, MessageSquareQuote } from "lucide-react";

export default function GitQueryClient() {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<AnswerGithubQueryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[] | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!repoUrl.trim()) {
        setSuggestedQuestions(null);
        setSuggestionsError(null);
        return;
      }

      const parsedUrl = parseGitHubUrl(repoUrl);
      if (parsedUrl.error || !parsedUrl.owner || !parsedUrl.repo) {
        setSuggestedQuestions(null);
        setSuggestionsError("Enter a valid GitHub URL to see suggestions.");
        return;
      }

      setIsLoadingSuggestions(true);
      setSuggestionsError(null);
      setSuggestedQuestions(null); // Clear previous suggestions

      startTransition(async () => {
        const result = await getSuggestedQuestions(parsedUrl.owner!, parsedUrl.repo!);
        if (result.error) {
          setSuggestionsError(`Could not fetch suggestions: ${result.error}`);
          setSuggestedQuestions(null);
        } else if (result.data?.questions && result.data.questions.length > 0) {
          setSuggestedQuestions(result.data.questions);
        } else {
          setSuggestedQuestions([]); // No questions returned
        }
        setIsLoadingSuggestions(false);
      });
    };

    // Debounce fetching suggestions
    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 500); // Adjust debounce time as needed (e.g., 500ms)

    return () => clearTimeout(debounceTimeout);
  }, [repoUrl]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setAiResponse(null);
    setLoadingStatus("");

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }
    if (!query.trim()) {
      setError("Please enter your query.");
      return;
    }

    startTransition(async () => {
      const parsedUrl: ParsedGitHubUrl = parseGitHubUrl(repoUrl);
      if (parsedUrl.error || !parsedUrl.owner || !parsedUrl.repo) {
        setError(parsedUrl.error || "Invalid GitHub repository URL.");
        return;
      }

      const { owner, repo } = parsedUrl;
      let commitDataString: string | undefined;
      let issuesDataString: string | undefined;
      let prDataString: string | undefined;
      
      setIsLoadingData(true);

      try {
        setLoadingStatus("Fetching commits...");
        const commitCacheKey = `commits_${owner}_${repo}`;
        const cachedCommits = sessionStorage.getItem(commitCacheKey);
        if (cachedCommits) {
          commitDataString = cachedCommits;
        } else {
          const commitResult = await fetchCommitsForRepo(owner, repo);
          if (commitResult.error) {
            setError(`Error fetching commit data: ${commitResult.error}`);
            setIsLoadingData(false); return;
          }
          commitDataString = commitResult.dataString;
          if (commitDataString) sessionStorage.setItem(commitCacheKey, commitDataString);
        }

        setLoadingStatus("Fetching open issues...");
        const issuesCacheKey = `issues_${owner}_${repo}`;
        const cachedIssues = sessionStorage.getItem(issuesCacheKey);
        if (cachedIssues) {
          issuesDataString = cachedIssues;
        } else {
          const issuesResult = await fetchOpenIssuesForRepo(owner, repo);
          if (issuesResult.error) {
            setError(`Error fetching issue data: ${issuesResult.error}`);
            setIsLoadingData(false); return;
          }
          issuesDataString = issuesResult.dataString;
          if (issuesDataString) sessionStorage.setItem(issuesCacheKey, issuesDataString);
        }

        setLoadingStatus("Fetching open pull requests...");
        const prCacheKey = `prs_${owner}_${repo}`;
        const cachedPRs = sessionStorage.getItem(prCacheKey);
        if (cachedPRs) {
          prDataString = cachedPRs;
        } else {
          const prResult = await fetchOpenPullRequestsForRepo(owner, repo);
          if (prResult.error) {
            setError(`Error fetching pull request data: ${prResult.error}`);
            setIsLoadingData(false); return;
          }
          prDataString = prResult.dataString;
          if (prDataString) sessionStorage.setItem(prCacheKey, prDataString);
        }

      } catch (e: any) {
        setError(`Failed to process repository data: ${e.message}`);
        setIsLoadingData(false);
        return;
      }
      setIsLoadingData(false);
      setLoadingStatus("");

      let combinedRelevantData = "";
      if (commitDataString && commitDataString.trim() !== "") {
        combinedRelevantData += `COMMITS:\n${commitDataString}\n\n`;
      }
      if (issuesDataString && issuesDataString.trim() !== "") {
        combinedRelevantData += `ISSUES:\n${issuesDataString}\n\n`;
      }
      if (prDataString && prDataString.trim() !== "") {
        combinedRelevantData += `PULL REQUESTS:\n${prDataString}\n`;
      }

      if (combinedRelevantData.trim() === "") {
        combinedRelevantData = "No specific data (commits, issues, or pull requests) could be retrieved for the repository. The AI will attempt to answer based on general knowledge if possible.";
      }
      
      setIsLoadingAI(true);
      try {
        const aiResult = await getAIResponse(repoUrl, query, combinedRelevantData);
        if (aiResult.error) {
          setError(`AI processing error: ${aiResult.error}`);
        } else {
          setAiResponse(aiResult.data || null);
          setTimeout(() => {
            resultCardRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (e: any) {
        setError(`Failed to get AI response: ${e.message}`);
      }
      setIsLoadingAI(false);
    });
  };

  const handleSuggestedQuestionClick = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
  };

  const isLoading = isLoadingData || isLoadingAI || isPending;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-5xl font-bold mb-2 text-primary">GitProse</h1>
        <p className="text-xl text-muted-foreground">
          Explore GitHub repositories with natural language. Ask about commits, issues, and PRs!
        </p>
      </header>

      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Github className="mr-2 h-6 w-6 text-primary" />
            Explore Repository
          </CardTitle>
          <CardDescription>
            Enter a public GitHub repository URL and ask about its history, issues, or pull requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="repoUrl" className="block text-sm font-medium mb-1">
                GitHub Repository URL
              </label>
              <Input
                id="repoUrl"
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  // Clear AI response and main error when URL changes
                  setAiResponse(null);
                  setError(null);
                }}
                placeholder="e.g., https://github.com/facebook/react or vercel/next.js"
                disabled={isLoading}
                className="text-base"
              />
            </div>

            {isLoadingSuggestions && (
              <div className="flex items-center text-sm text-muted-foreground py-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching suggestions...
              </div>
            )}

            {suggestionsError && !isLoadingSuggestions && (
               <Alert variant="default" className="my-4">
                 <MessageSquareQuote className="h-5 w-5" />
                 <AlertTitle>Suggestions</AlertTitle>
                 <AlertDescription>{suggestionsError}</AlertDescription>
               </Alert>
            )}

            {suggestedQuestions && suggestedQuestions.length > 0 && !isLoadingSuggestions && (
              <div className="py-2 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                  <MessageSquareQuote className="mr-2 h-4 w-4" />
                  Suggested Questions:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestionClick(q)}
                      disabled={isLoading}
                      className="text-xs h-auto whitespace-normal text-left"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
             {suggestedQuestions && suggestedQuestions.length === 0 && !isLoadingSuggestions && !suggestionsError && (
                <div className="py-2 text-sm text-muted-foreground">
                    <MessageSquareQuote className="inline mr-2 h-4 w-4" />
                    No specific suggestions found for this repository. Try asking a general question!
                </div>
            )}


            <div>
              <label htmlFor="query" className="block text-sm font-medium mb-1">
                Your Question
              </label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What were the major features added last month? Who fixed bug #123? What are the oldest open issues? Show me recent PRs."
                rows={4}
                disabled={isLoading}
                className="text-base"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-base py-3 px-6">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              {isLoadingData ? loadingStatus : isLoadingAI ? "Thinking..." : "Ask GitProse"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-8 shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-headline">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {aiResponse && (
        <Card ref={resultCardRef} className="shadow-xl border-accent">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">GitProse Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base whitespace-pre-wrap leading-relaxed">{aiResponse.answer}</p>
            {aiResponse.relevantLinks && aiResponse.relevantLinks.length > 0 && (
              <div>
                <h3 className="font-headline text-lg font-semibold mb-2">Relevant Links:</h3>
                <ul className="space-y-1 list-inside">
                  {aiResponse.relevantLinks.map((link, index) => (
                    <li key={index} className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-2 text-accent flex-shrink-0" />
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline break-all"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
             <CardDescription>AI-generated answer based on repository data (commits, issues, PRs).</CardDescription>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

    
