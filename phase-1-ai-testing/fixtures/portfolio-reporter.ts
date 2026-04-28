import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Custom Playwright reporter — emits a compact JSON+MD summary that links
 * every failure to its trace zip, screenshot, and (when present) Applitools
 * batch URL. Closes the audit gap "no custom reporter linking Allure +
 * Applitools + traces".
 *
 * Output (under ./reports/portfolio/):
 *   summary.json   — machine-readable per-spec results
 *   summary.md     — markdown table the master pipeline pastes into the PR
 *
 * Why custom?
 *   - The Playwright HTML reporter is great for humans browsing locally but
 *     uploading 50 MB of HTML to artefacts on every PR is wasteful.
 *   - Allure is good for trends but its single-page summary doesn't link to
 *     Applitools batch URLs.
 *   - We want one PR-comment-ready Markdown table and one machine-parseable
 *     JSON file. That's what this writes.
 */

interface SpecRow {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
  title: string;
  file: string;
  durationMs: number;
  retries: number;
  attachments: { name: string; path?: string; contentType?: string }[];
  errorMessage?: string;
}

export default class PortfolioReporter implements Reporter {
  private rows: SpecRow[] = [];
  private outDir: string;
  private startedAt = Date.now();

  constructor(options: { outputDir?: string } = {}) {
    this.outDir = options.outputDir ?? 'reports/portfolio';
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    this.startedAt = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.rows.push({
      status: result.status,
      title: test.titlePath().slice(2).join(' › '),
      file: test.location.file,
      durationMs: result.duration,
      retries: result.retry,
      attachments: result.attachments.map((a) => ({
        name: a.name,
        path: a.path,
        contentType: a.contentType,
      })),
      errorMessage: result.error?.message,
    });
  }

  async onEnd(result: FullResult): Promise<void> {
    const totals = countByStatus(this.rows);
    const wallSeconds = ((Date.now() - this.startedAt) / 1000).toFixed(1);
    const applitoolsUrl = process.env.APPLITOOLS_SERVER_URL
      ? `${process.env.APPLITOOLS_SERVER_URL}/app/test-results/?accountId=&batchId=${process.env.APPLITOOLS_BATCH_ID ?? ''}`
      : null;

    const json = {
      version: '1.0',
      result: result.status,
      totals,
      wallSeconds: Number(wallSeconds),
      applitoolsBatch: applitoolsUrl,
      specs: this.rows,
    };

    const md =
      `## Phase 1 — AI Testing summary\n\n` +
      `**Result:** \`${result.status}\` · **Wall:** ${wallSeconds}s · ` +
      `**Passed/Failed/Skipped:** ${totals.passed}/${totals.failed}/${totals.skipped}` +
      (applitoolsUrl ? ` · [Applitools batch](${applitoolsUrl})\n\n` : '\n\n') +
      (totals.failed === 0
        ? 'All scenarios passed.\n'
        : '### Failures\n\n' +
          this.rows
            .filter((r) => r.status === 'failed' || r.status === 'timedOut')
            .map(
              (r) =>
                `- **${r.title}** (\`${shortPath(r.file)}\`)\n  ` +
                `\`${r.status}\` after ${r.retries} retr${r.retries === 1 ? 'y' : 'ies'} · ` +
                (r.errorMessage
                  ? `_${oneLine(r.errorMessage)}_`
                  : 'no error message'),
            )
            .join('\n'));

    writeOut(join(this.outDir, 'summary.json'), JSON.stringify(json, null, 2));
    writeOut(join(this.outDir, 'summary.md'), md);
  }
}

function countByStatus(rows: SpecRow[]) {
  const tally = {
    passed: 0,
    failed: 0,
    skipped: 0,
    timedOut: 0,
    interrupted: 0,
  };
  for (const r of rows) tally[r.status]++;
  return tally;
}

function shortPath(p: string): string {
  const ix = p.lastIndexOf('phase-1-ai-testing/');
  return ix === -1 ? p : p.slice(ix + 'phase-1-ai-testing/'.length);
}

function oneLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim().slice(0, 240);
}

function writeOut(file: string, body: string): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, body, 'utf8');
}
