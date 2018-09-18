'use babel';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var changeCase = require('change-case');
var selectList = undefined;

var _require = require('atom');

var BufferedProcess = _require.BufferedProcess;

var _require2 = require('./operator');

var Operator = _require2.Operator;

// TransformString
// ================================

var TransformString = (function (_Operator) {
  _inherits(TransformString, _Operator);

  function TransformString() {
    _classCallCheck(this, TransformString);

    _get(Object.getPrototypeOf(TransformString.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = 'stayOnTransformString';
    this.autoIndent = false;
    this.autoIndentNewline = false;
    this.replaceByDiff = false;
  }

  _createClass(TransformString, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var text = this.getNewText(selection.getText(), selection);
      if (text) {
        if (this.replaceByDiff) {
          this.replaceTextInRangeViaDiff(selection.getBufferRange(), text);
        } else {
          selection.insertText(text, { autoIndent: this.autoIndent, autoIndentNewline: this.autoIndentNewline });
        }
      }
    }
  }], [{
    key: 'registerToSelectList',
    value: function registerToSelectList() {
      this.stringTransformers.push(this);
    }
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }, {
    key: 'stringTransformers',
    value: [],
    enumerable: true
  }]);

  return TransformString;
})(Operator);

var ChangeCase = (function (_TransformString) {
  _inherits(ChangeCase, _TransformString);

  function ChangeCase() {
    _classCallCheck(this, ChangeCase);

    _get(Object.getPrototypeOf(ChangeCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ChangeCase, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var functionName = this.functionName || changeCase.lowerCaseFirst(this.name);
      // HACK: Pure Vim's `~` is too aggressive(e.g. remove punctuation, remove white spaces...).
      // Here intentionally making changeCase less aggressive by narrowing target charset.
      var charset = '[À-ʯΆ-և\\w]';
      var regex = new RegExp(charset + '+(:?[-./]?' + charset + '+)*', 'g');
      return text.replace(regex, function (match) {
        return changeCase[functionName](match);
      });
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return ChangeCase;
})(TransformString);

var NoCase = (function (_ChangeCase) {
  _inherits(NoCase, _ChangeCase);

  function NoCase() {
    _classCallCheck(this, NoCase);

    _get(Object.getPrototypeOf(NoCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return NoCase;
})(ChangeCase);

var DotCase = (function (_ChangeCase2) {
  _inherits(DotCase, _ChangeCase2);

  function DotCase() {
    _classCallCheck(this, DotCase);

    _get(Object.getPrototypeOf(DotCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DotCase, null, [{
    key: 'displayNameSuffix',
    value: '.',
    enumerable: true
  }]);

  return DotCase;
})(ChangeCase);

var SwapCase = (function (_ChangeCase3) {
  _inherits(SwapCase, _ChangeCase3);

  function SwapCase() {
    _classCallCheck(this, SwapCase);

    _get(Object.getPrototypeOf(SwapCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SwapCase, null, [{
    key: 'displayNameSuffix',
    value: '~',
    enumerable: true
  }]);

  return SwapCase;
})(ChangeCase);

var PathCase = (function (_ChangeCase4) {
  _inherits(PathCase, _ChangeCase4);

  function PathCase() {
    _classCallCheck(this, PathCase);

    _get(Object.getPrototypeOf(PathCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PathCase, null, [{
    key: 'displayNameSuffix',
    value: '/',
    enumerable: true
  }]);

  return PathCase;
})(ChangeCase);

var UpperCase = (function (_ChangeCase5) {
  _inherits(UpperCase, _ChangeCase5);

  function UpperCase() {
    _classCallCheck(this, UpperCase);

    _get(Object.getPrototypeOf(UpperCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return UpperCase;
})(ChangeCase);

var LowerCase = (function (_ChangeCase6) {
  _inherits(LowerCase, _ChangeCase6);

  function LowerCase() {
    _classCallCheck(this, LowerCase);

    _get(Object.getPrototypeOf(LowerCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return LowerCase;
})(ChangeCase);

var CamelCase = (function (_ChangeCase7) {
  _inherits(CamelCase, _ChangeCase7);

  function CamelCase() {
    _classCallCheck(this, CamelCase);

    _get(Object.getPrototypeOf(CamelCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return CamelCase;
})(ChangeCase);

var SnakeCase = (function (_ChangeCase8) {
  _inherits(SnakeCase, _ChangeCase8);

  function SnakeCase() {
    _classCallCheck(this, SnakeCase);

    _get(Object.getPrototypeOf(SnakeCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SnakeCase, null, [{
    key: 'displayNameSuffix',
    value: '_',
    enumerable: true
  }]);

  return SnakeCase;
})(ChangeCase);

var TitleCase = (function (_ChangeCase9) {
  _inherits(TitleCase, _ChangeCase9);

  function TitleCase() {
    _classCallCheck(this, TitleCase);

    _get(Object.getPrototypeOf(TitleCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return TitleCase;
})(ChangeCase);

var ParamCase = (function (_ChangeCase10) {
  _inherits(ParamCase, _ChangeCase10);

  function ParamCase() {
    _classCallCheck(this, ParamCase);

    _get(Object.getPrototypeOf(ParamCase.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ParamCase, null, [{
    key: 'displayNameSuffix',
    value: '-',
    enumerable: true
  }]);

  return ParamCase;
})(ChangeCase);

var HeaderCase = (function (_ChangeCase11) {
  _inherits(HeaderCase, _ChangeCase11);

  function HeaderCase() {
    _classCallCheck(this, HeaderCase);

    _get(Object.getPrototypeOf(HeaderCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return HeaderCase;
})(ChangeCase);

var PascalCase = (function (_ChangeCase12) {
  _inherits(PascalCase, _ChangeCase12);

  function PascalCase() {
    _classCallCheck(this, PascalCase);

    _get(Object.getPrototypeOf(PascalCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return PascalCase;
})(ChangeCase);

var ConstantCase = (function (_ChangeCase13) {
  _inherits(ConstantCase, _ChangeCase13);

  function ConstantCase() {
    _classCallCheck(this, ConstantCase);

    _get(Object.getPrototypeOf(ConstantCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return ConstantCase;
})(ChangeCase);

var SentenceCase = (function (_ChangeCase14) {
  _inherits(SentenceCase, _ChangeCase14);

  function SentenceCase() {
    _classCallCheck(this, SentenceCase);

    _get(Object.getPrototypeOf(SentenceCase.prototype), 'constructor', this).apply(this, arguments);
  }

  return SentenceCase;
})(ChangeCase);

var UpperCaseFirst = (function (_ChangeCase15) {
  _inherits(UpperCaseFirst, _ChangeCase15);

  function UpperCaseFirst() {
    _classCallCheck(this, UpperCaseFirst);

    _get(Object.getPrototypeOf(UpperCaseFirst.prototype), 'constructor', this).apply(this, arguments);
  }

  return UpperCaseFirst;
})(ChangeCase);

var LowerCaseFirst = (function (_ChangeCase16) {
  _inherits(LowerCaseFirst, _ChangeCase16);

  function LowerCaseFirst() {
    _classCallCheck(this, LowerCaseFirst);

    _get(Object.getPrototypeOf(LowerCaseFirst.prototype), 'constructor', this).apply(this, arguments);
  }

  return LowerCaseFirst;
})(ChangeCase);

var DashCase = (function (_ChangeCase17) {
  _inherits(DashCase, _ChangeCase17);

  function DashCase() {
    _classCallCheck(this, DashCase);

    _get(Object.getPrototypeOf(DashCase.prototype), 'constructor', this).apply(this, arguments);

    this.functionName = 'paramCase';
  }

  _createClass(DashCase, null, [{
    key: 'displayNameSuffix',
    value: '-',
    enumerable: true
  }]);

  return DashCase;
})(ChangeCase);

var ToggleCase = (function (_ChangeCase18) {
  _inherits(ToggleCase, _ChangeCase18);

  function ToggleCase() {
    _classCallCheck(this, ToggleCase);

    _get(Object.getPrototypeOf(ToggleCase.prototype), 'constructor', this).apply(this, arguments);

    this.functionName = 'swapCase';
  }

  _createClass(ToggleCase, null, [{
    key: 'displayNameSuffix',
    value: '~',
    enumerable: true
  }]);

  return ToggleCase;
})(ChangeCase);

var ToggleCaseAndMoveRight = (function (_ChangeCase19) {
  _inherits(ToggleCaseAndMoveRight, _ChangeCase19);

  function ToggleCaseAndMoveRight() {
    _classCallCheck(this, ToggleCaseAndMoveRight);

    _get(Object.getPrototypeOf(ToggleCaseAndMoveRight.prototype), 'constructor', this).apply(this, arguments);

    this.functionName = 'swapCase';
    this.flashTarget = false;
    this.restorePositions = false;
    this.target = 'MoveRight';
  }

  // Replace
  // -------------------------
  return ToggleCaseAndMoveRight;
})(ChangeCase);

var Replace = (function (_TransformString2) {
  _inherits(Replace, _TransformString2);

  function Replace() {
    _classCallCheck(this, Replace);

    _get(Object.getPrototypeOf(Replace.prototype), 'constructor', this).apply(this, arguments);

    this.flashCheckpoint = 'did-select-occurrence';
    this.autoIndentNewline = true;
    this.readInputAfterSelect = true;
  }

  _createClass(Replace, [{
    key: 'getNewText',
    value: function getNewText(text) {
      if (this.target.name === 'MoveRightBufferColumn' && text.length !== this.getCount()) {
        return;
      }

      var input = this.input || '\n';
      if (input === '\n') {
        this.restorePositions = false;
      }
      return text.replace(/./g, input);
    }
  }]);

  return Replace;
})(TransformString);

var ReplaceCharacter = (function (_Replace) {
  _inherits(ReplaceCharacter, _Replace);

  function ReplaceCharacter() {
    _classCallCheck(this, ReplaceCharacter);

    _get(Object.getPrototypeOf(ReplaceCharacter.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveRightBufferColumn';
  }

  // -------------------------
  // DUP meaning with SplitString need consolidate.
  return ReplaceCharacter;
})(Replace);

var SplitByCharacter = (function (_TransformString3) {
  _inherits(SplitByCharacter, _TransformString3);

  function SplitByCharacter() {
    _classCallCheck(this, SplitByCharacter);

    _get(Object.getPrototypeOf(SplitByCharacter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SplitByCharacter, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return text.split('').join(' ');
    }
  }]);

  return SplitByCharacter;
})(TransformString);

var EncodeUriComponent = (function (_TransformString4) {
  _inherits(EncodeUriComponent, _TransformString4);

  function EncodeUriComponent() {
    _classCallCheck(this, EncodeUriComponent);

    _get(Object.getPrototypeOf(EncodeUriComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(EncodeUriComponent, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return encodeURIComponent(text);
    }
  }], [{
    key: 'displayNameSuffix',
    value: '%',
    enumerable: true
  }]);

  return EncodeUriComponent;
})(TransformString);

var DecodeUriComponent = (function (_TransformString5) {
  _inherits(DecodeUriComponent, _TransformString5);

  function DecodeUriComponent() {
    _classCallCheck(this, DecodeUriComponent);

    _get(Object.getPrototypeOf(DecodeUriComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DecodeUriComponent, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return decodeURIComponent(text);
    }
  }], [{
    key: 'displayNameSuffix',
    value: '%%',
    enumerable: true
  }]);

  return DecodeUriComponent;
})(TransformString);

var TrimString = (function (_TransformString6) {
  _inherits(TrimString, _TransformString6);

  function TrimString() {
    _classCallCheck(this, TrimString);

    _get(Object.getPrototypeOf(TrimString.prototype), 'constructor', this).apply(this, arguments);

    this.stayByMarker = true;
    this.replaceByDiff = true;
  }

  _createClass(TrimString, [{
    key: 'getNewText',
    value: function getNewText(text) {
      return text.trim();
    }
  }]);

  return TrimString;
})(TransformString);

var CompactSpaces = (function (_TransformString7) {
  _inherits(CompactSpaces, _TransformString7);

  function CompactSpaces() {
    _classCallCheck(this, CompactSpaces);

    _get(Object.getPrototypeOf(CompactSpaces.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CompactSpaces, [{
    key: 'getNewText',
    value: function getNewText(text) {
      if (text.match(/^[ ]+$/)) {
        return ' ';
      } else {
        // Don't compact for leading and trailing white spaces.
        var regex = /^(\s*)(.*?)(\s*)$/gm;
        return text.replace(regex, function (m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(' ') + trailing;
        });
      }
    }
  }]);

  return CompactSpaces;
})(TransformString);

var AlignOccurrence = (function (_TransformString8) {
  _inherits(AlignOccurrence, _TransformString8);

  function AlignOccurrence() {
    _classCallCheck(this, AlignOccurrence);

    _get(Object.getPrototypeOf(AlignOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
    this.whichToPad = 'auto';
  }

  _createClass(AlignOccurrence, [{
    key: 'getSelectionTaker',
    value: function getSelectionTaker() {
      var selectionsByRow = {};
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        var row = selection.getBufferRange().start.row;
        if (!(row in selectionsByRow)) selectionsByRow[row] = [];
        selectionsByRow[row].push(selection);
      }
      var allRows = Object.keys(selectionsByRow);
      return function () {
        return allRows.map(function (row) {
          return selectionsByRow[row].shift();
        }).filter(function (s) {
          return s;
        });
      };
    }
  }, {
    key: 'getWichToPadForText',
    value: function getWichToPadForText(text) {
      if (this.whichToPad !== 'auto') return this.whichToPad;

      if (/^\s*[=|]\s*$/.test(text)) {
        // Asignment(=) and `|`(markdown-table separator)
        return 'start';
      } else if (/^\s*,\s*$/.test(text)) {
        // Arguments
        return 'end';
      } else if (/\W$/.test(text)) {
        // ends with non-word-char
        return 'end';
      } else {
        return 'start';
      }
    }
  }, {
    key: 'calculatePadding',
    value: function calculatePadding() {
      var _this = this;

      var totalAmountOfPaddingByRow = {};
      var columnForSelection = function columnForSelection(selection) {
        var which = _this.getWichToPadForText(selection.getText());
        var point = selection.getBufferRange()[which];
        return point.column + (totalAmountOfPaddingByRow[point.row] || 0);
      };

      var takeSelections = this.getSelectionTaker();
      while (true) {
        var selections = takeSelections();
        if (!selections.length) return;
        var maxColumn = selections.map(columnForSelection).reduce(function (max, cur) {
          return cur > max ? cur : max;
        });
        for (var selection of selections) {
          var row = selection.getBufferRange().start.row;
          var amountOfPadding = maxColumn - columnForSelection(selection);
          totalAmountOfPaddingByRow[row] = (totalAmountOfPaddingByRow[row] || 0) + amountOfPadding;
          this.amountOfPaddingBySelection.set(selection, amountOfPadding);
        }
      }
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this2 = this;

      this.amountOfPaddingBySelection = new Map();
      this.onDidSelectTarget(function () {
        _this2.calculatePadding();
      });
      _get(Object.getPrototypeOf(AlignOccurrence.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var padding = ' '.repeat(this.amountOfPaddingBySelection.get(selection));
      var whichToPad = this.getWichToPadForText(selection.getText());
      return whichToPad === 'start' ? padding + text : text + padding;
    }
  }]);

  return AlignOccurrence;
})(TransformString);

var AlignOccurrenceByPadLeft = (function (_AlignOccurrence) {
  _inherits(AlignOccurrenceByPadLeft, _AlignOccurrence);

  function AlignOccurrenceByPadLeft() {
    _classCallCheck(this, AlignOccurrenceByPadLeft);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadLeft.prototype), 'constructor', this).apply(this, arguments);

    this.whichToPad = 'start';
  }

  return AlignOccurrenceByPadLeft;
})(AlignOccurrence);

var AlignOccurrenceByPadRight = (function (_AlignOccurrence2) {
  _inherits(AlignOccurrenceByPadRight, _AlignOccurrence2);

  function AlignOccurrenceByPadRight() {
    _classCallCheck(this, AlignOccurrenceByPadRight);

    _get(Object.getPrototypeOf(AlignOccurrenceByPadRight.prototype), 'constructor', this).apply(this, arguments);

    this.whichToPad = 'end';
  }

  return AlignOccurrenceByPadRight;
})(AlignOccurrence);

var RemoveLeadingWhiteSpaces = (function (_TransformString9) {
  _inherits(RemoveLeadingWhiteSpaces, _TransformString9);

  function RemoveLeadingWhiteSpaces() {
    _classCallCheck(this, RemoveLeadingWhiteSpaces);

    _get(Object.getPrototypeOf(RemoveLeadingWhiteSpaces.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(RemoveLeadingWhiteSpaces, [{
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var trimLeft = function trimLeft(text) {
        return text.trimLeft();
      };
      return this.utils.splitTextByNewLine(text).map(trimLeft).join('\n') + '\n';
    }
  }]);

  return RemoveLeadingWhiteSpaces;
})(TransformString);

var ConvertToSoftTab = (function (_TransformString10) {
  _inherits(ConvertToSoftTab, _TransformString10);

  function ConvertToSoftTab() {
    _classCallCheck(this, ConvertToSoftTab);

    _get(Object.getPrototypeOf(ConvertToSoftTab.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(ConvertToSoftTab, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this3 = this;

      this.scanEditor('forward', /\t/g, { scanRange: selection.getBufferRange() }, function (_ref) {
        var range = _ref.range;
        var replace = _ref.replace;

        // Replace \t to spaces which length is vary depending on tabStop and tabLenght
        // So we directly consult it's screen representing length.
        var length = _this3.editor.screenRangeForBufferRange(range).getExtent().column;
        replace(' '.repeat(length));
      });
    }
  }], [{
    key: 'displayName',
    value: 'Soft Tab',
    enumerable: true
  }]);

  return ConvertToSoftTab;
})(TransformString);

var ConvertToHardTab = (function (_TransformString11) {
  _inherits(ConvertToHardTab, _TransformString11);

  function ConvertToHardTab() {
    _classCallCheck(this, ConvertToHardTab);

    _get(Object.getPrototypeOf(ConvertToHardTab.prototype), 'constructor', this).apply(this, arguments);
  }

  // -------------------------

  _createClass(ConvertToHardTab, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this4 = this;

      var tabLength = this.editor.getTabLength();
      this.scanEditor('forward', /[ \t]+/g, { scanRange: selection.getBufferRange() }, function (_ref2) {
        var range = _ref2.range;
        var replace = _ref2.replace;

        var _editor$screenRangeForBufferRange = _this4.editor.screenRangeForBufferRange(range);

        var start = _editor$screenRangeForBufferRange.start;
        var end = _editor$screenRangeForBufferRange.end;

        var startColumn = start.column;
        var endColumn = end.column;

        // We can't naively replace spaces to tab, we have to consider valid tabStop column
        // If nextTabStop column exceeds replacable range, we pad with spaces.
        var newText = '';
        while (true) {
          var remainder = startColumn % tabLength;
          var nextTabStop = startColumn + (remainder === 0 ? tabLength : remainder);
          if (nextTabStop > endColumn) {
            newText += ' '.repeat(endColumn - startColumn);
          } else {
            newText += '\t';
          }
          startColumn = nextTabStop;
          if (startColumn >= endColumn) {
            break;
          }
        }

        replace(newText);
      });
    }
  }], [{
    key: 'displayName',
    value: 'Hard Tab',
    enumerable: true
  }]);

  return ConvertToHardTab;
})(TransformString);

var TransformStringByExternalCommand = (function (_TransformString12) {
  _inherits(TransformStringByExternalCommand, _TransformString12);

  function TransformStringByExternalCommand() {
    _classCallCheck(this, TransformStringByExternalCommand);

    _get(Object.getPrototypeOf(TransformStringByExternalCommand.prototype), 'constructor', this).apply(this, arguments);

    this.autoIndent = true;
    this.command = '';
    this.args = [];
  }

  // -------------------------

  _createClass(TransformStringByExternalCommand, [{
    key: 'getNewText',
    // e.g args: ['-rn']

    // NOTE: Unlike other class, first arg is `stdout` of external commands.
    value: function getNewText(text, selection) {
      return text || selection.getText();
    }
  }, {
    key: 'getCommand',
    value: function getCommand(selection) {
      return { command: this.command, args: this.args };
    }
  }, {
    key: 'getStdin',
    value: function getStdin(selection) {
      return selection.getText();
    }
  }, {
    key: 'execute',
    value: _asyncToGenerator(function* () {
      this.preSelect();

      if (this.selectTarget()) {
        for (var selection of this.editor.getSelections()) {
          var _ref3 = this.getCommand(selection) || {};

          var command = _ref3.command;
          var args = _ref3.args;

          if (command == null || args == null) continue;

          var stdout = yield this.runExternalCommand({ command: command, args: args, stdin: this.getStdin(selection) });
          selection.insertText(this.getNewText(stdout, selection), { autoIndent: this.autoIndent });
        }
        this.mutationManager.setCheckpoint('did-finish');
        this.restoreCursorPositionsIfNecessary();
      }
      this.postMutate();
    })
  }, {
    key: 'runExternalCommand',
    value: function runExternalCommand(options) {
      var _this5 = this;

      var output = '';
      options.stdout = function (data) {
        return output += data;
      };
      var exitPromise = new Promise(function (resolve) {
        options.exit = function () {
          return resolve(output);
        };
      });
      var stdin = options.stdin;

      delete options.stdin;
      var bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError(function (_ref4) {
        var error = _ref4.error;
        var handle = _ref4.handle;

        // Suppress command not found error intentionally.
        if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
          console.log(_this5.getCommandName() + ': Failed to spawn command ' + error.path + '.');
          handle();
        }
        _this5.cancelOperation();
      });

      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        bufferedProcess.process.stdin.end();
      }
      return exitPromise;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return TransformStringByExternalCommand;
})(TransformString);

var TransformStringBySelectList = (function (_TransformString13) {
  _inherits(TransformStringBySelectList, _TransformString13);

  function TransformStringBySelectList() {
    _classCallCheck(this, TransformStringBySelectList);

    _get(Object.getPrototypeOf(TransformStringBySelectList.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.recordable = false;
  }

  _createClass(TransformStringBySelectList, [{
    key: 'selectItems',
    value: function selectItems() {
      if (!selectList) {
        var SelectList = require('./select-list');
        selectList = new SelectList();
      }
      return selectList.selectFromItems(this.constructor.getSelectListItems());
    }
  }, {
    key: 'execute',
    value: _asyncToGenerator(function* () {
      var item = yield this.selectItems();
      if (item) {
        this.vimState.operationStack.runNext(item.klass, { target: this.nextTarget });
      }
    })
  }], [{
    key: 'getSelectListItems',
    value: function getSelectListItems() {
      var _this6 = this;

      if (!this.selectListItems) {
        this.selectListItems = this.stringTransformers.map(function (klass) {
          var suffix = klass.hasOwnProperty('displayNameSuffix') ? ' ' + klass.displayNameSuffix : '';

          return {
            klass: klass,
            displayName: klass.hasOwnProperty('displayName') ? klass.displayName + suffix : _this6._.humanizeEventName(_this6._.dasherize(klass.name)) + suffix
          };
        });
      }
      return this.selectListItems;
    }
  }]);

  return TransformStringBySelectList;
})(TransformString);

var TransformWordBySelectList = (function (_TransformStringBySelectList) {
  _inherits(TransformWordBySelectList, _TransformStringBySelectList);

  function TransformWordBySelectList() {
    _classCallCheck(this, TransformWordBySelectList);

    _get(Object.getPrototypeOf(TransformWordBySelectList.prototype), 'constructor', this).apply(this, arguments);

    this.nextTarget = 'InnerWord';
  }

  return TransformWordBySelectList;
})(TransformStringBySelectList);

var TransformSmartWordBySelectList = (function (_TransformStringBySelectList2) {
  _inherits(TransformSmartWordBySelectList, _TransformStringBySelectList2);

  function TransformSmartWordBySelectList() {
    _classCallCheck(this, TransformSmartWordBySelectList);

    _get(Object.getPrototypeOf(TransformSmartWordBySelectList.prototype), 'constructor', this).apply(this, arguments);

    this.nextTarget = 'InnerSmartWord';
  }

  // -------------------------
  return TransformSmartWordBySelectList;
})(TransformStringBySelectList);

var ReplaceWithRegister = (function (_TransformString14) {
  _inherits(ReplaceWithRegister, _TransformString14);

  function ReplaceWithRegister() {
    _classCallCheck(this, ReplaceWithRegister);

    _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), 'constructor', this).apply(this, arguments);

    this.flashType = 'operator-long';
  }

  _createClass(ReplaceWithRegister, [{
    key: 'initialize',
    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), 'execute', this).call(this);

      for (var selection of this.editor.getSelections()) {
        var range = this.mutationManager.getMutatedBufferRangeForSelection(selection);
        this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, range);
      }
    }
  }, {
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      return value ? value.text : '';
    }
  }]);

  return ReplaceWithRegister;
})(TransformString);

var ReplaceOccurrenceWithRegister = (function (_ReplaceWithRegister) {
  _inherits(ReplaceOccurrenceWithRegister, _ReplaceWithRegister);

  function ReplaceOccurrenceWithRegister() {
    _classCallCheck(this, ReplaceOccurrenceWithRegister);

    _get(Object.getPrototypeOf(ReplaceOccurrenceWithRegister.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  // Save text to register before replace
  return ReplaceOccurrenceWithRegister;
})(ReplaceWithRegister);

var SwapWithRegister = (function (_TransformString15) {
  _inherits(SwapWithRegister, _TransformString15);

  function SwapWithRegister() {
    _classCallCheck(this, SwapWithRegister);

    _get(Object.getPrototypeOf(SwapWithRegister.prototype), 'constructor', this).apply(this, arguments);
  }

  // Indent < TransformString
  // -------------------------

  _createClass(SwapWithRegister, [{
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    }
  }]);

  return SwapWithRegister;
})(TransformString);

var Indent = (function (_TransformString16) {
  _inherits(Indent, _TransformString16);

  function Indent() {
    _classCallCheck(this, Indent);

    _get(Object.getPrototypeOf(Indent.prototype), 'constructor', this).apply(this, arguments);

    this.stayByMarker = true;
    this.setToFirstCharacterOnLinewise = true;
    this.wise = 'linewise';
  }

  _createClass(Indent, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this7 = this;

      // Need count times indentation in visual-mode and its repeat(`.`).
      if (this.target.name === 'CurrentSelection') {
        (function () {
          var oldText = undefined;
          // limit to 100 to avoid freezing by accidental big number.
          _this7.countTimes(_this7.limitNumber(_this7.getCount(), { max: 100 }), function (_ref5) {
            var stop = _ref5.stop;

            oldText = selection.getText();
            _this7.indent(selection);
            if (selection.getText() === oldText) stop();
          });
        })();
      } else {
        this.indent(selection);
      }
    }
  }, {
    key: 'indent',
    value: function indent(selection) {
      selection.indentSelectedRows();
    }
  }]);

  return Indent;
})(TransformString);

var Outdent = (function (_Indent) {
  _inherits(Outdent, _Indent);

  function Outdent() {
    _classCallCheck(this, Outdent);

    _get(Object.getPrototypeOf(Outdent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Outdent, [{
    key: 'indent',
    value: function indent(selection) {
      selection.outdentSelectedRows();
    }
  }]);

  return Outdent;
})(Indent);

var AutoIndent = (function (_Indent2) {
  _inherits(AutoIndent, _Indent2);

  function AutoIndent() {
    _classCallCheck(this, AutoIndent);

    _get(Object.getPrototypeOf(AutoIndent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(AutoIndent, [{
    key: 'indent',
    value: function indent(selection) {
      selection.autoIndentSelectedRows();
    }
  }]);

  return AutoIndent;
})(Indent);

var ToggleLineComments = (function (_TransformString17) {
  _inherits(ToggleLineComments, _TransformString17);

  function ToggleLineComments() {
    _classCallCheck(this, ToggleLineComments);

    _get(Object.getPrototypeOf(ToggleLineComments.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.stayByMarker = true;
    this.stayAtSamePosition = true;
    this.wise = 'linewise';
  }

  _createClass(ToggleLineComments, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      selection.toggleLineComments();
    }
  }]);

  return ToggleLineComments;
})(TransformString);

var Reflow = (function (_TransformString18) {
  _inherits(Reflow, _TransformString18);

  function Reflow() {
    _classCallCheck(this, Reflow);

    _get(Object.getPrototypeOf(Reflow.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Reflow, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      atom.commands.dispatch(this.editorElement, 'autoflow:reflow-selection');
    }
  }]);

  return Reflow;
})(TransformString);

var ReflowWithStay = (function (_Reflow) {
  _inherits(ReflowWithStay, _Reflow);

  function ReflowWithStay() {
    _classCallCheck(this, ReflowWithStay);

    _get(Object.getPrototypeOf(ReflowWithStay.prototype), 'constructor', this).apply(this, arguments);

    this.stayAtSamePosition = true;
  }

  // Surround < TransformString
  // -------------------------
  return ReflowWithStay;
})(Reflow);

var SurroundBase = (function (_TransformString19) {
  _inherits(SurroundBase, _TransformString19);

  function SurroundBase() {
    _classCallCheck(this, SurroundBase);

    _get(Object.getPrototypeOf(SurroundBase.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = null;
    this.pairs = [['(', ')'], ['{', '}'], ['[', ']'], ['<', '>']];
    this.pairsByAlias = {
      b: ['(', ')'],
      B: ['{', '}'],
      r: ['[', ']'],
      a: ['<', '>']
    };
  }

  _createClass(SurroundBase, [{
    key: 'initialize',
    value: function initialize() {
      this.replaceByDiff = this.getConfig('replaceByDiffOnSurround');
      this.stayByMarker = this.replaceByDiff;
      _get(Object.getPrototypeOf(SurroundBase.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'getPair',
    value: function getPair(char) {
      return char in this.pairsByAlias ? this.pairsByAlias[char] : [].concat(_toConsumableArray(this.pairs), [[char, char]]).find(function (pair) {
        return pair.includes(char);
      });
    }
  }, {
    key: 'surround',
    value: function surround(text, char) {
      var _this8 = this;

      var _ref6 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref6$keepLayout = _ref6.keepLayout;
      var keepLayout = _ref6$keepLayout === undefined ? false : _ref6$keepLayout;
      var selection = _ref6.selection;

      var _getPair = this.getPair(char);

      var _getPair2 = _slicedToArray(_getPair, 2);

      var open = _getPair2[0];
      var close = _getPair2[1];

      if (!keepLayout && text.endsWith('\n')) {
        (function () {
          var baseIndentLevel = _this8.editor.indentationForBufferRow(selection.getBufferRange().start.row);
          var indentTextStartRow = _this8.editor.buildIndentString(baseIndentLevel);
          var indentTextOneLevel = _this8.editor.buildIndentString(1);

          open = indentTextStartRow + open + '\n';
          text = text.replace(/^(.+)$/gm, function (m) {
            return indentTextOneLevel + m;
          });
          close = indentTextStartRow + close + '\n';
        })();
      }

      if (this.getConfig('charactersToAddSpaceOnSurround').includes(char) && this.utils.isSingleLineText(text)) {
        text = ' ' + text + ' ';
      }

      return open + text + close;
    }
  }, {
    key: 'deleteSurround',
    value: function deleteSurround(text) {
      // Assume surrounding char is one-char length.
      var open = text[0];
      var close = text[text.length - 1];
      var innerText = text.slice(1, text.length - 1);
      return this.utils.isSingleLineText(text) && open !== close ? innerText.trim() : innerText;
    }
  }, {
    key: 'getNewText',
    value: function getNewText(text, selection) {
      if (this.surroundAction === 'surround') {
        return this.surround(text, this.input, { selection: selection });
      } else if (this.surroundAction === 'delete-surround') {
        return this.deleteSurround(text);
      } else if (this.surroundAction === 'change-surround') {
        return this.surround(this.deleteSurround(text), this.input, { keepLayout: true });
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return SurroundBase;
})(TransformString);

var Surround = (function (_SurroundBase) {
  _inherits(Surround, _SurroundBase);

  function Surround() {
    _classCallCheck(this, Surround);

    _get(Object.getPrototypeOf(Surround.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = 'surround';
    this.readInputAfterSelect = true;
  }

  return Surround;
})(SurroundBase);

var SurroundWord = (function (_Surround) {
  _inherits(SurroundWord, _Surround);

  function SurroundWord() {
    _classCallCheck(this, SurroundWord);

    _get(Object.getPrototypeOf(SurroundWord.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerWord';
  }

  return SurroundWord;
})(Surround);

var SurroundSmartWord = (function (_Surround2) {
  _inherits(SurroundSmartWord, _Surround2);

  function SurroundSmartWord() {
    _classCallCheck(this, SurroundSmartWord);

    _get(Object.getPrototypeOf(SurroundSmartWord.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerSmartWord';
  }

  return SurroundSmartWord;
})(Surround);

var MapSurround = (function (_Surround3) {
  _inherits(MapSurround, _Surround3);

  function MapSurround() {
    _classCallCheck(this, MapSurround);

    _get(Object.getPrototypeOf(MapSurround.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
    this.patternForOccurrence = /\w+/g;
  }

  // Delete Surround
  // -------------------------
  return MapSurround;
})(Surround);

var DeleteSurround = (function (_SurroundBase2) {
  _inherits(DeleteSurround, _SurroundBase2);

  function DeleteSurround() {
    _classCallCheck(this, DeleteSurround);

    _get(Object.getPrototypeOf(DeleteSurround.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = 'delete-surround';
  }

  _createClass(DeleteSurround, [{
    key: 'initialize',
    value: function initialize() {
      var _this9 = this;

      if (!this.target) {
        this.focusInput({
          onConfirm: function onConfirm(char) {
            _this9.setTarget(_this9.getInstance('APair', { pair: _this9.getPair(char) }));
            _this9.processOperation();
          }
        });
      }
      _get(Object.getPrototypeOf(DeleteSurround.prototype), 'initialize', this).call(this);
    }
  }]);

  return DeleteSurround;
})(SurroundBase);

var DeleteSurroundAnyPair = (function (_DeleteSurround) {
  _inherits(DeleteSurroundAnyPair, _DeleteSurround);

  function DeleteSurroundAnyPair() {
    _classCallCheck(this, DeleteSurroundAnyPair);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPair';
  }

  return DeleteSurroundAnyPair;
})(DeleteSurround);

var DeleteSurroundAnyPairAllowForwarding = (function (_DeleteSurroundAnyPair) {
  _inherits(DeleteSurroundAnyPairAllowForwarding, _DeleteSurroundAnyPair);

  function DeleteSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, DeleteSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPairAllowForwarding';
  }

  // Change Surround
  // -------------------------
  return DeleteSurroundAnyPairAllowForwarding;
})(DeleteSurroundAnyPair);

var ChangeSurround = (function (_DeleteSurround2) {
  _inherits(ChangeSurround, _DeleteSurround2);

  function ChangeSurround() {
    _classCallCheck(this, ChangeSurround);

    _get(Object.getPrototypeOf(ChangeSurround.prototype), 'constructor', this).apply(this, arguments);

    this.surroundAction = 'change-surround';
    this.readInputAfterSelect = true;
  }

  _createClass(ChangeSurround, [{
    key: 'focusInputPromised',

    // Override to show changing char on hover
    value: _asyncToGenerator(function* () {
      var hoverPoint = this.mutationManager.getInitialPointForSelection(this.editor.getLastSelection());
      this.vimState.hover.set(this.editor.getSelectedText()[0], hoverPoint);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _get(Object.getPrototypeOf(ChangeSurround.prototype), 'focusInputPromised', this).apply(this, args);
    })
  }]);

  return ChangeSurround;
})(DeleteSurround);

var ChangeSurroundAnyPair = (function (_ChangeSurround) {
  _inherits(ChangeSurroundAnyPair, _ChangeSurround);

  function ChangeSurroundAnyPair() {
    _classCallCheck(this, ChangeSurroundAnyPair);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPair';
  }

  return ChangeSurroundAnyPair;
})(ChangeSurround);

var ChangeSurroundAnyPairAllowForwarding = (function (_ChangeSurroundAnyPair) {
  _inherits(ChangeSurroundAnyPairAllowForwarding, _ChangeSurroundAnyPair);

  function ChangeSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, ChangeSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPairAllowForwarding.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'AAnyPairAllowForwarding';
  }

  // -------------------------
  // FIXME
  // Currently native editor.joinLines() is better for cursor position setting
  // So I use native methods for a meanwhile.
  return ChangeSurroundAnyPairAllowForwarding;
})(ChangeSurroundAnyPair);

var JoinTarget = (function (_TransformString20) {
  _inherits(JoinTarget, _TransformString20);

  function JoinTarget() {
    _classCallCheck(this, JoinTarget);

    _get(Object.getPrototypeOf(JoinTarget.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.restorePositions = false;
  }

  _createClass(JoinTarget, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var range = selection.getBufferRange();

      // When cursor is at last BUFFER row, it select last-buffer-row, then
      // joinning result in "clear last-buffer-row text".
      // I believe this is BUG of upstream atom-core. guard this situation here
      if (!range.isSingleLine() || range.end.row !== this.editor.getLastBufferRow()) {
        if (this.utils.isLinewiseRange(range)) {
          selection.setBufferRange(range.translate([0, 0], [-1, Infinity]));
        }
        selection.joinLines();
      }
      var point = selection.getBufferRange().end.translate([0, -1]);
      return selection.cursor.setBufferPosition(point);
    }
  }]);

  return JoinTarget;
})(TransformString);

var Join = (function (_JoinTarget) {
  _inherits(Join, _JoinTarget);

  function Join() {
    _classCallCheck(this, Join);

    _get(Object.getPrototypeOf(Join.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToRelativeLine';
  }

  return Join;
})(JoinTarget);

var JoinBase = (function (_TransformString21) {
  _inherits(JoinBase, _TransformString21);

  function JoinBase() {
    _classCallCheck(this, JoinBase);

    _get(Object.getPrototypeOf(JoinBase.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.trim = false;
    this.target = 'MoveToRelativeLineMinimumTwo';
  }

  _createClass(JoinBase, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var regex = this.trim ? /\r?\n[ \t]*/g : /\r?\n/g;
      return text.trimRight().replace(regex, this.input) + '\n';
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return JoinBase;
})(TransformString);

var JoinWithKeepingSpace = (function (_JoinBase) {
  _inherits(JoinWithKeepingSpace, _JoinBase);

  function JoinWithKeepingSpace() {
    _classCallCheck(this, JoinWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinWithKeepingSpace.prototype), 'constructor', this).apply(this, arguments);

    this.input = '';
  }

  return JoinWithKeepingSpace;
})(JoinBase);

var JoinByInput = (function (_JoinBase2) {
  _inherits(JoinByInput, _JoinBase2);

  function JoinByInput() {
    _classCallCheck(this, JoinByInput);

    _get(Object.getPrototypeOf(JoinByInput.prototype), 'constructor', this).apply(this, arguments);

    this.readInputAfterSelect = true;
    this.focusInputOptions = { charsMax: 10 };
    this.trim = true;
  }

  return JoinByInput;
})(JoinBase);

var JoinByInputWithKeepingSpace = (function (_JoinByInput) {
  _inherits(JoinByInputWithKeepingSpace, _JoinByInput);

  function JoinByInputWithKeepingSpace() {
    _classCallCheck(this, JoinByInputWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinByInputWithKeepingSpace.prototype), 'constructor', this).apply(this, arguments);

    this.trim = false;
  }

  // -------------------------
  // String suffix in name is to avoid confusion with 'split' window.
  return JoinByInputWithKeepingSpace;
})(JoinByInput);

var SplitString = (function (_TransformString22) {
  _inherits(SplitString, _TransformString22);

  function SplitString() {
    _classCallCheck(this, SplitString);

    _get(Object.getPrototypeOf(SplitString.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToRelativeLine';
    this.keepSplitter = false;
    this.readInputAfterSelect = true;
    this.focusInputOptions = { charsMax: 10 };
  }

  _createClass(SplitString, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var regex = new RegExp(this._.escapeRegExp(this.input || '\\n'), 'g');
      var lineSeparator = (this.keepSplitter ? this.input : '') + '\n';
      return text.replace(regex, lineSeparator);
    }
  }]);

  return SplitString;
})(TransformString);

var SplitStringWithKeepingSplitter = (function (_SplitString) {
  _inherits(SplitStringWithKeepingSplitter, _SplitString);

  function SplitStringWithKeepingSplitter() {
    _classCallCheck(this, SplitStringWithKeepingSplitter);

    _get(Object.getPrototypeOf(SplitStringWithKeepingSplitter.prototype), 'constructor', this).apply(this, arguments);

    this.keepSplitter = true;
  }

  return SplitStringWithKeepingSplitter;
})(SplitString);

var SplitArguments = (function (_TransformString23) {
  _inherits(SplitArguments, _TransformString23);

  function SplitArguments() {
    _classCallCheck(this, SplitArguments);

    _get(Object.getPrototypeOf(SplitArguments.prototype), 'constructor', this).apply(this, arguments);

    this.keepSeparator = true;
  }

  _createClass(SplitArguments, [{
    key: 'getNewText',
    value: function getNewText(text, selection) {
      var allTokens = this.utils.splitArguments(text.trim());
      var newText = '';

      var baseIndentLevel = this.editor.indentationForBufferRow(selection.getBufferRange().start.row);
      var indentTextStartRow = this.editor.buildIndentString(baseIndentLevel);
      var indentTextInnerRows = this.editor.buildIndentString(baseIndentLevel + 1);

      while (allTokens.length) {
        var _allTokens$shift = allTokens.shift();

        var _text = _allTokens$shift.text;
        var type = _allTokens$shift.type;

        newText += type === 'separator' ? (this.keepSeparator ? _text.trim() : '') + '\n' : indentTextInnerRows + _text;
      }
      return '\n' + newText + '\n' + indentTextStartRow;
    }
  }]);

  return SplitArguments;
})(TransformString);

var SplitArgumentsWithRemoveSeparator = (function (_SplitArguments) {
  _inherits(SplitArgumentsWithRemoveSeparator, _SplitArguments);

  function SplitArgumentsWithRemoveSeparator() {
    _classCallCheck(this, SplitArgumentsWithRemoveSeparator);

    _get(Object.getPrototypeOf(SplitArgumentsWithRemoveSeparator.prototype), 'constructor', this).apply(this, arguments);

    this.keepSeparator = false;
  }

  return SplitArgumentsWithRemoveSeparator;
})(SplitArguments);

var SplitArgumentsOfInnerAnyPair = (function (_SplitArguments2) {
  _inherits(SplitArgumentsOfInnerAnyPair, _SplitArguments2);

  function SplitArgumentsOfInnerAnyPair() {
    _classCallCheck(this, SplitArgumentsOfInnerAnyPair);

    _get(Object.getPrototypeOf(SplitArgumentsOfInnerAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return SplitArgumentsOfInnerAnyPair;
})(SplitArguments);

var ChangeOrder = (function (_TransformString24) {
  _inherits(ChangeOrder, _TransformString24);

  function ChangeOrder() {
    _classCallCheck(this, ChangeOrder);

    _get(Object.getPrototypeOf(ChangeOrder.prototype), 'constructor', this).apply(this, arguments);

    this.action = null;
    this.sortBy = null;
  }

  _createClass(ChangeOrder, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var _this10 = this;

      return this.target.isLinewise() ? this.getNewList(this.utils.splitTextByNewLine(text)).join('\n') + '\n' : this.sortArgumentsInTextBy(text, function (args) {
        return _this10.getNewList(args);
      });
    }
  }, {
    key: 'getNewList',
    value: function getNewList(rows) {
      if (rows.length === 1) {
        return [this.utils.changeCharOrder(rows[0], this.action, this.sortBy)];
      } else {
        return this.utils.changeArrayOrder(rows, this.action, this.sortBy);
      }
    }
  }, {
    key: 'sortArgumentsInTextBy',
    value: function sortArgumentsInTextBy(text, fn) {
      var start = text.search(/\S/);
      var end = text.search(/\s*$/);
      var leadingSpaces = start !== -1 ? text.slice(0, start) : '';
      var trailingSpaces = end !== -1 ? text.slice(end) : '';
      var allTokens = this.utils.splitArguments(text.slice(start, end));
      var args = allTokens.filter(function (token) {
        return token.type === 'argument';
      }).map(function (token) {
        return token.text;
      });
      var newArgs = fn(args);

      var newText = '';
      while (allTokens.length) {
        var token = allTokens.shift();
        // token.type is "separator" or "argument"
        newText += token.type === 'separator' ? token.text : newArgs.shift();
      }
      return leadingSpaces + newText + trailingSpaces;
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return ChangeOrder;
})(TransformString);

var Reverse = (function (_ChangeOrder) {
  _inherits(Reverse, _ChangeOrder);

  function Reverse() {
    _classCallCheck(this, Reverse);

    _get(Object.getPrototypeOf(Reverse.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'reverse';
  }

  return Reverse;
})(ChangeOrder);

var ReverseInnerAnyPair = (function (_Reverse) {
  _inherits(ReverseInnerAnyPair, _Reverse);

  function ReverseInnerAnyPair() {
    _classCallCheck(this, ReverseInnerAnyPair);

    _get(Object.getPrototypeOf(ReverseInnerAnyPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return ReverseInnerAnyPair;
})(Reverse);

var Rotate = (function (_ChangeOrder2) {
  _inherits(Rotate, _ChangeOrder2);

  function Rotate() {
    _classCallCheck(this, Rotate);

    _get(Object.getPrototypeOf(Rotate.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'rotate-left';
  }

  return Rotate;
})(ChangeOrder);

var RotateBackwards = (function (_ChangeOrder3) {
  _inherits(RotateBackwards, _ChangeOrder3);

  function RotateBackwards() {
    _classCallCheck(this, RotateBackwards);

    _get(Object.getPrototypeOf(RotateBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'rotate-right';
  }

  return RotateBackwards;
})(ChangeOrder);

var RotateArgumentsOfInnerPair = (function (_Rotate) {
  _inherits(RotateArgumentsOfInnerPair, _Rotate);

  function RotateArgumentsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsOfInnerPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return RotateArgumentsOfInnerPair;
})(Rotate);

var RotateArgumentsBackwardsOfInnerPair = (function (_RotateBackwards) {
  _inherits(RotateArgumentsBackwardsOfInnerPair, _RotateBackwards);

  function RotateArgumentsBackwardsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsBackwardsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsBackwardsOfInnerPair.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerAnyPair';
  }

  return RotateArgumentsBackwardsOfInnerPair;
})(RotateBackwards);

var Sort = (function (_ChangeOrder4) {
  _inherits(Sort, _ChangeOrder4);

  function Sort() {
    _classCallCheck(this, Sort);

    _get(Object.getPrototypeOf(Sort.prototype), 'constructor', this).apply(this, arguments);

    this.action = 'sort';
  }

  return Sort;
})(ChangeOrder);

var SortCaseInsensitively = (function (_Sort) {
  _inherits(SortCaseInsensitively, _Sort);

  function SortCaseInsensitively() {
    _classCallCheck(this, SortCaseInsensitively);

    _get(Object.getPrototypeOf(SortCaseInsensitively.prototype), 'constructor', this).apply(this, arguments);

    this.sortBy = function (rowA, rowB) {
      return rowA.localeCompare(rowB, { sensitivity: 'base' });
    };
  }

  return SortCaseInsensitively;
})(Sort);

var SortByNumber = (function (_Sort2) {
  _inherits(SortByNumber, _Sort2);

  function SortByNumber() {
    _classCallCheck(this, SortByNumber);

    _get(Object.getPrototypeOf(SortByNumber.prototype), 'constructor', this).apply(this, arguments);

    this.sortBy = function (rowA, rowB) {
      return (Number.parseInt(rowA) || Infinity) - (Number.parseInt(rowB) || Infinity);
    };
  }

  return SortByNumber;
})(Sort);

var NumberingLines = (function (_TransformString25) {
  _inherits(NumberingLines, _TransformString25);

  function NumberingLines() {
    _classCallCheck(this, NumberingLines);

    _get(Object.getPrototypeOf(NumberingLines.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
  }

  _createClass(NumberingLines, [{
    key: 'getNewText',
    value: function getNewText(text) {
      var _this11 = this;

      var rows = this.utils.splitTextByNewLine(text);
      var lastRowWidth = String(rows.length).length;

      var newRows = rows.map(function (rowText, i) {
        i++; // fix 0 start index to 1 start.
        var amountOfPadding = _this11.limitNumber(lastRowWidth - String(i).length, { min: 0 });
        return ' '.repeat(amountOfPadding) + i + ': ' + rowText;
      });
      return newRows.join('\n') + '\n';
    }
  }]);

  return NumberingLines;
})(TransformString);

var DuplicateWithCommentOutOriginal = (function (_TransformString26) {
  _inherits(DuplicateWithCommentOutOriginal, _TransformString26);

  function DuplicateWithCommentOutOriginal() {
    _classCallCheck(this, DuplicateWithCommentOutOriginal);

    _get(Object.getPrototypeOf(DuplicateWithCommentOutOriginal.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.stayByMarker = true;
    this.stayAtSamePosition = true;
  }

  _createClass(DuplicateWithCommentOutOriginal, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _selection$getBufferRowRange = selection.getBufferRowRange();

      var _selection$getBufferRowRange2 = _slicedToArray(_selection$getBufferRowRange, 2);

      var startRow = _selection$getBufferRowRange2[0];
      var endRow = _selection$getBufferRowRange2[1];

      selection.setBufferRange(this.utils.insertTextAtBufferPosition(this.editor, [startRow, 0], selection.getText()));
      this.editor.toggleLineCommentsForBufferRows(startRow, endRow);
    }
  }]);

  return DuplicateWithCommentOutOriginal;
})(TransformString);

module.exports = {
  TransformString: TransformString,

  NoCase: NoCase,
  DotCase: DotCase,
  SwapCase: SwapCase,
  PathCase: PathCase,
  UpperCase: UpperCase,
  LowerCase: LowerCase,
  CamelCase: CamelCase,
  SnakeCase: SnakeCase,
  TitleCase: TitleCase,
  ParamCase: ParamCase,
  HeaderCase: HeaderCase,
  PascalCase: PascalCase,
  ConstantCase: ConstantCase,
  SentenceCase: SentenceCase,
  UpperCaseFirst: UpperCaseFirst,
  LowerCaseFirst: LowerCaseFirst,
  DashCase: DashCase,
  ToggleCase: ToggleCase,
  ToggleCaseAndMoveRight: ToggleCaseAndMoveRight,

  Replace: Replace,
  ReplaceCharacter: ReplaceCharacter,
  SplitByCharacter: SplitByCharacter,
  EncodeUriComponent: EncodeUriComponent,
  DecodeUriComponent: DecodeUriComponent,
  TrimString: TrimString,
  CompactSpaces: CompactSpaces,
  AlignOccurrence: AlignOccurrence,
  AlignOccurrenceByPadLeft: AlignOccurrenceByPadLeft,
  AlignOccurrenceByPadRight: AlignOccurrenceByPadRight,
  RemoveLeadingWhiteSpaces: RemoveLeadingWhiteSpaces,
  ConvertToSoftTab: ConvertToSoftTab,
  ConvertToHardTab: ConvertToHardTab,
  TransformStringByExternalCommand: TransformStringByExternalCommand,
  TransformStringBySelectList: TransformStringBySelectList,
  TransformWordBySelectList: TransformWordBySelectList,
  TransformSmartWordBySelectList: TransformSmartWordBySelectList,
  ReplaceWithRegister: ReplaceWithRegister,
  ReplaceOccurrenceWithRegister: ReplaceOccurrenceWithRegister,
  SwapWithRegister: SwapWithRegister,
  Indent: Indent,
  Outdent: Outdent,
  AutoIndent: AutoIndent,
  ToggleLineComments: ToggleLineComments,
  Reflow: Reflow,
  ReflowWithStay: ReflowWithStay,
  SurroundBase: SurroundBase,
  Surround: Surround,
  SurroundWord: SurroundWord,
  SurroundSmartWord: SurroundSmartWord,
  MapSurround: MapSurround,
  DeleteSurround: DeleteSurround,
  DeleteSurroundAnyPair: DeleteSurroundAnyPair,
  DeleteSurroundAnyPairAllowForwarding: DeleteSurroundAnyPairAllowForwarding,
  ChangeSurround: ChangeSurround,
  ChangeSurroundAnyPair: ChangeSurroundAnyPair,
  ChangeSurroundAnyPairAllowForwarding: ChangeSurroundAnyPairAllowForwarding,
  JoinTarget: JoinTarget,
  Join: Join,
  JoinBase: JoinBase,
  JoinWithKeepingSpace: JoinWithKeepingSpace,
  JoinByInput: JoinByInput,
  JoinByInputWithKeepingSpace: JoinByInputWithKeepingSpace,
  SplitString: SplitString,
  SplitStringWithKeepingSplitter: SplitStringWithKeepingSplitter,
  SplitArguments: SplitArguments,
  SplitArgumentsWithRemoveSeparator: SplitArgumentsWithRemoveSeparator,
  SplitArgumentsOfInnerAnyPair: SplitArgumentsOfInnerAnyPair,
  ChangeOrder: ChangeOrder,
  Reverse: Reverse,
  ReverseInnerAnyPair: ReverseInnerAnyPair,
  Rotate: Rotate,
  RotateBackwards: RotateBackwards,
  RotateArgumentsOfInnerPair: RotateArgumentsOfInnerPair,
  RotateArgumentsBackwardsOfInnerPair: RotateArgumentsBackwardsOfInnerPair,
  Sort: Sort,
  SortCaseInsensitively: SortCaseInsensitively,
  SortByNumber: SortByNumber,
  NumberingLines: NumberingLines,
  DuplicateWithCommentOutOriginal: DuplicateWithCommentOutOriginal
};
for (var klass of Object.values(module.exports)) {
  if (klass.isCommand()) klass.registerToSelectList();
}
// e.g. command: 'sort'
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFWCxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDekMsSUFBSSxVQUFVLFlBQUEsQ0FBQTs7ZUFFWSxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUFsQyxlQUFlLFlBQWYsZUFBZTs7Z0JBQ0gsT0FBTyxDQUFDLFlBQVksQ0FBQzs7SUFBakMsUUFBUSxhQUFSLFFBQVE7Ozs7O0lBSVQsZUFBZTtZQUFmLGVBQWU7O1dBQWYsZUFBZTswQkFBZixlQUFlOzsrQkFBZixlQUFlOztTQUduQixXQUFXLEdBQUcsSUFBSTtTQUNsQixjQUFjLEdBQUcsdUJBQXVCO1NBQ3hDLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLGlCQUFpQixHQUFHLEtBQUs7U0FDekIsYUFBYSxHQUFHLEtBQUs7OztlQVBqQixlQUFlOztXQWFILHlCQUFDLFNBQVMsRUFBRTtBQUMxQixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM1RCxVQUFJLElBQUksRUFBRTtBQUNSLFlBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixjQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ2pFLE1BQU07QUFDTCxtQkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUMsQ0FBQyxDQUFBO1NBQ3JHO09BQ0Y7S0FDRjs7O1dBYjJCLGdDQUFHO0FBQzdCLFVBQUksQ0FBQyxrQkFB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LE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDakQsTUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLG9CQUFvQixFQUFFLENBQUE7Q0FDcEQiLCJmaWxlIjoiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3QgY2hhbmdlQ2FzZSA9IHJlcXVpcmUoJ2NoYW5nZS1jYXNlJylcbmxldCBzZWxlY3RMaXN0XG5cbmNvbnN0IHtCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSgnYXRvbScpXG5jb25zdCB7T3BlcmF0b3J9ID0gcmVxdWlyZSgnLi9vcGVyYXRvcicpXG5cbi8vIFRyYW5zZm9ybVN0cmluZ1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBzdGF0aWMgc3RyaW5nVHJhbnNmb3JtZXJzID0gW11cbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN0YXlPcHRpb25OYW1lID0gJ3N0YXlPblRyYW5zZm9ybVN0cmluZydcbiAgYXV0b0luZGVudCA9IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lID0gZmFsc2VcbiAgcmVwbGFjZUJ5RGlmZiA9IGZhbHNlXG5cbiAgc3RhdGljIHJlZ2lzdGVyVG9TZWxlY3RMaXN0ICgpIHtcbiAgICB0aGlzLnN0cmluZ1RyYW5zZm9ybWVycy5wdXNoKHRoaXMpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLmdldE5ld1RleHQoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgIGlmICh0ZXh0KSB7XG4gICAgICBpZiAodGhpcy5yZXBsYWNlQnlEaWZmKSB7XG4gICAgICAgIHRoaXMucmVwbGFjZVRleHRJblJhbmdlVmlhRGlmZihzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSwgdGV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHthdXRvSW5kZW50OiB0aGlzLmF1dG9JbmRlbnQsIGF1dG9JbmRlbnROZXdsaW5lOiB0aGlzLmF1dG9JbmRlbnROZXdsaW5lfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQ2hhbmdlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBjb21tYW5kID0gZmFsc2VcbiAgZ2V0TmV3VGV4dCAodGV4dCkge1xuICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IHRoaXMuZnVuY3Rpb25OYW1lIHx8IGNoYW5nZUNhc2UubG93ZXJDYXNlRmlyc3QodGhpcy5uYW1lKVxuICAgIC8vIEhBQ0s6IFB1cmUgVmltJ3MgYH5gIGlzIHRvbyBhZ2dyZXNzaXZlKGUuZy4gcmVtb3ZlIHB1bmN0dWF0aW9uLCByZW1vdmUgd2hpdGUgc3BhY2VzLi4uKS5cbiAgICAvLyBIZXJlIGludGVudGlvbmFsbHkgbWFraW5nIGNoYW5nZUNhc2UgbGVzcyBhZ2dyZXNzaXZlIGJ5IG5hcnJvd2luZyB0YXJnZXQgY2hhcnNldC5cbiAgICBjb25zdCBjaGFyc2V0ID0gJ1tcXHUwMEMwLVxcdTAyQUZcXHUwMzg2LVxcdTA1ODdcXFxcd10nXG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGAke2NoYXJzZXR9Kyg6P1stLi9dPyR7Y2hhcnNldH0rKSpgLCAnZycpXG4gICAgcmV0dXJuIHRleHQucmVwbGFjZShyZWdleCwgbWF0Y2ggPT4gY2hhbmdlQ2FzZVtmdW5jdGlvbk5hbWVdKG1hdGNoKSlcbiAgfVxufVxuXG5jbGFzcyBOb0Nhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5jbGFzcyBEb3RDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9ICcuJ1xufVxuY2xhc3MgU3dhcENhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gJ34nXG59XG5jbGFzcyBQYXRoQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSAnLydcbn1cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIExvd2VyQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIFNuYWtlQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSAnXydcbn1cbmNsYXNzIFRpdGxlQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge31cbmNsYXNzIFBhcmFtQ2FzZSBleHRlbmRzIENoYW5nZUNhc2Uge1xuICBzdGF0aWMgZGlzcGxheU5hbWVTdWZmaXggPSAnLSdcbn1cbmNsYXNzIEhlYWRlckNhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5jbGFzcyBQYXNjYWxDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgQ29uc3RhbnRDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgU2VudGVuY2VDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7fVxuY2xhc3MgVXBwZXJDYXNlRmlyc3QgZXh0ZW5kcyBDaGFuZ2VDYXNlIHt9XG5jbGFzcyBMb3dlckNhc2VGaXJzdCBleHRlbmRzIENoYW5nZUNhc2Uge31cblxuY2xhc3MgRGFzaENhc2UgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lU3VmZml4ID0gJy0nXG4gIGZ1bmN0aW9uTmFtZSA9ICdwYXJhbUNhc2UnXG59XG5jbGFzcyBUb2dnbGVDYXNlIGV4dGVuZHMgQ2hhbmdlQ2FzZSB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9ICd+J1xuICBmdW5jdGlvbk5hbWUgPSAnc3dhcENhc2UnXG59XG5cbmNsYXNzIFRvZ2dsZUNhc2VBbmRNb3ZlUmlnaHQgZXh0ZW5kcyBDaGFuZ2VDYXNlIHtcbiAgZnVuY3Rpb25OYW1lID0gJ3N3YXBDYXNlJ1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICB0YXJnZXQgPSAnTW92ZVJpZ2h0J1xufVxuXG4vLyBSZXBsYWNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hDaGVja3BvaW50ID0gJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgYXV0b0luZGVudE5ld2xpbmUgPSB0cnVlXG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gdHJ1ZVxuXG4gIGdldE5ld1RleHQgKHRleHQpIHtcbiAgICBpZiAodGhpcy50YXJnZXQubmFtZSA9PT0gJ01vdmVSaWdodEJ1ZmZlckNvbHVtbicgJiYgdGV4dC5sZW5ndGggIT09IHRoaXMuZ2V0Q291bnQoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0IHx8ICdcXG4nXG4gICAgaWYgKGlucHV0ID09PSAnXFxuJykge1xuICAgICAgdGhpcy5yZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSgvLi9nLCBpbnB1dClcbiAgfVxufVxuXG5jbGFzcyBSZXBsYWNlQ2hhcmFjdGVyIGV4dGVuZHMgUmVwbGFjZSB7XG4gIHRhcmdldCA9ICdNb3ZlUmlnaHRCdWZmZXJDb2x1bW4nXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERVUCBtZWFuaW5nIHdpdGggU3BsaXRTdHJpbmcgbmVlZCBjb25zb2xpZGF0ZS5cbmNsYXNzIFNwbGl0QnlDaGFyYWN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQuc3BsaXQoJycpLmpvaW4oJyAnKVxuICB9XG59XG5cbmNsYXNzIEVuY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9ICclJ1xuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuICB9XG59XG5cbmNsYXNzIERlY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZVN1ZmZpeCA9ICclJSdcbiAgZ2V0TmV3VGV4dCAodGV4dCkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodGV4dClcbiAgfVxufVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICByZXBsYWNlQnlEaWZmID0gdHJ1ZVxuXG4gIGdldE5ld1RleHQgKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC50cmltKClcbiAgfVxufVxuXG5jbGFzcyBDb21wYWN0U3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCAodGV4dCkge1xuICAgIGlmICh0ZXh0Lm1hdGNoKC9eWyBdKyQvKSkge1xuICAgICAgcmV0dXJuICcgJ1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEb24ndCBjb21wYWN0IGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZXMuXG4gICAgICBjb25zdCByZWdleCA9IC9eKFxccyopKC4qPykoXFxzKikkL2dtXG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCAobSwgbGVhZGluZywgbWlkZGxlLCB0cmFpbGluZykgPT4ge1xuICAgICAgICByZXR1cm4gbGVhZGluZyArIG1pZGRsZS5zcGxpdCgvWyBcXHRdKy8pLmpvaW4oJyAnKSArIHRyYWlsaW5nXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBBbGlnbk9jY3VycmVuY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxuICB3aGljaFRvUGFkID0gJ2F1dG8nXG5cbiAgZ2V0U2VsZWN0aW9uVGFrZXIgKCkge1xuICAgIGNvbnN0IHNlbGVjdGlvbnNCeVJvdyA9IHt9XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKCkpIHtcbiAgICAgIGNvbnN0IHJvdyA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgICAgaWYgKCEocm93IGluIHNlbGVjdGlvbnNCeVJvdykpIHNlbGVjdGlvbnNCeVJvd1tyb3ddID0gW11cbiAgICAgIHNlbGVjdGlvbnNCeVJvd1tyb3ddLnB1c2goc2VsZWN0aW9uKVxuICAgIH1cbiAgICBjb25zdCBhbGxSb3dzID0gT2JqZWN0LmtleXMoc2VsZWN0aW9uc0J5Um93KVxuICAgIHJldHVybiAoKSA9PiBhbGxSb3dzLm1hcChyb3cgPT4gc2VsZWN0aW9uc0J5Um93W3Jvd10uc2hpZnQoKSkuZmlsdGVyKHMgPT4gcylcbiAgfVxuXG4gIGdldFdpY2hUb1BhZEZvclRleHQgKHRleHQpIHtcbiAgICBpZiAodGhpcy53aGljaFRvUGFkICE9PSAnYXV0bycpIHJldHVybiB0aGlzLndoaWNoVG9QYWRcblxuICAgIGlmICgvXlxccypbPXxdXFxzKiQvLnRlc3QodGV4dCkpIHtcbiAgICAgIC8vIEFzaWdubWVudCg9KSBhbmQgYHxgKG1hcmtkb3duLXRhYmxlIHNlcGFyYXRvcilcbiAgICAgIHJldHVybiAnc3RhcnQnXG4gICAgfSBlbHNlIGlmICgvXlxccyosXFxzKiQvLnRlc3QodGV4dCkpIHtcbiAgICAgIC8vIEFyZ3VtZW50c1xuICAgICAgcmV0dXJuICdlbmQnXG4gICAgfSBlbHNlIGlmICgvXFxXJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gZW5kcyB3aXRoIG5vbi13b3JkLWNoYXJcbiAgICAgIHJldHVybiAnZW5kJ1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ3N0YXJ0J1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVBhZGRpbmcgKCkge1xuICAgIGNvbnN0IHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3cgPSB7fVxuICAgIGNvbnN0IGNvbHVtbkZvclNlbGVjdGlvbiA9IHNlbGVjdGlvbiA9PiB7XG4gICAgICBjb25zdCB3aGljaCA9IHRoaXMuZ2V0V2ljaFRvUGFkRm9yVGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpKVxuICAgICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVt3aGljaF1cbiAgICAgIHJldHVybiBwb2ludC5jb2x1bW4gKyAodG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1twb2ludC5yb3ddIHx8IDApXG4gICAgfVxuXG4gICAgY29uc3QgdGFrZVNlbGVjdGlvbnMgPSB0aGlzLmdldFNlbGVjdGlvblRha2VyKClcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHRha2VTZWxlY3Rpb25zKClcbiAgICAgIGlmICghc2VsZWN0aW9ucy5sZW5ndGgpIHJldHVyblxuICAgICAgY29uc3QgbWF4Q29sdW1uID0gc2VsZWN0aW9ucy5tYXAoY29sdW1uRm9yU2VsZWN0aW9uKS5yZWR1Y2UoKG1heCwgY3VyKSA9PiAoY3VyID4gbWF4ID8gY3VyIDogbWF4KSlcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHNlbGVjdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgcm93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICAgIGNvbnN0IGFtb3VudE9mUGFkZGluZyA9IG1heENvbHVtbiAtIGNvbHVtbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICAgIHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcm93XSA9ICh0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3Jvd10gfHwgMCkgKyBhbW91bnRPZlBhZGRpbmdcbiAgICAgICAgdGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBhbW91bnRPZlBhZGRpbmcpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgdGhpcy5jYWxjdWxhdGVQYWRkaW5nKClcbiAgICB9KVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgZ2V0TmV3VGV4dCAodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGFkZGluZyA9ICcgJy5yZXBlYXQodGhpcy5hbW91bnRPZlBhZGRpbmdCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKSlcbiAgICBjb25zdCB3aGljaFRvUGFkID0gdGhpcy5nZXRXaWNoVG9QYWRGb3JUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgcmV0dXJuIHdoaWNoVG9QYWQgPT09ICdzdGFydCcgPyBwYWRkaW5nICsgdGV4dCA6IHRleHQgKyBwYWRkaW5nXG4gIH1cbn1cblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlQnlQYWRMZWZ0IGV4dGVuZHMgQWxpZ25PY2N1cnJlbmNlIHtcbiAgd2hpY2hUb1BhZCA9ICdzdGFydCdcbn1cblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlQnlQYWRSaWdodCBleHRlbmRzIEFsaWduT2NjdXJyZW5jZSB7XG4gIHdoaWNoVG9QYWQgPSAnZW5kJ1xufVxuXG5jbGFzcyBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICBnZXROZXdUZXh0ICh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0cmltTGVmdCA9IHRleHQgPT4gdGV4dC50cmltTGVmdCgpXG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMudXRpbHNcbiAgICAgICAgLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KVxuICAgICAgICAubWFwKHRyaW1MZWZ0KVxuICAgICAgICAuam9pbignXFxuJykgKyAnXFxuJ1xuICAgIClcbiAgfVxufVxuXG5jbGFzcyBDb252ZXJ0VG9Tb2Z0VGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gJ1NvZnQgVGFiJ1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zY2FuRWRpdG9yKCdmb3J3YXJkJywgL1xcdC9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PiB7XG4gICAgICAvLyBSZXBsYWNlIFxcdCB0byBzcGFjZXMgd2hpY2ggbGVuZ3RoIGlzIHZhcnkgZGVwZW5kaW5nIG9uIHRhYlN0b3AgYW5kIHRhYkxlbmdodFxuICAgICAgLy8gU28gd2UgZGlyZWN0bHkgY29uc3VsdCBpdCdzIHNjcmVlbiByZXByZXNlbnRpbmcgbGVuZ3RoLlxuICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy5lZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSkuZ2V0RXh0ZW50KCkuY29sdW1uXG4gICAgICByZXBsYWNlKCcgJy5yZXBlYXQobGVuZ3RoKSlcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIENvbnZlcnRUb0hhcmRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnSGFyZCBUYWInXG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0YWJMZW5ndGggPSB0aGlzLmVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIHRoaXMuc2NhbkVkaXRvcignZm9yd2FyZCcsIC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+IHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBsZXQgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGNvbnN0IGVuZENvbHVtbiA9IGVuZC5jb2x1bW5cblxuICAgICAgLy8gV2UgY2FuJ3QgbmFpdmVseSByZXBsYWNlIHNwYWNlcyB0byB0YWIsIHdlIGhhdmUgdG8gY29uc2lkZXIgdmFsaWQgdGFiU3RvcCBjb2x1bW5cbiAgICAgIC8vIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIGxldCBuZXdUZXh0ID0gJydcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IHN0YXJ0Q29sdW1uICUgdGFiTGVuZ3RoXG4gICAgICAgIGNvbnN0IG5leHRUYWJTdG9wID0gc3RhcnRDb2x1bW4gKyAocmVtYWluZGVyID09PSAwID8gdGFiTGVuZ3RoIDogcmVtYWluZGVyKVxuICAgICAgICBpZiAobmV4dFRhYlN0b3AgPiBlbmRDb2x1bW4pIHtcbiAgICAgICAgICBuZXdUZXh0ICs9ICcgJy5yZXBlYXQoZW5kQ29sdW1uIC0gc3RhcnRDb2x1bW4pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3VGV4dCArPSAnXFx0J1xuICAgICAgICB9XG4gICAgICAgIHN0YXJ0Q29sdW1uID0gbmV4dFRhYlN0b3BcbiAgICAgICAgaWYgKHN0YXJ0Q29sdW1uID49IGVuZENvbHVtbikge1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVwbGFjZShuZXdUZXh0KVxuICAgIH0pXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGF1dG9JbmRlbnQgPSB0cnVlXG4gIGNvbW1hbmQgPSAnJyAvLyBlLmcuIGNvbW1hbmQ6ICdzb3J0J1xuICBhcmdzID0gW10gLy8gZS5nIGFyZ3M6IFsnLXJuJ11cblxuICAvLyBOT1RFOiBVbmxpa2Ugb3RoZXIgY2xhc3MsIGZpcnN0IGFyZyBpcyBgc3Rkb3V0YCBvZiBleHRlcm5hbCBjb21tYW5kcy5cbiAgZ2V0TmV3VGV4dCAodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRleHQgfHwgc2VsZWN0aW9uLmdldFRleHQoKVxuICB9XG4gIGdldENvbW1hbmQgKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB7Y29tbWFuZDogdGhpcy5jb21tYW5kLCBhcmdzOiB0aGlzLmFyZ3N9XG4gIH1cbiAgZ2V0U3RkaW4gKHNlbGVjdGlvbikge1xuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIH1cblxuICBhc3luYyBleGVjdXRlICgpIHtcbiAgICB0aGlzLnByZVNlbGVjdCgpXG5cbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHtjb21tYW5kLCBhcmdzfSA9IHRoaXMuZ2V0Q29tbWFuZChzZWxlY3Rpb24pIHx8IHt9XG4gICAgICAgIGlmIChjb21tYW5kID09IG51bGwgfHwgYXJncyA9PSBudWxsKSBjb250aW51ZVxuXG4gICAgICAgIGNvbnN0IHN0ZG91dCA9IGF3YWl0IHRoaXMucnVuRXh0ZXJuYWxDb21tYW5kKHtjb21tYW5kLCBhcmdzLCBzdGRpbjogdGhpcy5nZXRTdGRpbihzZWxlY3Rpb24pfSlcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGhpcy5nZXROZXdUZXh0KHN0ZG91dCwgc2VsZWN0aW9uKSwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudH0pXG4gICAgICB9XG4gICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtZmluaXNoJylcbiAgICAgIHRoaXMucmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB9XG4gICAgdGhpcy5wb3N0TXV0YXRlKClcbiAgfVxuXG4gIHJ1bkV4dGVybmFsQ29tbWFuZCAob3B0aW9ucykge1xuICAgIGxldCBvdXRwdXQgPSAnJ1xuICAgIG9wdGlvbnMuc3Rkb3V0ID0gZGF0YSA9PiAob3V0cHV0ICs9IGRhdGEpXG4gICAgY29uc3QgZXhpdFByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIG9wdGlvbnMuZXhpdCA9ICgpID0+IHJlc29sdmUob3V0cHV0KVxuICAgIH0pXG4gICAgY29uc3Qge3N0ZGlufSA9IG9wdGlvbnNcbiAgICBkZWxldGUgb3B0aW9ucy5zdGRpblxuICAgIGNvbnN0IGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Mob3B0aW9ucylcbiAgICBidWZmZXJlZFByb2Nlc3Mub25XaWxsVGhyb3dFcnJvcigoe2Vycm9yLCBoYW5kbGV9KSA9PiB7XG4gICAgICAvLyBTdXBwcmVzcyBjb21tYW5kIG5vdCBmb3VuZCBlcnJvciBpbnRlbnRpb25hbGx5LlxuICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnICYmIGVycm9yLnN5c2NhbGwuaW5kZXhPZignc3Bhd24nKSA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLmdldENvbW1hbmROYW1lKCl9OiBGYWlsZWQgdG8gc3Bhd24gY29tbWFuZCAke2Vycm9yLnBhdGh9LmApXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICB9XG4gICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfSlcblxuICAgIGlmIChzdGRpbikge1xuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4ud3JpdGUoc3RkaW4pXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKVxuICAgIH1cbiAgICByZXR1cm4gZXhpdFByb21pc2VcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB0YXJnZXQgPSAnRW1wdHknXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuXG4gIHN0YXRpYyBnZXRTZWxlY3RMaXN0SXRlbXMgKCkge1xuICAgIGlmICghdGhpcy5zZWxlY3RMaXN0SXRlbXMpIHtcbiAgICAgIHRoaXMuc2VsZWN0TGlzdEl0ZW1zID0gdGhpcy5zdHJpbmdUcmFuc2Zvcm1lcnMubWFwKGtsYXNzID0+IHtcbiAgICAgICAgY29uc3Qgc3VmZml4ID0ga2xhc3MuaGFzT3duUHJvcGVydHkoJ2Rpc3BsYXlOYW1lU3VmZml4JykgPyAnICcgKyBrbGFzcy5kaXNwbGF5TmFtZVN1ZmZpeCA6ICcnXG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBrbGFzczoga2xhc3MsXG4gICAgICAgICAgZGlzcGxheU5hbWU6IGtsYXNzLmhhc093blByb3BlcnR5KCdkaXNwbGF5TmFtZScpXG4gICAgICAgICAgICA/IGtsYXNzLmRpc3BsYXlOYW1lICsgc3VmZml4XG4gICAgICAgICAgICA6IHRoaXMuXy5odW1hbml6ZUV2ZW50TmFtZSh0aGlzLl8uZGFzaGVyaXplKGtsYXNzLm5hbWUpKSArIHN1ZmZpeFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWxlY3RMaXN0SXRlbXNcbiAgfVxuXG4gIHNlbGVjdEl0ZW1zICgpIHtcbiAgICBpZiAoIXNlbGVjdExpc3QpIHtcbiAgICAgIGNvbnN0IFNlbGVjdExpc3QgPSByZXF1aXJlKCcuL3NlbGVjdC1saXN0JylcbiAgICAgIHNlbGVjdExpc3QgPSBuZXcgU2VsZWN0TGlzdCgpXG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RMaXN0LnNlbGVjdEZyb21JdGVtcyh0aGlzLmNvbnN0cnVjdG9yLmdldFNlbGVjdExpc3RJdGVtcygpKVxuICB9XG5cbiAgYXN5bmMgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgaXRlbSA9IGF3YWl0IHRoaXMuc2VsZWN0SXRlbXMoKVxuICAgIGlmIChpdGVtKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bk5leHQoaXRlbS5rbGFzcywge3RhcmdldDogdGhpcy5uZXh0VGFyZ2V0fSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIG5leHRUYXJnZXQgPSAnSW5uZXJXb3JkJ1xufVxuXG5jbGFzcyBUcmFuc2Zvcm1TbWFydFdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3Qge1xuICBuZXh0VGFyZ2V0ID0gJ0lubmVyU21hcnRXb3JkJ1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hUeXBlID0gJ29wZXJhdG9yLWxvbmcnXG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uSW5pdGlhbGl6ZSh0aGlzKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5zZXF1ZW50aWFsUGFzdGUgPSB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25FeGVjdXRlKHRoaXMpXG5cbiAgICBzdXBlci5leGVjdXRlKClcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGVkQnVmZmVyUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLnNhdmVQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24sIHJhbmdlKVxuICAgIH1cbiAgfVxuXG4gIGdldE5ld1RleHQgKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uLCB0aGlzLnNlcXVlbnRpYWxQYXN0ZSlcbiAgICByZXR1cm4gdmFsdWUgPyB2YWx1ZS50ZXh0IDogJydcbiAgfVxufVxuXG5jbGFzcyBSZXBsYWNlT2NjdXJyZW5jZVdpdGhSZWdpc3RlciBleHRlbmRzIFJlcGxhY2VXaXRoUmVnaXN0ZXIge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxufVxuXG4vLyBTYXZlIHRleHQgdG8gcmVnaXN0ZXIgYmVmb3JlIHJlcGxhY2VcbmNsYXNzIFN3YXBXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBnZXROZXdUZXh0ICh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbilcbiAgICByZXR1cm4gbmV3VGV4dFxuICB9XG59XG5cbi8vIEluZGVudCA8IFRyYW5zZm9ybVN0cmluZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IHRydWVcbiAgd2lzZSA9ICdsaW5ld2lzZSdcblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIC8vIE5lZWQgY291bnQgdGltZXMgaW5kZW50YXRpb24gaW4gdmlzdWFsLW1vZGUgYW5kIGl0cyByZXBlYXQoYC5gKS5cbiAgICBpZiAodGhpcy50YXJnZXQubmFtZSA9PT0gJ0N1cnJlbnRTZWxlY3Rpb24nKSB7XG4gICAgICBsZXQgb2xkVGV4dFxuICAgICAgLy8gbGltaXQgdG8gMTAwIHRvIGF2b2lkIGZyZWV6aW5nIGJ5IGFjY2lkZW50YWwgYmlnIG51bWJlci5cbiAgICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSwge21heDogMTAwfSksICh7c3RvcH0pID0+IHtcbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgdGhpcy5pbmRlbnQoc2VsZWN0aW9uKVxuICAgICAgICBpZiAoc2VsZWN0aW9uLmdldFRleHQoKSA9PT0gb2xkVGV4dCkgc3RvcCgpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluZGVudChzZWxlY3Rpb24pXG4gICAgfVxuICB9XG5cbiAgaW5kZW50IChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcbiAgfVxufVxuXG5jbGFzcyBPdXRkZW50IGV4dGVuZHMgSW5kZW50IHtcbiAgaW5kZW50IChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24ub3V0ZGVudFNlbGVjdGVkUm93cygpXG4gIH1cbn1cblxuY2xhc3MgQXV0b0luZGVudCBleHRlbmRzIEluZGVudCB7XG4gIGluZGVudCAoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuICB9XG59XG5cbmNsYXNzIFRvZ2dsZUxpbmVDb21tZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIHdpc2UgPSAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24udG9nZ2xlTGluZUNvbW1lbnRzKClcbiAgfVxufVxuXG5jbGFzcyBSZWZsb3cgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGhpcy5lZGl0b3JFbGVtZW50LCAnYXV0b2Zsb3c6cmVmbG93LXNlbGVjdGlvbicpXG4gIH1cbn1cblxuY2xhc3MgUmVmbG93V2l0aFN0YXkgZXh0ZW5kcyBSZWZsb3cge1xuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG59XG5cbi8vIFN1cnJvdW5kIDwgVHJhbnNmb3JtU3RyaW5nXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTdXJyb3VuZEJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHN1cnJvdW5kQWN0aW9uID0gbnVsbFxuICBwYWlycyA9IFtbJygnLCAnKSddLCBbJ3snLCAnfSddLCBbJ1snLCAnXSddLCBbJzwnLCAnPiddXVxuICBwYWlyc0J5QWxpYXMgPSB7XG4gICAgYjogWycoJywgJyknXSxcbiAgICBCOiBbJ3snLCAnfSddLFxuICAgIHI6IFsnWycsICddJ10sXG4gICAgYTogWyc8JywgJz4nXVxuICB9XG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgdGhpcy5yZXBsYWNlQnlEaWZmID0gdGhpcy5nZXRDb25maWcoJ3JlcGxhY2VCeURpZmZPblN1cnJvdW5kJylcbiAgICB0aGlzLnN0YXlCeU1hcmtlciA9IHRoaXMucmVwbGFjZUJ5RGlmZlxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0UGFpciAoY2hhcikge1xuICAgIHJldHVybiBjaGFyIGluIHRoaXMucGFpcnNCeUFsaWFzXG4gICAgICA/IHRoaXMucGFpcnNCeUFsaWFzW2NoYXJdXG4gICAgICA6IFsuLi50aGlzLnBhaXJzLCBbY2hhciwgY2hhcl1dLmZpbmQocGFpciA9PiBwYWlyLmluY2x1ZGVzKGNoYXIpKVxuICB9XG5cbiAgc3Vycm91bmQgKHRleHQsIGNoYXIsIHtrZWVwTGF5b3V0ID0gZmFsc2UsIHNlbGVjdGlvbn0gPSB7fSkge1xuICAgIGxldCBbb3BlbiwgY2xvc2VdID0gdGhpcy5nZXRQYWlyKGNoYXIpXG4gICAgaWYgKCFrZWVwTGF5b3V0ICYmIHRleHQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3cpXG4gICAgICBjb25zdCBpbmRlbnRUZXh0U3RhcnRSb3cgPSB0aGlzLmVkaXRvci5idWlsZEluZGVudFN0cmluZyhiYXNlSW5kZW50TGV2ZWwpXG4gICAgICBjb25zdCBpbmRlbnRUZXh0T25lTGV2ZWwgPSB0aGlzLmVkaXRvci5idWlsZEluZGVudFN0cmluZygxKVxuXG4gICAgICBvcGVuID0gaW5kZW50VGV4dFN0YXJ0Um93ICsgb3BlbiArICdcXG4nXG4gICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eKC4rKSQvZ20sIG0gPT4gaW5kZW50VGV4dE9uZUxldmVsICsgbSlcbiAgICAgIGNsb3NlID0gaW5kZW50VGV4dFN0YXJ0Um93ICsgY2xvc2UgKyAnXFxuJ1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZygnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJykuaW5jbHVkZXMoY2hhcikgJiYgdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpKSB7XG4gICAgICB0ZXh0ID0gJyAnICsgdGV4dCArICcgJ1xuICAgIH1cblxuICAgIHJldHVybiBvcGVuICsgdGV4dCArIGNsb3NlXG4gIH1cblxuICBkZWxldGVTdXJyb3VuZCAodGV4dCkge1xuICAgIC8vIEFzc3VtZSBzdXJyb3VuZGluZyBjaGFyIGlzIG9uZS1jaGFyIGxlbmd0aC5cbiAgICBjb25zdCBvcGVuID0gdGV4dFswXVxuICAgIGNvbnN0IGNsb3NlID0gdGV4dFt0ZXh0Lmxlbmd0aCAtIDFdXG4gICAgY29uc3QgaW5uZXJUZXh0ID0gdGV4dC5zbGljZSgxLCB0ZXh0Lmxlbmd0aCAtIDEpXG4gICAgcmV0dXJuIHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSAmJiBvcGVuICE9PSBjbG9zZSA/IGlubmVyVGV4dC50cmltKCkgOiBpbm5lclRleHRcbiAgfVxuXG4gIGdldE5ld1RleHQgKHRleHQsIHNlbGVjdGlvbikge1xuICAgIGlmICh0aGlzLnN1cnJvdW5kQWN0aW9uID09PSAnc3Vycm91bmQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdXJyb3VuZCh0ZXh0LCB0aGlzLmlucHV0LCB7c2VsZWN0aW9ufSlcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3Vycm91bmRBY3Rpb24gPT09ICdkZWxldGUtc3Vycm91bmQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxldGVTdXJyb3VuZCh0ZXh0KVxuICAgIH0gZWxzZSBpZiAodGhpcy5zdXJyb3VuZEFjdGlvbiA9PT0gJ2NoYW5nZS1zdXJyb3VuZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnN1cnJvdW5kKHRoaXMuZGVsZXRlU3Vycm91bmQodGV4dCksIHRoaXMuaW5wdXQsIHtrZWVwTGF5b3V0OiB0cnVlfSlcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2Uge1xuICBzdXJyb3VuZEFjdGlvbiA9ICdzdXJyb3VuZCdcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG59XG5cbmNsYXNzIFN1cnJvdW5kV29yZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gJ0lubmVyV29yZCdcbn1cblxuY2xhc3MgU3Vycm91bmRTbWFydFdvcmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIHRhcmdldCA9ICdJbm5lclNtYXJ0V29yZCdcbn1cblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZCB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gL1xcdysvZ1xufVxuXG4vLyBEZWxldGUgU3Vycm91bmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIERlbGV0ZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgc3Vycm91bmRBY3Rpb24gPSAnZGVsZXRlLXN1cnJvdW5kJ1xuICBpbml0aWFsaXplICgpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0KSB7XG4gICAgICB0aGlzLmZvY3VzSW5wdXQoe1xuICAgICAgICBvbkNvbmZpcm06IGNoYXIgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0VGFyZ2V0KHRoaXMuZ2V0SW5zdGFuY2UoJ0FQYWlyJywge3BhaXI6IHRoaXMuZ2V0UGFpcihjaGFyKX0pKVxuICAgICAgICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG59XG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIERlbGV0ZVN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gJ0FBbnlQYWlyJ1xufVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZEFueVBhaXIge1xuICB0YXJnZXQgPSAnQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcnXG59XG5cbi8vIENoYW5nZSBTdXJyb3VuZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZCB7XG4gIHN1cnJvdW5kQWN0aW9uID0gJ2NoYW5nZS1zdXJyb3VuZCdcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG5cbiAgLy8gT3ZlcnJpZGUgdG8gc2hvdyBjaGFuZ2luZyBjaGFyIG9uIGhvdmVyXG4gIGFzeW5jIGZvY3VzSW5wdXRQcm9taXNlZCAoLi4uYXJncykge1xuICAgIGNvbnN0IGhvdmVyUG9pbnQgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRJbml0aWFsUG9pbnRGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdLCBob3ZlclBvaW50KVxuICAgIHJldHVybiBzdXBlci5mb2N1c0lucHV0UHJvbWlzZWQoLi4uYXJncylcbiAgfVxufVxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZCB7XG4gIHRhcmdldCA9ICdBQW55UGFpcidcbn1cblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIHtcbiAgdGFyZ2V0ID0gJ0FBbnlQYWlyQWxsb3dGb3J3YXJkaW5nJ1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGSVhNRVxuLy8gQ3VycmVudGx5IG5hdGl2ZSBlZGl0b3Iuam9pbkxpbmVzKCkgaXMgYmV0dGVyIGZvciBjdXJzb3IgcG9zaXRpb24gc2V0dGluZ1xuLy8gU28gSSB1c2UgbmF0aXZlIG1ldGhvZHMgZm9yIGEgbWVhbndoaWxlLlxuY2xhc3MgSm9pblRhcmdldCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgICAvLyBXaGVuIGN1cnNvciBpcyBhdCBsYXN0IEJVRkZFUiByb3csIGl0IHNlbGVjdCBsYXN0LWJ1ZmZlci1yb3csIHRoZW5cbiAgICAvLyBqb2lubmluZyByZXN1bHQgaW4gXCJjbGVhciBsYXN0LWJ1ZmZlci1yb3cgdGV4dFwiLlxuICAgIC8vIEkgYmVsaWV2ZSB0aGlzIGlzIEJVRyBvZiB1cHN0cmVhbSBhdG9tLWNvcmUuIGd1YXJkIHRoaXMgc2l0dWF0aW9uIGhlcmVcbiAgICBpZiAoIXJhbmdlLmlzU2luZ2xlTGluZSgpIHx8IHJhbmdlLmVuZC5yb3cgIT09IHRoaXMuZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSkge1xuICAgICAgaWYgKHRoaXMudXRpbHMuaXNMaW5ld2lzZVJhbmdlKHJhbmdlKSkge1xuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgWy0xLCBJbmZpbml0eV0pKVxuICAgICAgfVxuICAgICAgc2VsZWN0aW9uLmpvaW5MaW5lcygpXG4gICAgfVxuICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHJldHVybiBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5cbmNsYXNzIEpvaW4gZXh0ZW5kcyBKb2luVGFyZ2V0IHtcbiAgdGFyZ2V0ID0gJ01vdmVUb1JlbGF0aXZlTGluZSdcbn1cblxuY2xhc3MgSm9pbkJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHRyaW0gPSBmYWxzZVxuICB0YXJnZXQgPSAnTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3bydcblxuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSB0aGlzLnRyaW0gPyAvXFxyP1xcblsgXFx0XSovZyA6IC9cXHI/XFxuL2dcbiAgICByZXR1cm4gdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHJlZ2V4LCB0aGlzLmlucHV0KSArICdcXG4nXG4gIH1cbn1cblxuY2xhc3MgSm9pbldpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQmFzZSB7XG4gIGlucHV0ID0gJydcbn1cblxuY2xhc3MgSm9pbkJ5SW5wdXQgZXh0ZW5kcyBKb2luQmFzZSB7XG4gIHJlYWRJbnB1dEFmdGVyU2VsZWN0ID0gdHJ1ZVxuICBmb2N1c0lucHV0T3B0aW9ucyA9IHtjaGFyc01heDogMTB9XG4gIHRyaW0gPSB0cnVlXG59XG5cbmNsYXNzIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CeUlucHV0IHtcbiAgdHJpbSA9IGZhbHNlXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFN0cmluZyBzdWZmaXggaW4gbmFtZSBpcyB0byBhdm9pZCBjb25mdXNpb24gd2l0aCAnc3BsaXQnIHdpbmRvdy5cbmNsYXNzIFNwbGl0U3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgdGFyZ2V0ID0gJ01vdmVUb1JlbGF0aXZlTGluZSdcbiAga2VlcFNwbGl0dGVyID0gZmFsc2VcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSB0cnVlXG4gIGZvY3VzSW5wdXRPcHRpb25zID0ge2NoYXJzTWF4OiAxMH1cblxuICBnZXROZXdUZXh0ICh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHRoaXMuXy5lc2NhcGVSZWdFeHAodGhpcy5pbnB1dCB8fCAnXFxcXG4nKSwgJ2cnKVxuICAgIGNvbnN0IGxpbmVTZXBhcmF0b3IgPSAodGhpcy5rZWVwU3BsaXR0ZXIgPyB0aGlzLmlucHV0IDogJycpICsgJ1xcbidcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCBsaW5lU2VwYXJhdG9yKVxuICB9XG59XG5cbmNsYXNzIFNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlciBleHRlbmRzIFNwbGl0U3RyaW5nIHtcbiAga2VlcFNwbGl0dGVyID0gdHJ1ZVxufVxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGtlZXBTZXBhcmF0b3IgPSB0cnVlXG5cbiAgZ2V0TmV3VGV4dCAodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgYWxsVG9rZW5zID0gdGhpcy51dGlscy5zcGxpdEFyZ3VtZW50cyh0ZXh0LnRyaW0oKSlcbiAgICBsZXQgbmV3VGV4dCA9ICcnXG5cbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3cpXG4gICAgY29uc3QgaW5kZW50VGV4dFN0YXJ0Um93ID0gdGhpcy5lZGl0b3IuYnVpbGRJbmRlbnRTdHJpbmcoYmFzZUluZGVudExldmVsKVxuICAgIGNvbnN0IGluZGVudFRleHRJbm5lclJvd3MgPSB0aGlzLmVkaXRvci5idWlsZEluZGVudFN0cmluZyhiYXNlSW5kZW50TGV2ZWwgKyAxKVxuXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHt0ZXh0LCB0eXBlfSA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBuZXdUZXh0ICs9IHR5cGUgPT09ICdzZXBhcmF0b3InID8gKHRoaXMua2VlcFNlcGFyYXRvciA/IHRleHQudHJpbSgpIDogJycpICsgJ1xcbicgOiBpbmRlbnRUZXh0SW5uZXJSb3dzICsgdGV4dFxuICAgIH1cbiAgICByZXR1cm4gYFxcbiR7bmV3VGV4dH1cXG4ke2luZGVudFRleHRTdGFydFJvd31gXG4gIH1cbn1cblxuY2xhc3MgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yIGV4dGVuZHMgU3BsaXRBcmd1bWVudHMge1xuICBrZWVwU2VwYXJhdG9yID0gZmFsc2Vcbn1cblxuY2xhc3MgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpciBleHRlbmRzIFNwbGl0QXJndW1lbnRzIHtcbiAgdGFyZ2V0ID0gJ0lubmVyQW55UGFpcidcbn1cblxuY2xhc3MgQ2hhbmdlT3JkZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGFjdGlvbiA9IG51bGxcbiAgc29ydEJ5ID0gbnVsbFxuXG4gIGdldE5ld1RleHQgKHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy50YXJnZXQuaXNMaW5ld2lzZSgpXG4gICAgICA/IHRoaXMuZ2V0TmV3TGlzdCh0aGlzLnV0aWxzLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KSkuam9pbignXFxuJykgKyAnXFxuJ1xuICAgICAgOiB0aGlzLnNvcnRBcmd1bWVudHNJblRleHRCeSh0ZXh0LCBhcmdzID0+IHRoaXMuZ2V0TmV3TGlzdChhcmdzKSlcbiAgfVxuXG4gIGdldE5ld0xpc3QgKHJvd3MpIHtcbiAgICBpZiAocm93cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiBbdGhpcy51dGlscy5jaGFuZ2VDaGFyT3JkZXIocm93c1swXSwgdGhpcy5hY3Rpb24sIHRoaXMuc29ydEJ5KV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudXRpbHMuY2hhbmdlQXJyYXlPcmRlcihyb3dzLCB0aGlzLmFjdGlvbiwgdGhpcy5zb3J0QnkpXG4gICAgfVxuICB9XG5cbiAgc29ydEFyZ3VtZW50c0luVGV4dEJ5ICh0ZXh0LCBmbikge1xuICAgIGNvbnN0IHN0YXJ0ID0gdGV4dC5zZWFyY2goL1xcUy8pXG4gICAgY29uc3QgZW5kID0gdGV4dC5zZWFyY2goL1xccyokLylcbiAgICBjb25zdCBsZWFkaW5nU3BhY2VzID0gc3RhcnQgIT09IC0xID8gdGV4dC5zbGljZSgwLCBzdGFydCkgOiAnJ1xuICAgIGNvbnN0IHRyYWlsaW5nU3BhY2VzID0gZW5kICE9PSAtMSA/IHRleHQuc2xpY2UoZW5kKSA6ICcnXG4gICAgY29uc3QgYWxsVG9rZW5zID0gdGhpcy51dGlscy5zcGxpdEFyZ3VtZW50cyh0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpKVxuICAgIGNvbnN0IGFyZ3MgPSBhbGxUb2tlbnMuZmlsdGVyKHRva2VuID0+IHRva2VuLnR5cGUgPT09ICdhcmd1bWVudCcpLm1hcCh0b2tlbiA9PiB0b2tlbi50ZXh0KVxuICAgIGNvbnN0IG5ld0FyZ3MgPSBmbihhcmdzKVxuXG4gICAgbGV0IG5ld1RleHQgPSAnJ1xuICAgIHdoaWxlIChhbGxUb2tlbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICAvLyB0b2tlbi50eXBlIGlzIFwic2VwYXJhdG9yXCIgb3IgXCJhcmd1bWVudFwiXG4gICAgICBuZXdUZXh0ICs9IHRva2VuLnR5cGUgPT09ICdzZXBhcmF0b3InID8gdG9rZW4udGV4dCA6IG5ld0FyZ3Muc2hpZnQoKVxuICAgIH1cbiAgICByZXR1cm4gbGVhZGluZ1NwYWNlcyArIG5ld1RleHQgKyB0cmFpbGluZ1NwYWNlc1xuICB9XG59XG5cbmNsYXNzIFJldmVyc2UgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGFjdGlvbiA9ICdyZXZlcnNlJ1xufVxuXG5jbGFzcyBSZXZlcnNlSW5uZXJBbnlQYWlyIGV4dGVuZHMgUmV2ZXJzZSB7XG4gIHRhcmdldCA9ICdJbm5lckFueVBhaXInXG59XG5cbmNsYXNzIFJvdGF0ZSBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgYWN0aW9uID0gJ3JvdGF0ZS1sZWZ0J1xufVxuXG5jbGFzcyBSb3RhdGVCYWNrd2FyZHMgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGFjdGlvbiA9ICdyb3RhdGUtcmlnaHQnXG59XG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlIHtcbiAgdGFyZ2V0ID0gJ0lubmVyQW55UGFpcidcbn1cblxuY2xhc3MgUm90YXRlQXJndW1lbnRzQmFja3dhcmRzT2ZJbm5lclBhaXIgZXh0ZW5kcyBSb3RhdGVCYWNrd2FyZHMge1xuICB0YXJnZXQgPSAnSW5uZXJBbnlQYWlyJ1xufVxuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBhY3Rpb24gPSAnc29ydCdcbn1cblxuY2xhc3MgU29ydENhc2VJbnNlbnNpdGl2ZWx5IGV4dGVuZHMgU29ydCB7XG4gIHNvcnRCeSA9IChyb3dBLCByb3dCKSA9PiByb3dBLmxvY2FsZUNvbXBhcmUocm93Qiwge3NlbnNpdGl2aXR5OiAnYmFzZSd9KVxufVxuXG5jbGFzcyBTb3J0QnlOdW1iZXIgZXh0ZW5kcyBTb3J0IHtcbiAgc29ydEJ5ID0gKHJvd0EsIHJvd0IpID0+IChOdW1iZXIucGFyc2VJbnQocm93QSkgfHwgSW5maW5pdHkpIC0gKE51bWJlci5wYXJzZUludChyb3dCKSB8fCBJbmZpbml0eSlcbn1cblxuY2xhc3MgTnVtYmVyaW5nTGluZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuXG4gIGdldE5ld1RleHQgKHRleHQpIHtcbiAgICBjb25zdCByb3dzID0gdGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dClcbiAgICBjb25zdCBsYXN0Um93V2lkdGggPSBTdHJpbmcocm93cy5sZW5ndGgpLmxlbmd0aFxuXG4gICAgY29uc3QgbmV3Um93cyA9IHJvd3MubWFwKChyb3dUZXh0LCBpKSA9PiB7XG4gICAgICBpKysgLy8gZml4IDAgc3RhcnQgaW5kZXggdG8gMSBzdGFydC5cbiAgICAgIGNvbnN0IGFtb3VudE9mUGFkZGluZyA9IHRoaXMubGltaXROdW1iZXIobGFzdFJvd1dpZHRoIC0gU3RyaW5nKGkpLmxlbmd0aCwge21pbjogMH0pXG4gICAgICByZXR1cm4gJyAnLnJlcGVhdChhbW91bnRPZlBhZGRpbmcpICsgaSArICc6ICcgKyByb3dUZXh0XG4gICAgfSlcbiAgICByZXR1cm4gbmV3Um93cy5qb2luKCdcXG4nKSArICdcXG4nXG4gIH1cbn1cblxuY2xhc3MgRHVwbGljYXRlV2l0aENvbW1lbnRPdXRPcmlnaW5hbCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHN0YXlCeU1hcmtlciA9IHRydWVcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHRoaXMudXRpbHMuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIFtzdGFydFJvdywgMF0sIHNlbGVjdGlvbi5nZXRUZXh0KCkpKVxuICAgIHRoaXMuZWRpdG9yLnRvZ2dsZUxpbmVDb21tZW50c0ZvckJ1ZmZlclJvd3Moc3RhcnRSb3csIGVuZFJvdylcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHJhbnNmb3JtU3RyaW5nLFxuXG4gIE5vQ2FzZSxcbiAgRG90Q2FzZSxcbiAgU3dhcENhc2UsXG4gIFBhdGhDYXNlLFxuICBVcHBlckNhc2UsXG4gIExvd2VyQ2FzZSxcbiAgQ2FtZWxDYXNlLFxuICBTbmFrZUNhc2UsXG4gIFRpdGxlQ2FzZSxcbiAgUGFyYW1DYXNlLFxuICBIZWFkZXJDYXNlLFxuICBQYXNjYWxDYXNlLFxuICBDb25zdGFudENhc2UsXG4gIFNlbnRlbmNlQ2FzZSxcbiAgVXBwZXJDYXNlRmlyc3QsXG4gIExvd2VyQ2FzZUZpcnN0LFxuICBEYXNoQ2FzZSxcbiAgVG9nZ2xlQ2FzZSxcbiAgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCxcblxuICBSZXBsYWNlLFxuICBSZXBsYWNlQ2hhcmFjdGVyLFxuICBTcGxpdEJ5Q2hhcmFjdGVyLFxuICBFbmNvZGVVcmlDb21wb25lbnQsXG4gIERlY29kZVVyaUNvbXBvbmVudCxcbiAgVHJpbVN0cmluZyxcbiAgQ29tcGFjdFNwYWNlcyxcbiAgQWxpZ25PY2N1cnJlbmNlLFxuICBBbGlnbk9jY3VycmVuY2VCeVBhZExlZnQsXG4gIEFsaWduT2NjdXJyZW5jZUJ5UGFkUmlnaHQsXG4gIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyxcbiAgQ29udmVydFRvU29mdFRhYixcbiAgQ29udmVydFRvSGFyZFRhYixcbiAgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQsXG4gIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCxcbiAgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCxcbiAgVHJhbnNmb3JtU21hcnRXb3JkQnlTZWxlY3RMaXN0LFxuICBSZXBsYWNlV2l0aFJlZ2lzdGVyLFxuICBSZXBsYWNlT2NjdXJyZW5jZVdpdGhSZWdpc3RlcixcbiAgU3dhcFdpdGhSZWdpc3RlcixcbiAgSW5kZW50LFxuICBPdXRkZW50LFxuICBBdXRvSW5kZW50LFxuICBUb2dnbGVMaW5lQ29tbWVudHMsXG4gIFJlZmxvdyxcbiAgUmVmbG93V2l0aFN0YXksXG4gIFN1cnJvdW5kQmFzZSxcbiAgU3Vycm91bmQsXG4gIFN1cnJvdW5kV29yZCxcbiAgU3Vycm91bmRTbWFydFdvcmQsXG4gIE1hcFN1cnJvdW5kLFxuICBEZWxldGVTdXJyb3VuZCxcbiAgRGVsZXRlU3Vycm91bmRBbnlQYWlyLFxuICBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcsXG4gIENoYW5nZVN1cnJvdW5kLFxuICBDaGFuZ2VTdXJyb3VuZEFueVBhaXIsXG4gIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyxcbiAgSm9pblRhcmdldCxcbiAgSm9pbixcbiAgSm9pbkJhc2UsXG4gIEpvaW5XaXRoS2VlcGluZ1NwYWNlLFxuICBKb2luQnlJbnB1dCxcbiAgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlLFxuICBTcGxpdFN0cmluZyxcbiAgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLFxuICBTcGxpdEFyZ3VtZW50cyxcbiAgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLFxuICBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyLFxuICBDaGFuZ2VPcmRlcixcbiAgUmV2ZXJzZSxcbiAgUmV2ZXJzZUlubmVyQW55UGFpcixcbiAgUm90YXRlLFxuICBSb3RhdGVCYWNrd2FyZHMsXG4gIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyLFxuICBSb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpcixcbiAgU29ydCxcbiAgU29ydENhc2VJbnNlbnNpdGl2ZWx5LFxuICBTb3J0QnlOdW1iZXIsXG4gIE51bWJlcmluZ0xpbmVzLFxuICBEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsXG59XG5mb3IgKGNvbnN0IGtsYXNzIG9mIE9iamVjdC52YWx1ZXMobW9kdWxlLmV4cG9ydHMpKSB7XG4gIGlmIChrbGFzcy5pc0NvbW1hbmQoKSkga2xhc3MucmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxufVxuIl19