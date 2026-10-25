# Information board

Shows the given information before a graph or model is revealed. First used in MAI HL U5 L1.

A scene supplies `board: (ctx) => ({ intro, cards: [{ title, lines: ['text with $math$'] }], note })`.
The board replaces the graph within the same stage. Leave `board` out to show the graph.
Use short cards containing only the information students need. Do not put answers in the board.
The shell renders it with the usual maths helper; the SVG engine stays mounted and resizes normally.
Cards stack when the working panel is open or on a phone. Keep to three short cards so they fit.
