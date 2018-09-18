(function() {
  var CommandError, Ex, VimOption, _, defer, fs, getFullPath, getSearchTerm, path, replaceGroups, saveAs, trySave,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  path = require('path');

  CommandError = require('./command-error');

  fs = require('fs-plus');

  VimOption = require('./vim-option');

  _ = require('underscore-plus');

  defer = function() {
    var deferred;
    deferred = {};
    deferred.promise = new Promise(function(resolve, reject) {
      deferred.resolve = resolve;
      return deferred.reject = reject;
    });
    return deferred;
  };

  trySave = function(func) {
    var deferred, error, errorMatch, fileName, ref, response;
    deferred = defer();
    try {
      response = func();
      if (response instanceof Promise) {
        response.then(function() {
          return deferred.resolve();
        });
      } else {
        deferred.resolve();
      }
    } catch (error1) {
      error = error1;
      if (error.message.endsWith('is a directory')) {
        atom.notifications.addWarning("Unable to save file: " + error.message);
      } else if (error.path != null) {
        if (error.code === 'EACCES') {
          atom.notifications.addWarning("Unable to save file: Permission denied '" + error.path + "'");
        } else if ((ref = error.code) === 'EPERM' || ref === 'EBUSY' || ref === 'UNKNOWN' || ref === 'EEXIST') {
          atom.notifications.addWarning("Unable to save file '" + error.path + "'", {
            detail: error.message
          });
        } else if (error.code === 'EROFS') {
          atom.notifications.addWarning("Unable to save file: Read-only file system '" + error.path + "'");
        }
      } else if ((errorMatch = /ENOTDIR, not a directory '([^']+)'/.exec(error.message))) {
        fileName = errorMatch[1];
        atom.notifications.addWarning("Unable to save file: A directory in the " + ("path '" + fileName + "' could not be written to"));
      } else {
        throw error;
      }
    }
    return deferred.promise;
  };

  saveAs = function(filePath, editor) {
    return fs.writeFileSync(filePath, editor.getText());
  };

  getFullPath = function(filePath) {
    filePath = fs.normalize(filePath);
    if (path.isAbsolute(filePath)) {
      return filePath;
    } else if (atom.project.getPaths().length === 0) {
      return path.join(fs.normalize('~'), filePath);
    } else {
      return path.join(atom.project.getPaths()[0], filePath);
    }
  };

  replaceGroups = function(groups, string) {
    var char, escaped, group, replaced;
    replaced = '';
    escaped = false;
    while ((char = string[0]) != null) {
      string = string.slice(1);
      if (char === '\\' && !escaped) {
        escaped = true;
      } else if (/\d/.test(char) && escaped) {
        escaped = false;
        group = groups[parseInt(char)];
        if (group == null) {
          group = '';
        }
        replaced += group;
      } else {
        escaped = false;
        replaced += char;
      }
    }
    return replaced;
  };

  getSearchTerm = function(term, modifiers) {
    var char, escaped, hasC, hasc, i, len, modFlags, term_;
    if (modifiers == null) {
      modifiers = {
        'g': true
      };
    }
    escaped = false;
    hasc = false;
    hasC = false;
    term_ = term;
    term = '';
    for (i = 0, len = term_.length; i < len; i++) {
      char = term_[i];
      if (char === '\\' && !escaped) {
        escaped = true;
        term += char;
      } else {
        if (char === 'c' && escaped) {
          hasc = true;
          term = term.slice(0, -1);
        } else if (char === 'C' && escaped) {
          hasC = true;
          term = term.slice(0, -1);
        } else if (char !== '\\') {
          term += char;
        }
        escaped = false;
      }
    }
    if (hasC) {
      modifiers['i'] = false;
    }
    if ((!hasC && !term.match('[A-Z]') && atom.config.get('vim-mode.useSmartcaseForSearch')) || hasc) {
      modifiers['i'] = true;
    }
    modFlags = Object.keys(modifiers).filter(function(key) {
      return modifiers[key];
    }).join('');
    try {
      return new RegExp(term, modFlags);
    } catch (error1) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  Ex = (function() {
    function Ex() {
      this.sort = bind(this.sort, this);
      this.vsp = bind(this.vsp, this);
      this.s = bind(this.s, this);
      this.sp = bind(this.sp, this);
      this.x = bind(this.x, this);
      this.xit = bind(this.xit, this);
      this.saveas = bind(this.saveas, this);
      this.xa = bind(this.xa, this);
      this.xall = bind(this.xall, this);
      this.wqa = bind(this.wqa, this);
      this.wqall = bind(this.wqall, this);
      this.wa = bind(this.wa, this);
      this.wq = bind(this.wq, this);
      this.w = bind(this.w, this);
      this.e = bind(this.e, this);
      this.tabo = bind(this.tabo, this);
      this.tabp = bind(this.tabp, this);
      this.tabn = bind(this.tabn, this);
      this.tabc = bind(this.tabc, this);
      this.tabclose = bind(this.tabclose, this);
      this.tabnew = bind(this.tabnew, this);
      this.tabe = bind(this.tabe, this);
      this.tabedit = bind(this.tabedit, this);
      this.qall = bind(this.qall, this);
      this.q = bind(this.q, this);
    }

    Ex.singleton = function() {
      return Ex.ex || (Ex.ex = new Ex);
    };

    Ex.registerCommand = function(name, func) {
      return Ex.singleton()[name] = func;
    };

    Ex.registerAlias = function(alias, name) {
      return Ex.singleton()[alias] = function(args) {
        return Ex.singleton()[name](args);
      };
    };

    Ex.getCommands = function() {
      return Object.keys(Ex.singleton()).concat(Object.keys(Ex.prototype)).filter(function(cmd, index, list) {
        return list.indexOf(cmd) === index;
      });
    };

    Ex.prototype.quit = function() {
      return atom.workspace.getActivePane().destroyActiveItem();
    };

    Ex.prototype.quitall = function() {
      return atom.close();
    };

    Ex.prototype.q = function() {
      return this.quit();
    };

    Ex.prototype.qall = function() {
      return this.quitall();
    };

    Ex.prototype.tabedit = function(args) {
      if (args.args.trim() !== '') {
        return this.edit(args);
      } else {
        return this.tabnew(args);
      }
    };

    Ex.prototype.tabe = function(args) {
      return this.tabedit(args);
    };

    Ex.prototype.tabnew = function(args) {
      if (args.args.trim() === '') {
        return atom.workspace.open();
      } else {
        return this.tabedit(args);
      }
    };

    Ex.prototype.tabclose = function(args) {
      return this.quit(args);
    };

    Ex.prototype.tabc = function() {
      return this.tabclose();
    };

    Ex.prototype.tabnext = function() {
      var pane;
      pane = atom.workspace.getActivePane();
      return pane.activateNextItem();
    };

    Ex.prototype.tabn = function() {
      return this.tabnext();
    };

    Ex.prototype.tabprevious = function() {
      var pane;
      pane = atom.workspace.getActivePane();
      return pane.activatePreviousItem();
    };

    Ex.prototype.tabp = function() {
      return this.tabprevious();
    };

    Ex.prototype.tabonly = function() {
      var tabBar, tabBarElement;
      tabBar = atom.workspace.getPanes()[0];
      tabBarElement = atom.views.getView(tabBar).querySelector(".tab-bar");
      tabBarElement.querySelector(".right-clicked") && tabBarElement.querySelector(".right-clicked").classList.remove("right-clicked");
      tabBarElement.querySelector(".active").classList.add("right-clicked");
      atom.commands.dispatch(tabBarElement, 'tabs:close-other-tabs');
      return tabBarElement.querySelector(".active").classList.remove("right-clicked");
    };

    Ex.prototype.tabo = function() {
      return this.tabonly();
    };

    Ex.prototype.edit = function(arg) {
      var args, editor, filePath, force, fullPath, range;
      range = arg.range, args = arg.args, editor = arg.editor;
      filePath = args.trim();
      if (filePath[0] === '!') {
        force = true;
        filePath = filePath.slice(1).trim();
      } else {
        force = false;
      }
      if (editor.isModified() && !force) {
        throw new CommandError('No write since last change (add ! to override)');
      }
      if (filePath.indexOf(' ') !== -1) {
        throw new CommandError('Only one file name allowed');
      }
      if (filePath.length !== 0) {
        fullPath = getFullPath(filePath);
        if (fullPath === editor.getPath()) {
          return editor.getBuffer().reload();
        } else {
          return atom.workspace.open(fullPath);
        }
      } else {
        if (editor.getPath() != null) {
          return editor.getBuffer().reload();
        } else {
          throw new CommandError('No file name');
        }
      }
    };

    Ex.prototype.e = function(args) {
      return this.edit(args);
    };

    Ex.prototype.enew = function() {
      var buffer;
      buffer = atom.workspace.getActiveTextEditor().buffer;
      buffer.setPath(void 0);
      return buffer.load();
    };

    Ex.prototype.write = function(arg) {
      var args, deferred, editor, filePath, force, fullPath, range, saveas, saved;
      range = arg.range, args = arg.args, editor = arg.editor, saveas = arg.saveas;
      if (saveas == null) {
        saveas = false;
      }
      filePath = args;
      if (filePath[0] === '!') {
        force = true;
        filePath = filePath.slice(1);
      } else {
        force = false;
      }
      filePath = filePath.trim();
      if (filePath.indexOf(' ') !== -1) {
        throw new CommandError('Only one file name allowed');
      }
      deferred = defer();
      editor = atom.workspace.getActiveTextEditor();
      saved = false;
      if (filePath.length !== 0) {
        fullPath = getFullPath(filePath);
      }
      if ((editor.getPath() != null) && ((fullPath == null) || editor.getPath() === fullPath)) {
        if (saveas) {
          throw new CommandError("Argument required");
        } else {
          trySave(function() {
            return editor.save();
          }).then(deferred.resolve);
          saved = true;
        }
      } else if (fullPath == null) {
        fullPath = atom.showSaveDialogSync();
      }
      if (!saved && (fullPath != null)) {
        if (!force && fs.existsSync(fullPath)) {
          throw new CommandError("File exists (add ! to override)");
        }
        if (saveas || editor.getFileName() === null) {
          editor = atom.workspace.getActiveTextEditor();
          trySave(function() {
            return editor.saveAs(fullPath, editor);
          }).then(deferred.resolve);
        } else {
          trySave(function() {
            return saveAs(fullPath, editor);
          }).then(deferred.resolve);
        }
      }
      return deferred.promise;
    };

    Ex.prototype.wall = function() {
      return atom.workspace.saveAll();
    };

    Ex.prototype.w = function(args) {
      return this.write(args);
    };

    Ex.prototype.wq = function(args) {
      return this.write(args).then((function(_this) {
        return function() {
          return _this.quit();
        };
      })(this));
    };

    Ex.prototype.wa = function() {
      return this.wall();
    };

    Ex.prototype.wqall = function() {
      this.wall();
      return this.quitall();
    };

    Ex.prototype.wqa = function() {
      return this.wqall();
    };

    Ex.prototype.xall = function() {
      return this.wqall();
    };

    Ex.prototype.xa = function() {
      return this.wqall();
    };

    Ex.prototype.saveas = function(args) {
      args.saveas = true;
      return this.write(args);
    };

    Ex.prototype.xit = function(args) {
      return this.wq(args);
    };

    Ex.prototype.x = function(args) {
      return this.xit(args);
    };

    Ex.prototype.split = function(arg) {
      var args, file, filePaths, i, j, len, len1, newPane, pane, range, results, results1;
      range = arg.range, args = arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitbelow')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitDown();
          results = [];
          for (i = 0, len = filePaths.length; i < len; i++) {
            file = filePaths[i];
            results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results;
        } else {
          return pane.splitDown({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitUp();
          results1 = [];
          for (j = 0, len1 = filePaths.length; j < len1; j++) {
            file = filePaths[j];
            results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results1;
        } else {
          return pane.splitUp({
            copyActiveItem: true
          });
        }
      }
    };

    Ex.prototype.sp = function(args) {
      return this.split(args);
    };

    Ex.prototype.substitute = function(arg) {
      var args, args_, char, delim, e, editor, escapeChars, escaped, flags, flagsObj, parsed, parsing, pattern, patternRE, range, substition, vimState;
      range = arg.range, args = arg.args, editor = arg.editor, vimState = arg.vimState;
      args_ = args.trimLeft();
      delim = args_[0];
      if (/[a-z1-9\\"|]/i.test(delim)) {
        throw new CommandError("Regular expressions can't be delimited by alphanumeric characters, '\\', '\"' or '|'");
      }
      args_ = args_.slice(1);
      escapeChars = {
        t: '\t',
        n: '\n',
        r: '\r'
      };
      parsed = ['', '', ''];
      parsing = 0;
      escaped = false;
      while ((char = args_[0]) != null) {
        args_ = args_.slice(1);
        if (char === delim) {
          if (!escaped) {
            parsing++;
            if (parsing > 2) {
              throw new CommandError('Trailing characters');
            }
          } else {
            parsed[parsing] = parsed[parsing].slice(0, -1);
          }
        } else if (char === '\\' && !escaped) {
          parsed[parsing] += char;
          escaped = true;
        } else if (parsing === 1 && escaped && (escapeChars[char] != null)) {
          parsed[parsing] += escapeChars[char];
          escaped = false;
        } else {
          escaped = false;
          parsed[parsing] += char;
        }
      }
      pattern = parsed[0], substition = parsed[1], flags = parsed[2];
      if (pattern === '') {
        if (vimState.getSearchHistoryItem != null) {
          pattern = vimState.getSearchHistoryItem();
        } else if (vimState.searchHistory != null) {
          pattern = vimState.searchHistory.get('prev');
        }
        if (pattern == null) {
          atom.beep();
          throw new CommandError('No previous regular expression');
        }
      } else {
        if (vimState.pushSearchHistory != null) {
          vimState.pushSearchHistory(pattern);
        } else if (vimState.searchHistory != null) {
          vimState.searchHistory.save(pattern);
        }
      }
      try {
        flagsObj = {};
        flags.split('').forEach(function(flag) {
          return flagsObj[flag] = true;
        });
        if (atom.config.get('ex-mode.gdefault')) {
          flagsObj.g = !flagsObj.g;
        }
        patternRE = getSearchTerm(pattern, flagsObj);
      } catch (error1) {
        e = error1;
        if (e.message.indexOf('Invalid flags supplied to RegExp constructor') === 0) {
          throw new CommandError("Invalid flags: " + e.message.slice(45));
        } else if (e.message.indexOf('Invalid regular expression: ') === 0) {
          throw new CommandError("Invalid RegEx: " + e.message.slice(27));
        } else {
          throw e;
        }
      }
      return editor.transact(function() {
        var i, line, ref, ref1, results;
        results = [];
        for (line = i = ref = range[0], ref1 = range[1]; ref <= ref1 ? i <= ref1 : i >= ref1; line = ref <= ref1 ? ++i : --i) {
          results.push(editor.scanInBufferRange(patternRE, [[line, 0], [line + 1, 0]], function(arg1) {
            var match, replace;
            match = arg1.match, replace = arg1.replace;
            return replace(replaceGroups(match.slice(0), substition));
          }));
        }
        return results;
      });
    };

    Ex.prototype.s = function(args) {
      return this.substitute(args);
    };

    Ex.prototype.vsplit = function(arg) {
      var args, file, filePaths, i, j, len, len1, newPane, pane, range, results, results1;
      range = arg.range, args = arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitright')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitRight();
          results = [];
          for (i = 0, len = filePaths.length; i < len; i++) {
            file = filePaths[i];
            results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results;
        } else {
          return pane.splitRight({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitLeft();
          results1 = [];
          for (j = 0, len1 = filePaths.length; j < len1; j++) {
            file = filePaths[j];
            results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results1;
        } else {
          return pane.splitLeft({
            copyActiveItem: true
          });
        }
      }
    };

    Ex.prototype.vsp = function(args) {
      return this.vsplit(args);
    };

    Ex.prototype["delete"] = function(arg) {
      var editor, range, text;
      range = arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      editor = atom.workspace.getActiveTextEditor();
      text = editor.getTextInBufferRange(range);
      atom.clipboard.write(text);
      return editor.buffer.setTextInRange(range, '');
    };

    Ex.prototype.yank = function(arg) {
      var range, txt;
      range = arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      txt = atom.workspace.getActiveTextEditor().getTextInBufferRange(range);
      return atom.clipboard.write(txt);
    };

    Ex.prototype.set = function(arg) {
      var args, i, len, option, options, range, results;
      range = arg.range, args = arg.args;
      args = args.trim();
      if (args === "") {
        throw new CommandError("No option specified");
      }
      options = args.split(' ');
      results = [];
      for (i = 0, len = options.length; i < len; i++) {
        option = options[i];
        results.push((function() {
          var nameValPair, optionName, optionProcessor, optionValue;
          if (option.includes("=")) {
            nameValPair = option.split("=");
            if (nameValPair.length !== 2) {
              throw new CommandError("Wrong option format. [name]=[value] format is expected");
            }
            optionName = nameValPair[0];
            optionValue = nameValPair[1];
            optionProcessor = VimOption.singleton()[optionName];
            if (optionProcessor == null) {
              throw new CommandError("No such option: " + optionName);
            }
            return optionProcessor(optionValue);
          } else {
            optionProcessor = VimOption.singleton()[option];
            if (optionProcessor == null) {
              throw new CommandError("No such option: " + option);
            }
            return optionProcessor();
          }
        })());
      }
      return results;
    };

    Ex.prototype.sort = function(arg) {
      var editor, i, isMultiLine, lineIndex, range, ref, ref1, sortedText, sortingRange, textLines;
      range = arg.range;
      editor = atom.workspace.getActiveTextEditor();
      sortingRange = [[]];
      isMultiLine = range[1] - range[0] > 1;
      if (isMultiLine) {
        sortingRange = [[range[0], 0], [range[1] + 1, 0]];
      } else {
        sortingRange = [[0, 0], [editor.getLastBufferRow(), 0]];
      }
      textLines = [];
      for (lineIndex = i = ref = sortingRange[0][0], ref1 = sortingRange[1][0] - 1; ref <= ref1 ? i <= ref1 : i >= ref1; lineIndex = ref <= ref1 ? ++i : --i) {
        textLines.push(editor.lineTextForBufferRow(lineIndex));
      }
      sortedText = _.sortBy(textLines).join('\n') + '\n';
      return editor.buffer.setTextInRange(sortingRange, sortedText);
    };

    return Ex;

  })();

  module.exports = Ex;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJHQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBQ2YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjs7RUFDWixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVKLEtBQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLFFBQUEsR0FBVztJQUNYLFFBQVEsQ0FBQyxPQUFULEdBQW1CLElBQUksT0FBSixDQUFZLFNBQUMsT0FBRCxFQUFVLE1BQVY7TUFDN0IsUUFBUSxDQUFDLE9BQVQsR0FBbUI7YUFDbkIsUUFBUSxDQUFDLE1BQVQsR0FBa0I7SUFGVyxDQUFaO0FBSW5CLFdBQU87RUFORDs7RUFTUixPQUFBLEdBQVUsU0FBQyxJQUFEO0FBQ1IsUUFBQTtJQUFBLFFBQUEsR0FBVyxLQUFBLENBQUE7QUFFWDtNQUNFLFFBQUEsR0FBVyxJQUFBLENBQUE7TUFFWCxJQUFHLFFBQUEsWUFBb0IsT0FBdkI7UUFDRSxRQUFRLENBQUMsSUFBVCxDQUFjLFNBQUE7aUJBQ1osUUFBUSxDQUFDLE9BQVQsQ0FBQTtRQURZLENBQWQsRUFERjtPQUFBLE1BQUE7UUFJRSxRQUFRLENBQUMsT0FBVCxDQUFBLEVBSkY7T0FIRjtLQUFBLGNBQUE7TUFRTTtNQUNKLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixDQUFIO1FBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4Qix1QkFBQSxHQUF3QixLQUFLLENBQUMsT0FBNUQsRUFERjtPQUFBLE1BRUssSUFBRyxrQkFBSDtRQUNILElBQUcsS0FB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QTtBQURGOztJQUxHOztpQkF1QkwsSUFBQSxHQUFNLFNBQUMsR0FBRDtBQUNKLFVBQUE7TUFETyxRQUFGO01BQ0wsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULFlBQUEsR0FBZSxDQUFDLEVBQUQ7TUFHZixXQUFBLEdBQWMsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLEtBQU0sQ0FBQSxDQUFBLENBQWpCLEdBQXNCO01BQ3BDLElBQUcsV0FBSDtRQUNFLFlBQUEsR0FBZSxDQUFDLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUCxFQUFXLENBQVgsQ0FBRCxFQUFnQixDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxDQUFaLEVBQWUsQ0FBZixDQUFoQixFQURqQjtPQUFBLE1BQUE7UUFHRSxZQUFBLEdBQWUsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQUQsRUFBNEIsQ0FBNUIsQ0FBVCxFQUhqQjs7TUFNQSxTQUFBLEdBQVk7QUFDWixXQUFpQixpSkFBakI7UUFDRSxTQUFTLENBQUMsSUFBVixDQUFlLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixTQUE1QixDQUFmO0FBREY7TUFJQSxVQUFBLEdBQWEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxTQUFULENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBQSxHQUFpQzthQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWQsQ0FBNkIsWUFBN0IsRUFBMkMsVUFBM0M7SUFsQkk7Ozs7OztFQW9CUixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQW5kakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbkNvbW1hbmRFcnJvciA9IHJlcXVpcmUgJy4vY29tbWFuZC1lcnJvcidcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblZpbU9wdGlvbiA9IHJlcXVpcmUgJy4vdmltLW9wdGlvbidcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbmRlZmVyID0gKCkgLT5cbiAgZGVmZXJyZWQgPSB7fVxuICBkZWZlcnJlZC5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICBkZWZlcnJlZC5yZXNvbHZlID0gcmVzb2x2ZVxuICAgIGRlZmVycmVkLnJlamVjdCA9IHJlamVjdFxuICApXG4gIHJldHVybiBkZWZlcnJlZFxuXG5cbnRyeVNhdmUgPSAoZnVuYykgLT5cbiAgZGVmZXJyZWQgPSBkZWZlcigpXG5cbiAgdHJ5XG4gICAgcmVzcG9uc2UgPSBmdW5jKClcblxuICAgIGlmIHJlc3BvbnNlIGluc3RhbmNlb2YgUHJvbWlzZVxuICAgICAgcmVzcG9uc2UudGhlbiAtPlxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKClcbiAgICBlbHNlXG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKClcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBlcnJvci5tZXNzYWdlLmVuZHNXaXRoKCdpcyBhIGRpcmVjdG9yeScpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcIlVuYWJsZSB0byBzYXZlIGZpbGU6ICN7ZXJyb3IubWVzc2FnZX1cIilcbiAgICBlbHNlIGlmIGVycm9yLnBhdGg/XG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFQUNDRVMnXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9uc1xuICAgICAgICAgIC5hZGRXYXJuaW5nKFwiVW5hYmxlIHRvIHNhdmUgZmlsZTogUGVybWlzc2lvbiBkZW5pZWQgJyN7ZXJyb3IucGF0aH0nXCIpXG4gICAgICBlbHNlIGlmIGVycm9yLmNvZGUgaW4gWydFUEVSTScsICdFQlVTWScsICdVTktOT1dOJywgJ0VFWElTVCddXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiVW5hYmxlIHRvIHNhdmUgZmlsZSAnI3tlcnJvci5wYXRofSdcIixcbiAgICAgICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2UpXG4gICAgICBlbHNlIGlmIGVycm9yLmNvZGUgaXMgJ0VST0ZTJ1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICBcIlVuYWJsZSB0byBzYXZlIGZpbGU6IFJlYWQtb25seSBmaWxlIHN5c3RlbSAnI3tlcnJvci5wYXRofSdcIilcbiAgICBlbHNlIGlmIChlcnJvck1hdGNoID1cbiAgICAgICAgL0VOT1RESVIsIG5vdCBhIGRpcmVjdG9yeSAnKFteJ10rKScvLmV4ZWMoZXJyb3IubWVzc2FnZSkpXG4gICAgICBmaWxlTmFtZSA9IGVycm9yTWF0Y2hbMV1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiVW5hYmxlIHRvIHNhdmUgZmlsZTogQSBkaXJlY3RvcnkgaW4gdGhlIFwiK1xuICAgICAgICBcInBhdGggJyN7ZmlsZU5hbWV9JyBjb3VsZCBub3QgYmUgd3JpdHRlbiB0b1wiKVxuICAgIGVsc2VcbiAgICAgIHRocm93IGVycm9yXG5cbiAgZGVmZXJyZWQucHJvbWlzZVxuXG5zYXZlQXMgPSAoZmlsZVBhdGgsIGVkaXRvcikgLT5cbiAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZWRpdG9yLmdldFRleHQoKSlcblxuZ2V0RnVsbFBhdGggPSAoZmlsZVBhdGgpIC0+XG4gIGZpbGVQYXRoID0gZnMubm9ybWFsaXplKGZpbGVQYXRoKVxuXG4gIGlmIHBhdGguaXNBYnNvbHV0ZShmaWxlUGF0aClcbiAgICBmaWxlUGF0aFxuICBlbHNlIGlmIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCA9PSAwXG4gICAgcGF0aC5qb2luKGZzLm5vcm1hbGl6ZSgnficpLCBmaWxlUGF0aClcbiAgZWxzZVxuICAgIHBhdGguam9pbihhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXSwgZmlsZVBhdGgpXG5cbnJlcGxhY2VHcm91cHMgPSAoZ3JvdXBzLCBzdHJpbmcpIC0+XG4gIHJlcGxhY2VkID0gJydcbiAgZXNjYXBlZCA9IGZhbHNlXG4gIHdoaWxlIChjaGFyID0gc3RyaW5nWzBdKT9cbiAgICBzdHJpbmcgPSBzdHJpbmdbMS4uXVxuICAgIGlmIGNoYXIgaXMgJ1xcXFwnIGFuZCBub3QgZXNjYXBlZFxuICAgICAgZXNjYXBlZCA9IHRydWVcbiAgICBlbHNlIGlmIC9cXGQvLnRlc3QoY2hhcikgYW5kIGVzY2FwZWRcbiAgICAgIGVzY2FwZWQgPSBmYWxzZVxuICAgICAgZ3JvdXAgPSBncm91cHNbcGFyc2VJbnQoY2hhcildXG4gICAgICBncm91cCA/PSAnJ1xuICAgICAgcmVwbGFjZWQgKz0gZ3JvdXBcbiAgICBlbHNlXG4gICAgICBlc2NhcGVkID0gZmFsc2VcbiAgICAgIHJlcGxhY2VkICs9IGNoYXJcblxuICByZXBsYWNlZFxuXG5nZXRTZWFyY2hUZXJtID0gKHRlcm0sIG1vZGlmaWVycyA9IHsnZyc6IHRydWV9KSAtPlxuXG4gIGVzY2FwZWQgPSBmYWxzZVxuICBoYXNjID0gZmFsc2VcbiAgaGFzQyA9IGZhbHNlXG4gIHRlcm1fID0gdGVybVxuICB0ZXJtID0gJydcbiAgZm9yIGNoYXIgaW4gdGVybV9cbiAgICBpZiBjaGFyIGlzICdcXFxcJyBhbmQgbm90IGVzY2FwZWRcbiAgICAgIGVzY2FwZWQgPSB0cnVlXG4gICAgICB0ZXJtICs9IGNoYXJcbiAgICBlbHNlXG4gICAgICBpZiBjaGFyIGlzICdjJyBhbmQgZXNjYXBlZFxuICAgICAgICBoYXNjID0gdHJ1ZVxuICAgICAgICB0ZXJtID0gdGVybVsuLi4tMV1cbiAgICAgIGVsc2UgaWYgY2hhciBpcyAnQycgYW5kIGVzY2FwZWRcbiAgICAgICAgaGFzQyA9IHRydWVcbiAgICAgICAgdGVybSA9IHRlcm1bLi4uLTFdXG4gICAgICBlbHNlIGlmIGNoYXIgaXNudCAnXFxcXCdcbiAgICAgICAgdGVybSArPSBjaGFyXG4gICAgICBlc2NhcGVkID0gZmFsc2VcblxuICBpZiBoYXNDXG4gICAgbW9kaWZpZXJzWydpJ10gPSBmYWxzZVxuICBpZiAobm90IGhhc0MgYW5kIG5vdCB0ZXJtLm1hdGNoKCdbQS1aXScpIGFuZCBcXFxuICAgICAgYXRvbS5jb25maWcuZ2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnKSkgb3IgaGFzY1xuICAgIG1vZGlmaWVyc1snaSddID0gdHJ1ZVxuXG4gIG1vZEZsYWdzID0gT2JqZWN0LmtleXMobW9kaWZpZXJzKS5maWx0ZXIoKGtleSkgLT4gbW9kaWZpZXJzW2tleV0pLmpvaW4oJycpXG5cbiAgdHJ5XG4gICAgbmV3IFJlZ0V4cCh0ZXJtLCBtb2RGbGFncylcbiAgY2F0Y2hcbiAgICBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RGbGFncylcblxuY2xhc3MgRXhcbiAgQHNpbmdsZXRvbjogPT5cbiAgICBAZXggfHw9IG5ldyBFeFxuXG4gIEByZWdpc3RlckNvbW1hbmQ6IChuYW1lLCBmdW5jKSA9PlxuICAgIEBzaW5nbGV0b24oKVtuYW1lXSA9IGZ1bmNcblxuICBAcmVnaXN0ZXJBbGlhczogKGFsaWFzLCBuYW1lKSA9PlxuICAgIEBzaW5nbGV0b24oKVthbGlhc10gPSAoYXJncykgPT4gQHNpbmdsZXRvbigpW25hbWVdKGFyZ3MpXG5cbiAgQGdldENvbW1hbmRzOiAoKSA9PlxuICAgIE9iamVjdC5rZXlzKEV4LnNpbmdsZXRvbigpKS5jb25jYXQoT2JqZWN0LmtleXMoRXgucHJvdG90eXBlKSkuZmlsdGVyKChjbWQsIGluZGV4LCBsaXN0KSAtPlxuICAgICAgbGlzdC5pbmRleE9mKGNtZCkgPT0gaW5kZXhcbiAgICApXG5cbiAgcXVpdDogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZGVzdHJveUFjdGl2ZUl0ZW0oKVxuXG4gIHF1aXRhbGw6IC0+XG4gICAgYXRvbS5jbG9zZSgpXG5cbiAgcTogPT4gQHF1aXQoKVxuXG4gIHFhbGw6ID0+IEBxdWl0YWxsKClcblxuICB0YWJlZGl0OiAoYXJncykgPT5cbiAgICBpZiBhcmdzLmFyZ3MudHJpbSgpIGlzbnQgJydcbiAgICAgIEBlZGl0KGFyZ3MpXG4gICAgZWxzZVxuICAgICAgQHRhYm5ldyhhcmdzKVxuXG4gIHRhYmU6IChhcmdzKSA9PiBAdGFiZWRpdChhcmdzKVxuXG4gIHRhYm5ldzogKGFyZ3MpID0+XG4gICAgaWYgYXJncy5hcmdzLnRyaW0oKSBpcyAnJ1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgZWxzZVxuICAgICAgQHRhYmVkaXQoYXJncylcblxuICB0YWJjbG9zZTogKGFyZ3MpID0+IEBxdWl0KGFyZ3MpXG5cbiAgdGFiYzogPT4gQHRhYmNsb3NlKClcblxuICB0YWJuZXh0OiAtPlxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBwYW5lLmFjdGl2YXRlTmV4dEl0ZW0oKVxuXG4gIHRhYm46ID0+IEB0YWJuZXh0KClcblxuICB0YWJwcmV2aW91czogLT5cbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgcGFuZS5hY3RpdmF0ZVByZXZpb3VzSXRlbSgpXG5cbiAgdGFicDogPT4gQHRhYnByZXZpb3VzKClcblxuICB0YWJvbmx5OiAtPlxuICAgIHRhYkJhciA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClbMF1cbiAgICB0YWJCYXJFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRhYkJhcikucXVlcnlTZWxlY3RvcihcIi50YWItYmFyXCIpXG4gICAgdGFiQmFyRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnJpZ2h0LWNsaWNrZWRcIikgJiYgdGFiQmFyRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLnJpZ2h0LWNsaWNrZWRcIikuY2xhc3NMaXN0LnJlbW92ZShcInJpZ2h0LWNsaWNrZWRcIilcbiAgICB0YWJCYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYWN0aXZlXCIpLmNsYXNzTGlzdC5hZGQoXCJyaWdodC1jbGlja2VkXCIpXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YWJCYXJFbGVtZW50LCAndGFiczpjbG9zZS1vdGhlci10YWJzJylcbiAgICB0YWJCYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYWN0aXZlXCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJyaWdodC1jbGlja2VkXCIpXG5cbiAgdGFibzogPT4gQHRhYm9ubHkoKVxuXG4gIGVkaXQ6ICh7IHJhbmdlLCBhcmdzLCBlZGl0b3IgfSkgLT5cbiAgICBmaWxlUGF0aCA9IGFyZ3MudHJpbSgpXG4gICAgaWYgZmlsZVBhdGhbMF0gaXMgJyEnXG4gICAgICBmb3JjZSA9IHRydWVcbiAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGhbMS4uXS50cmltKClcbiAgICBlbHNlXG4gICAgICBmb3JjZSA9IGZhbHNlXG5cbiAgICBpZiBlZGl0b3IuaXNNb2RpZmllZCgpIGFuZCBub3QgZm9yY2VcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ05vIHdyaXRlIHNpbmNlIGxhc3QgY2hhbmdlIChhZGQgISB0byBvdmVycmlkZSknKVxuICAgIGlmIGZpbGVQYXRoLmluZGV4T2YoJyAnKSBpc250IC0xXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdPbmx5IG9uZSBmaWxlIG5hbWUgYWxsb3dlZCcpXG5cbiAgICBpZiBmaWxlUGF0aC5sZW5ndGggaXNudCAwXG4gICAgICBmdWxsUGF0aCA9IGdldEZ1bGxQYXRoKGZpbGVQYXRoKVxuICAgICAgaWYgZnVsbFBhdGggaXMgZWRpdG9yLmdldFBhdGgoKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkucmVsb2FkKClcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmdWxsUGF0aClcbiAgICBlbHNlXG4gICAgICBpZiBlZGl0b3IuZ2V0UGF0aCgpP1xuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkucmVsb2FkKClcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignTm8gZmlsZSBuYW1lJylcblxuICBlOiAoYXJncykgPT4gQGVkaXQoYXJncylcblxuICBlbmV3OiAtPlxuICAgIGJ1ZmZlciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5idWZmZXJcbiAgICBidWZmZXIuc2V0UGF0aCh1bmRlZmluZWQpXG4gICAgYnVmZmVyLmxvYWQoKVxuXG4gIHdyaXRlOiAoeyByYW5nZSwgYXJncywgZWRpdG9yLCBzYXZlYXMgfSkgLT5cbiAgICBzYXZlYXMgPz0gZmFsc2VcbiAgICBmaWxlUGF0aCA9IGFyZ3NcbiAgICBpZiBmaWxlUGF0aFswXSBpcyAnISdcbiAgICAgIGZvcmNlID0gdHJ1ZVxuICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aFsxLi5dXG4gICAgZWxzZVxuICAgICAgZm9yY2UgPSBmYWxzZVxuXG4gICAgZmlsZVBhdGggPSBmaWxlUGF0aC50cmltKClcbiAgICBpZiBmaWxlUGF0aC5pbmRleE9mKCcgJykgaXNudCAtMVxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignT25seSBvbmUgZmlsZSBuYW1lIGFsbG93ZWQnKVxuXG4gICAgZGVmZXJyZWQgPSBkZWZlcigpXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBzYXZlZCA9IGZhbHNlXG4gICAgaWYgZmlsZVBhdGgubGVuZ3RoIGlzbnQgMFxuICAgICAgZnVsbFBhdGggPSBnZXRGdWxsUGF0aChmaWxlUGF0aClcbiAgICBpZiBlZGl0b3IuZ2V0UGF0aCgpPyBhbmQgKG5vdCBmdWxsUGF0aD8gb3IgZWRpdG9yLmdldFBhdGgoKSA9PSBmdWxsUGF0aClcbiAgICAgIGlmIHNhdmVhc1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiQXJndW1lbnQgcmVxdWlyZWRcIilcbiAgICAgIGVsc2VcbiAgICAgICAgIyBVc2UgZWRpdG9yLnNhdmUgd2hlbiBubyBwYXRoIGlzIGdpdmVuIG9yIHRoZSBwYXRoIHRvIHRoZSBmaWxlIGlzIGdpdmVuXG4gICAgICAgIHRyeVNhdmUoLT4gZWRpdG9yLnNhdmUoKSkudGhlbihkZWZlcnJlZC5yZXNvbHZlKVxuICAgICAgICBzYXZlZCA9IHRydWVcbiAgICBlbHNlIGlmIG5vdCBmdWxsUGF0aD9cbiAgICAgIGZ1bGxQYXRoID0gYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMoKVxuXG4gICAgaWYgbm90IHNhdmVkIGFuZCBmdWxsUGF0aD9cbiAgICAgIGlmIG5vdCBmb3JjZSBhbmQgZnMuZXhpc3RzU3luYyhmdWxsUGF0aClcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIkZpbGUgZXhpc3RzIChhZGQgISB0byBvdmVycmlkZSlcIilcbiAgICAgIGlmIHNhdmVhcyBvciBlZGl0b3IuZ2V0RmlsZU5hbWUoKSA9PSBudWxsXG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICB0cnlTYXZlKC0+IGVkaXRvci5zYXZlQXMoZnVsbFBhdGgsIGVkaXRvcikpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSlcbiAgICAgIGVsc2VcbiAgICAgICAgdHJ5U2F2ZSgtPiBzYXZlQXMoZnVsbFBhdGgsIGVkaXRvcikpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSlcblxuICAgIGRlZmVycmVkLnByb21pc2VcblxuICB3YWxsOiAtPlxuICAgIGF0b20ud29ya3NwYWNlLnNhdmVBbGwoKVxuXG4gIHc6IChhcmdzKSA9PlxuICAgIEB3cml0ZShhcmdzKVxuXG4gIHdxOiAoYXJncykgPT5cbiAgICBAd3JpdGUoYXJncykudGhlbig9PiBAcXVpdCgpKVxuXG4gIHdhOiA9PlxuICAgIEB3YWxsKClcblxuICB3cWFsbDogPT5cbiAgICBAd2FsbCgpXG4gICAgQHF1aXRhbGwoKVxuXG4gIHdxYTogPT5cbiAgICBAd3FhbGwoKVxuXG4gIHhhbGw6ID0+XG4gICAgQHdxYWxsKClcblxuICB4YTogPT5cbiAgICBAd3FhbGwoKVxuXG4gIHNhdmVhczogKGFyZ3MpID0+XG4gICAgYXJncy5zYXZlYXMgPSB0cnVlXG4gICAgQHdyaXRlKGFyZ3MpXG5cbiAgeGl0OiAoYXJncykgPT4gQHdxKGFyZ3MpXG5cbiAgeDogKGFyZ3MpID0+IEB4aXQoYXJncylcblxuICBzcGxpdDogKHsgcmFuZ2UsIGFyZ3MgfSkgLT5cbiAgICBhcmdzID0gYXJncy50cmltKClcbiAgICBmaWxlUGF0aHMgPSBhcmdzLnNwbGl0KCcgJylcbiAgICBmaWxlUGF0aHMgPSB1bmRlZmluZWQgaWYgZmlsZVBhdGhzLmxlbmd0aCBpcyAxIGFuZCBmaWxlUGF0aHNbMF0gaXMgJydcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0YmVsb3cnKVxuICAgICAgaWYgZmlsZVBhdGhzPyBhbmQgZmlsZVBhdGhzLmxlbmd0aCA+IDBcbiAgICAgICAgbmV3UGFuZSA9IHBhbmUuc3BsaXREb3duKClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0RG93bihjb3B5QWN0aXZlSXRlbTogdHJ1ZSlcbiAgICBlbHNlXG4gICAgICBpZiBmaWxlUGF0aHM/IGFuZCBmaWxlUGF0aHMubGVuZ3RoID4gMFxuICAgICAgICBuZXdQYW5lID0gcGFuZS5zcGxpdFVwKClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0VXAoY29weUFjdGl2ZUl0ZW06IHRydWUpXG5cblxuICBzcDogKGFyZ3MpID0+IEBzcGxpdChhcmdzKVxuXG4gIHN1YnN0aXR1dGU6ICh7IHJhbmdlLCBhcmdzLCBlZGl0b3IsIHZpbVN0YXRlIH0pIC0+XG4gICAgYXJnc18gPSBhcmdzLnRyaW1MZWZ0KClcbiAgICBkZWxpbSA9IGFyZ3NfWzBdXG4gICAgaWYgL1thLXoxLTlcXFxcXCJ8XS9pLnRlc3QoZGVsaW0pXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFxuICAgICAgICBcIlJlZ3VsYXIgZXhwcmVzc2lvbnMgY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5IGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzLCAnXFxcXCcsICdcXFwiJyBvciAnfCdcIilcbiAgICBhcmdzXyA9IGFyZ3NfWzEuLl1cbiAgICBlc2NhcGVDaGFycyA9IHt0OiAnXFx0JywgbjogJ1xcbicsIHI6ICdcXHInfVxuICAgIHBhcnNlZCA9IFsnJywgJycsICcnXVxuICAgIHBhcnNpbmcgPSAwXG4gICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgd2hpbGUgKGNoYXIgPSBhcmdzX1swXSk/XG4gICAgICBhcmdzXyA9IGFyZ3NfWzEuLl1cbiAgICAgIGlmIGNoYXIgaXMgZGVsaW1cbiAgICAgICAgaWYgbm90IGVzY2FwZWRcbiAgICAgICAgICBwYXJzaW5nKytcbiAgICAgICAgICBpZiBwYXJzaW5nID4gMlxuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignVHJhaWxpbmcgY2hhcmFjdGVycycpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwYXJzZWRbcGFyc2luZ10gPSBwYXJzZWRbcGFyc2luZ11bLi4uLTFdXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgJ1xcXFwnIGFuZCBub3QgZXNjYXBlZFxuICAgICAgICBwYXJzZWRbcGFyc2luZ10gKz0gY2hhclxuICAgICAgICBlc2NhcGVkID0gdHJ1ZVxuICAgICAgZWxzZSBpZiBwYXJzaW5nID09IDEgYW5kIGVzY2FwZWQgYW5kIGVzY2FwZUNoYXJzW2NoYXJdP1xuICAgICAgICBwYXJzZWRbcGFyc2luZ10gKz0gZXNjYXBlQ2hhcnNbY2hhcl1cbiAgICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIGVzY2FwZWQgPSBmYWxzZVxuICAgICAgICBwYXJzZWRbcGFyc2luZ10gKz0gY2hhclxuXG4gICAgW3BhdHRlcm4sIHN1YnN0aXRpb24sIGZsYWdzXSA9IHBhcnNlZFxuICAgIGlmIHBhdHRlcm4gaXMgJydcbiAgICAgIGlmIHZpbVN0YXRlLmdldFNlYXJjaEhpc3RvcnlJdGVtP1xuICAgICAgICAjIHZpbS1tb2RlXG4gICAgICAgIHBhdHRlcm4gPSB2aW1TdGF0ZS5nZXRTZWFyY2hIaXN0b3J5SXRlbSgpXG4gICAgICBlbHNlIGlmIHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnk/XG4gICAgICAgICMgdmltLW1vZGUtcGx1c1xuICAgICAgICBwYXR0ZXJuID0gdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5nZXQoJ3ByZXYnKVxuXG4gICAgICBpZiBub3QgcGF0dGVybj9cbiAgICAgICAgYXRvbS5iZWVwKClcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignTm8gcHJldmlvdXMgcmVndWxhciBleHByZXNzaW9uJylcbiAgICBlbHNlXG4gICAgICBpZiB2aW1TdGF0ZS5wdXNoU2VhcmNoSGlzdG9yeT9cbiAgICAgICAgIyB2aW0tbW9kZVxuICAgICAgICB2aW1TdGF0ZS5wdXNoU2VhcmNoSGlzdG9yeShwYXR0ZXJuKVxuICAgICAgZWxzZSBpZiB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5P1xuICAgICAgICAjIHZpbS1tb2RlLXBsdXNcbiAgICAgICAgdmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKHBhdHRlcm4pXG5cbiAgICB0cnlcbiAgICAgIGZsYWdzT2JqID0ge31cbiAgICAgIGZsYWdzLnNwbGl0KCcnKS5mb3JFYWNoKChmbGFnKSAtPiBmbGFnc09ialtmbGFnXSA9IHRydWUpXG4gICAgICAjIGdkZWZhdWx0IG9wdGlvblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLmdkZWZhdWx0JylcbiAgICAgICAgZmxhZ3NPYmouZyA9ICFmbGFnc09iai5nXG4gICAgICBwYXR0ZXJuUkUgPSBnZXRTZWFyY2hUZXJtKHBhdHRlcm4sIGZsYWdzT2JqKVxuICAgIGNhdGNoIGVcbiAgICAgIGlmIGUubWVzc2FnZS5pbmRleE9mKCdJbnZhbGlkIGZsYWdzIHN1cHBsaWVkIHRvIFJlZ0V4cCBjb25zdHJ1Y3RvcicpIGlzIDBcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIkludmFsaWQgZmxhZ3M6ICN7ZS5tZXNzYWdlWzQ1Li5dfVwiKVxuICAgICAgZWxzZSBpZiBlLm1lc3NhZ2UuaW5kZXhPZignSW52YWxpZCByZWd1bGFyIGV4cHJlc3Npb246ICcpIGlzIDBcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIkludmFsaWQgUmVnRXg6ICN7ZS5tZXNzYWdlWzI3Li5dfVwiKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBlXG5cbiAgICBlZGl0b3IudHJhbnNhY3QgLT5cbiAgICAgIGZvciBsaW5lIGluIFtyYW5nZVswXS4ucmFuZ2VbMV1dXG4gICAgICAgIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShcbiAgICAgICAgICBwYXR0ZXJuUkUsXG4gICAgICAgICAgW1tsaW5lLCAwXSwgW2xpbmUgKyAxLCAwXV0sXG4gICAgICAgICAgKHttYXRjaCwgcmVwbGFjZX0pIC0+XG4gICAgICAgICAgICByZXBsYWNlKHJlcGxhY2VHcm91cHMobWF0Y2hbLi5dLCBzdWJzdGl0aW9uKSlcbiAgICAgICAgKVxuXG4gIHM6IChhcmdzKSA9PiBAc3Vic3RpdHV0ZShhcmdzKVxuXG4gIHZzcGxpdDogKHsgcmFuZ2UsIGFyZ3MgfSkgLT5cbiAgICBhcmdzID0gYXJncy50cmltKClcbiAgICBmaWxlUGF0aHMgPSBhcmdzLnNwbGl0KCcgJylcbiAgICBmaWxlUGF0aHMgPSB1bmRlZmluZWQgaWYgZmlsZVBhdGhzLmxlbmd0aCBpcyAxIGFuZCBmaWxlUGF0aHNbMF0gaXMgJydcbiAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKVxuICAgICAgaWYgZmlsZVBhdGhzPyBhbmQgZmlsZVBhdGhzLmxlbmd0aCA+IDBcbiAgICAgICAgbmV3UGFuZSA9IHBhbmUuc3BsaXRSaWdodCgpXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVQYXRoc1xuICAgICAgICAgIGRvIC0+XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lIGZpbGUsIG5ld1BhbmVcbiAgICAgIGVsc2VcbiAgICAgICAgcGFuZS5zcGxpdFJpZ2h0KGNvcHlBY3RpdmVJdGVtOiB0cnVlKVxuICAgIGVsc2VcbiAgICAgIGlmIGZpbGVQYXRocz8gYW5kIGZpbGVQYXRocy5sZW5ndGggPiAwXG4gICAgICAgIG5ld1BhbmUgPSBwYW5lLnNwbGl0TGVmdCgpXG4gICAgICAgIGZvciBmaWxlIGluIGZpbGVQYXRoc1xuICAgICAgICAgIGRvIC0+XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lIGZpbGUsIG5ld1BhbmVcbiAgICAgIGVsc2VcbiAgICAgICAgcGFuZS5zcGxpdExlZnQoY29weUFjdGl2ZUl0ZW06IHRydWUpXG5cbiAgdnNwOiAoYXJncykgPT4gQHZzcGxpdChhcmdzKVxuXG4gIGRlbGV0ZTogKHsgcmFuZ2UgfSkgLT5cbiAgICByYW5nZSA9IFtbcmFuZ2VbMF0sIDBdLCBbcmFuZ2VbMV0gKyAxLCAwXV1cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICAgIHRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dClcblxuICAgIGVkaXRvci5idWZmZXIuc2V0VGV4dEluUmFuZ2UocmFuZ2UsICcnKVxuXG4gIHlhbms6ICh7IHJhbmdlIH0pIC0+XG4gICAgcmFuZ2UgPSBbW3JhbmdlWzBdLCAwXSwgW3JhbmdlWzFdICsgMSwgMF1dXG4gICAgdHh0ID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHR4dCk7XG5cbiAgc2V0OiAoeyByYW5nZSwgYXJncyB9KSAtPlxuICAgIGFyZ3MgPSBhcmdzLnRyaW0oKVxuICAgIGlmIGFyZ3MgPT0gXCJcIlxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vIG9wdGlvbiBzcGVjaWZpZWRcIilcbiAgICBvcHRpb25zID0gYXJncy5zcGxpdCgnICcpXG4gICAgZm9yIG9wdGlvbiBpbiBvcHRpb25zXG4gICAgICBkbyAtPlxuICAgICAgICBpZiBvcHRpb24uaW5jbHVkZXMoXCI9XCIpXG4gICAgICAgICAgbmFtZVZhbFBhaXIgPSBvcHRpb24uc3BsaXQoXCI9XCIpXG4gICAgICAgICAgaWYgKG5hbWVWYWxQYWlyLmxlbmd0aCAhPSAyKVxuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIldyb25nIG9wdGlvbiBmb3JtYXQuIFtuYW1lXT1bdmFsdWVdIGZvcm1hdCBpcyBleHBlY3RlZFwiKVxuICAgICAgICAgIG9wdGlvbk5hbWUgPSBuYW1lVmFsUGFpclswXVxuICAgICAgICAgIG9wdGlvblZhbHVlID0gbmFtZVZhbFBhaXJbMV1cbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3IgPSBWaW1PcHRpb24uc2luZ2xldG9uKClbb3B0aW9uTmFtZV1cbiAgICAgICAgICBpZiBub3Qgb3B0aW9uUHJvY2Vzc29yP1xuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vIHN1Y2ggb3B0aW9uOiAje29wdGlvbk5hbWV9XCIpXG4gICAgICAgICAgb3B0aW9uUHJvY2Vzc29yKG9wdGlvblZhbHVlKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3B0aW9uUHJvY2Vzc29yID0gVmltT3B0aW9uLnNpbmdsZXRvbigpW29wdGlvbl1cbiAgICAgICAgICBpZiBub3Qgb3B0aW9uUHJvY2Vzc29yP1xuICAgICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vIHN1Y2ggb3B0aW9uOiAje29wdGlvbn1cIilcbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3IoKVxuXG4gIHNvcnQ6ICh7IHJhbmdlIH0pID0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgc29ydGluZ1JhbmdlID0gW1tdXVxuXG4gICAgIyBJZiBubyByYW5nZSBpcyBwcm92aWRlZCwgdGhlIGVudGlyZSBmaWxlIHNob3VsZCBiZSBzb3J0ZWQuXG4gICAgaXNNdWx0aUxpbmUgPSByYW5nZVsxXSAtIHJhbmdlWzBdID4gMVxuICAgIGlmIGlzTXVsdGlMaW5lXG4gICAgICBzb3J0aW5nUmFuZ2UgPSBbW3JhbmdlWzBdLCAwXSwgW3JhbmdlWzFdICsgMSwgMF1dXG4gICAgZWxzZVxuICAgICAgc29ydGluZ1JhbmdlID0gW1swLCAwXSwgW2VkaXRvci5nZXRMYXN0QnVmZmVyUm93KCksIDBdXVxuXG4gICAgIyBTdG9yZSBldmVyeSBidWZmZXJlZFJvdyBzdHJpbmcgaW4gYW4gYXJyYXkuXG4gICAgdGV4dExpbmVzID0gW11cbiAgICBmb3IgbGluZUluZGV4IGluIFtzb3J0aW5nUmFuZ2VbMF1bMF0uLnNvcnRpbmdSYW5nZVsxXVswXSAtIDFdXG4gICAgICB0ZXh0TGluZXMucHVzaChlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cobGluZUluZGV4KSlcblxuICAgICMgU29ydCB0aGUgYXJyYXkgYW5kIGpvaW4gdGhlbSB0b2dldGhlciB3aXRoIG5ld2xpbmVzIGZvciB3cml0aW5nIGJhY2sgdG8gdGhlIGZpbGUuXG4gICAgc29ydGVkVGV4dCA9IF8uc29ydEJ5KHRleHRMaW5lcykuam9pbignXFxuJykgKyAnXFxuJ1xuICAgIGVkaXRvci5idWZmZXIuc2V0VGV4dEluUmFuZ2Uoc29ydGluZ1JhbmdlLCBzb3J0ZWRUZXh0KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEV4XG4iXX0=
