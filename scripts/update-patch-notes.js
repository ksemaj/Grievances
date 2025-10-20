#!/usr/bin/env node
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const file = path.resolve(__dirname, '../src/patchNotes.json');
if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify({ versions: [{ version: '1.0', date: new Date().toISOString().slice(0,10), items: ['Initial version'] }] }, null, 2) + '\n');
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function nextVersion(v) {
  const [maj, min] = String(v).split('.').map(Number);
  return `${maj}.${(isNaN(min) ? 0 : min) + 1}`;
}
function dateISO(){ return new Date().toISOString().slice(0,10); }
function commitsSince(ref){
  try { return cp.execSync(`git log ${ref}..HEAD --pretty=format:%s`, {encoding:'utf8'}).trim().split('\n').filter(Boolean); }
  catch { try { return cp.execSync('git log --since="1 week ago" --pretty=format:%s', {encoding:'utf8'}).trim().split('\n').filter(Boolean); } catch { return []; } }
}

const latest = data.versions?.[0] || { version: '1.0' };
const fromTag = `v${latest.version}`;
const msgs = commitsSince(fromTag).slice(0, 20);
const items = msgs.length ? msgs : ['Minor improvements and fixes'];
const newVersion = nextVersion(latest.version);

data.versions = [{ version: newVersion, date: dateISO(), items }, ...(data.versions || [])];
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(`Updated patch notes to v${newVersion}`);
