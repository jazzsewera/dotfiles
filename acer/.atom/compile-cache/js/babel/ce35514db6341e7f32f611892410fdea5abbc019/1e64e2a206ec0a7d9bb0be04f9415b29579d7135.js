'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;
var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('./operator');

var Operator = _require2.Operator;

// Operator which start 'insert-mode'
// -------------------------
// [NOTE]
// Rule: Don't make any text mutation before calling `@selectTarget()`.

var ActivateInsertModeBase = (function (_Operator) {
  _inherits(ActivateInsertModeBase, _Operator);

  function ActivateInsertModeBase() {
    _classCallCheck(this, ActivateInsertModeBase);

    _get(Object.getPrototypeOf(ActivateInsertModeBase.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.supportInsertionCount = true;
  }

  _createClass(ActivateInsertModeBase, [{
    key: 'getChangeSinceCheckpoint',

    // When each mutaion's extent is not intersecting, muitiple changes are recorded
    // e.g
    //  - Multicursors edit
    //  - Cursor moved in insert-mode(e.g ctrl-f, ctrl-b)
    // But I don't care multiple changes just because I'm lazy(so not perfect implementation).
    // I only take care of one change happened at earliest(topCursor's change) position.
    // Thats' why I save topCursor's position to @topCursorPositionAtInsertionStart to compare traversal to deletionStart
    // Why I use topCursor's change? Just because it's easy to use first change returned by getChangeSinceCheckpoint().
    value: function getChangeSinceCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      return this.editor.buffer.getChangesSinceCheckpoint(checkpoint)[0];
    }

    // [BUG-BUT-OK] Replaying text-deletion-operation is not compatible to pure Vim.
    // Pure Vim record all operation in insert-mode as keystroke level and can distinguish
    // character deleted by `Delete` or by `ctrl-u`.
    // But I can not and don't trying to minic this level of compatibility.
    // So basically deletion-done-in-one is expected to work well.
  }, {
    key: 'replayLastChange',
    value: function replayLastChange(selection) {
      var textToInsert = undefined;
      if (this.lastChange != null) {
        var _lastChange = this.lastChange;
        var start = _lastChange.start;
        var oldExtent = _lastChange.oldExtent;
        var newText = _lastChange.newText;

        if (!oldExtent.isZero()) {
          var traversalToStartOfDelete = start.traversalFrom(this.topCursorPositionAtInsertionStart);
          var deletionStart = selection.cursor.getBufferPosition().traverse(traversalToStartOfDelete);
          var deletionEnd = deletionStart.traverse(oldExtent);
          selection.setBufferRange([deletionStart, deletionEnd]);
        }
        textToInsert = newText;
      } else {
        textToInsert = '';
      }
      selection.insertText(textToInsert, { autoIndent: true });
    }

    // called when repeated
    // [FIXME] to use replayLastChange in repeatInsert overriding subclasss.
  }, {
    key: 'repeatInsert',
    value: function repeatInsert(selection, text) {
      this.replayLastChange(selection);
    }
  }, {
    key: 'disposeReplaceMode',
    value: function disposeReplaceMode() {
      if (this.vimState.replaceModeDisposable) {
        this.vimState.replaceModeDisposable.dispose();
        this.vimState.replaceModeDisposable = null;
      }
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this.disposeReplaceMode();
      _get(Object.getPrototypeOf(ActivateInsertModeBase.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      if (this.repeated) this.flashTarget = this.trackChange = true;

      this.preSelect();

      if (this.selectTarget() || this.target.wise !== 'linewise') {
        if (this.mutateText) this.mutateText();

        if (this.repeated) {
          for (var selection of this.editor.getSelections()) {
            var textToInsert = this.lastChange && this.lastChange.newText || '';
            this.repeatInsert(selection, textToInsert);
            this.utils.moveCursorLeft(selection.cursor);
          }
          this.mutationManager.setCheckpoint('did-finish');
          this.groupChangesSinceBufferCheckpoint('undo');
          this.emitDidFinishMutation();
          if (this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) this.vimState.clearSelections();
        } else {
          if (this.mode !== 'insert') {
            this.initializeInsertMode();
          }

          if (this.name === 'ActivateReplaceMode') {
            this.activateMode('insert', 'replace');
          } else {
            this.activateMode('insert');
          }
        }
      } else {
        this.activateMode('normal');
      }
    }
  }, {
    key: 'initializeInsertMode',
    value: function initializeInsertMode() {
      var _this = this;

      // Avoid freezing by acccidental big count(e.g. `5555555555555i`), See #560, #596
      var insertionCount = this.supportInsertionCount ? this.limitNumber(this.getCount() - 1, { max: 100 }) : 0;

      var textByOperator = '';
      if (insertionCount > 0) {
        var change = this.getChangeSinceCheckpoint('undo');
        textByOperator = change && change.newText || '';
      }

      this.createBufferCheckpoint('insert');
      var topCursor = this.editor.getCursorsOrderedByBufferPosition()[0];
      this.topCursorPositionAtInsertionStart = topCursor.getBufferPosition();

      // Skip normalization of blockwiseSelection.
      // Since want to keep multi-cursor and it's position in when shift to insert-mode.
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.skipNormalization();
      }

      var insertModeDisposable = this.vimState.preemptWillDeactivateMode(function (_ref) {
        var mode = _ref.mode;

        if (mode !== 'insert') {
          return;
        }
        insertModeDisposable.dispose();
        _this.disposeReplaceMode();

        _this.vimState.mark.set('^', _this.editor.getCursorBufferPosition()); // Last insert-mode position
        var textByUserInput = '';
        var change = _this.getChangeSinceCheckpoint('insert');
        if (change) {
          _this.lastChange = change;
          _this.setMarkForChange(new Range(change.start, change.start.traverse(change.newExtent)));
          textByUserInput = change.newText;
        }
        _this.vimState.register.set('.', { text: textByUserInput }); // Last inserted text

        while (insertionCount) {
          insertionCount--;
          for (var selection of _this.editor.getSelections()) {
            selection.insertText(textByOperator + textByUserInput, { autoIndent: true });
          }
        }

        // This cursor state is restored on undo.
        // So cursor state has to be updated before next groupChangesSinceCheckpoint()
        if (_this.getConfig('clearMultipleCursorsOnEscapeInsertMode')) _this.vimState.clearSelections();

        // grouping changes for undo checkpoint need to come last
        _this.groupChangesSinceBufferCheckpoint('undo');

        var preventIncorrectWrap = _this.editor.hasAtomicSoftTabs();
        for (var cursor of _this.editor.getCursors()) {
          _this.utils.moveCursorLeft(cursor, { preventIncorrectWrap: preventIncorrectWrap });
        }
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return ActivateInsertModeBase;
})(Operator);

var ActivateInsertMode = (function (_ActivateInsertModeBase) {
  _inherits(ActivateInsertMode, _ActivateInsertModeBase);

  function ActivateInsertMode() {
    _classCallCheck(this, ActivateInsertMode);

    _get(Object.getPrototypeOf(ActivateInsertMode.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  return ActivateInsertMode;
})(ActivateInsertModeBase);

var ActivateReplaceMode = (function (_ActivateInsertMode) {
  _inherits(ActivateReplaceMode, _ActivateInsertMode);

  function ActivateReplaceMode() {
    _classCallCheck(this, ActivateReplaceMode);

    _get(Object.getPrototypeOf(ActivateReplaceMode.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ActivateReplaceMode, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      _get(Object.getPrototypeOf(ActivateReplaceMode.prototype), 'initialize', this).call(this);

      var replacedCharsBySelection = new WeakMap();
      this.vimState.replaceModeDisposable = new CompositeDisposable(this.editor.onWillInsertText(function (_ref2) {
        var _ref2$text = _ref2.text;
        var text = _ref2$text === undefined ? '' : _ref2$text;
        var cancel = _ref2.cancel;

        cancel();
        for (var selection of _this2.editor.getSelections()) {
          for (var char of text.split('')) {
            if (char !== '\n' && !selection.cursor.isAtEndOfLine()) selection.selectRight();
            if (!replacedCharsBySelection.has(selection)) replacedCharsBySelection.set(selection, []);
            replacedCharsBySelection.get(selection).push(selection.getText());
            selection.insertText(char);
          }
        }
      }), atom.commands.add(this.editorElement, 'core:backspace', function (event) {
        event.stopImmediatePropagation();
        for (var selection of _this2.editor.getSelections()) {
          var chars = replacedCharsBySelection.get(selection);
          if (chars && chars.length) {
            selection.selectLeft();
            if (!selection.insertText(chars.pop()).isEmpty()) selection.cursor.moveLeft();
          }
        }
      }));
    }
  }, {
    key: 'repeatInsert',
    value: function repeatInsert(selection, text) {
      for (var char of text) {
        if (char === '\n') continue;
        if (selection.cursor.isAtEndOfLine()) break;
        selection.selectRight();
      }
      selection.insertText(text, { autoIndent: false });
    }
  }]);

  return ActivateReplaceMode;
})(ActivateInsertMode);

var InsertAfter = (function (_ActivateInsertMode2) {
  _inherits(InsertAfter, _ActivateInsertMode2);

  function InsertAfter() {
    _classCallCheck(this, InsertAfter);

    _get(Object.getPrototypeOf(InsertAfter.prototype), 'constructor', this).apply(this, arguments);
  }

  // key: 'g I' in all mode

  _createClass(InsertAfter, [{
    key: 'execute',
    value: function execute() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.moveCursorRight(cursor);
      }
      _get(Object.getPrototypeOf(InsertAfter.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAfter;
})(ActivateInsertMode);

var InsertAtBeginningOfLine = (function (_ActivateInsertMode3) {
  _inherits(InsertAtBeginningOfLine, _ActivateInsertMode3);

  function InsertAtBeginningOfLine() {
    _classCallCheck(this, InsertAtBeginningOfLine);

    _get(Object.getPrototypeOf(InsertAtBeginningOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // key: normal 'A'

  _createClass(InsertAtBeginningOfLine, [{
    key: 'execute',
    value: function execute() {
      if (this.mode === 'visual' && this.submode !== 'blockwise') {
        this.editor.splitSelectionsIntoLines();
      }
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.skipNormalization();
      }
      this.editor.moveToBeginningOfLine();
      _get(Object.getPrototypeOf(InsertAtBeginningOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAtBeginningOfLine;
})(ActivateInsertMode);

var InsertAfterEndOfLine = (function (_ActivateInsertMode4) {
  _inherits(InsertAfterEndOfLine, _ActivateInsertMode4);

  function InsertAfterEndOfLine() {
    _classCallCheck(this, InsertAfterEndOfLine);

    _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // key: normal 'I'

  _createClass(InsertAfterEndOfLine, [{
    key: 'execute',
    value: function execute() {
      this.editor.moveToEndOfLine();
      _get(Object.getPrototypeOf(InsertAfterEndOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAfterEndOfLine;
})(ActivateInsertMode);

var InsertAtFirstCharacterOfLine = (function (_ActivateInsertMode5) {
  _inherits(InsertAtFirstCharacterOfLine, _ActivateInsertMode5);

  function InsertAtFirstCharacterOfLine() {
    _classCallCheck(this, InsertAtFirstCharacterOfLine);

    _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertAtFirstCharacterOfLine, [{
    key: 'execute',
    value: function execute() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.moveCursorToFirstCharacterAtRow(cursor, cursor.getBufferRow());
      }
      _get(Object.getPrototypeOf(InsertAtFirstCharacterOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAtFirstCharacterOfLine;
})(ActivateInsertMode);

var InsertAtLastInsert = (function (_ActivateInsertMode6) {
  _inherits(InsertAtLastInsert, _ActivateInsertMode6);

  function InsertAtLastInsert() {
    _classCallCheck(this, InsertAtLastInsert);

    _get(Object.getPrototypeOf(InsertAtLastInsert.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertAtLastInsert, [{
    key: 'execute',
    value: function execute() {
      var point = this.vimState.mark.get('^');
      if (point) {
        this.editor.setCursorBufferPosition(point);
        this.editor.scrollToCursorPosition({ center: true });
      }
      _get(Object.getPrototypeOf(InsertAtLastInsert.prototype), 'execute', this).call(this);
    }
  }]);

  return InsertAtLastInsert;
})(ActivateInsertMode);

var InsertAboveWithNewline = (function (_ActivateInsertMode7) {
  _inherits(InsertAboveWithNewline, _ActivateInsertMode7);

  function InsertAboveWithNewline() {
    _classCallCheck(this, InsertAboveWithNewline);

    _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertAboveWithNewline, [{
    key: 'initialize',
    value: function initialize() {
      this.originalCursorPositionMarker = this.editor.markBufferPosition(this.editor.getCursorBufferPosition());
      _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'initialize', this).call(this);
    }

    // This is for `o` and `O` operator.
    // On undo/redo put cursor at original point where user type `o` or `O`.
  }, {
    key: 'groupChangesSinceBufferCheckpoint',
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      if (this.repeated) {
        _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'groupChangesSinceBufferCheckpoint', this).call(this, purpose);
        return;
      }

      var lastCursor = this.editor.getLastCursor();
      var cursorPosition = lastCursor.getBufferPosition();
      lastCursor.setBufferPosition(this.originalCursorPositionMarker.getHeadBufferPosition());
      this.originalCursorPositionMarker.destroy();
      this.originalCursorPositionMarker = null;

      if (this.getConfig('groupChangesWhenLeavingInsertMode')) {
        _get(Object.getPrototypeOf(InsertAboveWithNewline.prototype), 'groupChangesSinceBufferCheckpoint', this).call(this, purpose);
      }
      lastCursor.setBufferPosition(cursorPosition);
    }
  }, {
    key: 'autoIndentEmptyRows',
    value: function autoIndentEmptyRows() {
      for (var cursor of this.editor.getCursors()) {
        var row = cursor.getBufferRow();
        if (this.isEmptyRow(row)) this.editor.autoIndentBufferRow(row);
      }
    }
  }, {
    key: 'mutateText',
    value: function mutateText() {
      this.editor.insertNewlineAbove();
      if (this.editor.autoIndent) this.autoIndentEmptyRows();
    }
  }, {
    key: 'repeatInsert',
    value: function repeatInsert(selection, text) {
      selection.insertText(text.trimLeft(), { autoIndent: true });
    }
  }]);

  return InsertAboveWithNewline;
})(ActivateInsertMode);

var InsertBelowWithNewline = (function (_InsertAboveWithNewline) {
  _inherits(InsertBelowWithNewline, _InsertAboveWithNewline);

  function InsertBelowWithNewline() {
    _classCallCheck(this, InsertBelowWithNewline);

    _get(Object.getPrototypeOf(InsertBelowWithNewline.prototype), 'constructor', this).apply(this, arguments);
  }

  // Advanced Insertion
  // -------------------------

  _createClass(InsertBelowWithNewline, [{
    key: 'mutateText',
    value: function mutateText() {
      for (var cursor of this.editor.getCursors()) {
        this.utils.setBufferRow(cursor, this.getFoldEndRowForRow(cursor.getBufferRow()));
      }

      this.editor.insertNewlineBelow();
      if (this.editor.autoIndent) this.autoIndentEmptyRows();
    }
  }]);

  return InsertBelowWithNewline;
})(InsertAboveWithNewline);

var InsertByTarget = (function (_ActivateInsertModeBase2) {
  _inherits(InsertByTarget, _ActivateInsertModeBase2);

  function InsertByTarget() {
    _classCallCheck(this, InsertByTarget);

    _get(Object.getPrototypeOf(InsertByTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = null;
  }

  // key: 'I', Used in 'visual-mode.characterwise', visual-mode.blockwise

  _createClass(InsertByTarget, [{
    key: 'initialize',
    // one of ['start', 'end', 'head', 'tail']

    value: function initialize() {
      // HACK
      // When g i is mapped to `insert-at-start-of-target`.
      // `g i 3 l` start insert at 3 column right position.
      // In this case, we don't want repeat insertion 3 times.
      // This @getCount() call cache number at the timing BEFORE '3' is specified.
      this.getCount();
      _get(Object.getPrototypeOf(InsertByTarget.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this3 = this;

      this.onDidSelectTarget(function () {
        // In vC/vL, when occurrence marker was NOT selected,
        // it behave's very specially
        // vC: `I` and `A` behaves as shoft hand of `ctrl-v I` and `ctrl-v A`.
        // vL: `I` and `A` place cursors at each selected lines of start( or end ) of non-white-space char.
        if (!_this3.occurrenceSelected && _this3.mode === 'visual' && _this3.submode !== 'blockwise') {
          for (var $selection of _this3.swrap.getSelections(_this3.editor)) {
            $selection.normalize();
            $selection.applyWise('blockwise');
          }

          if (_this3.submode === 'linewise') {
            for (var blockwiseSelection of _this3.getBlockwiseSelections()) {
              blockwiseSelection.expandMemberSelectionsOverLineWithTrimRange();
            }
          }
        }

        for (var $selection of _this3.swrap.getSelections(_this3.editor)) {
          $selection.setBufferPositionTo(_this3.which);
        }
      });
      _get(Object.getPrototypeOf(InsertByTarget.prototype), 'execute', this).call(this);
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return InsertByTarget;
})(ActivateInsertModeBase);

var InsertAtStartOfTarget = (function (_InsertByTarget) {
  _inherits(InsertAtStartOfTarget, _InsertByTarget);

  function InsertAtStartOfTarget() {
    _classCallCheck(this, InsertAtStartOfTarget);

    _get(Object.getPrototypeOf(InsertAtStartOfTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
  }

  // key: 'A', Used in 'visual-mode.characterwise', 'visual-mode.blockwise'
  return InsertAtStartOfTarget;
})(InsertByTarget);

var InsertAtEndOfTarget = (function (_InsertByTarget2) {
  _inherits(InsertAtEndOfTarget, _InsertByTarget2);

  function InsertAtEndOfTarget() {
    _classCallCheck(this, InsertAtEndOfTarget);

    _get(Object.getPrototypeOf(InsertAtEndOfTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
  }

  return InsertAtEndOfTarget;
})(InsertByTarget);

var InsertAtHeadOfTarget = (function (_InsertByTarget3) {
  _inherits(InsertAtHeadOfTarget, _InsertByTarget3);

  function InsertAtHeadOfTarget() {
    _classCallCheck(this, InsertAtHeadOfTarget);

    _get(Object.getPrototypeOf(InsertAtHeadOfTarget.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'head';
  }

  return InsertAtHeadOfTarget;
})(InsertByTarget);

var InsertAtStartOfOccurrence = (function (_InsertAtStartOfTarget) {
  _inherits(InsertAtStartOfOccurrence, _InsertAtStartOfTarget);

  function InsertAtStartOfOccurrence() {
    _classCallCheck(this, InsertAtStartOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtStartOfOccurrence;
})(InsertAtStartOfTarget);

var InsertAtEndOfOccurrence = (function (_InsertAtEndOfTarget) {
  _inherits(InsertAtEndOfOccurrence, _InsertAtEndOfTarget);

  function InsertAtEndOfOccurrence() {
    _classCallCheck(this, InsertAtEndOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtEndOfOccurrence;
})(InsertAtEndOfTarget);

var InsertAtHeadOfOccurrence = (function (_InsertAtHeadOfTarget) {
  _inherits(InsertAtHeadOfOccurrence, _InsertAtHeadOfTarget);

  function InsertAtHeadOfOccurrence() {
    _classCallCheck(this, InsertAtHeadOfOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return InsertAtHeadOfOccurrence;
})(InsertAtHeadOfTarget);

var InsertAtStartOfSubwordOccurrence = (function (_InsertAtStartOfOccurrence) {
  _inherits(InsertAtStartOfSubwordOccurrence, _InsertAtStartOfOccurrence);

  function InsertAtStartOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtStartOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtStartOfSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return InsertAtStartOfSubwordOccurrence;
})(InsertAtStartOfOccurrence);

var InsertAtEndOfSubwordOccurrence = (function (_InsertAtEndOfOccurrence) {
  _inherits(InsertAtEndOfSubwordOccurrence, _InsertAtEndOfOccurrence);

  function InsertAtEndOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtEndOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtEndOfSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return InsertAtEndOfSubwordOccurrence;
})(InsertAtEndOfOccurrence);

var InsertAtHeadOfSubwordOccurrence = (function (_InsertAtHeadOfOccurrence) {
  _inherits(InsertAtHeadOfSubwordOccurrence, _InsertAtHeadOfOccurrence);

  function InsertAtHeadOfSubwordOccurrence() {
    _classCallCheck(this, InsertAtHeadOfSubwordOccurrence);

    _get(Object.getPrototypeOf(InsertAtHeadOfSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return InsertAtHeadOfSubwordOccurrence;
})(InsertAtHeadOfOccurrence);

var InsertAtStartOfSmartWord = (function (_InsertByTarget4) {
  _inherits(InsertAtStartOfSmartWord, _InsertByTarget4);

  function InsertAtStartOfSmartWord() {
    _classCallCheck(this, InsertAtStartOfSmartWord);

    _get(Object.getPrototypeOf(InsertAtStartOfSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.target = 'MoveToPreviousSmartWord';
  }

  return InsertAtStartOfSmartWord;
})(InsertByTarget);

var InsertAtEndOfSmartWord = (function (_InsertByTarget5) {
  _inherits(InsertAtEndOfSmartWord, _InsertByTarget5);

  function InsertAtEndOfSmartWord() {
    _classCallCheck(this, InsertAtEndOfSmartWord);

    _get(Object.getPrototypeOf(InsertAtEndOfSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.target = 'MoveToEndOfSmartWord';
  }

  return InsertAtEndOfSmartWord;
})(InsertByTarget);

var InsertAtPreviousFoldStart = (function (_InsertByTarget6) {
  _inherits(InsertAtPreviousFoldStart, _InsertByTarget6);

  function InsertAtPreviousFoldStart() {
    _classCallCheck(this, InsertAtPreviousFoldStart);

    _get(Object.getPrototypeOf(InsertAtPreviousFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.target = 'MoveToPreviousFoldStart';
  }

  return InsertAtPreviousFoldStart;
})(InsertByTarget);

var InsertAtNextFoldStart = (function (_InsertByTarget7) {
  _inherits(InsertAtNextFoldStart, _InsertByTarget7);

  function InsertAtNextFoldStart() {
    _classCallCheck(this, InsertAtNextFoldStart);

    _get(Object.getPrototypeOf(InsertAtNextFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.target = 'MoveToNextFoldStart';
  }

  // -------------------------
  return InsertAtNextFoldStart;
})(InsertByTarget);

var Change = (function (_ActivateInsertModeBase3) {
  _inherits(Change, _ActivateInsertModeBase3);

  function Change() {
    _classCallCheck(this, Change);

    _get(Object.getPrototypeOf(Change.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.supportInsertionCount = false;
  }

  _createClass(Change, [{
    key: 'mutateText',
    value: function mutateText() {
      // Allways dynamically determine selection wise wthout consulting target.wise
      // Reason: when `c i {`, wise is 'characterwise', but actually selected range is 'linewise'
      //   {
      //     a
      //   }
      var isLinewiseTarget = this.swrap.detectWise(this.editor) === 'linewise';
      for (var selection of this.editor.getSelections()) {
        if (!this.getConfig('dontUpdateRegisterOnChangeOrSubstitute')) {
          this.setTextToRegister(selection.getText(), selection);
        }
        if (isLinewiseTarget) {
          selection.insertText('\n', { autoIndent: true });
          // selection.insertText("", {autoIndent: true})
          selection.cursor.moveLeft();
        } else {
          selection.insertText('', { autoIndent: true });
        }
      }
    }
  }]);

  return Change;
})(ActivateInsertModeBase);

var ChangeOccurrence = (function (_Change) {
  _inherits(ChangeOccurrence, _Change);

  function ChangeOccurrence() {
    _classCallCheck(this, ChangeOccurrence);

    _get(Object.getPrototypeOf(ChangeOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  return ChangeOccurrence;
})(Change);

var ChangeSubwordOccurrence = (function (_ChangeOccurrence) {
  _inherits(ChangeSubwordOccurrence, _ChangeOccurrence);

  function ChangeSubwordOccurrence() {
    _classCallCheck(this, ChangeSubwordOccurrence);

    _get(Object.getPrototypeOf(ChangeSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  return ChangeSubwordOccurrence;
})(ChangeOccurrence);

var Substitute = (function (_Change2) {
  _inherits(Substitute, _Change2);

  function Substitute() {
    _classCallCheck(this, Substitute);

    _get(Object.getPrototypeOf(Substitute.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveRight';
  }

  return Substitute;
})(Change);

var SubstituteLine = (function (_Change3) {
  _inherits(SubstituteLine, _Change3);

  function SubstituteLine() {
    _classCallCheck(this, SubstituteLine);

    _get(Object.getPrototypeOf(SubstituteLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.target = 'MoveToRelativeLine';
  }

  // alias
  return SubstituteLine;
})(Change);

var ChangeLine = (function (_SubstituteLine) {
  _inherits(ChangeLine, _SubstituteLine);

  function ChangeLine() {
    _classCallCheck(this, ChangeLine);

    _get(Object.getPrototypeOf(ChangeLine.prototype), 'constructor', this).apply(this, arguments);
  }

  return ChangeLine;
})(SubstituteLine);

var ChangeToLastCharacterOfLine = (function (_Change4) {
  _inherits(ChangeToLastCharacterOfLine, _Change4);

  function ChangeToLastCharacterOfLine() {
    _classCallCheck(this, ChangeToLastCharacterOfLine);

    _get(Object.getPrototypeOf(ChangeToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToLastCharacterOfLine';
  }

  _createClass(ChangeToLastCharacterOfLine, [{
    key: 'execute',
    value: function execute() {
      var _this4 = this;

      this.onDidSelectTarget(function () {
        if (_this4.target.wise === 'blockwise') {
          for (var blockwiseSelection of _this4.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(ChangeToLastCharacterOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return ChangeToLastCharacterOfLine;
})(Change);

module.exports = {
  ActivateInsertModeBase: ActivateInsertModeBase,
  ActivateInsertMode: ActivateInsertMode,
  ActivateReplaceMode: ActivateReplaceMode,
  InsertAfter: InsertAfter,
  InsertAtBeginningOfLine: InsertAtBeginningOfLine,
  InsertAfterEndOfLine: InsertAfterEndOfLine,
  InsertAtFirstCharacterOfLine: InsertAtFirstCharacterOfLine,
  InsertAtLastInsert: InsertAtLastInsert,
  InsertAboveWithNewline: InsertAboveWithNewline,
  InsertBelowWithNewline: InsertBelowWithNewline,
  InsertByTarget: InsertByTarget,
  InsertAtStartOfTarget: InsertAtStartOfTarget,
  InsertAtEndOfTarget: InsertAtEndOfTarget,
  InsertAtHeadOfTarget: InsertAtHeadOfTarget,
  InsertAtStartOfOccurrence: InsertAtStartOfOccurrence,
  InsertAtEndOfOccurrence: InsertAtEndOfOccurrence,
  InsertAtHeadOfOccurrence: InsertAtHeadOfOccurrence,
  InsertAtStartOfSubwordOccurrence: InsertAtStartOfSubwordOccurrence,
  InsertAtEndOfSubwordOccurrence: InsertAtEndOfSubwordOccurrence,
  InsertAtHeadOfSubwordOccurrence: InsertAtHeadOfSubwordOccurrence,
  InsertAtStartOfSmartWord: InsertAtStartOfSmartWord,
  InsertAtEndOfSmartWord: InsertAtEndOfSmartWord,
  InsertAtPreviousFoldStart: InsertAtPreviousFoldStart,
  InsertAtNextFoldStart: InsertAtNextFoldStart,
  Change: Change,
  ChangeOccurrence: ChangeOccurrence,
  ChangeSubwordOccurrence: ChangeSubwordOccurrence,
  Substitute: Substitute,
  SubstituteLine: SubstituteLine,
  ChangeLine: ChangeLine,
  ChangeToLastCharacterOfLine: ChangeToLastCharacterOfLine
};
// [FIXME] to re-override target.wise in visual-mode
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7OztlQUUwQixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUE3QyxLQUFLLFlBQUwsS0FBSztJQUFFLG1CQUFtQixZQUFuQixtQkFBbUI7O2dCQUNkLE9BQU8sQ0FBQyxZQUFZLENBQUM7O0lBQWpDLFFBQVEsYUFBUixRQUFROzs7Ozs7O0lBTVQsc0JBQXNCO1lBQXRCLHNCQUFzQjs7V0FBdEIsc0JBQXNCOzBCQUF0QixzQkFBc0I7OytCQUF0QixzQkFBc0I7O1NBRTFCLFdBQVcsR0FBRyxLQUFLO1NBQ25CLHFCQUFxQixHQUFHLElBQUk7OztlQUh4QixzQkFBc0I7Ozs7Ozs7Ozs7O1dBYUQsa0NBQUMsT0FBTyxFQUFFO0FBQ2pDLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwRCxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ25FOzs7Ozs7Ozs7V0FPZ0IsMEJBQUMsU0FBUyxFQUFFO0FBQzNCLFVBQUksWUFBWSxZQUFBLENBQUE7QUFDaEIsVUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksRUFBRTswQkFDUyxJQUFJLENBQUMsVUFBVTtZQUE1QyxLQUFLLGVBQUwsS0FBSztZQUFFLFNBQVMsZUFBVCxTQUFTO1lBQUUsT0FBTyxlQUFQLE9BQU87O0FBQ2hDLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDdkIsY0FBTSx3QkFBd0IsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO0FBQzVGLGNBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENB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LEVBQWxCLGtCQUFrQjtBQUNsQixxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLGFBQVcsRUFBWCxXQUFXO0FBQ1gseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLDhCQUE0QixFQUE1Qiw0QkFBNEI7QUFDNUIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsZ0JBQWMsRUFBZCxjQUFjO0FBQ2QsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6Qix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLDBCQUF3QixFQUF4Qix3QkFBd0I7QUFDeEIsa0NBQWdDLEVBQWhDLGdDQUFnQztBQUNoQyxnQ0FBOEIsRUFBOUIsOEJBQThCO0FBQzlCLGlDQUErQixFQUEvQiwrQkFBK0I7QUFDL0IsMEJBQXdCLEVBQXhCLHdCQUF3QjtBQUN4Qix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLDJCQUF5QixFQUF6Qix5QkFBeUI7QUFDekIsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixRQUFNLEVBQU4sTUFBTTtBQUNOLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixZQUFVLEVBQVYsVUFBVTtBQUNWLGdCQUFjLEVBQWQsY0FBYztBQUNkLFlBQVUsRUFBVixVQUFVO0FBQ1YsNkJBQTJCLEVBQTNCLDJCQUEyQjtDQUM1QixDQUFBIiwiZmlsZSI6Ii9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItaW5zZXJ0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3Qge1JhbmdlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKVxuY29uc3Qge09wZXJhdG9yfSA9IHJlcXVpcmUoJy4vb3BlcmF0b3InKVxuXG4vLyBPcGVyYXRvciB3aGljaCBzdGFydCAnaW5zZXJ0LW1vZGUnXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbTk9URV1cbi8vIFJ1bGU6IERvbid0IG1ha2UgYW55IHRleHQgbXV0YXRpb24gYmVmb3JlIGNhbGxpbmcgYEBzZWxlY3RUYXJnZXQoKWAuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgc3VwcG9ydEluc2VydGlvbkNvdW50ID0gdHJ1ZVxuXG4gIC8vIFdoZW4gZWFjaCBtdXRhaW9uJ3MgZXh0ZW50IGlzIG5vdCBpbnRlcnNlY3RpbmcsIG11aXRpcGxlIGNoYW5nZXMgYXJlIHJlY29yZGVkXG4gIC8vIGUuZ1xuICAvLyAgLSBNdWx0aWN1cnNvcnMgZWRpdFxuICAvLyAgLSBDdXJzb3IgbW92ZWQgaW4gaW5zZXJ0LW1vZGUoZS5nIGN0cmwtZiwgY3RybC1iKVxuICAvLyBCdXQgSSBkb24ndCBjYXJlIG11bHRpcGxlIGNoYW5nZXMganVzdCBiZWNhdXNlIEknbSBsYXp5KHNvIG5vdCBwZXJmZWN0IGltcGxlbWVudGF0aW9uKS5cbiAgLy8gSSBvbmx5IHRha2UgY2FyZSBvZiBvbmUgY2hhbmdlIGhhcHBlbmVkIGF0IGVhcmxpZXN0KHRvcEN1cnNvcidzIGNoYW5nZSkgcG9zaXRpb24uXG4gIC8vIFRoYXRzJyB3aHkgSSBzYXZlIHRvcEN1cnNvcidzIHBvc2l0aW9uIHRvIEB0b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQgdG8gY29tcGFyZSB0cmF2ZXJzYWwgdG8gZGVsZXRpb25TdGFydFxuICAvLyBXaHkgSSB1c2UgdG9wQ3Vyc29yJ3MgY2hhbmdlPyBKdXN0IGJlY2F1c2UgaXQncyBlYXN5IHRvIHVzZSBmaXJzdCBjaGFuZ2UgcmV0dXJuZWQgYnkgZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCkuXG4gIGdldENoYW5nZVNpbmNlQ2hlY2twb2ludCAocHVycG9zZSkge1xuICAgIGNvbnN0IGNoZWNrcG9pbnQgPSB0aGlzLmdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClbMF1cbiAgfVxuXG4gIC8vIFtCVUctQlVULU9LXSBSZXBsYXlpbmcgdGV4dC1kZWxldGlvbi1vcGVyYXRpb24gaXMgbm90IGNvbXBhdGlibGUgdG8gcHVyZSBWaW0uXG4gIC8vIFB1cmUgVmltIHJlY29yZCBhbGwgb3BlcmF0aW9uIGluIGluc2VydC1tb2RlIGFzIGtleXN0cm9rZSBsZXZlbCBhbmQgY2FuIGRpc3Rpbmd1aXNoXG4gIC8vIGNoYXJhY3RlciBkZWxldGVkIGJ5IGBEZWxldGVgIG9yIGJ5IGBjdHJsLXVgLlxuICAvLyBCdXQgSSBjYW4gbm90IGFuZCBkb24ndCB0cnlpbmcgdG8gbWluaWMgdGhpcyBsZXZlbCBvZiBjb21wYXRpYmlsaXR5LlxuICAvLyBTbyBiYXNpY2FsbHkgZGVsZXRpb24tZG9uZS1pbi1vbmUgaXMgZXhwZWN0ZWQgdG8gd29yayB3ZWxsLlxuICByZXBsYXlMYXN0Q2hhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBsZXQgdGV4dFRvSW5zZXJ0XG4gICAgaWYgKHRoaXMubGFzdENoYW5nZSAhPSBudWxsKSB7XG4gICAgICBjb25zdCB7c3RhcnQsIG9sZEV4dGVudCwgbmV3VGV4dH0gPSB0aGlzLmxhc3RDaGFuZ2VcbiAgICAgIGlmICghb2xkRXh0ZW50LmlzWmVybygpKSB7XG4gICAgICAgIGNvbnN0IHRyYXZlcnNhbFRvU3RhcnRPZkRlbGV0ZSA9IHN0YXJ0LnRyYXZlcnNhbEZyb20odGhpcy50b3BDdXJzb3JQb3NpdGlvbkF0SW5zZXJ0aW9uU3RhcnQpXG4gICAgICAgIGNvbnN0IGRlbGV0aW9uU3RhcnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhdmVyc2UodHJhdmVyc2FsVG9TdGFydE9mRGVsZXRlKVxuICAgICAgICBjb25zdCBkZWxldGlvbkVuZCA9IGRlbGV0aW9uU3RhcnQudHJhdmVyc2Uob2xkRXh0ZW50KVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW2RlbGV0aW9uU3RhcnQsIGRlbGV0aW9uRW5kXSlcbiAgICAgIH1cbiAgICAgIHRleHRUb0luc2VydCA9IG5ld1RleHRcbiAgICB9IGVsc2Uge1xuICAgICAgdGV4dFRvSW5zZXJ0ID0gJydcbiAgICB9XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dFRvSW5zZXJ0LCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gIH1cblxuICAvLyBjYWxsZWQgd2hlbiByZXBlYXRlZFxuICAvLyBbRklYTUVdIHRvIHVzZSByZXBsYXlMYXN0Q2hhbmdlIGluIHJlcGVhdEluc2VydCBvdmVycmlkaW5nIHN1YmNsYXNzcy5cbiAgcmVwZWF0SW5zZXJ0IChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICB0aGlzLnJlcGxheUxhc3RDaGFuZ2Uoc2VsZWN0aW9uKVxuICB9XG5cbiAgZGlzcG9zZVJlcGxhY2VNb2RlICgpIHtcbiAgICBpZiAodGhpcy52aW1TdGF0ZS5yZXBsYWNlTW9kZURpc3Bvc2FibGUpIHtcbiAgICAgIHRoaXMudmltU3RhdGUucmVwbGFjZU1vZGVEaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgdGhpcy52aW1TdGF0ZS5yZXBsYWNlTW9kZURpc3Bvc2FibGUgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgdGhpcy5kaXNwb3NlUmVwbGFjZU1vZGUoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgaWYgKHRoaXMucmVwZWF0ZWQpIHRoaXMuZmxhc2hUYXJnZXQgPSB0aGlzLnRyYWNrQ2hhbmdlID0gdHJ1ZVxuXG4gICAgdGhpcy5wcmVTZWxlY3QoKVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0VGFyZ2V0KCkgfHwgdGhpcy50YXJnZXQud2lzZSAhPT0gJ2xpbmV3aXNlJykge1xuICAgICAgaWYgKHRoaXMubXV0YXRlVGV4dCkgdGhpcy5tdXRhdGVUZXh0KClcblxuICAgICAgaWYgKHRoaXMucmVwZWF0ZWQpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgY29uc3QgdGV4dFRvSW5zZXJ0ID0gKHRoaXMubGFzdENoYW5nZSAmJiB0aGlzLmxhc3RDaGFuZ2UubmV3VGV4dCkgfHwgJydcbiAgICAgICAgICB0aGlzLnJlcGVhdEluc2VydChzZWxlY3Rpb24sIHRleHRUb0luc2VydClcbiAgICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JMZWZ0KHNlbGVjdGlvbi5jdXJzb3IpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludCgnZGlkLWZpbmlzaCcpXG4gICAgICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcbiAgICAgICAgdGhpcy5lbWl0RGlkRmluaXNoTXV0YXRpb24oKVxuICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoJ2NsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlJykpIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm1vZGUgIT09ICdpbnNlcnQnKSB7XG4gICAgICAgICAgdGhpcy5pbml0aWFsaXplSW5zZXJ0TW9kZSgpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5uYW1lID09PSAnQWN0aXZhdGVSZXBsYWNlTW9kZScpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlTW9kZSgnaW5zZXJ0JywgJ3JlcGxhY2UnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKCdpbnNlcnQnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxpemVJbnNlcnRNb2RlICgpIHtcbiAgICAvLyBBdm9pZCBmcmVlemluZyBieSBhY2NjaWRlbnRhbCBiaWcgY291bnQoZS5nLiBgNTU1NTU1NTU1NTU1NWlgKSwgU2VlICM1NjAsICM1OTZcbiAgICBsZXQgaW5zZXJ0aW9uQ291bnQgPSB0aGlzLnN1cHBvcnRJbnNlcnRpb25Db3VudCA/IHRoaXMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpIC0gMSwge21heDogMTAwfSkgOiAwXG5cbiAgICBsZXQgdGV4dEJ5T3BlcmF0b3IgPSAnJ1xuICAgIGlmIChpbnNlcnRpb25Db3VudCA+IDApIHtcbiAgICAgIGNvbnN0IGNoYW5nZSA9IHRoaXMuZ2V0Q2hhbmdlU2luY2VDaGVja3BvaW50KCd1bmRvJylcbiAgICAgIHRleHRCeU9wZXJhdG9yID0gKGNoYW5nZSAmJiBjaGFuZ2UubmV3VGV4dCkgfHwgJydcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoJ2luc2VydCcpXG4gICAgY29uc3QgdG9wQ3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClbMF1cbiAgICB0aGlzLnRvcEN1cnNvclBvc2l0aW9uQXRJbnNlcnRpb25TdGFydCA9IHRvcEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAvLyBTa2lwIG5vcm1hbGl6YXRpb24gb2YgYmxvY2t3aXNlU2VsZWN0aW9uLlxuICAgIC8vIFNpbmNlIHdhbnQgdG8ga2VlcCBtdWx0aS1jdXJzb3IgYW5kIGl0J3MgcG9zaXRpb24gaW4gd2hlbiBzaGlmdCB0byBpbnNlcnQtbW9kZS5cbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnNraXBOb3JtYWxpemF0aW9uKClcbiAgICB9XG5cbiAgICBjb25zdCBpbnNlcnRNb2RlRGlzcG9zYWJsZSA9IHRoaXMudmltU3RhdGUucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSgoe21vZGV9KSA9PiB7XG4gICAgICBpZiAobW9kZSAhPT0gJ2luc2VydCcpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpbnNlcnRNb2RlRGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgIHRoaXMuZGlzcG9zZVJlcGxhY2VNb2RlKClcblxuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldCgnXicsIHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpIC8vIExhc3QgaW5zZXJ0LW1vZGUgcG9zaXRpb25cbiAgICAgIGxldCB0ZXh0QnlVc2VySW5wdXQgPSAnJ1xuICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5nZXRDaGFuZ2VTaW5jZUNoZWNrcG9pbnQoJ2luc2VydCcpXG4gICAgICBpZiAoY2hhbmdlKSB7XG4gICAgICAgIHRoaXMubGFzdENoYW5nZSA9IGNoYW5nZVxuICAgICAgICB0aGlzLnNldE1hcmtGb3JDaGFuZ2UobmV3IFJhbmdlKGNoYW5nZS5zdGFydCwgY2hhbmdlLnN0YXJ0LnRyYXZlcnNlKGNoYW5nZS5uZXdFeHRlbnQpKSlcbiAgICAgICAgdGV4dEJ5VXNlcklucHV0ID0gY2hhbmdlLm5ld1RleHRcbiAgICAgIH1cbiAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KCcuJywge3RleHQ6IHRleHRCeVVzZXJJbnB1dH0pIC8vIExhc3QgaW5zZXJ0ZWQgdGV4dFxuXG4gICAgICB3aGlsZSAoaW5zZXJ0aW9uQ291bnQpIHtcbiAgICAgICAgaW5zZXJ0aW9uQ291bnQtLVxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0QnlPcGVyYXRvciArIHRleHRCeVVzZXJJbnB1dCwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgY3Vyc29yIHN0YXRlIGlzIHJlc3RvcmVkIG9uIHVuZG8uXG4gICAgICAvLyBTbyBjdXJzb3Igc3RhdGUgaGFzIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIG5leHQgZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KClcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZygnY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUnKSkgdGhpcy52aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuXG4gICAgICAvLyBncm91cGluZyBjaGFuZ2VzIGZvciB1bmRvIGNoZWNrcG9pbnQgbmVlZCB0byBjb21lIGxhc3RcbiAgICAgIHRoaXMuZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KCd1bmRvJylcblxuICAgICAgY29uc3QgcHJldmVudEluY29ycmVjdFdyYXAgPSB0aGlzLmVkaXRvci5oYXNBdG9taWNTb2Z0VGFicygpXG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yTGVmdChjdXJzb3IsIHtwcmV2ZW50SW5jb3JyZWN0V3JhcH0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBBY3RpdmF0ZUluc2VydE1vZGUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgdGFyZ2V0ID0gJ0VtcHR5J1xuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5cbmNsYXNzIEFjdGl2YXRlUmVwbGFjZU1vZGUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBpbml0aWFsaXplICgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKClcblxuICAgIGNvbnN0IHJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbiA9IG5ldyBXZWFrTWFwKClcbiAgICB0aGlzLnZpbVN0YXRlLnJlcGxhY2VNb2RlRGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgdGhpcy5lZGl0b3Iub25XaWxsSW5zZXJ0VGV4dCgoe3RleHQgPSAnJywgY2FuY2VsfSkgPT4ge1xuICAgICAgICBjYW5jZWwoKVxuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGNoYXIgb2YgdGV4dC5zcGxpdCgnJykpIHtcbiAgICAgICAgICAgIGlmIChjaGFyICE9PSAnXFxuJyAmJiAhc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgICAgICAgICBpZiAoIXJlcGxhY2VkQ2hhcnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKSkgcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIFtdKVxuICAgICAgICAgICAgcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pLnB1c2goc2VsZWN0aW9uLmdldFRleHQoKSlcbiAgICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGNoYXIpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KSxcblxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lZGl0b3JFbGVtZW50LCAnY29yZTpiYWNrc3BhY2UnLCBldmVudCA9PiB7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGNvbnN0IGNoYXJzID0gcmVwbGFjZWRDaGFyc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICAgICAgaWYgKGNoYXJzICYmIGNoYXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdExlZnQoKVxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFycy5wb3AoKSkuaXNFbXB0eSgpKSBzZWxlY3Rpb24uY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKVxuICB9XG5cbiAgcmVwZWF0SW5zZXJ0IChzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBmb3IgKGNvbnN0IGNoYXIgb2YgdGV4dCkge1xuICAgICAgaWYgKGNoYXIgPT09ICdcXG4nKSBjb250aW51ZVxuICAgICAgaWYgKHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpKSBicmVha1xuICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICB9XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IGZhbHNlfSlcbiAgfVxufVxuXG5jbGFzcyBJbnNlcnRBZnRlciBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG4vLyBrZXk6ICdnIEknIGluIGFsbCBtb2RlXG5jbGFzcyBJbnNlcnRBdEJlZ2lubmluZ09mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICd2aXN1YWwnICYmIHRoaXMuc3VibW9kZSAhPT0gJ2Jsb2Nrd2lzZScpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnNwbGl0U2VsZWN0aW9uc0ludG9MaW5lcygpXG4gICAgfVxuICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICBibG9ja3dpc2VTZWxlY3Rpb24uc2tpcE5vcm1hbGl6YXRpb24oKVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbi8vIGtleTogbm9ybWFsICdBJ1xuY2xhc3MgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLmVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbi8vIGtleTogbm9ybWFsICdJJ1xuY2xhc3MgSW5zZXJ0QXRGaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZSB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5jbGFzcyBJbnNlcnRBdExhc3RJbnNlcnQgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGUge1xuICBleGVjdXRlICgpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQoJ14nKVxuICAgIGlmIChwb2ludCkge1xuICAgICAgdGhpcy5lZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5jbGFzcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIGV4dGVuZHMgQWN0aXZhdGVJbnNlcnRNb2RlIHtcbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgdGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICAvLyBUaGlzIGlzIGZvciBgb2AgYW5kIGBPYCBvcGVyYXRvci5cbiAgLy8gT24gdW5kby9yZWRvIHB1dCBjdXJzb3IgYXQgb3JpZ2luYWwgcG9pbnQgd2hlcmUgdXNlciB0eXBlIGBvYCBvciBgT2AuXG4gIGdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludCAocHVycG9zZSkge1xuICAgIGlmICh0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBzdXBlci5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxhc3RDdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5vcmlnaW5hbEN1cnNvclBvc2l0aW9uTWFya2VyLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpKVxuICAgIHRoaXMub3JpZ2luYWxDdXJzb3JQb3NpdGlvbk1hcmtlci5kZXN0cm95KClcbiAgICB0aGlzLm9yaWdpbmFsQ3Vyc29yUG9zaXRpb25NYXJrZXIgPSBudWxsXG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoJ2dyb3VwQ2hhbmdlc1doZW5MZWF2aW5nSW5zZXJ0TW9kZScpKSB7XG4gICAgICBzdXBlci5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSlcbiAgICB9XG4gICAgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcbiAgfVxuXG4gIGF1dG9JbmRlbnRFbXB0eVJvd3MgKCkge1xuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgY29uc3Qgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICBpZiAodGhpcy5pc0VtcHR5Um93KHJvdykpIHRoaXMuZWRpdG9yLmF1dG9JbmRlbnRCdWZmZXJSb3cocm93KVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVRleHQgKCkge1xuICAgIHRoaXMuZWRpdG9yLmluc2VydE5ld2xpbmVBYm92ZSgpXG4gICAgaWYgKHRoaXMuZWRpdG9yLmF1dG9JbmRlbnQpIHRoaXMuYXV0b0luZGVudEVtcHR5Um93cygpXG4gIH1cblxuICByZXBlYXRJbnNlcnQgKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQudHJpbUxlZnQoKSwge2F1dG9JbmRlbnQ6IHRydWV9KVxuICB9XG59XG5cbmNsYXNzIEluc2VydEJlbG93V2l0aE5ld2xpbmUgZXh0ZW5kcyBJbnNlcnRBYm92ZVdpdGhOZXdsaW5lIHtcbiAgbXV0YXRlVGV4dCAoKSB7XG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKVxuICAgIH1cblxuICAgIHRoaXMuZWRpdG9yLmluc2VydE5ld2xpbmVCZWxvdygpXG4gICAgaWYgKHRoaXMuZWRpdG9yLmF1dG9JbmRlbnQpIHRoaXMuYXV0b0luZGVudEVtcHR5Um93cygpXG4gIH1cbn1cblxuLy8gQWR2YW5jZWQgSW5zZXJ0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbnNlcnRCeVRhcmdldCBleHRlbmRzIEFjdGl2YXRlSW5zZXJ0TW9kZUJhc2Uge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdoaWNoID0gbnVsbCAvLyBvbmUgb2YgWydzdGFydCcsICdlbmQnLCAnaGVhZCcsICd0YWlsJ11cblxuICBpbml0aWFsaXplICgpIHtcbiAgICAvLyBIQUNLXG4gICAgLy8gV2hlbiBnIGkgaXMgbWFwcGVkIHRvIGBpbnNlcnQtYXQtc3RhcnQtb2YtdGFyZ2V0YC5cbiAgICAvLyBgZyBpIDMgbGAgc3RhcnQgaW5zZXJ0IGF0IDMgY29sdW1uIHJpZ2h0IHBvc2l0aW9uLlxuICAgIC8vIEluIHRoaXMgY2FzZSwgd2UgZG9uJ3Qgd2FudCByZXBlYXQgaW5zZXJ0aW9uIDMgdGltZXMuXG4gICAgLy8gVGhpcyBAZ2V0Q291bnQoKSBjYWxsIGNhY2hlIG51bWJlciBhdCB0aGUgdGltaW5nIEJFRk9SRSAnMycgaXMgc3BlY2lmaWVkLlxuICAgIHRoaXMuZ2V0Q291bnQoKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICAvLyBJbiB2Qy92TCwgd2hlbiBvY2N1cnJlbmNlIG1hcmtlciB3YXMgTk9UIHNlbGVjdGVkLFxuICAgICAgLy8gaXQgYmVoYXZlJ3MgdmVyeSBzcGVjaWFsbHlcbiAgICAgIC8vIHZDOiBgSWAgYW5kIGBBYCBiZWhhdmVzIGFzIHNob2Z0IGhhbmQgb2YgYGN0cmwtdiBJYCBhbmQgYGN0cmwtdiBBYC5cbiAgICAgIC8vIHZMOiBgSWAgYW5kIGBBYCBwbGFjZSBjdXJzb3JzIGF0IGVhY2ggc2VsZWN0ZWQgbGluZXMgb2Ygc3RhcnQoIG9yIGVuZCApIG9mIG5vbi13aGl0ZS1zcGFjZSBjaGFyLlxuICAgICAgaWYgKCF0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLm1vZGUgPT09ICd2aXN1YWwnICYmIHRoaXMuc3VibW9kZSAhPT0gJ2Jsb2Nrd2lzZScpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2Jsb2Nrd2lzZScpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdWJtb2RlID09PSAnbGluZXdpc2UnKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHBhbmRNZW1iZXJTZWxlY3Rpb25zT3ZlckxpbmVXaXRoVHJpbVJhbmdlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgJHNlbGVjdGlvbi5zZXRCdWZmZXJQb3NpdGlvblRvKHRoaXMud2hpY2gpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG4vLyBrZXk6ICdJJywgVXNlZCBpbiAndmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZScsIHZpc3VhbC1tb2RlLmJsb2Nrd2lzZVxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mVGFyZ2V0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9ICdzdGFydCdcbn1cblxuLy8ga2V5OiAnQScsIFVzZWQgaW4gJ3Zpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2UnLCAndmlzdWFsLW1vZGUuYmxvY2t3aXNlJ1xuY2xhc3MgSW5zZXJ0QXRFbmRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSAnZW5kJ1xufVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZlRhcmdldCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSAnaGVhZCdcbn1cblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0U3RhcnRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbmNsYXNzIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZlRhcmdldCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbmNsYXNzIEluc2VydEF0SGVhZE9mT2NjdXJyZW5jZSBleHRlbmRzIEluc2VydEF0SGVhZE9mVGFyZ2V0IHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBJbnNlcnRBdFN0YXJ0T2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSAnc3Vid29yZCdcbn1cblxuY2xhc3MgSW5zZXJ0QXRFbmRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRFbmRPZk9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9ICdzdWJ3b3JkJ1xufVxuXG5jbGFzcyBJbnNlcnRBdEhlYWRPZlN1YndvcmRPY2N1cnJlbmNlIGV4dGVuZHMgSW5zZXJ0QXRIZWFkT2ZPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSAnc3Vid29yZCdcbn1cblxuY2xhc3MgSW5zZXJ0QXRTdGFydE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9ICdzdGFydCdcbiAgdGFyZ2V0ID0gJ01vdmVUb1ByZXZpb3VzU21hcnRXb3JkJ1xufVxuXG5jbGFzcyBJbnNlcnRBdEVuZE9mU21hcnRXb3JkIGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9ICdlbmQnXG4gIHRhcmdldCA9ICdNb3ZlVG9FbmRPZlNtYXJ0V29yZCdcbn1cblxuY2xhc3MgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIEluc2VydEJ5VGFyZ2V0IHtcbiAgd2hpY2ggPSAnc3RhcnQnXG4gIHRhcmdldCA9ICdNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCdcbn1cblxuY2xhc3MgSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgSW5zZXJ0QnlUYXJnZXQge1xuICB3aGljaCA9ICdlbmQnXG4gIHRhcmdldCA9ICdNb3ZlVG9OZXh0Rm9sZFN0YXJ0J1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDaGFuZ2UgZXh0ZW5kcyBBY3RpdmF0ZUluc2VydE1vZGVCYXNlIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN1cHBvcnRJbnNlcnRpb25Db3VudCA9IGZhbHNlXG5cbiAgbXV0YXRlVGV4dCAoKSB7XG4gICAgLy8gQWxsd2F5cyBkeW5hbWljYWxseSBkZXRlcm1pbmUgc2VsZWN0aW9uIHdpc2Ugd3Rob3V0IGNvbnN1bHRpbmcgdGFyZ2V0Lndpc2VcbiAgICAvLyBSZWFzb246IHdoZW4gYGMgaSB7YCwgd2lzZSBpcyAnY2hhcmFjdGVyd2lzZScsIGJ1dCBhY3R1YWxseSBzZWxlY3RlZCByYW5nZSBpcyAnbGluZXdpc2UnXG4gICAgLy8gICB7XG4gICAgLy8gICAgIGFcbiAgICAvLyAgIH1cbiAgICBjb25zdCBpc0xpbmV3aXNlVGFyZ2V0ID0gdGhpcy5zd3JhcC5kZXRlY3RXaXNlKHRoaXMuZWRpdG9yKSA9PT0gJ2xpbmV3aXNlJ1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgaWYgKCF0aGlzLmdldENvbmZpZygnZG9udFVwZGF0ZVJlZ2lzdGVyT25DaGFuZ2VPclN1YnN0aXR1dGUnKSkge1xuICAgICAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgIH1cbiAgICAgIGlmIChpc0xpbmV3aXNlVGFyZ2V0KSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KCdcXG4nLCB7YXV0b0luZGVudDogdHJ1ZX0pXG4gICAgICAgIC8vIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXCIsIHthdXRvSW5kZW50OiB0cnVlfSlcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCgnJywge2F1dG9JbmRlbnQ6IHRydWV9KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDaGFuZ2VPY2N1cnJlbmNlIGV4dGVuZHMgQ2hhbmdlIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblxuY2xhc3MgQ2hhbmdlU3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBDaGFuZ2VPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSAnc3Vid29yZCdcbn1cblxuY2xhc3MgU3Vic3RpdHV0ZSBleHRlbmRzIENoYW5nZSB7XG4gIHRhcmdldCA9ICdNb3ZlUmlnaHQnXG59XG5cbmNsYXNzIFN1YnN0aXR1dGVMaW5lIGV4dGVuZHMgQ2hhbmdlIHtcbiAgd2lzZSA9ICdsaW5ld2lzZScgLy8gW0ZJWE1FXSB0byByZS1vdmVycmlkZSB0YXJnZXQud2lzZSBpbiB2aXN1YWwtbW9kZVxuICB0YXJnZXQgPSAnTW92ZVRvUmVsYXRpdmVMaW5lJ1xufVxuXG4vLyBhbGlhc1xuY2xhc3MgQ2hhbmdlTGluZSBleHRlbmRzIFN1YnN0aXR1dGVMaW5lIHt9XG5cbmNsYXNzIENoYW5nZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIENoYW5nZSB7XG4gIHRhcmdldCA9ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudGFyZ2V0Lndpc2UgPT09ICdibG9ja3dpc2UnKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLmV4dGVuZE1lbWJlclNlbGVjdGlvbnNUb0VuZE9mTGluZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBY3RpdmF0ZUluc2VydE1vZGVCYXNlLFxuICBBY3RpdmF0ZUluc2VydE1vZGUsXG4gIEFjdGl2YXRlUmVwbGFjZU1vZGUsXG4gIEluc2VydEFmdGVyLFxuICBJbnNlcnRBdEJlZ2lubmluZ09mTGluZSxcbiAgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUsXG4gIEluc2VydEF0Rmlyc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIEluc2VydEF0TGFzdEluc2VydCxcbiAgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSxcbiAgSW5zZXJ0QmVsb3dXaXRoTmV3bGluZSxcbiAgSW5zZXJ0QnlUYXJnZXQsXG4gIEluc2VydEF0U3RhcnRPZlRhcmdldCxcbiAgSW5zZXJ0QXRFbmRPZlRhcmdldCxcbiAgSW5zZXJ0QXRIZWFkT2ZUYXJnZXQsXG4gIEluc2VydEF0U3RhcnRPZk9jY3VycmVuY2UsXG4gIEluc2VydEF0RW5kT2ZPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEhlYWRPZk9jY3VycmVuY2UsXG4gIEluc2VydEF0U3RhcnRPZlN1YndvcmRPY2N1cnJlbmNlLFxuICBJbnNlcnRBdEVuZE9mU3Vid29yZE9jY3VycmVuY2UsXG4gIEluc2VydEF0SGVhZE9mU3Vid29yZE9jY3VycmVuY2UsXG4gIEluc2VydEF0U3RhcnRPZlNtYXJ0V29yZCxcbiAgSW5zZXJ0QXRFbmRPZlNtYXJ0V29yZCxcbiAgSW5zZXJ0QXRQcmV2aW91c0ZvbGRTdGFydCxcbiAgSW5zZXJ0QXROZXh0Rm9sZFN0YXJ0LFxuICBDaGFuZ2UsXG4gIENoYW5nZU9jY3VycmVuY2UsXG4gIENoYW5nZVN1YndvcmRPY2N1cnJlbmNlLFxuICBTdWJzdGl0dXRlLFxuICBTdWJzdGl0dXRlTGluZSxcbiAgQ2hhbmdlTGluZSxcbiAgQ2hhbmdlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lXG59XG4iXX0=