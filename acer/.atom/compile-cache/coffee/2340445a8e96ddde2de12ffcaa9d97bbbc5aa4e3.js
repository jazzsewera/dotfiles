(function() {
  var TextData, dispatch, getView, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Motion Search", function() {
    var editor, editorElement, ensure, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4];
    beforeEach(function() {
      jasmine.attachToDOM(getView(atom.workspace));
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, _vim;
      });
    });
    describe("the / keybinding", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = {
          activate: jasmine.createSpy("activate")
        };
        set({
          text: "abc\ndef\nabc\ndef\n",
          cursor: [0, 0]
        });
        return spyOn(atom.workspace, 'getActivePane').andReturn(pane);
      });
      describe("as a motion", function() {
        it("moves the cursor to the specified search pattern", function() {
          ensure('/ def enter', {
            cursor: [1, 0]
          });
          return expect(pane.activate).toHaveBeenCalled();
        });
        it("loops back around", function() {
          set({
            cursor: [3, 0]
          });
          return ensure('/ def enter', {
            cursor: [1, 0]
          });
        });
        it("uses a valid regex as a regex", function() {
          ensure('/ [abc] enter', {
            cursor: [0, 1]
          });
          return ensure('n', {
            cursor: [0, 2]
          });
        });
        it("uses an invalid regex as a literal string", function() {
          set({
            text: "abc\n[abc]\n"
          });
          ensure('/ [abc enter', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [1, 0]
          });
        });
        it("uses ? as a literal string", function() {
          set({
            text: "abc\n[a?c?\n"
          });
          ensure('/ ? enter', {
            cursor: [1, 2]
          });
          return ensure('n', {
            cursor: [1, 4]
          });
        });
        it('works with selection in visual mode', function() {
          set({
            text: 'one two three'
          });
          ensure('v / th enter', {
            cursor: [0, 9]
          });
          return ensure('d', {
            text: 'hree'
          });
        });
        it('extends selection when repeating search in visual mode', function() {
          set({
            text: "line1\nline2\nline3"
          });
          ensure('v / line enter', {
            selectedBufferRange: [[0, 0], [1, 1]]
          });
          return ensure('n', {
            selectedBufferRange: [[0, 0], [2, 1]]
          });
        });
        it('searches to the correct column in visual linewise mode', function() {
          return ensure('V / ef enter', {
            selectedText: "abc\ndef\n",
            propertyHead: [1, 1],
            cursor: [2, 0],
            mode: ['visual', 'linewise']
          });
        });
        it('not extend linwise selection if search matches on same line', function() {
          set({
            text: "abc def\ndef\n"
          });
          return ensure('V / ef enter', {
            selectedText: "abc def\n"
          });
        });
        describe("case sensitivity", function() {
          beforeEach(function() {
            return set({
              text: "\nabc\nABC\n",
              cursor: [0, 0]
            });
          });
          it("works in case sensitive mode", function() {
            ensure('/ ABC enter', {
              cursor: [2, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode", function() {
            ensure('/ \\cAbC enter', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          it("works in case insensitive mode wherever \\c is", function() {
            ensure('/ AbC\\c enter', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [2, 0]
            });
          });
          describe("when ignoreCaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('ignoreCaseForSearch', true);
            });
            it("ignore case when search [case-1]", function() {
              ensure('/ abc enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when search [case-2]", function() {
              ensure('/ ABC enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
          return describe("when useSmartcaseForSearch is enabled", function() {
            beforeEach(function() {
              return settings.set('useSmartcaseForSearch', true);
            });
            it("ignore case when searh term includes A-Z", function() {
              ensure('/ ABC enter', {
                cursor: [2, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', false);
              ensure('/ abc enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
            return it("ignore case when searh term NOT includes A-Z regardress of `ignoreCaseForSearch`", function() {
              settings.set('ignoreCaseForSearch', true);
              ensure('/ abc enter', {
                cursor: [1, 0]
              });
              return ensure('n', {
                cursor: [2, 0]
              });
            });
          });
        });
        describe("repeating", function() {
          return it("does nothing with no search history", function() {
            set({
              cursor: [0, 0]
            });
            ensure('n', {
              cursor: [0, 0]
            });
            set({
              cursor: [1, 1]
            });
            return ensure('n', {
              cursor: [1, 1]
            });
          });
        });
        describe("repeating with search history", function() {
          beforeEach(function() {
            return ensure('/ def enter');
          });
          it("repeats previous search with /<enter>", function() {
            return ensure('/  enter', {
              cursor: [3, 0]
            });
          });
          describe("non-incrementalSearch only feature", function() {
            beforeEach(function() {
              return settings.set("incrementalSearch", false);
            });
            return it("repeats previous search with //", function() {
              return ensure('/ / enter', {
                cursor: [3, 0]
              });
            });
          });
          describe("the n keybinding", function() {
            return it("repeats the last search", function() {
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe("the N keybinding", function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              ensure('N', {
                cursor: [3, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
        return describe("composing", function() {
          it("composes with operators", function() {
            return ensure('d / def enter', {
              text: "def\nabc\ndef\n"
            });
          });
          return it("repeats correctly with operators", function() {
            ensure('d / def enter', {
              text: "def\nabc\ndef\n"
            });
            return ensure('.', {
              text: "def\n"
            });
          });
        });
      });
      describe("when reversed as ?", function() {
        it("moves the cursor backwards to the specified search pattern", function() {
          return ensure('? def enter', {
            cursor: [3, 0]
          });
        });
        it("accepts / as a literal search pattern", function() {
          set({
            text: "abc\nd/f\nabc\nd/f\n",
            cursor: [0, 0]
          });
          ensure('? / enter', {
            cursor: [3, 1]
          });
          return ensure('? / enter', {
            cursor: [1, 1]
          });
        });
        return describe("repeating", function() {
          beforeEach(function() {
            return ensure('? def enter');
          });
          it("repeats previous search as reversed with ?<enter>", function() {
            return ensure("? enter", {
              cursor: [1, 0]
            });
          });
          describe("non-incrementalSearch only feature", function() {
            beforeEach(function() {
              return settings.set("incrementalSearch", false);
            });
            return it("repeats previous search as reversed with ??", function() {
              return ensure('? ? enter', {
                cursor: [1, 0]
              });
            });
          });
          describe('the n keybinding', function() {
            return it("repeats the last search backwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('n', {
                cursor: [3, 0]
              });
            });
          });
          return describe('the N keybinding', function() {
            return it("repeats the last search forwards", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('N', {
                cursor: [1, 0]
              });
            });
          });
        });
      });
      describe("using search history", function() {
        var ensureInputEditor, inputEditor;
        inputEditor = null;
        ensureInputEditor = function(command, arg) {
          var text;
          text = arg.text;
          dispatch(inputEditor, command);
          return expect(inputEditor.getModel().getText()).toEqual(text);
        };
        beforeEach(function() {
          ensure('/ def enter', {
            cursor: [1, 0]
          });
          ensure('/ abc enter', {
            cursor: [2, 0]
          });
          return inputEditor = vimState.searchInput.editorElement;
        });
        it("allows searching history in the search field", function() {
          ensure('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          return ensureInputEditor('core:move-up', {
            text: 'def'
          });
        });
        return it("resets the search field to empty when scrolling back", function() {
          ensure('/');
          ensureInputEditor('core:move-up', {
            text: 'abc'
          });
          ensureInputEditor('core:move-up', {
            text: 'def'
          });
          ensureInputEditor('core:move-down', {
            text: 'abc'
          });
          return ensureInputEditor('core:move-down', {
            text: ''
          });
        });
      });
      return describe("highlightSearch", function() {
        var ensureHightlightSearch, textForMarker;
        textForMarker = function(marker) {
          return editor.getTextInBufferRange(marker.getBufferRange());
        };
        ensureHightlightSearch = function(options) {
          var markers, text;
          markers = vimState.highlightSearch.getMarkers();
          if (options.length != null) {
            expect(markers).toHaveLength(options.length);
          }
          if (options.text != null) {
            text = markers.map(function(marker) {
              return textForMarker(marker);
            });
            expect(text).toEqual(options.text);
          }
          if (options.mode != null) {
            return ensure(null, {
              mode: options.mode
            });
          }
        };
        beforeEach(function() {
          jasmine.attachToDOM(getView(atom.workspace));
          settings.set('highlightSearch', true);
          expect(vimState.highlightSearch.hasMarkers()).toBe(false);
          return ensure('/ def enter', {
            cursor: [1, 0]
          });
        });
        describe("clearHighlightSearch command", function() {
          return it("clear highlightSearch marker", function() {
            ensureHightlightSearch({
              length: 2,
              text: ["def", "def"],
              mode: 'normal'
            });
            dispatch(editorElement, 'vim-mode-plus:clear-highlight-search');
            return ensureHightlightSearch({
              length: 0,
              mode: 'normal'
            });
          });
        });
        describe("clearHighlightSearchOnResetNormalMode", function() {
          describe("when disabled", function() {
            return it("it won't clear highlightSearch", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', false);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              ensure("escape", {
                mode: 'normal'
              });
              return ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
            });
          });
          return describe("when enabled", function() {
            return it("it clear highlightSearch on reset-normal-mode", function() {
              settings.set('clearHighlightSearchOnResetNormalMode', true);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              ensure("escape", {
                mode: 'normal'
              });
              return ensureHightlightSearch({
                length: 0,
                mode: 'normal'
              });
            });
          });
        });
        return describe("toggle-highlight-search command", function() {
          return it("toggle highlightSearch config and re-hihighlight on re-enabled", function() {
            return runs(function() {
              expect(settings.get("highlightSearch")).toBe(true);
              ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
              dispatch(editorElement, 'vim-mode-plus:toggle-highlight-search');
              ensureHightlightSearch({
                length: 0,
                mode: 'normal'
              });
              dispatch(editorElement, 'vim-mode-plus:toggle-highlight-search');
              expect(settings.get("highlightSearch")).toBe(true);
              return ensureHightlightSearch({
                length: 2,
                text: ["def", "def"],
                mode: 'normal'
              });
            });
          });
        });
      });
    });
    describe("IncrementalSearch", function() {
      beforeEach(function() {
        return jasmine.attachToDOM(getView(atom.workspace));
      });
      describe("with multiple-cursors", function() {
        beforeEach(function() {
          return set({
            text: "0:    abc\n1:    abc\n2:    abc\n3:    abc",
            cursor: [[0, 0], [1, 0]]
          });
        });
        it("[forward] move each cursor to match", function() {
          return ensure('/ abc enter', {
            cursor: [[0, 6], [1, 6]]
          });
        });
        it("[forward: count specified], move each cursor to match", function() {
          return ensure('2 / abc enter', {
            cursor: [[1, 6], [2, 6]]
          });
        });
        it("[backward] move each cursor to match", function() {
          return ensure('? abc enter', {
            cursor: [[3, 6], [0, 6]]
          });
        });
        return it("[backward: count specified] move each cursor to match", function() {
          return ensure('2 ? abc enter', {
            cursor: [[2, 6], [3, 6]]
          });
        });
      });
      return describe("blank input repeat last search", function() {
        beforeEach(function() {
          return set({
            text: "0:    abc\n1:    abc\n2:    abc\n3:    abc\n4:"
          });
        });
        it("Do nothing when search history is empty", function() {
          set({
            cursor: [2, 1]
          });
          ensure('/  enter', {
            cursor: [2, 1]
          });
          return ensure('?  enter', {
            cursor: [2, 1]
          });
        });
        it("Repeat forward direction", function() {
          set({
            cursor: [0, 0]
          });
          ensure('/ abc enter', {
            cursor: [0, 6]
          });
          ensure('/  enter', {
            cursor: [1, 6]
          });
          return ensure('2 /  enter', {
            cursor: [3, 6]
          });
        });
        return it("Repeat backward direction", function() {
          set({
            cursor: [4, 0]
          });
          ensure('? abc enter', {
            cursor: [3, 6]
          });
          ensure('?  enter', {
            cursor: [2, 6]
          });
          return ensure('2 ?  enter', {
            cursor: [0, 6]
          });
        });
      });
    });
    describe("the * keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abd\n@def\nabd\ndef\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves cursor to next occurrence of word under cursor", function() {
          return ensure('*', {
            cursor: [2, 0]
          });
        });
        it("repeats with the n key", function() {
          ensure('*', {
            cursor: [2, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursor: [0, 0]
          });
          return ensure('*', {
            cursor: [0, 0]
          });
        });
        describe("with words that contain 'non-word' characters", function() {
          it("skips non-word-char when picking cursor-word then place cursor to next occurrence of word", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
          it("doesn't move cursor unless next match has exact word ending", function() {
            set({
              text: "abc\n@def\nabc\n@def1\n",
              cursor: [1, 1]
            });
            return ensure('*', {
              cursor: [1, 1]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\ndef\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
        describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
        describe("when cursor is not on a word", function() {
          return it("does a match with the next word", function() {
            set({
              text: "abc\na  @def\n abc\n @def",
              cursor: [1, 1]
            });
            return ensure('*', {
              cursor: [3, 2]
            });
          });
        });
        return describe("when cursor is at EOF", function() {
          return it("doesn't try to do any match", function() {
            set({
              text: "abc\n@def\nabc\n ",
              cursor: [3, 0]
            });
            return ensure('*', {
              cursor: [3, 0]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [0, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('*', {
            cursor: [3, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('*', {
            cursor: [1, 0]
          });
          ensure('n', {
            cursor: [2, 0]
          });
          ensure('n', {
            cursor: [3, 0]
          });
          return ensure('n', {
            cursor: [4, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [1, 0]
            });
            ensure('*', {
              cursor: [4, 0]
            });
            return ensure('n', {
              cursor: [1, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('*', {
              cursor: [1, 0]
            });
            ensure('n', {
              cursor: [2, 0]
            });
            ensure('n', {
              cursor: [3, 0]
            });
            return ensure('n', {
              cursor: [4, 0]
            });
          });
        });
      });
    });
    describe("the hash keybinding", function() {
      describe("as a motion", function() {
        it("moves cursor to previous occurrence of word under cursor", function() {
          set({
            text: "abc\n@def\nabc\ndef\n",
            cursor: [2, 1]
          });
          return ensure('#', {
            cursor: [0, 0]
          });
        });
        it("repeats with n", function() {
          set({
            text: "abc\n@def\nabc\ndef\nabc\n",
            cursor: [2, 1]
          });
          ensure('#', {
            cursor: [0, 0]
          });
          ensure('n', {
            cursor: [4, 0]
          });
          return ensure('n', {
            cursor: [2, 0]
          });
        });
        it("doesn't move cursor unless next occurrence is the exact word (no partial matches)", function() {
          set({
            text: "abc\ndef\nghiabc\njkl\nabcdef",
            cursor: [0, 0]
          });
          return ensure('#', {
            cursor: [0, 0]
          });
        });
        describe("with words that containt 'non-word' characters", function() {
          it("moves cursor to next occurrence of word under cursor", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [3, 0]
            });
            return ensure('#', {
              cursor: [1, 1]
            });
          });
          return it("moves cursor to the start of valid word char", function() {
            set({
              text: "abc\n@def\nabc\ndef\n",
              cursor: [3, 0]
            });
            return ensure('#', {
              cursor: [1, 1]
            });
          });
        });
        return describe("when cursor is on non-word char column", function() {
          return it("matches only the non-word char", function() {
            set({
              text: "abc\n@def\nabc\n@def\n",
              cursor: [1, 0]
            });
            return ensure('*', {
              cursor: [3, 1]
            });
          });
        });
      });
      return describe("caseSensitivity setting", function() {
        beforeEach(function() {
          return set({
            text: "abc\nABC\nabC\nabc\nABC",
            cursor: [4, 0]
          });
        });
        it("search case sensitively when `ignoreCaseForSearchCurrentWord` is false(=default)", function() {
          expect(settings.get('ignoreCaseForSearchCurrentWord')).toBe(false);
          ensure('#', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [4, 0]
          });
        });
        it("search case insensitively when `ignoreCaseForSearchCurrentWord` true", function() {
          settings.set('ignoreCaseForSearchCurrentWord', true);
          ensure('#', {
            cursor: [3, 0]
          });
          ensure('n', {
            cursor: [2, 0]
          });
          ensure('n', {
            cursor: [1, 0]
          });
          return ensure('n', {
            cursor: [0, 0]
          });
        });
        return describe("useSmartcaseForSearchCurrentWord is enabled", function() {
          beforeEach(function() {
            return settings.set('useSmartcaseForSearchCurrentWord', true);
          });
          it("search case sensitively when enable and search term includes uppercase", function() {
            set({
              cursor: [4, 0]
            });
            ensure('#', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [4, 0]
            });
          });
          return it("search case insensitively when enable and search term NOT includes uppercase", function() {
            set({
              cursor: [0, 0]
            });
            ensure('#', {
              cursor: [4, 0]
            });
            ensure('n', {
              cursor: [3, 0]
            });
            ensure('n', {
              cursor: [2, 0]
            });
            ensure('n', {
              cursor: [1, 0]
            });
            return ensure('n', {
              cursor: [0, 0]
            });
          });
        });
      });
    });
    describe('the % motion', function() {
      describe("Parenthesis", function() {
        beforeEach(function() {
          return set({
            text: "(___)"
          });
        });
        describe("as operator target", function() {
          beforeEach(function() {
            return set({
              text: "(_(_)_)"
            });
          });
          it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 2]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
          return it('behave inclusively when is at open pair', function() {
            set({
              cursor: [0, 4]
            });
            return ensure('d %', {
              text: "(__)"
            });
          });
        });
        describe("cursor is at pair char", function() {
          it("cursor is at open pair, it move to closing pair", function() {
            set({
              cursor: [0, 0]
            });
            ensure('%', {
              cursor: [0, 4]
            });
            return ensure('%', {
              cursor: [0, 0]
            });
          });
          return it("cursor is at close pair, it move to open pair", function() {
            set({
              cursor: [0, 4]
            });
            ensure('%', {
              cursor: [0, 0]
            });
            return ensure('%', {
              cursor: [0, 4]
            });
          });
        });
        describe("cursor is enclosed by pair", function() {
          beforeEach(function() {
            return set({
              text: "(___)",
              cursor: [0, 2]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 0]
            });
          });
        });
        describe("cursor is bofore open pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)",
              cursor: [0, 0]
            });
          });
          return it("move to open pair", function() {
            return ensure('%', {
              cursor: [0, 6]
            });
          });
        });
        describe("cursor is after close pair", function() {
          beforeEach(function() {
            return set({
              text: "__(___)__",
              cursor: [0, 7]
            });
          });
          return it("fail to move", function() {
            return ensure('%', {
              cursor: [0, 7]
            });
          });
        });
        return describe("multi line", function() {
          beforeEach(function() {
            return set({
              text: "___\n___(__\n___\n___)"
            });
          });
          describe("when open and close pair is not at cursor line", function() {
            it("fail to move", function() {
              set({
                cursor: [0, 0]
              });
              return ensure('%', {
                cursor: [0, 0]
              });
            });
            return it("fail to move", function() {
              set({
                cursor: [2, 0]
              });
              return ensure('%', {
                cursor: [2, 0]
              });
            });
          });
          describe("when open pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [1, 0]
              });
              return ensure('%', {
                cursor: [3, 3]
              });
            });
          });
          describe("when cursor position is greater than open pair", function() {
            return it("fail to move", function() {
              set({
                cursor: [1, 4]
              });
              return ensure('%', {
                cursor: [1, 4]
              });
            });
          });
          return describe("when close pair is forwarding to cursor in same row", function() {
            return it("move to closing pair", function() {
              set({
                cursor: [3, 0]
              });
              return ensure('%', {
                cursor: [1, 3]
              });
            });
          });
        });
      });
      describe("CurlyBracket", function() {
        beforeEach(function() {
          return set({
            text: "{___}"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("SquareBracket", function() {
        beforeEach(function() {
          return set({
            text: "[___]"
          });
        });
        it("cursor is at open pair, it move to closing pair", function() {
          set({
            cursor: [0, 0]
          });
          ensure('%', {
            cursor: [0, 4]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
        return it("cursor is at close pair, it move to open pair", function() {
          set({
            cursor: [0, 4]
          });
          ensure('%', {
            cursor: [0, 0]
          });
          return ensure('%', {
            cursor: [0, 4]
          });
        });
      });
      describe("complex situation", function() {
        beforeEach(function() {
          return set({
            text: "(_____)__{__[___]__}\n_"
          });
        });
        it('move to closing pair which open pair come first', function() {
          set({
            cursor: [0, 7]
          });
          ensure('%', {
            cursor: [0, 19]
          });
          set({
            cursor: [0, 10]
          });
          return ensure('%', {
            cursor: [0, 16]
          });
        });
        return it('enclosing pair is prioritized over forwarding range', function() {
          set({
            cursor: [0, 2]
          });
          return ensure('%', {
            cursor: [0, 0]
          });
        });
      });
      return describe("complex situation with html tag", function() {
        beforeEach(function() {
          return set({
            text: "<div>\n  <span>\n    some text\n  </span>\n</div>"
          });
        });
        return it('move to pair tag only when cursor is on open or close tag but not on AngleBracket(<, >)', function() {
          set({
            cursor: [0, 1]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 2]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [0, 3]
          });
          ensure('%', {
            cursor: [4, 1]
          });
          set({
            cursor: [4, 1]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 2]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 3]
          });
          ensure('%', {
            cursor: [0, 1]
          });
          set({
            cursor: [4, 4]
          });
          return ensure('%', {
            cursor: [0, 1]
          });
        });
      });
    });
    return describe("[regression guard] repeat(n or N) after used as operator target", function() {
      it("repeat after d /", function() {
        set({
          textC: "a1    |a2    a3    a4"
        });
        ensure("d / a enter", {
          textC: "a1    |a3    a4",
          mode: "normal",
          selectedText: ""
        });
        ensure("n", {
          textC: "a1    a3    |a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure("N", {
          textC: "a1    |a3    a4",
          mode: "normal",
          selectedText: ""
        });
      });
      return it("repeat after d ?", function() {
        set({
          textC: "a1    a2    |a3    a4"
        });
        ensure("d ? a enter", {
          textC: "a1    |a3    a4",
          mode: "normal",
          selectedText: ""
        });
        ensure("n", {
          textC: "|a1    a3    a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure("N", {
          textC: "a1    |a3    a4",
          mode: "normal",
          selectedText: ""
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvbW90aW9uLXNlYXJjaC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLGVBQVIsQ0FBN0MsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCLHVCQUF4QixFQUFrQzs7RUFDbEMsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0FBQ3hCLFFBQUE7SUFBQSxPQUFpRCxFQUFqRCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLGdCQUFkLEVBQXNCLHVCQUF0QixFQUFxQztJQUVyQyxVQUFBLENBQVcsU0FBQTtNQUNULE9BQU8sQ0FBQyxXQUFSLENBQW9CLE9BQUEsQ0FBUSxJQUFJLENBQUMsU0FBYixDQUFwQjthQUNBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFnQjtNQUhOLENBQVo7SUFGUyxDQUFYO0lBT0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsVUFBQTtNQUFBLElBQUEsR0FBTztNQUVQLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsSUFBQSxHQUFPO1VBQUMsUUFBQSxFQUFVLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFVBQWxCLENBQVg7O1FBQ1AsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLHNCQUFOO1VBTUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FOUjtTQURGO2VBUUEsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLGVBQXRCLENBQXNDLENBQUMsU0FBdkMsQ0FBaUQsSUFBakQ7TUFWUyxDQUFYO01BWUEsUUFBQSxDQUFTLGFBQVQsRUFBd0Is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QVA7U0FBdEI7UUFDQSxNQUFBLENBQU8sYUFBUCxFQUFzQjtVQUFBLEtBQUEsRUFBTyxpQkFBUDtVQUErQixJQUFBLEVBQU0sUUFBckM7VUFBK0MsWUFBQSxFQUFjLEVBQTdEO1NBQXRCO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBc0I7VUFBQSxLQUFBLEVBQU8saUJBQVA7VUFBK0IsSUFBQSxFQUFNLFFBQXJDO1VBQStDLFlBQUEsRUFBYyxFQUE3RDtTQUF0QjtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQXNCO1VBQUEsS0FBQSxFQUFPLGlCQUFQO1VBQStCLElBQUEsRUFBTSxRQUFyQztVQUErQyxZQUFBLEVBQWMsRUFBN0Q7U0FBdEI7TUFKcUIsQ0FBdkI7YUFLQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtRQUNyQixHQUFBLENBQXNCO1VBQUEsS0FBQSxFQUFPLHVCQUFQO1NBQXRCO1FBQ0EsTUFBQSxDQUFPLGFBQVAsRUFBc0I7VUFBQSxLQUFBLEVBQU8saUJBQVA7VUFBMEIsSUFBQSxFQUFNLFFBQWhDO1VBQTBDLFlBQUEsRUFBYyxFQUF4RDtTQUF0QjtRQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQXNCO1VBQUEsS0FBQSxFQUFPLGlCQUFQO1VBQTBCLElBQUEsRUFBTSxRQUFoQztVQUEwQyxZQUFBLEVBQWMsRUFBeEQ7U0FBdEI7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFzQjtVQUFBLEtBQUEsRUFBTyxpQkFBUDtVQUEwQixJQUFBLEVBQU0sUUFBaEM7VUFBMEMsWUFBQSxFQUFjLEVBQXhEO1NBQXRCO01BSnFCLENBQXZCO0lBTjBFLENBQTVFO0VBcHBCd0IsQ0FBMUI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhLCBnZXRWaWV3fSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJNb3Rpb24gU2VhcmNoXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKVxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgX3ZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGUgIyB0byByZWZlciBhcyB2aW1TdGF0ZSBsYXRlci5cbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZX0gPSBfdmltXG5cbiAgZGVzY3JpYmUgXCJ0aGUgLyBrZXliaW5kaW5nXCIsIC0+XG4gICAgcGFuZSA9IG51bGxcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHBhbmUgPSB7YWN0aXZhdGU6IGphc21pbmUuY3JlYXRlU3B5KFwiYWN0aXZhdGVcIil9XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVBhbmUnKS5hbmRSZXR1cm4ocGFuZSlcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgc3BlY2lmaWVkIHNlYXJjaCBwYXR0ZXJuXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnLyBkZWYgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBleHBlY3QocGFuZS5hY3RpdmF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwibG9vcHMgYmFjayBhcm91bmRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnLyBkZWYgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcInVzZXMgYSB2YWxpZCByZWdleCBhcyBhIHJlZ2V4XCIsIC0+XG4gICAgICAgICMgQ3ljbGUgdGhyb3VnaCB0aGUgJ2FiYycgb24gdGhlIGZpcnN0IGxpbmUgd2l0aCBhIGNoYXJhY3RlciBwYXR0ZXJuXG4gICAgICAgIGVuc3VyZSAnLyBbYWJjXSBlbnRlcicsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGl0IFwidXNlcyBhbiBpbnZhbGlkIHJlZ2V4IGFzIGEgbGl0ZXJhbCBzdHJpbmdcIiwgLT5cbiAgICAgICAgIyBHbyBzdHJhaWdodCB0byB0aGUgbGl0ZXJhbCBbYWJjXG4gICAgICAgIHNldCB0ZXh0OiBcImFiY1xcblthYmNdXFxuXCJcbiAgICAgICAgZW5zdXJlICcvIFthYmMgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcInVzZXMgPyBhcyBhIGxpdGVyYWwgc3RyaW5nXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImFiY1xcblthP2M/XFxuXCJcbiAgICAgICAgZW5zdXJlICcvID8gZW50ZXInLCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgICBpdCAnd29ya3Mgd2l0aCBzZWxlY3Rpb24gaW4gdmlzdWFsIG1vZGUnLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUnXG4gICAgICAgIGVuc3VyZSAndiAvIHRoIGVudGVyJywgY3Vyc29yOiBbMCwgOV1cbiAgICAgICAgZW5zdXJlICdkJywgdGV4dDogJ2hyZWUnXG5cbiAgICAgIGl0ICdleHRlbmRzIHNlbGVjdGlvbiB3aGVuIHJlcGVhdGluZyBzZWFyY2ggaW4gdmlzdWFsIG1vZGUnLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgICAgbGluZTFcbiAgICAgICAgICBsaW5lMlxuICAgICAgICAgIGxpbmUzXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlICd2IC8gbGluZSBlbnRlcicsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAwXSwgWzEsIDFdXVxuICAgICAgICBlbnN1cmUgJ24nLFxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtbMCwgMF0sIFsyLCAxXV1cblxuICAgICAgaXQgJ3NlYXJjaGVzIHRvIHRoZSBjb3JyZWN0IGNvbHVtbiBpbiB2aXN1YWwgbGluZXdpc2UgbW9kZScsIC0+XG4gICAgICAgIGVuc3VyZSAnViAvIGVmIGVudGVyJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiYWJjXFxuZGVmXFxuXCIsXG4gICAgICAgICAgcHJvcGVydHlIZWFkOiBbMSwgMV1cbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cblxuICAgICAgaXQgJ25vdCBleHRlbmQgbGlud2lzZSBzZWxlY3Rpb24gaWYgc2VhcmNoIG1hdGNoZXMgb24gc2FtZSBsaW5lJywgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiYyBkZWZcbiAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdWIC8gZWYgZW50ZXInLCBzZWxlY3RlZFRleHQ6IFwiYWJjIGRlZlxcblwiLFxuXG4gICAgICBkZXNjcmliZSBcImNhc2Ugc2Vuc2l0aXZpdHlcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcXG5hYmNcXG5BQkNcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBpdCBcIndvcmtzIGluIGNhc2Ugc2Vuc2l0aXZlIG1vZGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy8gQUJDIGVudGVyJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgIGl0IFwid29ya3MgaW4gY2FzZSBpbnNlbnNpdGl2ZSBtb2RlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcvIFxcXFxjQWJDIGVudGVyJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgIGl0IFwid29ya3MgaW4gY2FzZSBpbnNlbnNpdGl2ZSBtb2RlIHdoZXJldmVyIFxcXFxjIGlzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcvIEFiQ1xcXFxjIGVudGVyJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBpZ25vcmVDYXNlRm9yU2VhcmNoIGlzIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQgJ2lnbm9yZUNhc2VGb3JTZWFyY2gnLCB0cnVlXG5cbiAgICAgICAgICBpdCBcImlnbm9yZSBjYXNlIHdoZW4gc2VhcmNoIFtjYXNlLTFdXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJy8gYWJjIGVudGVyJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgICAgICBpdCBcImlnbm9yZSBjYXNlIHdoZW4gc2VhcmNoIFtjYXNlLTJdXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJy8gQUJDIGVudGVyJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaCBpcyBlbmFibGVkXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VTbWFydGNhc2VGb3JTZWFyY2gnLCB0cnVlXG5cbiAgICAgICAgICBpdCBcImlnbm9yZSBjYXNlIHdoZW4gc2VhcmggdGVybSBpbmNsdWRlcyBBLVpcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnLyBBQkMgZW50ZXInLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBzZWFyaCB0ZXJtIE5PVCBpbmNsdWRlcyBBLVogcmVnYXJkcmVzcyBvZiBgaWdub3JlQ2FzZUZvclNlYXJjaGBcIiwgLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCAnaWdub3JlQ2FzZUZvclNlYXJjaCcsIGZhbHNlICMgZGVmYXVsdFxuICAgICAgICAgICAgZW5zdXJlICcvIGFiYyBlbnRlcicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgICAgaXQgXCJpZ25vcmUgY2FzZSB3aGVuIHNlYXJoIHRlcm0gTk9UIGluY2x1ZGVzIEEtWiByZWdhcmRyZXNzIG9mIGBpZ25vcmVDYXNlRm9yU2VhcmNoYFwiLCAtPlxuICAgICAgICAgICAgc2V0dGluZ3Muc2V0ICdpZ25vcmVDYXNlRm9yU2VhcmNoJywgdHJ1ZSAjIGRlZmF1bHRcbiAgICAgICAgICAgIGVuc3VyZSAnLyBhYmMgZW50ZXInLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJyZXBlYXRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgd2l0aCBubyBzZWFyY2ggaGlzdG9yeVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJyZXBlYXRpbmcgd2l0aCBzZWFyY2ggaGlzdG9yeVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZW5zdXJlICcvIGRlZiBlbnRlcidcblxuICAgICAgICBpdCBcInJlcGVhdHMgcHJldmlvdXMgc2VhcmNoIHdpdGggLzxlbnRlcj5cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy8gIGVudGVyJywgY3Vyc29yOiBbMywgMF1cblxuICAgICAgICBkZXNjcmliZSBcIm5vbi1pbmNyZW1lbnRhbFNlYXJjaCBvbmx5IGZlYXR1cmVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQoXCJpbmNyZW1lbnRhbFNlYXJjaFwiLCBmYWxzZSlcblxuICAgICAgICAgIGl0IFwicmVwZWF0cyBwcmV2aW91cyBzZWFyY2ggd2l0aCAvL1wiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICcvIC8gZW50ZXInLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwidGhlIG4ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgICAgIGl0IFwicmVwZWF0cyB0aGUgbGFzdCBzZWFyY2hcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ0aGUgTiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICAgICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IHNlYXJjaCBiYWNrd2FyZHNcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICdOJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnTicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiY29tcG9zaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiY29tcG9zZXMgd2l0aCBvcGVyYXRvcnNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgLyBkZWYgZW50ZXInLCB0ZXh0OiBcImRlZlxcbmFiY1xcbmRlZlxcblwiXG5cbiAgICAgICAgaXQgXCJyZXBlYXRzIGNvcnJlY3RseSB3aXRoIG9wZXJhdG9yc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAvIGRlZiBlbnRlcicsIHRleHQ6IFwiZGVmXFxuYWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcImRlZlxcblwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gcmV2ZXJzZWQgYXMgP1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGJhY2t3YXJkcyB0byB0aGUgc3BlY2lmaWVkIHNlYXJjaCBwYXR0ZXJuXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnPyBkZWYgZW50ZXInLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICBpdCBcImFjY2VwdHMgLyBhcyBhIGxpdGVyYWwgc2VhcmNoIHBhdHRlcm5cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhYmNcXG5kL2ZcXG5hYmNcXG5kL2ZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnPyAvIGVudGVyJywgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgZW5zdXJlICc/IC8gZW50ZXInLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBkZXNjcmliZSBcInJlcGVhdGluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZW5zdXJlICc/IGRlZiBlbnRlcidcblxuICAgICAgICBpdCBcInJlcGVhdHMgcHJldmlvdXMgc2VhcmNoIGFzIHJldmVyc2VkIHdpdGggPzxlbnRlcj5cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCI/IGVudGVyXCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJub24taW5jcmVtZW50YWxTZWFyY2ggb25seSBmZWF0dXJlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0dGluZ3Muc2V0KFwiaW5jcmVtZW50YWxTZWFyY2hcIiwgZmFsc2UpXG5cbiAgICAgICAgICBpdCBcInJlcGVhdHMgcHJldmlvdXMgc2VhcmNoIGFzIHJldmVyc2VkIHdpdGggPz9cIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnPyA/IGVudGVyJywgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgICBkZXNjcmliZSAndGhlIG4ga2V5YmluZGluZycsIC0+XG4gICAgICAgICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IHNlYXJjaCBiYWNrd2FyZHNcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMywgMF1cblxuICAgICAgICBkZXNjcmliZSAndGhlIE4ga2V5YmluZGluZycsIC0+XG4gICAgICAgICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IHNlYXJjaCBmb3J3YXJkc1wiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ04nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ1c2luZyBzZWFyY2ggaGlzdG9yeVwiLCAtPlxuICAgICAgaW5wdXRFZGl0b3IgPSBudWxsXG4gICAgICBlbnN1cmVJbnB1dEVkaXRvciA9IChjb21tYW5kLCB7dGV4dH0pIC0+XG4gICAgICAgIGRpc3BhdGNoKGlucHV0RWRpdG9yLCBjb21tYW5kKVxuICAgICAgICBleHBlY3QoaW5wdXRFZGl0b3IuZ2V0TW9kZWwoKS5nZXRUZXh0KCkpLnRvRXF1YWwodGV4dClcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmUgJy8gZGVmIGVudGVyJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICcvIGFiYyBlbnRlcicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGlucHV0RWRpdG9yID0gdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yRWxlbWVudFxuXG4gICAgICBpdCBcImFsbG93cyBzZWFyY2hpbmcgaGlzdG9yeSBpbiB0aGUgc2VhcmNoIGZpZWxkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnLydcbiAgICAgICAgZW5zdXJlSW5wdXRFZGl0b3IgJ2NvcmU6bW92ZS11cCcsIHRleHQ6ICdhYmMnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtdXAnLCB0ZXh0OiAnZGVmJ1xuICAgICAgICBlbnN1cmVJbnB1dEVkaXRvciAnY29yZTptb3ZlLXVwJywgdGV4dDogJ2RlZidcblxuICAgICAgaXQgXCJyZXNldHMgdGhlIHNlYXJjaCBmaWVsZCB0byBlbXB0eSB3aGVuIHNjcm9sbGluZyBiYWNrXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnLydcbiAgICAgICAgZW5zdXJlSW5wdXRFZGl0b3IgJ2NvcmU6bW92ZS11cCcsIHRleHQ6ICdhYmMnXG4gICAgICAgIGVuc3VyZUlucHV0RWRpdG9yICdjb3JlOm1vdmUtdXAnLCB0ZXh0OiAnZGVmJ1xuICAgICAgICBlbnN1cmVJbnB1dEVkaXRvciAnY29yZTptb3ZlLWRvd24nLCB0ZXh0OiAnYWJjJ1xuICAgICAgICBlbnN1cmVJbnB1dEVkaXRvciAnY29yZTptb3ZlLWRvd24nLCB0ZXh0OiAnJ1xuXG4gICAgZGVzY3JpYmUgXCJoaWdobGlnaHRTZWFyY2hcIiwgLT5cbiAgICAgIHRleHRGb3JNYXJrZXIgPSAobWFya2VyKSAtPlxuICAgICAgICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpXG5cbiAgICAgIGVuc3VyZUhpZ2h0bGlnaHRTZWFyY2ggPSAob3B0aW9ucykgLT5cbiAgICAgICAgbWFya2VycyA9IHZpbVN0YXRlLmhpZ2hsaWdodFNlYXJjaC5nZXRNYXJrZXJzKClcbiAgICAgICAgaWYgb3B0aW9ucy5sZW5ndGg/XG4gICAgICAgICAgZXhwZWN0KG1hcmtlcnMpLnRvSGF2ZUxlbmd0aChvcHRpb25zLmxlbmd0aClcblxuICAgICAgICBpZiBvcHRpb25zLnRleHQ/XG4gICAgICAgICAgdGV4dCA9IG1hcmtlcnMubWFwIChtYXJrZXIpIC0+IHRleHRGb3JNYXJrZXIobWFya2VyKVxuICAgICAgICAgIGV4cGVjdCh0ZXh0KS50b0VxdWFsKG9wdGlvbnMudGV4dClcblxuICAgICAgICBpZiBvcHRpb25zLm1vZGU/XG4gICAgICAgICAgZW5zdXJlIG51bGwsIHttb2RlOiBvcHRpb25zLm1vZGV9XG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShnZXRWaWV3KGF0b20ud29ya3NwYWNlKSlcbiAgICAgICAgc2V0dGluZ3Muc2V0KCdoaWdobGlnaHRTZWFyY2gnLCB0cnVlKVxuICAgICAgICBleHBlY3QodmltU3RhdGUuaGlnaGxpZ2h0U2VhcmNoLmhhc01hcmtlcnMoKSkudG9CZShmYWxzZSlcbiAgICAgICAgZW5zdXJlICcvIGRlZiBlbnRlcicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiY2xlYXJIaWdobGlnaHRTZWFyY2ggY29tbWFuZFwiLCAtPlxuICAgICAgICBpdCBcImNsZWFyIGhpZ2hsaWdodFNlYXJjaCBtYXJrZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmVIaWdodGxpZ2h0U2VhcmNoIGxlbmd0aDogMiwgdGV4dDogW1wiZGVmXCIsIFwiZGVmXCJdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOmNsZWFyLWhpZ2hsaWdodC1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZUhpZ2h0bGlnaHRTZWFyY2ggbGVuZ3RoOiAwLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBkZXNjcmliZSBcImNsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGVcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGRpc2FibGVkXCIsIC0+XG4gICAgICAgICAgaXQgXCJpdCB3b24ndCBjbGVhciBoaWdobGlnaHRTZWFyY2hcIiwgLT5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCgnY2xlYXJIaWdobGlnaHRTZWFyY2hPblJlc2V0Tm9ybWFsTW9kZScsIGZhbHNlKVxuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBkZXNjcmliZSBcIndoZW4gZW5hYmxlZFwiLCAtPlxuICAgICAgICAgIGl0IFwiaXQgY2xlYXIgaGlnaGxpZ2h0U2VhcmNoIG9uIHJlc2V0LW5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NsZWFySGlnaGxpZ2h0U2VhcmNoT25SZXNldE5vcm1hbE1vZGUnLCB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDAsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGRlc2NyaWJlIFwidG9nZ2xlLWhpZ2hsaWdodC1zZWFyY2ggY29tbWFuZFwiLCAtPlxuICAgICAgICBpdCBcInRvZ2dsZSBoaWdobGlnaHRTZWFyY2ggY29uZmlnIGFuZCByZS1oaWhpZ2hsaWdodCBvbiByZS1lbmFibGVkXCIsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KHNldHRpbmdzLmdldChcImhpZ2hsaWdodFNlYXJjaFwiKSkudG9CZSh0cnVlKVxuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIGRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOnRvZ2dsZS1oaWdobGlnaHQtc2VhcmNoJylcbiAgICAgICAgICAgIGVuc3VyZUhpZ2h0bGlnaHRTZWFyY2ggbGVuZ3RoOiAwLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6dG9nZ2xlLWhpZ2hsaWdodC1zZWFyY2gnKVxuICAgICAgICAgICAgZXhwZWN0KHNldHRpbmdzLmdldChcImhpZ2hsaWdodFNlYXJjaFwiKSkudG9CZSh0cnVlKVxuICAgICAgICAgICAgZW5zdXJlSGlnaHRsaWdodFNlYXJjaCBsZW5ndGg6IDIsIHRleHQ6IFtcImRlZlwiLCBcImRlZlwiXSwgbW9kZTogJ25vcm1hbCdcblxuICBkZXNjcmliZSBcIkluY3JlbWVudGFsU2VhcmNoXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShnZXRWaWV3KGF0b20ud29ya3NwYWNlKSlcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZS1jdXJzb3JzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDA6ICAgIGFiY1xuICAgICAgICAgIDE6ICAgIGFiY1xuICAgICAgICAgIDI6ICAgIGFiY1xuICAgICAgICAgIDM6ICAgIGFiY1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdXVxuXG4gICAgICBpdCBcIltmb3J3YXJkXSBtb3ZlIGVhY2ggY3Vyc29yIHRvIG1hdGNoXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnLyBhYmMgZW50ZXInLCBjdXJzb3I6IFtbMCwgNl0sIFsxLCA2XV1cbiAgICAgIGl0IFwiW2ZvcndhcmQ6IGNvdW50IHNwZWNpZmllZF0sIG1vdmUgZWFjaCBjdXJzb3IgdG8gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyIC8gYWJjIGVudGVyJywgY3Vyc29yOiBbWzEsIDZdLCBbMiwgNl1dXG5cbiAgICAgIGl0IFwiW2JhY2t3YXJkXSBtb3ZlIGVhY2ggY3Vyc29yIHRvIG1hdGNoXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnPyBhYmMgZW50ZXInLCBjdXJzb3I6IFtbMywgNl0sIFswLCA2XV1cbiAgICAgIGl0IFwiW2JhY2t3YXJkOiBjb3VudCBzcGVjaWZpZWRdIG1vdmUgZWFjaCBjdXJzb3IgdG8gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyID8gYWJjIGVudGVyJywgY3Vyc29yOiBbWzIsIDZdLCBbMywgNl1dXG5cbiAgICBkZXNjcmliZSBcImJsYW5rIGlucHV0IHJlcGVhdCBsYXN0IHNlYXJjaFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwOiAgICBhYmNcbiAgICAgICAgICAxOiAgICBhYmNcbiAgICAgICAgICAyOiAgICBhYmNcbiAgICAgICAgICAzOiAgICBhYmNcbiAgICAgICAgICA0OlxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcIkRvIG5vdGhpbmcgd2hlbiBzZWFyY2ggaGlzdG9yeSBpcyBlbXB0eVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlICcvICBlbnRlcicsIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnPyAgZW50ZXInLCBjdXJzb3I6IFsyLCAxXVxuXG4gICAgICBpdCBcIlJlcGVhdCBmb3J3YXJkIGRpcmVjdGlvblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcvIGFiYyBlbnRlcicsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGVuc3VyZSAnLyAgZW50ZXInLCBjdXJzb3I6IFsxLCA2XVxuICAgICAgICBlbnN1cmUgJzIgLyAgZW50ZXInLCBjdXJzb3I6IFszLCA2XVxuXG4gICAgICBpdCBcIlJlcGVhdCBiYWNrd2FyZCBkaXJlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnPyBhYmMgZW50ZXInLCBjdXJzb3I6IFszLCA2XVxuICAgICAgICBlbnN1cmUgJz8gIGVudGVyJywgY3Vyc29yOiBbMiwgNl1cbiAgICAgICAgZW5zdXJlICcyID8gIGVudGVyJywgY3Vyc29yOiBbMCwgNl1cblxuICBkZXNjcmliZSBcInRoZSAqIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmRcXG5AZGVmXFxuYWJkXFxuZGVmXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgY3Vyc29yIHRvIG5leHQgb2NjdXJyZW5jZSBvZiB3b3JkIHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcInJlcGVhdHMgd2l0aCB0aGUgbiBrZXlcIiwgLT5cbiAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgY3Vyc29yIHVubGVzcyBuZXh0IG9jY3VycmVuY2UgaXMgdGhlIGV4YWN0IHdvcmQgKG5vIHBhcnRpYWwgbWF0Y2hlcylcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhYmNcXG5kZWZcXG5naGlhYmNcXG5qa2xcXG5hYmNkZWZcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCB3b3JkcyB0aGF0IGNvbnRhaW4gJ25vbi13b3JkJyBjaGFyYWN0ZXJzXCIsIC0+XG4gICAgICAgIGl0IFwic2tpcHMgbm9uLXdvcmQtY2hhciB3aGVuIHBpY2tpbmcgY3Vyc29yLXdvcmQgdGhlbiBwbGFjZSBjdXJzb3IgdG8gbmV4dCBvY2N1cnJlbmNlIG9mIHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBAZGVmXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIEBkZWZcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAxXVxuXG4gICAgICAgIGl0IFwiZG9lc24ndCBtb3ZlIGN1cnNvciB1bmxlc3MgbmV4dCBtYXRjaCBoYXMgZXhhY3Qgd29yZCBlbmRpbmdcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBAZGVmXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIEBkZWYxXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgICBpdCBcIm1vdmVzIGN1cnNvciB0byB0aGUgc3RhcnQgb2YgdmFsaWQgd29yZCBjaGFyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbmRlZlxcbmFiY1xcbkBkZWZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAxXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIG5vbi13b3JkIGNoYXIgY29sdW1uXCIsIC0+XG4gICAgICAgIGl0IFwibWF0Y2hlcyBvbmx5IHRoZSBub24td29yZCBjaGFyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5AZGVmXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMywgMV1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBub3Qgb24gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwiZG9lcyBhIG1hdGNoIHdpdGggdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG5hICBAZGVmXFxuIGFiY1xcbiBAZGVmXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbMywgMl1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBhdCBFT0ZcIiwgLT5cbiAgICAgICAgaXQgXCJkb2Vzbid0IHRyeSB0byBkbyBhbnkgbWF0Y2hcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuQGRlZlxcbmFiY1xcbiBcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJjYXNlU2Vuc2l0aXZpdHkgc2V0dGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBBQkNcbiAgICAgICAgICBhYkNcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBBQkNcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInNlYXJjaCBjYXNlIHNlbnNpdGl2ZWx5IHdoZW4gYGlnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZGAgaXMgZmFsc2UoPWRlZmF1bHQpXCIsIC0+XG4gICAgICAgIGV4cGVjdChzZXR0aW5ncy5nZXQoJ2lnbm9yZUNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCcpKS50b0JlKGZhbHNlKVxuICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInNlYXJjaCBjYXNlIGluc2Vuc2l0aXZlbHkgd2hlbiBgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkYCB0cnVlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCAnaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkJywgdHJ1ZVxuICAgICAgICBlbnN1cmUgJyonLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFs0LCAwXVxuXG4gICAgICBkZXNjcmliZSBcInVzZVNtYXJ0Y2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkIGlzIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCAndXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQnLCB0cnVlXG5cbiAgICAgICAgaXQgXCJzZWFyY2ggY2FzZSBzZW5zaXRpdmVseSB3aGVuIGVuYWJsZSBhbmQgc2VhcmNoIHRlcm0gaW5jbHVkZXMgdXBwZXJjYXNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICcqJywgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIGl0IFwic2VhcmNoIGNhc2UgaW5zZW5zaXRpdmVseSB3aGVuIGVuYWJsZSBhbmQgc2VhcmNoIHRlcm0gTk9UIGluY2x1ZGVzIHVwcGVyY2FzZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzQsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgaGFzaCBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyBjdXJzb3IgdG8gcHJldmlvdXMgb2NjdXJyZW5jZSBvZiB3b3JkIHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbkBkZWZcXG5hYmNcXG5kZWZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyB3aXRoIG5cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhYmNcXG5AZGVmXFxuYWJjXFxuZGVmXFxuYWJjXFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImRvZXNuJ3QgbW92ZSBjdXJzb3IgdW5sZXNzIG5leHQgb2NjdXJyZW5jZSBpcyB0aGUgZXhhY3Qgd29yZCAobm8gcGFydGlhbCBtYXRjaGVzKVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbmRlZlxcbmdoaWFiY1xcbmprbFxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIHdvcmRzIHRoYXQgY29udGFpbnQgJ25vbi13b3JkJyBjaGFyYWN0ZXJzXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgY3Vyc29yIHRvIG5leHQgb2NjdXJyZW5jZSBvZiB3b3JkIHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG5AZGVmXFxuYWJjXFxuQGRlZlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgICAgaXQgXCJtb3ZlcyBjdXJzb3IgdG8gdGhlIHN0YXJ0IG9mIHZhbGlkIHdvcmQgY2hhclwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG5AZGVmXFxuYWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiBub24td29yZCBjaGFyIGNvbHVtblwiLCAtPlxuICAgICAgICBpdCBcIm1hdGNoZXMgb25seSB0aGUgbm9uLXdvcmQgY2hhclwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG5AZGVmXFxuYWJjXFxuQGRlZlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnKicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICBkZXNjcmliZSBcImNhc2VTZW5zaXRpdml0eSBzZXR0aW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIEFCQ1xuICAgICAgICAgIGFiQ1xuICAgICAgICAgIGFiY1xuICAgICAgICAgIEFCQ1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGl0IFwic2VhcmNoIGNhc2Ugc2Vuc2l0aXZlbHkgd2hlbiBgaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkYCBpcyBmYWxzZSg9ZGVmYXVsdClcIiwgLT5cbiAgICAgICAgZXhwZWN0KHNldHRpbmdzLmdldCgnaWdub3JlQ2FzZUZvclNlYXJjaEN1cnJlbnRXb3JkJykpLnRvQmUoZmFsc2UpXG4gICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGl0IFwic2VhcmNoIGNhc2UgaW5zZW5zaXRpdmVseSB3aGVuIGBpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmRgIHRydWVcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0ICdpZ25vcmVDYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQnLCB0cnVlXG4gICAgICAgIGVuc3VyZSAnIycsIGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlU21hcnRjYXNlRm9yU2VhcmNoQ3VycmVudFdvcmQgaXMgZW5hYmxlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VTbWFydGNhc2VGb3JTZWFyY2hDdXJyZW50V29yZCcsIHRydWVcblxuICAgICAgICBpdCBcInNlYXJjaCBjYXNlIHNlbnNpdGl2ZWx5IHdoZW4gZW5hYmxlIGFuZCBzZWFyY2ggdGVybSBpbmNsdWRlcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgICBlbnN1cmUgJyMnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgICAgaXQgXCJzZWFyY2ggY2FzZSBpbnNlbnNpdGl2ZWx5IHdoZW4gZW5hYmxlIGFuZCBzZWFyY2ggdGVybSBOT1QgaW5jbHVkZXMgdXBwZXJjYXNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICcjJywgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbicsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICduJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ24nLCBjdXJzb3I6IFswLCAwXVxuXG4gICMgRklYTUU6IE5vIGxvbmdlciBjaGlsZCBvZiBzZWFyY2ggc28gbW92ZSB0byBtb3Rpb24tZ2VuZXJhbC1zcGVjLmNvZmZlP1xuICBkZXNjcmliZSAndGhlICUgbW90aW9uJywgLT5cbiAgICBkZXNjcmliZSBcIlBhcmVudGhlc2lzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIihfX18pXCJcbiAgICAgIGRlc2NyaWJlIFwiYXMgb3BlcmF0b3IgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCIoXyhfKV8pXCJcbiAgICAgICAgaXQgJ2JlaGF2ZSBpbmNsdXNpdmVseSB3aGVuIGlzIGF0IG9wZW4gcGFpcicsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICdkICUnLCB0ZXh0OiBcIihfXylcIlxuICAgICAgICBpdCAnYmVoYXZlIGluY2x1c2l2ZWx5IHdoZW4gaXMgYXQgb3BlbiBwYWlyJywgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJ2QgJScsIHRleHQ6IFwiKF9fKVwiXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBwYWlyIGNoYXJcIiwgLT5cbiAgICAgICAgaXQgXCJjdXJzb3IgaXMgYXQgb3BlbiBwYWlyLCBpdCBtb3ZlIHRvIGNsb3NpbmcgcGFpclwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJjdXJzb3IgaXMgYXQgY2xvc2UgcGFpciwgaXQgbW92ZSB0byBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDRdXG4gICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBlbmNsb3NlZCBieSBwYWlyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiKF9fXylcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGl0IFwibW92ZSB0byBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgYm9mb3JlIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIl9fKF9fXylcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwibW92ZSB0byBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgYWZ0ZXIgY2xvc2UgcGFpclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIl9fKF9fXylfX1wiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgaXQgXCJmYWlsIHRvIG1vdmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgZGVzY3JpYmUgXCJtdWx0aSBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgX19fXG4gICAgICAgICAgICBfX18oX19cbiAgICAgICAgICAgIF9fX1xuICAgICAgICAgICAgX19fKVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBvcGVuIGFuZCBjbG9zZSBwYWlyIGlzIG5vdCBhdCBjdXJzb3IgbGluZVwiLCAtPlxuICAgICAgICAgIGl0IFwiZmFpbCB0byBtb3ZlXCIsIC0+XG4gICAgICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBpdCBcImZhaWwgdG8gbW92ZVwiLCAtPlxuICAgICAgICAgICAgc2V0ICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBvcGVuIHBhaXIgaXMgZm9yd2FyZGluZyB0byBjdXJzb3IgaW4gc2FtZSByb3dcIiwgLT5cbiAgICAgICAgICBpdCBcIm1vdmUgdG8gY2xvc2luZyBwYWlyXCIsIC0+XG4gICAgICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBwb3NpdGlvbiBpcyBncmVhdGVyIHRoYW4gb3BlbiBwYWlyXCIsIC0+XG4gICAgICAgICAgaXQgXCJmYWlsIHRvIG1vdmVcIiwgLT5cbiAgICAgICAgICAgIHNldCAgICAgICAgIGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBkZXNjcmliZSBcIndoZW4gY2xvc2UgcGFpciBpcyBmb3J3YXJkaW5nIHRvIGN1cnNvciBpbiBzYW1lIHJvd1wiLCAtPlxuICAgICAgICAgIGl0IFwibW92ZSB0byBjbG9zaW5nIHBhaXJcIiwgLT5cbiAgICAgICAgICAgIHNldCAgICAgICAgIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFsxLCAzXVxuXG4gICAgZGVzY3JpYmUgXCJDdXJseUJyYWNrZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwie19fX31cIlxuICAgICAgaXQgXCJjdXJzb3IgaXMgYXQgb3BlbiBwYWlyLCBpdCBtb3ZlIHRvIGNsb3NpbmcgcGFpclwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJjdXJzb3IgaXMgYXQgY2xvc2UgcGFpciwgaXQgbW92ZSB0byBvcGVuIHBhaXJcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwiU3F1YXJlQnJhY2tldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJbX19fXVwiXG4gICAgICBpdCBcImN1cnNvciBpcyBhdCBvcGVuIHBhaXIsIGl0IG1vdmUgdG8gY2xvc2luZyBwYWlyXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDRdXG4gICAgICAgIGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImN1cnNvciBpcyBhdCBjbG9zZSBwYWlyLCBpdCBtb3ZlIHRvIG9wZW4gcGFpclwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJjb21wbGV4IHNpdHVhdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAoX19fX18pX197X19bX19fXV9ffVxuICAgICAgICAgIF9cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0ICdtb3ZlIHRvIGNsb3NpbmcgcGFpciB3aGljaCBvcGVuIHBhaXIgY29tZSBmaXJzdCcsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAxOV1cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgICBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAxNl1cbiAgICAgIGl0ICdlbmNsb3NpbmcgcGFpciBpcyBwcmlvcml0aXplZCBvdmVyIGZvcndhcmRpbmcgcmFuZ2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiY29tcGxleCBzaXR1YXRpb24gd2l0aCBodG1sIHRhZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgIHNvbWUgdGV4dFxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgJ21vdmUgdG8gcGFpciB0YWcgb25seSB3aGVuIGN1cnNvciBpcyBvbiBvcGVuIG9yIGNsb3NlIHRhZyBidXQgbm90IG9uIEFuZ2xlQnJhY2tldCg8LCA+KScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXTsgZW5zdXJlICclJywgY3Vyc29yOiBbNCwgMV1cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdOyBlbnN1cmUgJyUnLCBjdXJzb3I6IFs0LCAxXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM107IGVuc3VyZSAnJScsIGN1cnNvcjogWzQsIDFdXG5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDFdOyBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMl07IGVuc3VyZSAnJScsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAzXTsgZW5zdXJlICclJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDRdOyBlbnN1cmUgJyUnLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlIFwiW3JlZ3Jlc3Npb24gZ3VhcmRdIHJlcGVhdChuIG9yIE4pIGFmdGVyIHVzZWQgYXMgb3BlcmF0b3IgdGFyZ2V0XCIsIC0+XG4gICAgaXQgXCJyZXBlYXQgYWZ0ZXIgZCAvXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgICAgICAgICAgdGV4dEM6IFwiYTEgICAgfGEyICAgIGEzICAgIGE0XCJcbiAgICAgIGVuc3VyZSBcImQgLyBhIGVudGVyXCIsIHRleHRDOiBcImExICAgIHxhMyAgICBhNFwiLCAgICAgIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgICAgZW5zdXJlIFwiblwiLCAgICAgICAgICAgdGV4dEM6IFwiYTEgICAgYTMgICAgfGE0XCIsICAgICAgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCJOXCIsICAgICAgICAgICB0ZXh0QzogXCJhMSAgICB8YTMgICAgYTRcIiwgICAgICBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcbiAgICBpdCBcInJlcGVhdCBhZnRlciBkID9cIiwgLT5cbiAgICAgIHNldCAgICAgICAgICAgICAgICAgICB0ZXh0QzogXCJhMSAgICBhMiAgICB8YTMgICAgYTRcIlxuICAgICAgZW5zdXJlIFwiZCA/IGEgZW50ZXJcIiwgdGV4dEM6IFwiYTEgICAgfGEzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgICAgZW5zdXJlIFwiblwiLCAgICAgICAgICAgdGV4dEM6IFwifGExICAgIGEzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgICAgZW5zdXJlIFwiTlwiLCAgICAgICAgICAgdGV4dEM6IFwiYTEgICAgfGEzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuIl19
