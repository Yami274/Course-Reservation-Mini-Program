// Generate CSS classes for ONLY the icon+color combos actually used in the codebase
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
function toBase64(str) {
  let result = '', i = 0, len = str.length
  while (i < len) {
    const a = str.charCodeAt(i++) & 0xff
    const b = i < len ? str.charCodeAt(i++) & 0xff : NaN
    const c = i < len ? str.charCodeAt(i++) & 0xff : NaN
    result += BASE64_CHARS.charAt(a >> 2)
    result += BASE64_CHARS.charAt(((a & 3) << 4) | (b >> 4))
    result += isNaN(b) ? '=' : BASE64_CHARS.charAt(((b & 15) << 2) | (c >> 6))
    result += isNaN(c) ? '=' : BASE64_CHARS.charAt(c & 63)
  }
  return result
}

const DEFS = {
  search: c => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="${c}" stroke-width="1.6"/><path d="M14 14l4 4" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  home: (c, f) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/></svg>`,
  course: (c, f) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 5c2-1 4-1 7 0v15c-3-1-5-1-7 0V5z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/><path d="M20 5c-2-1-4-1-7 0v15c3-1 5-1 7 0V5z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/></svg>`,
  order: (c, f) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="${c}" stroke-width="1.6" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/><path d="M8 3v4M16 3v4M3.5 10h17" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  mine: (c, f) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="${c}" stroke-width="1.6" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  user: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="${c}" stroke-width="1.6"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  clock: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="${c}" stroke-width="1.6"/><path d="M12 7v5l3 2" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  pin: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="${c}" stroke-width="1.6"/></svg>`,
  chevron: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'chevron-left': c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bell: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 0112 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7zM10 19a2 2 0 004 0" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  phone: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 4h3l2 5-2 1a11 11 0 006 6l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  star: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" stroke="${c}" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  heart: (c, f) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${f ? c : 'none'}"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  nav: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 3L3 11l8 2 2 8 8-18z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  calendar: (c, f) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="${c}" stroke-width="1.6" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/><path d="M8 3v4M16 3v4M3.5 10h17" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  mic: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="${c}" stroke-width="1.6"/><path d="M5 11a7 7 0 0014 0M12 18v3" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  filter: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 5h16M7 12h10M10 19h4" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  wechat: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${c}"><path d="M9 5C5.1 5 2 7.7 2 11c0 1.7.9 3.3 2.4 4.4L4 18l2.6-1.4c.5.1 1 .2 1.6.2.2-2.7 2.7-5 6-5.4C13.7 8.5 11.5 5 9 5zM6.5 9.5a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2z"/><path d="M22 15.5c0-2.7-2.7-5-6-5s-6 2.3-6 5 2.7 5 6 5c.5 0 1 0 1.4-.1L20 22l-.4-1.8c1.4-1 2.4-2.4 2.4-4.7zm-8-1a.8.8 0 110 1.6.8.8 0 010-1.6zm4 0a.8.8 0 110 1.6.8.8 0 010-1.6z"/></svg>`,
  check: c => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l4.5 4.5L19 7" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  book: (c, f) => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 5c2-1 4-1 7 0v15c-3-1-5-1-7 0V5z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/><path d="M20 5c-2-1-4-1-7 0v15c3-1 5-1 7 0V5z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" fill="${f ? c : 'none'}" fill-opacity="${f ? 0.18 : 0}"/></svg>`,
}

// Only the icon+color combinations actually used in the codebase
const USED = [
  // HomeContent
  ['search', '#8A7E70'], ['mic', '#8A7E70'], ['user', '#8A7E70'], ['clock', '#8A7E70'],
  // CourseContent
  ['filter', '#8A7E70'],
  // OrderContent
  // (clock & user already covered)
  // MineContent menu
  ['chevron', '#8A7E70'], ['calendar', '#FFFCF5'], ['user', '#D97757'], ['heart', '#A0473F', true],
  ['bell', '#E8B860'], ['pin', '#6B7F5A'], ['wechat', '#6B7F5A'], ['phone', '#D97757'],
  ['book', '#5A4F44'],
  // course/list.vue
  ['search', '#2A2520'], ['filter', '#5A4F44'],
  // order/list.vue - covered
  // mine/index.vue
  ['calendar', '#D97757'], ['user', '#6B7F5A'], ['bell', '#D97757'], ['pin', '#D97757'],
  ['wechat', '#D97757'], ['phone', '#6B7F5A'], ['book', '#8A7E70'],
  // course/detail.vue
  ['check', '#D97757'], ['pin', '#D97757'], ['nav', '#D97757'], ['wechat', '#6B7F5A'],
  ['heart', '#D97757', true],
  // mine/favorites.vue
  ['chevron-left', '#2A2520'], ['heart', '#D97757', true],
  // order/create.vue
  ['chevron-left', '#2A2520'], ['clock', '#5A4F44'],
  // order/detail.vue
  ['clock', '#D97757'], ['pin', '#D97757'], ['calendar', '#8A7E70'], ['phone', '#A0473F'],
  ['check', '#6B7F5A'],
  // order/success.vue
  ['check', '#FFFCF5'],
  // mine/location.vue
  ['phone', '#5A4F44'], ['pin', '#5A4F44'],
  // mine/students.vue - chevron-left covered
  // mine/notifications.vue - chevron-left covered
  // course/teacher.vue
  ['star', '#E8B860'],
  // course/search.vue - search covered
]

let css = '/* Auto-generated SVG icon CSS - base classes */\n'
css += '.s-icon{background-size:contain;background-repeat:no-repeat;background-position:center;display:inline-block;flex-shrink:0}\n\n'

const seen = new Set()
for (const [name, color, filled] of USED) {
  const key = `${name}|${color}|${filled ? 1 : 0}`
  if (seen.has(key)) continue
  seen.add(key)

  const fn = DEFS[name]
  const svg = typeof fn === 'function' ? fn(color, filled || false) : fn
  const b64 = toBase64(svg)
  const cls = `s-${name}-${color.replace('#', '')}${filled ? '-on' : ''}`
  css += `.${cls}{background-image:url("data:image/svg+xml;base64,${b64}")}\n`
}

console.log(css)
