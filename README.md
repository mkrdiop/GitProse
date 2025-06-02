# GitProse

GitProse is an intelligent application that allows you to explore and understand GitHub repositories using natural language. Ask questions about commits, issues, and pull requests, and get insightful answers powered by AI.

## Features

*   **Natural Language Queries**: Ask questions about a repository's history, open issues, or pull requests in plain English.
*   **AI-Powered Answers**: Leverages Google's Gemini models via Genkit to provide concise and relevant answers.
*   **Contextual Data Fetching**: Retrieves relevant data (commits, issues, PRs) from the GitHub API to inform AI responses.
*   **Relevant Links**: Provides direct links to the source commits, issues, or PRs on GitHub.
*   **Modern UI**: Built with Next.js, React, ShadCN UI, and Tailwind CSS for a clean and responsive user experience.

## Tech Stack

*   **Frontend**: Next.js (App Router), React, TypeScript
*   **Styling**: Tailwind CSS, ShadCN UI
*   **AI Integration**: Genkit, Google Gemini
*   **API Interaction**: GitHub API

## Getting Started

Follow these instructions to get GitProse running on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 20 or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   A Google Cloud project with the "AI Platform" (Vertex AI) API or "Generative Language API" enabled, and an API key for accessing Gemini models.

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

GitProse uses Genkit with the Google AI plugin, which requires a Google API key for authentication.

1.  Create a `.env.local` file in the root of the project. If you are using Firebase Studio, you might need to configure this through its environment variable settings. For local development:
    ```bash
    touch .env.local
    ```

2.  Add your Google API key to the `.env.local` file:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    ```
    Replace `your_google_api_key_here` with your actual API key. You can obtain this from your Google Cloud Console.

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

1.  The user enters a GitHub repository URL and a natural language question into the GitProse UI.
2.  The Next.js frontend fetches recent commit data, open issues, and open pull requests from the specified repository using the GitHub API.
3.  This contextual data, along with the user's query and repository URL, is sent to a Genkit flow.
4.  The Genkit flow, utilizing a Google Gemini model, processes the information and generates a textual answer and a list of relevant GitHub links.
5.  The answer is displayed back to the user in the UI.

---

Happy querying with GitProse!
