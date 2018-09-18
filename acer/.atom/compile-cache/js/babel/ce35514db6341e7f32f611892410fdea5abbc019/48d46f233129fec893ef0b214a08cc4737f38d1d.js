'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SearchModel = require('./search-model');

var _require = require('./motion');

var Motion = _require.Motion;

var SearchBase = (function (_Motion) {
  _inherits(SearchBase, _Motion);

  function SearchBase() {
    _classCallCheck(this, SearchBase);

    _get(Object.getPrototypeOf(SearchBase.prototype), 'constructor', this).apply(this, arguments);

    this.jump = true;
    this.backwards = false;
    this.useRegexp = true;
    this.landingPoint = null;
    this.defaultLandingPoint = 'start';
    this.relativeIndex = null;
    this.updatelastSearchPattern = true;
  }

  // /, ?
  // -------------------------

  _createClass(SearchBase, [{
    key: 'isBackwards',
    value: function isBackwards() {
      return this.backwards;
    }
  }, {
    key: 'resetState',
    value: function resetState() {
      _get(Object.getPrototypeOf(SearchBase.prototype), 'resetState', this).call(this);
      this.relativeIndex = null;
    }
  }, {
    key: 'isIncrementalSearch',
    value: function isIncrementalSearch() {
      return this['instanceof']('Search') && !this.repeated && this.getConfig('incrementalSearch');
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.onDidFinishOperation(function () {
        return _this.finish();
      });
      _get(Object.getPrototypeOf(SearchBase.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'getCount',
    value: function getCount() {
      return _get(Object.getPrototypeOf(SearchBase.prototype), 'getCount', this).call(this) * (this.isBackwards() ? -1 : 1);
    }
  }, {
    key: 'finish',
    value: function finish() {
      if (this.isIncrementalSearch() && this.getConfig('showHoverSearchCounter')) {
        this.vimState.hoverSearchCounter.reset();
      }
      if (this.searchModel) this.searchModel.destroy();

      this.relativeIndex = null;
      this.searchModel = null;
    }
  }, {
    key: 'getLandingPoint',
    value: function getLandingPoint() {
      if (!this.landingPoint) this.landingPoint = this.defaultLandingPoint;
      return this.landingPoint;
    }
  }, {
    key: 'getPoint',
    value: function getPoint(cursor) {
      if (this.searchModel) {
        this.relativeIndex = this.getCount() + this.searchModel.getRelativeIndex();
      } else if (this.relativeIndex == null) {
        this.relativeIndex = this.getCount();
      }

      var range = this.search(cursor, this.input, this.relativeIndex);

      this.searchModel.destroy();
      this.searchModel = null;

      if (range) return range[this.getLandingPoint()];
    }
  }, {
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      if (!this.input) return;
      var point = this.getPoint(cursor);

      if (point) {
        if (this.restoreEditorState) {
          this.restoreEditorState({ anchorPosition: point, skipRow: point.row });
          this.restoreEditorState = null; // HACK: dont refold on `n`, `N` repeat
        }
        cursor.setBufferPosition(point, { autoscroll: false });
      }

      if (!this.repeated) {
        this.globalState.set('currentSearch', this);
        this.vimState.searchHistory.save(this.input);
      }

      if (this.updatelastSearchPattern) {
        this.globalState.set('lastSearchPattern', this.getPattern(this.input));
      }
    }
  }, {
    key: 'getSearchModel',
    value: function getSearchModel() {
      if (!this.searchModel) {
        this.searchModel = new SearchModel(this.vimState, { incrementalSearch: this.isIncrementalSearch() });
      }
      return this.searchModel;
    }
  }, {
    key: 'search',
    value: function search(cursor, input, relativeIndex) {
      var searchModel = this.getSearchModel();
      if (input) {
        var fromPoint = this.getBufferPositionForCursor(cursor);
        return searchModel.search(fromPoint, this.getPattern(input), relativeIndex);
      }
      this.vimState.hoverSearchCounter.reset();
      searchModel.clearMarkers();
    }
  }], [{
    key: 'command',
    value: false,
    enumerable: true
  }]);

  return SearchBase;
})(Motion);

var Search = (function (_SearchBase) {
  _inherits(Search, _SearchBase);

  function Search() {
    _classCallCheck(this, Search);

    _get(Object.getPrototypeOf(Search.prototype), 'constructor', this).apply(this, arguments);

    this.caseSensitivityKind = 'Search';
    this.requireInput = true;
  }

  _createClass(Search, [{
    key: 'initialize',
    value: function initialize() {
      if (this.isIncrementalSearch()) {
        this.restoreEditorState = this.utils.saveEditorState(this.editor);
        this.onDidCommandSearch(this.handleCommandEvent.bind(this));
      }

      this.onDidConfirmSearch(this.handleConfirmSearch.bind(this));
      this.onDidCancelSearch(this.handleCancelSearch.bind(this));
      this.onDidChangeSearch(this.handleChangeSearch.bind(this));

      this.focusSearchInputEditor();

      _get(Object.getPrototypeOf(Search.prototype), 'initialize', this).call(this);
    }
  }, {
    key: 'focusSearchInputEditor',
    value: function focusSearchInputEditor() {
      var classList = this.isBackwards() ? ['backwards'] : [];
      this.vimState.searchInput.focus({ classList: classList });
    }
  }, {
    key: 'handleCommandEvent',
    value: function handleCommandEvent(event) {
      if (!event.input) return;

      if (event.name === 'visit') {
        var direction = event.direction;

        if (this.isBackwards() && this.getConfig('incrementalSearchVisitDirection') === 'relative') {
          direction = direction === 'next' ? 'prev' : 'next';
        }
        this.getSearchModel().visit(direction === 'next' ? +1 : -1);
      } else if (event.name === 'occurrence') {
        var operation = event.operation;
        var input = event.input;

        this.occurrenceManager.addPattern(this.getPattern(input), { reset: operation != null });
        this.occurrenceManager.saveLastPattern();

        this.vimState.searchHistory.save(input);
        this.vimState.searchInput.cancel();
        if (operation != null) this.vimState.operationStack.run(operation);
      } else if (event.name === 'project-find') {
        this.vimState.searchHistory.save(event.input);
        this.vimState.searchInput.cancel();
        this.utils.searchByProjectFind(this.editor, event.input);
      }
    }
  }, {
    key: 'handleCancelSearch',
    value: function handleCancelSearch() {
      if (!['visual', 'insert'].includes(this.mode)) this.vimState.resetNormalMode();

      if (this.restoreEditorState) this.restoreEditorState();
      this.vimState.reset();
      this.finish();
    }
  }, {
    key: 'isSearchRepeatCharacter',
    value: function isSearchRepeatCharacter(char) {
      return this.isIncrementalSearch() ? char === '' : ['', this.isBackwards() ? '?' : '/'].includes(char); // empty confirm or invoking-char
    }
  }, {
    key: 'handleConfirmSearch',
    value: function handleConfirmSearch(_ref) {
      var input = _ref.input;
      var landingPoint = _ref.landingPoint;

      this.input = input;
      this.landingPoint = landingPoint;
      if (this.isSearchRepeatCharacter(this.input)) {
        this.input = this.vimState.searchHistory.get('prev');
        if (!this.input) atom.beep();
      }
      this.processOperation();
    }
  }, {
    key: 'handleChangeSearch',
    value: function handleChangeSearch(input) {
      // If input starts with space, remove first space and disable useRegexp.
      if (input.startsWith(' ')) {
        // FIXME: Sould I remove this unknown hack and implement visible button to togle regexp?
        input = input.replace(/^ /, '');
        this.useRegexp = false;
      }
      this.vimState.searchInput.updateOptionSettings({ useRegexp: this.useRegexp });

      if (this.isIncrementalSearch()) {
        this.search(this.editor.getLastCursor(), input, this.getCount());
      }
    }
  }, {
    key: 'getPattern',
    value: function getPattern(term) {
      var modifiers = this.isCaseSensitive(term) ? 'g' : 'gi';
      // FIXME this prevent search \\c itself.
      // DONT thinklessly mimic pure Vim. Instead, provide ignorecase button and shortcut.
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        if (!modifiers.includes('i')) modifiers += 'i';
      }

      if (this.useRegexp) {
        try {
          return new RegExp(term, modifiers);
        } catch (error) {}
      }
      return new RegExp(this._.escapeRegExp(term), modifiers);
    }
  }]);

  return Search;
})(SearchBase);

var SearchBackwards = (function (_Search) {
  _inherits(SearchBackwards, _Search);

  function SearchBackwards() {
    _classCallCheck(this, SearchBackwards);

    _get(Object.getPrototypeOf(SearchBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.backwards = true;
  }

  // *, #
  // -------------------------
  return SearchBackwards;
})(Search);

var SearchCurrentWord = (function (_SearchBase2) {
  _inherits(SearchCurrentWord, _SearchBase2);

  function SearchCurrentWord() {
    _classCallCheck(this, SearchCurrentWord);

    _get(Object.getPrototypeOf(SearchCurrentWord.prototype), 'constructor', this).apply(this, arguments);

    this.caseSensitivityKind = 'SearchCurrentWord';
  }

  _createClass(SearchCurrentWord, [{
    key: 'moveCursor',
    value: function moveCursor(cursor) {
      if (this.input == null) {
        var wordRange = this.getCurrentWordBufferRange();
        if (wordRange) {
          this.editor.setCursorBufferPosition(wordRange.start);
          this.input = this.editor.getTextInBufferRange(wordRange);
        } else {
          this.input = '';
        }
      }

      _get(Object.getPrototypeOf(SearchCurrentWord.prototype), 'moveCursor', this).call(this, cursor);
    }
  }, {
    key: 'getPattern',
    value: function getPattern(term) {
      var escaped = this._.escapeRegExp(term);
      var source = /\W/.test(term) ? escaped + '\\b' : '\\b' + escaped + '\\b';
      return new RegExp(source, this.isCaseSensitive(term) ? 'g' : 'gi');
    }
  }, {
    key: 'getCurrentWordBufferRange',
    value: function getCurrentWordBufferRange() {
      var cursor = this.editor.getLastCursor();
      var point = cursor.getBufferPosition();

      var nonWordCharacters = this.utils.getNonWordCharactersForCursor(cursor);
      var regex = new RegExp('[^\\s' + this._.escapeRegExp(nonWordCharacters) + ']+', 'g');
      var options = { from: [point.row, 0], allowNextLine: false };
      return this.findInEditor('forward', regex, options, function (_ref2) {
        var range = _ref2.range;
        return range.end.isGreaterThan(point) && range;
      });
    }
  }]);

  return SearchCurrentWord;
})(SearchBase);

var SearchCurrentWordBackwards = (function (_SearchCurrentWord) {
  _inherits(SearchCurrentWordBackwards, _SearchCurrentWord);

  function SearchCurrentWordBackwards() {
    _classCallCheck(this, SearchCurrentWordBackwards);

    _get(Object.getPrototypeOf(SearchCurrentWordBackwards.prototype), 'constructor', this).apply(this, arguments);

    this.backwards = true;
  }

  return SearchCurrentWordBackwards;
})(SearchCurrentWord);

module.exports = {
  SearchBase: SearchBase,
  Search: Search,
  SearchBackwards: SearchBackwards,
  SearchCurrentWord: SearchCurrentWord,
  SearchCurrentWordBackwards: SearchCurrentWordBackwards
};
// ['start' or 'end']
// ['start' or 'end']
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7QUFFWCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTs7ZUFDNUIsT0FBTyxDQUFDLFVBQVUsQ0FBQzs7SUFBN0IsTUFBTSxZQUFOLE1BQU07O0lBRVAsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTswQkFBVixVQUFVOzsrQkFBVixVQUFVOztTQUVkLElBQUksR0FBRyxJQUFJO1NBQ1gsU0FBUyxHQUFHLEtBQUs7U0FDakIsU0FBUyxHQUFHLElBQUk7U0FDaEIsWUFBWSxHQUFHLElBQUk7U0FDbkIsbUJBQW1CLEdBQUcsT0FBTztTQUM3QixhQUFhLEdBQUcsSUFBSTtTQUNwQix1QkFBdUIsR0FBRyxJQUFJOzs7Ozs7ZUFSMUIsVUFBVTs7V0FVRix1QkFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtLQUN0Qjs7O1dBRVUsc0JBQUc7QUFDWixpQ0FmRSxVQUFVLDRDQWVNO0FBQ2xCLFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0tBQzFCOzs7V0FFbUIsK0JBQUc7QUFDckIsYUFBTyxJQUFJLGNBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0tBQzFGOzs7V0FFVSxzQkFBRzs7O0FBQ1osVUFBSSxDQUFDLG9CQUFvQixDQUFDO2VBQU0sTUFBSyxNQUFNLEVBQUU7T0FBQSxDQUFDLENBQUE7QUFDOUMsaUNBekJFLFVBQVUsNENBeUJNO0tBQ25COzs7V0FFUSxvQkFBRztBQUNWLGFBQU8sMkJBN0JMLFVBQVUsNkNBNkJlLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUEs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QUFBO0FBQzVELGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFDLEtBQU87WUFBTixLQUFLLEdBQU4sS0FBTyxDQUFOLEtBQUs7ZUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLO09BQUEsQ0FBQyxDQUFBO0tBQzFHOzs7U0EvQkcsaUJBQWlCO0dBQVMsVUFBVTs7SUFrQ3BDLDBCQUEwQjtZQUExQiwwQkFBMEI7O1dBQTFCLDBCQUEwQjswQkFBMUIsMEJBQTBCOzsrQkFBMUIsMEJBQTBCOztTQUM5QixTQUFTLEdBQUcsSUFBSTs7O1NBRFosMEJBQTBCO0dBQVMsaUJBQWlCOztBQUkxRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsWUFBVSxFQUFWLFVBQVU7QUFDVixRQUFNLEVBQU4sTUFBTTtBQUNOLGlCQUFlLEVBQWYsZUFBZTtBQUNmLG1CQUFpQixFQUFqQixpQkFBaUI7QUFDakIsNEJBQTBCLEVBQTFCLDBCQUEwQjtDQUMzQixDQUFBIiwiZmlsZSI6Ii9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvbW90aW9uLXNlYXJjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmNvbnN0IFNlYXJjaE1vZGVsID0gcmVxdWlyZSgnLi9zZWFyY2gtbW9kZWwnKVxuY29uc3Qge01vdGlvbn0gPSByZXF1aXJlKCcuL21vdGlvbicpXG5cbmNsYXNzIFNlYXJjaEJhc2UgZXh0ZW5kcyBNb3Rpb24ge1xuICBzdGF0aWMgY29tbWFuZCA9IGZhbHNlXG4gIGp1bXAgPSB0cnVlXG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIHVzZVJlZ2V4cCA9IHRydWVcbiAgbGFuZGluZ1BvaW50ID0gbnVsbCAvLyBbJ3N0YXJ0JyBvciAnZW5kJ11cbiAgZGVmYXVsdExhbmRpbmdQb2ludCA9ICdzdGFydCcgLy8gWydzdGFydCcgb3IgJ2VuZCddXG4gIHJlbGF0aXZlSW5kZXggPSBudWxsXG4gIHVwZGF0ZWxhc3RTZWFyY2hQYXR0ZXJuID0gdHJ1ZVxuXG4gIGlzQmFja3dhcmRzICgpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrd2FyZHNcbiAgfVxuXG4gIHJlc2V0U3RhdGUgKCkge1xuICAgIHN1cGVyLnJlc2V0U3RhdGUoKVxuICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IG51bGxcbiAgfVxuXG4gIGlzSW5jcmVtZW50YWxTZWFyY2ggKCkge1xuICAgIHJldHVybiB0aGlzLmluc3RhbmNlb2YoJ1NlYXJjaCcpICYmICF0aGlzLnJlcGVhdGVkICYmIHRoaXMuZ2V0Q29uZmlnKCdpbmNyZW1lbnRhbFNlYXJjaCcpXG4gIH1cblxuICBpbml0aWFsaXplICgpIHtcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHRoaXMuZmluaXNoKCkpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBnZXRDb3VudCAoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldENvdW50KCkgKiAodGhpcy5pc0JhY2t3YXJkcygpID8gLTEgOiAxKVxuICB9XG5cbiAgZmluaXNoICgpIHtcbiAgICBpZiAodGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCkgJiYgdGhpcy5nZXRDb25maWcoJ3Nob3dIb3ZlclNlYXJjaENvdW50ZXInKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIH1cbiAgICBpZiAodGhpcy5zZWFyY2hNb2RlbCkgdGhpcy5zZWFyY2hNb2RlbC5kZXN0cm95KClcblxuICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IG51bGxcbiAgICB0aGlzLnNlYXJjaE1vZGVsID0gbnVsbFxuICB9XG5cbiAgZ2V0TGFuZGluZ1BvaW50ICgpIHtcbiAgICBpZiAoIXRoaXMubGFuZGluZ1BvaW50KSB0aGlzLmxhbmRpbmdQb2ludCA9IHRoaXMuZGVmYXVsdExhbmRpbmdQb2ludFxuICAgIHJldHVybiB0aGlzLmxhbmRpbmdQb2ludFxuICB9XG5cbiAgZ2V0UG9pbnQgKGN1cnNvcikge1xuICAgIGlmICh0aGlzLnNlYXJjaE1vZGVsKSB7XG4gICAgICB0aGlzLnJlbGF0aXZlSW5kZXggPSB0aGlzLmdldENvdW50KCkgKyB0aGlzLnNlYXJjaE1vZGVsLmdldFJlbGF0aXZlSW5kZXgoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5yZWxhdGl2ZUluZGV4ID09IG51bGwpIHtcbiAgICAgIHRoaXMucmVsYXRpdmVJbmRleCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIH1cblxuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5zZWFyY2goY3Vyc29yLCB0aGlzLmlucHV0LCB0aGlzLnJlbGF0aXZlSW5kZXgpXG5cbiAgICB0aGlzLnNlYXJjaE1vZGVsLmRlc3Ryb3koKVxuICAgIHRoaXMuc2VhcmNoTW9kZWwgPSBudWxsXG5cbiAgICBpZiAocmFuZ2UpIHJldHVybiByYW5nZVt0aGlzLmdldExhbmRpbmdQb2ludCgpXVxuICB9XG5cbiAgbW92ZUN1cnNvciAoY3Vyc29yKSB7XG4gICAgaWYgKCF0aGlzLmlucHV0KSByZXR1cm5cbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yKVxuXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICBpZiAodGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUpIHtcbiAgICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoe2FuY2hvclBvc2l0aW9uOiBwb2ludCwgc2tpcFJvdzogcG9pbnQucm93fSlcbiAgICAgICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsIC8vIEhBQ0s6IGRvbnQgcmVmb2xkIG9uIGBuYCwgYE5gIHJlcGVhdFxuICAgICAgfVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuICAgIH1cblxuICAgIGlmICghdGhpcy5yZXBlYXRlZCkge1xuICAgICAgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoJ2N1cnJlbnRTZWFyY2gnLCB0aGlzKVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUodGhpcy5pbnB1dClcbiAgICB9XG5cbiAgICBpZiAodGhpcy51cGRhdGVsYXN0U2VhcmNoUGF0dGVybikge1xuICAgICAgdGhpcy5nbG9iYWxTdGF0ZS5zZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJywgdGhpcy5nZXRQYXR0ZXJuKHRoaXMuaW5wdXQpKVxuICAgIH1cbiAgfVxuXG4gIGdldFNlYXJjaE1vZGVsICgpIHtcbiAgICBpZiAoIXRoaXMuc2VhcmNoTW9kZWwpIHtcbiAgICAgIHRoaXMuc2VhcmNoTW9kZWwgPSBuZXcgU2VhcmNoTW9kZWwodGhpcy52aW1TdGF0ZSwge2luY3JlbWVudGFsU2VhcmNoOiB0aGlzLmlzSW5jcmVtZW50YWxTZWFyY2goKX0pXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNlYXJjaE1vZGVsXG4gIH1cblxuICBzZWFyY2ggKGN1cnNvciwgaW5wdXQsIHJlbGF0aXZlSW5kZXgpIHtcbiAgICBjb25zdCBzZWFyY2hNb2RlbCA9IHRoaXMuZ2V0U2VhcmNoTW9kZWwoKVxuICAgIGlmIChpbnB1dCkge1xuICAgICAgY29uc3QgZnJvbVBvaW50ID0gdGhpcy5nZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpXG4gICAgICByZXR1cm4gc2VhcmNoTW9kZWwuc2VhcmNoKGZyb21Qb2ludCwgdGhpcy5nZXRQYXR0ZXJuKGlucHV0KSwgcmVsYXRpdmVJbmRleClcbiAgICB9XG4gICAgdGhpcy52aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgIHNlYXJjaE1vZGVsLmNsZWFyTWFya2VycygpXG4gIH1cbn1cblxuLy8gLywgP1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoIGV4dGVuZHMgU2VhcmNoQmFzZSB7XG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSAnU2VhcmNoJ1xuICByZXF1aXJlSW5wdXQgPSB0cnVlXG5cbiAgaW5pdGlhbGl6ZSAoKSB7XG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpKSB7XG4gICAgICB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSA9IHRoaXMudXRpbHMuc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgdGhpcy5vbkRpZENvbW1hbmRTZWFyY2godGhpcy5oYW5kbGVDb21tYW5kRXZlbnQuYmluZCh0aGlzKSlcbiAgICB9XG5cbiAgICB0aGlzLm9uRGlkQ29uZmlybVNlYXJjaCh0aGlzLmhhbmRsZUNvbmZpcm1TZWFyY2guYmluZCh0aGlzKSlcbiAgICB0aGlzLm9uRGlkQ2FuY2VsU2VhcmNoKHRoaXMuaGFuZGxlQ2FuY2VsU2VhcmNoLmJpbmQodGhpcykpXG4gICAgdGhpcy5vbkRpZENoYW5nZVNlYXJjaCh0aGlzLmhhbmRsZUNoYW5nZVNlYXJjaC5iaW5kKHRoaXMpKVxuXG4gICAgdGhpcy5mb2N1c1NlYXJjaElucHV0RWRpdG9yKClcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZm9jdXNTZWFyY2hJbnB1dEVkaXRvciAoKSB7XG4gICAgY29uc3QgY2xhc3NMaXN0ID0gdGhpcy5pc0JhY2t3YXJkcygpID8gWydiYWNrd2FyZHMnXSA6IFtdXG4gICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC5mb2N1cyh7Y2xhc3NMaXN0fSlcbiAgfVxuXG4gIGhhbmRsZUNvbW1hbmRFdmVudCAoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LmlucHV0KSByZXR1cm5cblxuICAgIGlmIChldmVudC5uYW1lID09PSAndmlzaXQnKSB7XG4gICAgICBsZXQge2RpcmVjdGlvbn0gPSBldmVudFxuICAgICAgaWYgKHRoaXMuaXNCYWNrd2FyZHMoKSAmJiB0aGlzLmdldENvbmZpZygnaW5jcmVtZW50YWxTZWFyY2hWaXNpdERpcmVjdGlvbicpID09PSAncmVsYXRpdmUnKSB7XG4gICAgICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PT0gJ25leHQnID8gJ3ByZXYnIDogJ25leHQnXG4gICAgICB9XG4gICAgICB0aGlzLmdldFNlYXJjaE1vZGVsKCkudmlzaXQoZGlyZWN0aW9uID09PSAnbmV4dCcgPyArMSA6IC0xKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQubmFtZSA9PT0gJ29jY3VycmVuY2UnKSB7XG4gICAgICBjb25zdCB7b3BlcmF0aW9uLCBpbnB1dH0gPSBldmVudFxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5hZGRQYXR0ZXJuKHRoaXMuZ2V0UGF0dGVybihpbnB1dCksIHtyZXNldDogb3BlcmF0aW9uICE9IG51bGx9KVxuICAgICAgdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zYXZlTGFzdFBhdHRlcm4oKVxuXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3Rvcnkuc2F2ZShpbnB1dClcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgIGlmIChvcGVyYXRpb24gIT0gbnVsbCkgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4ob3BlcmF0aW9uKVxuICAgIH0gZWxzZSBpZiAoZXZlbnQubmFtZSA9PT0gJ3Byb2plY3QtZmluZCcpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSGlzdG9yeS5zYXZlKGV2ZW50LmlucHV0KVxuICAgICAgdGhpcy52aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgdGhpcy51dGlscy5zZWFyY2hCeVByb2plY3RGaW5kKHRoaXMuZWRpdG9yLCBldmVudC5pbnB1dClcbiAgICB9XG4gIH1cblxuICBoYW5kbGVDYW5jZWxTZWFyY2ggKCkge1xuICAgIGlmICghWyd2aXN1YWwnLCAnaW5zZXJ0J10uaW5jbHVkZXModGhpcy5tb2RlKSkgdGhpcy52aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuXG4gICAgaWYgKHRoaXMucmVzdG9yZUVkaXRvclN0YXRlKSB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgdGhpcy52aW1TdGF0ZS5yZXNldCgpXG4gICAgdGhpcy5maW5pc2goKVxuICB9XG5cbiAgaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIgKGNoYXIpIHtcbiAgICByZXR1cm4gdGhpcy5pc0luY3JlbWVudGFsU2VhcmNoKCkgPyBjaGFyID09PSAnJyA6IFsnJywgdGhpcy5pc0JhY2t3YXJkcygpID8gJz8nIDogJy8nXS5pbmNsdWRlcyhjaGFyKSAvLyBlbXB0eSBjb25maXJtIG9yIGludm9raW5nLWNoYXJcbiAgfVxuXG4gIGhhbmRsZUNvbmZpcm1TZWFyY2ggKHtpbnB1dCwgbGFuZGluZ1BvaW50fSkge1xuICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgIHRoaXMubGFuZGluZ1BvaW50ID0gbGFuZGluZ1BvaW50XG4gICAgaWYgKHRoaXMuaXNTZWFyY2hSZXBlYXRDaGFyYWN0ZXIodGhpcy5pbnB1dCkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLnZpbVN0YXRlLnNlYXJjaEhpc3RvcnkuZ2V0KCdwcmV2JylcbiAgICAgIGlmICghdGhpcy5pbnB1dCkgYXRvbS5iZWVwKClcbiAgICB9XG4gICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgfVxuXG4gIGhhbmRsZUNoYW5nZVNlYXJjaCAoaW5wdXQpIHtcbiAgICAvLyBJZiBpbnB1dCBzdGFydHMgd2l0aCBzcGFjZSwgcmVtb3ZlIGZpcnN0IHNwYWNlIGFuZCBkaXNhYmxlIHVzZVJlZ2V4cC5cbiAgICBpZiAoaW5wdXQuc3RhcnRzV2l0aCgnICcpKSB7XG4gICAgICAvLyBGSVhNRTogU291bGQgSSByZW1vdmUgdGhpcyB1bmtub3duIGhhY2sgYW5kIGltcGxlbWVudCB2aXNpYmxlIGJ1dHRvbiB0byB0b2dsZSByZWdleHA/XG4gICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL14gLywgJycpXG4gICAgICB0aGlzLnVzZVJlZ2V4cCA9IGZhbHNlXG4gICAgfVxuICAgIHRoaXMudmltU3RhdGUuc2VhcmNoSW5wdXQudXBkYXRlT3B0aW9uU2V0dGluZ3Moe3VzZVJlZ2V4cDogdGhpcy51c2VSZWdleHB9KVxuXG4gICAgaWYgKHRoaXMuaXNJbmNyZW1lbnRhbFNlYXJjaCgpKSB7XG4gICAgICB0aGlzLnNlYXJjaCh0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCksIGlucHV0LCB0aGlzLmdldENvdW50KCkpXG4gICAgfVxuICB9XG5cbiAgZ2V0UGF0dGVybiAodGVybSkge1xuICAgIGxldCBtb2RpZmllcnMgPSB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/ICdnJyA6ICdnaSdcbiAgICAvLyBGSVhNRSB0aGlzIHByZXZlbnQgc2VhcmNoIFxcXFxjIGl0c2VsZi5cbiAgICAvLyBET05UIHRoaW5rbGVzc2x5IG1pbWljIHB1cmUgVmltLiBJbnN0ZWFkLCBwcm92aWRlIGlnbm9yZWNhc2UgYnV0dG9uIGFuZCBzaG9ydGN1dC5cbiAgICBpZiAodGVybS5pbmRleE9mKCdcXFxcYycpID49IDApIHtcbiAgICAgIHRlcm0gPSB0ZXJtLnJlcGxhY2UoJ1xcXFxjJywgJycpXG4gICAgICBpZiAoIW1vZGlmaWVycy5pbmNsdWRlcygnaScpKSBtb2RpZmllcnMgKz0gJ2knXG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXNlUmVnZXhwKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cCh0ZXJtLCBtb2RpZmllcnMpXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAodGhpcy5fLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kaWZpZXJzKVxuICB9XG59XG5cbmNsYXNzIFNlYXJjaEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaCB7XG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblxuLy8gKiwgI1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoQ3VycmVudFdvcmQgZXh0ZW5kcyBTZWFyY2hCYXNlIHtcbiAgY2FzZVNlbnNpdGl2aXR5S2luZCA9ICdTZWFyY2hDdXJyZW50V29yZCdcblxuICBtb3ZlQ3Vyc29yIChjdXJzb3IpIHtcbiAgICBpZiAodGhpcy5pbnB1dCA9PSBudWxsKSB7XG4gICAgICBjb25zdCB3b3JkUmFuZ2UgPSB0aGlzLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgKHdvcmRSYW5nZSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbih3b3JkUmFuZ2Uuc3RhcnQpXG4gICAgICAgIHRoaXMuaW5wdXQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZSh3b3JkUmFuZ2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmlucHV0ID0gJydcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxuXG4gIGdldFBhdHRlcm4gKHRlcm0pIHtcbiAgICBjb25zdCBlc2NhcGVkID0gdGhpcy5fLmVzY2FwZVJlZ0V4cCh0ZXJtKVxuICAgIGNvbnN0IHNvdXJjZSA9IC9cXFcvLnRlc3QodGVybSkgPyBgJHtlc2NhcGVkfVxcXFxiYCA6IGBcXFxcYiR7ZXNjYXBlZH1cXFxcYmBcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIHRoaXMuaXNDYXNlU2Vuc2l0aXZlKHRlcm0pID8gJ2cnIDogJ2dpJylcbiAgfVxuXG4gIGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UgKCkge1xuICAgIGNvbnN0IGN1cnNvciA9IHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIGNvbnN0IG5vbldvcmRDaGFyYWN0ZXJzID0gdGhpcy51dGlscy5nZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvcihjdXJzb3IpXG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBbXlxcXFxzJHt0aGlzLl8uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK2AsICdnJylcbiAgICBjb25zdCBvcHRpb25zID0ge2Zyb206IFtwb2ludC5yb3csIDBdLCBhbGxvd05leHRMaW5lOiBmYWxzZX1cbiAgICByZXR1cm4gdGhpcy5maW5kSW5FZGl0b3IoJ2ZvcndhcmQnLCByZWdleCwgb3B0aW9ucywgKHtyYW5nZX0pID0+IHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KSAmJiByYW5nZSlcbiAgfVxufVxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkcyBleHRlbmRzIFNlYXJjaEN1cnJlbnRXb3JkIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgU2VhcmNoQmFzZSxcbiAgU2VhcmNoLFxuICBTZWFyY2hCYWNrd2FyZHMsXG4gIFNlYXJjaEN1cnJlbnRXb3JkLFxuICBTZWFyY2hDdXJyZW50V29yZEJhY2t3YXJkc1xufVxuIl19