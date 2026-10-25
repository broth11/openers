# Information board

Shows the given information before a graph or model is revealed. First used in MAI HL U5 L1.

A scene supplies `board: (ctx) => ({ intro, cards: [{ title, lines: ['text with $math$'] }], note })`.
The board replaces the graph within the same stage. Leave `board` out to show the graph.
Use short cards containing only the information students need. Do not put answers in the board.
The shell renders it with the usual maths helper; the SVG engine stays mounted and resizes normally.
Cards stack when the working panel is open or on a phone. Keep to three short cards so they fit.

Optional `clips: [{ src, alt }]` shows one short, silent, looping clip above each card, lined up with the cards' columns. The clip row takes all the vertical space left over, and every clip is drawn at that one height. A board scene that returns no `readout` also gives up the empty readout row. Import the files as assets (`import clip from './media/name.mp4'`); the artifact build inlines them, so keep each clip small (H.264 MP4, no audio, 320 px tall or less). Clips pause when the board is hidden, and stay still for people who prefer reduced motion.
