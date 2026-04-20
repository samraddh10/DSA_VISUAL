export function encodeShareState(state) {
  const params = new URLSearchParams()
  if (state.alg) params.set('alg', state.alg)
  if (state.algB) params.set('algB', state.algB)
  if (Array.isArray(state.data) && state.data.length > 0) {
    params.set('data', state.data.join('.'))
  }
  if (state.target !== undefined && state.target !== null) {
    params.set('target', String(state.target))
  }
  if (state.step !== undefined && state.step > 0) {
    params.set('step', String(state.step))
  }
  return params.toString()
}

export function decodeShareState(search) {
  const params = new URLSearchParams(search)
  const out = {}
  const alg = params.get('alg')
  const algB = params.get('algB')
  const data = params.get('data')
  const target = params.get('target')
  const step = params.get('step')
  if (alg) out.alg = alg
  if (algB) out.algB = algB
  if (data) {
    const parsed = data
      .split('.')
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n))
    if (parsed.length > 0) out.data = parsed
  }
  if (target !== null) {
    const t = parseInt(target, 10)
    if (!isNaN(t)) out.target = t
  }
  if (step !== null) {
    const s = parseInt(step, 10)
    if (!isNaN(s) && s >= 0) out.step = s
  }
  return out
}

export function buildShareUrl(path, state) {
  const qs = encodeShareState(state)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return qs ? `${origin}${path}?${qs}` : `${origin}${path}`
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}
