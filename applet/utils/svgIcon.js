// SVG icon utilities — encode icons as CSS background-image data URIs
// Works in WeChat mini-program via background-image (image src doesn't support svg data URIs)

// Base64 encoder (btoa not available in WeChat mini-program)
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function toBase64(str) {
  var result = ''
  var i = 0
  var len = str.length
  while (i < len) {
    var a = str.charCodeAt(i++) & 0xff
    var b = i < len ? str.charCodeAt(i++) & 0xff : NaN
    var c = i < len ? str.charCodeAt(i++) & 0xff : NaN
    result += BASE64_CHARS.charAt(a >> 2)
    result += BASE64_CHARS.charAt(((a & 3) << 4) | (b >> 4))
    result += isNaN(b) ? '=' : BASE64_CHARS.charAt(((b & 15) << 2) | (c >> 6))
    result += isNaN(c) ? '=' : BASE64_CHARS.charAt(c & 63)
  }
  return result
}

function enc(svg) {
  return 'url("data:image/svg+xml;base64,' + toBase64(svg) + '")'
}

const DEFS = {
  search: c =>
    `<svg width='20' height='20' viewBox='0 0 20 20' fill='none'><circle cx='9' cy='9' r='6' stroke='${c}' stroke-width='1.6'/><path d='M14 14l4 4' stroke='${c}' stroke-width='1.6' stroke-linecap='round'/></svg>`,
  home: (c, f) =>
    `<svg width='24' height='24' viewBox='0 0 24 24' fill='none'><path d='M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/></svg>`,
  course: (c, f) =>
    `<svg width='24' height='24' viewBox='0 0 24 24' fill='none'><path d='M4 5c2-1 4-1 7 0v15c-3-1-5-1-7 0V5z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/><path d='M20 5c-2-1-4-1-7 0v15c3-1 5-1 7 0V5z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/></svg>`,
  order: (c, f) =>
    `<svg width='24' height='24' viewBox='0 0 24 24' fill='none'><rect x='3.5' y='5.5' width='17' height='15' rx='3' stroke='${c}' stroke-width='1.6' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/><path d='M8 3v4M16 3v4M3.5 10h17' stroke='${c}' stroke-width='1.6' stroke-linecap='round'/></svg>`,
  mine: (c, f) =>
    `<svg width='24' height='24' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='8' r='4' stroke='${c}' stroke-width='1.6' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/><path d='M4 21c1.5-4 5-6 8-6s6.5 2 8 6' stroke='${c}' stroke-width='1.6' stroke-linecap='round'/></svg>`,
  user: c =>
    `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='8' r='4' stroke='${c}' stroke-width='1.6'/><path d='M4 21c1.5-4 5-6 8-6s6.5 2 8 6' stroke='${c}' stroke-width='1.6' stroke-linecap='round'/></svg>`,
  clock: c =>
    `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='9' stroke='${c}' stroke-width='1.6'/><path d='M12 7v5l3 2' stroke='${c}' stroke-width='1.6' stroke-linecap='round'/></svg>`,
  pin: c =>
    `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round'/><circle cx='12' cy='9' r='2.5' stroke='${c}' stroke-width='1.6'/></svg>`,
  chevron: c =>
    `<svg width='14' height='14' viewBox='0 0 24 24' fill='none'><path d='M9 5l7 7-7 7' stroke='${c}' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  bell: c =>
    `<svg width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M6 9a6 6 0 0112 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7zM10 19a2 2 0 004 0' stroke='${c}' stroke-width='1.6' stroke-linejoin='round' stroke-linecap='round'/></svg>`,
  phone: c =>
    `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M5 4h3l2 5-2 1a11 11 0 006 6l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round'/></svg>`,
  star: c =>
    `<svg width='12' height='12' viewBox='0 0 24 24' fill='${c}'><path d='M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z' stroke='${c}' stroke-width='1.4' stroke-linejoin='round'/></svg>`,
  heart: (c, f) =>
    `<svg width='18' height='18' viewBox='0 0 24 24' fill='${f ? c : 'none'}'><path d='M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round'/></svg>`,
  share: c =>
    `<svg width='18' height='18' viewBox='0 0 24 24' fill='none'><circle cx='6' cy='12' r='2.5' stroke='${c}' stroke-width='1.6'/><circle cx='17' cy='6' r='2.5' stroke='${c}' stroke-width='1.6'/><circle cx='17' cy='18' r='2.5' stroke='${c}' stroke-width='1.6'/><path d='M8.2 11l6.6-3.5M8.2 13l6.6 3.5' stroke='${c}' stroke-width='1.6'/></svg>`,
  nav: c =>
    `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M21 3L3 11l8 2 2 8 8-18z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round'/></svg>`,
  calendar: (c, f) =>
    `<svg width='22' height='22' viewBox='0 0 24 24' fill='none'><rect x='3.5' y='5.5' width='17' height='15' rx='3' stroke='${c}' stroke-width='1.6' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/><path d='M8 3v4M16 3v4M3.5 10h17' stroke='${c}' stroke-width='1.6' stroke-linecap='round'/></svg>`,
  mic: c =>
    `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><rect x='9' y='3' width='6' height='11' rx='3' stroke='${c}' stroke-width='1.6'/><path d='M5 11a7 7 0 0014 0M12 18v3' stroke='${c}' stroke-width='1.6' stroke-linecap='round'/></svg>`,
  filter: c =>
    `<svg width='16' height='16' viewBox='0 0 24 24' fill='none'><path d='M4 5h16M7 12h10M10 19h4' stroke='${c}' stroke-width='1.8' stroke-linecap='round'/></svg>`,
  wechat: c =>
    `<svg width='20' height='20' viewBox='0 0 24 24' fill='${c}'><path d='M9 5C5.1 5 2 7.7 2 11c0 1.7.9 3.3 2.4 4.4L4 18l2.6-1.4c.5.1 1 .2 1.6.2.2-2.7 2.7-5 6-5.4C13.7 8.5 11.5 5 9 5zM6.5 9.5a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2z'/><path d='M22 15.5c0-2.7-2.7-5-6-5s-6 2.3-6 5 2.7 5 6 5c.5 0 1 0 1.4-.1L20 22l-.4-1.8c1.4-1 2.4-2.4 2.4-4.7zm-8-1a.8.8 0 110 1.6.8.8 0 010-1.6zm4 0a.8.8 0 110 1.6.8.8 0 010-1.6z'/></svg>`,
  check: c =>
    `<svg width='14' height='14' viewBox='0 0 24 24' fill='none'><path d='M5 12l4.5 4.5L19 7' stroke='${c}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  plus: c =>
    `<svg width='14' height='14' viewBox='0 0 24 24' fill='none'><path d='M12 5v14M5 12h14' stroke='${c}' stroke-width='2' stroke-linecap='round'/></svg>`,
  book: (c, f) =>
    `<svg width='22' height='22' viewBox='0 0 24 24' fill='none'><path d='M4 5c2-1 4-1 7 0v15c-3-1-5-1-7 0V5z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/><path d='M20 5c-2-1-4-1-7 0v15c3-1 5-1 7 0V5z' stroke='${c}' stroke-width='1.6' stroke-linejoin='round' fill='${f ? c : 'none'}' fill-opacity='${f ? 0.18 : 0}'/></svg>`,
}

/**
 * Returns an inline style object that renders an SVG icon via background-image.
 * @param {string} name - icon name from DEFS
 * @param {string} color - CSS color string, e.g. '#D97757' or 'var(--primary)'
 * @param {boolean} filled - whether the icon should be filled (for icons that support it)
 * @param {string} size - CSS size with unit, e.g. '32rpx' or '16px'
 */
export function svgBg(name, color, filled = false, size = '32rpx') {
  const fn = DEFS[name]
  if (!fn) return {}
  return {
    backgroundImage: enc(fn(color, filled)),
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: size,
    height: size,
    display: 'inline-block',
    flexShrink: '0',
  }
}

/**
 * Returns a base64 data URI string for use in <image src="...">.
 */
export function svgSrc(name, color, filled = false) {
  const fn = DEFS[name]
  if (!fn) return ''
  return 'data:image/svg+xml;base64,' + toBase64(fn(color, filled))
}

export { DEFS, enc }
