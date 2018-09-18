(function() {
  var TextData, dispatch, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Operator general", function() {
    var bindEnsureOption, bindEnsureWaitOption, editor, editorElement, ensure, ensureWait, ref1, ref2, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureWait = ref1[2], bindEnsureOption = ref1[3], bindEnsureWaitOption = ref1[4];
    ref2 = [], editor = ref2[0], editorElement = ref2[1], vimState = ref2[2];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait, bindEnsureOption = vim.bindEnsureOption, bindEnsureWaitOption = vim.bindEnsureWaitOption, vim;
      });
    });
    describe("cancelling operations", function() {
      return it("clear pending operation", function() {
        ensure('/');
        expect(vimState.operationStack.isEmpty()).toBe(false);
        vimState.searchInput.cancel();
        expect(vimState.operationStack.isEmpty()).toBe(true);
        return expect(function() {
          return vimState.searchInput.cancel();
        }).not.toThrow();
      });
    });
    describe("the x keybinding", function() {
      describe("on a line with content", function() {
        describe("without vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [1, 4]
            });
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters with a count", function() {
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            return ensure('3 x', {
              text: 'a\n0123\n\nxyz',
              cursor: [0, 0],
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [[1, 4], [0, 1]]
            });
          });
          return it("is undone as one operation", function() {
            ensure('x', {
              text: "ac\n01235\n\nxyz"
            });
            return ensure('u', {
              text: 'abc\n012345\n\nxyz'
            });
          });
        });
        return describe("with vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            set({
              text: 'abc\n012345\n\nxyz',
              cursor: [1, 4]
            });
            return settings.set('wrapLeftRightMotion', true);
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters and newlines with a count", function() {
            settings.set('wrapLeftRightMotion', true);
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            ensure('3 x', {
              text: 'a0123\n\nxyz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'bc\n'
                }
              }
            });
            return ensure('7 x', {
              text: 'ayz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: '0123\n\nx'
                }
              }
            });
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        it("deletes nothing on an empty line when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('x', {
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        return it("deletes an empty line when vim-mode-plus.wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('x', {
            text: "abc\n012345\nxyz",
            cursor: [2, 0]
          });
        });
      });
    });
    describe("the X keybinding", function() {
      describe("on a line with content", function() {
        beforeEach(function() {
          return set({
            text: "ab\n012345",
            cursor: [1, 2]
          });
        });
        return it("deletes a character", function() {
          ensure('X', {
            text: 'ab\n02345',
            cursor: [1, 1],
            register: {
              '"': {
                text: '1'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: 'ab2345',
            cursor: [0, 2],
            register: {
              '"': {
                text: '\n'
              }
            }
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        it("deletes nothing when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('X', {
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        return it("deletes the newline when wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: "012345\nabcdef",
            cursor: [0, 5]
          });
        });
      });
    });
    describe("the d keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\n\nABCDE\n",
          cursor: [1, 1]
        });
      });
      it("enters operator-pending mode", function() {
        return ensure('d', {
          mode: 'operator-pending'
        });
      });
      describe("when followed by a d", function() {
        it("deletes the current line and exits operator-pending mode", function() {
          set({
            cursor: [1, 1]
          });
          return ensure('d d', {
            text: "12345\n\nABCDE\n",
            cursor: [1, 0],
            register: {
              '"': {
                text: "abcde\n"
              }
            },
            mode: 'normal'
          });
        });
        it("deletes the last line and always make non-blank-line last line", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('2 d d', {
            text: "12345\nabcde\n",
            cursor: [1, 0]
          });
        });
        return it("leaves the cursor on the first nonblank character", function() {
          set({
            textC: "1234|5\n  abcde\n"
          });
          return ensure('d d', {
            textC: "  |abcde\n"
          });
        });
      });
      describe("undo behavior", function() {
        var initialTextC, originalText, ref3;
        ref3 = [], originalText = ref3[0], initialTextC = ref3[1];
        beforeEach(function() {
          initialTextC = "12345\na|bcde\nABCDE\nQWERT";
          set({
            textC: initialTextC
          });
          return originalText = editor.getText();
        });
        it("undoes both lines", function() {
          ensure('d 2 d', {
            textC: "12345\n|QWERT"
          });
          return ensure('u', {
            textC: initialTextC,
            selectedText: ""
          });
        });
        return describe("with multiple cursors", function() {
          describe("setCursorToStartOfChangeOnUndoRedo is true(default)", function() {
            it("clear multiple cursors and set cursor to start of changes of last cursor", function() {
              set({
                text: originalText,
                cursor: [[0, 0], [1, 1]]
              });
              ensure('d l', {
                textC: "|2345\na|cde\nABCDE\nQWERT"
              });
              ensure('u', {
                textC: "12345\na|bcde\nABCDE\nQWERT",
                selectedText: ''
              });
              return ensure('ctrl-r', {
                textC: "2345\na|cde\nABCDE\nQWERT",
                selectedText: ''
              });
            });
            return it("clear multiple cursors and set cursor to start of changes of last cursor", function() {
              set({
                text: originalText,
                cursor: [[1, 1], [0, 0]]
              });
              ensure('d l', {
                text: "2345\nacde\nABCDE\nQWERT",
                cursor: [[1, 1], [0, 0]]
              });
              ensure('u', {
                textC: "|12345\nabcde\nABCDE\nQWERT",
                selectedText: ''
              });
              return ensure('ctrl-r', {
                textC: "|2345\nacde\nABCDE\nQWERT",
                selectedText: ''
              });
            });
          });
          return describe("setCursorToStartOfChangeOnUndoRedo is false", function() {
            initialTextC = null;
            beforeEach(function() {
              initialTextC = "|12345\na|bcde\nABCDE\nQWERT";
              settings.set('setCursorToStartOfChangeOnUndoRedo', false);
              set({
                textC: initialTextC
              });
              return ensure('d l', {
                textC: "|2345\na|cde\nABCDE\nQWERT"
              });
            });
            return it("put cursor to end of change (works in same way of atom's core:undo)", function() {
              return ensure('u', {
                textC: initialTextC,
                selectedText: ['', '']
              });
            });
          });
        });
      });
      describe("when followed by a w", function() {
        it("deletes the next word until the end of the line and exits operator-pending mode", function() {
          set({
            text: 'abcd efg\nabc',
            cursor: [0, 5]
          });
          return ensure('d w', {
            text: "abcd \nabc",
            cursor: [0, 4],
            mode: 'normal'
          });
        });
        return it("deletes to the beginning of the next word", function() {
          set({
            text: 'abcd efg',
            cursor: [0, 2]
          });
          ensure('d w', {
            text: 'abefg',
            cursor: [0, 2]
          });
          set({
            text: 'one two three four',
            cursor: [0, 0]
          });
          return ensure('d 3 w', {
            text: 'four',
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by an iw", function() {
        return it("deletes the containing word", function() {
          set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
          ensure('d', {
            mode: 'operator-pending'
          });
          return ensure('i w', {
            text: "12345  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: 'abcde'
              }
            },
            mode: 'normal'
          });
        });
      });
      describe("when followed by a j", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\n";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the file", function() {
          return it("deletes the next two lines", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d j', {
              text: 'ABCDE\n'
            });
          });
        });
        describe("on the middle of second line", function() {
          return it("deletes the last two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d j', {
              text: '12345\n'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [1, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d j', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by an k", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the end of the file", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [2, 4]
            });
            return ensure('d k', {
              text: '12345\n'
            });
          });
        });
        describe("on the beginning of the file", function() {
          return xit("deletes nothing", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d k', {
              text: originalText
            });
          });
        });
        describe("when on the middle of second line", function() {
          return it("deletes the first two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d k', {
              text: 'ABCDE'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [2, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d k', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
      });
      describe("when followed by a t)", function() {
        return describe("with the entire line yanked before", function() {
          beforeEach(function() {
            return set({
              text: "test (xyz)",
              cursor: [0, 6]
            });
          });
          return it("deletes until the closing parenthesis", function() {
            return ensure('d t )', {
              text: 'test ()',
              cursor: [0, 6]
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        it("deletes each selection", function() {
          set({
            text: "abcd\n1234\nABCD\n",
            cursor: [[0, 1], [1, 2], [2, 3]]
          });
          return ensure('d e', {
            text: "a\n12\nABC",
            cursor: [[0, 0], [1, 1], [2, 2]]
          });
        });
        return it("doesn't delete empty selections", function() {
          set({
            text: "abcd\nabc\nabd",
            cursor: [[0, 0], [1, 0], [2, 0]]
          });
          return ensure('d t d', {
            text: "d\nabc\nd",
            cursor: [[0, 0], [1, 0], [2, 0]]
          });
        });
      });
      return describe("stayOnDelete setting", function() {
        beforeEach(function() {
          settings.set('stayOnDelete', true);
          return set({
            text_: "___3333\n__2222\n_1111\n__2222\n___3333\n",
            cursor: [0, 3]
          });
        });
        describe("target range is linewise range", function() {
          it("keep original column after delete", function() {
            ensure("d d", {
              cursor: [0, 3],
              text_: "__2222\n_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
            return ensure(".", {
              cursor: [0, 3],
              text_: "___3333\n"
            });
          });
          return it("v_D also keep original column after delete", function() {
            return ensure("v 2 j D", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
          });
        });
        return describe("target range is text object", function() {
          describe("target is indent", function() {
            var indentText, textData;
            indentText = "0000000000000000\n  22222222222222\n  22222222222222\n  22222222222222\n0000000000000000\n";
            textData = new TextData(indentText);
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("[from top] keep column", function() {
              set({
                cursor: [1, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            it("[from middle] keep column", function() {
              set({
                cursor: [2, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            return it("[from bottom] keep column", function() {
              set({
                cursor: [3, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
          });
          return describe("target is paragraph", function() {
            var B1, B2, B3, P1, P2, P3, paragraphText, textData;
            paragraphText = "p1---------------\np1---------------\np1---------------\n\np2---------------\np2---------------\np2---------------\n\np3---------------\np3---------------\np3---------------\n";
            textData = new TextData(paragraphText);
            P1 = [0, 1, 2];
            B1 = 3;
            P2 = [4, 5, 6];
            B2 = 7;
            P3 = [8, 9, 10];
            B3 = 11;
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var i, results;
              set({
                cursor: [0, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            it("set cursor to start of deletion after delete [from middle of paragraph]", function() {
              var i, results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            return it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var i, results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
          });
        });
      });
    });
    describe("the D keybinding", function() {
      beforeEach(function() {
        return set({
          text: "0000\n1111\n2222\n3333",
          cursor: [0, 1]
        });
      });
      it("deletes the contents until the end of the line", function() {
        return ensure('D', {
          text: "0\n1111\n2222\n3333"
        });
      });
      return it("in visual-mode, it delete whole line", function() {
        ensure('v D', {
          text: "1111\n2222\n3333"
        });
        return ensure("v j D", {
          text: "3333"
        });
      });
    });
    describe("the y keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "012 |345\nabc\n"
        });
      });
      describe("when useClipboardAsDefaultRegister enabled", function() {
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          atom.clipboard.write('___________');
          return ensure(null, {
            register: {
              '"': {
                text: '___________'
              }
            }
          });
        });
        return describe("read/write to clipboard through register", function() {
          return it("writes to clipboard with default register", function() {
            var savedText;
            savedText = '012 345\n';
            ensure('y y', {
              register: {
                '"': {
                  text: savedText
                }
              }
            });
            return expect(atom.clipboard.read()).toBe(savedText);
          });
        });
      });
      describe("visual-mode.linewise", function() {
        beforeEach(function() {
          return set({
            textC: "0000|00\n111111\n222222\n"
          });
        });
        describe("selection not reversed", function() {
          return it("saves to register(type=linewise), cursor move to start of target", function() {
            return ensure("V j y", {
              cursor: [0, 0],
              register: {
                '"': {
                  text: "000000\n111111\n",
                  type: 'linewise'
                }
              }
            });
          });
        });
        return describe("selection is reversed", function() {
          return it("saves to register(type=linewise), cursor doesn't move", function() {
            set({
              cursor: [2, 2]
            });
            return ensure("V k y", {
              cursor: [1, 2],
              register: {
                '"': {
                  text: "111111\n222222\n",
                  type: 'linewise'
                }
              }
            });
          });
        });
      });
      describe("visual-mode.blockwise", function() {
        beforeEach(function() {
          set({
            textC_: "000000\n1!11111\n222222\n333333\n4|44444\n555555\n"
          });
          return ensure("ctrl-v l l j", {
            selectedTextOrdered: ["111", "222", "444", "555"],
            mode: ['visual', 'blockwise']
          });
        });
        describe("when stayOnYank = false", function() {
          return it("place cursor at start of block after yank", function() {
            return ensure("y", {
              mode: 'normal',
              textC_: "000000\n1!11111\n222222\n333333\n4|44444\n555555\n"
            });
          });
        });
        return describe("when stayOnYank = true", function() {
          beforeEach(function() {
            return settings.set('stayOnYank', true);
          });
          return it("place cursor at head of block after yank", function() {
            return ensure("y", {
              mode: 'normal',
              textC_: "000000\n111111\n222!222\n333333\n444444\n555|555\n"
            });
          });
        });
      });
      describe("y y", function() {
        it("saves to register(type=linewise), cursor stay at same position", function() {
          return ensure('y y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\n",
                type: 'linewise'
              }
            }
          });
        });
        it("[N y y] yank N line, starting from the current", function() {
          return ensure('y 2 y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("[y N y] yank N line, starting from the current", function() {
          return ensure('2 y y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
      });
      describe("with a register", function() {
        return it("saves the line to the a register", function() {
          return ensure('" a y y', {
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
        });
      });
      describe("with A register", function() {
        return it("append to existing value of lowercase-named register", function() {
          ensure('" a y y', {
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
          return ensure('" A y y', {
            register: {
              a: {
                text: "012 345\n012 345\n"
              }
            }
          });
        });
      });
      describe("with a motion", function() {
        beforeEach(function() {
          return settings.set('useClipboardAsDefaultRegister', false);
        });
        it("yank from here to destnation of motion", function() {
          return ensure('y e', {
            cursor: [0, 4],
            register: {
              '"': {
                text: '345'
              }
            }
          });
        });
        it("does not yank when motion failed", function() {
          return ensure('y t x', {
            register: {
              '"': {
                text: void 0
              }
            }
          });
        });
        it("yank and move cursor to start of target", function() {
          return ensure('y h', {
            cursor: [0, 3],
            register: {
              '"': {
                text: ' '
              }
            }
          });
        });
        return it("[with linewise motion] yank and desn't move cursor", function() {
          return ensure('y j', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n",
                type: 'linewise'
              }
            }
          });
        });
      });
      describe("with a text-obj", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 8],
            text: "\n1st paragraph\n1st paragraph\n\n2n paragraph\n2n paragraph\n"
          });
        });
        it("inner-word and move cursor to start of target", function() {
          return ensure('y i w', {
            register: {
              '"': {
                text: "paragraph"
              }
            },
            cursor: [2, 4]
          });
        });
        return it("yank text-object inner-paragraph and move cursor to start of target", function() {
          return ensure('y i p', {
            cursor: [1, 0],
            register: {
              '"': {
                text: "1st paragraph\n1st paragraph\n"
              }
            }
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
        it("yank and doesn't move cursor", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('y G', {
            register: {
              '"': {
                text: "abcde\nABCDE\n",
                type: 'linewise'
              }
            },
            cursor: [1, 0]
          });
        });
        return it("yank and doesn't move cursor", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('y G', {
            register: {
              '"': {
                text: "abcde\nABCDE\n",
                type: 'linewise'
              }
            },
            cursor: [1, 2]
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        return it("moves each cursor and copies the last selection's text", function() {
          set({
            text: "  abcd\n  1234",
            cursor: [[0, 0], [1, 5]]
          });
          return ensure('y ^', {
            register: {
              '"': {
                text: '123'
              }
            },
            cursor: [[0, 0], [1, 2]]
          });
        });
      });
      return describe("stayOnYank setting", function() {
        var text;
        text = null;
        beforeEach(function() {
          settings.set('stayOnYank', true);
          text = new TextData("0_234567\n1_234567\n2_234567\n\n4_234567\n");
          return set({
            text: text.getRaw(),
            cursor: [1, 2]
          });
        });
        it("don't move cursor after yank from normal-mode", function() {
          ensure("y i p", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([0, 1, 2])
              }
            }
          });
          ensure("j y y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: text.getLines([2])
              }
            }
          });
          ensure("k .", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          ensure("y h", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "_"
              }
            }
          });
          return ensure("y b", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "1_"
              }
            }
          });
        });
        it("don't move cursor after yank from visual-linewise", function() {
          ensure("V y", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          return ensure("V j y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: text.getLines([1, 2])
              }
            }
          });
        });
        return it("don't move cursor after yank from visual-characterwise", function() {
          ensure("v l l y", {
            cursor: [1, 4],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v h h y", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v j y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: "234567\n2_2"
              }
            }
          });
          return ensure("v 2 k y", {
            cursor: [0, 2],
            register: {
              '"': {
                text: "234567\n1_234567\n2_2"
              }
            }
          });
        });
      });
    });
    describe("the yy keybinding", function() {
      describe("on a single line file", function() {
        beforeEach(function() {
          return set({
            text: "exclamation!\n",
            cursor: [0, 0]
          });
        });
        return it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "exclamation!\n"
              }
            },
            text: "exclamation!\nexclamation!\n"
          });
        });
      });
      return describe("on a single line file with no newline", function() {
        beforeEach(function() {
          return set({
            text: "no newline!",
            cursor: [0, 0]
          });
        });
        it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\n"
          });
        });
        return it("copies the entire line and pastes it respecting count and new lines", function() {
          return ensure('y y 2 p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\nno newline!\n"
          });
        });
      });
    });
    describe("the Y keybinding", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = "012 345\nabc\n";
        return set({
          text: text,
          cursor: [0, 4]
        });
      });
      it("saves the line to the default register", function() {
        return ensure('Y', {
          cursor: [0, 4],
          register: {
            '"': {
              text: "012 345\n"
            }
          }
        });
      });
      return it("yank the whole lines to the default register", function() {
        return ensure('v j Y', {
          cursor: [0, 0],
          register: {
            '"': {
              text: text
            }
          }
        });
      });
    });
    describe("YankDiffHunk", function() {
      beforeEach(function() {
        set({
          text: "--- file        2017-12-24 15:11:33.000000000 +0900\n+++ file-new    2017-12-24 15:15:09.000000000 +0900\n@@ -1,9 +1,9 @@\n line 0\n+line 0-1\n line 1\n-line 2\n+line 1-1\n line 3\n-line 4\n line 5\n-line 6\n-line 7\n+line 7-1\n+line 7-2\n line 8\n"
        });
        settings.set('useClipboardAsDefaultRegister', true);
        atom.clipboard.write('___________');
        return ensure(null, {
          register: {
            '"': {
              text: '___________'
            }
          }
        });
      });
      return it("yank diff-hunk under cursor", function() {
        var ensureYankedText;
        ensureYankedText = function(row, text) {
          set({
            cursor: [row, 0]
          });
          dispatch(editor.element, 'vim-mode-plus:yank-diff-hunk');
          return ensure(null, {
            register: {
              '"': {
                text: text
              }
            }
          });
        };
        ensureYankedText(2, "___________");
        ensureYankedText(4, "line 0-1\n");
        ensureYankedText(6, "line 2\n");
        ensureYankedText(7, "line 1-1\n");
        ensureYankedText(9, "line 4\n");
        ensureYankedText(11, "line 6\nline 7\n");
        ensureYankedText(12, "line 6\nline 7\n");
        ensureYankedText(13, "line 7-1\nline 7-2\n");
        return ensureYankedText(14, "line 7-1\nline 7-2\n");
      });
    });
    describe("the p keybinding", function() {
      describe("with single line character contents", function() {
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', false);
          set({
            textC: "|012\n"
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              'a': {
                text: 'a'
              }
            }
          });
          return atom.clipboard.write("clip");
        });
        describe("from the default register", function() {
          return it("inserts the contents", function() {
            return ensure("p", {
              textC: "034|512\n"
            });
          });
        });
        describe("at the end of a line", function() {
          beforeEach(function() {
            return set({
              textC: "01|2\n"
            });
          });
          return it("positions cursor correctly", function() {
            return ensure("p", {
              textC: "01234|5\n"
            });
          });
        });
        describe("paste to empty line", function() {
          return it("paste content to that empty line", function() {
            set({
              textC: "1st\n|\n3rd",
              register: {
                '"': {
                  text: '2nd'
                }
              }
            });
            return ensure('p', {
              textC: "1st\n2n|d\n3rd"
            });
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            return ensure('p', {
              textC: "0cli|p12\n"
            });
          });
        });
        describe("from a specified register", function() {
          return it("inserts the contents of the 'a' register", function() {
            return ensure('" a p', {
              textC: "0|a12\n"
            });
          });
        });
        return describe("at the end of a line", function() {
          return it("inserts before the current line's newline", function() {
            set({
              textC: "abcde\none |two three"
            });
            return ensure('d $ k $ p', {
              textC_: "abcdetwo thre|e\none_"
            });
          });
        });
      });
      describe("with multiline character contents", function() {
        beforeEach(function() {
          set({
            textC: "|012\n"
          });
          return set({
            register: {
              '"': {
                text: '345\n678'
              }
            }
          });
        });
        it("p place cursor at start of mutation", function() {
          return ensure("p", {
            textC: "0|345\n67812\n"
          });
        });
        return it("P place cursor at start of mutation", function() {
          return ensure("P", {
            textC: "|345\n678012\n"
          });
        });
      });
      describe("with linewise contents", function() {
        describe("on a single line", function() {
          beforeEach(function() {
            return set({
              textC: '0|12',
              register: {
                '"': {
                  text: " 345\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register", function() {
            return ensure('p', {
              textC_: "012\n_|345\n"
            });
          });
          return it("replaces the current selection and put cursor to the first char of line", function() {
            return ensure('v p', {
              textC_: "0\n_|345\n2"
            });
          });
        });
        return describe("on multiple lines", function() {
          beforeEach(function() {
            return set({
              text: "012\n 345",
              register: {
                '"': {
                  text: " 456\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register at middle line", function() {
            set({
              cursor: [0, 1]
            });
            return ensure("p", {
              textC: "012\n |456\n 345"
            });
          });
          return it("inserts the contents of the default register at end of line", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('p', {
              textC: "012\n 345\n |456\n"
            });
          });
        });
      });
      describe("with multiple linewise contents", function() {
        beforeEach(function() {
          return set({
            textC: "012\n|abc",
            register: {
              '"': {
                text: " 345\n 678\n",
                type: 'linewise'
              }
            }
          });
        });
        return it("inserts the contents of the default register", function() {
          return ensure('p', {
            textC: "012\nabc\n |345\n 678\n"
          });
        });
      });
      describe("put-after-with-auto-indent command", function() {
        var ensurePutAfterWithAutoIndent;
        ensurePutAfterWithAutoIndent = function(options) {
          dispatch(editor.element, 'vim-mode-plus:put-after-with-auto-indent');
          return ensure(null, options);
        };
        beforeEach(function() {
          return waitsForPromise(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            return atom.packages.activatePackage('language-javascript').then(function() {
              return set({
                grammar: 'source.js'
              });
            });
          });
        });
        describe("paste with auto-indent", function() {
          it("inserts the contents of the default register", function() {
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: " 345\n"
                }
              },
              textC_: "if| () {\n}"
            });
            return ensurePutAfterWithAutoIndent({
              textC_: "if () {\n  |345\n}"
            });
          });
          return it("multi-line register contents with auto indent", function() {
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: "if(3) {\n  if(4) {}\n}"
                }
              },
              textC: "if (1) {\n  |if (2) {\n  }\n}"
            });
            return ensurePutAfterWithAutoIndent({
              textC: "if (1) {\n  if (2) {\n    |if(3) {\n      if(4) {}\n    }\n  }\n}"
            });
          });
        });
        return describe("when pasting already indented multi-lines register content", function() {
          beforeEach(function() {
            return set({
              textC: "if (1) {\n  |if (2) {\n  }\n}"
            });
          });
          it("keep original layout", function() {
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: "   a: 123,\nbbbb: 456,"
                }
              }
            });
            return ensurePutAfterWithAutoIndent({
              textC: "if (1) {\n  if (2) {\n       |a: 123,\n    bbbb: 456,\n  }\n}"
            });
          });
          return it("keep original layout [register content have blank row]", function() {
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: "if(3) {\n__abc\n\n__def\n}".replace(/_/g, ' ')
                }
              }
            });
            return ensurePutAfterWithAutoIndent({
              textC_: "if (1) {\n  if (2) {\n    |if(3) {\n      abc\n\n      def\n    }\n  }\n}"
            });
          });
        });
      });
      describe("pasting twice", function() {
        beforeEach(function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1],
            register: {
              '"': {
                text: '123'
              }
            }
          });
          return ensure('2 p');
        });
        it("inserts the same line twice", function() {
          return ensure(null, {
            text: "12345\nab123123cde\nABCDE\nQWERT"
          });
        });
        return describe("when undone", function() {
          return it("removes both lines", function() {
            return ensure('u', {
              text: "12345\nabcde\nABCDE\nQWERT"
            });
          });
        });
      });
      describe("support multiple cursors", function() {
        return it("paste text for each cursors", function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [[1, 0], [2, 0]],
            register: {
              '"': {
                text: 'ZZZ'
              }
            }
          });
          return ensure('p', {
            text: "12345\naZZZbcde\nAZZZBCDE\nQWERT",
            cursor: [[1, 3], [2, 3]]
          });
        });
      });
      return describe("with a selection", function() {
        beforeEach(function() {
          return set({
            text: '012\n',
            cursor: [0, 1]
          });
        });
        describe("with characterwise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('v p', {
              text: "03452\n",
              cursor: [0, 3]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('v p', {
              text: "0\n345\n2\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("with linewise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              text: "012\nabc",
              cursor: [0, 1]
            });
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('V p', {
              text: "345\nabc",
              cursor: [0, 0]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('V p', {
              text: "345\n",
              cursor: [0, 0]
            });
          });
        });
      });
    });
    describe("the P keybinding", function() {
      return describe("with character contents", function() {
        beforeEach(function() {
          set({
            text: "012\n",
            cursor: [0, 0]
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'a'
              }
            }
          });
          return ensure('P');
        });
        return it("inserts the contents of the default register above", function() {
          return ensure(null, {
            text: "345012\n",
            cursor: [0, 2]
          });
        });
      });
    });
    describe("the . keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n56\n78",
          cursor: [0, 0]
        });
      });
      it("repeats the last operation", function() {
        return ensure('2 d d .', {
          text: ""
        });
      });
      return it("composes with motions", function() {
        return ensure('d d 2 .', {
          text: "78"
        });
      });
    });
    describe("the r keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n\n",
          cursor: [[0, 0], [1, 0]]
        });
      });
      it("replaces a single character", function() {
        return ensureWait('r x', {
          text: 'x2\nx4\n\n'
        });
      });
      it("remain visual-mode when cancelled", function() {
        return ensureWait('v r escape', {
          text: '12\n34\n\n',
          mode: ['visual', 'characterwise']
        });
      });
      it("replaces a single character with a line break", function() {
        return ensureWait('r enter', {
          text: '\n2\n\n4\n\n',
          cursor: [[1, 0], [3, 0]]
        });
      });
      it("auto indent when replaced with singe new line", function() {
        set({
          textC_: "__a|bc"
        });
        return ensureWait('r enter', {
          textC_: "__a\n__|c"
        });
      });
      it("composes properly with motions", function() {
        return ensureWait('2 r x', {
          text: 'xx\nxx\n\n'
        });
      });
      it("does nothing on an empty line", function() {
        set({
          cursor: [2, 0]
        });
        return ensureWait('r x', {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensureWait('3 r x', {
          text: '12\n34\n\n'
        });
      });
      describe("cancellation", function() {
        it("does nothing when cancelled", function() {
          return ensureWait('r escape', {
            text: '12\n34\n\n',
            mode: 'normal'
          });
        });
        it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|    a\n!    a\n|    a\n"
          });
          return ensureWait("r escape", {
            textC: "|    a\n!    a\n|    a\n",
            mode: "normal"
          });
        });
        return it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|**a\n!**a\n|**a\n"
          });
          ensureWait("v l", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
          return ensureWait("r escape", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return ensure('v e');
        });
        it("replaces the entire selection with the given character", function() {
          return ensureWait('r x', {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensureWait('r x', {
            cursor: [[0, 0], [1, 0]]
          });
        });
      });
      return describe("when in visual-block mode", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4],
            text: "0:2345\n1: o11o\n2: o22o\n3: o33o\n4: o44o\n"
          });
          return ensure('ctrl-v l 3 j', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['11', '22', '33', '44']
          });
        });
        return it("replaces each selection and put cursor on start of top selection", function() {
          runs(function() {
            return ensureWait('r x', {
              mode: 'normal',
              cursor: [1, 4],
              text: "0:2345\n1: oxxo\n2: oxxo\n3: oxxo\n4: oxxo\n"
            });
          });
          runs(function() {
            return set({
              cursor: [1, 0]
            });
          });
          return runs(function() {
            return ensureWait('.', {
              mode: 'normal',
              cursor: [1, 0],
              text: "0:2345\nxx oxxo\nxx oxxo\nxx oxxo\nxx oxxo\n"
            });
          });
        });
      });
    });
    describe('the m keybinding', function() {
      var ensureMarkByMode;
      ensureMarkByMode = function(mode) {
        var _ensure;
        _ensure = bindEnsureWaitOption({
          mode: mode
        });
        _ensure("m a", {
          mark: {
            "a": [0, 2]
          }
        });
        _ensure("l m a", {
          mark: {
            "a": [0, 3]
          }
        });
        _ensure("j m a", {
          mark: {
            "a": [1, 3]
          }
        });
        _ensure("j m b", {
          mark: {
            "a": [1, 3],
            "b": [2, 3]
          }
        });
        return _ensure("l m c", {
          mark: {
            "a": [1, 3],
            "b": [2, 3],
            "c": [2, 4]
          }
        });
      };
      beforeEach(function() {
        return set({
          textC: "0:| 12\n1: 34\n2: 56"
        });
      });
      it("[normal] can mark multiple positon", function() {
        return ensureMarkByMode("normal");
      });
      it("[vC] can mark", function() {
        ensure("v");
        return ensureMarkByMode(["visual", "characterwise"]);
      });
      return it("[vL] can mark", function() {
        ensure("V");
        return ensureMarkByMode(["visual", "linewise"]);
      });
    });
    describe('the R keybinding', function() {
      beforeEach(function() {
        return set({
          text: "12345\n67890",
          cursor: [0, 2]
        });
      });
      it("enters replace mode and replaces characters", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("ab");
        return ensure('escape', {
          text: "12ab5\n67890",
          cursor: [0, 3],
          mode: 'normal'
        });
      });
      it("continues beyond end of line as insert", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("abcde");
        return ensure('escape', {
          text: '12abcde\n67890'
        });
      });
      it('treats backspace as undo', function() {
        editor.insertText("foo");
        ensure('R');
        editor.insertText("a");
        editor.insertText("b");
        ensure(null, {
          text: "12fooab5\n67890"
        });
        dispatch(editorElement, 'core:backspace');
        ensure(null, {
          text: "12fooa45\n67890"
        });
        editor.insertText("c");
        ensure(null, {
          text: "12fooac5\n67890"
        });
        dispatch(editor.element, 'core:backspace');
        dispatch(editor.element, 'core:backspace');
        ensure(null, {
          text: "12foo345\n67890",
          selectedText: ''
        });
        dispatch(editor.element, 'core:backspace');
        return ensure(null, {
          text: "12foo345\n67890",
          selectedText: ''
        });
      });
      it("can be repeated", function() {
        ensure('R');
        editor.insertText("ab");
        ensure('escape');
        set({
          cursor: [1, 2]
        });
        ensure('.', {
          text: "12ab5\n67ab0",
          cursor: [1, 3]
        });
        set({
          cursor: [0, 4]
        });
        return ensure('.', {
          text: "12abab\n67ab0",
          cursor: [0, 5]
        });
      });
      it("can be interrupted by arrow keys and behave as insert for repeat", function() {});
      it("repeats correctly when backspace was used in the text", function() {
        ensure('R');
        editor.insertText("a");
        dispatch(editor.element, 'core:backspace');
        editor.insertText("b");
        ensure('escape');
        set({
          cursor: [1, 2]
        });
        ensure('.', {
          text: "12b45\n67b90",
          cursor: [1, 2]
        });
        set({
          cursor: [0, 4]
        });
        return ensure('.', {
          text: "12b4b\n67b90",
          cursor: [0, 4]
        });
      });
      it("doesn't replace a character if newline is entered", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("\n");
        return ensure('escape', {
          text: "12\n345\n67890"
        });
      });
      return describe("multiline situation", function() {
        var textOriginal;
        textOriginal = "01234\n56789";
        beforeEach(function() {
          return set({
            text: textOriginal,
            cursor: [0, 0]
          });
        });
        it("replace character unless input isnt new line(\\n)", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("a\nb\nc");
          return ensure(null, {
            text: "a\nb\nc34\n56789",
            cursor: [2, 1]
          });
        });
        it("handle backspace", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          set({
            cursor: [0, 1]
          });
          editor.insertText("a\nb\nc");
          ensure(null, {
            text: "0a\nb\nc4\n56789",
            cursor: [2, 1]
          });
          dispatch(editor.element, 'core:backspace');
          ensure(null, {
            text: "0a\nb\n34\n56789",
            cursor: [2, 0]
          });
          dispatch(editor.element, 'core:backspace');
          ensure(null, {
            text: "0a\nb34\n56789",
            cursor: [1, 1]
          });
          dispatch(editor.element, 'core:backspace');
          ensure(null, {
            text: "0a\n234\n56789",
            cursor: [1, 0]
          });
          dispatch(editor.element, 'core:backspace');
          ensure(null, {
            text: "0a234\n56789",
            cursor: [0, 2]
          });
          dispatch(editor.element, 'core:backspace');
          ensure(null, {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          dispatch(editor.element, 'core:backspace');
          ensure(null, {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          return ensure('escape', {
            text: "01234\n56789",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("repeate multiline text case-1", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\ndef");
          ensure(null, {
            text: "abc\ndef\n56789",
            cursor: [1, 3]
          });
          ensure('escape', {
            cursor: [1, 2],
            mode: 'normal'
          });
          ensure('u', {
            text: textOriginal
          });
          ensure('.', {
            text: "abc\ndef\n56789",
            cursor: [1, 2],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\ndef\n56abc\ndef",
            cursor: [3, 2],
            mode: 'normal'
          });
        });
        return it("repeate multiline text case-2", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\nd");
          ensure(null, {
            text: "abc\nd4\n56789",
            cursor: [1, 1]
          });
          ensure('escape', {
            cursor: [1, 0],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\nd4\nabc\nd9",
            cursor: [3, 0],
            mode: 'normal'
          });
        });
      });
    });
    describe('AddBlankLineBelow, AddBlankLineAbove', function() {
      beforeEach(function() {
        set({
          textC: "line0\nli|ne1\nline2\nline3"
        });
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.normal-mode': {
            'enter': 'vim-mode-plus:add-blank-line-below',
            'shift-enter': 'vim-mode-plus:add-blank-line-above'
          }
        });
      });
      it("insert blank line below/above", function() {
        ensure("enter", {
          textC: "line0\nli|ne1\n\nline2\nline3"
        });
        return ensure("shift-enter", {
          textC: "line0\n\nli|ne1\n\nline2\nline3"
        });
      });
      return it("[with-count] insert blank line below/above", function() {
        ensure("2 enter", {
          textC: "line0\nli|ne1\n\n\nline2\nline3"
        });
        return ensure("2 shift-enter", {
          textC: "line0\n\n\nli|ne1\n\n\nline2\nline3"
        });
      });
    });
    describe('Select as operator', function() {
      beforeEach(function() {
        settings.set('keymapSToSelect', true);
        return jasmine.attachToDOM(editorElement);
      });
      return describe("select by target", function() {
        beforeEach(function() {
          return set({
            textC: "0 |ooo xxx ***\n1 xxx *** ooo\n\n3 ooo xxx ***\n4 xxx *** ooo\n"
          });
        });
        it("select text-object", function() {
          return ensure("s p", {
            mode: ["visual", "linewise"],
            selectedText: "0 ooo xxx ***\n1 xxx *** ooo\n",
            propertyHead: [1, 13]
          });
        });
        it("select by motion j with stayOnSelectTextObject", function() {
          settings.set("stayOnSelectTextObject", true);
          return ensure("s i p", {
            mode: ["visual", "linewise"],
            selectedText: "0 ooo xxx ***\n1 xxx *** ooo\n",
            propertyHead: [1, 2]
          });
        });
        it("select occurrence in text-object with occurrence-modifier", function() {
          return ensure("s o p", {
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]]]
          });
        });
        it("select occurrence in text-object with preset-occurrence", function() {
          return ensure("g o s p", {
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]]]
          });
        });
        it("convert presistent-selection into normal selection", function() {
          ensure("v j enter", {
            mode: "normal",
            persistentSelectionCount: 1,
            persistentSelectionBufferRange: [[[0, 2], [1, 3]]]
          });
          ensure("j j v j", {
            persistentSelectionCount: 1,
            persistentSelectionBufferRange: [[[0, 2], [1, 3]]],
            mode: ["visual", "characterwise"],
            selectedText: "ooo xxx ***\n4 x"
          });
          return ensure("s", {
            mode: ["visual", "characterwise"],
            persistentSelectionCount: 0,
            selectedTextOrdered: ["ooo xxx ***\n1 x", "ooo xxx ***\n4 x"]
          });
        });
        it("select preset-occurrence in presistent-selection and normal selection", function() {
          ensure("g o", {
            occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo']
          });
          ensure("V j enter G V", {
            persistentSelectionCount: 1,
            mode: ["visual", "linewise"],
            selectedText: "4 xxx *** ooo\n"
          });
          return ensure("s", {
            persistentSelectionCount: 0,
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]], [[4, 10], [4, 13]]]
          });
        });
        it("select by motion $", function() {
          return ensure("s $", {
            mode: ["visual", "characterwise"],
            selectedText: "ooo xxx ***\n"
          });
        });
        it("select by motion j", function() {
          return ensure("s j", {
            mode: ["visual", "linewise"],
            selectedText: "0 ooo xxx ***\n1 xxx *** ooo\n"
          });
        });
        it("select by motion j v-modifier", function() {
          return ensure("s v j", {
            mode: ["visual", "characterwise"],
            selectedText: "ooo xxx ***\n1 x"
          });
        });
        it("select occurrence by motion G", function() {
          return ensure("s o G", {
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo", "ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]], [[3, 2], [3, 5]], [[4, 10], [4, 13]]]
          });
        });
        it("select occurrence by motion G with explicit V-modifier", function() {
          return ensure("s o V G", {
            mode: ["visual", "linewise"],
            selectedTextOrdered: ["0 ooo xxx ***\n1 xxx *** ooo\n", "3 ooo xxx ***\n4 xxx *** ooo\n"]
          });
        });
        it("return to normal-mode when fail to select", function() {
          ensure("s i f", {
            mode: "normal",
            cursor: [0, 2]
          });
          return ensure("s f z", {
            mode: "normal",
            cursor: [0, 2]
          });
        });
        return describe("complex scenario", function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return runs(function() {
              return set({
                grammar: 'source.js',
                textC: "const result = []\nfor (const !member of members) {\n  let member2 = member + member\n  let member3 = member + member + member\n  result.push(member2, member3)\n}\n"
              });
            });
          });
          return it("select occurrence in a-fold ,reverse(o) then escape to normal-mode", function() {
            return ensure("s o z o escape", {
              mode: "normal",
              textC: "const result = []\nfor (const |member of members) {\n  let member2 = |member + |member\n  let member3 = |member + |member + |member\n  result.push(member2, member3)\n}\n"
            });
          });
        });
      });
    });
    return describe('ResolveGitConflict', function() {
      var resolveConflictAtRowThenEnsure;
      resolveConflictAtRowThenEnsure = function(row, options) {
        set({
          cursor: [row, 0]
        });
        dispatch(editor.element, 'vim-mode-plus:resolve-git-conflict');
        return ensure(null, options);
      };
      describe("normal conflict section", function() {
        var original, ours, theirs;
        original = "------start\n<<<<<<< HEAD\nours 1\nours 2\n=======\ntheirs 1\ntheirs 2\n>>>>>>> branch-a\n------end";
        ours = "------start\n|ours 1\nours 2\n------end";
        theirs = "------start\n|theirs 1\ntheirs 2\n------end";
        beforeEach(function() {
          return set({
            text: original
          });
        });
        it("row 0", function() {
          return resolveConflictAtRowThenEnsure(0, {
            text: original
          });
        });
        it("row 1", function() {
          return resolveConflictAtRowThenEnsure(1, {
            textC: ours
          });
        });
        it("row 2", function() {
          return resolveConflictAtRowThenEnsure(2, {
            textC: ours
          });
        });
        it("row 3", function() {
          return resolveConflictAtRowThenEnsure(3, {
            textC: ours
          });
        });
        it("row 4", function() {
          return resolveConflictAtRowThenEnsure(4, {
            text: original
          });
        });
        it("row 5", function() {
          return resolveConflictAtRowThenEnsure(5, {
            textC: theirs
          });
        });
        it("row 6", function() {
          return resolveConflictAtRowThenEnsure(6, {
            textC: theirs
          });
        });
        it("row 7", function() {
          return resolveConflictAtRowThenEnsure(7, {
            textC: theirs
          });
        });
        return it("row 8", function() {
          return resolveConflictAtRowThenEnsure(8, {
            text: original
          });
        });
      });
      describe("ours section is empty", function() {
        var original, ours, theirs;
        original = "------start\n<<<<<<< HEAD\n=======\ntheirs 1\n>>>>>>> branch-a\n------end";
        ours = "------start\n|------end";
        theirs = "------start\n|theirs 1\n------end";
        beforeEach(function() {
          return set({
            text: original
          });
        });
        it("row 0", function() {
          return resolveConflictAtRowThenEnsure(0, {
            text: original
          });
        });
        it("row 1", function() {
          return resolveConflictAtRowThenEnsure(1, {
            textC: ours
          });
        });
        it("row 2", function() {
          return resolveConflictAtRowThenEnsure(2, {
            text: original
          });
        });
        it("row 3", function() {
          return resolveConflictAtRowThenEnsure(3, {
            textC: theirs
          });
        });
        it("row 4", function() {
          return resolveConflictAtRowThenEnsure(4, {
            textC: theirs
          });
        });
        return it("row 5", function() {
          return resolveConflictAtRowThenEnsure(5, {
            text: original
          });
        });
      });
      describe("theirs section is empty", function() {
        var original, ours, theirs;
        original = "------start\n<<<<<<< HEAD\nours 1\n=======\n>>>>>>> branch-a\n------end";
        ours = "------start\n|ours 1\n------end";
        theirs = "------start\n|------end";
        beforeEach(function() {
          return set({
            text: original
          });
        });
        it("row 0", function() {
          return resolveConflictAtRowThenEnsure(0, {
            text: original
          });
        });
        it("row 1", function() {
          return resolveConflictAtRowThenEnsure(1, {
            textC: ours
          });
        });
        it("row 2", function() {
          return resolveConflictAtRowThenEnsure(2, {
            textC: ours
          });
        });
        it("row 3", function() {
          return resolveConflictAtRowThenEnsure(3, {
            text: original
          });
        });
        it("row 4", function() {
          return resolveConflictAtRowThenEnsure(4, {
            textC: theirs
          });
        });
        return it("row 5", function() {
          return resolveConflictAtRowThenEnsure(5, {
            text: original
          });
        });
      });
      describe("both ours and theirs section is empty", function() {
        var original, ours;
        original = "------start\n<<<<<<< HEAD\n=======\n>>>>>>> branch-a\n------end";
        ours = "------start\n|------end";
        beforeEach(function() {
          return set({
            text: original
          });
        });
        it("row 0", function() {
          return resolveConflictAtRowThenEnsure(0, {
            text: original
          });
        });
        it("row 1", function() {
          return resolveConflictAtRowThenEnsure(1, {
            textC: ours
          });
        });
        it("row 2", function() {
          return resolveConflictAtRowThenEnsure(2, {
            text: original
          });
        });
        it("row 3", function() {
          return resolveConflictAtRowThenEnsure(3, {
            textC: ours
          });
        });
        return it("row 4", function() {
          return resolveConflictAtRowThenEnsure(4, {
            text: original
          });
        });
      });
      return describe("no separator section", function() {
        var original, ours;
        original = "------start\n<<<<<<< HEAD\nours 1\n>>>>>>> branch-a\n------end";
        ours = "------start\n|ours 1\n------end";
        beforeEach(function() {
          return set({
            text: original
          });
        });
        it("row 0", function() {
          return resolveConflictAtRowThenEnsure(0, {
            text: original
          });
        });
        it("row 1", function() {
          return resolveConflictAtRowThenEnsure(1, {
            textC: ours
          });
        });
        it("row 2", function() {
          return resolveConflictAtRowThenEnsure(2, {
            textC: ours
          });
        });
        it("row 3", function() {
          return resolveConflictAtRowThenEnsure(3, {
            textC: ours
          });
        });
        return it("row 4", function() {
          return resolveConflictAtRowThenEnsure(4, {
            text: original
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItZ2VuZXJhbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsOENBQUE7SUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsUUFBQTtJQUFBLE9BQW9FLEVBQXBFLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsb0JBQWQsRUFBMEIsMEJBQTFCLEVBQTRDO0lBQzVDLE9BQW9DLEVBQXBDLEVBQUMsZ0JBQUQsRUFBUyx1QkFBVCxFQUF3QjtJQUV4QixVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLDJCQUFkLEVBQTBCLHVDQUExQixFQUE0QywrQ0FBNUMsRUFBb0U7TUFIMUQsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTthQUNoQyxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtRQUM1QixNQUFBLENBQU8sR0FBUDtRQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQXhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLEtBQS9DO1FBQ0EsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFyQixDQUFBO1FBQ0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBeEIsQ0FBQSxDQUFQLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsSUFBL0M7ZUFDQSxNQUFBLENBQU8sU0FB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bnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGF9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk9wZXJhdG9yIGdlbmVyYWxcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0LCBiaW5kRW5zdXJlT3B0aW9uLCBiaW5kRW5zdXJlV2FpdE9wdGlvbl0gPSBbXVxuICBbZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdCwgYmluZEVuc3VyZU9wdGlvbiwgYmluZEVuc3VyZVdhaXRPcHRpb259ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJjYW5jZWxsaW5nIG9wZXJhdGlvbnNcIiwgLT5cbiAgICBpdCBcImNsZWFyIHBlbmRpbmcgb3BlcmF0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJy8nXG4gICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlIGZhbHNlXG4gICAgICB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKVxuICAgICAgZXhwZWN0KHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmlzRW1wdHkoKSkudG9CZSB0cnVlXG4gICAgICBleHBlY3QoLT4gdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKCkpLm5vdC50b1Rocm93KClcblxuICBkZXNjcmliZSBcInRoZSB4IGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIm9uIGEgbGluZSB3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aG91dCB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG5cXG54eXpcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgNF1cblxuICAgICAgICBpdCBcImRlbGV0ZXMgYSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyMzVcXG5cXG54eXonLCBjdXJzb3I6IFsxLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc0J1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JyAsIGN1cnNvcjogWzEsIDNdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzUnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMlxcblxcbnh5eicgICwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMydcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDFcXG5cXG54eXonICAgLCBjdXJzb3I6IFsxLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcyJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wXFxuXFxueHl6JyAgICAsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcblxcblxcbnh5eicgICAgICwgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcblxuICAgICAgICBpdCBcImRlbGV0ZXMgbXVsdGlwbGUgY2hhcmFjdGVycyB3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzIgeCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JywgY3Vyc29yOiBbMSwgM10sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNDUnXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgZW5zdXJlICczIHgnLFxuICAgICAgICAgICAgdGV4dDogJ2FcXG4wMTIzXFxuXFxueHl6J1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYmMnXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxuXFxueHl6XCJcbiAgICAgICAgICAgIGN1cnNvcjogW1sxLCA0XSwgWzAsIDFdXVxuXG4gICAgICAgIGl0IFwiaXMgdW5kb25lIGFzIG9uZSBvcGVyYXRpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiBcImFjXFxuMDEyMzVcXG5cXG54eXpcIlxuICAgICAgICAgIGVuc3VyZSAndScsIHRleHQ6ICdhYmNcXG4wMTIzNDVcXG5cXG54eXonXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiAnYWJjXFxuMDEyMzQ1XFxuXFxueHl6JywgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuXG4gICAgICAgIGl0IFwiZGVsZXRlcyBhIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgICMgY29weSBvZiB0aGUgZWFybGllciB0ZXN0IGJlY2F1c2Ugd3JhcExlZnRSaWdodE1vdGlvbiBzaG91bGQgbm90IGFmZmVjdCBpdFxuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTIzNVxcblxcbnh5eicsIGN1cnNvcjogWzEsIDRdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzQnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMjNcXG5cXG54eXonICwgY3Vyc29yOiBbMSwgM10sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNSdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyXFxuXFxueHl6JyAgLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMVxcblxcbnh5eicgICAsIGN1cnNvcjogWzEsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzInXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjBcXG5cXG54eXonICAgICwgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMSdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuXFxuXFxueHl6JyAgICAgLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwJ1xuXG4gICAgICAgIGl0IFwiZGVsZXRlcyBtdWx0aXBsZSBjaGFyYWN0ZXJzIGFuZCBuZXdsaW5lcyB3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICAgIGVuc3VyZSAnMiB4JywgdGV4dDogJ2FiY1xcbjAxMjNcXG5cXG54eXonLCBjdXJzb3I6IFsxLCAzXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc0NSdcbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBlbnN1cmUgJzMgeCcsIHRleHQ6ICdhMDEyM1xcblxcbnh5eicsIGN1cnNvcjogWzAsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2JjXFxuJ1xuICAgICAgICAgIGVuc3VyZSAnNyB4JywgdGV4dDogJ2F5eicsIGN1cnNvcjogWzAsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAxMjNcXG5cXG54J1xuXG4gICAgZGVzY3JpYmUgXCJvbiBhbiBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcblxcbnh5elwiLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgbm90aGluZyBvbiBhbiBlbXB0eSBsaW5lIHdoZW4gdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uIGlzIGZhbHNlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIGZhbHNlKVxuICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcblxcbnh5elwiLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgYW4gZW1wdHkgbGluZSB3aGVuIHZpbS1tb2RlLXBsdXMud3JhcExlZnRSaWdodE1vdGlvbiBpcyB0cnVlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgIGVuc3VyZSAneCcsIHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxueHl6XCIsIGN1cnNvcjogWzIsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgWCBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImFiXFxuMDEyMzQ1XCIsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyBhIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiAnYWJcXG4wMjM0NScsIGN1cnNvcjogWzEsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6ICdhYlxcbjIzNDUnLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwJ1xuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiAnYWJcXG4yMzQ1JywgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogJ2FiMjM0NScsIGN1cnNvcjogWzAsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ1xcbidcblxuICAgIGRlc2NyaWJlIFwib24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgaXQgXCJkZWxldGVzIG5vdGhpbmcgd2hlbiB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgZmFsc2VcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgZmFsc2UpXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbmV3bGluZSB3aGVuIHdyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiBcIjAxMjM0NVxcbmFiY2RlZlwiLCBjdXJzb3I6IFswLCA1XVxuXG4gIGRlc2NyaWJlIFwidGhlIGQga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMjM0NVxuICAgICAgICAgIGFiY2RlXG5cbiAgICAgICAgICBBQkNERVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgaXQgXCJlbnRlcnMgb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2QnLCBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGRcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIGFuZCBleGl0cyBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnZCBkJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG5cbiAgICAgICAgICAgIEFCQ0RFXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImFiY2RlXFxuXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIGxhc3QgbGluZSBhbmQgYWx3YXlzIG1ha2Ugbm9uLWJsYW5rLWxpbmUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJzIgZCBkJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBhYmNkZVxcblxuICAgICAgICAgICAgXCJcIlwiLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwibGVhdmVzIHRoZSBjdXJzb3Igb24gdGhlIGZpcnN0IG5vbmJsYW5rIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMTIzNHw1XG4gICAgICAgICAgICBhYmNkZVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2QgZCcsXG4gICAgICAgICAgdGV4dEM6IFwiICB8YWJjZGVcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ1bmRvIGJlaGF2aW9yXCIsIC0+XG4gICAgICBbb3JpZ2luYWxUZXh0LCBpbml0aWFsVGV4dENdID0gW11cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgaW5pdGlhbFRleHRDID0gXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICBhfGJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcblxuICAgICAgaXQgXCJ1bmRvZXMgYm90aCBsaW5lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgMiBkJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICB8UVdFUlRcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbyBpcyB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICAgICAgaXQgXCJjbGVhciBtdWx0aXBsZSBjdXJzb3JzIGFuZCBzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGNoYW5nZXMgb2YgbGFzdCBjdXJzb3JcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHRcbiAgICAgICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMV1dXG5cbiAgICAgICAgICAgIGVuc3VyZSAnZCBsJyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MjM0NVxuICAgICAgICAgICAgICBhfGNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgICBhfGJjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICAgICAgZW5zdXJlICdjdHJsLXInLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDIzNDVcbiAgICAgICAgICAgICAgYXxjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBhbmQgc2V0IGN1cnNvciB0byBzdGFydCBvZiBjaGFuZ2VzIG9mIGxhc3QgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgICAgICAgIGN1cnNvcjogW1sxLCAxXSwgWzAsIDBdXVxuXG4gICAgICAgICAgICBlbnN1cmUgJ2QgbCcsXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAyMzQ1XG4gICAgICAgICAgICAgIGFjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGN1cnNvcjogW1sxLCAxXSwgWzAsIDBdXVxuXG4gICAgICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgICAgICBhYmNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICAgICAgICBlbnN1cmUgJ2N0cmwtcicsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDIzNDVcbiAgICAgICAgICAgICAgYWNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICAgIGRlc2NyaWJlIFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbyBpcyBmYWxzZVwiLCAtPlxuICAgICAgICAgIGluaXRpYWxUZXh0QyA9IG51bGxcblxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGluaXRpYWxUZXh0QyA9IFwiXCJcIlxuICAgICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgICAgYXxiY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3NldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8nLCBmYWxzZSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgICAgICBlbnN1cmUgJ2QgbCcsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDIzNDVcbiAgICAgICAgICAgICAgYXxjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBpdCBcInB1dCBjdXJzb3IgdG8gZW5kIG9mIGNoYW5nZSAod29ya3MgaW4gc2FtZSB3YXkgb2YgYXRvbSdzIGNvcmU6dW5kbylcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICAgIHRleHRDOiBpbml0aWFsVGV4dENcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbJycsICcnXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgd1wiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBuZXh0IHdvcmQgdW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZSBhbmQgZXhpdHMgb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnYWJjZCBlZmdcXG5hYmMnLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJ2QgdycsXG4gICAgICAgICAgdGV4dDogXCJhYmNkIFxcbmFiY1wiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcImRlbGV0ZXMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnYWJjZCBlZmcnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2QgdycsIHRleHQ6ICdhYmVmZycsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZSBmb3VyJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdkIDMgdycsIHRleHQ6ICdmb3VyJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhbiBpd1wiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBjb250YWluaW5nIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDUgYWJjZGUgQUJDREVcIiwgY3Vyc29yOiBbMCwgOV1cblxuICAgICAgICBlbnN1cmUgJ2QnLCBtb2RlOiAnb3BlcmF0b3ItcGVuZGluZydcblxuICAgICAgICBlbnN1cmUgJ2kgdycsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NSAgQUJDREVcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYmNkZSdcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgalwiLCAtPlxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbmV4dCB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgaicsIHRleHQ6ICdBQkNERVxcbidcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbGFzdCB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgaicsIHRleHQ6ICcxMjM0NVxcbidcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiBibGFuayBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhXG5cblxuICAgICAgICAgICAgICBiXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgaXQgXCJkZWxldGVzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgaicsIHRleHQ6IFwiYVxcbmJcXG5cIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhbiBrXCIsIC0+XG4gICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgICAgMTIzNDVcbiAgICAgICAgYWJjZGVcbiAgICAgICAgQUJDREVcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBlbmQgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDRdXG4gICAgICAgICAgZW5zdXJlICdkIGsnLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICB4aXQgXCJkZWxldGVzIG5vdGhpbmdcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgaycsIHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gb24gdGhlIG1pZGRsZSBvZiBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGZpcnN0IHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnZCBrJywgdGV4dDogJ0FCQ0RFJ1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIGJsYW5rIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIGFcblxuXG4gICAgICAgICAgICAgIGJcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZXMgYm90aCBsaW5lc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBrJywgdGV4dDogXCJhXFxuYlxcblwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgRycsIHRleHQ6ICcxMjM0NVxcbidcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgRycsIHRleHQ6ICcxMjM0NVxcbidcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGdvdG8gbGluZSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZCAyIEcnLCB0ZXh0OiAnMTIzNDVcXG5BQkNERSdcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgMiBHJywgdGV4dDogJzEyMzQ1XFxuQUJDREUnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSB0KVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIHRoZSBlbnRpcmUgbGluZSB5YW5rZWQgYmVmb3JlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJ0ZXN0ICh4eXopXCIsIGN1cnNvcjogWzAsIDZdXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIHVudGlsIHRoZSBjbG9zaW5nIHBhcmVudGhlc2lzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIHQgKScsXG4gICAgICAgICAgICB0ZXh0OiAndGVzdCAoKSdcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG5cbiAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIGVhY2ggc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgMTIzNFxuICAgICAgICAgICAgQUJDRFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDFdLCBbMSwgMl0sIFsyLCAzXV1cblxuICAgICAgICBlbnN1cmUgJ2QgZScsXG4gICAgICAgICAgdGV4dDogXCJhXFxuMTJcXG5BQkNcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDFdLCBbMiwgMl1dXG5cbiAgICAgIGl0IFwiZG9lc24ndCBkZWxldGUgZW1wdHkgc2VsZWN0aW9uc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImFiY2RcXG5hYmNcXG5hYmRcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdLCBbMiwgMF1dXG5cbiAgICAgICAgZW5zdXJlICdkIHQgZCcsXG4gICAgICAgICAgdGV4dDogXCJkXFxuYWJjXFxuZFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF0sIFsyLCAwXV1cblxuICAgIGRlc2NyaWJlIFwic3RheU9uRGVsZXRlIHNldHRpbmdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25EZWxldGUnLCB0cnVlKVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX19fMzMzM1xuICAgICAgICAgIF9fMjIyMlxuICAgICAgICAgIF8xMTExXG4gICAgICAgICAgX18yMjIyXG4gICAgICAgICAgX19fMzMzM1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IHJhbmdlIGlzIGxpbmV3aXNlIHJhbmdlXCIsIC0+XG4gICAgICAgIGl0IFwia2VlcCBvcmlnaW5hbCBjb2x1bW4gYWZ0ZXIgZGVsZXRlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBkXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfXzIyMjJcXG5fMTExMVxcbl9fMjIyMlxcbl9fXzMzMzNcXG5cIlxuICAgICAgICAgIGVuc3VyZSBcIi5cIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl8xMTExXFxuX18yMjIyXFxuX19fMzMzM1xcblwiXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX18yMjIyXFxuX19fMzMzM1xcblwiXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX19fMzMzM1xcblwiXG5cbiAgICAgICAgaXQgXCJ2X0QgYWxzbyBrZWVwIG9yaWdpbmFsIGNvbHVtbiBhZnRlciBkZWxldGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ2IDIgaiBEXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfXzIyMjJcXG5fX18zMzMzXFxuXCJcblxuICAgICAgZGVzY3JpYmUgXCJ0YXJnZXQgcmFuZ2UgaXMgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJ0YXJnZXQgaXMgaW5kZW50XCIsIC0+XG4gICAgICAgICAgaW5kZW50VGV4dCA9IFwiXCJcIlxuICAgICAgICAgIDAwMDAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAgIDIyMjIyMjIyMjIyMjIyXG4gICAgICAgICAgICAyMjIyMjIyMjIyMjIyMlxuICAgICAgICAgICAgMjIyMjIyMjIyMjIyMjJcbiAgICAgICAgICAwMDAwMDAwMDAwMDAwMDAwXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgdGV4dERhdGEgPSBuZXcgVGV4dERhdGEoaW5kZW50VGV4dClcbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogdGV4dERhdGEuZ2V0UmF3KClcblxuICAgICAgICAgIGl0IFwiW2Zyb20gdG9wXSBrZWVwIGNvbHVtblwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgaScsIGN1cnNvcjogWzEsIDEwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzAsIDRdKVxuICAgICAgICAgIGl0IFwiW2Zyb20gbWlkZGxlXSBrZWVwIGNvbHVtblwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgaScsIGN1cnNvcjogWzEsIDEwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzAsIDRdKVxuICAgICAgICAgIGl0IFwiW2Zyb20gYm90dG9tXSBrZWVwIGNvbHVtblwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDEwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgaScsIGN1cnNvcjogWzEsIDEwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoWzAsIDRdKVxuXG4gICAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IGlzIHBhcmFncmFwaFwiLCAtPlxuICAgICAgICAgIHBhcmFncmFwaFRleHQgPSBcIlwiXCJcbiAgICAgICAgICAgIHAxLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDEtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAgICAgcDItLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAyLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMi0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgICAgICBwMy0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDMtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAzLS0tLS0tLS0tLS0tLS0tXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIHRleHREYXRhID0gbmV3IFRleHREYXRhKHBhcmFncmFwaFRleHQpXG4gICAgICAgICAgUDEgPSBbMCwgMSwgMl1cbiAgICAgICAgICBCMSA9IDNcbiAgICAgICAgICBQMiA9IFs0LCA1LCA2XVxuICAgICAgICAgIEIyID0gN1xuICAgICAgICAgIFAzID0gWzgsIDksIDEwXVxuICAgICAgICAgIEIzID0gMTFcblxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiB0ZXh0RGF0YS5nZXRSYXcoKVxuXG4gICAgICAgICAgaXQgXCJzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGRlbGV0aW9uIGFmdGVyIGRlbGV0ZSBbZnJvbSBib3R0b20gb2YgcGFyYWdyYXBoXVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBwJywgY3Vyc29yOiBbMCwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMS4uQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIFAzLi4uLCBCM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICdqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICBpdCBcInNldCBjdXJzb3IgdG8gc3RhcnQgb2YgZGVsZXRpb24gYWZ0ZXIgZGVsZXRlIFtmcm9tIG1pZGRsZSBvZiBwYXJhZ3JhcGhdXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIHAnLCBjdXJzb3I6IFswLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLi5CM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICcyIGogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBQMy4uLiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMiBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICBpdCBcInNldCBjdXJzb3IgdG8gc3RhcnQgb2YgZGVsZXRpb24gYWZ0ZXIgZGVsZXRlIFtmcm9tIGJvdHRvbSBvZiBwYXJhZ3JhcGhdXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIHAnLCBjdXJzb3I6IFswLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLi5CM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICczIGogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBQMy4uLiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMyBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgQjNdLCBjaG9tcDogdHJ1ZSlcblxuICBkZXNjcmliZSBcInRoZSBEIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIDAwMDBcbiAgICAgICAgMTExMVxuICAgICAgICAyMjIyXG4gICAgICAgIDMzMzNcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGNvbnRlbnRzIHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnRCcsIHRleHQ6IFwiMFxcbjExMTFcXG4yMjIyXFxuMzMzM1wiXG5cbiAgICBpdCBcImluIHZpc3VhbC1tb2RlLCBpdCBkZWxldGUgd2hvbGUgbGluZVwiLCAtPlxuICAgICAgZW5zdXJlICd2IEQnLCB0ZXh0OiBcIjExMTFcXG4yMjIyXFxuMzMzM1wiXG4gICAgICBlbnN1cmUgXCJ2IGogRFwiLCB0ZXh0OiBcIjMzMzNcIlxuXG4gIGRlc2NyaWJlIFwidGhlIHkga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIDAxMiB8MzQ1XG4gICAgICAgIGFiY1xcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciBlbmFibGVkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlKVxuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSgnX19fX19fX19fX18nKVxuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdfX19fX19fX19fXydcblxuICAgICAgZGVzY3JpYmUgXCJyZWFkL3dyaXRlIHRvIGNsaXBib2FyZCB0aHJvdWdoIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGl0IFwid3JpdGVzIHRvIGNsaXBib2FyZCB3aXRoIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBzYXZlZFRleHQgPSAnMDEyIDM0NVxcbidcbiAgICAgICAgICBlbnN1cmUgJ3kgeScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBzYXZlZFRleHRcbiAgICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0JlKHNhdmVkVGV4dClcblxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUubGluZXdpc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMDAwMHwwMFxuICAgICAgICAgICAgMTExMTExXG4gICAgICAgICAgICAyMjIyMjJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgXCJzYXZlcyB0byByZWdpc3Rlcih0eXBlPWxpbmV3aXNlKSwgY3Vyc29yIG1vdmUgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiViBqIHlcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMDAwMDBcXG4xMTExMTFcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCBcInNhdmVzIHRvIHJlZ2lzdGVyKHR5cGU9bGluZXdpc2UpLCBjdXJzb3IgZG9lc24ndCBtb3ZlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlIFwiViBrIHlcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIxMTExMTFcXG4yMjIyMjJcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ1xuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5ibG9ja3dpc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAwMDAwMDBcbiAgICAgICAgICAxITExMTExXG4gICAgICAgICAgMjIyMjIyXG4gICAgICAgICAgMzMzMzMzXG4gICAgICAgICAgNHw0NDQ0NFxuICAgICAgICAgIDU1NTU1NVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgXCJjdHJsLXYgbCBsIGpcIixcbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIxMTFcIiwgXCIyMjJcIiwgXCI0NDRcIiwgXCI1NTVcIl1cbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3RheU9uWWFuayA9IGZhbHNlXCIsIC0+XG4gICAgICAgIGl0IFwicGxhY2UgY3Vyc29yIGF0IHN0YXJ0IG9mIGJsb2NrIGFmdGVyIHlhbmtcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5XCIsXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgMDAwMDAwXG4gICAgICAgICAgICAgIDEhMTExMTFcbiAgICAgICAgICAgICAgMjIyMjIyXG4gICAgICAgICAgICAgIDMzMzMzM1xuICAgICAgICAgICAgICA0fDQ0NDQ0XG4gICAgICAgICAgICAgIDU1NTU1NVxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzdGF5T25ZYW5rID0gdHJ1ZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25ZYW5rJywgdHJ1ZSlcbiAgICAgICAgaXQgXCJwbGFjZSBjdXJzb3IgYXQgaGVhZCBvZiBibG9jayBhZnRlciB5YW5rXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieVwiLFxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgIDAwMDAwMFxuICAgICAgICAgICAgICAxMTExMTFcbiAgICAgICAgICAgICAgMjIyITIyMlxuICAgICAgICAgICAgICAzMzMzMzNcbiAgICAgICAgICAgICAgNDQ0NDQ0XG4gICAgICAgICAgICAgIDU1NXw1NTVcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInkgeVwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyB0byByZWdpc3Rlcih0eXBlPWxpbmV3aXNlKSwgY3Vyc29yIHN0YXkgYXQgc2FtZSBwb3NpdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeScsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgIGl0IFwiW04geSB5XSB5YW5rIE4gbGluZSwgc3RhcnRpbmcgZnJvbSB0aGUgY3VycmVudFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgMiB5JyxcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAxMiAzNDVcXG5hYmNcXG5cIlxuICAgICAgaXQgXCJbeSBOIHldIHlhbmsgTiBsaW5lLCBzdGFydGluZyBmcm9tIHRoZSBjdXJyZW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMiB5IHknLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDEyIDM0NVxcbmFiY1xcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyB0aGUgbGluZSB0byB0aGUgYSByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSB5JywgcmVnaXN0ZXI6IGE6IHRleHQ6IFwiMDEyIDM0NVxcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggQSByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJhcHBlbmQgdG8gZXhpc3RpbmcgdmFsdWUgb2YgbG93ZXJjYXNlLW5hbWVkIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXCIgYSB5IHknLCByZWdpc3RlcjogYTogdGV4dDogXCIwMTIgMzQ1XFxuXCJcbiAgICAgICAgZW5zdXJlICdcIiBBIHkgeScsIHJlZ2lzdGVyOiBhOiB0ZXh0OiBcIjAxMiAzNDVcXG4wMTIgMzQ1XFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2UpXG5cbiAgICAgIGl0IFwieWFuayBmcm9tIGhlcmUgdG8gZGVzdG5hdGlvbiBvZiBtb3Rpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGUnLCBjdXJzb3I6IFswLCA0XSwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnMzQ1J31cblxuICAgICAgaXQgXCJkb2VzIG5vdCB5YW5rIHdoZW4gbW90aW9uIGZhaWxlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgdCB4JywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiB1bmRlZmluZWR9XG5cbiAgICAgIGl0IFwieWFuayBhbmQgbW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBoJyxcbiAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnICdcblxuICAgICAgaXQgXCJbd2l0aCBsaW5ld2lzZSBtb3Rpb25dIHlhbmsgYW5kIGRlc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgaicsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDEyIDM0NVxcbmFiY1xcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgdGV4dC1vYmpcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMiwgOF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcblxuICAgICAgICAgIDFzdCBwYXJhZ3JhcGhcbiAgICAgICAgICAxc3QgcGFyYWdyYXBoXG5cbiAgICAgICAgICAybiBwYXJhZ3JhcGhcbiAgICAgICAgICAybiBwYXJhZ3JhcGhcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiaW5uZXItd29yZCBhbmQgbW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBpIHcnLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcInBhcmFncmFwaFwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgNF1cblxuICAgICAgaXQgXCJ5YW5rIHRleHQtb2JqZWN0IGlubmVyLXBhcmFncmFwaCBhbmQgbW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBpIHAnLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMXN0IHBhcmFncmFwaFxcbjFzdCBwYXJhZ3JhcGhcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgICAgMTIzNDVcbiAgICAgICAgYWJjZGVcbiAgICAgICAgQUJDREVcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgaXQgXCJ5YW5rIGFuZCBkb2Vzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ3kgRycsXG4gICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcImFiY2RlXFxuQUJDREVcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcInlhbmsgYW5kIGRvZXNuJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAneSBHJyxcbiAgICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjZGVcXG5BQkNERVxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBnb3RvIGxpbmUgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgMiBHIFAnLCB0ZXh0OiAnMTIzNDVcXG5hYmNkZVxcbmFiY2RlXFxuQUJDREUnXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICd5IDIgRyBQJywgdGV4dDogJzEyMzQ1XFxuYWJjZGVcXG5hYmNkZVxcbkFCQ0RFJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgZWFjaCBjdXJzb3IgYW5kIGNvcGllcyB0aGUgbGFzdCBzZWxlY3Rpb24ncyB0ZXh0XCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiICBhYmNkXFxuICAxMjM0XCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCA1XV1cbiAgICAgICAgZW5zdXJlICd5IF4nLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMTIzJ1xuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDJdXVxuXG4gICAgZGVzY3JpYmUgXCJzdGF5T25ZYW5rIHNldHRpbmdcIiwgLT5cbiAgICAgIHRleHQgPSBudWxsXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uWWFuaycsIHRydWUpXG5cbiAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAwXzIzNDU2N1xuICAgICAgICAgIDFfMjM0NTY3XG4gICAgICAgICAgMl8yMzQ1NjdcblxuICAgICAgICAgIDRfMjM0NTY3XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcImRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmsgZnJvbSBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ5IGkgcFwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjJdKVxuICAgICAgICBlbnN1cmUgXCJqIHkgeVwiLCBjdXJzb3I6IFsyLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzJdKVxuICAgICAgICBlbnN1cmUgXCJrIC5cIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgZW5zdXJlIFwieSBoXCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJfXCJcbiAgICAgICAgZW5zdXJlIFwieSBiXCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIxX1wiXG5cbiAgICAgIGl0IFwiZG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFuayBmcm9tIHZpc3VhbC1saW5ld2lzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJWIHlcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgZW5zdXJlIFwiViBqIHlcIiwgY3Vyc29yOiBbMiwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFsxLi4yXSlcblxuICAgICAgaXQgXCJkb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rIGZyb20gdmlzdWFsLWNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwidiBsIGwgeVwiLCBjdXJzb3I6IFsxLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0XCJcbiAgICAgICAgZW5zdXJlIFwidiBoIGggeVwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0XCJcbiAgICAgICAgZW5zdXJlIFwidiBqIHlcIiwgY3Vyc29yOiBbMiwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjIzNDU2N1xcbjJfMlwiXG4gICAgICAgIGVuc3VyZSBcInYgMiBrIHlcIiwgY3Vyc29yOiBbMCwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjIzNDU2N1xcbjFfMjM0NTY3XFxuMl8yXCJcblxuICBkZXNjcmliZSBcInRoZSB5eSBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJvbiBhIHNpbmdsZSBsaW5lIGZpbGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiZXhjbGFtYXRpb24hXFxuXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY29waWVzIHRoZSBlbnRpcmUgbGluZSBhbmQgcGFzdGVzIGl0IGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeSBwJyxcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJleGNsYW1hdGlvbiFcXG5cIlxuICAgICAgICAgIHRleHQ6IFwiZXhjbGFtYXRpb24hXFxuZXhjbGFtYXRpb24hXFxuXCJcblxuICAgIGRlc2NyaWJlIFwib24gYSBzaW5nbGUgbGluZSBmaWxlIHdpdGggbm8gbmV3bGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJubyBuZXdsaW5lIVwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImNvcGllcyB0aGUgZW50aXJlIGxpbmUgYW5kIHBhc3RlcyBpdCBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IHkgcCcsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwibm8gbmV3bGluZSFcXG5cIlxuICAgICAgICAgIHRleHQ6IFwibm8gbmV3bGluZSFcXG5ubyBuZXdsaW5lIVxcblwiXG5cbiAgICAgIGl0IFwiY29waWVzIHRoZSBlbnRpcmUgbGluZSBhbmQgcGFzdGVzIGl0IHJlc3BlY3RpbmcgY291bnQgYW5kIG5ldyBsaW5lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeSAyIHAnLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIm5vIG5ld2xpbmUhXFxuXCJcbiAgICAgICAgICB0ZXh0OiBcIm5vIG5ld2xpbmUhXFxubm8gbmV3bGluZSFcXG5ubyBuZXdsaW5lIVxcblwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgWSBrZXliaW5kaW5nXCIsIC0+XG4gICAgdGV4dCA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB0ZXh0ID0gXCJcIlwiXG4gICAgICAwMTIgMzQ1XG4gICAgICBhYmNcXG5cbiAgICAgIFwiXCJcIlxuICAgICAgc2V0IHRleHQ6IHRleHQsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInNhdmVzIHRoZSBsaW5lIHRvIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJ1knLCBjdXJzb3I6IFswLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDEyIDM0NVxcblwiXG5cbiAgICBpdCBcInlhbmsgdGhlIHdob2xlIGxpbmVzIHRvIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJ3YgaiBZJywgY3Vyc29yOiBbMCwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0XG5cbiAgZGVzY3JpYmUgXCJZYW5rRGlmZkh1bmtcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgIC0tLSBmaWxlICAgICAgICAyMDE3LTEyLTI0IDE1OjExOjMzLjAwMDAwMDAwMCArMDkwMFxuICAgICAgICArKysgZmlsZS1uZXcgICAgMjAxNy0xMi0yNCAxNToxNTowOS4wMDAwMDAwMDAgKzA5MDBcbiAgICAgICAgQEAgLTEsOSArMSw5IEBAXG4gICAgICAgICBsaW5lIDBcbiAgICAgICAgK2xpbmUgMC0xXG4gICAgICAgICBsaW5lIDFcbiAgICAgICAgLWxpbmUgMlxuICAgICAgICArbGluZSAxLTFcbiAgICAgICAgIGxpbmUgM1xuICAgICAgICAtbGluZSA0XG4gICAgICAgICBsaW5lIDVcbiAgICAgICAgLWxpbmUgNlxuICAgICAgICAtbGluZSA3XG4gICAgICAgICtsaW5lIDctMVxuICAgICAgICArbGluZSA3LTJcbiAgICAgICAgIGxpbmUgOFxcblxuICAgICAgICBcIlwiXCJcblxuICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWUpXG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSgnX19fX19fX19fX18nKVxuICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnX19fX19fX19fX18nXG5cbiAgICBpdCBcInlhbmsgZGlmZi1odW5rIHVuZGVyIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlWWFua2VkVGV4dCA9IChyb3csIHRleHQpIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFtyb3csIDBdXG4gICAgICAgIGRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAndmltLW1vZGUtcGx1czp5YW5rLWRpZmYtaHVuaycpXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dFxuXG4gICAgICBlbnN1cmVZYW5rZWRUZXh0IDIsIFwiX19fX19fX19fX19cIiAjIGRvIG5vdGhpbmdcbiAgICAgIGVuc3VyZVlhbmtlZFRleHQgNCwgXCJsaW5lIDAtMVxcblwiXG4gICAgICBlbnN1cmVZYW5rZWRUZXh0IDYsIFwibGluZSAyXFxuXCJcbiAgICAgIGVuc3VyZVlhbmtlZFRleHQgNywgXCJsaW5lIDEtMVxcblwiXG4gICAgICBlbnN1cmVZYW5rZWRUZXh0IDksIFwibGluZSA0XFxuXCJcbiAgICAgIGVuc3VyZVlhbmtlZFRleHQgMTEsIFwibGluZSA2XFxubGluZSA3XFxuXCJcbiAgICAgIGVuc3VyZVlhbmtlZFRleHQgMTIsIFwibGluZSA2XFxubGluZSA3XFxuXCJcbiAgICAgIGVuc3VyZVlhbmtlZFRleHQgMTMsIFwibGluZSA3LTFcXG5saW5lIDctMlxcblwiXG4gICAgICBlbnN1cmVZYW5rZWRUZXh0IDE0LCBcImxpbmUgNy0xXFxubGluZSA3LTJcXG5cIlxuXG4gIGRlc2NyaWJlIFwidGhlIHAga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBzaW5nbGUgbGluZSBjaGFyYWN0ZXIgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlKVxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8MDEyXFxuXCJcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdhJzogdGV4dDogJ2EnXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKFwiY2xpcFwiKVxuXG4gICAgICBkZXNjcmliZSBcImZyb20gdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInBcIiwgdGV4dEM6IFwiMDM0fDUxMlxcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwiYXQgdGhlIGVuZCBvZiBhIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIwMXwyXFxuXCJcbiAgICAgICAgaXQgXCJwb3NpdGlvbnMgY3Vyc29yIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInBcIiwgdGV4dEM6IFwiMDEyMzR8NVxcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwicGFzdGUgdG8gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICBpdCBcInBhc3RlIGNvbnRlbnQgdG8gdGhhdCBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxc3RcbiAgICAgICAgICAgIHxcbiAgICAgICAgICAgIDNyZFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzJuZCdcblxuICAgICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxc3RcbiAgICAgICAgICAgIDJufGRcbiAgICAgICAgICAgIDNyZFxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciBlbmFibGVkXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBmcm9tIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlKVxuICAgICAgICAgIGVuc3VyZSAncCcsIHRleHRDOiBcIjBjbGl8cDEyXFxuXCJcblxuICAgICAgZGVzY3JpYmUgXCJmcm9tIGEgc3BlY2lmaWVkIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlICdhJyByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXCIgYSBwJywgdGV4dEM6IFwiMHxhMTJcXG5cIixcblxuICAgICAgZGVzY3JpYmUgXCJhdCB0aGUgZW5kIG9mIGEgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgYmVmb3JlIHRoZSBjdXJyZW50IGxpbmUncyBuZXdsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBhYmNkZVxuICAgICAgICAgICAgb25lIHx0d28gdGhyZWVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZCAkIGsgJCBwJyxcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICBhYmNkZXR3byB0aHJlfGVcbiAgICAgICAgICAgIG9uZV9cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpbGluZSBjaGFyYWN0ZXIgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwwMTJcXG5cIlxuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDVcXG42NzgnXG5cbiAgICAgIGl0IFwicCBwbGFjZSBjdXJzb3IgYXQgc3RhcnQgb2YgbXV0YXRpb25cIiwgLT4gZW5zdXJlIFwicFwiLCB0ZXh0QzogXCIwfDM0NVxcbjY3ODEyXFxuXCJcbiAgICAgIGl0IFwiUCBwbGFjZSBjdXJzb3IgYXQgc3RhcnQgb2YgbXV0YXRpb25cIiwgLT4gZW5zdXJlIFwiUFwiLCB0ZXh0QzogXCJ8MzQ1XFxuNjc4MDEyXFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBsaW5ld2lzZSBjb250ZW50c1wiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJvbiBhIHNpbmdsZSBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiAnMHwxMidcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIgMzQ1XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgMDEyXG4gICAgICAgICAgICBffDM0NVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJyZXBsYWNlcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gYW5kIHB1dCBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXIgb2YgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAndiBwJywgIyAnMScgd2FzIHJlcGxhY2VkXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgMFxuICAgICAgICAgICAgX3wzNDVcbiAgICAgICAgICAgIDJcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIm9uIG11bHRpcGxlIGxpbmVzXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDEyXG4gICAgICAgICAgICAgMzQ1XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIgNDU2XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlciBhdCBtaWRkbGUgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIGVuc3VyZSBcInBcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgIHw0NTZcbiAgICAgICAgICAgICAzNDVcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXIgYXQgZW5kIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMDEyXG4gICAgICAgICAgICAgMzQ1XG4gICAgICAgICAgICAgfDQ1NlxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgbGluZXdpc2UgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDAxMlxuICAgICAgICAgIHxhYmNcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiIDM0NVxcbiA2NzhcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cblxuICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAwMTJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICAgfDM0NVxuICAgICAgICAgICA2NzhcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwicHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQgY29tbWFuZFwiLCAtPlxuICAgICAgZW5zdXJlUHV0QWZ0ZXJXaXRoQXV0b0luZGVudCA9IChvcHRpb25zKSAtPlxuICAgICAgICBkaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6cHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQnKVxuICAgICAgICBlbnN1cmUobnVsbCwgb3B0aW9ucylcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2UpXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKS50aGVuIC0+XG4gICAgICAgICAgICBzZXQgZ3JhbW1hcjogJ3NvdXJjZS5qcydcblxuICAgICAgZGVzY3JpYmUgXCJwYXN0ZSB3aXRoIGF1dG8taW5kZW50XCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOlxuICAgICAgICAgICAgICB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgICAgICAgIHRleHQ6IFwiIDM0NVxcblwiLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgaWZ8ICgpIHtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmVQdXRBZnRlcldpdGhBdXRvSW5kZW50XG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICBpZiAoKSB7XG4gICAgICAgICAgICAgICAgfDM0NVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIm11bHRpLWxpbmUgcmVnaXN0ZXIgY29udGVudHMgd2l0aCBhdXRvIGluZGVudFwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6XG4gICAgICAgICAgICAgIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgICAgaWYoMykge1xuICAgICAgICAgICAgICAgICAgaWYoNCkge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgICAgfGlmICgyKSB7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZVB1dEFmdGVyV2l0aEF1dG9JbmRlbnRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgIGlmICgyKSB7XG4gICAgICAgICAgICAgICAgfGlmKDMpIHtcbiAgICAgICAgICAgICAgICAgIGlmKDQpIHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHBhc3RpbmcgYWxyZWFkeSBpbmRlbnRlZCBtdWx0aS1saW5lcyByZWdpc3RlciBjb250ZW50XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgIHxpZiAoMikge1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImtlZXAgb3JpZ2luYWwgbGF5b3V0XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOlxuICAgICAgICAgICAgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgICBhOiAxMjMsXG4gICAgICAgICAgICBiYmJiOiA0NTYsXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmVQdXRBZnRlcldpdGhBdXRvSW5kZW50XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICBpZiAoMikge1xuICAgICAgICAgICAgICAgICAgIHxhOiAxMjMsXG4gICAgICAgICAgICAgICAgYmJiYjogNDU2LFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImtlZXAgb3JpZ2luYWwgbGF5b3V0IFtyZWdpc3RlciBjb250ZW50IGhhdmUgYmxhbmsgcm93XVwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzpcbiAgICAgICAgICAgIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBpZigzKSB7XG4gICAgICAgICAgICAgIF9fYWJjXG5cbiAgICAgICAgICAgICAgX19kZWZcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcIlwiXCIucmVwbGFjZSgvXy9nLCAnICcpXG4gICAgICAgICAgZW5zdXJlUHV0QWZ0ZXJXaXRoQXV0b0luZGVudFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgaWYgKDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoMikge1xuICAgICAgICAgICAgICAgICAgfGlmKDMpIHtcbiAgICAgICAgICAgICAgICAgICAgYWJjXG5cbiAgICAgICAgICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJwYXN0aW5nIHR3aWNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXFxuUVdFUlRcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxMjMnXG4gICAgICAgIGVuc3VyZSAnMiBwJ1xuXG4gICAgICBpdCBcImluc2VydHMgdGhlIHNhbWUgbGluZSB0d2ljZVwiLCAtPlxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dDogXCIxMjM0NVxcbmFiMTIzMTIzY2RlXFxuQUJDREVcXG5RV0VSVFwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB1bmRvbmVcIiwgLT5cbiAgICAgICAgaXQgXCJyZW1vdmVzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVxcblFXRVJUXCJcblxuICAgIGRlc2NyaWJlIFwic3VwcG9ydCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICBpdCBcInBhc3RlIHRleHQgZm9yIGVhY2ggY3Vyc29yc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVxcblFXRVJUXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFsyLCAwXV1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ1paWidcbiAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYVpaWmJjZGVcXG5BWlpaQkNERVxcblFXRVJUXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMSwgM10sIFsyLCAzXV1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAnMDEyXFxuJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICBkZXNjcmliZSBcIndpdGggY2hhcmFjdGVyd2lzZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJyZXBsYWNlcyBzZWxlY3Rpb24gd2l0aCBjaGFyd2lzZSBjb250ZW50XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjM0NVwiXG4gICAgICAgICAgZW5zdXJlICd2IHAnLCB0ZXh0OiBcIjAzNDUyXFxuXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggbGluZXdpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcXG5cIlxuICAgICAgICAgIGVuc3VyZSAndiBwJywgdGV4dDogXCIwXFxuMzQ1XFxuMlxcblwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggbGluZXdpc2Ugc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggY2hhcndpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIjAxMlxcbmFiY1wiLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcIlxuICAgICAgICAgIGVuc3VyZSAnViBwJywgdGV4dDogXCIzNDVcXG5hYmNcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJyZXBsYWNlcyBzZWxlY3Rpb24gd2l0aCBsaW5ld2lzZSBjb250ZW50XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjM0NVxcblwiXG4gICAgICAgICAgZW5zdXJlICdWIHAnLCB0ZXh0OiBcIjM0NVxcblwiLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIFAga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBjaGFyYWN0ZXIgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyXFxuXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYSdcbiAgICAgICAgZW5zdXJlICdQJ1xuXG4gICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyIGFib3ZlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBudWxsLCB0ZXh0OiBcIjM0NTAxMlxcblwiLCBjdXJzb3I6IFswLCAyXVxuXG4gIGRlc2NyaWJlIFwidGhlIC4ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIjEyXFxuMzRcXG41Nlxcbjc4XCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdHMgdGhlIGxhc3Qgb3BlcmF0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJzIgZCBkIC4nLCB0ZXh0OiBcIlwiXG5cbiAgICBpdCBcImNvbXBvc2VzIHdpdGggbW90aW9uc1wiLCAtPlxuICAgICAgZW5zdXJlICdkIGQgMiAuJywgdGV4dDogXCI3OFwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgciBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAxMlxuICAgICAgICAzNFxuICAgICAgICBcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdXVxuXG4gICAgaXQgXCJyZXBsYWNlcyBhIHNpbmdsZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZVdhaXQgJ3IgeCcsIHRleHQ6ICd4Mlxcbng0XFxuXFxuJ1xuXG4gICAgaXQgXCJyZW1haW4gdmlzdWFsLW1vZGUgd2hlbiBjYW5jZWxsZWRcIiwgLT5cbiAgICAgIGVuc3VyZVdhaXQgJ3YgciBlc2NhcGUnLFxuICAgICAgICB0ZXh0OiAnMTJcXG4zNFxcblxcbidcbiAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG5cbiAgICBpdCBcInJlcGxhY2VzIGEgc2luZ2xlIGNoYXJhY3RlciB3aXRoIGEgbGluZSBicmVha1wiLCAtPlxuICAgICAgZW5zdXJlV2FpdCAnciBlbnRlcicsXG4gICAgICAgIHRleHQ6ICdcXG4yXFxuXFxuNFxcblxcbidcbiAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMywgMF1dXG5cbiAgICBpdCBcImF1dG8gaW5kZW50IHdoZW4gcmVwbGFjZWQgd2l0aCBzaW5nZSBuZXcgbGluZVwiLCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYXxiY1xuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZVdhaXQgJ3IgZW50ZXInLFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2FcbiAgICAgICAgX198Y1xuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwiY29tcG9zZXMgcHJvcGVybHkgd2l0aCBtb3Rpb25zXCIsIC0+XG4gICAgICBlbnN1cmVXYWl0ICcyIHIgeCcsIHRleHQ6ICd4eFxcbnh4XFxuXFxuJ1xuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICBlbnN1cmVXYWl0ICdyIHgnLCB0ZXh0OiAnMTJcXG4zNFxcblxcbidcblxuICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGFza2VkIHRvIHJlcGxhY2UgbW9yZSBjaGFyYWN0ZXJzIHRoYW4gdGhlcmUgYXJlIG9uIGEgbGluZVwiLCAtPlxuICAgICAgZW5zdXJlV2FpdCAnMyByIHgnLCB0ZXh0OiAnMTJcXG4zNFxcblxcbidcblxuICAgIGRlc2NyaWJlIFwiY2FuY2VsbGF0aW9uXCIsIC0+XG4gICAgICBpdCBcImRvZXMgbm90aGluZyB3aGVuIGNhbmNlbGxlZFwiLCAtPlxuICAgICAgICBlbnN1cmVXYWl0ICdyIGVzY2FwZScsIHRleHQ6ICcxMlxcbjM0XFxuXFxuJywgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJrZWVwIG11bHRpLWN1cnNvciBvbiBjYW5jZWxsZWRcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYVxcbiEgICAgYVxcbnwgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZVdhaXQgXCJyIGVzY2FwZVwiLCB0ZXh0QzogXCJ8ICAgIGFcXG4hICAgIGFcXG58ICAgIGFcXG5cIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICBpdCBcImtlZXAgbXVsdGktY3Vyc29yIG9uIGNhbmNlbGxlZFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgICAgdGV4dEM6IFwifCoqYVxcbiEqKmFcXG58KiphXFxuXCJcbiAgICAgICAgZW5zdXJlV2FpdCBcInYgbFwiLCAgICAgIHRleHRDOiBcIioqfGFcXG4qKiFhXFxuKip8YVxcblwiLCBzZWxlY3RlZFRleHQ6IFtcIioqXCIsIFwiKipcIiwgXCIqKlwiXSwgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICBlbnN1cmVXYWl0IFwiciBlc2NhcGVcIiwgdGV4dEM6IFwiKip8YVxcbioqIWFcXG4qKnxhXFxuXCIsIHNlbGVjdGVkVGV4dDogW1wiKipcIiwgXCIqKlwiLCBcIioqXCJdLCBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZW5zdXJlICd2IGUnXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgdGhlIGVudGlyZSBzZWxlY3Rpb24gd2l0aCB0aGUgZ2l2ZW4gY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZVdhaXQgJ3IgeCcsIHRleHQ6ICd4eFxcbnh4XFxuXFxuJ1xuXG4gICAgICBpdCBcImxlYXZlcyB0aGUgY3Vyc29yIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmVXYWl0ICdyIHgnLCBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXV1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBpbiB2aXN1YWwtYmxvY2sgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFsxLCA0XVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDoyMzQ1XG4gICAgICAgICAgICAxOiBvMTFvXG4gICAgICAgICAgICAyOiBvMjJvXG4gICAgICAgICAgICAzOiBvMzNvXG4gICAgICAgICAgICA0OiBvNDRvXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLXYgbCAzIGonLFxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogWycxMScsICcyMicsICczMycsICc0NCddLFxuXG4gICAgICBpdCBcInJlcGxhY2VzIGVhY2ggc2VsZWN0aW9uIGFuZCBwdXQgY3Vyc29yIG9uIHN0YXJ0IG9mIHRvcCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ3IgeCcsXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAwOjIzNDVcbiAgICAgICAgICAgICAgMTogb3h4b1xuICAgICAgICAgICAgICAyOiBveHhvXG4gICAgICAgICAgICAgIDM6IG94eG9cbiAgICAgICAgICAgICAgNDogb3h4b1xcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGVuc3VyZVdhaXQgJy4nLFxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMDoyMzQ1XG4gICAgICAgICAgICAgIHh4IG94eG9cbiAgICAgICAgICAgICAgeHggb3h4b1xuICAgICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICAgIHh4IG94eG9cXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgJ3RoZSBtIGtleWJpbmRpbmcnLCAtPlxuICAgIGVuc3VyZU1hcmtCeU1vZGUgPSAobW9kZSkgLT5cbiAgICAgIF9lbnN1cmUgPSBiaW5kRW5zdXJlV2FpdE9wdGlvbih7bW9kZX0pXG4gICAgICBfZW5zdXJlIFwibSBhXCIsIG1hcms6IFwiYVwiOiBbMCwgMl1cbiAgICAgIF9lbnN1cmUgXCJsIG0gYVwiLCBtYXJrOiBcImFcIjogWzAsIDNdXG4gICAgICBfZW5zdXJlIFwiaiBtIGFcIiwgbWFyazogXCJhXCI6IFsxLCAzXVxuICAgICAgX2Vuc3VyZSBcImogbSBiXCIsIG1hcms6IFwiYVwiOiBbMSwgM10sIFwiYlwiOiBbMiwgM11cbiAgICAgIF9lbnN1cmUgXCJsIG0gY1wiLCBtYXJrOiBcImFcIjogWzEsIDNdLCBcImJcIjogWzIsIDNdLCBcImNcIjogWzIsIDRdXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAwOnwgMTJcbiAgICAgICAgMTogMzRcbiAgICAgICAgMjogNTZcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcIltub3JtYWxdIGNhbiBtYXJrIG11bHRpcGxlIHBvc2l0b25cIiwgLT5cbiAgICAgIGVuc3VyZU1hcmtCeU1vZGUoXCJub3JtYWxcIilcbiAgICBpdCBcIlt2Q10gY2FuIG1hcmtcIiwgLT5cbiAgICAgIGVuc3VyZSBcInZcIlxuICAgICAgZW5zdXJlTWFya0J5TW9kZShbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdKVxuICAgIGl0IFwiW3ZMXSBjYW4gbWFya1wiLCAtPlxuICAgICAgZW5zdXJlIFwiVlwiXG4gICAgICBlbnN1cmVNYXJrQnlNb2RlKFtcInZpc3VhbFwiLCBcImxpbmV3aXNlXCJdKVxuXG4gIGRlc2NyaWJlICd0aGUgUiBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICA2Nzg5MFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJlbnRlcnMgcmVwbGFjZSBtb2RlIGFuZCByZXBsYWNlcyBjaGFyYWN0ZXJzXCIsIC0+XG4gICAgICBlbnN1cmUgJ1InLFxuICAgICAgICBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYWJcIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLFxuICAgICAgICB0ZXh0OiBcIjEyYWI1XFxuNjc4OTBcIlxuICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJjb250aW51ZXMgYmV5b25kIGVuZCBvZiBsaW5lIGFzIGluc2VydFwiLCAtPlxuICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiY2RlXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogJzEyYWJjZGVcXG42Nzg5MCdcblxuICAgIGl0ICd0cmVhdHMgYmFja3NwYWNlIGFzIHVuZG8nLCAtPlxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJmb29cIlxuICAgICAgZW5zdXJlICdSJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYlwiXG4gICAgICBlbnN1cmUgbnVsbCwgdGV4dDogXCIxMmZvb2FiNVxcbjY3ODkwXCJcblxuICAgICAgZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2NvcmU6YmFja3NwYWNlJylcbiAgICAgIGVuc3VyZSBudWxsLCB0ZXh0OiBcIjEyZm9vYTQ1XFxuNjc4OTBcIlxuXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImNcIlxuICAgICAgZW5zdXJlIG51bGwsIHRleHQ6IFwiMTJmb29hYzVcXG42Nzg5MFwiXG5cbiAgICAgIGRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAnY29yZTpiYWNrc3BhY2UnKVxuICAgICAgZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdjb3JlOmJhY2tzcGFjZScpXG4gICAgICBlbnN1cmUgbnVsbCwgdGV4dDogXCIxMmZvbzM0NVxcbjY3ODkwXCIsIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdjb3JlOmJhY2tzcGFjZScpXG4gICAgICBlbnN1cmUgbnVsbCwgdGV4dDogXCIxMmZvbzM0NVxcbjY3ODkwXCIsIHNlbGVjdGVkVGV4dDogJydcblxuICAgIGl0IFwiY2FuIGJlIHJlcGVhdGVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ1InXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJ1xuICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjEyYWI1XFxuNjdhYjBcIiwgY3Vyc29yOiBbMSwgM11cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmFiYWJcXG42N2FiMFwiLCBjdXJzb3I6IFswLCA1XVxuXG4gICAgaXQgXCJjYW4gYmUgaW50ZXJydXB0ZWQgYnkgYXJyb3cga2V5cyBhbmQgYmVoYXZlIGFzIGluc2VydCBmb3IgcmVwZWF0XCIsIC0+XG4gICAgICAjIEZJWE1FIGRvbid0IGtub3cgaG93IHRvIHRlc3QgdGhpcyAoYWxzbywgZGVwZW5kcyBvbiBQUiAjNTY4KVxuXG4gICAgaXQgXCJyZXBlYXRzIGNvcnJlY3RseSB3aGVuIGJhY2tzcGFjZSB3YXMgdXNlZCBpbiB0aGUgdGV4dFwiLCAtPlxuICAgICAgZW5zdXJlICdSJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXCJcbiAgICAgIGRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAnY29yZTpiYWNrc3BhY2UnKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJiXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJ1xuICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBcIjEyYjQ1XFxuNjdiOTBcIiwgY3Vyc29yOiBbMSwgMl1cbiAgICAgIHNldCBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmI0YlxcbjY3YjkwXCIsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcImRvZXNuJ3QgcmVwbGFjZSBhIGNoYXJhY3RlciBpZiBuZXdsaW5lIGlzIGVudGVyZWRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJcXG5cIlxuICAgICAgZW5zdXJlICdlc2NhcGUnLCB0ZXh0OiBcIjEyXFxuMzQ1XFxuNjc4OTBcIlxuXG4gICAgZGVzY3JpYmUgXCJtdWx0aWxpbmUgc2l0dWF0aW9uXCIsIC0+XG4gICAgICB0ZXh0T3JpZ2luYWwgPSBcIlwiXCJcbiAgICAgICAgMDEyMzRcbiAgICAgICAgNTY3ODlcbiAgICAgICAgXCJcIlwiXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0T3JpZ2luYWwsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcInJlcGxhY2UgY2hhcmFjdGVyIHVubGVzcyBpbnB1dCBpc250IG5ldyBsaW5lKFxcXFxuKVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXFxuYlxcbmNcIlxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIGMzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICBpdCBcImhhbmRsZSBiYWNrc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFcXG5iXFxuY1wiXG4gICAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMGFcbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIGM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgMV1cblxuICAgICAgICBkaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ2NvcmU6YmFja3NwYWNlJylcbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICAgIGRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAnY29yZTpiYWNrc3BhY2UnKVxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICAgIGRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAnY29yZTpiYWNrc3BhY2UnKVxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICAyMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIGRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAnY29yZTpiYWNrc3BhY2UnKVxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgICBkaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ2NvcmU6YmFja3NwYWNlJylcbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdjb3JlOmJhY2tzcGFjZScpICMgZG8gbm90aGluZ1xuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwicmVwZWF0ZSBtdWx0aWxpbmUgdGV4dCBjYXNlLTFcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYWJjXFxuZGVmXCJcbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgY3Vyc29yOiBbMSwgMl0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGVuc3VyZSAndScsIHRleHQ6IHRleHRPcmlnaW5hbFxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICA1NmFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFszLCAyXVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBpdCBcInJlcGVhdGUgbXVsdGlsaW5lIHRleHQgY2FzZS0yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiY1xcbmRcIlxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZDRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIGN1cnNvcjogWzEsIDBdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZDRcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkOVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICBkZXNjcmliZSAnQWRkQmxhbmtMaW5lQmVsb3csIEFkZEJsYW5rTGluZUFib3ZlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuICAgICAgICBsaXxuZTFcbiAgICAgICAgbGluZTJcbiAgICAgICAgbGluZTNcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICdlbnRlcic6ICd2aW0tbW9kZS1wbHVzOmFkZC1ibGFuay1saW5lLWJlbG93J1xuICAgICAgICAgICdzaGlmdC1lbnRlcic6ICd2aW0tbW9kZS1wbHVzOmFkZC1ibGFuay1saW5lLWFib3ZlJ1xuXG4gICAgaXQgXCJpbnNlcnQgYmxhbmsgbGluZSBiZWxvdy9hYm92ZVwiLCAtPlxuICAgICAgZW5zdXJlIFwiZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuICAgICAgICBsaXxuZTFcblxuICAgICAgICBsaW5lMlxuICAgICAgICBsaW5lM1xuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSBcInNoaWZ0LWVudGVyXCIsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgbGluZTBcblxuICAgICAgICBsaXxuZTFcblxuICAgICAgICBsaW5lMlxuICAgICAgICBsaW5lM1xuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwiW3dpdGgtY291bnRdIGluc2VydCBibGFuayBsaW5lIGJlbG93L2Fib3ZlXCIsIC0+XG4gICAgICBlbnN1cmUgXCIyIGVudGVyXCIsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgbGluZTBcbiAgICAgICAgbGl8bmUxXG5cblxuICAgICAgICBsaW5lMlxuICAgICAgICBsaW5lM1xuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSBcIjIgc2hpZnQtZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuXG5cbiAgICAgICAgbGl8bmUxXG5cblxuICAgICAgICBsaW5lMlxuICAgICAgICBsaW5lM1xuICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSAnU2VsZWN0IGFzIG9wZXJhdG9yJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXR0aW5ncy5zZXQoJ2tleW1hcFNUb1NlbGVjdCcsIHRydWUpXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgICBkZXNjcmliZSBcInNlbGVjdCBieSB0YXJnZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDAgfG9vbyB4eHggKioqXG4gICAgICAgICAgMSB4eHggKioqIG9vb1xuXG4gICAgICAgICAgMyBvb28geHh4ICoqKlxuICAgICAgICAgIDQgeHh4ICoqKiBvb29cXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJzZWxlY3QgdGV4dC1vYmplY3RcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwicyBwXCIsICMgcCBpcyBgaSBwYCBzaG9ydGhhbmQuXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwibGluZXdpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMCBvb28geHh4ICoqKlxcbjEgeHh4ICoqKiBvb29cXG5cIlxuICAgICAgICAgIHByb3BlcnR5SGVhZDogWzEsIDEzXVxuXG4gICAgICBpdCBcInNlbGVjdCBieSBtb3Rpb24gaiB3aXRoIHN0YXlPblNlbGVjdFRleHRPYmplY3RcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwic3RheU9uU2VsZWN0VGV4dE9iamVjdFwiLCB0cnVlKVxuICAgICAgICBlbnN1cmUgXCJzIGkgcFwiLFxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImxpbmV3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjAgb29vIHh4eCAqKipcXG4xIHh4eCAqKiogb29vXFxuXCJcbiAgICAgICAgICBwcm9wZXJ0eUhlYWQ6IFsxLCAyXVxuXG4gICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGluIHRleHQtb2JqZWN0IHdpdGggb2NjdXJyZW5jZS1tb2RpZmllclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJzIG8gcFwiLCAjIHAgaXMgYGkgcGAgc2hvcnRoYW5kLlxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiBbXG4gICAgICAgICAgICBbWzAsIDJdLCBbMCwgNV1dXG4gICAgICAgICAgICBbWzEsIDEwXSwgWzEsIDEzXV1cbiAgICAgICAgICBdXG5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gdGV4dC1vYmplY3Qgd2l0aCBwcmVzZXQtb2NjdXJyZW5jZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIG8gcyBwXCIsICMgcCBpcyBgaSBwYCBzaG9ydGhhbmQuXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFswLCA1XV1cbiAgICAgICAgICAgIFtbMSwgMTBdLCBbMSwgMTNdXVxuICAgICAgICAgIF1cblxuICAgICAgaXQgXCJjb252ZXJ0IHByZXNpc3RlbnQtc2VsZWN0aW9uIGludG8gbm9ybWFsIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ2IGogZW50ZXJcIixcbiAgICAgICAgICBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAxXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlOiBbXG4gICAgICAgICAgICBbWzAsIDJdLCBbMSwgM11dXG4gICAgICAgICAgXVxuXG4gICAgICAgIGVuc3VyZSBcImogaiB2IGpcIixcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDFcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFsxLCAzXV1cbiAgICAgICAgICBdXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJvb28geHh4ICoqKlxcbjQgeFwiXG5cbiAgICAgICAgIyBOb3cgaXQncyBzaG93IHRpbWUsIHRvIGNvbnZlcnQgcGVyc2lzdGVudCBzZWxlY3Rpb24gaW50byBub3JtYWwgc2VsZWN0aW9uXG4gICAgICAgICMgYnkgb25seSBgc2AuXG4gICAgICAgIGVuc3VyZSBcInNcIixcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wib29vIHh4eCAqKipcXG4xIHhcIiwgXCJvb28geHh4ICoqKlxcbjQgeFwiXVxuXG4gICAgICBpdCBcInNlbGVjdCBwcmVzZXQtb2NjdXJyZW5jZSBpbiBwcmVzaXN0ZW50LXNlbGVjdGlvbiBhbmQgbm9ybWFsIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIG9cIixcbiAgICAgICAgICBvY2N1cnJlbmNlVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nXVxuXG4gICAgICAgIGVuc3VyZSBcIlYgaiBlbnRlciBHIFZcIixcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDFcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCI0IHh4eCAqKiogb29vXFxuXCJcblxuICAgICAgICBlbnN1cmUgXCJzXCIsICMgTm90aWNlIGBvb29gIGluIHJvdyAzIGlzIEVYQ0xVREVELlxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMFxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFtcIm9vb1wiLCBcIm9vb1wiLCBcIm9vb1wiXVxuICAgICAgICAgIHNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiBbXG4gICAgICAgICAgICBbWzAsIDJdLCBbMCwgNV1dXG4gICAgICAgICAgICBbWzEsIDEwXSwgWzEsIDEzXV1cbiAgICAgICAgICAgIFtbNCwgMTBdLCBbNCwgMTNdXVxuICAgICAgICAgIF1cblxuICAgICAgaXQgXCJzZWxlY3QgYnkgbW90aW9uICRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwicyAkXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJvb28geHh4ICoqKlxcblwiXG5cbiAgICAgIGl0IFwic2VsZWN0IGJ5IG1vdGlvbiBqXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgalwiLFxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImxpbmV3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjAgb29vIHh4eCAqKipcXG4xIHh4eCAqKiogb29vXFxuXCJcblxuICAgICAgaXQgXCJzZWxlY3QgYnkgbW90aW9uIGogdi1tb2RpZmllclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJzIHYgalwiLFxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwib29vIHh4eCAqKipcXG4xIHhcIlxuXG4gICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGJ5IG1vdGlvbiBHXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgbyBHXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFswLCA1XV1cbiAgICAgICAgICAgIFtbMSwgMTBdLCBbMSwgMTNdXVxuICAgICAgICAgICAgW1szLCAyXSwgWzMsIDVdXVxuICAgICAgICAgICAgW1s0LCAxMF0sIFs0LCAxM11dXG4gICAgICAgICAgXVxuXG4gICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGJ5IG1vdGlvbiBHIHdpdGggZXhwbGljaXQgVi1tb2RpZmllclwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJzIG8gViBHXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwibGluZXdpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXG4gICAgICAgICAgICBcIjAgb29vIHh4eCAqKipcXG4xIHh4eCAqKiogb29vXFxuXCJcbiAgICAgICAgICAgIFwiMyBvb28geHh4ICoqKlxcbjQgeHh4ICoqKiBvb29cXG5cIlxuICAgICAgICAgIF1cblxuICAgICAgaXQgXCJyZXR1cm4gdG8gbm9ybWFsLW1vZGUgd2hlbiBmYWlsIHRvIHNlbGVjdFwiLCAtPlxuICAgICAgICAjIGF0dGVtcHQgdG8gc2VsZWN0IGlubmVyLWZ1bmN0aW9uIGJ1dCB0aGVyZSBpcyBubyBmdW5jdGlvbi5cbiAgICAgICAgZW5zdXJlIFwicyBpIGZcIixcbiAgICAgICAgICBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgICAjIGF0dGVtcHQgdG8gZmluZCAneicgYnV0IG5vIFwielwiLlxuICAgICAgICBlbnN1cmUgXCJzIGYgelwiLFxuICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImNvbXBsZXggc2NlbmFyaW9cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuanMnXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICAgICAgICAgICAgZm9yIChjb25zdCAhbWVtYmVyIG9mIG1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICBsZXQgbWVtYmVyMiA9IG1lbWJlciArIG1lbWJlclxuICAgICAgICAgICAgICAgIGxldCBtZW1iZXIzID0gbWVtYmVyICsgbWVtYmVyICsgbWVtYmVyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobWVtYmVyMiwgbWVtYmVyMylcbiAgICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcInNlbGVjdCBvY2N1cnJlbmNlIGluIGEtZm9sZCAscmV2ZXJzZShvKSB0aGVuIGVzY2FwZSB0byBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInMgbyB6IG8gZXNjYXBlXCIsXG4gICAgICAgICAgICBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCB8bWVtYmVyIG9mIG1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgbGV0IG1lbWJlcjIgPSB8bWVtYmVyICsgfG1lbWJlclxuICAgICAgICAgICAgICBsZXQgbWVtYmVyMyA9IHxtZW1iZXIgKyB8bWVtYmVyICsgfG1lbWJlclxuICAgICAgICAgICAgICByZXN1bHQucHVzaChtZW1iZXIyLCBtZW1iZXIzKVxuICAgICAgICAgICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgJ1Jlc29sdmVHaXRDb25mbGljdCcsIC0+XG4gICAgcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlID0gKHJvdywgb3B0aW9ucykgLT5cbiAgICAgIHNldCBjdXJzb3I6IFtyb3csIDBdXG4gICAgICBkaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6cmVzb2x2ZS1naXQtY29uZmxpY3QnKVxuICAgICAgZW5zdXJlIG51bGwsIG9wdGlvbnNcblxuICAgIGRlc2NyaWJlIFwibm9ybWFsIGNvbmZsaWN0IHNlY3Rpb25cIiwgLT5cbiAgICAgIG9yaWdpbmFsID0gXCJcIlwiXG4gICAgICAgIC0tLS0tLXN0YXJ0XG4gICAgICAgIDw8PDw8PDwgSEVBRFxuICAgICAgICBvdXJzIDFcbiAgICAgICAgb3VycyAyXG4gICAgICAgID09PT09PT1cbiAgICAgICAgdGhlaXJzIDFcbiAgICAgICAgdGhlaXJzIDJcbiAgICAgICAgPj4+Pj4+PiBicmFuY2gtYVxuICAgICAgICAtLS0tLS1lbmRcbiAgICAgICAgXCJcIlwiXG4gICAgICBvdXJzID0gXCJcIlwiXG4gICAgICAgIC0tLS0tLXN0YXJ0XG4gICAgICAgIHxvdXJzIDFcbiAgICAgICAgb3VycyAyXG4gICAgICAgIC0tLS0tLWVuZFxuICAgICAgICBcIlwiXCJcbiAgICAgIHRoZWlycyA9IFwiXCJcIlxuICAgICAgICAtLS0tLS1zdGFydFxuICAgICAgICB8dGhlaXJzIDFcbiAgICAgICAgdGhlaXJzIDJcbiAgICAgICAgLS0tLS0tZW5kXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCB0ZXh0OiBvcmlnaW5hbFxuXG4gICAgICBpdCBcInJvdyAwXCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSAwLCB0ZXh0OiBvcmlnaW5hbFxuICAgICAgaXQgXCJyb3cgMVwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgMSwgdGV4dEM6IG91cnMgIyA8PDw8PDw8IEhFQURcbiAgICAgIGl0IFwicm93IDJcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDIsIHRleHRDOiBvdXJzXG4gICAgICBpdCBcInJvdyAzXCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSAzLCB0ZXh0Qzogb3Vyc1xuICAgICAgaXQgXCJyb3cgNFwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgNCwgdGV4dDogb3JpZ2luYWwgIyA9PT09PT09XG4gICAgICBpdCBcInJvdyA1XCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSA1LCB0ZXh0QzogdGhlaXJzXG4gICAgICBpdCBcInJvdyA2XCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSA2LCB0ZXh0QzogdGhlaXJzXG4gICAgICBpdCBcInJvdyA3XCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSA3LCB0ZXh0QzogdGhlaXJzICMgPj4+Pj4+PiBicmFuY2gtYVxuICAgICAgaXQgXCJyb3cgOFwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgOCwgdGV4dDogb3JpZ2luYWxcblxuICAgIGRlc2NyaWJlIFwib3VycyBzZWN0aW9uIGlzIGVtcHR5XCIsIC0+XG4gICAgICBvcmlnaW5hbCA9IFwiXCJcIlxuICAgICAgICAtLS0tLS1zdGFydFxuICAgICAgICA8PDw8PDw8IEhFQURcbiAgICAgICAgPT09PT09PVxuICAgICAgICB0aGVpcnMgMVxuICAgICAgICA+Pj4+Pj4+IGJyYW5jaC1hXG4gICAgICAgIC0tLS0tLWVuZFxuICAgICAgICBcIlwiXCJcbiAgICAgIG91cnMgPSBcIlwiXCJcbiAgICAgICAgLS0tLS0tc3RhcnRcbiAgICAgICAgfC0tLS0tLWVuZFxuICAgICAgICBcIlwiXCJcbiAgICAgIHRoZWlycyA9IFwiXCJcIlxuICAgICAgICAtLS0tLS1zdGFydFxuICAgICAgICB8dGhlaXJzIDFcbiAgICAgICAgLS0tLS0tZW5kXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCB0ZXh0OiBvcmlnaW5hbFxuXG4gICAgICBpdCBcInJvdyAwXCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSAwLCB0ZXh0OiBvcmlnaW5hbFxuICAgICAgaXQgXCJyb3cgMVwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgMSwgdGV4dEM6IG91cnMgIyA8PDw8PDw8IEhFQURcbiAgICAgIGl0IFwicm93IDJcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDIsIHRleHQ6IG9yaWdpbmFsICMgPT09PT09PVxuICAgICAgaXQgXCJyb3cgM1wiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgMywgdGV4dEM6IHRoZWlyc1xuICAgICAgaXQgXCJyb3cgNFwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgNCwgdGV4dEM6IHRoZWlycyAjID4+Pj4+Pj4gYnJhbmNoLWFcbiAgICAgIGl0IFwicm93IDVcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDUsIHRleHQ6IG9yaWdpbmFsXG5cbiAgICBkZXNjcmliZSBcInRoZWlycyBzZWN0aW9uIGlzIGVtcHR5XCIsIC0+XG4gICAgICBvcmlnaW5hbCA9IFwiXCJcIlxuICAgICAgICAtLS0tLS1zdGFydFxuICAgICAgICA8PDw8PDw8IEhFQURcbiAgICAgICAgb3VycyAxXG4gICAgICAgID09PT09PT1cbiAgICAgICAgPj4+Pj4+PiBicmFuY2gtYVxuICAgICAgICAtLS0tLS1lbmRcbiAgICAgICAgXCJcIlwiXG4gICAgICBvdXJzID0gXCJcIlwiXG4gICAgICAgIC0tLS0tLXN0YXJ0XG4gICAgICAgIHxvdXJzIDFcbiAgICAgICAgLS0tLS0tZW5kXG4gICAgICAgIFwiXCJcIlxuICAgICAgdGhlaXJzID0gXCJcIlwiXG4gICAgICAgIC0tLS0tLXN0YXJ0XG4gICAgICAgIHwtLS0tLS1lbmRcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IHRleHQ6IG9yaWdpbmFsXG5cbiAgICAgIGl0IFwicm93IDBcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDAsIHRleHQ6IG9yaWdpbmFsXG4gICAgICBpdCBcInJvdyAxXCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSAxLCB0ZXh0Qzogb3VycyAjIDw8PDw8PDwgSEVBRFxuICAgICAgaXQgXCJyb3cgMlwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgMiwgdGV4dEM6IG91cnNcbiAgICAgIGl0IFwicm93IDNcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDMsIHRleHQ6IG9yaWdpbmFsICMgPT09PT09PVxuICAgICAgaXQgXCJyb3cgNFwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgNCwgdGV4dEM6IHRoZWlycyAjID4+Pj4+Pj4gYnJhbmNoLWFcbiAgICAgIGl0IFwicm93IDVcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDUsIHRleHQ6IG9yaWdpbmFsXG5cbiAgICBkZXNjcmliZSBcImJvdGggb3VycyBhbmQgdGhlaXJzIHNlY3Rpb24gaXMgZW1wdHlcIiwgLT5cbiAgICAgIG9yaWdpbmFsID0gXCJcIlwiXG4gICAgICAgIC0tLS0tLXN0YXJ0XG4gICAgICAgIDw8PDw8PDwgSEVBRFxuICAgICAgICA9PT09PT09XG4gICAgICAgID4+Pj4+Pj4gYnJhbmNoLWFcbiAgICAgICAgLS0tLS0tZW5kXG4gICAgICAgIFwiXCJcIlxuICAgICAgb3VycyA9IFwiXCJcIlxuICAgICAgICAtLS0tLS1zdGFydFxuICAgICAgICB8LS0tLS0tZW5kXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCB0ZXh0OiBvcmlnaW5hbFxuXG4gICAgICBpdCBcInJvdyAwXCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSAwLCB0ZXh0OiBvcmlnaW5hbFxuICAgICAgaXQgXCJyb3cgMVwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgMSwgdGV4dEM6IG91cnMgIyA8PDw8PDw8IEhFQURcbiAgICAgIGl0IFwicm93IDJcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDIsIHRleHQ6IG9yaWdpbmFsICMgPT09PT09PVxuICAgICAgaXQgXCJyb3cgM1wiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgMywgdGV4dEM6IG91cnMgIyA+Pj4+Pj4+IGJyYW5jaC1hXG4gICAgICBpdCBcInJvdyA0XCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSA0LCB0ZXh0OiBvcmlnaW5hbFxuXG4gICAgZGVzY3JpYmUgXCJubyBzZXBhcmF0b3Igc2VjdGlvblwiLCAtPlxuICAgICAgb3JpZ2luYWwgPSBcIlwiXCJcbiAgICAgICAgLS0tLS0tc3RhcnRcbiAgICAgICAgPDw8PDw8PCBIRUFEXG4gICAgICAgIG91cnMgMVxuICAgICAgICA+Pj4+Pj4+IGJyYW5jaC1hXG4gICAgICAgIC0tLS0tLWVuZFxuICAgICAgICBcIlwiXCJcbiAgICAgIG91cnMgPSBcIlwiXCJcbiAgICAgICAgLS0tLS0tc3RhcnRcbiAgICAgICAgfG91cnMgMVxuICAgICAgICAtLS0tLS1lbmRcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IHRleHQ6IG9yaWdpbmFsXG5cbiAgICAgIGl0IFwicm93IDBcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDAsIHRleHQ6IG9yaWdpbmFsXG4gICAgICBpdCBcInJvdyAxXCIsIC0+IHJlc29sdmVDb25mbGljdEF0Um93VGhlbkVuc3VyZSAxLCB0ZXh0Qzogb3VycyAjIDw8PDw8PDwgSEVBRFxuICAgICAgaXQgXCJyb3cgMlwiLCAtPiByZXNvbHZlQ29uZmxpY3RBdFJvd1RoZW5FbnN1cmUgMiwgdGV4dEM6IG91cnNcbiAgICAgIGl0IFwicm93IDNcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDMsIHRleHRDOiBvdXJzICAjID4+Pj4+Pj4gYnJhbmNoLWFcbiAgICAgIGl0IFwicm93IDRcIiwgLT4gcmVzb2x2ZUNvbmZsaWN0QXRSb3dUaGVuRW5zdXJlIDQsIHRleHQ6IG9yaWdpbmFsXG4iXX0=
