import { CreateNewModTemplateKey } from '../webviewIPCMessages';

export type ModStudioStarter = {
  key: CreateNewModTemplateKey;
  title: string;
  description: string;
  highlights: string[];
};

export type AiPromptPack = {
  key: string;
  title: string;
  description: string;
  prompt: string;
};

export const modStudioStarters: ModStudioStarter[] = [
  {
    key: 'default',
    title: 'Standard starter',
    description: 'The existing Windhawk template for authors who already know the shape they want.',
    highlights: [
      'Classic metadata, readme, and settings blocks',
      'Good when you already know the hook strategy',
      'Fastest path to a minimal local mod',
    ],
  },
  {
    key: 'ai-ready',
    title: 'AI-ready starter',
    description: 'A template that adds prompt scaffolding, review notes, and a verification checklist for AI-assisted work.',
    highlights: [
      'Includes an AI collaboration brief in the readme',
      'Adds a human verification checklist before shipping',
      'Keeps the code sample compatible with the standard build flow',
    ],
  },
];

export const aiPromptPacks: AiPromptPack[] = [
  {
    key: 'ideate',
    title: 'Ideation prompt',
    description: 'Turn a rough idea into a scoped Windhawk mod concept.',
    prompt: `Help me design a Windhawk mod.
Target process:
User problem to solve:
Windows UI or API area involved:
Constraints:
- Prefer the smallest reliable hook surface.
- Avoid changing behavior outside the target scenario.
- Suggest optional settings only when they clearly help users.
Output:
1. Mod concept summary
2. Candidate hook points or APIs to inspect
3. Risks and failure modes
4. A minimal test plan`,
  },
  {
    key: 'scaffold',
    title: 'Scaffold prompt',
    description: 'Ask AI to write or revise a Windhawk mod while preserving the expected metadata blocks.',
    prompt: `Help me write a Windhawk mod in C++.
Goal:
Target process:
Known APIs or functions:
Requirements:
- Keep the Windhawk metadata, readme, and settings blocks valid.
- Explain why each hook target is appropriate.
- Keep logging in place for the first iteration.
- Avoid adding speculative code that cannot be justified from the goal.
Output:
1. Updated source code
2. Explanation of each hook
3. Manual verification steps`,
  },
  {
    key: 'review',
    title: 'Review prompt',
    description: 'Use AI as a reviewer for safety, regressions, and missing tests.',
    prompt: `Review this Windhawk mod like a cautious senior engineer.
Focus on:
- Crash risks
- Incorrect hook targets
- Missing error handling
- Unsafe assumptions about process lifetime or thread context
- User-facing regressions
- Missing manual tests
Output:
1. Findings ordered by severity
2. The most important tests to run before enabling the mod by default
3. Any metadata or readme changes that would reduce user confusion`,
  },
  {
    key: 'docs',
    title: 'Docs and changelog prompt',
    description: 'Generate a readme or release note update that stays grounded in actual behavior.',
    prompt: `Draft documentation for this Windhawk mod update.
Include:
- What changed
- Which processes are affected
- New settings or behavior changes
- Upgrade risks or compatibility notes
Avoid:
- Marketing language
- Claims that are not verified
- Hiding limitations or known edge cases
Output:
1. Readme update
2. Short changelog entry
3. Manual test notes for contributors`,
  },
];
