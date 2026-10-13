// Independent implementations of common motion techniques. No third-party code or footage.
import { inlineText } from '../text.mjs';
const tau = Math.PI * 2;
const n = value => Number(value.toFixed(3));
export function stagger(t) {
  let svg = '';
  for (let row = 0; row < 7; row++) for (let col = 0; col < 11; col++) {
    const distance = Math.hypot(col - 5, row - 3);
    const phase = t * 1.8 - distance * .55;
    const p = (.5 + .5 * Math.sin(phase));
    const size = 16 + p * 18, x = 50 + col * 50, y = 54 + row * 50;
    svg += `<rect x="${n(-size/2)}" y="${n(-size/2)}" width="${n(size)}" height="${n(size)}" rx="${n(p*size/2)}" fill="${p>.65?'#a4eee2':p>.3?'#647aff':'#405070'}" transform="translate(${x} ${y}) rotate(${n(p*90)})"/>`;
  }
  return svg;
}
export function trace(t) {
  let svg = '';
  for (let i = 0; i < 5; i++) {
    const r = 63 + i * 28, circumference = tau * r;
    const angle = t * (i % 2 ? -.55 : .6) + i * .9;
    const x = 300 + Math.cos(angle) * r, y = 215 + Math.sin(angle) * r;
    svg += `<circle cx="300" cy="215" r="${r}" fill="none" stroke="#31425b" stroke-width="1.5"/><circle cx="300" cy="215" r="${r}" fill="none" stroke="${i%2?'#647aff':'#a4eee2'}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${circumference*.27} ${circumference*.73}" transform="rotate(${n(angle*180/Math.PI-97)} 300 215)"/><circle cx="${n(x)}" cy="${n(y)}" r="6" fill="#faf8f0"/>`;
  }
  return svg + inlineText(300,226,'KEEP GOING',15,'#faf8f0',650,'middle');
}
export function ticker(t) {
  let svg = '';
  ['MAKE / TRY /','KEEP / GOING /','LEARN / REPEAT /'].forEach((label,i) => {
    const width = 565, offset = ((t * (i%2?-70:60)) % width + width) % width;
    let strip = '';
    for(let j=-1;j<3;j++) strip += inlineText(j*width-offset,65,label,57,i===1?'#17233b':'#faf8f0',800);
    svg += `<g transform="translate(0 ${62+i*105}) rotate(${i%2?5:-5} 300 40)"><rect x="-120" y="-2" width="840" height="92" fill="${i===1?'#a4eee2':'#4457ed'}"/>${strip}</g>`;
  });
  return `<defs><clipPath id="ticker-window"><rect x="0" y="0" width="600" height="430" rx="16"/></clipPath></defs><g clip-path="url(#ticker-window)">${svg}</g>`;
}
export const referenceModules = {stagger,trace,ticker};
