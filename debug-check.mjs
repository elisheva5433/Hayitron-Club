import fs from 'node:fs';
const src = fs.readFileSync('./src/data/benefitsData.js', 'utf8');
const stack = [];
let quote = null;
let escaped = false;
for (let i = 0; i < src.length; i += 1) {
  const ch = src[i];
  if (quote) {
    if (escaped) {
      escaped = false;
    } else if (ch === '\\') {
      escaped = true;
    } else if (ch === quote) {
      quote = null;
    }
    continue;
  }
  if (ch === '"' || ch === "'") {
    quote = ch;
    continue;
  }
  if (ch === '{' || ch === '[' || ch === '(') {
    stack.push({ ch, i });
    continue;
  }
  if (ch === '}' || ch === ']' || ch === ')') {
    const prev = stack.pop();
    if (!prev) {
      console.log('Unexpected closing', ch, 'at', i);
      console.log(src.slice(Math.max(0, i - 250), i + 250));
      process.exit(1);
    }
  }
}
if (stack.length) {
  const last = stack[stack.length - 1];
  console.log('Unclosed at index', last.i, 'char', last.ch);
  console.log(src.slice(Math.max(0, last.i - 300), last.i + 800));
  process.exit(1);
}
console.log('Balanced braces/quotes.');
