
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap, Users, Code, SearchCheck, History, Lightbulb } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GitProse Use Cases & Examples',
  description: 'Discover how GitProse can help you understand GitHub repositories with practical examples.',
};

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to GitProse
        </Link>

        <header className="mb-12 text-center">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary mb-4">
            GitProse Use Cases & Examples
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Unlock powerful insights from any public GitHub repository using natural language.
          </p>
        </header>

        <section className="space-y-10">
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center text-primary">
                <History className="mr-3 h-7 w-7" />
                Understanding Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90">
              <p>Quickly get up to speed with the latest developments in a repository.</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-base">
                <li>"Summarize the main changes in the last week."</li>
                <li>"What features were merged recently?"</li>
                <li>"Show me the latest 5 commit messages."</li>
                <li>"Who were the most active committers last month?"</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-accent/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center text-accent">
                <SearchCheck className="mr-3 h-7 w-7" />
                Tracking Issues & Bugs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90">
              <p>Monitor progress on issues, identify critical bugs, and see what needs attention.</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-base">
                <li>"Are there any open critical bugs?"</li>
                <li>"List issues related to 'performance' or labeled 'bug'."</li>
                <li>"Who is assigned to issue #123?"</li>
                <li>"What are the oldest unresolved issues?"</li>
                <li>"Show me issues created in the last 2 days."</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center text-primary">
                <Zap className="mr-3 h-7 w-7" />
                Reviewing Pull Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90">
              <p>Stay on top of code reviews and integration progress.</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-base">
                <li>"Show me open pull requests waiting for review."</li>
                <li>"What's the status of PR #56 by user 'dev_username'?"</li>
                <li>"List pull requests that include UI changes."</li>
                <li>"Which PRs were merged yesterday?"</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-accent/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center text-accent">
                <Users className="mr-3 h-7 w-7" />
                Onboarding New Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90">
              <p>Help new contributors quickly understand the project's current state and history.</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-base">
                <li>"What was the focus of development in the last sprint/month?"</li>
                <li>"Explain commit `[commit_sha]` that introduced the authentication module."</li>
                <li>"Are there any issues labeled 'good first issue' or 'help wanted'?"</li>
                <li>"Summarize recent architectural changes."</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center text-primary">
                <Code className="mr-3 h-7 w-7" />
                Codebase Exploration & Understanding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90">
              <p>Dive into specific changes and understand their impact.</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-base">
                <li>"Explain the functional impact of commit `[commit_sha]`."</li>
                <li>"What files were changed most in the last big feature update?"</li>
                <li>"Show commits related to 'refactoring' in the 'src/utils' directory."</li>
              </ul>
            </CardContent>
          </Card>
           <Card className="shadow-lg border-accent/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center text-accent">
                <Lightbulb className="mr-3 h-7 w-7" />
                Project Management & Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/90">
              <p>Get high-level insights into project health and progress.</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-base">
                <li>"How many issues were closed last month vs. opened?"</li>
                <li>"What's the current ratio of open to closed pull requests?"</li>
                <li>"Show me all PRs labeled 'needs-testing' or 'documentation'."</li>
                <li>"Provide a summary of unmerged branches older than 3 months." (More advanced, relies on data not currently fetched)</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Ready to try these out or ask your own questions?
          </p>
          <Button asChild size="lg">
            <Link href="/">
              Go to GitProse
            </Link>
          </Button>
        </div>

        <footer className="text-center mt-12 py-6 border-t border-border">
          <p className="text-muted-foreground">
            GitProse: Intelligent GitHub Repository Exploration.
          </p>
          <Link href="/how-it-works" className="text-sm text-primary hover:underline mt-2 inline-block">
            Learn How GitProse Works
          </Link>
        </footer>
      </div>
    </div>
  );
}
