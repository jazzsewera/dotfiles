(function() {
  var TextData, _, dispatch, getVimState, ref, settings, withMockPlatform;

  _ = require('underscore-plus');

  ref = require('./spec-helper'), getVimState = ref.getVimState, TextData = ref.TextData, withMockPlatform = ref.withMockPlatform, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  describe("VimState", function() {
    var editor, editorElement, ensure, ensureWait, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureWait = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait, vim;
      });
    });
    describe("initialization", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure(null, {
          mode: 'normal'
        });
      });
      return it("puts the editor in insert-mode if startInInsertMode is true", function() {
        settings.set('startInInsertMode', true);
        return getVimState(function(state, vim) {
          return vim.ensure(null, {
            mode: 'insert'
          });
        });
      });
    });
    describe("::destroy", function() {
      it("re-enables text input on the editor", function() {
        expect(editorElement.component.isInputEnabled()).toBeFalsy();
        vimState.destroy();
        return expect(editorElement.component.isInputEnabled()).toBeTruthy();
      });
      it("removes the mode classes from the editor", function() {
        ensure(null, {
          mode: 'normal'
        });
        vimState.destroy();
        return expect(editorElement.classList.contains("normal-mode")).toBeFalsy();
      });
      return it("is a noop when the editor is already destroyed", function() {
        editorElement.getModel().destroy();
        return vimState.destroy();
      });
    });
    describe("normal-mode", function() {
      describe("when entering an insertable character", function() {
        beforeEach(function() {
          return ensure('\\');
        });
        return it("stops propagation", function() {
          return ensure(null, {
            text: ''
          });
        });
      });
      describe("when entering an operator", function() {
        beforeEach(function() {
          return ensure('d');
        });
        describe("with an operator that can't be composed", function() {
          beforeEach(function() {
            return ensure('x');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        describe("the escape keybinding", function() {
          beforeEach(function() {
            return ensure('escape');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
        return describe("the ctrl-c keybinding", function() {
          beforeEach(function() {
            return ensure('ctrl-c');
          });
          return it("clears the operator stack", function() {
            return expect(vimState.operationStack.isEmpty()).toBe(true);
          });
        });
      });
      describe("the escape keybinding", function() {
        return it("clears any extra cursors", function() {
          set({
            text: "one-two-three",
            addCursor: [0, 3]
          });
          ensure(null, {
            numCursors: 2
          });
          return ensure('escape', {
            numCursors: 1
          });
        });
      });
      describe("the v keybinding", function() {
        beforeEach(function() {
          set({
            text: "abc",
            cursor: [0, 0]
          });
          return ensure('v');
        });
        return it("puts the editor into visual characterwise mode", function() {
          return ensure(null, {
            mode: ['visual', 'characterwise']
          });
        });
      });
      describe("the V keybinding", function() {
        beforeEach(function() {
          return set({
            text: "012345\nabcdef",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual linewise mode", function() {
          return ensure('V', {
            mode: ['visual', 'linewise']
          });
        });
        return it("selects the current line", function() {
          return ensure('V', {
            selectedText: '012345\n'
          });
        });
      });
      describe("the ctrl-v keybinding", function() {
        return it("puts the editor into visual blockwise mode", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('ctrl-v', {
            mode: ['visual', 'blockwise']
          });
        });
      });
      describe("selecting text", function() {
        beforeEach(function() {
          spyOn(_._, "now").andCallFake(function() {
            return window.now;
          });
          return set({
            text: "abc def",
            cursor: [0, 0]
          });
        });
        it("puts the editor into visual mode", function() {
          ensure(null, {
            mode: 'normal'
          });
          advanceClock(200);
          atom.commands.dispatch(editorElement, "core:select-right");
          return ensure(null, {
            mode: ['visual', 'characterwise'],
            selectedBufferRange: [[0, 0], [0, 1]]
          });
        });
        it("handles the editor being destroyed shortly after selecting text", function() {
          set({
            selectedBufferRange: [[0, 0], [0, 3]]
          });
          editor.destroy();
          vimState.destroy();
          return advanceClock(100);
        });
        return it('handles native selection such as core:select-all', function() {
          atom.commands.dispatch(editorElement, 'core:select-all');
          return ensure(null, {
            selectedBufferRange: [[0, 0], [0, 7]]
          });
        });
      });
      describe("the i keybinding", function() {
        return it("puts the editor into insert mode", function() {
          return ensure('i', {
            mode: 'insert'
          });
        });
      });
      describe("the R keybinding", function() {
        return it("puts the editor into replace mode", function() {
          return ensure('R', {
            mode: ['insert', 'replace']
          });
        });
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
        });
        describe("on a line with content", function() {
          return it("[Changed] won't adjust cursor position if outer command place the cursor on end of line('\\n') character", function() {
            ensure(null, {
              mode: 'normal'
            });
            atom.commands.dispatch(editorElement, "editor:move-to-end-of-line");
            return ensure(null, {
              cursor: [0, 6]
            });
          });
        });
        return describe("on an empty line", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [1, 0]
            });
            return ensure(null, {
              cursor: [1, 0]
            });
          });
        });
      });
      return describe('with character-input operations', function() {
        beforeEach(function() {
          return set({
            text: '012345\nabcdef'
          });
        });
        return it('properly clears the operations', function() {
          ensure('d', {
            mode: 'operator-pending'
          });
          expect(vimState.operationStack.isEmpty()).toBe(false);
          ensure('r', {
            mode: 'normal'
          });
          expect(vimState.operationStack.isEmpty()).toBe(true);
          ensure('d', {
            mode: 'operator-pending'
          });
          expect(vimState.operationStack.isEmpty()).toBe(false);
          ensure('escape', {
            mode: 'normal',
            text: '012345\nabcdef'
          });
          return expect(vimState.operationStack.isEmpty()).toBe(true);
        });
      });
    });
    describe("activate-normal-mode-once command", function() {
      beforeEach(function() {
        set({
          text: "0 23456\n1 23456",
          cursor: [0, 2]
        });
        return ensure('i', {
          mode: 'insert',
          cursor: [0, 2]
        });
      });
      return it("activate normal mode without moving cursors left, then back to insert-mode once some command executed", function() {
        ensure('ctrl-o', {
          cursor: [0, 2],
          mode: 'normal'
        });
        return ensure('l', {
          cursor: [0, 3],
          mode: 'insert'
        });
      });
    });
    describe("insert-mode", function() {
      beforeEach(function() {
        return ensure('i');
      });
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting insert mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            set({
              cursor: [0, 6]
            });
            return ensure(null, {
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return escape('escape', {
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('ctrl-c', {
            mode: 'normal'
          });
        });
      });
      describe("clearMultipleCursorsOnEscapeInsertMode setting", function() {
        beforeEach(function() {
          return set({
            text: 'abc',
            cursor: [[0, 1], [0, 2]]
          });
        });
        describe("when enabled, clear multiple cursors on escaping insert-mode", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', true);
          });
          it("clear multiple cursors by respecting last cursor's position", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 1,
              cursor: [0, 1]
            });
          });
          return it("clear multiple cursors by respecting last cursor's position", function() {
            set({
              cursor: [[0, 2], [0, 1]]
            });
            return ensure('escape', {
              mode: 'normal',
              numCursors: 1,
              cursor: [0, 0]
            });
          });
        });
        return describe("when disabled", function() {
          beforeEach(function() {
            return settings.set('clearMultipleCursorsOnEscapeInsertMode', false);
          });
          return it("keep multiple cursors", function() {
            return ensure('escape', {
              mode: 'normal',
              numCursors: 2,
              cursor: [[0, 0], [0, 1]]
            });
          });
        });
      });
      return describe("automaticallyEscapeInsertModeOnActivePaneItemChange setting", function() {
        var otherEditor, otherVim, pane, ref2;
        ref2 = [], otherVim = ref2[0], otherEditor = ref2[1], pane = ref2[2];
        beforeEach(function() {
          getVimState(function(otherVimState, _other) {
            otherVim = _other;
            return otherEditor = otherVimState.editor;
          });
          return runs(function() {
            pane = atom.workspace.getActivePane();
            pane.activateItem(editor);
            set({
              textC: "|editor-1"
            });
            otherVim.set({
              textC: "|editor-2"
            });
            ensure('i', {
              mode: 'insert'
            });
            otherVim.ensure('i', {
              mode: 'insert'
            });
            return expect(pane.getActiveItem()).toBe(editor);
          });
        });
        describe("default behavior", function() {
          return it("remain in insert-mode on paneItem change by default", function() {
            pane.activateItem(otherEditor);
            expect(pane.getActiveItem()).toBe(otherEditor);
            ensure(null, {
              mode: 'insert'
            });
            return otherVim.ensure(null, {
              mode: 'insert'
            });
          });
        });
        return describe("automaticallyEscapeInsertModeOnActivePaneItemChange = true", function() {
          beforeEach(function() {
            settings.set('automaticallyEscapeInsertModeOnActivePaneItemChange', true);
            return jasmine.useRealClock();
          });
          return it("automatically shift to normal mode except new active editor", function() {
            var called;
            called = false;
            runs(function() {
              atom.workspace.onDidStopChangingActivePaneItem(function() {
                return called = true;
              });
              return pane.activateItem(otherEditor);
            });
            waitsFor(function() {
              return called;
            });
            return runs(function() {
              expect(pane.getActiveItem()).toBe(otherEditor);
              ensure(null, {
                mode: 'normal'
              });
              return otherVim.ensure(null, {
                mode: 'insert'
              });
            });
          });
        });
      });
    });
    describe("replace-mode", function() {
      describe("with content", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef"
          });
        });
        describe("when cursor is in the middle of the line", function() {
          return it("moves the cursor to the left when exiting replace mode", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('R escape', {
              cursor: [0, 2]
            });
          });
        });
        describe("when cursor is at the beginning of line", function() {
          beforeEach(function() {});
          return it("leaves the cursor at the beginning of line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('R escape', {
              cursor: [1, 0]
            });
          });
        });
        return describe("on a line with content", function() {
          return it("allows the cursor to be placed on the \n character", function() {
            ensure('R');
            set({
              cursor: [0, 6]
            });
            return ensure(null, {
              cursor: [0, 6]
            });
          });
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('R escape', {
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <ctrl-c> is pressed", function() {
        return withMockPlatform(editorElement, 'platform-darwin', function() {
          return ensure('R ctrl-c', {
            mode: 'normal'
          });
        });
      });
      return describe("shift between insert and replace", function() {
        var startInsertMode, startReplaceMode;
        startReplaceMode = function() {
          return dispatch(editorElement, "vim-mode-plus:activate-replace-mode");
        };
        startInsertMode = function() {
          return dispatch(editorElement, "vim-mode-plus:activate-insert-mode");
        };
        it("move left on escape since replace mode is submode of insert-mode", function() {
          set({
            textC: "01234|5"
          });
          ensure('R escape', {
            textC: "0123|45",
            mode: "normal"
          });
          ensure('R escape', {
            textC: "012|345",
            mode: "normal"
          });
          ensure('R escape', {
            textC: "01|2345",
            mode: "normal"
          });
          return ensure('R escape', {
            textC: "0|12345",
            mode: "normal"
          });
        });
        it("can activate replace multiple times but move left once on escape", function() {
          set({
            textC: "01234|5"
          });
          ensure('R', {
            mode: ["insert", "replace"]
          });
          startReplaceMode();
          ensure(null, {
            mode: ["insert", "replace"]
          });
          startReplaceMode();
          ensure(null, {
            mode: ["insert", "replace"]
          });
          return ensure('escape', {
            textC: "0123|45",
            mode: "normal"
          });
        });
        it("can toggle between insert and replace", function() {
          set({
            textC: "012|345"
          });
          startReplaceMode();
          editor.insertText("r");
          ensure(null, {
            textC: "012r|45",
            mode: ["insert", "replace"]
          });
          startInsertMode();
          editor.insertText("i");
          ensure(null, {
            textC: "012ri|45",
            mode: ["insert", void 0]
          });
          startReplaceMode();
          editor.insertText("r");
          return ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
        });
        return it("can toggle between insert and replace by toggle-replace-mode command", function() {
          var insertText, toggle;
          toggle = function() {
            return dispatch(editorElement, 'vim-mode-plus:toggle-replace-mode');
          };
          insertText = function(text) {
            return editor.insertText(text);
          };
          set({
            textC: "012|345"
          });
          startInsertMode();
          ensure(null, {
            textC: "012|345",
            mode: "insert"
          });
          toggle();
          insertText("r");
          ensure(null, {
            textC: "012r|45",
            mode: ["insert", "replace"]
          });
          toggle();
          insertText("i");
          ensure(null, {
            textC: "012ri|45",
            mode: ["insert", void 0]
          });
          toggle();
          insertText("r");
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", void 0]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", void 0]
          });
          toggle();
          ensure(null, {
            textC: "012rir|5",
            mode: ["insert", "replace"]
          });
          ensure("escape", {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
          toggle();
          return ensure(null, {
            textC: "012ri|r5",
            mode: "normal"
          });
        });
      });
    });
    describe("visual-mode", function() {
      beforeEach(function() {
        set({
          text: "one two three",
          cursor: [0, 4]
        });
        return ensure('v');
      });
      it("selects the character under the cursor", function() {
        return ensure(null, {
          selectedBufferRange: [[0, 4], [0, 5]],
          selectedText: 't'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed", function() {
        return ensure('escape', {
          cursor: [0, 4],
          mode: 'normal'
        });
      });
      it("puts the editor into normal mode when <escape> is pressed on selection is reversed", function() {
        ensure(null, {
          selectedText: 't'
        });
        ensure('h h', {
          selectedText: 'e t',
          selectionIsReversed: true
        });
        return ensure('escape', {
          mode: 'normal',
          cursor: [0, 2]
        });
      });
      describe("motions", function() {
        it("transforms the selection", function() {
          return ensure('w', {
            selectedText: 'two t'
          });
        });
        return it("always leaves the initially selected character selected", function() {
          ensure('h', {
            selectedText: ' t'
          });
          ensure('l', {
            selectedText: 't'
          });
          return ensure('l', {
            selectedText: 'tw'
          });
        });
      });
      describe("operators", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef",
            cursor: [0, 0]
          });
          return ensure('V d', {
            text: "\nabcdef"
          });
        });
      });
      describe("returning to normal-mode", function() {
        return it("operate on the current selection", function() {
          set({
            text: "012345\n\nabcdef"
          });
          return ensure('V escape', {
            selectedText: ''
          });
        });
      });
      describe("the o keybinding", function() {
        it("reversed each selection", function() {
          set({
            addCursor: [0, 12]
          });
          ensure('i w', {
            selectedText: ["two", "three"],
            selectionIsReversed: false
          });
          return ensure('o', {
            selectionIsReversed: true
          });
        });
        return xit("harmonizes selection directions", function() {
          set({
            cursor: [0, 0]
          });
          ensure('e e');
          set({
            addCursor: [0, 2e308]
          });
          ensure('h h', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursor: [[0, 5], [0, 11]]
          });
          return ensure('o', {
            selectedBufferRange: [[[0, 0], [0, 5]], [[0, 11], [0, 13]]],
            cursor: [[0, 5], [0, 13]]
          });
        });
      });
      describe("activate visualmode within visualmode", function() {
        var cursorPosition;
        cursorPosition = null;
        beforeEach(function() {
          cursorPosition = [0, 4];
          set({
            text: "line one\nline two\nline three\n",
            cursor: cursorPosition
          });
          return ensure('escape', {
            mode: 'normal'
          });
        });
        describe("restore characterwise from linewise", function() {
          beforeEach(function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('2 j V', {
              selectedText: "line one\nline two\nline three\n",
              mode: ['visual', 'linewise'],
              selectionIsReversed: false
            });
            return ensure('o', {
              selectedText: "line one\nline two\nline three\n",
              mode: ['visual', 'linewise'],
              selectionIsReversed: true
            });
          });
          it("v after o", function() {
            return ensure('v', {
              selectedText: " one\nline two\nline ",
              mode: ['visual', 'characterwise'],
              selectionIsReversed: true
            });
          });
          return it("escape after o", function() {
            return ensure('escape', {
              cursor: [0, 4],
              mode: 'normal'
            });
          });
        });
        describe("activateVisualMode with same type puts the editor into normal mode", function() {
          describe("characterwise: vv", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('v', {
                mode: ['visual', 'characterwise']
              });
              return ensure('v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          describe("linewise: VV", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('V', {
                mode: ['visual', 'linewise']
              });
              return ensure('V', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
          return describe("blockwise: ctrl-v twice", function() {
            return it("activating twice make editor return to normal mode ", function() {
              ensure('ctrl-v', {
                mode: ['visual', 'blockwise']
              });
              return ensure('ctrl-v', {
                mode: 'normal',
                cursor: cursorPosition
              });
            });
          });
        });
        describe("change submode within visualmode", function() {
          beforeEach(function() {
            return set({
              text: "line one\nline two\nline three\n",
              cursor: [[0, 5], [2, 5]]
            });
          });
          it("can change submode within visual mode", function() {
            ensure('v', {
              mode: ['visual', 'characterwise']
            });
            ensure('V', {
              mode: ['visual', 'linewise']
            });
            ensure('ctrl-v', {
              mode: ['visual', 'blockwise']
            });
            return ensure('v', {
              mode: ['visual', 'characterwise']
            });
          });
          return it("recover original range when shift from linewise to characterwise", function() {
            ensure('v i w', {
              selectedText: ['one', 'three']
            });
            ensure('V', {
              selectedText: ["line one\n", "line three\n"]
            });
            return ensure('v', {
              selectedText: ["one", "three"]
            });
          });
        });
        return describe("keep goalColum when submode change in visual-mode", function() {
          var text;
          text = null;
          beforeEach(function() {
            text = new TextData("0_34567890ABCDEF\n1_34567890\n2_34567\n3_34567890A\n4_34567890ABCDEF\n");
            return set({
              text: text.getRaw(),
              cursor: [0, 0]
            });
          });
          return it("keep goalColumn when shift linewise to characterwise", function() {
            ensure('V', {
              selectedText: text.getLines([0]),
              propertyHead: [0, 0],
              mode: ['visual', 'linewise']
            });
            ensure('$', {
              selectedText: text.getLines([0]),
              propertyHead: [0, 16],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1]),
              propertyHead: [1, 10],
              mode: ['visual', 'linewise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2]),
              propertyHead: [2, 7],
              mode: ['visual', 'linewise']
            });
            ensure('v', {
              selectedText: text.getLines([0, 1, 2]),
              propertyHead: [2, 7],
              mode: ['visual', 'characterwise']
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3]),
              propertyHead: [3, 11],
              mode: ['visual', 'characterwise']
            });
            ensure('v', {
              cursor: [3, 10],
              mode: 'normal'
            });
            return ensure('j', {
              cursor: [4, 15],
              mode: 'normal'
            });
          });
        });
      });
      describe("deactivating visual mode", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "line one\nline two\nline three\n",
            cursor: [0, 7]
          });
        });
        it("can put cursor at in visual char mode", function() {
          return ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [0, 8]
          });
        });
        it("adjust cursor position 1 column left when deactivated", function() {
          return ensure('v escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
        return it("can select new line in visual mode", function() {
          ensure('v', {
            cursor: [0, 8],
            propertyHead: [0, 7]
          });
          ensure('l', {
            cursor: [1, 0],
            propertyHead: [0, 8]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [0, 7]
          });
        });
      });
      return describe("deactivating visual mode on blank line", function() {
        beforeEach(function() {
          ensure('escape', {
            mode: 'normal'
          });
          return set({
            text: "0: abc\n\n2: abc",
            cursor: [1, 0]
          });
        });
        it("v case-1", function() {
          ensure('v', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("v case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('v j', {
            mode: ['visual', 'characterwise'],
            cursor: [2, 0],
            selectedText: ": abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-1", function() {
          ensure('V', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("V case-2 selection head is blank line", function() {
          set({
            cursor: [0, 1]
          });
          ensure('V j', {
            mode: ['visual', 'linewise'],
            cursor: [2, 0],
            selectedText: "0: abc\n\n"
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        it("ctrl-v", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRange: [[1, 0], [1, 0]]
          });
          return ensure('escape', {
            mode: 'normal',
            cursor: [1, 0]
          });
        });
        return it("ctrl-v and move over empty line", function() {
          ensure('ctrl-v', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          ensure('k', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[0, 0], [0, 1]], [[1, 0], [1, 0]]]
          });
          ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[1, 0], [1, 0]]
          });
          return ensure('j', {
            mode: ['visual', 'blockwise'],
            selectedBufferRangeOrdered: [[[1, 0], [1, 0]], [[2, 0], [2, 1]]]
          });
        });
      });
    });
    describe("marks", function() {
      beforeEach(function() {
        return set({
          text: "text in line 1\ntext in line 2\ntext in line 3"
        });
      });
      it("basic marking functionality", function() {
        runs(function() {
          set({
            cursor: [1, 1]
          });
          return ensureWait('m t');
        });
        return runs(function() {
          set({
            cursor: [2, 2]
          });
          return ensure('` t', {
            cursor: [1, 1]
          });
        });
      });
      it("real (tracking) marking functionality", function() {
        runs(function() {
          set({
            cursor: [2, 2]
          });
          return ensureWait('m q');
        });
        return runs(function() {
          set({
            cursor: [1, 2]
          });
          return ensure('o escape ` q', {
            cursor: [3, 2]
          });
        });
      });
      return it("real (tracking) marking functionality", function() {
        runs(function() {
          set({
            cursor: [2, 2]
          });
          return ensureWait('m q');
        });
        return runs(function() {
          set({
            cursor: [1, 2]
          });
          return ensure('d d escape ` q', {
            cursor: [1, 2]
          });
        });
      });
    });
    return describe("is-narrowed attribute", function() {
      var ensureNormalModeState;
      ensureNormalModeState = function() {
        return ensure("escape", {
          mode: 'normal',
          selectedText: '',
          selectionIsNarrowed: false
        });
      };
      beforeEach(function() {
        return set({
          text: "1:-----\n2:-----\n3:-----\n4:-----",
          cursor: [0, 0]
        });
      });
      describe("normal-mode", function() {
        return it("is not narrowed", function() {
          return ensure(null, {
            mode: ['normal'],
            selectionIsNarrowed: false
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        it("[single row] is narrowed", function() {
          ensure('v $', {
            selectedText: '1:-----\n',
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('v j', {
            selectedText: "1:-----\n2",
            mode: ['visual', 'characterwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      describe("visual-mode.linewise", function() {
        it("[single row] is narrowed", function() {
          ensure('V', {
            selectedText: "1:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('V j', {
            selectedText: "1:-----\n2:-----\n",
            mode: ['visual', 'linewise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
      return describe("visual-mode.blockwise", function() {
        it("[single row] is narrowed", function() {
          ensure('ctrl-v l', {
            selectedText: "1:",
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: false
          });
          return ensureNormalModeState();
        });
        return it("[multi-row] is narrowed", function() {
          ensure('ctrl-v l j', {
            selectedText: ["1:", "2:"],
            mode: ['visual', 'blockwise'],
            selectionIsNarrowed: true
          });
          return ensureNormalModeState();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmltLXN0YXRlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQXNELE9BQUEsQ0FBUSxlQUFSLENBQXRELEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1Q0FBeEIsRUFBMEM7O0VBQzFDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQTtBQUNuQixRQUFBO0lBQUEsT0FBNkQsRUFBN0QsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxvQkFBZCxFQUEwQixnQkFBMUIsRUFBa0MsdUJBQWxDLEVBQWlEO0lBRWpELFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMsMkJBQWQsRUFBNEI7TUFIbEIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtNQUN6QixFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtlQUN4RCxNQUFBLENBQU8sSUFBUCxFQUFhO1VBQUEsSUFBQSxFQUFNLFFBQU47U0FBYjtNQUR3RCxDQUExRDthQUdBLEVBQUEsQ0FBRyw2REFBSCxFQUFrRSxTQUFBO1FBQ2hFLFFBQVEsQ0FBQyxHQUFULENBQWEsbUJBQWIsRUFBa0MsSUFBbEM7ZUFDQSxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtpQkFDVixHQUFHLENBQUMsTUFBSixDQUFXLElBQVgsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtRQURVLENBQVo7TUFGZ0UsQ0FBbEU7SUFKeUIsQ0FB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cUIsS0FGckI7V0FERjtpQkFJQSxxQkFBQSxDQUFBO1FBTDZCLENBQS9CO2VBTUEsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7VUFDNUIsTUFBQSxDQUFPLFlBQVAsRUFDRTtZQUFBLFlBQUEsRUFBYyxDQUFDLElBQUQsRUFBTyxJQUFQLENBQWQ7WUFDQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsV0FBWCxDQUROO1lBRUEsbUJBQUEsRUFBcUIsSUFGckI7V0FERjtpQkFJQSxxQkFBQSxDQUFBO1FBTDRCLENBQTlCO01BUGdDLENBQWxDO0lBckRnQyxDQUFsQztFQWhuQm1CLENBQXJCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue2dldFZpbVN0YXRlLCBUZXh0RGF0YSwgd2l0aE1vY2tQbGF0Zm9ybSwgZGlzcGF0Y2h9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIlZpbVN0YXRlXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdCwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdH0gPSB2aW1cblxuICBkZXNjcmliZSBcImluaXRpYWxpemF0aW9uXCIsIC0+XG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW4gbm9ybWFsLW1vZGUgaW5pdGlhbGx5IGJ5IGRlZmF1bHRcIiwgLT5cbiAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW4gaW5zZXJ0LW1vZGUgaWYgc3RhcnRJbkluc2VydE1vZGUgaXMgdHJ1ZVwiLCAtPlxuICAgICAgc2V0dGluZ3Muc2V0ICdzdGFydEluSW5zZXJ0TW9kZScsIHRydWVcbiAgICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgICB2aW0uZW5zdXJlIG51bGwsIG1vZGU6ICdpbnNlcnQnXG5cbiAgZGVzY3JpYmUgXCI6OmRlc3Ryb3lcIiwgLT5cbiAgICBpdCBcInJlLWVuYWJsZXMgdGV4dCBpbnB1dCBvbiB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jb21wb25lbnQuaXNJbnB1dEVuYWJsZWQoKSkudG9CZUZhbHN5KClcbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY29tcG9uZW50LmlzSW5wdXRFbmFibGVkKCkpLnRvQmVUcnV0aHkoKVxuXG4gICAgaXQgXCJyZW1vdmVzIHRoZSBtb2RlIGNsYXNzZXMgZnJvbSB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICBlbnN1cmUgbnVsbCwgbW9kZTogJ25vcm1hbCdcbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibm9ybWFsLW1vZGVcIikpLnRvQmVGYWxzeSgpXG5cbiAgICBpdCBcImlzIGEgbm9vcCB3aGVuIHRoZSBlZGl0b3IgaXMgYWxyZWFkeSBkZXN0cm95ZWRcIiwgLT5cbiAgICAgIGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5kZXN0cm95KClcbiAgICAgIHZpbVN0YXRlLmRlc3Ryb3koKVxuXG4gIGRlc2NyaWJlIFwibm9ybWFsLW1vZGVcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gZW50ZXJpbmcgYW4gaW5zZXJ0YWJsZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlICdcXFxcJ1xuXG4gICAgICBpdCBcInN0b3BzIHByb3BhZ2F0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSBudWxsLCB0ZXh0OiAnJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGVudGVyaW5nIGFuIG9wZXJhdG9yXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVuc3VyZSAnZCdcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGFuIG9wZXJhdG9yIHRoYXQgY2FuJ3QgYmUgY29tcG9zZWRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVuc3VyZSAneCdcblxuICAgICAgICBpdCBcImNsZWFycyB0aGUgb3BlcmF0b3Igc3RhY2tcIiwgLT5cbiAgICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKHRydWUpXG5cbiAgICAgIGRlc2NyaWJlIFwidGhlIGVzY2FwZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZSdcblxuICAgICAgICBpdCBcImNsZWFycyB0aGUgb3BlcmF0b3Igc3RhY2tcIiwgLT5cbiAgICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKHRydWUpXG5cbiAgICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtYyBrZXliaW5kaW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtYydcblxuICAgICAgICBpdCBcImNsZWFycyB0aGUgb3BlcmF0b3Igc3RhY2tcIiwgLT5cbiAgICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKHRydWUpXG5cbiAgICBkZXNjcmliZSBcInRoZSBlc2NhcGUga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJjbGVhcnMgYW55IGV4dHJhIGN1cnNvcnNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJvbmUtdHdvLXRocmVlXCJcbiAgICAgICAgICBhZGRDdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgbnVsbCwgbnVtQ3Vyc29yczogMlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG51bUN1cnNvcnM6IDFcblxuICAgIGRlc2NyaWJlIFwidGhlIHYga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICd2J1xuXG4gICAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIHZpc3VhbCBjaGFyYWN0ZXJ3aXNlIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICBkZXNjcmliZSBcInRoZSBWIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIwMTIzNDVcXG5hYmNkZWZcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gdmlzdWFsIGxpbmV3aXNlIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdWJywgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuXG4gICAgICBpdCBcInNlbGVjdHMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1YnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogJzAxMjM0NVxcbidcblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtdiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIHZpc3VhbCBibG9ja3dpc2UgbW9kZVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdjdHJsLXYnLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuXG4gICAgZGVzY3JpYmUgXCJzZWxlY3RpbmcgdGV4dFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihfLl8sIFwibm93XCIpLmFuZENhbGxGYWtlIC0+IHdpbmRvdy5ub3dcbiAgICAgICAgc2V0IHRleHQ6IFwiYWJjIGRlZlwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIGFkdmFuY2VDbG9jaygyMDApXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgXCJjb3JlOnNlbGVjdC1yaWdodFwiKVxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMCwgMV1dXG5cbiAgICAgIGl0IFwiaGFuZGxlcyB0aGUgZWRpdG9yIGJlaW5nIGRlc3Ryb3llZCBzaG9ydGx5IGFmdGVyIHNlbGVjdGluZyB0ZXh0XCIsIC0+XG4gICAgICAgIHNldCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzAsIDBdLCBbMCwgM11dXG4gICAgICAgIGVkaXRvci5kZXN0cm95KClcbiAgICAgICAgdmltU3RhdGUuZGVzdHJveSgpXG4gICAgICAgIGFkdmFuY2VDbG9jaygxMDApXG5cbiAgICAgIGl0ICdoYW5kbGVzIG5hdGl2ZSBzZWxlY3Rpb24gc3VjaCBhcyBjb3JlOnNlbGVjdC1hbGwnLCAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdjb3JlOnNlbGVjdC1hbGwnKVxuICAgICAgICBlbnN1cmUgbnVsbCwgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCAwXSwgWzAsIDddXVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgaSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcInRoZSBSIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gcmVwbGFjZSBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwib24gYSBsaW5lIHdpdGggY29udGVudFwiLCAtPlxuICAgICAgICBpdCBcIltDaGFuZ2VkXSB3b24ndCBhZGp1c3QgY3Vyc29yIHBvc2l0aW9uIGlmIG91dGVyIGNvbW1hbmQgcGxhY2UgdGhlIGN1cnNvciBvbiBlbmQgb2YgbGluZSgnXFxcXG4nKSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsIFwiZWRpdG9yOm1vdmUtdG8tZW5kLW9mLWxpbmVcIilcbiAgICAgICAgICBlbnN1cmUgbnVsbCwgY3Vyc29yOiBbMCwgNl1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBhbiBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiYWxsb3dzIHRoZSBjdXJzb3IgdG8gYmUgcGxhY2VkIG9uIHRoZSBcXG4gY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSAnd2l0aCBjaGFyYWN0ZXItaW5wdXQgb3BlcmF0aW9ucycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnMDEyMzQ1XFxuYWJjZGVmJ1xuXG4gICAgICBpdCAncHJvcGVybHkgY2xlYXJzIHRoZSBvcGVyYXRpb25zJywgLT5cblxuICAgICAgICBlbnN1cmUgJ2QnLCBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcbiAgICAgICAgZXhwZWN0KHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmlzRW1wdHkoKSkudG9CZShmYWxzZSlcbiAgICAgICAgZW5zdXJlICdyJywgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZXhwZWN0KHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmlzRW1wdHkoKSkudG9CZSh0cnVlKVxuXG4gICAgICAgIGVuc3VyZSAnZCcsIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKGZhbHNlKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnLCB0ZXh0OiAnMDEyMzQ1XFxuYWJjZGVmJ1xuICAgICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlKHRydWUpXG5cbiAgZGVzY3JpYmUgXCJhY3RpdmF0ZS1ub3JtYWwtbW9kZS1vbmNlIGNvbW1hbmRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIDAgMjM0NTZcbiAgICAgICAgMSAyMzQ1NlxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJhY3RpdmF0ZSBub3JtYWwgbW9kZSB3aXRob3V0IG1vdmluZyBjdXJzb3JzIGxlZnQsIHRoZW4gYmFjayB0byBpbnNlcnQtbW9kZSBvbmNlIHNvbWUgY29tbWFuZCBleGVjdXRlZFwiLCAtPlxuICAgICAgZW5zdXJlICdjdHJsLW8nLCBjdXJzb3I6IFswLCAyXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzAsIDNdLCBtb2RlOiAnaW5zZXJ0J1xuXG4gIGRlc2NyaWJlIFwiaW5zZXJ0LW1vZGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+IGVuc3VyZSAnaSdcblxuICAgIGRlc2NyaWJlIFwid2l0aCBjb250ZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGxlZnQgd2hlbiBleGl0aW5nIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGF0IHRoZSBiZWdpbm5pbmcgb2YgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImxlYXZlcyB0aGUgY3Vyc29yIGF0IHRoZSBiZWdpbm5pbmcgb2YgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICAgIGl0IFwiYWxsb3dzIHRoZSBjdXJzb3IgdG8gYmUgcGxhY2VkIG9uIHRoZSBcXG4gY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbnRvIG5vcm1hbCBtb2RlIHdoZW4gPGVzY2FwZT4gaXMgcHJlc3NlZFwiLCAtPlxuICAgICAgZXNjYXBlICdlc2NhcGUnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZSB3aGVuIDxjdHJsLWM+IGlzIHByZXNzZWRcIiwgLT5cbiAgICAgIHdpdGhNb2NrUGxhdGZvcm0gZWRpdG9yRWxlbWVudCwgJ3BsYXRmb3JtLWRhcndpbicgLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtYycsIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcImNsZWFyTXVsdGlwbGVDdXJzb3JzT25Fc2NhcGVJbnNlcnRNb2RlIHNldHRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogJ2FiYydcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMV0sIFswLCAyXV1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGVuYWJsZWQsIGNsZWFyIG11bHRpcGxlIGN1cnNvcnMgb24gZXNjYXBpbmcgaW5zZXJ0LW1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2xlYXJNdWx0aXBsZUN1cnNvcnNPbkVzY2FwZUluc2VydE1vZGUnLCB0cnVlKVxuICAgICAgICBpdCBcImNsZWFyIG11bHRpcGxlIGN1cnNvcnMgYnkgcmVzcGVjdGluZyBsYXN0IGN1cnNvcidzIHBvc2l0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgbnVtQ3Vyc29yczogMSwgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBpdCBcImNsZWFyIG11bHRpcGxlIGN1cnNvcnMgYnkgcmVzcGVjdGluZyBsYXN0IGN1cnNvcidzIHBvc2l0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogW1swLCAyXSwgWzAsIDFdXVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIG51bUN1cnNvcnM6IDEsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBkaXNhYmxlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdjbGVhck11bHRpcGxlQ3Vyc29yc09uRXNjYXBlSW5zZXJ0TW9kZScsIGZhbHNlKVxuICAgICAgICBpdCBcImtlZXAgbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIG51bUN1cnNvcnM6IDIsIGN1cnNvcjogW1swLCAwXSwgWzAsIDFdXVxuXG4gICAgZGVzY3JpYmUgXCJhdXRvbWF0aWNhbGx5RXNjYXBlSW5zZXJ0TW9kZU9uQWN0aXZlUGFuZUl0ZW1DaGFuZ2Ugc2V0dGluZ1wiLCAtPlxuICAgICAgW290aGVyVmltLCBvdGhlckVkaXRvciwgcGFuZV0gPSBbXVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGdldFZpbVN0YXRlIChvdGhlclZpbVN0YXRlLCBfb3RoZXIpIC0+XG4gICAgICAgICAgb3RoZXJWaW0gPSBfb3RoZXJcbiAgICAgICAgICBvdGhlckVkaXRvciA9IG90aGVyVmltU3RhdGUuZWRpdG9yXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpXG5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwifGVkaXRvci0xXCJcbiAgICAgICAgICBvdGhlclZpbS5zZXQgdGV4dEM6IFwifGVkaXRvci0yXCJcblxuICAgICAgICAgIGVuc3VyZSAnaScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgb3RoZXJWaW0uZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBleHBlY3QocGFuZS5nZXRBY3RpdmVJdGVtKCkpLnRvQmUoZWRpdG9yKVxuXG4gICAgICBkZXNjcmliZSBcImRlZmF1bHQgYmVoYXZpb3JcIiwgLT5cbiAgICAgICAgaXQgXCJyZW1haW4gaW4gaW5zZXJ0LW1vZGUgb24gcGFuZUl0ZW0gY2hhbmdlIGJ5IGRlZmF1bHRcIiwgLT5cblxuICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG90aGVyRWRpdG9yKVxuICAgICAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW0oKSkudG9CZShvdGhlckVkaXRvcilcblxuICAgICAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIG90aGVyVmltLmVuc3VyZSBudWxsLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcImF1dG9tYXRpY2FsbHlFc2NhcGVJbnNlcnRNb2RlT25BY3RpdmVQYW5lSXRlbUNoYW5nZSA9IHRydWVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnYXV0b21hdGljYWxseUVzY2FwZUluc2VydE1vZGVPbkFjdGl2ZVBhbmVJdGVtQ2hhbmdlJywgdHJ1ZSlcbiAgICAgICAgICBqYXNtaW5lLnVzZVJlYWxDbG9jaygpXG5cbiAgICAgICAgaXQgXCJhdXRvbWF0aWNhbGx5IHNoaWZ0IHRvIG5vcm1hbCBtb2RlIGV4Y2VwdCBuZXcgYWN0aXZlIGVkaXRvclwiLCAtPlxuICAgICAgICAgIGNhbGxlZCA9IGZhbHNlXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtIC0+IGNhbGxlZCA9IHRydWVcbiAgICAgICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG90aGVyRWRpdG9yKVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIGNhbGxlZFxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KHBhbmUuZ2V0QWN0aXZlSXRlbSgpKS50b0JlKG90aGVyRWRpdG9yKVxuICAgICAgICAgICAgZW5zdXJlIG51bGwsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICBvdGhlclZpbS5lbnN1cmUgbnVsbCwgbW9kZTogJ2luc2VydCdcblxuICBkZXNjcmliZSBcInJlcGxhY2UtbW9kZVwiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBjb250ZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgaW4gdGhlIG1pZGRsZSBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGxlZnQgd2hlbiBleGl0aW5nIHJlcGxhY2UgbW9kZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAnUiBlc2NhcGUnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIGF0IHRoZSBiZWdpbm5pbmcgb2YgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG5cbiAgICAgICAgaXQgXCJsZWF2ZXMgdGhlIGN1cnNvciBhdCB0aGUgYmVnaW5uaW5nIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1IgZXNjYXBlJywgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICAgIGl0IFwiYWxsb3dzIHRoZSBjdXJzb3IgdG8gYmUgcGxhY2VkIG9uIHRoZSBcXG4gY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdSJ1xuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIGVuc3VyZSBudWxsLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZSB3aGVuIDxlc2NhcGU+IGlzIHByZXNzZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUiBlc2NhcGUnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZSB3aGVuIDxjdHJsLWM+IGlzIHByZXNzZWRcIiwgLT5cbiAgICAgIHdpdGhNb2NrUGxhdGZvcm0gZWRpdG9yRWxlbWVudCwgJ3BsYXRmb3JtLWRhcndpbicgLCAtPlxuICAgICAgICBlbnN1cmUgJ1IgY3RybC1jJywgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwic2hpZnQgYmV0d2VlbiBpbnNlcnQgYW5kIHJlcGxhY2VcIiwgLT5cbiAgICAgIHN0YXJ0UmVwbGFjZU1vZGUgPSAtPiBkaXNwYXRjaChlZGl0b3JFbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6YWN0aXZhdGUtcmVwbGFjZS1tb2RlXCIpXG4gICAgICBzdGFydEluc2VydE1vZGUgPSAtPiBkaXNwYXRjaChlZGl0b3JFbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6YWN0aXZhdGUtaW5zZXJ0LW1vZGVcIilcblxuICAgICAgaXQgXCJtb3ZlIGxlZnQgb24gZXNjYXBlIHNpbmNlIHJlcGxhY2UgbW9kZSBpcyBzdWJtb2RlIG9mIGluc2VydC1tb2RlXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgICAgICB0ZXh0QzogXCIwMTIzNHw1XCJcbiAgICAgICAgZW5zdXJlICdSIGVzY2FwZScsIHRleHRDOiBcIjAxMjN8NDVcIiwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICBlbnN1cmUgJ1IgZXNjYXBlJywgdGV4dEM6IFwiMDEyfDM0NVwiLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgIGVuc3VyZSAnUiBlc2NhcGUnLCB0ZXh0QzogXCIwMXwyMzQ1XCIsIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgZW5zdXJlICdSIGVzY2FwZScsIHRleHRDOiBcIjB8MTIzNDVcIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICBpdCBcImNhbiBhY3RpdmF0ZSByZXBsYWNlIG11bHRpcGxlIHRpbWVzIGJ1dCBtb3ZlIGxlZnQgb25jZSBvbiBlc2NhcGVcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgdGV4dEM6IFwiMDEyMzR8NVwiXG4gICAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFtcImluc2VydFwiLCBcInJlcGxhY2VcIl1cbiAgICAgICAgc3RhcnRSZXBsYWNlTW9kZSgpXG4gICAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiBbXCJpbnNlcnRcIiwgXCJyZXBsYWNlXCJdXG4gICAgICAgIHN0YXJ0UmVwbGFjZU1vZGUoKVxuICAgICAgICBlbnN1cmUgbnVsbCwgbW9kZTogW1wiaW5zZXJ0XCIsIFwicmVwbGFjZVwiXVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHRDOiBcIjAxMjN8NDVcIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICBpdCBcImNhbiB0b2dnbGUgYmV0d2VlbiBpbnNlcnQgYW5kIHJlcGxhY2VcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcIjAxMnwzNDVcIlxuXG4gICAgICAgIHN0YXJ0UmVwbGFjZU1vZGUoKTsgZWRpdG9yLmluc2VydFRleHQoXCJyXCIpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycnw0NVwiLCBtb2RlOiBbXCJpbnNlcnRcIiwgXCJyZXBsYWNlXCJdXG4gICAgICAgIHN0YXJ0SW5zZXJ0TW9kZSgpOyBlZGl0b3IuaW5zZXJ0VGV4dChcImlcIik7IGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXw0NVwiLCBtb2RlOiBbXCJpbnNlcnRcIiwgdW5kZWZpbmVkXVxuICAgICAgICBzdGFydFJlcGxhY2VNb2RlKCk7IGVkaXRvci5pbnNlcnRUZXh0KFwiclwiKTsgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJpcnw1XCIsIG1vZGU6IFtcImluc2VydFwiLCBcInJlcGxhY2VcIl1cblxuICAgICAgaXQgXCJjYW4gdG9nZ2xlIGJldHdlZW4gaW5zZXJ0IGFuZCByZXBsYWNlIGJ5IHRvZ2dsZS1yZXBsYWNlLW1vZGUgY29tbWFuZFwiLCAtPlxuICAgICAgICB0b2dnbGUgPSAtPiBkaXNwYXRjaChlZGl0b3JFbGVtZW50LCAndmltLW1vZGUtcGx1czp0b2dnbGUtcmVwbGFjZS1tb2RlJylcbiAgICAgICAgaW5zZXJ0VGV4dCA9ICh0ZXh0KSAtPiBlZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuXG4gICAgICAgIHNldCB0ZXh0QzogXCIwMTJ8MzQ1XCJcbiAgICAgICAgc3RhcnRJbnNlcnRNb2RlKClcbiAgICAgICAgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnwzNDVcIiwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgICAgIHRvZ2dsZSgpOyBpbnNlcnRUZXh0KFwiclwiKTsgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJ8NDVcIiwgIG1vZGU6IFtcImluc2VydFwiLCBcInJlcGxhY2VcIl1cbiAgICAgICAgdG9nZ2xlKCk7IGluc2VydFRleHQoXCJpXCIpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycml8NDVcIiwgbW9kZTogW1wiaW5zZXJ0XCIsIHVuZGVmaW5lZF1cbiAgICAgICAgdG9nZ2xlKCk7IGluc2VydFRleHQoXCJyXCIpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycmlyfDVcIiwgbW9kZTogW1wiaW5zZXJ0XCIsIFwicmVwbGFjZVwiXVxuICAgICAgICB0b2dnbGUoKTsgICAgICAgICAgICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycmlyfDVcIiwgbW9kZTogW1wiaW5zZXJ0XCIsIHVuZGVmaW5lZF1cbiAgICAgICAgdG9nZ2xlKCk7ICAgICAgICAgICAgICAgICAgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJpcnw1XCIsIG1vZGU6IFtcImluc2VydFwiLCBcInJlcGxhY2VcIl1cbiAgICAgICAgdG9nZ2xlKCk7ICAgICAgICAgICAgICAgICAgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJpcnw1XCIsIG1vZGU6IFtcImluc2VydFwiLCB1bmRlZmluZWRdXG4gICAgICAgIHRvZ2dsZSgpOyAgICAgICAgICAgICAgICAgIGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXJ8NVwiLCBtb2RlOiBbXCJpbnNlcnRcIiwgXCJyZXBsYWNlXCJdXG5cbiAgICAgICAgIyBEbyBub3RoaW5nIGlmIG5vdCBhbHJlYWR5IGluIGluc2VydC1tb2RlXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCB0ZXh0QzogXCIwMTJyaXxyNVwiLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgIHRvZ2dsZSgpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycml8cjVcIiwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICB0b2dnbGUoKTsgZW5zdXJlIG51bGwsIHRleHRDOiBcIjAxMnJpfHI1XCIsIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgdG9nZ2xlKCk7IGVuc3VyZSBudWxsLCB0ZXh0QzogXCIwMTJyaXxyNVwiLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgIHRvZ2dsZSgpOyBlbnN1cmUgbnVsbCwgdGV4dEM6IFwiMDEycml8cjVcIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gIGRlc2NyaWJlIFwidmlzdWFsLW1vZGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIG9uZSB0d28gdGhyZWVcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJ3YnXG5cbiAgICBpdCBcInNlbGVjdHMgdGhlIGNoYXJhY3RlciB1bmRlciB0aGUgY3Vyc29yXCIsIC0+XG4gICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1swLCA0XSwgWzAsIDVdXVxuICAgICAgICBzZWxlY3RlZFRleHQ6ICd0J1xuXG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW50byBub3JtYWwgbW9kZSB3aGVuIDxlc2NhcGU+IGlzIHByZXNzZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGl0IFwicHV0cyB0aGUgZWRpdG9yIGludG8gbm9ybWFsIG1vZGUgd2hlbiA8ZXNjYXBlPiBpcyBwcmVzc2VkIG9uIHNlbGVjdGlvbiBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgZW5zdXJlIG51bGwsIHNlbGVjdGVkVGV4dDogJ3QnXG4gICAgICBlbnN1cmUgJ2ggaCcsXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJ2UgdCdcbiAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogdHJ1ZVxuICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJtb3Rpb25zXCIsIC0+XG4gICAgICBpdCBcInRyYW5zZm9ybXMgdGhlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3cnLCBzZWxlY3RlZFRleHQ6ICd0d28gdCdcblxuICAgICAgaXQgXCJhbHdheXMgbGVhdmVzIHRoZSBpbml0aWFsbHkgc2VsZWN0ZWQgY2hhcmFjdGVyIHNlbGVjdGVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnaCcsIHNlbGVjdGVkVGV4dDogJyB0J1xuICAgICAgICBlbnN1cmUgJ2wnLCBzZWxlY3RlZFRleHQ6ICd0J1xuICAgICAgICBlbnN1cmUgJ2wnLCBzZWxlY3RlZFRleHQ6ICd0dydcblxuICAgIGRlc2NyaWJlIFwib3BlcmF0b3JzXCIsIC0+XG4gICAgICBpdCBcIm9wZXJhdGUgb24gdGhlIGN1cnJlbnQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ1YgZCcsIHRleHQ6IFwiXFxuYWJjZGVmXCJcblxuICAgIGRlc2NyaWJlIFwicmV0dXJuaW5nIHRvIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICBpdCBcIm9wZXJhdGUgb24gdGhlIGN1cnJlbnQgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiXG4gICAgICAgIGVuc3VyZSAnViBlc2NhcGUnLCBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcInRoZSBvIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwicmV2ZXJzZWQgZWFjaCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0IGFkZEN1cnNvcjogWzAsIDEyXVxuICAgICAgICBlbnN1cmUgJ2kgdycsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCJ0d29cIiwgXCJ0aHJlZVwiXVxuICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgIGVuc3VyZSAnbycsXG4gICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogdHJ1ZVxuXG4gICAgICB4aXQgXCJoYXJtb25pemVzIHNlbGVjdGlvbiBkaXJlY3Rpb25zXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2UgZSdcbiAgICAgICAgc2V0IGFkZEN1cnNvcjogWzAsIEluZmluaXR5XVxuICAgICAgICBlbnN1cmUgJ2ggaCcsXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZTogW1xuICAgICAgICAgICAgW1swLCAwXSwgWzAsIDVdXSxcbiAgICAgICAgICAgIFtbMCwgMTFdLCBbMCwgMTNdXVxuICAgICAgICAgIF1cbiAgICAgICAgICBjdXJzb3I6IFtcbiAgICAgICAgICAgIFswLCA1XVxuICAgICAgICAgICAgWzAsIDExXVxuICAgICAgICAgIF1cblxuICAgICAgICBlbnN1cmUgJ28nLFxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMF0sIFswLCA1XV0sXG4gICAgICAgICAgICBbWzAsIDExXSwgWzAsIDEzXV1cbiAgICAgICAgICBdXG4gICAgICAgICAgY3Vyc29yOiBbXG4gICAgICAgICAgICBbMCwgNV1cbiAgICAgICAgICAgIFswLCAxM11cbiAgICAgICAgICBdXG5cbiAgICBkZXNjcmliZSBcImFjdGl2YXRlIHZpc3VhbG1vZGUgd2l0aGluIHZpc3VhbG1vZGVcIiwgLT5cbiAgICAgIGN1cnNvclBvc2l0aW9uID0gbnVsbFxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IFswLCA0XVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGxpbmUgb25lXG4gICAgICAgICAgICBsaW5lIHR3b1xuICAgICAgICAgICAgbGluZSB0aHJlZVxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBjdXJzb3JQb3NpdGlvblxuXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcblxuICAgICAgZGVzY3JpYmUgXCJyZXN0b3JlIGNoYXJhY3Rlcndpc2UgZnJvbSBsaW5ld2lzZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlICcyIGogVicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBsaW5lIG9uZVxuICAgICAgICAgICAgICBsaW5lIHR3b1xuICAgICAgICAgICAgICBsaW5lIHRocmVlXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgICAgc2VsZWN0aW9uSXNSZXZlcnNlZDogZmFsc2VcbiAgICAgICAgICBlbnN1cmUgJ28nLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgbGluZSBvbmVcbiAgICAgICAgICAgICAgbGluZSB0d29cbiAgICAgICAgICAgICAgbGluZSB0aHJlZVxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICAgIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IHRydWVcblxuICAgICAgICBpdCBcInYgYWZ0ZXIgb1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndicsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiIG9uZVxcbmxpbmUgdHdvXFxubGluZSBcIlxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgICBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICAgIGl0IFwiZXNjYXBlIGFmdGVyIG9cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgZGVzY3JpYmUgXCJhY3RpdmF0ZVZpc3VhbE1vZGUgd2l0aCBzYW1lIHR5cGUgcHV0cyB0aGUgZWRpdG9yIGludG8gbm9ybWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJjaGFyYWN0ZXJ3aXNlOiB2dlwiLCAtPlxuICAgICAgICAgIGl0IFwiYWN0aXZhdGluZyB0d2ljZSBtYWtlIGVkaXRvciByZXR1cm4gdG8gbm9ybWFsIG1vZGUgXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICAgIGVuc3VyZSAndicsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IGN1cnNvclBvc2l0aW9uXG5cbiAgICAgICAgZGVzY3JpYmUgXCJsaW5ld2lzZTogVlZcIiwgLT5cbiAgICAgICAgICBpdCBcImFjdGl2YXRpbmcgdHdpY2UgbWFrZSBlZGl0b3IgcmV0dXJuIHRvIG5vcm1hbCBtb2RlIFwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICdWJywgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgICAgZW5zdXJlICdWJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogY3Vyc29yUG9zaXRpb25cblxuICAgICAgICBkZXNjcmliZSBcImJsb2Nrd2lzZTogY3RybC12IHR3aWNlXCIsIC0+XG4gICAgICAgICAgaXQgXCJhY3RpdmF0aW5nIHR3aWNlIG1ha2UgZWRpdG9yIHJldHVybiB0byBub3JtYWwgbW9kZSBcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnY3RybC12JywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICAgIGVuc3VyZSAnY3RybC12JywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogY3Vyc29yUG9zaXRpb25cblxuICAgICAgZGVzY3JpYmUgXCJjaGFuZ2Ugc3VibW9kZSB3aXRoaW4gdmlzdWFsbW9kZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImxpbmUgb25lXFxubGluZSB0d29cXG5saW5lIHRocmVlXFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogW1swLCA1XSwgWzIsIDVdXVxuXG4gICAgICAgIGl0IFwiY2FuIGNoYW5nZSBzdWJtb2RlIHdpdGhpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndicgICAgICAgICwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgZW5zdXJlICdWJyAgICAgICAgLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXYnLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIGVuc3VyZSAndicgICAgICAgICwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICAgICAgaXQgXCJyZWNvdmVyIG9yaWdpbmFsIHJhbmdlIHdoZW4gc2hpZnQgZnJvbSBsaW5ld2lzZSB0byBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IGkgdycsIHNlbGVjdGVkVGV4dDogWydvbmUnLCAndGhyZWUnXVxuICAgICAgICAgIGVuc3VyZSAnVicsIHNlbGVjdGVkVGV4dDogW1wibGluZSBvbmVcXG5cIiwgXCJsaW5lIHRocmVlXFxuXCJdXG4gICAgICAgICAgZW5zdXJlICd2Jywgc2VsZWN0ZWRUZXh0OiBbXCJvbmVcIiwgXCJ0aHJlZVwiXVxuXG4gICAgICBkZXNjcmliZSBcImtlZXAgZ29hbENvbHVtIHdoZW4gc3VibW9kZSBjaGFuZ2UgaW4gdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgdGV4dCA9IG51bGxcbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgICAgMF8zNDU2Nzg5MEFCQ0RFRlxuICAgICAgICAgIDFfMzQ1Njc4OTBcbiAgICAgICAgICAyXzM0NTY3XG4gICAgICAgICAgM18zNDU2Nzg5MEFcbiAgICAgICAgICA0XzM0NTY3ODkwQUJDREVGXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGl0IFwia2VlcCBnb2FsQ29sdW1uIHdoZW4gc2hpZnQgbGluZXdpc2UgdG8gY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnVicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMF0pLCBwcm9wZXJ0eUhlYWQ6IFswLCAwXSwgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuICAgICAgICAgIGVuc3VyZSAnJCcsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMF0pLCBwcm9wZXJ0eUhlYWQ6IFswLCAxNl0sIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAsIDFdKSwgcHJvcGVydHlIZWFkOiBbMSwgMTBdLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4yXSksIHByb3BlcnR5SGVhZDogWzIsIDddLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddXG4gICAgICAgICAgZW5zdXJlICd2Jywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4yXSksIHByb3BlcnR5SGVhZDogWzIsIDddLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjNdKSwgcHJvcGVydHlIZWFkOiBbMywgMTFdLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBjdXJzb3I6IFszLCAxMF0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbNCwgMTVdLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJkZWFjdGl2YXRpbmcgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGxpbmUgb25lXG4gICAgICAgICAgICBsaW5lIHR3b1xuICAgICAgICAgICAgbGluZSB0aHJlZVxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgN11cbiAgICAgIGl0IFwiY2FuIHB1dCBjdXJzb3IgYXQgaW4gdmlzdWFsIGNoYXIgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzAsIDhdXG4gICAgICBpdCBcImFkanVzdCBjdXJzb3IgcG9zaXRpb24gMSBjb2x1bW4gbGVmdCB3aGVuIGRlYWN0aXZhdGVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMCwgN11cbiAgICAgIGl0IFwiY2FuIHNlbGVjdCBuZXcgbGluZSBpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YnLCBjdXJzb3I6IFswLCA4XSwgcHJvcGVydHlIZWFkOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMSwgMF0sIHByb3BlcnR5SGVhZDogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzAsIDddXG5cbiAgICBkZXNjcmliZSBcImRlYWN0aXZhdGluZyB2aXN1YWwgbW9kZSBvbiBibGFuayBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwOiBhYmNcblxuICAgICAgICAgICAgMjogYWJjXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgaXQgXCJ2IGNhc2UtMVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcInYgY2FzZS0yIHNlbGVjdGlvbiBoZWFkIGlzIGJsYW5rIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAndiBqJywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFsyLCAwXSwgc2VsZWN0ZWRUZXh0OiBcIjogYWJjXFxuXFxuXCJcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGl0IFwiViBjYXNlLTFcIiwgLT5cbiAgICAgICAgZW5zdXJlICdWJywgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXSwgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgIGl0IFwiViBjYXNlLTIgc2VsZWN0aW9uIGhlYWQgaXMgYmxhbmsgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZW5zdXJlICdWIGonLCBtb2RlOiBbJ3Zpc3VhbCcsICdsaW5ld2lzZSddLCBjdXJzb3I6IFsyLCAwXSwgc2VsZWN0ZWRUZXh0OiBcIjA6IGFiY1xcblxcblwiXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcImN0cmwtdlwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtdicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddLCBzZWxlY3RlZEJ1ZmZlclJhbmdlOiBbWzEsIDBdLCBbMSwgMF1dXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcImN0cmwtdiBhbmQgbW92ZSBvdmVyIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLXYnLCBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXSwgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtbMSwgMF0sIFsxLCAwXV1cbiAgICAgICAgZW5zdXJlICdrJywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ10sIHNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiBbW1swLCAwXSwgWzAsIDFdXSwgW1sxLCAwXSwgWzEsIDBdXV1cbiAgICAgICAgZW5zdXJlICdqJywgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ10sIHNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiBbWzEsIDBdLCBbMSwgMF1dXG4gICAgICAgIGVuc3VyZSAnaicsIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddLCBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1tbMSwgMF0sIFsxLCAwXV0sIFtbMiwgMF0sIFsyLCAxXV1dXG5cbiAgZGVzY3JpYmUgXCJtYXJrc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT4gc2V0IHRleHQ6IFwidGV4dCBpbiBsaW5lIDFcXG50ZXh0IGluIGxpbmUgMlxcbnRleHQgaW4gbGluZSAzXCJcblxuICAgIGl0IFwiYmFzaWMgbWFya2luZyBmdW5jdGlvbmFsaXR5XCIsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmVXYWl0ICdtIHQnXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBlbnN1cmUgJ2AgdCcsIGN1cnNvcjogWzEsIDFdXG5cbiAgICBpdCBcInJlYWwgKHRyYWNraW5nKSBtYXJraW5nIGZ1bmN0aW9uYWxpdHlcIiwgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGVuc3VyZVdhaXQgJ20gcSdcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAnbyBlc2NhcGUgYCBxJywgY3Vyc29yOiBbMywgMl1cblxuICAgIGl0IFwicmVhbCAodHJhY2tpbmcpIG1hcmtpbmcgZnVuY3Rpb25hbGl0eVwiLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZW5zdXJlV2FpdCAnbSBxJ1xuICAgICAgcnVucyAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICdkIGQgZXNjYXBlIGAgcScsIGN1cnNvcjogWzEsIDJdXG5cbiAgZGVzY3JpYmUgXCJpcy1uYXJyb3dlZCBhdHRyaWJ1dGVcIiwgLT5cbiAgICBlbnN1cmVOb3JtYWxNb2RlU3RhdGUgPSAtPlxuICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJydcbiAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogZmFsc2VcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIDE6LS0tLS1cbiAgICAgICAgMjotLS0tLVxuICAgICAgICAzOi0tLS0tXG4gICAgICAgIDQ6LS0tLS1cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcIm5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICBpdCBcImlzIG5vdCBuYXJyb3dlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICBtb2RlOiBbJ25vcm1hbCddXG4gICAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogZmFsc2VcbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgIGl0IFwiW3NpbmdsZSByb3ddIGlzIG5hcnJvd2VkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiAkJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcxOi0tLS0tXFxuJ1xuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICAgIHNlbGVjdGlvbklzTmFycm93ZWQ6IGZhbHNlXG4gICAgICAgIGVuc3VyZU5vcm1hbE1vZGVTdGF0ZSgpXG4gICAgICBpdCBcIlttdWx0aS1yb3ddIGlzIG5hcnJvd2VkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBqJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDE6LS0tLS1cbiAgICAgICAgICAyXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogdHJ1ZVxuICAgICAgICBlbnN1cmVOb3JtYWxNb2RlU3RhdGUoKVxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUubGluZXdpc2VcIiwgLT5cbiAgICAgIGl0IFwiW3NpbmdsZSByb3ddIGlzIG5hcnJvd2VkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnVicsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjE6LS0tLS1cXG5cIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiBmYWxzZVxuICAgICAgICBlbnN1cmVOb3JtYWxNb2RlU3RhdGUoKVxuICAgICAgaXQgXCJbbXVsdGktcm93XSBpcyBuYXJyb3dlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1YgaicsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICAxOi0tLS0tXG4gICAgICAgICAgMjotLS0tLVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiB0cnVlXG4gICAgICAgIGVuc3VyZU5vcm1hbE1vZGVTdGF0ZSgpXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5ibG9ja3dpc2VcIiwgLT5cbiAgICAgIGl0IFwiW3NpbmdsZSByb3ddIGlzIG5hcnJvd2VkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC12IGwnLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIxOlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3Rpb25Jc05hcnJvd2VkOiBmYWxzZVxuICAgICAgICBlbnN1cmVOb3JtYWxNb2RlU3RhdGUoKVxuICAgICAgaXQgXCJbbXVsdGktcm93XSBpcyBuYXJyb3dlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtdiBsIGonLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiMTpcIiwgXCIyOlwiXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0aW9uSXNOYXJyb3dlZDogdHJ1ZVxuICAgICAgICBlbnN1cmVOb3JtYWxNb2RlU3RhdGUoKVxuIl19
