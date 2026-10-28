// Walk-through timeline: the pure part (no DOM). A lesson with `walk: true` is played as one flat list
// of beats, like advancing slides. This file builds that list from the lesson's scenes and prompts,
// and folds it into the state at any beat. Going back, jumping, and resuming from a pause all call
// stateAt(), so every beat always looks exactly as authored (Ben, 28 October 2026).
//
// Beat kinds, in the order they appear in a scene:
//   scene    the scene opens: heading and givens on screen, no question yet (a recap scene is one
//            scene beat with `explore: true`, the free-play ending)
//   pose     a question appears in the left pane; its answer is not shown
//   step     one working step of the posed question (a step with `answer: true` is kind 'answer')
//   answer   the payoff step of a question
//   animate  a step that carries `play: '<param>'`: the slider sweeps once when you arrive by Next
//
// A step may also carry `set: { param: value }`, a delta on the slider values from that beat on.
// An animate beat sets its slider to the slider's maximum, which is where the sweep ends.

export const KINDS = ['scene', 'pose', 'step', 'answer', 'animate']

export function buildTimeline(lesson) {
  const beats = []
  lesson.scenes.forEach((sc, si) => {
    const prompts = sc.prompts || []
    const recap = !!sc.cards && !prompts.length
    beats.push({ scene: si, kind: 'scene', label: sc.short, explore: recap })
    prompts.forEach((p, qi) => {
      beats.push({ scene: si, kind: 'pose', q: p.id, qi, label: `Question ${qi + 1}` })
      ;(p.steps || []).forEach((st, k) => {
        const play = st.play || null
        let set = st.set || null
        if (play) {
          const par = lesson.params?.[play]
          if (!par || !par.play) throw new Error(`${lesson.title}: step "${st.caption}" plays "${play}", which is not a slider with play: { seconds }`)
          set = { ...(set || {}), [play]: par.max }
        }
        beats.push({
          scene: si, kind: play ? 'animate' : st.answer ? 'answer' : 'step', q: p.id, qi, pos: k + 1,
          play, set, reveals: st.reveals || null, label: st.caption || `Step ${k + 1}`,
        })
      })
    })
  })
  return beats
}

// The slider values a lesson starts with.
export function defaultValues(lesson) {
  const values = {}
  for (const [k, p] of Object.entries(lesson.params || {})) values[k] = p.value
  return values
}

// The state at beat n: fold beats 0..n. Values fold across the whole lesson (sliders are shared by
// every scene); posing and reveals fold within the scene that beat n belongs to.
export function stateAt(lesson, beats, n) {
  const cur = beats[n]
  const values = defaultValues(lesson)
  const posed = new Set()
  const revealed = new Set()
  let q = null
  let pos = 0
  let first = n
  for (let i = 0; i <= n; i++) {
    const b = beats[i]
    if (b.set) Object.assign(values, b.set)
    if (b.scene !== cur.scene) continue
    if (b.kind === 'scene') first = i
    if (b.q) {
      posed.add(b.q)
      q = b.q
      pos = b.kind === 'pose' ? 0 : b.pos
      if (b.reveals) for (const tag of b.reveals) revealed.add(tag)
    }
  }
  return { n, scene: cur.scene, kind: cur.kind, q, pos, posed, revealed, values, local: n - first, beat: cur }
}

// Every reveal tag a scene ever uses. A pause unlocks the controls the scene shows once it is done.
export function allTags(sc) {
  const out = new Set()
  for (const p of sc.prompts || []) for (const st of p.steps || []) for (const t of st.reveals || []) out.add(t)
  return out
}
