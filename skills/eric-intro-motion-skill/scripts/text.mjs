import { openSync } from 'fontkit';
import { fileURLToPath } from 'node:url';

const fontPath = fileURLToPath(new URL('../assets/fonts/NotoSansSC.ttf', import.meta.url));
const base = openSync(fontPath);
const fonts = new Map();
const shaped = new Map();
const segmenter = new Intl.Segmenter('en', { granularity: 'word' });

function font(weight) {
  if (!fonts.has(weight)) fonts.set(weight, base.getVariation({ wght: weight }));
  return fonts.get(weight);
}

function shape(value, weight) {
  const key = `${weight}:${value}`;
  if (shaped.has(key)) return shaped.get(key);
  const face = font(weight);
  for (const char of value) {
    if (!face.hasGlyphForCodePoint(char.codePointAt(0))) {
      throw new Error(`Font is missing ${JSON.stringify(char)}. Choose another font or edit this text; glyphs will not be silently replaced.`);
    }
  }
  const run = face.layout(value);
  let cursor = 0;
  const paths = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < run.glyphs.length; i++) {
    const glyph = run.glyphs[i];
    const pos = run.positions[i];
    const x = cursor + pos.xOffset;
    const y = pos.yOffset;
    const path = glyph.path.toSVG();
    if (path) {
      paths.push(`<path d="${path}" transform="translate(${x} ${y})"/>`);
      const b = glyph.bbox;
      minX = Math.min(minX, x + b.minX); maxX = Math.max(maxX, x + b.maxX);
      minY = Math.min(minY, y + b.minY); maxY = Math.max(maxY, y + b.maxY);
    }
    cursor += pos.xAdvance;
  }
  const result = { paths: paths.join(''), advance: cursor, units: face.unitsPerEm, ascent: face.ascent, bbox: paths.length ? { minX, minY, maxX, maxY } : null };
  shaped.set(key, result);
  return result;
}

export function measure(value, size, weight = 450) {
  const s = shape(value, weight);
  return Math.max(s.advance, s.bbox?.maxX ?? 0) * size / s.units;
}

// Baseline-based labels for imported vector components; still use bundled glyphs.
export function inlineText(x, y, value, size = 16, color = '#132e40', weight = 450, anchor = 'start') {
  const s = shape(String(value), weight), scale = size / s.units;
  const offset = anchor === 'middle' ? s.advance * scale / 2 : anchor === 'end' ? s.advance * scale : 0;
  return `<g fill="${color}" transform="translate(${x - offset} ${y}) scale(${scale} ${-scale})">${s.paths}</g>`;
}

function wrap(value, width, size, weight) {
  const result = [];
  for (const paragraph of value.split('\n')) {
    let line = '';
    for (const { segment } of segmenter.segment(paragraph)) {
      if (measure(line + segment, size, weight) <= width) { line += segment; continue; }
      if (line.trim()) result.push(line.trimEnd());
      line = segment.trimStart();
      if (measure(line, size, weight) > width) {
        let chunk = '';
        for (const char of line) {
          if (measure(chunk + char, size, weight) > width) {
            if (!chunk) throw new Error('A glyph is wider than the text box.');
            result.push(chunk); chunk = '';
          }
          chunk += char;
        }
        line = chunk;
      }
    }
    result.push(line.trimEnd());
  }
  return result;
}

// Outline glyphs instead of relying on whichever fonts happen to be installed.
export function textBox(value, box, { size, minSize = size, weight = 450, color = '#132e40', lineHeight = 1.3, align = 'left', field = 'text' } = {}) {
  let lines, chosen;
  for (let candidate = size; candidate >= minSize - 0.01; candidate -= 1) {
    lines = wrap(value, box.w, candidate, weight);
    if (lines.length * candidate * lineHeight <= box.h + 0.01) { chosen = candidate; break; }
  }
  if (chosen === undefined) throw new Error(`Text overflow in ${field}: shorten the copy or enlarge its box. Nothing was truncated.`);
  const markup = [];
  const bounds = [];
  lines.forEach((line, index) => {
    const s = shape(line, weight), scale = chosen / s.units;
    const width = Math.max(s.advance, s.bbox?.maxX ?? 0) * scale;
    const x = box.x + (align === 'center' ? (box.w - width) / 2 : 0);
    const baseline = box.y + chosen + index * chosen * lineHeight;
    markup.push(`<g fill="${color}" transform="translate(${x} ${baseline}) scale(${scale} ${-scale})">${s.paths}</g>`);
    if (s.bbox) bounds.push({ x: x + s.bbox.minX * scale, y: baseline - s.bbox.maxY * scale, w: (s.bbox.maxX - s.bbox.minX) * scale, h: (s.bbox.maxY - s.bbox.minY) * scale });
  });
  for (const b of bounds) {
    if (b.x < box.x - 1 || b.x + b.w > box.x + box.w + 1 || b.y < box.y - 1 || b.y + b.h > box.y + box.h + 1) {
      throw new Error(`Glyph bounds exceed ${field}. Enlarge the text box or change the copy.`);
    }
  }
  return { svg: markup.join(''), lines, size: chosen, bounds, field, box };
}
