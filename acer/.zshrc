# The following lines were added by compinstall

zstyle ':completion:*' completer _expand _complete _ignored _correct _approximate
zstyle ':completion:*' format '%F{blue}zshsense%f %F{cyan}%d%f%F{magenta}>%f'
zstyle ':completion:*' list-colors ''
zstyle ':completion:*' matcher-list '' 'm:{[:lower:]}={[:upper:]}' 'r:|[._-]=* r:|=*'
zstyle ':completion:*' max-errors 2
zstyle ':completion:*' menu select=8
zstyle ':completion:*' prompt '%F{blue}zshsense%f %F{cyan}%e%f%F{magenta}>%f'
zstyle ':completion:*' select-prompt %SScrolling active: current selection at %p%s
zstyle :compinstall filename '/home/jazz/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall
# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
unsetopt beep
bindkey -v
# End of lines configured by zsh-newuser-install

PROMPT='%F{magenta}[%f%B%F{green}%n%f@%F{cyan}%m%f %F{blue}%1~%f%b%F{magenta}]%f%(#.#.$) '
RPROMPT='%B%F{magenta}[%f%b%B%F{cyan}%T%f%b%B%F{magenta}]%f%b'

alias please='sudo $(fc -ln -1)'

alias ls='ls --color=auto'
alias ll='ls -lA --color=auto'
alias l.='ls -d .* --color=auto'
alias grep='grep --color=auto'

