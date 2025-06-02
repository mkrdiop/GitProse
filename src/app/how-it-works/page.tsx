
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Github, HelpCircle, Lightbulb, Link as LinkIconLucide, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How GitProse Works',
  description: 'Learn how to use GitProse to explore GitHub repositories using natural language.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to GitProse
        </Link>

        <header className="mb-10 text-center">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary mb-3">
            How GitProse Works
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Unlock insights from GitHub repositories with the power of AI and natural language.
          </p>
        </header>

        <Card className="shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <HelpCircle className="mr-3 h-7 w-7 text-primary" />
              Understanding GitProse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base text-foreground">
            <p>
              GitProse is an intelligent application designed to help you explore and understand GitHub
              repositories quickly and efficiently. Instead of manually sifting through commits, issues,
              and pull requests, you can simply ask questions in plain English!
            </p>
          </CardContent>
        </Card>

        <section className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Github className="mr-2 h-6 w-6 text-accent" />
                  1. Connect to a Repository
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/90">
                <p>
                  Start by pasting the URL of any public GitHub repository into the input field.
                  GitProse can also recognize GitLab URLs, though full support for GitLab (beyond URL parsing) is
                  currently under development.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <Search className="mr-2 h-6 w-6 text-accent" />
                  2. Ask Your Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/90">
                <p>
                  Use the text area to type your questions in natural language. GitProse is designed
                  to understand queries about:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-1 pl-2">
                  <li><strong>Commits:</strong> "What were the major features added last month?", "Who made the most commits recently?", "Summarize recent commit activity."</li>
                  <li><strong>Issues:</strong> "What are the oldest open issues?", "Are there any critical bugs reported?", "Show me issues labeled 'documentation'."</li>
                  <li><strong>Pull Requests:</strong> "List recent pull requests.", "Who has pending PRs related to UI changes?", "What's the status of PR #42?"</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center">
                <Lightbulb className="mr-2 h-6 w-6 text-accent" />
                3. Get Smart Suggestions (for GitHub)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/90">
              <p>
                For GitHub repositories, as soon as you enter a valid URL, GitProse uses AI to
                suggest a few insightful questions you might want to ask. Click any suggestion
                to instantly populate the query box!
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center">
                <Brain className="mr-2 h-6 w-6 text-accent" />
                4. AI-Powered Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/90">
              <p>
                Behind the scenes, GitProse fetches relevant data (recent commits, open issues, and
                open pull requests) from the repository via the GitHub API. This data, along with your
                query, is then processed by Google's Gemini models through Genkit. The AI analyzes the
                information to provide you with a concise and relevant answer.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <MessageSquare className="mr-2 h-6 w-6 text-accent" />
                  5. Formatted Answers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/90">
                <p>
                  The AI's response is formatted in Markdown, making it easy to read. If the answer
                  has multiple parts or sections, they will be clearly structured with headings
                  and lists.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center">
                  <LinkIconLucide className="mr-2 h-6 w-6 text-accent" />
                  6. Relevant Links
                </CardTitle>
              </CardHeader>
              <CardContent className="text-foreground/90">
                <p>
                  Alongside the textual answer, GitProse provides direct links to the specific
                  commits, issues, or pull requests on GitHub that are relevant to your query,
                  allowing you to dive deeper if needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="shadow-xl mt-12 bg-primary/10 border-primary/30">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center text-primary">
              <HelpCircle className="mr-3 h-7 w-7" />
              Why Use GitProse?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base text-primary/90">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Save Time:</strong> Quickly get answers without manually searching through repository pages.</li>
              <li><strong>Easy Understanding:</strong> Understand complex repository activity through simple natural language queries.</li>
              <li><strong>Efficient Exploration:</strong> Discover trends, track progress, and identify key changes with ease.</li>
              <li><strong>Focused Insights:</strong> Get AI-curated information relevant to your specific questions.</li>
            </ul>
            <p className="pt-2">
              GitProse empowers developers, project managers, and anyone interested in a software project to
              interact with repository data more intuitively.
            </p>
          </CardContent>
        </Card>

        <footer className="text-center mt-12 py-6 border-t border-border">
          <p className="text-muted-foreground">
            Powered by Next.js, Genkit, Google Gemini, and the GitHub API.
          </p>
          <Link href="/" className="text-sm text-primary hover:underline mt-2 inline-block">
            Try GitProse Now
          </Link>
        </footer>
      </div>
    </div>
  );
}
