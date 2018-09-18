'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var settings = require('./settings');
var VimState = require('./vim-state');

var FILE_TABLE = undefined;

var classify = function classify(s) {
  return s[0].toUpperCase() + s.slice(1).replace(/-(\w)/g, function (m) {
    return m[1].toUpperCase();
  });
};
var dasherize = function dasherize(s) {
  return (s[0].toLowerCase() + s.slice(1)).replace(/[A-Z]/g, function (m) {
    return '-' + m.toLowerCase();
  });
};

module.exports = (function () {
  _createClass(Base, [{
    key: 'name',
    get: function get() {
      return this.constructor.name;
    }
  }], [{
    key: 'classByName',
    value: new Map(),
    enumerable: true
  }, {
    key: 'commandPrefix',
    value: 'vim-mode-plus',
    enumerable: true
  }, {
    key: 'commandScope',
    value: 'atom-text-editor',
    enumerable: true
  }, {
    key: 'operationKind',
    value: null,
    enumerable: true
  }]);

  function Base(vimState) {
    _classCallCheck(this, Base);

    this.recordable = false;
    this.repeated = false;
    this.count = null;
    this.defaultCount = 1;

    this.vimState = vimState;
  }

  _createClass(Base, [{
    key: 'initialize',
    value: function initialize() {}

    // Called both on cancel and success
  }, {
    key: 'resetState',
    value: function resetState() {}

    // OperationStack postpone execution untill isReady() get true, overridden on subclass.
  }, {
    key: 'isReady',
    value: function isReady() {
      return true;
    }

    // VisualModeSelect is anormal, since it's auto complemented in visial mode.
    // In other word, normal-operator is explicit whereas anormal-operator is implicit.
  }, {
    key: 'isTargetOfNormalOperator',
    value: function isTargetOfNormalOperator() {
      return this.operator && this.operator.name !== 'VisualModeSelect';
    }
  }, {
    key: 'hasCount',
    value: function hasCount() {
      return this.vimState.hasCount();
    }
  }, {
    key: 'getCount',
    value: function getCount() {
      if (this.count == null) {
        this.count = this.hasCount() ? this.vimState.getCount() : this.defaultCount;
      }
      return this.count;
    }

    // Identical to utils.limitNumber. Copy here to postpone full require of utils.
  }, {
    key: 'limitNumber',
    value: function limitNumber(number) {
      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var max = _ref.max;
      var min = _ref.min;

      if (max != null) number = Math.min(number, max);
      if (min != null) number = Math.max(number, min);
      return number;
    }
  }, {
    key: 'resetCount',
    value: function resetCount() {
      this.count = null;
    }
  }, {
    key: 'countTimes',
    value: function countTimes(last, fn) {
      if (last < 1) return;

      var stopped = false;
      var stop = function stop() {
        return stopped = true;
      };
      for (var count = 1; count <= last; count++) {
        fn({ count: count, isFinal: count === last, stop: stop });
        if (stopped) break;
      }
    }
  }, {
    key: 'activateMode',
    value: function activateMode(mode, submode) {
      var _this = this;

      this.onDidFinishOperation(function () {
        _this.vimState.activate(mode, submode);
      });
    }
  }, {
    key: 'activateModeIfNecessary',
    value: function activateModeIfNecessary(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        this.activateMode(mode, submode);
      }
    }
  }, {
    key: 'getInstance',
    value: function getInstance(name, properties) {
      return this.constructor.getInstance(this.vimState, name, properties);
    }
  }, {
    key: 'cancelOperation',
    value: function cancelOperation() {
      this.vimState.operationStack.cancel(this);
    }
  }, {
    key: 'processOperation',
    value: function processOperation() {
      this.vimState.operationStack.process();
    }
  }, {
    key: 'focusInput',
    value: function focusInput() {
      var _this2 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (!options.onConfirm) {
        options.onConfirm = function (input) {
          _this2.input = input;
          _this2.processOperation();
        };
      }
      if (!options.onCancel) options.onCancel = function () {
        return _this2.cancelOperation();
      };
      if (!options.onChange) options.onChange = function (input) {
        return _this2.vimState.hover.set(input);
      };

      this.vimState.focusInput(options);
    }

    // Return promise which resolve with input char or `undefined` when cancelled.
  }, {
    key: 'focusInputPromised',
    value: function focusInputPromised() {
      var _this3 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new Promise(function (resolve) {
        var defaultOptions = { hideCursor: true, onChange: function onChange(input) {
            return _this3.vimState.hover.set(input);
          } };
        _this3.vimState.focusInput(Object.assign(defaultOptions, options, { onConfirm: resolve, onCancel: resolve }));
      });
    }
  }, {
    key: 'readChar',
    value: function readChar() {
      var _this4 = this;

      this.vimState.readChar({
        onConfirm: function onConfirm(input) {
          _this4.input = input;
          _this4.processOperation();
        },
        onCancel: function onCancel() {
          return _this4.cancelOperation();
        }
      });
    }

    // Return promise which resolve with read char or `undefined` when cancelled.
  }, {
    key: 'readCharPromised',
    value: function readCharPromised() {
      var _this5 = this;

      return new Promise(function (resolve) {
        _this5.vimState.readChar({ onConfirm: resolve, onCancel: resolve });
      });
    }
  }, {
    key: 'instanceof',
    value: function _instanceof(klassName) {
      return this instanceof Base.getClass(klassName);
    }
  }, {
    key: 'isOperator',
    value: function isOperator() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === 'operator';
    }
  }, {
    key: 'isMotion',
    value: function isMotion() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === 'motion';
    }
  }, {
    key: 'isTextObject',
    value: function isTextObject() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === 'text-object';
    }
  }, {
    key: 'getCursorBufferPosition',
    value: function getCursorBufferPosition() {
      return this.getBufferPositionForCursor(this.editor.getLastCursor());
    }
  }, {
    key: 'getCursorBufferPositions',
    value: function getCursorBufferPositions() {
      var _this6 = this;

      return this.editor.getCursors().map(function (cursor) {
        return _this6.getBufferPositionForCursor(cursor);
      });
    }
  }, {
    key: 'getCursorBufferPositionsOrdered',
    value: function getCursorBufferPositionsOrdered() {
      return this.utils.sortPoints(this.getCursorBufferPositions());
    }
  }, {
    key: 'getBufferPositionForCursor',
    value: function getBufferPositionForCursor(cursor) {
      return this.mode === 'visual' ? this.getCursorPositionForSelection(cursor.selection) : cursor.getBufferPosition();
    }
  }, {
    key: 'getCursorPositionForSelection',
    value: function getCursorPositionForSelection(selection) {
      return this.swrap(selection).getBufferPositionFor('head', { from: ['property', 'selection'] });
    }
  }, {
    key: 'getOperationTypeChar',
    value: function getOperationTypeChar() {
      return ({ operator: 'O', 'text-object': 'T', motion: 'M', 'misc-command': 'X' })[this.constructor.operationKind];
    }
  }, {
    key: 'toString',
    value: function toString() {
      var base = this.name + '<' + this.getOperationTypeChar() + '>';
      return this.target ? base + '{target = ' + this.target.toString() + '}' : base;
    }
  }, {
    key: 'getCommandName',
    value: function getCommandName() {
      return this.constructor.getCommandName();
    }
  }, {
    key: 'getCommandNameWithoutPrefix',
    value: function getCommandNameWithoutPrefix() {
      return this.constructor.getCommandNameWithoutPrefix();
    }
  }, {
    key: 'getSmoothScrollDuation',
    value: function getSmoothScrollDuation(kind) {
      var base = 'smoothScrollOn' + kind;
      return this.getConfig(base) ? this.getConfig(base + 'Duration') : 0;
    }

    // Proxy propperties and methods
    // ===========================================================================
  }, {
    key: 'onDidChangeSearch',
    // prettier-ignore

    value: function onDidChangeSearch() {
      var _vimState;

      return (_vimState = this.vimState).onDidChangeSearch.apply(_vimState, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidConfirmSearch',
    value: function onDidConfirmSearch() {
      var _vimState2;

      return (_vimState2 = this.vimState).onDidConfirmSearch.apply(_vimState2, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidCancelSearch',
    value: function onDidCancelSearch() {
      var _vimState3;

      return (_vimState3 = this.vimState).onDidCancelSearch.apply(_vimState3, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidCommandSearch',
    value: function onDidCommandSearch() {
      var _vimState4;

      return (_vimState4 = this.vimState).onDidCommandSearch.apply(_vimState4, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidSetTarget',
    value: function onDidSetTarget() {
      var _vimState5;

      return (_vimState5 = this.vimState).onDidSetTarget.apply(_vimState5, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidSetTarget',
    value: function emitDidSetTarget() {
      var _vimState6;

      return (_vimState6 = this.vimState).emitDidSetTarget.apply(_vimState6, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onWillSelectTarget',
    value: function onWillSelectTarget() {
      var _vimState7;

      return (_vimState7 = this.vimState).onWillSelectTarget.apply(_vimState7, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitWillSelectTarget',
    value: function emitWillSelectTarget() {
      var _vimState8;

      return (_vimState8 = this.vimState).emitWillSelectTarget.apply(_vimState8, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidSelectTarget',
    value: function onDidSelectTarget() {
      var _vimState9;

      return (_vimState9 = this.vimState).onDidSelectTarget.apply(_vimState9, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidSelectTarget',
    value: function emitDidSelectTarget() {
      var _vimState10;

      return (_vimState10 = this.vimState).emitDidSelectTarget.apply(_vimState10, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidFailSelectTarget',
    value: function onDidFailSelectTarget() {
      var _vimState11;

      return (_vimState11 = this.vimState).onDidFailSelectTarget.apply(_vimState11, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidFailSelectTarget',
    value: function emitDidFailSelectTarget() {
      var _vimState12;

      return (_vimState12 = this.vimState).emitDidFailSelectTarget.apply(_vimState12, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onWillFinishMutation',
    value: function onWillFinishMutation() {
      var _vimState13;

      return (_vimState13 = this.vimState).onWillFinishMutation.apply(_vimState13, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitWillFinishMutation',
    value: function emitWillFinishMutation() {
      var _vimState14;

      return (_vimState14 = this.vimState).emitWillFinishMutation.apply(_vimState14, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidFinishMutation',
    value: function onDidFinishMutation() {
      var _vimState15;

      return (_vimState15 = this.vimState).onDidFinishMutation.apply(_vimState15, arguments);
    }
    // prettier-ignore
  }, {
    key: 'emitDidFinishMutation',
    value: function emitDidFinishMutation() {
      var _vimState16;

      return (_vimState16 = this.vimState).emitDidFinishMutation.apply(_vimState16, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidFinishOperation',
    value: function onDidFinishOperation() {
      var _vimState17;

      return (_vimState17 = this.vimState).onDidFinishOperation.apply(_vimState17, arguments);
    }
    // prettier-ignore
  }, {
    key: 'onDidResetOperationStack',
    value: function onDidResetOperationStack() {
      var _vimState18;

      return (_vimState18 = this.vimState).onDidResetOperationStack.apply(_vimState18, arguments);
    }
    // prettier-ignore
  }, {
    key: 'subscribe',
    value: function subscribe() {
      var _vimState19;

      return (_vimState19 = this.vimState).subscribe.apply(_vimState19, arguments);
    }
    // prettier-ignore
  }, {
    key: 'isMode',
    value: function isMode() {
      var _vimState20;

      return (_vimState20 = this.vimState).isMode.apply(_vimState20, arguments);
    }
    // prettier-ignore
  }, {
    key: 'getBlockwiseSelections',
    value: function getBlockwiseSelections() {
      var _vimState21;

      return (_vimState21 = this.vimState).getBlockwiseSelections.apply(_vimState21, arguments);
    }
    // prettier-ignore
  }, {
    key: 'getLastBlockwiseSelection',
    value: function getLastBlockwiseSelection() {
      var _vimState22;

      return (_vimState22 = this.vimState).getLastBlockwiseSelection.apply(_vimState22, arguments);
    }
    // prettier-ignore
  }, {
    key: 'addToClassList',
    value: function addToClassList() {
      var _vimState23;

      return (_vimState23 = this.vimState).addToClassList.apply(_vimState23, arguments);
    }
    // prettier-ignore
  }, {
    key: 'getConfig',
    value: function getConfig() {
      var _vimState24;

      return (_vimState24 = this.vimState).getConfig.apply(_vimState24, arguments);
    }
    // prettier-ignore

    // Wrapper for this.utils
    // ===========================================================================
  }, {
    key: 'getVimEofBufferPosition',
    value: function getVimEofBufferPosition() {
      return this.utils.getVimEofBufferPosition(this.editor);
    }
    // prettier-ignore
  }, {
    key: 'getVimLastBufferRow',
    value: function getVimLastBufferRow() {
      return this.utils.getVimLastBufferRow(this.editor);
    }
    // prettier-ignore
  }, {
    key: 'getVimLastScreenRow',
    value: function getVimLastScreenRow() {
      return this.utils.getVimLastScreenRow(this.editor);
    }
    // prettier-ignore
  }, {
    key: 'getValidVimBufferRow',
    value: function getValidVimBufferRow(row) {
      return this.utils.getValidVimBufferRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: 'getValidVimScreenRow',
    value: function getValidVimScreenRow(row) {
      return this.utils.getValidVimScreenRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: 'getWordBufferRangeAndKindAtBufferPosition',
    value: function getWordBufferRangeAndKindAtBufferPosition() {
      var _utils;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_utils = this.utils).getWordBufferRangeAndKindAtBufferPosition.apply(_utils, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getFirstCharacterPositionForBufferRow',
    value: function getFirstCharacterPositionForBufferRow(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    }
    // prettier-ignore
  }, {
    key: 'getBufferRangeForRowRange',
    value: function getBufferRangeForRowRange(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    }
    // prettier-ignore
  }, {
    key: 'scanEditor',
    value: function scanEditor() {
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditor.apply(_utils2, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'findInEditor',
    value: function findInEditor() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).findInEditor.apply(_utils3, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'findPoint',
    value: function findPoint() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).findPoint.apply(_utils4, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'trimBufferRange',
    value: function trimBufferRange() {
      var _utils5;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (_utils5 = this.utils).trimBufferRange.apply(_utils5, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'isEmptyRow',
    value: function isEmptyRow() {
      var _utils6;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return (_utils6 = this.utils).isEmptyRow.apply(_utils6, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getFoldStartRowForRow',
    value: function getFoldStartRowForRow() {
      var _utils7;

      for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return (_utils7 = this.utils).getFoldStartRowForRow.apply(_utils7, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getFoldEndRowForRow',
    value: function getFoldEndRowForRow() {
      var _utils8;

      for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      return (_utils8 = this.utils).getFoldEndRowForRow.apply(_utils8, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getBufferRows',
    value: function getBufferRows() {
      var _utils9;

      for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }

      return (_utils9 = this.utils).getRows.apply(_utils9, [this.editor, 'buffer'].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'getScreenRows',
    value: function getScreenRows() {
      var _utils10;

      for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      return (_utils10 = this.utils).getRows.apply(_utils10, [this.editor, 'screen'].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'replaceTextInRangeViaDiff',
    value: function replaceTextInRangeViaDiff() {
      var _utils11;

      for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      return (_utils11 = this.utils).replaceTextInRangeViaDiff.apply(_utils11, [this.editor].concat(args));
    }
    // prettier-ignore
  }, {
    key: 'mode',
    get: function get() {
      return this.vimState.mode;
    }
    // prettier-ignore
  }, {
    key: 'submode',
    get: function get() {
      return this.vimState.submode;
    }
    // prettier-ignore
  }, {
    key: 'swrap',
    get: function get() {
      return this.vimState.swrap;
    }
    // prettier-ignore
  }, {
    key: 'utils',
    get: function get() {
      return this.vimState.utils;
    }
    // prettier-ignore
  }, {
    key: 'editor',
    get: function get() {
      return this.vimState.editor;
    }
    // prettier-ignore
  }, {
    key: 'editorElement',
    get: function get() {
      return this.vimState.editorElement;
    }
    // prettier-ignore
  }, {
    key: 'globalState',
    get: function get() {
      return this.vimState.globalState;
    }
    // prettier-ignore
  }, {
    key: 'mutationManager',
    get: function get() {
      return this.vimState.mutationManager;
    }
    // prettier-ignore
  }, {
    key: 'occurrenceManager',
    get: function get() {
      return this.vimState.occurrenceManager;
    }
    // prettier-ignore
  }, {
    key: 'persistentSelection',
    get: function get() {
      return this.vimState.persistentSelection;
    }
    // prettier-ignore
  }, {
    key: '_',
    get: function get() {
      return this.vimState._;
    }
    // prettier-ignore
  }], [{
    key: 'isCommand',
    value: function isCommand() {
      return this.hasOwnProperty('command') ? this.command : true;
    }
  }, {
    key: 'getClass',
    value: function getClass(name) {
      if (!this.classByName.has(name)) {
        if (!FILE_TABLE) {
          (function () {
            FILE_TABLE = {};
            var namesByFile = require('./json/file-table.json');
            // convert namesByFile to fileByName(= FILE_TABLE)
            Object.keys(namesByFile).forEach(function (file) {
              return namesByFile[file].forEach(function (name) {
                return FILE_TABLE[name] = file;
              });
            });
          })();
        }
        Object.values(require(FILE_TABLE[name])).forEach(function (klass) {
          return klass.register();
        });

        if (atom.inDevMode() && settings.get('debug')) {
          console.log('lazy-require: ' + FILE_TABLE[name] + ' for ' + name);
        }
      }

      var klass = this.classByName.get(name);
      if (!klass) {
        throw new Error('class \'' + name + '\' not found');
      }
      return klass;
    }
  }, {
    key: 'getInstance',
    value: function getInstance(vimState, klass, properties) {
      klass = typeof klass === 'function' ? klass : Base.getClass(klass);
      var object = new klass(vimState); // eslint-disable-line new-cap
      if (properties) Object.assign(object, properties);
      object.initialize();
      return object;
    }

    // Don't remove this. Public API to register operations to classTable
    // This can be used from vmp-plugin such as vmp-ex-mode.
  }, {
    key: 'register',
    value: function register() {
      if (this.classByName.has(this.name)) {
        console.warn('Duplicate constructor ' + this.name);
      }
      this.classByName.set(this.name, this);
    }
  }, {
    key: 'getCommandName',
    value: function getCommandName() {
      return this.commandPrefix + ':' + this.getCommandNameWithoutPrefix();
    }
  }, {
    key: 'getCommandNameWithoutPrefix',
    value: function getCommandNameWithoutPrefix() {
      return dasherize(this.name);
    }
  }, {
    key: 'registerCommand',
    value: function registerCommand() {
      var _this7 = this;

      return VimState.registerCommandFromSpec(this.name, {
        scope: this.commandScope,
        prefix: this.commandPrefix,
        getClass: function getClass() {
          return _this7;
        }
      });
    }
  }, {
    key: 'getKindForCommandName',
    value: function getKindForCommandName(command) {
      var commandWithoutPrefix = command.replace(/^vim-mode-plus:/, '');
      var commandClassName = classify(commandWithoutPrefix);
      if (this.classByName.has(commandClassName)) {
        return this.classByName.get(commandClassName).operationKind;
      }
    }
  }, {
    key: '_',
    get: function get() {
      return VimState._;
    }
  }]);

  return Base;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7OztBQUVYLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUN0QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7O0FBRXZDLElBQUksVUFBVSxZQUFBLENBQUE7O0FBRWQsSUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLENBQUcsQ0FBQztTQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsVUFBQSxDQUFDO1dBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtHQUFBLENBQUM7Q0FBQSxDQUFBO0FBQ2hHLElBQU0sU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFHLENBQUM7U0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxVQUFBLENBQUM7V0FBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRTtHQUFBLENBQUM7Q0FBQSxDQUFBOztBQUV0RyxNQUFNLENBQUMsT0FBTztlQUFTLElBQUk7O1NBV2hCLGVBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFBO0tBQzdCOzs7V0Fab0IsSUFBSSxHQUFHLEVBQUU7Ozs7V0FDUCxlQUFlOzs7O1dBQ2hCLGtCQUFrQjs7OztXQUNqQixJQUFJOzs7O0FBV2YsV0FmUyxJQUFJLENBZVosUUFBUSxFQUFFOzBCQWZGLElBQUk7O1NBTXpCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEs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QUcsR0FBRyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQTtLQUNyRTs7O1dBRWtDLHVDQUFHO0FBQ3BDLGFBQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUM1Qjs7O1dBRXNCLDJCQUFHOzs7QUFDeEIsYUFBTyxRQUFRLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtBQUNqRCxhQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVk7QUFDeEIsY0FBTSxFQUFFLElBQUksQ0FBQyxhQUFhO0FBQzFCLGdCQUFRLEVBQUU7O1NBQVU7T0FDckIsQ0FBQyxDQUFBO0tBQ0g7OztXQUU0QiwrQkFBQyxPQUFPLEVBQUU7QUFDckMsVUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ25FLFVBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDdkQsVUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO0FBQzFDLGVBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxhQUFhLENBQUE7T0FDNUQ7S0FDRjs7O1NBb0JZLGVBQUc7QUFBRSxhQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUE7S0FBRTs7O1NBL1FoQixJQUFJO0lBOFQxQixDQUFBIiwiZmlsZSI6Ii9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHNldHRpbmdzID0gcmVxdWlyZSgnLi9zZXR0aW5ncycpXG5jb25zdCBWaW1TdGF0ZSA9IHJlcXVpcmUoJy4vdmltLXN0YXRlJylcblxubGV0IEZJTEVfVEFCTEVcblxuY29uc3QgY2xhc3NpZnkgPSBzID0+IHNbMF0udG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSkucmVwbGFjZSgvLShcXHcpL2csIG0gPT4gbVsxXS50b1VwcGVyQ2FzZSgpKVxuY29uc3QgZGFzaGVyaXplID0gcyA9PiAoc1swXS50b0xvd2VyQ2FzZSgpICsgcy5zbGljZSgxKSkucmVwbGFjZSgvW0EtWl0vZywgbSA9PiAnLScgKyBtLnRvTG93ZXJDYXNlKCkpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmFzZSB7XG4gIHN0YXRpYyBjbGFzc0J5TmFtZSA9IG5ldyBNYXAoKVxuICBzdGF0aWMgY29tbWFuZFByZWZpeCA9ICd2aW0tbW9kZS1wbHVzJ1xuICBzdGF0aWMgY29tbWFuZFNjb3BlID0gJ2F0b20tdGV4dC1lZGl0b3InXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gbnVsbFxuXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuICByZXBlYXRlZCA9IGZhbHNlXG4gIGNvdW50ID0gbnVsbFxuICBkZWZhdWx0Q291bnQgPSAxXG5cbiAgZ2V0IG5hbWUgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWVcbiAgfVxuXG4gIGNvbnN0cnVjdG9yICh2aW1TdGF0ZSkge1xuICAgIHRoaXMudmltU3RhdGUgPSB2aW1TdGF0ZVxuICB9XG5cbiAgaW5pdGlhbGl6ZSAoKSB7fVxuXG4gIC8vIENhbGxlZCBib3RoIG9uIGNhbmNlbCBhbmQgc3VjY2Vzc1xuICByZXNldFN0YXRlICgpIHt9XG5cbiAgLy8gT3BlcmF0aW9uU3RhY2sgcG9zdHBvbmUgZXhlY3V0aW9uIHVudGlsbCBpc1JlYWR5KCkgZ2V0IHRydWUsIG92ZXJyaWRkZW4gb24gc3ViY2xhc3MuXG4gIGlzUmVhZHkgKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyBWaXN1YWxNb2RlU2VsZWN0IGlzIGFub3JtYWwsIHNpbmNlIGl0J3MgYXV0byBjb21wbGVtZW50ZWQgaW4gdmlzaWFsIG1vZGUuXG4gIC8vIEluIG90aGVyIHdvcmQsIG5vcm1hbC1vcGVyYXRvciBpcyBleHBsaWNpdCB3aGVyZWFzIGFub3JtYWwtb3BlcmF0b3IgaXMgaW1wbGljaXQuXG4gIGlzVGFyZ2V0T2ZOb3JtYWxPcGVyYXRvciAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3BlcmF0b3IgJiYgdGhpcy5vcGVyYXRvci5uYW1lICE9PSAnVmlzdWFsTW9kZVNlbGVjdCdcbiAgfVxuXG4gIGhhc0NvdW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy52aW1TdGF0ZS5oYXNDb3VudCgpXG4gIH1cblxuICBnZXRDb3VudCAoKSB7XG4gICAgaWYgKHRoaXMuY291bnQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5jb3VudCA9IHRoaXMuaGFzQ291bnQoKSA/IHRoaXMudmltU3RhdGUuZ2V0Q291bnQoKSA6IHRoaXMuZGVmYXVsdENvdW50XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50XG4gIH1cblxuICAvLyBJZGVudGljYWwgdG8gdXRpbHMubGltaXROdW1iZXIuIENvcHkgaGVyZSB0byBwb3N0cG9uZSBmdWxsIHJlcXVpcmUgb2YgdXRpbHMuXG4gIGxpbWl0TnVtYmVyIChudW1iZXIsIHttYXgsIG1pbn0gPSB7fSkge1xuICAgIGlmIChtYXggIT0gbnVsbCkgbnVtYmVyID0gTWF0aC5taW4obnVtYmVyLCBtYXgpXG4gICAgaWYgKG1pbiAhPSBudWxsKSBudW1iZXIgPSBNYXRoLm1heChudW1iZXIsIG1pbilcbiAgICByZXR1cm4gbnVtYmVyXG4gIH1cblxuICByZXNldENvdW50ICgpIHtcbiAgICB0aGlzLmNvdW50ID0gbnVsbFxuICB9XG5cbiAgY291bnRUaW1lcyAobGFzdCwgZm4pIHtcbiAgICBpZiAobGFzdCA8IDEpIHJldHVyblxuXG4gICAgbGV0IHN0b3BwZWQgPSBmYWxzZVxuICAgIGNvbnN0IHN0b3AgPSAoKSA9PiAoc3RvcHBlZCA9IHRydWUpXG4gICAgZm9yIChsZXQgY291bnQgPSAxOyBjb3VudCA8PSBsYXN0OyBjb3VudCsrKSB7XG4gICAgICBmbih7Y291bnQsIGlzRmluYWw6IGNvdW50ID09PSBsYXN0LCBzdG9wfSlcbiAgICAgIGlmIChzdG9wcGVkKSBicmVha1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlTW9kZSAobW9kZSwgc3VibW9kZSkge1xuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShtb2RlLCBzdWJtb2RlKVxuICAgIH0pXG4gIH1cblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSAobW9kZSwgc3VibW9kZSkge1xuICAgIGlmICghdGhpcy52aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdGFuY2UgKG5hbWUsIHByb3BlcnRpZXMpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRJbnN0YW5jZSh0aGlzLnZpbVN0YXRlLCBuYW1lLCBwcm9wZXJ0aWVzKVxuICB9XG5cbiAgY2FuY2VsT3BlcmF0aW9uICgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCh0aGlzKVxuICB9XG5cbiAgcHJvY2Vzc09wZXJhdGlvbiAoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcbiAgfVxuXG4gIGZvY3VzSW5wdXQgKG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghb3B0aW9ucy5vbkNvbmZpcm0pIHtcbiAgICAgIG9wdGlvbnMub25Db25maXJtID0gaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLm9uQ2FuY2VsKSBvcHRpb25zLm9uQ2FuY2VsID0gKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIGlmICghb3B0aW9ucy5vbkNoYW5nZSkgb3B0aW9ucy5vbkNoYW5nZSA9IGlucHV0ID0+IHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KG9wdGlvbnMpXG4gIH1cblxuICAvLyBSZXR1cm4gcHJvbWlzZSB3aGljaCByZXNvbHZlIHdpdGggaW5wdXQgY2hhciBvciBgdW5kZWZpbmVkYCB3aGVuIGNhbmNlbGxlZC5cbiAgZm9jdXNJbnB1dFByb21pc2VkIChvcHRpb25zID0ge30pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtoaWRlQ3Vyc29yOiB0cnVlLCBvbkNoYW5nZTogaW5wdXQgPT4gdGhpcy52aW1TdGF0ZS5ob3Zlci5zZXQoaW5wdXQpfVxuICAgICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KE9iamVjdC5hc3NpZ24oZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMsIHtvbkNvbmZpcm06IHJlc29sdmUsIG9uQ2FuY2VsOiByZXNvbHZlfSkpXG4gICAgfSlcbiAgfVxuXG4gIHJlYWRDaGFyICgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnJlYWRDaGFyKHtcbiAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH0sXG4gICAgICBvbkNhbmNlbDogKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIH0pXG4gIH1cblxuICAvLyBSZXR1cm4gcHJvbWlzZSB3aGljaCByZXNvbHZlIHdpdGggcmVhZCBjaGFyIG9yIGB1bmRlZmluZWRgIHdoZW4gY2FuY2VsbGVkLlxuICByZWFkQ2hhclByb21pc2VkICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlYWRDaGFyKHtvbkNvbmZpcm06IHJlc29sdmUsIG9uQ2FuY2VsOiByZXNvbHZlfSlcbiAgICB9KVxuICB9XG5cbiAgaW5zdGFuY2VvZiAoa2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBCYXNlLmdldENsYXNzKGtsYXNzTmFtZSlcbiAgfVxuXG4gIGlzT3BlcmF0b3IgKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gJ29wZXJhdG9yJ1xuICB9XG5cbiAgaXNNb3Rpb24gKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gJ21vdGlvbidcbiAgfVxuXG4gIGlzVGV4dE9iamVjdCAoKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSAndGV4dC1vYmplY3QnXG4gIH1cblxuICBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IodGhpcy5lZGl0b3IuZ2V0TGFzdEN1cnNvcigpKVxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zICgpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpLm1hcChjdXJzb3IgPT4gdGhpcy5nZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpKVxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zT3JkZXJlZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuc29ydFBvaW50cyh0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpKVxuICB9XG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IgKGN1cnNvcikge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09ICd2aXN1YWwnID8gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihjdXJzb3Iuc2VsZWN0aW9uKSA6IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIH1cblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIHtmcm9tOiBbJ3Byb3BlcnR5JywgJ3NlbGVjdGlvbiddfSlcbiAgfVxuXG4gIGdldE9wZXJhdGlvblR5cGVDaGFyICgpIHtcbiAgICByZXR1cm4ge29wZXJhdG9yOiAnTycsICd0ZXh0LW9iamVjdCc6ICdUJywgbW90aW9uOiAnTScsICdtaXNjLWNvbW1hbmQnOiAnWCd9W3RoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZF1cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICBjb25zdCBiYXNlID0gYCR7dGhpcy5uYW1lfTwke3RoaXMuZ2V0T3BlcmF0aW9uVHlwZUNoYXIoKX0+YFxuICAgIHJldHVybiB0aGlzLnRhcmdldCA/IGAke2Jhc2V9e3RhcmdldCA9ICR7dGhpcy50YXJnZXQudG9TdHJpbmcoKX19YCA6IGJhc2VcbiAgfVxuXG4gIGdldENvbW1hbmROYW1lICgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXggKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gIH1cblxuICBzdGF0aWMgaXNDb21tYW5kICgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNPd25Qcm9wZXJ0eSgnY29tbWFuZCcpID8gdGhpcy5jb21tYW5kIDogdHJ1ZVxuICB9XG5cbiAgc3RhdGljIGdldENsYXNzIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzLmNsYXNzQnlOYW1lLmhhcyhuYW1lKSkge1xuICAgICAgaWYgKCFGSUxFX1RBQkxFKSB7XG4gICAgICAgIEZJTEVfVEFCTEUgPSB7fVxuICAgICAgICBjb25zdCBuYW1lc0J5RmlsZSA9IHJlcXVpcmUoJy4vanNvbi9maWxlLXRhYmxlLmpzb24nKVxuICAgICAgICAvLyBjb252ZXJ0IG5hbWVzQnlGaWxlIHRvIGZpbGVCeU5hbWUoPSBGSUxFX1RBQkxFKVxuICAgICAgICBPYmplY3Qua2V5cyhuYW1lc0J5RmlsZSkuZm9yRWFjaChmaWxlID0+IG5hbWVzQnlGaWxlW2ZpbGVdLmZvckVhY2gobmFtZSA9PiAoRklMRV9UQUJMRVtuYW1lXSA9IGZpbGUpKSlcbiAgICAgIH1cbiAgICAgIE9iamVjdC52YWx1ZXMocmVxdWlyZShGSUxFX1RBQkxFW25hbWVdKSkuZm9yRWFjaChrbGFzcyA9PiBrbGFzcy5yZWdpc3RlcigpKVxuXG4gICAgICBpZiAoYXRvbS5pbkRldk1vZGUoKSAmJiBzZXR0aW5ncy5nZXQoJ2RlYnVnJykpIHtcbiAgICAgICAgY29uc29sZS5sb2coYGxhenktcmVxdWlyZTogJHtGSUxFX1RBQkxFW25hbWVdfSBmb3IgJHtuYW1lfWApXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qga2xhc3MgPSB0aGlzLmNsYXNzQnlOYW1lLmdldChuYW1lKVxuICAgIGlmICgha2xhc3MpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgY2xhc3MgJyR7bmFtZX0nIG5vdCBmb3VuZGApXG4gICAgfVxuICAgIHJldHVybiBrbGFzc1xuICB9XG5cbiAgc3RhdGljIGdldEluc3RhbmNlICh2aW1TdGF0ZSwga2xhc3MsIHByb3BlcnRpZXMpIHtcbiAgICBrbGFzcyA9IHR5cGVvZiBrbGFzcyA9PT0gJ2Z1bmN0aW9uJyA/IGtsYXNzIDogQmFzZS5nZXRDbGFzcyhrbGFzcylcbiAgICBjb25zdCBvYmplY3QgPSBuZXcga2xhc3ModmltU3RhdGUpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxuICAgIGlmIChwcm9wZXJ0aWVzKSBPYmplY3QuYXNzaWduKG9iamVjdCwgcHJvcGVydGllcylcbiAgICBvYmplY3QuaW5pdGlhbGl6ZSgpXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMuIFB1YmxpYyBBUEkgdG8gcmVnaXN0ZXIgb3BlcmF0aW9ucyB0byBjbGFzc1RhYmxlXG4gIC8vIFRoaXMgY2FuIGJlIHVzZWQgZnJvbSB2bXAtcGx1Z2luIHN1Y2ggYXMgdm1wLWV4LW1vZGUuXG4gIHN0YXRpYyByZWdpc3RlciAoKSB7XG4gICAgaWYgKHRoaXMuY2xhc3NCeU5hbWUuaGFzKHRoaXMubmFtZSkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgRHVwbGljYXRlIGNvbnN0cnVjdG9yICR7dGhpcy5uYW1lfWApXG4gICAgfVxuICAgIHRoaXMuY2xhc3NCeU5hbWUuc2V0KHRoaXMubmFtZSwgdGhpcylcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZFByZWZpeCArICc6JyArIHRoaXMuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KClcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXggKCkge1xuICAgIHJldHVybiBkYXNoZXJpemUodGhpcy5uYW1lKVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZCAoKSB7XG4gICAgcmV0dXJuIFZpbVN0YXRlLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKHRoaXMubmFtZSwge1xuICAgICAgc2NvcGU6IHRoaXMuY29tbWFuZFNjb3BlLFxuICAgICAgcHJlZml4OiB0aGlzLmNvbW1hbmRQcmVmaXgsXG4gICAgICBnZXRDbGFzczogKCkgPT4gdGhpc1xuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgZ2V0S2luZEZvckNvbW1hbmROYW1lIChjb21tYW5kKSB7XG4gICAgY29uc3QgY29tbWFuZFdpdGhvdXRQcmVmaXggPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sICcnKVxuICAgIGNvbnN0IGNvbW1hbmRDbGFzc05hbWUgPSBjbGFzc2lmeShjb21tYW5kV2l0aG91dFByZWZpeClcbiAgICBpZiAodGhpcy5jbGFzc0J5TmFtZS5oYXMoY29tbWFuZENsYXNzTmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsYXNzQnlOYW1lLmdldChjb21tYW5kQ2xhc3NOYW1lKS5vcGVyYXRpb25LaW5kXG4gICAgfVxuICB9XG5cbiAgZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbiAoa2luZCkge1xuICAgIGNvbnN0IGJhc2UgPSAnc21vb3RoU2Nyb2xsT24nICsga2luZFxuICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhiYXNlKSA/IHRoaXMuZ2V0Q29uZmlnKGJhc2UgKyAnRHVyYXRpb24nKSA6IDBcbiAgfVxuXG4gIC8vIFByb3h5IHByb3BwZXJ0aWVzIGFuZCBtZXRob2RzXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBnZXQgbW9kZSAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm1vZGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHN1Ym1vZGUgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zdWJtb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzd3JhcCAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN3cmFwIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCB1dGlscyAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnV0aWxzIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3IgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3IgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGVkaXRvckVsZW1lbnQgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3JFbGVtZW50IH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBnbG9iYWxTdGF0ZSAoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdsb2JhbFN0YXRlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBtdXRhdGlvbk1hbmFnZXIgKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IG9jY3VycmVuY2VNYW5hZ2VyICgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHBlcnNpc3RlbnRTZWxlY3Rpb24gKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBfICgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuXyB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzdGF0aWMgZ2V0IF8gKCkgeyByZXR1cm4gVmltU3RhdGUuXyB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIG9uRGlkQ2hhbmdlU2VhcmNoICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2hhbmdlU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ29uZmlybVNlYXJjaCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDYW5jZWxTZWFyY2ggKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb21tYW5kU2VhcmNoICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ29tbWFuZFNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFNldFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNldFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2V0VGFyZ2V0ICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsU2VsZWN0VGFyZ2V0ICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0V2lsbFNlbGVjdFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFNlbGVjdFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0ICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGYWlsU2VsZWN0VGFyZ2V0ICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxGaW5pc2hNdXRhdGlvbiAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0V2lsbEZpbmlzaE11dGF0aW9uICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGaW5pc2hNdXRhdGlvbiAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbiAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGaW5pc2hPcGVyYXRpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGaW5pc2hPcGVyYXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzdWJzY3JpYmUgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3Vic2NyaWJlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzTW9kZSAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5pc01vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBhZGRUb0NsYXNzTGlzdCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5hZGRUb0NsYXNzTGlzdCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRDb25maWcgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0Q29uZmlnKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG5cbiAgLy8gV3JhcHBlciBmb3IgdGhpcy51dGlsc1xuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24gKCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvcikgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0VmltTGFzdEJ1ZmZlclJvdyAoKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZpbUxhc3RCdWZmZXJSb3codGhpcy5lZGl0b3IpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3cgKCkgeyByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1MYXN0U2NyZWVuUm93KHRoaXMuZWRpdG9yKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRWYWxpZFZpbUJ1ZmZlclJvdyAocm93KSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldFZhbGlkVmltU2NyZWVuUm93IChyb3cpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3codGhpcy5lZGl0b3IsIHJvdykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cgKHJvdykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UgKHJvd1JhbmdlKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UodGhpcy5lZGl0b3IsIHJvd1JhbmdlKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzY2FuRWRpdG9yICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3IodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGZpbmRJbkVkaXRvciAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5maW5kSW5FZGl0b3IodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGZpbmRQb2ludCAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5maW5kUG9pbnQodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIHRyaW1CdWZmZXJSYW5nZSAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy50cmltQnVmZmVyUmFuZ2UodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGlzRW1wdHlSb3cgKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudXRpbHMuaXNFbXB0eVJvdyh0aGlzLmVkaXRvciwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93ICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldEZvbGRTdGFydFJvd0ZvclJvdyh0aGlzLmVkaXRvciwgLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Rm9sZEVuZFJvd0ZvclJvdyAoLi4uYXJncykgeyByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkRW5kUm93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRCdWZmZXJSb3dzICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFJvd3ModGhpcy5lZGl0b3IsICdidWZmZXInLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRTY3JlZW5Sb3dzICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLmdldFJvd3ModGhpcy5lZGl0b3IsICdzY3JlZW4nLCAuLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICByZXBsYWNlVGV4dEluUmFuZ2VWaWFEaWZmICguLi5hcmdzKSB7IHJldHVybiB0aGlzLnV0aWxzLnJlcGxhY2VUZXh0SW5SYW5nZVZpYURpZmYodGhpcy5lZGl0b3IsIC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG59XG4iXX0=