import {
  CreateNewModTemplateKey,
  EditorLaunchContext,
  EditorLaunchContextResource,
  ModSourceExtension,
} from '../webviewIPCMessages';

export type ModAuthoringLanguage = 'cpp' | 'python';

export type ModStudioStarter = {
  key: CreateNewModTemplateKey;
  title: string;
  description: string;
  highlights: string[];
  actionLabel: string;
  supportedAuthoringLanguages: ModAuthoringLanguage[];
  recommended?: boolean;
};

export type AiPromptPack = {
  key: string;
  title: string;
  description: string;
  prompt: string;
};

export type VisualStudioPreset = {
  key: string;
  title: string;
  description: string;
  templateKey: CreateNewModTemplateKey;
  recommendedLanguage: ModAuthoringLanguage;
};

export type CliPlaybook = {
  key: string;
  title: string;
  description: string;
  command: string;
};

export type StudioWorkflowRecipe = {
  key: string;
  title: string;
  description: string;
  supportedStudioModes: ('code' | 'visual')[];
  supportedAuthoringLanguages: ModAuthoringLanguage[];
  recommendedTemplateKey: CreateNewModTemplateKey;
  suggestedPlaybookKeys: CliPlaybook['key'][];
  suggestedPromptPackKeys: AiPromptPack['key'][];
  checklist: string[];
};

type StudioLaunchGuide = {
  checklist: string[];
  suggestedPlaybookKeys: CliPlaybook['key'][];
  suggestedPromptPackKeys: AiPromptPack['key'][];
};

export const modStudioStarters: ModStudioStarter[] = [
  {
    key: 'structured-core',
    title: 'Structured core starter',
    description: 'An architecture-first scaffold with explicit sections for settings, runtime state, diagnostics, hook setup, and lifecycle callbacks.',
    highlights: [
      'Separates configuration, helpers, and hook setup from the start',
      'Starts in a dry-run shape so you can inspect the target before adding hooks',
      'Best default when you want a mod that stays readable as it grows',
    ],
    actionLabel: 'Use structured core starter',
    supportedAuthoringLanguages: ['cpp'],
    recommended: true,
  },
  {
    key: 'default',
    title: 'Standard starter',
    description: 'The classic Windhawk sample with a working hook example for authors who want a direct, minimal path.',
    highlights: [
      'Now organized into clearer settings, hook, and lifecycle sections',
      'Good when you already know the hook strategy',
      'Fastest path to a working sample with real behavior',
    ],
    actionLabel: 'Use standard starter',
    supportedAuthoringLanguages: ['cpp'],
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
    actionLabel: 'Use AI-ready starter',
    supportedAuthoringLanguages: ['cpp'],
  },
  {
    key: 'explorer-shell',
    title: 'Explorer shell starter',
    description: 'A Windows shell-focused scaffold for taskbar, tray, Start menu, or notification surface experiments.',
    highlights: [
      'Targets explorer.exe and common shell hosts',
      'Adds scope notes for taskbar, Start, and tray work',
      'Keeps the code minimal so you can choose the actual hook path',
    ],
    actionLabel: 'Use Explorer shell starter',
    supportedAuthoringLanguages: ['cpp'],
  },
  {
    key: 'chromium-browser',
    title: 'Chromium browser starter',
    description: 'A browser-focused scaffold for Chrome-family window chrome, tab strip, shortcut, and UI-behavior experiments.',
    highlights: [
      'Starts with chrome.exe so Chrome-related mods are first-class in the create flow',
      'Logs browser process and foreground window details before you choose a hook',
      'Good for Chrome, Chromium, and other browser-family UI investigations',
    ],
    actionLabel: 'Use Chromium browser starter',
    supportedAuthoringLanguages: ['cpp'],
  },
  {
    key: 'window-behavior',
    title: 'Window behavior starter',
    description: 'A focused app-window scaffold for mods that change captions, sizing, visibility, styles, or placement.',
    highlights: [
      'Starts with a single-app target for safer iteration',
      'Includes helpers for deciding which windows to affect',
      'Good for ShowWindow, SetWindowPos, and style-related experiments',
    ],
    actionLabel: 'Use window behavior starter',
    supportedAuthoringLanguages: ['cpp'],
  },
  {
    key: 'settings-lab',
    title: 'Settings lab starter',
    description: 'A configuration-first scaffold for mods where settings design, defaults, and rollout safety come before hooks.',
    highlights: [
      'Shows nested settings and live reload structure',
      'Useful when you want to prototype config shape before hook work',
      'Good for feature flags, intensity values, and staged rollouts',
    ],
    actionLabel: 'Use settings lab starter',
    supportedAuthoringLanguages: ['cpp'],
  },
  {
    key: 'python-automation',
    title: 'Python automation starter',
    description: 'A Python-authored scaffold that renders to .wh.cpp and ships with mouse and keyboard automation helpers.',
    highlights: [
      'Authors a mod in .wh.py while keeping generated .wh.cpp compatibility',
      'Includes SendInput-backed mouse and keyboard helpers out of the box',
      'Best fit for fast experimentation, automation ideas, and visual builder flows',
    ],
    actionLabel: 'Use Python automation starter',
    supportedAuthoringLanguages: ['python'],
  },
];

export function getModStudioStartersForAuthoringLanguage(
  authoringLanguage: ModAuthoringLanguage
) {
  return modStudioStarters.filter((starter) =>
    starter.supportedAuthoringLanguages.includes(authoringLanguage)
  );
}

export function getVisualStudioPresetsForAuthoringLanguage(
  authoringLanguage: ModAuthoringLanguage
) {
  const availableTemplateKeys = new Set(
    getModStudioStartersForAuthoringLanguage(authoringLanguage).map(
      (starter) => starter.key
    )
  );

  return visualStudioPresets.filter((preset) =>
    availableTemplateKeys.has(preset.templateKey)
  );
}

export function getModSourceExtensionForAuthoringLanguage(
  authoringLanguage: ModAuthoringLanguage
): ModSourceExtension {
  return authoringLanguage === 'python' ? '.wh.py' : '.wh.cpp';
}

export const visualStudioPresets: VisualStudioPreset[] = [
  {
    key: 'visual-automation',
    title: 'Automation lab',
    description: 'Start from mouse and keyboard automation with editable coordinates, shortcuts, and logging.',
    templateKey: 'python-automation',
    recommendedLanguage: 'python',
  },
  {
    key: 'visual-shell',
    title: 'Shell surfaces',
    description: 'Use an Explorer-focused starter for taskbar, Start, tray, and shell investigations.',
    templateKey: 'explorer-shell',
    recommendedLanguage: 'cpp',
  },
  {
    key: 'visual-windows',
    title: 'Window behavior',
    description: 'Focus on captions, sizing, visibility, and placement without starting from a blank file.',
    templateKey: 'window-behavior',
    recommendedLanguage: 'cpp',
  },
  {
    key: 'visual-settings',
    title: 'Settings-first mod',
    description: 'Sketch the config model visually first, then layer in hooks after the behavior is clear.',
    templateKey: 'settings-lab',
    recommendedLanguage: 'cpp',
  },
];

export const cliPlaybooks: CliPlaybook[] = [
  {
    key: 'detect-runtime',
    title: 'Detect runtime',
    description: 'Confirm which Windhawk runtime and storage layout the Copilot helper will target.',
    command: 'python scripts\\windhawk_tool.py --json detect',
  },
  {
    key: 'status',
    title: 'Inspect status',
    description: 'List runtime details, source mods, and installed mod state before editing or compiling.',
    command: 'python scripts\\windhawk_tool.py --json status',
  },
  {
    key: 'launch-tray',
    title: 'Launch in tray mode',
    description: 'Bring Windhawk back up quietly when you want the runtime active without opening the main window.',
    command: 'python scripts\\windhawk_tool.py launch --tray-only',
  },
  {
    key: 'init-mod',
    title: 'Create scratch mod',
    description: 'Generate a new mod source and sync it into the editor workspace in one step.',
    command:
      'python scripts\\windhawk_tool.py init-mod --mod-id scratch-mod --name "Scratch Mod" --include explorer.exe --sync-workspace',
  },
  {
    key: 'compile-restart',
    title: 'Compile and restart',
    description: 'Compile the current workspace mod with the Windhawk toolchain contract and restart the runtime.',
    command:
      'python scripts\\windhawk_tool.py compile --mod-id scratch-mod --from-workspace --restart',
  },
  {
    key: 'tail-logs',
    title: 'Tail latest logs',
    description: 'Read the newest Windhawk UI log session after a compile, restart, or runtime regression.',
    command: 'python scripts\\windhawk_tool.py logs --kind main --lines 120',
  },
];

export const studioWorkflowRecipes: StudioWorkflowRecipe[] = [
  {
    key: 'shell-investigation',
    title: 'Shell investigation sprint',
    description:
      'Best for taskbar, tray, Start menu, or notification work where you want a visible shell-surface checklist before choosing hooks.',
    supportedStudioModes: ['code', 'visual'],
    supportedAuthoringLanguages: ['cpp'],
    recommendedTemplateKey: 'explorer-shell',
    suggestedPlaybookKeys: [
      'detect-runtime',
      'status',
      'compile-restart',
      'tail-logs',
    ],
    suggestedPromptPackKeys: ['ideate', 'review'],
    checklist: [
      'Confirm the active shell host processes before writing any hook code.',
      'Keep the first compile disabled or tightly scoped until the target surface is verified.',
      'Review adjacent shell flows so a taskbar or tray change does not spill into unrelated Windows surfaces.',
    ],
  },
  {
    key: 'browser-ui-lab',
    title: 'Browser UI lab',
    description:
      'Use this when the draft targets Chrome-family chrome, tabs, shortcuts, or other browser-hosted UI surfaces.',
    supportedStudioModes: ['code'],
    supportedAuthoringLanguages: ['cpp'],
    recommendedTemplateKey: 'chromium-browser',
    suggestedPlaybookKeys: ['status', 'init-mod', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['browser-ui', 'review'],
    checklist: [
      'Verify that the issue belongs to browser chrome rather than content rendering.',
      'Capture the weakest assumption in the current hook idea before compiling.',
      'Use logging on the first run so UI regressions are easier to localize.',
    ],
  },
  {
    key: 'automation-prototype',
    title: 'Automation prototype',
    description:
      'Fastest path for keyboard, mouse, or repeatable workflow experiments where Python authoring lowers the iteration cost.',
    supportedStudioModes: ['code', 'visual'],
    supportedAuthoringLanguages: ['python'],
    recommendedTemplateKey: 'python-automation',
    suggestedPlaybookKeys: ['status', 'launch-tray', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['ideate', 'docs'],
    checklist: [
      'Start with a narrow scenario and explicit timing assumptions.',
      'Keep the first script observable so failed automation steps are easy to inspect.',
      'Document shortcuts, coordinates, and foreground-window expectations before sharing the draft.',
    ],
  },
  {
    key: 'window-behavior-audit',
    title: 'Window behavior audit',
    description:
      'Focuses on captions, visibility, placement, and sizing changes where scoping the affected windows matters more than raw hook volume.',
    supportedStudioModes: ['code', 'visual'],
    supportedAuthoringLanguages: ['cpp'],
    recommendedTemplateKey: 'window-behavior',
    suggestedPlaybookKeys: [
      'detect-runtime',
      'status',
      'compile-restart',
      'tail-logs',
    ],
    suggestedPromptPackKeys: ['scaffold', 'review'],
    checklist: [
      'List which windows should stay unchanged before you touch styles or placement.',
      'Start with a single-app or narrow target so failures are easy to unwind.',
      'Check restore, minimize, and multi-monitor behavior in the first manual run.',
    ],
  },
  {
    key: 'settings-rollout',
    title: 'Settings-first rollout',
    description:
      'Use this when the risk is mostly in configuration shape, staged rollout, or live setting updates rather than the initial hook itself.',
    supportedStudioModes: ['code', 'visual'],
    supportedAuthoringLanguages: ['cpp'],
    recommendedTemplateKey: 'settings-lab',
    suggestedPlaybookKeys: ['status', 'init-mod', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['structure-plan', 'docs'],
    checklist: [
      'Decide which settings need safe defaults before adding any behavior.',
      'Design the readme and upgrade notes alongside the config model.',
      'Treat live reload and fallback behavior as part of the first implementation, not follow-up polish.',
    ],
  },
];

const starterLaunchGuides: Partial<
  Record<CreateNewModTemplateKey, StudioLaunchGuide>
> = {
  'structured-core': {
    checklist: [
      'Name the first runtime state, helper, and hook sections before adding more logic.',
      'Keep the first compile narrow enough that you can explain every section in one review pass.',
      'Use the structure prompt or review prompt once the first scaffold lands.',
    ],
    suggestedPlaybookKeys: ['detect-runtime', 'status', 'compile-restart'],
    suggestedPromptPackKeys: ['structure-plan', 'review'],
  },
  default: {
    checklist: [
      'Verify the intended hook target before expanding the sample beyond the default path.',
      'Turn logging on if the first run touches more than one visible user flow.',
      'Write down the smallest manual smoke test before the next edit.',
    ],
    suggestedPlaybookKeys: ['status', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['scaffold', 'review'],
  },
  'ai-ready': {
    checklist: [
      'Keep the AI prompt trail grounded in actual target processes and observed behavior.',
      'Use the review prompt before trusting the first clean compile.',
      'Refresh the docs or changelog packet as soon as the behavior stabilizes.',
    ],
    suggestedPlaybookKeys: ['status', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['ideate', 'review', 'docs'],
  },
  'explorer-shell': {
    checklist: [
      'Confirm the active shell surface before writing the first hook.',
      'Compile disabled or with logging if the taskbar, Start, or tray are all in scope.',
      'Check an adjacent shell flow that should stay unchanged.',
    ],
    suggestedPlaybookKeys: ['detect-runtime', 'status', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['ideate', 'review'],
  },
  'chromium-browser': {
    checklist: [
      'Make sure the issue belongs to browser chrome rather than page content.',
      'Name the least certain UI assumption before the first compile.',
      'Capture the first log evidence after launch so browser regressions are easier to localize.',
    ],
    suggestedPlaybookKeys: ['status', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['browser-ui', 'review'],
  },
  'window-behavior': {
    checklist: [
      'List which windows must stay untouched before changing styles or placement.',
      'Start with one app or one window class where possible.',
      'Check restore, minimize, and multi-monitor behavior in the first pass.',
    ],
    suggestedPlaybookKeys: ['detect-runtime', 'status', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['scaffold', 'review'],
  },
  'settings-lab': {
    checklist: [
      'Decide safe defaults before adding runtime behavior.',
      'Treat live-reload and rollback behavior as part of the first implementation.',
      'Draft the readme delta alongside the settings model instead of after it.',
    ],
    suggestedPlaybookKeys: ['status', 'init-mod', 'compile-restart'],
    suggestedPromptPackKeys: ['structure-plan', 'docs'],
  },
  'python-automation': {
    checklist: [
      'Keep the first automation scenario narrow and observable.',
      'Write down timing, focus, and input assumptions before sharing the draft.',
      'Use logs or visible markers so failures are easy to replay.',
    ],
    suggestedPlaybookKeys: ['status', 'launch-tray', 'compile-restart', 'tail-logs'],
    suggestedPromptPackKeys: ['ideate', 'docs'],
  },
};

export function getStudioWorkflowRecipes(
  authoringLanguage: ModAuthoringLanguage,
  studioMode: 'code' | 'visual'
) {
  return studioWorkflowRecipes.filter(
    (recipe) =>
      recipe.supportedAuthoringLanguages.includes(authoringLanguage) &&
      recipe.supportedStudioModes.includes(studioMode)
  );
}

function getCliPlaybooksByKeys(keys: CliPlaybook['key'][]): CliPlaybook[] {
  return cliPlaybooks.filter((playbook) => keys.includes(playbook.key));
}

function getAiPromptPacksByKeys(keys: AiPromptPack['key'][]): AiPromptPack[] {
  return aiPromptPacks.filter((promptPack) => keys.includes(promptPack.key));
}

function toLaunchResources<T extends { key: string; title: string; command?: string }>(
  items: T[]
): EditorLaunchContextResource[] {
  return items.map((item) => ({
    key: item.key,
    title: item.title,
    command: item.command,
  }));
}

function buildStudioLaunchPacket({
  title,
  summary,
  starterTitle,
  authoringLanguage,
  studioMode,
  checklist,
  playbooks,
  prompts,
}: {
  title: string;
  summary: string;
  starterTitle: string;
  authoringLanguage: ModAuthoringLanguage;
  studioMode: 'code' | 'visual';
  checklist: string[];
  playbooks: CliPlaybook[];
  prompts: AiPromptPack[];
}) {
  return [
    `Launch: ${title}`,
    '',
    summary,
    '',
    `Studio mode: ${studioMode}`,
    `Authoring language: ${authoringLanguage}`,
    `Starter: ${starterTitle}`,
    '',
    'Checklist:',
    ...checklist.map((item, index) => `${index + 1}. ${item}`),
    '',
    'CLI playbooks:',
    ...playbooks.map((playbook) => `- ${playbook.title}: ${playbook.command}`),
    '',
    'Prompt packs:',
    ...prompts.map((promptPack) => `- ${promptPack.title}`),
  ].join('\n');
}

export function buildStudioWorkflowPacket(recipe: StudioWorkflowRecipe) {
  const starter = modStudioStarters.find(
    (candidate) => candidate.key === recipe.recommendedTemplateKey
  );
  const playbooks = getCliPlaybooksByKeys(recipe.suggestedPlaybookKeys);
  const prompts = getAiPromptPacksByKeys(recipe.suggestedPromptPackKeys);

  return buildStudioLaunchPacket({
    title: recipe.title,
    summary: recipe.description,
    starterTitle: starter?.title || recipe.recommendedTemplateKey,
    authoringLanguage: recipe.supportedAuthoringLanguages[0] || 'cpp',
    studioMode: recipe.supportedStudioModes[0] || 'code',
    checklist: recipe.checklist,
    playbooks,
    prompts,
  });
}

export function buildStarterLaunchContext(
  starter: ModStudioStarter,
  authoringLanguage: ModAuthoringLanguage,
  studioMode: 'code' | 'visual'
): EditorLaunchContext {
  const guide = starterLaunchGuides[starter.key] || {
    checklist: starter.highlights,
    suggestedPlaybookKeys: ['status', 'compile-restart'],
    suggestedPromptPackKeys: ['review'],
  };
  const playbooks = getCliPlaybooksByKeys(guide.suggestedPlaybookKeys);
  const prompts = getAiPromptPacksByKeys(guide.suggestedPromptPackKeys);

  return {
    kind: 'starter',
    title: starter.title,
    summary: starter.description,
    templateKey: starter.key,
    studioMode,
    authoringLanguage,
    checklist: guide.checklist,
    tools: toLaunchResources(playbooks),
    prompts: toLaunchResources(prompts),
    packet: buildStudioLaunchPacket({
      title: starter.title,
      summary: starter.description,
      starterTitle: starter.title,
      authoringLanguage,
      studioMode,
      checklist: guide.checklist,
      playbooks,
      prompts,
    }),
  };
}

export function buildVisualPresetLaunchContext(
  preset: VisualStudioPreset,
  authoringLanguage: ModAuthoringLanguage
): EditorLaunchContext {
  const starter = modStudioStarters.find(
    (candidate) => candidate.key === preset.templateKey
  );
  const starterContext = buildStarterLaunchContext(
    starter || {
      key: preset.templateKey,
      title: preset.title,
      description: preset.description,
      highlights: [],
      actionLabel: preset.title,
      supportedAuthoringLanguages: [authoringLanguage],
    },
    authoringLanguage,
    'visual'
  );

  return {
    ...starterContext,
    kind: 'visual-preset',
    title: preset.title,
    summary: preset.description,
    studioMode: 'visual',
    packet: buildStudioLaunchPacket({
      title: preset.title,
      summary: preset.description,
      starterTitle: starter?.title || preset.templateKey,
      authoringLanguage,
      studioMode: 'visual',
      checklist: starterContext.checklist || [],
      playbooks: (starterContext.tools || [])
        .map((tool) => cliPlaybooks.find((candidate) => candidate.key === tool.key))
        .filter((tool): tool is CliPlaybook => !!tool),
      prompts: (starterContext.prompts || [])
        .map((prompt) =>
          aiPromptPacks.find((candidate) => candidate.key === prompt.key)
        )
        .filter((prompt): prompt is AiPromptPack => !!prompt),
    }),
  };
}

export function buildWorkflowLaunchContext(
  recipe: StudioWorkflowRecipe,
  authoringLanguage: ModAuthoringLanguage,
  studioMode: 'code' | 'visual'
): EditorLaunchContext {
  const playbooks = getCliPlaybooksByKeys(recipe.suggestedPlaybookKeys);
  const prompts = getAiPromptPacksByKeys(recipe.suggestedPromptPackKeys);

  return {
    kind: 'workflow',
    title: recipe.title,
    summary: recipe.description,
    templateKey: recipe.recommendedTemplateKey,
    studioMode,
    authoringLanguage,
    checklist: recipe.checklist,
    tools: toLaunchResources(playbooks),
    prompts: toLaunchResources(prompts),
    packet: buildStudioLaunchPacket({
      title: recipe.title,
      summary: recipe.description,
      starterTitle:
        modStudioStarters.find(
          (candidate) => candidate.key === recipe.recommendedTemplateKey
        )?.title || recipe.recommendedTemplateKey,
      authoringLanguage,
      studioMode,
      checklist: recipe.checklist,
      playbooks,
      prompts,
    }),
  };
}

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
    key: 'structure-plan',
    title: 'Structure prompt',
    description: 'Ask AI to refactor or extend a mod without turning it into an unstructured blob.',
    prompt: `Help me improve the structure of this Windhawk mod.
Goal:
Target process:
What already works:
What feels messy:
Constraints:
- Keep the metadata, readme, and settings blocks valid.
- Split the code into settings, runtime state, helpers, hook setup, and lifecycle callbacks.
- Prefer small named helpers over one long Wh_ModInit body.
- Preserve behavior unless I explicitly ask to change it.
Output:
1. Proposed section layout
2. Refactored source code
3. Why each section exists
4. Follow-up cleanup suggestions`,
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
    key: 'browser-ui',
    title: 'Browser UI prompt',
    description: 'Scope a Chrome or Chromium-related mod before choosing a fragile browser-specific hook.',
    prompt: `Help me design a Windhawk mod for a Chromium-based browser.
Browser process:
User problem to solve:
Window or browser UI surface involved:
Known candidate APIs, classes, or messages:
Constraints:
- Prefer the smallest reliable Win32 or browser-hosted surface.
- Avoid widening the scope beyond the browser chrome until the first run is proven.
- Call out what should stay unchanged in adjacent browser flows.
Output:
1. Candidate APIs, messages, or UI surfaces to inspect
2. The weakest assumption in the current idea
3. A low-risk first compile profile
4. A manual validation loop for Chrome-family behavior`,
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
