" Notable shortcuts:
" <C-s> - CocCodeAction
" \ci   - Invert comment
" \c<space> - Toggle comment
" \cc   - Comment
" \cu   - Uncomment
" gcc   - Toggle comment
" Vgc   - Toggle comment in visual mode
" <C-n> - toggle NERDTree
" <C-n> - next autocomplete
" <C-p> - previous autocomplete
" \o    - Code outline
" \s or \w - OpenSession
" \S or \W - SaveSession
" csw'  - Wrap current word in ''
" cs"'  - Change surrounding " to '
" cs"<p> - Change surrounding " to <p></p>
" cst"  - Change surrounding tags to "
" cs)}  - Change surrounding brackets to curly brackets
" cs){  - Change surrounding brackets to curly brackets with spaces
" \-    - resize shorter
" \=    - resize taller
" \_    - resize thinner
" \+    - resize wider
" \s    - normal mode spelling fixes
" \S    - normal mode thesaurus (Synonyms)
" <C-X><C-S> - insert mode spelling
" <C-X><C-T> - insert mode thesaurus


set nocompatible              " be iMproved, required
filetype off                  " required

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'

" The following are examples of different formats supported.
" Keep Plugin commands between vundle#begin/end.
" plugin on GitHub repo
" Plugin 'tpope/vim-fugitive'
" plugin from http://vim-scripts.org/vim/scripts.html
" Plugin 'L9'
" Git plugin not hosted on GitHub
" Plugin 'git://git.wincent.com/command-t.git'
" git repos on your local machine (i.e. when working on your own plugin)
" Plugin 'file:///home/gmarik/path/to/plugin'
" The sparkup vim script is in a subdirectory of this repo called vim.
" Pass the path to set the runtimepath properly.
" Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}
" Install L9 and avoid a Naming conflict if you've already installed a
" different version somewhere else.
" Plugin 'ascenator/L9', {'name': 'newL9'}

" ------- PLUGINS HERE ------

" Defaults everyone can agree on
Plugin 'tpope/vim-sensible'

" File browser on the left
Plugin 'scrooloose/nerdtree'

" Git plugin
Plugin 'tpope/vim-fugitive'

" Git gutter
Plugin 'airblade/vim-gitgutter'

" Additional shortcuts
Plugin 'tpope/vim-unimpaired'

" HTML / XML tag closing
Plugin 'tpope/vim-ragtag'

" Display indentation guides
Plugin 'yggdroot/indentline'

" Syntax features!!!
" Plugin 'scrooloose/syntastic'

" Autocomplete
" Plugin 'shougo/deoplete.nvim'
" Plugin 'prabirshrestha/vim-lsp'
" Plugin 'prabirshrestha/async.vim'
" Plugin 'lighttiger2505/deoplete-vim-lsp'
" Plugin 'mattn/vim-lsp-settings'
"
" Plugin 'zchee/deoplete-jedi'
Plugin 'neoclide/coc.nvim'  " you need to run ./install.sh from coc.nvim dir
Plugin 'othree/html5.vim'
Plugin 'othree/yajs.vim'
Plugin 'HerringtonDarkholme/yats.vim'

" Snippets
Plugin 'honza/vim-snippets'

" Spelling and thesaurus
Plugin 'reedes/vim-lexical'

Plugin 'tweekmonster/django-plus.vim'

" Session plugin
Plugin 'xolox/vim-misc'
Plugin 'xolox/vim-session'

" Status bar on the bottom
Plugin 'vim-airline/vim-airline'
Plugin 'vim-airline/vim-airline-themes'

" Filetype icons in nerdtree
Plugin 'ryanoasis/vim-devicons'

" Vim markdown
Plugin 'plasticboy/vim-markdown'

" Vim LaTeX
" :CocInstall coc-vimtex
Plugin 'lervag/vimtex'

" Color schemes
Plugin 'mhartington/oceanic-next'

" Fuzzy finder
Plugin 'ctrlpvim/ctrlp.vim'

" Automatic commenting
Plugin 'scrooloose/nerdcommenter'

" Multiple cursors
Plugin 'terryma/vim-multiple-cursors'

" Tabular - auto align things in code
Plugin 'godlygeek/tabular'

" Code outline
Plugin 'majutsushi/tagbar'

" Automatic brackets, quotes, tags, etc. editing
Plugin 'tpope/vim-surround'

" Vim abolish - for quick and advanced string substitution
Plugin 'tpope/vim-abolish'

" Extended repetition of previous commands
Plugin 'tpope/vim-repeat'

" Emmet - expanding abbreviations for HTML
" Plugin 'mattn/emmet-vim'

" Coloresque - preview a color in css
Plugin 'gko/vim-coloresque'

" --- END OF PLUGINS HERE ---

" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
"
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
"
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line


" Display hybrid numbers in the gutter
set number relativenumber

" Display beautiful Powerline arrow triangles in airline
let g:airline_powerline_fonts = 1
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#formatter = 'default'
let g:airline#extensions#wordcount#enabled = 1
let g:airline#extensions#wordcount#filetypes =
  \ ['asciidoc', 'help', 'mail', 'markdown', 'org', 'plaintex', 'rst', 'tex', 'text', 'pandoc']
let g:vim_markdown_folding_disabled = 1

" Markdown editing
let g:markdown_syntax_conceal = 0

" Colorize syntax
syntax on

" Default tab width
set tabstop=2
" Use spaces instead of tabs
set expandtab
" Default tab key (number of spaces) width
set shiftwidth=2
" Set automatic indentation
set autoindent
" Set smart indentation
set smartindent
" Set mouse handling everywhere (all)
set mouse=a
" Search interactively
set incsearch

" Display ruler at column 78 and a wider one at 120
let &colorcolumn="78,".join(range(120,121),",")

" Set F10 to focus NerdTree
map <F10> :NERDTreeFocus <CR>

" Change shape of cursor in different modes:
let &t_SI = "\<Esc>[6 q"
let &t_SR = "\<Esc>[4 q"
let &t_EI = "\<Esc>[2 q"


" Button remaps for quicker split switches:
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
" Button remaps for quicker window resizing:
nnoremap <silent> <leader>= :exe "resize " . (winheight(0) * 3/2)<CR>
nnoremap <silent> <leader>- :exe "resize " . (winheight(0) * 2/3)<CR>
nnoremap <silent> <leader>+ :exe "vertical resize " . (winwidth(0) * 3/2)<CR>
nnoremap <silent> <leader>_ :exe "vertical resize " . (winwidth(0) * 2/3)<CR>
" Set to open new splits to right and bottom:
set splitbelow
set splitright

" Clear search highlight after hitting enter
nnoremap <CR> :noh<CR><CR>
" Clear highlighting on escape in normal mode
nnoremap <esc> :noh<return><esc>
nnoremap <esc>^[ <esc>^[

let g:airline_theme='oceanicnext'

" For Neovim
if (has("nvim"))
  if (has("termguicolors"))
    set termguicolors
  endif
endif

let g:oceanic_next_terminal_bold = 1
let g:oceanic_next_terminal_italic = 1
colorscheme OceanicNext

" Nerd tree toggle
map <C-n> :NERDTreeToggle<CR>

" Nerd tree autolaunch
"autocmd vimenter * NERDTree

" Nerd tree autolaunch when vim starts with no files
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif

" Nerd tree autolaunch when opening a directory
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 1 && isdirectory(argv()[0]) && !exists("s:std_in") | exe 'NERDTree' argv()[0] | wincmd p | ene | exe 'cd '.argv()[0] | endif

" Vim exit when the only window left is Nerd tree
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif

" If more than one window and previous buffer was NERDTree, go back to it.
autocmd BufEnter * if bufname('#') =~# "^NERD_tree_" && winnr('$') > 1 | b# | endif

let g:NERDTreeWinPos = "left"
let g:NERDTreeWinSize = 30
let g:NERDTreeWinSizeMax = 30
let g:NERDTreeMinimalUI = 1

" Nerdcommenter
" Usage
" - \cc - comment
" - \cs - sexy comment
" - \cu - uncomment
" - \c<space> - toggle comment
" - \c$ - comment to the end of the line
" - \ci - invert comments line-by-line
filetype plugin on

" Allow commenting and inverting empty lines (useful when commenting a region)
let g:NERDCommentEmptyLines = 1

" Enable trimming of trailing whitespace when uncommenting
let g:NERDTrimTrailingWhitespace = 1

" Enable NERDCommenterToggle to check all selected lines is commented or not 
let g:NERDToggleCheckAllLines = 1

" Add spaces after comment delimiters by default
let g:NERDSpaceDelims = 1

nmap gcc <leader>c<space>
vmap gc <leader>c<space>

" Tagbar - code outline
" Usage
" - \o - open code outline
" - (in Tagbar) o - toggle fold
" Tagbar needs ctags package to work properly
" `sudo pacman -S ctags`
nmap <leader>o :TagbarToggle<CR>

" Syntastic recommended settings
" set statusline+=%#warningmsg#
" set statusline+=%{SyntasticStatuslineFlag()}
" set statusline+=%*
"
" let g:syntastic_always_populate_loc_list = 1
" let g:syntastic_auto_loc_list = 0
" let g:syntastic_check_on_open = 1
" let g:syntastic_check_on_wq = 0
"
" let g:syntastic_java_javac_classpath = '/home/jazz/java/javafx-sdk-11.0.2/lib/*:/home/jazz/java/gson/gson-2.8.6.jar:/home/jazz/java/guava/guava-28.1-jre.jar'
" let g:syntastic_java_javac_options = '--sourcepath=src/main/java/'

" Coc code completion, litning and actions
nmap <leader>E <Plug>(coc-diagnostic-prev-error)
nmap <leader>e <Plug>(coc-diagnostic-next-error)
nmap <leader>d <Plug>(coc-definition)
nmap <leader>D <Plug>(coc-declaration)
nmap <leader>i <Plug>(coc-implementation)
nmap <leader>t <Plug>(coc-type-definition)
nmap <leader>r <Plug>(coc-references)
nmap <leader>a <Plug>(coc-diagnostic-next)
nmap <leader>A <Plug>(coc-diagnostic-prev)
nmap <leader>R <Plug>(coc-refactor)
nmap <leader>F <Plug>(coc-fix-current)
nmap <leader>f <Plug>(coc-float-jump)
nmap <leader>H <Plug>(coc-float-hide)
nmap <leader>l :CocList<CR>
nmap <C-s> <Plug>(coc-codeaction)

inoremap <silent><expr> <TAB>
      \ pumvisible() ? coc#_select_confirm() :
      \ coc#expandableOrJumpable() ? "\<C-r>=coc#rpc#request('doKeymap', ['snippets-expand-jump',''])\<CR>" :
      \ <SID>check_back_space() ? "\<TAB>" :
      \ coc#refresh()

function! s:check_back_space() abort
  let col = col('.') - 1
  return !col || getline('.')[col - 1]  =~# '\s'
endfunction

let g:coc_snippet_next = '<tab>'

" TextEdit might fail if hidden is not set.
set hidden

" Some servers have issues with backup files, see #649.
set nobackup
set nowritebackup

" Give more space for displaying messages.
set cmdheight=2

" Having longer updatetime (default is 4000 ms = 4 s) leads to noticeable
" delays and poor user experience.
set updatetime=300

" Don't pass messages to |ins-completion-menu|.
set shortmess+=c

" Always show the signcolumn, otherwise it would shift the text each time
" diagnostics appear/become resolved.
set signcolumn=yes

" Use K to show documentation in preview window.
nnoremap <silent> K :call <SID>show_documentation()<CR>

function! s:show_documentation()
  if (index(['vim','help'], &filetype) >= 0)
    execute 'h '.expand('<cword>')
  else
    call CocAction('doHover')
  endif
endfunction

" Sublime-like multicursor
let g:multi_cursor_use_default_mapping=0
let g:multi_cursor_start_word_key      = '<leader>m'
let g:multi_cursor_select_all_word_key = '<leader>M'
let g:multi_cursor_start_key           = '<leader>k'
let g:multi_cursor_select_all_key      = '<leader>K'
let g:multi_cursor_next_key            = '<C-n>'
let g:multi_cursor_prev_key            = '<C-p>'
let g:multi_cursor_skip_key            = '<C-s>'
let g:multi_cursor_quit_key            = '<Esc>'

" Vim sessions
" Don't save hidden and unloaded buffers in sessions.
let g:session_directory = '~/cloud/code/vim-sessions/'
let g:session_autosave = 'yes'
let g:session_autosave_periodic = 5

nnoremap <leader>W :SaveSession 
nnoremap <leader>w :OpenSession 

" Git (fugitive)
nnoremap <leader>gs :Git status<CR>
nnoremap <leader>ga :Git add --all<CR>
nnoremap <leader>gc :Git commit<CR>
nnoremap <leader>gpl :Git pull<CR>
nnoremap <leader>gPL :Git pull --all<CR>
nnoremap <leader>gps :Git push<CR>
nnoremap <leader>gPS :Git push --all<CR>
nnoremap <leader>gf :Git fetch --all<CR>
nnoremap <leader>gS :Git stash save<CR>

" Lexical
augroup lexical
  autocmd!
  autocmd FileType markdown,mkd,pandoc,plaintex,tex,latex call lexical#init()
  autocmd FileType textile call lexical#init()
  autocmd FileType text call lexical#init({ 'spell': 0 })
augroup END

let g:lexical#spelllang = ['pl', 'en_US']
let g:lexical#thesaurus = ['~/cloud/priv/dict/en-US-thesaurus.txt', '~/cloud/priv/dict/pl-PL-thesaurus.txt']
let g:lexical#dictionary = ['~/cloud/priv/dict/en-US-dict.txt', '~/cloud/priv/dict/pl-PL-dict.txt']
let g:lexical#spell_key = '<leader>s'
let g:lexical#thesaurus_key = '<leader>S'

" Vim markdown
let g:vim_markdown_folding_disabled = 1
let g:vim_markdown_no_default_key_mappings = 1
let g:vim_markdown_toc_autofit = 1
let g:vim_markdown_conceal = 0
let g:tex_conceal = ""
let g:vim_markdown_math = 1
let g:vim_markdown_conceal_code_blocks = 0
let g:vim_markdown_math = 1
let g:vim_markdown_strikethrough = 1
let g:vim_markdown_new_list_item_indent = 2
" let g:vim_markdown_auto_insert_bullets = 0
" let g:vim_markdown_new_list_item_indent = 0
nmap ]] <Plug>Markdown_MoveToNextHeader
nmap [[ <Plug>Markdown_MoveToPreviousHeader
nmap ]u <Plug>Markdown_MoveToParentHeader

autocmd FileType markdown,mkd,pandoc set tw=78
autocmd FileType markdown,mkd,pandoc set fo+=t

nmap <leader>b :call AutoWrapToggle()<CR>
function! AutoWrapToggle()
  if &formatoptions =~ 't'
    set fo-=t
  else
    set fo+=t
  endif
endfunction

" Indent lines
let g:indentLine_char = '▏'


" Indent Python in the Google way.
augroup google_python_indent
  autocmd FileType python,py setlocal indentexpr=GetGooglePythonIndent(v:lnum)
  autocmd FileType python,py let s:maxoff = 50 " maximum number of lines to look backwards.
augroup END


function GetGooglePythonIndent(lnum)

  " Indent inside parens.
  " Align with the open paren unless it is at the end of the line.
  " E.g.
  "   open_paren_not_at_EOL(100,
  "                         (200,
  "                          300),
  "                         400)
  "   open_paren_at_EOL(
  "       100, 200, 300, 400)
  call cursor(a:lnum, 1)
  let [par_line, par_col] = searchpairpos('(\|{\|\[', '', ')\|}\|\]', 'bW',
        \ "line('.') < " . (a:lnum - s:maxoff) . " ? dummy :"
        \ . " synIDattr(synID(line('.'), col('.'), 1), 'name')"
        \ . " =~ '\\(Comment\\|String\\)$'")
  if par_line > 0
    call cursor(par_line, 1)
    if par_col != col("$") - 1
      return par_col
    endif
  endif

  " Delegate the rest to the original function.
  return GetPythonIndent(a:lnum)

endfunction

let pyindent_nested_paren="&sw*2"
let pyindent_open_paren="&sw*2"

" Disable concealing
set cole=0
let g:vim_json_syntax_conceal = 0

" Map Ctrl+Backspace to remove previous word in insert mode
inoremap <C-BS> <C-w>
inoremap <C-h> <C-w>

" Map cse to vimtex-env-change
nmap cse <plug>(vimtex-env-change)

if has("gui_running")
  set guifont=Source\ Code\ Pro\ 12
endif
