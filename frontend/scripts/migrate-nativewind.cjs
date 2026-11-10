const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const root = path.resolve(__dirname, '..');
const colors = { cream: '#FFF9F0', paper: '#FFFFFF', ink: '#17212B', muted: '#6B7480', line: '#E8E3DB', yellow: '#F8AD05', amber: '#F8AD05', amberSoft: '#FFF1C7', navySoft: '#EAF1F7', green: '#2D9D66', greenSoft: '#E7F6EC', red: '#D94B4B', redSoft: '#FDEAEA' };

function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(dir, entry.name)) : entry.name.endsWith('.tsx') ? [path.join(dir, entry.name)] : []); }
function literal(node) {
  if (node.type === 'StringLiteral' || node.type === 'NumericLiteral') return node.value;
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'NumericLiteral') return -node.argument.value;
  if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'colors' && node.property.type === 'Identifier') return colors[node.property.name];
}
function unit(prefix, value) { return `${prefix}-[${typeof value === 'number' ? `${value}px` : value}]`; }
function utility(name, value) {
  if (value === undefined) return null;
  const spacing = { margin: 'm', marginTop: 'mt', marginRight: 'mr', marginBottom: 'mb', marginLeft: 'ml', marginHorizontal: 'mx', marginVertical: 'my', padding: 'p', paddingTop: 'pt', paddingRight: 'pr', paddingBottom: 'pb', paddingLeft: 'pl', paddingHorizontal: 'px', paddingVertical: 'py', top: 'top', right: 'right', bottom: 'bottom', left: 'left', gap: 'gap' };
  const dimensions = { width: 'w', height: 'h', minWidth: 'min-w', minHeight: 'min-h', maxWidth: 'max-w', maxHeight: 'max-h' };
  const fixed = { flex: value === 1 ? 'flex-1' : null, flexDirection: { row: 'flex-row', column: 'flex-col' }[value], flexWrap: { wrap: 'flex-wrap', nowrap: 'flex-nowrap' }[value], alignItems: { center: 'items-center', 'flex-start': 'items-start', 'flex-end': 'items-end', stretch: 'items-stretch' }[value], alignSelf: { center: 'self-center', 'flex-start': 'self-start', 'flex-end': 'self-end', stretch: 'self-stretch' }[value], justifyContent: { center: 'justify-center', 'flex-start': 'justify-start', 'flex-end': 'justify-end', 'space-between': 'justify-between', 'space-around': 'justify-around', 'space-evenly': 'justify-evenly' }[value], position: { absolute: 'absolute', relative: 'relative' }[value], overflow: { hidden: 'overflow-hidden', visible: 'overflow-visible' }[value], textAlign: { center: 'text-center', left: 'text-left', right: 'text-right' }[value], textTransform: { uppercase: 'uppercase', lowercase: 'lowercase', capitalize: 'capitalize' }[value], resizeMode: { contain: 'object-contain', cover: 'object-cover' }[value] };
  if (spacing[name]) return unit(spacing[name], value);
  if (dimensions[name]) return unit(dimensions[name], value);
  if (fixed[name]) return fixed[name];
  if (name === 'backgroundColor') return `bg-[${value}]`;
  if (name === 'color') return `text-[${value}]`;
  if (name === 'borderColor') return `border-[${value}]`;
  if (name === 'borderTopColor') return `border-t-[${value}]`;
  if (name === 'borderBottomColor') return `border-b-[${value}]`;
  if (name === 'borderWidth') return value === 1 ? 'border' : unit('border', value);
  if (name === 'borderTopWidth') return value === 1 ? 'border-t' : unit('border-t', value);
  if (name === 'borderBottomWidth') return value === 1 ? 'border-b' : unit('border-b', value);
  if (name === 'borderRadius') return unit('rounded', value);
  if (name === 'fontSize') return unit('text', value);
  if (name === 'lineHeight') return unit('leading', value);
  if (name === 'letterSpacing') return unit('tracking', value);
  if (name === 'aspectRatio') return `aspect-[${value}]`;
  if (name === 'opacity') return `opacity-[${value}]`;
  if (name === 'zIndex') return `z-[${value}]`;
  if (name === 'fontWeight') return ({ '100': 'font-thin', '200': 'font-extralight', '300': 'font-light', '400': 'font-normal', '500': 'font-medium', '600': 'font-semibold', '700': 'font-bold', '800': 'font-extrabold', '900': 'font-black' })[String(value)] || null;
  return null;
}
function toClasses(node) { if (node.type !== 'ObjectExpression') return null; const classes = node.properties.map((prop) => prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' ? utility(prop.key.name, literal(prop.value)) : null); return classes.every(Boolean) ? classes.join(' ') : null; }

for (const file of files(path.join(root, 'features'))) {
  let source = fs.readFileSync(file, 'utf8');
  if (!source.includes('StyleSheet.create')) continue;
  const ast = parser.parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
  let sheet; const candidate = new Set(); const unsafe = new Set(); const changes = [];
  traverse(ast, { CallExpression(p) { const n = p.node; if (n.callee.type === 'MemberExpression' && n.callee.object.type === 'Identifier' && n.callee.object.name === 'StyleSheet' && n.callee.property.type === 'Identifier' && n.callee.property.name === 'create' && n.arguments[0]?.type === 'ObjectExpression') { sheet = n; n.arguments[0].properties.forEach((prop) => { if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && toClasses(prop.value)) candidate.add(prop.key.name); }); } } });
  if (!sheet) continue;
  const member = (node) => node?.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'styles' && node.property.type === 'Identifier' && !node.computed ? node.property.name : null;
  const convertible = (node) => {
    const key = member(node); if (key) return candidate.has(key);
    if (node?.type === 'LogicalExpression' && node.operator === '&&') return convertible(node.right);
    return false;
  };
  traverse(ast, { JSXAttribute(p) { const n = p.node; if (n.name.type !== 'JSXIdentifier' || n.name.name !== 'style' || n.value?.type !== 'JSXExpressionContainer') return; const e = n.value.expression; const keys = []; if (member(e)) keys.push(member(e)); if (e.type === 'ArrayExpression') e.elements.forEach((x) => { const key = member(x) || (x?.type === 'LogicalExpression' ? member(x.right) : null); if (key) keys.push(key); }); if (!convertible(e) && !(e.type === 'ArrayExpression' && e.elements.every(convertible))) keys.forEach((key) => unsafe.add(key)); } });
  const classKeys = new Set([...candidate].filter((key) => !unsafe.has(key)));
  const classExpression = (node) => { const key = member(node); if (key && classKeys.has(key)) return `styles.${key}`; if (node?.type === 'LogicalExpression' && node.operator === '&&') { const right = classExpression(node.right); return right ? `(${source.slice(node.left.start, node.left.end)} && ${right})` : null; } return null; };
  traverse(ast, { JSXAttribute(p) { const n = p.node; if (n.name.type !== 'JSXIdentifier' || n.name.name !== 'style' || n.value?.type !== 'JSXExpressionContainer') return; const e = n.value.expression; let expression = classExpression(e); if (!expression && e.type === 'ArrayExpression') { const parts = e.elements.map(classExpression); if (parts.every(Boolean)) expression = `[${parts.join(', ')}].filter(Boolean).join(' ')`; } if (expression) changes.push({ start: n.start, end: n.end, text: `className={${expression}}` }); } });
  const object = sheet.arguments[0]; const entries = object.properties.map((prop) => { if (prop.type !== 'ObjectProperty' || prop.key.type !== 'Identifier') return source.slice(prop.start, prop.end); const name = prop.key.name; const classes = toClasses(prop.value); return classes && classKeys.has(name) ? `${name}: '${classes}'` : source.slice(prop.start, prop.end); });
  changes.push({ start: sheet.start, end: sheet.end, text: `{ ${entries.join(', ')} } as const` });
  const importMatch = source.match(/import\s*\{([^}]*)\}\s*from\s*['"]react-native['"];/);
  if (importMatch && !source.slice(sheet.end).includes('StyleSheet.')) { const cleaned = importMatch[0].replace(/\bStyleSheet,?\s*/g, '').replace(/,\s*}/, ' }'); changes.push({ start: importMatch.index, end: importMatch.index + importMatch[0].length, text: cleaned }); }
  changes.sort((a, b) => b.start - a.start).forEach((change) => { source = source.slice(0, change.start) + change.text + source.slice(change.end); });
  fs.writeFileSync(file, source); console.log(path.relative(root, file));
}
