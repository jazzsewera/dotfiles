(function() {
  var dispatch, getVimState, inspect, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  inspect = require('util').inspect;

  describe("Operator ActivateInsertMode family", function() {
    var bindEnsureOption, editor, editorElement, ensure, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], bindEnsureOption = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, bindEnsureOption = vim.bindEnsureOption, vim;
      });
    });
    describe("the s keybinding", function() {
      beforeEach(function() {
        return set({
          text: '012345',
          cursor: [0, 1]
        });
      });
      it("deletes the character to the right and enters insert mode", function() {
        return ensure('s', {
          mode: 'insert',
          text: '02345',
          cursor: [0, 1],
          register: {
            '"': {
              text: '1'
            }
          }
        });
      });
      it("is repeatable", function() {
        set({
          cursor: [0, 0]
        });
        ensure('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        set({
          cursor: [0, 2]
        });
        return ensure('.', {
          text: 'abab'
        });
      });
      it("is undoable", function() {
        set({
          cursor: [0, 0]
        });
        ensure('3 s');
        editor.insertText('ab');
        ensure('escape', {
          text: 'ab345'
        });
        return ensure('u', {
          text: '012345',
          selectedText: ''
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return ensure('v l s');
        });
        return it("deletes the selected characters and enters insert mode", function() {
          return ensure(null, {
            mode: 'insert',
            text: '0345',
            cursor: [0, 1],
            register: {
              '"': {
                text: '12'
              }
            }
          });
        });
      });
    });
    describe("the S keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE",
          cursor: [1, 3]
        });
      });
      it("deletes the entire line and enters insert mode", function() {
        return ensure('S', {
          mode: 'insert',
          text: "12345\n\nABCDE",
          register: {
            '"': {
              text: 'abcde\n',
              type: 'linewise'
            }
          }
        });
      });
      it("is repeatable", function() {
        ensure('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        set({
          cursor: [2, 3]
        });
        return ensure('.', {
          text: '12345\nabc\nabc'
        });
      });
      it("is undoable", function() {
        ensure('S');
        editor.insertText('abc');
        ensure('escape', {
          text: '12345\nabc\nABCDE'
        });
        return ensure('u', {
          text: "12345\nabcde\nABCDE",
          selectedText: ''
        });
      });
      it("works when the cursor's goal column is greater than its current column", function() {
        set({
          text: "\n12345",
          cursor: [1, 2e308]
        });
        return ensure('k S', {
          text: '\n12345'
        });
      });
      return xit("respects indentation", function() {});
    });
    describe("the c keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("when followed by a c", function() {
        describe("with autoindent", function() {
          beforeEach(function() {
            set({
              text: "12345\n  abcde\nABCDE\n"
            });
            set({
              cursor: [1, 1]
            });
            spyOn(editor, 'shouldAutoIndent').andReturn(true);
            spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
              return editor.indent();
            });
            return spyOn(editor.languageMode, 'suggestedIndentForLineAtBufferRow').andCallFake(function() {
              return 1;
            });
          });
          it("deletes the current line and enters insert mode", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('c c', {
              text: "12345\n  \nABCDE\n",
              cursor: [1, 2],
              mode: 'insert'
            });
          });
          it("is repeatable", function() {
            ensure('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            set({
              cursor: [2, 3]
            });
            return ensure('.', {
              text: "12345\n  abc\n  abc\n"
            });
          });
          return it("is undoable", function() {
            ensure('c c');
            editor.insertText("abc");
            ensure('escape', {
              text: "12345\n  abc\nABCDE\n"
            });
            return ensure('u', {
              text: "12345\n  abcde\nABCDE\n",
              selectedText: ''
            });
          });
        });
        describe("when the cursor is on the last line", function() {
          return it("deletes the line's content and enters insert mode on the last line", function() {
            set({
              cursor: [2, 1]
            });
            return ensure('c c', {
              text: "12345\nabcde\n",
              cursor: [2, 0],
              mode: 'insert'
            });
          });
        });
        return describe("when the cursor is on the only line", function() {
          return it("deletes the line's content and enters insert mode", function() {
            set({
              text: "12345",
              cursor: [0, 2]
            });
            return ensure('c c', {
              text: "",
              cursor: [0, 0],
              mode: 'insert'
            });
          });
        });
      });
      describe("when followed by i w", function() {
        it("undo's and redo's completely", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          set({
            text: "12345\nfg\nABCDE"
          });
          ensure('escape', {
            text: "12345\nfg\nABCDE",
            mode: 'normal'
          });
          ensure('u', {
            text: "12345\nabcde\nABCDE"
          });
          return ensure('ctrl-r', {
            text: "12345\nfg\nABCDE"
          });
        });
        return it("repeatable", function() {
          set({
            cursor: [1, 1]
          });
          ensure('c i w', {
            text: "12345\n\nABCDE",
            cursor: [1, 0],
            mode: 'insert'
          });
          return ensure('escape j .', {
            text: "12345\n\n",
            cursor: [2, 0],
            mode: 'normal'
          });
        });
      });
      describe("when followed by a w", function() {
        return it("changes the word", function() {
          set({
            text: "word1 word2 word3",
            cursor: [0, 7]
          });
          return ensure('c w escape', {
            text: "word1 w word3"
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE\n";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c G escape', {
              text: '12345\n\n'
            });
          });
        });
      });
      return describe("when followed by a goto line G", function() {
        beforeEach(function() {
          return set({
            text: "12345\nabcde\nABCDE"
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes all the text on the line", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('c 2 G escape', {
              text: '12345\n\nABCDE'
            });
          });
        });
      });
    });
    describe("the C keybinding", function() {
      beforeEach(function() {
        return set({
          cursor: [1, 2],
          text: "0!!!!!!\n1!!!!!!\n2!!!!!!\n3!!!!!!\n"
        });
      });
      describe("in normal-mode", function() {
        return it("deletes till the EOL then enter insert-mode", function() {
          return ensure('C', {
            cursor: [1, 2],
            mode: 'insert',
            text: "0!!!!!!\n1!\n2!!!!!!\n3!!!!!!\n"
          });
        });
      });
      return describe("in visual-mode.characterwise", function() {
        return it("delete whole lines and enter insert-mode", function() {
          return ensure('v j C', {
            cursor: [1, 0],
            mode: 'insert',
            text: "0!!!!!!\n\n3!!!!!!\n"
          });
        });
      });
    });
    describe("dontUpdateRegisterOnChangeOrSubstitute settings", function() {
      var resultTextC;
      resultTextC = null;
      beforeEach(function() {
        set({
          register: {
            '"': {
              text: 'initial-value'
            }
          },
          textC: "0abc\n1|def\n2ghi\n"
        });
        return resultTextC = {
          cl: "0abc\n1|ef\n2ghi\n",
          C: "0abc\n1|\n2ghi\n",
          s: "0abc\n1|ef\n2ghi\n",
          S: "0abc\n|\n2ghi\n"
        };
      });
      describe("when dontUpdateRegisterOnChangeOrSubstitute=false", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert'
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", false);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C,
            register: {
              '"': {
                text: 'def'
              }
            }
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s,
            register: {
              '"': {
                text: 'd'
              }
            }
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S,
            register: {
              '"': {
                text: '1def\n'
              }
            }
          });
        });
      });
      return describe("when dontUpdateRegisterOnChangeOrSubstitute=true", function() {
        var ensure_;
        ensure_ = null;
        beforeEach(function() {
          ensure_ = bindEnsureOption({
            mode: 'insert',
            register: {
              '"': {
                text: 'initial-value'
              }
            }
          });
          return settings.set("dontUpdateRegisterOnChangeOrSubstitute", true);
        });
        it('c mutate register', function() {
          return ensure_('c l', {
            textC: resultTextC.cl
          });
        });
        it('C mutate register', function() {
          return ensure_('C', {
            textC: resultTextC.C
          });
        });
        it('s mutate register', function() {
          return ensure_('s', {
            textC: resultTextC.s
          });
        });
        return it('S mutate register', function() {
          return ensure_('S', {
            textC: resultTextC.S
          });
        });
      });
    });
    describe("the O keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          textC_: "__abc\n_|_012\n"
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        ensure('O');
        return ensure(null, {
          textC_: "__abc\n__|\n__012\n",
          mode: 'insert'
        });
      });
      it("is repeatable", function() {
        set({
          textC_: "__abc\n__|012\n____4spaces\n"
        });
        ensure('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__de|f\n__012\n____4spaces\n"
        });
        ensure('.', {
          textC_: "__abc\n__de|f\n__def\n__012\n____4spaces\n"
        });
        set({
          cursor: [4, 0]
        });
        return ensure('.', {
          textC_: "__abc\n__def\n__def\n__012\n____de|f\n____4spaces\n"
        });
      });
      return it("is undoable", function() {
        ensure('O');
        editor.insertText("def");
        ensure('escape', {
          textC_: "__abc\n__def\n__012\n"
        });
        return ensure('u', {
          textC_: "__abc\n__012\n"
        });
      });
    });
    describe("the o keybinding", function() {
      beforeEach(function() {
        spyOn(editor, 'shouldAutoIndent').andReturn(true);
        spyOn(editor, 'autoIndentBufferRow').andCallFake(function(line) {
          return editor.indent();
        });
        return set({
          text: "abc\n  012\n",
          cursor: [1, 2]
        });
      });
      it("switches to insert and adds a newline above the current one", function() {
        return ensure('o', {
          text: "abc\n  012\n  \n",
          mode: 'insert',
          cursor: [2, 2]
        });
      });
      xit("is repeatable", function() {
        set({
          text: "  abc\n  012\n    4spaces\n",
          cursor: [1, 1]
        });
        ensure('o');
        editor.insertText("def");
        ensure('escape', {
          text: "  abc\n  012\n  def\n    4spaces\n"
        });
        ensure('.', {
          text: "  abc\n  012\n  def\n  def\n    4spaces\n"
        });
        set({
          cursor: [4, 1]
        });
        return ensure('.', {
          text: "  abc\n  def\n  def\n  012\n    4spaces\n    def\n"
        });
      });
      return it("is undoable", function() {
        ensure('o');
        editor.insertText("def");
        ensure('escape', {
          text: "abc\n  012\n  def\n"
        });
        return ensure('u', {
          text: "abc\n  012\n"
        });
      });
    });
    describe("undo/redo for `o` and `O`", function() {
      beforeEach(function() {
        return set({
          textC: "----|=="
        });
      });
      it("undo and redo by keeping cursor at o started position", function() {
        ensure('o', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "----==\n@|@"
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "----|==\n@@"
        });
      });
      return it("undo and redo by keeping cursor at O started position", function() {
        ensure('O', {
          mode: 'insert'
        });
        editor.insertText('@@');
        ensure("escape", {
          textC: "@|@\n----=="
        });
        ensure("u", {
          textC: "----|=="
        });
        return ensure("ctrl-r", {
          textC: "@@\n----|=="
        });
      });
    });
    describe("the a keybinding", function() {
      beforeEach(function() {
        return set({
          text: "012\n"
        });
      });
      describe("at the beginning of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 0]
          });
          return ensure('a');
        });
        return it("switches to insert mode and shifts to the right", function() {
          return ensure(null, {
            cursor: [0, 1],
            mode: 'insert'
          });
        });
      });
      return describe("at the end of the line", function() {
        beforeEach(function() {
          set({
            cursor: [0, 3]
          });
          return ensure('a');
        });
        return it("doesn't linewrap", function() {
          return ensure(null, {
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the A keybinding", function() {
      beforeEach(function() {
        return set({
          text: "11\n22\n"
        });
      });
      return describe("at the beginning of a line", function() {
        it("switches to insert mode at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('A', {
            mode: 'insert',
            cursor: [0, 2]
          });
        });
        return it("repeats always as insert at the end of the line", function() {
          set({
            cursor: [0, 0]
          });
          ensure('A');
          editor.insertText("abc");
          ensure('escape');
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            text: "11abc\n22abc\n",
            mode: 'normal',
            cursor: [1, 4]
          });
        });
      });
    });
    describe("the I keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
        });
      });
      describe("in normal-mode", function() {
        describe("I", function() {
          return it("insert at first char of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('I', {
              cursor: [0, 2],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 0]
            });
            ensure('I', {
              cursor: [1, 0],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line", function() {
            set({
              cursor: [0, 5]
            });
            ensure('A', {
              cursor: [0, 13],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 5]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            ensure("escape", {
              mode: 'normal'
            });
            set({
              cursor: [1, 11]
            });
            ensure('A', {
              cursor: [1, 11],
              mode: 'insert'
            });
            return ensure("escape", {
              mode: 'normal'
            });
          });
        });
      });
      describe("visual-mode.linewise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 3]
          });
          return ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
        });
        describe("I", function() {
          return it("insert at first char of line *of each selected line*", function() {
            return ensure("I", {
              cursor: [[1, 0], [2, 2], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A", function() {
          return it("insert at end of line *of each selected line*", function() {
            return ensure("A", {
              cursor: [[1, 11], [2, 13], [3, 15]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.blockwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
        });
        describe("I", function() {
          it("insert at column of start of selection for *each selection*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
          return it("can repeat after insert AFTER clearing multiple cursor", function() {
            ensure("escape", {
              mode: 'normal'
            });
            set({
              textC: "|line0\nline1\nline2"
            });
            ensure("ctrl-v j I", {
              textC: "|line0\n|line1\nline2",
              mode: 'insert'
            });
            editor.insertText("ABC");
            ensure("escape", {
              textC: "AB|Cline0\nAB!Cline1\nline2",
              mode: 'normal'
            });
            ensure("escape k", {
              textC: "AB!Cline0\nABCline1\nline2",
              mode: 'normal'
            });
            return ensure("l .", {
              textC: "ABCAB|Cline0\nABCAB!Cline1\nline2",
              mode: 'normal'
            });
          });
        });
        return describe("A", function() {
          return it("insert at column of end of selection for *each selection*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      describe("visual-mode.characterwise", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4]
          });
          return ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
        });
        describe("I is short hand of `ctrl-v I`", function() {
          return it("insert at colum of start of selection for *each selected lines*", function() {
            return ensure("I", {
              cursor: [[1, 4], [2, 4], [3, 4]],
              mode: "insert"
            });
          });
        });
        return describe("A is short hand of `ctrl-v A`", function() {
          return it("insert at column of end of selection for *each selected lines*", function() {
            return ensure("A", {
              cursor: [[1, 5], [2, 5], [3, 5]],
              mode: "insert"
            });
          });
        });
      });
      return describe("when occurrence marker interselcts I and A no longer behave blockwise in vC/vL", function() {
        beforeEach(function() {
          jasmine.attachToDOM(editorElement);
          set({
            cursor: [1, 3]
          });
          return ensure('g o', {
            occurrenceText: ['3456', '3456', '3456', '3456'],
            cursor: [1, 3]
          });
        });
        describe("vC", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("v j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: !3456 890\n__2: |3456 890\n____3: 3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("v j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456! 890\n__2: 3456| 890\n____3: 3456 890"
              });
            });
          });
        });
        return describe("vL", function() {
          return describe("I and A NOT behave as `ctrl-v I`", function() {
            it("I insert at start of each vsually selected occurrence", function() {
              return ensure("V j j I", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: |3456 890\n _2: |3456 890\n____3: !3456 890"
              });
            });
            return it("A insert at end of each vsually selected occurrence", function() {
              return ensure("V j j A", {
                mode: 'insert',
                textC_: "__0: 3456 890\n1: 3456| 890\n__2: 3456| 890\n____3: 3456! 890"
              });
            });
          });
        });
      });
    });
    describe("the gI keybinding", function() {
      beforeEach(function() {
        return set({
          text: "__this is text"
        });
      });
      describe("in normal-mode.", function() {
        return it("start at insert at column 0 regardless of current column", function() {
          set({
            cursor: [0, 5]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 0]
          });
          ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
          ensure("escape", {
            mode: 'normal'
          });
          set({
            cursor: [0, 13]
          });
          return ensure("g I", {
            cursor: [0, 0],
            mode: 'insert'
          });
        });
      });
      return describe("in visual-mode", function() {
        beforeEach(function() {
          return set({
            text_: "__0: 3456 890\n1: 3456 890\n__2: 3456 890\n____3: 3456 890"
          });
        });
        it("[characterwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("v 2 j", {
            selectedText: "456 890\n  2: 3456 890\n    3",
            mode: ['visual', 'characterwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        it("[linewise]", function() {
          set({
            cursor: [1, 3]
          });
          ensure("V 2 j", {
            selectedText: "1: 3456 890\n  2: 3456 890\n    3: 3456 890",
            mode: ['visual', 'linewise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
        return it("[blockwise]", function() {
          set({
            cursor: [1, 4]
          });
          ensure("ctrl-v 2 j", {
            selectedText: ["4", " ", "3"],
            mode: ['visual', 'blockwise']
          });
          return ensure("g I", {
            cursor: [[1, 0], [2, 0], [3, 0]],
            mode: "insert"
          });
        });
      });
    });
    describe("InsertAtPreviousFoldStart and Next", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'g [': 'vim-mode-plus:insert-at-previous-fold-start',
              'g ]': 'vim-mode-plus:insert-at-next-fold-start'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("when cursor is not at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [16, 0]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [9, 2],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
      });
      return describe("when cursor is at fold start row", function() {
        beforeEach(function() {
          return set({
            cursor: [20, 6]
          });
        });
        it("insert at previous fold start row", function() {
          return ensure('g [', {
            cursor: [18, 4],
            mode: 'insert'
          });
        });
        return it("insert at next fold start row", function() {
          return ensure('g ]', {
            cursor: [22, 6],
            mode: 'insert'
          });
        });
      });
    });
    describe("the i keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|123\n|4567"
        });
      });
      it("allows undoing an entire batch of typing", function() {
        ensure('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        ensure('i');
        editor.insertText("d");
        editor.insertText("e");
        editor.insertText("f");
        ensure('escape', {
          text: "abdefc123\nabdefc4567"
        });
        ensure('u', {
          text: "abc123\nabc4567"
        });
        return ensure('u', {
          text: "123\n4567"
        });
      });
      it("allows repeating typing", function() {
        ensure('i');
        editor.insertText("abcXX");
        editor.backspace();
        editor.backspace();
        ensure('escape', {
          text: "abc123\nabc4567"
        });
        ensure('.', {
          text: "ababcc123\nababcc4567"
        });
        return ensure('.', {
          text: "abababccc123\nabababccc4567"
        });
      });
      return describe('with nonlinear input', function() {
        beforeEach(function() {
          return set({
            text: '',
            cursor: [0, 0]
          });
        });
        it('deals with auto-matched brackets', function() {
          ensure('i');
          editor.insertText('()');
          editor.moveLeft();
          editor.insertText('a');
          editor.moveRight();
          editor.insertText('b\n');
          ensure('escape', {
            cursor: [1, 0]
          });
          return ensure('.', {
            text: '(a)b\n(a)b\n',
            cursor: [2, 0]
          });
        });
        return it('deals with autocomplete', function() {
          ensure('i');
          editor.insertText('a');
          editor.insertText('d');
          editor.insertText('d');
          editor.setTextInBufferRange([[0, 0], [0, 3]], 'addFoo');
          ensure('escape', {
            cursor: [0, 5],
            text: 'addFoo'
          });
          return ensure('.', {
            text: 'addFoaddFooo',
            cursor: [0, 10]
          });
        });
      });
    });
    describe('the a keybinding', function() {
      beforeEach(function() {
        return set({
          text: '',
          cursor: [0, 0]
        });
      });
      it("can be undone in one go", function() {
        ensure('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc"
        });
        return ensure('u', {
          text: ""
        });
      });
      return it("repeats correctly", function() {
        ensure('a');
        editor.insertText("abc");
        ensure('escape', {
          text: "abc",
          cursor: [0, 2]
        });
        return ensure('.', {
          text: "abcabc",
          cursor: [0, 5]
        });
      });
    });
    describe('preserve inserted text', function() {
      var ensureDotRegister;
      ensureDotRegister = function(key, arg) {
        var text;
        text = arg.text;
        ensure(key, {
          mode: 'insert'
        });
        editor.insertText(text);
        return ensure("escape", {
          register: {
            '.': {
              text: text
            }
          }
        });
      };
      beforeEach(function() {
        return set({
          text: "\n\n",
          cursor: [0, 0]
        });
      });
      it("[case-i]", function() {
        return ensureDotRegister('i', {
          text: 'iabc'
        });
      });
      it("[case-o]", function() {
        return ensureDotRegister('o', {
          text: 'oabc'
        });
      });
      it("[case-c]", function() {
        return ensureDotRegister('c l', {
          text: 'cabc'
        });
      });
      it("[case-C]", function() {
        return ensureDotRegister('C', {
          text: 'Cabc'
        });
      });
      return it("[case-s]", function() {
        return ensureDotRegister('s', {
          text: 'sabc'
        });
      });
    });
    describe("repeat backspace/delete happened in insert-mode", function() {
      describe("single cursor operation", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "123\n123"
          });
        });
        it("can repeat backspace only mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          ensure('i');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('j .', {
            text: "23\n123"
          });
          return ensure('l .', {
            text: "23\n23"
          });
        });
        it("can repeat backspace only mutation: case-a", function() {
          ensure('a');
          editor.backspace();
          ensure('escape', {
            text: "23\n123",
            cursor: [0, 0]
          });
          ensure('.', {
            text: "3\n123",
            cursor: [0, 0]
          });
          return ensure('j . .', {
            text: "3\n3"
          });
        });
        it("can repeat delete only mutation: case-i", function() {
          ensure('i');
          editor["delete"]();
          ensure('escape', {
            text: "23\n123"
          });
          return ensure('j .', {
            text: "23\n23"
          });
        });
        it("can repeat delete only mutation: case-a", function() {
          ensure('a');
          editor["delete"]();
          ensure('escape', {
            text: "13\n123"
          });
          return ensure('j .', {
            text: "13\n13"
          });
        });
        it("can repeat backspace and insert mutation: case-i", function() {
          set({
            cursor: [0, 1]
          });
          ensure('i');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          set({
            cursor: [1, 1]
          });
          return ensure('.', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat backspace and insert mutation: case-a", function() {
          ensure('a');
          editor.backspace();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        it("can repeat delete and insert mutation: case-i", function() {
          ensure('i');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "!!!23\n123"
          });
          return ensure('j 0 .', {
            text: "!!!23\n!!!23"
          });
        });
        return it("can repeat delete and insert mutation: case-a", function() {
          ensure('a');
          editor["delete"]();
          editor.insertText("!!!");
          ensure('escape', {
            text: "1!!!3\n123"
          });
          return ensure('j 0 .', {
            text: "1!!!3\n1!!!3"
          });
        });
      });
      return describe("multi-cursors operation", function() {
        beforeEach(function() {
          return set({
            textC: "|123\n\n|1234\n\n|12345"
          });
        });
        it("can repeat backspace only mutation: case-multi-cursors", function() {
          ensure('A', {
            cursor: [[0, 3], [2, 4], [4, 5]],
            mode: 'insert'
          });
          editor.backspace();
          ensure('escape', {
            text: "12\n\n123\n\n1234",
            cursor: [[0, 1], [2, 2], [4, 3]]
          });
          return ensure('.', {
            text: "1\n\n12\n\n123",
            cursor: [[0, 0], [2, 1], [4, 2]]
          });
        });
        return it("can repeat delete only mutation: case-multi-cursors", function() {
          var cursors;
          ensure('I', {
            mode: 'insert'
          });
          editor["delete"]();
          cursors = [[0, 0], [2, 0], [4, 0]];
          ensure('escape', {
            text: "23\n\n234\n\n2345",
            cursor: cursors
          });
          ensure('.', {
            text: "3\n\n34\n\n345",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n4\n\n45",
            cursor: cursors
          });
          ensure('.', {
            text: "\n\n\n\n5",
            cursor: cursors
          });
          return ensure('.', {
            text: "\n\n\n\n",
            cursor: cursors
          });
        });
      });
    });
    return describe('specify insertion count', function() {
      var ensureInsertionCount;
      ensureInsertionCount = function(key, arg) {
        var cursor, insert, text;
        insert = arg.insert, text = arg.text, cursor = arg.cursor;
        ensure(key);
        editor.insertText(insert);
        return ensure("escape", {
          text: text,
          cursor: cursor
        });
      };
      beforeEach(function() {
        var initialText;
        initialText = "*\n*\n";
        set({
          text: "",
          cursor: [0, 0]
        });
        ensure('i');
        editor.insertText(initialText);
        return ensure("escape g g", {
          text: initialText,
          cursor: [0, 0]
        });
      });
      describe("repeat insertion count times", function() {
        it("[case-i]", function() {
          return ensureInsertionCount('3 i', {
            insert: '=',
            text: "===*\n*\n",
            cursor: [0, 2]
          });
        });
        it("[case-o]", function() {
          return ensureInsertionCount('3 o', {
            insert: '=',
            text: "*\n=\n=\n=\n*\n",
            cursor: [3, 0]
          });
        });
        it("[case-O]", function() {
          return ensureInsertionCount('3 O', {
            insert: '=',
            text: "=\n=\n=\n*\n*\n",
            cursor: [2, 0]
          });
        });
        return describe("children of Change operation won't repeate insertion count times", function() {
          beforeEach(function() {
            set({
              text: "",
              cursor: [0, 0]
            });
            ensure('i');
            editor.insertText('*');
            return ensure('escape g g', {
              text: '*',
              cursor: [0, 0]
            });
          });
          it("[case-c]", function() {
            return ensureInsertionCount('3 c w', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-C]", function() {
            return ensureInsertionCount('3 C', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          it("[case-s]", function() {
            return ensureInsertionCount('3 s', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
          return it("[case-S]", function() {
            return ensureInsertionCount('3 S', {
              insert: '=',
              text: "=",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("throttoling intertion count to 100 at maximum", function() {
        return it("insert 100 times at maximum even if big count was given", function() {
          set({
            text: ''
          });
          expect(editor.getLastBufferRow()).toBe(0);
          ensure('5 5 5 5 5 5 5 i', {
            mode: 'insert'
          });
          editor.insertText("a\n");
          ensure('escape', {
            mode: 'normal'
          });
          return expect(editor.getLastBufferRow()).toBe(101);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItYWN0aXZhdGUtaW5zZXJ0LW1vZGUtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsNkJBQUQsRUFBYzs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUNWLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBRVosUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUE7QUFDN0MsUUFBQTtJQUFBLE9BQW1FLEVBQW5FLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsMEJBQWQsRUFBZ0MsZ0JBQWhDLEVBQXdDLHVCQUF4QyxFQUF1RDtJQUV2RCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHVDQUFkLEVBQWtDO01BSHhCLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQUk7VUFBQSxJQUFBLEVBQU0sUUFBTjtVQUFnQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUF4QjtTQUFKO01BRFMsQ0FBWDtNQUdBLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBO2VBQzlELE1BQUEsQ0FBTyxHQUFQLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtVQUNBLElBQUEsRUFBTSxPQUROO1VBRUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FGUjtVQUdBLFFBQUEsRUFBVTtZQUFBLEdBQUEsRUFBSztjQUFBLElBQUEsRUFBTSxHQUFOO2FBQUw7V0FIVjtT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bkI7Y0FBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7YUFBNUI7VUFBSCxDQUFmO2lCQUNBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQTttQkFBRyxvQkFBQSxDQUFxQixLQUFyQixFQUE0QjtjQUFBLE1BQUEsRUFBUSxHQUFSO2NBQWEsSUFBQSxFQUFNLEdBQW5CO2NBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhDO2FBQTVCO1VBQUgsQ0FBZjtRQVYyRSxDQUE3RTtNQUx1QyxDQUF6QzthQWlCQSxRQUFBLENBQVMsK0NBQVQsRUFBMEQsU0FBQTtlQUN4RCxFQUFBLENBQUcseURBQUgsRUFBOEQsU0FBQTtVQUM1RCxHQUFBLENBQUk7WUFBQSxJQUFBLEVBQU0sRUFBTjtXQUFKO1VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQVAsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxDQUF2QztVQUNBLE1BQUEsQ0FBTyxpQkFBUCxFQUEwQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQTFCO1VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWpCO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkM7UUFONEQsQ0FBOUQ7TUFEd0QsQ0FBMUQ7SUE5QmtDLENBQXBDO0VBbjZCNkMsQ0FBL0M7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2h9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xue2luc3BlY3R9ID0gcmVxdWlyZSAndXRpbCdcblxuZGVzY3JpYmUgXCJPcGVyYXRvciBBY3RpdmF0ZUluc2VydE1vZGUgZmFtaWx5XCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgYmluZEVuc3VyZU9wdGlvbiwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgYmluZEVuc3VyZU9wdGlvbn0gPSB2aW1cblxuICBkZXNjcmliZSBcInRoZSBzIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogJzAxMjM0NScsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGNoYXJhY3RlciB0byB0aGUgcmlnaHQgYW5kIGVudGVycyBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdzJyxcbiAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgdGV4dDogJzAyMzQ1J1xuICAgICAgICBjdXJzb3I6IFswLCAxXVxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG5cbiAgICBpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICczIHMnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYWInXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICdhYjM0NSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogJ2FiYWInXG5cbiAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnMyBzJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2FiJ1xuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiAnYWIzNDUnXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiAnMDEyMzQ1Jywgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmUgJ3YgbCBzJ1xuXG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIHNlbGVjdGVkIGNoYXJhY3RlcnMgYW5kIGVudGVycyBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIHRleHQ6ICcwMzQ1J1xuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxMidcblxuICBkZXNjcmliZSBcInRoZSBTIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuICAgICAgICBjdXJzb3I6IFsxLCAzXVxuXG4gICAgaXQgXCJkZWxldGVzIHRoZSBlbnRpcmUgbGluZSBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1MnLFxuICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuXFxuQUJDREVcIlxuICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhYmNkZVxcbicsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICBpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnUydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhYmMnXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICcxMjM0NVxcbmFiY1xcbkFCQ0RFJ1xuICAgICAgc2V0IGN1cnNvcjogWzIsIDNdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiAnMTIzNDVcXG5hYmNcXG5hYmMnXG5cbiAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1MnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYWJjJ1xuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiAnMTIzNDVcXG5hYmNcXG5BQkNERSdcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCIsIHNlbGVjdGVkVGV4dDogJydcblxuICAgICMgSGVyZSBpcyBvcmlnaW5hbCBzcGVjIEkgYmVsaWV2ZSBpdHMgbm90IGNvcnJlY3QsIGlmIGl0IHNheXMgJ3dvcmtzJ1xuICAgICMgdGV4dCByZXN1bHQgc2hvdWxkIGJlICdcXG4nIHNpbmNlIFMgZGVsZXRlIGN1cnJlbnQgbGluZS5cbiAgICAjIEl0cyBvcmlnbmFsbHkgYWRkZWQgaW4gZm9sbG93aW5nIGNvbW1pdCwgYXMgZml4IG9mIFMoZnJvbSBkZXNjcmlwdGlvbikuXG4gICAgIyBCdXQgb3JpZ2luYWwgU3Vic3RpdHV0ZUxpbmUgcmVwbGFjZWQgd2l0aCBDaGFuZ2UgYW5kIE1vdmVUb1JlbGF0aXZlTGluZSBjb21iby5cbiAgICAjIEkgYmVsaWV2ZSB0aGlzIHNwZWMgc2hvdWxkIGhhdmUgYmVlbiBmYWlsZWQgYXQgdGhhdCB0aW1lLCBidXQgaGF2ZW50Jy5cbiAgICAjIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3ZpbS1tb2RlL2NvbW1pdC82YWNmZmQyNTU5ZTU2ZjdjMThhNGQ3NjZmMGFkOTJjOWVkNjIxMmFlXG4gICAgI1xuICAgICMgaXQgXCJ3b3JrcyB3aGVuIHRoZSBjdXJzb3IncyBnb2FsIGNvbHVtbiBpcyBncmVhdGVyIHRoYW4gaXRzIGN1cnJlbnQgY29sdW1uXCIsIC0+XG4gICAgIyAgIHNldCB0ZXh0OiBcIlxcbjEyMzQ1XCIsIGN1cnNvcjogWzEsIEluZmluaXR5XVxuICAgICMgICBlbnN1cmUgJ2tTJywgdGV4dDogJ1xcbjEyMzQ1J1xuXG4gICAgaXQgXCJ3b3JrcyB3aGVuIHRoZSBjdXJzb3IncyBnb2FsIGNvbHVtbiBpcyBncmVhdGVyIHRoYW4gaXRzIGN1cnJlbnQgY29sdW1uXCIsIC0+XG4gICAgICBzZXQgdGV4dDogXCJcXG4xMjM0NVwiLCBjdXJzb3I6IFsxLCBJbmZpbml0eV1cbiAgICAgICMgU2hvdWxkIGJlIGhlcmUsIGJ1dCBJIGNvbW1lbnRlZCBvdXQgYmVmb3JlIEkgaGF2ZSBjb25maWRlbmNlLlxuICAgICAgIyBlbnN1cmUgJ2tTJywgdGV4dDogJ1xcbidcbiAgICAgICMgRm9sb3dpbmcgbGluZSBpbmNsdWRlIEJ1ZyBpYmVsaWV2ZS5cbiAgICAgIGVuc3VyZSAnayBTJywgdGV4dDogJ1xcbjEyMzQ1J1xuICAgICMgQ2FuJ3QgYmUgdGVzdGVkIHdpdGhvdXQgc2V0dGluZyBncmFtbWFyIG9mIHRlc3QgYnVmZmVyXG4gICAgeGl0IFwicmVzcGVjdHMgaW5kZW50YXRpb25cIiwgLT5cblxuICBkZXNjcmliZSBcInRoZSBjIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgY1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGF1dG9pbmRlbnRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNkZVxcbkFCQ0RFXFxuXCJcbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBzcHlPbihlZGl0b3IsICdzaG91bGRBdXRvSW5kZW50JykuYW5kUmV0dXJuKHRydWUpXG4gICAgICAgICAgc3B5T24oZWRpdG9yLCAnYXV0b0luZGVudEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIChsaW5lKSAtPlxuICAgICAgICAgICAgZWRpdG9yLmluZGVudCgpXG4gICAgICAgICAgc3B5T24oZWRpdG9yLmxhbmd1YWdlTW9kZSwgJ3N1Z2dlc3RlZEluZGVudEZvckxpbmVBdEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIC0+IDFcblxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZSBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgZW5zdXJlICdjIGMnLFxuICAgICAgICAgICAgdGV4dDogXCIxMjM0NVxcbiAgXFxuQUJDREVcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgaXQgXCJpcyByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjIGMnXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhYmNcIilcbiAgICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMTIzNDVcXG4gIGFiY1xcbkFCQ0RFXFxuXCJcbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgM11cbiAgICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNcXG4gIGFiY1xcblwiXG5cbiAgICAgICAgaXQgXCJpcyB1bmRvYWJsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnYyBjJ1xuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEyMzQ1XFxuICBhYmNcXG5BQkNERVxcblwiXG4gICAgICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjM0NVxcbiAgYWJjZGVcXG5BQkNERVxcblwiLCBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY3Vyc29yIGlzIG9uIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBsaW5lJ3MgY29udGVudCBhbmQgZW50ZXJzIGluc2VydCBtb2RlIG9uIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgICBlbnN1cmUgJ2MgYycsXG4gICAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY3Vyc29yIGlzIG9uIHRoZSBvbmx5IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBsaW5lJ3MgY29udGVudCBhbmQgZW50ZXJzIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDVcIiwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2MgYycsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBpIHdcIiwgLT5cbiAgICAgIGl0IFwidW5kbydzIGFuZCByZWRvJ3MgY29tcGxldGVseVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdjIGkgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcblxcbkFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgIyBKdXN0IGNhbm5vdCBnZXQgXCJ0eXBpbmdcIiB0byB3b3JrIGNvcnJlY3RseSBpbiB0ZXN0LlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NVxcbmZnXFxuQUJDREVcIlxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmZnXFxuQUJDREVcIlxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLXInLCB0ZXh0OiBcIjEyMzQ1XFxuZmdcXG5BQkNERVwiXG5cbiAgICAgIGl0IFwicmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdjIGkgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcblxcbkFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgZW5zdXJlICdlc2NhcGUgaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuXFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSB3XCIsIC0+XG4gICAgICBpdCBcImNoYW5nZXMgdGhlIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwid29yZDEgd29yZDIgd29yZDNcIiwgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICdjIHcgZXNjYXBlJywgdGV4dDogXCJ3b3JkMSB3IHdvcmQzXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcXG5cIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIEcgZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuXFxuJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBtaWRkbGUgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnYyBHIGVzY2FwZScsIHRleHQ6ICcxMjM0NVxcblxcbidcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGdvdG8gbGluZSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIGFsbCB0aGUgdGV4dCBvbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyAyIEcgZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuXFxuQUJDREUnXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIGFsbCB0aGUgdGV4dCBvbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnYyAyIEcgZXNjYXBlJywgdGV4dDogJzEyMzQ1XFxuXFxuQUJDREUnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgQyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAwISEhISEhXG4gICAgICAgIDEhISEhISFcbiAgICAgICAgMiEhISEhIVxuICAgICAgICAzISEhISEhXFxuXG4gICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aWxsIHRoZSBFT0wgdGhlbiBlbnRlciBpbnNlcnQtbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0MnLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAhISEhISFcbiAgICAgICAgICAgIDEhXG4gICAgICAgICAgICAyISEhISEhXG4gICAgICAgICAgICAzISEhISEhXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsLW1vZGUuY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgaXQgXCJkZWxldGUgd2hvbGUgbGluZXMgYW5kIGVudGVyIGluc2VydC1tb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiBqIEMnLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAhISEhISFcblxuICAgICAgICAgICAgMyEhISEhIVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZSBzZXR0aW5nc1wiLCAtPlxuICAgIHJlc3VsdFRleHRDID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2luaXRpYWwtdmFsdWUnXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgMGFiY1xuICAgICAgICAxfGRlZlxuICAgICAgICAyZ2hpXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgcmVzdWx0VGV4dEMgPVxuICAgICAgICBjbDogXCJcIlwiXG4gICAgICAgICAgMGFiY1xuICAgICAgICAgIDF8ZWZcbiAgICAgICAgICAyZ2hpXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIEM6IFwiXCJcIlxuICAgICAgICAgIDBhYmNcbiAgICAgICAgICAxfFxuICAgICAgICAgIDJnaGlcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgczogXCJcIlwiXG4gICAgICAgICAgMGFiY1xuICAgICAgICAgIDF8ZWZcbiAgICAgICAgICAyZ2hpXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIFM6IFwiXCJcIlxuICAgICAgICAgIDBhYmNcbiAgICAgICAgICB8XG4gICAgICAgICAgMmdoaVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwid2hlbiBkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZT1mYWxzZVwiLCAtPlxuICAgICAgZW5zdXJlXyA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlXyA9IGJpbmRFbnN1cmVPcHRpb24obW9kZTogJ2luc2VydCcpXG4gICAgICAgIHNldHRpbmdzLnNldChcImRvbnRVcGRhdGVSZWdpc3Rlck9uQ2hhbmdlT3JTdWJzdGl0dXRlXCIsIGZhbHNlKVxuICAgICAgaXQgJ2MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnYyBsJywgdGV4dEM6IHJlc3VsdFRleHRDLmNsLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdkJ31cbiAgICAgIGl0ICdDIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ0MnLCB0ZXh0QzogcmVzdWx0VGV4dEMuQywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnZGVmJ31cbiAgICAgIGl0ICdzIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ3MnLCB0ZXh0QzogcmVzdWx0VGV4dEMucywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnZCd9XG4gICAgICBpdCAnUyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdTJywgdGV4dEM6IHJlc3VsdFRleHRDLlMsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJzFkZWZcXG4nfVxuICAgIGRlc2NyaWJlIFwid2hlbiBkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZT10cnVlXCIsIC0+XG4gICAgICBlbnN1cmVfID0gbnVsbFxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlbnN1cmVfID0gYmluZEVuc3VyZU9wdGlvbihtb2RlOiAnaW5zZXJ0JywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnaW5pdGlhbC12YWx1ZSd9KVxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJkb250VXBkYXRlUmVnaXN0ZXJPbkNoYW5nZU9yU3Vic3RpdHV0ZVwiLCB0cnVlKVxuICAgICAgaXQgJ2MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnYyBsJywgdGV4dEM6IHJlc3VsdFRleHRDLmNsXG4gICAgICBpdCAnQyBtdXRhdGUgcmVnaXN0ZXInLCAtPiBlbnN1cmVfICdDJywgdGV4dEM6IHJlc3VsdFRleHRDLkNcbiAgICAgIGl0ICdzIG11dGF0ZSByZWdpc3RlcicsIC0+IGVuc3VyZV8gJ3MnLCB0ZXh0QzogcmVzdWx0VGV4dEMuc1xuICAgICAgaXQgJ1MgbXV0YXRlIHJlZ2lzdGVyJywgLT4gZW5zdXJlXyAnUycsIHRleHRDOiByZXN1bHRUZXh0Qy5TXG5cbiAgZGVzY3JpYmUgXCJ0aGUgTyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oZWRpdG9yLCAnc2hvdWxkQXV0b0luZGVudCcpLmFuZFJldHVybih0cnVlKVxuICAgICAgc3B5T24oZWRpdG9yLCAnYXV0b0luZGVudEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIChsaW5lKSAtPlxuICAgICAgICBlZGl0b3IuaW5kZW50KClcblxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF98XzAxMlxcblxuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwic3dpdGNoZXMgdG8gaW5zZXJ0IGFuZCBhZGRzIGEgbmV3bGluZSBhYm92ZSB0aGUgY3VycmVudCBvbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnTydcbiAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FiY1xuICAgICAgICBfX3xcbiAgICAgICAgX18wMTJcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBpdCBcImlzIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fYWJjXG4gICAgICAgICAgX198MDEyXG4gICAgICAgICAgX19fXzRzcGFjZXNcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICMgc2V0XG4gICAgICAjICAgdGV4dDogXCIgIGFiY1xcbiAgMDEyXFxuICAgIDRzcGFjZXNcXG5cIiwgY3Vyc29yOiBbMSwgMV1cbiAgICAgIGVuc3VyZSAnTydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZGVmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX2FiY1xuICAgICAgICAgIF9fZGV8ZlxuICAgICAgICAgIF9fMDEyXG4gICAgICAgICAgX19fXzRzcGFjZXNcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF9fZGV8ZlxuICAgICAgICBfX2RlZlxuICAgICAgICBfXzAxMlxuICAgICAgICBfX19fNHNwYWNlc1xcblxuICAgICAgICBcIlwiXCJcbiAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX19kZWZcbiAgICAgICAgX19kZWZcbiAgICAgICAgX18wMTJcbiAgICAgICAgX19fX2RlfGZcbiAgICAgICAgX19fXzRzcGFjZXNcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcImlzIHVuZG9hYmxlXCIsIC0+XG4gICAgICBlbnN1cmUgJ08nXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImRlZlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYWJjXG4gICAgICAgIF9fZGVmXG4gICAgICAgIF9fMDEyXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX18wMTJcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgbyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oZWRpdG9yLCAnc2hvdWxkQXV0b0luZGVudCcpLmFuZFJldHVybih0cnVlKVxuICAgICAgc3B5T24oZWRpdG9yLCAnYXV0b0luZGVudEJ1ZmZlclJvdycpLmFuZENhbGxGYWtlIChsaW5lKSAtPlxuICAgICAgICBlZGl0b3IuaW5kZW50KClcblxuICAgICAgc2V0IHRleHQ6IFwiYWJjXFxuICAwMTJcXG5cIiwgY3Vyc29yOiBbMSwgMl1cblxuICAgIGl0IFwic3dpdGNoZXMgdG8gaW5zZXJ0IGFuZCBhZGRzIGEgbmV3bGluZSBhYm92ZSB0aGUgY3VycmVudCBvbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnbycsXG4gICAgICAgIHRleHQ6IFwiYWJjXFxuICAwMTJcXG4gIFxcblwiXG4gICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgIGN1cnNvcjogWzIsIDJdXG5cbiAgICAjIFRoaXMgd29ya3MgaW4gcHJhY3RpY2UsIGJ1dCB0aGUgZWRpdG9yIGRvZXNuJ3QgcmVzcGVjdCB0aGUgaW5kZW50YXRpb25cbiAgICAjIHJ1bGVzIHdpdGhvdXQgYSBzeW50YXggZ3JhbW1hci4gTmVlZCB0byBzZXQgdGhlIGVkaXRvcidzIGdyYW1tYXJcbiAgICAjIHRvIGZpeCBpdC5cbiAgICB4aXQgXCJpcyByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBzZXQgdGV4dDogXCIgIGFiY1xcbiAgMDEyXFxuICAgIDRzcGFjZXNcXG5cIiwgY3Vyc29yOiBbMSwgMV1cbiAgICAgIGVuc3VyZSAnbydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZGVmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIgIGFiY1xcbiAgMDEyXFxuICBkZWZcXG4gICAgNHNwYWNlc1xcblwiXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIiAgYWJjXFxuICAwMTJcXG4gIGRlZlxcbiAgZGVmXFxuICAgIDRzcGFjZXNcXG5cIlxuICAgICAgc2V0IGN1cnNvcjogWzQsIDFdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIiAgYWJjXFxuICBkZWZcXG4gIGRlZlxcbiAgMDEyXFxuICAgIDRzcGFjZXNcXG4gICAgZGVmXFxuXCJcblxuICAgIGl0IFwiaXMgdW5kb2FibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnbydcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZGVmXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCJhYmNcXG4gIDAxMlxcbiAgZGVmXFxuXCJcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiYWJjXFxuICAwMTJcXG5cIlxuXG4gIGRlc2NyaWJlIFwidW5kby9yZWRvIGZvciBgb2AgYW5kIGBPYFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0QzogXCItLS0tfD09XCJcbiAgICBpdCBcInVuZG8gYW5kIHJlZG8gYnkga2VlcGluZyBjdXJzb3IgYXQgbyBzdGFydGVkIHBvc2l0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ28nLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgZWRpdG9yLmluc2VydFRleHQoJ0BAJylcbiAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCB0ZXh0QzogXCItLS0tPT1cXG5AfEBcIlxuICAgICAgZW5zdXJlIFwidVwiLCB0ZXh0QzogXCItLS0tfD09XCJcbiAgICAgIGVuc3VyZSBcImN0cmwtclwiLCB0ZXh0QzogXCItLS0tfD09XFxuQEBcIlxuICAgIGl0IFwidW5kbyBhbmQgcmVkbyBieSBrZWVwaW5nIGN1cnNvciBhdCBPIHN0YXJ0ZWQgcG9zaXRpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnTycsIG1vZGU6ICdpbnNlcnQnXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnQEAnKVxuICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHRDOiBcIkB8QFxcbi0tLS09PVwiXG4gICAgICBlbnN1cmUgXCJ1XCIsIHRleHRDOiBcIi0tLS18PT1cIlxuICAgICAgZW5zdXJlIFwiY3RybC1yXCIsIHRleHRDOiBcIkBAXFxuLS0tLXw9PVwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgYSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiMDEyXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdhJ1xuXG4gICAgICBpdCBcInN3aXRjaGVzIHRvIGluc2VydCBtb2RlIGFuZCBzaGlmdHMgdG8gdGhlIHJpZ2h0XCIsIC0+XG4gICAgICAgIGVuc3VyZSBudWxsLCBjdXJzb3I6IFswLCAxXSwgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwiYXQgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICdhJ1xuXG4gICAgICBpdCBcImRvZXNuJ3QgbGluZXdyYXBcIiwgLT5cbiAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogWzAsIDNdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgQSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiMTFcXG4yMlxcblwiXG5cbiAgICBkZXNjcmliZSBcImF0IHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBpdCBcInN3aXRjaGVzIHRvIGluc2VydCBtb2RlIGF0IHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnQScsXG4gICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBpdCBcInJlcGVhdHMgYWx3YXlzIGFzIGluc2VydCBhdCB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ0EnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJ1xuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHQ6IFwiMTFhYmNcXG4yMmFiY1xcblwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBjdXJzb3I6IFsxLCA0XVxuXG4gIGRlc2NyaWJlIFwidGhlIEkga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgMTogMzQ1NiA4OTBcbiAgICAgICAgX18yOiAzNDU2IDg5MFxuICAgICAgICBfX19fMzogMzQ1NiA4OTBcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIklcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgZmlyc3QgY2hhciBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDVdXG4gICAgICAgICAgZW5zdXJlICdJJywgY3Vyc29yOiBbMCwgMl0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICBlbnN1cmUgJ0knLCBjdXJzb3I6IFsxLCAwXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnSScsIGN1cnNvcjogWzEsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBkZXNjcmliZSBcIkFcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgZW5kIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgICBlbnN1cmUgJ0EnLCBjdXJzb3I6IFswLCAxM10sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNV1cbiAgICAgICAgICBlbnN1cmUgJ0EnLCBjdXJzb3I6IFsxLCAxMV0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMTFdXG4gICAgICAgICAgZW5zdXJlICdBJywgY3Vyc29yOiBbMSwgMTFdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5saW5ld2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlIFwiViAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDE6IDM0NTYgODkwXG4gICAgICAgICAgICAyOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAzOiAzNDU2IDg5MFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cblxuICAgICAgZGVzY3JpYmUgXCJJXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGZpcnN0IGNoYXIgb2YgbGluZSAqb2YgZWFjaCBzZWxlY3RlZCBsaW5lKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIklcIiwgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMl0sIFszLCA0XV0sIG1vZGU6IFwiaW5zZXJ0XCJcbiAgICAgIGRlc2NyaWJlIFwiQVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBlbmQgb2YgbGluZSAqb2YgZWFjaCBzZWxlY3RlZCBsaW5lKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIkFcIiwgY3Vyc29yOiBbWzEsIDExXSwgWzIsIDEzXSwgWzMsIDE1XV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUuYmxvY2t3aXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCI0XCIsIFwiIFwiLCBcIjNcIl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuXG4gICAgICBkZXNjcmliZSBcIklcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgYXQgY29sdW1uIG9mIHN0YXJ0IG9mIHNlbGVjdGlvbiBmb3IgKmVhY2ggc2VsZWN0aW9uKlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIklcIiwgY3Vyc29yOiBbWzEsIDRdLCBbMiwgNF0sIFszLCA0XV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgICAgICBpdCBcImNhbiByZXBlYXQgYWZ0ZXIgaW5zZXJ0IEFGVEVSIGNsZWFyaW5nIG11bHRpcGxlIGN1cnNvclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGxpbmUwXG4gICAgICAgICAgICBsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiY3RybC12IGogSVwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGxpbmUwXG4gICAgICAgICAgICB8bGluZTFcbiAgICAgICAgICAgIGxpbmUyXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG5cbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIkFCQ1wiKVxuXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBBQnxDbGluZTBcbiAgICAgICAgICAgIEFCIUNsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICAgICMgRklYTUUgc2hvdWxkIHB1dCBsYXN0LWN1cnNvciBwb3NpdGlvbiBhdCB0b3Agb2YgYmxvY2tTZWxlY3Rpb25cbiAgICAgICAgICAjICB0byByZW1vdmUgYGtgIG1vdGlvblxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZSBrXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBBQiFDbGluZTBcbiAgICAgICAgICAgIEFCQ2xpbmUxXG4gICAgICAgICAgICBsaW5lMlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgICAgIyBUaGlzIHNob3VsZCBzdWNjZXNzXG4gICAgICAgICAgZW5zdXJlIFwibCAuXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBBQkNBQnxDbGluZTBcbiAgICAgICAgICAgIEFCQ0FCIUNsaW5lMVxuICAgICAgICAgICAgbGluZTJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgZGVzY3JpYmUgXCJBXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGNvbHVtbiBvZiBlbmQgb2Ygc2VsZWN0aW9uIGZvciAqZWFjaCBzZWxlY3Rpb24qXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiQVwiLCBjdXJzb3I6IFtbMSwgNV0sIFsyLCA1XSwgWzMsIDVdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5jaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgXCJ2IDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlwiXG4gICAgICAgICAgNDU2IDg5MFxuICAgICAgICAgICAgMjogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgM1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgICBkZXNjcmliZSBcIkkgaXMgc2hvcnQgaGFuZCBvZiBgY3RybC12IElgXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGF0IGNvbHVtIG9mIHN0YXJ0IG9mIHNlbGVjdGlvbiBmb3IgKmVhY2ggc2VsZWN0ZWQgbGluZXMqXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiSVwiLCBjdXJzb3I6IFtbMSwgNF0sIFsyLCA0XSwgWzMsIDRdXSwgbW9kZTogXCJpbnNlcnRcIlxuICAgICAgZGVzY3JpYmUgXCJBIGlzIHNob3J0IGhhbmQgb2YgYGN0cmwtdiBBYFwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBhdCBjb2x1bW4gb2YgZW5kIG9mIHNlbGVjdGlvbiBmb3IgKmVhY2ggc2VsZWN0ZWQgbGluZXMqXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiQVwiLCBjdXJzb3I6IFtbMSwgNV0sIFsyLCA1XSwgWzMsIDVdXSwgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIG9jY3VycmVuY2UgbWFya2VyIGludGVyc2VsY3RzIEkgYW5kIEEgbm8gbG9uZ2VyIGJlaGF2ZSBibG9ja3dpc2UgaW4gdkMvdkxcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdnIG8nLCBvY2N1cnJlbmNlVGV4dDogWyczNDU2JywgJzM0NTYnLCAnMzQ1NicsICczNDU2J10sIGN1cnNvcjogWzEsIDNdXG4gICAgICBkZXNjcmliZSBcInZDXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwiSSBhbmQgQSBOT1QgYmVoYXZlIGFzIGBjdHJsLXYgSWBcIiwgLT5cbiAgICAgICAgICBpdCBcIkkgaW5zZXJ0IGF0IHN0YXJ0IG9mIGVhY2ggdnN1YWxseSBzZWxlY3RlZCBvY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJ2IGogaiBJXCIsXG4gICAgICAgICAgICAgIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgICAgX18wOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAgIDE6ICEzNDU2IDg5MFxuICAgICAgICAgICAgICAgIF9fMjogfDM0NTYgODkwXG4gICAgICAgICAgICAgICAgX19fXzM6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgaXQgXCJBIGluc2VydCBhdCBlbmQgb2YgZWFjaCB2c3VhbGx5IHNlbGVjdGVkIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcInYgaiBqIEFcIixcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgMTogMzQ1NiEgODkwXG4gICAgICAgICAgICAgICAgX18yOiAzNDU2fCA4OTBcbiAgICAgICAgICAgICAgICBfX19fMzogMzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwidkxcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJJIGFuZCBBIE5PVCBiZWhhdmUgYXMgYGN0cmwtdiBJYFwiLCAtPlxuICAgICAgICAgIGl0IFwiSSBpbnNlcnQgYXQgc3RhcnQgb2YgZWFjaCB2c3VhbGx5IHNlbGVjdGVkIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcIlYgaiBqIElcIixcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgMTogfDM0NTYgODkwXG4gICAgICAgICAgICAgICAgIF8yOiB8MzQ1NiA4OTBcbiAgICAgICAgICAgICAgICBfX19fMzogITM0NTYgODkwXG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgaXQgXCJBIGluc2VydCBhdCBlbmQgb2YgZWFjaCB2c3VhbGx5IHNlbGVjdGVkIG9jY3VycmVuY2VcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcIlYgaiBqIEFcIixcbiAgICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgICBfXzA6IDM0NTYgODkwXG4gICAgICAgICAgICAgICAgMTogMzQ1NnwgODkwXG4gICAgICAgICAgICAgICAgX18yOiAzNDU2fCA4OTBcbiAgICAgICAgICAgICAgICBfX19fMzogMzQ1NiEgODkwXG4gICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZ0kga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgX190aGlzIGlzIHRleHRcbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIG5vcm1hbC1tb2RlLlwiLCAtPlxuICAgICAgaXQgXCJzdGFydCBhdCBpbnNlcnQgYXQgY29sdW1uIDAgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGNvbHVtblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcblxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMTNdXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLCBjdXJzb3I6IFswLCAwXSwgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fMDogMzQ1NiA4OTBcbiAgICAgICAgICAxOiAzNDU2IDg5MFxuICAgICAgICAgIF9fMjogMzQ1NiA4OTBcbiAgICAgICAgICBfX19fMzogMzQ1NiA4OTBcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJbY2hhcmFjdGVyd2lzZV1cIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDRdXG4gICAgICAgIGVuc3VyZSBcInYgMiBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXCJcbiAgICAgICAgICA0NTYgODkwXG4gICAgICAgICAgICAyOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAzXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIGVuc3VyZSBcImcgSVwiLFxuICAgICAgICAgIGN1cnNvcjogW1sxLCAwXSwgWzIsIDBdLCBbMywgMF1dLCBtb2RlOiBcImluc2VydFwiXG5cbiAgICAgIGl0IFwiW2xpbmV3aXNlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlIFwiViAyIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcIlxuICAgICAgICAgIDE6IDM0NTYgODkwXG4gICAgICAgICAgICAyOiAzNDU2IDg5MFxuICAgICAgICAgICAgICAzOiAzNDU2IDg5MFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2xpbmV3aXNlJ11cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMF0sIFszLCAwXV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgICAgaXQgXCJbYmxvY2t3aXNlXVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgZW5zdXJlIFwiY3RybC12IDIgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wiNFwiLCBcIiBcIiwgXCIzXCJdXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgZW5zdXJlIFwiZyBJXCIsXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMF0sIFszLCAwXV0sIG1vZGU6IFwiaW5zZXJ0XCJcblxuICBkZXNjcmliZSBcIkluc2VydEF0UHJldmlvdXNGb2xkU3RhcnQgYW5kIE5leHRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAoc3RhdGUsIHZpbSkgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmV9ID0gdmltXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAgICdnIFsnOiAndmltLW1vZGUtcGx1czppbnNlcnQtYXQtcHJldmlvdXMtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICdnIF0nOiAndmltLW1vZGUtcGx1czppbnNlcnQtYXQtbmV4dC1mb2xkLXN0YXJ0J1xuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0JylcblxuICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgbm90IGF0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxNiwgMF1cbiAgICAgIGl0IFwiaW5zZXJ0IGF0IHByZXZpb3VzIGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBbJywgY3Vyc29yOiBbOSwgMl0sIG1vZGU6ICdpbnNlcnQnXG4gICAgICBpdCBcImluc2VydCBhdCBuZXh0IGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBdJywgY3Vyc29yOiBbMTgsIDRdLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBhdCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgIyBOb3RoaW5nIHNwZWNpYWwgd2hlbiBjdXJzb3IgaXMgYXQgZm9sZCBzdGFydCByb3csXG4gICAgICAjIG9ubHkgZm9yIHRlc3Qgc2NlbmFyaW8gdGhyb3VnaG5lc3MuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyMCwgNl1cbiAgICAgIGl0IFwiaW5zZXJ0IGF0IHByZXZpb3VzIGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBbJywgY3Vyc29yOiBbMTgsIDRdLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgaXQgXCJpbnNlcnQgYXQgbmV4dCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgXScsIGN1cnNvcjogWzIyLCA2XSwgbW9kZTogJ2luc2VydCdcblxuICBkZXNjcmliZSBcInRoZSBpIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHwxMjNcbiAgICAgICAgICB8NDU2N1xuICAgICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJhbGxvd3MgdW5kb2luZyBhbiBlbnRpcmUgYmF0Y2ggb2YgdHlwaW5nXCIsIC0+XG4gICAgICBlbnN1cmUgJ2knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcImFiY1hYXCIpXG4gICAgICBlZGl0b3IuYmFja3NwYWNlKClcbiAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcImFiYzEyM1xcbmFiYzQ1NjdcIlxuXG4gICAgICBlbnN1cmUgJ2knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImRcIlxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJlXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJkZWZjMTIzXFxuYWJkZWZjNDU2N1wiXG4gICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcImFiYzEyM1xcbmFiYzQ1NjdcIlxuICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjNcXG40NTY3XCJcblxuICAgIGl0IFwiYWxsb3dzIHJlcGVhdGluZyB0eXBpbmdcIiwgLT5cbiAgICAgIGVuc3VyZSAnaSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjWFhcIilcbiAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJjMTIzXFxuYWJjNDU2N1wiXG4gICAgICBlbnN1cmUgJy4nLCAgICAgIHRleHQ6IFwiYWJhYmNjMTIzXFxuYWJhYmNjNDU2N1wiXG4gICAgICBlbnN1cmUgJy4nLCAgICAgIHRleHQ6IFwiYWJhYmFiY2NjMTIzXFxuYWJhYmFiY2NjNDU2N1wiXG5cbiAgICBkZXNjcmliZSAnd2l0aCBub25saW5lYXIgaW5wdXQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogJycsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0ICdkZWFscyB3aXRoIGF1dG8tbWF0Y2hlZCBicmFja2V0cycsIC0+XG4gICAgICAgIGVuc3VyZSAnaSdcbiAgICAgICAgIyB0aGlzIHNlcXVlbmNlIHNpbXVsYXRlcyB3aGF0IHRoZSBicmFja2V0LW1hdGNoZXIgcGFja2FnZSBkb2VzXG4gICAgICAgICMgd2hlbiB0aGUgdXNlciB0eXBlcyAoYSliPGVudGVyPlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnKCknXG4gICAgICAgIGVkaXRvci5tb3ZlTGVmdCgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdhJ1xuICAgICAgICBlZGl0b3IubW92ZVJpZ2h0KClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2JcXG4nXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgY3Vyc29yOiBbMSwgIDBdXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogJyhhKWJcXG4oYSliXFxuJ1xuICAgICAgICAgIGN1cnNvcjogWzIsICAwXVxuXG4gICAgICBpdCAnZGVhbHMgd2l0aCBhdXRvY29tcGxldGUnLCAtPlxuICAgICAgICBlbnN1cmUgJ2knXG4gICAgICAgICMgdGhpcyBzZXF1ZW5jZSBzaW11bGF0ZXMgYXV0b2NvbXBsZXRpb24gb2YgJ2FkZCcgdG8gJ2FkZEZvbydcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2EnXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdkJ1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnZCdcbiAgICAgICAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlIFtbMCwgMF0sIFswLCAzXV0sICdhZGRGb28nXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICBjdXJzb3I6IFswLCAgNV1cbiAgICAgICAgICB0ZXh0OiAnYWRkRm9vJ1xuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHQ6ICdhZGRGb2FkZEZvb28nXG4gICAgICAgICAgY3Vyc29yOiBbMCwgIDEwXVxuXG4gIGRlc2NyaWJlICd0aGUgYSBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJydcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiY2FuIGJlIHVuZG9uZSBpbiBvbmUgZ29cIiwgLT5cbiAgICAgIGVuc3VyZSAnYSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiYWJjXCJcbiAgICAgIGVuc3VyZSAndScsIHRleHQ6IFwiXCJcblxuICAgIGl0IFwicmVwZWF0cyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgIGVuc3VyZSAnYSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiYWJjXCIpXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgIHRleHQ6IFwiYWJjXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgIHRleHQ6IFwiYWJjYWJjXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgNV1cblxuICBkZXNjcmliZSAncHJlc2VydmUgaW5zZXJ0ZWQgdGV4dCcsIC0+XG4gICAgZW5zdXJlRG90UmVnaXN0ZXIgPSAoa2V5LCB7dGV4dH0pIC0+XG4gICAgICBlbnN1cmUga2V5LCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgZWRpdG9yLmluc2VydFRleHQodGV4dClcbiAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCByZWdpc3RlcjogJy4nOiB0ZXh0OiB0ZXh0XG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcXG5cXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJbY2FzZS1pXVwiLCAtPiBlbnN1cmVEb3RSZWdpc3RlciAnaScsIHRleHQ6ICdpYWJjJ1xuICAgIGl0IFwiW2Nhc2Utb11cIiwgLT4gZW5zdXJlRG90UmVnaXN0ZXIgJ28nLCB0ZXh0OiAnb2FiYydcbiAgICBpdCBcIltjYXNlLWNdXCIsIC0+IGVuc3VyZURvdFJlZ2lzdGVyICdjIGwnLCB0ZXh0OiAnY2FiYydcbiAgICBpdCBcIltjYXNlLUNdXCIsIC0+IGVuc3VyZURvdFJlZ2lzdGVyICdDJywgdGV4dDogJ0NhYmMnXG4gICAgaXQgXCJbY2FzZS1zXVwiLCAtPiBlbnN1cmVEb3RSZWdpc3RlciAncycsIHRleHQ6ICdzYWJjJ1xuXG4gIGRlc2NyaWJlIFwicmVwZWF0IGJhY2tzcGFjZS9kZWxldGUgaGFwcGVuZWQgaW4gaW5zZXJ0LW1vZGVcIiwgLT5cbiAgICBkZXNjcmliZSBcInNpbmdsZSBjdXJzb3Igb3BlcmF0aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzXG4gICAgICAgICAgMTIzXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBiYWNrc3BhY2Ugb25seSBtdXRhdGlvbjogY2FzZS1pXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ2knXG4gICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMjNcXG4xMjNcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiBcIjIzXFxuMTIzXCIgIyBub3RoaW5nIGhhcHBlblxuICAgICAgICBlbnN1cmUgJ2wgLicsIHRleHQ6IFwiMjNcXG4yM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBiYWNrc3BhY2Ugb25seSBtdXRhdGlvbjogY2FzZS1hXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnYSdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIyM1xcbjEyM1wiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjNcXG4xMjNcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdqIC4gLicsIHRleHQ6IFwiM1xcbjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgZGVsZXRlIG9ubHkgbXV0YXRpb246IGNhc2UtaVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2knXG4gICAgICAgIGVkaXRvci5kZWxldGUoKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiMjNcXG4xMjNcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6IFwiMjNcXG4yM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBkZWxldGUgb25seSBtdXRhdGlvbjogY2FzZS1hXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnYSdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxM1xcbjEyM1wiXG4gICAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogXCIxM1xcbjEzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGJhY2tzcGFjZSBhbmQgaW5zZXJ0IG11dGF0aW9uOiBjYXNlLWlcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnaSdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiISEhXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIhISEyM1xcbjEyM1wiXG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIiEhITIzXFxuISEhMjNcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgYmFja3NwYWNlIGFuZCBpbnNlcnQgbXV0YXRpb246IGNhc2UtYVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2EnXG4gICAgICAgIGVkaXRvci5iYWNrc3BhY2UoKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiEhIVwiKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6IFwiISEhMjNcXG4xMjNcIlxuICAgICAgICBlbnN1cmUgJ2ogMCAuJywgdGV4dDogXCIhISEyM1xcbiEhITIzXCJcblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGRlbGV0ZSBhbmQgaW5zZXJ0IG11dGF0aW9uOiBjYXNlLWlcIiwgLT5cbiAgICAgICAgZW5zdXJlICdpJ1xuICAgICAgICBlZGl0b3IuZGVsZXRlKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCIhISFcIilcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIiEhITIzXFxuMTIzXCJcbiAgICAgICAgZW5zdXJlICdqIDAgLicsIHRleHQ6IFwiISEhMjNcXG4hISEyM1wiXG5cbiAgICAgIGl0IFwiY2FuIHJlcGVhdCBkZWxldGUgYW5kIGluc2VydCBtdXRhdGlvbjogY2FzZS1hXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnYSdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiISEhXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxISEhM1xcbjEyM1wiXG4gICAgICAgIGVuc3VyZSAnaiAwIC4nLCB0ZXh0OiBcIjEhISEzXFxuMSEhITNcIlxuXG4gICAgZGVzY3JpYmUgXCJtdWx0aS1jdXJzb3JzIG9wZXJhdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfDEyM1xuXG4gICAgICAgICAgfDEyMzRcblxuICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImNhbiByZXBlYXQgYmFja3NwYWNlIG9ubHkgbXV0YXRpb246IGNhc2UtbXVsdGktY3Vyc29yc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ0EnLCBjdXJzb3I6IFtbMCwgM10sIFsyLCA0XSwgWzQsIDVdXSwgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmJhY2tzcGFjZSgpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxMlxcblxcbjEyM1xcblxcbjEyMzRcIiwgY3Vyc29yOiBbWzAsIDFdLCBbMiwgMl0sIFs0LCAzXV1cbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxXFxuXFxuMTJcXG5cXG4xMjNcIiwgY3Vyc29yOiBbWzAsIDBdLCBbMiwgMV0sIFs0LCAyXV1cblxuICAgICAgaXQgXCJjYW4gcmVwZWF0IGRlbGV0ZSBvbmx5IG11dGF0aW9uOiBjYXNlLW11bHRpLWN1cnNvcnNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdJJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmRlbGV0ZSgpXG4gICAgICAgIGN1cnNvcnMgPSBbWzAsIDBdLCBbMiwgMF0sIFs0LCAwXV1cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjIzXFxuXFxuMjM0XFxuXFxuMjM0NVwiLCBjdXJzb3I6IGN1cnNvcnNcbiAgICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIzXFxuXFxuMzRcXG5cXG4zNDVcIiwgY3Vyc29yOiBjdXJzb3JzXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiXFxuXFxuNFxcblxcbjQ1XCIsIGN1cnNvcjogY3Vyc29yc1xuICAgICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIlxcblxcblxcblxcbjVcIiwgY3Vyc29yOiBjdXJzb3JzXG4gICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiXFxuXFxuXFxuXFxuXCIsIGN1cnNvcjogY3Vyc29yc1xuXG4gIGRlc2NyaWJlICdzcGVjaWZ5IGluc2VydGlvbiBjb3VudCcsIC0+XG4gICAgZW5zdXJlSW5zZXJ0aW9uQ291bnQgPSAoa2V5LCB7aW5zZXJ0LCB0ZXh0LCBjdXJzb3J9KSAtPlxuICAgICAgZW5zdXJlIGtleVxuICAgICAgZWRpdG9yLmluc2VydFRleHQoaW5zZXJ0KVxuICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHQ6IHRleHQsIGN1cnNvcjogY3Vyc29yXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBpbml0aWFsVGV4dCA9IFwiKlxcbipcXG5cIlxuICAgICAgc2V0IHRleHQ6IFwiXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2knXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChpbml0aWFsVGV4dClcbiAgICAgIGVuc3VyZSBcImVzY2FwZSBnIGdcIiwgdGV4dDogaW5pdGlhbFRleHQsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInJlcGVhdCBpbnNlcnRpb24gY291bnQgdGltZXNcIiwgLT5cbiAgICAgIGl0IFwiW2Nhc2UtaV1cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgaScsIGluc2VydDogJz0nLCB0ZXh0OiBcIj09PSpcXG4qXFxuXCIsIGN1cnNvcjogWzAsIDJdXG4gICAgICBpdCBcIltjYXNlLW9dXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIG8nLCBpbnNlcnQ6ICc9JywgdGV4dDogXCIqXFxuPVxcbj1cXG49XFxuKlxcblwiLCBjdXJzb3I6IFszLCAwXVxuICAgICAgaXQgXCJbY2FzZS1PXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBPJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPVxcbj1cXG49XFxuKlxcbipcXG5cIiwgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJjaGlsZHJlbiBvZiBDaGFuZ2Ugb3BlcmF0aW9uIHdvbid0IHJlcGVhdGUgaW5zZXJ0aW9uIGNvdW50IHRpbWVzXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2knXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyonKVxuICAgICAgICAgIGVuc3VyZSAnZXNjYXBlIGcgZycsIHRleHQ6ICcqJywgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBpdCBcIltjYXNlLWNdXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIGMgdycsIGluc2VydDogJz0nLCB0ZXh0OiBcIj1cIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJbY2FzZS1DXVwiLCAtPiBlbnN1cmVJbnNlcnRpb25Db3VudCAnMyBDJywgaW5zZXJ0OiAnPScsIHRleHQ6IFwiPVwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBpdCBcIltjYXNlLXNdXCIsIC0+IGVuc3VyZUluc2VydGlvbkNvdW50ICczIHMnLCBpbnNlcnQ6ICc9JywgdGV4dDogXCI9XCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiW2Nhc2UtU11cIiwgLT4gZW5zdXJlSW5zZXJ0aW9uQ291bnQgJzMgUycsIGluc2VydDogJz0nLCB0ZXh0OiBcIj1cIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwidGhyb3R0b2xpbmcgaW50ZXJ0aW9uIGNvdW50IHRvIDEwMCBhdCBtYXhpbXVtXCIsIC0+XG4gICAgICBpdCBcImluc2VydCAxMDAgdGltZXMgYXQgbWF4aW11bSBldmVuIGlmIGJpZyBjb3VudCB3YXMgZ2l2ZW5cIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICcnXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKS50b0JlKDApXG4gICAgICAgIGVuc3VyZSAnNSA1IDUgNSA1IDUgNSBpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoXCJhXFxuXCIpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpLnRvQmUoMTAxKVxuIl19
