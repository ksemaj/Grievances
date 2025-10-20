#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Helper
function getLastWeekDateRange() {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);

  const format = d => d.toISOString().split('T')[0];
  return `${format(oneWeekAgo)} to ${format(now)}`;
}

function getRecentCommits() {
  try {
    return execSync('git log --since="1 week ago" --pretty=format:"%h|%s|%an|%ar"', {
      encoding: 'utf-8',
    })
      .trim()
      .split('\n')
      .map(line => {
        const [hash, subject, author, rel] = line.split('|');
        return { hash, subject, author, rel };
      })
      .filter(commit => commit.subject && typeof commit.subject === 'string' && commit.subject.trim() !== '');
  } catch (e) {
    return [];
  }
}

function getCommitFiles(commitHash) {
  try {
    return execSync(`git show --pretty="" --name-status ${commitHash}`)
      .toString()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

function categorizeCommit(subject) {
  if (!subject || typeof subject !== 'string') return 'Low';
  const lower = subject.toLowerCase();
  if (/feat|feature|add|introduc|major|breaking/.test(lower)) return 'High';
  if (/fix|bug|improve|enhanc|perf|update/.test(lower)) return 'Medium';
  if (/refactor|chore|dep|typo|doc/.test(lower)) return 'Low';
  return 'Medium';
}

function createSuggestions(commits, dateRange) {
  const categories = { High: [], Medium: [], Low: [] };
  commits.forEach(c => {
    const impact = categorizeCommit(c.subject);
    categories[impact].push(c);
  });
  // Build output
  const high = categories.High.map(c => `- ${c.subject} (${c.hash}, ${c.author}, ${c.rel})`).join('\n');
  const medium = categories.Medium.map(c => `- ${c.subject} (${c.hash}, ${c.author}, ${c.rel})`).join('\n');
  const low = categories.Low.map(c => `- ${c.subject} (${c.hash}, ${c.author}, ${c.rel})`).join('\n');
  const summary = commits.length
    ? `*${commits.length} commits shipped. Focus: ${categories.High.length} high, ${categories.Medium.length} medium, ${categories.Low.length} low impact changes.*`
    : 'No changes shipped this week.';

  return `## Week of ${dateRange}\n\n### Summary\n${summary}\n\n### High Impact Changes\n${high || '(none)'}\n\n### Content Suggestions\n\n#### Blog Posts\n1. **"[Highlight a major feature or improvement]"** - Explain the top feature shipped, its user benefit, and technical challenge\n2. **"[Developer Journey: Fixing X]"** - Walk through a notable improvement/fix\n\n#### Tweets/Threads\n1. 🎉 Launch tweet: "Just shipped: ${categories.High[0]?.subject || categories.Medium[0]?.subject || ''}! Check it out!"\n2. 🧵 Thread idea: "Behind the scenes of ${categories.High[0]?.subject || '<feature>'}."\n3. 💡 Tip: "Did you know? Our latest update lets you ..."\n\n#### Changelog Entry\n\n\`\`\`\n## [Version] - [Date]\n\n### Added\n${high || '(no major features added)'}\n\n### Fixed\n${medium || '(no notable fixes)'}\n\n### Low Impact\n${low || '(none)'}\n\n\`\`\`\n\n#### Email Subject Lines\n- "See what's new this week!"
- "[Feature] has landed – discover the benefits!"
\n#### Video Ideas\n- "How we built ${categories.High[0]?.subject || '<a feature>'}"\n\n#### Documentation Updates Needed\n- [ ] Update relevant docs for major changes\n- [ ] Add new guides as needed\n`;
}

function main() {
  const dateRange = getLastWeekDateRange();
  const commits = getRecentCommits();
  const output = createSuggestions(commits, dateRange);
  fs.writeFileSync(path.resolve(__dirname, '../content-marketing-report.md'), output);
  console.log('Content marketing report generated: content-marketing-report.md');
}

main();
