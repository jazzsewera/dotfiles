'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;

var Base = require('./base');

var MiscCommand = (function (_Base) {
  _inherits(MiscCommand, _Base);

  function MiscCommand() {
    _classCallCheck(this, MiscCommand);

    _get(Object.getPrototypeOf(MiscCommand.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(MiscCommand, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }, {
    key: 'operationKind',
    value: 'misc-command',
    enumerable: true
  }]);

  return MiscCommand;
})(Base);

var Mark = (function (_MiscCommand) {
  _inherits(Mark, _MiscCommand);

  function Mark() {
    _classCallCheck(this, Mark);

    _get(Object.getPrototypeOf(Mark.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Mark, [{
    key: 'execute',
    value: _asyncToGenerator(function* () {
      var mark = yield this.readCharPromised();
      if (mark) {
        this.vimState.mark.set(mark, this.getCursorBufferPosition());
      }
    })
  }]);

  return Mark;
})(MiscCommand);

var ReverseSelections = (function (_MiscCommand2) {
  _inherits(ReverseSelections, _MiscCommand2);

  function ReverseSelections() {
    _classCallCheck(this, ReverseSelections);

    _get(Object.getPrototypeOf(ReverseSelections.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ReverseSelections, [{
    key: 'execute',
    value: function execute() {
      this.swrap.setReversedState(this.editor, !this.editor.getLastSelection().isReversed());
      if (this.isMode('visual', 'blockwise')) {
        this.getLastBlockwiseSelection().autoscroll();
      }
    }
  }]);

  return ReverseSelections;
})(MiscCommand);

var BlockwiseOtherEnd = (function (_ReverseSelections) {
  _inherits(BlockwiseOtherEnd, _ReverseSelections);

  function BlockwiseOtherEnd() {
    _classCallCheck(this, BlockwiseOtherEnd);

    _get(Object.getPrototypeOf(BlockwiseOtherEnd.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(BlockwiseOtherEnd, [{
    key: 'execute',
    value: function execute() {
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.reverse();
      }
      _get(Object.getPrototypeOf(BlockwiseOtherEnd.prototype), 'execute', this).call(this);
    }
  }]);

  return BlockwiseOtherEnd;
})(ReverseSelections);

var Undo = (function (_MiscCommand3) {
  _inherits(Undo, _MiscCommand3);

  function Undo() {
    _classCallCheck(this, Undo);

    _get(Object.getPrototypeOf(Undo.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Undo, [{
    key: 'execute',
    value: function execute() {
      var newRanges = [];
      var oldRanges = [];

      var disposable = this.editor.getBuffer().onDidChangeText(function (event) {
        for (var _ref2 of event.changes) {
          var newRange = _ref2.newRange;
          var oldRange = _ref2.oldRange;

          if (newRange.isEmpty()) {
            oldRanges.push(oldRange); // Remove only
          } else {
              newRanges.push(newRange);
            }
        }
      });

      if (this.name === 'Undo') {
        this.editor.undo();
      } else {
        this.editor.redo();
      }

      disposable.dispose();

      for (var selection of this.editor.getSelections()) {
        selection.clear();
      }

      if (this.getConfig('setCursorToStartOfChangeOnUndoRedo')) {
        var strategy = this.getConfig('setCursorToStartOfChangeOnUndoRedoStrategy');
        this.setCursorPosition({ newRanges: newRanges, oldRanges: oldRanges, strategy: strategy });
        this.vimState.clearSelections();
      }

      if (this.getConfig('flashOnUndoRedo')) {
        if (newRanges.length) {
          this.flashChanges(newRanges, 'changes');
        } else {
          this.flashChanges(oldRanges, 'deletes');
        }
      }
      this.activateMode('normal');
    }
  }, {
    key: 'setCursorPosition',
    value: function setCursorPosition(_ref3) {
      var newRanges = _ref3.newRanges;
      var oldRanges = _ref3.oldRanges;
      var strategy = _ref3.strategy;

      var lastCursor = this.editor.getLastCursor(); // This is restored cursor

      var changedRange = undefined;

      if (strategy === 'smart') {
        changedRange = this.utils.findRangeContainsPoint(newRanges, lastCursor.getBufferPosition());
      } else if (strategy === 'simple') {
        changedRange = this.utils.sortRanges(newRanges.concat(oldRanges))[0];
      }

      if (changedRange) {
        if (this.utils.isLinewiseRange(changedRange)) this.utils.setBufferRow(lastCursor, changedRange.start.row);else lastCursor.setBufferPosition(changedRange.start);
      }
    }
  }, {
    key: 'flashChanges',
    value: function flashChanges(ranges, mutationType) {
      var _this = this;

      var isMultipleSingleLineRanges = function isMultipleSingleLineRanges(ranges) {
        return ranges.length > 1 && ranges.every(_this.utils.isSingleLineRange);
      };
      var humanizeNewLineForBufferRange = this.utils.humanizeNewLineForBufferRange.bind(null, this.editor);
      var isNotLeadingWhiteSpaceRange = this.utils.isNotLeadingWhiteSpaceRange.bind(null, this.editor);
      if (!this.utils.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(ranges)) {
        ranges = ranges.map(humanizeNewLineForBufferRange);
        var type = isMultipleSingleLineRanges(ranges) ? 'undo-redo-multiple-' + mutationType : 'undo-redo';
        if (!(type === 'undo-redo' && mutationType === 'deletes')) {
          this.vimState.flash(ranges.filter(isNotLeadingWhiteSpaceRange), { type: type });
        }
      }
    }
  }]);

  return Undo;
})(MiscCommand);

var Redo = (function (_Undo) {
  _inherits(Redo, _Undo);

  function Redo() {
    _classCallCheck(this, Redo);

    _get(Object.getPrototypeOf(Redo.prototype), 'constructor', this).apply(this, arguments);
  }

  // zc
  return Redo;
})(Undo);

var FoldCurrentRow = (function (_MiscCommand4) {
  _inherits(FoldCurrentRow, _MiscCommand4);

  function FoldCurrentRow() {
    _classCallCheck(this, FoldCurrentRow);

    _get(Object.getPrototypeOf(FoldCurrentRow.prototype), 'constructor', this).apply(this, arguments);
  }

  // zo

  _createClass(FoldCurrentRow, [{
    key: 'execute',
    value: function execute() {
      for (var point of this.getCursorBufferPositions()) {
        this.editor.foldBufferRow(point.row);
      }
    }
  }]);

  return FoldCurrentRow;
})(MiscCommand);

var UnfoldCurrentRow = (function (_MiscCommand5) {
  _inherits(UnfoldCurrentRow, _MiscCommand5);

  function UnfoldCurrentRow() {
    _classCallCheck(this, UnfoldCurrentRow);

    _get(Object.getPrototypeOf(UnfoldCurrentRow.prototype), 'constructor', this).apply(this, arguments);
  }

  // za

  _createClass(UnfoldCurrentRow, [{
    key: 'execute',
    value: function execute() {
      for (var point of this.getCursorBufferPositions()) {
        this.editor.unfoldBufferRow(point.row);
      }
    }
  }]);

  return UnfoldCurrentRow;
})(MiscCommand);

var ToggleFold = (function (_MiscCommand6) {
  _inherits(ToggleFold, _MiscCommand6);

  function ToggleFold() {
    _classCallCheck(this, ToggleFold);

    _get(Object.getPrototypeOf(ToggleFold.prototype), 'constructor', this).apply(this, arguments);
  }

  // Base of zC, zO, zA

  _createClass(ToggleFold, [{
    key: 'execute',
    value: function execute() {
      for (var point of this.getCursorBufferPositions()) {
        this.editor.toggleFoldAtBufferRow(point.row);
      }
    }
  }]);

  return ToggleFold;
})(MiscCommand);

var FoldCurrentRowRecursivelyBase = (function (_MiscCommand7) {
  _inherits(FoldCurrentRowRecursivelyBase, _MiscCommand7);

  function FoldCurrentRowRecursivelyBase() {
    _classCallCheck(this, FoldCurrentRowRecursivelyBase);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursivelyBase.prototype), 'constructor', this).apply(this, arguments);
  }

  // zC

  _createClass(FoldCurrentRowRecursivelyBase, [{
    key: 'eachFoldStartRow',
    value: function eachFoldStartRow(fn) {
      var _this2 = this;

      var _loop = function (_ref4) {
        var row = _ref4.row;

        if (!_this2.editor.isFoldableAtBufferRow(row)) return 'continue';

        var foldRanges = _this2.utils.getCodeFoldRanges(_this2.editor);
        var enclosingFoldRange = foldRanges.find(function (range) {
          return range.start.row === row;
        });
        var enclosedFoldRanges = foldRanges.filter(function (range) {
          return enclosingFoldRange.containsRange(range);
        });

        // Why reverse() is to process encolosed(nested) fold first than encolosing fold.
        enclosedFoldRanges.reverse().forEach(function (range) {
          return fn(range.start.row);
        });
      };

      for (var _ref4 of this.getCursorBufferPositionsOrdered().reverse()) {
        var _ret = _loop(_ref4);

        if (_ret === 'continue') continue;
      }
    }
  }, {
    key: 'foldRecursively',
    value: function foldRecursively() {
      var _this3 = this;

      this.eachFoldStartRow(function (row) {
        if (!_this3.editor.isFoldedAtBufferRow(row)) _this3.editor.foldBufferRow(row);
      });
    }
  }, {
    key: 'unfoldRecursively',
    value: function unfoldRecursively() {
      var _this4 = this;

      this.eachFoldStartRow(function (row) {
        if (_this4.editor.isFoldedAtBufferRow(row)) _this4.editor.unfoldBufferRow(row);
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return FoldCurrentRowRecursivelyBase;
})(MiscCommand);

var FoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase) {
  _inherits(FoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase);

  function FoldCurrentRowRecursively() {
    _classCallCheck(this, FoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursively.prototype), 'constructor', this).apply(this, arguments);
  }

  // zO

  _createClass(FoldCurrentRowRecursively, [{
    key: 'execute',
    value: function execute() {
      this.foldRecursively();
    }
  }]);

  return FoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

var UnfoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase2) {
  _inherits(UnfoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase2);

  function UnfoldCurrentRowRecursively() {
    _classCallCheck(this, UnfoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(UnfoldCurrentRowRecursively.prototype), 'constructor', this).apply(this, arguments);
  }

  // zA

  _createClass(UnfoldCurrentRowRecursively, [{
    key: 'execute',
    value: function execute() {
      this.unfoldRecursively();
    }
  }]);

  return UnfoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

var ToggleFoldRecursively = (function (_FoldCurrentRowRecursivelyBase3) {
  _inherits(ToggleFoldRecursively, _FoldCurrentRowRecursivelyBase3);

  function ToggleFoldRecursively() {
    _classCallCheck(this, ToggleFoldRecursively);

    _get(Object.getPrototypeOf(ToggleFoldRecursively.prototype), 'constructor', this).apply(this, arguments);
  }

  // zR

  _createClass(ToggleFoldRecursively, [{
    key: 'execute',
    value: function execute() {
      if (this.editor.isFoldedAtBufferRow(this.getCursorBufferPosition().row)) {
        this.unfoldRecursively();
      } else {
        this.foldRecursively();
      }
    }
  }]);

  return ToggleFoldRecursively;
})(FoldCurrentRowRecursivelyBase);

var UnfoldAll = (function (_MiscCommand8) {
  _inherits(UnfoldAll, _MiscCommand8);

  function UnfoldAll() {
    _classCallCheck(this, UnfoldAll);

    _get(Object.getPrototypeOf(UnfoldAll.prototype), 'constructor', this).apply(this, arguments);
  }

  // zM

  _createClass(UnfoldAll, [{
    key: 'execute',
    value: function execute() {
      this.editor.unfoldAll();
    }
  }]);

  return UnfoldAll;
})(MiscCommand);

var FoldAll = (function (_MiscCommand9) {
  _inherits(FoldAll, _MiscCommand9);

  function FoldAll() {
    _classCallCheck(this, FoldAll);

    _get(Object.getPrototypeOf(FoldAll.prototype), 'constructor', this).apply(this, arguments);
  }

  // zr

  _createClass(FoldAll, [{
    key: 'execute',
    value: function execute() {
      var _utils$getFoldInfoByKind = this.utils.getFoldInfoByKind(this.editor);

      var allFold = _utils$getFoldInfoByKind.allFold;

      if (!allFold) return;

      this.editor.unfoldAll();
      for (var _ref52 of allFold.listOfRangeAndIndent) {
        var indent = _ref52.indent;
        var range = _ref52.range;

        if (indent <= this.getConfig('maxFoldableIndentLevel')) {
          this.editor.foldBufferRange(range);
        }
      }
      this.editor.scrollToCursorPosition({ center: true });
    }
  }]);

  return FoldAll;
})(MiscCommand);

var UnfoldNextIndentLevel = (function (_MiscCommand10) {
  _inherits(UnfoldNextIndentLevel, _MiscCommand10);

  function UnfoldNextIndentLevel() {
    _classCallCheck(this, UnfoldNextIndentLevel);

    _get(Object.getPrototypeOf(UnfoldNextIndentLevel.prototype), 'constructor', this).apply(this, arguments);
  }

  // zm

  _createClass(UnfoldNextIndentLevel, [{
    key: 'execute',
    value: function execute() {
      var _utils$getFoldInfoByKind2 = this.utils.getFoldInfoByKind(this.editor);

      var folded = _utils$getFoldInfoByKind2.folded;

      if (!folded) return;
      var minIndent = folded.minIndent;
      var listOfRangeAndIndent = folded.listOfRangeAndIndent;

      var targetIndents = this.utils.getList(minIndent, minIndent + this.getCount() - 1);
      for (var _ref62 of listOfRangeAndIndent) {
        var indent = _ref62.indent;
        var range = _ref62.range;

        if (targetIndents.includes(indent)) {
          this.editor.unfoldBufferRow(range.start.row);
        }
      }
    }
  }]);

  return UnfoldNextIndentLevel;
})(MiscCommand);

var FoldNextIndentLevel = (function (_MiscCommand11) {
  _inherits(FoldNextIndentLevel, _MiscCommand11);

  function FoldNextIndentLevel() {
    _classCallCheck(this, FoldNextIndentLevel);

    _get(Object.getPrototypeOf(FoldNextIndentLevel.prototype), 'constructor', this).apply(this, arguments);
  }

  // ctrl-e scroll lines downwards

  _createClass(FoldNextIndentLevel, [{
    key: 'execute',
    value: function execute() {
      var _utils$getFoldInfoByKind3 = this.utils.getFoldInfoByKind(this.editor);

      var unfolded = _utils$getFoldInfoByKind3.unfolded;
      var allFold = _utils$getFoldInfoByKind3.allFold;

      if (!unfolded) return;
      // FIXME: Why I need unfoldAll()? Why can't I just fold non-folded-fold only?
      // Unless unfoldAll() here, @editor.unfoldAll() delete foldMarker but fail
      // to render unfolded rows correctly.
      // I believe this is bug of text-buffer's markerLayer which assume folds are
      // created **in-order** from top-row to bottom-row.
      this.editor.unfoldAll();

      var maxFoldable = this.getConfig('maxFoldableIndentLevel');
      var fromLevel = Math.min(unfolded.maxIndent, maxFoldable);
      fromLevel = this.limitNumber(fromLevel - this.getCount() - 1, { min: 0 });
      var targetIndents = this.utils.getList(fromLevel, maxFoldable);
      for (var _ref72 of allFold.listOfRangeAndIndent) {
        var indent = _ref72.indent;
        var range = _ref72.range;

        if (targetIndents.includes(indent)) {
          this.editor.foldBufferRange(range);
        }
      }
    }
  }]);

  return FoldNextIndentLevel;
})(MiscCommand);

var MiniScrollDown = (function (_MiscCommand12) {
  _inherits(MiniScrollDown, _MiscCommand12);

  function MiniScrollDown() {
    _classCallCheck(this, MiniScrollDown);

    _get(Object.getPrototypeOf(MiniScrollDown.prototype), 'constructor', this).apply(this, arguments);

    this.defaultCount = this.getConfig('defaultScrollRowsOnMiniScroll');
    this.direction = 'down';
  }

  // ctrl-y scroll lines upwards

  _createClass(MiniScrollDown, [{
    key: 'keepCursorOnScreen',
    value: function keepCursorOnScreen() {
      var cursor = this.editor.getLastCursor();
      var row = cursor.getScreenRow();
      var offset = 2;
      var validRow = this.direction === 'down' ? this.limitNumber(row, { min: this.editor.getFirstVisibleScreenRow() + offset }) : this.limitNumber(row, { max: this.editor.getLastVisibleScreenRow() - offset });
      if (row !== validRow) {
        this.utils.setBufferRow(cursor, this.editor.bufferRowForScreenRow(validRow), { autoscroll: false });
      }
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this5 = this;

      this.vimState.requestScroll({
        amountOfPixels: (this.direction === 'down' ? 1 : -1) * this.getCount() * this.editor.getLineHeightInPixels(),
        duration: this.getSmoothScrollDuation('MiniScroll'),
        onFinish: function onFinish() {
          return _this5.keepCursorOnScreen();
        }
      });
    }
  }]);

  return MiniScrollDown;
})(MiscCommand);

var MiniScrollUp = (function (_MiniScrollDown) {
  _inherits(MiniScrollUp, _MiniScrollDown);

  function MiniScrollUp() {
    _classCallCheck(this, MiniScrollUp);

    _get(Object.getPrototypeOf(MiniScrollUp.prototype), 'constructor', this).apply(this, arguments);

    this.direction = 'up';
  }

  // RedrawCursorLineAt{XXX} in viewport.
  // +-------------------------------------------+
  // | where        | no move | move to 1st char |
  // |--------------+---------+------------------|
  // | top          | z t     | z enter          |
  // | upper-middle | z u     | z space          |
  // | middle       | z z     | z .              |
  // | bottom       | z b     | z -              |
  // +-------------------------------------------+
  return MiniScrollUp;
})(MiniScrollDown);

var RedrawCursorLine = (function (_MiscCommand13) {
  _inherits(RedrawCursorLine, _MiscCommand13);

  function RedrawCursorLine() {
    _classCallCheck(this, RedrawCursorLine);

    _get(Object.getPrototypeOf(RedrawCursorLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RedrawCursorLine, [{
    key: 'initialize',
    value: function initialize() {
      var baseName = this.name.replace(/AndMoveToFirstCharacterOfLine$/, '');
      this.coefficient = this.constructor.coefficientByName[baseName];
      this.moveToFirstCharacterOfLine = this.name.endsWith('AndMoveToFirstCharacterOfLine');
      _get(Object.getPrototypeOf(RedrawCursorLine.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this6 = this;

      var scrollTop = Math.round(this.getScrollTop());
      this.vimState.requestScroll({
        scrollTop: scrollTop,
        duration: this.getSmoothScrollDuation('RedrawCursorLine'),
        onFinish: function onFinish() {
          if (_this6.editorElement.getScrollTop() !== scrollTop && !_this6.editor.getScrollPastEnd()) {
            _this6.recommendToEnableScrollPastEnd();
          }
        }
      });
      if (this.moveToFirstCharacterOfLine) this.editor.moveToFirstCharacterOfLine();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      var _editorElement$pixelPositionForScreenPosition = this.editorElement.pixelPositionForScreenPosition(this.editor.getCursorScreenPosition());

      var top = _editorElement$pixelPositionForScreenPosition.top;

      var editorHeight = this.editorElement.getHeight();
      var lineHeightInPixel = this.editor.getLineHeightInPixels();

      return this.limitNumber(top - editorHeight * this.coefficient, {
        min: top - editorHeight + lineHeightInPixel * 3,
        max: top - lineHeightInPixel * 2
      });
    }
  }, {
    key: 'recommendToEnableScrollPastEnd',
    value: function recommendToEnableScrollPastEnd() {
      var message = ['vim-mode-plus', '- Failed to scroll. To successfully scroll, `editor.scrollPastEnd` need to be enabled.', '- You can do it from `"Settings" > "Editor" > "Scroll Past End"`.', '- Or **do you allow vmp enable it for you now?**'].join('\n');

      var notification = atom.notifications.addInfo(message, {
        dismissable: true,
        buttons: [{
          text: 'No thanks.',
          onDidClick: function onDidClick() {
            return notification.dismiss();
          }
        }, {
          text: 'OK. Enable it now!!',
          onDidClick: function onDidClick() {
            atom.config.set('editor.scrollPastEnd', true);
            notification.dismiss();
          }
        }]
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }, {
    key: 'coefficientByName',
    value: {
      RedrawCursorLineAtTop: 0,
      RedrawCursorLineAtUpperMiddle: 0.25,
      RedrawCursorLineAtMiddle: 0.5,
      RedrawCursorLineAtBottom: 1
    },
    enumerable: true
  }]);

  return RedrawCursorLine;
})(MiscCommand);

var RedrawCursorLineAtTop = (function (_RedrawCursorLine) {
  _inherits(RedrawCursorLineAtTop, _RedrawCursorLine);

  function RedrawCursorLineAtTop() {
    _classCallCheck(this, RedrawCursorLineAtTop);

    _get(Object.getPrototypeOf(RedrawCursorLineAtTop.prototype), 'constructor', this).apply(this, arguments);
  }

  // zt
  return RedrawCursorLineAtTop;
})(RedrawCursorLine);

var RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine2) {
  _inherits(RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine, _RedrawCursorLine2);

  function RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // z enter
  return RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var RedrawCursorLineAtUpperMiddle = (function (_RedrawCursorLine3) {
  _inherits(RedrawCursorLineAtUpperMiddle, _RedrawCursorLine3);

  function RedrawCursorLineAtUpperMiddle() {
    _classCallCheck(this, RedrawCursorLineAtUpperMiddle);

    _get(Object.getPrototypeOf(RedrawCursorLineAtUpperMiddle.prototype), 'constructor', this).apply(this, arguments);
  }

  // zu
  return RedrawCursorLineAtUpperMiddle;
})(RedrawCursorLine);

var RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine4) {
  _inherits(RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine, _RedrawCursorLine4);

  function RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // z space
  return RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var RedrawCursorLineAtMiddle = (function (_RedrawCursorLine5) {
  _inherits(RedrawCursorLineAtMiddle, _RedrawCursorLine5);

  function RedrawCursorLineAtMiddle() {
    _classCallCheck(this, RedrawCursorLineAtMiddle);

    _get(Object.getPrototypeOf(RedrawCursorLineAtMiddle.prototype), 'constructor', this).apply(this, arguments);
  }

  // z z
  return RedrawCursorLineAtMiddle;
})(RedrawCursorLine);

var RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine6) {
  _inherits(RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine, _RedrawCursorLine6);

  function RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // z .
  return RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var RedrawCursorLineAtBottom = (function (_RedrawCursorLine7) {
  _inherits(RedrawCursorLineAtBottom, _RedrawCursorLine7);

  function RedrawCursorLineAtBottom() {
    _classCallCheck(this, RedrawCursorLineAtBottom);

    _get(Object.getPrototypeOf(RedrawCursorLineAtBottom.prototype), 'constructor', this).apply(this, arguments);
  }

  // z b
  return RedrawCursorLineAtBottom;
})(RedrawCursorLine);

var RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine = (function (_RedrawCursorLine8) {
  _inherits(RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine, _RedrawCursorLine8);

  function RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine() {
    _classCallCheck(this, RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);
  }

  // z -

  // Horizontal Scroll without changing cursor position
  // -------------------------
  // zs
  return RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine;
})(RedrawCursorLine);

var ScrollCursorToLeft = (function (_MiscCommand14) {
  _inherits(ScrollCursorToLeft, _MiscCommand14);

  function ScrollCursorToLeft() {
    _classCallCheck(this, ScrollCursorToLeft);

    _get(Object.getPrototypeOf(ScrollCursorToLeft.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'left';
  }

  // ze

  _createClass(ScrollCursorToLeft, [{
    key: 'execute',
    value: function execute() {
      var translation = this.which === 'left' ? [0, 0] : [0, 1];
      var screenPosition = this.editor.getCursorScreenPosition().translate(translation);
      var pixel = this.editorElement.pixelPositionForScreenPosition(screenPosition);
      if (this.which === 'left') {
        this.editorElement.setScrollLeft(pixel.left);
      } else {
        this.editorElement.setScrollRight(pixel.left);
        this.editor.component.updateSync(); // FIXME: This is necessary maybe because of bug of atom-core.
      }
    }
  }]);

  return ScrollCursorToLeft;
})(MiscCommand);

var ScrollCursorToRight = (function (_ScrollCursorToLeft) {
  _inherits(ScrollCursorToRight, _ScrollCursorToLeft);

  function ScrollCursorToRight() {
    _classCallCheck(this, ScrollCursorToRight);

    _get(Object.getPrototypeOf(ScrollCursorToRight.prototype), 'constructor', this).apply(this, arguments);

    this.which = 'right';
  }

  // insert-mode specific commands
  // -------------------------
  return ScrollCursorToRight;
})(ScrollCursorToLeft);

var InsertMode = (function (_MiscCommand15) {
  _inherits(InsertMode, _MiscCommand15);

  function InsertMode() {
    _classCallCheck(this, InsertMode);

    _get(Object.getPrototypeOf(InsertMode.prototype), 'constructor', this).apply(this, arguments);
  }

  // just namespace

  return InsertMode;
})(MiscCommand);

var ActivateNormalModeOnce = (function (_InsertMode) {
  _inherits(ActivateNormalModeOnce, _InsertMode);

  function ActivateNormalModeOnce() {
    _classCallCheck(this, ActivateNormalModeOnce);

    _get(Object.getPrototypeOf(ActivateNormalModeOnce.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ActivateNormalModeOnce, [{
    key: 'execute',
    value: function execute() {
      var _this7 = this;

      var cursorsToMoveRight = this.editor.getCursors().filter(function (cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate('normal');
      for (var cursor of cursorsToMoveRight) {
        this.utils.moveCursorRight(cursor);
      }

      var disposable = atom.commands.onDidDispatch(function (event) {
        if (event.type !== _this7.getCommandName()) {
          disposable.dispose();
          _this7.vimState.activate('insert');
        }
      });
    }
  }]);

  return ActivateNormalModeOnce;
})(InsertMode);

var ToggleReplaceMode = (function (_MiscCommand16) {
  _inherits(ToggleReplaceMode, _MiscCommand16);

  function ToggleReplaceMode() {
    _classCallCheck(this, ToggleReplaceMode);

    _get(Object.getPrototypeOf(ToggleReplaceMode.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ToggleReplaceMode, [{
    key: 'execute',
    value: function execute() {
      if (this.mode === 'insert') {
        if (this.submode === 'replace') {
          this.vimState.operationStack.runNext('ActivateInsertMode');
        } else {
          this.vimState.operationStack.runNext('ActivateReplaceMode');
        }
      }
    }
  }]);

  return ToggleReplaceMode;
})(MiscCommand);

var InsertRegister = (function (_InsertMode2) {
  _inherits(InsertRegister, _InsertMode2);

  function InsertRegister() {
    _classCallCheck(this, InsertRegister);

    _get(Object.getPrototypeOf(InsertRegister.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertRegister, [{
    key: 'execute',
    value: _asyncToGenerator(function* () {
      var _this8 = this;

      var input = yield this.readCharPromised();
      if (input) {
        this.editor.transact(function () {
          for (var selection of _this8.editor.getSelections()) {
            selection.insertText(_this8.vimState.register.getText(input, selection));
          }
        });
      }
    })
  }]);

  return InsertRegister;
})(InsertMode);

var InsertLastInserted = (function (_InsertMode3) {
  _inherits(InsertLastInserted, _InsertMode3);

  function InsertLastInserted() {
    _classCallCheck(this, InsertLastInserted);

    _get(Object.getPrototypeOf(InsertLastInserted.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(InsertLastInserted, [{
    key: 'execute',
    value: function execute() {
      this.editor.insertText(this.vimState.register.getText('.'));
    }
  }]);

  return InsertLastInserted;
})(InsertMode);

var CopyFromLineAbove = (function (_InsertMode4) {
  _inherits(CopyFromLineAbove, _InsertMode4);

  function CopyFromLineAbove() {
    _classCallCheck(this, CopyFromLineAbove);

    _get(Object.getPrototypeOf(CopyFromLineAbove.prototype), 'constructor', this).apply(this, arguments);

    this.rowDelta = -1;
  }

  _createClass(CopyFromLineAbove, [{
    key: 'execute',
    value: function execute() {
      var _this9 = this;

      var translation = [this.rowDelta, 0];
      this.editor.transact(function () {
        for (var selection of _this9.editor.getSelections()) {
          var point = selection.cursor.getBufferPosition().translate(translation);
          if (point.row >= 0) {
            var range = Range.fromPointWithDelta(point, 0, 1);
            var text = _this9.editor.getTextInBufferRange(range);
            if (text) selection.insertText(text);
          }
        }
      });
    }
  }]);

  return CopyFromLineAbove;
})(InsertMode);

var CopyFromLineBelow = (function (_CopyFromLineAbove) {
  _inherits(CopyFromLineBelow, _CopyFromLineAbove);

  function CopyFromLineBelow() {
    _classCallCheck(this, CopyFromLineBelow);

    _get(Object.getPrototypeOf(CopyFromLineBelow.prototype), 'constructor', this).apply(this, arguments);

    this.rowDelta = +1;
  }

  return CopyFromLineBelow;
})(CopyFromLineAbove);

var NextTab = (function (_MiscCommand17) {
  _inherits(NextTab, _MiscCommand17);

  function NextTab() {
    _classCallCheck(this, NextTab);

    _get(Object.getPrototypeOf(NextTab.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NextTab, [{
    key: 'execute',
    value: function execute() {
      var pane = atom.workspace.paneForItem(this.editor);

      if (this.hasCount()) {
        pane.activateItemAtIndex(this.getCount() - 1);
      } else {
        pane.activateNextItem();
      }
    }
  }]);

  return NextTab;
})(MiscCommand);

var PreviousTab = (function (_MiscCommand18) {
  _inherits(PreviousTab, _MiscCommand18);

  function PreviousTab() {
    _classCallCheck(this, PreviousTab);

    _get(Object.getPrototypeOf(PreviousTab.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PreviousTab, [{
    key: 'execute',
    value: function execute() {
      atom.workspace.paneForItem(this.editor).activatePreviousItem();
    }
  }]);

  return PreviousTab;
})(MiscCommand);

module.exports = {
  MiscCommand: MiscCommand,
  Mark: Mark,
  ReverseSelections: ReverseSelections,
  BlockwiseOtherEnd: BlockwiseOtherEnd,
  Undo: Undo,
  Redo: Redo,
  FoldCurrentRow: FoldCurrentRow,
  UnfoldCurrentRow: UnfoldCurrentRow,
  ToggleFold: ToggleFold,
  FoldCurrentRowRecursivelyBase: FoldCurrentRowRecursivelyBase,
  FoldCurrentRowRecursively: FoldCurrentRowRecursively,
  UnfoldCurrentRowRecursively: UnfoldCurrentRowRecursively,
  ToggleFoldRecursively: ToggleFoldRecursively,
  UnfoldAll: UnfoldAll,
  FoldAll: FoldAll,
  UnfoldNextIndentLevel: UnfoldNextIndentLevel,
  FoldNextIndentLevel: FoldNextIndentLevel,
  MiniScrollDown: MiniScrollDown,
  MiniScrollUp: MiniScrollUp,
  RedrawCursorLine: RedrawCursorLine,
  RedrawCursorLineAtTop: RedrawCursorLineAtTop,
  RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine: RedrawCursorLineAtTopAndMoveToFirstCharacterOfLine,
  RedrawCursorLineAtUpperMiddle: RedrawCursorLineAtUpperMiddle,
  RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine: RedrawCursorLineAtUpperMiddleAndMoveToFirstCharacterOfLine,
  RedrawCursorLineAtMiddle: RedrawCursorLineAtMiddle,
  RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine: RedrawCursorLineAtMiddleAndMoveToFirstCharacterOfLine,
  RedrawCursorLineAtBottom: RedrawCursorLineAtBottom,
  RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine: RedrawCursorLineAtBottomAndMoveToFirstCharacterOfLine,
  ScrollCursorToLeft: ScrollCursorToLeft,
  ScrollCursorToRight: ScrollCursorToRight,
  ActivateNormalModeOnce: ActivateNormalModeOnce,
  ToggleReplaceMode: ToggleReplaceMode,
  InsertRegister: InsertRegister,
  InsertLastInserted: InsertLastInserted,
  CopyFromLineAbove: CopyFromLineAbove,
  CopyFromLineBelow: CopyFromLineBelow,
  NextTab: NextTab,
  PreviousTab: PreviousTab
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbWlzYy1jb21tYW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O2VBRUssT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxZQUFMLEtBQUs7O0FBQ1osSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztJQUV4QixXQUFXO1lBQVgsV0FBVzs7V0FBWCxXQUFXOzBCQUFYLFdBQVc7OytCQUFYLFdBQVc7OztlQUFYLFdBQVc7O1dBQ0UsS0FBSzs7OztXQUNDLGNBQWM7Ozs7U0FGakMsV0FBVztHQUFTLElBQUk7O0lBS3hCLElBQUk7WUFBSixJQUFJOztXQUFKLElBQUk7MEJBQUosSUFBSTs7K0JBQUosSUFBSTs7O2VBQUosSUFBSTs7NkJBQ00sYUFBRztBQUNmLFVBQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUE7QUFDMUMsVUFBSSxJQUFJLEVBQUU7QUFDUixZQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUE7T0FDN0Q7S0FDRjs7O1NBTkcsSUFBSTtHQUFTLFdBQVc7O0lBU3hCLGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOzs7ZUFBakIsaUJBQWlCOztXQUNiLG1CQUFHO0FBQ1QsVUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7QUFDdEYsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFBRTtBQUN0QyxZQUFJ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QWdCO0FBQ2hCLFlBQVUsRUFBVixVQUFVO0FBQ1YsK0JBQTZCLEVBQTdCLDZCQUE2QjtBQUM3QiwyQkFBeUIsRUFBekIseUJBQXlCO0FBQ3pCLDZCQUEyQixFQUEzQiwyQkFBMkI7QUFDM0IsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixXQUFTLEVBQVQsU0FBUztBQUNULFNBQU8sRUFBUCxPQUFPO0FBQ1AsdUJBQXFCLEVBQXJCLHFCQUFxQjtBQUNyQixxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLGdCQUFjLEVBQWQsY0FBYztBQUNkLGNBQVksRUFBWixZQUFZO0FBQ1osa0JBQWdCLEVBQWhCLGdCQUFnQjtBQUNoQix1QkFBcUIsRUFBckIscUJBQXFCO0FBQ3JCLG9EQUFrRCxFQUFsRCxrREFBa0Q7QUFDbEQsK0JBQTZCLEVBQTdCLDZCQUE2QjtBQUM3Qiw0REFBMEQsRUFBMUQsMERBQTBEO0FBQzFELDBCQUF3QixFQUF4Qix3QkFBd0I7QUFDeEIsdURBQXFELEVBQXJELHFEQUFxRDtBQUNyRCwwQkFBd0IsRUFBeEIsd0JBQXdCO0FBQ3hCLHVEQUFxRCxFQUFyRCxxREFBcUQ7QUFDckQsb0JBQWtCLEVBQWxCLGtCQUFrQjtBQUNsQixxQkFBbUIsRUFBbkIsbUJBQW1CO0FBQ25CLHdCQUFzQixFQUF0QixzQkFBc0I7QUFDdEIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixnQkFBYyxFQUFkLGNBQWM7QUFDZCxvQkFBa0IsRUFBbEIsa0JBQWtCO0FBQ2xCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixTQUFPLEVBQVAsT0FBTztBQUNQLGFBQVcsRUFBWCxXQUFXO0NBQ1osQ0FBQSIsImZpbGUiOiIvaG9tZS9qYXp6Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKCdhdG9tJylcbmNvbnN0IEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKVxuXG5jbGFzcyBNaXNjQ29tbWFuZCBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gJ21pc2MtY29tbWFuZCdcbn1cblxuY2xhc3MgTWFyayBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgYXN5bmMgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgbWFyayA9IGF3YWl0IHRoaXMucmVhZENoYXJQcm9taXNlZCgpXG4gICAgaWYgKG1hcmspIHtcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQobWFyaywgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBSZXZlcnNlU2VsZWN0aW9ucyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlKHRoaXMuZWRpdG9yLCAhdGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKSlcbiAgICBpZiAodGhpcy5pc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKSkge1xuICAgICAgdGhpcy5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEJsb2Nrd2lzZU90aGVyRW5kIGV4dGVuZHMgUmV2ZXJzZVNlbGVjdGlvbnMge1xuICBleGVjdXRlICgpIHtcbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5jbGFzcyBVbmRvIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlICgpIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIGNvbnN0IG9sZFJhbmdlcyA9IFtdXG5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRDaGFuZ2VUZXh0KGV2ZW50ID0+IHtcbiAgICAgIGZvciAoY29uc3Qge25ld1JhbmdlLCBvbGRSYW5nZX0gb2YgZXZlbnQuY2hhbmdlcykge1xuICAgICAgICBpZiAobmV3UmFuZ2UuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgb2xkUmFuZ2VzLnB1c2gob2xkUmFuZ2UpIC8vIFJlbW92ZSBvbmx5XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHRoaXMubmFtZSA9PT0gJ1VuZG8nKSB7XG4gICAgICB0aGlzLmVkaXRvci51bmRvKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZGl0b3IucmVkbygpXG4gICAgfVxuXG4gICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgc2VsZWN0aW9uLmNsZWFyKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoJ3NldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8nKSkge1xuICAgICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmdldENvbmZpZygnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5JylcbiAgICAgIHRoaXMuc2V0Q3Vyc29yUG9zaXRpb24oe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pXG4gICAgICB0aGlzLnZpbVN0YXRlLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdmbGFzaE9uVW5kb1JlZG8nKSkge1xuICAgICAgaWYgKG5ld1Jhbmdlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5mbGFzaENoYW5nZXMobmV3UmFuZ2VzLCAnY2hhbmdlcycpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZsYXNoQ2hhbmdlcyhvbGRSYW5nZXMsICdkZWxldGVzJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG4gIH1cblxuICBzZXRDdXJzb3JQb3NpdGlvbiAoe25ld1Jhbmdlcywgb2xkUmFuZ2VzLCBzdHJhdGVneX0pIHtcbiAgICBjb25zdCBsYXN0Q3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpIC8vIFRoaXMgaXMgcmVzdG9yZWQgY3Vyc29yXG5cbiAgICBsZXQgY2hhbmdlZFJhbmdlXG5cbiAgICBpZiAoc3RyYXRlZ3kgPT09ICdzbWFydCcpIHtcbiAgICAgIGNoYW5nZWRSYW5nZSA9IHRoaXMudXRpbHMuZmluZFJhbmdlQ29udGFpbnNQb2ludChuZXdSYW5nZXMsIGxhc3RDdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcbiAgICB9IGVsc2UgaWYgKHN0cmF0ZWd5ID09PSAnc2ltcGxlJykge1xuICAgICAgY2hhbmdlZFJhbmdlID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKG5ld1Jhbmdlcy5jb25jYXQob2xkUmFuZ2VzKSlbMF1cbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlZFJhbmdlKSB7XG4gICAgICBpZiAodGhpcy51dGlscy5pc0xpbmV3aXNlUmFuZ2UoY2hhbmdlZFJhbmdlKSkgdGhpcy51dGlscy5zZXRCdWZmZXJSb3cobGFzdEN1cnNvciwgY2hhbmdlZFJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2UgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjaGFuZ2VkUmFuZ2Uuc3RhcnQpXG4gICAgfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VzIChyYW5nZXMsIG11dGF0aW9uVHlwZSkge1xuICAgIGNvbnN0IGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzID0gcmFuZ2VzID0+IHJhbmdlcy5sZW5ndGggPiAxICYmIHJhbmdlcy5ldmVyeSh0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVJhbmdlKVxuICAgIGNvbnN0IGh1bWFuaXplTmV3TGluZUZvckJ1ZmZlclJhbmdlID0gdGhpcy51dGlscy5odW1hbml6ZU5ld0xpbmVGb3JCdWZmZXJSYW5nZS5iaW5kKG51bGwsIHRoaXMuZWRpdG9yKVxuICAgIGNvbnN0IGlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZSA9IHRoaXMudXRpbHMuaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlLmJpbmQobnVsbCwgdGhpcy5lZGl0b3IpXG4gICAgaWYgKCF0aGlzLnV0aWxzLmlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKHJhbmdlcykpIHtcbiAgICAgIHJhbmdlcyA9IHJhbmdlcy5tYXAoaHVtYW5pemVOZXdMaW5lRm9yQnVmZmVyUmFuZ2UpXG4gICAgICBjb25zdCB0eXBlID0gaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMocmFuZ2VzKSA/IGB1bmRvLXJlZG8tbXVsdGlwbGUtJHttdXRhdGlvblR5cGV9YCA6ICd1bmRvLXJlZG8nXG4gICAgICBpZiAoISh0eXBlID09PSAndW5kby1yZWRvJyAmJiBtdXRhdGlvblR5cGUgPT09ICdkZWxldGVzJykpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMuZmlsdGVyKGlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZSksIHt0eXBlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUmVkbyBleHRlbmRzIFVuZG8ge31cblxuLy8gemNcbmNsYXNzIEZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlICgpIHtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuXG4vLyB6b1xuY2xhc3MgVW5mb2xkQ3VycmVudFJvdyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuXG4vLyB6YVxuY2xhc3MgVG9nZ2xlRm9sZCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci50b2dnbGVGb2xkQXRCdWZmZXJSb3cocG9pbnQucm93KVxuICAgIH1cbiAgfVxufVxuXG4vLyBCYXNlIG9mIHpDLCB6TywgekFcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGVhY2hGb2xkU3RhcnRSb3cgKGZuKSB7XG4gICAgZm9yIChjb25zdCB7cm93fSBvZiB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uc09yZGVyZWQoKS5yZXZlcnNlKCkpIHtcbiAgICAgIGlmICghdGhpcy5lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHJvdykpIGNvbnRpbnVlXG5cbiAgICAgIGNvbnN0IGZvbGRSYW5nZXMgPSB0aGlzLnV0aWxzLmdldENvZGVGb2xkUmFuZ2VzKHRoaXMuZWRpdG9yKVxuICAgICAgY29uc3QgZW5jbG9zaW5nRm9sZFJhbmdlID0gZm9sZFJhbmdlcy5maW5kKHJhbmdlID0+IHJhbmdlLnN0YXJ0LnJvdyA9PT0gcm93KVxuICAgICAgY29uc3QgZW5jbG9zZWRGb2xkUmFuZ2VzID0gZm9sZFJhbmdlcy5maWx0ZXIocmFuZ2UgPT4gZW5jbG9zaW5nRm9sZFJhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKVxuXG4gICAgICAvLyBXaHkgcmV2ZXJzZSgpIGlzIHRvIHByb2Nlc3MgZW5jb2xvc2VkKG5lc3RlZCkgZm9sZCBmaXJzdCB0aGFuIGVuY29sb3NpbmcgZm9sZC5cbiAgICAgIGVuY2xvc2VkRm9sZFJhbmdlcy5yZXZlcnNlKCkuZm9yRWFjaChyYW5nZSA9PiBmbihyYW5nZS5zdGFydC5yb3cpKVxuICAgIH1cbiAgfVxuXG4gIGZvbGRSZWN1cnNpdmVseSAoKSB7XG4gICAgdGhpcy5lYWNoRm9sZFN0YXJ0Um93KHJvdyA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgfSlcbiAgfVxuXG4gIHVuZm9sZFJlY3Vyc2l2ZWx5ICgpIHtcbiAgICB0aGlzLmVhY2hGb2xkU3RhcnRSb3cocm93ID0+IHtcbiAgICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgfSlcbiAgfVxufVxuXG4vLyB6Q1xuY2xhc3MgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5mb2xkUmVjdXJzaXZlbHkoKVxuICB9XG59XG5cbi8vIHpPXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMudW5mb2xkUmVjdXJzaXZlbHkoKVxuICB9XG59XG5cbi8vIHpBXG5jbGFzcyBUb2dnbGVGb2xkUmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3cpKSB7XG4gICAgICB0aGlzLnVuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb2xkUmVjdXJzaXZlbHkoKVxuICAgIH1cbiAgfVxufVxuXG4vLyB6UlxuY2xhc3MgVW5mb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuICB9XG59XG5cbi8vIHpNXG5jbGFzcyBGb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlICgpIHtcbiAgICBjb25zdCB7YWxsRm9sZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghYWxsRm9sZCkgcmV0dXJuXG5cbiAgICB0aGlzLmVkaXRvci51bmZvbGRBbGwoKVxuICAgIGZvciAoY29uc3Qge2luZGVudCwgcmFuZ2V9IG9mIGFsbEZvbGQubGlzdE9mUmFuZ2VBbmRJbmRlbnQpIHtcbiAgICAgIGlmIChpbmRlbnQgPD0gdGhpcy5nZXRDb25maWcoJ21heEZvbGRhYmxlSW5kZW50TGV2ZWwnKSkge1xuICAgICAgICB0aGlzLmVkaXRvci5mb2xkQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oe2NlbnRlcjogdHJ1ZX0pXG4gIH1cbn1cblxuLy8genJcbmNsYXNzIFVuZm9sZE5leHRJbmRlbnRMZXZlbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3Qge2ZvbGRlZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghZm9sZGVkKSByZXR1cm5cbiAgICBjb25zdCB7bWluSW5kZW50LCBsaXN0T2ZSYW5nZUFuZEluZGVudH0gPSBmb2xkZWRcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gdGhpcy51dGlscy5nZXRMaXN0KG1pbkluZGVudCwgbWluSW5kZW50ICsgdGhpcy5nZXRDb3VudCgpIC0gMSlcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHJhbmdlfSBvZiBsaXN0T2ZSYW5nZUFuZEluZGVudCkge1xuICAgICAgaWYgKHRhcmdldEluZGVudHMuaW5jbHVkZXMoaW5kZW50KSkge1xuICAgICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyB6bVxuY2xhc3MgRm9sZE5leHRJbmRlbnRMZXZlbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3Qge3VuZm9sZGVkLCBhbGxGb2xkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCF1bmZvbGRlZCkgcmV0dXJuXG4gICAgLy8gRklYTUU6IFdoeSBJIG5lZWQgdW5mb2xkQWxsKCk/IFdoeSBjYW4ndCBJIGp1c3QgZm9sZCBub24tZm9sZGVkLWZvbGQgb25seT9cbiAgICAvLyBVbmxlc3MgdW5mb2xkQWxsKCkgaGVyZSwgQGVkaXRvci51bmZvbGRBbGwoKSBkZWxldGUgZm9sZE1hcmtlciBidXQgZmFpbFxuICAgIC8vIHRvIHJlbmRlciB1bmZvbGRlZCByb3dzIGNvcnJlY3RseS5cbiAgICAvLyBJIGJlbGlldmUgdGhpcyBpcyBidWcgb2YgdGV4dC1idWZmZXIncyBtYXJrZXJMYXllciB3aGljaCBhc3N1bWUgZm9sZHMgYXJlXG4gICAgLy8gY3JlYXRlZCAqKmluLW9yZGVyKiogZnJvbSB0b3Atcm93IHRvIGJvdHRvbS1yb3cuXG4gICAgdGhpcy5lZGl0b3IudW5mb2xkQWxsKClcblxuICAgIGNvbnN0IG1heEZvbGRhYmxlID0gdGhpcy5nZXRDb25maWcoJ21heEZvbGRhYmxlSW5kZW50TGV2ZWwnKVxuICAgIGxldCBmcm9tTGV2ZWwgPSBNYXRoLm1pbih1bmZvbGRlZC5tYXhJbmRlbnQsIG1heEZvbGRhYmxlKVxuICAgIGZyb21MZXZlbCA9IHRoaXMubGltaXROdW1iZXIoZnJvbUxldmVsIC0gdGhpcy5nZXRDb3VudCgpIC0gMSwge21pbjogMH0pXG4gICAgY29uc3QgdGFyZ2V0SW5kZW50cyA9IHRoaXMudXRpbHMuZ2V0TGlzdChmcm9tTGV2ZWwsIG1heEZvbGRhYmxlKVxuICAgIGZvciAoY29uc3Qge2luZGVudCwgcmFuZ2V9IG9mIGFsbEZvbGQubGlzdE9mUmFuZ2VBbmRJbmRlbnQpIHtcbiAgICAgIGlmICh0YXJnZXRJbmRlbnRzLmluY2x1ZGVzKGluZGVudCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vLyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgTWluaVNjcm9sbERvd24gZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGRlZmF1bHRDb3VudCA9IHRoaXMuZ2V0Q29uZmlnKCdkZWZhdWx0U2Nyb2xsUm93c09uTWluaVNjcm9sbCcpXG4gIGRpcmVjdGlvbiA9ICdkb3duJ1xuXG4gIGtlZXBDdXJzb3JPblNjcmVlbiAoKSB7XG4gICAgY29uc3QgY3Vyc29yID0gdGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgY29uc3Qgcm93ID0gY3Vyc29yLmdldFNjcmVlblJvdygpXG4gICAgY29uc3Qgb2Zmc2V0ID0gMlxuICAgIGNvbnN0IHZhbGlkUm93ID1cbiAgICAgIHRoaXMuZGlyZWN0aW9uID09PSAnZG93bidcbiAgICAgICAgPyB0aGlzLmxpbWl0TnVtYmVyKHJvdywge21pbjogdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkgKyBvZmZzZXR9KVxuICAgICAgICA6IHRoaXMubGltaXROdW1iZXIocm93LCB7bWF4OiB0aGlzLmVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpIC0gb2Zmc2V0fSlcbiAgICBpZiAocm93ICE9PSB2YWxpZFJvdykge1xuICAgICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3codmFsaWRSb3cpLCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgIH1cbiAgfVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMudmltU3RhdGUucmVxdWVzdFNjcm9sbCh7XG4gICAgICBhbW91bnRPZlBpeGVsczogKHRoaXMuZGlyZWN0aW9uID09PSAnZG93bicgPyAxIDogLTEpICogdGhpcy5nZXRDb3VudCgpICogdGhpcy5lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCksXG4gICAgICBkdXJhdGlvbjogdGhpcy5nZXRTbW9vdGhTY3JvbGxEdWF0aW9uKCdNaW5pU2Nyb2xsJyksXG4gICAgICBvbkZpbmlzaDogKCkgPT4gdGhpcy5rZWVwQ3Vyc29yT25TY3JlZW4oKVxuICAgIH0pXG4gIH1cbn1cblxuLy8gY3RybC15IHNjcm9sbCBsaW5lcyB1cHdhcmRzXG5jbGFzcyBNaW5pU2Nyb2xsVXAgZXh0ZW5kcyBNaW5pU2Nyb2xsRG93biB7XG4gIGRpcmVjdGlvbiA9ICd1cCdcbn1cblxuLy8gUmVkcmF3Q3Vyc29yTGluZUF0e1hYWH0gaW4gdmlld3BvcnQuXG4vLyArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcbi8vIHwgd2hlcmUgICAgICAgIHwgbm8gbW92ZSB8IG1vdmUgdG8gMXN0IGNoYXIgfFxuLy8gfC0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLSstLS0tLS0tLS0tLS0tLS0tLS18XG4vLyB8IHRvcCAgICAgICAgICB8IHogdCAgICAgfCB6IGVudGVyICAgICAgICAgIHxcbi8vIHwgdXBwZXItbWlkZGxlIHwgeiB1ICAgICB8IHogc3BhY2UgICAgICAgICAgfFxuLy8gfCBtaWRkbGUgICAgICAgfCB6IHogICAgIHwgeiAuICAgICAgICAgICAgICB8XG4vLyB8IGJvdHRvbSAgICAgICB8IHogYiAgICAgfCB6IC0gICAgICAgICAgICAgIHxcbi8vICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZSBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzdGF0aWMgY29lZmZpY2llbnRCeU5hbWUgPSB7XG4gICAgUmVkcmF3Q3Vyc29yTGluZUF0VG9wOiAwLFxuICAgIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlOiAwLjI1LFxuICAgIFJlZHJhd0N1cnNvckxpbmVBdE1pZGRsZTogMC41LFxuICAgIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbTogMVxuICB9XG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgY29uc3QgYmFzZU5hbWUgPSB0aGlzLm5hbWUucmVwbGFjZSgvQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUkLywgJycpXG4gICAgdGhpcy5jb2VmZmljaWVudCA9IHRoaXMuY29uc3RydWN0b3IuY29lZmZpY2llbnRCeU5hbWVbYmFzZU5hbWVdXG4gICAgdGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRoaXMubmFtZS5lbmRzV2l0aCgnQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUnKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3Qgc2Nyb2xsVG9wID0gTWF0aC5yb3VuZCh0aGlzLmdldFNjcm9sbFRvcCgpKVxuICAgIHRoaXMudmltU3RhdGUucmVxdWVzdFNjcm9sbCh7XG4gICAgICBzY3JvbGxUb3A6IHNjcm9sbFRvcCxcbiAgICAgIGR1cmF0aW9uOiB0aGlzLmdldFNtb290aFNjcm9sbER1YXRpb24oJ1JlZHJhd0N1cnNvckxpbmUnKSxcbiAgICAgIG9uRmluaXNoOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgIT09IHNjcm9sbFRvcCAmJiAhdGhpcy5lZGl0b3IuZ2V0U2Nyb2xsUGFzdEVuZCgpKSB7XG4gICAgICAgICAgdGhpcy5yZWNvbW1lbmRUb0VuYWJsZVNjcm9sbFBhc3RFbmQoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAodGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkgdGhpcy5lZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICB9XG5cbiAgZ2V0U2Nyb2xsVG9wICgpIHtcbiAgICBjb25zdCB7dG9wfSA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24odGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKSlcbiAgICBjb25zdCBlZGl0b3JIZWlnaHQgPSB0aGlzLmVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KClcbiAgICBjb25zdCBsaW5lSGVpZ2h0SW5QaXhlbCA9IHRoaXMuZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgICByZXR1cm4gdGhpcy5saW1pdE51bWJlcih0b3AgLSBlZGl0b3JIZWlnaHQgKiB0aGlzLmNvZWZmaWNpZW50LCB7XG4gICAgICBtaW46IHRvcCAtIGVkaXRvckhlaWdodCArIGxpbmVIZWlnaHRJblBpeGVsICogMyxcbiAgICAgIG1heDogdG9wIC0gbGluZUhlaWdodEluUGl4ZWwgKiAyXG4gICAgfSlcbiAgfVxuXG4gIHJlY29tbWVuZFRvRW5hYmxlU2Nyb2xsUGFzdEVuZCAoKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IFtcbiAgICAgICd2aW0tbW9kZS1wbHVzJyxcbiAgICAgICctIEZhaWxlZCB0byBzY3JvbGwuIFRvIHN1Y2Nlc3NmdWxseSBzY3JvbGwsIGBlZGl0b3Iuc2Nyb2xsUGFzdEVuZGAgbmVlZCB0byBiZSBlbmFibGVkLicsXG4gICAgICAnLSBZb3UgY2FuIGRvIGl0IGZyb20gYFwiU2V0dGluZ3NcIiA+IFwiRWRpdG9yXCIgPiBcIlNjcm9sbCBQYXN0IEVuZFwiYC4nLFxuICAgICAgJy0gT3IgKipkbyB5b3UgYWxsb3cgdm1wIGVuYWJsZSBpdCBmb3IgeW91IG5vdz8qKidcbiAgICBdLmpvaW4oJ1xcbicpXG5cbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLCB7XG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdObyB0aGFua3MuJyxcbiAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnT0suIEVuYWJsZSBpdCBub3chIScsXG4gICAgICAgICAgb25EaWRDbGljazogKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KGBlZGl0b3Iuc2Nyb2xsUGFzdEVuZGAsIHRydWUpXG4gICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRUb3AgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHt9IC8vIHp0XG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRUb3BBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFJlZHJhd0N1cnNvckxpbmUge30gLy8geiBlbnRlclxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHt9IC8vIHp1XG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRVcHBlck1pZGRsZUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7fSAvLyB6IHNwYWNlXG5jbGFzcyBSZWRyYXdDdXJzb3JMaW5lQXRNaWRkbGUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHt9IC8vIHogelxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0TWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBSZWRyYXdDdXJzb3JMaW5lIHt9IC8vIHogLlxuY2xhc3MgUmVkcmF3Q3Vyc29yTGluZUF0Qm90dG9tIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7fSAvLyB6IGJcbmNsYXNzIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbUFuZE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgUmVkcmF3Q3Vyc29yTGluZSB7fSAvLyB6IC1cblxuLy8gSG9yaXpvbnRhbCBTY3JvbGwgd2l0aG91dCBjaGFuZ2luZyBjdXJzb3IgcG9zaXRpb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHpzXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0xlZnQgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHdoaWNoID0gJ2xlZnQnXG4gIGV4ZWN1dGUgKCkge1xuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gdGhpcy53aGljaCA9PT0gJ2xlZnQnID8gWzAsIDBdIDogWzAsIDFdXG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICBjb25zdCBwaXhlbCA9IHRoaXMuZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pXG4gICAgaWYgKHRoaXMud2hpY2ggPT09ICdsZWZ0Jykge1xuICAgICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQocGl4ZWwubGVmdClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbFJpZ2h0KHBpeGVsLmxlZnQpXG4gICAgICB0aGlzLmVkaXRvci5jb21wb25lbnQudXBkYXRlU3luYygpIC8vIEZJWE1FOiBUaGlzIGlzIG5lY2Vzc2FyeSBtYXliZSBiZWNhdXNlIG9mIGJ1ZyBvZiBhdG9tLWNvcmUuXG4gICAgfVxuICB9XG59XG5cbi8vIHplXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsQ3Vyc29yVG9MZWZ0IHtcbiAgd2hpY2ggPSAncmlnaHQnXG59XG5cbi8vIGluc2VydC1tb2RlIHNwZWNpZmljIGNvbW1hbmRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbnNlcnRNb2RlIGV4dGVuZHMgTWlzY0NvbW1hbmQge30gLy8ganVzdCBuYW1lc3BhY2VcblxuY2xhc3MgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlICgpIHtcbiAgICBjb25zdCBjdXJzb3JzVG9Nb3ZlUmlnaHQgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkuZmlsdGVyKGN1cnNvciA9PiAhY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSlcbiAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKCdub3JtYWwnKVxuICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIGN1cnNvcnNUb01vdmVSaWdodCkge1xuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yKVxuICAgIH1cblxuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgIT09IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSkge1xuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKCdpbnNlcnQnKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgVG9nZ2xlUmVwbGFjZU1vZGUgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUgKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICdpbnNlcnQnKSB7XG4gICAgICBpZiAodGhpcy5zdWJtb2RlID09PSAncmVwbGFjZScpIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW5OZXh0KCdBY3RpdmF0ZUluc2VydE1vZGUnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW5OZXh0KCdBY3RpdmF0ZVJlcGxhY2VNb2RlJylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgSW5zZXJ0UmVnaXN0ZXIgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgYXN5bmMgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgaW5wdXQgPSBhd2FpdCB0aGlzLnJlYWRDaGFyUHJvbWlzZWQoKVxuICAgIGlmIChpbnB1dCkge1xuICAgICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoaW5wdXQsIHNlbGVjdGlvbikpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEluc2VydExhc3RJbnNlcnRlZCBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLmVkaXRvci5pbnNlcnRUZXh0KHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgnLicpKVxuICB9XG59XG5cbmNsYXNzIENvcHlGcm9tTGluZUFib3ZlIGV4dGVuZHMgSW5zZXJ0TW9kZSB7XG4gIHJvd0RlbHRhID0gLTFcblxuICBleGVjdXRlICgpIHtcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IFt0aGlzLnJvd0RlbHRhLCAwXVxuICAgIHRoaXMuZWRpdG9yLnRyYW5zYWN0KCgpID0+IHtcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gICAgICAgIGlmIChwb2ludC5yb3cgPj0gMCkge1xuICAgICAgICAgIGNvbnN0IHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKVxuICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICBpZiAodGV4dCkgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgQ29weUZyb21MaW5lQmVsb3cgZXh0ZW5kcyBDb3B5RnJvbUxpbmVBYm92ZSB7XG4gIHJvd0RlbHRhID0gKzFcbn1cblxuY2xhc3MgTmV4dFRhYiBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMuZWRpdG9yKVxuXG4gICAgaWYgKHRoaXMuaGFzQ291bnQoKSkge1xuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KHRoaXMuZ2V0Q291bnQoKSAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFByZXZpb3VzVGFiIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlICgpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcikuYWN0aXZhdGVQcmV2aW91c0l0ZW0oKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBNaXNjQ29tbWFuZCxcbiAgTWFyayxcbiAgUmV2ZXJzZVNlbGVjdGlvbnMsXG4gIEJsb2Nrd2lzZU90aGVyRW5kLFxuICBVbmRvLFxuICBSZWRvLFxuICBGb2xkQ3VycmVudFJvdyxcbiAgVW5mb2xkQ3VycmVudFJvdyxcbiAgVG9nZ2xlRm9sZCxcbiAgRm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseUJhc2UsXG4gIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHksXG4gIFVuZm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseSxcbiAgVG9nZ2xlRm9sZFJlY3Vyc2l2ZWx5LFxuICBVbmZvbGRBbGwsXG4gIEZvbGRBbGwsXG4gIFVuZm9sZE5leHRJbmRlbnRMZXZlbCxcbiAgRm9sZE5leHRJbmRlbnRMZXZlbCxcbiAgTWluaVNjcm9sbERvd24sXG4gIE1pbmlTY3JvbGxVcCxcbiAgUmVkcmF3Q3Vyc29yTGluZSxcbiAgUmVkcmF3Q3Vyc29yTGluZUF0VG9wLFxuICBSZWRyYXdDdXJzb3JMaW5lQXRUb3BBbmRNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSxcbiAgUmVkcmF3Q3Vyc29yTGluZUF0VXBwZXJNaWRkbGUsXG4gIFJlZHJhd0N1cnNvckxpbmVBdFVwcGVyTWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIFJlZHJhd0N1cnNvckxpbmVBdE1pZGRsZSxcbiAgUmVkcmF3Q3Vyc29yTGluZUF0TWlkZGxlQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIFJlZHJhd0N1cnNvckxpbmVBdEJvdHRvbSxcbiAgUmVkcmF3Q3Vyc29yTGluZUF0Qm90dG9tQW5kTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUsXG4gIFNjcm9sbEN1cnNvclRvTGVmdCxcbiAgU2Nyb2xsQ3Vyc29yVG9SaWdodCxcbiAgQWN0aXZhdGVOb3JtYWxNb2RlT25jZSxcbiAgVG9nZ2xlUmVwbGFjZU1vZGUsXG4gIEluc2VydFJlZ2lzdGVyLFxuICBJbnNlcnRMYXN0SW5zZXJ0ZWQsXG4gIENvcHlGcm9tTGluZUFib3ZlLFxuICBDb3B5RnJvbUxpbmVCZWxvdyxcbiAgTmV4dFRhYixcbiAgUHJldmlvdXNUYWJcbn1cbiJdfQ==