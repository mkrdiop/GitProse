# **App Name**: GitQuery

## Core Features:

- GitHub Connection: Connect to GitHub repository via OAuth.
- Natural Language Query Processing: Process natural language queries about the repository history using LLM with a tool to include relevant data from the Github API.
- Result Display: Display the generated answer, including links to the relevant source on GitHub.
- Local Data Caching: Cache GitHub data (commits, issues) temporarily in the browser storage, for faster query processing within a single session. Do not persist after the user closes their browser tab.

## Style Guidelines:

- Primary color: HSL(220, 70%, 50%) which translates to a medium-dark shade of blue, providing a professional and trustworthy feel. Hex: #3D84A8
- Background color: HSL(220, 20%, 95%) which translates to a very light, desaturated blue to provide a subtle and clean backdrop. Hex: #F0F4F7
- Accent color: HSL(190, 60%, 55%) which translates to a contrasting teal to highlight interactive elements. Hex: #49B6AD
- Headline font: 'Space Grotesk' sans-serif. Body font: 'Inter' sans-serif. This combination offers a balance of technical feel and readability.
- Use simple, line-based icons to represent actions and data types.
- Clean and well-spaced layout with a focus on readability and clear information hierarchy.
- Subtle animations to provide feedback on user interactions, such as loading indicators or transitions between states.