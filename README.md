css-splitter
============

Splits CSS files, one per media query - useful for responsive design and component oriented approach

Dependencies
------------
- nodejs

Easy Usage
----------
```bash
node css-splitter.js my-css-file.css
```
Example
-------
```bash
dev@ubuntu:~/github/css-splitter$ node css-splitter.js tests/css-splitter-test.css 
tests/css-splitter-test--screen-and-maxwidth640px.css written.
tests/css-splitter-test--screen-and-minwidth641px-and-maxwidth768px.css written.
tests/css-splitter-test--screen-and-maxwidth1023px.css written.
tests/css-splitter-test--all.css written.
tests/css-splitter-test--import.css written.
```
