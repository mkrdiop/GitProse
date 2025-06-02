# GitProse

GitProse is an intelligent application that allows you to explore and understand GitHub repositories using natural language. Ask questions about commits, issues, and pull requests, and get insightful answers powered by AI.

## Features

*   **Natural Language Queries**: Ask questions about a repository's history, open issues, or pull requests in plain English.
*   **AI-Powered Answers**: Leverages Google's Gemini models via Genkit to provide concise and relevant answers.
*   **Contextual Data Fetching**: Retrieves relevant data (commits, issues, PRs) from the GitHub API to inform AI responses.
*   **Relevant Links**: Provides direct links to the source commits, issues, or PRs on GitHub.
*   **Suggested Questions**: Automatically suggests insightful questions to ask about a repository.
*   **Markdown Formatted Answers**: Presents AI responses in a readable, structured Markdown format.
*   **Modern UI**: Built with Next.js, React, ShadCN UI, and Tailwind CSS for a clean and responsive user experience.

## Tech Stack

*   **Frontend**: Next.js (App Router), React, TypeScript
*   **Styling**: Tailwind CSS, ShadCN UI, `@tailwindcss/typography`
*   **AI Integration**: Genkit, Google Gemini
*   **API Interaction**: GitHub API
*   **Markdown Rendering**: `react-markdown`

## Getting Started

Follow these instructions to get GitProse running on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 20 or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   A Google Cloud project with the "AI Platform" (Vertex AI) API or "Generative Language API" enabled, and an API key for accessing Gemini models.
*   A GitHub account (for generating a Personal Access Token to avoid API rate limits).

### Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

GitProse uses Genkit with the Google AI plugin, which requires a Google API key. It also uses the GitHub API, which benefits greatly from a Personal Access Token (PAT) to avoid rate limits.

1.  Create a `.env.local` file in the root of the project. If you are using Firebase Studio, you might need to configure this through its environment variable settings. For local development:
    ```bash
    touch .env.local
    ```

2.  Add your Google API key and GitHub PAT to the `.env.local` file:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    GITHUB_PAT=your_github_personal_access_token_here
    ```
    *   Replace `your_google_api_key_here` with your actual Google API key. You can obtain this from your Google Cloud Console.
    *   Replace `your_github_personal_access_token_here` with your GitHub Personal Access Token.
        *   **How to create a GitHub PAT**:
            1.  Go to your GitHub [Settings](https://github.com/settings/profile) > [Developer settings](https://github.com/settings/developers) > [Personal access tokens](https://github.com/settings/tokens) > **Tokens (classic)**.
            2.  Click "Generate new token" (select "Generate new token (classic)").
            3.  Give your token a descriptive name (e.g., "GitProse App").
            4.  Set an expiration period.
            5.  Under "Select scopes", check the `public_repo` scope (this allows access to public repository data).
            6.  Click "Generate token".
            7.  **Copy the token immediately.** You won't be able to see it again.
        *   Store this token securely in your `.env.local` file for local development, or as a secret environment variable in your deployment environment.

### Running Locally

You need to run two separate processes for GitProse: the Next.js frontend and the Genkit development server.

1.  **Start the Genkit development server:**
    Open a terminal and run:
    ```bash
    npm run genkit:dev
    ```
    Or, for watching changes in your Genkit flows:
    ```bash
    npm run genkit:watch
    ```
    This server typically runs on `http://localhost:3400` by default and handles the AI flow executions.

2.  **Start the Next.js development server:**
    Open another terminal and run:
    ```bash
    npm run dev
    ```
    This will start the Next.js application, usually on `http://localhost:9002` (as configured in `package.json`).

Once both servers are running, you can access GitProse in your browser at `http://localhost:9002`.

## How It Works

1.  The user enters a GitHub repository URL (GitLab URLs are recognized but not fully supported yet) and a natural language question into the GitProse UI.
2.  If a GitHub URL is provided, the app may suggest relevant questions based on the repository.
3.  The Next.js frontend fetches recent commit data, open issues, and open pull requests from the specified repository using the GitHub API (authenticating with a PAT if provided).
4.  This contextual data, along with the user's query and repository URL, is sent to a Genkit flow.
5.  The Genkit flow, utilizing a Google Gemini model, processes the information and generates a textual answer (formatted in Markdown) and a list of relevant GitHub links.
6.  The answer is displayed back to the user in the UI, with Markdown styling applied.

---

Happy querying with GitProse!
