	""" vimrc file for following the coding standards specified in PEP 7 & 8.
	""" Number of spaces that a pre-existing tab is equal to.
	""" For the amount of space used for a new tab use shiftwidth.
	setlocal tabstop=4

	""" What to use for an indent.
	""" This will affect Ctrl-T and 'autoindent'.
	""" Python: 4 spaces
	setlocal shiftwidth=4
	setlocal expandtab
	""" setlocal noexpandtab
        setlocal softtabstop=4

	"""turning smartindent off since we're using type based indentation
	"""   set smartindent cinwords=if,elif,else,for,while,try,except,finally,def,class       
	"""au BufRead *py set smartindent cinwords=if,elif,else,for,while,try,except,finally,def,class       
	"""set smarttab - shouldn't be necessary since we're using all soft tabs
	
	""" Use the below highlight group when displaying bad whitespace is desired.
	highlight BadWhitespace ctermbg=red guibg=red

	""" Display tabs at the beginning of a line in Python mode as bad.
	match BadWhitespace /^\t\+/

	""" Make trailing whitespace be flagged as bad.
	"""au BufRead,BufNewFile *.py,*.pyw match BadWhitespace /\s\+$/
	
	""" Wrap text after a certain number of characters
	setlocal textwidth=120
	
	""" Use UNIX (\n) line endings.
	""" Only used for new files so as to not force existing files to change their
	""" line endings.
	setlocal fileformat=unix
	
	""" Set the default file encoding to UTF-8: ``set encoding=utf-8``
	""" Puts a marker at the beginning of the file to differentiate between UTF and
	""" UCS encoding (WARNING: can trick shells into thinking a text file is actually
	""" a binary file when executing the text file): ``set bomb``
	
	""" For full syntax highlighting:
	let python_highlight_all=1
	syntax on

	""" Set a helpful set of colors - mostly to eliminate dark blue
	colorscheme elflord
	
	""" Automatically indent based on file type: 
        " try some magic:  http://superuser.com/questions/68226/filetype-detection-not-working
        filetype off
	filetype indent on
        filetype on

	""" Keep indentation level from previous line: 
	set autoindent
	
	set shiftround
	"""messes up SuperTab: set paste

	"""filetype plugin on

