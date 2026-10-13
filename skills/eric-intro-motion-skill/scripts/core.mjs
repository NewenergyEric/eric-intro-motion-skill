import { textBox } from './text.mjs';

export const PALETTE = { paper: '#f4f6f3', ink: '#132e40', muted: '#526a76', line: '#c6d2d2', blue: '#385bfa', teal: '#087f85', pale: '#e7efeb', white: '#ffffff' };
export const DEFAULT_SAFE = { left: 0.07, right: 0.07, top: 0.07, bottom: 0.08 };
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const rect = (x, y, w, h, fill, stroke = 'none', radius = 0, sw = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const line = (x1, y1, x2, y2, color, sw = 2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" ${extra}/>`;
const circle = (x, y, r, fill, stroke = 'none', sw = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const pi = Math.PI;

export function validateStory(input) {
  if (!input || input.schemaVersion !== 1) throw new Error('schemaVersion must be 1.');
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(input.id)) throw new Error('id must contain 1–64 lowercase letters, digits, or hyphens.');
  if (!['flow', 'orbit', 'stack'].includes(input.motif)) throw new Error('motif must be flow, orbit, or stack.');
  const known = new Set(['schemaVersion', 'id', 'lang', 'motif', 'eyebrow', 'title', 'subtitle', 'cards', 'footer', 'duration']);
  for (const key of Object.keys(input)) if (!known.has(key)) throw new Error(`Unknown story field: ${key}`);
  for (const key of ['lang', 'eyebrow', 'title', 'subtitle', 'footer']) {
    if (typeof input[key] !== 'string' || !input[key].trim()) throw new Error(`${key} must be a nonempty string.`);
    if (input[key].length > 1000) throw new Error(`${key} is too long for a short motion story.`);
  }
  if (!Array.isArray(input.cards) || input.cards.length !== 3) throw new Error('The starter motifs use exactly three cards. For other structures, add a new motif rather than dropping content.');
  for (const [index, card] of input.cards.entries()) {
    for (const key of Object.keys(card)) if (!['label', 'caption'].includes(key)) throw new Error(`Unknown cards[${index}] field: ${key}`);
    for (const key of ['label', 'caption']) if (typeof card[key] !== 'string' || !card[key].trim() || card[key].length > 300) throw new Error(`cards[${index}].${key} must be a short nonempty string.`);
  }
  if (!Number.isFinite(input.duration) || input.duration < 2 || input.duration > 30) throw new Error('duration must be between 2 and 30 seconds.');
  return input;
}

export function dimensions(width, height, safe = DEFAULT_SAFE) {
  if (![width, height].every(n => Number.isInteger(n) && n >= 480 && n <= 4096 && n % 2 === 0)) throw new Error('Width and height must be even integers from 480 to 4096.');
  if (width / height < 1 / 2.4 || width / height > 2.4) throw new Error('The starter layouts support ratios between 1:2.4 and 2.4:1.');
  for (const edge of ['left', 'right', 'top', 'bottom']) if (!Number.isFinite(safe[edge]) || safe[edge] < 0.04 || safe[edge] > 0.2) throw new Error(`safe.${edge} must be between 0.04 and 0.2.`);
  return { x: width * safe.left, y: height * safe.top, w: width * (1 - safe.left - safe.right), h: height * (1 - safe.top - safe.bottom) };
}

export function makeComposition(raw, { width = 1920, height = 1080, safe = DEFAULT_SAFE } = {}) {
  const story = validateStory(raw), a = dimensions(width, height, safe), c = PALETTE;
  const s = Math.min(width, height) / 1000;
  const wide = width / height >= 1.35;
  const vertical = width / height < 0.9;
  const audit = [], still = [];
  const addText = (value, box, options) => {
    const result = textBox(value, box, options);
    audit.push({ field: result.field, box, fontSize: result.size, lines: result.lines, bounds: result.bounds });
    return result.svg;
  };
  still.push(circle(a.x + 6 * s, a.y + 13 * s, 5 * s, c.teal));
  still.push(addText(story.eyebrow, { x: a.x + 24 * s, y: a.y, w: a.w - 24 * s, h: 35 * s }, { size: 18 * s, minSize: 16 * s, weight: 650, color: c.teal, field: 'eyebrow' }));
  const title = wide ? { x: a.x, y: a.y + 115 * s, w: a.w * 0.38, h: 265 * s } : { x: a.x, y: a.y + 64 * s, w: a.w, h: 183 * s };
  still.push(addText(story.title, title, { size: 67 * s, minSize: 54 * s, weight: 650, lineHeight: 1.23, field: 'title' }));
  const sub = wide ? { x: a.x + 2 * s, y: title.y + title.h + 12 * s, w: a.w * 0.34, h: 150 * s } : { x: a.x + 2 * s, y: title.y + title.h + 14 * s, w: a.w * 0.95, h: 85 * s };
  still.push(addText(story.subtitle, sub, { size: 30 * s, minSize: 27 * s, color: c.muted, lineHeight: 1.4, field: 'subtitle' }));
  const footerY = a.y + a.h - 30 * s;
  still.push(line(a.x, footerY - 25 * s, a.x + a.w, footerY - 25 * s, c.line, s));
  still.push(addText(story.footer, { x: a.x, y: footerY, w: a.w - 85 * s, h: 30 * s }, { size: 17 * s, minSize: 15 * s, color: c.muted, field: 'footer' }));
  const hero = wide ? { x: a.x + a.w * 0.44, y: a.y + 93 * s, w: a.w * 0.56, h: footerY - a.y - 145 * s } : { x: a.x, y: sub.y + sub.h + 33 * s, w: a.w, h: footerY - 50 * s - (sub.y + sub.h + 33 * s) };
  if (hero.h < 180 * s) throw new Error('Not enough room for the diagram. Use shorter copy, smaller safe insets, or a taller canvas.');

  function cardText(card, i, box, compact = false) {
    const labelSize = compact ? 32 * s : 34 * s;
    return addText(card.label, { x: box.x, y: box.y, w: box.w, h: 44 * s }, { size: labelSize, minSize: 29 * s, weight: 650, field: `cards[${i}].label` }) +
      addText(card.caption, { x: box.x, y: box.y + 49 * s, w: box.w, h: box.h - 49 * s }, { size: 26 * s, minSize: 24 * s, color: c.muted, lineHeight: 1.35, field: `cards[${i}].caption` });
  }

  function icon(kind, x, y, size, p) {
    const k = size / 100, pieces = [];
    const wave = (Math.sin(p * 2 * pi) + 1) / 2;
    if (kind === 0) {
      pieces.push(rect(18, 10, 64, 79, c.white, c.ink, 7, 2.2));
      pieces.push(line(31, 30, 66, 30, c.ink, 3));
      pieces.push(line(31, 43, 59, 43, c.line, 3));
      pieces.push(line(31, 56, 50 + 16 * wave, 56, c.teal, 3));
      pieces.push(circle(76, 75, 16, c.blue));
      pieces.push(line(70, 75, 82, 75, c.white, 2));
      pieces.push(line(76, 69, 76, 81, c.white, 2));
    } else if (kind === 1) {
      pieces.push(rect(12, 16, 77, 68, c.white, c.ink, 8, 2.2));
      pieces.push(line(25, 33, 75, 33, c.line, 2));
      for (let j = 0; j < 3; j++) {
        const h = 14 + j * 9 + 7 * Math.sin((p + j / 5) * 2 * pi);
        pieces.push(rect(26 + j * 17, 70 - h, 10, h, j === 2 ? c.blue : c.teal, 'none', 2));
      }
    } else {
      pieces.push(rect(13, 21, 74, 59, c.ink, c.ink, 7, 2));
      for (let j = 0; j < 5; j++) {
        pieces.push(rect(21 + j * 12, 25, 6, 3, c.paper, 'none', 1));
        pieces.push(rect(21 + j * 12, 72, 6, 3, c.paper, 'none', 1));
      }
      pieces.push(`<path d="M 42 39 L 62 50 L 42 61 Z" fill="${c.white}" transform="translate(${wave * 2} 0)"/>`);
      pieces.push(circle(82, 22, 12, c.teal));
      pieces.push(`<path d="M 76 22 l 4 4 l 7 -8" fill="none" stroke="${c.white}" stroke-width="2"/>`);
    }
    return `<g transform="translate(${x} ${y}) scale(${k})">${pieces.join('')}</g>`;
  }

  let draw;
  if (story.motif === 'flow') {
    const rows = vertical;
    const gap = rows ? 35 * s : 22 * s;
    const cw = rows ? hero.w - 50 * s : (hero.w - 2 * gap) / 3;
    const ch = rows ? Math.min((hero.h - 2 * gap) / 3, 165 * s) : Math.min(hero.h - 24 * s, 325 * s);
    const ox = hero.x + (rows ? 25 * s : 0), oy = hero.y + (hero.h - (rows ? ch * 3 + gap * 2 : ch)) / 2;
    const cards = story.cards.map((card, i) => {
      const x = ox + (rows ? 0 : i * (cw + gap)), y = oy + (rows ? i * (ch + gap) : 0);
      const text = rows ? { x: x + 132 * s, y: y + 26 * s, w: cw - 161 * s, h: ch - 35 * s } : { x: x + 19 * s, y: y + 132 * s, w: cw - 38 * s, h: ch - 143 * s };
      return { x, y, text: cardText(card, i, text, !rows) };
    });
    draw = p => {
      const svg = [];
      cards.forEach((card, i) => {
        if (i < 2) {
          const from = rows ? { x: card.x + cw / 2, y: card.y + ch } : { x: card.x + cw, y: card.y + ch / 2 };
          const to = rows ? { x: from.x, y: from.y + gap } : { x: from.x + gap, y: from.y };
          svg.push(line(from.x, from.y, to.x, to.y, c.line, 3 * s));
          const q = (p * 3 + i * 0.5) % 1;
          svg.push(circle(from.x + (to.x - from.x) * q, from.y + (to.y - from.y) * q, 5 * s, c.blue));
        }
        svg.push(rect(card.x, card.y + 6 * s, cw, ch, c.pale, 'none', 15 * s));
        svg.push(rect(card.x, card.y, cw, ch, c.white, c.line, 15 * s, 1.5 * s));
        svg.push(rect(card.x + 18 * s, card.y + 17 * s, 22 * s, 4 * s, i === 1 ? c.blue : c.teal, 'none', 2 * s));
        svg.push(icon(i, card.x + (rows ? 20 * s : (cw - 100 * s) / 2), card.y + (rows ? (ch - 100 * s) / 2 : 26 * s), 100 * s, p + i / 3));
        svg.push(card.text);
      });
      return svg.join('');
    };
  } else if (story.motif === 'orbit') {
    // The hub and all labels are re-positioned for the available region.
    const rowHeight = Math.min(125 * s, hero.h / 3 - 18 * s);
    const hubX = hero.x + hero.w * (vertical ? 0.16 : 0.21), hubY = hero.y + hero.h / 2;
    const nodeX = hero.x + hero.w * (vertical ? 0.36 : 0.42), nodeW = hero.x + hero.w - nodeX;
    const nodes = story.cards.map((card, i) => {
      const y = hero.y + hero.h * ((i + 0.5) / 3) - rowHeight / 2;
      return { x: nodeX, y, text: cardText(card, i, { x: nodeX + 22 * s, y: y + 14 * s, w: nodeW - 42 * s, h: rowHeight - 20 * s }, true) };
    });
    draw = p => {
      const svg = [];
      nodes.forEach((n, i) => {
        const endX = n.x, endY = n.y + rowHeight / 2;
        svg.push(line(hubX, hubY, endX, endY, c.line, 2 * s));
        const q = (p * 2 + i / 3) % 1;
        svg.push(circle(hubX + (endX - hubX) * q, hubY + (endY - hubY) * q, 5 * s, i === 1 ? c.blue : c.teal));
        svg.push(rect(n.x, n.y, nodeW, rowHeight, c.white, c.line, 13 * s, 1.5 * s));
        svg.push(n.text);
      });
      const radius = Math.min(hero.w * 0.13, 86 * s);
      svg.push(circle(hubX, hubY, radius, c.paper, c.line, 1.5 * s));
      svg.push(`<circle cx="${hubX}" cy="${hubY}" r="${radius}" fill="none" stroke="${c.teal}" stroke-width="${3 * s}" stroke-dasharray="${radius * 1.5} ${radius * 4.8}" transform="rotate(${p * 360} ${hubX} ${hubY})"/>`);
      svg.push(circle(hubX, hubY, radius * 0.69, c.ink));
      const pulse = (1 + Math.sin(p * pi * 4)) * 2 * s;
      svg.push(rect(hubX - 24 * s, hubY - 19 * s, 48 * s, 38 * s, c.white, 'none', 10 * s));
      svg.push(circle(hubX - 9 * s, hubY - 2 * s, 3.5 * s, c.teal));
      svg.push(circle(hubX + 9 * s, hubY - 2 * s, 3.5 * s, c.teal));
      svg.push(line(hubX - 9 * s, hubY + 9 * s, hubX + 9 * s, hubY + 9 * s, c.ink, 2 * s));
      svg.push(line(hubX, hubY - 19 * s, hubX, hubY - 31 * s - pulse, c.white, 2 * s));
      svg.push(circle(hubX, hubY - 33 * s - pulse, 4 * s, c.blue));
      return svg.join('');
    };
  } else {
    const cards = story.cards.map((card, i) => {
      const ch = Math.min(135 * s, (hero.h - 32 * s) / 3);
      const x = hero.x + (i % 2 ? 26 * s : 0), y = hero.y + (hero.h - (3 * ch + 24 * s)) / 2 + i * (ch + 12 * s);
      const cw = hero.w - 30 * s;
      return { x, y, w: cw, h: ch, text: cardText(card, i, { x: x + 116 * s, y: y + 19 * s, w: cw - 145 * s, h: ch - 23 * s }, true) };
    });
    draw = p => cards.map((card, i) => {
      const t = (Math.sin((p + i / 3) * pi * 2) + 1) / 2;
      const ix = card.x + 23 * s, iy = card.y + (card.h - 73 * s) / 2;
      const swatch = i === 1 ? c.blue : c.teal;
      return rect(card.x, card.y + 4 * s, card.w, card.h, c.pale, 'none', 12 * s) +
        rect(card.x, card.y, card.w, card.h, c.white, c.line, 12 * s, 1.5 * s) +
        rect(ix - 4 * s * t, iy + 4 * s * t, 70 * s, 70 * s, c.pale, c.line, 8 * s, s) +
        rect(ix, iy, 70 * s, 70 * s, c.paper, c.line, 8 * s, s) +
        `<g transform="translate(${ix + 35 * s} ${iy + 35 * s}) rotate(${i * 45 + 12 * Math.sin(p * pi * 2)})">${i === 1 ? rect(-20 * s, -20 * s, 40 * s, 40 * s, swatch, 'none', 7 * s) : circle(0, 0, (19 + 3 * t) * s, swatch)}</g>` + card.text;
    }).join('');
  }

  for (const entry of audit) {
    for (const b of entry.bounds) {
      if (b.x < a.x - 1 || b.y < a.y - 1 || b.x + b.w > a.x + a.w + 1 || b.y + b.h > a.y + a.h + 1) throw new Error(`${entry.field} leaves the composition's safe area.`);
    }
  }
  const metadata = { width, height, safe, safeArea: a, hero, layout: wide ? 'landscape' : vertical ? 'portrait' : 'square', text: audit };
  function frame(seconds, { guide = false } = {}) {
    const p = ((seconds / story.duration) % 1 + 1) % 1;
    const dots = [0, 1, 2].map(i => circle(a.x + a.w - (45 - i * 17) * s, footerY + 14 * s, 3.2 * s, (p * 3 | 0) === i ? c.teal : c.line)).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${escape(story.title.replaceAll('\n', ' '))}</title><desc>${escape(story.subtitle)}</desc>${rect(0, 0, width, height, c.paper)}${still.join('')}${draw(p)}${dots}${guide ? rect(a.x, a.y, a.w, a.h, 'none', '#e75b43', 0, 2 * s).replace('/>', ' stroke-dasharray="8 8"/>') : ''}</svg>`;
  }
  return { frame, metadata, story };
}
