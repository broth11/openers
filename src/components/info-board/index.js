// A scene's given information, without a graph that might give the answer away.
import './style.css'

export function makeInfoBoard(host, renderText) {
  const board = document.createElement('div')
  board.className = 'info-board'
  board.hidden = true
  host.append(board)
  let previous = ''
  return {
    apply(spec) {
      board.hidden = !spec
      host.classList.toggle('has-board', !!spec)
      if (!spec) return
      const html = `<p class="board-intro">${renderText(spec.intro || '')}</p>
        <div class="board-cards">${spec.cards.map((card) => `<article class="board-card">
          <h2>${renderText(card.title)}</h2>${card.lines.map((line) => `<p>${renderText(line)}</p>`).join('')}
        </article>`).join('')}</div>
        <p class="board-note">${renderText(spec.note || '')}</p>`
      if (html !== previous) { board.innerHTML = html; previous = html }
    },
  }
}
