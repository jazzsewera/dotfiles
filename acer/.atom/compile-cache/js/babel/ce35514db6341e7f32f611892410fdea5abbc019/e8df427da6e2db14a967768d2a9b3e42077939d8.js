'use babel';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;
var Point = _require.Point;

// [TODO] Need overhaul
//  - [ ] Make expandable by selection.getBufferRange().union(this.getRange(selection))
//  - [ ] Count support(priority low)?
var Base = require('./base');
var PairFinder = require('./pair-finder');

var TextObject = (function (_Base) {
  _inherits(TextObject, _Base);

  function TextObject() {
    _classCallCheck(this, TextObject);

    _get(Object.getPrototypeOf(TextObject.prototype), 'constructor', this).apply(this, arguments);

    this.operator = null;
    this.wise = 'characterwise';
    this.supportCount = false;
    this.selectOnce = false;
    this.selectSucceeded = false;
  }

  // Section: Word
  // =========================

  _createClass(TextObject, [{
    key: 'isInner',
    value: function isInner() {
      return this.inner;
    }
  }, {
    key: 'isA',
    value: function isA() {
      return !this.inner;
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
      return this.wise = wise; // FIXME currently not well supported
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      this.selectSucceeded = false;
    }

    // execute: Called from Operator::selectTarget()
    //  - `v i p`, is `VisualModeSelect` operator with @target = `InnerParagraph`.
    //  - `d i p`, is `Delete` operator with @target = `InnerParagraph`.
  }, {
    key: 'execute',
    value: function execute() {
      // Whennever TextObject is executed, it has @operator
      if (!this.operator) throw new Error('in TextObject: Must not happen');
      this.select();
    }
  }, {
    key: 'select',
    value: function select() {
      var _this = this;

      if (this.isMode('visual', 'blockwise')) {
        this.swrap.normalize(this.editor);
      }

      this.countTimes(this.getCount(), function (_ref2) {
        var stop = _ref2.stop;

        if (!_this.supportCount) stop(); // quick-fix for #560

        for (var selection of _this.editor.getSelections()) {
          var oldRange = selection.getBufferRange();
          if (_this.selectTextObject(selection)) _this.selectSucceeded = true;
          if (selection.getBufferRange().isEqual(oldRange)) stop();
          if (_this.selectOnce) break;
        }
      });

      this.editor.mergeIntersectingSelections();
      // Some TextObject's wise is NOT deterministic. It has to be detected from selected range.
      if (this.wise == null) this.wise = this.swrap.detectWise(this.editor);

      if (this.operator['instanceof']('SelectBase')) {
        if (this.selectSucceeded) {
          if (this.wise === 'characterwise') {
            this.swrap.saveProperties(this.editor, { force: true });
          } else if (this.wise === 'linewise') {
            // When target is persistent-selection, new selection is added after selectTextObject.
            // So we have to assure all selection have selction property.
            // Maybe this logic can be moved to operation stack.
            for (var $selection of this.swrap.getSelections(this.editor)) {
              if (this.getConfig('stayOnSelectTextObject')) {
                if (!$selection.hasProperties()) {
                  $selection.saveProperties();
                }
              } else {
                $selection.saveProperties();
              }
              $selection.fixPropertyRowToRowRange();
            }
          }
        }

        if (this.submode === 'blockwise') {
          for (var $selection of this.swrap.getSelections(this.editor)) {
            $selection.normalize();
            $selection.applyWise('blockwise');
          }
        }
      }
    }

    // Return true or false
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range);
        return true;
      } else {
        return false;
      }
    }

    // to override
  }, {
    key: 'getRange',
    value: function getRange(selection) {}
  }], [{
    key: 'deriveClass',
    value: function deriveClass(innerAndA, innerAndAForAllowForwarding) {
      this.command = false; // HACK: klass to derive child class is not command
      var store = {};
      if (innerAndA) {
        var klassA = this.generateClass(false);
        var klassI = this.generateClass(true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      if (innerAndAForAllowForwarding) {
        var klassA = this.generateClass(false, true);
        var klassI = this.generateClass(true, true);
        store[klassA.name] = klassA;
        store[klassI.name] = klassI;
      }
      return store;
    }
  }, {
    key: 'generateClass',
    value: function generateClass(inner, allowForwarding) {
      var name = (inner ? 'Inner' : 'A') + this.name;
      if (allowForwarding) {
        name += 'AllowForwarding';
      }

      return (function (_ref) {
        _inherits(_class, _ref);

        _createClass(_class, null, [{
          key: 'name',
          value: name,
          enumerable: true
        }]);

        function _class(vimState) {
          _classCallCheck(this, _class);

          _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, vimState);
          this.inner = inner;
          if (allowForwarding != null) {
            this.allowForwarding = allowForwarding;
          }
        }

        return _class;
      })(this);
    }
  }, {
    key: 'operationKind',
    value: 'text-object',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return TextObject;
})(Base);

var Word = (function (_TextObject) {
  _inherits(Word, _TextObject);

  function Word() {
    _classCallCheck(this, Word);

    _get(Object.getPrototypeOf(Word.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Word, [{
    key: 'getRange',
    value: function getRange(selection) {
      var point = this.getCursorPositionForSelection(selection);

      var _getWordBufferRangeAndKindAtBufferPosition = this.getWordBufferRangeAndKindAtBufferPosition(point, { wordRegex: this.wordRegex });

      var range = _getWordBufferRangeAndKindAtBufferPosition.range;

      return this.isA() ? this.utils.expandRangeToWhiteSpaces(this.editor, range) : range;
    }
  }]);

  return Word;
})(TextObject);

var WholeWord = (function (_Word) {
  _inherits(WholeWord, _Word);

  function WholeWord() {
    _classCallCheck(this, WholeWord);

    _get(Object.getPrototypeOf(WholeWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  // Just include _, -
  return WholeWord;
})(Word);

var SmartWord = (function (_Word2) {
  _inherits(SmartWord, _Word2);

  function SmartWord() {
    _classCallCheck(this, SmartWord);

    _get(Object.getPrototypeOf(SmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  // Just include _, -
  return SmartWord;
})(Word);

var Subword = (function (_Word3) {
  _inherits(Subword, _Word3);

  function Subword() {
    _classCallCheck(this, Subword);

    _get(Object.getPrototypeOf(Subword.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Pair
  // =========================

  _createClass(Subword, [{
    key: 'getRange',
    value: function getRange(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return _get(Object.getPrototypeOf(Subword.prototype), 'getRange', this).call(this, selection);
    }
  }]);

  return Subword;
})(Word);

var Pair = (function (_TextObject2) {
  _inherits(Pair, _TextObject2);

  function Pair() {
    _classCallCheck(this, Pair);

    _get(Object.getPrototypeOf(Pair.prototype), 'constructor', this).apply(this, arguments);

    this.supportCount = true;
    this.allowNextLine = null;
    this.adjustInnerRange = true;
    this.pair = null;
    this.inclusive = true;
  }

  // Used by DeleteSurround

  _createClass(Pair, [{
    key: 'isAllowNextLine',
    value: function isAllowNextLine() {
      if (this.allowNextLine != null) {
        return this.allowNextLine;
      } else {
        return this.pair && this.pair[0] !== this.pair[1];
      }
    }
  }, {
    key: 'adjustRange',
    value: function adjustRange(_ref3) {
      var start = _ref3.start;
      var end = _ref3.end;

      // Dirty work to feel natural for human, to behave compatible with pure Vim.
      // Where this adjustment appear is in following situation.
      // op-1: `ci{` replace only 2nd line
      // op-2: `di{` delete only 2nd line.
      // text:
      //  {
      //    aaa
      //  }
      if (this.utils.pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }

      if (this.utils.getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === 'visual') {
          // This is slightly innconsistent with regular Vim
          // - regular Vim: select new line after EOL
          // - vim-mode-plus: select to EOL(before new line)
          // This is intentional since to make submode `characterwise` when auto-detect submode
          // innerEnd = new Point(innerEnd.row - 1, Infinity)
          end = new Point(end.row - 1, Infinity);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      var finderName = this.pair[0] === this.pair[1] ? 'QuoteFinder' : 'BracketFinder';
      return new PairFinder[finderName](this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      var pairInfo = this.getFinder().find(from);
      if (pairInfo) {
        if (this.adjustInnerRange) {
          pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
        }
        pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
        return pairInfo;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      // When range was same, try to expand range
      if (pairInfo && pairInfo.targetRange.isEqual(originalRange)) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      if (pairInfo) {
        return pairInfo.targetRange;
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Pair;
})(TextObject);

var APair = (function (_Pair) {
  _inherits(APair, _Pair);

  function APair() {
    _classCallCheck(this, APair);

    _get(Object.getPrototypeOf(APair.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(APair, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return APair;
})(Pair);

var AnyPair = (function (_Pair2) {
  _inherits(AnyPair, _Pair2);

  function AnyPair() {
    _classCallCheck(this, AnyPair);

    _get(Object.getPrototypeOf(AnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = false;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];
  }

  _createClass(AnyPair, [{
    key: 'getRanges',
    value: function getRanges(selection) {
      var _this2 = this;

      var options = {
        inner: this.inner,
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      };
      var getRangeByMember = function getRangeByMember(member) {
        return _this2.getInstance(member, options).getRange(selection);
      };
      return this.member.map(getRangeByMember).filter(function (v) {
        return v;
      });
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      return this.utils.sortRanges(this.getRanges(selection)).pop();
    }
  }]);

  return AnyPair;
})(Pair);

var AnyPairAllowForwarding = (function (_AnyPair) {
  _inherits(AnyPairAllowForwarding, _AnyPair);

  function AnyPairAllowForwarding() {
    _classCallCheck(this, AnyPairAllowForwarding);

    _get(Object.getPrototypeOf(AnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(AnyPairAllowForwarding, [{
    key: 'getRange',
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      var from = selection.cursor.getBufferPosition();

      var _$partition = this._.partition(ranges, function (range) {
        return range.start.isGreaterThanOrEqual(from);
      });

      var _$partition2 = _slicedToArray(_$partition, 2);

      var forwardingRanges = _$partition2[0];
      var enclosingRanges = _$partition2[1];

      var enclosingRange = this.utils.sortRanges(enclosingRanges).pop();
      forwardingRanges = this.utils.sortRanges(forwardingRanges);

      // When enclosingRange is exists,
      // We don't go across enclosingRange.end.
      // So choose from ranges contained in enclosingRange.
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function (range) {
          return enclosingRange.containsRange(range);
        });
      }

      return forwardingRanges[0] || enclosingRange;
    }
  }]);

  return AnyPairAllowForwarding;
})(AnyPair);

var AnyQuote = (function (_AnyPair2) {
  _inherits(AnyQuote, _AnyPair2);

  function AnyQuote() {
    _classCallCheck(this, AnyQuote);

    _get(Object.getPrototypeOf(AnyQuote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
    this.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];
  }

  _createClass(AnyQuote, [{
    key: 'getRange',
    value: function getRange(selection) {
      // Pick range which end.colum is leftmost(mean, closed first)
      return this.getRanges(selection).sort(function (a, b) {
        return a.end.column - b.end.column;
      })[0];
    }
  }]);

  return AnyQuote;
})(AnyPair);

var Quote = (function (_Pair3) {
  _inherits(Quote, _Pair3);

  function Quote() {
    _classCallCheck(this, Quote);

    _get(Object.getPrototypeOf(Quote.prototype), 'constructor', this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(Quote, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Quote;
})(Pair);

var DoubleQuote = (function (_Quote) {
  _inherits(DoubleQuote, _Quote);

  function DoubleQuote() {
    _classCallCheck(this, DoubleQuote);

    _get(Object.getPrototypeOf(DoubleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['"', '"'];
  }

  return DoubleQuote;
})(Quote);

var SingleQuote = (function (_Quote2) {
  _inherits(SingleQuote, _Quote2);

  function SingleQuote() {
    _classCallCheck(this, SingleQuote);

    _get(Object.getPrototypeOf(SingleQuote.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ["'", "'"];
  }

  return SingleQuote;
})(Quote);

var BackTick = (function (_Quote3) {
  _inherits(BackTick, _Quote3);

  function BackTick() {
    _classCallCheck(this, BackTick);

    _get(Object.getPrototypeOf(BackTick.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['`', '`'];
  }

  return BackTick;
})(Quote);

var CurlyBracket = (function (_Pair4) {
  _inherits(CurlyBracket, _Pair4);

  function CurlyBracket() {
    _classCallCheck(this, CurlyBracket);

    _get(Object.getPrototypeOf(CurlyBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['{', '}'];
  }

  return CurlyBracket;
})(Pair);

var SquareBracket = (function (_Pair5) {
  _inherits(SquareBracket, _Pair5);

  function SquareBracket() {
    _classCallCheck(this, SquareBracket);

    _get(Object.getPrototypeOf(SquareBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['[', ']'];
  }

  return SquareBracket;
})(Pair);

var Parenthesis = (function (_Pair6) {
  _inherits(Parenthesis, _Pair6);

  function Parenthesis() {
    _classCallCheck(this, Parenthesis);

    _get(Object.getPrototypeOf(Parenthesis.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['(', ')'];
  }

  return Parenthesis;
})(Pair);

var AngleBracket = (function (_Pair7) {
  _inherits(AngleBracket, _Pair7);

  function AngleBracket() {
    _classCallCheck(this, AngleBracket);

    _get(Object.getPrototypeOf(AngleBracket.prototype), 'constructor', this).apply(this, arguments);

    this.pair = ['<', '>'];
  }

  return AngleBracket;
})(Pair);

var Tag = (function (_Pair8) {
  _inherits(Tag, _Pair8);

  function Tag() {
    _classCallCheck(this, Tag);

    _get(Object.getPrototypeOf(Tag.prototype), 'constructor', this).apply(this, arguments);

    this.allowNextLine = true;
    this.allowForwarding = true;
    this.adjustInnerRange = false;
  }

  // Section: Paragraph
  // =========================
  // Paragraph is defined as consecutive (non-)blank-line.

  _createClass(Tag, [{
    key: 'getTagStartPoint',
    value: function getTagStartPoint(from) {
      var regex = PairFinder.TagFinder.pattern;
      var options = { from: [from.row, 0] };
      return this.findInEditor('forward', regex, options, function (_ref4) {
        var range = _ref4.range;
        return range.containsPoint(from, true) && range.start;
      });
    }
  }, {
    key: 'getFinder',
    value: function getFinder() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    }
  }, {
    key: 'getPairInfo',
    value: function getPairInfo(from) {
      return _get(Object.getPrototypeOf(Tag.prototype), 'getPairInfo', this).call(this, this.getTagStartPoint(from) || from);
    }
  }]);

  return Tag;
})(Pair);

var Paragraph = (function (_TextObject3) {
  _inherits(Paragraph, _TextObject3);

  function Paragraph() {
    _classCallCheck(this, Paragraph);

    _get(Object.getPrototypeOf(Paragraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.supportCount = true;
  }

  _createClass(Paragraph, [{
    key: 'findRow',
    value: function findRow(fromRow, direction, fn) {
      if (fn.reset) fn.reset();
      var foundRow = fromRow;
      for (var row of this.getBufferRows({ startRow: fromRow, direction: direction })) {
        if (!fn(row, direction)) break;
        foundRow = row;
      }
      return foundRow;
    }
  }, {
    key: 'findRowRangeBy',
    value: function findRowRangeBy(fromRow, fn) {
      var startRow = this.findRow(fromRow, 'previous', fn);
      var endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    }
  }, {
    key: 'getPredictFunction',
    value: function getPredictFunction(fromRow, selection) {
      var _this3 = this;

      var fromRowResult = this.editor.isBufferRowBlank(fromRow);

      if (this.isInner()) {
        return function (row, direction) {
          return _this3.editor.isBufferRowBlank(row) === fromRowResult;
        };
      } else {
        var _ret = (function () {
          var directionToExtend = selection.isReversed() ? 'previous' : 'next';

          var flip = false;
          var predict = function predict(row, direction) {
            var result = _this3.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if (!result && direction === directionToExtend) {
                return flip = true;
              }
              return result;
            }
          };
          predict.reset = function () {
            return flip = false;
          };
          return {
            v: predict
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) fromRow--;else fromRow++;
        fromRow = this.getValidVimBufferRow(fromRow);
      }
      var rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    }
  }]);

  return Paragraph;
})(TextObject);

var Indentation = (function (_Paragraph) {
  _inherits(Indentation, _Paragraph);

  function Indentation() {
    _classCallCheck(this, Indentation);

    _get(Object.getPrototypeOf(Indentation.prototype), 'constructor', this).apply(this, arguments);
  }

  // Section: Comment
  // =========================

  _createClass(Indentation, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _this4 = this;

      var fromRow = this.getCursorPositionForSelection(selection).row;
      var baseIndentLevel = this.editor.indentationForBufferRow(fromRow);
      var rowRange = this.findRowRangeBy(fromRow, function (row) {
        if (_this4.editor.isBufferRowBlank(row)) {
          return _this4.isA();
        } else {
          return _this4.editor.indentationForBufferRow(row) >= baseIndentLevel;
        }
      });
      return this.getBufferRangeForRowRange(rowRange);
    }
  }]);

  return Indentation;
})(Paragraph);

var Comment = (function (_TextObject4) {
  _inherits(Comment, _TextObject4);

  function Comment() {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Comment, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection.row;

      var rowRange = this.utils.getRowRangeForCommentAtBufferRow(this.editor, row);
      if (rowRange) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    }
  }]);

  return Comment;
})(TextObject);

var BlockComment = (function (_TextObject5) {
  _inherits(BlockComment, _TextObject5);

  function BlockComment() {
    _classCallCheck(this, BlockComment);

    _get(Object.getPrototypeOf(BlockComment.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'characterwise';
  }

  _createClass(BlockComment, [{
    key: 'getRange',
    value: function getRange(selection) {
      // Following one-column-right translation is necessary when cursor is "on" `/` char of beginning `/*`.
      var from = this.editor.clipBufferPosition(this.getCursorPositionForSelection(selection).translate([0, 1]));

      var range = this.getBlockCommentRangeForPoint(from);
      if (range) {
        range.start = this.getStartOfBlockComment(range.start);
        range.end = this.getEndOfBlockComment(range.end);
        var scanRange = range;

        if (this.isInner()) {
          this.scanEditor('forward', /\s+/, { scanRange: scanRange }, function (event) {
            range.start = event.range.end;
            event.stop();
          });
          this.scanEditor('backward', /\s+/, { scanRange: scanRange }, function (event) {
            range.end = event.range.start;
            event.stop();
          });
        }
        return range;
      }
    }
  }, {
    key: 'getStartOfBlockComment',
    value: function getStartOfBlockComment(start) {
      while (start.column === 0) {
        var range = this.getBlockCommentRangeForPoint(start.translate([-1, Infinity]));
        if (!range) break;
        start = range.start;
      }
      return start;
    }
  }, {
    key: 'getEndOfBlockComment',
    value: function getEndOfBlockComment(end) {
      while (this.utils.pointIsAtEndOfLine(this.editor, end)) {
        var range = this.getBlockCommentRangeForPoint([end.row + 1, 0]);
        if (!range) break;
        end = range.end;
      }
      return end;
    }
  }, {
    key: 'getBlockCommentRangeForPoint',
    value: function getBlockCommentRangeForPoint(point) {
      var scope = 'comment.block';
      return this.editor.bufferRangeForScopeAtPosition(scope, point);
    }
  }]);

  return BlockComment;
})(TextObject);

var CommentOrParagraph = (function (_TextObject6) {
  _inherits(CommentOrParagraph, _TextObject6);

  function CommentOrParagraph() {
    _classCallCheck(this, CommentOrParagraph);

    _get(Object.getPrototypeOf(CommentOrParagraph.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  // Section: Fold
  // =========================

  _createClass(CommentOrParagraph, [{
    key: 'getRange',
    value: function getRange(selection) {
      var inner = this.inner;

      for (var klass of ['Comment', 'Paragraph']) {
        var range = this.getInstance(klass, { inner: inner }).getRange(selection);
        if (range) {
          return range;
        }
      }
    }
  }]);

  return CommentOrParagraph;
})(TextObject);

var Fold = (function (_TextObject7) {
  _inherits(Fold, _TextObject7);

  function Fold() {
    _classCallCheck(this, Fold);

    _get(Object.getPrototypeOf(Fold.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(Fold, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _this5 = this;

      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection2.row;

      var selectedRange = selection.getBufferRange();

      var foldRanges = this.utils.getCodeFoldRanges(this.editor);
      var foldRangesContainsCursorRow = foldRanges.filter(function (range) {
        return range.start.row <= row && row <= range.end.row;
      });

      var _loop = function (_foldRange) {
        if (_this5.isA()) {
          var conjoined = undefined;
          while (conjoined = foldRanges.find(function (range) {
            return range.end.row === _foldRange.start.row;
          })) {
            _foldRange = _foldRange.union(conjoined);
          }
          while (conjoined = foldRanges.find(function (range) {
            return range.start.row === _foldRange.end.row;
          })) {
            _foldRange = _foldRange.union(conjoined);
          }
        } else {
          if (_this5.utils.doesRangeStartAndEndWithSameIndentLevel(_this5.editor, _foldRange)) {
            _foldRange.end.row -= 1;
          }
          _foldRange.start.row += 1;
        }
        _foldRange = _this5.getBufferRangeForRowRange([_foldRange.start.row, _foldRange.end.row]);
        if (!selectedRange.containsRange(_foldRange)) {
          return {
            v: _foldRange
          };
        }
        foldRange = _foldRange;
      };

      for (var foldRange of foldRangesContainsCursorRow.reverse()) {
        var _ret2 = _loop(foldRange);

        if (typeof _ret2 === 'object') return _ret2.v;
      }
    }
  }]);

  return Fold;
})(TextObject);

var Function = (function (_TextObject8) {
  _inherits(Function, _TextObject8);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.scopeNamesOmittingClosingBrace = ['source.go', 'source.elixir'];
  }

  // Section: Other
  // =========================

  _createClass(Function, [{
    key: 'getFunctionBodyStartRegex',
    // language doesn't include closing `}` into fold.

    value: function getFunctionBodyStartRegex(_ref5) {
      var scopeName = _ref5.scopeName;

      if (scopeName === 'source.python') {
        return (/:$/
        );
      } else if (scopeName === 'source.coffee') {
        return (/-|=>$/
        );
      } else {
        return (/{$/
        );
      }
    }
  }, {
    key: 'isMultiLineParameterFunctionRange',
    value: function isMultiLineParameterFunctionRange(parameterRange, bodyRange, bodyStartRegex) {
      var _this6 = this;

      var isBodyStartRow = function isBodyStartRow(row) {
        return bodyStartRegex.test(_this6.editor.lineTextForBufferRow(row));
      };
      if (isBodyStartRow(parameterRange.start.row)) return false;
      if (isBodyStartRow(parameterRange.end.row)) return parameterRange.end.row === bodyRange.start.row;
      if (isBodyStartRow(parameterRange.end.row + 1)) return parameterRange.end.row + 1 === bodyRange.start.row;
      return false;
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _this7 = this;

      var editor = this.editor;
      var cursorRow = this.getCursorPositionForSelection(selection).row;
      var bodyStartRegex = this.getFunctionBodyStartRegex(editor.getGrammar());
      var isIncludeFunctionScopeForRow = function isIncludeFunctionScopeForRow(row) {
        return _this7.utils.isIncludeFunctionScopeForRow(editor, row);
      };

      var functionRanges = [];
      var saveFunctionRange = function saveFunctionRange(_ref6) {
        var aRange = _ref6.aRange;
        var innerRange = _ref6.innerRange;

        functionRanges.push({
          aRange: _this7.buildARange(aRange),
          innerRange: _this7.buildInnerRange(innerRange)
        });
      };

      var foldRanges = this.utils.getCodeFoldRanges(editor);
      while (foldRanges.length) {
        var range = foldRanges.shift();
        if (isIncludeFunctionScopeForRow(range.start.row)) {
          var nextRange = foldRanges[0];
          var nextFoldIsConnected = nextRange && nextRange.start.row <= range.end.row + 1;
          var maybeAFunctionRange = nextFoldIsConnected ? range.union(nextRange) : range;
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation
          if (nextFoldIsConnected && this.isMultiLineParameterFunctionRange(range, nextRange, bodyStartRegex)) {
            var bodyRange = foldRanges.shift();
            saveFunctionRange({ aRange: range.union(bodyRange), innerRange: bodyRange });
          } else {
            saveFunctionRange({ aRange: range, innerRange: range });
          }
        } else {
          var previousRow = range.start.row - 1;
          if (previousRow < 0) continue;
          if (editor.isFoldableAtBufferRow(previousRow)) continue;
          var maybeAFunctionRange = range.union(editor.bufferRangeForBufferRow(previousRow));
          if (!maybeAFunctionRange.containsPoint([cursorRow, Infinity])) continue; // skip to avoid heavy computation

          var isBodyStartOnlyRow = function isBodyStartOnlyRow(row) {
            return new RegExp('^\\s*' + bodyStartRegex.source).test(editor.lineTextForBufferRow(row));
          };
          if (isBodyStartOnlyRow(range.start.row) && isIncludeFunctionScopeForRow(previousRow)) {
            saveFunctionRange({ aRange: maybeAFunctionRange, innerRange: range });
          }
        }
      }

      for (var functionRange of functionRanges.reverse()) {
        var _ref7 = this.isA() ? functionRange.aRange : functionRange.innerRange;

        var start = _ref7.start;
        var end = _ref7.end;

        var range = this.getBufferRangeForRowRange([start.row, end.row]);
        if (!selection.getBufferRange().containsRange(range)) return range;
      }
    }
  }, {
    key: 'buildInnerRange',
    value: function buildInnerRange(range) {
      var endRowTranslation = this.utils.doesRangeStartAndEndWithSameIndentLevel(this.editor, range) ? -1 : 0;
      return range.translate([1, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'buildARange',
    value: function buildARange(range) {
      // NOTE: This adjustment shoud not be necessary if language-syntax is properly defined.
      var endRowTranslation = this.isGrammarDoesNotFoldClosingRow() ? +1 : 0;
      return range.translate([0, 0], [endRowTranslation, 0]);
    }
  }, {
    key: 'isGrammarDoesNotFoldClosingRow',
    value: function isGrammarDoesNotFoldClosingRow() {
      var _editor$getGrammar = this.editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;
      var packageName = _editor$getGrammar.packageName;

      if (this.scopeNamesOmittingClosingBrace.includes(scopeName)) {
        return true;
      } else {
        // HACK: Rust have two package `language-rust` and `atom-language-rust`
        // language-rust don't fold ending `}`, but atom-language-rust does.
        return scopeName === 'source.rust' && packageName === 'language-rust';
      }
    }
  }]);

  return Function;
})(TextObject);

var Arguments = (function (_TextObject9) {
  _inherits(Arguments, _TextObject9);

  function Arguments() {
    _classCallCheck(this, Arguments);

    _get(Object.getPrototypeOf(Arguments.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Arguments, [{
    key: 'newArgInfo',
    value: function newArgInfo(argStart, arg, separator) {
      var argEnd = this.utils.traverseTextFromPoint(argStart, arg);
      var argRange = new Range(argStart, argEnd);

      var separatorEnd = this.utils.traverseTextFromPoint(argEnd, separator != null ? separator : '');
      var separatorRange = new Range(argEnd, separatorEnd);

      var innerRange = argRange;
      var aRange = argRange.union(separatorRange);
      return { argRange: argRange, separatorRange: separatorRange, innerRange: innerRange, aRange: aRange };
    }
  }, {
    key: 'getArgumentsRangeForSelection',
    value: function getArgumentsRangeForSelection(selection) {
      var options = {
        member: ['CurlyBracket', 'SquareBracket', 'Parenthesis'],
        inclusive: false
      };
      return this.getInstance('InnerAnyPair', options).getRange(selection);
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var _utils = this.utils;
      var splitArguments = _utils.splitArguments;
      var traverseTextFromPoint = _utils.traverseTextFromPoint;
      var getLast = _utils.getLast;

      var range = this.getArgumentsRangeForSelection(selection);
      var pairRangeFound = range != null;

      range = range || this.getInstance('InnerCurrentLine').getRange(selection); // fallback
      if (!range) return;

      range = this.trimBufferRange(range);

      var text = this.editor.getTextInBufferRange(range);
      var allTokens = splitArguments(text, pairRangeFound);

      var argInfos = [];
      var argStart = range.start;

      // Skip starting separator
      if (allTokens.length && allTokens[0].type === 'separator') {
        var token = allTokens.shift();
        argStart = traverseTextFromPoint(argStart, token.text);
      }

      while (allTokens.length) {
        var token = allTokens.shift();
        if (token.type === 'argument') {
          var nextToken = allTokens.shift();
          var separator = nextToken ? nextToken.text : undefined;
          var argInfo = this.newArgInfo(argStart, token.text, separator);

          if (allTokens.length === 0 && argInfos.length) {
            argInfo.aRange = argInfo.argRange.union(getLast(argInfos).separatorRange);
          }

          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error('must not happen');
        }
      }

      var point = this.getCursorPositionForSelection(selection);
      for (var _ref82 of argInfos) {
        var innerRange = _ref82.innerRange;
        var aRange = _ref82.aRange;

        if (innerRange.end.isGreaterThanOrEqual(point)) {
          return this.isInner() ? innerRange : aRange;
        }
      }
    }
  }]);

  return Arguments;
})(TextObject);

var CurrentLine = (function (_TextObject10) {
  _inherits(CurrentLine, _TextObject10);

  function CurrentLine() {
    _classCallCheck(this, CurrentLine);

    _get(Object.getPrototypeOf(CurrentLine.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CurrentLine, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _getCursorPositionForSelection3 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection3.row;

      var range = this.editor.bufferRangeForBufferRow(row);
      return this.isA() ? range : this.trimBufferRange(range);
    }
  }]);

  return CurrentLine;
})(TextObject);

var Entire = (function (_TextObject11) {
  _inherits(Entire, _TextObject11);

  function Entire() {
    _classCallCheck(this, Entire);

    _get(Object.getPrototypeOf(Entire.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(Entire, [{
    key: 'getRange',
    value: function getRange(selection) {
      return this.editor.buffer.getRange();
    }
  }]);

  return Entire;
})(TextObject);

var Empty = (function (_TextObject12) {
  _inherits(Empty, _TextObject12);

  function Empty() {
    _classCallCheck(this, Empty);

    _get(Object.getPrototypeOf(Empty.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(Empty, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Empty;
})(TextObject);

var LatestChange = (function (_TextObject13) {
  _inherits(LatestChange, _TextObject13);

  function LatestChange() {
    _classCallCheck(this, LatestChange);

    _get(Object.getPrototypeOf(LatestChange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LatestChange, [{
    key: 'getRange',
    value: function getRange(selection) {
      var start = this.vimState.mark.get('[');
      var end = this.vimState.mark.get(']');
      if (start && end) {
        return new Range(start, end);
      }
    }
  }]);

  return LatestChange;
})(TextObject);

var SearchMatchForward = (function (_TextObject14) {
  _inherits(SearchMatchForward, _TextObject14);

  function SearchMatchForward() {
    _classCallCheck(this, SearchMatchForward);

    _get(Object.getPrototypeOf(SearchMatchForward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = false;
  }

  _createClass(SearchMatchForward, [{
    key: 'findMatch',
    value: function findMatch(from, regex) {
      if (this.backward) {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'backward');
        }

        var options = { from: [from.row, Infinity] };
        return {
          range: this.findInEditor('backward', regex, options, function (_ref9) {
            var range = _ref9.range;
            return range.start.isLessThan(from) && range;
          }),
          whichIsHead: 'start'
        };
      } else {
        if (this.mode === 'visual') {
          from = this.utils.translatePointAndClip(this.editor, from, 'forward');
        }

        var options = { from: [from.row, 0] };
        return {
          range: this.findInEditor('forward', regex, options, function (_ref10) {
            var range = _ref10.range;
            return range.end.isGreaterThan(from) && range;
          }),
          whichIsHead: 'end'
        };
      }
    }
  }, {
    key: 'getRange',
    value: function getRange(selection) {
      var pattern = this.globalState.get('lastSearchPattern');
      if (!pattern) return;

      var fromPoint = selection.getHeadBufferPosition();

      var _findMatch = this.findMatch(fromPoint, pattern);

      var range = _findMatch.range;
      var whichIsHead = _findMatch.whichIsHead;

      if (range) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    }
  }, {
    key: 'unionRangeAndDetermineReversedState',
    value: function unionRangeAndDetermineReversedState(selection, range, whichIsHead) {
      if (selection.isEmpty()) return range;

      var head = range[whichIsHead];
      var tail = selection.getTailBufferPosition();

      if (this.backward) {
        if (tail.isLessThan(head)) head = this.utils.translatePointAndClip(this.editor, head, 'forward');
      } else {
        if (head.isLessThan(tail)) head = this.utils.translatePointAndClip(this.editor, head, 'backward');
      }

      this.reversed = head.isLessThan(tail);
      return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
    }
  }, {
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range, { reversed: this.reversed != null ? this.reversed : this.backward });
        return true;
      }
    }
  }]);

  return SearchMatchForward;
})(TextObject);

var SearchMatchBackward = (function (_SearchMatchForward) {
  _inherits(SearchMatchBackward, _SearchMatchForward);

  function SearchMatchBackward() {
    _classCallCheck(this, SearchMatchBackward);

    _get(Object.getPrototypeOf(SearchMatchBackward.prototype), 'constructor', this).apply(this, arguments);

    this.backward = true;
  }

  // [Limitation: won't fix]: Selected range is not submode aware. always characterwise.
  // So even if original selection was vL or vB, selected range by this text-object
  // is always vC range.
  return SearchMatchBackward;
})(SearchMatchForward);

var PreviousSelection = (function (_TextObject15) {
  _inherits(PreviousSelection, _TextObject15);

  function PreviousSelection() {
    _classCallCheck(this, PreviousSelection);

    _get(Object.getPrototypeOf(PreviousSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PreviousSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      var _vimState$previousSelection = this.vimState.previousSelection;
      var properties = _vimState$previousSelection.properties;
      var submode = _vimState$previousSelection.submode;

      if (properties && submode) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    }
  }]);

  return PreviousSelection;
})(TextObject);

var PersistentSelection = (function (_TextObject16) {
  _inherits(PersistentSelection, _TextObject16);

  function PersistentSelection() {
    _classCallCheck(this, PersistentSelection);

    _get(Object.getPrototypeOf(PersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  // Used only by ReplaceWithRegister and PutBefore and its' children.

  _createClass(PersistentSelection, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    }
  }]);

  return PersistentSelection;
})(TextObject);

var LastPastedRange = (function (_TextObject17) {
  _inherits(LastPastedRange, _TextObject17);

  function LastPastedRange() {
    _classCallCheck(this, LastPastedRange);

    _get(Object.getPrototypeOf(LastPastedRange.prototype), 'constructor', this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LastPastedRange, [{
    key: 'selectTextObject',
    value: function selectTextObject(selection) {
      for (selection of this.editor.getSelections()) {
        var range = this.vimState.sequentialPasteManager.getPastedRangeForSelection(selection);
        selection.setBufferRange(range);
      }
      return true;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return LastPastedRange;
})(TextObject);

var VisibleArea = (function (_TextObject18) {
  _inherits(VisibleArea, _TextObject18);

  function VisibleArea() {
    _classCallCheck(this, VisibleArea);

    _get(Object.getPrototypeOf(VisibleArea.prototype), 'constructor', this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(VisibleArea, [{
    key: 'getRange',
    value: function getRange(selection) {
      var _editor$getVisibleRowRange = this.editor.getVisibleRowRange();

      var _editor$getVisibleRowRange2 = _slicedToArray(_editor$getVisibleRowRange, 2);

      var startRow = _editor$getVisibleRowRange2[0];
      var endRow = _editor$getVisibleRowRange2[1];

      return this.editor.bufferRangeForScreenRange([[startRow, 0], [endRow, Infinity]]);
    }
  }]);

  return VisibleArea;
})(TextObject);

var DiffHunk = (function (_TextObject19) {
  _inherits(DiffHunk, _TextObject19);

  function DiffHunk() {
    _classCallCheck(this, DiffHunk);

    _get(Object.getPrototypeOf(DiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.selectOnce = true;
  }

  _createClass(DiffHunk, [{
    key: 'getRange',
    value: function getRange(selection) {
      var row = this.getCursorPositionForSelection(selection).row;
      return this.utils.getHunkRangeAtBufferRow(this.editor, row);
    }
  }]);

  return DiffHunk;
})(TextObject);

module.exports = Object.assign({
  TextObject: TextObject,
  Word: Word,
  WholeWord: WholeWord,
  SmartWord: SmartWord,
  Subword: Subword,
  Pair: Pair,
  APair: APair,
  AnyPair: AnyPair,
  AnyPairAllowForwarding: AnyPairAllowForwarding,
  AnyQuote: AnyQuote,
  Quote: Quote,
  DoubleQuote: DoubleQuote,
  SingleQuote: SingleQuote,
  BackTick: BackTick,
  CurlyBracket: CurlyBracket,
  SquareBracket: SquareBracket,
  Parenthesis: Parenthesis,
  AngleBracket: AngleBracket,
  Tag: Tag,
  Paragraph: Paragraph,
  Indentation: Indentation,
  Comment: Comment,
  CommentOrParagraph: CommentOrParagraph,
  Fold: Fold,
  Function: Function,
  Arguments: Arguments,
  CurrentLine: CurrentLine,
  Entire: Entire,
  Empty: Empty,
  LatestChange: LatestChange,
  SearchMatchForward: SearchMatchForward,
  SearchMatchBackward: SearchMatchBackward,
  PreviousSelection: PreviousSelection,
  PersistentSelection: PersistentSelection,
  LastPastedRange: LastPastedRange,
  VisibleArea: VisibleArea
}, Word.deriveClass(true), WholeWord.deriveClass(true), SmartWord.deriveClass(true), Subword.deriveClass(true), AnyPair.deriveClass(true), AnyPairAllowForwarding.deriveClass(true), AnyQuote.deriveClass(true), DoubleQuote.deriveClass(true), SingleQuote.deriveClass(true), BackTick.deriveClass(true), CurlyBracket.deriveClass(true, true), SquareBracket.deriveClass(true, true), Parenthesis.deriveClass(true, true), AngleBracket.deriveClass(true, true), Tag.deriveClass(true), Paragraph.deriveClass(true), Indentation.deriveClass(true), Comment.deriveClass(true), BlockComment.deriveClass(true), CommentOrParagraph.deriveClass(true), Fold.deriveClass(true), Function.deriveClass(true), Arguments.deriveClass(true), CurrentLine.deriveClass(true), Entire.deriveClass(true), LatestChange.deriveClass(true), PersistentSelection.deriveClass(true), VisibleArea.deriveClass(true), DiffHunk.deriveClass(true));
// FIXME #472, #66
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7ZUFFWSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEvQixLQUFLLFlBQUwsS0FBSztJQUFFLEtBQUssWUFBTCxLQUFLOzs7OztBQUtuQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUIsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBOztJQUVyQyxVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7O1NBSWQsUUFBUSxHQUFHLElBQUk7U0FDZixJQUFJLEdBQUcsZUFBZTtTQUN0QixZQUFZLEdBQUcsS0FBSztTQUNwQixVQUFVLEdBQUcsS0FBSztTQUNsQixlQUFlLEdBQUcsS0FBSzs7Ozs7O2VBUm5CLFVBQVU7O1dBOENOLG1CQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ2xCOzs7V0FFRyxlQUFHO0FBQ0wsYUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbkI7OztXQUVVLHNCQUFHO0FBQ1osYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVcsdUJBQUc7QUFDYixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUyxtQkFBQyxJQUFJLEVBQUU7QUFDZixhQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQzFCOzs7V0FFVSxzQkFBRztBQUNaLFVBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFBO0tBQzdCOzs7Ozs7O1dBS08sbUJBQUc7O0FBRVQsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FB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QUksQ0FBQyxFQUMxQixZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFDcEMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3JDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUNuQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFDcEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDckIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDM0IsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDN0IsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDekIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDOUIsa0JBQWtCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUNwQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUN0QixRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUMxQixTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUMzQixXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUM3QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUN4QixZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUM5QixtQkFBbUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQ3JDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQzdCLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQzNCLENBQUEiLCJmaWxlIjoiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSgnYXRvbScpXG5cbi8vIFtUT0RPXSBOZWVkIG92ZXJoYXVsXG4vLyAgLSBbIF0gTWFrZSBleHBhbmRhYmxlIGJ5IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnVuaW9uKHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKSlcbi8vICAtIFsgXSBDb3VudCBzdXBwb3J0KHByaW9yaXR5IGxvdyk/XG5jb25zdCBCYXNlID0gcmVxdWlyZSgnLi9iYXNlJylcbmNvbnN0IFBhaXJGaW5kZXIgPSByZXF1aXJlKCcuL3BhaXItZmluZGVyJylcblxuY2xhc3MgVGV4dE9iamVjdCBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9ICd0ZXh0LW9iamVjdCdcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuXG4gIG9wZXJhdG9yID0gbnVsbFxuICB3aXNlID0gJ2NoYXJhY3Rlcndpc2UnXG4gIHN1cHBvcnRDb3VudCA9IGZhbHNlIC8vIEZJWE1FICM0NzIsICM2NlxuICBzZWxlY3RPbmNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBzdGF0aWMgZGVyaXZlQ2xhc3MgKGlubmVyQW5kQSwgaW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgdGhpcy5jb21tYW5kID0gZmFsc2UgLy8gSEFDSzoga2xhc3MgdG8gZGVyaXZlIGNoaWxkIGNsYXNzIGlzIG5vdCBjb21tYW5kXG4gICAgY29uc3Qgc3RvcmUgPSB7fVxuICAgIGlmIChpbm5lckFuZEEpIHtcbiAgICAgIGNvbnN0IGtsYXNzQSA9IHRoaXMuZ2VuZXJhdGVDbGFzcyhmYWxzZSlcbiAgICAgIGNvbnN0IGtsYXNzSSA9IHRoaXMuZ2VuZXJhdGVDbGFzcyh0cnVlKVxuICAgICAgc3RvcmVba2xhc3NBLm5hbWVdID0ga2xhc3NBXG4gICAgICBzdG9yZVtrbGFzc0kubmFtZV0gPSBrbGFzc0lcbiAgICB9XG4gICAgaWYgKGlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZykge1xuICAgICAgY29uc3Qga2xhc3NBID0gdGhpcy5nZW5lcmF0ZUNsYXNzKGZhbHNlLCB0cnVlKVxuICAgICAgY29uc3Qga2xhc3NJID0gdGhpcy5nZW5lcmF0ZUNsYXNzKHRydWUsIHRydWUpXG4gICAgICBzdG9yZVtrbGFzc0EubmFtZV0gPSBrbGFzc0FcbiAgICAgIHN0b3JlW2tsYXNzSS5uYW1lXSA9IGtsYXNzSVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmVcbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZUNsYXNzIChpbm5lciwgYWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgbGV0IG5hbWUgPSAoaW5uZXIgPyAnSW5uZXInIDogJ0EnKSArIHRoaXMubmFtZVxuICAgIGlmIChhbGxvd0ZvcndhcmRpbmcpIHtcbiAgICAgIG5hbWUgKz0gJ0FsbG93Rm9yd2FyZGluZydcbiAgICB9XG5cbiAgICByZXR1cm4gY2xhc3MgZXh0ZW5kcyB0aGlzIHtcbiAgICAgIHN0YXRpYyBuYW1lID0gbmFtZVxuICAgICAgY29uc3RydWN0b3IgKHZpbVN0YXRlKSB7XG4gICAgICAgIHN1cGVyKHZpbVN0YXRlKVxuICAgICAgICB0aGlzLmlubmVyID0gaW5uZXJcbiAgICAgICAgaWYgKGFsbG93Rm9yd2FyZGluZyAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5hbGxvd0ZvcndhcmRpbmcgPSBhbGxvd0ZvcndhcmRpbmdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzSW5uZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmlubmVyXG4gIH1cblxuICBpc0EgKCkge1xuICAgIHJldHVybiAhdGhpcy5pbm5lclxuICB9XG5cbiAgaXNMaW5ld2lzZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gJ2xpbmV3aXNlJ1xuICB9XG5cbiAgaXNCbG9ja3dpc2UgKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09ICdibG9ja3dpc2UnXG4gIH1cblxuICBmb3JjZVdpc2UgKHdpc2UpIHtcbiAgICByZXR1cm4gKHRoaXMud2lzZSA9IHdpc2UpIC8vIEZJWE1FIGN1cnJlbnRseSBub3Qgd2VsbCBzdXBwb3J0ZWRcbiAgfVxuXG4gIHJlc2V0U3RhdGUgKCkge1xuICAgIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgfVxuXG4gIC8vIGV4ZWN1dGU6IENhbGxlZCBmcm9tIE9wZXJhdG9yOjpzZWxlY3RUYXJnZXQoKVxuICAvLyAgLSBgdiBpIHBgLCBpcyBgVmlzdWFsTW9kZVNlbGVjdGAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgLy8gIC0gYGQgaSBwYCwgaXMgYERlbGV0ZWAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgLy8gV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICBpZiAoIXRoaXMub3BlcmF0b3IpIHRocm93IG5ldyBFcnJvcignaW4gVGV4dE9iamVjdDogTXVzdCBub3QgaGFwcGVuJylcbiAgICB0aGlzLnNlbGVjdCgpXG4gIH1cblxuICBzZWxlY3QgKCkge1xuICAgIGlmICh0aGlzLmlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpKSB7XG4gICAgICB0aGlzLnN3cmFwLm5vcm1hbGl6ZSh0aGlzLmVkaXRvcilcbiAgICB9XG5cbiAgICB0aGlzLmNvdW50VGltZXModGhpcy5nZXRDb3VudCgpLCAoe3N0b3B9KSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3VwcG9ydENvdW50KSBzdG9wKCkgLy8gcXVpY2stZml4IGZvciAjNTYwXG5cbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBvbGRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSkgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSB0cnVlXG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VxdWFsKG9sZFJhbmdlKSkgc3RvcCgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdE9uY2UpIGJyZWFrXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgLy8gU29tZSBUZXh0T2JqZWN0J3Mgd2lzZSBpcyBOT1QgZGV0ZXJtaW5pc3RpYy4gSXQgaGFzIHRvIGJlIGRldGVjdGVkIGZyb20gc2VsZWN0ZWQgcmFuZ2UuXG4gICAgaWYgKHRoaXMud2lzZSA9PSBudWxsKSB0aGlzLndpc2UgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpXG5cbiAgICBpZiAodGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKCdTZWxlY3RCYXNlJykpIHtcbiAgICAgIGlmICh0aGlzLnNlbGVjdFN1Y2NlZWRlZCkge1xuICAgICAgICBpZiAodGhpcy53aXNlID09PSAnY2hhcmFjdGVyd2lzZScpIHtcbiAgICAgICAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yLCB7Zm9yY2U6IHRydWV9KVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMud2lzZSA9PT0gJ2xpbmV3aXNlJykge1xuICAgICAgICAgIC8vIFdoZW4gdGFyZ2V0IGlzIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBuZXcgc2VsZWN0aW9uIGlzIGFkZGVkIGFmdGVyIHNlbGVjdFRleHRPYmplY3QuXG4gICAgICAgICAgLy8gU28gd2UgaGF2ZSB0byBhc3N1cmUgYWxsIHNlbGVjdGlvbiBoYXZlIHNlbGN0aW9uIHByb3BlcnR5LlxuICAgICAgICAgIC8vIE1heWJlIHRoaXMgbG9naWMgY2FuIGJlIG1vdmVkIHRvIG9wZXJhdGlvbiBzdGFjay5cbiAgICAgICAgICBmb3IgKGNvbnN0ICRzZWxlY3Rpb24gb2YgdGhpcy5zd3JhcC5nZXRTZWxlY3Rpb25zKHRoaXMuZWRpdG9yKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdzdGF5T25TZWxlY3RUZXh0T2JqZWN0JykpIHtcbiAgICAgICAgICAgICAgaWYgKCEkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKSkge1xuICAgICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2VsZWN0aW9uLnNhdmVQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzZWxlY3Rpb24uZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuc3VibW9kZSA9PT0gJ2Jsb2Nrd2lzZScpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2Jsb2Nrd2lzZScpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgdGhpcy5zd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLy8gdG8gb3ZlcnJpZGVcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge31cbn1cblxuLy8gU2VjdGlvbjogV29yZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCB7cmFuZ2V9ID0gdGhpcy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwge3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gdGhpcy51dGlscy5leHBhbmRSYW5nZVRvV2hpdGVTcGFjZXModGhpcy5lZGl0b3IsIHJhbmdlKSA6IHJhbmdlXG4gIH1cbn1cblxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZCB7XG4gIHdvcmRSZWdleCA9IC9bXFx3LV0rL1xufVxuXG4vLyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmQge1xuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBzZWxlY3Rpb24uY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHJldHVybiBzdXBlci5nZXRSYW5nZShzZWxlY3Rpb24pXG4gIH1cbn1cblxuLy8gU2VjdGlvbjogUGFpclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUGFpciBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcbiAgYWxsb3dOZXh0TGluZSA9IG51bGxcbiAgYWRqdXN0SW5uZXJSYW5nZSA9IHRydWVcbiAgcGFpciA9IG51bGxcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIGlzQWxsb3dOZXh0TGluZSAoKSB7XG4gICAgaWYgKHRoaXMuYWxsb3dOZXh0TGluZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5hbGxvd05leHRMaW5lXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhaXIgJiYgdGhpcy5wYWlyWzBdICE9PSB0aGlzLnBhaXJbMV1cbiAgICB9XG4gIH1cblxuICBhZGp1c3RSYW5nZSAoe3N0YXJ0LCBlbmR9KSB7XG4gICAgLy8gRGlydHkgd29yayB0byBmZWVsIG5hdHVyYWwgZm9yIGh1bWFuLCB0byBiZWhhdmUgY29tcGF0aWJsZSB3aXRoIHB1cmUgVmltLlxuICAgIC8vIFdoZXJlIHRoaXMgYWRqdXN0bWVudCBhcHBlYXIgaXMgaW4gZm9sbG93aW5nIHNpdHVhdGlvbi5cbiAgICAvLyBvcC0xOiBgY2l7YCByZXBsYWNlIG9ubHkgMm5kIGxpbmVcbiAgICAvLyBvcC0yOiBgZGl7YCBkZWxldGUgb25seSAybmQgbGluZS5cbiAgICAvLyB0ZXh0OlxuICAgIC8vICB7XG4gICAgLy8gICAgYWFhXG4gICAgLy8gIH1cbiAgICBpZiAodGhpcy51dGlscy5wb2ludElzQXRFbmRPZkxpbmUodGhpcy5lZGl0b3IsIHN0YXJ0KSkge1xuICAgICAgc3RhcnQgPSBzdGFydC50cmF2ZXJzZShbMSwgMF0pXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXRpbHMuZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBlbmQpLm1hdGNoKC9eXFxzKiQvKSkge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBzbGlnaHRseSBpbm5jb25zaXN0ZW50IHdpdGggcmVndWxhciBWaW1cbiAgICAgICAgLy8gLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAvLyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsIHNpbmNlIHRvIG1ha2Ugc3VibW9kZSBgY2hhcmFjdGVyd2lzZWAgd2hlbiBhdXRvLWRldGVjdCBzdWJtb2RlXG4gICAgICAgIC8vIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGdldEZpbmRlciAoKSB7XG4gICAgY29uc3QgZmluZGVyTmFtZSA9IHRoaXMucGFpclswXSA9PT0gdGhpcy5wYWlyWzFdID8gJ1F1b3RlRmluZGVyJyA6ICdCcmFja2V0RmluZGVyJ1xuICAgIHJldHVybiBuZXcgUGFpckZpbmRlcltmaW5kZXJOYW1lXSh0aGlzLmVkaXRvciwge1xuICAgICAgYWxsb3dOZXh0TGluZTogdGhpcy5pc0FsbG93TmV4dExpbmUoKSxcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBwYWlyOiB0aGlzLnBhaXIsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlXG4gICAgfSlcbiAgfVxuXG4gIGdldFBhaXJJbmZvIChmcm9tKSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICBpZiAocGFpckluZm8pIHtcbiAgICAgIGlmICh0aGlzLmFkanVzdElubmVyUmFuZ2UpIHtcbiAgICAgICAgcGFpckluZm8uaW5uZXJSYW5nZSA9IHRoaXMuYWRqdXN0UmFuZ2UocGFpckluZm8uaW5uZXJSYW5nZSlcbiAgICAgIH1cbiAgICAgIHBhaXJJbmZvLnRhcmdldFJhbmdlID0gdGhpcy5pc0lubmVyKCkgPyBwYWlySW5mby5pbm5lclJhbmdlIDogcGFpckluZm8uYVJhbmdlXG4gICAgICByZXR1cm4gcGFpckluZm9cbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbGV0IHBhaXJJbmZvID0gdGhpcy5nZXRQYWlySW5mbyh0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgLy8gV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIChwYWlySW5mbyAmJiBwYWlySW5mby50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpKSB7XG4gICAgICBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICB9XG4gICAgaWYgKHBhaXJJbmZvKSB7XG4gICAgICByZXR1cm4gcGFpckluZm8udGFyZ2V0UmFuZ2VcbiAgICB9XG4gIH1cbn1cblxuLy8gVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxufVxuXG5jbGFzcyBBbnlQYWlyIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IGZhbHNlXG4gIG1lbWJlciA9IFsnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snLCAnQ3VybHlCcmFja2V0JywgJ0FuZ2xlQnJhY2tldCcsICdTcXVhcmVCcmFja2V0JywgJ1BhcmVudGhlc2lzJ11cblxuICBnZXRSYW5nZXMgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBpbm5lcjogdGhpcy5pbm5lcixcbiAgICAgIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsXG4gICAgICBpbmNsdXNpdmU6IHRoaXMuaW5jbHVzaXZlXG4gICAgfVxuICAgIGNvbnN0IGdldFJhbmdlQnlNZW1iZXIgPSBtZW1iZXIgPT4gdGhpcy5nZXRJbnN0YW5jZShtZW1iZXIsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICByZXR1cm4gdGhpcy5tZW1iZXIubWFwKGdldFJhbmdlQnlNZW1iZXIpLmZpbHRlcih2ID0+IHYpXG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc29ydFJhbmdlcyh0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pKS5wb3AoKVxuICB9XG59XG5cbmNsYXNzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgY29uc3QgZnJvbSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxldCBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IHRoaXMuXy5wYXJ0aXRpb24ocmFuZ2VzLCByYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChmcm9tKSlcbiAgICBjb25zdCBlbmNsb3NpbmdSYW5nZSA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhlbmNsb3NpbmdSYW5nZXMpLnBvcCgpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhmb3J3YXJkaW5nUmFuZ2VzKVxuXG4gICAgLy8gV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgLy8gV2UgZG9uJ3QgZ28gYWNyb3NzIGVuY2xvc2luZ1JhbmdlLmVuZC5cbiAgICAvLyBTbyBjaG9vc2UgZnJvbSByYW5nZXMgY29udGFpbmVkIGluIGVuY2xvc2luZ1JhbmdlLlxuICAgIGlmIChlbmNsb3NpbmdSYW5nZSkge1xuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyKHJhbmdlID0+IGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKVxuICAgIH1cblxuICAgIHJldHVybiBmb3J3YXJkaW5nUmFuZ2VzWzBdIHx8IGVuY2xvc2luZ1JhbmdlXG4gIH1cbn1cblxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gdHJ1ZVxuICBtZW1iZXIgPSBbJ0RvdWJsZVF1b3RlJywgJ1NpbmdsZVF1b3RlJywgJ0JhY2tUaWNrJ11cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgLy8gUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIHJldHVybiB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pLnNvcnQoKGEsIGIpID0+IGEuZW5kLmNvbHVtbiAtIGIuZW5kLmNvbHVtbilbMF1cbiAgfVxufVxuXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXIge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbn1cblxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbJ1wiJywgJ1wiJ11cbn1cblxuY2xhc3MgU2luZ2xlUXVvdGUgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbXCInXCIsIFwiJ1wiXVxufVxuXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFsnYCcsICdgJ11cbn1cblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbJ3snLCAnfSddXG59XG5cbmNsYXNzIFNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsnWycsICddJ11cbn1cblxuY2xhc3MgUGFyZW50aGVzaXMgZXh0ZW5kcyBQYWlyIHtcbiAgcGFpciA9IFsnKCcsICcpJ11cbn1cblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbJzwnLCAnPiddXG59XG5cbmNsYXNzIFRhZyBleHRlbmRzIFBhaXIge1xuICBhbGxvd05leHRMaW5lID0gdHJ1ZVxuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG4gIGFkanVzdElubmVyUmFuZ2UgPSBmYWxzZVxuXG4gIGdldFRhZ1N0YXJ0UG9pbnQgKGZyb20pIHtcbiAgICBjb25zdCByZWdleCA9IFBhaXJGaW5kZXIuVGFnRmluZGVyLnBhdHRlcm5cbiAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtmcm9tLnJvdywgMF19XG4gICAgcmV0dXJuIHRoaXMuZmluZEluRWRpdG9yKCdmb3J3YXJkJywgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5jb250YWluc1BvaW50KGZyb20sIHRydWUpICYmIHJhbmdlLnN0YXJ0KVxuICB9XG5cbiAgZ2V0RmluZGVyICgpIHtcbiAgICByZXR1cm4gbmV3IFBhaXJGaW5kZXIuVGFnRmluZGVyKHRoaXMuZWRpdG9yLCB7XG4gICAgICBhbGxvd05leHRMaW5lOiB0aGlzLmlzQWxsb3dOZXh0TGluZSgpLFxuICAgICAgYWxsb3dGb3J3YXJkaW5nOiB0aGlzLmFsbG93Rm9yd2FyZGluZyxcbiAgICAgIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmVcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8gKGZyb20pIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0UGFpckluZm8odGhpcy5nZXRUYWdTdGFydFBvaW50KGZyb20pIHx8IGZyb20pXG4gIH1cbn1cblxuLy8gU2VjdGlvbjogUGFyYWdyYXBoXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBQYXJhZ3JhcGggaXMgZGVmaW5lZCBhcyBjb25zZWN1dGl2ZSAobm9uLSlibGFuay1saW5lLlxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHN1cHBvcnRDb3VudCA9IHRydWVcblxuICBmaW5kUm93IChmcm9tUm93LCBkaXJlY3Rpb24sIGZuKSB7XG4gICAgaWYgKGZuLnJlc2V0KSBmbi5yZXNldCgpXG4gICAgbGV0IGZvdW5kUm93ID0gZnJvbVJvd1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0QnVmZmVyUm93cyh7c3RhcnRSb3c6IGZyb21Sb3csIGRpcmVjdGlvbn0pKSB7XG4gICAgICBpZiAoIWZuKHJvdywgZGlyZWN0aW9uKSkgYnJlYWtcbiAgICAgIGZvdW5kUm93ID0gcm93XG4gICAgfVxuICAgIHJldHVybiBmb3VuZFJvd1xuICB9XG5cbiAgZmluZFJvd1JhbmdlQnkgKGZyb21Sb3csIGZuKSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgJ3ByZXZpb3VzJywgZm4pXG4gICAgY29uc3QgZW5kUm93ID0gdGhpcy5maW5kUm93KGZyb21Sb3csICduZXh0JywgZm4pXG4gICAgcmV0dXJuIFtzdGFydFJvdywgZW5kUm93XVxuICB9XG5cbiAgZ2V0UHJlZGljdEZ1bmN0aW9uIChmcm9tUm93LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBmcm9tUm93UmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhmcm9tUm93KVxuXG4gICAgaWYgKHRoaXMuaXNJbm5lcigpKSB7XG4gICAgICByZXR1cm4gKHJvdywgZGlyZWN0aW9uKSA9PiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgPT09IGZyb21Sb3dSZXN1bHRcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGlyZWN0aW9uVG9FeHRlbmQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpID8gJ3ByZXZpb3VzJyA6ICduZXh0J1xuXG4gICAgICBsZXQgZmxpcCA9IGZhbHNlXG4gICAgICBjb25zdCBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSA9PT0gZnJvbVJvd1Jlc3VsdFxuICAgICAgICBpZiAoZmxpcCkge1xuICAgICAgICAgIHJldHVybiAhcmVzdWx0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFyZXN1bHQgJiYgZGlyZWN0aW9uID09PSBkaXJlY3Rpb25Ub0V4dGVuZCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbGlwID0gdHJ1ZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwcmVkaWN0LnJlc2V0ID0gKCkgPT4gKGZsaXAgPSBmYWxzZSlcbiAgICAgIHJldHVybiBwcmVkaWN0XG4gICAgfVxuICB9XG5cbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGxldCBmcm9tUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGlmICh0aGlzLmlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJykpIHtcbiAgICAgIGlmIChzZWxlY3Rpb24uaXNSZXZlcnNlZCgpKSBmcm9tUm93LS1cbiAgICAgIGVsc2UgZnJvbVJvdysrXG4gICAgICBmcm9tUm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIH1cbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMuZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgdGhpcy5nZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSlcbiAgICByZXR1cm4gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKSlcbiAgfVxufVxuXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaCB7XG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBmcm9tUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGNvbnN0IGJhc2VJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLmZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIHJvdyA9PiB7XG4gICAgICBpZiAodGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzQSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSA+PSBiYXNlSW5kZW50TGV2ZWxcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG4gIH1cbn1cblxuLy8gU2VjdGlvbjogQ29tbWVudFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tbWVudCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHJvd1JhbmdlID0gdGhpcy51dGlscy5nZXRSb3dSYW5nZUZvckNvbW1lbnRBdEJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KVxuICAgIGlmIChyb3dSYW5nZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQmxvY2tDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnY2hhcmFjdGVyd2lzZSdcblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgLy8gRm9sbG93aW5nIG9uZS1jb2x1bW4tcmlnaHQgdHJhbnNsYXRpb24gaXMgbmVjZXNzYXJ5IHdoZW4gY3Vyc29yIGlzIFwib25cIiBgL2AgY2hhciBvZiBiZWdpbm5pbmcgYC8qYC5cbiAgICBjb25zdCBmcm9tID0gdGhpcy5lZGl0b3IuY2xpcEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS50cmFuc2xhdGUoWzAsIDFdKSlcblxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRCbG9ja0NvbW1lbnRSYW5nZUZvclBvaW50KGZyb20pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICByYW5nZS5zdGFydCA9IHRoaXMuZ2V0U3RhcnRPZkJsb2NrQ29tbWVudChyYW5nZS5zdGFydClcbiAgICAgIHJhbmdlLmVuZCA9IHRoaXMuZ2V0RW5kT2ZCbG9ja0NvbW1lbnQocmFuZ2UuZW5kKVxuICAgICAgY29uc3Qgc2NhblJhbmdlID0gcmFuZ2VcblxuICAgICAgaWYgKHRoaXMuaXNJbm5lcigpKSB7XG4gICAgICAgIHRoaXMuc2NhbkVkaXRvcignZm9yd2FyZCcsIC9cXHMrLywge3NjYW5SYW5nZX0sIGV2ZW50ID0+IHtcbiAgICAgICAgICByYW5nZS5zdGFydCA9IGV2ZW50LnJhbmdlLmVuZFxuICAgICAgICAgIGV2ZW50LnN0b3AoKVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLnNjYW5FZGl0b3IoJ2JhY2t3YXJkJywgL1xccysvLCB7c2NhblJhbmdlfSwgZXZlbnQgPT4ge1xuICAgICAgICAgIHJhbmdlLmVuZCA9IGV2ZW50LnJhbmdlLnN0YXJ0XG4gICAgICAgICAgZXZlbnQuc3RvcCgpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gcmFuZ2VcbiAgICB9XG4gIH1cblxuICBnZXRTdGFydE9mQmxvY2tDb21tZW50IChzdGFydCkge1xuICAgIHdoaWxlIChzdGFydC5jb2x1bW4gPT09IDApIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRCbG9ja0NvbW1lbnRSYW5nZUZvclBvaW50KHN0YXJ0LnRyYW5zbGF0ZShbLTEsIEluZmluaXR5XSkpXG4gICAgICBpZiAoIXJhbmdlKSBicmVha1xuICAgICAgc3RhcnQgPSByYW5nZS5zdGFydFxuICAgIH1cbiAgICByZXR1cm4gc3RhcnRcbiAgfVxuXG4gIGdldEVuZE9mQmxvY2tDb21tZW50IChlbmQpIHtcbiAgICB3aGlsZSAodGhpcy51dGlscy5wb2ludElzQXRFbmRPZkxpbmUodGhpcy5lZGl0b3IsIGVuZCkpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRCbG9ja0NvbW1lbnRSYW5nZUZvclBvaW50KFtlbmQucm93ICsgMSwgMF0pXG4gICAgICBpZiAoIXJhbmdlKSBicmVha1xuICAgICAgZW5kID0gcmFuZ2UuZW5kXG4gICAgfVxuICAgIHJldHVybiBlbmRcbiAgfVxuXG4gIGdldEJsb2NrQ29tbWVudFJhbmdlRm9yUG9pbnQgKHBvaW50KSB7XG4gICAgY29uc3Qgc2NvcGUgPSAnY29tbWVudC5ibG9jaydcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGUsIHBvaW50KVxuICB9XG59XG5cbmNsYXNzIENvbW1lbnRPclBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7aW5uZXJ9ID0gdGhpc1xuICAgIGZvciAoY29uc3Qga2xhc3Mgb2YgWydDb21tZW50JywgJ1BhcmFncmFwaCddKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2Uoa2xhc3MsIHtpbm5lcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIGlmIChyYW5nZSkge1xuICAgICAgICByZXR1cm4gcmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gU2VjdGlvbjogRm9sZFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRm9sZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IHNlbGVjdGVkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gICAgY29uc3QgZm9sZFJhbmdlcyA9IHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSYW5nZXModGhpcy5lZGl0b3IpXG4gICAgY29uc3QgZm9sZFJhbmdlc0NvbnRhaW5zQ3Vyc29yUm93ID0gZm9sZFJhbmdlcy5maWx0ZXIocmFuZ2UgPT4gcmFuZ2Uuc3RhcnQucm93IDw9IHJvdyAmJiByb3cgPD0gcmFuZ2UuZW5kLnJvdylcblxuICAgIGZvciAobGV0IGZvbGRSYW5nZSBvZiBmb2xkUmFuZ2VzQ29udGFpbnNDdXJzb3JSb3cucmV2ZXJzZSgpKSB7XG4gICAgICBpZiAodGhpcy5pc0EoKSkge1xuICAgICAgICBsZXQgY29uam9pbmVkXG4gICAgICAgIHdoaWxlICgoY29uam9pbmVkID0gZm9sZFJhbmdlcy5maW5kKHJhbmdlID0+IHJhbmdlLmVuZC5yb3cgPT09IGZvbGRSYW5nZS5zdGFydC5yb3cpKSkge1xuICAgICAgICAgIGZvbGRSYW5nZSA9IGZvbGRSYW5nZS51bmlvbihjb25qb2luZWQpXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKChjb25qb2luZWQgPSBmb2xkUmFuZ2VzLmZpbmQocmFuZ2UgPT4gcmFuZ2Uuc3RhcnQucm93ID09PSBmb2xkUmFuZ2UuZW5kLnJvdykpKSB7XG4gICAgICAgICAgZm9sZFJhbmdlID0gZm9sZFJhbmdlLnVuaW9uKGNvbmpvaW5lZClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMudXRpbHMuZG9lc1JhbmdlU3RhcnRBbmRFbmRXaXRoU2FtZUluZGVudExldmVsKHRoaXMuZWRpdG9yLCBmb2xkUmFuZ2UpKSB7XG4gICAgICAgICAgZm9sZFJhbmdlLmVuZC5yb3cgLT0gMVxuICAgICAgICB9XG4gICAgICAgIGZvbGRSYW5nZS5zdGFydC5yb3cgKz0gMVxuICAgICAgfVxuICAgICAgZm9sZFJhbmdlID0gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKFtmb2xkUmFuZ2Uuc3RhcnQucm93LCBmb2xkUmFuZ2UuZW5kLnJvd10pXG4gICAgICBpZiAoIXNlbGVjdGVkUmFuZ2UuY29udGFpbnNSYW5nZShmb2xkUmFuZ2UpKSB7XG4gICAgICAgIHJldHVybiBmb2xkUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9ICdsaW5ld2lzZSdcbiAgc2NvcGVOYW1lc09taXR0aW5nQ2xvc2luZ0JyYWNlID0gWydzb3VyY2UuZ28nLCAnc291cmNlLmVsaXhpciddIC8vIGxhbmd1YWdlIGRvZXNuJ3QgaW5jbHVkZSBjbG9zaW5nIGB9YCBpbnRvIGZvbGQuXG5cbiAgZ2V0RnVuY3Rpb25Cb2R5U3RhcnRSZWdleCAoe3Njb3BlTmFtZX0pIHtcbiAgICBpZiAoc2NvcGVOYW1lID09PSAnc291cmNlLnB5dGhvbicpIHtcbiAgICAgIHJldHVybiAvOiQvXG4gICAgfSBlbHNlIGlmIChzY29wZU5hbWUgPT09ICdzb3VyY2UuY29mZmVlJykge1xuICAgICAgcmV0dXJuIC8tfD0+JC9cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIC97JC9cbiAgICB9XG4gIH1cblxuICBpc011bHRpTGluZVBhcmFtZXRlckZ1bmN0aW9uUmFuZ2UgKHBhcmFtZXRlclJhbmdlLCBib2R5UmFuZ2UsIGJvZHlTdGFydFJlZ2V4KSB7XG4gICAgY29uc3QgaXNCb2R5U3RhcnRSb3cgPSByb3cgPT4gYm9keVN0YXJ0UmVnZXgudGVzdCh0aGlzLmVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpKVxuICAgIGlmIChpc0JvZHlTdGFydFJvdyhwYXJhbWV0ZXJSYW5nZS5zdGFydC5yb3cpKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoaXNCb2R5U3RhcnRSb3cocGFyYW1ldGVyUmFuZ2UuZW5kLnJvdykpIHJldHVybiBwYXJhbWV0ZXJSYW5nZS5lbmQucm93ID09PSBib2R5UmFuZ2Uuc3RhcnQucm93XG4gICAgaWYgKGlzQm9keVN0YXJ0Um93KHBhcmFtZXRlclJhbmdlLmVuZC5yb3cgKyAxKSkgcmV0dXJuIHBhcmFtZXRlclJhbmdlLmVuZC5yb3cgKyAxID09PSBib2R5UmFuZ2Uuc3RhcnQucm93XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5lZGl0b3JcbiAgICBjb25zdCBjdXJzb3JSb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgY29uc3QgYm9keVN0YXJ0UmVnZXggPSB0aGlzLmdldEZ1bmN0aW9uQm9keVN0YXJ0UmVnZXgoZWRpdG9yLmdldEdyYW1tYXIoKSlcbiAgICBjb25zdCBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93ID0gcm93ID0+IHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhlZGl0b3IsIHJvdylcblxuICAgIGNvbnN0IGZ1bmN0aW9uUmFuZ2VzID0gW11cbiAgICBjb25zdCBzYXZlRnVuY3Rpb25SYW5nZSA9ICh7YVJhbmdlLCBpbm5lclJhbmdlfSkgPT4ge1xuICAgICAgZnVuY3Rpb25SYW5nZXMucHVzaCh7XG4gICAgICAgIGFSYW5nZTogdGhpcy5idWlsZEFSYW5nZShhUmFuZ2UpLFxuICAgICAgICBpbm5lclJhbmdlOiB0aGlzLmJ1aWxkSW5uZXJSYW5nZShpbm5lclJhbmdlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBmb2xkUmFuZ2VzID0gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJhbmdlcyhlZGl0b3IpXG4gICAgd2hpbGUgKGZvbGRSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCByYW5nZSA9IGZvbGRSYW5nZXMuc2hpZnQoKVxuICAgICAgaWYgKGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3cocmFuZ2Uuc3RhcnQucm93KSkge1xuICAgICAgICBjb25zdCBuZXh0UmFuZ2UgPSBmb2xkUmFuZ2VzWzBdXG4gICAgICAgIGNvbnN0IG5leHRGb2xkSXNDb25uZWN0ZWQgPSBuZXh0UmFuZ2UgJiYgbmV4dFJhbmdlLnN0YXJ0LnJvdyA8PSByYW5nZS5lbmQucm93ICsgMVxuICAgICAgICBjb25zdCBtYXliZUFGdW5jdGlvblJhbmdlID0gbmV4dEZvbGRJc0Nvbm5lY3RlZCA/IHJhbmdlLnVuaW9uKG5leHRSYW5nZSkgOiByYW5nZVxuICAgICAgICBpZiAoIW1heWJlQUZ1bmN0aW9uUmFuZ2UuY29udGFpbnNQb2ludChbY3Vyc29yUm93LCBJbmZpbml0eV0pKSBjb250aW51ZSAvLyBza2lwIHRvIGF2b2lkIGhlYXZ5IGNvbXB1dGF0aW9uXG4gICAgICAgIGlmIChuZXh0Rm9sZElzQ29ubmVjdGVkICYmIHRoaXMuaXNNdWx0aUxpbmVQYXJhbWV0ZXJGdW5jdGlvblJhbmdlKHJhbmdlLCBuZXh0UmFuZ2UsIGJvZHlTdGFydFJlZ2V4KSkge1xuICAgICAgICAgIGNvbnN0IGJvZHlSYW5nZSA9IGZvbGRSYW5nZXMuc2hpZnQoKVxuICAgICAgICAgIHNhdmVGdW5jdGlvblJhbmdlKHthUmFuZ2U6IHJhbmdlLnVuaW9uKGJvZHlSYW5nZSksIGlubmVyUmFuZ2U6IGJvZHlSYW5nZX0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2F2ZUZ1bmN0aW9uUmFuZ2Uoe2FSYW5nZTogcmFuZ2UsIGlubmVyUmFuZ2U6IHJhbmdlfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNSb3cgPSByYW5nZS5zdGFydC5yb3cgLSAxXG4gICAgICAgIGlmIChwcmV2aW91c1JvdyA8IDApIGNvbnRpbnVlXG4gICAgICAgIGlmIChlZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHByZXZpb3VzUm93KSkgY29udGludWVcbiAgICAgICAgY29uc3QgbWF5YmVBRnVuY3Rpb25SYW5nZSA9IHJhbmdlLnVuaW9uKGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwcmV2aW91c1JvdykpXG4gICAgICAgIGlmICghbWF5YmVBRnVuY3Rpb25SYW5nZS5jb250YWluc1BvaW50KFtjdXJzb3JSb3csIEluZmluaXR5XSkpIGNvbnRpbnVlIC8vIHNraXAgdG8gYXZvaWQgaGVhdnkgY29tcHV0YXRpb25cblxuICAgICAgICBjb25zdCBpc0JvZHlTdGFydE9ubHlSb3cgPSByb3cgPT5cbiAgICAgICAgICBuZXcgUmVnRXhwKCdeXFxcXHMqJyArIGJvZHlTdGFydFJlZ2V4LnNvdXJjZSkudGVzdChlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcbiAgICAgICAgaWYgKGlzQm9keVN0YXJ0T25seVJvdyhyYW5nZS5zdGFydC5yb3cpICYmIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3cocHJldmlvdXNSb3cpKSB7XG4gICAgICAgICAgc2F2ZUZ1bmN0aW9uUmFuZ2Uoe2FSYW5nZTogbWF5YmVBRnVuY3Rpb25SYW5nZSwgaW5uZXJSYW5nZTogcmFuZ2V9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBmdW5jdGlvblJhbmdlIG9mIGZ1bmN0aW9uUmFuZ2VzLnJldmVyc2UoKSkge1xuICAgICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gdGhpcy5pc0EoKSA/IGZ1bmN0aW9uUmFuZ2UuYVJhbmdlIDogZnVuY3Rpb25SYW5nZS5pbm5lclJhbmdlXG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShbc3RhcnQucm93LCBlbmQucm93XSlcbiAgICAgIGlmICghc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuY29udGFpbnNSYW5nZShyYW5nZSkpIHJldHVybiByYW5nZVxuICAgIH1cbiAgfVxuXG4gIGJ1aWxkSW5uZXJSYW5nZSAocmFuZ2UpIHtcbiAgICBjb25zdCBlbmRSb3dUcmFuc2xhdGlvbiA9IHRoaXMudXRpbHMuZG9lc1JhbmdlU3RhcnRBbmRFbmRXaXRoU2FtZUluZGVudExldmVsKHRoaXMuZWRpdG9yLCByYW5nZSkgPyAtMSA6IDBcbiAgICByZXR1cm4gcmFuZ2UudHJhbnNsYXRlKFsxLCAwXSwgW2VuZFJvd1RyYW5zbGF0aW9uLCAwXSlcbiAgfVxuXG4gIGJ1aWxkQVJhbmdlIChyYW5nZSkge1xuICAgIC8vIE5PVEU6IFRoaXMgYWRqdXN0bWVudCBzaG91ZCBub3QgYmUgbmVjZXNzYXJ5IGlmIGxhbmd1YWdlLXN5bnRheCBpcyBwcm9wZXJseSBkZWZpbmVkLlxuICAgIGNvbnN0IGVuZFJvd1RyYW5zbGF0aW9uID0gdGhpcy5pc0dyYW1tYXJEb2VzTm90Rm9sZENsb3NpbmdSb3coKSA/ICsxIDogMFxuICAgIHJldHVybiByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbZW5kUm93VHJhbnNsYXRpb24sIDBdKVxuICB9XG5cbiAgaXNHcmFtbWFyRG9lc05vdEZvbGRDbG9zaW5nUm93ICgpIHtcbiAgICBjb25zdCB7c2NvcGVOYW1lLCBwYWNrYWdlTmFtZX0gPSB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKClcbiAgICBpZiAodGhpcy5zY29wZU5hbWVzT21pdHRpbmdDbG9zaW5nQnJhY2UuaW5jbHVkZXMoc2NvcGVOYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSEFDSzogUnVzdCBoYXZlIHR3byBwYWNrYWdlIGBsYW5ndWFnZS1ydXN0YCBhbmQgYGF0b20tbGFuZ3VhZ2UtcnVzdGBcbiAgICAgIC8vIGxhbmd1YWdlLXJ1c3QgZG9uJ3QgZm9sZCBlbmRpbmcgYH1gLCBidXQgYXRvbS1sYW5ndWFnZS1ydXN0IGRvZXMuXG4gICAgICByZXR1cm4gc2NvcGVOYW1lID09PSAnc291cmNlLnJ1c3QnICYmIHBhY2thZ2VOYW1lID09PSAnbGFuZ3VhZ2UtcnVzdCdcbiAgICB9XG4gIH1cbn1cblxuLy8gU2VjdGlvbjogT3RoZXJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEFyZ3VtZW50cyBleHRlbmRzIFRleHRPYmplY3Qge1xuICBuZXdBcmdJbmZvIChhcmdTdGFydCwgYXJnLCBzZXBhcmF0b3IpIHtcbiAgICBjb25zdCBhcmdFbmQgPSB0aGlzLnV0aWxzLnRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgYXJnKVxuICAgIGNvbnN0IGFyZ1JhbmdlID0gbmV3IFJhbmdlKGFyZ1N0YXJ0LCBhcmdFbmQpXG5cbiAgICBjb25zdCBzZXBhcmF0b3JFbmQgPSB0aGlzLnV0aWxzLnRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdFbmQsIHNlcGFyYXRvciAhPSBudWxsID8gc2VwYXJhdG9yIDogJycpXG4gICAgY29uc3Qgc2VwYXJhdG9yUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnRW5kLCBzZXBhcmF0b3JFbmQpXG5cbiAgICBjb25zdCBpbm5lclJhbmdlID0gYXJnUmFuZ2VcbiAgICBjb25zdCBhUmFuZ2UgPSBhcmdSYW5nZS51bmlvbihzZXBhcmF0b3JSYW5nZSlcbiAgICByZXR1cm4ge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuICB9XG5cbiAgZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBtZW1iZXI6IFsnQ3VybHlCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnUGFyZW50aGVzaXMnXSxcbiAgICAgIGluY2x1c2l2ZTogZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoJ0lubmVyQW55UGFpcicsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgfVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7c3BsaXRBcmd1bWVudHMsIHRyYXZlcnNlVGV4dEZyb21Qb2ludCwgZ2V0TGFzdH0gPSB0aGlzLnV0aWxzXG4gICAgbGV0IHJhbmdlID0gdGhpcy5nZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcGFpclJhbmdlRm91bmQgPSByYW5nZSAhPSBudWxsXG5cbiAgICByYW5nZSA9IHJhbmdlIHx8IHRoaXMuZ2V0SW5zdGFuY2UoJ0lubmVyQ3VycmVudExpbmUnKS5nZXRSYW5nZShzZWxlY3Rpb24pIC8vIGZhbGxiYWNrXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICByYW5nZSA9IHRoaXMudHJpbUJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGNvbnN0IGFsbFRva2VucyA9IHNwbGl0QXJndW1lbnRzKHRleHQsIHBhaXJSYW5nZUZvdW5kKVxuXG4gICAgY29uc3QgYXJnSW5mb3MgPSBbXVxuICAgIGxldCBhcmdTdGFydCA9IHJhbmdlLnN0YXJ0XG5cbiAgICAvLyBTa2lwIHN0YXJ0aW5nIHNlcGFyYXRvclxuICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoICYmIGFsbFRva2Vuc1swXS50eXBlID09PSAnc2VwYXJhdG9yJykge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgYXJnU3RhcnQgPSB0cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIHRva2VuLnRleHQpXG4gICAgfVxuXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAnYXJndW1lbnQnKSB7XG4gICAgICAgIGNvbnN0IG5leHRUb2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IG5leHRUb2tlbiA/IG5leHRUb2tlbi50ZXh0IDogdW5kZWZpbmVkXG4gICAgICAgIGNvbnN0IGFyZ0luZm8gPSB0aGlzLm5ld0FyZ0luZm8oYXJnU3RhcnQsIHRva2VuLnRleHQsIHNlcGFyYXRvcilcblxuICAgICAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCA9PT0gMCAmJiBhcmdJbmZvcy5sZW5ndGgpIHtcbiAgICAgICAgICBhcmdJbmZvLmFSYW5nZSA9IGFyZ0luZm8uYXJnUmFuZ2UudW5pb24oZ2V0TGFzdChhcmdJbmZvcykuc2VwYXJhdG9yUmFuZ2UpXG4gICAgICAgIH1cblxuICAgICAgICBhcmdTdGFydCA9IGFyZ0luZm8uYVJhbmdlLmVuZFxuICAgICAgICBhcmdJbmZvcy5wdXNoKGFyZ0luZm8pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3Qgbm90IGhhcHBlbicpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBmb3IgKGNvbnN0IHtpbm5lclJhbmdlLCBhUmFuZ2V9IG9mIGFyZ0luZm9zKSB7XG4gICAgICBpZiAoaW5uZXJSYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW5uZXIoKSA/IGlubmVyUmFuZ2UgOiBhUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgZ2V0UmFuZ2UgKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gICAgcmV0dXJuIHRoaXMuaXNBKCkgPyByYW5nZSA6IHRoaXMudHJpbUJ1ZmZlclJhbmdlKHJhbmdlKVxuICB9XG59XG5cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldFJhbmdlKClcbiAgfVxufVxuXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG59XG5cbmNsYXNzIExhdGVzdENoYW5nZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KCdbJylcbiAgICBjb25zdCBlbmQgPSB0aGlzLnZpbVN0YXRlLm1hcmsuZ2V0KCddJylcbiAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNlYXJjaE1hdGNoRm9yd2FyZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBiYWNrd2FyZCA9IGZhbHNlXG5cbiAgZmluZE1hdGNoIChmcm9tLCByZWdleCkge1xuICAgIGlmICh0aGlzLmJhY2t3YXJkKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJykge1xuICAgICAgICBmcm9tID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGZyb20sICdiYWNrd2FyZCcpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCBJbmZpbml0eV19XG4gICAgICByZXR1cm4ge1xuICAgICAgICByYW5nZTogdGhpcy5maW5kSW5FZGl0b3IoJ2JhY2t3YXJkJywgcmVnZXgsIG9wdGlvbnMsICh7cmFuZ2V9KSA9PiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb20pICYmIHJhbmdlKSxcbiAgICAgICAgd2hpY2hJc0hlYWQ6ICdzdGFydCdcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgZnJvbSA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tLCAnZm9yd2FyZCcpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7ZnJvbTogW2Zyb20ucm93LCAwXX1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJhbmdlOiB0aGlzLmZpbmRJbkVkaXRvcignZm9yd2FyZCcsIHJlZ2V4LCBvcHRpb25zLCAoe3JhbmdlfSkgPT4gcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oZnJvbSkgJiYgcmFuZ2UpLFxuICAgICAgICB3aGljaElzSGVhZDogJ2VuZCdcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRSYW5nZSAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpXG4gICAgaWYgKCFwYXR0ZXJuKSByZXR1cm5cblxuICAgIGNvbnN0IGZyb21Qb2ludCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGNvbnN0IHtyYW5nZSwgd2hpY2hJc0hlYWR9ID0gdGhpcy5maW5kTWF0Y2goZnJvbVBvaW50LCBwYXR0ZXJuKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgcmV0dXJuIHRoaXMudW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpXG4gICAgfVxuICB9XG5cbiAgdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUgKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKSB7XG4gICAgaWYgKHNlbGVjdGlvbi5pc0VtcHR5KCkpIHJldHVybiByYW5nZVxuXG4gICAgbGV0IGhlYWQgPSByYW5nZVt3aGljaElzSGVhZF1cbiAgICBjb25zdCB0YWlsID0gc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBpZiAodGhpcy5iYWNrd2FyZCkge1xuICAgICAgaWYgKHRhaWwuaXNMZXNzVGhhbihoZWFkKSkgaGVhZCA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBoZWFkLCAnZm9yd2FyZCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoZWFkLmlzTGVzc1RoYW4odGFpbCkpIGhlYWQgPSB0aGlzLnV0aWxzLnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCh0aGlzLmVkaXRvciwgaGVhZCwgJ2JhY2t3YXJkJylcbiAgICB9XG5cbiAgICB0aGlzLnJldmVyc2VkID0gaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgcmV0dXJuIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbih0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0VGFpbEJ1ZmZlclJhbmdlKCkpXG4gIH1cblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgdGhpcy5zd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWQ6IHRoaXMucmV2ZXJzZWQgIT0gbnVsbCA/IHRoaXMucmV2ZXJzZWQgOiB0aGlzLmJhY2t3YXJkfSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNlYXJjaE1hdGNoQmFja3dhcmQgZXh0ZW5kcyBTZWFyY2hNYXRjaEZvcndhcmQge1xuICBiYWNrd2FyZCA9IHRydWVcbn1cblxuLy8gW0xpbWl0YXRpb246IHdvbid0IGZpeF06IFNlbGVjdGVkIHJhbmdlIGlzIG5vdCBzdWJtb2RlIGF3YXJlLiBhbHdheXMgY2hhcmFjdGVyd2lzZS5cbi8vIFNvIGV2ZW4gaWYgb3JpZ2luYWwgc2VsZWN0aW9uIHdhcyB2TCBvciB2Qiwgc2VsZWN0ZWQgcmFuZ2UgYnkgdGhpcyB0ZXh0LW9iamVjdFxuLy8gaXMgYWx3YXlzIHZDIHJhbmdlLlxuY2xhc3MgUHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cHJvcGVydGllcywgc3VibW9kZX0gPSB0aGlzLnZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgKHByb3BlcnRpZXMgJiYgc3VibW9kZSkge1xuICAgICAgdGhpcy53aXNlID0gc3VibW9kZVxuICAgICAgdGhpcy5zd3JhcCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3QgKHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnZpbVN0YXRlLmhhc1BlcnNpc3RlbnRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBVc2VkIG9ubHkgYnkgUmVwbGFjZVdpdGhSZWdpc3RlciBhbmQgUHV0QmVmb3JlIGFuZCBpdHMnIGNoaWxkcmVuLlxuY2xhc3MgTGFzdFBhc3RlZFJhbmdlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgd2lzZSA9IG51bGxcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0IChzZWxlY3Rpb24pIHtcbiAgICBmb3IgKHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLmdldFBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5jbGFzcyBWaXNpYmxlQXJlYSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSB0aGlzLmVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKFtbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV1dKVxuICB9XG59XG5cbmNsYXNzIERpZmZIdW5rIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG4gIGdldFJhbmdlIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByb3cgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0SHVua1JhbmdlQXRCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24oXG4gIHtcbiAgICBUZXh0T2JqZWN0LFxuICAgIFdvcmQsXG4gICAgV2hvbGVXb3JkLFxuICAgIFNtYXJ0V29yZCxcbiAgICBTdWJ3b3JkLFxuICAgIFBhaXIsXG4gICAgQVBhaXIsXG4gICAgQW55UGFpcixcbiAgICBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nLFxuICAgIEFueVF1b3RlLFxuICAgIFF1b3RlLFxuICAgIERvdWJsZVF1b3RlLFxuICAgIFNpbmdsZVF1b3RlLFxuICAgIEJhY2tUaWNrLFxuICAgIEN1cmx5QnJhY2tldCxcbiAgICBTcXVhcmVCcmFja2V0LFxuICAgIFBhcmVudGhlc2lzLFxuICAgIEFuZ2xlQnJhY2tldCxcbiAgICBUYWcsXG4gICAgUGFyYWdyYXBoLFxuICAgIEluZGVudGF0aW9uLFxuICAgIENvbW1lbnQsXG4gICAgQ29tbWVudE9yUGFyYWdyYXBoLFxuICAgIEZvbGQsXG4gICAgRnVuY3Rpb24sXG4gICAgQXJndW1lbnRzLFxuICAgIEN1cnJlbnRMaW5lLFxuICAgIEVudGlyZSxcbiAgICBFbXB0eSxcbiAgICBMYXRlc3RDaGFuZ2UsXG4gICAgU2VhcmNoTWF0Y2hGb3J3YXJkLFxuICAgIFNlYXJjaE1hdGNoQmFja3dhcmQsXG4gICAgUHJldmlvdXNTZWxlY3Rpb24sXG4gICAgUGVyc2lzdGVudFNlbGVjdGlvbixcbiAgICBMYXN0UGFzdGVkUmFuZ2UsXG4gICAgVmlzaWJsZUFyZWFcbiAgfSxcbiAgV29yZC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgV2hvbGVXb3JkLmRlcml2ZUNsYXNzKHRydWUpLFxuICBTbWFydFdvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIFN1YndvcmQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXIuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEFueVF1b3RlLmRlcml2ZUNsYXNzKHRydWUpLFxuICBEb3VibGVRdW90ZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgU2luZ2xlUXVvdGUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEJhY2tUaWNrLmRlcml2ZUNsYXNzKHRydWUpLFxuICBDdXJseUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFNxdWFyZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFBhcmVudGhlc2lzLmRlcml2ZUNsYXNzKHRydWUsIHRydWUpLFxuICBBbmdsZUJyYWNrZXQuZGVyaXZlQ2xhc3ModHJ1ZSwgdHJ1ZSksXG4gIFRhZy5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgUGFyYWdyYXBoLmRlcml2ZUNsYXNzKHRydWUpLFxuICBJbmRlbnRhdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQ29tbWVudC5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgQmxvY2tDb21tZW50LmRlcml2ZUNsYXNzKHRydWUpLFxuICBDb21tZW50T3JQYXJhZ3JhcGguZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEZvbGQuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEZ1bmN0aW9uLmRlcml2ZUNsYXNzKHRydWUpLFxuICBBcmd1bWVudHMuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIEN1cnJlbnRMaW5lLmRlcml2ZUNsYXNzKHRydWUpLFxuICBFbnRpcmUuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIExhdGVzdENoYW5nZS5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgUGVyc2lzdGVudFNlbGVjdGlvbi5kZXJpdmVDbGFzcyh0cnVlKSxcbiAgVmlzaWJsZUFyZWEuZGVyaXZlQ2xhc3ModHJ1ZSksXG4gIERpZmZIdW5rLmRlcml2ZUNsYXNzKHRydWUpXG4pXG4iXX0=