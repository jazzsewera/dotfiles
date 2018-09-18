(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, _, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, collectCharPositionsInText, collectIndexInText, dispatch, getView, getVimState, globalState, inspect, isPoint, isRange, normalizeKeystrokes, ref, semver, settings, supportedModeClass, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  globalState = require('../lib/global-state');

  settings = require('../lib/settings');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.getLoadSettings().resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  beforeEach(function() {
    globalState.reset();
    settings.set("stayOnTransformString", false);
    settings.set("stayOnYank", false);
    settings.set("stayOnDelete", false);
    settings.set("stayOnSelectTextObject", false);
    return settings.set("stayOnVerticalMotion", true);
  });

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var j, key, len, modifier, options, part, parts;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      if (indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (semver.satisfies(atom.getVersion(), '< 1.12')) {
      if (key === 'space') {
        key = ' ';
      }
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(slice.call(eventArgs)));
    return event;
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, ref1;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = [], editor = ref1[0], file = ref1[1], callback = ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, arg) {
      var chomp, line, text;
      chomp = (arg != null ? arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          results.push(this.lines[line]);
        }
        return results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getLine = function(line, options) {
      return this.getLines([line], options);
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  collectIndexInText = function(char, text) {
    var fromIndex, index, indexes;
    indexes = [];
    fromIndex = 0;
    while ((index = text.indexOf(char, fromIndex)) >= 0) {
      fromIndex = index + 1;
      indexes.push(index);
    }
    return indexes;
  };

  collectCharPositionsInText = function(char, text) {
    var i, index, j, k, len, len1, lineText, positions, ref1, ref2, rowNumber;
    positions = [];
    ref1 = text.split(/\n/);
    for (rowNumber = j = 0, len = ref1.length; j < len; rowNumber = ++j) {
      lineText = ref1[rowNumber];
      ref2 = collectIndexInText(char, lineText);
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        index = ref2[i];
        positions.push([rowNumber, index - i]);
      }
    }
    return positions;
  };

  VimEditor = (function() {
    var ensureExclusiveRules, ensureOptionsOrdered, setExclusiveRules, setOptionsOrdered;

    function VimEditor(vimState1) {
      var ref1;
      this.vimState = vimState1;
      this._keystroke = bind(this._keystroke, this);
      this.bindEnsureWaitOption = bind(this.bindEnsureWaitOption, this);
      this.bindEnsureOption = bind(this.bindEnsureOption, this);
      this.ensureWait = bind(this.ensureWait, this);
      this.ensure = bind(this.ensure, this);
      this.set = bind(this.set, this);
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new Error(message + ": " + (inspect(invalidOptions)));
      }
    };

    VimEditor.prototype.validateExclusiveOptions = function(options, rules) {
      var allOptions, exclusiveOptions, option, results, violatingOptions;
      allOptions = Object.keys(options);
      results = [];
      for (option in rules) {
        exclusiveOptions = rules[option];
        if (!(option in options)) {
          continue;
        }
        violatingOptions = exclusiveOptions.filter(function(exclusiveOption) {
          return indexOf.call(allOptions, exclusiveOption) >= 0;
        });
        if (violatingOptions.length) {
          throw new Error(option + " is exclusive with [" + violatingOptions + "]");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    setOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'grammar', 'cursor', 'cursorScreen', 'addCursor', 'cursorScreen', 'register', 'selectedBufferRange'];

    setExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.set = function(options) {
      var j, len, method, name, results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      this.validateExclusiveOptions(options, setExclusiveRules);
      results = [];
      for (j = 0, len = setOptionsOrdered.length; j < len; j++) {
        name = setOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setText_ = function(text) {
      return this.setText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      this.setText(text.replace(/[\|!]/g, ''));
      cursors = cursors.concat(lastCursor);
      if (cursors.length) {
        return this.setCursor(cursors);
      }
    };

    VimEditor.prototype.setTextC_ = function(text) {
      return this.setTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setCursorScreen = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var j, len, point, ref1, results;
      ref1 = toArrayOfPoint(points);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        point = ref1[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, results, value;
      results = [];
      for (name in register) {
        value = register[name];
        results.push(this.vimState.register.set(name, value));
      }
      return results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'selectedText', 'selectedText_', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorScreen', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'propertyHead', 'propertyTail', 'scrollTop', 'mark', 'mode'];

    ensureExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.getAndDeleteKeystrokeOptions = function(options) {
      var partialMatchTimeout, waitsForFinish;
      partialMatchTimeout = options.partialMatchTimeout, waitsForFinish = options.waitsForFinish;
      delete options.partialMatchTimeout;
      delete options.waitsForFinish;
      return {
        partialMatchTimeout: partialMatchTimeout,
        waitsForFinish: waitsForFinish
      };
    };

    VimEditor.prototype.ensure = function(keystroke, options) {
      var keystrokeOptions, runSmart;
      if (options == null) {
        options = {};
      }
      if (typeof options !== 'object') {
        throw new Error("Invalid options for 'ensure': must be 'object' but got '" + (typeof options) + "'");
      }
      if ((keystroke != null) && !(typeof keystroke === 'string' || Array.isArray(keystroke))) {
        throw new Error("Invalid keystroke for 'ensure': must be 'string' or 'array' but got '" + (typeof keystroke) + "'");
      }
      keystrokeOptions = this.getAndDeleteKeystrokeOptions(options);
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      this.validateExclusiveOptions(options, ensureExclusiveRules);
      runSmart = function(fn) {
        if (keystrokeOptions.waitsForFinish) {
          return runs(fn);
        } else {
          return fn();
        }
      };
      runSmart((function(_this) {
        return function() {
          if (!_.isEmpty(keystroke)) {
            return _this._keystroke(keystroke, keystrokeOptions);
          }
        };
      })(this));
      return runSmart((function(_this) {
        return function() {
          var j, len, method, name, results;
          results = [];
          for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
            name = ensureOptionsOrdered[j];
            if (!(options[name] != null)) {
              continue;
            }
            method = 'ensure' + _.capitalize(_.camelize(name));
            results.push(_this[method](options[name]));
          }
          return results;
        };
      })(this));
    };

    VimEditor.prototype.ensureWait = function(keystroke, options) {
      if (options == null) {
        options = {};
      }
      return this.ensure(keystroke, Object.assign(options, {
        waitsForFinish: true
      }));
    };

    VimEditor.prototype.bindEnsureOption = function(optionsBase, wait) {
      if (wait == null) {
        wait = false;
      }
      return (function(_this) {
        return function(keystroke, options) {
          var intersectingOptions;
          intersectingOptions = _.intersection(_.keys(options), _.keys(optionsBase));
          if (intersectingOptions.length) {
            throw new Error("conflict with bound options " + (inspect(intersectingOptions)));
          }
          options = _.defaults(_.clone(options), optionsBase);
          if (wait) {
            options.waitsForFinish = true;
          }
          return _this.ensure(keystroke, options);
        };
      })(this);
    };

    VimEditor.prototype.bindEnsureWaitOption = function(optionsBase) {
      return this.bindEnsureOption(optionsBase, true);
    };

    VimEditor.prototype._keystroke = function(keys, options) {
      var event, finished, i, j, key, keystrokesToExecute, lastKeystrokeIndex, len, ref1, target, waitsForFinish;
      if (options == null) {
        options = {};
      }
      target = this.editorElement;
      keystrokesToExecute = keys.split(/\s+/);
      lastKeystrokeIndex = keystrokesToExecute.length - 1;
      for (i = j = 0, len = keystrokesToExecute.length; j < len; i = ++j) {
        key = keystrokesToExecute[i];
        waitsForFinish = (i === lastKeystrokeIndex) && options.waitsForFinish;
        if (waitsForFinish) {
          finished = false;
          this.vimState.onDidFinishOperation(function() {
            return finished = true;
          });
        }
        if ((ref1 = this.vimState.__searchInput) != null ? ref1.hasFocus() : void 0) {
          target = this.vimState.searchInput.editorElement;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.searchInput.editor.insertText(key);
          }
        } else if (this.vimState.inputEditor != null) {
          target = this.vimState.inputEditor.element;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.inputEditor.insertText(key);
          }
        } else {
          event = buildKeydownEventFromKeystroke(normalizeKeystrokes(key), target);
          atom.keymaps.handleKeyboardEvent(event);
        }
        if (waitsForFinish) {
          waitsFor(function() {
            return finished;
          });
        }
      }
      if (options.partialMatchTimeout) {
        return advanceClock(atom.keymaps.getPartialMatchTimeout());
      }
    };

    VimEditor.prototype.keystroke = function() {
      throw new Error('Dont use `keystroke("x y z")`, instead use `ensure("x y z")`');
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureText_ = function(text) {
      return this.ensureText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      cursors = cursors.concat(lastCursor);
      cursors = cursors.map(function(point) {
        return Point.fromObject(point);
      }).sort(function(a, b) {
        return a.compare(b);
      });
      this.ensureText(text.replace(/[\|!]/g, ''));
      if (cursors.length) {
        this.ensureCursor(cursors, true);
      }
      if (lastCursor.length) {
        return expect(this.editor.getCursorBufferPosition()).toEqual(lastCursor[0]);
      }
    };

    VimEditor.prototype.ensureTextC_ = function(text) {
      return this.ensureTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(s.getText());
        }
        return results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedText_ = function(text, ordered) {
      return this.ensureSelectedText(text.replace(/_/g, ' '), ordered);
    };

    VimEditor.prototype.ensureSelectionIsNarrowed = function(isNarrowed) {
      var actual;
      actual = this.vimState.isNarrowed();
      return expect(actual).toEqual(isNarrowed);
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points, ordered) {
      var actual;
      if (ordered == null) {
        ordered = false;
      }
      actual = this.editor.getCursorBufferPositions();
      actual = actual.sort(function(a, b) {
        if (ordered) {
          return a.compare(b);
        }
      });
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorScreen = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var _value, ensure, name, property, reg, results, selection;
      results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        results.push((function() {
          var results1;
          results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            results1.push(expect(reg[property]).toEqual(_value));
          }
          return results1;
        })());
      }
      return results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(fn(s));
        }
        return results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual, j, len, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        actual = selection.isReversed();
        results.push(expect(actual).toBe(reversed));
      }
      return results;
    };

    VimEditor.prototype.ensurePersistentSelectionBufferRange = function(range) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerBufferRanges();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensurePersistentSelectionCount = function(number) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceCount = function(number) {
      var actual;
      actual = this.vimState.occurrenceManager.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceText = function(text) {
      var actual, markers, r, ranges;
      markers = this.vimState.occurrenceManager.getMarkers();
      ranges = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = markers.length; j < len; j++) {
          r = markers[j];
          results.push(r.getBufferRange());
        }
        return results;
      })();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = ranges.length; j < len; j++) {
          r = ranges[j];
          results.push(this.editor.getTextInBufferRange(r));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensurePropertyHead = function(points) {
      var actual, getHeadProperty, s;
      getHeadProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('head', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getHeadProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensurePropertyTail = function(points) {
      var actual, getTailProperty, s;
      getTailProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('tail', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getTailProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMark = function(mark) {
      var actual, name, point, results;
      results = [];
      for (name in mark) {
        point = mark[name];
        actual = this.vimState.mark.get(name);
        results.push(expect(actual).toEqual(point));
      }
      return results;
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var j, k, len, len1, m, ref1, results, shouldNotContainClasses;
      mode = toArray(mode).slice();
      expect((ref1 = this.vimState).isMode.apply(ref1, mode)).toBe(true);
      mode[0] = mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (j = 0, len = mode.length; j < len; j++) {
        m = mode[j];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      results = [];
      for (k = 0, len1 = shouldNotContainClasses.length; k < len1; k++) {
        m = shouldNotContainClasses[k];
        results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return results;
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwWEFBQTtJQUFBOzs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsTUFBNkIsT0FBQSxDQUFRLE1BQVIsQ0FBN0IsRUFBQyxpQkFBRCxFQUFRLGlCQUFSLEVBQWU7O0VBQ2QsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFDWixXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsYUFBQSxHQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDOztFQUM1QixzQkFBdUIsT0FBQSxDQUFRLElBQUksQ0FBQyxlQUFMLENBQUEsQ0FBc0IsQ0FBQyxZQUF2QixHQUFzQyx1Q0FBOUM7O0VBRXhCLGtCQUFBLEdBQXFCLENBQ25CLGFBRG1CLEVBRW5CLGFBRm1CLEVBR25CLGFBSG1CLEVBSW5CLFNBSm1CLEVBS25CLFVBTG1CLEVBTW5CLFdBTm1CLEVBT25CLGVBUG1COztFQVlyQixVQUFBLENBQVcsU0FBQTtJQUNULFdBQVcsQ0FBQyxLQUFaLENBQUE7SUFDQSxRQUFRLENBQUMsR0FBVCxDQUFhLHVCQUFiLEVBQXNDLEtBQXRDO0lBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxZQUFiLEVBQTJCLEtBQTNCO0lBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSxjQUFiLEVBQTZCLEtBQTdCO0lBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSx3QkFBYixFQUF1QyxLQUF2QztXQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsc0JBQWIsRUFBcUMsSUFBckM7RUFOUyxDQUFYOztFQVVBLE9BQUEsR0FBVSxTQUFDLEtBQUQ7V0FDUixJQUFJ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LE9BQWQ7SUFBdUIsVUFBQSxRQUF2QjtJQUFpQyxVQUFBLFFBQWpDO0lBQTJDLGtCQUFBLGdCQUEzQzs7QUEzZWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbntSYW5nZSwgUG9pbnQsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4uL2xpYi9nbG9iYWwtc3RhdGUnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuS2V5bWFwTWFuYWdlciA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvclxue25vcm1hbGl6ZUtleXN0cm9rZXN9ID0gcmVxdWlyZShhdG9tLmdldExvYWRTZXR0aW5ncygpLnJlc291cmNlUGF0aCArIFwiL25vZGVfbW9kdWxlcy9hdG9tLWtleW1hcC9saWIvaGVscGVyc1wiKVxuXG5zdXBwb3J0ZWRNb2RlQ2xhc3MgPSBbXG4gICdub3JtYWwtbW9kZSdcbiAgJ3Zpc3VhbC1tb2RlJ1xuICAnaW5zZXJ0LW1vZGUnXG4gICdyZXBsYWNlJ1xuICAnbGluZXdpc2UnXG4gICdibG9ja3dpc2UnXG4gICdjaGFyYWN0ZXJ3aXNlJ1xuXVxuXG4jIEluaXQgc3BlYyBzdGF0ZVxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5iZWZvcmVFYWNoIC0+XG4gIGdsb2JhbFN0YXRlLnJlc2V0KClcbiAgc2V0dGluZ3Muc2V0KFwic3RheU9uVHJhbnNmb3JtU3RyaW5nXCIsIGZhbHNlKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25ZYW5rXCIsIGZhbHNlKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25EZWxldGVcIiwgZmFsc2UpXG4gIHNldHRpbmdzLnNldChcInN0YXlPblNlbGVjdFRleHRPYmplY3RcIiwgZmFsc2UpXG4gIHNldHRpbmdzLnNldChcInN0YXlPblZlcnRpY2FsTW90aW9uXCIsIHRydWUpXG5cbiMgVXRpbHNcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0VmlldyA9IChtb2RlbCkgLT5cbiAgYXRvbS52aWV3cy5nZXRWaWV3KG1vZGVsKVxuXG5kaXNwYXRjaCA9ICh0YXJnZXQsIGNvbW1hbmQpIC0+XG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCBjb21tYW5kKVxuXG53aXRoTW9ja1BsYXRmb3JtID0gKHRhcmdldCwgcGxhdGZvcm0sIGZuKSAtPlxuICB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgd3JhcHBlci5jbGFzc05hbWUgPSBwbGF0Zm9ybVxuICB3cmFwcGVyLmFwcGVuZENoaWxkKHRhcmdldClcbiAgZm4oKVxuICB0YXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0YXJnZXQpXG5cbmJ1aWxkS2V5ZG93bkV2ZW50ID0gKGtleSwgb3B0aW9ucykgLT5cbiAgS2V5bWFwTWFuYWdlci5idWlsZEtleWRvd25FdmVudChrZXksIG9wdGlvbnMpXG5cbmJ1aWxkS2V5ZG93bkV2ZW50RnJvbUtleXN0cm9rZSA9IChrZXlzdHJva2UsIHRhcmdldCkgLT5cbiAgbW9kaWZpZXIgPSBbJ2N0cmwnLCAnYWx0JywgJ3NoaWZ0JywgJ2NtZCddXG4gIHBhcnRzID0gaWYga2V5c3Ryb2tlIGlzICctJ1xuICAgIFsnLSddXG4gIGVsc2VcbiAgICBrZXlzdHJva2Uuc3BsaXQoJy0nKVxuXG4gIG9wdGlvbnMgPSB7dGFyZ2V0fVxuICBrZXkgPSBudWxsXG4gIGZvciBwYXJ0IGluIHBhcnRzXG4gICAgaWYgcGFydCBpbiBtb2RpZmllclxuICAgICAgb3B0aW9uc1twYXJ0XSA9IHRydWVcbiAgICBlbHNlXG4gICAgICBrZXkgPSBwYXJ0XG5cbiAgaWYgc2VtdmVyLnNhdGlzZmllcyhhdG9tLmdldFZlcnNpb24oKSwgJzwgMS4xMicpXG4gICAga2V5ID0gJyAnIGlmIGtleSBpcyAnc3BhY2UnXG4gIGJ1aWxkS2V5ZG93bkV2ZW50KGtleSwgb3B0aW9ucylcblxuYnVpbGRUZXh0SW5wdXRFdmVudCA9IChrZXkpIC0+XG4gIGV2ZW50QXJncyA9IFtcbiAgICB0cnVlICMgYnViYmxlc1xuICAgIHRydWUgIyBjYW5jZWxhYmxlXG4gICAgd2luZG93ICMgdmlld1xuICAgIGtleSAgIyBrZXkgY2hhclxuICBdXG4gIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ1RleHRFdmVudCcpXG4gIGV2ZW50LmluaXRUZXh0RXZlbnQoXCJ0ZXh0SW5wdXRcIiwgZXZlbnRBcmdzLi4uKVxuICBldmVudFxuXG5pc1BvaW50ID0gKG9iaikgLT5cbiAgaWYgb2JqIGluc3RhbmNlb2YgUG9pbnRcbiAgICB0cnVlXG4gIGVsc2VcbiAgICBvYmoubGVuZ3RoIGlzIDIgYW5kIF8uaXNOdW1iZXIob2JqWzBdKSBhbmQgXy5pc051bWJlcihvYmpbMV0pXG5cbmlzUmFuZ2UgPSAob2JqKSAtPlxuICBpZiBvYmogaW5zdGFuY2VvZiBSYW5nZVxuICAgIHRydWVcbiAgZWxzZVxuICAgIF8uYWxsKFtcbiAgICAgIF8uaXNBcnJheShvYmopLFxuICAgICAgKG9iai5sZW5ndGggaXMgMiksXG4gICAgICBpc1BvaW50KG9ialswXSksXG4gICAgICBpc1BvaW50KG9ialsxXSlcbiAgICBdKVxuXG50b0FycmF5ID0gKG9iaiwgY29uZD1udWxsKSAtPlxuICBpZiBfLmlzQXJyYXkoY29uZCA/IG9iaikgdGhlbiBvYmogZWxzZSBbb2JqXVxuXG50b0FycmF5T2ZQb2ludCA9IChvYmopIC0+XG4gIGlmIF8uaXNBcnJheShvYmopIGFuZCBpc1BvaW50KG9ialswXSlcbiAgICBvYmpcbiAgZWxzZVxuICAgIFtvYmpdXG5cbnRvQXJyYXlPZlJhbmdlID0gKG9iaikgLT5cbiAgaWYgXy5pc0FycmF5KG9iaikgYW5kIF8uYWxsKG9iai5tYXAgKGUpIC0+IGlzUmFuZ2UoZSkpXG4gICAgb2JqXG4gIGVsc2VcbiAgICBbb2JqXVxuXG4jIE1haW5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0VmltU3RhdGUgPSAoYXJncy4uLikgLT5cbiAgW2VkaXRvciwgZmlsZSwgY2FsbGJhY2tdID0gW11cbiAgc3dpdGNoIGFyZ3MubGVuZ3RoXG4gICAgd2hlbiAxIHRoZW4gW2NhbGxiYWNrXSA9IGFyZ3NcbiAgICB3aGVuIDIgdGhlbiBbZmlsZSwgY2FsbGJhY2tdID0gYXJnc1xuXG4gIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJylcblxuICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICBmaWxlID0gYXRvbS5wcm9qZWN0LnJlc29sdmVQYXRoKGZpbGUpIGlmIGZpbGVcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGUpLnRoZW4gKGUpIC0+IGVkaXRvciA9IGVcblxuICBydW5zIC0+XG4gICAgbWFpbiA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgndmltLW1vZGUtcGx1cycpLm1haW5Nb2R1bGVcbiAgICB2aW1TdGF0ZSA9IG1haW4uZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKVxuICAgIGNhbGxiYWNrKHZpbVN0YXRlLCBuZXcgVmltRWRpdG9yKHZpbVN0YXRlKSlcblxuY2xhc3MgVGV4dERhdGFcbiAgY29uc3RydWN0b3I6IChAcmF3RGF0YSkgLT5cbiAgICBAbGluZXMgPSBAcmF3RGF0YS5zcGxpdChcIlxcblwiKVxuXG4gIGdldExpbmVzOiAobGluZXMsIHtjaG9tcH09e30pIC0+XG4gICAgY2hvbXAgPz0gZmFsc2VcbiAgICB0ZXh0ID0gKEBsaW5lc1tsaW5lXSBmb3IgbGluZSBpbiBsaW5lcykuam9pbihcIlxcblwiKVxuICAgIGlmIGNob21wXG4gICAgICB0ZXh0XG4gICAgZWxzZVxuICAgICAgdGV4dCArIFwiXFxuXCJcblxuICBnZXRMaW5lOiAobGluZSwgb3B0aW9ucykgLT5cbiAgICBAZ2V0TGluZXMoW2xpbmVdLCBvcHRpb25zKVxuXG4gIGdldFJhdzogLT5cbiAgICBAcmF3RGF0YVxuXG5jb2xsZWN0SW5kZXhJblRleHQgPSAoY2hhciwgdGV4dCkgLT5cbiAgaW5kZXhlcyA9IFtdXG4gIGZyb21JbmRleCA9IDBcbiAgd2hpbGUgKGluZGV4ID0gdGV4dC5pbmRleE9mKGNoYXIsIGZyb21JbmRleCkpID49IDBcbiAgICBmcm9tSW5kZXggPSBpbmRleCArIDFcbiAgICBpbmRleGVzLnB1c2goaW5kZXgpXG4gIGluZGV4ZXNcblxuY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQgPSAoY2hhciwgdGV4dCkgLT5cbiAgcG9zaXRpb25zID0gW11cbiAgZm9yIGxpbmVUZXh0LCByb3dOdW1iZXIgaW4gdGV4dC5zcGxpdCgvXFxuLylcbiAgICBmb3IgaW5kZXgsIGkgaW4gY29sbGVjdEluZGV4SW5UZXh0KGNoYXIsIGxpbmVUZXh0KVxuICAgICAgcG9zaXRpb25zLnB1c2goW3Jvd051bWJlciwgaW5kZXggLSBpXSlcbiAgcG9zaXRpb25zXG5cbmNsYXNzIFZpbUVkaXRvclxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSkgLT5cbiAgICB7QGVkaXRvciwgQGVkaXRvckVsZW1lbnR9ID0gQHZpbVN0YXRlXG5cbiAgdmFsaWRhdGVPcHRpb25zOiAob3B0aW9ucywgdmFsaWRPcHRpb25zLCBtZXNzYWdlKSAtPlxuICAgIGludmFsaWRPcHRpb25zID0gXy53aXRob3V0KF8ua2V5cyhvcHRpb25zKSwgdmFsaWRPcHRpb25zLi4uKVxuICAgIGlmIGludmFsaWRPcHRpb25zLmxlbmd0aFxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiI3ttZXNzYWdlfTogI3tpbnNwZWN0KGludmFsaWRPcHRpb25zKX1cIilcblxuICB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnM6IChvcHRpb25zLCBydWxlcykgLT5cbiAgICBhbGxPcHRpb25zID0gT2JqZWN0LmtleXMob3B0aW9ucylcbiAgICBmb3Igb3B0aW9uLCBleGNsdXNpdmVPcHRpb25zIG9mIHJ1bGVzIHdoZW4gb3B0aW9uIG9mIG9wdGlvbnNcbiAgICAgIHZpb2xhdGluZ09wdGlvbnMgPSBleGNsdXNpdmVPcHRpb25zLmZpbHRlciAoZXhjbHVzaXZlT3B0aW9uKSAtPiBleGNsdXNpdmVPcHRpb24gaW4gYWxsT3B0aW9uc1xuICAgICAgaWYgdmlvbGF0aW5nT3B0aW9ucy5sZW5ndGhcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiI3tvcHRpb259IGlzIGV4Y2x1c2l2ZSB3aXRoIFsje3Zpb2xhdGluZ09wdGlvbnN9XVwiKVxuXG4gIHNldE9wdGlvbnNPcmRlcmVkID0gW1xuICAgICd0ZXh0JywgJ3RleHRfJyxcbiAgICAndGV4dEMnLCAndGV4dENfJyxcbiAgICAnZ3JhbW1hcicsXG4gICAgJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXG4gICAgJ2FkZEN1cnNvcicsICdjdXJzb3JTY3JlZW4nXG4gICAgJ3JlZ2lzdGVyJyxcbiAgICAnc2VsZWN0ZWRCdWZmZXJSYW5nZSdcbiAgXVxuXG4gIHNldEV4Y2x1c2l2ZVJ1bGVzID1cbiAgICB0ZXh0QzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cbiAgICB0ZXh0Q186IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG5cbiAgIyBQdWJsaWNcbiAgc2V0OiAob3B0aW9ucykgPT5cbiAgICBAdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMsIHNldE9wdGlvbnNPcmRlcmVkLCAnSW52YWxpZCBzZXQgb3B0aW9ucycpXG4gICAgQHZhbGlkYXRlRXhjbHVzaXZlT3B0aW9ucyhvcHRpb25zLCBzZXRFeGNsdXNpdmVSdWxlcylcblxuICAgIGZvciBuYW1lIGluIHNldE9wdGlvbnNPcmRlcmVkIHdoZW4gb3B0aW9uc1tuYW1lXT9cbiAgICAgIG1ldGhvZCA9ICdzZXQnICsgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUobmFtZSkpXG4gICAgICB0aGlzW21ldGhvZF0ob3B0aW9uc1tuYW1lXSlcblxuICBzZXRUZXh0OiAodGV4dCkgLT5cbiAgICBAZWRpdG9yLnNldFRleHQodGV4dClcblxuICBzZXRUZXh0XzogKHRleHQpIC0+XG4gICAgQHNldFRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgc2V0VGV4dEM6ICh0ZXh0KSAtPlxuICAgIGN1cnNvcnMgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnfCcsIHRleHQucmVwbGFjZSgvIS9nLCAnJykpXG4gICAgbGFzdEN1cnNvciA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCchJywgdGV4dC5yZXBsYWNlKC9cXHwvZywgJycpKVxuICAgIEBzZXRUZXh0KHRleHQucmVwbGFjZSgvW1xcfCFdL2csICcnKSlcbiAgICBjdXJzb3JzID0gY3Vyc29ycy5jb25jYXQobGFzdEN1cnNvcilcbiAgICBpZiBjdXJzb3JzLmxlbmd0aFxuICAgICAgQHNldEN1cnNvcihjdXJzb3JzKVxuXG4gIHNldFRleHRDXzogKHRleHQpIC0+XG4gICAgQHNldFRleHRDKHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIHNldEdyYW1tYXI6IChzY29wZSkgLT5cbiAgICBAZWRpdG9yLnNldEdyYW1tYXIoYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlKSlcblxuICBzZXRDdXJzb3I6IChwb2ludHMpIC0+XG4gICAgcG9pbnRzID0gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnRzLnNoaWZ0KCkpXG4gICAgZm9yIHBvaW50IGluIHBvaW50c1xuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHNldEN1cnNvclNjcmVlbjogKHBvaW50cykgLT5cbiAgICBwb2ludHMgPSB0b0FycmF5T2ZQb2ludChwb2ludHMpXG4gICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihwb2ludHMuc2hpZnQoKSlcbiAgICBmb3IgcG9pbnQgaW4gcG9pbnRzXG4gICAgICBAZWRpdG9yLmFkZEN1cnNvckF0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0QWRkQ3Vyc29yOiAocG9pbnRzKSAtPlxuICAgIGZvciBwb2ludCBpbiB0b0FycmF5T2ZQb2ludChwb2ludHMpXG4gICAgICBAZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0UmVnaXN0ZXI6IChyZWdpc3RlcikgLT5cbiAgICBmb3IgbmFtZSwgdmFsdWUgb2YgcmVnaXN0ZXJcbiAgICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5zZXQobmFtZSwgdmFsdWUpXG5cbiAgc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZTogKHJhbmdlKSAtPlxuICAgIEBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcblxuICBlbnN1cmVPcHRpb25zT3JkZXJlZCA9IFtcbiAgICAndGV4dCcsICd0ZXh0XycsXG4gICAgJ3RleHRDJywgJ3RleHRDXycsXG4gICAgJ3NlbGVjdGVkVGV4dCcsICdzZWxlY3RlZFRleHRfJywgJ3NlbGVjdGVkVGV4dE9yZGVyZWQnLCBcInNlbGVjdGlvbklzTmFycm93ZWRcIlxuICAgICdjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdudW1DdXJzb3JzJ1xuICAgICdyZWdpc3RlcicsXG4gICAgJ3NlbGVjdGVkU2NyZWVuUmFuZ2UnLCAnc2VsZWN0ZWRTY3JlZW5SYW5nZU9yZGVyZWQnXG4gICAgJ3NlbGVjdGVkQnVmZmVyUmFuZ2UnLCAnc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQnXG4gICAgJ3NlbGVjdGlvbklzUmV2ZXJzZWQnLFxuICAgICdwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2UnLCAncGVyc2lzdGVudFNlbGVjdGlvbkNvdW50J1xuICAgICdvY2N1cnJlbmNlQ291bnQnLCAnb2NjdXJyZW5jZVRleHQnXG4gICAgJ3Byb3BlcnR5SGVhZCdcbiAgICAncHJvcGVydHlUYWlsJ1xuICAgICdzY3JvbGxUb3AnLFxuICAgICdtYXJrJ1xuICAgICdtb2RlJyxcbiAgXVxuICBlbnN1cmVFeGNsdXNpdmVSdWxlcyA9XG4gICAgdGV4dEM6IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG4gICAgdGV4dENfOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuXG4gIGdldEFuZERlbGV0ZUtleXN0cm9rZU9wdGlvbnM6IChvcHRpb25zKSAtPlxuICAgIHtwYXJ0aWFsTWF0Y2hUaW1lb3V0LCB3YWl0c0ZvckZpbmlzaH0gPSBvcHRpb25zXG4gICAgZGVsZXRlIG9wdGlvbnMucGFydGlhbE1hdGNoVGltZW91dFxuICAgIGRlbGV0ZSBvcHRpb25zLndhaXRzRm9yRmluaXNoXG4gICAge3BhcnRpYWxNYXRjaFRpbWVvdXQsIHdhaXRzRm9yRmluaXNofVxuXG4gICMgUHVibGljXG4gIGVuc3VyZTogKGtleXN0cm9rZSwgb3B0aW9ucz17fSkgPT5cbiAgICB1bmxlc3MgdHlwZW9mKG9wdGlvbnMpIGlzICdvYmplY3QnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG9wdGlvbnMgZm9yICdlbnN1cmUnOiBtdXN0IGJlICdvYmplY3QnIGJ1dCBnb3QgJyN7dHlwZW9mKG9wdGlvbnMpfSdcIilcbiAgICBpZiBrZXlzdHJva2U/IGFuZCBub3QgKHR5cGVvZihrZXlzdHJva2UpIGlzICdzdHJpbmcnIG9yIEFycmF5LmlzQXJyYXkoa2V5c3Ryb2tlKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQga2V5c3Ryb2tlIGZvciAnZW5zdXJlJzogbXVzdCBiZSAnc3RyaW5nJyBvciAnYXJyYXknIGJ1dCBnb3QgJyN7dHlwZW9mKGtleXN0cm9rZSl9J1wiKVxuXG4gICAga2V5c3Ryb2tlT3B0aW9ucyA9IEBnZXRBbmREZWxldGVLZXlzdHJva2VPcHRpb25zKG9wdGlvbnMpXG5cbiAgICBAdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMsIGVuc3VyZU9wdGlvbnNPcmRlcmVkLCAnSW52YWxpZCBlbnN1cmUgb3B0aW9uJylcbiAgICBAdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zKG9wdGlvbnMsIGVuc3VyZUV4Y2x1c2l2ZVJ1bGVzKVxuXG4gICAgcnVuU21hcnQgPSAoZm4pIC0+IGlmIGtleXN0cm9rZU9wdGlvbnMud2FpdHNGb3JGaW5pc2ggdGhlbiBydW5zKGZuKSBlbHNlIGZuKClcblxuICAgIHJ1blNtYXJ0ID0+XG4gICAgICBAX2tleXN0cm9rZShrZXlzdHJva2UsIGtleXN0cm9rZU9wdGlvbnMpIHVubGVzcyBfLmlzRW1wdHkoa2V5c3Ryb2tlKVxuXG4gICAgcnVuU21hcnQgPT5cbiAgICAgIGZvciBuYW1lIGluIGVuc3VyZU9wdGlvbnNPcmRlcmVkIHdoZW4gb3B0aW9uc1tuYW1lXT9cbiAgICAgICAgbWV0aG9kID0gJ2Vuc3VyZScgKyBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShuYW1lKSlcbiAgICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgZW5zdXJlV2FpdDogKGtleXN0cm9rZSwgb3B0aW9ucz17fSkgPT5cbiAgICBAZW5zdXJlKGtleXN0cm9rZSwgT2JqZWN0LmFzc2lnbihvcHRpb25zLCB3YWl0c0ZvckZpbmlzaDogdHJ1ZSkpXG5cbiAgYmluZEVuc3VyZU9wdGlvbjogKG9wdGlvbnNCYXNlLCB3YWl0PWZhbHNlKSA9PlxuICAgIChrZXlzdHJva2UsIG9wdGlvbnMpID0+XG4gICAgICBpbnRlcnNlY3RpbmdPcHRpb25zID0gXy5pbnRlcnNlY3Rpb24oXy5rZXlzKG9wdGlvbnMpLCBfLmtleXMob3B0aW9uc0Jhc2UpKVxuICAgICAgaWYgaW50ZXJzZWN0aW5nT3B0aW9ucy5sZW5ndGhcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY29uZmxpY3Qgd2l0aCBib3VuZCBvcHRpb25zICN7aW5zcGVjdChpbnRlcnNlY3RpbmdPcHRpb25zKX1cIilcblxuICAgICAgb3B0aW9ucyA9IF8uZGVmYXVsdHMoXy5jbG9uZShvcHRpb25zKSwgb3B0aW9uc0Jhc2UpXG4gICAgICBvcHRpb25zLndhaXRzRm9yRmluaXNoID0gdHJ1ZSBpZiB3YWl0XG4gICAgICBAZW5zdXJlKGtleXN0cm9rZSwgb3B0aW9ucylcblxuICBiaW5kRW5zdXJlV2FpdE9wdGlvbjogKG9wdGlvbnNCYXNlKSA9PlxuICAgIEBiaW5kRW5zdXJlT3B0aW9uKG9wdGlvbnNCYXNlLCB0cnVlKVxuXG4gIF9rZXlzdHJva2U6IChrZXlzLCBvcHRpb25zPXt9KSA9PlxuICAgIHRhcmdldCA9IEBlZGl0b3JFbGVtZW50XG4gICAga2V5c3Ryb2tlc1RvRXhlY3V0ZSA9IGtleXMuc3BsaXQoL1xccysvKVxuICAgIGxhc3RLZXlzdHJva2VJbmRleCA9IGtleXN0cm9rZXNUb0V4ZWN1dGUubGVuZ3RoIC0gMVxuXG4gICAgZm9yIGtleSwgaSBpbiBrZXlzdHJva2VzVG9FeGVjdXRlXG4gICAgICB3YWl0c0ZvckZpbmlzaCA9IChpIGlzIGxhc3RLZXlzdHJva2VJbmRleCkgYW5kIG9wdGlvbnMud2FpdHNGb3JGaW5pc2hcbiAgICAgIGlmIHdhaXRzRm9yRmluaXNoXG4gICAgICAgIGZpbmlzaGVkID0gZmFsc2VcbiAgICAgICAgQHZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uIC0+IGZpbmlzaGVkID0gdHJ1ZVxuXG4gICAgICAjIFtGSVhNRV0gV2h5IGNhbid0IEkgbGV0IGF0b20ua2V5bWFwcyBoYW5kbGUgZW50ZXIvZXNjYXBlIGJ5IGJ1aWxkRXZlbnQgYW5kIGhhbmRsZUtleWJvYXJkRXZlbnRcbiAgICAgIGlmIEB2aW1TdGF0ZS5fX3NlYXJjaElucHV0Py5oYXNGb2N1cygpICMgdG8gYXZvaWQgYXV0byBwb3B1bGF0ZVxuICAgICAgICB0YXJnZXQgPSBAdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yRWxlbWVudFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgd2hlbiBcImVudGVyXCIgdGhlbiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgd2hlbiBcImVzY2FwZVwiIHRoZW4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdjb3JlOmNhbmNlbCcpXG4gICAgICAgICAgZWxzZSBAdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yLmluc2VydFRleHQoa2V5KVxuXG4gICAgICBlbHNlIGlmIEB2aW1TdGF0ZS5pbnB1dEVkaXRvcj9cbiAgICAgICAgdGFyZ2V0ID0gQHZpbVN0YXRlLmlucHV0RWRpdG9yLmVsZW1lbnRcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgIHdoZW4gXCJlbnRlclwiIHRoZW4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgIHdoZW4gXCJlc2NhcGVcIiB0aGVuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnY29yZTpjYW5jZWwnKVxuICAgICAgICAgIGVsc2UgQHZpbVN0YXRlLmlucHV0RWRpdG9yLmluc2VydFRleHQoa2V5KVxuXG4gICAgICBlbHNlXG4gICAgICAgIGV2ZW50ID0gYnVpbGRLZXlkb3duRXZlbnRGcm9tS2V5c3Ryb2tlKG5vcm1hbGl6ZUtleXN0cm9rZXMoa2V5KSwgdGFyZ2V0KVxuICAgICAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudClcblxuICAgICAgaWYgd2FpdHNGb3JGaW5pc2hcbiAgICAgICAgd2FpdHNGb3IgLT4gZmluaXNoZWRcblxuICAgIGlmIG9wdGlvbnMucGFydGlhbE1hdGNoVGltZW91dFxuICAgICAgYWR2YW5jZUNsb2NrKGF0b20ua2V5bWFwcy5nZXRQYXJ0aWFsTWF0Y2hUaW1lb3V0KCkpXG5cbiAga2V5c3Ryb2tlOiAtPlxuICAgICMgRE9OVCByZW1vdmUgdGhpcyBtZXRob2Qgc2luY2UgZmllbGQgZXh0cmFjdGlvbiBpcyBzdGlsbCB1c2VkIGluIHZtcCBwbHVnaW5zXG4gICAgdGhyb3cgbmV3IEVycm9yKCdEb250IHVzZSBga2V5c3Ryb2tlKFwieCB5IHpcIilgLCBpbnN0ZWFkIHVzZSBgZW5zdXJlKFwieCB5IHpcIilgJylcblxuICAjIEVuc3VyZSBlYWNoIG9wdGlvbnMgZnJvbSBoZXJlXG4gICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZW5zdXJlVGV4dDogKHRleHQpIC0+XG4gICAgZXhwZWN0KEBlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKHRleHQpXG5cbiAgZW5zdXJlVGV4dF86ICh0ZXh0KSAtPlxuICAgIEBlbnN1cmVUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIGVuc3VyZVRleHRDOiAodGV4dCkgLT5cbiAgICBjdXJzb3JzID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJ3wnLCB0ZXh0LnJlcGxhY2UoLyEvZywgJycpKVxuICAgIGxhc3RDdXJzb3IgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnIScsIHRleHQucmVwbGFjZSgvXFx8L2csICcnKSlcbiAgICBjdXJzb3JzID0gY3Vyc29ycy5jb25jYXQobGFzdEN1cnNvcilcbiAgICBjdXJzb3JzID0gY3Vyc29yc1xuICAgICAgLm1hcCAocG9pbnQpIC0+IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gICAgICAuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG4gICAgQGVuc3VyZVRleHQodGV4dC5yZXBsYWNlKC9bXFx8IV0vZywgJycpKVxuICAgIGlmIGN1cnNvcnMubGVuZ3RoXG4gICAgICBAZW5zdXJlQ3Vyc29yKGN1cnNvcnMsIHRydWUpXG5cbiAgICBpZiBsYXN0Q3Vyc29yLmxlbmd0aFxuICAgICAgZXhwZWN0KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChsYXN0Q3Vyc29yWzBdKVxuXG4gIGVuc3VyZVRleHRDXzogKHRleHQpIC0+XG4gICAgQGVuc3VyZVRleHRDKHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dDogKHRleHQsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgc2VsZWN0aW9ucyA9IGlmIG9yZGVyZWRcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIGFjdHVhbCA9IChzLmdldFRleHQoKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheSh0ZXh0KSlcblxuICBlbnN1cmVTZWxlY3RlZFRleHRfOiAodGV4dCwgb3JkZXJlZCkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpLCBvcmRlcmVkKVxuXG4gIGVuc3VyZVNlbGVjdGlvbklzTmFycm93ZWQ6IChpc05hcnJvd2VkKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5pc05hcnJvd2VkKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKGlzTmFycm93ZWQpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0T3JkZXJlZDogKHRleHQpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkVGV4dCh0ZXh0LCB0cnVlKVxuXG4gIGVuc3VyZUN1cnNvcjogKHBvaW50cywgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG4gICAgYWN0dWFsID0gYWN0dWFsLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKSBpZiBvcmRlcmVkXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZUN1cnNvclNjcmVlbjogKHBvaW50cykgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9ucygpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVJlZ2lzdGVyOiAocmVnaXN0ZXIpIC0+XG4gICAgZm9yIG5hbWUsIGVuc3VyZSBvZiByZWdpc3RlclxuICAgICAge3NlbGVjdGlvbn0gPSBlbnN1cmVcbiAgICAgIGRlbGV0ZSBlbnN1cmUuc2VsZWN0aW9uXG4gICAgICByZWcgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0KG5hbWUsIHNlbGVjdGlvbilcbiAgICAgIGZvciBwcm9wZXJ0eSwgX3ZhbHVlIG9mIGVuc3VyZVxuICAgICAgICBleHBlY3QocmVnW3Byb3BlcnR5XSkudG9FcXVhbChfdmFsdWUpXG5cbiAgZW5zdXJlTnVtQ3Vyc29yczogKG51bWJlcikgLT5cbiAgICBleHBlY3QoQGVkaXRvci5nZXRDdXJzb3JzKCkpLnRvSGF2ZUxlbmd0aCBudW1iZXJcblxuICBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5OiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UsIGZuKSAtPlxuICAgIHNlbGVjdGlvbnMgPSBpZiBvcmRlcmVkXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBhY3R1YWwgPSAoZm4ocykgZm9yIHMgaW4gc2VsZWN0aW9ucylcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlJhbmdlKHJhbmdlKSlcblxuICBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlOiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgQF9lbnN1cmVTZWxlY3RlZFJhbmdlQnkgcmFuZ2UsIG9yZGVyZWQsIChzKSAtPiBzLmdldFNjcmVlblJhbmdlKClcblxuICBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlT3JkZXJlZDogKHJhbmdlKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlKHJhbmdlLCB0cnVlKVxuXG4gIGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2U6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBAX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeSByYW5nZSwgb3JkZXJlZCwgKHMpIC0+IHMuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiAocmFuZ2UpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UsIHRydWUpXG5cbiAgZW5zdXJlU2VsZWN0aW9uSXNSZXZlcnNlZDogKHJldmVyc2VkKSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGFjdHVhbCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIGV4cGVjdChhY3R1YWwpLnRvQmUocmV2ZXJzZWQpXG5cbiAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlJhbmdlKHJhbmdlKSlcblxuICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IChudW1iZXIpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQ291bnQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvQmUgbnVtYmVyXG5cbiAgZW5zdXJlT2NjdXJyZW5jZUNvdW50OiAobnVtYmVyKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJDb3VudCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9CZSBudW1iZXJcblxuICBlbnN1cmVPY2N1cnJlbmNlVGV4dDogKHRleHQpIC0+XG4gICAgbWFya2VycyA9IEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJzKClcbiAgICByYW5nZXMgPSAoci5nZXRCdWZmZXJSYW5nZSgpIGZvciByIGluIG1hcmtlcnMpXG4gICAgYWN0dWFsID0gKEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocikgZm9yIHIgaW4gcmFuZ2VzKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheSh0ZXh0KSlcblxuICBlbnN1cmVQcm9wZXJ0eUhlYWQ6IChwb2ludHMpIC0+XG4gICAgZ2V0SGVhZFByb3BlcnR5ID0gKHNlbGVjdGlvbikgPT5cbiAgICAgIEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGFjdHVhbCA9IChnZXRIZWFkUHJvcGVydHkocykgZm9yIHMgaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVByb3BlcnR5VGFpbDogKHBvaW50cykgLT5cbiAgICBnZXRUYWlsUHJvcGVydHkgPSAoc2VsZWN0aW9uKSA9PlxuICAgICAgQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3RhaWwnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgYWN0dWFsID0gKGdldFRhaWxQcm9wZXJ0eShzKSBmb3IgcyBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSlcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlU2Nyb2xsVG9wOiAoc2Nyb2xsVG9wKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCBzY3JvbGxUb3BcblxuICBlbnN1cmVNYXJrOiAobWFyaykgLT5cbiAgICBmb3IgbmFtZSwgcG9pbnQgb2YgbWFya1xuICAgICAgYWN0dWFsID0gQHZpbVN0YXRlLm1hcmsuZ2V0KG5hbWUpXG4gICAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHBvaW50KVxuXG4gIGVuc3VyZU1vZGU6IChtb2RlKSAtPlxuICAgIG1vZGUgPSB0b0FycmF5KG1vZGUpLnNsaWNlKClcbiAgICBleHBlY3QoQHZpbVN0YXRlLmlzTW9kZShtb2RlLi4uKSkudG9CZSh0cnVlKVxuXG4gICAgbW9kZVswXSA9IFwiI3ttb2RlWzBdfS1tb2RlXCJcbiAgICBtb2RlID0gbW9kZS5maWx0ZXIoKG0pIC0+IG0pXG4gICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndmltLW1vZGUtcGx1cycpKS50b0JlKHRydWUpXG4gICAgZm9yIG0gaW4gbW9kZVxuICAgICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhtKSkudG9CZSh0cnVlKVxuICAgIHNob3VsZE5vdENvbnRhaW5DbGFzc2VzID0gXy5kaWZmZXJlbmNlKHN1cHBvcnRlZE1vZGVDbGFzcywgbW9kZSlcbiAgICBmb3IgbSBpbiBzaG91bGROb3RDb250YWluQ2xhc3Nlc1xuICAgICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhtKSkudG9CZShmYWxzZSlcblxubW9kdWxlLmV4cG9ydHMgPSB7Z2V0VmltU3RhdGUsIGdldFZpZXcsIGRpc3BhdGNoLCBUZXh0RGF0YSwgd2l0aE1vY2tQbGF0Zm9ybX1cbiJdfQ==
