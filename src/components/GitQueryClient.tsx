"use client";

import React, { useState, useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchCommitsForRepo, getAIResponse } from "@/app/actions";
import { parseGitHubUrl, type ParsedGitHubUrl } from "@/lib/githubUtils";
import type { AnswerGithubQueryOutput } from "@/ai/flows/answer-github-query";
import { Github, Send, Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";

export default function GitQueryClient() {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<AnswerGithubQueryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCommits, setIsLoadingCommits] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const [isPending, startTransition] = useTransition();
  
  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setAiResponse(null);

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

      // 1. Fetch/Load commits
      setIsLoadingCommits(true);
      try {
        const cacheKey = `commits_${owner}_${repo}`;
        const cachedCommits = sessionStorage.getItem(cacheKey);

        if (cachedCommits) {
          commitDataString = cachedCommits;
        } else {
          const commitResult = await fetchCommitsForRepo(owner, repo);
          if (commitResult.error) {
            setError(`Error fetching commit data: ${commitResult.error}`);
            setIsLoadingCommits(false);
            return;
          }
          commitDataString = commitResult.commits;
          if (commitDataString) {
            sessionStorage.setItem(cacheKey, commitDataString);
          }
        }
      } catch (e: any) {
        setError(`Failed to process commit data: ${e.message}`);
        setIsLoadingCommits(false);
        return;
      }
      setIsLoadingCommits(false);

      if (!commitDataString) {
        // This case might occur if fetchCommitsForRepo returns successfully but with no commits string (e.g. empty repo)
        // or if caching logic had an issue. For now, proceed with empty relevantData.
        // setError("Could not retrieve commit data for context.");
        // return;
        commitDataString = "No commit data available or an error occurred fetching it.";
      }
      
      // 2. Get AI Response
      setIsLoadingAI(true);
      try {
        const aiResult = await getAIResponse(repoUrl, query, commitDataString);
        if (aiResult.error) {
          setError(`AI processing error: ${aiResult.error}`);
        } else {
          setAiResponse(aiResult.data || null);
          // Scroll to results after a short delay to allow DOM update
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

  const isLoading = isLoadingCommits || isLoadingAI || isPending;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-5xl font-bold mb-2 text-primary">GitQuery</h1>
        <p className="text-xl text-muted-foreground">
          Explore GitHub repositories with natural language.
        </p>
      </header>

      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <Github className="mr-2 h-6 w-6 text-primary" />
            Query Repository
          </CardTitle>
          <CardDescription>
            Enter a public GitHub repository URL and ask a question about its history.
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
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="e.g., https://github.com/facebook/react or vercel/next.js"
                disabled={isLoading}
                className="text-base"
              />
            </div>
            <div>
              <label htmlFor="query" className="block text-sm font-medium mb-1">
                Your Question
              </label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What were the major features added last month? or Who fixed bug #123?"
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
              {isLoadingCommits ? "Fetching commits..." : isLoadingAI ? "Thinking..." : "Ask GitQuery"}
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
             <CardDescription>AI-generated answer based on repository data.</CardDescription>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
