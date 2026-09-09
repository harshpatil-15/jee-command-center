import type { Difficulty, Status, Subject } from './data/syllabus';

export type Rating = 'Again' | 'Hard' | 'Good' | 'Easy';
export type Progress = {
  status: Status; theory: boolean; questions: boolean; pyq: boolean; revised: boolean;
  difficulty: Difficulty; confidence: number; notes: string; lastStudied?: string; nextRevision?: string;
  lastRevisionDate?: string; currentInterval?: number; previousInterval?: number;
  revisionCount: number; successfulRevisionCount: number; latestRating?: Rating; revisionHistory: RevisionHistoryEntry[];
};
export type RevisionHistoryEntry = { date: string; rating: Rating; intervalDays: number; previousInterval?: number };
export type Revision = { id: string; chapterId: string; dueDate: string; intervalDays: number; intervalIndex?: number; completed?: boolean; createdAt?: string };
export type Task = { id: string; title: string; chapterId?: string; subject?: Subject; minutes?: number; done: boolean; createdAt: string };
export type Session = { id: string; date: string; minutes: number; chapterId?: string; type: 'focus' | 'revision' };
export type Settings = { focus: number; shortBreak: number; longBreak: number; dailyTarget: number };
export type AppData = { version: 2; progress: Record<string, Progress>; revisions: Revision[]; tasks: Task[]; sessions: Session[]; settings: Settings };

export const QUICK_INTERVALS = [1, 3, 7, 14, 30, 60, 90] as const;
export const today = () => new Date().toISOString().slice(0, 10);
export const addDays = (days: number, base = new Date()) => { const next = new Date(base); next.setDate(next.getDate() + days); return next.toISOString().slice(0, 10); };
export const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${value}T00:00:00`)) : '—';
export const freshProgress = (): Progress => ({ status: 'Not Started', theory: false, questions: false, pyq: false, revised: false, difficulty: 'Medium', confidence: 1, notes: '', revisionCount: 0, successfulRevisionCount: 0, revisionHistory: [] });

export const migrate = (raw: unknown): AppData => {
  const base: AppData = { version: 2, progress: {}, revisions: [], tasks: [], sessions: [], settings: { focus: 25, shortBreak: 5, longBreak: 15, dailyTarget: 180 } };
  if (!raw || typeof raw !== 'object') return base;
  const old = raw as Partial<AppData> & { progress?: Record<string, Partial<Progress>>; revisions?: Array<Partial<Revision>> };
  const progress = Object.fromEntries(Object.entries(old.progress || {}).map(([id, p]) => [id, { ...freshProgress(), ...p, revisionCount: p.revisionCount ?? (p.revisionHistory?.length || 0), successfulRevisionCount: p.successfulRevisionCount ?? (p.revisionHistory?.filter(h => h.rating !== 'Again').length || 0), revisionHistory: p.revisionHistory || [] }]));
  const revisions = (old.revisions || []).filter((r): r is Revision => Boolean(r.id && r.chapterId && r.dueDate)).map(r => ({ ...r, intervalDays: r.intervalDays ?? QUICK_INTERVALS[r.intervalIndex ?? 0] ?? 1, createdAt: r.createdAt ?? today() }));
  return { ...base, ...old, version: 2, progress, revisions, tasks: old.tasks || [], sessions: old.sessions || [], settings: { ...base.settings, ...old.settings } };
};

export const completion = (p?: Progress) => !p ? 0 : Math.round((Number(p.theory) * .3 + Number(p.questions) * .35 + Number(p.pyq) * .25 + Number(p.revised) * .1) * 100);
export const mastery = (p?: Progress) => {
  if (!p) return 0;
  const milestones = Number(p.theory) * 16 + Number(p.questions) * 20 + Number(p.pyq) * 20 + Number(p.revised) * 16;
  const confidence = p.confidence / 5 * 14;
  const recall = Math.min(p.successfulRevisionCount, 5) / 5 * 14;
  return Math.round(milestones + confidence + recall);
};
export const suggestedInterval = (rating: Rating, p: Progress) => {
  const current = p.currentInterval || 3;
  const raw = rating === 'Again' ? Math.max(1, current * .45) : rating === 'Hard' ? Math.max(3, current * .9) : rating === 'Good' ? Math.max(3, current * 1.8) : Math.max(7, current * 2.8);
  const confidenceFactor = [0, .65, .8, 1, 1.2, 1.4][p.confidence] || 1;
  const difficultyFactor = p.difficulty === 'Hard' ? .85 : p.difficulty === 'Easy' ? 1.1 : 1;
  const target = raw * confidenceFactor * difficultyFactor;
  return QUICK_INTERVALS.reduce((best, candidate) => Math.abs(candidate - target) < Math.abs(best - target) ? candidate : best, QUICK_INTERVALS[0]);
};
export const readiness = (progress: Progress[], sessions: Session[]) => {
  const total = Math.max(progress.length, 1);
  const avg = (key: 'theory' | 'questions' | 'pyq' | 'revised') => progress.filter(p => p[key]).length / total * 100;
  const confidence = progress.reduce((sum, p) => sum + p.confidence / 5, 0) / total * 100;
  const activeDays = new Set(sessions.filter(s => s.date >= addDays(-6)).map(s => s.date)).size / 7 * 100;
  const done = progress.filter(p => ['Completed', 'Mastered'].includes(p.status)).length / total * 100;
  const value = done * .2 + avg('theory') * .15 + avg('questions') * .2 + avg('pyq') * .2 + avg('revised') * .1 + confidence * .1 + activeDays * .05;
  return { value: Math.round(value), components: [{ label: 'Syllabus', value: done }, { label: 'Theory', value: avg('theory') }, { label: 'Questions', value: avg('questions') }, { label: 'PYQs', value: avg('pyq') }, { label: 'Revision', value: avg('revised') }, { label: 'Confidence', value: confidence }, { label: 'Consistency', value: activeDays }] };
};
