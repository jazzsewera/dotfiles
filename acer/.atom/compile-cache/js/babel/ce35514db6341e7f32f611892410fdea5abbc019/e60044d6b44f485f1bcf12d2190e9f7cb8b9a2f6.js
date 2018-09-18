'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var BufferedProcess = _require.BufferedProcess;

var settings = require('./settings');
var VimState = require('./vim-state');

// NOTE: changing order affects output of lib/json/command-table.json
var VMPOperationFiles = ['./operator', './operator-insert', './operator-transform-string', './motion', './motion-search', './text-object', './misc-command'];

// Borrowed from underscore-plus
var ModifierKeyMap = {
  'ctrl-cmd-': '⌃⌘',
  'cmd-': '⌘',
  'ctrl-': '⌃',
  alt: '⌥',
  option: '⌥',
  enter: '⏎',
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
  backspace: 'BS',
  space: 'SPC'
};

var SelectorMap = {
  'atom-text-editor.vim-mode-plus': '',
  '.normal-mode': 'n',
  '.insert-mode': 'i',
  '.replace': 'R',
  '.visual-mode': 'v',
  '.characterwise': 'C',
  '.blockwise': 'B',
  '.linewise': 'L',
  '.operator-pending-mode': 'o',
  '.with-count': '#',
  '.has-persistent-selection': '%'
};

var Developer = (function () {
  function Developer() {
    _classCallCheck(this, Developer);
  }

  _createClass(Developer, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return atom.commands.add('atom-text-editor', {
        'vim-mode-plus:toggle-debug': function vimModePlusToggleDebug() {
          return _this.toggleDebug();
        },
        'vim-mode-plus:open-in-vim': function vimModePlusOpenInVim() {
          return _this.openInVim();
        },
        'vim-mode-plus:generate-command-summary-table': function vimModePlusGenerateCommandSummaryTable() {
          return _this.generateCommandSummaryTable();
        },
        'vim-mode-plus:write-command-table-and-file-table-to-disk': function vimModePlusWriteCommandTableAndFileTableToDisk() {
          return _this.writeCommandTableAndFileTableToDisk();
        },
        'vim-mode-plus:set-global-vim-state': function vimModePlusSetGlobalVimState() {
          return _this.setGlobalVimState();
        },
        'vim-mode-plus:clear-debug-output': function vimModePlusClearDebugOutput() {
          return _this.clearDebugOutput();
        },
        'vim-mode-plus:reload': function vimModePlusReload() {
          return _this.reload();
        },
        'vim-mode-plus:reload-with-dependencies': function vimModePlusReloadWithDependencies() {
          return _this.reload(true);
        },
        'vim-mode-plus:report-total-marker-count': function vimModePlusReportTotalMarkerCount() {
          return _this.reportTotalMarkerCount();
        },
        'vim-mode-plus:report-total-and-per-editor-marker-count': function vimModePlusReportTotalAndPerEditorMarkerCount() {
          return _this.reportTotalMarkerCount(true);
        },
        'vim-mode-plus:report-require-cache': function vimModePlusReportRequireCache() {
          return _this.reportRequireCache({ excludeNodModules: true });
        },
        'vim-mode-plus:report-require-cache-all': function vimModePlusReportRequireCacheAll() {
          return _this.reportRequireCache({ excludeNodModules: false });
        }
      });
    }
  }, {
    key: 'setGlobalVimState',
    value: function setGlobalVimState() {
      global.vimState = VimState.get(atom.workspace.getActiveTextEditor());
      console.log('set global.vimState for debug', global.vimState);
    }
  }, {
    key: 'reportRequireCache',
    value: function reportRequireCache(_ref) {
      var focus = _ref.focus;
      var excludeNodModules = _ref.excludeNodModules;

      var path = require('path');
      var packPath = atom.packages.getLoadedPackage('vim-mode-plus').path;
      var cachedPaths = Object.keys(require.cache).filter(function (p) {
        return p.startsWith(packPath + path.sep);
      }).map(function (p) {
        return p.replace(packPath, '');
      });

      for (var cachedPath of cachedPaths) {
        if (excludeNodModules && cachedPath.search(/node_modules/) >= 0) {
          continue;
        }
        if (focus && cachedPath.search(new RegExp('' + focus)) >= 0) {
          cachedPath = '*' + cachedPath;
        }
        console.log(cachedPath);
      }
    }
  }, {
    key: 'reportTotalMarkerCount',
    value: function reportTotalMarkerCount() {
      var showEditorsReport = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var _require2 = require('util');

      var inspect = _require2.inspect;

      var _require3 = require('path');

      var basename = _require3.basename;

      var total = {
        mark: 0,
        hlsearch: 0,
        mutation: 0,
        occurrence: 0,
        persistentSel: 0
      };

      for (var editor of atom.workspace.getTextEditors()) {
        var vimState = VimState.get(editor);
        var mark = vimState.mark.markerLayer.getMarkerCount();
        var hlsearch = vimState.highlightSearch.markerLayer.getMarkerCount();
        var mutation = vimState.mutationManager.markerLayer.getMarkerCount();
        var occurrence = vimState.occurrenceManager.markerLayer.getMarkerCount();
        var persistentSel = vimState.persistentSelection.markerLayer.getMarkerCount();
        if (showEditorsReport) {
          console.log(basename(editor.getPath()), inspect({ mark: mark, hlsearch: hlsearch, mutation: mutation, occurrence: occurrence, persistentSel: persistentSel }));
        }

        total.mark += mark;
        total.hlsearch += hlsearch;
        total.mutation += mutation;
        total.occurrence += occurrence;
        total.persistentSel += persistentSel;
      }

      return console.log('total', inspect(total));
    }
  }, {
    key: 'reload',
    value: _asyncToGenerator(function* (reloadDependencies) {
      function deleteRequireCacheForPathPrefix(prefix) {
        Object.keys(require.cache).filter(function (p) {
          return p.startsWith(prefix);
        }).forEach(function (p) {
          return delete require.cache[p];
        });
      }

      var packagesNeedReload = ['vim-mode-plus'];
      if (reloadDependencies) packagesNeedReload.push.apply(packagesNeedReload, _toConsumableArray(settings.get('devReloadPackages')));

      var loadedPackages = packagesNeedReload.filter(function (packName) {
        return atom.packages.isPackageLoaded(packName);
      });
      console.log('reload', loadedPackages);

      var pathSeparator = require('path').sep;

      for (var packName of loadedPackages) {
        console.log('- deactivating ' + packName);
        var packPath = atom.packages.getLoadedPackage(packName).path;
        yield atom.packages.deactivatePackage(packName);
        atom.packages.unloadPackage(packName);
        deleteRequireCacheForPathPrefix(packPath + pathSeparator);
      }
      console.time('activate');

      loadedPackages.forEach(function (packName) {
        console.log('+ activating ' + packName);
        atom.packages.loadPackage(packName);
        atom.packages.activatePackage(packName);
      });

      console.timeEnd('activate');
    })
  }, {
    key: 'clearDebugOutput',
    value: function clearDebugOutput(name, fn) {
      var _require4 = require('fs-plus');

      var normalize = _require4.normalize;

      var filePath = normalize(settings.get('debugOutputFilePath'));
      atom.workspace.open(filePath, { searchAllPanes: true, activatePane: false }).then(function (editor) {
        editor.setText('');
        editor.save();
      });
    }
  }, {
    key: 'toggleDebug',
    value: function toggleDebug() {
      settings.set('debug', !settings.get('debug'));
      console.log(settings.scope + ' debug:', settings.get('debug'));
    }
  }, {
    key: 'getCommandSpecs',
    value: function getCommandSpecs() {
      var _require5 = require('underscore-plus');

      var escapeRegExp = _require5.escapeRegExp;

      var _require6 = require('./utils');

      var getKeyBindingForCommand = _require6.getKeyBindingForCommand;

      var specs = [];
      for (var file of VMPOperationFiles) {
        for (var klass of Object.values(require(file))) {
          if (!klass.isCommand()) continue;

          var commandName = klass.getCommandName();

          var keymaps = getKeyBindingForCommand(commandName, { packageName: 'vim-mode-plus' });
          var keymap = keymaps ? keymaps.map(function (k) {
            return '`' + compactSelector(k.selector) + '` <code>' + compactKeystrokes(k.keystrokes) + '</code>';
          }).join('<br/>') : undefined;

          specs.push({
            name: klass.name,
            commandName: commandName,
            kind: klass.operationKind,
            keymap: keymap
          });
        }
      }

      return specs;

      function compactSelector(selector) {
        var sources = Object.keys(SelectorMap).map(escapeRegExp);
        var regex = new RegExp('(' + sources.join('|') + ')', 'g');
        return selector.split(/,\s*/g).map(function (scope) {
          return scope.replace(/:not\((.*?)\)/g, '!$1').replace(regex, function (s) {
            return SelectorMap[s];
          });
        }).join(',');
      }

      function compactKeystrokes(keystrokes) {
        var specialChars = '\\`*_{}[]()#+-.!';

        var modifierKeyRegexSources = Object.keys(ModifierKeyMap).map(escapeRegExp);
        var modifierKeyRegex = new RegExp('(' + modifierKeyRegexSources.join('|') + ')');
        var specialCharsRegexSources = specialChars.split('').map(escapeRegExp);
        var specialCharsRegex = new RegExp('(' + specialCharsRegexSources.join('|') + ')', 'g');

        return keystrokes
        // .replace(/(`|_)/g, '\\$1')
        .replace(modifierKeyRegex, function (s) {
          return ModifierKeyMap[s];
        }).replace(specialCharsRegex, '\\$1').replace(/\|/g, '&#124;').replace(/\s+/, '');
      }
    }
  }, {
    key: 'generateSummaryTableForCommandSpecs',
    value: function generateSummaryTableForCommandSpecs(specs) {
      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var header = _ref2.header;

      var grouped = {};
      for (var spec of specs) {
        grouped[spec.kind] = spec;
      }var result = '';
      var OPERATION_KINDS = ['operator', 'motion', 'text-object', 'misc-command'];

      for (var kind of OPERATION_KINDS) {
        var _specs = grouped[kind];
        if (!_specs) continue;

        // prettier-ignore
        var table = ['| Keymap | Command | Description |', '|:-------|:--------|:------------|'];

        for (var _ref32 of _specs) {
          var _ref3$keymap = _ref32.keymap;
          var keymap = _ref3$keymap === undefined ? '' : _ref3$keymap;
          var commandName = _ref32.commandName;
          var _ref3$description = _ref32.description;
          var description = _ref3$description === undefined ? '' : _ref3$description;

          commandName = commandName.replace(/vim-mode-plus:/, '');
          table.push('| ' + keymap + ' | `' + commandName + '` | ' + description + ' |');
        }
        result += '## ' + kind + '\n\n' + table.join('\n') + '\n\n';
      }

      atom.workspace.open().then(function (editor) {
        if (header) editor.insertText(header + '\n\n');
        editor.insertText(result);
      });
    }
  }, {
    key: 'generateCommandSummaryTable',
    value: function generateCommandSummaryTable() {
      var _require7 = require('./utils');

      var removeIndent = _require7.removeIndent;

      var header = removeIndent('\n      ## Keymap selector abbreviations\n\n      In this document, following abbreviations are used for shortness.\n\n      | Abbrev | Selector                     | Description                         |\n      |:-------|:-----------------------------|:------------------------------------|\n      | `!i`   | `:not(.insert-mode)`         | except insert-mode                  |\n      | `i`    | `.insert-mode`               |                                     |\n      | `o`    | `.operator-pending-mode`     |                                     |\n      | `n`    | `.normal-mode`               |                                     |\n      | `v`    | `.visual-mode`               |                                     |\n      | `vB`   | `.visual-mode.blockwise`     |                                     |\n      | `vL`   | `.visual-mode.linewise`      |                                     |\n      | `vC`   | `.visual-mode.characterwise` |                                     |\n      | `iR`   | `.insert-mode.replace`       |                                     |\n      | `#`    | `.with-count`                | when count is specified             |\n      | `%`    | `.has-persistent-selection`  | when persistent-selection is exists |\n      ');

      this.generateSummaryTableForCommandSpecs(this.getCommandSpecs(), { header: header });
    }
  }, {
    key: 'openInVim',
    value: function openInVim() {
      var editor = atom.workspace.getActiveTextEditor();

      var _editor$getCursorBufferPosition = editor.getCursorBufferPosition();

      var row = _editor$getCursorBufferPosition.row;
      var column = _editor$getCursorBufferPosition.column;

      // e.g. /Applications/MacVim.app/Contents/MacOS/Vim -g /etc/hosts "+call cursor(4, 3)"
      return new BufferedProcess({
        command: '/Applications/MacVim.app/Contents/MacOS/Vim',
        args: ['-g', editor.getPath(), '+call cursor(' + (row + 1) + ', ' + (column + 1) + ')']
      });
    }
  }, {
    key: 'buildCommandTableAndFileTable',
    value: function buildCommandTableAndFileTable() {
      var fileTable = {};
      var commandTable = [];
      var seen = {}; // Just to detect duplicate name

      for (var file of VMPOperationFiles) {
        fileTable[file] = [];

        for (var klass of Object.values(require(file))) {
          if (seen[klass.name]) {
            throw new Error('Duplicate class ' + klass.name + ' in "' + file + '" and "' + seen[klass.name] + '"');
          }
          seen[klass.name] = file;
          fileTable[file].push(klass.name);
          if (klass.isCommand()) commandTable.push(klass.getCommandName());
        }
      }
      return { commandTable: commandTable, fileTable: fileTable };
    }

    // # How vmp commands become available?
    // #========================================
    // Vmp have many commands, loading full commands at startup slow down pkg activation.
    // So vmp load summary command table at startup then lazy require command body on-use timing.
    // Here is how vmp commands are registerd and invoked.
    // Initially introduced in PR #758
    //
    // 1. [On dev]: Preparation done by developer
    //   - Invoking `Vim Mode Plus:Write Command Table And File Table To Disk`. it does following.
    //   - "./json/command-table.json" and "./json/file-table.json". are updated.
    //
    // 2. [On atom/vmp startup]
    //   - Register commands(e.g. `move-down`) from "./json/command-table.json".
    //
    // 3. [On run time]: e.g. Invoke `move-down` by `j` keystroke
    //   - Fire `move-down` command.
    //   - It execute `vimState.operationStack.run("MoveDown")`
    //   - Determine files to require from "./json/file-table.json".
    //   - Load `MoveDown` class by require('./motions') and run it!
    //
  }, {
    key: 'writeCommandTableAndFileTableToDisk',
    value: _asyncToGenerator(function* () {
      var fs = require('fs-plus');
      var path = require('path');

      var _buildCommandTableAndFileTable = this.buildCommandTableAndFileTable();

      var commandTable = _buildCommandTableAndFileTable.commandTable;
      var fileTable = _buildCommandTableAndFileTable.fileTable;

      var getStateFor = function getStateFor(baseName, object, pretty) {
        var filePath = path.join(__dirname, 'json', baseName) + (pretty ? '-pretty.json' : '.json');
        var jsonString = pretty ? JSON.stringify(object, null, '  ') : JSON.stringify(object);
        var needUpdate = fs.readFileSync(filePath, 'utf8').trimRight() !== jsonString;
        return { filePath: filePath, jsonString: jsonString, needUpdate: needUpdate };
      };

      var statesNeedUpdate = [getStateFor('command-table', commandTable, false), getStateFor('command-table', commandTable, true), getStateFor('file-table', fileTable, false), getStateFor('file-table', fileTable, true)].filter(function (state) {
        return state.needUpdate;
      });

      if (!statesNeedUpdate.length) {
        atom.notifications.addInfo('No changfes in commandTable and fileTable', { dismissable: true });
        return;
      }

      var _loop = function* (_ref4) {
        var jsonString = _ref4.jsonString;
        var filePath = _ref4.filePath;

        yield atom.workspace.open(filePath, { activatePane: false, activateItem: false }).then(function (editor) {
          editor.setText(jsonString);
          return editor.save().then(function () {
            atom.notifications.addInfo('Updated ' + path.basename(filePath), { dismissable: true });
          });
        });
      };

      for (var _ref4 of statesNeedUpdate) {
        yield* _loop(_ref4);
      }
    })
  }]);

  return Developer;
})();

module.exports = new Developer();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZGV2ZWxvcGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7OztlQUVlLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxDLGVBQWUsWUFBZixlQUFlOztBQUV0QixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDdEMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBOzs7QUFHdkMsSUFBTSxpQkFBaUIsR0FBRyxDQUN4QixZQUFZLEVBQ1osbUJBQW1CLEVBQ25CLDZCQUE2QixFQUM3QixVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixnQkFBZ0IsQ0FDakIsQ0FBQTs7O0FBR0QsSUFBTSxjQUFjLEdBQUc7QUFDckIsYUFBVyxFQUFFLElBQWM7QUFDM0IsUUFBTSxFQUFFLEdBQVE7QUFDaEIsU0FBTyxFQUFFLEdBQVE7QUFDakIsS0FBRyxFQUFFLEdBQVE7QUFDYixRQUFNLEVBQUUsR0FBUTtBQUNoQixPQUFLLEVBQUUsR0FBUTtBQUNmLE1BQUksRUFBRSxHQUFRO0FBQ2QsT0FBSyxFQUFFLEdBQVE7QUFDZixJQUFFLEVBQUUsR0FBUTtBQUNaLE1BQUksRUFBRSxHQUFRO0FBQ2QsV0FBUyxFQUFFLElBQUk7QUFDZixPQUFLLEVBQUUsS0FBSztDQUNiLENBQUE7O0FBRUQsSUFBTSxXQUFXLEdBQUc7QUFDbEIsa0NBQWdDLEVBQUUsRUFBRTtBQUNwQyxnQkFBYyxFQUFFLEdBQUc7QUFDbkIsZ0JBQWMsRUFBRSxHQUFHO0FBQ25CLFlBQVUsRUFBRSxHQUFHO0FBQ2YsZ0JBQWMsRUFBRSxHQUFHO0FBQ25CLGtCQUFnQixFQUFFLEdBQUc7QUFDckIsY0FBWSxFQUFFLEdBQUc7QUFDakIsYUFBVyxFQUFFLEdBQUc7QUFDaEIsMEJBQXdCLEVBQUUsR0FBRztBQUM3QixlQUFhLEVBQUUs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U0FBUixRQUFROztBQUM5QixjQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQzdGLGdCQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQzFCLGlCQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUM5QixnQkFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLGNBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBSSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBO1dBQ3RGLENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTs7O0FBTkosd0JBQXFDLGdCQUFnQixFQUFFOztPQU90RDtLQUNGOzs7U0EzVEcsU0FBUzs7O0FBOFRmLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQSIsImZpbGUiOiIvaG9tZS9qYXp6Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2RldmVsb3Blci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSgnYXRvbScpXG5cbmNvbnN0IHNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpXG5jb25zdCBWaW1TdGF0ZSA9IHJlcXVpcmUoJy4vdmltLXN0YXRlJylcblxuLy8gTk9URTogY2hhbmdpbmcgb3JkZXIgYWZmZWN0cyBvdXRwdXQgb2YgbGliL2pzb24vY29tbWFuZC10YWJsZS5qc29uXG5jb25zdCBWTVBPcGVyYXRpb25GaWxlcyA9IFtcbiAgJy4vb3BlcmF0b3InLFxuICAnLi9vcGVyYXRvci1pbnNlcnQnLFxuICAnLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nJyxcbiAgJy4vbW90aW9uJyxcbiAgJy4vbW90aW9uLXNlYXJjaCcsXG4gICcuL3RleHQtb2JqZWN0JyxcbiAgJy4vbWlzYy1jb21tYW5kJ1xuXVxuXG4vLyBCb3Jyb3dlZCBmcm9tIHVuZGVyc2NvcmUtcGx1c1xuY29uc3QgTW9kaWZpZXJLZXlNYXAgPSB7XG4gICdjdHJsLWNtZC0nOiAnXFx1MjMwM1xcdTIzMTgnLFxuICAnY21kLSc6ICdcXHUyMzE4JyxcbiAgJ2N0cmwtJzogJ1xcdTIzMDMnLFxuICBhbHQ6ICdcXHUyMzI1JyxcbiAgb3B0aW9uOiAnXFx1MjMyNScsXG4gIGVudGVyOiAnXFx1MjNjZScsXG4gIGxlZnQ6ICdcXHUyMTkwJyxcbiAgcmlnaHQ6ICdcXHUyMTkyJyxcbiAgdXA6ICdcXHUyMTkxJyxcbiAgZG93bjogJ1xcdTIxOTMnLFxuICBiYWNrc3BhY2U6ICdCUycsXG4gIHNwYWNlOiAnU1BDJ1xufVxuXG5jb25zdCBTZWxlY3Rvck1hcCA9IHtcbiAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cyc6ICcnLFxuICAnLm5vcm1hbC1tb2RlJzogJ24nLFxuICAnLmluc2VydC1tb2RlJzogJ2knLFxuICAnLnJlcGxhY2UnOiAnUicsXG4gICcudmlzdWFsLW1vZGUnOiAndicsXG4gICcuY2hhcmFjdGVyd2lzZSc6ICdDJyxcbiAgJy5ibG9ja3dpc2UnOiAnQicsXG4gICcubGluZXdpc2UnOiAnTCcsXG4gICcub3BlcmF0b3ItcGVuZGluZy1tb2RlJzogJ28nLFxuICAnLndpdGgtY291bnQnOiAnIycsXG4gICcuaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uJzogJyUnXG59XG5cbmNsYXNzIERldmVsb3BlciB7XG4gIGluaXQgKCkge1xuICAgIHJldHVybiBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIHtcbiAgICAgICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1kZWJ1Zyc6ICgpID0+IHRoaXMudG9nZ2xlRGVidWcoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOm9wZW4taW4tdmltJzogKCkgPT4gdGhpcy5vcGVuSW5WaW0oKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmdlbmVyYXRlLWNvbW1hbmQtc3VtbWFyeS10YWJsZSc6ICgpID0+IHRoaXMuZ2VuZXJhdGVDb21tYW5kU3VtbWFyeVRhYmxlKCksXG4gICAgICAndmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLWFuZC1maWxlLXRhYmxlLXRvLWRpc2snOiAoKSA9PiB0aGlzLndyaXRlQ29tbWFuZFRhYmxlQW5kRmlsZVRhYmxlVG9EaXNrKCksXG4gICAgICAndmltLW1vZGUtcGx1czpzZXQtZ2xvYmFsLXZpbS1zdGF0ZSc6ICgpID0+IHRoaXMuc2V0R2xvYmFsVmltU3RhdGUoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOmNsZWFyLWRlYnVnLW91dHB1dCc6ICgpID0+IHRoaXMuY2xlYXJEZWJ1Z091dHB1dCgpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6cmVsb2FkJzogKCkgPT4gdGhpcy5yZWxvYWQoKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOnJlbG9hZC13aXRoLWRlcGVuZGVuY2llcyc6ICgpID0+IHRoaXMucmVsb2FkKHRydWUpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6cmVwb3J0LXRvdGFsLW1hcmtlci1jb3VudCc6ICgpID0+IHRoaXMucmVwb3J0VG90YWxNYXJrZXJDb3VudCgpLFxuICAgICAgJ3ZpbS1tb2RlLXBsdXM6cmVwb3J0LXRvdGFsLWFuZC1wZXItZWRpdG9yLW1hcmtlci1jb3VudCc6ICgpID0+IHRoaXMucmVwb3J0VG90YWxNYXJrZXJDb3VudCh0cnVlKSxcbiAgICAgICd2aW0tbW9kZS1wbHVzOnJlcG9ydC1yZXF1aXJlLWNhY2hlJzogKCkgPT4gdGhpcy5yZXBvcnRSZXF1aXJlQ2FjaGUoe2V4Y2x1ZGVOb2RNb2R1bGVzOiB0cnVlfSksXG4gICAgICAndmltLW1vZGUtcGx1czpyZXBvcnQtcmVxdWlyZS1jYWNoZS1hbGwnOiAoKSA9PiB0aGlzLnJlcG9ydFJlcXVpcmVDYWNoZSh7ZXhjbHVkZU5vZE1vZHVsZXM6IGZhbHNlfSlcbiAgICB9KVxuICB9XG5cbiAgc2V0R2xvYmFsVmltU3RhdGUgKCkge1xuICAgIGdsb2JhbC52aW1TdGF0ZSA9IFZpbVN0YXRlLmdldChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgY29uc29sZS5sb2coJ3NldCBnbG9iYWwudmltU3RhdGUgZm9yIGRlYnVnJywgZ2xvYmFsLnZpbVN0YXRlKVxuICB9XG5cbiAgcmVwb3J0UmVxdWlyZUNhY2hlICh7Zm9jdXMsIGV4Y2x1ZGVOb2RNb2R1bGVzfSkge1xuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICBjb25zdCBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgndmltLW1vZGUtcGx1cycpLnBhdGhcbiAgICBjb25zdCBjYWNoZWRQYXRocyA9IE9iamVjdC5rZXlzKHJlcXVpcmUuY2FjaGUpXG4gICAgICAuZmlsdGVyKHAgPT4gcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgcGF0aC5zZXApKVxuICAgICAgLm1hcChwID0+IHAucmVwbGFjZShwYWNrUGF0aCwgJycpKVxuXG4gICAgZm9yIChsZXQgY2FjaGVkUGF0aCBvZiBjYWNoZWRQYXRocykge1xuICAgICAgaWYgKGV4Y2x1ZGVOb2RNb2R1bGVzICYmIGNhY2hlZFBhdGguc2VhcmNoKC9ub2RlX21vZHVsZXMvKSA+PSAwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAoZm9jdXMgJiYgY2FjaGVkUGF0aC5zZWFyY2gobmV3IFJlZ0V4cChgJHtmb2N1c31gKSkgPj0gMCkge1xuICAgICAgICBjYWNoZWRQYXRoID0gYCoke2NhY2hlZFBhdGh9YFxuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coY2FjaGVkUGF0aClcbiAgICB9XG4gIH1cblxuICByZXBvcnRUb3RhbE1hcmtlckNvdW50IChzaG93RWRpdG9yc1JlcG9ydCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2luc3BlY3R9ID0gcmVxdWlyZSgndXRpbCcpXG4gICAgY29uc3Qge2Jhc2VuYW1lfSA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIGNvbnN0IHRvdGFsID0ge1xuICAgICAgbWFyazogMCxcbiAgICAgIGhsc2VhcmNoOiAwLFxuICAgICAgbXV0YXRpb246IDAsXG4gICAgICBvY2N1cnJlbmNlOiAwLFxuICAgICAgcGVyc2lzdGVudFNlbDogMFxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZWRpdG9yIG9mIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkpIHtcbiAgICAgIGNvbnN0IHZpbVN0YXRlID0gVmltU3RhdGUuZ2V0KGVkaXRvcilcbiAgICAgIGNvbnN0IG1hcmsgPSB2aW1TdGF0ZS5tYXJrLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGNvbnN0IGhsc2VhcmNoID0gdmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGNvbnN0IG11dGF0aW9uID0gdmltU3RhdGUubXV0YXRpb25NYW5hZ2VyLm1hcmtlckxheWVyLmdldE1hcmtlckNvdW50KClcbiAgICAgIGNvbnN0IG9jY3VycmVuY2UgPSB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBjb25zdCBwZXJzaXN0ZW50U2VsID0gdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5tYXJrZXJMYXllci5nZXRNYXJrZXJDb3VudCgpXG4gICAgICBpZiAoc2hvd0VkaXRvcnNSZXBvcnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coYmFzZW5hbWUoZWRpdG9yLmdldFBhdGgoKSksIGluc3BlY3Qoe21hcmssIGhsc2VhcmNoLCBtdXRhdGlvbiwgb2NjdXJyZW5jZSwgcGVyc2lzdGVudFNlbH0pKVxuICAgICAgfVxuXG4gICAgICB0b3RhbC5tYXJrICs9IG1hcmtcbiAgICAgIHRvdGFsLmhsc2VhcmNoICs9IGhsc2VhcmNoXG4gICAgICB0b3RhbC5tdXRhdGlvbiArPSBtdXRhdGlvblxuICAgICAgdG90YWwub2NjdXJyZW5jZSArPSBvY2N1cnJlbmNlXG4gICAgICB0b3RhbC5wZXJzaXN0ZW50U2VsICs9IHBlcnNpc3RlbnRTZWxcbiAgICB9XG5cbiAgICByZXR1cm4gY29uc29sZS5sb2coJ3RvdGFsJywgaW5zcGVjdCh0b3RhbCkpXG4gIH1cblxuICBhc3luYyByZWxvYWQgKHJlbG9hZERlcGVuZGVuY2llcykge1xuICAgIGZ1bmN0aW9uIGRlbGV0ZVJlcXVpcmVDYWNoZUZvclBhdGhQcmVmaXggKHByZWZpeCkge1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZS5jYWNoZSlcbiAgICAgICAgLmZpbHRlcihwID0+IHAuc3RhcnRzV2l0aChwcmVmaXgpKVxuICAgICAgICAuZm9yRWFjaChwID0+IGRlbGV0ZSByZXF1aXJlLmNhY2hlW3BdKVxuICAgIH1cblxuICAgIGNvbnN0IHBhY2thZ2VzTmVlZFJlbG9hZCA9IFsndmltLW1vZGUtcGx1cyddXG4gICAgaWYgKHJlbG9hZERlcGVuZGVuY2llcykgcGFja2FnZXNOZWVkUmVsb2FkLnB1c2goLi4uc2V0dGluZ3MuZ2V0KCdkZXZSZWxvYWRQYWNrYWdlcycpKVxuXG4gICAgY29uc3QgbG9hZGVkUGFja2FnZXMgPSBwYWNrYWdlc05lZWRSZWxvYWQuZmlsdGVyKHBhY2tOYW1lID0+IGF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKHBhY2tOYW1lKSlcbiAgICBjb25zb2xlLmxvZygncmVsb2FkJywgbG9hZGVkUGFja2FnZXMpXG5cbiAgICBjb25zdCBwYXRoU2VwYXJhdG9yID0gcmVxdWlyZSgncGF0aCcpLnNlcFxuXG4gICAgZm9yIChjb25zdCBwYWNrTmFtZSBvZiBsb2FkZWRQYWNrYWdlcykge1xuICAgICAgY29uc29sZS5sb2coYC0gZGVhY3RpdmF0aW5nICR7cGFja05hbWV9YClcbiAgICAgIGNvbnN0IHBhY2tQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKHBhY2tOYW1lKS5wYXRoXG4gICAgICBhd2FpdCBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgYXRvbS5wYWNrYWdlcy51bmxvYWRQYWNrYWdlKHBhY2tOYW1lKVxuICAgICAgZGVsZXRlUmVxdWlyZUNhY2hlRm9yUGF0aFByZWZpeChwYWNrUGF0aCArIHBhdGhTZXBhcmF0b3IpXG4gICAgfVxuICAgIGNvbnNvbGUudGltZSgnYWN0aXZhdGUnKVxuXG4gICAgbG9hZGVkUGFja2FnZXMuZm9yRWFjaChwYWNrTmFtZSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgKyBhY3RpdmF0aW5nICR7cGFja05hbWV9YClcbiAgICAgIGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UocGFja05hbWUpXG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrTmFtZSlcbiAgICB9KVxuXG4gICAgY29uc29sZS50aW1lRW5kKCdhY3RpdmF0ZScpXG4gIH1cblxuICBjbGVhckRlYnVnT3V0cHV0IChuYW1lLCBmbikge1xuICAgIGNvbnN0IHtub3JtYWxpemV9ID0gcmVxdWlyZSgnZnMtcGx1cycpXG4gICAgY29uc3QgZmlsZVBhdGggPSBub3JtYWxpemUoc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dEZpbGVQYXRoJykpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCwge3NlYXJjaEFsbFBhbmVzOiB0cnVlLCBhY3RpdmF0ZVBhbmU6IGZhbHNlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQoJycpXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIHRvZ2dsZURlYnVnICgpIHtcbiAgICBzZXR0aW5ncy5zZXQoJ2RlYnVnJywgIXNldHRpbmdzLmdldCgnZGVidWcnKSlcbiAgICBjb25zb2xlLmxvZyhgJHtzZXR0aW5ncy5zY29wZX0gZGVidWc6YCwgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpKVxuICB9XG5cbiAgZ2V0Q29tbWFuZFNwZWNzICgpIHtcbiAgICBjb25zdCB7ZXNjYXBlUmVnRXhwfSA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUtcGx1cycpXG4gICAgY29uc3Qge2dldEtleUJpbmRpbmdGb3JDb21tYW5kfSA9IHJlcXVpcmUoJy4vdXRpbHMnKVxuXG4gICAgY29uc3Qgc3BlY3MgPSBbXVxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBWTVBPcGVyYXRpb25GaWxlcykge1xuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiBPYmplY3QudmFsdWVzKHJlcXVpcmUoZmlsZSkpKSB7XG4gICAgICAgIGlmICgha2xhc3MuaXNDb21tYW5kKCkpIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3QgY29tbWFuZE5hbWUgPSBrbGFzcy5nZXRDb21tYW5kTmFtZSgpXG5cbiAgICAgICAgY29uc3Qga2V5bWFwcyA9IGdldEtleUJpbmRpbmdGb3JDb21tYW5kKGNvbW1hbmROYW1lLCB7cGFja2FnZU5hbWU6ICd2aW0tbW9kZS1wbHVzJ30pXG4gICAgICAgIGNvbnN0IGtleW1hcCA9IGtleW1hcHNcbiAgICAgICAgICA/IGtleW1hcHNcbiAgICAgICAgICAgICAgLm1hcChrID0+IGBcXGAke2NvbXBhY3RTZWxlY3RvcihrLnNlbGVjdG9yKX1cXGAgPGNvZGU+JHtjb21wYWN0S2V5c3Ryb2tlcyhrLmtleXN0cm9rZXMpfTwvY29kZT5gKVxuICAgICAgICAgICAgICAuam9pbignPGJyLz4nKVxuICAgICAgICAgIDogdW5kZWZpbmVkXG5cbiAgICAgICAgc3BlY3MucHVzaCh7XG4gICAgICAgICAgbmFtZToga2xhc3MubmFtZSxcbiAgICAgICAgICBjb21tYW5kTmFtZTogY29tbWFuZE5hbWUsXG4gICAgICAgICAga2luZDoga2xhc3Mub3BlcmF0aW9uS2luZCxcbiAgICAgICAgICBrZXltYXA6IGtleW1hcFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcGVjc1xuXG4gICAgZnVuY3Rpb24gY29tcGFjdFNlbGVjdG9yIChzZWxlY3Rvcikge1xuICAgICAgY29uc3Qgc291cmNlcyA9IE9iamVjdC5rZXlzKFNlbGVjdG9yTWFwKS5tYXAoZXNjYXBlUmVnRXhwKVxuICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGAoJHtzb3VyY2VzLmpvaW4oJ3wnKX0pYCwgJ2cnKVxuICAgICAgcmV0dXJuIHNlbGVjdG9yXG4gICAgICAgIC5zcGxpdCgvLFxccyovZylcbiAgICAgICAgLm1hcChzY29wZSA9PiBzY29wZS5yZXBsYWNlKC86bm90XFwoKC4qPylcXCkvZywgJyEkMScpLnJlcGxhY2UocmVnZXgsIHMgPT4gU2VsZWN0b3JNYXBbc10pKVxuICAgICAgICAuam9pbignLCcpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcGFjdEtleXN0cm9rZXMgKGtleXN0cm9rZXMpIHtcbiAgICAgIGNvbnN0IHNwZWNpYWxDaGFycyA9ICdcXFxcYCpfe31bXSgpIystLiEnXG5cbiAgICAgIGNvbnN0IG1vZGlmaWVyS2V5UmVnZXhTb3VyY2VzID0gT2JqZWN0LmtleXMoTW9kaWZpZXJLZXlNYXApLm1hcChlc2NhcGVSZWdFeHApXG4gICAgICBjb25zdCBtb2RpZmllcktleVJlZ2V4ID0gbmV3IFJlZ0V4cChgKCR7bW9kaWZpZXJLZXlSZWdleFNvdXJjZXMuam9pbignfCcpfSlgKVxuICAgICAgY29uc3Qgc3BlY2lhbENoYXJzUmVnZXhTb3VyY2VzID0gc3BlY2lhbENoYXJzLnNwbGl0KCcnKS5tYXAoZXNjYXBlUmVnRXhwKVxuICAgICAgY29uc3Qgc3BlY2lhbENoYXJzUmVnZXggPSBuZXcgUmVnRXhwKGAoJHtzcGVjaWFsQ2hhcnNSZWdleFNvdXJjZXMuam9pbignfCcpfSlgLCAnZycpXG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIGtleXN0cm9rZXNcbiAgICAgICAgICAvLyAucmVwbGFjZSgvKGB8XykvZywgJ1xcXFwkMScpXG4gICAgICAgICAgLnJlcGxhY2UobW9kaWZpZXJLZXlSZWdleCwgcyA9PiBNb2RpZmllcktleU1hcFtzXSlcbiAgICAgICAgICAucmVwbGFjZShzcGVjaWFsQ2hhcnNSZWdleCwgJ1xcXFwkMScpXG4gICAgICAgICAgLnJlcGxhY2UoL1xcfC9nLCAnJiMxMjQ7JylcbiAgICAgICAgICAucmVwbGFjZSgvXFxzKy8sICcnKVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGdlbmVyYXRlU3VtbWFyeVRhYmxlRm9yQ29tbWFuZFNwZWNzIChzcGVjcywge2hlYWRlcn0gPSB7fSkge1xuICAgIGNvbnN0IGdyb3VwZWQgPSB7fVxuICAgIGZvciAoY29uc3Qgc3BlYyBvZiBzcGVjcykgZ3JvdXBlZFtzcGVjLmtpbmRdID0gc3BlY1xuXG4gICAgbGV0IHJlc3VsdCA9ICcnXG4gICAgY29uc3QgT1BFUkFUSU9OX0tJTkRTID0gWydvcGVyYXRvcicsICdtb3Rpb24nLCAndGV4dC1vYmplY3QnLCAnbWlzYy1jb21tYW5kJ11cblxuICAgIGZvciAobGV0IGtpbmQgb2YgT1BFUkFUSU9OX0tJTkRTKSB7XG4gICAgICBjb25zdCBzcGVjcyA9IGdyb3VwZWRba2luZF1cbiAgICAgIGlmICghc3BlY3MpIGNvbnRpbnVlXG5cbiAgICAgIC8vIHByZXR0aWVyLWlnbm9yZVxuICAgICAgY29uc3QgdGFibGUgPSBbXG4gICAgICAgICd8IEtleW1hcCB8IENvbW1hbmQgfCBEZXNjcmlwdGlvbiB8JyxcbiAgICAgICAgJ3w6LS0tLS0tLXw6LS0tLS0tLS18Oi0tLS0tLS0tLS0tLXwnXG4gICAgICBdXG5cbiAgICAgIGZvciAobGV0IHtrZXltYXAgPSAnJywgY29tbWFuZE5hbWUsIGRlc2NyaXB0aW9uID0gJyd9IG9mIHNwZWNzKSB7XG4gICAgICAgIGNvbW1hbmROYW1lID0gY29tbWFuZE5hbWUucmVwbGFjZSgvdmltLW1vZGUtcGx1czovLCAnJylcbiAgICAgICAgdGFibGUucHVzaChgfCAke2tleW1hcH0gfCBcXGAke2NvbW1hbmROYW1lfVxcYCB8ICR7ZGVzY3JpcHRpb259IHxgKVxuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IGAjIyAke2tpbmR9XFxuXFxuYCArIHRhYmxlLmpvaW4oJ1xcbicpICsgJ1xcblxcbidcbiAgICB9XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgaWYgKGhlYWRlcikgZWRpdG9yLmluc2VydFRleHQoaGVhZGVyICsgJ1xcblxcbicpXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChyZXN1bHQpXG4gICAgfSlcbiAgfVxuXG4gIGdlbmVyYXRlQ29tbWFuZFN1bW1hcnlUYWJsZSAoKSB7XG4gICAgY29uc3Qge3JlbW92ZUluZGVudH0gPSByZXF1aXJlKCcuL3V0aWxzJylcbiAgICBjb25zdCBoZWFkZXIgPSByZW1vdmVJbmRlbnQoYFxuICAgICAgIyMgS2V5bWFwIHNlbGVjdG9yIGFiYnJldmlhdGlvbnNcblxuICAgICAgSW4gdGhpcyBkb2N1bWVudCwgZm9sbG93aW5nIGFiYnJldmlhdGlvbnMgYXJlIHVzZWQgZm9yIHNob3J0bmVzcy5cblxuICAgICAgfCBBYmJyZXYgfCBTZWxlY3RvciAgICAgICAgICAgICAgICAgICAgIHwgRGVzY3JpcHRpb24gICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfDotLS0tLS0tfDotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXw6LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICAgICAgfCBcXGAhaVxcYCAgIHwgXFxgOm5vdCguaW5zZXJ0LW1vZGUpXFxgICAgICAgICAgfCBleGNlcHQgaW5zZXJ0LW1vZGUgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYGlcXGAgICAgfCBcXGAuaW5zZXJ0LW1vZGVcXGAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgb1xcYCAgICB8IFxcYC5vcGVyYXRvci1wZW5kaW5nLW1vZGVcXGAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGBuXFxgICAgIHwgXFxgLm5vcm1hbC1tb2RlXFxgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYHZcXGAgICAgfCBcXGAudmlzdWFsLW1vZGVcXGAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgdkJcXGAgICB8IFxcYC52aXN1YWwtbW9kZS5ibG9ja3dpc2VcXGAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGB2TFxcYCAgIHwgXFxgLnZpc3VhbC1tb2RlLmxpbmV3aXNlXFxgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICB8IFxcYHZDXFxgICAgfCBcXGAudmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZVxcYCB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgIHwgXFxgaVJcXGAgICB8IFxcYC5pbnNlcnQtbW9kZS5yZXBsYWNlXFxgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgfCBcXGAjXFxgICAgIHwgXFxgLndpdGgtY291bnRcXGAgICAgICAgICAgICAgICAgfCB3aGVuIGNvdW50IGlzIHNwZWNpZmllZCAgICAgICAgICAgICB8XG4gICAgICB8IFxcYCVcXGAgICAgfCBcXGAuaGFzLXBlcnNpc3RlbnQtc2VsZWN0aW9uXFxgICB8IHdoZW4gcGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgZXhpc3RzIHxcbiAgICAgIGApXG5cbiAgICB0aGlzLmdlbmVyYXRlU3VtbWFyeVRhYmxlRm9yQ29tbWFuZFNwZWNzKHRoaXMuZ2V0Q29tbWFuZFNwZWNzKCksIHtoZWFkZXJ9KVxuICB9XG5cbiAgb3BlbkluVmltICgpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBjb25zdCB7cm93LCBjb2x1bW59ID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAvLyBlLmcuIC9BcHBsaWNhdGlvbnMvTWFjVmltLmFwcC9Db250ZW50cy9NYWNPUy9WaW0gLWcgL2V0Yy9ob3N0cyBcIitjYWxsIGN1cnNvcig0LCAzKVwiXG4gICAgcmV0dXJuIG5ldyBCdWZmZXJlZFByb2Nlc3Moe1xuICAgICAgY29tbWFuZDogJy9BcHBsaWNhdGlvbnMvTWFjVmltLmFwcC9Db250ZW50cy9NYWNPUy9WaW0nLFxuICAgICAgYXJnczogWyctZycsIGVkaXRvci5nZXRQYXRoKCksIGArY2FsbCBjdXJzb3IoJHtyb3cgKyAxfSwgJHtjb2x1bW4gKyAxfSlgXVxuICAgIH0pXG4gIH1cblxuICBidWlsZENvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZSAoKSB7XG4gICAgY29uc3QgZmlsZVRhYmxlID0ge31cbiAgICBjb25zdCBjb21tYW5kVGFibGUgPSBbXVxuICAgIGNvbnN0IHNlZW4gPSB7fSAvLyBKdXN0IHRvIGRldGVjdCBkdXBsaWNhdGUgbmFtZVxuXG4gICAgZm9yIChjb25zdCBmaWxlIG9mIFZNUE9wZXJhdGlvbkZpbGVzKSB7XG4gICAgICBmaWxlVGFibGVbZmlsZV0gPSBbXVxuXG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIE9iamVjdC52YWx1ZXMocmVxdWlyZShmaWxlKSkpIHtcbiAgICAgICAgaWYgKHNlZW5ba2xhc3MubmFtZV0pIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBjbGFzcyAke2tsYXNzLm5hbWV9IGluIFwiJHtmaWxlfVwiIGFuZCBcIiR7c2VlbltrbGFzcy5uYW1lXX1cImApXG4gICAgICAgIH1cbiAgICAgICAgc2VlbltrbGFzcy5uYW1lXSA9IGZpbGVcbiAgICAgICAgZmlsZVRhYmxlW2ZpbGVdLnB1c2goa2xhc3MubmFtZSlcbiAgICAgICAgaWYgKGtsYXNzLmlzQ29tbWFuZCgpKSBjb21tYW5kVGFibGUucHVzaChrbGFzcy5nZXRDb21tYW5kTmFtZSgpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge2NvbW1hbmRUYWJsZSwgZmlsZVRhYmxlfVxuICB9XG5cbiAgLy8gIyBIb3cgdm1wIGNvbW1hbmRzIGJlY29tZSBhdmFpbGFibGU/XG4gIC8vICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFZtcCBoYXZlIG1hbnkgY29tbWFuZHMsIGxvYWRpbmcgZnVsbCBjb21tYW5kcyBhdCBzdGFydHVwIHNsb3cgZG93biBwa2cgYWN0aXZhdGlvbi5cbiAgLy8gU28gdm1wIGxvYWQgc3VtbWFyeSBjb21tYW5kIHRhYmxlIGF0IHN0YXJ0dXAgdGhlbiBsYXp5IHJlcXVpcmUgY29tbWFuZCBib2R5IG9uLXVzZSB0aW1pbmcuXG4gIC8vIEhlcmUgaXMgaG93IHZtcCBjb21tYW5kcyBhcmUgcmVnaXN0ZXJkIGFuZCBpbnZva2VkLlxuICAvLyBJbml0aWFsbHkgaW50cm9kdWNlZCBpbiBQUiAjNzU4XG4gIC8vXG4gIC8vIDEuIFtPbiBkZXZdOiBQcmVwYXJhdGlvbiBkb25lIGJ5IGRldmVsb3BlclxuICAvLyAgIC0gSW52b2tpbmcgYFZpbSBNb2RlIFBsdXM6V3JpdGUgQ29tbWFuZCBUYWJsZSBBbmQgRmlsZSBUYWJsZSBUbyBEaXNrYC4gaXQgZG9lcyBmb2xsb3dpbmcuXG4gIC8vICAgLSBcIi4vanNvbi9jb21tYW5kLXRhYmxlLmpzb25cIiBhbmQgXCIuL2pzb24vZmlsZS10YWJsZS5qc29uXCIuIGFyZSB1cGRhdGVkLlxuICAvL1xuICAvLyAyLiBbT24gYXRvbS92bXAgc3RhcnR1cF1cbiAgLy8gICAtIFJlZ2lzdGVyIGNvbW1hbmRzKGUuZy4gYG1vdmUtZG93bmApIGZyb20gXCIuL2pzb24vY29tbWFuZC10YWJsZS5qc29uXCIuXG4gIC8vXG4gIC8vIDMuIFtPbiBydW4gdGltZV06IGUuZy4gSW52b2tlIGBtb3ZlLWRvd25gIGJ5IGBqYCBrZXlzdHJva2VcbiAgLy8gICAtIEZpcmUgYG1vdmUtZG93bmAgY29tbWFuZC5cbiAgLy8gICAtIEl0IGV4ZWN1dGUgYHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihcIk1vdmVEb3duXCIpYFxuICAvLyAgIC0gRGV0ZXJtaW5lIGZpbGVzIHRvIHJlcXVpcmUgZnJvbSBcIi4vanNvbi9maWxlLXRhYmxlLmpzb25cIi5cbiAgLy8gICAtIExvYWQgYE1vdmVEb3duYCBjbGFzcyBieSByZXF1aXJlKCcuL21vdGlvbnMnKSBhbmQgcnVuIGl0IVxuICAvL1xuICBhc3luYyB3cml0ZUNvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZVRvRGlzayAoKSB7XG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcy1wbHVzJylcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBjb25zdCB7Y29tbWFuZFRhYmxlLCBmaWxlVGFibGV9ID0gdGhpcy5idWlsZENvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZSgpXG5cbiAgICBjb25zdCBnZXRTdGF0ZUZvciA9IChiYXNlTmFtZSwgb2JqZWN0LCBwcmV0dHkpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2pzb24nLCBiYXNlTmFtZSkgKyAocHJldHR5ID8gJy1wcmV0dHkuanNvbicgOiAnLmpzb24nKVxuICAgICAgY29uc3QganNvblN0cmluZyA9IHByZXR0eSA/IEpTT04uc3RyaW5naWZ5KG9iamVjdCwgbnVsbCwgJyAgJykgOiBKU09OLnN0cmluZ2lmeShvYmplY3QpXG4gICAgICBjb25zdCBuZWVkVXBkYXRlID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmOCcpLnRyaW1SaWdodCgpICE9PSBqc29uU3RyaW5nXG4gICAgICByZXR1cm4ge2ZpbGVQYXRoLCBqc29uU3RyaW5nLCBuZWVkVXBkYXRlfVxuICAgIH1cblxuICAgIGNvbnN0IHN0YXRlc05lZWRVcGRhdGUgPSBbXG4gICAgICBnZXRTdGF0ZUZvcignY29tbWFuZC10YWJsZScsIGNvbW1hbmRUYWJsZSwgZmFsc2UpLFxuICAgICAgZ2V0U3RhdGVGb3IoJ2NvbW1hbmQtdGFibGUnLCBjb21tYW5kVGFibGUsIHRydWUpLFxuICAgICAgZ2V0U3RhdGVGb3IoJ2ZpbGUtdGFibGUnLCBmaWxlVGFibGUsIGZhbHNlKSxcbiAgICAgIGdldFN0YXRlRm9yKCdmaWxlLXRhYmxlJywgZmlsZVRhYmxlLCB0cnVlKVxuICAgIF0uZmlsdGVyKHN0YXRlID0+IHN0YXRlLm5lZWRVcGRhdGUpXG5cbiAgICBpZiAoIXN0YXRlc05lZWRVcGRhdGUubGVuZ3RoKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnTm8gY2hhbmdmZXMgaW4gY29tbWFuZFRhYmxlIGFuZCBmaWxlVGFibGUnLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB7anNvblN0cmluZywgZmlsZVBhdGh9IG9mIHN0YXRlc05lZWRVcGRhdGUpIHtcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgsIHthY3RpdmF0ZVBhbmU6IGZhbHNlLCBhY3RpdmF0ZUl0ZW06IGZhbHNlfSkudGhlbihlZGl0b3IgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dChqc29uU3RyaW5nKVxuICAgICAgICByZXR1cm4gZWRpdG9yLnNhdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhgVXBkYXRlZCAke3BhdGguYmFzZW5hbWUoZmlsZVBhdGgpfWAsIHtkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEZXZlbG9wZXIoKVxuIl19