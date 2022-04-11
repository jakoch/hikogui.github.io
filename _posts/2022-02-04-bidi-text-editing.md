Bidirectional Text Editing
==========================

Cursor position
---------------
The cursor position contains both character index and on which side the
cursor is in logical text-ordering.

Although more complex then keeping just track of just a character index, it
allows for more correct cursor movement in bidirectional text.

Glossary and Symbols
--------------------

 - Display ordering:
 - Logical ordering: 
 - LTR: text written in a left-to-right language.
 - RTL: text written in a right-to-left language.
 - Leading: the cursor position before a character in logical ordering
 - Trailing: the cusror position after a character in logical ordering.
 - East: The cursor position to the right of a character in display order.
 - West: The cursor position to the left of a character in display order.
 - Neighbour: 

Symbols used in examples:

 - lower-case: text written in LTR
 - upper-case: text written in RTL
 - '^': primary cursor position
 - '[': LTR cursor
 - ']': RTL cursor


Rendering the insert cursors
----------------------------
There are two cursors when editing text, the primary cursor which is the
actual cursor position, the secondary cursor is the neighbouring cursor.

The LTR cursor is where left-to-right text will be inserted, it is displayed
with a little flag at the top pointing to the right. The RTL cursor is the
reverse.

The primary cursor is the actual cursor position; the secondary is the neighbouring
cursor position in logical text-ordering, the secondary cursor is drawn in a different
color.

When the primary and secondary cursor share the same position in display order, then
the secondary cursor supressed as is the LTR/RTL-flag on the primary cursor.
This means in most cases when writing in one direction it will seem like there is
just a single cursor.

In the example below we have the text "theREDfox". "RED" is written in a RTL language,
which makes the display order of the text "theDERfox". The example show the cursor
to be before the letter 'R' in logical order.

- Because the 'R' is a RTL character, the primary cursor will appear on its right
  and will be a RTL cursor.
- The neighbouring cursor in display order is behind the 'e' character.
  Since this is a LTR character, the secondary cursor will be displayed on the right
  side of the 'e' and will be a LTR cursor.
- The primary and secondary cursors are not neighbours in display order, so both
  cursors will be displayed.

```
logical order:
  t   h   e   R   E   D   f   o   x
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7
             ^

display order:
  t   h   e[  D   E   R]  f   o   x
 0 1 2 3 4 5 1 0 9 8 7 6 2 3 4 5 6 7
                       ^
```


