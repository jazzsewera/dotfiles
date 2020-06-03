# Vim cheat sheet

## Basics

`<C-O>` -- go to previous jump  
`<C-I>` -- go to next jump  
`t<char>` -- go in line till `<char>` forward  
`T<char>` -- go in line till `<char>` backward  
`f<char>` -- go in line to `<char>` forward  
`F<char>` -- go in line to `<char>` backward  
`viw` -- select current word  
`vi)` -- select everything in parentheses (without them)  
`va)` -- select everything in parentheses (with them)  
`*` -- search current word forward  
`#` -- search current word backward  
`q<char` -- record a macro  
`@<char>` -- execute a macro  
`gq` -- hard wrap text on `tw=78` column  
`bd` -- delete current buffer (close file)  
`^` -- toggle between two buffers  
`:!<cmd>` -- execute `<cmd>`


## Custom configuration

`\` means `<leader>`

Config as for 2020-06-03


### Coc.nvim

`\gpe` -- go to previous error  
`\gne` -- go to next error  
`\gd` -- go to definition  
`\gD` -- go to declaration  
`\gi` -- go to implementation  
`\gt` -- go to type definition  
`\gr` -- go to references  
`\gpd` -- go to previous diagnostic  
`\gnd` -- go to next diagnostic  
`\R` -- refactor code  
`\F` -- fix current  
`\f` -- float jump  
`\H` -- float hide  
`\l` -- CocList  
`<C-S>` -- CodeAction  
`K` -- show help in preview window


### Surround

`csw'` -- wrap current word in `''`  
`cs"'` -- change surrounding `""` to `''`  
`cst'` -- change surrounding `<>` tags to `''`  
`cs)}` -- change from `(this)` to `{this}`  
`cs){` -- change from `(this)` to `{ this }`  
`S)` -- (visual) surround with `(parentheses)`


### Nerd Commenter

`\cc` -- comment line (selection in visual)  
`\cu` -- uncomment line (selection in visual)  
`\ci` -- invert comments in line (selection in visual)  
`\c<space>` -- toggle comment in line (selection in visual)  
`\cb` -- comment block  
`\cs` -- comment sexy


### Multicursor

`\m` -- start multicursor on current word  
`\M` -- start multicursor and select all occurrences of the word  
`\k` -- start multicursor on current key (e.g. selection)  
`\K` -- start multicursor on current key and select all  
`<C-N>` -- go to next key and select it  
`<C-P>` -- go to previous key and deselect current  
`<C-S>` -- skip current key (deselect and go to next)  
`<Esc>` -- exit multicursor


### Window navigation

`<C-J>` -- go to the window below  
`<C-K>` -- go to the window above  
`<C-L>` -- go to the window right  
`<C-H>` -- go to the window left  
`\-` -- resize shorter  
`\=` -- resize taller  
`\_` -- resize thinner  
`\+` -- resize wider


### Lexical

`\s` -- normal mode spelling fixes  
`\S` -- normal mode synonyms (thesaurus)  
`<C-X><C-S>` -- insert mode spelling fixes  
`<C-X><C-T>` -- insert mode thesaurus


### Git (fugitive)

`\Gs` -- `git status`  
`\Ga` -- `git add --all`  
`\Gc` -- `git commit`  
`\Gpl` -- `git pull`  
`\GPL` -- `git pull --all`  
`\Gps` -- `git push`  
`\GPS` -- `git push --all`  
`\Gf` -- `git fetch`  
`\GF` -- `git fetch --all`  
`\GS` -- `git stash save`


### Vimtex (LaTeX integration)

`:VimtexCompile` -- start compiler in continuous mode  
`:Vimtex~` -- prefix for Vimtex commands


### Miscellaneous

`\o` -- show outline (tags)  
`<C-N>` -- toggle Nerd Tree

<!-- to render: `pandoc -f markdown_mmd+smart -V lang=en-US -V geometry:margin=1.5cm -V classoption:twocolumn -o vim-cheatsheet.pdf vim-cheatsheet.md` -->
