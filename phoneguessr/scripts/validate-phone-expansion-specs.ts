import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const changeDir = join(
  __dirname,
  '..',
  '..',
  'openspec',
  'changes',
  'phone-data-expansion',
);

interface Check {
  name: string;
  passed: boolean;
  detail: string;
}

const checks: Check[] = [];

function check(name: string, condition: boolean, detail: string) {
  checks.push({ name, passed: condition, detail });
}

function fileExists(path: string): boolean {
  return existsSync(join(changeDir, path));
}

function readFile(path: string): string {
  return readFileSync(join(changeDir, path), 'utf-8');
}

function hasSection(content: string, heading: string): boolean {
  return content.includes(heading);
}

// --- Artifact existence ---

check('proposal-exists', fileExists('proposal.md'), 'proposal.md exists');
check('design-exists', fileExists('design.md'), 'design.md exists');
check('tasks-exists', fileExists('tasks.md'), 'tasks.md exists');

// --- Spec files ---

const expectedSpecs = [
  'phone-metadata',
  'phone-catalog-targets',
  'phone-image-standards',
  'phone-curation-pipeline',
  'phone-data',
  'mock-api',
];

for (const spec of expectedSpecs) {
  const path = `specs/${spec}/spec.md`;
  check(`spec-${spec}`, fileExists(path), `specs/${spec}/spec.md exists`);
}

// --- Proposal completeness ---

if (fileExists('proposal.md')) {
  const proposal = readFile('proposal.md');
  check(
    'proposal-why',
    hasSection(proposal, '## Why'),
    'proposal has Why section',
  );
  check(
    'proposal-what',
    hasSection(proposal, '## What Changes'),
    'proposal has What Changes section',
  );
  check(
    'proposal-capabilities',
    hasSection(proposal, '## Capabilities'),
    'proposal has Capabilities section',
  );
  check(
    'proposal-impact',
    hasSection(proposal, '## Impact'),
    'proposal has Impact section',
  );

  // Check all expected capabilities are mentioned
  for (const spec of expectedSpecs) {
    check(
      `proposal-mentions-${spec}`,
      proposal.includes(spec),
      `proposal references capability "${spec}"`,
    );
  }
}

// --- Design completeness ---

if (fileExists('design.md')) {
  const design = readFile('design.md');
  check(
    'design-context',
    hasSection(design, '## Context'),
    'design has Context section',
  );
  check(
    'design-goals',
    hasSection(design, '## Goals'),
    'design has Goals section',
  );
  check(
    'design-decisions',
    hasSection(design, '## Decisions'),
    'design has Decisions section',
  );
  check(
    'design-risks',
    hasSection(design, '## Risks'),
    'design has Risks section',
  );
}

// --- Tasks completeness ---

if (fileExists('tasks.md')) {
  const tasks = readFile('tasks.md');
  const checkboxCount = (tasks.match(/- \[ \]/g) || []).length;
  check(
    'tasks-has-items',
    checkboxCount >= 5,
    `tasks.md has ${checkboxCount} task items (min 5)`,
  );

  // Check for key task groups
  check(
    'tasks-schema',
    tasks.includes('Schema'),
    'tasks covers schema changes',
  );
  check(
    'tasks-seed-data',
    tasks.includes('Seed Data') || tasks.includes('seed data'),
    'tasks covers seed data expansion',
  );
  check(
    'tasks-mock-data',
    tasks.includes('Mock Data') ||
      tasks.includes('mock data') ||
      tasks.includes('MOCK'),
    'tasks covers mock data update',
  );
  check(
    'tasks-images',
    tasks.includes('Image') || tasks.includes('image'),
    'tasks covers phone images',
  );
  check(
    'tasks-validation',
    tasks.includes('Validation') ||
      tasks.includes('validation') ||
      tasks.includes('Validate'),
    'tasks covers validation',
  );
}

// --- Spec content validation ---

for (const spec of expectedSpecs) {
  const path = `specs/${spec}/spec.md`;
  if (fileExists(path)) {
    const content = readFile(path);
    const hasRequirements = content.includes('### Requirement:');
    const hasScenarios = content.includes('#### Scenario:');
    const hasWhenThen =
      content.includes('**WHEN**') && content.includes('**THEN**');

    check(
      `spec-${spec}-requirements`,
      hasRequirements,
      `${spec} spec has requirements`,
    );
    check(`spec-${spec}-scenarios`, hasScenarios, `${spec} spec has scenarios`);
    check(
      `spec-${spec}-when-then`,
      hasWhenThen,
      `${spec} spec uses WHEN/THEN format`,
    );
  }
}

// --- Output ---

console.log('Phone Data Expansion Spec Validation');
console.log('====================================\n');

const passed = checks.filter(c => c.passed);
const failed = checks.filter(c => !c.passed);

if (passed.length > 0) {
  console.log('PASS:');
  for (const c of passed) {
    console.log(`  ✓ [${c.name}] ${c.detail}`);
  }
}

if (failed.length > 0) {
  console.log('\nFAIL:');
  for (const c of failed) {
    console.log(`  ✗ [${c.name}] ${c.detail}`);
  }
}

console.log(`\nSummary: ${passed.length} passed, ${failed.length} failed`);
process.exit(failed.length > 0 ? 1 : 0);
