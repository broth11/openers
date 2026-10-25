// A scene's given information, without a graph that might give the answer away.
// Optional spec.clips: [{ src, alt }] puts one short silent looping clip above each card, all at one height.
import './style.css'

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function makeInfoBoard(host, renderText) {
  const board = document.createElement('div')
  board.className = 'info-board'
  board.hidden = true
  host.append(board)
  let previous = ''
  let previousClips = []
  const videos = () => [...board.querySelectorAll('.board-clip video')]
  return {
    apply(spec) {
      board.hidden = !spec
      host.classList.toggle('has-board', !!spec)
      if (!spec) {
        // Nothing plays behind a hidden board.
        for (const v of videos()) v.pause()
        return
      }
      const clips = spec.clips || []
      const clipsHtml = clips.length
        ? `<div class="board-clips">${clips.map((c, i) => `<figure class="board-clip"><video data-clip="${i}" muted loop playsinline preload="auto" disablepictureinpicture aria-label="${c.alt || ''}"></video></figure>`).join('')}</div>`
        : ''
      const html = `<p class="board-intro">${renderText(spec.intro || '')}</p>${clipsHtml}
        <div class="board-cards">${spec.cards.map((card) => `<article class="board-card">
          <h2>${renderText(card.title)}</h2>${card.lines.map((line) => `<p>${renderText(line)}</p>`).join('')}
        </article>`).join('')}</div>
        <p class="board-note">${renderText(spec.note || '')}</p>`
      const clipsChanged = clips.length !== previousClips.length || clips.some((c, i) => c.src !== previousClips[i])
      if (html !== previous || clipsChanged) {
        board.innerHTML = html
        previous = html
        previousClips = clips.map((c) => c.src)
        // Sources are set here, not in the markup, so the comparison above never touches the encoded video data.
        for (const v of videos()) { v.muted = true; v.src = clips[+v.dataset.clip].src }
      }
      if (!reduceMotion()) for (const v of videos()) v.play()?.catch(() => {})
    },
  }
}
