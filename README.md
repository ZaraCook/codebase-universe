# Codebase Universe

Codebase Universe transforms a GitHub repository into an interactive 3D galaxy.

- Files and folders are rendered as 3D nodes.
- Parent-child relationships are rendered as edges.
- Clicking a file node loads file metadata and content from GitHub.
- Branches can be switched from the control bar.

## Tech Stack

- React + TypeScript + Vite
- Three.js via React Three Fiber
- Drei helpers for controls, stars, and lines
- Framer Motion for UI transitions
- GitHub REST API (repository metadata, branches, tree, file content)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file from the example:

```bash
cp .env.example .env
```

3. Add your GitHub token to `.env`:

```env
VITE_GITHUB_TOKEN=your_token_here
```

The token is optional, but strongly recommended to avoid low unauthenticated API limits.

4. Start the app:

```bash
npm run dev
```

## Connect To An Actual GitHub Repository

From the app UI:

1. Paste a repository URL in the Repository URL field.
2. Click Load Galaxy.
3. Switch branches from the Branch dropdown.

Example test repository:

https://github.com/ZaraCook/test-jira.git

The app already defaults to that URL on startup.

## Where To Put The GitHub API Token

Put it in the root `.env` file as:

```env
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx
```

Notes:

- Never commit real tokens.
- `.gitignore` already excludes `.env` and `.env.*`.
- `.env.example` is committed as a safe template.

## Testing

Build and type-check:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Architecture

- Data layer: `src/data/github.ts`
- Transformation layer: `src/data/graph.ts`
- 3D rendering layer:
  - `src/components/scene/GalaxyScene.tsx`
  - `src/components/scene/RepoNode.tsx`
  - `src/components/scene/RepoConnections.tsx`
  - `src/components/scene/StarsBackground.tsx`
- UI layer:
  - `src/components/ui/ControlBar.tsx`
  - `src/components/ui/RepoStatus.tsx`
  - `src/components/ui/FilePanel.tsx`
- Controller: `src/App.tsx`
