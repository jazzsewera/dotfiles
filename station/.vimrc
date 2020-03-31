" Notable shortcuts:
" <C-a> - LspCodeAction
" <C-s> - LspHover
" \ci   - Invert comment
" \cc   - Comment
" \cu   - Uncomment
" <C-n> - toggle NERDTree
" <C-y>, - emmet complete
" <C-space> - autocomplete
" \o    - Code outline
" \s    - Enable workspace
" cs"'  - Change surrounding " to '
" cs"<p> - Change surrounding " to <p></p>
" cst"  - Change surrounding tags to "
" cs)}  - Change surrounding brackets to curly brackets
" cs){  - Change surrounding brackets to curly brackets with spaces


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

" Git plugin
Plugin 'tpope/vim-fugitive'

" Git gutter
Plugin 'airblade/vim-gitgutter'

" Syntax features!!!
Plugin 'scrooloose/syntastic'

" Autocomplete
Plugin 'shougo/deoplete.nvim'
Plugin 'prabirshrestha/vim-lsp'
Plugin 'prabirshrestha/async.vim'
Plugin 'lighttiger2505/deoplete-vim-lsp'
Plugin 'mattn/vim-lsp-settings'

Plugin 'zchee/deoplete-jedi'

" Workspace plugin
Plugin 'thaerkh/vim-workspace'

" Status bar on the bottom
Plugin 'vim-airline/vim-airline'
Plugin 'vim-airline/vim-airline-themes'

" File browser on the left
Plugin 'scrooloose/nerdtree'

Plugin 'godlygeek/tabular'
Plugin 'plasticboy/vim-markdown'

" Color schemes
Plugin 'nlknguyen/papercolor-theme'
Plugin 'altercation/vim-colors-solarized'
Plugin 'mhartington/oceanic-next'

" Fuzzy finder
Plugin 'ctrlpvim/ctrlp.vim'

" Automatic commenting
Plugin 'scrooloose/nerdcommenter'

" Code outline
Plugin 'majutsushi/tagbar'

" Automatic brackets, quotes, tags, etc. editing
Plugin 'tpope/vim-surround'

" Extended repetition of previous commands
Plugin 'tpope/vim-repeat'

" Emmet - expanding abbreviations for HTML
Plugin 'mattn/emmet-vim'

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
let g:vim_markdown_folding_disabled = 1

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

" Tagbar - code outline
" Usage
" - \o - open code outline
" - (in Tagbar) o - toggle fold
" Tagbar needs ctags package to work properly
" `sudo pacman -S ctags`
nmap <leader>o :TagbarToggle<CR>

" Syntastic recommended settings
set statusline+=%#warningmsg#
set statusline+=%{SyntasticStatuslineFlag()}
set statusline+=%*

let g:syntastic_always_populate_loc_list = 1
let g:syntastic_auto_loc_list = 1
let g:syntastic_check_on_open = 1
let g:syntastic_check_on_wq = 0

let g:syntastic_java_javac_classpath = '/home/jazz/java/javafx-sdk-11.0.2/lib/*:/home/jazz/java/gson/gson-2.8.6.jar:/home/jazz/java/guava/guava-28.1-jre.jar'

" Deoplete run at startup
let g:deoplete#enable_at_startup = 1

" Deoplete set shortcuts
inoremap <expr><tab> pumvisible() ? "\<c-n>" : "\<tab>"
inoremap <c-space> <c-n>

" Vim LSP shortcuts
nnoremap <C-a> :LspCodeAction<CR>
nnoremap <leader>dp :LspPeekDefinition<CR>
" Jump to definition
nnoremap <leader>df :LspDefinition<CR>
" Hover info
nnoremap <C-s> :LspHover<CR>

" Vim workspaces
nnoremap <leader>s :ToggleWorkspace<CR>
let g:workspace_session_directory = $HOME . '/cloud/code/vim-sessions/'
let g:workspace_autosave_untrailspaces = 0

if has("gui_running")
  set guifont=Source\ Code\ Pro\ 12
endif
