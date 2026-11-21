// src/types/curriculum.ts

export type ZoneColorTheme = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose';

export interface ZoneMeta {
    readonly id: string;
    readonly order: number;
    readonly title: string;
    readonly subtitle: string;
    readonly theme: ZoneColorTheme;
}

export interface ModuleManifestItem {
    readonly id: number;
    readonly zoneId: string;
    readonly slug: string;
    readonly title: string;
    readonly shortDesc: string;
    readonly icon: string;
    readonly badgeName: string;
    readonly xpReward: number;
}

export interface RoadmapManifest {
    readonly appName: string;
    readonly cefrLevel: string;
    readonly zones: readonly ZoneMeta[];
    readonly modules: readonly ModuleManifestItem[];
}

export interface DialogueLine {
    readonly speaker: string;
    readonly avatarRole: 'boy' | 'girl' | 'teacher';
    readonly arabic: string;
    readonly transliteration: string;
    readonly translation: string;
}

export interface StoryHook {
    readonly title: string;
    readonly setting: string;
    readonly lines: readonly DialogueLine[];
}

export interface PatternRow {
    readonly id: string;
    readonly category: string;
    readonly cells: readonly string[];
    readonly arabicResult: string;
    readonly transliteration: string;
    readonly meaning: string;
    readonly breakdown: string;
}

export interface PatternTable {
    readonly title: string;
    readonly filters: readonly string[];
    readonly headers: readonly string[];
    readonly rows: readonly PatternRow[];
}

export interface ExampleSegment {
    readonly text: string;
    readonly role: 'base' | 'focus' | 'suffix' | 'prefix';
    readonly label?: string;
}

export interface HighlightedExample {
    readonly segments: readonly ExampleSegment[];
    readonly transliteration: string;
    readonly translation: string;
}

export interface VocabularyItem {
    readonly arabic: string;
    readonly transliteration: string;
    readonly meaning: string;
    readonly gender?: 'mudzakkar' | 'muannats';
}

export type QuestionDifficulty = 'medium' | 'hard';
export type QuestionType =
    | 'agreement-trap'
    | 'morpheme-swap'
    | 'error-spotting'
    | 'reading-comprehension'
    | 'context-choice';

export interface QuizQuestion {
    readonly id: string;
    readonly difficulty: QuestionDifficulty;
    readonly type: QuestionType;
    readonly question: string;
    readonly options: readonly [string, string, string, string];
    readonly correctIndex: 0 | 1 | 2 | 3;
    readonly feedbackWrong: string;
    readonly feedbackCorrect: string;
}

export interface ModuleContent {
    readonly id: number;
    readonly zoneId: string;
    readonly slug: string;
    readonly title: string;
    readonly canDo: string;
    readonly storyHook: StoryHook;
    readonly explanation: string;
    readonly patternTable: PatternTable;
    readonly highlightedExamples: readonly HighlightedExample[];
    readonly quickTrick: string;
    readonly vocabulary: readonly VocabularyItem[];
    readonly quizBank: readonly QuizQuestion[];
}