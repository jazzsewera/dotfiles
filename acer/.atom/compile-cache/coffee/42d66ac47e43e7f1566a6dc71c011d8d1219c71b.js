(function() {
  var TextData, dispatch, getView, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Occurrence", function() {
    var classList, dispatchSearchCommand, editor, editorElement, ensure, ensureWait, inputSearchText, ref1, ref2, searchEditor, searchEditorElement, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureWait = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5], classList = ref1[6];
    ref2 = [], searchEditor = ref2[0], searchEditorElement = ref2[1];
    inputSearchText = function(text) {
      return searchEditor.insertText(text);
    };
    dispatchSearchCommand = function(name) {
      return dispatch(searchEditorElement, name);
    };
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait;
        classList = editorElement.classList;
        searchEditor = vimState.searchInput.editor;
        return searchEditorElement = vimState.searchInput.editorElement;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("operator-modifier-occurrence", function() {
      beforeEach(function() {
        return set({
          text: "\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
        });
      });
      describe("o modifier", function() {
        return it("change occurrence of cursor word in inner-paragraph", function() {
          set({
            cursor: [1, 0]
          });
          ensure("c o i p", {
            mode: 'insert',
            textC: "\n!: xxx: |:\n---: |: xxx: |:\n|: xxx: ---: xxx: |:\nxxx: ---: |: |:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          editor.insertText('===');
          ensure("escape", {
            mode: 'normal',
            textC: "\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n\nooo: xxx: ooo:\n---: ooo: xxx: ooo:\nooo: xxx: ---: xxx: ooo:\nxxx: ---: ooo: ooo:\n"
          });
          return ensure("} j .", {
            mode: 'normal',
            textC: "\n===: xxx: ===:\n---: ===: xxx: ===:\n===: xxx: ---: xxx: ===:\nxxx: ---: ===: ===:\n\n==!=: xxx: ==|=:\n---: ==|=: xxx: ==|=:\n==|=: xxx: ---: xxx: ==|=:\nxxx: ---: ==|=: ==|=:\n"
          });
        });
      });
      describe("O modifier", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return it("delete subword-occurrence in paragraph and repeatable", function() {
          ensure("d O p", {
            textC: "\ncamel| Cases\n\"Study\" Snake\nUP_CASE\n\nother ParagraphCase"
          });
          return ensure("G .", {
            textC: "\ncamel Cases\n\"Study\" Snake\nUP_CASE\n\nother| Paragraph"
          });
        });
      });
      describe("apply various operator to occurrence in various target", function() {
        beforeEach(function() {
          return set({
            textC: "ooo: xxx: o!oo:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
        });
        it("upper case inner-word", function() {
          ensure("g U o i l", {
            textC: "OOO: xxx: O!OO:\n===: ooo: xxx: ooo:\nooo: xxx: ===: xxx: ooo:\nxxx: ===: ooo: ooo:"
          });
          ensure("2 j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: =!==: xxx: OOO:\nxxx: ===: ooo: ooo:"
          });
          return ensure("j .", {
            textC: "OOO: xxx: OOO:\n===: ooo: xxx: ooo:\nOOO: xxx: ===: xxx: OOO:\nxxx: ===: O!OO: OOO:"
          });
        });
        return describe("clip to mutation end behavior", function() {
          beforeEach(function() {
            return set({
              textC: "\noo|o:xxx:ooo:\nxxx:ooo:xxx\n\n"
            });
          });
          it("[d o p] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o p", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          it("[d o j] delete occurrence and cursor is at mutation end", function() {
            return ensure("d o j", {
              textC: "\n|:xxx::\nxxx::xxx\n\n"
            });
          });
          return it("not clip if original cursor not intersects any occurence-marker", function() {
            ensure('g o', {
              occurrenceText: ['ooo', 'ooo', 'ooo'],
              cursor: [1, 2]
            });
            ensure('j', {
              cursor: [2, 2]
            });
            return ensure("d p", {
              textC: "\n:xxx::\nxx|x::xxx\n\n"
            });
          });
        });
      });
      describe("auto extend target range to include occurrence", function() {
        var textFinal, textOriginal;
        textOriginal = "This text have 3 instance of 'text' in the whole text.\n";
        textFinal = textOriginal.replace(/text/g, '');
        beforeEach(function() {
          return set({
            text: textOriginal
          });
        });
        it("[from start of 1st]", function() {
          set({
            cursor: [0, 5]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from middle of 1st]", function() {
          set({
            cursor: [0, 7]
          });
          return ensure('d o $', {
            text: textFinal
          });
        });
        it("[from end of last]", function() {
          set({
            cursor: [0, 52]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
        return it("[from middle of last]", function() {
          set({
            cursor: [0, 51]
          });
          return ensure('d o 0', {
            text: textFinal
          });
        });
      });
      return describe("select-occurrence", function() {
        beforeEach(function() {
          return set({
            text: "vim-mode-plus vim-mode-plus"
          });
        });
        return describe("what the cursor-word", function() {
          var ensureCursorWord;
          ensureCursorWord = function(initialPoint, arg) {
            var selectedText;
            selectedText = arg.selectedText;
            set({
              cursor: initialPoint
            });
            ensure("g cmd-d i p", {
              selectedText: selectedText,
              mode: ['visual', 'characterwise']
            });
            return ensure("escape", {
              mode: "normal"
            });
          };
          describe("cursor is on normal word", function() {
            return it("pick word but not pick partially matched one [by select]", function() {
              ensureCursorWord([0, 0], {
                selectedText: ['vim', 'vim']
              });
              ensureCursorWord([0, 3], {
                selectedText: ['-', '-', '-', '-']
              });
              ensureCursorWord([0, 4], {
                selectedText: ['mode', 'mode']
              });
              return ensureCursorWord([0, 9], {
                selectedText: ['plus', 'plus']
              });
            });
          });
          describe("cursor is at single white space [by delete]", function() {
            return it("pick single white space only", function() {
              set({
                text: "ooo ooo ooo\n ooo ooo ooo",
                cursor: [0, 3]
              });
              return ensure("d o i p", {
                text: "ooooooooo\nooooooooo"
              });
            });
          });
          return describe("cursor is at sequnce of space [by delete]", function() {
            return it("select sequnce of white spaces including partially mached one", function() {
              set({
                cursor: [0, 3],
                text_: "ooo___ooo ooo\n ooo ooo____ooo________ooo"
              });
              return ensure("d o i p", {
                text_: "oooooo ooo\n ooo ooo ooo  ooo"
              });
            });
          });
        });
      });
    });
    describe("stayOnOccurrence settings", function() {
      beforeEach(function() {
        return set({
          textC: "\naaa, bbb, ccc\nbbb, a|aa, aaa\n"
        });
      });
      describe("when true (= default)", function() {
        return it("keep cursor position after operation finished", function() {
          return ensure('g U o p', {
            textC: "\nAAA, bbb, ccc\nbbb, A|AA, AAA\n"
          });
        });
      });
      return describe("when false", function() {
        beforeEach(function() {
          return settings.set('stayOnOccurrence', false);
        });
        return it("move cursor to start of target as like non-ocurrence operator", function() {
          return ensure('g U o p', {
            textC: "\n|AAA, bbb, ccc\nbbb, AAA, AAA\n"
          });
        });
      });
    });
    describe("from visual-mode.is-narrowed", function() {
      beforeEach(function() {
        return set({
          text: "ooo: xxx: ooo\n|||: ooo: xxx: ooo\nooo: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
          cursor: [0, 0]
        });
      });
      describe("[vC] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("v 2 j cmd-d", {
            selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "OOO: xxx: OOO\n|||: OOO: xxx: OOO\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 5,
            mode: 'normal'
          });
        });
      });
      describe("[vL] select-occurrence", function() {
        return it("select cursor-word which intersecting selection then apply upper-case", function() {
          ensure("5 l V 2 j cmd-d", {
            selectedText: ['xxx', 'xxx', 'xxx', 'xxx'],
            mode: ['visual', 'characterwise']
          });
          return ensure("U", {
            text: "ooo: XXX: ooo\n|||: ooo: XXX: ooo\nooo: XXX: |||: XXX: ooo\nxxx: |||: ooo: ooo",
            numCursors: 4,
            mode: 'normal'
          });
        });
      });
      return describe("[vB] select-occurrence", function() {
        it("select cursor-word which intersecting selection then apply upper-case", function() {
          return ensure("W ctrl-v 2 j $ h cmd-d U", {
            text: "ooo: xxx: OOO\n|||: OOO: xxx: OOO\nooo: xxx: |||: xxx: OOO\nxxx: |||: ooo: ooo",
            numCursors: 4
          });
        });
        return it("pick cursor-word from vB range", function() {
          return ensure("ctrl-v 7 l 2 j o cmd-d U", {
            text: "OOO: xxx: ooo\n|||: OOO: xxx: ooo\nOOO: xxx: |||: xxx: ooo\nxxx: |||: ooo: ooo",
            numCursors: 3
          });
        });
      });
    });
    describe("incremental search integration: change-occurrence-from-search, select-occurrence-from-search", function() {
      beforeEach(function() {
        settings.set('incrementalSearch', true);
        return set({
          text: "ooo: xxx: ooo: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:",
          cursor: [0, 0]
        });
      });
      describe("from normal mode", function() {
        it("select occurrence by pattern match", function() {
          ensure('/');
          inputSearchText('\\d{3,4}');
          dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
          return ensure('i e', {
            selectedText: ['3333', '444', '0000'],
            mode: ['visual', 'characterwise']
          });
        });
        return it("change occurrence by pattern match", function() {
          ensure('/');
          inputSearchText('^\\w+:');
          dispatchSearchCommand('vim-mode-plus:change-occurrence-from-search');
          ensure('i e', {
            mode: 'insert'
          });
          editor.insertText('hello');
          return ensure(null, {
            text: "hello xxx: ooo: 0000\nhello ooo: 22: ooo:\nhello xxx: |||: xxx: 3333:\nhello |||: ooo: ooo:"
          });
        });
      });
      describe("from visual mode", function() {
        describe("visual characterwise", function() {
          return it("change occurrence in narrowed selection", function() {
            ensure('v j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: ooo: 22: ooo:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        describe("visual linewise", function() {
          return it("change occurrence in narrowed selection", function() {
            ensure('V j /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "OOO: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
        return describe("visual blockwise", function() {
          return it("change occurrence in narrowed selection", function() {
            set({
              cursor: [0, 5]
            });
            ensure('ctrl-v 2 j 1 0 l /');
            inputSearchText('o+');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: xxx: OOO: 0000\n1: OOO: 22: OOO:\nooo: xxx: |||: xxx: 3333:\n444: |||: ooo: ooo:"
            });
          });
        });
      });
      describe("persistent-selection is exists", function() {
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:create-persistent-selection'
            }
          });
          set({
            text: "ooo: xxx: ooo:\n|||: ooo: xxx: ooo:\nooo: xxx: |||: xxx: ooo:\nxxx: |||: ooo: ooo:\n",
            cursor: [0, 0]
          });
          return ensure('V j m G m m', {
            persistentSelectionBufferRange: [[[0, 0], [2, 0]], [[3, 0], [4, 0]]]
          });
        });
        describe("when no selection is exists", function() {
          return it("select occurrence in all persistent-selection", function() {
            set({
              cursor: [0, 0]
            });
            ensure('/');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: xxx: |||: xxx: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
        return describe("when both exits, operator applied to both", function() {
          return it("select all occurrence in selection", function() {
            set({
              cursor: [0, 0]
            });
            ensure('V 2 j /');
            inputSearchText('xxx');
            dispatchSearchCommand('vim-mode-plus:select-occurrence-from-search');
            return ensure('U', {
              text: "ooo: XXX: ooo:\n|||: ooo: XXX: ooo:\nooo: XXX: |||: XXX: ooo:\nXXX: |||: ooo: ooo:\n",
              persistentSelectionCount: 0
            });
          });
        });
      });
      return describe("demonstrate persistent-selection's practical scenario", function() {
        var oldGrammar;
        oldGrammar = [][0];
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        beforeEach(function() {
          atom.keymaps.add("create-persistent-selection", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm': 'vim-mode-plus:toggle-persistent-selection'
            }
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-coffee-script');
          });
          runs(function() {
            oldGrammar = editor.getGrammar();
            return editor.setGrammar(atom.grammars.grammarForScopeName('source.coffee'));
          });
          return set({
            text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement = @editor.element\n  @emitter = new Emitter\n  @subscriptions = new CompositeDisposable\n  @modeManager = new ModeManager(this)\n  @mark = new MarkManager(this)\n  @register = new RegisterManager(this)\n  @persistentSelections = []\n\n  @highlightSearchSubscription = @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack = new OperationStack(this)\n  @cursorStyleManager = new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
          });
        });
        return it('change all assignment("=") of current-function to "?="', function() {
          set({
            cursor: [0, 0]
          });
          ensure('j f =', {
            cursor: [1, 17]
          });
          runs(function() {
            var _keystroke, textsInBufferRange, textsInBufferRangeIsAllEqualChar;
            _keystroke = ['g cmd-d', 'i f', 'm'].join(" ");
            ensure(_keystroke);
            textsInBufferRange = vimState.persistentSelection.getMarkerBufferRanges().map(function(range) {
              return editor.getTextInBufferRange(range);
            });
            textsInBufferRangeIsAllEqualChar = textsInBufferRange.every(function(text) {
              return text === '=';
            });
            expect(textsInBufferRangeIsAllEqualChar).toBe(true);
            expect(vimState.persistentSelection.getMarkers()).toHaveLength(11);
            ensure('2 l');
            ensure('/ => enter', {
              cursor: [9, 69]
            });
            ensure("m");
            return expect(vimState.persistentSelection.getMarkers()).toHaveLength(10);
          });
          waitsFor(function() {
            return classList.contains('has-persistent-selection');
          });
          return runs(function() {
            ensure("ctrl-cmd-g I");
            editor.insertText('?');
            return ensure('escape', {
              text: "constructor: (@main, @editor, @statusBarManager) ->\n  @editorElement ?= @editor.element\n  @emitter ?= new Emitter\n  @subscriptions ?= new CompositeDisposable\n  @modeManager ?= new ModeManager(this)\n  @mark ?= new MarkManager(this)\n  @register ?= new RegisterManager(this)\n  @persistentSelections ?= []\n\n  @highlightSearchSubscription ?= @editorElement.onDidChangeScrollTop =>\n    @refreshHighlightSearch()\n\n  @operationStack ?= new OperationStack(this)\n  @cursorStyleManager ?= new CursorStyleManager(this)\n\nanotherFunc: ->\n  @hello = []"
            });
          });
        });
      });
    });
    describe("preset occurrence marker", function() {
      beforeEach(function() {
        return set({
          text: "This text have 3 instance of 'text' in the whole text",
          cursor: [0, 0]
        });
      });
      describe("toggle-preset-occurrence commands", function() {
        describe("in normal-mode", function() {
          describe("add preset occurrence", function() {
            return it('set cursor-ward as preset occurrence marker and not move cursor', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              return ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
            });
          });
          describe("remove preset occurrence", function() {
            it('removes occurrence one by one separately', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('b g o', {
                occurrenceText: ['text', 'text'],
                cursor: [0, 0]
              });
            });
            it('removes all occurrence in this editor by escape', function() {
              ensure('g o', {
                occurrenceText: 'This',
                cursor: [0, 0]
              });
              ensure('w', {
                cursor: [0, 5]
              });
              ensure('g o', {
                occurrenceText: ['This', 'text', 'text', 'text'],
                cursor: [0, 5]
              });
              return ensure('escape', {
                occurrenceCount: 0
              });
            });
            return it('can recall previously set occurence pattern by `g .`', function() {
              ensure('w v l g o', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 6]
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
              ensure('w', {
                cursor: [0, 10]
              });
              ensure('g .', {
                occurrenceText: ['te', 'te', 'te'],
                cursor: [0, 10]
              });
              ensure('g U o $', {
                textC: "This text |HAVE 3 instance of 'text' in the whole text"
              });
              return expect(vimState.globalState.get('lastOccurrencePattern')).toEqual(/te/g);
            });
          });
          describe("restore last occurrence marker by add-preset-occurrence-from-last-occurrence-pattern", function() {
            beforeEach(function() {
              return set({
                textC: "camel\ncamelCase\ncamels\ncamel"
              });
            });
            it("can restore occurrence-marker added by `g o` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel']
              });
            });
            it("can restore occurrence-marker added by `g o` in visual-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("v i w", {
                selectedText: "camel"
              });
              ensure("g o", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel', 'camel']
              });
            });
            return it("can restore occurrence-marker added by `g O` in normal-mode", function() {
              set({
                cursor: [0, 0]
              });
              ensure("g O", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
              ensure('escape', {
                occurrenceCount: 0
              });
              return ensure("g .", {
                occurrenceText: ['camel', 'camel', 'camel']
              });
            });
          });
          return describe("css class has-occurrence", function() {
            describe("manually toggle by toggle-preset-occurrence command", function() {
              return it('is auto-set/unset wheter at least one preset-occurrence was exists or not', function() {
                expect(classList.contains('has-occurrence')).toBe(false);
                ensure('g o', {
                  occurrenceText: 'This',
                  cursor: [0, 0]
                });
                expect(classList.contains('has-occurrence')).toBe(true);
                ensure('g o', {
                  occurrenceCount: 0,
                  cursor: [0, 0]
                });
                return expect(classList.contains('has-occurrence')).toBe(false);
              });
            });
            return describe("change 'INSIDE' of marker", function() {
              var markerLayerUpdated;
              markerLayerUpdated = null;
              beforeEach(function() {
                return markerLayerUpdated = false;
              });
              return it('destroy marker and reflect to "has-occurrence" CSS', function() {
                runs(function() {
                  expect(classList.contains('has-occurrence')).toBe(false);
                  ensure('g o', {
                    occurrenceText: 'This',
                    cursor: [0, 0]
                  });
                  expect(classList.contains('has-occurrence')).toBe(true);
                  ensure('l i', {
                    mode: 'insert'
                  });
                  vimState.occurrenceManager.markerLayer.onDidUpdate(function() {
                    return markerLayerUpdated = true;
                  });
                  editor.insertText('--');
                  return ensure("escape", {
                    textC: "T-|-his text have 3 instance of 'text' in the whole text",
                    mode: 'normal'
                  });
                });
                waitsFor(function() {
                  return markerLayerUpdated;
                });
                return runs(function() {
                  ensure(null, {
                    occurrenceCount: 0
                  });
                  return expect(classList.contains('has-occurrence')).toBe(false);
                });
              });
            });
          });
        });
        describe("in visual-mode", function() {
          describe("add preset occurrence", function() {
            return it('set selected-text as preset occurrence marker and not move cursor', function() {
              ensure('w v l', {
                mode: ['visual', 'characterwise'],
                selectedText: 'te'
              });
              return ensure('g o', {
                mode: 'normal',
                occurrenceText: ['te', 'te', 'te']
              });
            });
          });
          return describe("is-narrowed selection", function() {
            var textOriginal;
            textOriginal = [][0];
            beforeEach(function() {
              textOriginal = "This text have 3 instance of 'text' in the whole text\nThis text have 3 instance of 'text' in the whole text\n";
              return set({
                cursor: [0, 0],
                text: textOriginal
              });
            });
            return it("pick ocurrence-word from cursor position and continue visual-mode", function() {
              ensure('w V j', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal
              });
              ensure('g o', {
                mode: ['visual', 'linewise'],
                selectedText: textOriginal,
                occurrenceText: ['text', 'text', 'text', 'text', 'text', 'text']
              });
              return ensureWait('r !', {
                mode: 'normal',
                text: "This !!!! have 3 instance of '!!!!' in the whole !!!!\nThis !!!! have 3 instance of '!!!!' in the whole !!!!\n"
              });
            });
          });
        });
        return describe("in incremental-search", function() {
          beforeEach(function() {
            return settings.set('incrementalSearch', true);
          });
          return describe("add-occurrence-pattern-from-search", function() {
            return it('mark as occurrence which matches regex entered in search-ui', function() {
              ensure('/');
              inputSearchText('\\bt\\w+');
              dispatchSearchCommand('vim-mode-plus:add-occurrence-pattern-from-search');
              return ensure(null, {
                occurrenceText: ['text', 'text', 'the', 'text']
              });
            });
          });
        });
      });
      describe("mutate preset occurrence", function() {
        beforeEach(function() {
          set({
            text: "ooo: xxx: ooo xxx: ooo:\n!!!: ooo: xxx: ooo xxx: ooo:"
          });
          return {
            cursor: [0, 0]
          };
        });
        describe("normal-mode", function() {
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            return ensure('l g o D', {
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[upcase] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 6]
            });
            return ensure('l g o g U j', {
              text: "ooo: XXX: ooo XXX: ooo:\n!!!: ooo: XXX: ooo XXX: ooo:"
            });
          });
          it('[upcase exclude] won\'t mutate removed marker', function() {
            set({
              cursor: [0, 0]
            });
            ensure('g o', {
              occurrenceCount: 6
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('g U j', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: OOO: xxx: OOO xxx: OOO:"
            });
          });
          it('[delete] apply operation to preset-marker intersecting selected target', function() {
            set({
              cursor: [0, 10]
            });
            return ensure('g o g U $', {
              text: "ooo: xxx: OOO xxx: OOO:\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
          });
          it('[change] apply operation to preset-marker intersecting selected target', function() {
            ensure('l g o C', {
              mode: 'insert',
              text: ": xxx:  xxx: :\n!!!: ooo: xxx: ooo xxx: ooo:"
            });
            editor.insertText('YYY');
            return ensure('l g o C', {
              mode: 'insert',
              text: "YYY: xxx: YYY xxx: YYY:\n!!!: ooo: xxx: ooo xxx: ooo:",
              numCursors: 3
            });
          });
          return describe("predefined keymap on when has-occurrence", function() {
            beforeEach(function() {
              return set({
                textC: "Vim is editor I used before\nV|im is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            it('[insert-at-start] apply operation to preset-marker intersecting selected target', function() {
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v k I', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText("pure-");
              return ensure('escape', {
                mode: 'normal',
                textC: "pure!-Vim is editor I used before\npure|-Vim is editor I used before\nVim is editor I used before\nVim is editor I used before"
              });
            });
            return it('[insert-after-start] apply operation to preset-marker intersecting selected target', function() {
              set({
                cursor: [1, 1]
              });
              ensure('g o', {
                occurrenceText: ['Vim', 'Vim', 'Vim', 'Vim']
              });
              classList.contains('has-occurrence');
              ensure('v j A', {
                mode: 'insert',
                numCursors: 2
              });
              editor.insertText(" and Emacs");
              return ensure('escape', {
                mode: 'normal',
                textC: "Vim is editor I used before\nVim and Emac|s is editor I used before\nVim and Emac!s is editor I used before\nVim is editor I used before"
              });
            });
          });
        });
        describe("visual-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              textC: "ooo: x|xx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('v j U', {
              text: "ooo: XXX: ooo XXX: ooo:\nXXX: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        describe("visual-linewise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('V U', {
              text: "ooo: XXX: ooo XXX: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
          });
        });
        return describe("visual-blockwise-mode", function() {
          return it('[upcase] apply to preset-marker as long as it intersects selection', function() {
            set({
              cursor: [0, 6],
              text: "ooo: xxx: ooo xxx: ooo:\nxxx: ooo: xxx: ooo xxx: ooo:"
            });
            ensure('g o', {
              occurrenceCount: 5
            });
            return ensure('ctrl-v j 2 w U', {
              text: "ooo: XXX: ooo xxx: ooo:\nxxx: ooo: XXX: ooo xxx: ooo:"
            });
          });
        });
      });
      describe("MoveToNextOccurrence, MoveToPreviousOccurrence", function() {
        beforeEach(function() {
          set({
            textC: "|ooo: xxx: ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
          });
          return ensure('g o', {
            occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo']
          });
        });
        describe("tab, shift-tab", function() {
          describe("cursor is at start of occurrence", function() {
            return it("search next/previous occurrence marker", function() {
              ensure('tab tab', {
                cursor: [1, 5]
              });
              ensure('2 tab', {
                cursor: [2, 10]
              });
              ensure('2 shift-tab', {
                cursor: [1, 5]
              });
              return ensure('2 shift-tab', {
                cursor: [0, 0]
              });
            });
          });
          return describe("when cursor is inside of occurrence", function() {
            beforeEach(function() {
              ensure("escape", {
                occurrenceCount: 0
              });
              set({
                textC: "oooo oo|oo oooo"
              });
              return ensure('g o', {
                occurrenceCount: 3
              });
            });
            describe("tab", function() {
              return it("move to next occurrence", function() {
                return ensure('tab', {
                  textC: 'oooo oooo |oooo'
                });
              });
            });
            return describe("shift-tab", function() {
              return it("move to previous occurrence", function() {
                return ensure('shift-tab', {
                  textC: '|oooo oooo oooo'
                });
              });
            });
          });
        });
        describe("as operator's target", function() {
          describe("tab", function() {
            it("operate on next occurrence and repeatable", function() {
              ensure("g U tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
            return it("[o-modifier] operate on next occurrence and repeatable", function() {
              ensure("escape", {
                mode: 'normal',
                occurrenceCount: 0
              });
              ensure("g U o tab", {
                text: "OOO: xxx: OOO\n___: ooo: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              ensure(".", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nooo: xxx: ooo:",
                occurrenceCount: 0
              });
              return ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
            });
          });
          return describe("shift-tab", function() {
            return it("operate on next previous and repeatable", function() {
              set({
                cursor: [2, 10]
              });
              ensure("g U shift-tab", {
                text: "ooo: xxx: ooo\n___: ooo: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 3
              });
              ensure(".", {
                text: "ooo: xxx: ooo\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 2
              });
              ensure("2 .", {
                text: "OOO: xxx: OOO\n___: OOO: xxx:\nOOO: xxx: OOO:",
                occurrenceCount: 0
              });
              return expect(classList.contains('has-occurrence')).toBe(false);
            });
          });
        });
        describe("excude particular occurence by `.` repeat", function() {
          it("clear preset-occurrence and move to next", function() {
            return ensure('2 tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: |ooo: xxx:\nOOO: xxx: OOO:"
            });
          });
          return it("clear preset-occurrence and move to previous", function() {
            return ensure('2 shift-tab . g U i p', {
              textC: "OOO: xxx: OOO\n___: OOO: xxx:\n|ooo: xxx: OOO:"
            });
          });
        });
        return describe("when multiple preset-occurrence created at different timing", function() {
          beforeEach(function() {
            set({
              cursor: [0, 5]
            });
            return ensure('g o', {
              occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo', 'xxx', 'xxx', 'xxx']
            });
          });
          return it("visit occurrences ordered by buffer position", function() {
            ensure("tab", {
              textC: "ooo: xxx: |ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: |ooo: xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: |xxx:\nooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\n|ooo: xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: |xxx: ooo:"
            });
            ensure("tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: xxx: |ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\nooo: |xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: xxx:\n|ooo: xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: ooo: |xxx:\nooo: xxx: ooo:"
            });
            ensure("shift-tab", {
              textC: "ooo: xxx: ooo\n___: |ooo: xxx:\nooo: xxx: ooo:"
            });
            return ensure("shift-tab", {
              textC: "ooo: xxx: |ooo\n___: ooo: xxx:\nooo: xxx: ooo:"
            });
          });
        });
      });
      describe("explict operator-modifier o and preset-marker", function() {
        beforeEach(function() {
          return set({
            textC: "|ooo: xxx: ooo xxx: ooo:\n___: ooo: xxx: ooo xxx: ooo:"
          });
        });
        describe("'o' modifier when preset occurrence already exists", function() {
          return it("'o' always pick cursor-word and overwrite existing preset marker)", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w d o", {
              occurrenceText: ["xxx", "xxx", "xxx", "xxx"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              text: "ooo: : ooo : ooo:\n___: ooo: : ooo : ooo:",
              mode: 'normal'
            });
          });
        });
        return describe("occurrence bound operator don't overwite pre-existing preset marker", function() {
          return it("'o' always pick cursor-word and clear existing preset marker", function() {
            ensure("g o", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
            ensure("2 w g cmd-d", {
              occurrenceText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"],
              mode: 'operator-pending'
            });
            return ensure("j", {
              selectedText: ["ooo", "ooo", "ooo", "ooo", "ooo", "ooo"]
            });
          });
        });
      });
      return describe("toggle-preset-subword-occurrence commands", function() {
        beforeEach(function() {
          return set({
            textC: "\ncamelCa|se Cases\n\"CaseStudy\" SnakeCase\nUP_CASE\n\nother ParagraphCase"
          });
        });
        return describe("add preset subword-occurrence", function() {
          return it("mark subword under cursor", function() {
            return ensure('g O', {
              occurrenceText: ['Case', 'Case', 'Case', 'Case']
            });
          });
        });
      });
    });
    describe("linewise-bound-operation in occurrence operation", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage("language-javascript");
        });
        return runs(function() {
          return set({
            grammar: 'source.js',
            textC: "function hello(name) {\n  console.log(\"debug-1\")\n  |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  console.log(\"debug-3\")\n\n  console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      describe("with preset-occurrence", function() {
        it("works characterwise for `delete` operator", function() {
          ensure("g o v i f", {
            mode: ['visual', 'linewise']
          });
          return ensure("d", {
            textC: "function hello(name) {\n  |.log(\"debug-1\")\n  .log(\"debug-2\")\n\n  const greeting = \"hello\"\n  .log(\"debug-3\")\n\n  .log(\"debug-4, includ `` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
        return it("works linewise for `delete-line` operator", function() {
          return ensure("g o v i f D", {
            textC: "function hello(name) {\n|\n  const greeting = \"hello\"\n\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      describe("when specified both o and V operator-modifier", function() {
        it("delete `console` including line by `V` modifier", function() {
          return ensure("d o V f", {
            textC: "function hello(name) {\n|\n  const greeting = \"hello\"\n\n  returrn name + \" \" + greeting\n}"
          });
        });
        return it("upper-case `console` including line by `V` modifier", function() {
          return ensure("g U o V f", {
            textC: "function hello(name) {\n  CONSOLE.LOG(\"DEBUG-1\")\n  |CONSOLE.LOG(\"DEBUG-2\")\n\n  const greeting = \"hello\"\n  CONSOLE.LOG(\"DEBUG-3\")\n\n  CONSOLE.LOG(\"DEBUG-4, INCLUD `CONSOLE` WORD\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
      return describe("with o operator-modifier", function() {
        return it("toggle-line-comments of `occurrence` inclding **lines**", function() {
          ensure("g / o f", {
            textC: "function hello(name) {\n  // console.log(\"debug-1\")\n  // |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  // console.log(\"debug-3\")\n\n  // console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
          return ensure('.', {
            textC: "function hello(name) {\n  console.log(\"debug-1\")\n  |console.log(\"debug-2\")\n\n  const greeting = \"hello\"\n  console.log(\"debug-3\")\n\n  console.log(\"debug-4, includ `console` word\")\n  returrn name + \" \" + greeting\n}"
          });
        });
      });
    });
    return describe("confirmThresholdOnOccurrenceOperation config", function() {
      beforeEach(function() {
        set({
          textC: "|oo oo oo oo oo\n"
        });
        return spyOn(atom, 'confirm');
      });
      describe("when under threshold", function() {
        beforeEach(function() {
          return settings.set("confirmThresholdOnOccurrenceOperation", 100);
        });
        it("does not ask confirmation on o-modifier", function() {
          ensure("c o", {
            mode: "operator-pending",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
        it("does not ask confirmation on O-modifier", function() {
          ensure("c O", {
            mode: "operator-pending",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
        it("does not ask confirmation on `g o`", function() {
          ensure("g o", {
            mode: "normal",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
        return it("does not ask confirmation on `g O`", function() {
          ensure("g O", {
            mode: "normal",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
          return expect(atom.confirm).not.toHaveBeenCalled();
        });
      });
      return describe("when exceeding threshold", function() {
        beforeEach(function() {
          return settings.set("confirmThresholdOnOccurrenceOperation", 2);
        });
        it("ask confirmation on o-modifier", function() {
          ensure("c o", {
            mode: "operator-pending",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        it("ask confirmation on O-modifier", function() {
          ensure("c O", {
            mode: "operator-pending",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        it("can cancel and confirm on o-modifier", function() {
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Cancel");
          });
          ensure("c o", {
            mode: "operator-pending",
            occurrenceText: []
          });
          ensure(null, {
            mode: "operator-pending",
            occurrenceText: []
          });
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Continue");
          });
          return ensure("o", {
            mode: "operator-pending",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
        });
        it("ask confirmation on `g o`", function() {
          ensure("g o", {
            mode: "normal",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        it("ask confirmation on `g O`", function() {
          ensure("g O", {
            mode: "normal",
            occurrenceText: []
          });
          return expect(atom.confirm).toHaveBeenCalled();
        });
        return it("can cancel and confirm on `g o`", function() {
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Cancel");
          });
          ensure("g o", {
            mode: "normal",
            occurrenceText: []
          });
          ensure(null, {
            mode: "normal",
            occurrenceText: []
          });
          atom.confirm.andCallFake(function(arg) {
            var buttons;
            buttons = arg.buttons;
            return buttons.indexOf("Continue");
          });
          return ensure("g o", {
            mode: "normal",
            occurrenceText: ['oo', 'oo', 'oo', 'oo', 'oo']
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb2NjdXJyZW5jZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBNkMsT0FBQSxDQUFRLGVBQVIsQ0FBN0MsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCLHVCQUF4QixFQUFrQzs7RUFDbEMsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsWUFBVCxFQUF1QixTQUFBO0FBQ3JCLFFBQUE7SUFBQSxPQUF3RSxFQUF4RSxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG9CQUFkLEVBQTBCLGdCQUExQixFQUFrQyx1QkFBbEMsRUFBaUQsa0JBQWpELEVBQTJEO0lBQzNELE9BQXNDLEVBQXRDLEVBQUMsc0JBQUQsRUFBZTtJQUNmLGVBQUEsR0FBa0IsU0FBQyxJQUFEO2FBQ2hCLFlBQVksQ0FBQyxVQUFiLENBQXdCLElBQXhCO0lBRGdCO0lBRWxCLHFCQUFBLEdBQXdCLFNBQUMsSUFBRDthQUN0QixRQUFBLENBQVMsbUJBQVQsRUFBOEIsSUFBOUI7SUFEc0I7SUFHeEIsVUFBQSxDQUFXLFNBQUE7TUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7UUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYztRQUNkLFNBQUEsR0FBWSxhQUFhLENBQUM7UUFDMUIsWUFBQSxHQUFlLFFBQVEsQ0FBQyxXQUFXLENBQUM7ZUFDcEMsbUJBQUEsR0FBc0IsUUFBUSxDQUFDLFdBQVcsQ0FBQztNQU5qQyxDQUFaO2FBUUEsSUFBQSxDQUFLLFNBQUE7ZUFDSCxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQjtNQURHLENBQUw7SUFUUyxDQUFYO0lBWUEsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUE7TUFD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LENBQUcsaUNBQUgsRUFBc0MsU0FBQTtVQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQWIsQ0FBeUIsU0FBQyxHQUFEO0FBQWUsZ0JBQUE7WUFBYixVQUFEO21CQUFjLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFFBQWhCO1VBQWYsQ0FBekI7VUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsSUFBQSxFQUFNLFFBQU47WUFBZ0IsY0FBQSxFQUFnQixFQUFoQztXQUFkO1VBQ0EsTUFBQSxDQUFPLElBQVAsRUFBYTtZQUFBLElBQUEsRUFBTSxRQUFOO1lBQWdCLGNBQUEsRUFBZ0IsRUFBaEM7V0FBYjtVQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBYixDQUF5QixTQUFDLEdBQUQ7QUFBZSxnQkFBQTtZQUFiLFVBQUQ7bUJBQWMsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBaEI7VUFBZixDQUF6QjtpQkFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsSUFBQSxFQUFNLFFBQU47WUFBZ0IsY0FBQSxFQUFnQixDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixFQUFtQixJQUFuQixFQUF5QixJQUF6QixDQUFoQztXQUFkO1FBTG9DLENBQXRDO01BM0JtQyxDQUFyQztJQXpCdUQsQ0FBekQ7RUF0bkNxQixDQUF2QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk9jY3VycmVuY2VcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0LCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlLCBjbGFzc0xpc3RdID0gW11cbiAgW3NlYXJjaEVkaXRvciwgc2VhcmNoRWRpdG9yRWxlbWVudF0gPSBbXVxuICBpbnB1dFNlYXJjaFRleHQgPSAodGV4dCkgLT5cbiAgICBzZWFyY2hFZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuICBkaXNwYXRjaFNlYXJjaENvbW1hbmQgPSAobmFtZSkgLT5cbiAgICBkaXNwYXRjaChzZWFyY2hFZGl0b3JFbGVtZW50LCBuYW1lKVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdH0gPSB2aW1cbiAgICAgIGNsYXNzTGlzdCA9IGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0XG4gICAgICBzZWFyY2hFZGl0b3IgPSB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JcbiAgICAgIHNlYXJjaEVkaXRvckVsZW1lbnQgPSB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3JFbGVtZW50XG5cbiAgICBydW5zIC0+XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgZGVzY3JpYmUgXCJvcGVyYXRvci1tb2RpZmllci1vY2N1cnJlbmNlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgIC0tLTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgb29vOiB4eHg6IC0tLTogeHh4OiBvb286XG4gICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICBvb286IHh4eDogb29vOlxuICAgICAgICAtLS06IG9vbzogeHh4OiBvb286XG4gICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICB4eHg6IC0tLTogb29vOiBvb286XG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIm8gbW9kaWZpZXJcIiwgLT5cbiAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2Ugb2YgY3Vyc29yIHdvcmQgaW4gaW5uZXItcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgXCJjIG8gaSBwXCIsXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAhOiB4eHg6IHw6XG4gICAgICAgICAgLS0tOiB8OiB4eHg6IHw6XG4gICAgICAgICAgfDogeHh4OiAtLS06IHh4eDogfDpcbiAgICAgICAgICB4eHg6IC0tLTogfDogfDpcblxuICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnPT09JylcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICA9PSE9OiB4eHg6ID09fD06XG4gICAgICAgICAgLS0tOiA9PXw9OiB4eHg6ID09fD06XG4gICAgICAgICAgPT18PTogeHh4OiAtLS06IHh4eDogPT18PTpcbiAgICAgICAgICB4eHg6IC0tLTogPT18PTogPT18PTpcblxuICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgLS0tOiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiAtLS06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogLS0tOiBvb286IG9vbzpcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZSBcIn0gaiAuXCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICA9PT06IHh4eDogPT09OlxuICAgICAgICAgIC0tLTogPT09OiB4eHg6ID09PTpcbiAgICAgICAgICA9PT06IHh4eDogLS0tOiB4eHg6ID09PTpcbiAgICAgICAgICB4eHg6IC0tLTogPT09OiA9PT06XG5cbiAgICAgICAgICA9PSE9OiB4eHg6ID09fD06XG4gICAgICAgICAgLS0tOiA9PXw9OiB4eHg6ID09fD06XG4gICAgICAgICAgPT18PTogeHh4OiAtLS06IHh4eDogPT18PTpcbiAgICAgICAgICB4eHg6IC0tLTogPT18PTogPT18PTpcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJPIG1vZGlmaWVyXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsQ2F8c2UgQ2FzZXNcbiAgICAgICAgICBcIkNhc2VTdHVkeVwiIFNuYWtlQ2FzZVxuICAgICAgICAgIFVQX0NBU0VcblxuICAgICAgICAgIG90aGVyIFBhcmFncmFwaENhc2VcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1YndvcmQtb2NjdXJyZW5jZSBpbiBwYXJhZ3JhcGggYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZCBPIHBcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBjYW1lbHwgQ2FzZXNcbiAgICAgICAgICBcIlN0dWR5XCIgU25ha2VcbiAgICAgICAgICBVUF9DQVNFXG5cbiAgICAgICAgICBvdGhlciBQYXJhZ3JhcGhDYXNlXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcIkcgLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGNhbWVsIENhc2VzXG4gICAgICAgICAgXCJTdHVkeVwiIFNuYWtlXG4gICAgICAgICAgVVBfQ0FTRVxuXG4gICAgICAgICAgb3RoZXJ8IFBhcmFncmFwaFxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcHBseSB2YXJpb3VzIG9wZXJhdG9yIHRvIG9jY3VycmVuY2UgaW4gdmFyaW91cyB0YXJnZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIG9vbzogeHh4OiBvIW9vOlxuICAgICAgICAgID09PTogb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBvb286IHh4eDogPT09OiB4eHg6IG9vbzpcbiAgICAgICAgICB4eHg6ID09PTogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInVwcGVyIGNhc2UgaW5uZXItd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIFUgbyBpIGxcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE8hT086XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIG9vbzogeHh4OiA9PT06IHh4eDogb29vOlxuICAgICAgICAgIHh4eDogPT09OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiMiBqIC5cIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICA9PT06IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgT09POiB4eHg6ID0hPT06IHh4eDogT09POlxuICAgICAgICAgIHh4eDogPT09OiBvb286IG9vbzpcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiaiAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgPT09OiBvb286IHh4eDogb29vOlxuICAgICAgICAgIE9PTzogeHh4OiA9PT06IHh4eDogT09POlxuICAgICAgICAgIHh4eDogPT09OiBPIU9POiBPT086XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiY2xpcCB0byBtdXRhdGlvbiBlbmQgYmVoYXZpb3JcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICBvb3xvOnh4eDpvb286XG4gICAgICAgICAgICB4eHg6b29vOnh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbZCBvIHBdIGRlbGV0ZSBvY2N1cnJlbmNlIGFuZCBjdXJzb3IgaXMgYXQgbXV0YXRpb24gZW5kXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBvIHBcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgfDp4eHg6OlxuICAgICAgICAgICAgeHh4Ojp4eHhcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW2QgbyBqXSBkZWxldGUgb2NjdXJyZW5jZSBhbmQgY3Vyc29yIGlzIGF0IG11dGF0aW9uIGVuZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgbyBqXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICAgIHw6eHh4OjpcbiAgICAgICAgICAgIHh4eDo6eHh4XG4gICAgICAgICAgICBcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIm5vdCBjbGlwIGlmIG9yaWdpbmFsIGN1cnNvciBub3QgaW50ZXJzZWN0cyBhbnkgb2NjdXJlbmNlLW1hcmtlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnb29vJywgJ29vbycsICdvb28nXSwgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSBcImQgcFwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICA6eHh4OjpcbiAgICAgICAgICAgIHh4fHg6Onh4eFxuICAgICAgICAgICAgXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiYXV0byBleHRlbmQgdGFyZ2V0IHJhbmdlIHRvIGluY2x1ZGUgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgdGV4dE9yaWdpbmFsID0gXCJUaGlzIHRleHQgaGF2ZSAzIGluc3RhbmNlIG9mICd0ZXh0JyBpbiB0aGUgd2hvbGUgdGV4dC5cXG5cIlxuICAgICAgdGV4dEZpbmFsID0gdGV4dE9yaWdpbmFsLnJlcGxhY2UoL3RleHQvZywgJycpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IHRleHRPcmlnaW5hbFxuXG4gICAgICBpdCBcIltmcm9tIHN0YXJ0IG9mIDFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDVdOyBlbnN1cmUgJ2QgbyAkJywgdGV4dDogdGV4dEZpbmFsXG4gICAgICBpdCBcIltmcm9tIG1pZGRsZSBvZiAxc3RdXCIsIC0+IHNldCBjdXJzb3I6IFswLCA3XTsgZW5zdXJlICdkIG8gJCcsIHRleHQ6IHRleHRGaW5hbFxuICAgICAgaXQgXCJbZnJvbSBlbmQgb2YgbGFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDUyXTsgZW5zdXJlICdkIG8gMCcsIHRleHQ6IHRleHRGaW5hbFxuICAgICAgaXQgXCJbZnJvbSBtaWRkbGUgb2YgbGFzdF1cIiwgLT4gc2V0IGN1cnNvcjogWzAsIDUxXTsgZW5zdXJlICdkIG8gMCcsIHRleHQ6IHRleHRGaW5hbFxuXG4gICAgZGVzY3JpYmUgXCJzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICB2aW0tbW9kZS1wbHVzIHZpbS1tb2RlLXBsdXNcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwid2hhdCB0aGUgY3Vyc29yLXdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlQ3Vyc29yV29yZCA9IChpbml0aWFsUG9pbnQsIHtzZWxlY3RlZFRleHR9KSAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IGluaXRpYWxQb2ludFxuICAgICAgICAgIGVuc3VyZSBcImcgY21kLWQgaSBwXCIsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IHNlbGVjdGVkVGV4dFxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6IFwibm9ybWFsXCJcblxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBvbiBub3JtYWwgd29yZFwiLCAtPlxuICAgICAgICAgIGl0IFwicGljayB3b3JkIGJ1dCBub3QgcGljayBwYXJ0aWFsbHkgbWF0Y2hlZCBvbmUgW2J5IHNlbGVjdF1cIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZUN1cnNvcldvcmQoWzAsIDBdLCBzZWxlY3RlZFRleHQ6IFsndmltJywgJ3ZpbSddKVxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgM10sIHNlbGVjdGVkVGV4dDogWyctJywgJy0nLCAnLScsICctJ10pXG4gICAgICAgICAgICBlbnN1cmVDdXJzb3JXb3JkKFswLCA0XSwgc2VsZWN0ZWRUZXh0OiBbJ21vZGUnLCAnbW9kZSddKVxuICAgICAgICAgICAgZW5zdXJlQ3Vyc29yV29yZChbMCwgOV0sIHNlbGVjdGVkVGV4dDogWydwbHVzJywgJ3BsdXMnXSlcblxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBzaW5nbGUgd2hpdGUgc3BhY2UgW2J5IGRlbGV0ZV1cIiwgLT5cbiAgICAgICAgICBpdCBcInBpY2sgc2luZ2xlIHdoaXRlIHNwYWNlIG9ubHlcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vIG9vbyBvb29cbiAgICAgICAgICAgICAgIG9vbyBvb28gb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgICAgZW5zdXJlIFwiZCBvIGkgcFwiLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgb29vb29vb29vXG4gICAgICAgICAgICAgIG9vb29vb29vb1xuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBkZXNjcmliZSBcImN1cnNvciBpcyBhdCBzZXF1bmNlIG9mIHNwYWNlIFtieSBkZWxldGVdXCIsIC0+XG4gICAgICAgICAgaXQgXCJzZWxlY3Qgc2VxdW5jZSBvZiB3aGl0ZSBzcGFjZXMgaW5jbHVkaW5nIHBhcnRpYWxseSBtYWNoZWQgb25lXCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgICBvb29fX19vb28gb29vXG4gICAgICAgICAgICAgICBvb28gb29vX19fX29vb19fX19fX19fb29vXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCBvIGkgcFwiLFxuICAgICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAgIG9vb29vbyBvb29cbiAgICAgICAgICAgICAgIG9vbyBvb28gb29vICBvb29cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJzdGF5T25PY2N1cnJlbmNlIHNldHRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICBhYWEsIGJiYiwgY2NjXG4gICAgICAgIGJiYiwgYXxhYSwgYWFhXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdHJ1ZSAoPSBkZWZhdWx0KVwiLCAtPlxuICAgICAgaXQgXCJrZWVwIGN1cnNvciBwb3NpdGlvbiBhZnRlciBvcGVyYXRpb24gZmluaXNoZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIFUgbyBwJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBBQUEsIGJiYiwgY2NjXG4gICAgICAgICAgYmJiLCBBfEFBLCBBQUFcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZhbHNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uT2NjdXJyZW5jZScsIGZhbHNlKVxuXG4gICAgICBpdCBcIm1vdmUgY3Vyc29yIHRvIHN0YXJ0IG9mIHRhcmdldCBhcyBsaWtlIG5vbi1vY3VycmVuY2Ugb3BlcmF0b3JcIiwgLT5cbiAgICAgICAgZW5zdXJlICdnIFUgbyBwJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICB8QUFBLCBiYmIsIGNjY1xuICAgICAgICAgIGJiYiwgQUFBLCBBQUFcblxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiZnJvbSB2aXN1YWwtbW9kZS5pcy1uYXJyb3dlZFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vOiB4eHg6IG9vb1xuICAgICAgICB8fHw6IG9vbzogeHh4OiBvb29cbiAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJbdkNdIHNlbGVjdC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBjdXJzb3Itd29yZCB3aGljaCBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9uIHRoZW4gYXBwbHkgdXBwZXItY2FzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ2IDIgaiBjbWQtZFwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJ11cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cblxuICAgICAgICBlbnN1cmUgXCJVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgIHx8fDogT09POiB4eHg6IE9PT1xuICAgICAgICAgIE9PTzogeHh4OiB8fHw6IHh4eDogb29vXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogNVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcIlt2TF0gc2VsZWN0LW9jY3VycmVuY2VcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0IGN1cnNvci13b3JkIHdoaWNoIGludGVyc2VjdGluZyBzZWxlY3Rpb24gdGhlbiBhcHBseSB1cHBlci1jYXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIjUgbCBWIDIgaiBjbWQtZFwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogWyd4eHgnLCAneHh4JywgJ3h4eCcsICd4eHgnXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICAgIGVuc3VyZSBcIlVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBvb286IFhYWDogb29vXG4gICAgICAgICAgfHx8OiBvb286IFhYWDogb29vXG4gICAgICAgICAgb29vOiBYWFg6IHx8fDogWFhYOiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiA0XG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwiW3ZCXSBzZWxlY3Qtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgY3Vyc29yLXdvcmQgd2hpY2ggaW50ZXJzZWN0aW5nIHNlbGVjdGlvbiB0aGVuIGFwcGx5IHVwcGVyLWNhc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiVyBjdHJsLXYgMiBqICQgaCBjbWQtZCBVXCIsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IE9PT1xuICAgICAgICAgIHx8fDogT09POiB4eHg6IE9PT1xuICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogT09PXG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbnVtQ3Vyc29yczogNFxuXG4gICAgICBpdCBcInBpY2sgY3Vyc29yLXdvcmQgZnJvbSB2QiByYW5nZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgNyBsIDIgaiBvIGNtZC1kIFVcIixcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBPT086IHh4eDogb29vXG4gICAgICAgICAgfHx8OiBPT086IHh4eDogb29vXG4gICAgICAgICAgT09POiB4eHg6IHx8fDogeHh4OiBvb29cbiAgICAgICAgICB4eHg6IHx8fDogb29vOiBvb29cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBudW1DdXJzb3JzOiAzXG5cbiAgZGVzY3JpYmUgXCJpbmNyZW1lbnRhbCBzZWFyY2ggaW50ZWdyYXRpb246IGNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoLCBzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnaW5jcmVtZW50YWxTZWFyY2gnLCB0cnVlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBvb286IHh4eDogb29vOiAwMDAwXG4gICAgICAgIDE6IG9vbzogMjI6IG9vbzpcbiAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICA0NDQ6IHx8fDogb29vOiBvb286XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIG5vcm1hbCBtb2RlXCIsIC0+XG4gICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGJ5IHBhdHRlcm4gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlICcvJ1xuICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ1xcXFxkezMsNH0nKVxuICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICBlbnN1cmUgJ2kgZScsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJzMzMzMnLCAnNDQ0JywgJzAwMDAnXSAjIFdoeSAnMDAwMCcgY29tZXMgbGFzdCBpcyAnMDAwMCcgYmVjb21lIGxhc3Qgc2VsZWN0aW9uLlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICBpdCBcImNoYW5nZSBvY2N1cnJlbmNlIGJ5IHBhdHRlcm4gbWF0Y2hcIiwgLT5cbiAgICAgICAgZW5zdXJlICcvJ1xuICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ15cXFxcdys6JylcbiAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOmNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgZW5zdXJlICdpIGUnLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnaGVsbG8nKVxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBoZWxsbyB4eHg6IG9vbzogMDAwMFxuICAgICAgICAgIGhlbGxvIG9vbzogMjI6IG9vbzpcbiAgICAgICAgICBoZWxsbyB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgIGhlbGxvIHx8fDogb29vOiBvb286XG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgaiAvJ1xuICAgICAgICAgIGlucHV0U2VhcmNoVGV4dCgnbysnKVxuICAgICAgICAgIGRpc3BhdGNoU2VhcmNoQ29tbWFuZCgndmltLW1vZGUtcGx1czpzZWxlY3Qtb2NjdXJyZW5jZS1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgZW5zdXJlICdVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PTzogMDAwMFxuICAgICAgICAgICAgMTogb29vOiAyMjogb29vOlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiAzMzMzOlxuICAgICAgICAgICAgNDQ0OiB8fHw6IG9vbzogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsIGxpbmV3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwiY2hhbmdlIG9jY3VycmVuY2UgaW4gbmFycm93ZWQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdWIGogLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ28rJylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT086IDAwMDBcbiAgICAgICAgICAgIDE6IE9PTzogMjI6IE9PTzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbCBibG9ja3dpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJjaGFuZ2Ugb2NjdXJyZW5jZSBpbiBuYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiAyIGogMSAwIGwgLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ28rJylcbiAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6c2VsZWN0LW9jY3VycmVuY2UtZnJvbS1zZWFyY2gnKVxuICAgICAgICAgIGVuc3VyZSAnVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogeHh4OiBPT086IDAwMDBcbiAgICAgICAgICAgIDE6IE9PTzogMjI6IE9PTzpcbiAgICAgICAgICAgIG9vbzogeHh4OiB8fHw6IHh4eDogMzMzMzpcbiAgICAgICAgICAgIDQ0NDogfHx8OiBvb286IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJwZXJzaXN0ZW50LXNlbGVjdGlvbiBpcyBleGlzdHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ20nOiAndmltLW1vZGUtcGx1czpjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb24nXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICB8fHw6IG9vbzogeHh4OiBvb286XG4gICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb286XG4gICAgICAgICAgeHh4OiB8fHw6IG9vbzogb29vOlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZW5zdXJlICdWIGogbSBHIG0gbScsXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlOiBbXG4gICAgICAgICAgICBbWzAsIDBdLCBbMiwgMF1dXG4gICAgICAgICAgICBbWzMsIDBdLCBbNCwgMF1dXG4gICAgICAgICAgXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gbm8gc2VsZWN0aW9uIGlzIGV4aXN0c1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGluIGFsbCBwZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ3h4eCcpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgfHx8OiBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgb29vOiB4eHg6IHx8fDogeHh4OiBvb286XG4gICAgICAgICAgICBYWFg6IHx8fDogb29vOiBvb286XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMFxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gYm90aCBleGl0cywgb3BlcmF0b3IgYXBwbGllZCB0byBib3RoXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0IGFsbCBvY2N1cnJlbmNlIGluIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnViAyIGogLydcbiAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ3h4eCcpXG4gICAgICAgICAgZGlzcGF0Y2hTZWFyY2hDb21tYW5kKCd2aW0tbW9kZS1wbHVzOnNlbGVjdC1vY2N1cnJlbmNlLWZyb20tc2VhcmNoJylcbiAgICAgICAgICBlbnN1cmUgJ1UnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgfHx8OiBvb286IFhYWDogb29vOlxuICAgICAgICAgICAgb29vOiBYWFg6IHx8fDogWFhYOiBvb286XG4gICAgICAgICAgICBYWFg6IHx8fDogb29vOiBvb286XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMFxuXG4gICAgZGVzY3JpYmUgXCJkZW1vbnN0cmF0ZSBwZXJzaXN0ZW50LXNlbGVjdGlvbidzIHByYWN0aWNhbCBzY2VuYXJpb1wiLCAtPlxuICAgICAgW29sZEdyYW1tYXJdID0gW11cbiAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihvbGRHcmFtbWFyKVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb25cIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdtJzogJ3ZpbS1tb2RlLXBsdXM6dG9nZ2xlLXBlcnNpc3RlbnQtc2VsZWN0aW9uJ1xuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgb2xkR3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5jb2ZmZWUnKSlcblxuICAgICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKEBtYWluLCBAZWRpdG9yLCBAc3RhdHVzQmFyTWFuYWdlcikgLT5cbiAgICAgICAgICAgICAgQGVkaXRvckVsZW1lbnQgPSBAZWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICAgICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgICAgICAgICAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICAgICAgICAgIEBtb2RlTWFuYWdlciA9IG5ldyBNb2RlTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAbWFyayA9IG5ldyBNYXJrTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAcmVnaXN0ZXIgPSBuZXcgUmVnaXN0ZXJNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBwZXJzaXN0ZW50U2VsZWN0aW9ucyA9IFtdXG5cbiAgICAgICAgICAgICAgQGhpZ2hsaWdodFNlYXJjaFN1YnNjcmlwdGlvbiA9IEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wID0+XG4gICAgICAgICAgICAgICAgQHJlZnJlc2hIaWdobGlnaHRTZWFyY2goKVxuXG4gICAgICAgICAgICAgIEBvcGVyYXRpb25TdGFjayA9IG5ldyBPcGVyYXRpb25TdGFjayh0aGlzKVxuICAgICAgICAgICAgICBAY3Vyc29yU3R5bGVNYW5hZ2VyID0gbmV3IEN1cnNvclN0eWxlTWFuYWdlcih0aGlzKVxuXG4gICAgICAgICAgICBhbm90aGVyRnVuYzogLT5cbiAgICAgICAgICAgICAgQGhlbGxvID0gW11cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCAnY2hhbmdlIGFsbCBhc3NpZ25tZW50KFwiPVwiKSBvZiBjdXJyZW50LWZ1bmN0aW9uIHRvIFwiPz1cIicsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2ogZiA9JywgY3Vyc29yOiBbMSwgMTddXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIF9rZXlzdHJva2UgPSBbXG4gICAgICAgICAgICAnZyBjbWQtZCcgIyBzZWxlY3Qtb2NjdXJyZW5jZVxuICAgICAgICAgICAgJ2kgZicgICAgICMgaW5uZXItZnVuY3Rpb24tdGV4dC1vYmplY3RcbiAgICAgICAgICAgICdtJyAgICAgICAjIHRvZ2dsZS1wZXJzaXN0ZW50LXNlbGVjdGlvblxuICAgICAgICAgIF0uam9pbihcIiBcIilcbiAgICAgICAgICBlbnN1cmUoX2tleXN0cm9rZSlcblxuICAgICAgICAgIHRleHRzSW5CdWZmZXJSYW5nZSA9IHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKCkubWFwIChyYW5nZSkgLT5cbiAgICAgICAgICAgIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICB0ZXh0c0luQnVmZmVyUmFuZ2VJc0FsbEVxdWFsQ2hhciA9IHRleHRzSW5CdWZmZXJSYW5nZS5ldmVyeSgodGV4dCkgLT4gdGV4dCBpcyAnPScpXG4gICAgICAgICAgZXhwZWN0KHRleHRzSW5CdWZmZXJSYW5nZUlzQWxsRXF1YWxDaGFyKS50b0JlKHRydWUpXG4gICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VycygpKS50b0hhdmVMZW5ndGgoMTEpXG5cbiAgICAgICAgICBlbnN1cmUgJzIgbCcgIyB0byBtb3ZlIHRvIG91dC1zaWRlIG9mIHJhbmdlLW1ya2VyXG4gICAgICAgICAgZW5zdXJlICcvID0+IGVudGVyJywgY3Vyc29yOiBbOSwgNjldXG4gICAgICAgICAgZW5zdXJlIFwibVwiICMgY2xlYXIgcGVyc2lzdGVudFNlbGVjdGlvbiBhdCBjdXJzb3Igd2hpY2ggaXMgPSBzaWduIHBhcnQgb2YgZmF0IGFycm93LlxuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlcnMoKSkudG9IYXZlTGVuZ3RoKDEwKVxuXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtcGVyc2lzdGVudC1zZWxlY3Rpb24nKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBlbnN1cmUgXCJjdHJsLWNtZC1nIElcIiAjIFwic2VsZWN0LXBlcnNpc3RlbnQtc2VsZWN0aW9uXCIgdGhlbiBcIkluc2VydCBhdCBzdGFydCBvZiBzZWxlY3Rpb25cIlxuXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJz8nKVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChAbWFpbiwgQGVkaXRvciwgQHN0YXR1c0Jhck1hbmFnZXIpIC0+XG4gICAgICAgICAgICAgIEBlZGl0b3JFbGVtZW50ID89IEBlZGl0b3IuZWxlbWVudFxuICAgICAgICAgICAgICBAZW1pdHRlciA/PSBuZXcgRW1pdHRlclxuICAgICAgICAgICAgICBAc3Vic2NyaXB0aW9ucyA/PSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgICAgICAgICAgICBAbW9kZU1hbmFnZXIgPz0gbmV3IE1vZGVNYW5hZ2VyKHRoaXMpXG4gICAgICAgICAgICAgIEBtYXJrID89IG5ldyBNYXJrTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAcmVnaXN0ZXIgPz0gbmV3IFJlZ2lzdGVyTWFuYWdlcih0aGlzKVxuICAgICAgICAgICAgICBAcGVyc2lzdGVudFNlbGVjdGlvbnMgPz0gW11cblxuICAgICAgICAgICAgICBAaGlnaGxpZ2h0U2VhcmNoU3Vic2NyaXB0aW9uID89IEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wID0+XG4gICAgICAgICAgICAgICAgQHJlZnJlc2hIaWdobGlnaHRTZWFyY2goKVxuXG4gICAgICAgICAgICAgIEBvcGVyYXRpb25TdGFjayA/PSBuZXcgT3BlcmF0aW9uU3RhY2sodGhpcylcbiAgICAgICAgICAgICAgQGN1cnNvclN0eWxlTWFuYWdlciA/PSBuZXcgQ3Vyc29yU3R5bGVNYW5hZ2VyKHRoaXMpXG5cbiAgICAgICAgICAgIGFub3RoZXJGdW5jOiAtPlxuICAgICAgICAgICAgICBAaGVsbG8gPSBbXVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJwcmVzZXQgb2NjdXJyZW5jZSBtYXJrZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIFRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0b2dnbGUtcHJlc2V0LW9jY3VycmVuY2UgY29tbWFuZHNcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJhZGQgcHJlc2V0IG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBpdCAnc2V0IGN1cnNvci13YXJkIGFzIHByZXNldCBvY2N1cnJlbmNlIG1hcmtlciBhbmQgbm90IG1vdmUgY3Vyc29yJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cblxuICAgICAgICBkZXNjcmliZSBcInJlbW92ZSBwcmVzZXQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGl0ICdyZW1vdmVzIG9jY3VycmVuY2Ugb25lIGJ5IG9uZSBzZXBhcmF0ZWx5JywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6ICdUaGlzJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiBbJ1RoaXMnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnYiBnIG8nLCBvY2N1cnJlbmNlVGV4dDogWyd0ZXh0JywgJ3RleHQnXSwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBpdCAncmVtb3ZlcyBhbGwgb2NjdXJyZW5jZSBpbiB0aGlzIGVkaXRvciBieSBlc2NhcGUnLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogJ1RoaXMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVGhpcycsICd0ZXh0JywgJ3RleHQnLCAndGV4dCddLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICAgIGl0ICdjYW4gcmVjYWxsIHByZXZpb3VzbHkgc2V0IG9jY3VyZW5jZSBwYXR0ZXJuIGJ5IGBnIC5gJywgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndyB2IGwgZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsndGUnLCAndGUnLCAndGUnXSwgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBleHBlY3QodmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0T2NjdXJyZW5jZVBhdHRlcm4nKSkudG9FcXVhbCgvdGUvZylcblxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgMTBdICMgdG8gbW92ZSBjdXJzb3IgdG8gdGV4dCBgaGF2ZWBcbiAgICAgICAgICAgIGVuc3VyZSAnZyAuJywgb2NjdXJyZW5jZVRleHQ6IFsndGUnLCAndGUnLCAndGUnXSwgY3Vyc29yOiBbMCwgMTBdXG5cbiAgICAgICAgICAgICMgQnV0IG9wZXJhdG9yIG1vZGlmaWVyIG5vdCB1cGRhdGUgbGFzdE9jY3VycmVuY2VQYXR0ZXJuXG4gICAgICAgICAgICBlbnN1cmUgJ2cgVSBvICQnLCB0ZXh0QzogXCJUaGlzIHRleHQgfEhBVkUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcIlxuICAgICAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldCgnbGFzdE9jY3VycmVuY2VQYXR0ZXJuJykpLnRvRXF1YWwoL3RlL2cpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJyZXN0b3JlIGxhc3Qgb2NjdXJyZW5jZSBtYXJrZXIgYnkgYWRkLXByZXNldC1vY2N1cnJlbmNlLWZyb20tbGFzdC1vY2N1cnJlbmNlLXBhdHRlcm5cIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBjYW1lbFxuICAgICAgICAgICAgICBjYW1lbENhc2VcbiAgICAgICAgICAgICAgY2FtZWxzXG4gICAgICAgICAgICAgIGNhbWVsXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGl0IFwiY2FuIHJlc3RvcmUgb2NjdXJyZW5jZS1tYXJrZXIgYWRkZWQgYnkgYGcgb2AgaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlIFwiZyBvXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJ11cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBlbnN1cmUgXCJnIC5cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnXVxuXG4gICAgICAgICAgaXQgXCJjYW4gcmVzdG9yZSBvY2N1cnJlbmNlLW1hcmtlciBhZGRlZCBieSBgZyBvYCBpbiB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgXCJ2IGkgd1wiLCBzZWxlY3RlZFRleHQ6IFwiY2FtZWxcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZyBvXCIsIG9jY3VycmVuY2VUZXh0OiBbJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJywgJ2NhbWVsJ11cbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBlbnN1cmUgXCJnIC5cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuXG4gICAgICAgICAgaXQgXCJjYW4gcmVzdG9yZSBvY2N1cnJlbmNlLW1hcmtlciBhZGRlZCBieSBgZyBPYCBpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgXCJnIE9cIiwgb2NjdXJyZW5jZVRleHQ6IFsnY2FtZWwnLCAnY2FtZWwnLCAnY2FtZWwnXVxuICAgICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGVuc3VyZSBcImcgLlwiLCBvY2N1cnJlbmNlVGV4dDogWydjYW1lbCcsICdjYW1lbCcsICdjYW1lbCddXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjc3MgY2xhc3MgaGFzLW9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBkZXNjcmliZSBcIm1hbnVhbGx5IHRvZ2dsZSBieSB0b2dnbGUtcHJlc2V0LW9jY3VycmVuY2UgY29tbWFuZFwiLCAtPlxuICAgICAgICAgICAgaXQgJ2lzIGF1dG8tc2V0L3Vuc2V0IHdoZXRlciBhdCBsZWFzdCBvbmUgcHJlc2V0LW9jY3VycmVuY2Ugd2FzIGV4aXN0cyBvciBub3QnLCAtPlxuICAgICAgICAgICAgICBleHBlY3QoY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpKS50b0JlKGZhbHNlKVxuICAgICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDAsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgICAgICBkZXNjcmliZSBcImNoYW5nZSAnSU5TSURFJyBvZiBtYXJrZXJcIiwgLT5cbiAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZCA9IG51bGxcbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgICAgbWFya2VyTGF5ZXJVcGRhdGVkID0gZmFsc2VcblxuICAgICAgICAgICAgaXQgJ2Rlc3Ryb3kgbWFya2VyIGFuZCByZWZsZWN0IHRvIFwiaGFzLW9jY3VycmVuY2VcIiBDU1MnLCAtPlxuICAgICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcbiAgICAgICAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VUZXh0OiAnVGhpcycsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZSh0cnVlKVxuXG4gICAgICAgICAgICAgICAgZW5zdXJlICdsIGknLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgICAgICAgIHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLm1hcmtlckxheWVyLm9uRGlkVXBkYXRlIC0+XG4gICAgICAgICAgICAgICAgICBtYXJrZXJMYXllclVwZGF0ZWQgPSB0cnVlXG5cbiAgICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnLS0nKVxuICAgICAgICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgICAgICAgICAgdGV4dEM6IFwiVC18LWhpcyB0ZXh0IGhhdmUgMyBpbnN0YW5jZSBvZiAndGV4dCcgaW4gdGhlIHdob2xlIHRleHRcIlxuICAgICAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgICAgIG1hcmtlckxheWVyVXBkYXRlZFxuXG4gICAgICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgICAgICBlbnN1cmUgbnVsbCwgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICAgICAgZXhwZWN0KGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKSkudG9CZShmYWxzZSlcblxuICAgICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcImFkZCBwcmVzZXQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGl0ICdzZXQgc2VsZWN0ZWQtdGV4dCBhcyBwcmVzZXQgb2NjdXJyZW5jZSBtYXJrZXIgYW5kIG5vdCBtb3ZlIGN1cnNvcicsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3cgdiBsJywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBzZWxlY3RlZFRleHQ6ICd0ZSdcbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgbW9kZTogJ25vcm1hbCcsIG9jY3VycmVuY2VUZXh0OiBbJ3RlJywgJ3RlJywgJ3RlJ11cbiAgICAgICAgZGVzY3JpYmUgXCJpcy1uYXJyb3dlZCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBbdGV4dE9yaWdpbmFsXSA9IFtdXG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgdGV4dE9yaWdpbmFsID0gXCJcIlwiXG4gICAgICAgICAgICAgIFRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XG4gICAgICAgICAgICAgIFRoaXMgdGV4dCBoYXZlIDMgaW5zdGFuY2Ugb2YgJ3RleHQnIGluIHRoZSB3aG9sZSB0ZXh0XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICAgIHRleHQ6IHRleHRPcmlnaW5hbFxuICAgICAgICAgIGl0IFwicGljayBvY3VycmVuY2Utd29yZCBmcm9tIGN1cnNvciBwb3NpdGlvbiBhbmQgY29udGludWUgdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndyBWIGonLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddLCBzZWxlY3RlZFRleHQ6IHRleHRPcmlnaW5hbFxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLFxuICAgICAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbJ3RleHQnLCAndGV4dCcsICd0ZXh0JywgJ3RleHQnLCAndGV4dCcsICd0ZXh0J11cbiAgICAgICAgICAgIGVuc3VyZVdhaXQgJ3IgIScsXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBUaGlzICEhISEgaGF2ZSAzIGluc3RhbmNlIG9mICchISEhJyBpbiB0aGUgd2hvbGUgISEhIVxuICAgICAgICAgICAgICBUaGlzICEhISEgaGF2ZSAzIGluc3RhbmNlIG9mICchISEhJyBpbiB0aGUgd2hvbGUgISEhIVxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJpbiBpbmNyZW1lbnRhbC1zZWFyY2hcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnaW5jcmVtZW50YWxTZWFyY2gnLCB0cnVlKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiYWRkLW9jY3VycmVuY2UtcGF0dGVybi1mcm9tLXNlYXJjaFwiLCAtPlxuICAgICAgICAgIGl0ICdtYXJrIGFzIG9jY3VycmVuY2Ugd2hpY2ggbWF0Y2hlcyByZWdleCBlbnRlcmVkIGluIHNlYXJjaC11aScsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJy8nXG4gICAgICAgICAgICBpbnB1dFNlYXJjaFRleHQoJ1xcXFxidFxcXFx3KycpXG4gICAgICAgICAgICBkaXNwYXRjaFNlYXJjaENvbW1hbmQoJ3ZpbS1tb2RlLXBsdXM6YWRkLW9jY3VycmVuY2UtcGF0dGVybi1mcm9tLXNlYXJjaCcpXG4gICAgICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsndGV4dCcsICd0ZXh0JywgJ3RoZScsICd0ZXh0J11cblxuICAgIGRlc2NyaWJlIFwibXV0YXRlIHByZXNldCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIlwiXCJcbiAgICAgICAgb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgISEhOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICBpdCAnW2RlbGV0ZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBEJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgOiB4eHg6ICB4eHg6IDpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW3VwY2FzZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBnIFUgaicsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICAhISE6IG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgJ1t1cGNhc2UgZXhjbHVkZV0gd29uXFwndCBtdXRhdGUgcmVtb3ZlZCBtYXJrZXInLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiA2XG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ2cgVSBqJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgICEhITogT09POiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW2RlbGV0ZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDEwXVxuICAgICAgICAgIGVuc3VyZSAnZyBvIGcgVSAkJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4eHg6IE9PTyB4eHg6IE9PTzpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCAnW2NoYW5nZV0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgZW5zdXJlICdsIGcgbyBDJyxcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDogeHh4OiAgeHh4OiA6XG4gICAgICAgICAgICAhISE6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnWVlZJylcbiAgICAgICAgICBlbnN1cmUgJ2wgZyBvIEMnLFxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgWVlZOiB4eHg6IFlZWSB4eHg6IFlZWTpcbiAgICAgICAgICAgICEhITogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbnVtQ3Vyc29yczogM1xuICAgICAgICBkZXNjcmliZSBcInByZWRlZmluZWQga2V5bWFwIG9uIHdoZW4gaGFzLW9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVnxpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaXQgJ1tpbnNlcnQtYXQtc3RhcnRdIGFwcGx5IG9wZXJhdGlvbiB0byBwcmVzZXQtbWFya2VyIGludGVyc2VjdGluZyBzZWxlY3RlZCB0YXJnZXQnLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWydWaW0nLCAnVmltJywgJ1ZpbScsICdWaW0nXVxuICAgICAgICAgICAgY2xhc3NMaXN0LmNvbnRhaW5zKCdoYXMtb2NjdXJyZW5jZScpXG4gICAgICAgICAgICBlbnN1cmUgJ3YgayBJJywgbW9kZTogJ2luc2VydCcsIG51bUN1cnNvcnM6IDJcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwicHVyZS1cIilcbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBwdXJlIS1WaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgcHVyZXwtVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFZpbSBpcyBlZGl0b3IgSSB1c2VkIGJlZm9yZVxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpdCAnW2luc2VydC1hZnRlci1zdGFydF0gYXBwbHkgb3BlcmF0aW9uIHRvIHByZXNldC1tYXJrZXIgaW50ZXJzZWN0aW5nIHNlbGVjdGVkIHRhcmdldCcsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZVRleHQ6IFsnVmltJywgJ1ZpbScsICdWaW0nLCAnVmltJ11cbiAgICAgICAgICAgIGNsYXNzTGlzdC5jb250YWlucygnaGFzLW9jY3VycmVuY2UnKVxuICAgICAgICAgICAgZW5zdXJlICd2IGogQScsIG1vZGU6ICdpbnNlcnQnLCBudW1DdXJzb3JzOiAyXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiBhbmQgRW1hY3NcIilcbiAgICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBWaW0gaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGFuZCBFbWFjfHMgaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGFuZCBFbWFjIXMgaXMgZWRpdG9yIEkgdXNlZCBiZWZvcmVcbiAgICAgICAgICAgICAgVmltIGlzIGVkaXRvciBJIHVzZWQgYmVmb3JlXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0ICdbdXBjYXNlXSBhcHBseSB0byBwcmVzZXQtbWFya2VyIGFzIGxvbmcgYXMgaXQgaW50ZXJzZWN0cyBzZWxlY3Rpb24nLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiB4fHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgbycsIG9jY3VycmVuY2VDb3VudDogNVxuICAgICAgICAgIGVuc3VyZSAndiBqIFUnLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IFhYWDogb29vIFhYWDogb29vOlxuICAgICAgICAgICAgWFhYOiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLWxpbmV3aXNlLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ1YgVScsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIG9vbzogWFhYOiBvb28gWFhYOiBvb286XG4gICAgICAgICAgICB4eHg6IG9vbzogeHh4OiBvb28geHh4OiBvb286XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ2aXN1YWwtYmxvY2t3aXNlLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgJ1t1cGNhc2VdIGFwcGx5IHRvIHByZXNldC1tYXJrZXIgYXMgbG9uZyBhcyBpdCBpbnRlcnNlY3RzIHNlbGVjdGlvbicsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgeHh4OiBvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlQ291bnQ6IDVcbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiBqIDIgdyBVJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgb29vOiBYWFg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIHh4eDogb29vOiBYWFg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9OZXh0T2NjdXJyZW5jZSwgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8b29vOiB4eHg6IG9vb1xuICAgICAgICAgIF9fXzogb29vOiB4eHg6XG4gICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgJ2cgbycsXG4gICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ29vbyddXG5cbiAgICAgIGRlc2NyaWJlIFwidGFiLCBzaGlmdC10YWJcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJjdXJzb3IgaXMgYXQgc3RhcnQgb2Ygb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgIGl0IFwic2VhcmNoIG5leHQvcHJldmlvdXMgb2NjdXJyZW5jZSBtYXJrZXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndGFiIHRhYicsIGN1cnNvcjogWzEsIDVdXG4gICAgICAgICAgICBlbnN1cmUgJzIgdGFiJywgY3Vyc29yOiBbMiwgMTBdXG4gICAgICAgICAgICBlbnN1cmUgJzIgc2hpZnQtdGFiJywgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICAgIGVuc3VyZSAnMiBzaGlmdC10YWInLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgaW5zaWRlIG9mIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgb2NjdXJyZW5jZUNvdW50OiAwXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwib29vbyBvb3xvbyBvb29vXCJcbiAgICAgICAgICAgIGVuc3VyZSAnZyBvJywgb2NjdXJyZW5jZUNvdW50OiAzXG5cbiAgICAgICAgICBkZXNjcmliZSBcInRhYlwiLCAtPlxuICAgICAgICAgICAgaXQgXCJtb3ZlIHRvIG5leHQgb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICAgICAgICBlbnN1cmUgJ3RhYicsIHRleHRDOiAnb29vbyBvb29vIHxvb29vJ1xuXG4gICAgICAgICAgZGVzY3JpYmUgXCJzaGlmdC10YWJcIiwgLT5cbiAgICAgICAgICAgIGl0IFwibW92ZSB0byBwcmV2aW91cyBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICAgIGVuc3VyZSAnc2hpZnQtdGFiJywgdGV4dEM6ICd8b29vbyBvb29vIG9vb28nXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgb3BlcmF0b3IncyB0YXJnZXRcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJ0YWJcIiwgLT5cbiAgICAgICAgICBpdCBcIm9wZXJhdGUgb24gbmV4dCBvY2N1cnJlbmNlIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJnIFUgdGFiXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogb29vOiB4eHg6XG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDNcbiAgICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMlxuICAgICAgICAgICAgZW5zdXJlIFwiMiAuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgICAgICBpdCBcIltvLW1vZGlmaWVyXSBvcGVyYXRlIG9uIG5leHQgb2NjdXJyZW5jZSBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgICAgICBlbnN1cmUgXCJnIFUgbyB0YWJcIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgICAgX19fOiBvb286IHh4eDpcbiAgICAgICAgICAgICAgb29vOiB4eHg6IG9vbzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMFxuXG4gICAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb286XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICAgICAgZW5zdXJlIFwiMiAuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcblxuICAgICAgICBkZXNjcmliZSBcInNoaWZ0LXRhYlwiLCAtPlxuICAgICAgICAgIGl0IFwib3BlcmF0ZSBvbiBuZXh0IHByZXZpb3VzIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMTBdXG4gICAgICAgICAgICBlbnN1cmUgXCJnIFUgc2hpZnQtdGFiXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBvb286IHh4eDogb29vXG4gICAgICAgICAgICAgIF9fXzogb29vOiB4eHg6XG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDNcbiAgICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIG9vbzogeHh4OiBvb29cbiAgICAgICAgICAgICAgX19fOiBPT086IHh4eDpcbiAgICAgICAgICAgICAgT09POiB4eHg6IE9PTzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIG9jY3VycmVuY2VDb3VudDogMlxuICAgICAgICAgICAgZW5zdXJlIFwiMiAuXCIsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBPT086IHh4eDogT09PXG4gICAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICAgIE9PTzogeHh4OiBPT086XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBvY2N1cnJlbmNlQ291bnQ6IDBcbiAgICAgICAgICAgIGV4cGVjdChjbGFzc0xpc3QuY29udGFpbnMoJ2hhcy1vY2N1cnJlbmNlJykpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGRlc2NyaWJlIFwiZXhjdWRlIHBhcnRpY3VsYXIgb2NjdXJlbmNlIGJ5IGAuYCByZXBlYXRcIiwgLT5cbiAgICAgICAgaXQgXCJjbGVhciBwcmVzZXQtb2NjdXJyZW5jZSBhbmQgbW92ZSB0byBuZXh0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIHRhYiAuIGcgVSBpIHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgT09POiB4eHg6IE9PT1xuICAgICAgICAgICAgX19fOiB8b29vOiB4eHg6XG4gICAgICAgICAgICBPT086IHh4eDogT09POlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJjbGVhciBwcmVzZXQtb2NjdXJyZW5jZSBhbmQgbW92ZSB0byBwcmV2aW91c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMiBzaGlmdC10YWIgLiBnIFUgaSBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIE9PTzogeHh4OiBPT09cbiAgICAgICAgICAgIF9fXzogT09POiB4eHg6XG4gICAgICAgICAgICB8b29vOiB4eHg6IE9PTzpcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gbXVsdGlwbGUgcHJlc2V0LW9jY3VycmVuY2UgY3JlYXRlZCBhdCBkaWZmZXJlbnQgdGltaW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgZW5zdXJlICdnIG8nLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFsnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ29vbycsICd4eHgnLCAneHh4JywgJ3h4eCddXG5cbiAgICAgICAgaXQgXCJ2aXNpdCBvY2N1cnJlbmNlcyBvcmRlcmVkIGJ5IGJ1ZmZlciBwb3NpdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInRhYlwiLCAgICAgICB0ZXh0QzogXCJvb286IHh4eDogfG9vb1xcbl9fXzogb29vOiB4eHg6XFxub29vOiB4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInRhYlwiLCAgICAgICB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiB8b29vOiB4eHg6XFxub29vOiB4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInRhYlwiLCAgICAgICB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiBvb286IHx4eHg6XFxub29vOiB4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInRhYlwiLCAgICAgICB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiBvb286IHh4eDpcXG58b29vOiB4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInRhYlwiLCAgICAgICB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiBvb286IHh4eDpcXG5vb286IHx4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInRhYlwiLCAgICAgICB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiBvb286IHh4eDpcXG5vb286IHh4eDogfG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInNoaWZ0LXRhYlwiLCB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiBvb286IHh4eDpcXG5vb286IHx4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInNoaWZ0LXRhYlwiLCB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiBvb286IHh4eDpcXG58b29vOiB4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInNoaWZ0LXRhYlwiLCB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiBvb286IHx4eHg6XFxub29vOiB4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInNoaWZ0LXRhYlwiLCB0ZXh0QzogXCJvb286IHh4eDogb29vXFxuX19fOiB8b29vOiB4eHg6XFxub29vOiB4eHg6IG9vbzpcIlxuICAgICAgICAgIGVuc3VyZSBcInNoaWZ0LXRhYlwiLCB0ZXh0QzogXCJvb286IHh4eDogfG9vb1xcbl9fXzogb29vOiB4eHg6XFxub29vOiB4eHg6IG9vbzpcIlxuXG4gICAgZGVzY3JpYmUgXCJleHBsaWN0IG9wZXJhdG9yLW1vZGlmaWVyIG8gYW5kIHByZXNldC1tYXJrZXJcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxvb286IHh4eDogb29vIHh4eDogb29vOlxuICAgICAgICAgIF9fXzogb29vOiB4eHg6IG9vbyB4eHg6IG9vbzpcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCInbycgbW9kaWZpZXIgd2hlbiBwcmVzZXQgb2NjdXJyZW5jZSBhbHJlYWR5IGV4aXN0c1wiLCAtPlxuICAgICAgICBpdCBcIidvJyBhbHdheXMgcGljayBjdXJzb3Itd29yZCBhbmQgb3ZlcndyaXRlIGV4aXN0aW5nIHByZXNldCBtYXJrZXIpXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZyBvXCIsXG4gICAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgZW5zdXJlIFwiMiB3IGQgb1wiLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFtcInh4eFwiLCBcInh4eFwiLCBcInh4eFwiLCBcInh4eFwiXVxuICAgICAgICAgICAgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgICAgICAgZW5zdXJlIFwialwiLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBvb286IDogb29vIDogb29vOlxuICAgICAgICAgICAgX19fOiBvb286IDogb29vIDogb29vOlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBkZXNjcmliZSBcIm9jY3VycmVuY2UgYm91bmQgb3BlcmF0b3IgZG9uJ3Qgb3ZlcndpdGUgcHJlLWV4aXN0aW5nIHByZXNldCBtYXJrZXJcIiwgLT5cbiAgICAgICAgaXQgXCInbycgYWx3YXlzIHBpY2sgY3Vyc29yLXdvcmQgYW5kIGNsZWFyIGV4aXN0aW5nIHByZXNldCBtYXJrZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJnIG9cIixcbiAgICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBlbnN1cmUgXCIyIHcgZyBjbWQtZFwiLFxuICAgICAgICAgICAgb2NjdXJyZW5jZVRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgICAgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgICAgICAgZW5zdXJlIFwialwiLFxuICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuXG4gICAgZGVzY3JpYmUgXCJ0b2dnbGUtcHJlc2V0LXN1YndvcmQtb2NjdXJyZW5jZSBjb21tYW5kc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBjYW1lbENhfHNlIENhc2VzXG4gICAgICAgICAgXCJDYXNlU3R1ZHlcIiBTbmFrZUNhc2VcbiAgICAgICAgICBVUF9DQVNFXG5cbiAgICAgICAgICBvdGhlciBQYXJhZ3JhcGhDYXNlXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiYWRkIHByZXNldCBzdWJ3b3JkLW9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgaXQgXCJtYXJrIHN1YndvcmQgdW5kZXIgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIE8nLCBvY2N1cnJlbmNlVGV4dDogWydDYXNlJywgJ0Nhc2UnLCAnQ2FzZScsICdDYXNlJ11cblxuICBkZXNjcmliZSBcImxpbmV3aXNlLWJvdW5kLW9wZXJhdGlvbiBpbiBvY2N1cnJlbmNlIG9wZXJhdGlvblwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShcImxhbmd1YWdlLWphdmFzY3JpcHRcIilcblxuICAgICAgcnVucyAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBncmFtbWFyOiAnc291cmNlLmpzJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBmdW5jdGlvbiBoZWxsbyhuYW1lKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlYnVnLTFcIilcbiAgICAgICAgICAgIHxjb25zb2xlLmxvZyhcImRlYnVnLTJcIilcblxuICAgICAgICAgICAgY29uc3QgZ3JlZXRpbmcgPSBcImhlbGxvXCJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVidWctM1wiKVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRlYnVnLTQsIGluY2x1ZCBgY29uc29sZWAgd29yZFwiKVxuICAgICAgICAgICAgcmV0dXJybiBuYW1lICsgXCIgXCIgKyBncmVldGluZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBwcmVzZXQtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgaXQgXCJ3b3JrcyBjaGFyYWN0ZXJ3aXNlIGZvciBgZGVsZXRlYCBvcGVyYXRvclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIG8gdiBpIGZcIiwgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICBlbnN1cmUgXCJkXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKG5hbWUpIHtcbiAgICAgICAgICAgIHwubG9nKFwiZGVidWctMVwiKVxuICAgICAgICAgICAgLmxvZyhcImRlYnVnLTJcIilcblxuICAgICAgICAgICAgY29uc3QgZ3JlZXRpbmcgPSBcImhlbGxvXCJcbiAgICAgICAgICAgIC5sb2coXCJkZWJ1Zy0zXCIpXG5cbiAgICAgICAgICAgIC5sb2coXCJkZWJ1Zy00LCBpbmNsdWQgYGAgd29yZFwiKVxuICAgICAgICAgICAgcmV0dXJybiBuYW1lICsgXCIgXCIgKyBncmVldGluZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwid29ya3MgbGluZXdpc2UgZm9yIGBkZWxldGUtbGluZWAgb3BlcmF0b3JcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyBvIHYgaSBmIERcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICAgICAgICAgIHxcbiAgICAgICAgICAgIGNvbnN0IGdyZWV0aW5nID0gXCJoZWxsb1wiXG5cbiAgICAgICAgICAgIHJldHVycm4gbmFtZSArIFwiIFwiICsgZ3JlZXRpbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHNwZWNpZmllZCBib3RoIG8gYW5kIFYgb3BlcmF0b3ItbW9kaWZpZXJcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlIGBjb25zb2xlYCBpbmNsdWRpbmcgbGluZSBieSBgVmAgbW9kaWZpZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZCBvIFYgZlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBmdW5jdGlvbiBoZWxsbyhuYW1lKSB7XG4gICAgICAgICAgfFxuICAgICAgICAgICAgY29uc3QgZ3JlZXRpbmcgPSBcImhlbGxvXCJcblxuICAgICAgICAgICAgcmV0dXJybiBuYW1lICsgXCIgXCIgKyBncmVldGluZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwidXBwZXItY2FzZSBgY29uc29sZWAgaW5jbHVkaW5nIGxpbmUgYnkgYFZgIG1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgVSBvIFYgZlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBmdW5jdGlvbiBoZWxsbyhuYW1lKSB7XG4gICAgICAgICAgICBDT05TT0xFLkxPRyhcIkRFQlVHLTFcIilcbiAgICAgICAgICAgIHxDT05TT0xFLkxPRyhcIkRFQlVHLTJcIilcblxuICAgICAgICAgICAgY29uc3QgZ3JlZXRpbmcgPSBcImhlbGxvXCJcbiAgICAgICAgICAgIENPTlNPTEUuTE9HKFwiREVCVUctM1wiKVxuXG4gICAgICAgICAgICBDT05TT0xFLkxPRyhcIkRFQlVHLTQsIElOQ0xVRCBgQ09OU09MRWAgV09SRFwiKVxuICAgICAgICAgICAgcmV0dXJybiBuYW1lICsgXCIgXCIgKyBncmVldGluZ1xuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcIndpdGggbyBvcGVyYXRvci1tb2RpZmllclwiLCAtPlxuICAgICAgaXQgXCJ0b2dnbGUtbGluZS1jb21tZW50cyBvZiBgb2NjdXJyZW5jZWAgaW5jbGRpbmcgKipsaW5lcyoqXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgLyBvIGZcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gaGVsbG8obmFtZSkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJkZWJ1Zy0xXCIpXG4gICAgICAgICAgICAvLyB8Y29uc29sZS5sb2coXCJkZWJ1Zy0yXCIpXG5cbiAgICAgICAgICAgIGNvbnN0IGdyZWV0aW5nID0gXCJoZWxsb1wiXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImRlYnVnLTNcIilcblxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJkZWJ1Zy00LCBpbmNsdWQgYGNvbnNvbGVgIHdvcmRcIilcbiAgICAgICAgICAgIHJldHVycm4gbmFtZSArIFwiIFwiICsgZ3JlZXRpbmdcbiAgICAgICAgICB9XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKG5hbWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVidWctMVwiKVxuICAgICAgICAgICAgfGNvbnNvbGUubG9nKFwiZGVidWctMlwiKVxuXG4gICAgICAgICAgICBjb25zdCBncmVldGluZyA9IFwiaGVsbG9cIlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkZWJ1Zy0zXCIpXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGVidWctNCwgaW5jbHVkIGBjb25zb2xlYCB3b3JkXCIpXG4gICAgICAgICAgICByZXR1cnJuIG5hbWUgKyBcIiBcIiArIGdyZWV0aW5nXG4gICAgICAgICAgfVxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiY29uZmlybVRocmVzaG9sZE9uT2NjdXJyZW5jZU9wZXJhdGlvbiBjb25maWdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dEM6IFwifG9vIG9vIG9vIG9vIG9vXFxuXCJcbiAgICAgIHNweU9uKGF0b20sICdjb25maXJtJylcblxuICAgIGRlc2NyaWJlIFwid2hlbiB1bmRlciB0aHJlc2hvbGRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiY29uZmlybVRocmVzaG9sZE9uT2NjdXJyZW5jZU9wZXJhdGlvblwiLCAxMDApXG5cbiAgICAgIGl0IFwiZG9lcyBub3QgYXNrIGNvbmZpcm1hdGlvbiBvbiBvLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImMgb1wiLCBtb2RlOiBcIm9wZXJhdG9yLXBlbmRpbmdcIiwgb2NjdXJyZW5jZVRleHQ6IFsnb28nLCAnb28nLCAnb28nLCAnb28nLCAnb28nXVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maXJtKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwiZG9lcyBub3QgYXNrIGNvbmZpcm1hdGlvbiBvbiBPLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImMgT1wiLCBtb2RlOiBcIm9wZXJhdG9yLXBlbmRpbmdcIiwgb2NjdXJyZW5jZVRleHQ6IFsnb28nLCAnb28nLCAnb28nLCAnb28nLCAnb28nXVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maXJtKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwiZG9lcyBub3QgYXNrIGNvbmZpcm1hdGlvbiBvbiBgZyBvYFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIG9cIiwgbW9kZTogXCJub3JtYWxcIiwgb2NjdXJyZW5jZVRleHQ6IFsnb28nLCAnb28nLCAnb28nLCAnb28nLCAnb28nXVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maXJtKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwiZG9lcyBub3QgYXNrIGNvbmZpcm1hdGlvbiBvbiBgZyBPYFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIE9cIiwgbW9kZTogXCJub3JtYWxcIiwgb2NjdXJyZW5jZVRleHQ6IFsnb28nLCAnb28nLCAnb28nLCAnb28nLCAnb28nXVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maXJtKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZXhjZWVkaW5nIHRocmVzaG9sZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJjb25maXJtVGhyZXNob2xkT25PY2N1cnJlbmNlT3BlcmF0aW9uXCIsIDIpXG5cbiAgICAgIGl0IFwiYXNrIGNvbmZpcm1hdGlvbiBvbiBvLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImMgb1wiLCBtb2RlOiBcIm9wZXJhdG9yLXBlbmRpbmdcIiwgb2NjdXJyZW5jZVRleHQ6IFtdXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpcm0pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBpdCBcImFzayBjb25maXJtYXRpb24gb24gTy1tb2RpZmllclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJjIE9cIiwgbW9kZTogXCJvcGVyYXRvci1wZW5kaW5nXCIsIG9jY3VycmVuY2VUZXh0OiBbXVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maXJtKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJjYW4gY2FuY2VsIGFuZCBjb25maXJtIG9uIG8tbW9kaWZpZXJcIiwgLT5cbiAgICAgICAgYXRvbS5jb25maXJtLmFuZENhbGxGYWtlICh7YnV0dG9uc30pIC0+IGJ1dHRvbnMuaW5kZXhPZihcIkNhbmNlbFwiKVxuICAgICAgICBlbnN1cmUgXCJjIG9cIiwgbW9kZTogXCJvcGVyYXRvci1wZW5kaW5nXCIsIG9jY3VycmVuY2VUZXh0OiBbXVxuICAgICAgICBlbnN1cmUgbnVsbCwgbW9kZTogXCJvcGVyYXRvci1wZW5kaW5nXCIsIG9jY3VycmVuY2VUZXh0OiBbXVxuICAgICAgICBhdG9tLmNvbmZpcm0uYW5kQ2FsbEZha2UgKHtidXR0b25zfSkgLT4gYnV0dG9ucy5pbmRleE9mKFwiQ29udGludWVcIilcbiAgICAgICAgZW5zdXJlIFwib1wiLCBtb2RlOiBcIm9wZXJhdG9yLXBlbmRpbmdcIiwgb2NjdXJyZW5jZVRleHQ6IFsnb28nLCAnb28nLCAnb28nLCAnb28nLCAnb28nXVxuXG4gICAgICBpdCBcImFzayBjb25maXJtYXRpb24gb24gYGcgb2BcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyBvXCIsIG1vZGU6IFwibm9ybWFsXCIsIG9jY3VycmVuY2VUZXh0OiBbXVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maXJtKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJhc2sgY29uZmlybWF0aW9uIG9uIGBnIE9gXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgT1wiLCBtb2RlOiBcIm5vcm1hbFwiLCBvY2N1cnJlbmNlVGV4dDogW11cbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlybSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgIGl0IFwiY2FuIGNhbmNlbCBhbmQgY29uZmlybSBvbiBgZyBvYFwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpcm0uYW5kQ2FsbEZha2UgKHtidXR0b25zfSkgLT4gYnV0dG9ucy5pbmRleE9mKFwiQ2FuY2VsXCIpXG4gICAgICAgIGVuc3VyZSBcImcgb1wiLCBtb2RlOiBcIm5vcm1hbFwiLCBvY2N1cnJlbmNlVGV4dDogW11cbiAgICAgICAgZW5zdXJlIG51bGwsIG1vZGU6IFwibm9ybWFsXCIsIG9jY3VycmVuY2VUZXh0OiBbXVxuICAgICAgICBhdG9tLmNvbmZpcm0uYW5kQ2FsbEZha2UgKHtidXR0b25zfSkgLT4gYnV0dG9ucy5pbmRleE9mKFwiQ29udGludWVcIilcbiAgICAgICAgZW5zdXJlIFwiZyBvXCIsIG1vZGU6IFwibm9ybWFsXCIsIG9jY3VycmVuY2VUZXh0OiBbJ29vJywgJ29vJywgJ29vJywgJ29vJywgJ29vJ11cbiJdfQ==
