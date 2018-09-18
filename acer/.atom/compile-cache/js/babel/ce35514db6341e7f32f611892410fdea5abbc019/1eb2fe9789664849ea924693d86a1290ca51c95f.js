'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Point = _require.Point;
var Range = _require.Range;

var Base = require('./base');

var Motion = (function (_Base) {
  _inherits(Motion, _Base);

  function Motion() {
    _classCallCheck(this, Motion);

    _get(Object.getPrototypeOf(Motion.prototype), 'constructor', this).apply(this, arguments);

    this.operator = null;
    this.inclusive = false;
    this.wise = 'characterwise';
    this.jump = false;
    this.verticalMotion = false;
    this.moveSucceeded = null;
    this.moveSuccessOnLinewise = false;
    this.selectSucceeded = false;
    this.requireInput = false;
    this.caseSensitivityKind = null;
  }

  // Used as operator's target in visual-mode.

  _createClass(Motion, [{
    key: 'isReady',
    value: function isReady() {
      return !this.requireInput || this.input != null;
    }
  }, {
    key: 'isLinewise',
    value: function isLinewise() {
      return this.wise === 'linewise';
    }
  }, {
    key: 'isBlockwise',
    value: function isBlockwise() {
      return this.wise === 'blockwise';
    }
  }, {
    key: 'forceWise',
    value: function forceWise(wise) {
      if (wise === 'characterwise') {
        this.inclusive = this.wise === 'linewise' ? false : !this.inclusive;
      }
      this.wise = wise;
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      this.selectSucceeded = false;
    }
  }, {
    key: 'moveWithSaveJump',
    value: function moveWithSaveJump(cursor) {
      var originalPosition = this.jump && cursor.isLastCursor() ? cursor.getBufferPosition() : undefined;

      this.moveCursor(cursor);

      if (originalPosition && !cursor.getBufferPosition().isEqual(originalPosition)) {
        this.vimState.mark.set('`', originalPosition);
        this.vimState.mark.set("'", originalPosition);
      }
    }
  }, {
    key: 'execute',
    value: function execute() {
      if (this.operator) {
        this.select();
      } else {
        for (var cursor of this.editor.getCursors()) {
          this.moveWithSaveJump(cursor);
        }
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
    }

    // NOTE: selection is already "normalized" before this function is called.
  }, {
    key: 'select',
    value: function select() {
      var _this = this;

      // need to care was visual for `.` repeated.
      var isOrWasVisual = this.operator['instanceof']('SelectBase') || this.name === 'CurrentSelection';

      var _loop = function (selection) {
        selection.modifySelection(function () {
          return _this.moveWithSaveJump(selection.cursor);
        });

        var selectSucceeded = _this.moveSucceeded != null ? _this.moveSucceeded : !selection.isEmpty() || _this.isLinewise() && _this.moveSuccessOnLinewise;
        if (!_this.selectSucceeded) _this.selectSucceeded = selectSucceeded;

        if (isOrWasVisual || selectSucceeded && (_this.inclusive || _this.isLinewise())) {
          var $selection = _this.swrap(selection);
          $selection.saveProperties(true); // save property of "already-normalized-selection"
          $selection.applyWise(_this.wise);
        }
      };

      for (var selection of this.editor.getSelections()) {
        _loop(selection);
      }

      if (this.wise === 'blockwise') {
        this.vimState.getLastBlockwiseSelection().autoscroll();
      }
    }
  }, {
    key: 'setCursorBufferRow',
    value: function setCursorBufferRow(cursor, row, options) {
      if (this.verticalMotion && !this.getConfig('stayOnVerticalMotion')) {
        cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row), options);
      } else {
        this.utils.setBufferRow(cursor, row, options);
      }
    }

    // Call callback count times.
    // But break iteration when cursor position did not change before/after callback.
  }, {
    key: 'moveCursorCountTimes',
    value: function moveCursorCountTimes(cursor, fn) {
      var oldPosition = cursor.getBufferPosition();
      this.countTimes(this.getCount(), function (state) {
        fn(state);
        var newPosition = cursor.getBufferPosition();
        if (newPosition.isEqual(oldPosition)) state.stop();
        oldPosition = newPosition;
      });
    }
  }, {
    key: 'isCaseSensitive',
    value: function isCaseSensitive(term) {
      if (this.getConfig('useSmartcaseFor' + this.caseSensitivityKind)) {
        return term.search(/[A-Z]/) !== -1;
      } else {
        return !this.getConfig('ignoreCaseFor' + this.caseSensitivityKind);
      }
    }
  }, {
    key: 'getLastResortPoint',
    value: function getLastResortPoint(direction) {
      if (direction === 'next') {
        return this.getVimEofBufferPosition();
      } else {
        return new Point(0, 0);
      }
    }
  }], [{
    key: 'operationKind',
    value: 'motion',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Motion;
})(Base);

var CurrentSelection = (function (_Motion) {
  _inherits(CurrentSelection, _Motion);

  function CurrentSelection() {
    _classCallCheck(this, CurrentSelection);

    _get(Object.getPrototypeOf(CurrentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.selectionExtent = null;
    this.blockwiseSelectionExtent = null;
    this.inclusive = true;
    this.pointInfoByCursor = new Map();
  }

  _createClass(CurrentSelection, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      if (this.mode === 'visual') {
        this.selectionExtent = this.isBlockwise() ? this.swrap(cursor.selection).getBlockwiseSelectionExtent() : this.editor.getSelectedBufferRange().getExtent();
      } else {
        // `.` repeat case
        cursor.setBufferPosition(cursor.getBufferPosition().translate(this.selectionExtent));
      }
    }
  }, {
    key: 'select',
    value: function select() {
      var _this2 = this;

      if (this.mode === 'visual') {
        _get(Object.getPrototypeOf(CurrentSelection.prototype), 'select', this).call(this);
      } else {
        for (var cursor of this.editor.getCursors()) {
          var pointInfo = this.pointInfoByCursor.get(cursor);
          if (pointInfo) {
            var cursorPosition = pointInfo.cursorPosition;
            var startOfSelection = pointInfo.startOfSelection;

            if (cursorPosition.isEqual(cursor.getBufferPosition())) {
              cursor.setBufferPosition(startOfSelection);
            }
          }
        }
        _get(Object.getPrototypeOf(CurrentSelection.prototype), 'select', this).call(this);
      }

      // * Purpose of pointInfoByCursor? see #235 for detail.
      // When stayOnTransformString is enabled, cursor pos is not set on start of
      // of selected range.
      // But I want following behavior, so need to preserve position info.
      //  1. `vj>.` -> indent same two rows regardless of current cursor's row.
      //  2. `vj>j.` -> indent two rows from cursor's row.

      var _loop2 = function (cursor) {
        var startOfSelection = cursor.selection.getBufferRange().start;
        _this2.onDidFinishOperation(function () {
          var cursorPosition = cursor.getBufferPosition();
          _this2.pointInfoByCursor.set(cursor, { startOfSelection: startOfSelection, cursorPosition: cursorPosition });
        });
      };

      for (var cursor of this.editor.getCursors()) {
        _loop2(cursor);
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return CurrentSelection;
})(Motion);

var MoveLeft = (function (_Motion2) {
  _inherits(MoveLeft, _Motion2);

  function MoveLeft() {
    _classCallCheck(this, MoveLeft);

    _get(Object.getPrototypeOf(MoveLeft.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveLeft, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this3 = this;

      var allowWrap = this.getConfig('wrapLeftRightMotion');
      this.moveCursorCountTimes(cursor, function () {
        _this3.utils.moveCursorLeft(cursor, { allowWrap: allowWrap });
      });
    }
  }]);

  return MoveLeft;
})(Motion);

var MoveRight = (function (_Motion3) {
  _inherits(MoveRight, _Motion3);

  function MoveRight() {
    _classCallCheck(this, MoveRight);

    _get(Object.getPrototypeOf(MoveRight.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveRight, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this4 = this;

      var allowWrap = this.getConfig('wrapLeftRightMotion');

      this.moveCursorCountTimes(cursor, function () {
        _this4.editor.unfoldBufferRow(cursor.getBufferRow());

        // - When `wrapLeftRightMotion` enabled and executed as pure-motion in `normal-mode`,
        //   we need to move **again** to wrap to next-line if it rached to EOL.
        // - Expression `!this.operator` means normal-mode motion.
        // - Expression `this.mode === "normal"` is not appropreate since it matches `x` operator's target case.
        var needMoveAgain = allowWrap && !_this4.operator && !cursor.isAtEndOfLine();

        _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });

        if (needMoveAgain && cursor.isAtEndOfLine()) {
          _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });
        }
      });
    }
  }]);

  return MoveRight;
})(Motion);

var MoveRightBufferColumn = (function (_Motion4) {
  _inherits(MoveRightBufferColumn, _Motion4);

  function MoveRightBufferColumn() {
    _classCallCheck(this, MoveRightBufferColumn);

    _get(Object.getPrototypeOf(MoveRightBufferColumn.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveRightBufferColumn, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, cursor.getBufferColumn() + this.getCount());
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveRightBufferColumn;
})(Motion);

var MoveUp = (function (_Motion5) {
  _inherits(MoveUp, _Motion5);

  function MoveUp() {
    _classCallCheck(this, MoveUp);

    _get(Object.getPrototypeOf(MoveUp.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.wrap = false;
    this.direction = 'up';
  }

  _createClass(MoveUp, [{
    key: 'getBufferRow',
    value: function getBufferRow(row) {
      var min = 0;
      var max = this.getVimLastBufferRow();

      if (this.direction === 'up') {
        row = this.getFoldStartRowForRow(row) - 1;
        row = this.wrap && row < min ? max : this.limitNumber(row, { min: min });
      } else {
        row = this.getFoldEndRowForRow(row) + 1;
        row = this.wrap && row > max ? min : this.limitNumber(row, { max: max });
      }
      return this.getFoldStartRowForRow(row);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this5 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this5.getBufferRow(cursor.getBufferRow());
        _this5.utils.setBufferRow(cursor, row);
      });
    }
  }]);

  return MoveUp;
})(Motion);

var MoveUpWrap = (function (_MoveUp) {
  _inherits(MoveUpWrap, _MoveUp);

  function MoveUpWrap() {
    _classCallCheck(this, MoveUpWrap);

    _get(Object.getPrototypeOf(MoveUpWrap.prototype), 'constructor', this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveUpWrap;
})(MoveUp);

var MoveDown = (function (_MoveUp2) {
  _inherits(MoveDown, _MoveUp2);

  function MoveDown() {
    _classCallCheck(this, MoveDown);

    _get(Object.getPrototypeOf(MoveDown.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'down';
  }

  return MoveDown;
})(MoveUp);

var MoveDownWrap = (function (_MoveDown) {
  _inherits(MoveDownWrap, _MoveDown);

  function MoveDownWrap() {
    _classCallCheck(this, MoveDownWrap);

    _get(Object.getPrototypeOf(MoveDownWrap.prototype), 'constructor', this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveDownWrap;
})(MoveDown);

var MoveUpScreen = (function (_Motion6) {
  _inherits(MoveUpScreen, _Motion6);

  function MoveUpScreen() {
    _classCallCheck(this, MoveUpScreen);

    _get(Object.getPrototypeOf(MoveUpScreen.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.direction = 'up';
  }

  _createClass(MoveUpScreen, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this6 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this6.utils.moveCursorUpScreen(cursor);
      });
    }
  }]);

  return MoveUpScreen;
})(Motion);

var MoveDownScreen = (function (_MoveUpScreen) {
  _inherits(MoveDownScreen, _MoveUpScreen);

  function MoveDownScreen() {
    _classCallCheck(this, MoveDownScreen);

    _get(Object.getPrototypeOf(MoveDownScreen.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.direction = 'down';
  }

  _createClass(MoveDownScreen, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this7 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this7.utils.moveCursorDownScreen(cursor);
      });
    }
  }]);

  return MoveDownScreen;
})(MoveUpScreen);

var MoveUpToEdge = (function (_Motion7) {
  _inherits(MoveUpToEdge, _Motion7);

  function MoveUpToEdge() {
    _classCallCheck(this, MoveUpToEdge);

    _get(Object.getPrototypeOf(MoveUpToEdge.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.jump = true;
    this.direction = 'previous';
  }

  _createClass(MoveUpToEdge, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this8 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this8.getPoint(cursor.getScreenPosition());
        if (point) cursor.setScreenPosition(point);
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(fromPoint) {
      var column = fromPoint.column;
      var startRow = fromPoint.row;

      for (var row of this.getScreenRows({ startRow: startRow, direction: this.direction })) {
        var point = new Point(row, column);
        if (this.isEdge(point)) return point;
      }
    }
  }, {
    key: 'isEdge',
    value: function isEdge(point) {
      // If point is stoppable and above or below point is not stoppable, it's Edge!
      return this.isStoppable(point) && (!this.isStoppable(point.translate([-1, 0])) || !this.isStoppable(point.translate([+1, 0])));
    }
  }, {
    key: 'isStoppable',
    value: function isStoppable(point) {
      return this.isNonWhiteSpace(point) || this.isFirstRowOrLastRowAndStoppable(point) ||
      // If right or left column is non-white-space char, it's stoppable.
      this.isNonWhiteSpace(point.translate([0, -1])) && this.isNonWhiteSpace(point.translate([0, +1]));
    }
  }, {
    key: 'isNonWhiteSpace',
    value: function isNonWhiteSpace(point) {
      var char = this.utils.getTextInScreenRange(this.editor, Range.fromPointWithDelta(point, 0, 1));
      return char != null && /\S/.test(char);
    }
  }, {
    key: 'isFirstRowOrLastRowAndStoppable',
    value: function isFirstRowOrLastRowAndStoppable(point) {
      // In notmal-mode, cursor is NOT stoppable to EOL of non-blank row.
      // So explicitly guard to not answer it stoppable.
      if (this.mode === 'normal' && this.utils.pointIsAtEndOfLineAtNonEmptyRow(this.editor, point)) {
        return false;
      }

      // If clipped, it means that original ponit was non stoppable(e.g. point.colum > EOL).
      var row = point.row;

      return (row === 0 || row === this.getVimLastScreenRow()) && point.isEqual(this.editor.clipScreenPosition(point));
    }
  }]);

  return MoveUpToEdge;
})(Motion);

var MoveDownToEdge = (function (_MoveUpToEdge) {
  _inherits(MoveDownToEdge, _MoveUpToEdge);

  function MoveDownToEdge() {
    _classCallCheck(this, MoveDownToEdge);

    _get(Object.getPrototypeOf(MoveDownToEdge.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  // Word Motion family
  // +----------------------------------------------------------------------------+
  // | direction | which      | word  | WORD | subword | smartword | alphanumeric |
  // |-----------+------------+-------+------+---------+-----------+--------------+
  // | next      | word-start | w     | W    | -       | -         | -            |
  // | previous  | word-start | b     | b    | -       | -         | -            |
  // | next      | word-end   | e     | E    | -       | -         | -            |
  // | previous  | word-end   | ge    | g E  | n/a     | n/a       | n/a          |
  // +----------------------------------------------------------------------------+

  return MoveDownToEdge;
})(MoveUpToEdge);

var MotionByWord = (function (_Motion8) {
  _inherits(MotionByWord, _Motion8);

  function MotionByWord() {
    _classCallCheck(this, MotionByWord);

    _get(Object.getPrototypeOf(MotionByWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = null;
    this.skipBlankRow = false;
    this.skipWhiteSpaceOnlyRow = false;
  }

  // w

  _createClass(MotionByWord, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this9 = this;

      this.moveCursorCountTimes(cursor, function (countState) {
        cursor.setBufferPosition(_this9.getPoint(cursor, countState));
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(cursor, countState) {
      var direction = this.direction;
      var which = this.which;

      var regex = this.getWordRegexForCursor(cursor);

      var from = cursor.getBufferPosition();
      if (direction === 'next' && which === 'start' && this.operator && countState.isFinal) {
        // [NOTE] Exceptional behavior for w and W: [Detail in vim help `:help w`.]
        // [case-A] cw, cW treated as ce, cE when cursor is at non-blank.
        // [case-B] when w, W used as TARGET, it doesn't move over new line.
        if (this.isEmptyRow(from.row)) return [from.row + 1, 0];

        // [case-A]
        if (this.operator.name === 'Change' && !this.utils.pointIsAtWhiteSpace(this.editor, from)) {
          which = 'end';
        }
        var point = this.findPoint(direction, regex, which, this.buildOptions(from));
        // [case-B]
        return point ? Point.min(point, [from.row, Infinity]) : this.getLastResortPoint(direction);
      } else {
        return this.findPoint(direction, regex, which, this.buildOptions(from)) || this.getLastResortPoint(direction);
      }
    }
  }, {
    key: 'buildOptions',
    value: function buildOptions(from) {
      return {
        from: from,
        skipEmptyRow: this.skipEmptyRow,
        skipWhiteSpaceOnlyRow: this.skipWhiteSpaceOnlyRow,
        preTranslate: this.which === 'end' && [0, +1] || undefined,
        postTranslate: this.which === 'end' && [0, -1] || undefined
      };
    }
  }, {
    key: 'getWordRegexForCursor',
    value: function getWordRegexForCursor(cursor) {
      if (this.name.endsWith('Subword')) {
        return cursor.subwordRegExp();
      }

      if (this.wordRegex) {
        return this.wordRegex;
      }

      if (this.getConfig('useLanguageIndependentNonWordCharacters')) {
        var nonWordCharacters = this._.escapeRegExp(this.utils.getNonWordCharactersForCursor(cursor));
        var source = '^[\\t\\r ]*$|[^\\s' + nonWordCharacters + ']+|[' + nonWordCharacters + ']+';
        return new RegExp(source, 'g');
      }
      return cursor.wordRegExp();
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MotionByWord;
})(Motion);

var MoveToNextWord = (function (_MotionByWord) {
  _inherits(MoveToNextWord, _MotionByWord);

  function MoveToNextWord() {
    _classCallCheck(this, MoveToNextWord);

    _get(Object.getPrototypeOf(MoveToNextWord.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
    this.which = 'start';
  }

  // W
  return MoveToNextWord;
})(MotionByWord);

var MoveToNextWholeWord = (function (_MoveToNextWord) {
  _inherits(MoveToNextWholeWord, _MoveToNextWord);

  function MoveToNextWholeWord() {
    _classCallCheck(this, MoveToNextWholeWord);

    _get(Object.getPrototypeOf(MoveToNextWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  // no-keymap
  return MoveToNextWholeWord;
})(MoveToNextWord);

var MoveToNextSubword = (function (_MoveToNextWord2) {
  _inherits(MoveToNextSubword, _MoveToNextWord2);

  function MoveToNextSubword() {
    _classCallCheck(this, MoveToNextSubword);

    _get(Object.getPrototypeOf(MoveToNextSubword.prototype), 'constructor', this).apply(this, arguments);
  }

  // no-keymap
  return MoveToNextSubword;
})(MoveToNextWord);

var MoveToNextSmartWord = (function (_MoveToNextWord3) {
  _inherits(MoveToNextSmartWord, _MoveToNextWord3);

  function MoveToNextSmartWord() {
    _classCallCheck(this, MoveToNextSmartWord);

    _get(Object.getPrototypeOf(MoveToNextSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  // no-keymap
  return MoveToNextSmartWord;
})(MoveToNextWord);

var MoveToNextAlphanumericWord = (function (_MoveToNextWord4) {
  _inherits(MoveToNextAlphanumericWord, _MoveToNextWord4);

  function MoveToNextAlphanumericWord() {
    _classCallCheck(this, MoveToNextAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToNextAlphanumericWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  // b
  return MoveToNextAlphanumericWord;
})(MoveToNextWord);

var MoveToPreviousWord = (function (_MotionByWord2) {
  _inherits(MoveToPreviousWord, _MotionByWord2);

  function MoveToPreviousWord() {
    _classCallCheck(this, MoveToPreviousWord);

    _get(Object.getPrototypeOf(MoveToPreviousWord.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
    this.which = 'start';
    this.skipWhiteSpaceOnlyRow = true;
  }

  // B
  return MoveToPreviousWord;
})(MotionByWord);

var MoveToPreviousWholeWord = (function (_MoveToPreviousWord) {
  _inherits(MoveToPreviousWholeWord, _MoveToPreviousWord);

  function MoveToPreviousWholeWord() {
    _classCallCheck(this, MoveToPreviousWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  // no-keymap
  return MoveToPreviousWholeWord;
})(MoveToPreviousWord);

var MoveToPreviousSubword = (function (_MoveToPreviousWord2) {
  _inherits(MoveToPreviousSubword, _MoveToPreviousWord2);

  function MoveToPreviousSubword() {
    _classCallCheck(this, MoveToPreviousSubword);

    _get(Object.getPrototypeOf(MoveToPreviousSubword.prototype), 'constructor', this).apply(this, arguments);
  }

  // no-keymap
  return MoveToPreviousSubword;
})(MoveToPreviousWord);

var MoveToPreviousSmartWord = (function (_MoveToPreviousWord3) {
  _inherits(MoveToPreviousSmartWord, _MoveToPreviousWord3);

  function MoveToPreviousSmartWord() {
    _classCallCheck(this, MoveToPreviousSmartWord);

    _get(Object.getPrototypeOf(MoveToPreviousSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // no-keymap
  return MoveToPreviousSmartWord;
})(MoveToPreviousWord);

var MoveToPreviousAlphanumericWord = (function (_MoveToPreviousWord4) {
  _inherits(MoveToPreviousAlphanumericWord, _MoveToPreviousWord4);

  function MoveToPreviousAlphanumericWord() {
    _classCallCheck(this, MoveToPreviousAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToPreviousAlphanumericWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\w+/;
  }

  // e
  return MoveToPreviousAlphanumericWord;
})(MoveToPreviousWord);

var MoveToEndOfWord = (function (_MotionByWord3) {
  _inherits(MoveToEndOfWord, _MotionByWord3);

  function MoveToEndOfWord() {
    _classCallCheck(this, MoveToEndOfWord);

    _get(Object.getPrototypeOf(MoveToEndOfWord.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
    this.direction = 'next';
    this.which = 'end';
    this.skipEmptyRow = true;
    this.skipWhiteSpaceOnlyRow = true;
  }

  // E
  return MoveToEndOfWord;
})(MotionByWord);

var MoveToEndOfWholeWord = (function (_MoveToEndOfWord) {
  _inherits(MoveToEndOfWholeWord, _MoveToEndOfWord);

  function MoveToEndOfWholeWord() {
    _classCallCheck(this, MoveToEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToEndOfWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/g;
  }

  // no-keymap
  return MoveToEndOfWholeWord;
})(MoveToEndOfWord);

var MoveToEndOfSubword = (function (_MoveToEndOfWord2) {
  _inherits(MoveToEndOfSubword, _MoveToEndOfWord2);

  function MoveToEndOfSubword() {
    _classCallCheck(this, MoveToEndOfSubword);

    _get(Object.getPrototypeOf(MoveToEndOfSubword.prototype), 'constructor', this).apply(this, arguments);
  }

  // no-keymap
  return MoveToEndOfSubword;
})(MoveToEndOfWord);

var MoveToEndOfSmartWord = (function (_MoveToEndOfWord3) {
  _inherits(MoveToEndOfSmartWord, _MoveToEndOfWord3);

  function MoveToEndOfSmartWord() {
    _classCallCheck(this, MoveToEndOfSmartWord);

    _get(Object.getPrototypeOf(MoveToEndOfSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  // no-keymap
  return MoveToEndOfSmartWord;
})(MoveToEndOfWord);

var MoveToEndOfAlphanumericWord = (function (_MoveToEndOfWord4) {
  _inherits(MoveToEndOfAlphanumericWord, _MoveToEndOfWord4);

  function MoveToEndOfAlphanumericWord() {
    _classCallCheck(this, MoveToEndOfAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToEndOfAlphanumericWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  // ge
  return MoveToEndOfAlphanumericWord;
})(MoveToEndOfWord);

var MoveToPreviousEndOfWord = (function (_MotionByWord4) {
  _inherits(MoveToPreviousEndOfWord, _MotionByWord4);

  function MoveToPreviousEndOfWord() {
    _classCallCheck(this, MoveToPreviousEndOfWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWord.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
    this.direction = 'previous';
    this.which = 'end';
    this.skipWhiteSpaceOnlyRow = true;
  }

  // gE
  return MoveToPreviousEndOfWord;
})(MotionByWord);

var MoveToPreviousEndOfWholeWord = (function (_MoveToPreviousEndOfWord) {
  _inherits(MoveToPreviousEndOfWholeWord, _MoveToPreviousEndOfWord);

  function MoveToPreviousEndOfWholeWord() {
    _classCallCheck(this, MoveToPreviousEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/g;
  }

  // Sentence
  // -------------------------
  // Sentence is defined as below
  //  - end with ['.', '!', '?']
  //  - optionally followed by [')', ']', '"', "'"]
  //  - followed by ['$', ' ', '\t']
  //  - paragraph boundary is also sentence boundary
  //  - section boundary is also sentence boundary(ignore)
  return MoveToPreviousEndOfWholeWord;
})(MoveToPreviousEndOfWord);

var MoveToNextSentence = (function (_Motion9) {
  _inherits(MoveToNextSentence, _Motion9);

  function MoveToNextSentence() {
    _classCallCheck(this, MoveToNextSentence);

    _get(Object.getPrototypeOf(MoveToNextSentence.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.sentenceRegex = new RegExp('(?:[\\.!\\?][\\)\\]"\']*\\s+)|(\\n|\\r\\n)', 'g');
    this.direction = 'next';
  }

  _createClass(MoveToNextSentence, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this10 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this10.direction === 'next' ? _this10.getNextStartOfSentence(cursor.getBufferPosition()) : _this10.getPreviousStartOfSentence(cursor.getBufferPosition());
        cursor.setBufferPosition(point || _this10.getLastResortPoint(_this10.direction));
      });
    }
  }, {
    key: 'isBlankRow',
    value: function isBlankRow(row) {
      return this.editor.isBufferRowBlank(row);
    }
  }, {
    key: 'getNextStartOfSentence',
    value: function getNextStartOfSentence(from) {
      var _this11 = this;

      return this.findInEditor('forward', this.sentenceRegex, { from: from }, function (_ref) {
        var range = _ref.range;
        var match = _ref.match;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (_this11.skipBlankRow && _this11.isBlankRow(endRow)) return;
          if (_this11.isBlankRow(startRow) !== _this11.isBlankRow(endRow)) {
            return _this11.getFirstCharacterPositionForBufferRow(endRow);
          }
        } else {
          return range.end;
        }
      });
    }
  }, {
    key: 'getPreviousStartOfSentence',
    value: function getPreviousStartOfSentence(from) {
      var _this12 = this;

      return this.findInEditor('backward', this.sentenceRegex, { from: from }, function (_ref2) {
        var range = _ref2.range;
        var match = _ref2.match;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (!_this12.isBlankRow(endRow) && _this12.isBlankRow(startRow)) {
            var point = _this12.getFirstCharacterPositionForBufferRow(endRow);
            if (point.isLessThan(from)) return point;else if (!_this12.skipBlankRow) return _this12.getFirstCharacterPositionForBufferRow(startRow);
          }
        } else if (range.end.isLessThan(from)) {
          return range.end;
        }
      });
    }
  }]);

  return MoveToNextSentence;
})(Motion);

var MoveToPreviousSentence = (function (_MoveToNextSentence) {
  _inherits(MoveToPreviousSentence, _MoveToNextSentence);

  function MoveToPreviousSentence() {
    _classCallCheck(this, MoveToPreviousSentence);

    _get(Object.getPrototypeOf(MoveToPreviousSentence.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  return MoveToPreviousSentence;
})(MoveToNextSentence);

var MoveToNextSentenceSkipBlankRow = (function (_MoveToNextSentence2) {
  _inherits(MoveToNextSentenceSkipBlankRow, _MoveToNextSentence2);

  function MoveToNextSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToNextSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToNextSentenceSkipBlankRow.prototype), 'constructor', this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  return MoveToNextSentenceSkipBlankRow;
})(MoveToNextSentence);

var MoveToPreviousSentenceSkipBlankRow = (function (_MoveToPreviousSentence) {
  _inherits(MoveToPreviousSentenceSkipBlankRow, _MoveToPreviousSentence);

  function MoveToPreviousSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToPreviousSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToPreviousSentenceSkipBlankRow.prototype), 'constructor', this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  // Paragraph
  // -------------------------
  return MoveToPreviousSentenceSkipBlankRow;
})(MoveToPreviousSentence);

var MoveToNextParagraph = (function (_Motion10) {
  _inherits(MoveToNextParagraph, _Motion10);

  function MoveToNextParagraph() {
    _classCallCheck(this, MoveToNextParagraph);

    _get(Object.getPrototypeOf(MoveToNextParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.direction = 'next';
  }

  _createClass(MoveToNextParagraph, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this13 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this13.getPoint(cursor.getBufferPosition());
        cursor.setBufferPosition(point || _this13.getLastResortPoint(_this13.direction));
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(from) {
      var wasBlankRow = this.editor.isBufferRowBlank(from.row);
      var rows = this.getBufferRows({ startRow: from.row, direction: this.direction });
      for (var row of rows) {
        var isBlankRow = this.editor.isBufferRowBlank(row);
        if (!wasBlankRow && isBlankRow) {
          return [row, 0];
        }
        wasBlankRow = isBlankRow;
      }
    }
  }]);

  return MoveToNextParagraph;
})(Motion);

var MoveToPreviousParagraph = (function (_MoveToNextParagraph) {
  _inherits(MoveToPreviousParagraph, _MoveToNextParagraph);

  function MoveToPreviousParagraph() {
    _classCallCheck(this, MoveToPreviousParagraph);

    _get(Object.getPrototypeOf(MoveToPreviousParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  return MoveToPreviousParagraph;
})(MoveToNextParagraph);

var MoveToNextDiffHunk = (function (_Motion11) {
  _inherits(MoveToNextDiffHunk, _Motion11);

  function MoveToNextDiffHunk() {
    _classCallCheck(this, MoveToNextDiffHunk);

    _get(Object.getPrototypeOf(MoveToNextDiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.direction = 'next';
  }

  _createClass(MoveToNextDiffHunk, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this14 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = _this14.getPoint(cursor.getBufferPosition());
        if (point) cursor.setBufferPosition(point);
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(from) {
      var _this15 = this;

      var getHunkRange = function getHunkRange(row) {
        return _this15.utils.getHunkRangeAtBufferRow(_this15.editor, row);
      };
      var hunkRange = getHunkRange(from.row);
      return this.findInEditor(this.direction, /^[+-]/g, { from: from }, function (_ref3) {
        var range = _ref3.range;

        if (hunkRange && hunkRange.containsPoint(range.start)) return;

        return getHunkRange(range.start.row).start;
      });
    }
  }]);

  return MoveToNextDiffHunk;
})(Motion);

var MoveToPreviousDiffHunk = (function (_MoveToNextDiffHunk) {
  _inherits(MoveToPreviousDiffHunk, _MoveToNextDiffHunk);

  function MoveToPreviousDiffHunk() {
    _classCallCheck(this, MoveToPreviousDiffHunk);

    _get(Object.getPrototypeOf(MoveToPreviousDiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  // -------------------------
  // keymap: 0
  return MoveToPreviousDiffHunk;
})(MoveToNextDiffHunk);

var MoveToBeginningOfLine = (function (_Motion12) {
  _inherits(MoveToBeginningOfLine, _Motion12);

  function MoveToBeginningOfLine() {
    _classCallCheck(this, MoveToBeginningOfLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToBeginningOfLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, 0);
    }
  }]);

  return MoveToBeginningOfLine;
})(Motion);

var MoveToColumn = (function (_Motion13) {
  _inherits(MoveToColumn, _Motion13);

  function MoveToColumn() {
    _classCallCheck(this, MoveToColumn);

    _get(Object.getPrototypeOf(MoveToColumn.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToColumn, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, this.getCount() - 1);
    }
  }]);

  return MoveToColumn;
})(Motion);

var MoveToLastCharacterOfLine = (function (_Motion14) {
  _inherits(MoveToLastCharacterOfLine, _Motion14);

  function MoveToLastCharacterOfLine() {
    _classCallCheck(this, MoveToLastCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToLastCharacterOfLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var row = this.getValidVimBufferRow(cursor.getBufferRow() + this.getCount() - 1);
      cursor.setBufferPosition([row, Infinity]);
      cursor.goalColumn = Infinity;
    }
  }]);

  return MoveToLastCharacterOfLine;
})(Motion);

var MoveToLastNonblankCharacterOfLineAndDown = (function (_Motion15) {
  _inherits(MoveToLastNonblankCharacterOfLineAndDown, _Motion15);

  function MoveToLastNonblankCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToLastNonblankCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToLastNonblankCharacterOfLineAndDown.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
  }

  // MoveToFirstCharacterOfLine faimily
  // ------------------------------------
  // ^

  _createClass(MoveToLastNonblankCharacterOfLineAndDown, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var row = this.limitNumber(cursor.getBufferRow() + this.getCount() - 1, { max: this.getVimLastBufferRow() });
      var options = { from: [row, Infinity], allowNextLine: false };
      var point = this.findInEditor('backward', /\S|^/, options, function (event) {
        return event.range.start;
      });
      cursor.setBufferPosition(point);
    }
  }]);

  return MoveToLastNonblankCharacterOfLineAndDown;
})(Motion);

var MoveToFirstCharacterOfLine = (function (_Motion16) {
  _inherits(MoveToFirstCharacterOfLine, _Motion16);

  function MoveToFirstCharacterOfLine() {
    _classCallCheck(this, MoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(cursor.getBufferRow()));
    }
  }]);

  return MoveToFirstCharacterOfLine;
})(Motion);

var MoveToFirstCharacterOfLineUp = (function (_MoveToFirstCharacterOfLine) {
  _inherits(MoveToFirstCharacterOfLineUp, _MoveToFirstCharacterOfLine);

  function MoveToFirstCharacterOfLineUp() {
    _classCallCheck(this, MoveToFirstCharacterOfLineUp);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(MoveToFirstCharacterOfLineUp, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this16 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this16.getValidVimBufferRow(cursor.getBufferRow() - 1);
        cursor.setBufferPosition([row, 0]);
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), 'moveCursor', this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineUp;
})(MoveToFirstCharacterOfLine);

var MoveToFirstCharacterOfLineDown = (function (_MoveToFirstCharacterOfLine2) {
  _inherits(MoveToFirstCharacterOfLineDown, _MoveToFirstCharacterOfLine2);

  function MoveToFirstCharacterOfLineDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(MoveToFirstCharacterOfLineDown, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this17 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row < _this17.getVimLastBufferRow()) {
          cursor.setBufferPosition(point.translate([+1, 0]));
        }
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), 'moveCursor', this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineDown;
})(MoveToFirstCharacterOfLine);

var MoveToFirstCharacterOfLineAndDown = (function (_MoveToFirstCharacterOfLineDown) {
  _inherits(MoveToFirstCharacterOfLineAndDown, _MoveToFirstCharacterOfLineDown);

  function MoveToFirstCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLineAndDown, [{
    key: 'getCount',
    value: function getCount() {
      return _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), 'getCount', this).call(this) - 1;
    }
  }]);

  return MoveToFirstCharacterOfLineAndDown;
})(MoveToFirstCharacterOfLineDown);

var MoveToScreenColumn = (function (_Motion17) {
  _inherits(MoveToScreenColumn, _Motion17);

  function MoveToScreenColumn() {
    _classCallCheck(this, MoveToScreenColumn);

    _get(Object.getPrototypeOf(MoveToScreenColumn.prototype), 'constructor', this).apply(this, arguments);
  }

  // keymap: g 0

  _createClass(MoveToScreenColumn, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.utils.getScreenPositionForScreenRow(this.editor, cursor.getScreenRow(), this.which, {
        allowOffScreenPosition: this.getConfig('allowMoveToOffScreenColumnOnScreenLineMotion')
      });
      if (point) cursor.setScreenPosition(point);
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveToScreenColumn;
})(Motion);

var MoveToBeginningOfScreenLine = (function (_MoveToScreenColumn) {
  _inherits(MoveToBeginningOfScreenLine, _MoveToScreenColumn);

  function MoveToBeginningOfScreenLine() {
    _classCallCheck(this, MoveToBeginningOfScreenLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfScreenLine.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'beginning';
  }

  // g ^: `move-to-first-character-of-screen-line`
  return MoveToBeginningOfScreenLine;
})(MoveToScreenColumn);

var MoveToFirstCharacterOfScreenLine = (function (_MoveToScreenColumn2) {
  _inherits(MoveToFirstCharacterOfScreenLine, _MoveToScreenColumn2);

  function MoveToFirstCharacterOfScreenLine() {
    _classCallCheck(this, MoveToFirstCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfScreenLine.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'first-character';
  }

  // keymap: g $
  return MoveToFirstCharacterOfScreenLine;
})(MoveToScreenColumn);

var MoveToLastCharacterOfScreenLine = (function (_MoveToScreenColumn3) {
  _inherits(MoveToLastCharacterOfScreenLine, _MoveToScreenColumn3);

  function MoveToLastCharacterOfScreenLine() {
    _classCallCheck(this, MoveToLastCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfScreenLine.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'last-character';
  }

  // keymap: g g
  return MoveToLastCharacterOfScreenLine;
})(MoveToScreenColumn);

var MoveToFirstLine = (function (_Motion18) {
  _inherits(MoveToFirstLine, _Motion18);

  function MoveToFirstLine() {
    _classCallCheck(this, MoveToFirstLine);

    _get(Object.getPrototypeOf(MoveToFirstLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.jump = true;
    this.verticalMotion = true;
    this.moveSuccessOnLinewise = true;
  }

  // keymap: G

  _createClass(MoveToFirstLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      this.setCursorBufferRow(cursor, this.getValidVimBufferRow(this.getRow()));
      cursor.autoscroll({ center: true });
    }
  }, {
    key: 'getRow',
    value: function getRow() {
      return this.getCount() - 1;
    }
  }]);

  return MoveToFirstLine;
})(Motion);

var MoveToLastLine = (function (_MoveToFirstLine) {
  _inherits(MoveToLastLine, _MoveToFirstLine);

  function MoveToLastLine() {
    _classCallCheck(this, MoveToLastLine);

    _get(Object.getPrototypeOf(MoveToLastLine.prototype), 'constructor', this).apply(this, arguments);

    this.defaultCount = Infinity;
  }

  // keymap: N% e.g. 10%
  return MoveToLastLine;
})(MoveToFirstLine);

var MoveToLineByPercent = (function (_MoveToFirstLine2) {
  _inherits(MoveToLineByPercent, _MoveToFirstLine2);

  function MoveToLineByPercent() {
    _classCallCheck(this, MoveToLineByPercent);

    _get(Object.getPrototypeOf(MoveToLineByPercent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToLineByPercent, [{
    key: 'getRow',
    value: function getRow() {
      var percent = this.limitNumber(this.getCount(), { max: 100 });
      return Math.floor(this.getVimLastBufferRow() * (percent / 100));
    }
  }]);

  return MoveToLineByPercent;
})(MoveToFirstLine);

var MoveToRelativeLine = (function (_Motion19) {
  _inherits(MoveToRelativeLine, _Motion19);

  function MoveToRelativeLine() {
    _classCallCheck(this, MoveToRelativeLine);

    _get(Object.getPrototypeOf(MoveToRelativeLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.moveSuccessOnLinewise = true;
  }

  _createClass(MoveToRelativeLine, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var row = undefined;
      var count = this.getCount();
      if (count < 0) {
        // Support negative count
        // Negative count can be passed like `operationStack.run("MoveToRelativeLine", {count: -5})`.
        // Currently used in vim-mode-plus-ex-mode pkg.
        while (count++ < 0) {
          row = this.getFoldStartRowForRow(row == null ? cursor.getBufferRow() : row - 1);
          if (row <= 0) break;
        }
      } else {
        var maxRow = this.getVimLastBufferRow();
        while (count-- > 0) {
          row = this.getFoldEndRowForRow(row == null ? cursor.getBufferRow() : row + 1);
          if (row >= maxRow) break;
        }
      }
      this.utils.setBufferRow(cursor, row);
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveToRelativeLine;
})(Motion);

var MoveToRelativeLineMinimumTwo = (function (_MoveToRelativeLine) {
  _inherits(MoveToRelativeLineMinimumTwo, _MoveToRelativeLine);

  function MoveToRelativeLineMinimumTwo() {
    _classCallCheck(this, MoveToRelativeLineMinimumTwo);

    _get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), 'constructor', this).apply(this, arguments);
  }

  // Position cursor without scrolling., H, M, L
  // -------------------------
  // keymap: H

  _createClass(MoveToRelativeLineMinimumTwo, [{
    key: 'getCount',
    value: function getCount() {
      return this.limitNumber(_get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), 'getCount', this).call(this), { min: 2 });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MoveToRelativeLineMinimumTwo;
})(MoveToRelativeLine);

var MoveToTopOfScreen = (function (_Motion20) {
  _inherits(MoveToTopOfScreen, _Motion20);

  function MoveToTopOfScreen() {
    _classCallCheck(this, MoveToTopOfScreen);

    _get(Object.getPrototypeOf(MoveToTopOfScreen.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.jump = true;
    this.defaultCount = 0;
    this.verticalMotion = true;
  }

  _createClass(MoveToTopOfScreen, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var bufferRow = this.editor.bufferRowForScreenRow(this.getScreenRow());
      this.setCursorBufferRow(cursor, bufferRow);
    }
  }, {
    key: 'getScreenRow',
    value: function getScreenRow() {
      var firstVisibleRow = this.editor.getFirstVisibleScreenRow();
      var lastVisibleRow = this.limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });

      var baseOffset = 2;
      if (this.name === 'MoveToTopOfScreen') {
        var offset = firstVisibleRow === 0 ? 0 : baseOffset;
        var count = this.getCount() - 1;
        return this.limitNumber(firstVisibleRow + count, { min: firstVisibleRow + offset, max: lastVisibleRow });
      } else if (this.name === 'MoveToMiddleOfScreen') {
        return firstVisibleRow + Math.floor((lastVisibleRow - firstVisibleRow) / 2);
      } else if (this.name === 'MoveToBottomOfScreen') {
        var offset = lastVisibleRow === this.getVimLastScreenRow() ? 0 : baseOffset + 1;
        var count = this.getCount() - 1;
        return this.limitNumber(lastVisibleRow - count, { min: firstVisibleRow, max: lastVisibleRow - offset });
      }
    }
  }]);

  return MoveToTopOfScreen;
})(Motion);

var MoveToMiddleOfScreen = (function (_MoveToTopOfScreen) {
  _inherits(MoveToMiddleOfScreen, _MoveToTopOfScreen);

  function MoveToMiddleOfScreen() {
    _classCallCheck(this, MoveToMiddleOfScreen);

    _get(Object.getPrototypeOf(MoveToMiddleOfScreen.prototype), 'constructor', this).apply(this, arguments);
  }

  // keymap: M
  return MoveToMiddleOfScreen;
})(MoveToTopOfScreen);

var MoveToBottomOfScreen = (function (_MoveToTopOfScreen2) {
  _inherits(MoveToBottomOfScreen, _MoveToTopOfScreen2);

  function MoveToBottomOfScreen() {
    _classCallCheck(this, MoveToBottomOfScreen);

    _get(Object.getPrototypeOf(MoveToBottomOfScreen.prototype), 'constructor', this).apply(this, arguments);
  }

  // keymap: L

  // Scrolling
  // Half: ctrl-d, ctrl-u
  // Full: ctrl-f, ctrl-b
  // -------------------------
  // [FIXME] count behave differently from original Vim.
  return MoveToBottomOfScreen;
})(MoveToTopOfScreen);

var Scroll = (function (_Motion21) {
  _inherits(Scroll, _Motion21);

  function Scroll() {
    _classCallCheck(this, Scroll);

    _get(Object.getPrototypeOf(Scroll.prototype), 'constructor', this).apply(this, arguments);

    this.verticalMotion = true;
  }

  _createClass(Scroll, [{
    key: 'execute',
    value: function execute() {
      var amountOfPage = this.constructor.amountOfPageByName[this.name];
      var amountOfScreenRows = Math.trunc(amountOfPage * this.editor.getRowsPerPage() * this.getCount());
      this.amountOfPixels = amountOfScreenRows * this.editor.getLineHeightInPixels();

      _get(Object.getPrototypeOf(Scroll.prototype), 'execute', this).call(this);

      this.vimState.requestScroll({
        amountOfPixels: this.amountOfPixels,
        duration: this.getSmoothScrollDuation((Math.abs(amountOfPage) === 1 ? 'Full' : 'Half') + 'ScrollMotion')
      });
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var cursorPixel = this.editorElement.pixelPositionForScreenPosition(cursor.getScreenPosition());
      cursorPixel.top += this.amountOfPixels;
      var screenPosition = this.editorElement.screenPositionForPixelPosition(cursorPixel);
      var screenRow = this.getValidVimScreenRow(screenPosition.row);
      this.setCursorBufferRow(cursor, this.editor.bufferRowForScreenRow(screenRow), { autoscroll: false });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }, {
    key: 'scrollTask',
    value: null,
    enumerable: true
  }, {
    key: 'amountOfPageByName',
    value: {
      ScrollFullScreenDown: 1,
      ScrollFullScreenUp: -1,
      ScrollHalfScreenDown: 0.5,
      ScrollHalfScreenUp: -0.5,
      ScrollQuarterScreenDown: 0.25,
      ScrollQuarterScreenUp: -0.25
    },
    enumerable: true
  }]);

  return Scroll;
})(Motion);

var ScrollFullScreenDown = (function (_Scroll) {
  _inherits(ScrollFullScreenDown, _Scroll);

  function ScrollFullScreenDown() {
    _classCallCheck(this, ScrollFullScreenDown);

    _get(Object.getPrototypeOf(ScrollFullScreenDown.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-f
  return ScrollFullScreenDown;
})(Scroll);

var ScrollFullScreenUp = (function (_Scroll2) {
  _inherits(ScrollFullScreenUp, _Scroll2);

  function ScrollFullScreenUp() {
    _classCallCheck(this, ScrollFullScreenUp);

    _get(Object.getPrototypeOf(ScrollFullScreenUp.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-b
  return ScrollFullScreenUp;
})(Scroll);

var ScrollHalfScreenDown = (function (_Scroll3) {
  _inherits(ScrollHalfScreenDown, _Scroll3);

  function ScrollHalfScreenDown() {
    _classCallCheck(this, ScrollHalfScreenDown);

    _get(Object.getPrototypeOf(ScrollHalfScreenDown.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-d
  return ScrollHalfScreenDown;
})(Scroll);

var ScrollHalfScreenUp = (function (_Scroll4) {
  _inherits(ScrollHalfScreenUp, _Scroll4);

  function ScrollHalfScreenUp() {
    _classCallCheck(this, ScrollHalfScreenUp);

    _get(Object.getPrototypeOf(ScrollHalfScreenUp.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-u
  return ScrollHalfScreenUp;
})(Scroll);

var ScrollQuarterScreenDown = (function (_Scroll5) {
  _inherits(ScrollQuarterScreenDown, _Scroll5);

  function ScrollQuarterScreenDown() {
    _classCallCheck(this, ScrollQuarterScreenDown);

    _get(Object.getPrototypeOf(ScrollQuarterScreenDown.prototype), 'constructor', this).apply(this, arguments);
  }

  // g ctrl-d
  return ScrollQuarterScreenDown;
})(Scroll);

var ScrollQuarterScreenUp = (function (_Scroll6) {
  _inherits(ScrollQuarterScreenUp, _Scroll6);

  function ScrollQuarterScreenUp() {
    _classCallCheck(this, ScrollQuarterScreenUp);

    _get(Object.getPrototypeOf(ScrollQuarterScreenUp.prototype), 'constructor', this).apply(this, arguments);
  }

  // g ctrl-u

  // Find
  // -------------------------
  // keymap: f
  return ScrollQuarterScreenUp;
})(Scroll);

var Find = (function (_Motion22) {
  _inherits(Find, _Motion22);

  function Find() {
    _classCallCheck(this, Find);

    _get(Object.getPrototypeOf(Find.prototype), 'constructor', this).apply(this, arguments);

    this.backwards = false;
    this.inclusive = true;
    this.offset = 0;
    this.requireInput = true;
    this.caseSensitivityKind = 'Find';
  }

  // keymap: F

  _createClass(Find, [{
    key: 'restoreEditorState',
    value: function restoreEditorState() {
      if (this._restoreEditorState) this._restoreEditorState();
      this._restoreEditorState = null;
    }
  }, {
    key: 'cancelOperation',
    value: function cancelOperation() {
      this.restoreEditorState();
      _get(Object.getPrototypeOf(Find.prototype), 'cancelOperation', this).call(this);
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this18 = this;

      if (this.getConfig('reuseFindForRepeatFind')) this.repeatIfNecessary();

      if (!this.repeated) {
        var charsMax = this.getConfig('findCharsMax');
        var optionsBase = { purpose: 'find', charsMax: charsMax };

        if (charsMax === 1) {
          this.focusInput(optionsBase);
        } else {
          this._restoreEditorState = this.utils.saveEditorState(this.editor);
          var options = {
            autoConfirmTimeout: this.getConfig('findConfirmByTimeout'),
            onConfirm: function onConfirm(input) {
              _this18.input = input;
              if (input) _this18.processOperation();else _this18.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this18.preConfirmedChars = preConfirmedChars;
              _this18.highlightTextInCursorRows(_this18.preConfirmedChars, 'pre-confirm', _this18.isBackwards());
            },
            onCancel: function onCancel() {
              _this18.vimState.highlightFind.clearMarkers();
              _this18.cancelOperation();
            },
            commands: {
              'vim-mode-plus:find-next-pre-confirmed': function vimModePlusFindNextPreConfirmed() {
                return _this18.findPreConfirmed(+1);
              },
              'vim-mode-plus:find-previous-pre-confirmed': function vimModePlusFindPreviousPreConfirmed() {
                return _this18.findPreConfirmed(-1);
              }
            }
          };
          this.focusInput(Object.assign(options, optionsBase));
        }
      }
      _get(Object.getPrototypeOf(Find.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'findPreConfirmed',
    value: function findPreConfirmed(delta) {
      if (this.preConfirmedChars && this.getConfig('highlightFindChar')) {
        var index = this.highlightTextInCursorRows(this.preConfirmedChars, 'pre-confirm', this.isBackwards(), this.getCount() - 1 + delta, true);
        this.count = index + 1;
      }
    }
  }, {
    key: 'repeatIfNecessary',
    value: function repeatIfNecessary() {
      var findCommandNames = ['Find', 'FindBackwards', 'Till', 'TillBackwards'];
      var currentFind = this.globalState.get('currentFind');
      if (currentFind && findCommandNames.includes(this.vimState.operationStack.getLastCommandName())) {
        this.input = currentFind.input;
        this.repeated = true;
      }
    }
  }, {
    key: 'isBackwards',
    value: function isBackwards() {
      return this.backwards;
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this19 = this;

      _get(Object.getPrototypeOf(Find.prototype), 'execute', this).call(this);
      var decorationType = 'post-confirm';
      if (this.operator && !this.operator['instanceof']('SelectBase')) {
        decorationType += ' long';
      }

      // HACK: When repeated by ",", this.backwards is temporary inverted and
      // restored after execution finished.
      // But final highlightTextInCursorRows is executed in async(=after operation finished).
      // Thus we need to preserve before restored `backwards` value and pass it.
      var backwards = this.isBackwards();
      this.editor.component.getNextUpdatePromise().then(function () {
        _this19.highlightTextInCursorRows(_this19.input, decorationType, backwards);
      });
    }
  }, {
    key: 'getPoint',
    value: function getPoint(fromPoint) {
      var scanRange = this.editor.bufferRangeForBufferRow(fromPoint.row);
      var points = [];
      var regex = this.getRegex(this.input);
      var indexWantAccess = this.getCount() - 1;

      var translation = new Point(0, this.isBackwards() ? this.offset : -this.offset);
      if (this.repeated) {
        fromPoint = fromPoint.translate(translation.negate());
      }

      if (this.isBackwards()) {
        if (this.getConfig('findAcrossLines')) scanRange.start = Point.ZERO;

        this.editor.backwardsScanInBufferRange(regex, scanRange, function (_ref4) {
          var range = _ref4.range;
          var stop = _ref4.stop;

          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) stop();
          }
        });
      } else {
        if (this.getConfig('findAcrossLines')) scanRange.end = this.editor.getEofBufferPosition();

        this.editor.scanInBufferRange(regex, scanRange, function (_ref5) {
          var range = _ref5.range;
          var stop = _ref5.stop;

          if (range.start.isGreaterThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) stop();
          }
        });
      }

      var point = points[indexWantAccess];
      if (point) return point.translate(translation);
    }

    // FIXME: bad naming, this function must return index
  }, {
    key: 'highlightTextInCursorRows',
    value: function highlightTextInCursorRows(text, decorationType, backwards) {
      var index = arguments.length <= 3 || arguments[3] === undefined ? this.getCount() - 1 : arguments[3];
      var adjustIndex = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      if (!this.getConfig('highlightFindChar')) return;

      return this.vimState.highlightFind.highlightCursorRows(this.getRegex(text), decorationType, backwards, this.offset, index, adjustIndex);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.getPoint(cursor.getBufferPosition());
      if (point) cursor.setBufferPosition(point);else this.restoreEditorState();

      if (!this.repeated) this.globalState.set('currentFind', this);
    }
  }, {
    key: 'getRegex',
    value: function getRegex(term) {
      var modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      return new RegExp(this._.escapeRegExp(term), modifiers);
    }
  }]);

  return Find;
})(Motion);

var FindBackwards = (function (_Find) {
  _inherits(FindBackwards, _Find);

  function FindBackwards() {
    _classCallCheck(this, FindBackwards);

    _get(Object.getPrototypeOf(FindBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  // keymap: t
  return FindBackwards;
})(Find);

var Till = (function (_Find2) {
  _inherits(Till, _Find2);

  function Till() {
    _classCallCheck(this, Till);

    _get(Object.getPrototypeOf(Till.prototype), 'constructor', this).apply(this, arguments);

    this.offset = 1;
  }

  // keymap: T

  _createClass(Till, [{
    key: 'getPoint',
    value: function getPoint() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var point = _get(Object.getPrototypeOf(Till.prototype), 'getPoint', this).apply(this, args);
      this.moveSucceeded = point != null;
      return point;
    }
  }]);

  return Till;
})(Find);

var TillBackwards = (function (_Till) {
  _inherits(TillBackwards, _Till);

  function TillBackwards() {
    _classCallCheck(this, TillBackwards);

    _get(Object.getPrototypeOf(TillBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  // Mark
  // -------------------------
  // keymap: `
  return TillBackwards;
})(Till);

var MoveToMark = (function (_Motion23) {
  _inherits(MoveToMark, _Motion23);

  function MoveToMark() {
    _classCallCheck(this, MoveToMark);

    _get(Object.getPrototypeOf(MoveToMark.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.requireInput = true;
    this.input = null;
    this.moveToFirstCharacterOfLine = false;
  }

  // keymap: '

  _createClass(MoveToMark, [{
    key: 'initialize',
    value: function initialize() {
      this.readChar();
      _get(Object.getPrototypeOf(MoveToMark.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.vimState.mark.get(this.input);
      if (point) {
        if (this.moveToFirstCharacterOfLine) {
          point = this.getFirstCharacterPositionForBufferRow(point.row);
        }
        cursor.setBufferPosition(point);
        cursor.autoscroll({ center: true });
      }
    }
  }]);

  return MoveToMark;
})(Motion);

var MoveToMarkLine = (function (_MoveToMark) {
  _inherits(MoveToMarkLine, _MoveToMark);

  function MoveToMarkLine() {
    _classCallCheck(this, MoveToMarkLine);

    _get(Object.getPrototypeOf(MoveToMarkLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.moveToFirstCharacterOfLine = true;
  }

  // Fold motion
  // -------------------------
  return MoveToMarkLine;
})(MoveToMark);

var MotionByFold = (function (_Motion24) {
  _inherits(MotionByFold, _Motion24);

  function MotionByFold() {
    _classCallCheck(this, MotionByFold);

    _get(Object.getPrototypeOf(MotionByFold.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'characterwise';
    this.which = null;
    this.direction = null;
  }

  _createClass(MotionByFold, [{
    key: 'execute',
    value: function execute() {
      this.foldRanges = this.utils.getCodeFoldRanges(this.editor);
      _get(Object.getPrototypeOf(MotionByFold.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'getRows',
    value: function getRows() {
      var _this20 = this;

      var rows = this.foldRanges.map(function (foldRange) {
        return foldRange[_this20.which].row;
      }).sort(function (a, b) {
        return a - b;
      });
      if (this.direction === 'previous') {
        return rows.reverse();
      } else {
        return rows;
      }
    }
  }, {
    key: 'findRowBy',
    value: function findRowBy(cursor, fn) {
      var _this21 = this;

      var cursorRow = cursor.getBufferRow();
      return this.getRows().find(function (row) {
        if (_this21.direction === 'previous') {
          return row < cursorRow && fn(row);
        } else {
          return row > cursorRow && fn(row);
        }
      });
    }
  }, {
    key: 'findRow',
    value: function findRow(cursor) {
      return this.findRowBy(cursor, function () {
        return true;
      });
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this22 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this22.findRow(cursor);
        if (row != null) _this22.utils.moveCursorToFirstCharacterAtRow(cursor, row);
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MotionByFold;
})(Motion);

var MoveToPreviousFoldStart = (function (_MotionByFold) {
  _inherits(MoveToPreviousFoldStart, _MotionByFold);

  function MoveToPreviousFoldStart() {
    _classCallCheck(this, MoveToPreviousFoldStart);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.direction = 'previous';
  }

  return MoveToPreviousFoldStart;
})(MotionByFold);

var MoveToNextFoldStart = (function (_MotionByFold2) {
  _inherits(MoveToNextFoldStart, _MotionByFold2);

  function MoveToNextFoldStart() {
    _classCallCheck(this, MoveToNextFoldStart);

    _get(Object.getPrototypeOf(MoveToNextFoldStart.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.direction = 'next';
  }

  return MoveToNextFoldStart;
})(MotionByFold);

var MoveToPreviousFoldEnd = (function (_MotionByFold3) {
  _inherits(MoveToPreviousFoldEnd, _MotionByFold3);

  function MoveToPreviousFoldEnd() {
    _classCallCheck(this, MoveToPreviousFoldEnd);

    _get(Object.getPrototypeOf(MoveToPreviousFoldEnd.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.direction = 'previous';
  }

  return MoveToPreviousFoldEnd;
})(MotionByFold);

var MoveToNextFoldEnd = (function (_MotionByFold4) {
  _inherits(MoveToNextFoldEnd, _MotionByFold4);

  function MoveToNextFoldEnd() {
    _classCallCheck(this, MoveToNextFoldEnd);

    _get(Object.getPrototypeOf(MoveToNextFoldEnd.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.direction = 'next';
  }

  // -------------------------
  return MoveToNextFoldEnd;
})(MotionByFold);

var MoveToPreviousFunction = (function (_MotionByFold5) {
  _inherits(MoveToPreviousFunction, _MotionByFold5);

  function MoveToPreviousFunction() {
    _classCallCheck(this, MoveToPreviousFunction);

    _get(Object.getPrototypeOf(MoveToPreviousFunction.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.direction = 'previous';
  }

  _createClass(MoveToPreviousFunction, [{
    key: 'findRow',
    value: function findRow(cursor) {
      var _this23 = this;

      return this.findRowBy(cursor, function (row) {
        return _this23.utils.isIncludeFunctionScopeForRow(_this23.editor, row);
      });
    }
  }]);

  return MoveToPreviousFunction;
})(MotionByFold);

var MoveToNextFunction = (function (_MoveToPreviousFunction) {
  _inherits(MoveToNextFunction, _MoveToPreviousFunction);

  function MoveToNextFunction() {
    _classCallCheck(this, MoveToNextFunction);

    _get(Object.getPrototypeOf(MoveToNextFunction.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  return MoveToNextFunction;
})(MoveToPreviousFunction);

var MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle = (function (_MoveToPreviousFunction2) {
  _inherits(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle, _MoveToPreviousFunction2);

  function MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle, [{
    key: 'execute',
    value: function execute() {
      _get(Object.getPrototypeOf(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle.prototype), 'execute', this).call(this);
      this.getInstance('RedrawCursorLineAtUpperMiddle').execute();
    }
  }]);

  return MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle;
})(MoveToPreviousFunction);

var MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle = (function (_MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle) {
  _inherits(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle, _MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

  function MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'next';
  }

  // -------------------------
  return MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle;
})(MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle);

var MotionByFoldWithSameIndent = (function (_MotionByFold6) {
  _inherits(MotionByFoldWithSameIndent, _MotionByFold6);

  function MotionByFoldWithSameIndent() {
    _classCallCheck(this, MotionByFoldWithSameIndent);

    _get(Object.getPrototypeOf(MotionByFoldWithSameIndent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MotionByFoldWithSameIndent, [{
    key: 'findRow',
    value: function findRow(cursor) {
      var _this24 = this;

      var closestFoldRange = this.utils.getClosestFoldRangeContainsRow(this.editor, cursor.getBufferRow());
      var indentationForBufferRow = function indentationForBufferRow(row) {
        return _this24.editor.indentationForBufferRow(row);
      };
      var baseIndentLevel = closestFoldRange ? indentationForBufferRow(closestFoldRange.start.row) : 0;
      var isEqualIndentLevel = function isEqualIndentLevel(range) {
        return indentationForBufferRow(range.start.row) === baseIndentLevel;
      };

      var cursorRow = cursor.getBufferRow();
      var foldRanges = this.direction === 'previous' ? this.foldRanges.slice().reverse() : this.foldRanges;
      var foldRange = foldRanges.find(function (foldRange) {
        var row = foldRange[_this24.which].row;
        if (_this24.direction === 'previous') {
          return row < cursorRow && isEqualIndentLevel(foldRange);
        } else {
          return row > cursorRow && isEqualIndentLevel(foldRange);
        }
      });
      if (foldRange) {
        return foldRange[this.which].row;
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MotionByFoldWithSameIndent;
})(MotionByFold);

var MoveToPreviousFoldStartWithSameIndent = (function (_MotionByFoldWithSameIndent) {
  _inherits(MoveToPreviousFoldStartWithSameIndent, _MotionByFoldWithSameIndent);

  function MoveToPreviousFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToPreviousFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStartWithSameIndent.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.direction = 'previous';
  }

  return MoveToPreviousFoldStartWithSameIndent;
})(MotionByFoldWithSameIndent);

var MoveToNextFoldStartWithSameIndent = (function (_MotionByFoldWithSameIndent2) {
  _inherits(MoveToNextFoldStartWithSameIndent, _MotionByFoldWithSameIndent2);

  function MoveToNextFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToNextFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToNextFoldStartWithSameIndent.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'start';
    this.direction = 'next';
  }

  return MoveToNextFoldStartWithSameIndent;
})(MotionByFoldWithSameIndent);

var MoveToPreviousFoldEndWithSameIndent = (function (_MotionByFoldWithSameIndent3) {
  _inherits(MoveToPreviousFoldEndWithSameIndent, _MotionByFoldWithSameIndent3);

  function MoveToPreviousFoldEndWithSameIndent() {
    _classCallCheck(this, MoveToPreviousFoldEndWithSameIndent);

    _get(Object.getPrototypeOf(MoveToPreviousFoldEndWithSameIndent.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.direction = 'previous';
  }

  return MoveToPreviousFoldEndWithSameIndent;
})(MotionByFoldWithSameIndent);

var MoveToNextFoldEndWithSameIndent = (function (_MotionByFoldWithSameIndent4) {
  _inherits(MoveToNextFoldEndWithSameIndent, _MotionByFoldWithSameIndent4);

  function MoveToNextFoldEndWithSameIndent() {
    _classCallCheck(this, MoveToNextFoldEndWithSameIndent);

    _get(Object.getPrototypeOf(MoveToNextFoldEndWithSameIndent.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'end';
    this.direction = 'next';
  }

  // Scope based
  // -------------------------
  return MoveToNextFoldEndWithSameIndent;
})(MotionByFoldWithSameIndent);

var MotionByScope = (function (_Motion25) {
  _inherits(MotionByScope, _Motion25);

  function MotionByScope() {
    _classCallCheck(this, MotionByScope);

    _get(Object.getPrototypeOf(MotionByScope.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'backward';
    this.scope = '.';
  }

  _createClass(MotionByScope, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var _this25 = this;

      this.moveCursorCountTimes(cursor, function () {
        var cursorPosition = cursor.getBufferPosition();
        var point = _this25.utils.detectScopeStartPositionForScope(_this25.editor, cursorPosition, _this25.direction, _this25.scope);
        if (point) cursor.setBufferPosition(point);
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return MotionByScope;
})(Motion);

var MoveToPreviousString = (function (_MotionByScope) {
  _inherits(MoveToPreviousString, _MotionByScope);

  function MoveToPreviousString() {
    _classCallCheck(this, MoveToPreviousString);

    _get(Object.getPrototypeOf(MoveToPreviousString.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'backward';
    this.scope = 'string.begin';
  }

  return MoveToPreviousString;
})(MotionByScope);

var MoveToNextString = (function (_MoveToPreviousString) {
  _inherits(MoveToNextString, _MoveToPreviousString);

  function MoveToNextString() {
    _classCallCheck(this, MoveToNextString);

    _get(Object.getPrototypeOf(MoveToNextString.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'forward';
  }

  return MoveToNextString;
})(MoveToPreviousString);

var MoveToPreviousNumber = (function (_MotionByScope2) {
  _inherits(MoveToPreviousNumber, _MotionByScope2);

  function MoveToPreviousNumber() {
    _classCallCheck(this, MoveToPreviousNumber);

    _get(Object.getPrototypeOf(MoveToPreviousNumber.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'backward';
    this.scope = 'constant.numeric';
  }

  return MoveToPreviousNumber;
})(MotionByScope);

var MoveToNextNumber = (function (_MoveToPreviousNumber) {
  _inherits(MoveToNextNumber, _MoveToPreviousNumber);

  function MoveToNextNumber() {
    _classCallCheck(this, MoveToNextNumber);

    _get(Object.getPrototypeOf(MoveToNextNumber.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'forward';
  }

  return MoveToNextNumber;
})(MoveToPreviousNumber);

var MoveToNextOccurrence = (function (_Motion26) {
  _inherits(MoveToNextOccurrence, _Motion26);

  function MoveToNextOccurrence() {
    _classCallCheck(this, MoveToNextOccurrence);

    _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.direction = 'next';
  }

  _createClass(MoveToNextOccurrence, [{
    key: 'execute',
    value: function execute() {
      this.ranges = this.utils.sortRanges(this.occurrenceManager.getMarkers().map(function (marker) {
        return marker.getBufferRange();
      }));
      _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var range = this.ranges[this.utils.getIndex(this.getIndex(cursor.getBufferPosition()), this.ranges)];
      var point = range.start;
      cursor.setBufferPosition(point, { autoscroll: false });

      this.editor.unfoldBufferRow(point.row);
      if (cursor.isLastCursor()) {
        this.utils.smartScrollToBufferPosition(this.editor, point);
      }

      if (this.getConfig('flashOnMoveToOccurrence')) {
        this.vimState.flash(range, { type: 'search' });
      }
    }
  }, {
    key: 'getIndex',
    value: function getIndex(fromPoint) {
      var index = this.ranges.findIndex(function (range) {
        return range.start.isGreaterThan(fromPoint);
      });
      return (index >= 0 ? index : 0) + this.getCount() - 1;
    }
  }], [{
    key: 'commandScope',

    // Ensure this command is available when only has-occurrence
    value: 'atom-text-editor.vim-mode-plus.has-occurrence',
    enumerable: true
  }]);

  return MoveToNextOccurrence;
})(Motion);

var MoveToPreviousOccurrence = (function (_MoveToNextOccurrence) {
  _inherits(MoveToPreviousOccurrence, _MoveToNextOccurrence);

  function MoveToPreviousOccurrence() {
    _classCallCheck(this, MoveToPreviousOccurrence);

    _get(Object.getPrototypeOf(MoveToPreviousOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'previous';
  }

  // -------------------------
  // keymap: %

  _createClass(MoveToPreviousOccurrence, [{
    key: 'getIndex',
    value: function getIndex(fromPoint) {
      var ranges = this.ranges.slice().reverse();
      var range = ranges.find(function (range) {
        return range.end.isLessThan(fromPoint);
      });
      var index = range ? this.ranges.indexOf(range) : this.ranges.length - 1;
      return index - (this.getCount() - 1);
    }
  }]);

  return MoveToPreviousOccurrence;
})(MoveToNextOccurrence);

var MoveToPair = (function (_Motion27) {
  _inherits(MoveToPair, _Motion27);

  function MoveToPair() {
    _classCallCheck(this, MoveToPair);

    _get(Object.getPrototypeOf(MoveToPair.prototype), 'constructor', this).apply(this, arguments);

    this.inclusive = true;
    this.jump = true;
    this.member = ['Parenthesis', 'CurlyBracket', 'SquareBracket'];
  }

  _createClass(MoveToPair, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      var point = this.getPoint(cursor);
      if (point) cursor.setBufferPosition(point);
    }
  }, {
    key: 'getPointForTag',
    value: function getPointForTag(point) {
      var pairInfo = this.getInstance('ATag').getPairInfo(point);
      if (!pairInfo) return;

      var openRange = pairInfo.openRange;
      var closeRange = pairInfo.closeRange;

      openRange = openRange.translate([0, +1], [0, -1]);
      closeRange = closeRange.translate([0, +1], [0, -1]);
      if (openRange.containsPoint(point) && !point.isEqual(openRange.end)) {
        return closeRange.start;
      }
      if (closeRange.containsPoint(point) && !point.isEqual(closeRange.end)) {
        return openRange.start;
      }
    }
  }, {
    key: 'getPoint',
    value: function getPoint(cursor) {
      var cursorPosition = cursor.getBufferPosition();
      var cursorRow = cursorPosition.row;
      var point = this.getPointForTag(cursorPosition);
      if (point) return point;

      // AAnyPairAllowForwarding return forwarding range or enclosing range.
      var range = this.getInstance('AAnyPairAllowForwarding', { member: this.member }).getRange(cursor.selection);
      if (!range) return;

      var start = range.start;
      var end = range.end;

      if (start.row === cursorRow && start.isGreaterThanOrEqual(cursorPosition)) {
        // Forwarding range found
        return end.translate([0, -1]);
      } else if (end.row === cursorPosition.row) {
        // Enclosing range was returned
        // We move to start( open-pair ) only when close-pair was at same row as cursor-row.
        return start;
      }
    }
  }]);

  return MoveToPair;
})(Motion);

module.exports = {
  Motion: Motion,
  CurrentSelection: CurrentSelection,
  MoveLeft: MoveLeft,
  MoveRight: MoveRight,
  MoveRightBufferColumn: MoveRightBufferColumn,
  MoveUp: MoveUp,
  MoveUpWrap: MoveUpWrap,
  MoveDown: MoveDown,
  MoveDownWrap: MoveDownWrap,
  MoveUpScreen: MoveUpScreen,
  MoveDownScreen: MoveDownScreen,
  MoveUpToEdge: MoveUpToEdge,
  MoveDownToEdge: MoveDownToEdge,
  MotionByWord: MotionByWord,
  MoveToNextWord: MoveToNextWord,
  MoveToNextWholeWord: MoveToNextWholeWord,
  MoveToNextAlphanumericWord: MoveToNextAlphanumericWord,
  MoveToNextSmartWord: MoveToNextSmartWord,
  MoveToNextSubword: MoveToNextSubword,
  MoveToPreviousWord: MoveToPreviousWord,
  MoveToPreviousWholeWord: MoveToPreviousWholeWord,
  MoveToPreviousAlphanumericWord: MoveToPreviousAlphanumericWord,
  MoveToPreviousSmartWord: MoveToPreviousSmartWord,
  MoveToPreviousSubword: MoveToPreviousSubword,
  MoveToEndOfWord: MoveToEndOfWord,
  MoveToEndOfWholeWord: MoveToEndOfWholeWord,
  MoveToEndOfAlphanumericWord: MoveToEndOfAlphanumericWord,
  MoveToEndOfSmartWord: MoveToEndOfSmartWord,
  MoveToEndOfSubword: MoveToEndOfSubword,
  MoveToPreviousEndOfWord: MoveToPreviousEndOfWord,
  MoveToPreviousEndOfWholeWord: MoveToPreviousEndOfWholeWord,
  MoveToNextSentence: MoveToNextSentence,
  MoveToPreviousSentence: MoveToPreviousSentence,
  MoveToNextSentenceSkipBlankRow: MoveToNextSentenceSkipBlankRow,
  MoveToPreviousSentenceSkipBlankRow: MoveToPreviousSentenceSkipBlankRow,
  MoveToNextParagraph: MoveToNextParagraph,
  MoveToPreviousParagraph: MoveToPreviousParagraph,
  MoveToNextDiffHunk: MoveToNextDiffHunk,
  MoveToPreviousDiffHunk: MoveToPreviousDiffHunk,
  MoveToBeginningOfLine: MoveToBeginningOfLine,
  MoveToColumn: MoveToColumn,
  MoveToLastCharacterOfLine: MoveToLastCharacterOfLine,
  MoveToLastNonblankCharacterOfLineAndDown: MoveToLastNonblankCharacterOfLineAndDown,
  MoveToFirstCharacterOfLine: MoveToFirstCharacterOfLine,
  MoveToFirstCharacterOfLineUp: MoveToFirstCharacterOfLineUp,
  MoveToFirstCharacterOfLineDown: MoveToFirstCharacterOfLineDown,
  MoveToFirstCharacterOfLineAndDown: MoveToFirstCharacterOfLineAndDown,
  MoveToScreenColumn: MoveToScreenColumn,
  MoveToBeginningOfScreenLine: MoveToBeginningOfScreenLine,
  MoveToFirstCharacterOfScreenLine: MoveToFirstCharacterOfScreenLine,
  MoveToLastCharacterOfScreenLine: MoveToLastCharacterOfScreenLine,
  MoveToFirstLine: MoveToFirstLine,
  MoveToLastLine: MoveToLastLine,
  MoveToLineByPercent: MoveToLineByPercent,
  MoveToRelativeLine: MoveToRelativeLine,
  MoveToRelativeLineMinimumTwo: MoveToRelativeLineMinimumTwo,
  MoveToTopOfScreen: MoveToTopOfScreen,
  MoveToMiddleOfScreen: MoveToMiddleOfScreen,
  MoveToBottomOfScreen: MoveToBottomOfScreen,
  Scroll: Scroll,
  ScrollFullScreenDown: ScrollFullScreenDown,
  ScrollFullScreenUp: ScrollFullScreenUp,
  ScrollHalfScreenDown: ScrollHalfScreenDown,
  ScrollHalfScreenUp: ScrollHalfScreenUp,
  ScrollQuarterScreenDown: ScrollQuarterScreenDown,
  ScrollQuarterScreenUp: ScrollQuarterScreenUp,
  Find: Find,
  FindBackwards: FindBackwards,
  Till: Till,
  TillBackwards: TillBackwards,
  MoveToMark: MoveToMark,
  MoveToMarkLine: MoveToMarkLine,
  MotionByFold: MotionByFold,
  MoveToPreviousFoldStart: MoveToPreviousFoldStart,
  MoveToNextFoldStart: MoveToNextFoldStart,
  MotionByFoldWithSameIndent: MotionByFoldWithSameIndent,
  MoveToPreviousFoldStartWithSameIndent: MoveToPreviousFoldStartWithSameIndent,
  MoveToNextFoldStartWithSameIndent: MoveToNextFoldStartWithSameIndent,
  MoveToPreviousFoldEndWithSameIndent: MoveToPreviousFoldEndWithSameIndent,
  MoveToNextFoldEndWithSameIndent: MoveToNextFoldEndWithSameIndent,
  MoveToPreviousFoldEnd: MoveToPreviousFoldEnd,
  MoveToNextFoldEnd: MoveToNextFoldEnd,
  MoveToPreviousFunction: MoveToPreviousFunction,
  MoveToNextFunction: MoveToNextFunction,
  MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle: MoveToPreviousFunctionAndRedrawCursorLineAtUpperMiddle,
  MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle: MoveToNextFunctionAndRedrawCursorLineAtUpperMiddle,
  MotionByScope: MotionByScope,
  MoveToPreviousString: MoveToPreviousString,
  MoveToNextString: MoveToNextString,
  MoveToPreviousNumber: MoveToPreviousNumber,
  MoveToNextNumber: MoveToNextNumber,
  MoveToNextOccurrence: MoveToNextOccurrence,
  MoveToPreviousOccurrence: MoveToPreviousOccurrence,
  MoveToPair: MoveToPair
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7OztlQUVZLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRW5CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsTUFBTTtZQUFOLE1BQU07O1dBQU4sTUFBTTswQkFBTixNQUFNOzsrQkFBTixNQUFNOztTQUlWLFFBQVEsR0FBRyxJQUFJO1NBQ2YsU0FBUyxHQUFHLEtBQUs7U0FDakIsSUFBSSxHQUFHLGVBQWU7U0FDdEIsSUFBSSxHQUFHLEtBQUs7U0FDWixjQUFjLEdBQUcsS0FBSztTQUN0QixhQUFhLEdBQUcsSUFBSTtTQUNwQixxQkFBcUIsR0FBRyxLQUFLO1NBQzdCLGVBQWUsR0FBRyxLQUFLO1NBQ3ZCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLG1CQUFtQixHQUFHLElBQUk7Ozs7O2VBYnRCLE1BQU07O1dBZUYsbUJBQUc7QUFDVCxhQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQTtLQUNoRDs7O1dBRVUsc0JBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVyx1QkFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVTLG1CQUFDLElBQUksRUFBRTtBQUNmLFVBQUksSUFBSSxLQUFLLGVBQWUsRUFBRTtBQUM1QixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7T0FDcEU7QUFDRCxVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtLQUNqQjs7O1dBRVUsc0JBQUc7QUFDWixVQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQTtLQUM3Qjs7O1dBRWdCLDBCQUFDLE1BQU0sRUFBRTtBQUN4QixVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLFNBQVMsQ0FBQTs7QUFFcEcsVUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFdkIsVUFBSSxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO0FBQzdFLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtBQUM3QyxZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUE7T0FDOUM7S0FDRjs7O1dBRU8sbUJBQUc7QUFDVCxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO09BQ2QsTUFBTTtBQUNMLGFBQUssSUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRTtBQUM3QyxjQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDOUI7T0FDRjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDMUIsVUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsRUFBRSxDQUFBO0tBQzFDOzs7OztXQUdNLGtCQUFHOzs7O0FBRVIsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsY0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQUE7OzRCQUVyRixTQUFTO0FBQ2xCLGlCQUFTLENBQUMsZUFBZSxDQUFDO2lCQUFNLE1BQUssZ0JBQWdCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztTQUFBLENBQUMsQ0FBQTs7QUFFeEUsWUFBTSxlQUFlLEdBQ25CLE1BQUssYUFBYSxJQUFJLElBQUksR0FDdEIsTUFBSyxhQUFhLEdBQ2xCLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFLLE1BQUssVUFBVSxFQUFFLElBQUksTUFBSyxxQkFBcUIsQUFBQyxDQUFBO0FBQy9FLFlBQUksQ0FBQyxNQUFLLGVBQWUsRUFBRSxNQUFLLGVBQWUsR0FBRyxlQUFlLENBQUE7O0FBRWpFLFlBQUksYUFBYSxJQUFLLGVBQWUsS0FBSyxNQUFLLFNBQVMsSUFBSSxNQUFLLFVBQVUsRUFBRSxDQUFBLEFBQUMsQUFBQyxFQUFFO0FBQy9FLGNBQU0sVUFBVSxHQUFHLE1BQUssS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3hDLG9CQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQy9CLG9CQUFVLENBQUMsU0FBUyxDQUFDLE1BQUssSUFBSSxDQUFDLENBQUE7U0FDaEM7OztBQWJILFdBQUssSUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRTtjQUExQyxTQUFTO09BY25COztBQUVELFVBQUksSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7QUFDN0IsWUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFBO09BQ3ZEO0tBQ0Y7OztXQUVrQiw0QkFBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUN4QyxVQUFJLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLEVBQUU7QUFDbEUsY0FBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTtPQUNuRixNQUFNO0FBQ0wsWUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtPQUM5QztLQUNGOzs7Ozs7V0FJb0IsOEJBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUNoQyxVQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUM1QyxVQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxVQUFBLEtBQUssRUFBSTtBQUN4QyxVQUFFLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDVCxZQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUM5QyxZQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ2xELG1CQUFXLEdBQUcsV0FBVyxDQUFBO09BQzFCLENBQUMsQ0FBQTtLQUNIOzs7V0FFZSx5QkFBQyxJQUFJLEVBQUU7QUFDckIsVUFBSSxJQUFJLENBQUMsU0FBUyxxQkFBbUIsSUFBSSxDQUFDLG1CQUFtQixDQUFHLEVBQUU7QUFDaEUsZUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO09BQ25DLE1BQU07QUFDTCxlQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsbUJBQWlCLElBQUksQ0FBQyxtQkFBbUIsQ0FBRyxDQUFBO09BQ25FO0tBQ0Y7OztXQUVrQiw0QkFBQyxTQUFTLEVBQUU7QUFDN0IsVUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO0FBQ3hCLGVBQU8sSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUE7T0FDdEMsTUFBTTtBQUNMLGVBQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO09BQ3ZCO0tBQ0Y7OztXQXhIc0IsUUFBUTs7OztXQUNkLEtBQUs7Ozs7U0FGbEIsTUFBTTtHQUFTLElBQUk7O0lBNkhuQixnQkFBZ0I7WUFBaEIsZ0JBQWdCOztXQUFoQixnQkFBZ0I7MEJBQWhCLGdCQUFnQjs7K0JBQWhCLGdCQUFnQjs7U0FFcEIsZUFBZSxHQUFHLElBQUk7U0FDdEIsd0JBQXdCLEdBQUcsSUFBSTtTQUMvQixTQUFTLEdBQUcsSUFBSTtTQUNoQixpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRTs7O2VBTHpCLGdCQUFnQjs7V0FPVCxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUMxQixZQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsMkJBQTJCLEVBQUUsR0FDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFBO09BQ3JELE1BQU07O0FBRUwsY0FBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQTtPQUNyRjtLQUNGOzs7V0FFTSxrQkFBRzs7O0FBQ1IsVUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUMxQixtQ0FwQkEsZ0JBQWdCLHdDQW9CRjtPQUNmLE1BQU07QUFDTCxhQUFLLElBQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUU7QUFDN0MsY0FBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNwRCxjQUFJLFNBQVMsRUFBRTtnQkFDTixjQUFjLEdBQXNCLFNBQVMsQ0FBN0MsY0FBYztnQkFBRSxnQkFBZ0IsR0FBSSxTQUFTLENBQTdCLGdCQUFnQjs7QUFDdkMsZ0JBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFO0FBQ3RELG9CQUFNLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTthQUMzQztXQUNGO1NBQ0Y7QUFDRCxtQ0EvQkEsZ0JBQWdCLHdDQStCRjtPQUNmOzs7Ozs7Ozs7NkJBUVUsTUFBTTtBQUNmLFlBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxLQUFLLENBQUE7QUFDaEUsZUFBSyxvQkFBb0IsQ0FBQyxZQUFNO0FBQzlCLGNBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0FBQ2pELGlCQUFLLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBQyxnQkFBZ0IsRUFBaEIsZ0JBQWdCLEVBQUUsY0FBYyxFQUFkLGNBQWMsRUFBQyxDQUFDLENBQUE7U0FDdkUsQ0FBQyxDQUFBOzs7QUFMSixXQUFLLElBQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUU7ZUFBcEMsTUFBTTtPQU1oQjtLQUNGOzs7V0E5Q2dCLEtBQUs7Ozs7U0FEbEIsZ0JBQWdCO0dBQVMsTUFBTTs7SUFrRC9CLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7O2VBQVIsUUFBUTs7V0FDRCxvQkFBQyxNQUFNLEVBQUU7OztBQUNsQixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUE7QUFDdkQsVUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3RDLGVBQUssS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBQyxTQUFTLEVBQVQsU0FBUyxFQUFDLENBQUMsQ0FBQTtPQUMvQyxDQUFDLENBQUE7S0FDSDs7O1NBTkcsUUFBUTtHQUFTLE1BQU07O0lBU3ZCLFNBQVM7WUFBVCxTQUFTOztXQUFULFNBQVM7MEJBQVQsU0FBUzs7K0JBQVQsU0FBUzs7O2VBQVQsU0FBUzs7V0FDRixvQkFBQyxNQUFNLEVBQUU7OztBQUNsQixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUE7O0FBRXZELFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsWUFBTTtBQUN0QyxlQUFLLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUE7Ozs7OztBQU1sRCxZQUFNLGFBQWEsR0FBRyxTQUFTLElBQUksQ0FBQyxPQUFLLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQTs7QUFFNUUsZUFBSyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFDLFNBQVMsRUFBVCxTQUFTLEVBQUMsQ0FBQyxDQUFBOztBQUUvQyxZQUFJLGFBQWEsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUU7QUFDM0MsaUJBQUssS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxTQUFTLEVBQVQsU0FBUyxFQUFDLENBQUMsQ0FBQTtTQUNoRDtPQUNGLENBQUMsQ0FBQTtLQUNIOzs7U0FuQkcsU0FBUztHQUFTLE1BQU07O0lBc0J4QixxQkFBcUI7WUFBckIscUJBQXFCOztXQUFyQixxQkFBcUI7MEJBQXJCLHFCQUFxQjs7K0JBQXJCLHFCQUFxQjs7O2VBQXJCLHFCQUFxQjs7V0FFZCxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtLQUMvRTs7O1dBSGdCLEtBQUs7Ozs7U0FEbEIscUJBQXFCO0dBQVMsTUFBTTs7SUFPcEMsTUFBTTtZQUFOLE1BQU07O1dBQU4sTUFBTTswQkFBTixNQUFNOzsrQkFBTixNQUFNOztTQUNWLElBQUksR0FBRyxVQUFVO1NBQ2pCLElBQUksR0FBRyxLQUFLO1NBQ1osU0FBUyxHQUFHLElBQUk7OztlQUhaLE1BQU07O1dBS0csc0JBQUMsR0FBRyxFQUFFO0FBQ2pCLFVBQU0sR0FBRyxHQUFHLENBQUMsQ0FBQTtBQUNiLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBOztBQUV0QyxVQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO0FBQzNCLFdBQUcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3pDLFdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBQyxDQUFDLENBQUE7T0FDbEUsTUFBTTtBQUNMLFdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZDLFdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBQyxDQUFDLENBQUE7T0FDbEU7QUFDRCxhQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUN2Qzs7O1dBRVUsb0JBQUMsTUFBTSxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3RDLFlBQU0sR0FBRyxHQUFHLE9BQUssWUFBWSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFBO0FBQ3BELGVBQUssS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7T0FDckMsQ0FBQyxDQUFBO0tBQ0g7OztTQXhCRyxNQUFNO0dBQVMsTUFBTTs7SUEyQnJCLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FDZCxJQUFJLEdBQUcsSUFBSTs7O1NBRFAsVUFBVTtHQUFTLE1BQU07O0lBSXpCLFFBQVE7WUFBUixRQUFROztXQUFSLFFBQVE7MEJBQVIsUUFBUTs7K0JBQVIsUUFBUTs7U0FDWixTQUFTLEdBQUcsTUFBTTs7O1NBRGQsUUFBUTtHQUFTLE1BQU07O0lBSXZCLFlBQVk7WUFBWixZQUFZOztXQUFaLFlBQVk7MEJBQVosWUFBWTs7K0JBQVosWUFBWTs7U0FDaEIsSUFBSSxHQUFHLElBQUk7OztTQURQLFlBQVk7R0FBUyxRQUFROztJQUk3QixZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7OytCQUFaLFlBQVk7O1NBQ2hCLElBQUksR0FBRyxVQUFVO1NBQ2pCLFNBQVMsR0FBRyxJQUFJOzs7ZUFGWixZQUFZOztXQUdMLG9CQUFDLE1BQU0sRUFBRTs7O0FBQ2xCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsWUFBTTtBQUN0QyxlQUFLLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUN0QyxDQUFDLENBQUE7S0FDSDs7O1NBUEcsWUFBWTtHQUFTLE1BQU07O0lBVTNCLGNBQWM7WUFBZCxjQUFjOztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7U0FDbEIsSUFBSSxHQUFHLFVBQVU7U0FDakIsU0FBUyxHQUFHLE1BQU07OztlQUZkLGNBQWM7O1dBR1Asb0JBQUMsTUFBTSxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3RDLGVBQUssS0FBSyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFBO09BQ3hDLENBQUMsQ0FBQTtLQUNIOzs7U0FQRyxjQUFjO0dBQVMsWUFBWTs7SUFVbkMsWUFBWTtZQUFaLFlBQVk7O1dBQVosWUFBWTswQkFBWixZQUFZOzsrQkFBWixZQUFZOztTQUNoQixJQUFJLEdBQUcsVUFBVTtTQUNqQixJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxVQUFVOzs7ZUFIbEIsWUFBWTs7V0FJTCxvQkFBQyxNQUFNLEVBQUU7OztBQUNsQixVQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFlBQU07QUFDdEMsWUFBTSxLQUFLLEdBQUcsT0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtBQUN2RCxZQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDM0MsQ0FBQyxDQUFBO0tBQ0g7OztXQUVRLGtCQUFDLFNBQVMsRUFBRTtVQUNaLE1BQU0sR0FBbUIsU0FBUyxDQUFsQyxNQUFNO1VBQU8sUUFBUSxHQUFJLFNBQVMsQ0FBMUIsR0FBRzs7QUFDbEIsV0FBSyxJQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUU7QUFDM0UsWUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQ3BDLFlBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQTtPQUNyQztLQUNGOzs7V0FFTSxnQkFBQyxLQUFLLEVBQUU7O0FBRWIsYUFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUN0QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQzdGO0tBQ0Y7OztXQUVXLHFCQUFDLEtBQUssRUFBRTtBQUNsQixhQUNFLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQzNCLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLENBQUM7O0FBRTFDLFVBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FDbkc7S0FDRjs7O1dBRWUseUJBQUMsS0FBSyxFQUFFO0FBQ3RCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2hHLGFBQU8sSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3ZDOzs7V0FFK0IseUNBQUMsS0FBSyxFQUFFOzs7QUFHdEMsVUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDNUYsZUFBTyxLQUFLLENBQUE7T0FDYjs7O1VBR00sR0FBRyxHQUFJLEtBQUssQ0FBWixHQUFHOztBQUNWLGFBQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQSxJQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0tBQ2pIOzs7U0FuREcsWUFBWTtHQUFTLE1BQU07O0lBc0QzQixjQUFjO1lBQWQsY0FBYzs7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OytCQUFkLGNBQWM7O1NBQ2xCLFNBQVMsR0FBRyxNQUFNOzs7Ozs7Ozs7Ozs7O1NBRGQsY0FBYztHQUFTLFlBQVk7O0lBY25DLFlBQVk7WUFBWixZQUFZOztXQUFaLFlBQVk7MEJBQVosWUFBWTs7K0JBQVosWUFBWTs7U0FFaEIsU0FBUyxHQUFHLElBQUk7U0FDaEIsWUFBWSxHQUFHLEtBQUs7U0FDcEIscUJBQXFCLEdBQUcsS0FBSzs7Ozs7ZUFKekIsWUFBWTs7V0FNTCxvQkFBQyxNQUFNLEVBQUU7OztBQUNsQixVQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFVBQUEsVUFBVSxFQUFJO0FBQzlDLGNBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQTtPQUM1RCxDQUFDLENBQUE7S0FDSDs7O1dBRVEsa0JBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRTtVQUNyQixTQUFTLEdBQUksSUFBSSxDQUFqQixTQUFTO1VBQ1gsS0FBSyxHQUFJLElBQUksQ0FBYixLQUFLOztBQUNWLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFaEQsVUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDdkMsVUFBSSxTQUFTLEtBQUssTUFBTSxJQUFJLEtBQUssS0FBSyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFOzs7O0FBSXBGLFlBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBOzs7QUFHdkQsWUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDekYsZUFBSyxHQUFHLEtBQUssQ0FBQTtTQUNkO0FBQ0QsWUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7O0FBRTlFLGVBQU8sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtPQUMzRixNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUE7T0FDOUc7S0FDRjs7O1dBRVksc0JBQUMsSUFBSSxFQUFFO0FBQ2xCLGFBQU87QUFDTCxZQUFJLEVBQUUsSUFBSTtBQUNWLG9CQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7QUFDL0IsNkJBQXFCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQjtBQUNqRCxvQkFBWSxFQUFFLEFBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSyxTQUFTO0FBQzVELHFCQUFhLEVBQUUsQUFBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFLLFNBQVM7T0FDOUQsQ0FBQTtLQUNGOzs7V0FFcUIsK0JBQUMsTUFBTSxFQUFFO0FBQzdCLFVBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDakMsZUFBTyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUE7T0FDOUI7O0FBRUQsVUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xCLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtPQUN0Qjs7QUFFRCxVQUFJLElBQUksQ0FBQyxTQUFTLENBQUMseUNBQXlDLENBQUMsRUFBRTtBQUM3RCxZQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUMvRixZQUFNLE1BQU0sMEJBQXdCLGlCQUFpQixZQUFPLGlCQUFpQixPQUFJLENBQUE7QUFDakYsZUFBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7T0FDL0I7QUFDRCxhQUFPLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtLQUMzQjs7O1dBNURnQixLQUFLOzs7O1NBRGxCLFlBQVk7R0FBUyxNQUFNOztJQWlFM0IsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOztTQUNsQixTQUFTLEdBQUcsTUFBTTtTQUNsQixLQUFLLEdBQUcsT0FBTzs7OztTQUZYLGNBQWM7R0FBUyxZQUFZOztJQU1uQyxtQkFBbUI7WUFBbkIsbUJBQW1COztXQUFuQixtQkFBbUI7MEJBQW5CLG1CQUFtQjs7K0JBQW5CLG1CQUFtQjs7U0FDdkIsU0FBUyxHQUFHLFNBQVM7Ozs7U0FEakIsbUJBQW1CO0dBQVMsY0FBYzs7SUFLMUMsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7Ozs7U0FBakIsaUJBQWlCO0dBQVMsY0FBYzs7SUFHeEMsbUJBQW1CO1lBQW5CLG1CQUFtQjs7V0FBbkIsbUJBQW1COzBCQUFuQixtQkFBbUI7OytCQUFuQixtQkFBbUI7O1NBQ3ZCLFNBQVMsR0FBRyxTQUFTOzs7O1NBRGpCLG1CQUFtQjtHQUFTLGNBQWM7O0lBSzFDLDBCQUEwQjtZQUExQiwwQkFBMEI7O1dBQTFCLDBCQUEwQjswQkFBMUIsMEJBQTBCOzsrQkFBMUIsMEJBQTBCOztTQUM5QixTQUFTLEdBQUcsTUFBTTs7OztTQURkLDBCQUEwQjtHQUFTLGNBQWM7O0lBS2pELGtCQUFrQjtZQUFsQixrQkFBa0I7O1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzsrQkFBbEIsa0JBQWtCOztTQUN0QixTQUFTLEdBQUcsVUFBVTtTQUN0QixLQUFLLEdBQUcsT0FBTztTQUNmLHFCQUFxQixHQUFHLElBQUk7Ozs7U0FIeEIsa0JBQWtCO0dBQVMsWUFBWTs7SUFPdkMsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7V0FBdkIsdUJBQXVCOzBCQUF2Qix1QkFBdUI7OytCQUF2Qix1QkFBdUI7O1NBQzNCLFNBQVMsR0FBRyxTQUFTOzs7O1NBRGpCLHVCQUF1QjtHQUFTLGtCQUFrQjs7SUFLbEQscUJBQXFCO1lBQXJCLHFCQUFxQjs7V0FBckIscUJBQXFCOzBCQUFyQixxQkFBcUI7OytCQUFyQixxQkFBcUI7Ozs7U0FBckIscUJBQXFCO0dBQVMsa0JBQWtCOztJQUdoRCx1QkFBdUI7WUFBdkIsdUJBQXVCOztXQUF2Qix1QkFBdUI7MEJBQXZCLHVCQUF1Qjs7K0JBQXZCLHVCQUF1Qjs7U0FDM0IsU0FBUyxHQUFHLFFBQVE7Ozs7U0FEaEIsdUJBQXVCO0dBQVMsa0JBQWtCOztJQUtsRCw4QkFBOEI7WUFBOUIsOEJBQThCOztXQUE5Qiw4QkFBOEI7MEJBQTlCLDhCQUE4Qjs7K0JBQTlCLDhCQUE4Qjs7U0FDbEMsU0FBUyxHQUFHLEtBQUs7Ozs7U0FEYiw4QkFBOEI7R0FBUyxrQkFBa0I7O0lBS3pELGVBQWU7WUFBZixlQUFlOztXQUFmLGVBQWU7MEJBQWYsZUFBZTs7K0JBQWYsZUFBZTs7U0FDbkIsU0FBUyxHQUFHLElBQUk7U0FDaEIsU0FBUyxHQUFHLE1BQU07U0FDbEIsS0FBSyxHQUFHLEtBQUs7U0FDYixZQUFZLEdBQUcsSUFBSTtTQUNuQixxQkFBcUIsR0FBRyxJQUFJOzs7O1NBTHhCLGVBQWU7R0FBUyxZQUFZOztJQVNwQyxvQkFBb0I7WUFBcEIsb0JBQW9COztXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7K0JBQXBCLG9CQUFvQjs7U0FDeEIsU0FBUyxHQUFHLE1BQU07Ozs7U0FEZCxvQkFBb0I7R0FBUyxlQUFlOztJQUs1QyxrQkFBa0I7WUFBbEIsa0JBQWtCOztXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7K0JBQWxCLGtCQUFrQjs7OztTQUFsQixrQkFBa0I7R0FBUyxlQUFlOztJQUcxQyxvQkFBb0I7WUFBcEIsb0JBQW9COztXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7K0JBQXBCLG9CQUFvQjs7U0FDeEIsU0FBUyxHQUFHLFNBQVM7Ozs7U0FEakIsb0JBQW9CO0dBQVMsZUFBZTs7SUFLNUMsMkJBQTJCO1lBQTNCLDJCQUEyQjs7V0FBM0IsMkJBQTJCOzBCQUEzQiwyQkFBMkI7OytCQUEzQiwyQkFBMkI7O1NBQy9CLFNBQVMsR0FBRyxNQUFNOzs7O1NBRGQsMkJBQTJCO0dBQVMsZUFBZTs7SUFLbkQsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7V0FBdkIsdUJBQXVCOzBCQUF2Qix1QkFBdUI7OytCQUF2Qix1QkFBdUI7O1NBQzNCLFNBQVMsR0FBRyxJQUFJO1NBQ2hCLFNBQVMsR0FBRyxVQUFVO1NBQ3RCLEtBQUssR0FBRyxLQUFLO1NBQ2IscUJBQXFCLEdBQUcsSUFBSTs7OztTQUp4Qix1QkFBdUI7R0FBUyxZQUFZOztJQVE1Qyw0QkFBNEI7WUFBNUIsNEJBQTRCOztXQUE1Qiw0QkFBNEI7MEJBQTVCLDRCQUE0Qjs7K0JBQTVCLDRCQUE0Qjs7U0FDaEMsU0FBUyxHQUFHLE1BQU07Ozs7Ozs7Ozs7O1NBRGQsNEJBQTRCO0dBQVMsdUJBQXVCOztJQVk1RCxrQkFBa0I7WUFBbEIsa0JBQWtCOztXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7K0JBQWxCLGtCQUFrQjs7U0FDdEIsSUFBSSxHQUFHLElBQUk7U0FDWCxhQUFhLEdBQUcsSUFBSSxNQUFNLCtDQUE4QyxHQUFHLENBQUM7U0FDNUUsU0FBUyxHQUFHLE1BQU07OztlQUhkLGtCQUFrQjs7V0FLWCxvQkFBQyxNQUFNLEVBQUU7OztBQUNsQixVQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFlBQU07QUFDdEMsWUFBTSxLQUFLLEdBQ1QsUUFBSyxTQUFTLEtBQUssTUFBTSxHQUNyQixRQUFLLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQ3ZELFFBQUssMEJBQTBCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtBQUNqRSxjQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxJQUFJLFFBQUssa0JBQWtCLENBQUMsUUFBSyxTQUFTLENBQUMsQ0FBQyxDQUFBO09BQzNFLENBQUMsQ0FBQTtLQUNIOzs7V0FFVSxvQkFBQyxHQUFHLEVBQUU7QUFDZixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDekM7OztXQUVzQixnQ0FBQyxJQUFJLEVBQUU7OztBQUM1QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBQyxJQUFJLEVBQUosSUFBSSxFQUFDLEVBQUUsVUFBQyxJQUFjLEVBQUs7WUFBbEIsS0FBSyxHQUFOLElBQWMsQ0FBYixLQUFLO1lBQUUsS0FBSyxHQUFiLElBQWMsQ0FBTixLQUFLOztBQUM1RSxZQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7Y0FDYixRQUFRLEdBQWEsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHO2NBQTFCLE1BQU0sR0FBc0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHOztBQUMxRCxjQUFJLFFBQUssWUFBWSxJQUFJLFFBQUssVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU07QUFDeEQsY0FBSSxRQUFLLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUN6RCxtQkFBTyxRQUFLLHFDQUFxQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1dBQzFEO1NBQ0YsTUFBTTtBQUNMLGlCQUFPLEtBQUssQ0FBQyxHQUFHLENBQUE7U0FDakI7T0FDRixDQUFDLENBQUE7S0FDSDs7O1dBRTBCLG9DQUFDLElBQUksRUFBRTs7O0FBQ2hDLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFDLElBQUksRUFBSixJQUFJLEVBQUMsRUFBRSxVQUFDLEtBQWMsRUFBSztZQUFsQixLQUFLLEdBQU4sS0FBYyxDQUFiLEtBQUs7WUFBRSxLQUFLLEdBQWIsS0FBYyxDQUFOLEtBQUs7O0FBQzdFLFlBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtjQUNiLFFBQVEsR0FBYSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUc7Y0FBMUIsTUFBTSxHQUFzQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUc7O0FBQzFELGNBQUksQ0FBQyxRQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxRQUFLLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN6RCxnQkFBTSxLQUFLLEdBQUcsUUFBSyxxQ0FBcUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoRSxnQkFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFBLEtBQ25DLElBQUksQ0FBQyxRQUFLLFlBQVksRUFBRSxPQUFPLFFBQUsscUNBQXFDLENBQUMsUUFBUSxDQUFDLENBQUE7V0FDekY7U0FDRixNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckMsaUJBQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQTtTQUNqQjtPQUNGLENBQUMsQ0FBQTtLQUNIOzs7U0E5Q0csa0JBQWtCO0dBQVMsTUFBTTs7SUFpRGpDLHNCQUFzQjtZQUF0QixzQkFBc0I7O1dBQXRCLHNCQUFzQjswQkFBdEIsc0JBQXNCOzsrQkFBdEIsc0JBQXNCOztTQUMxQixTQUFTLEdBQUcsVUFBVTs7O1NBRGxCLHNCQUFzQjtHQUFTLGtCQUFrQjs7SUFJakQsOEJBQThCO1lBQTlCLDhCQUE4Qjs7V0FBOUIsOEJBQThCOzBCQUE5Qiw4QkFBOEI7OytCQUE5Qiw4QkFBOEI7O1NBQ2xDLFlBQVksR0FBRyxJQUFJOzs7U0FEZiw4QkFBOEI7R0FBUyxrQkFBa0I7O0lBSXpELGtDQUFrQztZQUFsQyxrQ0FBa0M7O1dBQWxDLGtDQUFrQzswQkFBbEMsa0NBQWtDOzsrQkFBbEMsa0NBQWtDOztTQUN0QyxZQUFZLEdBQUcsSUFBSTs7Ozs7U0FEZixrQ0FBa0M7R0FBUyxzQkFBc0I7O0lBTWpFLG1CQUFtQjtZQUFuQixtQkFBbUI7O1dBQW5CLG1CQUFtQjswQkFBbkIsbUJBQW1COzsrQkFBbkIsbUJBQW1COztTQUN2QixJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxNQUFNOzs7ZUFGZCxtQkFBbUI7O1dBSVosb0JBQUMsTUFBTSxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3RDLFlBQU0sS0FBSyxHQUFHLFFBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUE7QUFDdkQsY0FBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssSUFBSSxRQUFLLGtCQUFrQixDQUFDLFFBQUssU0FBUyxDQUFDLENBQUMsQ0FBQTtPQUMzRSxDQUFDLENBQUE7S0FDSDs7O1dBRVEsa0JBQUMsSUFBSSxFQUFFO0FBQ2QsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDeEQsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQTtBQUNoRixXQUFLLElBQU0sR0FBRyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3BELFlBQUksQ0FBQyxXQUFXLElBQUksVUFBVSxFQUFFO0FBQzlCLGlCQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ2hCO0FBQ0QsbUJBQVcsR0FBRyxVQUFVLENBQUE7T0FDekI7S0FDRjs7O1NBckJHLG1CQUFtQjtHQUFTLE1BQU07O0lBd0JsQyx1QkFBdUI7WUFBdkIsdUJBQXVCOztXQUF2Qix1QkFBdUI7MEJBQXZCLHVCQUF1Qjs7K0JBQXZCLHVCQUF1Qjs7U0FDM0IsU0FBUyxHQUFHLFVBQVU7OztTQURsQix1QkFBdUI7R0FBUyxtQkFBbUI7O0lBSW5ELGtCQUFrQjtZQUFsQixrQkFBa0I7O1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzsrQkFBbEIsa0JBQWtCOztTQUN0QixJQUFJLEdBQUcsSUFBSTtTQUNYLFNBQVMsR0FBRyxNQUFNOzs7ZUFGZCxrQkFBa0I7O1dBSVgsb0JBQUMsTUFBTSxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3RDLFlBQU0sS0FBSyxHQUFHLFFBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUE7QUFDdkQsWUFBSSxLQUFLLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO09BQzNDLENBQUMsQ0FBQTtLQUNIOzs7V0FFUSxrQkFBQyxJQUFJLEVBQUU7OztBQUNkLFVBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFHLEdBQUc7ZUFBSSxRQUFLLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxRQUFLLE1BQU0sRUFBRSxHQUFHLENBQUM7T0FBQSxDQUFBO0FBQ2hGLFVBQUksU0FBUyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBQyxFQUFFLFVBQUMsS0FBTyxFQUFLO1lBQVgsS0FBSyxHQUFOLEtBQU8sQ0FBTixLQUFLOztBQUNoRSxZQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFNOztBQUU3RCxlQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQTtPQUMzQyxDQUFDLENBQUE7S0FDSDs7O1NBbkJHLGtCQUFrQjtHQUFTLE1BQU07O0lBc0JqQyxzQkFBc0I7WUFBdEIsc0JBQXNCOztXQUF0QixzQkFBc0I7MEJBQXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7U0FDMUIsU0FBUyxHQUFHLFVBQVU7Ozs7O1NBRGxCLHNCQUFzQjtHQUFTLGtCQUFrQjs7SUFNakQscUJBQXFCO1lBQXJCLHFCQUFxQjs7V0FBckIscUJBQXFCOzBCQUFyQixxQkFBcUI7OytCQUFyQixxQkFBcUI7OztlQUFyQixxQkFBcUI7O1dBQ2Qsb0JBQUMsTUFBTSxFQUFFO0FBQ2xCLFVBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUN0Qzs7O1NBSEcscUJBQXFCO0dBQVMsTUFBTTs7SUFNcEMsWUFBWTtZQUFaLFlBQVk7O1dBQVosWUFBWTswQkFBWixZQUFZOzsrQkFBWixZQUFZOzs7ZUFBWixZQUFZOztXQUNMLG9CQUFDLE1BQU0sRUFBRTtBQUNsQixVQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBO0tBQ3hEOzs7U0FIRyxZQUFZO0dBQVMsTUFBTTs7SUFNM0IseUJBQXlCO1lBQXpCLHlCQUF5Qjs7V0FBekIseUJBQXlCOzBCQUF6Qix5QkFBeUI7OytCQUF6Qix5QkFBeUI7OztlQUF6Qix5QkFBeUI7O1dBQ2xCLG9CQUFDLE1BQU0sRUFBRTtBQUNsQixVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUNsRixZQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQTtBQUN6QyxZQUFNLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQTtLQUM3Qjs7O1NBTEcseUJBQXlCO0dBQVMsTUFBTTs7SUFReEMsd0NBQXdDO1lBQXhDLHdDQUF3Qzs7V0FBeEMsd0NBQXdDOzBCQUF4Qyx3Q0FBd0M7OytCQUF4Qyx3Q0FBd0M7O1NBQzVDLFNBQVMsR0FBRyxJQUFJOzs7Ozs7O2VBRFosd0NBQXdDOztXQUdqQyxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBQyxDQUFDLENBQUE7QUFDNUcsVUFBTSxPQUFPLEdBQUcsRUFBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBQyxDQUFBO0FBQzdELFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLO09BQUEsQ0FBQyxDQUFBO0FBQ3hGLFlBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUNoQzs7O1NBUkcsd0NBQXdDO0dBQVMsTUFBTTs7SUFjdkQsMEJBQTBCO1lBQTFCLDBCQUEwQjs7V0FBMUIsMEJBQTBCOzBCQUExQiwwQkFBMEI7OytCQUExQiwwQkFBMEI7OztlQUExQiwwQkFBMEI7O1dBQ25CLG9CQUFDLE1BQU0sRUFBRTtBQUNsQixZQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDNUY7OztTQUhHLDBCQUEwQjtHQUFTLE1BQU07O0lBTXpDLDRCQUE0QjtZQUE1Qiw0QkFBNEI7O1dBQTVCLDRCQUE0QjswQkFBNUIsNEJBQTRCOzsrQkFBNUIsNEJBQTRCOztTQUNoQyxJQUFJLEdBQUcsVUFBVTs7O2VBRGIsNEJBQTRCOztXQUVyQixvQkFBQyxNQUFNLEVBQUU7OztBQUNsQixVQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLFlBQU07QUFDdEMsWUFBTSxHQUFHLEdBQUcsUUFBSyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDaEUsY0FBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDbkMsQ0FBQyxDQUFBO0FBQ0YsaUNBUEUsNEJBQTRCLDRDQU9iLE1BQU0sRUFBQztLQUN6Qjs7O1NBUkcsNEJBQTRCO0dBQVMsMEJBQTBCOztJQVcvRCw4QkFBOEI7WUFBOUIsOEJBQThCOztXQUE5Qiw4QkFBOEI7MEJBQTlCLDhCQUE4Qjs7K0JBQTlCLDhCQUE4Qjs7U0FDbEMsSUFBSSxHQUFHLFVBQVU7OztlQURiLDhCQUE4Qjs7V0FFdkIsb0JBQUMsTUFBTSxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3RDLFlBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0FBQ3hDLFlBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxRQUFLLG1CQUFtQixFQUFFLEVBQUU7QUFDMUMsZ0JBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ25EO09BQ0YsQ0FBQyxDQUFBO0FBQ0YsaUNBVEUsOEJBQThCLDRDQVNmLE1BQU0sRUFBQztLQUN6Qjs7O1NBVkcsOEJBQThCO0dBQVMsMEJBQTBCOztJQWFqRSxpQ0FBaUM7WUFBakMsaUNBQWlDOztXQUFqQyxpQ0FBaUM7MEJBQWpDLGlDQUFpQzs7K0JBQWpDLGlDQUFpQzs7O2VBQWpDLGlDQUFpQzs7V0FDNUIsb0JBQUc7QUFDVixhQUFPLDJCQUZMLGlDQUFpQyw0Q0FFVCxDQUFDLENBQUE7S0FDNUI7OztTQUhHLGlDQUFpQztHQUFTLDhCQUE4Qjs7SUFNeEUsa0JBQWtCO1lBQWxCLGtCQUFrQjs7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OytCQUFsQixrQkFBa0I7Ozs7O2VBQWxCLGtCQUFrQjs7V0FFWCxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ3JHLDhCQUFzQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsOENBQThDLENBQUM7T0FDdkYsQ0FBQyxDQUFBO0FBQ0YsVUFBSSxLQUFLLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQzNDOzs7V0FOZ0IsS0FBSzs7OztTQURsQixrQkFBa0I7R0FBUyxNQUFNOztJQVdqQywyQkFBMkI7WUFBM0IsMkJBQTJCOztXQUEzQiwyQkFBMkI7MEJBQTNCLDJCQUEyQjs7K0JBQTNCLDJCQUEyQjs7U0FDL0IsS0FBSyxHQUFHLFdBQVc7Ozs7U0FEZiwyQkFBMkI7R0FBUyxrQkFBa0I7O0lBS3RELGdDQUFnQztZQUFoQyxnQ0FBZ0M7O1dBQWhDLGdDQUFnQzswQkFBaEMsZ0NBQWdDOzsrQkFBaEMsZ0NBQWdDOztTQUNwQyxLQUFLLEdBQUcsaUJBQWlCOzs7O1NBRHJCLGdDQUFnQztHQUFTLGtCQUFrQjs7SUFLM0QsK0JBQStCO1lBQS9CLCtCQUErQjs7V0FBL0IsK0JBQStCOzBCQUEvQiwrQkFBK0I7OytCQUEvQiwrQkFBK0I7O1NBQ25DLEtBQUssR0FBRyxnQkFBZ0I7Ozs7U0FEcEIsK0JBQStCO0dBQVMsa0JBQWtCOztJQUsxRCxlQUFlO1lBQWYsZUFBZTs7V0FBZixlQUFlOzBCQUFmLGVBQWU7OytCQUFmLGVBQWU7O1NBQ25CLElBQUksR0FBRyxVQUFVO1NBQ2pCLElBQUksR0FBRyxJQUFJO1NBQ1gsY0FBYyxHQUFHLElBQUk7U0FDckIscUJBQXFCLEdBQUcsSUFBSTs7Ozs7ZUFKeEIsZUFBZTs7V0FNUixvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN6RSxZQUFNLENBQUMsVUFBVSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUE7S0FDbEM7OztXQUVNLGtCQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0tBQzNCOzs7U0FiRyxlQUFlO0dBQVMsTUFBTTs7SUFpQjlCLGNBQWM7WUFBZCxjQUFjOztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7U0FDbEIsWUFBWSxHQUFHLFFBQVE7Ozs7U0FEbkIsY0FBYztHQUFTLGVBQWU7O0lBS3RDLG1CQUFtQjtZQUFuQixtQkFBbUI7O1dBQW5CLG1CQUFtQjswQkFBbkIsbUJBQW1COzsrQkFBbkIsbUJBQW1COzs7ZUFBbkIsbUJBQW1COztXQUNoQixrQkFBRztBQUNSLFVBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUE7QUFDN0QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUEsQUFBQyxDQUFDLENBQUE7S0FDaEU7OztTQUpHLG1CQUFtQjtHQUFTLGVBQWU7O0lBTzNDLGtCQUFrQjtZQUFsQixrQkFBa0I7O1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzsrQkFBbEIsa0JBQWtCOztTQUV0QixJQUFJLEdBQUcsVUFBVTtTQUNqQixxQkFBcUIsR0FBRyxJQUFJOzs7ZUFIeEIsa0JBQWtCOztXQUtYLG9CQUFDLE1BQU0sRUFBRTtBQUNsQixVQUFJLEdBQUcsWUFBQSxDQUFBO0FBQ1AsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQzNCLFVBQUksS0FBSyxHQUFHLENBQUMsRUFBRTs7OztBQUliLGVBQU8sS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ2xCLGFBQUcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQy9FLGNBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxNQUFLO1NBQ3BCO09BQ0YsTUFBTTtBQUNMLFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0FBQ3pDLGVBQU8sS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ2xCLGFBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQzdFLGNBQUksR0FBRyxJQUFJLE1BQU0sRUFBRSxNQUFLO1NBQ3pCO09BQ0Y7QUFDRCxVQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7S0FDckM7OztXQXZCZ0IsS0FBSzs7OztTQURsQixrQkFBa0I7R0FBUyxNQUFNOztJQTJCakMsNEJBQTRCO1lBQTVCLDRCQUE0Qjs7V0FBNUIsNEJBQTRCOzBCQUE1Qiw0QkFBNEI7OytCQUE1Qiw0QkFBNEI7Ozs7Ozs7ZUFBNUIsNEJBQTRCOztXQUV2QixvQkFBRztBQUNWLGFBQU8sSUFBSSxDQUFDLFdBQVcsNEJBSHJCLDRCQUE0QiwyQ0FHWSxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFBO0tBQ3BEOzs7V0FIZ0IsS0FBSzs7OztTQURsQiw0QkFBNEI7R0FBUyxrQkFBa0I7O0lBVXZELGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOztTQUNyQixJQUFJLEdBQUcsVUFBVTtTQUNqQixJQUFJLEdBQUcsSUFBSTtTQUNYLFlBQVksR0FBRyxDQUFDO1NBQ2hCLGNBQWMsR0FBRyxJQUFJOzs7ZUFKakIsaUJBQWlCOztXQU1WLG9CQUFDLE1BQU0sRUFBRTtBQUNsQixVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFBO0FBQ3hFLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDM0M7OztXQUVZLHdCQUFHO0FBQ2QsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsRUFBRSxDQUFBO0FBQzlELFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFDLENBQUMsQ0FBQTs7QUFFakgsVUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFBO0FBQ3BCLFVBQUksSUFBSSxDQUFDLElBQUksS0FBSyxtQkFBbUIsRUFBRTtBQUNyQyxZQUFNLE1BQU0sR0FBRyxlQUFlLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUE7QUFDckQsWUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUNqQyxlQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxHQUFHLEtBQUssRUFBRSxFQUFDLEdBQUcsRUFBRSxlQUFlLEdBQUcsTUFBTSxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUMsQ0FBQyxDQUFBO09BQ3ZHLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLHNCQUFzQixFQUFFO0FBQy9DLGVBQU8sZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLEdBQUcsZUFBZSxDQUFBLEdBQUksQ0FBQyxDQUFDLENBQUE7T0FDNUUsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssc0JBQXNCLEVBQUU7QUFDL0MsWUFBTSxNQUFNLEdBQUcsY0FBYyxLQUFLLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFBO0FBQ2pGLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDakMsZUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsR0FBRyxLQUFLLEVBQUUsRUFBQyxHQUFHLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxjQUFjLEdBQUcsTUFBTSxFQUFDLENBQUMsQ0FBQTtPQUN0RztLQUNGOzs7U0EzQkcsaUJBQWlCO0dBQVMsTUFBTTs7SUE4QmhDLG9CQUFvQjtZQUFwQixvQkFBb0I7O1dBQXBCLG9CQUFvQjswQkFBcEIsb0JBQW9COzsrQkFBcEIsb0JBQW9COzs7O1NBQXBCLG9CQUFvQjtHQUFTLGlCQUFpQjs7SUFDOUMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7Ozs7Ozs7Ozs7U0FBcEIsb0JBQW9CO0dBQVMsaUJBQWlCOztJQU85QyxNQUFNO1lBQU4sTUFBTTs7V0FBTixNQUFNOzBCQUFOLE1BQU07OytCQUFOLE1BQU07O1NBV1YsY0FBYyxHQUFHLElBQUk7OztlQVhqQixNQUFNOztXQWFGLG1CQUFHO0FBQ1QsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDbkUsVUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3BHLFVBQUksQ0FBQyxjQUFjLEdBQUcsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFBOztBQUU5RSxpQ0FsQkUsTUFBTSx5Q0FrQk87O0FBRWYsVUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDMUIsc0JBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztBQUNuQyxnQkFBUSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUEsR0FBSSxjQUFjLENBQUM7T0FDekcsQ0FBQyxDQUFBO0tBQ0g7OztXQUVVLG9CQUFDLE1BQU0sRUFBRTtBQUNsQixVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLDhCQUE4QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUE7QUFDakcsaUJBQVcsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQTtBQUN0QyxVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLDhCQUE4QixDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3JGLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDL0QsVUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUE7S0FDbkc7OztXQS9CZ0IsS0FBSzs7OztXQUNGLElBQUk7Ozs7V0FDSTtBQUMxQiwwQkFBb0IsRUFBRSxDQUFDO0FBQ3ZCLHdCQUFrQixFQUFFLENBQUMsQ0FBQztBQUN0QiwwQkFBb0IsRUFBRSxHQUFHO0FBQ3pCLHdCQUFrQixFQUFFLENBQUMsR0FBRztBQUN4Qiw2QkFBdUIsRUFBRSxJQUFJO0FBQzdCLDJCQUFxQixFQUFFLENBQUMsSUFBSTtLQUM3Qjs7OztTQVZHLE1BQU07R0FBUyxNQUFNOztJQW1DckIsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7Ozs7U0FBcEIsb0JBQW9CO0dBQVMsTUFBTTs7SUFDbkMsa0JBQWtCO1lBQWxCLGtCQUFrQjs7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OytCQUFsQixrQkFBa0I7Ozs7U0FBbEIsa0JBQWtCO0dBQVMsTUFBTTs7SUFDakMsb0JBQW9CO1lBQXBCLG9CQUFvQjs7V0FBcEIsb0JBQW9COzBCQUFwQixvQkFBb0I7OytCQUFwQixvQkFBb0I7Ozs7U0FBcEIsb0JBQW9CO0dBQVMsTUFBTTs7SUFDbkMsa0JBQWtCO1lBQWxCLGtCQUFrQjs7V0FBbEIsa0JBQWtCOzBCQUFsQixrQkFBa0I7OytCQUFsQixrQkFBa0I7Ozs7U0FBbEIsa0JBQWtCO0dBQVMsTUFBTTs7SUFDakMsdUJBQXVCO1lBQXZCLHVCQUF1Qjs7V0FBdkIsdUJBQXVCOzBCQUF2Qix1QkFBdUI7OytCQUF2Qix1QkFBdUI7Ozs7U0FBdkIsdUJBQXVCO0dBQVMsTUFBTTs7SUFDdEMscUJBQXFCO1lBQXJCLHFCQUFxQjs7V0FBckIscUJBQXFCOzBCQUFyQixxQkFBcUI7OytCQUFyQixxQkFBcUI7Ozs7Ozs7O1NBQXJCLHFCQUFxQjtHQUFTLE1BQU07O0lBS3BDLElBQUk7WUFBSixJQUFJOztXQUFKLElBQUk7MEJBQUosSUFBSTs7K0JBQUosSUFBSTs7U0FDUixTQUFTLEdBQUcsS0FBSztTQUNqQixTQUFTLEdBQUcsSUFBSTtTQUNoQixNQUFNLEdBQUcsQ0FBQztTQUNWLFlBQVksR0FBRyxJQUFJO1NBQ25CLG1CQUFtQixHQUFHLE1BQU07Ozs7O2VBTHhCLElBQUk7O1dBT1csOEJBQUc7QUFDcEIsVUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUE7QUFDeEQsVUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQTtLQUNoQzs7O1dBRWUsMkJBQUc7QUFDakIsVUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7QUFDekIsaUNBZEUsSUFBSSxpREFjaUI7S0FDeEI7OztXQUVVLHNCQUFHOzs7QUFDWixVQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTs7QUFFdEUsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsWUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUMvQyxZQUFNLFdBQVcsR0FBRyxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBQyxDQUFBOztBQUUvQyxZQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7QUFDbEIsY0FBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtTQUM3QixNQUFNO0FBQ0wsY0FBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsRSxjQUFNLE9BQU8sR0FBRztBQUNkLDhCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUM7QUFDMUQscUJBQVMsRUFBRSxtQkFBQSxLQUFLLEVBQUk7QUFDbEIsc0JBQUssS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixrQkFBSSxLQUFLLEVBQUUsUUFBSyxnQkFBZ0IsRUFBRSxDQUFBLEtBQzdCLFFBQUssZUFBZSxFQUFFLENBQUE7YUFDNUI7QUFDRCxvQkFBUSxFQUFFLGtCQUFBLGlCQUFpQixFQUFJO0FBQzdCLHNCQUFLLGlCQUFpQixHQUFHLGlCQUFpQixDQUFBO0FBQzFDLHNCQUFLLHlCQUF5QixDQUFDLFFBQUssaUJBQWlCLEVBQUUsYUFBYSxFQUFFLFFBQUssV0FBVyxFQUFFLENBQUMsQ0FBQTthQUMxRjtBQUNELG9CQUFRLEVBQUUsb0JBQU07QUFDZCxzQkFBSyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQzFDLHNCQUFLLGVBQWUsRUFBRSxDQUFBO2FBQ3ZCO0FBQ0Qsb0JBQVEsRUFBRTtBQUNSLHFEQUF1QyxFQUFFO3VCQUFNLFFBQUssZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7ZUFBQTtBQUN4RSx5REFBMkMsRUFBRTt1QkFBTSxRQUFLLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO2VBQUE7YUFDN0U7V0FDRixDQUFBO0FBQ0QsY0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBO1NBQ3JEO09BQ0Y7QUFDRCxpQ0FuREUsSUFBSSw0Q0FtRFk7S0FDbkI7OztXQUVnQiwwQkFBQyxLQUFLLEVBQUU7QUFDdkIsVUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO0FBQ2pFLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FDMUMsSUFBSSxDQUFDLGlCQUFpQixFQUN0QixhQUFhLEVBQ2IsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUNsQixJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFDM0IsSUFBSSxDQUNMLENBQUE7QUFDRCxZQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7T0FDdkI7S0FDRjs7O1dBRWlCLDZCQUFHO0FBQ25CLFVBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQTtBQUMzRSxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2RCxVQUFJLFdBQVcsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFO0FBQy9GLFlBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQTtBQUM5QixZQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtPQUNyQjtLQUNGOzs7V0FFVyx1QkFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtLQUN0Qjs7O1dBRU8sbUJBQUc7OztBQUNULGlDQWpGRSxJQUFJLHlDQWlGUztBQUNmLFVBQUksY0FBYyxHQUFHLGNBQWMsQ0FBQTtBQUNuQyxVQUFJLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxjQUFXLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDNUQsc0JBQWMsSUFBSSxPQUFPLENBQUE7T0FDMUI7Ozs7OztBQU1ELFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNwQyxVQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFNO0FBQ3RELGdCQUFLLHlCQUF5QixDQUFDLFFBQUssS0FBSyxFQUFFLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQTtPQUN0RSxDQUFDLENBQUE7S0FDSDs7O1dBRVEsa0JBQUMsU0FBUyxFQUFFO0FBQ25CLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3BFLFVBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUNqQixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN2QyxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFBOztBQUUzQyxVQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDakYsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLGlCQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtPQUN0RDs7QUFFRCxVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN0QixZQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsRUFBRSxTQUFTLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUE7O0FBRW5FLFlBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFDLEtBQWEsRUFBSztjQUFqQixLQUFLLEdBQU4sS0FBYSxDQUFaLEtBQUs7Y0FBRSxJQUFJLEdBQVosS0FBYSxDQUFMLElBQUk7O0FBQ3BFLGNBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDckMsa0JBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3hCLGdCQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFBO1dBQzVDO1NBQ0YsQ0FBQyxDQUFBO09BQ0gsTUFBTTtBQUNMLFlBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFBOztBQUV6RixZQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBQyxLQUFhLEVBQUs7Y0FBakIsS0FBSyxHQUFOLEtBQWEsQ0FBWixLQUFLO2NBQUUsSUFBSSxHQUFaLEtBQWEsQ0FBTCxJQUFJOztBQUMzRCxjQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3hDLGtCQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN4QixnQkFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQTtXQUM1QztTQUNGLENBQUMsQ0FBQTtPQUNIOztBQUVELFVBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUNyQyxVQUFJLEtBQUssRUFBRSxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDL0M7Ozs7O1dBR3lCLG1DQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFvRDtVQUFsRCxLQUFLLHlEQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDO1VBQUUsV0FBVyx5REFBRyxLQUFLOztBQUMxRyxVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLE9BQU07O0FBRWhELGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQ3BELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQ25CLGNBQWMsRUFDZCxTQUFTLEVBQ1QsSUFBSSxDQUFDLE1BQU0sRUFDWCxLQUFLLEVBQ0wsV0FBVyxDQUNaLENBQUE7S0FDRjs7O1dBRVUsb0JBQUMsTUFBTSxFQUFFO0FBQ2xCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQTtBQUN2RCxVQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUEsS0FDckMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7O0FBRTlCLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUM5RDs7O1dBRVEsa0JBQUMsSUFBSSxFQUFFO0FBQ2QsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFBO0FBQ3pELGFBQU8sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDeEQ7OztTQTdKRyxJQUFJO0dBQVMsTUFBTTs7SUFpS25CLGFBQWE7WUFBYixhQUFhOztXQUFiLGFBQWE7MEJBQWIsYUFBYTs7K0JBQWIsYUFBYTs7U0FDakIsU0FBUyxHQUFHLEtBQUs7U0FDakIsU0FBUyxHQUFHLElBQUk7Ozs7U0FGWixhQUFhO0dBQVMsSUFBSTs7SUFNMUIsSUFBSTtZQUFKLElBQUk7O1dBQUosSUFBSTswQkFBSixJQUFJOzsrQkFBSixJQUFJOztTQUNSLE1BQU0sR0FBRyxDQUFDOzs7OztlQUROLElBQUk7O1dBRUMsb0JBQVU7d0NBQU4sSUFBSTtBQUFKLFlBQUk7OztBQUNmLFVBQU0sS0FBSyw4QkFIVCxJQUFJLDJDQUcwQixJQUFJLENBQUMsQ0FBQTtBQUNyQyxVQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUE7QUFDbEMsYUFBTyxLQUFLLENBQUE7S0FDYjs7O1NBTkcsSUFBSTtHQUFTLElBQUk7O0lBVWpCLGFBQWE7WUFBYixhQUFhOztXQUFiLGFBQWE7MEJBQWIsYUFBYTs7K0JBQWIsYUFBYTs7U0FDakIsU0FBUyxHQUFHLEtBQUs7U0FDakIsU0FBUyxHQUFHLElBQUk7Ozs7OztTQUZaLGFBQWE7R0FBUyxJQUFJOztJQVExQixVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7O1NBQ2QsSUFBSSxHQUFHLElBQUk7U0FDWCxZQUFZLEdBQUcsSUFBSTtTQUNuQixLQUFLLEdBQUcsSUFBSTtTQUNaLDBCQUEwQixHQUFHLEtBQUs7Ozs7O2VBSjlCLFVBQVU7O1dBTUgsc0JBQUc7QUFDWixVQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDZixpQ0FSRSxVQUFVLDRDQVFNO0tBQ25COzs7V0FFVSxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM5QyxVQUFJLEtBQUssRUFBRTtBQUNULFlBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO0FBQ25DLGVBQUssR0FBRyxJQUFJLENBQUMscUNBQXFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQzlEO0FBQ0QsY0FBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQy9CLGNBQU0sQ0FBQyxVQUFVLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQTtPQUNsQztLQUNGOzs7U0FwQkcsVUFBVTtHQUFTLE1BQU07O0lBd0J6QixjQUFjO1lBQWQsY0FBYzs7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OytCQUFkLGNBQWM7O1NBQ2xCLElBQUksR0FBRyxVQUFVO1NBQ2pCLDBCQUEwQixHQUFHLElBQUk7Ozs7O1NBRjdCLGNBQWM7R0FBUyxVQUFVOztJQU9qQyxZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7OytCQUFaLFlBQVk7O1NBRWhCLElBQUksR0FBRyxlQUFlO1NBQ3RCLEtBQUssR0FBRyxJQUFJO1NBQ1osU0FBUyxHQUFHLElBQUk7OztlQUpaLFlBQVk7O1dBTVIsbUJBQUc7QUFDVCxVQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzNELGlDQVJFLFlBQVkseUNBUUM7S0FDaEI7OztXQUVPLG1CQUFHOzs7QUFDVCxVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVM7ZUFBSSxTQUFTLENBQUMsUUFBSyxLQUFLLENBQUMsQ0FBQyxHQUFHO09BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO2VBQUssQ0FBQyxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDOUYsVUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsRUFBRTtBQUNqQyxlQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUN0QixNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUE7T0FDWjtLQUNGOzs7V0FFUyxtQkFBQyxNQUFNLEVBQUUsRUFBRSxFQUFFOzs7QUFDckIsVUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQ3ZDLGFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNoQyxZQUFJLFFBQUssU0FBUyxLQUFLLFVBQVUsRUFBRTtBQUNqQyxpQkFBTyxHQUFHLEdBQUcsU0FBUyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNsQyxNQUFNO0FBQ0wsaUJBQU8sR0FBRyxHQUFHLFNBQVMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDbEM7T0FDRixDQUFDLENBQUE7S0FDSDs7O1dBRU8saUJBQUMsTUFBTSxFQUFFO0FBQ2YsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtlQUFNLElBQUk7T0FBQSxDQUFDLENBQUE7S0FDMUM7OztXQUVVLG9CQUFDLE1BQU0sRUFBRTs7O0FBQ2xCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsWUFBTTtBQUN0QyxZQUFNLEdBQUcsR0FBRyxRQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoQyxZQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsUUFBSyxLQUFLLENBQUMsK0JBQStCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFBO09BQ3pFLENBQUMsQ0FBQTtLQUNIOzs7V0F2Q2dCLEtBQUs7Ozs7U0FEbEIsWUFBWTtHQUFTLE1BQU07O0lBMkMzQix1QkFBdUI7WUFBdkIsdUJBQXVCOztXQUF2Qix1QkFBdUI7MEJBQXZCLHVCQUF1Qjs7K0JBQXZCLHVCQUF1Qjs7U0FDM0IsS0FBSyxHQUFHLE9BQU87U0FDZixTQUFTLEdBQUcsVUFBVTs7O1NBRmxCLHVCQUF1QjtHQUFTLFlBQVk7O0lBSzVDLG1CQUFtQjtZQUFuQixtQkFBbUI7O1dBQW5CLG1CQUFtQjswQkFBbkIsbUJBQW1COzsrQkFBbkIsbUJBQW1COztTQUN2QixLQUFLLEdBQUcsT0FBTztTQUNmLFNBQVMsR0FBRyxNQUFNOzs7U0FGZCxtQkFBbUI7R0FBUyxZQUFZOztJQUt4QyxxQkFBcUI7WUFBckIscUJBQXFCOztXQUFyQixxQkFBcUI7MEJBQXJCLHFCQUFxQjs7K0JBQXJCLHFCQUFxQjs7U0FDekIsS0FBSyxHQUFHLEtBQUs7U0FDYixTQUFTLEdBQUcsVUFBVTs7O1NBRmxCLHFCQUFxQjtHQUFTLFlBQVk7O0lBSzFDLGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOztTQUNyQixLQUFLLEdBQUcsS0FBSztTQUNiLFNBQVMsR0FBRyxNQUFNOzs7O1NBRmQsaUJBQWlCO0dBQVMsWUFBWTs7SUFNdEMsc0JBQXNCO1lBQXRCLHNCQUFzQjs7V0FBdEIsc0JBQXNCOzBCQUF0QixzQkFBc0I7OytCQUF0QixzQkFBc0I7O1NBQzFCLEtBQUssR0FBRyxPQUFPO1NBQ2YsU0FBUyxHQUFHLFVBQVU7OztlQUZsQixzQkFBc0I7O1dBR2xCLGlCQUFDLE1BQU0sRUFBRTs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFBLEdBQUc7ZUFBSSxRQUFLLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxRQUFLLE1BQU0sRUFBRSxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDaEc7OztTQUxHLHNCQUFzQjtHQUFTLFlBQVk7O0lBUTNDLGtCQUFrQjtZQUFsQixrQkFBa0I7O1dBQWxCLGtCQUFrQjswQkFBbEIsa0JBQWtCOzsrQkFBbEIsa0JBQWtCOztTQUN0QixTQUFTLEdBQUcsTUFBTTs7O1NBRGQsa0JBQWtCO0dBQVMsc0JBQXNCOztJQUlqRCxzREFBc0Q7WUFBdEQsc0RBQXNEOztXQUF0RCxzREFBc0Q7MEJBQXRELHNEQUFzRDs7K0JBQXRELHNEQUFzRDs7O2VBQXRELHNEQUFzRDs7V0FDbEQsbUJBQUc7QUFDVCxpQ0FGRSxzREFBc0QseUNBRXpDO0FBQ2YsVUFBSSxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzVEOzs7U0FKRyxzREFBc0Q7R0FBUyxzQkFBc0I7O0lBT3JGLGtEQUFrRDtZQUFsRCxrREFBa0Q7O1dBQWxELGtEQUFrRDswQkFBbEQsa0RBQWtEOzsrQkFBbEQsa0RBQWtEOztTQUN0RCxTQUFTLEdBQUcsTUFBTTs7OztTQURkLGtEQUFrRDtHQUFTLHNEQUFzRDs7SUFLakgsMEJBQTBCO1lBQTFCLDBCQUEwQjs7V0FBMUIsMEJBQTBCOzBCQUExQiwwQkFBMEI7OytCQUExQiwwQkFBMEI7OztlQUExQiwwQkFBMEI7O1dBR3RCLGlCQUFDLE1BQU0sRUFBRTs7O0FBQ2YsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUE7QUFDdEcsVUFBTSx1QkFBdUIsR0FBRyxTQUExQix1QkFBdUIsQ0FBRyxHQUFHO2VBQUksUUFBSyxNQUFNLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDO09BQUEsQ0FBQTtBQUMvRSxVQUFNLGVBQWUsR0FBRyxnQkFBZ0IsR0FBRyx1QkFBdUIsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2xHLFVBQU0sa0JBQWtCLEdBQUcsU0FBckIsa0JBQWtCLENBQUcsS0FBSztlQUFJLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssZUFBZTtPQUFBLENBQUE7O0FBRWhHLFVBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQTtBQUN2QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7QUFDdEcsVUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUM3QyxZQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsUUFBSyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUE7QUFDckMsWUFBSSxRQUFLLFNBQVMsS0FBSyxVQUFVLEVBQUU7QUFDakMsaUJBQU8sR0FBRyxHQUFHLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUN4RCxNQUFNO0FBQ0wsaUJBQU8sR0FBRyxHQUFHLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUN4RDtPQUNGLENBQUMsQ0FBQTtBQUNGLFVBQUksU0FBUyxFQUFFO0FBQ2IsZUFBTyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQTtPQUNqQztLQUNGOzs7V0FyQmdCLEtBQUs7Ozs7U0FEbEIsMEJBQTBCO0dBQVMsWUFBWTs7SUF5Qi9DLHFDQUFxQztZQUFyQyxxQ0FBcUM7O1dBQXJDLHFDQUFxQzswQkFBckMscUNBQXFDOzsrQkFBckMscUNBQXFDOztTQUN6QyxLQUFLLEdBQUcsT0FBTztTQUNmLFNBQVMsR0FBRyxVQUFVOzs7U0FGbEIscUNBQXFDO0dBQVMsMEJBQTBCOztJQUt4RSxpQ0FBaUM7WUFBakMsaUNBQWlDOztXQUFqQyxpQ0FBaUM7MEJBQWpDLGlDQUFpQzs7K0JBQWpDLGlDQUFpQzs7U0FDckMsS0FBSyxHQUFHLE9BQU87U0FDZixTQUFTLEdBQUcsTUFBTTs7O1NBRmQsaUNBQWlDO0dBQVMsMEJBQTBCOztJQUtwRSxtQ0FBbUM7WUFBbkMsbUNBQW1DOztXQUFuQyxtQ0FBbUM7MEJBQW5DLG1DQUFtQzs7K0JBQW5DLG1DQUFtQzs7U0FDdkMsS0FBSyxHQUFHLEtBQUs7U0FDYixTQUFTLEdBQUcsVUFBVTs7O1NBRmxCLG1DQUFtQztHQUFTLDBCQUEwQjs7SUFLdEUsK0JBQStCO1lBQS9CLCtCQUErQjs7V0FBL0IsK0JBQStCOzBCQUEvQiwrQkFBK0I7OytCQUEvQiwrQkFBK0I7O1NBQ25DLEtBQUssR0FBRyxLQUFLO1NBQ2IsU0FBUyxHQUFHLE1BQU07Ozs7O1NBRmQsK0JBQStCO0dBQVMsMEJBQTBCOztJQU9sRSxhQUFhO1lBQWIsYUFBYTs7V0FBYixhQUFhOzBCQUFiLGFBQWE7OytCQUFiLGFBQWE7O1NBRWpCLFNBQVMsR0FBRyxVQUFVO1NBQ3RCLEtBQUssR0FBRyxHQUFHOzs7ZUFIUCxhQUFhOztXQUtOLG9CQUFDLE1BQU0sRUFBRTs7O0FBQ2xCLFVBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsWUFBTTtBQUN0QyxZQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUNqRCxZQUFNLEtBQUssR0FBRyxRQUFLLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxRQUFLLE1BQU0sRUFBRSxjQUFjLEVBQUUsUUFBSyxTQUFTLEVBQUUsUUFBSyxLQUFLLENBQUMsQ0FBQTtBQUNsSCxZQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDM0MsQ0FBQyxDQUFBO0tBQ0g7OztXQVZnQixLQUFLOzs7O1NBRGxCLGFBQWE7R0FBUyxNQUFNOztJQWM1QixvQkFBb0I7WUFBcEIsb0JBQW9COztXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7K0JBQXBCLG9CQUFvQjs7U0FDeEIsU0FBUyxHQUFHLFVBQVU7U0FDdEIsS0FBSyxHQUFHLGNBQWM7OztTQUZsQixvQkFBb0I7R0FBUyxhQUFhOztJQUsxQyxnQkFBZ0I7WUFBaEIsZ0JBQWdCOztXQUFoQixnQkFBZ0I7MEJBQWhCLGdCQUFnQjs7K0JBQWhCLGdCQUFnQjs7U0FDcEIsU0FBUyxHQUFHLFNBQVM7OztTQURqQixnQkFBZ0I7R0FBUyxvQkFBb0I7O0lBSTdDLG9CQUFvQjtZQUFwQixvQkFBb0I7O1dBQXBCLG9CQUFvQjswQkFBcEIsb0JBQW9COzsrQkFBcEIsb0JBQW9COztTQUN4QixTQUFTLEdBQUcsVUFBVTtTQUN0QixLQUFLLEdBQUcsa0JBQWtCOzs7U0FGdEIsb0JBQW9CO0dBQVMsYUFBYTs7SUFLMUMsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7V0FBaEIsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7OytCQUFoQixnQkFBZ0I7O1NBQ3BCLFNBQVMsR0FBRyxTQUFTOzs7U0FEakIsZ0JBQWdCO0dBQVMsb0JBQW9COztJQUk3QyxvQkFBb0I7WUFBcEIsb0JBQW9COztXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7K0JBQXBCLG9CQUFvQjs7U0FHeEIsSUFBSSxHQUFHLElBQUk7U0FDWCxTQUFTLEdBQUcsTUFBTTs7O2VBSmQsb0JBQW9COztXQU1oQixtQkFBRztBQUNULFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO09BQUEsQ0FBQyxDQUFDLENBQUE7QUFDL0csaUNBUkUsb0JBQW9CLHlDQVFQO0tBQ2hCOzs7V0FFVSxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDdEcsVUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQTtBQUN6QixZQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUE7O0FBRXBELFVBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN0QyxVQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBRTtBQUN6QixZQUFJLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7T0FDM0Q7O0FBRUQsVUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7QUFDN0MsWUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUE7T0FDN0M7S0FDRjs7O1dBRVEsa0JBQUMsU0FBUyxFQUFFO0FBQ25CLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUNsRixhQUFPLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEdBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQTtLQUN0RDs7Ozs7V0EzQnFCLCtDQUErQzs7OztTQUZqRSxvQkFBb0I7R0FBUyxNQUFNOztJQWdDbkMsd0JBQXdCO1lBQXhCLHdCQUF3Qjs7V0FBeEIsd0JBQXdCOzBCQUF4Qix3QkFBd0I7OytCQUF4Qix3QkFBd0I7O1NBQzVCLFNBQVMsR0FBRyxVQUFVOzs7Ozs7ZUFEbEIsd0JBQXdCOztXQUduQixrQkFBQyxTQUFTLEVBQUU7QUFDbkIsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QyxVQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUNuRSxVQUFNLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ3pFLGFBQU8sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFBO0tBQ3JDOzs7U0FSRyx3QkFBd0I7R0FBUyxvQkFBb0I7O0lBYXJELFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FDZCxTQUFTLEdBQUcsSUFBSTtTQUNoQixJQUFJLEdBQUcsSUFBSTtTQUNYLE1BQU0sR0FBRyxDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsZUFBZSxDQUFDOzs7ZUFIckQsVUFBVTs7V0FLSCxvQkFBQyxNQUFNLEVBQUU7QUFDbEIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuQyxVQUFJLEtBQUssRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDM0M7OztXQUVjLHdCQUFDLEtBQUssRUFBRTtBQUNyQixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUM1RCxVQUFJLENBQUMsUUFBUSxFQUFFLE9BQU07O1VBRWhCLFNBQVMsR0FBZ0IsUUFBUSxDQUFqQyxTQUFTO1VBQUUsVUFBVSxHQUFJLFFBQVEsQ0FBdEIsVUFBVTs7QUFDMUIsZUFBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakQsZ0JBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFVBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ25FLGVBQU8sVUFBVSxDQUFDLEtBQUssQ0FBQTtPQUN4QjtBQUNELFVBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3JFLGVBQU8sU0FBUyxDQUFDLEtBQUssQ0FBQTtPQUN2QjtLQUNGOzs7V0FFUSxrQkFBQyxNQUFNLEVBQUU7QUFDaEIsVUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDakQsVUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQTtBQUNwQyxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ2pELFVBQUksS0FBSyxFQUFFLE9BQU8sS0FBSyxDQUFBOzs7QUFHdkIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzNHLFVBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTTs7VUFFWCxLQUFLLEdBQVMsS0FBSyxDQUFuQixLQUFLO1VBQUUsR0FBRyxHQUFJLEtBQUssQ0FBWixHQUFHOztBQUNqQixVQUFJLEtBQUssQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsRUFBRTs7QUFFekUsZUFBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUM5QixNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxjQUFjLENBQUMsR0FBRyxFQUFFOzs7QUFHekMsZUFBTyxLQUFLLENBQUE7T0FDYjtLQUNGOzs7U0E1Q0csVUFBVTtHQUFTLE1BQU07O0FBK0MvQixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsUUFBTSxFQUFOLE1BQU07QUFDTixrQkFBZ0IsRUFBaEIsZ0JBQWdCO0FBQ2hCLFVBQVEsRUFBUixRQUFRO0FBQ1IsV0FBUyxFQUFULFNBQVM7QUFDVCx1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLFFBQU0sRUFBTixNQUFNO0FBQ04sWUFBVSxFQUFWLFVBQVU7QUFDVixVQUFRLEVBQVIsUUFBUTtBQUNSLGNBQVksRUFBWixZQUFZO0FBQ1osY0FBWSxFQUFaLFlBQVk7QUFDWixnQkFBYyxFQUFkLGNBQWM7QUFDZCxjQUFZLEVBQVosWUFBWTtBQUNaLGdCQUFjLEVBQWQsY0FBYztBQUNkLGNBQVksRUFBWixZQUFZO0FBQ1osZ0JBQWMsRUFBZCxjQUFjO0FBQ2QscUJBQW1CLEVBQW5CLG1CQUFtQjtBQUNuQiw0QkFBMEIsRUFBMUIsMEJBQTBCO0FBQzFCLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsZ0NBQThCLEVBQTlCLDhCQUE4QjtBQUM5Qix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsaUJBQWUsRUFBZixlQUFlO0FBQ2Ysc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQiw2QkFBMkIsRUFBM0IsMkJBQTJCO0FBQzNCLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLDhCQUE0QixFQUE1Qiw0QkFBNEI7QUFDNUIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLGdDQUE4QixFQUE5Qiw4QkFBOEI7QUFDOUIsb0NBQWtDLEVBQWxDLGtDQUFrQztBQUNsQyxxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLHlCQUF1QixFQUF2Qix1QkFBdUI7QUFDdkIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsY0FBWSxFQUFaLFlBQVk7QUFDWiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLDBDQUF3QyxFQUF4Qyx3Q0FBd0M7QUFDeEMsNEJBQTBCLEVBQTFCLDBCQUEwQjtBQUMxQiw4QkFBNEIsRUFBNUIsNEJBQTRCO0FBQzVCLGdDQUE4QixFQUE5Qiw4QkFBOEI7QUFDOUIsbUNBQWlDLEVBQWpDLGlDQUFpQztBQUNqQyxvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLDZCQUEyQixFQUEzQiwyQkFBMkI7QUFDM0Isa0NBQWdDLEVBQWhDLGdDQUFnQztBQUNoQyxpQ0FBK0IsRUFBL0IsK0JBQStCO0FBQy9CLGlCQUFlLEVBQWYsZUFBZTtBQUNmLGdCQUFjLEVBQWQsY0FBYztBQUNkLHFCQUFtQixFQUFuQixtQkFBbUI7QUFDbkIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQiw4QkFBNEIsRUFBNUIsNEJBQTRCO0FBQzVCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLFFBQU0sRUFBTixNQUFNO0FBQ04sc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQix5QkFBdUIsRUFBdkIsdUJBQXVCO0FBQ3ZCLHVCQUFxQixFQUFyQixxQkFBcUI7QUFDckIsTUFBSSxFQUFKLElBQUk7QUFDSixlQUFhLEVBQWIsYUFBYTtBQUNiLE1BQUksRUFBSixJQUFJO0FBQ0osZUFBYSxFQUFiLGFBQWE7QUFDYixZQUFVLEVBQVYsVUFBVTtBQUNWLGdCQUFjLEVBQWQsY0FBYztBQUNkLGNBQVksRUFBWixZQUFZO0FBQ1oseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2QixxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLDRCQUEwQixFQUExQiwwQkFBMEI7QUFDMUIsdUNBQXFDLEVBQXJDLHFDQUFxQztBQUNyQyxtQ0FBaUMsRUFBakMsaUNBQWlDO0FBQ2pDLHFDQUFtQyxFQUFuQyxtQ0FBbUM7QUFDbkMsaUNBQStCLEVBQS9CLCtCQUErQjtBQUMvQix1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsd0JBQXNCLEVBQXRCLHNCQUFzQjtBQUN0QixvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLHdEQUFzRCxFQUF0RCxzREFBc0Q7QUFDdEQsb0RBQWtELEVBQWxELGtEQUFrRDtBQUNsRCxlQUFhLEVBQWIsYUFBYTtBQUNiLHNCQUFvQixFQUFwQixvQkFBb0I7QUFDcEIsa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLGtCQUFnQixFQUFoQixnQkFBZ0I7QUFDaEIsc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQiwwQkFBd0IsRUFBeEIsd0JBQXdCO0FBQ3hCLFlBQVUsRUFBVixVQUFVO0NBQ1gsQ0FBQSIsImZpbGUiOiIvaG9tZS9qYXp6Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpXG5cbmNvbnN0IEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKVxuXG5jbGFzcyBNb3Rpb24gZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSAnbW90aW9uJ1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG5cbiAgb3BlcmF0b3IgPSBudWxsXG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIHdpc2UgPSAnY2hhcmFjdGVyd2lzZSdcbiAganVtcCA9IGZhbHNlXG4gIHZlcnRpY2FsTW90aW9uID0gZmFsc2VcbiAgbW92ZVN1Y2NlZWRlZCA9IG51bGxcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgcmVxdWlyZUlucHV0ID0gZmFsc2VcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9IG51bGxcblxuICBpc1JlYWR5ICgpIHtcbiAgICByZXR1cm4gIXRoaXMucmVxdWlyZUlucHV0IHx8IHRoaXMuaW5wdXQgIT0gbnVsbFxuICB9XG5cbiAgaXNMaW5ld2lzZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gJ2xpbmV3aXNlJ1xuICB9XG5cbiAgaXNCbG9ja3dpc2UgKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09ICdibG9ja3dpc2UnXG4gIH1cblxuICBmb3JjZVdpc2UgKHdpc2UpIHtcbiAgICBpZiAod2lzZSA9PT0gJ2NoYXJhY3Rlcndpc2UnKSB7XG4gICAgICB0aGlzLmluY2x1c2l2ZSA9IHRoaXMud2lzZSA9PT0gJ2xpbmV3aXNlJyA/IGZhbHNlIDogIXRoaXMuaW5jbHVzaXZlXG4gICAgfVxuICAgIHRoaXMud2lzZSA9IHdpc2VcbiAgfVxuXG4gIHJlc2V0U3RhdGUgKCkge1xuICAgIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgfVxuXG4gIG1vdmVXaXRoU2F2ZUp1bXAgKGN1cnNvcikge1xuICAgIGNvbnN0IG9yaWdpbmFsUG9zaXRpb24gPSB0aGlzLmp1bXAgJiYgY3Vyc29yLmlzTGFzdEN1cnNvcigpID8gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkgOiB1bmRlZmluZWRcblxuICAgIHRoaXMubW92ZUN1cnNvcihjdXJzb3IpXG5cbiAgICBpZiAob3JpZ2luYWxQb3NpdGlvbiAmJiAhY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkuaXNFcXVhbChvcmlnaW5hbFBvc2l0aW9uKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldCgnYCcsIG9yaWdpbmFsUG9zaXRpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiJ1wiLCBvcmlnaW5hbFBvc2l0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICh0aGlzLm9wZXJhdG9yKSB7XG4gICAgICB0aGlzLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICB0aGlzLm1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5tZXJnZUN1cnNvcnMoKVxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gIH1cblxuICAvLyBOT1RFOiBzZWxlY3Rpb24gaXMgYWxyZWFkeSBcIm5vcm1hbGl6ZWRcIiBiZWZvcmUgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gIHNlbGVjdCAoKSB7XG4gICAgLy8gbmVlZCB0byBjYXJlIHdhcyB2aXN1YWwgZm9yIGAuYCByZXBlYXRlZC5cbiAgICBjb25zdCBpc09yV2FzVmlzdWFsID0gdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3RCYXNlJykgfHwgdGhpcy5uYW1lID09PSAnQ3VycmVudFNlbGVjdGlvbidcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbigoKSA9PiB0aGlzLm1vdmVXaXRoU2F2ZUp1bXAoc2VsZWN0aW9uLmN1cnNvcikpXG5cbiAgICAgIGNvbnN0IHNlbGVjdFN1Y2NlZWRlZCA9XG4gICAgICAgIHRoaXMubW92ZVN1Y2NlZWRlZCAhPSBudWxsXG4gICAgICAgICAgPyB0aGlzLm1vdmVTdWNjZWVkZWRcbiAgICAgICAgICA6ICFzZWxlY3Rpb24uaXNFbXB0eSgpIHx8ICh0aGlzLmlzTGluZXdpc2UoKSAmJiB0aGlzLm1vdmVTdWNjZXNzT25MaW5ld2lzZSlcbiAgICAgIGlmICghdGhpcy5zZWxlY3RTdWNjZWVkZWQpIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gc2VsZWN0U3VjY2VlZGVkXG5cbiAgICAgIGlmIChpc09yV2FzVmlzdWFsIHx8IChzZWxlY3RTdWNjZWVkZWQgJiYgKHRoaXMuaW5jbHVzaXZlIHx8IHRoaXMuaXNMaW5ld2lzZSgpKSkpIHtcbiAgICAgICAgY29uc3QgJHNlbGVjdGlvbiA9IHRoaXMuc3dyYXAoc2VsZWN0aW9uKVxuICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKHRydWUpIC8vIHNhdmUgcHJvcGVydHkgb2YgXCJhbHJlYWR5LW5vcm1hbGl6ZWQtc2VsZWN0aW9uXCJcbiAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UodGhpcy53aXNlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLndpc2UgPT09ICdibG9ja3dpc2UnKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcbiAgICB9XG4gIH1cblxuICBzZXRDdXJzb3JCdWZmZXJSb3cgKGN1cnNvciwgcm93LCBvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMudmVydGljYWxNb3Rpb24gJiYgIXRoaXMuZ2V0Q29uZmlnKCdzdGF5T25WZXJ0aWNhbE1vdGlvbicpKSB7XG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdyksIG9wdGlvbnMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIC8vIENhbGwgY2FsbGJhY2sgY291bnQgdGltZXMuXG4gIC8vIEJ1dCBicmVhayBpdGVyYXRpb24gd2hlbiBjdXJzb3IgcG9zaXRpb24gZGlkIG5vdCBjaGFuZ2UgYmVmb3JlL2FmdGVyIGNhbGxiYWNrLlxuICBtb3ZlQ3Vyc29yQ291bnRUaW1lcyAoY3Vyc29yLCBmbikge1xuICAgIGxldCBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGhpcy5jb3VudFRpbWVzKHRoaXMuZ2V0Q291bnQoKSwgc3RhdGUgPT4ge1xuICAgICAgZm4oc3RhdGUpXG4gICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAobmV3UG9zaXRpb24uaXNFcXVhbChvbGRQb3NpdGlvbikpIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuICAgIH0pXG4gIH1cblxuICBpc0Nhc2VTZW5zaXRpdmUgKHRlcm0pIHtcbiAgICBpZiAodGhpcy5nZXRDb25maWcoYHVzZVNtYXJ0Y2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApKSB7XG4gICAgICByZXR1cm4gdGVybS5zZWFyY2goL1tBLVpdLykgIT09IC0xXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAhdGhpcy5nZXRDb25maWcoYGlnbm9yZUNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKVxuICAgIH1cbiAgfVxuXG4gIGdldExhc3RSZXNvcnRQb2ludCAoZGlyZWN0aW9uKSB7XG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUG9pbnQoMCwgMClcbiAgICB9XG4gIH1cbn1cblxuLy8gVXNlZCBhcyBvcGVyYXRvcidzIHRhcmdldCBpbiB2aXN1YWwtbW9kZS5cbmNsYXNzIEN1cnJlbnRTZWxlY3Rpb24gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHNlbGVjdGlvbkV4dGVudCA9IG51bGxcbiAgYmxvY2t3aXNlU2VsZWN0aW9uRXh0ZW50ID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG4gIHBvaW50SW5mb0J5Q3Vyc29yID0gbmV3IE1hcCgpXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uRXh0ZW50ID0gdGhpcy5pc0Jsb2Nrd2lzZSgpXG4gICAgICAgID8gdGhpcy5zd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgICA6IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKS5nZXRFeHRlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodGhpcy5zZWxlY3Rpb25FeHRlbnQpKVxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdCAoKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICBjb25zdCBwb2ludEluZm8gPSB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLmdldChjdXJzb3IpXG4gICAgICAgIGlmIChwb2ludEluZm8pIHtcbiAgICAgICAgICBjb25zdCB7Y3Vyc29yUG9zaXRpb24sIHN0YXJ0T2ZTZWxlY3Rpb259ID0gcG9pbnRJbmZvXG4gICAgICAgICAgaWYgKGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKSB7XG4gICAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnRPZlNlbGVjdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfVxuXG4gICAgLy8gKiBQdXJwb3NlIG9mIHBvaW50SW5mb0J5Q3Vyc29yPyBzZWUgIzIzNSBmb3IgZGV0YWlsLlxuICAgIC8vIFdoZW4gc3RheU9uVHJhbnNmb3JtU3RyaW5nIGlzIGVuYWJsZWQsIGN1cnNvciBwb3MgaXMgbm90IHNldCBvbiBzdGFydCBvZlxuICAgIC8vIG9mIHNlbGVjdGVkIHJhbmdlLlxuICAgIC8vIEJ1dCBJIHdhbnQgZm9sbG93aW5nIGJlaGF2aW9yLCBzbyBuZWVkIHRvIHByZXNlcnZlIHBvc2l0aW9uIGluZm8uXG4gICAgLy8gIDEuIGB2aj4uYCAtPiBpbmRlbnQgc2FtZSB0d28gcm93cyByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY3Vyc29yJ3Mgcm93LlxuICAgIC8vICAyLiBgdmo+ai5gIC0+IGluZGVudCB0d28gcm93cyBmcm9tIGN1cnNvcidzIHJvdy5cbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIGNvbnN0IHN0YXJ0T2ZTZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIHRoaXMucG9pbnRJbmZvQnlDdXJzb3Iuc2V0KGN1cnNvciwge3N0YXJ0T2ZTZWxlY3Rpb24sIGN1cnNvclBvc2l0aW9ufSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIE1vdmVMZWZ0IGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5nZXRDb25maWcoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nKVxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge2FsbG93V3JhcH0pXG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlUmlnaHQgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICBjb25zdCBhbGxvd1dyYXAgPSB0aGlzLmdldENvbmZpZygnd3JhcExlZnRSaWdodE1vdGlvbicpXG5cbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcblxuICAgICAgLy8gLSBXaGVuIGB3cmFwTGVmdFJpZ2h0TW90aW9uYCBlbmFibGVkIGFuZCBleGVjdXRlZCBhcyBwdXJlLW1vdGlvbiBpbiBgbm9ybWFsLW1vZGVgLFxuICAgICAgLy8gICB3ZSBuZWVkIHRvIG1vdmUgKiphZ2FpbioqIHRvIHdyYXAgdG8gbmV4dC1saW5lIGlmIGl0IHJhY2hlZCB0byBFT0wuXG4gICAgICAvLyAtIEV4cHJlc3Npb24gYCF0aGlzLm9wZXJhdG9yYCBtZWFucyBub3JtYWwtbW9kZSBtb3Rpb24uXG4gICAgICAvLyAtIEV4cHJlc3Npb24gYHRoaXMubW9kZSA9PT0gXCJub3JtYWxcImAgaXMgbm90IGFwcHJvcHJlYXRlIHNpbmNlIGl0IG1hdGNoZXMgYHhgIG9wZXJhdG9yJ3MgdGFyZ2V0IGNhc2UuXG4gICAgICBjb25zdCBuZWVkTW92ZUFnYWluID0gYWxsb3dXcmFwICYmICF0aGlzLm9wZXJhdG9yICYmICFjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG5cbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclJpZ2h0KGN1cnNvciwge2FsbG93V3JhcH0pXG5cbiAgICAgIGlmIChuZWVkTW92ZUFnYWluICYmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkpIHtcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVSaWdodEJ1ZmZlckNvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyB0aGlzLmdldENvdW50KCkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgd3JhcCA9IGZhbHNlXG4gIGRpcmVjdGlvbiA9ICd1cCdcblxuICBnZXRCdWZmZXJSb3cgKHJvdykge1xuICAgIGNvbnN0IG1pbiA9IDBcbiAgICBjb25zdCBtYXggPSB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKVxuXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhyb3cpIC0gMVxuICAgICAgcm93ID0gdGhpcy53cmFwICYmIHJvdyA8IG1pbiA/IG1heCA6IHRoaXMubGltaXROdW1iZXIocm93LCB7bWlufSlcbiAgICB9IGVsc2Uge1xuICAgICAgcm93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KHJvdykgKyAxXG4gICAgICByb3cgPSB0aGlzLndyYXAgJiYgcm93ID4gbWF4ID8gbWluIDogdGhpcy5saW1pdE51bWJlcihyb3csIHttYXh9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3cocm93KVxuICB9XG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgcm93KVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVVwV3JhcCBleHRlbmRzIE1vdmVVcCB7XG4gIHdyYXAgPSB0cnVlXG59XG5cbmNsYXNzIE1vdmVEb3duIGV4dGVuZHMgTW92ZVVwIHtcbiAgZGlyZWN0aW9uID0gJ2Rvd24nXG59XG5cbmNsYXNzIE1vdmVEb3duV3JhcCBleHRlbmRzIE1vdmVEb3duIHtcbiAgd3JhcCA9IHRydWVcbn1cblxuY2xhc3MgTW92ZVVwU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgZGlyZWN0aW9uID0gJ3VwJ1xuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yVXBTY3JlZW4oY3Vyc29yKVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZURvd25TY3JlZW4gZXh0ZW5kcyBNb3ZlVXBTY3JlZW4ge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBkaXJlY3Rpb24gPSAnZG93bidcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50IChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCB7Y29sdW1uLCByb3c6IHN0YXJ0Um93fSA9IGZyb21Qb2ludFxuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0U2NyZWVuUm93cyh7c3RhcnRSb3csIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb259KSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pXG4gICAgICBpZiAodGhpcy5pc0VkZ2UocG9pbnQpKSByZXR1cm4gcG9pbnRcbiAgICB9XG4gIH1cblxuICBpc0VkZ2UgKHBvaW50KSB7XG4gICAgLy8gSWYgcG9pbnQgaXMgc3RvcHBhYmxlIGFuZCBhYm92ZSBvciBiZWxvdyBwb2ludCBpcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuaXNTdG9wcGFibGUocG9pbnQpICYmXG4gICAgICAoIXRoaXMuaXNTdG9wcGFibGUocG9pbnQudHJhbnNsYXRlKFstMSwgMF0pKSB8fCAhdGhpcy5pc1N0b3BwYWJsZShwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpKVxuICAgIClcbiAgfVxuXG4gIGlzU3RvcHBhYmxlIChwb2ludCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludCkgfHxcbiAgICAgIHRoaXMuaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZShwb2ludCkgfHxcbiAgICAgIC8vIElmIHJpZ2h0IG9yIGxlZnQgY29sdW1uIGlzIG5vbi13aGl0ZS1zcGFjZSBjaGFyLCBpdCdzIHN0b3BwYWJsZS5cbiAgICAgICh0aGlzLmlzTm9uV2hpdGVTcGFjZShwb2ludC50cmFuc2xhdGUoWzAsIC0xXSkpICYmIHRoaXMuaXNOb25XaGl0ZVNwYWNlKHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKSkpXG4gICAgKVxuICB9XG5cbiAgaXNOb25XaGl0ZVNwYWNlIChwb2ludCkge1xuICAgIGNvbnN0IGNoYXIgPSB0aGlzLnV0aWxzLmdldFRleHRJblNjcmVlblJhbmdlKHRoaXMuZWRpdG9yLCBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpKVxuICAgIHJldHVybiBjaGFyICE9IG51bGwgJiYgL1xcUy8udGVzdChjaGFyKVxuICB9XG5cbiAgaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZSAocG9pbnQpIHtcbiAgICAvLyBJbiBub3RtYWwtbW9kZSwgY3Vyc29yIGlzIE5PVCBzdG9wcGFibGUgdG8gRU9MIG9mIG5vbi1ibGFuayByb3cuXG4gICAgLy8gU28gZXhwbGljaXRseSBndWFyZCB0byBub3QgYW5zd2VyIGl0IHN0b3BwYWJsZS5cbiAgICBpZiAodGhpcy5tb2RlID09PSAnbm9ybWFsJyAmJiB0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3codGhpcy5lZGl0b3IsIHBvaW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSWYgY2xpcHBlZCwgaXQgbWVhbnMgdGhhdCBvcmlnaW5hbCBwb25pdCB3YXMgbm9uIHN0b3BwYWJsZShlLmcuIHBvaW50LmNvbHVtID4gRU9MKS5cbiAgICBjb25zdCB7cm93fSA9IHBvaW50XG4gICAgcmV0dXJuIChyb3cgPT09IDAgfHwgcm93ID09PSB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKSkgJiYgcG9pbnQuaXNFcXVhbCh0aGlzLmVkaXRvci5jbGlwU2NyZWVuUG9zaXRpb24ocG9pbnQpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVEb3duVG9FZGdlIGV4dGVuZHMgTW92ZVVwVG9FZGdlIHtcbiAgZGlyZWN0aW9uID0gJ25leHQnXG59XG5cbi8vIFdvcmQgTW90aW9uIGZhbWlseVxuLy8gKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXG4vLyB8IGRpcmVjdGlvbiB8IHdoaWNoICAgICAgfCB3b3JkICB8IFdPUkQgfCBzdWJ3b3JkIHwgc21hcnR3b3JkIHwgYWxwaGFudW1lcmljIHxcbi8vIHwtLS0tLS0tLS0tLSstLS0tLS0tLS0tLS0rLS0tLS0tLSstLS0tLS0rLS0tLS0tLS0tKy0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tK1xuLy8gfCBuZXh0ICAgICAgfCB3b3JkLXN0YXJ0IHwgdyAgICAgfCBXICAgIHwgLSAgICAgICB8IC0gICAgICAgICB8IC0gICAgICAgICAgICB8XG4vLyB8IHByZXZpb3VzICB8IHdvcmQtc3RhcnQgfCBiICAgICB8IGIgICAgfCAtICAgICAgIHwgLSAgICAgICAgIHwgLSAgICAgICAgICAgIHxcbi8vIHwgbmV4dCAgICAgIHwgd29yZC1lbmQgICB8IGUgICAgIHwgRSAgICB8IC0gICAgICAgfCAtICAgICAgICAgfCAtICAgICAgICAgICAgfFxuLy8gfCBwcmV2aW91cyAgfCB3b3JkLWVuZCAgIHwgZ2UgICAgfCBnIEUgIHwgbi9hICAgICB8IG4vYSAgICAgICB8IG4vYSAgICAgICAgICB8XG4vLyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcblxuY2xhc3MgTW90aW9uQnlXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3b3JkUmVnZXggPSBudWxsXG4gIHNraXBCbGFua1JvdyA9IGZhbHNlXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IGZhbHNlXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsIGNvdW50U3RhdGUgPT4ge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0UG9pbnQoY3Vyc29yLCBjb3VudFN0YXRlKSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQgKGN1cnNvciwgY291bnRTdGF0ZSkge1xuICAgIGNvbnN0IHtkaXJlY3Rpb259ID0gdGhpc1xuICAgIGxldCB7d2hpY2h9ID0gdGhpc1xuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRXb3JkUmVnZXhGb3JDdXJzb3IoY3Vyc29yKVxuXG4gICAgY29uc3QgZnJvbSA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ25leHQnICYmIHdoaWNoID09PSAnc3RhcnQnICYmIHRoaXMub3BlcmF0b3IgJiYgY291bnRTdGF0ZS5pc0ZpbmFsKSB7XG4gICAgICAvLyBbTk9URV0gRXhjZXB0aW9uYWwgYmVoYXZpb3IgZm9yIHcgYW5kIFc6IFtEZXRhaWwgaW4gdmltIGhlbHAgYDpoZWxwIHdgLl1cbiAgICAgIC8vIFtjYXNlLUFdIGN3LCBjVyB0cmVhdGVkIGFzIGNlLCBjRSB3aGVuIGN1cnNvciBpcyBhdCBub24tYmxhbmsuXG4gICAgICAvLyBbY2FzZS1CXSB3aGVuIHcsIFcgdXNlZCBhcyBUQVJHRVQsIGl0IGRvZXNuJ3QgbW92ZSBvdmVyIG5ldyBsaW5lLlxuICAgICAgaWYgKHRoaXMuaXNFbXB0eVJvdyhmcm9tLnJvdykpIHJldHVybiBbZnJvbS5yb3cgKyAxLCAwXVxuXG4gICAgICAvLyBbY2FzZS1BXVxuICAgICAgaWYgKHRoaXMub3BlcmF0b3IubmFtZSA9PT0gJ0NoYW5nZScgJiYgIXRoaXMudXRpbHMucG9pbnRJc0F0V2hpdGVTcGFjZSh0aGlzLmVkaXRvciwgZnJvbSkpIHtcbiAgICAgICAgd2hpY2ggPSAnZW5kJ1xuICAgICAgfVxuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmZpbmRQb2ludChkaXJlY3Rpb24sIHJlZ2V4LCB3aGljaCwgdGhpcy5idWlsZE9wdGlvbnMoZnJvbSkpXG4gICAgICAvLyBbY2FzZS1CXVxuICAgICAgcmV0dXJuIHBvaW50ID8gUG9pbnQubWluKHBvaW50LCBbZnJvbS5yb3csIEluZmluaXR5XSkgOiB0aGlzLmdldExhc3RSZXNvcnRQb2ludChkaXJlY3Rpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmRQb2ludChkaXJlY3Rpb24sIHJlZ2V4LCB3aGljaCwgdGhpcy5idWlsZE9wdGlvbnMoZnJvbSkpIHx8IHRoaXMuZ2V0TGFzdFJlc29ydFBvaW50KGRpcmVjdGlvbilcbiAgICB9XG4gIH1cblxuICBidWlsZE9wdGlvbnMgKGZyb20pIHtcbiAgICByZXR1cm4ge1xuICAgICAgZnJvbTogZnJvbSxcbiAgICAgIHNraXBFbXB0eVJvdzogdGhpcy5za2lwRW1wdHlSb3csXG4gICAgICBza2lwV2hpdGVTcGFjZU9ubHlSb3c6IHRoaXMuc2tpcFdoaXRlU3BhY2VPbmx5Um93LFxuICAgICAgcHJlVHJhbnNsYXRlOiAodGhpcy53aGljaCA9PT0gJ2VuZCcgJiYgWzAsICsxXSkgfHwgdW5kZWZpbmVkLFxuICAgICAgcG9zdFRyYW5zbGF0ZTogKHRoaXMud2hpY2ggPT09ICdlbmQnICYmIFswLCAtMV0pIHx8IHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIGdldFdvcmRSZWdleEZvckN1cnNvciAoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMubmFtZS5lbmRzV2l0aCgnU3Vid29yZCcpKSB7XG4gICAgICByZXR1cm4gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLndvcmRSZWdleCkge1xuICAgICAgcmV0dXJuIHRoaXMud29yZFJlZ2V4XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCd1c2VMYW5ndWFnZUluZGVwZW5kZW50Tm9uV29yZENoYXJhY3RlcnMnKSkge1xuICAgICAgY29uc3Qgbm9uV29yZENoYXJhY3RlcnMgPSB0aGlzLl8uZXNjYXBlUmVnRXhwKHRoaXMudXRpbHMuZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKSlcbiAgICAgIGNvbnN0IHNvdXJjZSA9IGBeW1xcXFx0XFxcXHIgXSokfFteXFxcXHMke25vbldvcmRDaGFyYWN0ZXJzfV0rfFske25vbldvcmRDaGFyYWN0ZXJzfV0rYFxuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoc291cmNlLCAnZycpXG4gICAgfVxuICAgIHJldHVybiBjdXJzb3Iud29yZFJlZ0V4cCgpXG4gIH1cbn1cblxuLy8gd1xuY2xhc3MgTW92ZVRvTmV4dFdvcmQgZXh0ZW5kcyBNb3Rpb25CeVdvcmQge1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbiAgd2hpY2ggPSAnc3RhcnQnXG59XG5cbi8vIFdcbmNsYXNzIE1vdmVUb05leHRXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9OZXh0U3Vid29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHt9XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvTmV4dFNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvZ1xufVxuXG4vLyBuby1rZXltYXBcbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9nXG59XG5cbi8vIGJcbmNsYXNzIE1vdmVUb1ByZXZpb3VzV29yZCBleHRlbmRzIE1vdGlvbkJ5V29yZCB7XG4gIGRpcmVjdGlvbiA9ICdwcmV2aW91cydcbiAgd2hpY2ggPSAnc3RhcnQnXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IHRydWVcbn1cblxuLy8gQlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvXiR8XFxTKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHt9XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cblxuLy8gbm8ta2V5bWFwXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9cbn1cblxuLy8gZVxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgTW90aW9uQnlXb3JkIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSAnbmV4dCdcbiAgd2hpY2ggPSAnZW5kJ1xuICBza2lwRW1wdHlSb3cgPSB0cnVlXG4gIHNraXBXaGl0ZVNwYWNlT25seVJvdyA9IHRydWVcbn1cblxuLy8gRVxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHt9XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9nXG59XG5cbi8vIG5vLWtleW1hcFxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvZ1xufVxuXG4vLyBnZVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQgZXh0ZW5kcyBNb3Rpb25CeVdvcmQge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGRpcmVjdGlvbiA9ICdwcmV2aW91cydcbiAgd2hpY2ggPSAnZW5kJ1xuICBza2lwV2hpdGVTcGFjZU9ubHlSb3cgPSB0cnVlXG59XG5cbi8vIGdFXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9nXG59XG5cbi8vIFNlbnRlbmNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTZW50ZW5jZSBpcyBkZWZpbmVkIGFzIGJlbG93XG4vLyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbi8vICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbi8vICAtIGZvbGxvd2VkIGJ5IFsnJCcsICcgJywgJ1xcdCddXG4vLyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuLy8gIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHNlbnRlbmNlUmVnZXggPSBuZXcgUmVnRXhwKGAoPzpbXFxcXC4hXFxcXD9dW1xcXFwpXFxcXF1cIiddKlxcXFxzKyl8KFxcXFxufFxcXFxyXFxcXG4pYCwgJ2cnKVxuICBkaXJlY3Rpb24gPSAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPVxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9PT0gJ25leHQnXG4gICAgICAgICAgPyB0aGlzLmdldE5leHRTdGFydE9mU2VudGVuY2UoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgICAgOiB0aGlzLmdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50IHx8IHRoaXMuZ2V0TGFzdFJlc29ydFBvaW50KHRoaXMuZGlyZWN0aW9uKSlcbiAgICB9KVxuICB9XG5cbiAgaXNCbGFua1JvdyAocm93KSB7XG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICB9XG5cbiAgZ2V0TmV4dFN0YXJ0T2ZTZW50ZW5jZSAoZnJvbSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcignZm9yd2FyZCcsIHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmICh0aGlzLnNraXBCbGFua1JvdyAmJiB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkgcmV0dXJuXG4gICAgICAgIGlmICh0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpICE9PSB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmFuZ2UuZW5kXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlIChmcm9tKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKCdiYWNrd2FyZCcsIHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmICghdGhpcy5pc0JsYW5rUm93KGVuZFJvdykgJiYgdGhpcy5pc0JsYW5rUm93KHN0YXJ0Um93KSkge1xuICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgICAgICBpZiAocG9pbnQuaXNMZXNzVGhhbihmcm9tKSkgcmV0dXJuIHBvaW50XG4gICAgICAgICAgZWxzZSBpZiAoIXRoaXMuc2tpcEJsYW5rUm93KSByZXR1cm4gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb20pKSB7XG4gICAgICAgIHJldHVybiByYW5nZS5lbmRcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0U2VudGVuY2Uge1xuICBkaXJlY3Rpb24gPSAncHJldmlvdXMnXG59XG5cbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb05leHRTZW50ZW5jZSB7XG4gIHNraXBCbGFua1JvdyA9IHRydWVcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2Uge1xuICBza2lwQmxhbmtSb3cgPSB0cnVlXG59XG5cbi8vIFBhcmFncmFwaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9ICduZXh0J1xuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQgfHwgdGhpcy5nZXRMYXN0UmVzb3J0UG9pbnQodGhpcy5kaXJlY3Rpb24pKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludCAoZnJvbSkge1xuICAgIGxldCB3YXNCbGFua1JvdyA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbS5yb3cpXG4gICAgY29uc3Qgcm93cyA9IHRoaXMuZ2V0QnVmZmVyUm93cyh7c3RhcnRSb3c6IGZyb20ucm93LCBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9ufSlcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICBjb25zdCBpc0JsYW5rUm93ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICBpZiAoIXdhc0JsYW5rUm93ICYmIGlzQmxhbmtSb3cpIHtcbiAgICAgICAgcmV0dXJuIFtyb3csIDBdXG4gICAgICB9XG4gICAgICB3YXNCbGFua1JvdyA9IGlzQmxhbmtSb3dcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIHtcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xufVxuXG5jbGFzcyBNb3ZlVG9OZXh0RGlmZkh1bmsgZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSAnbmV4dCdcblxuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50IChmcm9tKSB7XG4gICAgY29uc3QgZ2V0SHVua1JhbmdlID0gcm93ID0+IHRoaXMudXRpbHMuZ2V0SHVua1JhbmdlQXRCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgICBsZXQgaHVua1JhbmdlID0gZ2V0SHVua1JhbmdlKGZyb20ucm93KVxuICAgIHJldHVybiB0aGlzLmZpbmRJbkVkaXRvcih0aGlzLmRpcmVjdGlvbiwgL15bKy1dL2csIHtmcm9tfSwgKHtyYW5nZX0pID0+IHtcbiAgICAgIGlmIChodW5rUmFuZ2UgJiYgaHVua1JhbmdlLmNvbnRhaW5zUG9pbnQocmFuZ2Uuc3RhcnQpKSByZXR1cm5cblxuICAgICAgcmV0dXJuIGdldEh1bmtSYW5nZShyYW5nZS5zdGFydC5yb3cpLnN0YXJ0XG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0RpZmZIdW5rIGV4dGVuZHMgTW92ZVRvTmV4dERpZmZIdW5rIHtcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgMClcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIHRoaXMuZ2V0Q291bnQoKSAtIDEpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgdGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IHJvdyA9IHRoaXMubGltaXROdW1iZXIoY3Vyc29yLmdldEJ1ZmZlclJvdygpICsgdGhpcy5nZXRDb3VudCgpIC0gMSwge21heDogdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCl9KVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW3JvdywgSW5maW5pdHldLCBhbGxvd05leHRMaW5lOiBmYWxzZX1cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZmluZEluRWRpdG9yKCdiYWNrd2FyZCcsIC9cXFN8Xi8sIG9wdGlvbnMsIGV2ZW50ID0+IGV2ZW50LnJhbmdlLnN0YXJ0KVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxufVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSAtIDEpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgMF0pXG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAocG9pbnQucm93IDwgdGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkpIHtcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biB7XG4gIGdldENvdW50ICgpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Q291bnQoKSAtIDFcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy51dGlscy5nZXRTY3JlZW5Qb3NpdGlvbkZvclNjcmVlblJvdyh0aGlzLmVkaXRvciwgY3Vyc29yLmdldFNjcmVlblJvdygpLCB0aGlzLndoaWNoLCB7XG4gICAgICBhbGxvd09mZlNjcmVlblBvc2l0aW9uOiB0aGlzLmdldENvbmZpZygnYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24nKVxuICAgIH0pXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG4gIH1cbn1cblxuLy8ga2V5bWFwOiBnIDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gJ2JlZ2lubmluZydcbn1cblxuLy8gZyBeOiBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2Ytc2NyZWVuLWxpbmVgXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gJ2ZpcnN0LWNoYXJhY3Rlcidcbn1cblxuLy8ga2V5bWFwOiBnICRcbmNsYXNzIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9TY3JlZW5Db2x1bW4ge1xuICB3aGljaCA9ICdsYXN0LWNoYXJhY3Rlcidcbn1cblxuLy8ga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIGp1bXAgPSB0cnVlXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZ2V0Um93KCkpKVxuICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICB9XG5cbiAgZ2V0Um93ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb3VudCgpIC0gMVxuICB9XG59XG5cbi8vIGtleW1hcDogR1xuY2xhc3MgTW92ZVRvTGFzdExpbmUgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmUge1xuICBkZWZhdWx0Q291bnQgPSBJbmZpbml0eVxufVxuXG4vLyBrZXltYXA6IE4lIGUuZy4gMTAlXG5jbGFzcyBNb3ZlVG9MaW5lQnlQZXJjZW50IGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lIHtcbiAgZ2V0Um93ICgpIHtcbiAgICBjb25zdCBwZXJjZW50ID0gdGhpcy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXRWaW1MYXN0QnVmZmVyUm93KCkgKiAocGVyY2VudCAvIDEwMCkpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgbGV0IHJvd1xuICAgIGxldCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGlmIChjb3VudCA8IDApIHtcbiAgICAgIC8vIFN1cHBvcnQgbmVnYXRpdmUgY291bnRcbiAgICAgIC8vIE5lZ2F0aXZlIGNvdW50IGNhbiBiZSBwYXNzZWQgbGlrZSBgb3BlcmF0aW9uU3RhY2sucnVuKFwiTW92ZVRvUmVsYXRpdmVMaW5lXCIsIHtjb3VudDogLTV9KWAuXG4gICAgICAvLyBDdXJyZW50bHkgdXNlZCBpbiB2aW0tbW9kZS1wbHVzLWV4LW1vZGUgcGtnLlxuICAgICAgd2hpbGUgKGNvdW50KysgPCAwKSB7XG4gICAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdyA9PSBudWxsID8gY3Vyc29yLmdldEJ1ZmZlclJvdygpIDogcm93IC0gMSlcbiAgICAgICAgaWYgKHJvdyA8PSAwKSBicmVha1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtYXhSb3cgPSB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKVxuICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cgPT0gbnVsbCA/IGN1cnNvci5nZXRCdWZmZXJSb3coKSA6IHJvdyArIDEpXG4gICAgICAgIGlmIChyb3cgPj0gbWF4Um93KSBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvIGV4dGVuZHMgTW92ZVRvUmVsYXRpdmVMaW5lIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBnZXRDb3VudCAoKSB7XG4gICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIoc3VwZXIuZ2V0Q291bnQoKSwge21pbjogMn0pXG4gIH1cbn1cblxuLy8gUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBIXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIGp1bXAgPSB0cnVlXG4gIGRlZmF1bHRDb3VudCA9IDBcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHRoaXMuZ2V0U2NyZWVuUm93KCkpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG4gIH1cblxuICBnZXRTY3JlZW5Sb3cgKCkge1xuICAgIGNvbnN0IGZpcnN0VmlzaWJsZVJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgY29uc3QgbGFzdFZpc2libGVSb3cgPSB0aGlzLmxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpfSlcblxuICAgIGNvbnN0IGJhc2VPZmZzZXQgPSAyXG4gICAgaWYgKHRoaXMubmFtZSA9PT0gJ01vdmVUb1RvcE9mU2NyZWVuJykge1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gZmlyc3RWaXNpYmxlUm93ID09PSAwID8gMCA6IGJhc2VPZmZzZXRcbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpIC0gMVxuICAgICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIoZmlyc3RWaXNpYmxlUm93ICsgY291bnQsIHttaW46IGZpcnN0VmlzaWJsZVJvdyArIG9mZnNldCwgbWF4OiBsYXN0VmlzaWJsZVJvd30pXG4gICAgfSBlbHNlIGlmICh0aGlzLm5hbWUgPT09ICdNb3ZlVG9NaWRkbGVPZlNjcmVlbicpIHtcbiAgICAgIHJldHVybiBmaXJzdFZpc2libGVSb3cgKyBNYXRoLmZsb29yKChsYXN0VmlzaWJsZVJvdyAtIGZpcnN0VmlzaWJsZVJvdykgLyAyKVxuICAgIH0gZWxzZSBpZiAodGhpcy5uYW1lID09PSAnTW92ZVRvQm90dG9tT2ZTY3JlZW4nKSB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBsYXN0VmlzaWJsZVJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkgPyAwIDogYmFzZU9mZnNldCArIDFcbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpIC0gMVxuICAgICAgcmV0dXJuIHRoaXMubGltaXROdW1iZXIobGFzdFZpc2libGVSb3cgLSBjb3VudCwge21pbjogZmlyc3RWaXNpYmxlUm93LCBtYXg6IGxhc3RWaXNpYmxlUm93IC0gb2Zmc2V0fSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTWlkZGxlT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7fSAvLyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge30gLy8ga2V5bWFwOiBMXG5cbi8vIFNjcm9sbGluZ1xuLy8gSGFsZjogY3RybC1kLCBjdHJsLXVcbi8vIEZ1bGw6IGN0cmwtZiwgY3RybC1iXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbRklYTUVdIGNvdW50IGJlaGF2ZSBkaWZmZXJlbnRseSBmcm9tIG9yaWdpbmFsIFZpbS5cbmNsYXNzIFNjcm9sbCBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgc3RhdGljIHNjcm9sbFRhc2sgPSBudWxsXG4gIHN0YXRpYyBhbW91bnRPZlBhZ2VCeU5hbWUgPSB7XG4gICAgU2Nyb2xsRnVsbFNjcmVlbkRvd246IDEsXG4gICAgU2Nyb2xsRnVsbFNjcmVlblVwOiAtMSxcbiAgICBTY3JvbGxIYWxmU2NyZWVuRG93bjogMC41LFxuICAgIFNjcm9sbEhhbGZTY3JlZW5VcDogLTAuNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuRG93bjogMC4yNSxcbiAgICBTY3JvbGxRdWFydGVyU2NyZWVuVXA6IC0wLjI1XG4gIH1cbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgYW1vdW50T2ZQYWdlID0gdGhpcy5jb25zdHJ1Y3Rvci5hbW91bnRPZlBhZ2VCeU5hbWVbdGhpcy5uYW1lXVxuICAgIGNvbnN0IGFtb3VudE9mU2NyZWVuUm93cyA9IE1hdGgudHJ1bmMoYW1vdW50T2ZQYWdlICogdGhpcy5lZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAqIHRoaXMuZ2V0Q291bnQoKSlcbiAgICB0aGlzLmFtb3VudE9mUGl4ZWxzID0gYW1vdW50T2ZTY3JlZW5Sb3dzICogdGhpcy5lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgdGhpcy52aW1TdGF0ZS5yZXF1ZXN0U2Nyb2xsKHtcbiAgICAgIGFtb3VudE9mUGl4ZWxzOiB0aGlzLmFtb3VudE9mUGl4ZWxzLFxuICAgICAgZHVyYXRpb246IHRoaXMuZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigoTWF0aC5hYnMoYW1vdW50T2ZQYWdlKSA9PT0gMSA/ICdGdWxsJyA6ICdIYWxmJykgKyAnU2Nyb2xsTW90aW9uJylcbiAgICB9KVxuICB9XG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUGl4ZWwgPSB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKVxuICAgIGN1cnNvclBpeGVsLnRvcCArPSB0aGlzLmFtb3VudE9mUGl4ZWxzXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKGN1cnNvclBpeGVsKVxuICAgIGNvbnN0IHNjcmVlblJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3coc2NyZWVuUG9zaXRpb24ucm93KVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdyksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG4gIH1cbn1cblxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gY3RybC1iXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5VcCBleHRlbmRzIFNjcm9sbCB7fSAvLyBjdHJsLXVcbmNsYXNzIFNjcm9sbFF1YXJ0ZXJTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHt9IC8vIGcgY3RybC1kXG5jbGFzcyBTY3JvbGxRdWFydGVyU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge30gLy8gZyBjdHJsLXVcblxuLy8gRmluZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBmXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uIHtcbiAgYmFja3dhcmRzID0gZmFsc2VcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBvZmZzZXQgPSAwXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9ICdGaW5kJ1xuXG4gIHJlc3RvcmVFZGl0b3JTdGF0ZSAoKSB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24gKCkge1xuICAgIHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICBzdXBlci5jYW5jZWxPcGVyYXRpb24oKVxuICB9XG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdyZXVzZUZpbmRGb3JSZXBlYXRGaW5kJykpIHRoaXMucmVwZWF0SWZOZWNlc3NhcnkoKVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB7XG4gICAgICBjb25zdCBjaGFyc01heCA9IHRoaXMuZ2V0Q29uZmlnKCdmaW5kQ2hhcnNNYXgnKVxuICAgICAgY29uc3Qgb3B0aW9uc0Jhc2UgPSB7cHVycG9zZTogJ2ZpbmQnLCBjaGFyc01heH1cblxuICAgICAgaWYgKGNoYXJzTWF4ID09PSAxKSB7XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChvcHRpb25zQmFzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IHRoaXMudXRpbHMuc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIGF1dG9Db25maXJtVGltZW91dDogdGhpcy5nZXRDb25maWcoJ2ZpbmRDb25maXJtQnlUaW1lb3V0JyksXG4gICAgICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgICAgIGlmIChpbnB1dCkgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgICAgICAgIGVsc2UgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb25DaGFuZ2U6IHByZUNvbmZpcm1lZENoYXJzID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJlQ29uZmlybWVkQ2hhcnMgPSBwcmVDb25maXJtZWRDaGFyc1xuICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRoaXMucHJlQ29uZmlybWVkQ2hhcnMsICdwcmUtY29uZmlybScsIHRoaXMuaXNCYWNrd2FyZHMoKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuY2xlYXJNYXJrZXJzKClcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmRzOiB7XG4gICAgICAgICAgICAndmltLW1vZGUtcGx1czpmaW5kLW5leHQtcHJlLWNvbmZpcm1lZCc6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgrMSksXG4gICAgICAgICAgICAndmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWQnOiAoKSA9PiB0aGlzLmZpbmRQcmVDb25maXJtZWQoLTEpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChPYmplY3QuYXNzaWduKG9wdGlvbnMsIG9wdGlvbnNCYXNlKSlcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBmaW5kUHJlQ29uZmlybWVkIChkZWx0YSkge1xuICAgIGlmICh0aGlzLnByZUNvbmZpcm1lZENoYXJzICYmIHRoaXMuZ2V0Q29uZmlnKCdoaWdobGlnaHRGaW5kQ2hhcicpKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyhcbiAgICAgICAgdGhpcy5wcmVDb25maXJtZWRDaGFycyxcbiAgICAgICAgJ3ByZS1jb25maXJtJyxcbiAgICAgICAgdGhpcy5pc0JhY2t3YXJkcygpLFxuICAgICAgICB0aGlzLmdldENvdW50KCkgLSAxICsgZGVsdGEsXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICAgIHRoaXMuY291bnQgPSBpbmRleCArIDFcbiAgICB9XG4gIH1cblxuICByZXBlYXRJZk5lY2Vzc2FyeSAoKSB7XG4gICAgY29uc3QgZmluZENvbW1hbmROYW1lcyA9IFsnRmluZCcsICdGaW5kQmFja3dhcmRzJywgJ1RpbGwnLCAnVGlsbEJhY2t3YXJkcyddXG4gICAgY29uc3QgY3VycmVudEZpbmQgPSB0aGlzLmdsb2JhbFN0YXRlLmdldCgnY3VycmVudEZpbmQnKVxuICAgIGlmIChjdXJyZW50RmluZCAmJiBmaW5kQ29tbWFuZE5hbWVzLmluY2x1ZGVzKHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2suZ2V0TGFzdENvbW1hbmROYW1lKCkpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gY3VycmVudEZpbmQuaW5wdXRcbiAgICAgIHRoaXMucmVwZWF0ZWQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgaXNCYWNrd2FyZHMgKCkge1xuICAgIHJldHVybiB0aGlzLmJhY2t3YXJkc1xuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgbGV0IGRlY29yYXRpb25UeXBlID0gJ3Bvc3QtY29uZmlybSdcbiAgICBpZiAodGhpcy5vcGVyYXRvciAmJiAhdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3RCYXNlJykpIHtcbiAgICAgIGRlY29yYXRpb25UeXBlICs9ICcgbG9uZydcbiAgICB9XG5cbiAgICAvLyBIQUNLOiBXaGVuIHJlcGVhdGVkIGJ5IFwiLFwiLCB0aGlzLmJhY2t3YXJkcyBpcyB0ZW1wb3JhcnkgaW52ZXJ0ZWQgYW5kXG4gICAgLy8gcmVzdG9yZWQgYWZ0ZXIgZXhlY3V0aW9uIGZpbmlzaGVkLlxuICAgIC8vIEJ1dCBmaW5hbCBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzIGlzIGV4ZWN1dGVkIGluIGFzeW5jKD1hZnRlciBvcGVyYXRpb24gZmluaXNoZWQpLlxuICAgIC8vIFRodXMgd2UgbmVlZCB0byBwcmVzZXJ2ZSBiZWZvcmUgcmVzdG9yZWQgYGJhY2t3YXJkc2AgdmFsdWUgYW5kIHBhc3MgaXQuXG4gICAgY29uc3QgYmFja3dhcmRzID0gdGhpcy5pc0JhY2t3YXJkcygpXG4gICAgdGhpcy5lZGl0b3IuY29tcG9uZW50LmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5pbnB1dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcylcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQgKGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHNjYW5SYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG4gICAgY29uc3QgcG9pbnRzID0gW11cbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UmVnZXgodGhpcy5pbnB1dClcbiAgICBjb25zdCBpbmRleFdhbnRBY2Nlc3MgPSB0aGlzLmdldENvdW50KCkgLSAxXG5cbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG5ldyBQb2ludCgwLCB0aGlzLmlzQmFja3dhcmRzKCkgPyB0aGlzLm9mZnNldCA6IC10aGlzLm9mZnNldClcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgZnJvbVBvaW50ID0gZnJvbVBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5uZWdhdGUoKSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoJ2ZpbmRBY3Jvc3NMaW5lcycpKSBzY2FuUmFuZ2Uuc3RhcnQgPSBQb2ludC5aRVJPXG5cbiAgICAgIHRoaXMuZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykgc3RvcCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZygnZmluZEFjcm9zc0xpbmVzJykpIHNjYW5SYW5nZS5lbmQgPSB0aGlzLmVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIHRoaXMuZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykgc3RvcCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSBwb2ludHNbaW5kZXhXYW50QWNjZXNzXVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgfVxuXG4gIC8vIEZJWE1FOiBiYWQgbmFtaW5nLCB0aGlzIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGluZGV4XG4gIGhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3MgKHRleHQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMsIGluZGV4ID0gdGhpcy5nZXRDb3VudCgpIC0gMSwgYWRqdXN0SW5kZXggPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5nZXRDb25maWcoJ2hpZ2hsaWdodEZpbmRDaGFyJykpIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXMudmltU3RhdGUuaGlnaGxpZ2h0RmluZC5oaWdobGlnaHRDdXJzb3JSb3dzKFxuICAgICAgdGhpcy5nZXRSZWdleCh0ZXh0KSxcbiAgICAgIGRlY29yYXRpb25UeXBlLFxuICAgICAgYmFja3dhcmRzLFxuICAgICAgdGhpcy5vZmZzZXQsXG4gICAgICBpbmRleCxcbiAgICAgIGFkanVzdEluZGV4XG4gICAgKVxuICB9XG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIGVsc2UgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB0aGlzLmdsb2JhbFN0YXRlLnNldCgnY3VycmVudEZpbmQnLCB0aGlzKVxuICB9XG5cbiAgZ2V0UmVnZXggKHRlcm0pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/ICdnJyA6ICdnaSdcbiAgICByZXR1cm4gbmV3IFJlZ0V4cCh0aGlzLl8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG4gIH1cbn1cblxuLy8ga2V5bWFwOiBGXG5jbGFzcyBGaW5kQmFja3dhcmRzIGV4dGVuZHMgRmluZCB7XG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxuLy8ga2V5bWFwOiB0XG5jbGFzcyBUaWxsIGV4dGVuZHMgRmluZCB7XG4gIG9mZnNldCA9IDFcbiAgZ2V0UG9pbnQgKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwb2ludCA9IHN1cGVyLmdldFBvaW50KC4uLmFyZ3MpXG4gICAgdGhpcy5tb3ZlU3VjY2VlZGVkID0gcG9pbnQgIT0gbnVsbFxuICAgIHJldHVybiBwb2ludFxuICB9XG59XG5cbi8vIGtleW1hcDogVFxuY2xhc3MgVGlsbEJhY2t3YXJkcyBleHRlbmRzIFRpbGwge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5cbi8vIE1hcmtcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5wdXQgPSBudWxsXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gZmFsc2VcblxuICBpbml0aWFsaXplICgpIHtcbiAgICB0aGlzLnJlYWRDaGFyKClcbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIGxldCBwb2ludCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQodGhpcy5pbnB1dClcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIGlmICh0aGlzLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKSB7XG4gICAgICAgIHBvaW50ID0gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgIH1cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgfVxufVxuXG4vLyBrZXltYXA6ICdcbmNsYXNzIE1vdmVUb01hcmtMaW5lIGV4dGVuZHMgTW92ZVRvTWFyayB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuXG4vLyBGb2xkIG1vdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW90aW9uQnlGb2xkIGV4dGVuZHMgTW90aW9uIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICB3aXNlID0gJ2NoYXJhY3Rlcndpc2UnXG4gIHdoaWNoID0gbnVsbFxuICBkaXJlY3Rpb24gPSBudWxsXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5mb2xkUmFuZ2VzID0gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJhbmdlcyh0aGlzLmVkaXRvcilcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldFJvd3MgKCkge1xuICAgIGNvbnN0IHJvd3MgPSB0aGlzLmZvbGRSYW5nZXMubWFwKGZvbGRSYW5nZSA9PiBmb2xkUmFuZ2VbdGhpcy53aGljaF0ucm93KS5zb3J0KChhLCBiKSA9PiBhIC0gYilcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdwcmV2aW91cycpIHtcbiAgICAgIHJldHVybiByb3dzLnJldmVyc2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcm93c1xuICAgIH1cbiAgfVxuXG4gIGZpbmRSb3dCeSAoY3Vyc29yLCBmbikge1xuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIHJldHVybiB0aGlzLmdldFJvd3MoKS5maW5kKHJvdyA9PiB7XG4gICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICdwcmV2aW91cycpIHtcbiAgICAgICAgcmV0dXJuIHJvdyA8IGN1cnNvclJvdyAmJiBmbihyb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcm93ID4gY3Vyc29yUm93ICYmIGZuKHJvdylcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZmluZFJvdyAoY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFJvd0J5KGN1cnNvciwgKCkgPT4gdHJ1ZSlcbiAgfVxuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCByb3cgPSB0aGlzLmZpbmRSb3coY3Vyc29yKVxuICAgICAgaWYgKHJvdyAhPSBudWxsKSB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCBleHRlbmRzIE1vdGlvbkJ5Rm9sZCB7XG4gIHdoaWNoID0gJ3N0YXJ0J1xuICBkaXJlY3Rpb24gPSAncHJldmlvdXMnXG59XG5cbmNsYXNzIE1vdmVUb05leHRGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb25CeUZvbGQge1xuICB3aGljaCA9ICdzdGFydCdcbiAgZGlyZWN0aW9uID0gJ25leHQnXG59XG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdGlvbkJ5Rm9sZCB7XG4gIHdoaWNoID0gJ2VuZCdcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xufVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZEVuZCBleHRlbmRzIE1vdGlvbkJ5Rm9sZCB7XG4gIHdoaWNoID0gJ2VuZCdcbiAgZGlyZWN0aW9uID0gJ25leHQnXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24gZXh0ZW5kcyBNb3Rpb25CeUZvbGQge1xuICB3aGljaCA9ICdzdGFydCdcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xuICBmaW5kUm93IChjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kUm93QnkoY3Vyc29yLCByb3cgPT4gdGhpcy51dGlscy5pc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KHRoaXMuZWRpdG9yLCByb3cpKVxuICB9XG59XG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24ge1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGdW5jdGlvbiB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICAgIHRoaXMuZ2V0SW5zdGFuY2UoJ1JlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlJykuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvTmV4dEZ1bmN0aW9uQW5kUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uQW5kUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUge1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW90aW9uQnlGb2xkV2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3Rpb25CeUZvbGQge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG5cbiAgZmluZFJvdyAoY3Vyc29yKSB7XG4gICAgY29uc3QgY2xvc2VzdEZvbGRSYW5nZSA9IHRoaXMudXRpbHMuZ2V0Q2xvc2VzdEZvbGRSYW5nZUNvbnRhaW5zUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgY29uc3QgaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgPSByb3cgPT4gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KVxuICAgIGNvbnN0IGJhc2VJbmRlbnRMZXZlbCA9IGNsb3Nlc3RGb2xkUmFuZ2UgPyBpbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjbG9zZXN0Rm9sZFJhbmdlLnN0YXJ0LnJvdykgOiAwXG4gICAgY29uc3QgaXNFcXVhbEluZGVudExldmVsID0gcmFuZ2UgPT4gaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93KSA9PT0gYmFzZUluZGVudExldmVsXG5cbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBjb25zdCBmb2xkUmFuZ2VzID0gdGhpcy5kaXJlY3Rpb24gPT09ICdwcmV2aW91cycgPyB0aGlzLmZvbGRSYW5nZXMuc2xpY2UoKS5yZXZlcnNlKCkgOiB0aGlzLmZvbGRSYW5nZXNcbiAgICBjb25zdCBmb2xkUmFuZ2UgPSBmb2xkUmFuZ2VzLmZpbmQoZm9sZFJhbmdlID0+IHtcbiAgICAgIGNvbnN0IHJvdyA9IGZvbGRSYW5nZVt0aGlzLndoaWNoXS5yb3dcbiAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ3ByZXZpb3VzJykge1xuICAgICAgICByZXR1cm4gcm93IDwgY3Vyc29yUm93ICYmIGlzRXF1YWxJbmRlbnRMZXZlbChmb2xkUmFuZ2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcm93ID4gY3Vyc29yUm93ICYmIGlzRXF1YWxJbmRlbnRMZXZlbChmb2xkUmFuZ2UpXG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAoZm9sZFJhbmdlKSB7XG4gICAgICByZXR1cm4gZm9sZFJhbmdlW3RoaXMud2hpY2hdLnJvd1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW90aW9uQnlGb2xkV2l0aFNhbWVJbmRlbnQge1xuICB3aGljaCA9ICdzdGFydCdcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xufVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3Rpb25CeUZvbGRXaXRoU2FtZUluZGVudCB7XG4gIHdoaWNoID0gJ3N0YXJ0J1xuICBkaXJlY3Rpb24gPSAnbmV4dCdcbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkRW5kV2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3Rpb25CeUZvbGRXaXRoU2FtZUluZGVudCB7XG4gIHdoaWNoID0gJ2VuZCdcbiAgZGlyZWN0aW9uID0gJ3ByZXZpb3VzJ1xufVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZEVuZFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW90aW9uQnlGb2xkV2l0aFNhbWVJbmRlbnQge1xuICB3aGljaCA9ICdlbmQnXG4gIGRpcmVjdGlvbiA9ICduZXh0J1xufVxuXG4vLyBTY29wZSBiYXNlZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW90aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvbiB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZGlyZWN0aW9uID0gJ2JhY2t3YXJkJ1xuICBzY29wZSA9ICcuJ1xuXG4gIG1vdmVDdXJzb3IgKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uLCB0aGlzLmRpcmVjdGlvbiwgdGhpcy5zY29wZSlcbiAgICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3Rpb25CeVNjb3BlIHtcbiAgZGlyZWN0aW9uID0gJ2JhY2t3YXJkJ1xuICBzY29wZSA9ICdzdHJpbmcuYmVnaW4nXG59XG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZyB7XG4gIGRpcmVjdGlvbiA9ICdmb3J3YXJkJ1xufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c051bWJlciBleHRlbmRzIE1vdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSAnYmFja3dhcmQnXG4gIHNjb3BlID0gJ2NvbnN0YW50Lm51bWVyaWMnXG59XG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlciB7XG4gIGRpcmVjdGlvbiA9ICdmb3J3YXJkJ1xufVxuXG5jbGFzcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSBleHRlbmRzIE1vdGlvbiB7XG4gIC8vIEVuc3VyZSB0aGlzIGNvbW1hbmQgaXMgYXZhaWxhYmxlIHdoZW4gb25seSBoYXMtb2NjdXJyZW5jZVxuICBzdGF0aWMgY29tbWFuZFNjb3BlID0gJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5oYXMtb2NjdXJyZW5jZSdcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gJ25leHQnXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5yYW5nZXMgPSB0aGlzLnV0aWxzLnNvcnRSYW5nZXModGhpcy5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJzKCkubWFwKG1hcmtlciA9PiBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSkpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VzW3RoaXMudXRpbHMuZ2V0SW5kZXgodGhpcy5nZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSksIHRoaXMucmFuZ2VzKV1cbiAgICBjb25zdCBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZScpKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlLCB7dHlwZTogJ3NlYXJjaCd9KVxuICAgIH1cbiAgfVxuXG4gIGdldEluZGV4IChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoKSAtIDFcbiAgfVxufVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSB7XG4gIGRpcmVjdGlvbiA9ICdwcmV2aW91cydcblxuICBnZXRJbmRleCAoZnJvbVBvaW50KSB7XG4gICAgY29uc3QgcmFuZ2VzID0gdGhpcy5yYW5nZXMuc2xpY2UoKS5yZXZlcnNlKClcbiAgICBjb25zdCByYW5nZSA9IHJhbmdlcy5maW5kKHJhbmdlID0+IHJhbmdlLmVuZC5pc0xlc3NUaGFuKGZyb21Qb2ludCkpXG4gICAgY29uc3QgaW5kZXggPSByYW5nZSA/IHRoaXMucmFuZ2VzLmluZGV4T2YocmFuZ2UpIDogdGhpcy5yYW5nZXMubGVuZ3RoIC0gMVxuICAgIHJldHVybiBpbmRleCAtICh0aGlzLmdldENvdW50KCkgLSAxKVxuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogJVxuY2xhc3MgTW92ZVRvUGFpciBleHRlbmRzIE1vdGlvbiB7XG4gIGluY2x1c2l2ZSA9IHRydWVcbiAganVtcCA9IHRydWVcbiAgbWVtYmVyID0gWydQYXJlbnRoZXNpcycsICdDdXJseUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCddXG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvcilcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIGdldFBvaW50Rm9yVGFnIChwb2ludCkge1xuICAgIGNvbnN0IHBhaXJJbmZvID0gdGhpcy5nZXRJbnN0YW5jZSgnQVRhZycpLmdldFBhaXJJbmZvKHBvaW50KVxuICAgIGlmICghcGFpckluZm8pIHJldHVyblxuXG4gICAgbGV0IHtvcGVuUmFuZ2UsIGNsb3NlUmFuZ2V9ID0gcGFpckluZm9cbiAgICBvcGVuUmFuZ2UgPSBvcGVuUmFuZ2UudHJhbnNsYXRlKFswLCArMV0sIFswLCAtMV0pXG4gICAgY2xvc2VSYW5nZSA9IGNsb3NlUmFuZ2UudHJhbnNsYXRlKFswLCArMV0sIFswLCAtMV0pXG4gICAgaWYgKG9wZW5SYW5nZS5jb250YWluc1BvaW50KHBvaW50KSAmJiAhcG9pbnQuaXNFcXVhbChvcGVuUmFuZ2UuZW5kKSkge1xuICAgICAgcmV0dXJuIGNsb3NlUmFuZ2Uuc3RhcnRcbiAgICB9XG4gICAgaWYgKGNsb3NlUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgJiYgIXBvaW50LmlzRXF1YWwoY2xvc2VSYW5nZS5lbmQpKSB7XG4gICAgICByZXR1cm4gb3BlblJhbmdlLnN0YXJ0XG4gICAgfVxuICB9XG5cbiAgZ2V0UG9pbnQgKGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG4gICAgaWYgKHBvaW50KSByZXR1cm4gcG9pbnRcblxuICAgIC8vIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2UoJ0FBbnlQYWlyQWxsb3dGb3J3YXJkaW5nJywge21lbWJlcjogdGhpcy5tZW1iZXJ9KS5nZXRSYW5nZShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICBpZiAoc3RhcnQucm93ID09PSBjdXJzb3JSb3cgJiYgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pKSB7XG4gICAgICAvLyBGb3J3YXJkaW5nIHJhbmdlIGZvdW5kXG4gICAgICByZXR1cm4gZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIH0gZWxzZSBpZiAoZW5kLnJvdyA9PT0gY3Vyc29yUG9zaXRpb24ucm93KSB7XG4gICAgICAvLyBFbmNsb3NpbmcgcmFuZ2Ugd2FzIHJldHVybmVkXG4gICAgICAvLyBXZSBtb3ZlIHRvIHN0YXJ0KCBvcGVuLXBhaXIgKSBvbmx5IHdoZW4gY2xvc2UtcGFpciB3YXMgYXQgc2FtZSByb3cgYXMgY3Vyc29yLXJvdy5cbiAgICAgIHJldHVybiBzdGFydFxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTW90aW9uLFxuICBDdXJyZW50U2VsZWN0aW9uLFxuICBNb3ZlTGVmdCxcbiAgTW92ZVJpZ2h0LFxuICBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4sXG4gIE1vdmVVcCxcbiAgTW92ZVVwV3JhcCxcbiAgTW92ZURvd24sXG4gIE1vdmVEb3duV3JhcCxcbiAgTW92ZVVwU2NyZWVuLFxuICBNb3ZlRG93blNjcmVlbixcbiAgTW92ZVVwVG9FZGdlLFxuICBNb3ZlRG93blRvRWRnZSxcbiAgTW90aW9uQnlXb3JkLFxuICBNb3ZlVG9OZXh0V29yZCxcbiAgTW92ZVRvTmV4dFdob2xlV29yZCxcbiAgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb05leHRTbWFydFdvcmQsXG4gIE1vdmVUb05leHRTdWJ3b3JkLFxuICBNb3ZlVG9QcmV2aW91c1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkLFxuICBNb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQsXG4gIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkLFxuICBNb3ZlVG9QcmV2aW91c1N1YndvcmQsXG4gIE1vdmVUb0VuZE9mV29yZCxcbiAgTW92ZVRvRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZCxcbiAgTW92ZVRvRW5kT2ZTbWFydFdvcmQsXG4gIE1vdmVUb0VuZE9mU3Vid29yZCxcbiAgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQsXG4gIE1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQsXG4gIE1vdmVUb05leHRTZW50ZW5jZSxcbiAgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSxcbiAgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93LFxuICBNb3ZlVG9OZXh0UGFyYWdyYXBoLFxuICBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCxcbiAgTW92ZVRvTmV4dERpZmZIdW5rLFxuICBNb3ZlVG9QcmV2aW91c0RpZmZIdW5rLFxuICBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUsXG4gIE1vdmVUb0NvbHVtbixcbiAgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSxcbiAgTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93bixcbiAgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAsXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93bixcbiAgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duLFxuICBNb3ZlVG9TY3JlZW5Db2x1bW4sXG4gIE1vdmVUb0JlZ2lubmluZ09mU2NyZWVuTGluZSxcbiAgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUsXG4gIE1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUsXG4gIE1vdmVUb0ZpcnN0TGluZSxcbiAgTW92ZVRvTGFzdExpbmUsXG4gIE1vdmVUb0xpbmVCeVBlcmNlbnQsXG4gIE1vdmVUb1JlbGF0aXZlTGluZSxcbiAgTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3byxcbiAgTW92ZVRvVG9wT2ZTY3JlZW4sXG4gIE1vdmVUb01pZGRsZU9mU2NyZWVuLFxuICBNb3ZlVG9Cb3R0b21PZlNjcmVlbixcbiAgU2Nyb2xsLFxuICBTY3JvbGxGdWxsU2NyZWVuRG93bixcbiAgU2Nyb2xsRnVsbFNjcmVlblVwLFxuICBTY3JvbGxIYWxmU2NyZWVuRG93bixcbiAgU2Nyb2xsSGFsZlNjcmVlblVwLFxuICBTY3JvbGxRdWFydGVyU2NyZWVuRG93bixcbiAgU2Nyb2xsUXVhcnRlclNjcmVlblVwLFxuICBGaW5kLFxuICBGaW5kQmFja3dhcmRzLFxuICBUaWxsLFxuICBUaWxsQmFja3dhcmRzLFxuICBNb3ZlVG9NYXJrLFxuICBNb3ZlVG9NYXJrTGluZSxcbiAgTW90aW9uQnlGb2xkLFxuICBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCxcbiAgTW92ZVRvTmV4dEZvbGRTdGFydCxcbiAgTW90aW9uQnlGb2xkV2l0aFNhbWVJbmRlbnQsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQsXG4gIE1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudCxcbiAgTW92ZVRvUHJldmlvdXNGb2xkRW5kV2l0aFNhbWVJbmRlbnQsXG4gIE1vdmVUb05leHRGb2xkRW5kV2l0aFNhbWVJbmRlbnQsXG4gIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCxcbiAgTW92ZVRvTmV4dEZvbGRFbmQsXG4gIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24sXG4gIE1vdmVUb05leHRGdW5jdGlvbixcbiAgTW92ZVRvUHJldmlvdXNGdW5jdGlvbkFuZFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlLFxuICBNb3ZlVG9OZXh0RnVuY3Rpb25BbmRSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZSxcbiAgTW90aW9uQnlTY29wZSxcbiAgTW92ZVRvUHJldmlvdXNTdHJpbmcsXG4gIE1vdmVUb05leHRTdHJpbmcsXG4gIE1vdmVUb1ByZXZpb3VzTnVtYmVyLFxuICBNb3ZlVG9OZXh0TnVtYmVyLFxuICBNb3ZlVG9OZXh0T2NjdXJyZW5jZSxcbiAgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlLFxuICBNb3ZlVG9QYWlyXG59XG4iXX0=