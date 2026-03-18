import { CompileRecommendationMode } from '../appUISettings';
import { ModMetadata } from '../webviewIPCMessages';

function normalizeProcessName(process: string): string {
  return process.includes('\\')
    ? process.substring(process.lastIndexOf('\\') + 1)
    : process;
}

export function summarizeTargetProcesses(include?: string[]): string {
  const targets = (include || []).filter(Boolean);
  if (!targets.length) {
    return 'Not declared yet';
  }

  if (targets.some((target) => target === '*' || target.includes('?') || target.includes('*'))) {
    return 'All processes';
  }

  const normalizedTargets = Array.from(
    new Set(targets.map((target) => normalizeProcessName(target)))
  );

  if (normalizedTargets.length <= 3) {
    return normalizedTargets.join(', ');
  }

  return `${normalizedTargets[0]} + ${normalizedTargets.length - 1} more`;
}

export type EditorPromptKind =
  | 'scaffold'
  | 'review'
  | 'docs'
  | 'explain-scope'
  | 'explain-api'
  | 'explain-terms'
  | 'usage-examples'
  | 'test-plan'
  | 'release-notes'
  | 'challenge-assumptions'
  | 'counterexample-hunt'
  | 'best-practices'
  | 'compile-recovery';

export type EditorEvidenceTone = 'positive' | 'neutral' | 'caution';
export type EditorCompileProfileKey =
  | 'current'
  | 'disabled'
  | 'logging'
  | 'disabled-logging';

export type EditorSessionState = {
  modWasModified: boolean;
  isModCompiled: boolean;
  isModDisabled: boolean;
  isLoggingEnabled: boolean;
  compilationFailed: boolean;
};

export type EditorEvidenceCard = {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone: EditorEvidenceTone;
};

export type EditorIterationStep = {
  key: string;
  title: string;
  body: string;
};

export type EditorVerificationItem = {
  key: string;
  title: string;
  detail: string;
};

export type EditorProvocation = {
  key: string;
  title: string;
  body: string;
};

export type EditorWindowsAction = {
  key: string;
  title: string;
  description: string;
  uri: string;
};

const DEFAULT_EDITOR_SESSION_STATE: EditorSessionState = {
  modWasModified: false,
  isModCompiled: false,
  isModDisabled: false,
  isLoggingEnabled: false,
  compilationFailed: false,
};

const WINDOWS_ACTIONS: Record<string, EditorWindowsAction> = {
  'windows-update': {
    key: 'windows-update',
    title: 'Windows Update',
    description: 'Check the active system build before blaming a draft for shell regressions.',
    uri: 'ms-settings:windowsupdate',
  },
  taskbar: {
    key: 'taskbar',
    title: 'Taskbar settings',
    description: 'Compare native taskbar behavior with the modded shell surface.',
    uri: 'ms-settings:personalization-taskbar',
  },
  start: {
    key: 'start',
    title: 'Start settings',
    description: 'Inspect Start menu layout and defaults before changing shell expectations.',
    uri: 'ms-settings:personalization-start',
  },
  notifications: {
    key: 'notifications',
    title: 'Notifications',
    description: 'Check banners, badges, and notification center behavior against the edited flow.',
    uri: 'ms-settings:notifications',
  },
  sound: {
    key: 'sound',
    title: 'Sound settings',
    description: 'Open baseline audio controls for mods that affect devices, volume, or media surfaces.',
    uri: 'ms-settings:sound',
  },
  'apps-volume': {
    key: 'apps-volume',
    title: 'App volume mixer',
    description: 'Validate per-app routing and volume levels when the mod touches media behavior.',
    uri: 'ms-settings:apps-volume',
  },
  multitasking: {
    key: 'multitasking',
    title: 'Multitasking',
    description: 'Review snap and Alt+Tab defaults before iterating on window-management hooks.',
    uri: 'ms-settings:multitasking',
  },
  colors: {
    key: 'colors',
    title: 'Colors',
    description: 'Check transparency, accent, and theme state against visual shell changes.',
    uri: 'ms-settings:colors',
  },
  typing: {
    key: 'typing',
    title: 'Typing',
    description: 'Inspect native typing and text-input behavior for input or touch-keyboard mods.',
    uri: 'ms-settings:typing',
  },
};

const WINDOWS_SURFACE_RULES: Array<{
  key: string;
  label: string;
  matches: string[];
  actions: string[];
}> = [
  {
    key: 'explorer-shell',
    label: 'Explorer shell',
    matches: ['explorer.exe'],
    actions: ['taskbar', 'colors', 'notifications'],
  },
  {
    key: 'start-search',
    label: 'Start and search',
    matches: ['startmenuexperiencehost.exe', 'searchhost.exe'],
    actions: ['start', 'taskbar', 'notifications'],
  },
  {
    key: 'notification-host',
    label: 'Notifications and tray',
    matches: ['shellexperiencehost.exe'],
    actions: ['notifications', 'taskbar', 'colors'],
  },
  {
    key: 'window-management',
    label: 'Window management',
    matches: ['dwm.exe', 'applicationframehost.exe'],
    actions: ['multitasking', 'colors', 'taskbar'],
  },
  {
    key: 'audio-media',
    label: 'Audio and media',
    matches: ['sndvol.exe', 'audiodg.exe'],
    actions: ['sound', 'apps-volume', 'notifications'],
  },
  {
    key: 'input',
    label: 'Input and typing',
    matches: ['textinputhost.exe', 'ctfmon.exe', 'tabtip.exe'],
    actions: ['typing', 'colors', 'notifications'],
  },
];

function getNormalizedTargets(include?: string[]): string[] {
  return Array.from(
    new Set((include || []).filter(Boolean).map((target) => normalizeProcessName(target)))
  );
}

function hasWildcardTargets(include?: string[]): boolean {
  return (include || []).some(
    (target) => target === '*' || target.includes('?') || target.includes('*')
  );
}

function getMatchedWindowsSurfaceRules(include?: string[]): typeof WINDOWS_SURFACE_RULES {
  const targets = getNormalizedTargets(include).map((target) => target.toLowerCase());

  return WINDOWS_SURFACE_RULES.filter((rule) =>
    rule.matches.some((processName) => targets.includes(processName))
  );
}

export function getCurrentCompileProfileKey(
  state?: Partial<EditorSessionState>
): EditorCompileProfileKey {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };

  if (sessionState.isModDisabled) {
    return sessionState.isLoggingEnabled ? 'disabled-logging' : 'disabled';
  }

  return sessionState.isLoggingEnabled ? 'logging' : 'current';
}

export function getEditorWindowsSurfaceLabels(
  metadata?: ModMetadata | null
): string[] {
  const matchedRules = getMatchedWindowsSurfaceRules(metadata?.include);

  if (matchedRules.length > 0) {
    return matchedRules.map((rule) => rule.label);
  }

  if (hasWildcardTargets(metadata?.include)) {
    return ['System-wide behavior'];
  }

  if (getNormalizedTargets(metadata?.include).length === 0) {
    return ['Windows surfaces'];
  }

  return ['Focused process behavior'];
}

export function getEditorWindowsActions(
  metadata?: ModMetadata | null,
  maxItems = 4
): EditorWindowsAction[] {
  const matchedRules = getMatchedWindowsSurfaceRules(metadata?.include);
  const actionKeys = Array.from(
    new Set([
      ...(hasWildcardTargets(metadata?.include) ? ['windows-update'] : []),
      ...(matchedRules.length > 0
        ? matchedRules.flatMap((rule) => rule.actions)
        : ['windows-update', 'taskbar', 'notifications']),
    ])
  ).slice(0, maxItems);

  return actionKeys.map((key) => WINDOWS_ACTIONS[key]);
}

function getScopeAssessment(include?: string[]): {
  value: string;
  detail: string;
  tone: EditorEvidenceTone;
} {
  const targets = getNormalizedTargets(include);
  const wildcardTargets = hasWildcardTargets(include);

  if (!targets.length) {
    return {
      value: 'Targeting not declared',
      detail: 'Keep the first iteration disabled until the intended process scope is explicit.',
      tone: 'caution',
    };
  }

  if (wildcardTargets) {
    return {
      value: 'Broad process reach',
      detail: 'Prefer disabled + logging runs until you prove the mod behaves safely.',
      tone: 'caution',
    };
  }

  if (targets.length === 1) {
    return {
      value: `Focused on ${targets[0]}`,
      detail: 'Start manual checks in the one process the mod is clearly targeting.',
      tone: 'positive',
    };
  }

  if (targets.length <= 3) {
    return {
      value: 'Multi-process scope',
      detail: `Verify each targeted surface separately: ${targets.join(', ')}.`,
      tone: 'neutral',
    };
  }

  return {
    value: 'Wide multi-process scope',
    detail: 'Test each affected process before treating the draft as stable.',
    tone: 'caution',
  };
}

export function getRecommendedCompileProfile(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): {
  key: EditorCompileProfileKey;
  label: string;
  rationale: string;
} {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const wildcardTargets = hasWildcardTargets(metadata?.include);
  const targetCount = getNormalizedTargets(metadata?.include).length;

  if (sessionState.compilationFailed) {
    return {
      key: 'disabled-logging',
      label: 'Compile disabled + logging',
      rationale: 'Recover from build failures with the safest, most observable first run.',
    };
  }

  if (preference === 'safe-first') {
    if (!sessionState.isModCompiled || wildcardTargets || targetCount >= 2) {
      return {
        key: 'disabled-logging',
        label: 'Compile disabled + logging',
        rationale:
          'Safe-first mode keeps new or multi-target drafts observable before they are allowed to run live.',
      };
    }

    if (sessionState.modWasModified && !sessionState.isLoggingEnabled) {
      return {
        key: 'logging',
        label: 'Compile with logging',
        rationale:
          'Safe-first mode prefers an evidence-heavy pass after each edit, even for focused drafts.',
      };
    }

    if (sessionState.isModDisabled) {
      return {
        key: 'disabled',
        label: 'Compile disabled',
        rationale:
          'Safe-first mode keeps the mod unloaded until you decide the next live run is justified.',
      };
    }
  }

  if (preference === 'fast-feedback') {
    if (!sessionState.isModCompiled && !wildcardTargets && targetCount <= 1) {
      return {
        key: 'current',
        label: 'Compile with current switches',
        rationale:
          'Fast-feedback mode favors the shortest direct loop for a focused first draft.',
      };
    }

    if (
      sessionState.modWasModified &&
      sessionState.isModCompiled &&
      !wildcardTargets &&
      targetCount <= 1
    ) {
      return {
        key: 'current',
        label: 'Compile with current switches',
        rationale:
          'Fast-feedback mode keeps focused iteration direct once the draft has already compiled cleanly.',
      };
    }
  }

  if (!sessionState.isModCompiled || wildcardTargets || targetCount >= 4) {
    return {
      key: 'disabled-logging',
      label: 'Compile disabled + logging',
      rationale: 'Broad or unverified scope needs a low-risk first run and immediate evidence.',
    };
  }

  if (sessionState.modWasModified && !sessionState.isLoggingEnabled) {
    return {
      key: 'logging',
      label: 'Compile with logging',
      rationale: 'Fresh edits are easier to localize when the first run produces evidence.',
    };
  }

  if (sessionState.isModDisabled) {
    return {
      key: 'disabled',
      label: 'Compile disabled',
      rationale: 'Keep the mod unloaded while you inspect the new binary and metadata.',
    };
  }

  return {
    key: 'current',
    label: 'Compile with current switches',
    rationale: 'The current session already has a stable enough profile to iterate directly.',
  };
}

export function buildEditorContextPacket(
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): string {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const modName = metadata?.name || modId;
  const version = metadata?.version || '0.1';
  const scopeSummary = summarizeTargetProcesses(metadata?.include);
  const recommendedProfile = getRecommendedCompileProfile(
    metadata,
    sessionState,
    preference
  );

  return [
    `Mod name: ${modName}`,
    `Mod id: ${modId}`,
    `Target processes: ${scopeSummary}`,
    `Current version: ${version}`,
    `Draft changes: ${sessionState.modWasModified ? 'yes' : 'no'}`,
    `Compiled: ${sessionState.isModCompiled ? 'yes' : 'no'}`,
    `Disabled after compile: ${sessionState.isModDisabled ? 'yes' : 'no'}`,
    `Logging enabled: ${sessionState.isLoggingEnabled ? 'yes' : 'no'}`,
    `Compilation failed recently: ${sessionState.compilationFailed ? 'yes' : 'no'}`,
    `Recommended next compile profile: ${recommendedProfile.label}`,
    `Reason: ${recommendedProfile.rationale}`,
  ].join('\n');
}

export function getEditorEvidenceCards(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): EditorEvidenceCard[] {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const scopeAssessment = getScopeAssessment(metadata?.include);
  const recommendedProfile = getRecommendedCompileProfile(
    metadata,
    sessionState,
    preference
  );

  const nextRunCard: EditorEvidenceCard = sessionState.compilationFailed
    ? {
      key: 'next-run',
      label: 'Next run',
      value: 'Stabilize the build first',
      detail: 'Fix the compile failure before trusting any AI-generated change or runtime behavior.',
      tone: 'caution',
    }
    : !sessionState.isModCompiled
      ? {
        key: 'next-run',
        label: 'Next run',
        value: recommendedProfile.label,
        detail: recommendedProfile.rationale,
        tone: recommendedProfile.key === 'disabled-logging' ? 'caution' : 'neutral',
      }
      : sessionState.modWasModified && !sessionState.isLoggingEnabled
        ? {
          key: 'next-run',
          label: 'Next run',
          value: 'Turn logging on',
          detail: 'Fresh edits need a higher-evidence first run so regressions are easier to localize.',
          tone: 'neutral',
        }
        : sessionState.isModDisabled
          ? {
            key: 'next-run',
            label: 'Next run',
            value: 'Preview before enabling',
            detail: 'Keep the mod unloaded while you inspect the effect and log output.',
            tone: 'neutral',
          }
          : {
            key: 'next-run',
            label: 'Next run',
            value: 'Live verification ready',
            detail: 'Exercise the exact Windows flow you changed and keep notes on regressions.',
            tone: 'positive',
          };

  const releaseCard: EditorEvidenceCard = sessionState.modWasModified
    ? {
      key: 'release',
      label: 'Release note',
      value: 'Still needs a summary',
      detail: 'Capture user-visible changes and the checks you ran before treating the draft as done.',
      tone: 'neutral',
    }
    : !metadata?.version
      ? {
        key: 'release',
        label: 'Release note',
        value: 'Version metadata missing',
        detail: 'Set a version before treating the current build as a real release candidate.',
        tone: 'caution',
      }
      : {
        key: 'release',
        label: 'Release note',
        value: 'Evidence packet ready',
        detail: 'You can now ask AI for docs, release notes, or a final review from stable context.',
        tone: 'positive',
      };

  return [
    {
      key: 'scope',
      label: 'Scope',
      value: scopeAssessment.value,
      detail: scopeAssessment.detail,
      tone: scopeAssessment.tone,
    },
    nextRunCard,
    releaseCard,
  ];
}

export function getEditorIterationPlan(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): EditorIterationStep[] {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const scopeSummary = summarizeTargetProcesses(metadata?.include);
  const surfaceSummary = getEditorWindowsSurfaceLabels(metadata).join(', ');
  const recommendedProfile = getRecommendedCompileProfile(
    metadata,
    sessionState,
    preference
  );

  return [
    {
      key: 'scope',
      title: 'Frame the change',
      body: `Keep the first validation anchored to ${scopeSummary} and the ${surfaceSummary} surface so one workflow proves or disproves the idea quickly.`,
    },
    {
      key: 'compile',
      title: recommendedProfile.label,
      body: recommendedProfile.rationale,
    },
    {
      key: 'verify',
      title: sessionState.modWasModified ? 'Capture evidence before shipping' : 'Keep the verification loop warm',
      body: sessionState.modWasModified
        ? 'Preview the affected Windows surface, inspect logs, and write down the user-visible effect before the next AI-assisted revision.'
        : 'Reuse the context pack or test plan when the next change request lands so the reasoning stays grounded in this mod.',
    },
  ];
}

export function getEditorVerificationPack(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): EditorVerificationItem[] {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const targets = getNormalizedTargets(metadata?.include);
  const wildcardTargets = hasWildcardTargets(metadata?.include);
  const scopeLabel = summarizeTargetProcesses(metadata?.include);
  const surfaceSummary = getEditorWindowsSurfaceLabels(metadata).join(', ');

  const firstStep = sessionState.compilationFailed
    ? {
      key: 'build-health',
      title: 'Fix build health',
      detail: 'Resolve the compile failure before treating any runtime observation as trustworthy.',
    }
    : {
      key: 'primary-flow',
      title: 'Exercise the primary flow',
      detail: `Run the exact Windows flow affected by ${scopeLabel} across ${surfaceSummary} and note what changed for the user.`,
    };

  const scopeStep = wildcardTargets
    ? {
      key: 'scope',
      title: 'Contain wide scope',
      detail: 'Wildcard targeting means the first live run should stay disabled or heavily logged until you prove safety.',
    }
    : targets.length > 1
      ? {
        key: 'scope',
        title: 'Check each target separately',
        detail: `Do not treat "${scopeLabel}" as one environment. Verify each targeted process on its own.`,
      }
      : {
        key: 'scope',
        title: 'Confirm the intended process',
        detail: `Use ${scopeLabel} as the baseline and confirm the hook does not drift into adjacent shell behavior.`,
      };

  const evidenceStep = sessionState.isLoggingEnabled
    ? {
      key: 'evidence',
      title: 'Capture evidence',
      detail: 'Keep the first logs, screenshots, or user-visible notes so later AI prompts stay grounded in real behavior.',
    }
    : {
      key: 'evidence',
      title: 'Increase observability',
      detail: 'Turn logging on before the next risky run so regressions are easier to localize.',
    };

  const releaseStep = sessionState.modWasModified
    ? {
      key: 'release',
      title: 'Write the release delta',
      detail: 'Summarize what changed, what users should verify, and any Windows-build caveats before shipping.',
    }
    : {
      key: 'release',
      title: 'Keep the release packet warm',
      detail: 'Reuse the checklist and release packet for the next iteration so reviews stay concrete.',
    };

  return [firstStep, scopeStep, evidenceStep, releaseStep];
}

export function getEditorProvocations(
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>
): EditorProvocation[] {
  const sessionState = {
    ...DEFAULT_EDITOR_SESSION_STATE,
    ...state,
  };
  const targets = getNormalizedTargets(metadata?.include);
  const wildcardTargets = hasWildcardTargets(metadata?.include);
  const surfaceSummary = getEditorWindowsSurfaceLabels(metadata).join(', ');

  const scopeProvocation = wildcardTargets
    ? {
      key: 'scope-challenge',
      title: 'What should stay untouched?',
      body: `This mod reaches broadly across ${surfaceSummary}. Name one Windows behavior that must remain unchanged, then verify it before trusting the draft.`,
    }
    : targets.length <= 1
      ? {
        key: 'scope-challenge',
        title: 'What is the nearest counterexample?',
        body: `Treat ${surfaceSummary} as the primary surface, then ask what adjacent shell flow should not change if the hook target is really correct.`,
      }
      : {
        key: 'scope-challenge',
        title: 'Which target is least obvious?',
        body: `Do not treat ${targets.join(', ')} as one environment. Identify the most doubtful process and verify it separately first.`,
      };

  const bestPracticeProvocation = metadata?.version
    ? {
      key: 'best-practice',
      title: 'Which practice would a reviewer challenge?',
      body: 'Assume a language expert is reviewing this draft for context-dependent C++ and Windows best practices, not just syntax. What would they flag first?',
    }
    : {
      key: 'best-practice',
      title: 'What release signal is missing?',
      body: 'Missing or draft metadata lowers trust. Identify the smallest metadata or documentation change that would make the next review easier.',
    };

  const feedbackProvocation = sessionState.compilationFailed
    ? {
      key: 'feedback-loop',
      title: 'What is the smallest recovery step?',
      body: 'Use the failed build as feedback, not just as a blocker. Ask what minimal code change would address the most plausible root cause before trying a larger rewrite.',
    }
    : sessionState.isLoggingEnabled
      ? {
        key: 'feedback-loop',
        title: 'What evidence could disprove the idea?',
        body: 'Logs are available. Decide which one observation would falsify your current design so the next run teaches you something concrete.',
      }
      : {
        key: 'feedback-loop',
        title: 'What evidence is missing?',
        body: 'Before another risky change, ask what compiler, log, or UI observation would let you validate the draft instead of judging it by feel.',
      };

  return [scopeProvocation, bestPracticeProvocation, feedbackProvocation];
}

export function buildEditorVerificationChecklist(
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): string {
  const checklist = getEditorVerificationPack(metadata, state);

  return [
    `Verification checklist for ${metadata?.name || modId} (${modId})`,
    ...checklist.map((item) => `- ${item.title}: ${item.detail}`),
  ].join('\n');
}

export function buildEditorReleasePacket(
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): string {
  return [
    buildEditorContextPacket(modId, metadata, state, preference),
    '',
    buildEditorVerificationChecklist(modId, metadata, state, preference),
  ].join('\n');
}

export function buildEditorChallengeBrief(
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): string {
  const provocations = getEditorProvocations(metadata, state);

  return [
    buildEditorContextPacket(modId, metadata, state, preference),
    '',
    'Challenge prompts:',
    ...provocations.map(
      (provocation) => `- ${provocation.title}: ${provocation.body}`
    ),
  ].join('\n');
}

export function buildEditorAiPrompt(
  kind: EditorPromptKind,
  modId: string,
  metadata?: ModMetadata | null,
  state?: Partial<EditorSessionState>,
  preference: CompileRecommendationMode = 'balanced'
): string {
  const modName = metadata?.name || modId;
  const targetProcesses = summarizeTargetProcesses(metadata?.include);
  const version = metadata?.version || '0.1';
  const contextPacket = buildEditorContextPacket(
    modId,
    metadata,
    state,
    preference
  );

  switch (kind) {
    case 'scaffold':
      return `Help me improve a Windhawk mod in C++.
${contextPacket}
Requirements:
- Keep the Windhawk metadata, readme, and settings blocks valid.
- Explain why each hook target is correct for these processes.
- Preserve safe logging for the first iteration.
- Avoid speculative APIs or hooks that are not justified.
Output:
1. Updated source code
2. Hook-by-hook explanation
3. Manual verification steps`;
    case 'review':
      return `Review this Windhawk mod like a cautious senior engineer.
${contextPacket}
Focus on:
- Crash risks
- Incorrect hook targets
- Missing error handling
- Performance regressions
- Missing manual tests
Output:
1. Findings ordered by severity
2. The most important tests to run next
3. Any metadata or documentation gaps`;
    case 'docs':
      return `Draft documentation for this Windhawk mod update.
${contextPacket}
Include:
- What changed
- What users should verify after installing
- Any compatibility risks or limitations
Output:
1. Readme update
2. Short changelog entry
3. Contributor test checklist`;
    case 'explain-scope':
      return `Explain the scope and likely hook surface of this Windhawk mod.
${contextPacket}
Answer:
1. Which Windows processes and UX surfaces this mod most likely affects
2. Why those targets make sense for the requested behavior
3. What should be verified manually before expanding the scope`;
    case 'explain-api':
      return `Explain the APIs and hook surfaces that this Windhawk mod is most likely using or should use.
${contextPacket}
Focus on:
- Relevant Windows APIs, message flows, and shell surfaces
- Why each API or hook surface fits the requested behavior
- Any risky or less-obvious API assumptions that should be validated manually
Output:
1. Candidate APIs or hook points
2. Why they fit
3. What to inspect in the current code`;
    case 'explain-terms':
      return `Explain the Windows and Windhawk-specific terms behind this mod so an implementer can reason about the code correctly.
${contextPacket}
Clarify:
- Process names, shell components, and Windows UX surfaces
- Any domain-specific terms that could confuse a contributor
- Which terms matter most before editing hook logic
Output:
1. Term glossary
2. Why each term matters here
3. Likely places those concepts appear in code`;
    case 'usage-examples':
      return `Give concrete usage examples and implementation patterns for the APIs, hooks, or Windows behaviors relevant to this Windhawk mod.
${contextPacket}
Output:
1. Small usage examples or pseudocode patterns
2. How each example maps to this mod's likely goal
3. The safest first experiment to try in the current draft`;
    case 'test-plan':
      return `Create a practical manual test plan for this Windhawk mod.
${contextPacket}
Focus on realistic Windows interactions, not synthetic unit tests.
Output:
1. A short smoke test sequence
2. Edge cases and rollback checks
3. What logs or screenshots to capture if behavior regresses`;
    case 'release-notes':
      return `Write release-facing notes for this Windhawk mod update.
Mod name: ${modName}
Mod id: ${modId}
Target processes: ${targetProcesses}
Current version: ${version}
Use this context:
${contextPacket}
Output:
1. A concise changelog entry
2. A short 'what to verify' checklist for users
3. Any compatibility or caution notes`;
    case 'challenge-assumptions':
      return `Challenge this Windhawk mod design instead of agreeing with it.
${buildEditorChallengeBrief(modId, metadata, state, preference)}
Act like a Socratic reviewer:
1. Identify the weakest assumption in the current design
2. Propose one plausible counterexample or failure mode
3. Suggest the smallest experiment that would prove or disprove that assumption`;
    case 'counterexample-hunt':
      return `Generate counterexamples for this Windhawk mod draft.
${buildEditorChallengeBrief(modId, metadata, state, preference)}
Focus on:
- Windows flows that should remain unchanged
- Adjacent shell surfaces or processes that could regress
- Conditions where the chosen hook target is probably wrong
Output:
1. Three concrete counterexamples
2. Why each one is plausible
3. A manual check for each counterexample`;
    case 'best-practices':
      return `Audit this Windhawk mod for context-dependent C++ and Windows best practices.
${contextPacket}
Review it like an expert code reviewer, similar to an automated best-practice commenter.
Focus on:
- Risky Windows or shell assumptions
- Missing defensive checks
- Maintainability or readability issues
- Metadata and release communication gaps
Output:
1. Findings ordered by importance
2. Which findings are best-practice issues versus correctness issues
3. The most valuable fix to make next`;
    case 'compile-recovery':
      return `Use validation feedback to recover this Windhawk mod draft.
${buildEditorChallengeBrief(modId, metadata, state, preference)}
Current build status: ${state?.compilationFailed ? 'recent compile failure' : 'build status not obviously failed'}
Help me run a validation-driven recovery loop:
1. List the most likely root causes to check first
2. Suggest the smallest corrective edit before a full rewrite
3. Tell me what compiler or log feedback I should bring back into the next iteration`;
  }
}
