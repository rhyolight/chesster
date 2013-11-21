# Chesster

My eight-year-old son and I made this together. It's a client-side JavaScript Chess application that highlights all possible moves for each piece on hover. 

## Usage

See example usage in the `index.html` file. See it live at <http://rhyolight.github.io/chesster/>.

## Work in Progress

Want to help?

### TODO:

- Fix cell identifiers on bottom and left of board
  - They are inside the table cells, so they get clobbered when a piece moves into their cells
  - Should they be outside the table cells entirely? Probably.
- Enforce turns, starting with white
  - Disallow incorrect player to move when it's not their turn
  - Indicate whose move it is
- Keep history of moves in localStorage
- Continue where last game left on refresh
- Start a new game button