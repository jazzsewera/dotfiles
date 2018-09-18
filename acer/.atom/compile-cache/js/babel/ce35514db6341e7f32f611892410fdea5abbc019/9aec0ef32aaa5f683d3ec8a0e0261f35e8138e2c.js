'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom');

var Range = _require.Range;

var Base = require('./base');

var Operator = (function (_Base) {
  _inherits(Operator, _Base);

  function Operator() {
    _classCallCheck(this, Operator);

    _get(Object.getPrototypeOf(Operator.prototype), 'constructor', this).apply(this, arguments);

    this.recordable = true;
    this.wise = null;
    this.target = null;
    this.occurrence = false;
    this.occurrenceType = 'base';
    this.flashTarget = true;
    this.flashCheckpoint = 'did-finish';
    this.flashType = 'operator';
    this.flashTypeForOccurrence = 'operator-occurrence';
    this.trackChange = false;
    this.patternForOccurrence = null;
    this.stayAtSamePosition = null;
    this.stayOptionName = null;
    this.stayByMarker = false;
    this.restorePositions = true;
    this.setToFirstCharacterOnLinewise = false;
    this.acceptPresetOccurrence = true;
    this.acceptPersistentSelection = true;
    this.bufferCheckpointByPurpose = null;
    this.targetSelected = null;
    this.input = null;
    this.readInputAfterSelect = false;
    this.bufferCheckpointByPurpose = {};
  }

  _createClass(Operator, [{
    key: 'isReady',
    value: function isReady() {
      return this.target && this.target.isReady();
    }

    // Called when operation finished
    // This is essentially to reset state for `.` repeat.
  }, {
    key: 'resetState',
    value: function resetState() {
      this.targetSelected = null;
      this.occurrenceSelected = false;
    }

    // Two checkpoint for different purpose
    // - one for undo
    // - one for preserve last inserted text
  }, {
    key: 'createBufferCheckpoint',
    value: function createBufferCheckpoint(purpose) {
      this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    }
  }, {
    key: 'getBufferCheckpoint',
    value: function getBufferCheckpoint(purpose) {
      return this.bufferCheckpointByPurpose[purpose];
    }
  }, {
    key: 'groupChangesSinceBufferCheckpoint',
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      if (checkpoint) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        delete this.bufferCheckpointByPurpose[purpose];
      }
    }
  }, {
    key: 'setMarkForChange',
    value: function setMarkForChange(range) {
      this.vimState.mark.set('[', range.start);
      this.vimState.mark.set(']', range.end);
    }
  }, {
    key: 'needFlash',
    value: function needFlash() {
      return this.flashTarget && this.getConfig('flashOnOperate') && !this.getConfig('flashOnOperateBlacklist').includes(this.name) && (this.mode !== 'visual' || this.submode !== this.target.wise) // e.g. Y in vC
      ;
    }
  }, {
    key: 'flashIfNecessary',
    value: function flashIfNecessary(ranges) {
      if (this.needFlash()) {
        this.vimState.flash(ranges, { type: this.getFlashType() });
      }
    }
  }, {
    key: 'flashChangeIfNecessary',
    value: function flashChangeIfNecessary() {
      var _this = this;

      if (this.needFlash()) {
        this.onDidFinishOperation(function () {
          var ranges = _this.mutationManager.getSelectedBufferRangesForCheckpoint(_this.flashCheckpoint);
          _this.vimState.flash(ranges, { type: _this.getFlashType() });
        });
      }
    }
  }, {
    key: 'getFlashType',
    value: function getFlashType() {
      return this.occurrenceSelected ? this.flashTypeForOccurrence : this.flashType;
    }
  }, {
    key: 'trackChangeIfNecessary',
    value: function trackChangeIfNecessary() {
      var _this2 = this;

      if (!this.trackChange) return;
      this.onDidFinishOperation(function () {
        var range = _this2.mutationManager.getMutatedBufferRangeForSelection(_this2.editor.getLastSelection());
        if (range) _this2.setMarkForChange(range);
      });
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this.subscribeResetOccurrencePatternIfNeeded();

      // When preset-occurrence was exists, operate on occurrence-wise
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.occurrence = true;
      }

      // [FIXME] ORDER-MATTER
      // To pick cursor-word to find occurrence base pattern.
      // This has to be done BEFORE converting persistent-selection into real-selection.
      // Since when persistent-selection is actually selected, it change cursor position.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        var regex = this.patternForOccurrence || this.getPatternForOccurrenceType(this.occurrenceType);
        this.occurrenceManager.addPattern(regex);
      }

      // This change cursor position.
      if (this.selectPersistentSelectionIfNecessary()) {
        // [FIXME] selection-wise is not synched if it already visual-mode
        if (this.mode !== 'visual') {
          this.vimState.activate('visual', this.swrap.detectWise(this.editor));
        }
      }

      if (this.mode === 'visual') {
        this.target = 'CurrentSelection';
      }
      if (typeof this.target === 'string') {
        this.setTarget(this.getInstance(this.target));
      }

      _get(Object.getPrototypeOf(Operator.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'subscribeResetOccurrencePatternIfNeeded',
    value: function subscribeResetOccurrencePatternIfNeeded() {
      var _this3 = this;

      // [CAUTION]
      // This method has to be called in PROPER timing.
      // If occurrence is true but no preset-occurrence
      // Treat that `occurrence` is BOUNDED to operator itself, so cleanp at finished.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.onDidResetOperationStack(function () {
          return _this3.occurrenceManager.resetPatterns();
        });
      }
    }
  }, {
    key: 'setModifier',
    value: function setModifier(_ref) {
      var _this4 = this;

      var wise = _ref.wise;
      var occurrence = _ref.occurrence;
      var occurrenceType = _ref.occurrenceType;

      if (wise) {
        this.wise = wise;
      } else if (occurrence) {
        this.occurrence = occurrence;
        this.occurrenceType = occurrenceType;
        // This is o modifier case(e.g. `c o p`, `d O f`)
        // We RESET existing occurence-marker when `o` or `O` modifier is typed by user.
        var regex = this.getPatternForOccurrenceType(occurrenceType);
        this.occurrenceManager.addPattern(regex, { reset: true, occurrenceType: occurrenceType });
        this.onDidResetOperationStack(function () {
          return _this4.occurrenceManager.resetPatterns();
        });
      }
    }

    // return true/false to indicate success
  }, {
    key: 'selectPersistentSelectionIfNecessary',
    value: function selectPersistentSelectionIfNecessary() {
      var canSelect = this.acceptPersistentSelection && this.getConfig('autoSelectPersistentSelectionOnOperate') && !this.persistentSelection.isEmpty();

      if (canSelect) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        this.swrap.saveProperties(this.editor);
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'getPatternForOccurrenceType',
    value: function getPatternForOccurrenceType(occurrenceType) {
      if (occurrenceType === 'base') {
        return this.utils.getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      } else if (occurrenceType === 'subword') {
        return this.utils.getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      }
    }

    // target is TextObject or Motion to operate on.
  }, {
    key: 'setTarget',
    value: function setTarget(target) {
      this.target = target;
      this.target.operator = this;
      this.emitDidSetTarget(this);
    }
  }, {
    key: 'setTextToRegister',
    value: function setTextToRegister(text, selection) {
      if (this.vimState.register.isUnnamed() && this.isBlackholeRegisteredOperator()) {
        return;
      }

      var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
      if (wise === 'linewise' && !text.endsWith('\n')) {
        text += '\n';
      }

      if (text) {
        this.vimState.register.set(null, { text: text, selection: selection });

        if (this.vimState.register.isUnnamed()) {
          if (this['instanceof']('Delete') || this['instanceof']('Change')) {
            if (!this.needSaveToNumberedRegister(this.target) && this.utils.isSingleLineText(text)) {
              this.vimState.register.set('-', { text: text, selection: selection }); // small-change
            } else {
                this.vimState.register.set('1', { text: text, selection: selection });
              }
          } else if (this['instanceof']('Yank')) {
            this.vimState.register.set('0', { text: text, selection: selection });
          }
        }
      }
    }
  }, {
    key: 'isBlackholeRegisteredOperator',
    value: function isBlackholeRegisteredOperator() {
      var operators = this.getConfig('blackholeRegisteredOperators');
      var wildCardOperators = operators.filter(function (name) {
        return name.endsWith('*');
      });
      var commandName = this.getCommandNameWithoutPrefix();
      return wildCardOperators.some(function (name) {
        return new RegExp('^' + name.replace('*', '.*')).test(commandName);
      }) || operators.includes(commandName);
    }
  }, {
    key: 'needSaveToNumberedRegister',
    value: function needSaveToNumberedRegister(target) {
      // Used to determine what register to use on change and delete operation.
      // Following motion should save to 1-9 register regerdless of content is small or big.
      var goesToNumberedRegisterMotionNames = ['MoveToPair', // %
      'MoveToNextSentence', // (, )
      'Search', // /, ?, n, N
      'MoveToNextParagraph' // {, }
      ];
      return goesToNumberedRegisterMotionNames.some(function (name) {
        return target['instanceof'](name);
      });
    }
  }, {
    key: 'normalizeSelectionsIfNecessary',
    value: function normalizeSelectionsIfNecessary() {
      if (this.mode === 'visual' && this.target && this.target.isMotion()) {
        this.swrap.normalize(this.editor);
      }
    }
  }, {
    key: 'mutateSelections',
    value: function mutateSelections() {
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition()) {
        this.mutateSelection(selection);
      }
      this.mutationManager.setCheckpoint('did-finish');
      this.restoreCursorPositionsIfNecessary();
    }
  }, {
    key: 'preSelect',
    value: function preSelect() {
      this.normalizeSelectionsIfNecessary();
      this.createBufferCheckpoint('undo');
    }
  }, {
    key: 'postMutate',
    value: function postMutate() {
      this.groupChangesSinceBufferCheckpoint('undo');
      this.emitDidFinishMutation();

      // Even though we fail to select target and fail to mutate,
      // we have to return to normal-mode from operator-pending or visual
      this.activateMode('normal');
    }

    // Main
  }, {
    key: 'execute',
    value: function execute() {
      this.preSelect();

      if (this.readInputAfterSelect && !this.repeated) {
        return this.executeAsyncToReadInputAfterSelect();
      }

      if (this.selectTarget()) this.mutateSelections();
      this.postMutate();
    }
  }, {
    key: 'executeAsyncToReadInputAfterSelect',
    value: _asyncToGenerator(function* () {
      if (this.selectTarget()) {
        this.input = yield this.focusInputPromised(this.focusInputOptions);
        if (this.input == null) {
          if (this.mode !== 'visual') {
            this.editor.revertToCheckpoint(this.getBufferCheckpoint('undo'));
            this.activateMode('normal');
          }
          return;
        }
        this.mutateSelections();
      }
      this.postMutate();
    })

    // Return true unless all selection is empty.
  }, {
    key: 'selectTarget',
    value: function selectTarget() {
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({ stayByMarker: this.stayByMarker });

      if (this.target.isMotion() && this.mode === 'visual') this.target.wise = this.submode;
      if (this.wise != null) this.target.forceWise(this.wise);

      this.emitWillSelectTarget();

      // Allow cursor position adjustment 'on-will-select-target' hook.
      // so checkpoint comes AFTER @emitWillSelectTarget()
      this.mutationManager.setCheckpoint('will-select');

      // NOTE: When repeated, set occurrence-marker from pattern stored as state.
      if (this.repeated && this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, { occurrenceType: this.occurrenceType });
      }

      this.target.execute();

      this.mutationManager.setCheckpoint('did-select');
      if (this.occurrence) {
        if (!this.patternForOccurrence) {
          // Preserve occurrencePattern for . repeat.
          this.patternForOccurrence = this.occurrenceManager.buildPattern();
        }

        this.occurrenceWise = this.wise || 'characterwise';
        if (this.occurrenceManager.select(this.occurrenceWise)) {
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint('did-select-occurrence');
        }
      }

      this.targetSelected = this.vimState.haveSomeNonEmptySelection() || this.target.name === 'Empty';
      if (this.targetSelected) {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
      } else {
        this.emitDidFailSelectTarget();
      }

      return this.targetSelected;
    }
  }, {
    key: 'restoreCursorPositionsIfNecessary',
    value: function restoreCursorPositionsIfNecessary() {
      if (!this.restorePositions) return;

      var stay = this.stayAtSamePosition != null ? this.stayAtSamePosition : this.getConfig(this.stayOptionName) || this.occurrenceSelected && this.getConfig('stayOnOccurrence');
      var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
      var setToFirstCharacterOnLinewise = this.setToFirstCharacterOnLinewise;

      this.mutationManager.restoreCursorPositions({ stay: stay, wise: wise, setToFirstCharacterOnLinewise: setToFirstCharacterOnLinewise });
    }
  }], [{
    key: 'operationKind',
    value: 'operator',
    enumerable: true
  }, {
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return Operator;
})(Base);

var SelectBase = (function (_Operator) {
  _inherits(SelectBase, _Operator);

  function SelectBase() {
    _classCallCheck(this, SelectBase);

    _get(Object.getPrototypeOf(SelectBase.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.recordable = false;
  }

  _createClass(SelectBase, [{
    key: 'execute',
    value: function execute() {
      this.normalizeSelectionsIfNecessary();
      this.selectTarget();

      if (this.target.selectSucceeded) {
        if (this.target.isTextObject()) {
          this.editor.scrollToCursorPosition();
        }
        var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
        this.activateModeIfNecessary('visual', wise);
      } else {
        this.cancelOperation();
      }
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return SelectBase;
})(Operator);

var Select = (function (_SelectBase) {
  _inherits(Select, _SelectBase);

  function Select() {
    _classCallCheck(this, Select);

    _get(Object.getPrototypeOf(Select.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Select, [{
    key: 'execute',
    value: function execute() {
      this.swrap.saveProperties(this.editor);
      _get(Object.getPrototypeOf(Select.prototype), 'execute', this).call(this);
    }
  }]);

  return Select;
})(SelectBase);

var SelectLatestChange = (function (_SelectBase2) {
  _inherits(SelectLatestChange, _SelectBase2);

  function SelectLatestChange() {
    _classCallCheck(this, SelectLatestChange);

    _get(Object.getPrototypeOf(SelectLatestChange.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'ALatestChange';
  }

  return SelectLatestChange;
})(SelectBase);

var SelectPreviousSelection = (function (_SelectBase3) {
  _inherits(SelectPreviousSelection, _SelectBase3);

  function SelectPreviousSelection() {
    _classCallCheck(this, SelectPreviousSelection);

    _get(Object.getPrototypeOf(SelectPreviousSelection.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'PreviousSelection';
  }

  return SelectPreviousSelection;
})(SelectBase);

var SelectPersistentSelection = (function (_SelectBase4) {
  _inherits(SelectPersistentSelection, _SelectBase4);

  function SelectPersistentSelection() {
    _classCallCheck(this, SelectPersistentSelection);

    _get(Object.getPrototypeOf(SelectPersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'APersistentSelection';
    this.acceptPersistentSelection = false;
  }

  return SelectPersistentSelection;
})(SelectBase);

var SelectOccurrence = (function (_SelectBase5) {
  _inherits(SelectOccurrence, _SelectBase5);

  function SelectOccurrence() {
    _classCallCheck(this, SelectOccurrence);

    _get(Object.getPrototypeOf(SelectOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrence = true;
  }

  // VisualModeSelect: used in visual-mode
  // When text-object is invoked from normal or viusal-mode, operation would be
  //  => VisualModeSelect operator with target=text-object
  // When motion is invoked from visual-mode, operation would be
  //  => VisualModeSelect operator with target=motion)
  // ================================
  // VisualModeSelect is used in TWO situation.
  // - visual-mode operation
  //   - e.g: `v l`, `V j`, `v i p`...
  // - Directly invoke text-object from normal-mode
  //   - e.g: Invoke `Inner Paragraph` from command-palette.
  return SelectOccurrence;
})(SelectBase);

var VisualModeSelect = (function (_SelectBase6) {
  _inherits(VisualModeSelect, _SelectBase6);

  function VisualModeSelect() {
    _classCallCheck(this, VisualModeSelect);

    _get(Object.getPrototypeOf(VisualModeSelect.prototype), 'constructor', this).apply(this, arguments);

    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  // Persistent Selection
  // =========================

  _createClass(VisualModeSelect, null, [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return VisualModeSelect;
})(SelectBase);

var CreatePersistentSelection = (function (_Operator2) {
  _inherits(CreatePersistentSelection, _Operator2);

  function CreatePersistentSelection() {
    _classCallCheck(this, CreatePersistentSelection);

    _get(Object.getPrototypeOf(CreatePersistentSelection.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.stayAtSamePosition = true;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  _createClass(CreatePersistentSelection, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      this.persistentSelection.markBufferRange(selection.getBufferRange());
    }
  }]);

  return CreatePersistentSelection;
})(Operator);

var TogglePersistentSelection = (function (_CreatePersistentSelection) {
  _inherits(TogglePersistentSelection, _CreatePersistentSelection);

  function TogglePersistentSelection() {
    _classCallCheck(this, TogglePersistentSelection);

    _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), 'constructor', this).apply(this, arguments);
  }

  // Preset Occurrence
  // =========================

  _createClass(TogglePersistentSelection, [{
    key: 'initialize',
    value: function initialize() {
      if (this.mode === 'normal') {
        var point = this.editor.getCursorBufferPosition();
        var marker = this.persistentSelection.getMarkerAtPoint(point);
        if (marker) this.target = 'Empty';
      }
      _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var point = this.getCursorPositionForSelection(selection);
      var marker = this.persistentSelection.getMarkerAtPoint(point);
      if (marker) {
        marker.destroy();
      } else {
        _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), 'mutateSelection', this).call(this, selection);
      }
    }
  }]);

  return TogglePersistentSelection;
})(CreatePersistentSelection);

var TogglePresetOccurrence = (function (_Operator3) {
  _inherits(TogglePresetOccurrence, _Operator3);

  function TogglePresetOccurrence() {
    _classCallCheck(this, TogglePresetOccurrence);

    _get(Object.getPrototypeOf(TogglePresetOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.flashTarget = false;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
    this.occurrenceType = 'base';
  }

  _createClass(TogglePresetOccurrence, [{
    key: 'execute',
    value: function execute() {
      var marker = this.occurrenceManager.getMarkerAtPoint(this.getCursorBufferPosition());
      if (marker) {
        this.occurrenceManager.destroyMarkers([marker]);
      } else {
        var isNarrowed = this.vimState.isNarrowed();

        var regex = undefined;
        if (this.mode === 'visual' && !isNarrowed) {
          this.occurrenceType = 'base';
          regex = new RegExp(this._.escapeRegExp(this.editor.getSelectedText()), 'g');
        } else {
          regex = this.getPatternForOccurrenceType(this.occurrenceType);
        }

        this.occurrenceManager.addPattern(regex, { occurrenceType: this.occurrenceType });
        this.occurrenceManager.saveLastPattern(this.occurrenceType);

        if (!isNarrowed) this.activateMode('normal');
      }
    }
  }]);

  return TogglePresetOccurrence;
})(Operator);

var TogglePresetSubwordOccurrence = (function (_TogglePresetOccurrence) {
  _inherits(TogglePresetSubwordOccurrence, _TogglePresetOccurrence);

  function TogglePresetSubwordOccurrence() {
    _classCallCheck(this, TogglePresetSubwordOccurrence);

    _get(Object.getPrototypeOf(TogglePresetSubwordOccurrence.prototype), 'constructor', this).apply(this, arguments);

    this.occurrenceType = 'subword';
  }

  // Want to rename RestoreOccurrenceMarker
  return TogglePresetSubwordOccurrence;
})(TogglePresetOccurrence);

var AddPresetOccurrenceFromLastOccurrencePattern = (function (_TogglePresetOccurrence2) {
  _inherits(AddPresetOccurrenceFromLastOccurrencePattern, _TogglePresetOccurrence2);

  function AddPresetOccurrenceFromLastOccurrencePattern() {
    _classCallCheck(this, AddPresetOccurrenceFromLastOccurrencePattern);

    _get(Object.getPrototypeOf(AddPresetOccurrenceFromLastOccurrencePattern.prototype), 'constructor', this).apply(this, arguments);
  }

  // Delete
  // ================================

  _createClass(AddPresetOccurrenceFromLastOccurrencePattern, [{
    key: 'execute',
    value: function execute() {
      this.occurrenceManager.resetPatterns();
      var regex = this.globalState.get('lastOccurrencePattern');
      if (regex) {
        var occurrenceType = this.globalState.get('lastOccurrenceType');
        this.occurrenceManager.addPattern(regex, { occurrenceType: occurrenceType });
        this.activateMode('normal');
      }
    }
  }]);

  return AddPresetOccurrenceFromLastOccurrencePattern;
})(TogglePresetOccurrence);

var Delete = (function (_Operator4) {
  _inherits(Delete, _Operator4);

  function Delete() {
    _classCallCheck(this, Delete);

    _get(Object.getPrototypeOf(Delete.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.flashCheckpoint = 'did-select-occurrence';
    this.flashTypeForOccurrence = 'operator-remove-occurrence';
    this.stayOptionName = 'stayOnDelete';
    this.setToFirstCharacterOnLinewise = true;
  }

  _createClass(Delete, [{
    key: 'execute',
    value: function execute() {
      var _this5 = this;

      this.onDidSelectTarget(function () {
        if (_this5.occurrenceSelected && _this5.occurrenceWise === 'linewise') {
          _this5.flashTarget = false;
        }
      });

      if (this.target.wise === 'blockwise') {
        this.restorePositions = false;
      }
      _get(Object.getPrototypeOf(Delete.prototype), 'execute', this).call(this);
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      this.setTextToRegister(selection.getText(), selection);
      selection.deleteSelectedText();
    }
  }]);

  return Delete;
})(Operator);

var DeleteRight = (function (_Delete) {
  _inherits(DeleteRight, _Delete);

  function DeleteRight() {
    _classCallCheck(this, DeleteRight);

    _get(Object.getPrototypeOf(DeleteRight.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveRight';
  }

  return DeleteRight;
})(Delete);

var DeleteLeft = (function (_Delete2) {
  _inherits(DeleteLeft, _Delete2);

  function DeleteLeft() {
    _classCallCheck(this, DeleteLeft);

    _get(Object.getPrototypeOf(DeleteLeft.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveLeft';
  }

  return DeleteLeft;
})(Delete);

var DeleteToLastCharacterOfLine = (function (_Delete3) {
  _inherits(DeleteToLastCharacterOfLine, _Delete3);

  function DeleteToLastCharacterOfLine() {
    _classCallCheck(this, DeleteToLastCharacterOfLine);

    _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToLastCharacterOfLine';
  }

  _createClass(DeleteToLastCharacterOfLine, [{
    key: 'execute',
    value: function execute() {
      var _this6 = this;

      this.onDidSelectTarget(function () {
        if (_this6.target.wise === 'blockwise') {
          for (var blockwiseSelection of _this6.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), 'execute', this).call(this);
    }
  }]);

  return DeleteToLastCharacterOfLine;
})(Delete);

var DeleteLine = (function (_Delete4) {
  _inherits(DeleteLine, _Delete4);

  function DeleteLine() {
    _classCallCheck(this, DeleteLine);

    _get(Object.getPrototypeOf(DeleteLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.target = 'MoveToRelativeLine';
    this.flashTarget = false;
  }

  // Yank
  // =========================
  return DeleteLine;
})(Delete);

var Yank = (function (_Operator5) {
  _inherits(Yank, _Operator5);

  function Yank() {
    _classCallCheck(this, Yank);

    _get(Object.getPrototypeOf(Yank.prototype), 'constructor', this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = 'stayOnYank';
  }

  _createClass(Yank, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      this.setTextToRegister(selection.getText(), selection);
    }
  }]);

  return Yank;
})(Operator);

var YankLine = (function (_Yank) {
  _inherits(YankLine, _Yank);

  function YankLine() {
    _classCallCheck(this, YankLine);

    _get(Object.getPrototypeOf(YankLine.prototype), 'constructor', this).apply(this, arguments);

    this.wise = 'linewise';
    this.target = 'MoveToRelativeLine';
  }

  return YankLine;
})(Yank);

var YankToLastCharacterOfLine = (function (_Yank2) {
  _inherits(YankToLastCharacterOfLine, _Yank2);

  function YankToLastCharacterOfLine() {
    _classCallCheck(this, YankToLastCharacterOfLine);

    _get(Object.getPrototypeOf(YankToLastCharacterOfLine.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'MoveToLastCharacterOfLine';
  }

  // Yank diff hunk at cursor by removing leading "+" or "-" from each line
  return YankToLastCharacterOfLine;
})(Yank);

var YankDiffHunk = (function (_Yank3) {
  _inherits(YankDiffHunk, _Yank3);

  function YankDiffHunk() {
    _classCallCheck(this, YankDiffHunk);

    _get(Object.getPrototypeOf(YankDiffHunk.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'InnerDiffHunk';
  }

  // -------------------------
  // [ctrl-a]

  _createClass(YankDiffHunk, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      // Remove leading "+" or "-" in diff hunk
      var textToYank = selection.getText().replace(/^./gm, '');
      this.setTextToRegister(textToYank, selection);
    }
  }]);

  return YankDiffHunk;
})(Yank);

var Increase = (function (_Operator6) {
  _inherits(Increase, _Operator6);

  function Increase() {
    _classCallCheck(this, Increase);

    _get(Object.getPrototypeOf(Increase.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.flashTarget = false;
    this.restorePositions = false;
    this.step = 1;
  }

  // [ctrl-x]

  _createClass(Increase, [{
    key: 'execute',
    value: function execute() {
      this.newRanges = [];
      if (!this.regex) this.regex = new RegExp('' + this.getConfig('numberRegex'), 'g');

      _get(Object.getPrototypeOf(Increase.prototype), 'execute', this).call(this);

      if (this.newRanges.length) {
        if (this.getConfig('flashOnOperate') && !this.getConfig('flashOnOperateBlacklist').includes(this.name)) {
          this.vimState.flash(this.newRanges, { type: this.flashTypeForOccurrence });
        }
      }
    }
  }, {
    key: 'replaceNumberInBufferRange',
    value: function replaceNumberInBufferRange(scanRange, fn) {
      var _this7 = this;

      var newRanges = [];
      this.scanEditor('forward', this.regex, { scanRange: scanRange }, function (event) {
        if (fn) {
          if (fn(event)) event.stop();else return;
        }
        var nextNumber = _this7.getNextNumber(event.matchText);
        newRanges.push(event.replace(String(nextNumber)));
      });
      return newRanges;
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var _this8 = this;

      var cursor = selection.cursor;

      if (this.target.name === 'Empty') {
        (function () {
          // ctrl-a, ctrl-x in `normal-mode`
          var cursorPosition = cursor.getBufferPosition();
          var scanRange = _this8.editor.bufferRangeForBufferRow(cursorPosition.row);
          var newRanges = _this8.replaceNumberInBufferRange(scanRange, function (event) {
            return event.range.end.isGreaterThan(cursorPosition);
          });
          var point = newRanges.length && newRanges[0].end.translate([0, -1]) || cursorPosition;
          cursor.setBufferPosition(point);
        })();
      } else {
        var _newRanges;

        var scanRange = selection.getBufferRange();
        (_newRanges = this.newRanges).push.apply(_newRanges, _toConsumableArray(this.replaceNumberInBufferRange(scanRange)));
        cursor.setBufferPosition(scanRange.start);
      }
    }
  }, {
    key: 'getNextNumber',
    value: function getNextNumber(numberString) {
      return Number.parseInt(numberString, 10) + this.step * this.getCount();
    }
  }]);

  return Increase;
})(Operator);

var Decrease = (function (_Increase) {
  _inherits(Decrease, _Increase);

  function Decrease() {
    _classCallCheck(this, Decrease);

    _get(Object.getPrototypeOf(Decrease.prototype), 'constructor', this).apply(this, arguments);

    this.step = -1;
  }

  // -------------------------
  // [g ctrl-a]
  return Decrease;
})(Increase);

var IncrementNumber = (function (_Increase2) {
  _inherits(IncrementNumber, _Increase2);

  function IncrementNumber() {
    _classCallCheck(this, IncrementNumber);

    _get(Object.getPrototypeOf(IncrementNumber.prototype), 'constructor', this).apply(this, arguments);

    this.baseNumber = null;
    this.target = null;
  }

  // [g ctrl-x]

  _createClass(IncrementNumber, [{
    key: 'getNextNumber',
    value: function getNextNumber(numberString) {
      if (this.baseNumber != null) {
        this.baseNumber += this.step * this.getCount();
      } else {
        this.baseNumber = Number.parseInt(numberString, 10);
      }
      return this.baseNumber;
    }
  }]);

  return IncrementNumber;
})(Increase);

var DecrementNumber = (function (_IncrementNumber) {
  _inherits(DecrementNumber, _IncrementNumber);

  function DecrementNumber() {
    _classCallCheck(this, DecrementNumber);

    _get(Object.getPrototypeOf(DecrementNumber.prototype), 'constructor', this).apply(this, arguments);

    this.step = -1;
  }

  // Put
  // -------------------------
  // Cursor placement:
  // - place at end of mutation: paste non-multiline characterwise text
  // - place at start of mutation: non-multiline characterwise text(characterwise, linewise)
  return DecrementNumber;
})(IncrementNumber);

var PutBefore = (function (_Operator7) {
  _inherits(PutBefore, _Operator7);

  function PutBefore() {
    _classCallCheck(this, PutBefore);

    _get(Object.getPrototypeOf(PutBefore.prototype), 'constructor', this).apply(this, arguments);

    this.location = 'before';
    this.target = 'Empty';
    this.flashType = 'operator-long';
    this.restorePositions = false;
    this.flashTarget = false;
    this.trackChange = false;
  }

  _createClass(PutBefore, [{
    key: 'initialize',
    // manage manually

    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      _get(Object.getPrototypeOf(PutBefore.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _this9 = this;

      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      this.onDidFinishMutation(function () {
        if (!_this9.cancelled) _this9.adjustCursorPosition();
      });

      _get(Object.getPrototypeOf(PutBefore.prototype), 'execute', this).call(this);

      if (this.cancelled) return;

      this.onDidFinishOperation(function () {
        // TrackChange
        var newRange = _this9.mutationsBySelection.get(_this9.editor.getLastSelection());
        if (newRange) _this9.setMarkForChange(newRange);

        // Flash
        if (_this9.getConfig('flashOnOperate') && !_this9.getConfig('flashOnOperateBlacklist').includes(_this9.name)) {
          var ranges = _this9.editor.getSelections().map(function (selection) {
            return _this9.mutationsBySelection.get(selection);
          });
          _this9.vimState.flash(ranges, { type: _this9.getFlashType() });
        }
      });
    }
  }, {
    key: 'adjustCursorPosition',
    value: function adjustCursorPosition() {
      for (var selection of this.editor.getSelections()) {
        if (!this.mutationsBySelection.has(selection)) continue;

        var cursor = selection.cursor;

        var newRange = this.mutationsBySelection.get(selection);
        if (this.linewisePaste) {
          this.utils.moveCursorToFirstCharacterAtRow(cursor, newRange.start.row);
        } else {
          if (newRange.isSingleLine()) {
            cursor.setBufferPosition(newRange.end.translate([0, -1]));
          } else {
            cursor.setBufferPosition(newRange.start);
          }
        }
      }
    }
  }, {
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      if (!value.text) {
        this.cancelled = true;
        return;
      }

      var textToPaste = value.text.repeat(this.getCount());
      this.linewisePaste = value.type === 'linewise' || this.isMode('visual', 'linewise');
      var newRange = this.paste(selection, textToPaste, { linewisePaste: this.linewisePaste });
      this.mutationsBySelection.set(selection, newRange);
      this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, newRange);
    }

    // Return pasted range
  }, {
    key: 'paste',
    value: function paste(selection, text, _ref2) {
      var linewisePaste = _ref2.linewisePaste;

      if (this.sequentialPaste) {
        return this.pasteCharacterwise(selection, text);
      } else if (linewisePaste) {
        return this.pasteLinewise(selection, text);
      } else {
        return this.pasteCharacterwise(selection, text);
      }
    }
  }, {
    key: 'pasteCharacterwise',
    value: function pasteCharacterwise(selection, text) {
      var cursor = selection.cursor;

      if (selection.isEmpty() && this.location === 'after' && !this.isEmptyRow(cursor.getBufferRow())) {
        cursor.moveRight();
      }
      return selection.insertText(text);
    }

    // Return newRange
  }, {
    key: 'pasteLinewise',
    value: function pasteLinewise(selection, text) {
      var cursor = selection.cursor;

      var cursorRow = cursor.getBufferRow();
      if (!text.endsWith('\n')) {
        text += '\n';
      }
      if (selection.isEmpty()) {
        if (this.location === 'before') {
          return this.utils.insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
        } else if (this.location === 'after') {
          var targetRow = this.getFoldEndRowForRow(cursorRow);
          this.utils.ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          return this.utils.insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
        }
      } else {
        if (!this.isMode('visual', 'linewise')) {
          selection.insertText('\n');
        }
        return selection.insertText(text);
      }
    }
  }]);

  return PutBefore;
})(Operator);

var PutAfter = (function (_PutBefore) {
  _inherits(PutAfter, _PutBefore);

  function PutAfter() {
    _classCallCheck(this, PutAfter);

    _get(Object.getPrototypeOf(PutAfter.prototype), 'constructor', this).apply(this, arguments);

    this.location = 'after';
  }

  return PutAfter;
})(PutBefore);

var PutBeforeWithAutoIndent = (function (_PutBefore2) {
  _inherits(PutBeforeWithAutoIndent, _PutBefore2);

  function PutBeforeWithAutoIndent() {
    _classCallCheck(this, PutBeforeWithAutoIndent);

    _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(PutBeforeWithAutoIndent, [{
    key: 'pasteLinewise',
    value: function pasteLinewise(selection, text) {
      var newRange = _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), 'pasteLinewise', this).call(this, selection, text);
      this.utils.adjustIndentWithKeepingLayout(this.editor, newRange);
      return newRange;
    }
  }]);

  return PutBeforeWithAutoIndent;
})(PutBefore);

var PutAfterWithAutoIndent = (function (_PutBeforeWithAutoIndent) {
  _inherits(PutAfterWithAutoIndent, _PutBeforeWithAutoIndent);

  function PutAfterWithAutoIndent() {
    _classCallCheck(this, PutAfterWithAutoIndent);

    _get(Object.getPrototypeOf(PutAfterWithAutoIndent.prototype), 'constructor', this).apply(this, arguments);

    this.location = 'after';
  }

  return PutAfterWithAutoIndent;
})(PutBeforeWithAutoIndent);

var AddBlankLineBelow = (function (_Operator8) {
  _inherits(AddBlankLineBelow, _Operator8);

  function AddBlankLineBelow() {
    _classCallCheck(this, AddBlankLineBelow);

    _get(Object.getPrototypeOf(AddBlankLineBelow.prototype), 'constructor', this).apply(this, arguments);

    this.flashTarget = false;
    this.target = 'Empty';
    this.stayAtSamePosition = true;
    this.stayByMarker = true;
    this.where = 'below';
  }

  _createClass(AddBlankLineBelow, [{
    key: 'mutateSelection',
    value: function mutateSelection(selection) {
      var point = selection.getHeadBufferPosition();
      if (this.where === 'below') point.row++;
      point.column = 0;
      this.editor.setTextInBufferRange([point, point], '\n'.repeat(this.getCount()));
    }
  }]);

  return AddBlankLineBelow;
})(Operator);

var AddBlankLineAbove = (function (_AddBlankLineBelow) {
  _inherits(AddBlankLineAbove, _AddBlankLineBelow);

  function AddBlankLineAbove() {
    _classCallCheck(this, AddBlankLineAbove);

    _get(Object.getPrototypeOf(AddBlankLineAbove.prototype), 'constructor', this).apply(this, arguments);

    this.where = 'above';
  }

  return AddBlankLineAbove;
})(AddBlankLineBelow);

var ResolveGitConflict = (function (_Operator9) {
  _inherits(ResolveGitConflict, _Operator9);

  function ResolveGitConflict() {
    _classCallCheck(this, ResolveGitConflict);

    _get(Object.getPrototypeOf(ResolveGitConflict.prototype), 'constructor', this).apply(this, arguments);

    this.target = 'Empty';
    this.restorePositions = false;
  }

  _createClass(ResolveGitConflict, [{
    key: 'mutateSelection',
    // do manually

    value: function mutateSelection(selection) {
      var _this10 = this;

      var point = this.getCursorPositionForSelection(selection);
      var rangeInfo = this.getConflictingRangeInfo(point.row);

      if (rangeInfo) {
        (function () {
          var whole = rangeInfo.whole;
          var sectionOurs = rangeInfo.sectionOurs;
          var sectionTheirs = rangeInfo.sectionTheirs;
          var bodyOurs = rangeInfo.bodyOurs;
          var bodyTheirs = rangeInfo.bodyTheirs;

          var resolveConflict = function resolveConflict(range) {
            var text = _this10.editor.getTextInBufferRange(range);
            var dstRange = _this10.getBufferRangeForRowRange([whole.start.row, whole.end.row]);
            var newRange = _this10.editor.setTextInBufferRange(dstRange, text ? text + '\n' : '');
            selection.cursor.setBufferPosition(newRange.start);
          };
          // NOTE: When cursor is at separator row '=======', no replace happens because it's ambiguous.
          if (sectionOurs.containsPoint(point)) {
            resolveConflict(bodyOurs);
          } else if (sectionTheirs.containsPoint(point)) {
            resolveConflict(bodyTheirs);
          }
        })();
      }
    }
  }, {
    key: 'getConflictingRangeInfo',
    value: function getConflictingRangeInfo(row) {
      var from = [row, Infinity];
      var conflictStart = this.findInEditor('backward', /^<<<<<<< .+$/, { from: from }, function (event) {
        return event.range.start;
      });

      if (conflictStart) {
        var startRow = conflictStart.row;
        var separatorRow = undefined,
            endRow = undefined;
        var _from = [startRow + 1, 0];
        var regex = /(^<<<<<<< .+$)|(^=======$)|(^>>>>>>> .+$)/g;
        this.scanEditor('forward', regex, { from: _from }, function (_ref3) {
          var match = _ref3.match;
          var range = _ref3.range;
          var stop = _ref3.stop;

          if (match[1]) {
            // incomplete conflict hunk, we saw next conflict startRow wihout seeing endRow
            stop();
          } else if (match[2]) {
            separatorRow = range.start.row;
          } else if (match[3]) {
            endRow = range.start.row;
            stop();
          }
        });
        if (!endRow) return;
        var whole = new Range([startRow, 0], [endRow, Infinity]);
        var sectionOurs = new Range(whole.start, [(separatorRow || endRow) - 1, Infinity]);
        var sectionTheirs = new Range([(separatorRow || startRow) + 1, 0], whole.end);

        var bodyOursStart = sectionOurs.start.translate([1, 0]);
        var bodyOurs = sectionOurs.getRowCount() === 1 ? new Range(bodyOursStart, bodyOursStart) : new Range(bodyOursStart, sectionOurs.end);

        var bodyTheirs = sectionTheirs.getRowCount() === 1 ? new Range(sectionTheirs.start, sectionTheirs.start) : sectionTheirs.translate([0, 0], [-1, 0]);
        return { whole: whole, sectionOurs: sectionOurs, sectionTheirs: sectionTheirs, bodyOurs: bodyOurs, bodyTheirs: bodyTheirs };
      }
    }
  }]);

  return ResolveGitConflict;
})(Operator);

module.exports = {
  Operator: Operator,
  SelectBase: SelectBase,
  Select: Select,
  SelectLatestChange: SelectLatestChange,
  SelectPreviousSelection: SelectPreviousSelection,
  SelectPersistentSelection: SelectPersistentSelection,
  SelectOccurrence: SelectOccurrence,
  VisualModeSelect: VisualModeSelect,
  CreatePersistentSelection: CreatePersistentSelection,
  TogglePersistentSelection: TogglePersistentSelection,
  TogglePresetOccurrence: TogglePresetOccurrence,
  TogglePresetSubwordOccurrence: TogglePresetSubwordOccurrence,
  AddPresetOccurrenceFromLastOccurrencePattern: AddPresetOccurrenceFromLastOccurrencePattern,
  Delete: Delete,
  DeleteRight: DeleteRight,
  DeleteLeft: DeleteLeft,
  DeleteToLastCharacterOfLine: DeleteToLastCharacterOfLine,
  DeleteLine: DeleteLine,
  Yank: Yank,
  YankLine: YankLine,
  YankToLastCharacterOfLine: YankToLastCharacterOfLine,
  YankDiffHunk: YankDiffHunk,
  Increase: Increase,
  Decrease: Decrease,
  IncrementNumber: IncrementNumber,
  DecrementNumber: DecrementNumber,
  PutBefore: PutBefore,
  PutAfter: PutAfter,
  PutBeforeWithAutoIndent: PutBeforeWithAutoIndent,
  PutAfterWithAutoIndent: PutAfterWithAutoIndent,
  AddBlankLineBelow: AddBlankLineBelow,
  AddBlankLineAbove: AddBlankLineAbove,
  ResolveGitConflict: ResolveGitConflict
};
// ctrl-a in normal-mode find target number in current line manually
// do manually
// do manually
// manage manually
// manage manually
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7OztlQUVLLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssWUFBTCxLQUFLOztBQUNaLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsUUFBUTtZQUFSLFFBQVE7O1dBQVIsUUFBUTswQkFBUixRQUFROzsrQkFBUixRQUFROztTQUdaLFVBQVUsR0FBRyxJQUFJO1NBRWpCLElBQUksR0FBRyxJQUFJO1NBQ1gsTUFBTSxHQUFHLElBQUk7U0FDYixVQUFVLEdBQUcsS0FBSztTQUNsQixjQUFjLEdBQUcsTUFBTTtTQUV2QixXQUFXLEdBQUcsSUFBSTtTQUNsQixlQUFlLEdBQUcsWUFBWTtTQUM5QixTQUFTLEdBQUcsVUFBVTtTQUN0QixzQkFBc0IsR0FBRyxxQkFBcUI7U0FDOUMsV0FBVyxHQUFHLEtBQUs7U0FFbkIsb0JBQW9CLEdBQUcsSUFBSTtTQUMzQixrQkFBa0IsR0FBRyxJQUFJO1NBQ3pCLGNBQWMsR0FBRyxJQUFJO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLGdCQUFnQixHQUFHLElBQUk7U0FDdkIsNkJBQTZCLEdBQUcsS0FBSztTQUVyQyxzQkFBc0IsR0FBRyxJQUFJO1NBQzdCLHlCQUF5QixHQUFHLElBQUk7U0FFaEMseUJBQXlCLEdBQUcsSUFBSTtTQUVoQyxjQUFjLEdBQUcsSUFBSTtTQUNyQixLQUFLLEdBQUcsSUFBSTtTQUNaLG9CQUFvQixHQUFHLEtBQUs7U0FDNUIseUJBQXlCLEdBQUcsRUFBRTs7O2VBL0IxQixRQUFROztXQWlDSixtQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzVDOzs7Ozs7V0FJVSxzQkFBRztB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QkFBMkI7QUFDM0IsWUFBVSxFQUFWLFVBQVU7QUFDVixNQUFJLEVBQUosSUFBSTtBQUNKLFVBQVEsRUFBUixRQUFRO0FBQ1IsMkJBQXlCLEVBQXpCLHlCQUF5QjtBQUN6QixjQUFZLEVBQVosWUFBWTtBQUNaLFVBQVEsRUFBUixRQUFRO0FBQ1IsVUFBUSxFQUFSLFFBQVE7QUFDUixpQkFBZSxFQUFmLGVBQWU7QUFDZixpQkFBZSxFQUFmLGVBQWU7QUFDZixXQUFTLEVBQVQsU0FBUztBQUNULFVBQVEsRUFBUixRQUFRO0FBQ1IseUJBQXVCLEVBQXZCLHVCQUF1QjtBQUN2Qix3QkFBc0IsRUFBdEIsc0JBQXNCO0FBQ3RCLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsbUJBQWlCLEVBQWpCLGlCQUFpQjtBQUNqQixvQkFBa0IsRUFBbEIsa0JBQWtCO0NBQ25CLENBQUEiLCJmaWxlIjoiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKCdhdG9tJylcbmNvbnN0IEJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKVxuXG5jbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9ICdvcGVyYXRvcidcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICByZWNvcmRhYmxlID0gdHJ1ZVxuXG4gIHdpc2UgPSBudWxsXG4gIHRhcmdldCA9IG51bGxcbiAgb2NjdXJyZW5jZSA9IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlID0gJ2Jhc2UnXG5cbiAgZmxhc2hUYXJnZXQgPSB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludCA9ICdkaWQtZmluaXNoJ1xuICBmbGFzaFR5cGUgPSAnb3BlcmF0b3InXG4gIGZsYXNoVHlwZUZvck9jY3VycmVuY2UgPSAnb3BlcmF0b3Itb2NjdXJyZW5jZSdcbiAgdHJhY2tDaGFuZ2UgPSBmYWxzZVxuXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gbnVsbFxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSBudWxsXG4gIHN0YXlPcHRpb25OYW1lID0gbnVsbFxuICBzdGF5QnlNYXJrZXIgPSBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zID0gdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IGZhbHNlXG5cbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IHRydWVcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IHRydWVcblxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0gbnVsbFxuXG4gIHRhcmdldFNlbGVjdGVkID0gbnVsbFxuICBpbnB1dCA9IG51bGxcbiAgcmVhZElucHV0QWZ0ZXJTZWxlY3QgPSBmYWxzZVxuICBidWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0ge31cblxuICBpc1JlYWR5ICgpIHtcbiAgICByZXR1cm4gdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNSZWFkeSgpXG4gIH1cblxuICAvLyBDYWxsZWQgd2hlbiBvcGVyYXRpb24gZmluaXNoZWRcbiAgLy8gVGhpcyBpcyBlc3NlbnRpYWxseSB0byByZXNldCBzdGF0ZSBmb3IgYC5gIHJlcGVhdC5cbiAgcmVzZXRTdGF0ZSAoKSB7XG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgICB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG4gIH1cblxuICAvLyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgLy8gLSBvbmUgZm9yIHVuZG9cbiAgLy8gLSBvbmUgZm9yIHByZXNlcnZlIGxhc3QgaW5zZXJ0ZWQgdGV4dFxuICBjcmVhdGVCdWZmZXJDaGVja3BvaW50IChwdXJwb3NlKSB7XG4gICAgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdID0gdGhpcy5lZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpXG4gIH1cblxuICBnZXRCdWZmZXJDaGVja3BvaW50IChwdXJwb3NlKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZVtwdXJwb3NlXVxuICB9XG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50IChwdXJwb3NlKSB7XG4gICAgY29uc3QgY2hlY2twb2ludCA9IHRoaXMuZ2V0QnVmZmVyQ2hlY2twb2ludChwdXJwb3NlKVxuICAgIGlmIChjaGVja3BvaW50KSB7XG4gICAgICB0aGlzLmVkaXRvci5ncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoY2hlY2twb2ludClcbiAgICAgIGRlbGV0ZSB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cbiAgICB9XG4gIH1cblxuICBzZXRNYXJrRm9yQ2hhbmdlIChyYW5nZSkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoJ1snLCByYW5nZS5zdGFydClcbiAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KCddJywgcmFuZ2UuZW5kKVxuICB9XG5cbiAgbmVlZEZsYXNoICgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5mbGFzaFRhcmdldCAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlJykgJiZcbiAgICAgICF0aGlzLmdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKS5pbmNsdWRlcyh0aGlzLm5hbWUpICYmXG4gICAgICAodGhpcy5tb2RlICE9PSAndmlzdWFsJyB8fCB0aGlzLnN1Ym1vZGUgIT09IHRoaXMudGFyZ2V0Lndpc2UpIC8vIGUuZy4gWSBpbiB2Q1xuICAgIClcbiAgfVxuXG4gIGZsYXNoSWZOZWNlc3NhcnkgKHJhbmdlcykge1xuICAgIGlmICh0aGlzLm5lZWRGbGFzaCgpKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgIH1cbiAgfVxuXG4gIGZsYXNoQ2hhbmdlSWZOZWNlc3NhcnkgKCkge1xuICAgIGlmICh0aGlzLm5lZWRGbGFzaCgpKSB7XG4gICAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmFuZ2VzID0gdGhpcy5tdXRhdGlvbk1hbmFnZXIuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXNGb3JDaGVja3BvaW50KHRoaXMuZmxhc2hDaGVja3BvaW50KVxuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHJhbmdlcywge3R5cGU6IHRoaXMuZ2V0Rmxhc2hUeXBlKCl9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBnZXRGbGFzaFR5cGUgKCkge1xuICAgIHJldHVybiB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMuZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA6IHRoaXMuZmxhc2hUeXBlXG4gIH1cblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5ICgpIHtcbiAgICBpZiAoIXRoaXMudHJhY2tDaGFuZ2UpIHJldHVyblxuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLm11dGF0aW9uTWFuYWdlci5nZXRNdXRhdGVkQnVmZmVyUmFuZ2VGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgaWYgKHJhbmdlKSB0aGlzLnNldE1hcmtGb3JDaGFuZ2UocmFuZ2UpXG4gICAgfSlcbiAgfVxuXG4gIGluaXRpYWxpemUgKCkge1xuICAgIHRoaXMuc3Vic2NyaWJlUmVzZXRPY2N1cnJlbmNlUGF0dGVybklmTmVlZGVkKClcblxuICAgIC8vIFdoZW4gcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cywgb3BlcmF0ZSBvbiBvY2N1cnJlbmNlLXdpc2VcbiAgICBpZiAodGhpcy5hY2NlcHRQcmVzZXRPY2N1cnJlbmNlICYmIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2UgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gW0ZJWE1FXSBPUkRFUi1NQVRURVJcbiAgICAvLyBUbyBwaWNrIGN1cnNvci13b3JkIHRvIGZpbmQgb2NjdXJyZW5jZSBiYXNlIHBhdHRlcm4uXG4gICAgLy8gVGhpcyBoYXMgdG8gYmUgZG9uZSBCRUZPUkUgY29udmVydGluZyBwZXJzaXN0ZW50LXNlbGVjdGlvbiBpbnRvIHJlYWwtc2VsZWN0aW9uLlxuICAgIC8vIFNpbmNlIHdoZW4gcGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgYWN0dWFsbHkgc2VsZWN0ZWQsIGl0IGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMub2NjdXJyZW5jZSAmJiAhdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSB8fCB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSh0aGlzLm9jY3VycmVuY2VUeXBlKVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHJlZ2V4KVxuICAgIH1cblxuICAgIC8vIFRoaXMgY2hhbmdlIGN1cnNvciBwb3NpdGlvbi5cbiAgICBpZiAodGhpcy5zZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uSWZOZWNlc3NhcnkoKSkge1xuICAgICAgLy8gW0ZJWE1FXSBzZWxlY3Rpb24td2lzZSBpcyBub3Qgc3luY2hlZCBpZiBpdCBhbHJlYWR5IHZpc3VhbC1tb2RlXG4gICAgICBpZiAodGhpcy5tb2RlICE9PSAndmlzdWFsJykge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKCd2aXN1YWwnLCB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm1vZGUgPT09ICd2aXN1YWwnKSB7XG4gICAgICB0aGlzLnRhcmdldCA9ICdDdXJyZW50U2VsZWN0aW9uJ1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRoaXMudGFyZ2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5zZXRUYXJnZXQodGhpcy5nZXRJbnN0YW5jZSh0aGlzLnRhcmdldCkpXG4gICAgfVxuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBzdWJzY3JpYmVSZXNldE9jY3VycmVuY2VQYXR0ZXJuSWZOZWVkZWQgKCkge1xuICAgIC8vIFtDQVVUSU9OXVxuICAgIC8vIFRoaXMgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgaW4gUFJPUEVSIHRpbWluZy5cbiAgICAvLyBJZiBvY2N1cnJlbmNlIGlzIHRydWUgYnV0IG5vIHByZXNldC1vY2N1cnJlbmNlXG4gICAgLy8gVHJlYXQgdGhhdCBgb2NjdXJyZW5jZWAgaXMgQk9VTkRFRCB0byBvcGVyYXRvciBpdHNlbGYsIHNvIGNsZWFucCBhdCBmaW5pc2hlZC5cbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlICYmICF0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vbkRpZFJlc2V0T3BlcmF0aW9uU3RhY2soKCkgPT4gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKCkpXG4gICAgfVxuICB9XG5cbiAgc2V0TW9kaWZpZXIgKHt3aXNlLCBvY2N1cnJlbmNlLCBvY2N1cnJlbmNlVHlwZX0pIHtcbiAgICBpZiAod2lzZSkge1xuICAgICAgdGhpcy53aXNlID0gd2lzZVxuICAgIH0gZWxzZSBpZiAob2NjdXJyZW5jZSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlID0gb2NjdXJyZW5jZVxuICAgICAgdGhpcy5vY2N1cnJlbmNlVHlwZSA9IG9jY3VycmVuY2VUeXBlXG4gICAgICAvLyBUaGlzIGlzIG8gbW9kaWZpZXIgY2FzZShlLmcuIGBjIG8gcGAsIGBkIE8gZmApXG4gICAgICAvLyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgY29uc3QgcmVnZXggPSB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShvY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleCwge3Jlc2V0OiB0cnVlLCBvY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjaygoKSA9PiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcbiAgICB9XG4gIH1cblxuICAvLyByZXR1cm4gdHJ1ZS9mYWxzZSB0byBpbmRpY2F0ZSBzdWNjZXNzXG4gIHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeSAoKSB7XG4gICAgY29uc3QgY2FuU2VsZWN0ID1cbiAgICAgIHRoaXMuYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoJ2F1dG9TZWxlY3RQZXJzaXN0ZW50U2VsZWN0aW9uT25PcGVyYXRlJykgJiZcbiAgICAgICF0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uaXNFbXB0eSgpXG5cbiAgICBpZiAoY2FuU2VsZWN0KSB7XG4gICAgICB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uc2VsZWN0KClcbiAgICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0dGVybkZvck9jY3VycmVuY2VUeXBlIChvY2N1cnJlbmNlVHlwZSkge1xuICAgIGlmIChvY2N1cnJlbmNlVHlwZSA9PT0gJ2Jhc2UnKSB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5nZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9IGVsc2UgaWYgKG9jY3VycmVuY2VUeXBlID09PSAnc3Vid29yZCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIH1cbiAgfVxuXG4gIC8vIHRhcmdldCBpcyBUZXh0T2JqZWN0IG9yIE1vdGlvbiB0byBvcGVyYXRlIG9uLlxuICBzZXRUYXJnZXQgKHRhcmdldCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy50YXJnZXQub3BlcmF0b3IgPSB0aGlzXG4gICAgdGhpcy5lbWl0RGlkU2V0VGFyZ2V0KHRoaXMpXG4gIH1cblxuICBzZXRUZXh0VG9SZWdpc3RlciAodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKCkgJiYgdGhpcy5pc0JsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcigpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgIGlmICh3aXNlID09PSAnbGluZXdpc2UnICYmICF0ZXh0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgdGV4dCArPSAnXFxuJ1xuICAgIH1cblxuICAgIGlmICh0ZXh0KSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldChudWxsLCB7dGV4dCwgc2VsZWN0aW9ufSlcblxuICAgICAgaWYgKHRoaXMudmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKCkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VvZignRGVsZXRlJykgfHwgdGhpcy5pbnN0YW5jZW9mKCdDaGFuZ2UnKSkge1xuICAgICAgICAgIGlmICghdGhpcy5uZWVkU2F2ZVRvTnVtYmVyZWRSZWdpc3Rlcih0aGlzLnRhcmdldCkgJiYgdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpKSB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldCgnLScsIHt0ZXh0LCBzZWxlY3Rpb259KSAvLyBzbWFsbC1jaGFuZ2VcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQoJzEnLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbnN0YW5jZW9mKCdZYW5rJykpIHtcbiAgICAgICAgICB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLnNldCgnMCcsIHt0ZXh0LCBzZWxlY3Rpb259KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNCbGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3IgKCkge1xuICAgIGNvbnN0IG9wZXJhdG9ycyA9IHRoaXMuZ2V0Q29uZmlnKCdibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzJylcbiAgICBjb25zdCB3aWxkQ2FyZE9wZXJhdG9ycyA9IG9wZXJhdG9ycy5maWx0ZXIobmFtZSA9PiBuYW1lLmVuZHNXaXRoKCcqJykpXG4gICAgY29uc3QgY29tbWFuZE5hbWUgPSB0aGlzLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gICAgcmV0dXJuIChcbiAgICAgIHdpbGRDYXJkT3BlcmF0b3JzLnNvbWUobmFtZSA9PiBuZXcgUmVnRXhwKCdeJyArIG5hbWUucmVwbGFjZSgnKicsICcuKicpKS50ZXN0KGNvbW1hbmROYW1lKSkgfHxcbiAgICAgIG9wZXJhdG9ycy5pbmNsdWRlcyhjb21tYW5kTmFtZSlcbiAgICApXG4gIH1cblxuICBuZWVkU2F2ZVRvTnVtYmVyZWRSZWdpc3RlciAodGFyZ2V0KSB7XG4gICAgLy8gVXNlZCB0byBkZXRlcm1pbmUgd2hhdCByZWdpc3RlciB0byB1c2Ugb24gY2hhbmdlIGFuZCBkZWxldGUgb3BlcmF0aW9uLlxuICAgIC8vIEZvbGxvd2luZyBtb3Rpb24gc2hvdWxkIHNhdmUgdG8gMS05IHJlZ2lzdGVyIHJlZ2VyZGxlc3Mgb2YgY29udGVudCBpcyBzbWFsbCBvciBiaWcuXG4gICAgY29uc3QgZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzID0gW1xuICAgICAgJ01vdmVUb1BhaXInLCAvLyAlXG4gICAgICAnTW92ZVRvTmV4dFNlbnRlbmNlJywgLy8gKCwgKVxuICAgICAgJ1NlYXJjaCcsIC8vIC8sID8sIG4sIE5cbiAgICAgICdNb3ZlVG9OZXh0UGFyYWdyYXBoJyAvLyB7LCB9XG4gICAgXVxuICAgIHJldHVybiBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMuc29tZShuYW1lID0+IHRhcmdldC5pbnN0YW5jZW9mKG5hbWUpKVxuICB9XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5ICgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJyAmJiB0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc01vdGlvbigpKSB7XG4gICAgICB0aGlzLnN3cmFwLm5vcm1hbGl6ZSh0aGlzLmVkaXRvcilcbiAgICB9XG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb25zICgpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKSkge1xuICAgICAgdGhpcy5tdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIH1cbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCdkaWQtZmluaXNoJylcbiAgICB0aGlzLnJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG4gIH1cblxuICBwcmVTZWxlY3QgKCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLmNyZWF0ZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuICB9XG5cbiAgcG9zdE11dGF0ZSAoKSB7XG4gICAgdGhpcy5ncm91cENoYW5nZXNTaW5jZUJ1ZmZlckNoZWNrcG9pbnQoJ3VuZG8nKVxuICAgIHRoaXMuZW1pdERpZEZpbmlzaE11dGF0aW9uKClcblxuICAgIC8vIEV2ZW4gdGhvdWdoIHdlIGZhaWwgdG8gc2VsZWN0IHRhcmdldCBhbmQgZmFpbCB0byBtdXRhdGUsXG4gICAgLy8gd2UgaGF2ZSB0byByZXR1cm4gdG8gbm9ybWFsLW1vZGUgZnJvbSBvcGVyYXRvci1wZW5kaW5nIG9yIHZpc3VhbFxuICAgIHRoaXMuYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuICB9XG5cbiAgLy8gTWFpblxuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLnByZVNlbGVjdCgpXG5cbiAgICBpZiAodGhpcy5yZWFkSW5wdXRBZnRlclNlbGVjdCAmJiAhdGhpcy5yZXBlYXRlZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUFzeW5jVG9SZWFkSW5wdXRBZnRlclNlbGVjdCgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2VsZWN0VGFyZ2V0KCkpIHRoaXMubXV0YXRlU2VsZWN0aW9ucygpXG4gICAgdGhpcy5wb3N0TXV0YXRlKClcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGVBc3luY1RvUmVhZElucHV0QWZ0ZXJTZWxlY3QgKCkge1xuICAgIGlmICh0aGlzLnNlbGVjdFRhcmdldCgpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gYXdhaXQgdGhpcy5mb2N1c0lucHV0UHJvbWlzZWQodGhpcy5mb2N1c0lucHV0T3B0aW9ucylcbiAgICAgIGlmICh0aGlzLmlucHV0ID09IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMubW9kZSAhPT0gJ3Zpc3VhbCcpIHtcbiAgICAgICAgICB0aGlzLmVkaXRvci5yZXZlcnRUb0NoZWNrcG9pbnQodGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KCd1bmRvJykpXG4gICAgICAgICAgdGhpcy5hY3RpdmF0ZU1vZGUoJ25vcm1hbCcpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLm11dGF0ZVNlbGVjdGlvbnMoKVxuICAgIH1cbiAgICB0aGlzLnBvc3RNdXRhdGUoKVxuICB9XG5cbiAgLy8gUmV0dXJuIHRydWUgdW5sZXNzIGFsbCBzZWxlY3Rpb24gaXMgZW1wdHkuXG4gIHNlbGVjdFRhcmdldCAoKSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0U2VsZWN0ZWQgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0U2VsZWN0ZWRcbiAgICB9XG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuaW5pdCh7c3RheUJ5TWFya2VyOiB0aGlzLnN0YXlCeU1hcmtlcn0pXG5cbiAgICBpZiAodGhpcy50YXJnZXQuaXNNb3Rpb24oKSAmJiB0aGlzLm1vZGUgPT09ICd2aXN1YWwnKSB0aGlzLnRhcmdldC53aXNlID0gdGhpcy5zdWJtb2RlXG4gICAgaWYgKHRoaXMud2lzZSAhPSBudWxsKSB0aGlzLnRhcmdldC5mb3JjZVdpc2UodGhpcy53aXNlKVxuXG4gICAgdGhpcy5lbWl0V2lsbFNlbGVjdFRhcmdldCgpXG5cbiAgICAvLyBBbGxvdyBjdXJzb3IgcG9zaXRpb24gYWRqdXN0bWVudCAnb24td2lsbC1zZWxlY3QtdGFyZ2V0JyBob29rLlxuICAgIC8vIHNvIGNoZWNrcG9pbnQgY29tZXMgQUZURVIgQGVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KCd3aWxsLXNlbGVjdCcpXG5cbiAgICAvLyBOT1RFOiBXaGVuIHJlcGVhdGVkLCBzZXQgb2NjdXJyZW5jZS1tYXJrZXIgZnJvbSBwYXR0ZXJuIHN0b3JlZCBhcyBzdGF0ZS5cbiAgICBpZiAodGhpcy5yZXBlYXRlZCAmJiB0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4odGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSwge29jY3VycmVuY2VUeXBlOiB0aGlzLm9jY3VycmVuY2VUeXBlfSlcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldC5leGVjdXRlKClcblxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3QnKVxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UpIHtcbiAgICAgIGlmICghdGhpcy5wYXR0ZXJuRm9yT2NjdXJyZW5jZSkge1xuICAgICAgICAvLyBQcmVzZXJ2ZSBvY2N1cnJlbmNlUGF0dGVybiBmb3IgLiByZXBlYXQuXG4gICAgICAgIHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgPSB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmJ1aWxkUGF0dGVybigpXG4gICAgICB9XG5cbiAgICAgIHRoaXMub2NjdXJyZW5jZVdpc2UgPSB0aGlzLndpc2UgfHwgJ2NoYXJhY3Rlcndpc2UnXG4gICAgICBpZiAodGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zZWxlY3QodGhpcy5vY2N1cnJlbmNlV2lzZSkpIHtcbiAgICAgICAgdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IHRoaXMudmltU3RhdGUuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbigpIHx8IHRoaXMudGFyZ2V0Lm5hbWUgPT09ICdFbXB0eSdcbiAgICBpZiAodGhpcy50YXJnZXRTZWxlY3RlZCkge1xuICAgICAgdGhpcy5lbWl0RGlkU2VsZWN0VGFyZ2V0KClcbiAgICAgIHRoaXMuZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpXG4gICAgICB0aGlzLnRyYWNrQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50YXJnZXRTZWxlY3RlZFxuICB9XG5cbiAgcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5ICgpIHtcbiAgICBpZiAoIXRoaXMucmVzdG9yZVBvc2l0aW9ucykgcmV0dXJuXG5cbiAgICBjb25zdCBzdGF5ID1cbiAgICAgIHRoaXMuc3RheUF0U2FtZVBvc2l0aW9uICE9IG51bGxcbiAgICAgICAgPyB0aGlzLnN0YXlBdFNhbWVQb3NpdGlvblxuICAgICAgICA6IHRoaXMuZ2V0Q29uZmlnKHRoaXMuc3RheU9wdGlvbk5hbWUpIHx8ICh0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLmdldENvbmZpZygnc3RheU9uT2NjdXJyZW5jZScpKVxuICAgIGNvbnN0IHdpc2UgPSB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMub2NjdXJyZW5jZVdpc2UgOiB0aGlzLnRhcmdldC53aXNlXG4gICAgY29uc3Qge3NldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSA9IHRoaXNcbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zKHtzdGF5LCB3aXNlLCBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZX0pXG4gIH1cbn1cblxuY2xhc3MgU2VsZWN0QmFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICB0aGlzLnNlbGVjdFRhcmdldCgpXG5cbiAgICBpZiAodGhpcy50YXJnZXQuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICBpZiAodGhpcy50YXJnZXQuaXNUZXh0T2JqZWN0KCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG4gICAgICB9XG4gICAgICBjb25zdCB3aXNlID0gdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPyB0aGlzLm9jY3VycmVuY2VXaXNlIDogdGhpcy50YXJnZXQud2lzZVxuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeSgndmlzdWFsJywgd2lzZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWxlY3QgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5zd3JhcC5zYXZlUHJvcGVydGllcyh0aGlzLmVkaXRvcilcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuXG5jbGFzcyBTZWxlY3RMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gJ0FMYXRlc3RDaGFuZ2UnXG59XG5cbmNsYXNzIFNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIHRhcmdldCA9ICdQcmV2aW91c1NlbGVjdGlvbidcbn1cblxuY2xhc3MgU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICB0YXJnZXQgPSAnQVBlcnNpc3RlbnRTZWxlY3Rpb24nXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuXG5jbGFzcyBTZWxlY3RPY2N1cnJlbmNlIGV4dGVuZHMgU2VsZWN0QmFzZSB7XG4gIG9jY3VycmVuY2UgPSB0cnVlXG59XG5cbi8vIFZpc3VhbE1vZGVTZWxlY3Q6IHVzZWQgaW4gdmlzdWFsLW1vZGVcbi8vIFdoZW4gdGV4dC1vYmplY3QgaXMgaW52b2tlZCBmcm9tIG5vcm1hbCBvciB2aXVzYWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4vLyAgPT4gVmlzdWFsTW9kZVNlbGVjdCBvcGVyYXRvciB3aXRoIHRhcmdldD10ZXh0LW9iamVjdFxuLy8gV2hlbiBtb3Rpb24gaXMgaW52b2tlZCBmcm9tIHZpc3VhbC1tb2RlLCBvcGVyYXRpb24gd291bGQgYmVcbi8vICA9PiBWaXN1YWxNb2RlU2VsZWN0IG9wZXJhdG9yIHdpdGggdGFyZ2V0PW1vdGlvbilcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4vLyBWaXN1YWxNb2RlU2VsZWN0IGlzIHVzZWQgaW4gVFdPIHNpdHVhdGlvbi5cbi8vIC0gdmlzdWFsLW1vZGUgb3BlcmF0aW9uXG4vLyAgIC0gZS5nOiBgdiBsYCwgYFYgamAsIGB2IGkgcGAuLi5cbi8vIC0gRGlyZWN0bHkgaW52b2tlIHRleHQtb2JqZWN0IGZyb20gbm9ybWFsLW1vZGVcbi8vICAgLSBlLmc6IEludm9rZSBgSW5uZXIgUGFyYWdyYXBoYCBmcm9tIGNvbW1hbmQtcGFsZXR0ZS5cbmNsYXNzIFZpc3VhbE1vZGVTZWxlY3QgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgc3RhdGljIGNvbW1hbmQgPSBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5cbi8vIFBlcnNpc3RlbnQgU2VsZWN0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLm1hcmtCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgfVxufVxuXG5jbGFzcyBUb2dnbGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiB7XG4gIGluaXRpYWxpemUgKCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09ICdub3JtYWwnKSB7XG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgICAgaWYgKG1hcmtlcikgdGhpcy50YXJnZXQgPSAnRW1wdHknXG4gICAgfVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJBdFBvaW50KHBvaW50KVxuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICB9IGVsc2Uge1xuICAgICAgc3VwZXIubXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICB9XG4gIH1cbn1cblxuLy8gUHJlc2V0IE9jY3VycmVuY2Vcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRvZ2dsZVByZXNldE9jY3VycmVuY2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRhcmdldCA9ICdFbXB0eSdcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlID0gJ2Jhc2UnXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgY29uc3QgbWFya2VyID0gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJBdFBvaW50KHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICBpZiAobWFya2VyKSB7XG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmRlc3Ryb3lNYXJrZXJzKFttYXJrZXJdKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc05hcnJvd2VkID0gdGhpcy52aW1TdGF0ZS5pc05hcnJvd2VkKClcblxuICAgICAgbGV0IHJlZ2V4XG4gICAgICBpZiAodGhpcy5tb2RlID09PSAndmlzdWFsJyAmJiAhaXNOYXJyb3dlZCkge1xuICAgICAgICB0aGlzLm9jY3VycmVuY2VUeXBlID0gJ2Jhc2UnXG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLl8uZXNjYXBlUmVnRXhwKHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpKSwgJ2cnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVnZXggPSB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSh0aGlzLm9jY3VycmVuY2VUeXBlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybih0aGlzLm9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBpZiAoIWlzTmFycm93ZWQpIHRoaXMuYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBUb2dnbGVQcmVzZXRTdWJ3b3JkT2NjdXJyZW5jZSBleHRlbmRzIFRvZ2dsZVByZXNldE9jY3VycmVuY2Uge1xuICBvY2N1cnJlbmNlVHlwZSA9ICdzdWJ3b3JkJ1xufVxuXG4vLyBXYW50IHRvIHJlbmFtZSBSZXN0b3JlT2NjdXJyZW5jZU1hcmtlclxuY2xhc3MgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4gZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5yZXNldFBhdHRlcm5zKClcbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKVxuICAgIGlmIChyZWdleCkge1xuICAgICAgY29uc3Qgb2NjdXJyZW5jZVR5cGUgPSB0aGlzLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VUeXBlJylcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleCwge29jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKCdub3JtYWwnKVxuICAgIH1cbiAgfVxufVxuXG4vLyBEZWxldGVcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEZWxldGUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuICBmbGFzaFR5cGVGb3JPY2N1cnJlbmNlID0gJ29wZXJhdG9yLXJlbW92ZS1vY2N1cnJlbmNlJ1xuICBzdGF5T3B0aW9uTmFtZSA9ICdzdGF5T25EZWxldGUnXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlID0gdHJ1ZVxuXG4gIGV4ZWN1dGUgKCkge1xuICAgIHRoaXMub25EaWRTZWxlY3RUYXJnZXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkICYmIHRoaXMub2NjdXJyZW5jZVdpc2UgPT09ICdsaW5ld2lzZScpIHtcbiAgICAgICAgdGhpcy5mbGFzaFRhcmdldCA9IGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSAnYmxvY2t3aXNlJykge1xuICAgICAgdGhpcy5yZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB9XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuICB9XG59XG5cbmNsYXNzIERlbGV0ZVJpZ2h0IGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gJ01vdmVSaWdodCdcbn1cblxuY2xhc3MgRGVsZXRlTGVmdCBleHRlbmRzIERlbGV0ZSB7XG4gIHRhcmdldCA9ICdNb3ZlTGVmdCdcbn1cblxuY2xhc3MgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgRGVsZXRlIHtcbiAgdGFyZ2V0ID0gJ01vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUnXG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gJ2Jsb2Nrd2lzZScpIHtcbiAgICAgICAgZm9yIChjb25zdCBibG9ja3dpc2VTZWxlY3Rpb24gb2YgdGhpcy5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgICBibG9ja3dpc2VTZWxlY3Rpb24uZXh0ZW5kTWVtYmVyU2VsZWN0aW9uc1RvRW5kT2ZMaW5lKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZSB7XG4gIHdpc2UgPSAnbGluZXdpc2UnXG4gIHRhcmdldCA9ICdNb3ZlVG9SZWxhdGl2ZUxpbmUnXG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2Vcbn1cblxuLy8gWWFua1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN0YXlPcHRpb25OYW1lID0gJ3N0YXlPbllhbmsnXG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgfVxufVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmsge1xuICB3aXNlID0gJ2xpbmV3aXNlJ1xuICB0YXJnZXQgPSAnTW92ZVRvUmVsYXRpdmVMaW5lJ1xufVxuXG5jbGFzcyBZYW5rVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgWWFuayB7XG4gIHRhcmdldCA9ICdNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lJ1xufVxuXG4vLyBZYW5rIGRpZmYgaHVuayBhdCBjdXJzb3IgYnkgcmVtb3ZpbmcgbGVhZGluZyBcIitcIiBvciBcIi1cIiBmcm9tIGVhY2ggbGluZVxuY2xhc3MgWWFua0RpZmZIdW5rIGV4dGVuZHMgWWFuayB7XG4gIHRhcmdldCA9ICdJbm5lckRpZmZIdW5rJ1xuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIC8vIFJlbW92ZSBsZWFkaW5nIFwiK1wiIG9yIFwiLVwiIGluIGRpZmYgaHVua1xuICAgIGNvbnN0IHRleHRUb1lhbmsgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpLnJlcGxhY2UoL14uL2dtLCAnJylcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyKHRleHRUb1lhbmssIHNlbGVjdGlvbilcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbY3RybC1hXVxuY2xhc3MgSW5jcmVhc2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIHRhcmdldCA9ICdFbXB0eScgLy8gY3RybC1hIGluIG5vcm1hbC1tb2RlIGZpbmQgdGFyZ2V0IG51bWJlciBpbiBjdXJyZW50IGxpbmUgbWFudWFsbHlcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZSAvLyBkbyBtYW51YWxseVxuICByZXN0b3JlUG9zaXRpb25zID0gZmFsc2UgLy8gZG8gbWFudWFsbHlcbiAgc3RlcCA9IDFcblxuICBleGVjdXRlICgpIHtcbiAgICB0aGlzLm5ld1JhbmdlcyA9IFtdXG4gICAgaWYgKCF0aGlzLnJlZ2V4KSB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgJHt0aGlzLmdldENvbmZpZygnbnVtYmVyUmVnZXgnKX1gLCAnZycpXG5cbiAgICBzdXBlci5leGVjdXRlKClcblxuICAgIGlmICh0aGlzLm5ld1Jhbmdlcy5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZygnZmxhc2hPbk9wZXJhdGUnKSAmJiAhdGhpcy5nZXRDb25maWcoJ2ZsYXNoT25PcGVyYXRlQmxhY2tsaXN0JykuaW5jbHVkZXModGhpcy5uYW1lKSkge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLmZsYXNoKHRoaXMubmV3UmFuZ2VzLCB7dHlwZTogdGhpcy5mbGFzaFR5cGVGb3JPY2N1cnJlbmNlfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXBsYWNlTnVtYmVySW5CdWZmZXJSYW5nZSAoc2NhblJhbmdlLCBmbikge1xuICAgIGNvbnN0IG5ld1JhbmdlcyA9IFtdXG4gICAgdGhpcy5zY2FuRWRpdG9yKCdmb3J3YXJkJywgdGhpcy5yZWdleCwge3NjYW5SYW5nZX0sIGV2ZW50ID0+IHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICBpZiAoZm4oZXZlbnQpKSBldmVudC5zdG9wKClcbiAgICAgICAgZWxzZSByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IG5leHROdW1iZXIgPSB0aGlzLmdldE5leHROdW1iZXIoZXZlbnQubWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2goZXZlbnQucmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jhbmdlc1xuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uIChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGlmICh0aGlzLnRhcmdldC5uYW1lID09PSAnRW1wdHknKSB7XG4gICAgICAvLyBjdHJsLWEsIGN0cmwteCBpbiBgbm9ybWFsLW1vZGVgXG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBjb25zdCBzY2FuUmFuZ2UgPSB0aGlzLmVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhjdXJzb3JQb3NpdGlvbi5yb3cpXG4gICAgICBjb25zdCBuZXdSYW5nZXMgPSB0aGlzLnJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSwgZXZlbnQgPT5cbiAgICAgICAgZXZlbnQucmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oY3Vyc29yUG9zaXRpb24pXG4gICAgICApXG4gICAgICBjb25zdCBwb2ludCA9IChuZXdSYW5nZXMubGVuZ3RoICYmIG5ld1Jhbmdlc1swXS5lbmQudHJhbnNsYXRlKFswLCAtMV0pKSB8fCBjdXJzb3JQb3NpdGlvblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzY2FuUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgdGhpcy5uZXdSYW5nZXMucHVzaCguLi50aGlzLnJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSkpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc2NhblJhbmdlLnN0YXJ0KVxuICAgIH1cbiAgfVxuXG4gIGdldE5leHROdW1iZXIgKG51bWJlclN0cmluZykge1xuICAgIHJldHVybiBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMCkgKyB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgfVxufVxuXG4vLyBbY3RybC14XVxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZSB7XG4gIHN0ZXAgPSAtMVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbZyBjdHJsLWFdXG5jbGFzcyBJbmNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZWFzZSB7XG4gIGJhc2VOdW1iZXIgPSBudWxsXG4gIHRhcmdldCA9IG51bGxcblxuICBnZXROZXh0TnVtYmVyIChudW1iZXJTdHJpbmcpIHtcbiAgICBpZiAodGhpcy5iYXNlTnVtYmVyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYmFzZU51bWJlciArPSB0aGlzLnN0ZXAgKiB0aGlzLmdldENvdW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyID0gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJhc2VOdW1iZXJcbiAgfVxufVxuXG4vLyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXIge1xuICBzdGVwID0gLTFcbn1cblxuLy8gUHV0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDdXJzb3IgcGxhY2VtZW50OlxuLy8gLSBwbGFjZSBhdCBlbmQgb2YgbXV0YXRpb246IHBhc3RlIG5vbi1tdWx0aWxpbmUgY2hhcmFjdGVyd2lzZSB0ZXh0XG4vLyAtIHBsYWNlIGF0IHN0YXJ0IG9mIG11dGF0aW9uOiBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dChjaGFyYWN0ZXJ3aXNlLCBsaW5ld2lzZSlcbmNsYXNzIFB1dEJlZm9yZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgbG9jYXRpb24gPSAnYmVmb3JlJ1xuICB0YXJnZXQgPSAnRW1wdHknXG4gIGZsYXNoVHlwZSA9ICdvcGVyYXRvci1sb25nJ1xuICByZXN0b3JlUG9zaXRpb25zID0gZmFsc2UgLy8gbWFuYWdlIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2UgLy8gbWFuYWdlIG1hbnVhbGx5XG4gIHRyYWNrQ2hhbmdlID0gZmFsc2UgLy8gbWFuYWdlIG1hbnVhbGx5XG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uSW5pdGlhbGl6ZSh0aGlzKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSAoKSB7XG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbiA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc2VxdWVudGlhbFBhc3RlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uRXhlY3V0ZSh0aGlzKVxuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE11dGF0aW9uKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy5jYW5jZWxsZWQpIHRoaXMuYWRqdXN0Q3Vyc29yUG9zaXRpb24oKVxuICAgIH0pXG5cbiAgICBzdXBlci5leGVjdXRlKClcblxuICAgIGlmICh0aGlzLmNhbmNlbGxlZCkgcmV0dXJuXG5cbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgIC8vIFRyYWNrQ2hhbmdlXG4gICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIGlmIChuZXdSYW5nZSkgdGhpcy5zZXRNYXJrRm9yQ2hhbmdlKG5ld1JhbmdlKVxuXG4gICAgICAvLyBGbGFzaFxuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKCdmbGFzaE9uT3BlcmF0ZScpICYmICF0aGlzLmdldENvbmZpZygnZmxhc2hPbk9wZXJhdGVCbGFja2xpc3QnKS5pbmNsdWRlcyh0aGlzLm5hbWUpKSB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoc2VsZWN0aW9uID0+IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikpXG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFkanVzdEN1cnNvclBvc2l0aW9uICgpIHtcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGlmICghdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5oYXMoc2VsZWN0aW9uKSkgY29udGludWVcblxuICAgICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuICAgICAgaWYgKHRoaXMubGluZXdpc2VQYXN0ZSkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCBuZXdSYW5nZS5zdGFydC5yb3cpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobmV3UmFuZ2UuaXNTaW5nbGVMaW5lKCkpIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2UuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2Uuc3RhcnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBtdXRhdGVTZWxlY3Rpb24gKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uLCB0aGlzLnNlcXVlbnRpYWxQYXN0ZSlcbiAgICBpZiAoIXZhbHVlLnRleHQpIHtcbiAgICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgdGV4dFRvUGFzdGUgPSB2YWx1ZS50ZXh0LnJlcGVhdCh0aGlzLmdldENvdW50KCkpXG4gICAgdGhpcy5saW5ld2lzZVBhc3RlID0gdmFsdWUudHlwZSA9PT0gJ2xpbmV3aXNlJyB8fCB0aGlzLmlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMucGFzdGUoc2VsZWN0aW9uLCB0ZXh0VG9QYXN0ZSwge2xpbmV3aXNlUGFzdGU6IHRoaXMubGluZXdpc2VQYXN0ZX0pXG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gIH1cblxuICAvLyBSZXR1cm4gcGFzdGVkIHJhbmdlXG4gIHBhc3RlIChzZWxlY3Rpb24sIHRleHQsIHtsaW5ld2lzZVBhc3RlfSkge1xuICAgIGlmICh0aGlzLnNlcXVlbnRpYWxQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB9IGVsc2UgaWYgKGxpbmV3aXNlUGFzdGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH1cbiAgfVxuXG4gIHBhc3RlQ2hhcmFjdGVyd2lzZSAoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3Qge2N1cnNvcn0gPSBzZWxlY3Rpb25cbiAgICBpZiAoc2VsZWN0aW9uLmlzRW1wdHkoKSAmJiB0aGlzLmxvY2F0aW9uID09PSAnYWZ0ZXInICYmICF0aGlzLmlzRW1wdHlSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSkge1xuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgfVxuICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICB9XG5cbiAgLy8gUmV0dXJuIG5ld1JhbmdlXG4gIHBhc3RlTGluZXdpc2UgKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaWYgKCF0ZXh0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgdGV4dCArPSAnXFxuJ1xuICAgIH1cbiAgICBpZiAoc2VsZWN0aW9uLmlzRW1wdHkoKSkge1xuICAgICAgaWYgKHRoaXMubG9jYXRpb24gPT09ICdiZWZvcmUnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnV0aWxzLmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBbY3Vyc29yUm93LCAwXSwgdGV4dClcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sb2NhdGlvbiA9PT0gJ2FmdGVyJykge1xuICAgICAgICBjb25zdCB0YXJnZXRSb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yUm93KVxuICAgICAgICB0aGlzLnV0aWxzLmVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgdGFyZ2V0Um93KVxuICAgICAgICByZXR1cm4gdGhpcy51dGlscy5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW3RhcmdldFJvdyArIDEsIDBdLCB0ZXh0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKSkge1xuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCgnXFxuJylcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBQdXRBZnRlciBleHRlbmRzIFB1dEJlZm9yZSB7XG4gIGxvY2F0aW9uID0gJ2FmdGVyJ1xufVxuXG5jbGFzcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZSB7XG4gIHBhc3RlTGluZXdpc2UgKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IG5ld1JhbmdlID0gc3VwZXIucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgdGhpcy51dGlscy5hZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCh0aGlzLmVkaXRvciwgbmV3UmFuZ2UpXG4gICAgcmV0dXJuIG5ld1JhbmdlXG4gIH1cbn1cblxuY2xhc3MgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZVdpdGhBdXRvSW5kZW50IHtcbiAgbG9jYXRpb24gPSAnYWZ0ZXInXG59XG5cbmNsYXNzIEFkZEJsYW5rTGluZUJlbG93IGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHRhcmdldCA9ICdFbXB0eSdcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gdHJ1ZVxuICBzdGF5QnlNYXJrZXIgPSB0cnVlXG4gIHdoZXJlID0gJ2JlbG93J1xuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiAodGhpcy53aGVyZSA9PT0gJ2JlbG93JykgcG9pbnQucm93KytcbiAgICBwb2ludC5jb2x1bW4gPSAwXG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sICdcXG4nLnJlcGVhdCh0aGlzLmdldENvdW50KCkpKVxuICB9XG59XG5cbmNsYXNzIEFkZEJsYW5rTGluZUFib3ZlIGV4dGVuZHMgQWRkQmxhbmtMaW5lQmVsb3cge1xuICB3aGVyZSA9ICdhYm92ZSdcbn1cblxuY2xhc3MgUmVzb2x2ZUdpdENvbmZsaWN0IGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0YXJnZXQgPSAnRW1wdHknXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZSAvLyBkbyBtYW51YWxseVxuXG4gIG11dGF0ZVNlbGVjdGlvbiAoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCByYW5nZUluZm8gPSB0aGlzLmdldENvbmZsaWN0aW5nUmFuZ2VJbmZvKHBvaW50LnJvdylcblxuICAgIGlmIChyYW5nZUluZm8pIHtcbiAgICAgIGNvbnN0IHt3aG9sZSwgc2VjdGlvbk91cnMsIHNlY3Rpb25UaGVpcnMsIGJvZHlPdXJzLCBib2R5VGhlaXJzfSA9IHJhbmdlSW5mb1xuICAgICAgY29uc3QgcmVzb2x2ZUNvbmZsaWN0ID0gcmFuZ2UgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgIGNvbnN0IGRzdFJhbmdlID0gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKFt3aG9sZS5zdGFydC5yb3csIHdob2xlLmVuZC5yb3ddKVxuICAgICAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMuZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKGRzdFJhbmdlLCB0ZXh0ID8gdGV4dCArICdcXG4nIDogJycpXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obmV3UmFuZ2Uuc3RhcnQpXG4gICAgICB9XG4gICAgICAvLyBOT1RFOiBXaGVuIGN1cnNvciBpcyBhdCBzZXBhcmF0b3Igcm93ICc9PT09PT09Jywgbm8gcmVwbGFjZSBoYXBwZW5zIGJlY2F1c2UgaXQncyBhbWJpZ3VvdXMuXG4gICAgICBpZiAoc2VjdGlvbk91cnMuY29udGFpbnNQb2ludChwb2ludCkpIHtcbiAgICAgICAgcmVzb2x2ZUNvbmZsaWN0KGJvZHlPdXJzKVxuICAgICAgfSBlbHNlIGlmIChzZWN0aW9uVGhlaXJzLmNvbnRhaW5zUG9pbnQocG9pbnQpKSB7XG4gICAgICAgIHJlc29sdmVDb25mbGljdChib2R5VGhlaXJzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldENvbmZsaWN0aW5nUmFuZ2VJbmZvIChyb3cpIHtcbiAgICBjb25zdCBmcm9tID0gW3JvdywgSW5maW5pdHldXG4gICAgY29uc3QgY29uZmxpY3RTdGFydCA9IHRoaXMuZmluZEluRWRpdG9yKCdiYWNrd2FyZCcsIC9ePDw8PDw8PCAuKyQvLCB7ZnJvbX0sIGV2ZW50ID0+IGV2ZW50LnJhbmdlLnN0YXJ0KVxuXG4gICAgaWYgKGNvbmZsaWN0U3RhcnQpIHtcbiAgICAgIGNvbnN0IHN0YXJ0Um93ID0gY29uZmxpY3RTdGFydC5yb3dcbiAgICAgIGxldCBzZXBhcmF0b3JSb3csIGVuZFJvd1xuICAgICAgY29uc3QgZnJvbSA9IFtzdGFydFJvdyArIDEsIDBdXG4gICAgICBjb25zdCByZWdleCA9IC8oXjw8PDw8PDwgLiskKXwoXj09PT09PT0kKXwoXj4+Pj4+Pj4gLiskKS9nXG4gICAgICB0aGlzLnNjYW5FZGl0b3IoJ2ZvcndhcmQnLCByZWdleCwge2Zyb219LCAoe21hdGNoLCByYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgaWYgKG1hdGNoWzFdKSB7XG4gICAgICAgICAgLy8gaW5jb21wbGV0ZSBjb25mbGljdCBodW5rLCB3ZSBzYXcgbmV4dCBjb25mbGljdCBzdGFydFJvdyB3aWhvdXQgc2VlaW5nIGVuZFJvd1xuICAgICAgICAgIHN0b3AoKVxuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoWzJdKSB7XG4gICAgICAgICAgc2VwYXJhdG9yUm93ID0gcmFuZ2Uuc3RhcnQucm93XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbM10pIHtcbiAgICAgICAgICBlbmRSb3cgPSByYW5nZS5zdGFydC5yb3dcbiAgICAgICAgICBzdG9wKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGlmICghZW5kUm93KSByZXR1cm5cbiAgICAgIGNvbnN0IHdob2xlID0gbmV3IFJhbmdlKFtzdGFydFJvdywgMF0sIFtlbmRSb3csIEluZmluaXR5XSlcbiAgICAgIGNvbnN0IHNlY3Rpb25PdXJzID0gbmV3IFJhbmdlKHdob2xlLnN0YXJ0LCBbKHNlcGFyYXRvclJvdyB8fCBlbmRSb3cpIC0gMSwgSW5maW5pdHldKVxuICAgICAgY29uc3Qgc2VjdGlvblRoZWlycyA9IG5ldyBSYW5nZShbKHNlcGFyYXRvclJvdyB8fCBzdGFydFJvdykgKyAxLCAwXSwgd2hvbGUuZW5kKVxuXG4gICAgICBjb25zdCBib2R5T3Vyc1N0YXJ0ID0gc2VjdGlvbk91cnMuc3RhcnQudHJhbnNsYXRlKFsxLCAwXSlcbiAgICAgIGNvbnN0IGJvZHlPdXJzID1cbiAgICAgICAgc2VjdGlvbk91cnMuZ2V0Um93Q291bnQoKSA9PT0gMVxuICAgICAgICAgID8gbmV3IFJhbmdlKGJvZHlPdXJzU3RhcnQsIGJvZHlPdXJzU3RhcnQpXG4gICAgICAgICAgOiBuZXcgUmFuZ2UoYm9keU91cnNTdGFydCwgc2VjdGlvbk91cnMuZW5kKVxuXG4gICAgICBjb25zdCBib2R5VGhlaXJzID1cbiAgICAgICAgc2VjdGlvblRoZWlycy5nZXRSb3dDb3VudCgpID09PSAxXG4gICAgICAgICAgPyBuZXcgUmFuZ2Uoc2VjdGlvblRoZWlycy5zdGFydCwgc2VjdGlvblRoZWlycy5zdGFydClcbiAgICAgICAgICA6IHNlY3Rpb25UaGVpcnMudHJhbnNsYXRlKFswLCAwXSwgWy0xLCAwXSlcbiAgICAgIHJldHVybiB7d2hvbGUsIHNlY3Rpb25PdXJzLCBzZWN0aW9uVGhlaXJzLCBib2R5T3VycywgYm9keVRoZWlyc31cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE9wZXJhdG9yLFxuICBTZWxlY3RCYXNlLFxuICBTZWxlY3QsXG4gIFNlbGVjdExhdGVzdENoYW5nZSxcbiAgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24sXG4gIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24sXG4gIFNlbGVjdE9jY3VycmVuY2UsXG4gIFZpc3VhbE1vZGVTZWxlY3QsXG4gIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24sXG4gIFRvZ2dsZVBlcnNpc3RlbnRTZWxlY3Rpb24sXG4gIFRvZ2dsZVByZXNldE9jY3VycmVuY2UsXG4gIFRvZ2dsZVByZXNldFN1YndvcmRPY2N1cnJlbmNlLFxuICBBZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybixcbiAgRGVsZXRlLFxuICBEZWxldGVSaWdodCxcbiAgRGVsZXRlTGVmdCxcbiAgRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lLFxuICBEZWxldGVMaW5lLFxuICBZYW5rLFxuICBZYW5rTGluZSxcbiAgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSxcbiAgWWFua0RpZmZIdW5rLFxuICBJbmNyZWFzZSxcbiAgRGVjcmVhc2UsXG4gIEluY3JlbWVudE51bWJlcixcbiAgRGVjcmVtZW50TnVtYmVyLFxuICBQdXRCZWZvcmUsXG4gIFB1dEFmdGVyLFxuICBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCxcbiAgUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCxcbiAgQWRkQmxhbmtMaW5lQmVsb3csXG4gIEFkZEJsYW5rTGluZUFib3ZlLFxuICBSZXNvbHZlR2l0Q29uZmxpY3Rcbn1cbiJdfQ==