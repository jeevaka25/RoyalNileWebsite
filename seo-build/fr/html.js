// Minimal, dependency-free HTML tokenizer for the French builder.
// It never re-serialises markup: untouched tokens are written back byte for byte.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);

function tokenize(html) {
  const tokens = [];
  const re = /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?([a-zA-Z][a-zA-Z0-9-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/g;
  let last = 0, m;
  while ((m = re.exec(html))) {
    if (m.index > last) tokens.push({ type: 'text', raw: html.slice(last, m.index) });
    const raw = m[0];
    if (raw.startsWith('<!--') || raw.startsWith('<!')) { tokens.push({ type: 'other', raw }); last = re.lastIndex; continue; }
    const name = m[1].toLowerCase();
    if (raw.startsWith('</')) { tokens.push({ type: 'close', name, raw }); last = re.lastIndex; continue; }
    tokens.push({ type: 'open', name, raw });
    last = re.lastIndex;
    if (RAW.has(name)) {
      const end = html.toLowerCase().indexOf('</' + name, last);
      tokens.push({ type: name === 'title' ? 'text' : 'raw', raw: html.slice(last, end), name });
      last = end; re.lastIndex = end;
    }
  }
  if (last < html.length) tokens.push({ type: 'text', raw: html.slice(last) });
  return tokens;
}

// Attribute helpers that edit the tag string in place.
const attrRe = (name) => new RegExp(`(\\s${name}=)("([^"]*)"|'([^']*)')`, 'i');
function getAttr(tag, name) { const m = tag.match(attrRe(name)); return m ? (m[3] ?? m[4]) : null; }
function setAttr(tag, name, value) {
  if (getAttr(tag, name) === null) return tag.replace(/\s*(\/?)>$/, ` ${name}="${value}"$1>`);
  return tag.replace(attrRe(name), (_, pre) => `${pre}"${value}"`);
}
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&');
const encodeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const encodeAttr = (s) => encodeText(s).replace(/"/g, '&quot;');

// Walk tokens keeping a stack of open elements so callers can see context (classes, ids).
function walk(tokens, visit) {
  const stack = [];
  tokens.forEach((t, i) => {
    if (t.type === 'open') {
      visit(t, stack, i);
      if (!VOID.has(t.name) && !/\/>$/.test(t.raw)) stack.push({ name: t.name, cls: getAttr(t.raw, 'class') || '', id: getAttr(t.raw, 'id') || '' });
    } else if (t.type === 'close') {
      const at = stack.map((s) => s.name).lastIndexOf(t.name);
      if (at >= 0) stack.length = at;
      visit(t, stack, i);
    } else visit(t, stack, i);
  });
}

module.exports = { tokenize, walk, getAttr, setAttr, decode, encodeText, encodeAttr, VOID };
