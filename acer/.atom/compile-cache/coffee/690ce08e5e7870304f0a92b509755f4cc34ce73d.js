(function() {
  var getVimState, settings,
    slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, ensureWait, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], ensureWait = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait, vim;
      });
    });
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3 x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('1 0 x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d 2 w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v 2 w', {
            cursor: [0, 9]
          });
        });
      });
    });
    describe("Register", function() {
      beforeEach(function() {
        return vimState.globalState.reset('register');
      });
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("with yank command", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "aaa bbb ccc"
          });
        });
        it("save to pre specified register", function() {
          ensure('" a y i w', {
            register: {
              a: {
                text: 'aaa'
              }
            }
          });
          ensure('w " b y i w', {
            register: {
              b: {
                text: 'bbb'
              }
            }
          });
          return ensure('w " c y i w', {
            register: {
              c: {
                text: 'ccc'
              }
            }
          });
        });
        return it("work with motion which also require input such as 't'", function() {
          return ensure('" a y t c', {
            register: {
              a: {
                text: 'aaa bbb '
              }
            }
          });
        });
      });
      describe("With p command", function() {
        beforeEach(function() {
          vimState.globalState.reset('register');
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return set({
            text: "abc\ndef",
            cursor: [0, 0]
          });
        });
        describe("when specified register have no text", function() {
          it("can paste from a register", function() {
            ensure(null, {
              mode: "normal"
            });
            return ensure('" a p', {
              textC: "anew conten|tbc\ndef"
            });
          });
          return it("but do nothing for z register", function() {
            return ensure('" z p', {
              textC: "|abc\ndef"
            });
          });
        });
        return describe("blockwise-mode paste just use register have no text", function() {
          return it("paste from a register to each selction", function() {
            return ensure('ctrl-v j " a p', {
              textC: "|new contentbc\nnew contentef"
            });
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure(null, {
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure(null, {
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure(null, {
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return ensure(null, {
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure(null, {
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure(null, {
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure(null, {
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the numbered 0-9 register", function() {
        describe("0", function() {
          return it("keep most recent yank-ed text", function() {
            ensure(null, {
              register: {
                '"': {
                  text: 'initial clipboard content'
                },
                '0': {
                  text: void 0
                }
              }
            });
            set({
              textC: "|000"
            });
            ensure("y w", {
              register: {
                '"': {
                  text: "000"
                },
                '0': {
                  text: "000"
                }
              }
            });
            return ensure("y l", {
              register: {
                '"': {
                  text: "0"
                },
                '0': {
                  text: "0"
                }
              }
            });
          });
        });
        return describe("1-9 and small-delete(-) register", function() {
          beforeEach(function() {
            return set({
              textC: "|0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n"
            });
          });
          it("keep deleted text", function() {
            ensure("d d", {
              textC: "|1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '1\n'
                },
                '2': {
                  text: '0\n'
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '2\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '2\n'
                },
                '2': {
                  text: '1\n'
                },
                '3': {
                  text: '0\n'
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '3\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '3\n'
                },
                '2': {
                  text: '2\n'
                },
                '3': {
                  text: '1\n'
                },
                '4': {
                  text: '0\n'
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '4\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '4\n'
                },
                '2': {
                  text: '3\n'
                },
                '3': {
                  text: '2\n'
                },
                '4': {
                  text: '1\n'
                },
                '5': {
                  text: '0\n'
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '5\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '5\n'
                },
                '2': {
                  text: '4\n'
                },
                '3': {
                  text: '3\n'
                },
                '4': {
                  text: '2\n'
                },
                '5': {
                  text: '1\n'
                },
                '6': {
                  text: '0\n'
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '6\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '6\n'
                },
                '2': {
                  text: '5\n'
                },
                '3': {
                  text: '4\n'
                },
                '4': {
                  text: '3\n'
                },
                '5': {
                  text: '2\n'
                },
                '6': {
                  text: '1\n'
                },
                '7': {
                  text: '0\n'
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|8\n9\n10\n",
              register: {
                '"': {
                  text: '7\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '7\n'
                },
                '2': {
                  text: '6\n'
                },
                '3': {
                  text: '5\n'
                },
                '4': {
                  text: '4\n'
                },
                '5': {
                  text: '3\n'
                },
                '6': {
                  text: '2\n'
                },
                '7': {
                  text: '1\n'
                },
                '8': {
                  text: '0\n'
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|9\n10\n",
              register: {
                '"': {
                  text: '8\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '8\n'
                },
                '2': {
                  text: '7\n'
                },
                '3': {
                  text: '6\n'
                },
                '4': {
                  text: '5\n'
                },
                '5': {
                  text: '4\n'
                },
                '6': {
                  text: '3\n'
                },
                '7': {
                  text: '2\n'
                },
                '8': {
                  text: '1\n'
                },
                '9': {
                  text: '0\n'
                }
              }
            });
            return ensure(".", {
              textC: "|10\n",
              register: {
                '"': {
                  text: '9\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '9\n'
                },
                '2': {
                  text: '8\n'
                },
                '3': {
                  text: '7\n'
                },
                '4': {
                  text: '6\n'
                },
                '5': {
                  text: '5\n'
                },
                '6': {
                  text: '4\n'
                },
                '7': {
                  text: '3\n'
                },
                '8': {
                  text: '2\n'
                },
                '9': {
                  text: '1\n'
                }
              }
            });
          });
          it("also keeps changed text", function() {
            return ensure("c j", {
              textC: "|\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n1\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
          });
          return describe("which goes to numbered and which goes to small-delete register", function() {
            beforeEach(function() {
              return set({
                textC: "|{abc}\n"
              });
            });
            it("small-change goes to - register", function() {
              return ensure("c $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("small-delete goes to - register", function() {
              return ensure("d $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] % motion always save to numbered", function() {
              set({
                textC: "|{abc}\n"
              });
              return ensure("d %", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc}'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] / motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|{abc}\n"
              });
              return ensure("d / } enter", {
                textC: "|}\n",
                register: {
                  '"': {
                    text: '{abc'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("/, n motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|abc axx abc\n"
              });
              ensure("d / a enter", {
                textC: "|axx abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              return ensure("d n", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: 'abc '
                  }
                }
              });
            });
            return it("?, N motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "abc axx |abc\n"
              });
              ensure("d ? a enter", {
                textC: "abc |abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              ensure("0", {
                textC: "|abc abc\n"
              });
              return ensure("c N", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: "axx "
                  }
                }
              });
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
          atom.clipboard.write("clip");
          set({
            register: {
              '"': {
                text: '345'
              },
              'a': {
                text: 'abc'
              },
              '*': {
                text: 'abc'
              }
            }
          });
          set({
            textC: "01|2\n"
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        describe("useClipboardAsDefaultRegister = true", function() {
          return it("inserts from \" paste clipboard content", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            atom.clipboard.write("clip");
            return ensureWait('ctrl-r "', {
              text: '01clip2\n'
            });
          });
        });
        describe("useClipboardAsDefaultRegister = false", function() {
          return it("inserts from \" register ", function() {
            settings.set('useClipboardAsDefaultRegister', false);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            atom.clipboard.write("clip");
            return ensureWait('ctrl-r "', {
              text: '013452\n'
            });
          });
        });
        return describe("insert from named register", function() {
          it("insert from 'a'", function() {
            return ensureWait('ctrl-r a', {
              textC: '01abc|2\n',
              mode: 'insert'
            });
          });
          return it("cancel with escape", function() {
            return ensureWait('ctrl-r escape', {
              textC: '01|2\n',
              mode: 'insert'
            });
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, j, len, ref1, results, selection, texts;
          texts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          ref1 = editor.getSelections();
          results = [];
          for (i = j = 0, len = ref1.length; j < len; i = ++j) {
            selection = ref1[i];
            results.push(ensure(null, {
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, j, len, ref1, ref2, selection, subscriptionBySelection;
            ref1 = vimState.register, clipboardBySelection = ref1.clipboardBySelection, subscriptionBySelection = ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            ensure("y i w");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            ref2 = editor.getSelections();
            for (j = 0, len = ref2.length; j < len; j++) {
              selection = ref2[j];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            ensure("y i w");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("y i w $ p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("y i w $ P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensureWait('ctrl-r "', {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
    describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
    describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
    return describe("blackholeRegisteredOperators settings", function() {
      var originalText;
      originalText = "initial clipboard content";
      beforeEach(function() {
        return set({
          textC: "a|bc"
        });
      });
      describe("when false(default)", function() {
        it("default", function() {
          return ensure(null, {
            register: {
              '"': {
                text: originalText
              }
            }
          });
        });
        it('c update', function() {
          return ensure('c l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('C update', function() {
          return ensure('C', {
            register: {
              '"': {
                text: 'bc'
              }
            }
          });
        });
        it('x update', function() {
          return ensure('x', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('X update', function() {
          return ensure('X', {
            register: {
              '"': {
                text: 'a'
              }
            }
          });
        });
        it('y update', function() {
          return ensure('y l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('Y update', function() {
          return ensure('Y', {
            register: {
              '"': {
                text: "abc\n"
              }
            }
          });
        });
        it('s update', function() {
          return ensure('s', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('S update', function() {
          return ensure('S', {
            register: {
              '"': {
                text: 'abc\n'
              }
            }
          });
        });
        it('d update', function() {
          return ensure('d l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        return it('D update', function() {
          return ensure('D', {
            register: {
              '"': {
                text: 'bc'
              }
            }
          });
        });
      });
      return describe("when true(default)", function() {
        describe("blackhole all", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change", "change-to-last-character-of-line", "change-line", "change-occurrence", "change-occurrence-from-search", "delete", "delete-to-last-character-of-line", "delete-line", "delete-right", "delete-left", "substitute", "substitute-line", "yank", "yank-line"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X NOT update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('y NOT update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('Y NOT update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('s NOT update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('S NOT update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('d NOT update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          return it('D NOT update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
        });
        describe("blackhole selectively", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change-to-last-character-of-line", "delete-right", "substitute"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
          it('y update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('Y update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: "abc\n"
                }
              }
            });
          });
          it('s NOT update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('S update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: 'abc\n'
                }
              }
            });
          });
          it('d update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          return it('D update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        return describe("blackhole by wildcard", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change*", "delete*"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c update if specified', function() {
            return ensure('" a c l', {
              register: {
                'a': {
                  text: "b"
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X NOT update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('y update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('Y update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: "abc\n"
                }
              }
            });
          });
          it('s update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('S update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: 'abc\n'
                }
              }
            });
          });
          it('d NOT update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          return it('D NOT update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvcHJlZml4LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxQkFBQTtJQUFBOztFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVI7O0VBQ2hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQTtBQUNuQixRQUFBO0lBQUEsTUFBNkQsRUFBN0QsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLG1CQUFkLEVBQTBCLGVBQTFCLEVBQWtDLHNCQUFsQyxFQUFpRDtJQUVqRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLDJCQUFkLEVBQTRCO01BSGxCLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQTtNQUNqQixRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTtRQUMxQixVQUFBLENBQVcsU0FBQTtpQkFDVCxHQUFBLENBQUk7WUFBQSxJQUFBLEVBQU0sY0FBTjtZQUFzQixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUE5QjtXQUFKO1FBRFMsQ0FBWDtRQUdBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO2lCQUNwQixNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsSUFBQSxFQUFNLFdBQU47V0FBZDtRQURvQixDQUF0QjtlQUdBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBO2lCQUNyQixNQUFBLENBQU8sT0FBUCxFQUFnQjtZQUFBLElBQUEsRUFBTSxJQUFOO1dBQWhCO1FBRHFCLENBQXZCO01BUDBCLENBQTVCO01BVUEsUUFBQSxDQUFTLGNBQVQsRUFB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LEVBQUs7Z0JBQUEsSUFBQSxFQUFNLEdBQU47ZUFBTjthQUFWO1dBQWQ7UUFBSCxDQUFmO1FBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2lCQUFHLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLEdBQU47ZUFBTjthQUFWO1dBQWQ7UUFBSCxDQUFmO1FBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2lCQUFHLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLE9BQU47ZUFBTjthQUFWO1dBQWQ7UUFBSCxDQUFmO1FBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2lCQUFHLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLEdBQU47ZUFBTjthQUFWO1dBQWQ7UUFBSCxDQUFmO1FBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2lCQUFHLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLE9BQU47ZUFBTjthQUFWO1dBQWQ7UUFBSCxDQUFmO1FBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2lCQUFHLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLEdBQU47ZUFBTjthQUFWO1dBQWQ7UUFBSCxDQUFmO2VBQ0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO2lCQUFHLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxRQUFBLEVBQVU7Y0FBQyxHQUFBLEVBQUs7Z0JBQUEsSUFBQSxFQUFNLElBQU47ZUFBTjthQUFWO1dBQWQ7UUFBSCxDQUFmO01BWDhCLENBQWhDO2FBYUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7UUFDN0IsUUFBQSxD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O0VBNWJtQixDQUFyQjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJQcmVmaXhlc1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVuc3VyZVdhaXQsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGVuc3VyZVdhaXR9ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJSZXBlYXRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggb3BlcmF0aW9uc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NTY3ODlhYmNcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIE4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICczIHgnLCB0ZXh0OiAnNDU2Nzg5YWJjJ1xuXG4gICAgICBpdCBcInJlcGVhdHMgTk4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICcxIDAgeCcsIHRleHQ6ICdiYydcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtb3Rpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAyIHcnLCB0ZXh0OiAndGhyZWUnXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBtb3ZlbWVudHMgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IDIgdycsIGN1cnNvcjogWzAsIDldXG5cbiAgZGVzY3JpYmUgXCJSZWdpc3RlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KCdyZWdpc3RlcicpXG5cbiAgICBkZXNjcmliZSBcInRoZSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIGEgdmFsdWUgZm9yIGZ1dHVyZSByZWFkaW5nXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgaXQgXCJvdmVyd3JpdGVzIGEgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIHlhbmsgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFhYSBiYmIgY2NjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInNhdmUgdG8gcHJlIHNwZWNpZmllZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSBpIHcnLCAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYWFhJ1xuICAgICAgICBlbnN1cmUgJ3cgXCIgYiB5IGkgdycsIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnYmJiJ1xuICAgICAgICBlbnN1cmUgJ3cgXCIgYyB5IGkgdycsIHJlZ2lzdGVyOiBjOiB0ZXh0OiAnY2NjJ1xuXG4gICAgICBpdCBcIndvcmsgd2l0aCBtb3Rpb24gd2hpY2ggYWxzbyByZXF1aXJlIGlucHV0IHN1Y2ggYXMgJ3QnXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXCIgYSB5IHQgYycsIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYWFhIGJiYiAnXG5cbiAgICBkZXNjcmliZSBcIldpdGggcCBjb21tYW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KCdyZWdpc3RlcicpXG4gICAgICAgIHNldCByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkZWZcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3BlY2lmaWVkIHJlZ2lzdGVyIGhhdmUgbm8gdGV4dFwiLCAtPlxuICAgICAgICBpdCBcImNhbiBwYXN0ZSBmcm9tIGEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICAgIGVuc3VyZSAnXCIgYSBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGFuZXcgY29udGVufHRiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImJ1dCBkbyBub3RoaW5nIGZvciB6IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdcIiB6IHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJibG9ja3dpc2UtbW9kZSBwYXN0ZSBqdXN0IHVzZSByZWdpc3RlciBoYXZlIG5vIHRleHRcIiwgLT5cbiAgICAgICAgaXQgXCJwYXN0ZSBmcm9tIGEgcmVnaXN0ZXIgdG8gZWFjaCBzZWxjdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC12IGogXCIgYSBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxuZXcgY29udGVudGJjXG4gICAgICAgICAgICBuZXcgY29udGVudGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwidGhlIEIgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGl0IFwic2F2ZXMgYSB2YWx1ZSBmb3IgZnV0dXJlIHJlYWRpbmdcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogYjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgaXQgXCJhcHBlbmRzIHRvIGEgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRuZXcgY29udGVudCdcblxuICAgICAgaXQgXCJhcHBlbmRzIGxpbmV3aXNlIHRvIGEgbGluZXdpc2UgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbicsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG5uZXcgY29udGVudFxcbidcblxuICAgICAgaXQgXCJhcHBlbmRzIGxpbmV3aXNlIHRvIGEgY2hhcmFjdGVyIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50XFxuJywgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxubmV3IGNvbnRlbnRcXG4nXG5cbiAgICBkZXNjcmliZSBcInRoZSAqIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyB0aGUgc2FtZSB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJyonOiB0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCcsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgICAgaXQgXCJvdmVyd3JpdGVzIHRoZSBjb250ZW50cyBvZiB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwgJ25ldyBjb250ZW50J1xuXG4gICAgIyBGSVhNRTogb25jZSBsaW51eCBzdXBwb3J0IGNvbWVzIG91dCwgdGhpcyBuZWVkcyB0byByZWFkIGZyb21cbiAgICAjIHRoZSBjb3JyZWN0IGNsaXBib2FyZC4gRm9yIG5vdyBpdCBiZWhhdmVzIGp1c3QgbGlrZSB0aGUgKiByZWdpc3RlclxuICAgICMgU2VlIDpoZWxwIHgxMS1jdXQtYnVmZmVyIGFuZCA6aGVscCByZWdpc3RlcnMgZm9yIG1vcmUgZGV0YWlscyBvbiBob3cgdGhlc2VcbiAgICAjIHJlZ2lzdGVycyB3b3JrIG9uIGFuIFgxMSBiYXNlZCBzeXN0ZW0uXG4gICAgZGVzY3JpYmUgXCJ0aGUgKyByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgdGhlIHNhbWUgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6XG4gICAgICAgICAgICAnKic6IHRleHQ6ICdpbml0aWFsIGNsaXBib2FyZCBjb250ZW50JywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnKic6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgICBpdCBcIm92ZXJ3cml0ZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCAnbmV3IGNvbnRlbnQnXG5cbiAgICBkZXNjcmliZSBcInRoZSBfIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyBhbHdheXMgdGhlIGVtcHR5IHN0cmluZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJ18nOiB0ZXh0OiAnJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYXdheSBhbnl0aGluZyB3cml0dGVuIHRvIGl0XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAgICAnXyc6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICdfJzogdGV4dDogJydcblxuICAgIGRlc2NyaWJlIFwidGhlICUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0VVJJJykuYW5kUmV0dXJuICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcInJldHVybnMgdGhlIGZpbGVuYW1lIG9mIHRoZSBjdXJyZW50IGVkaXRvclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJyUnOiB0ZXh0OiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYXdheSBhbnl0aGluZyB3cml0dGVuIHRvIGl0XCIsIC0+XG4gICAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICclJzogdGV4dDogJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgIGRlc2NyaWJlIFwidGhlIG51bWJlcmVkIDAtOSByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCIwXCIsIC0+XG4gICAgICAgIGl0IFwia2VlcCBtb3N0IHJlY2VudCB5YW5rLWVkIHRleHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCd9LCAnMCc6IHt0ZXh0OiB1bmRlZmluZWR9XG4gICAgICAgICAgc2V0IHRleHRDOiBcInwwMDBcIlxuICAgICAgICAgIGVuc3VyZSBcInkgd1wiLCByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiMDAwXCJ9LCAnMCc6IHt0ZXh0OiBcIjAwMFwifVxuICAgICAgICAgIGVuc3VyZSBcInkgbFwiLCByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiMFwifSwgJzAnOiB7dGV4dDogXCIwXCJ9XG5cbiAgICAgIGRlc2NyaWJlIFwiMS05IGFuZCBzbWFsbC1kZWxldGUoLSkgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ8MFxcbjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcblxuICAgICAgICBpdCBcImtlZXAgZGVsZXRlZCB0ZXh0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBkXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDFcXG4yXFxuM1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzBcXG4nfSwgICAgICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICcwXFxuJ30sICAgICAnMic6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8MlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcxXFxuJ30sICAgICAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMVxcbid9LCAgICAgJzInOiB7dGV4dDogJzBcXG4nfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcyXFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICcyXFxuJ30sICcyJzoge3RleHQ6ICcxXFxuJ30sICczJzoge3RleHQ6ICcwXFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw0XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICczXFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICczXFxuJ30sICcyJzoge3RleHQ6ICcyXFxuJ30sICczJzoge3RleHQ6ICcxXFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICcwXFxuJ30sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw1XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzRcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzRcXG4nfSwgICAgICcyJzoge3RleHQ6ICczXFxuJ30sICAgICAnMyc6IHt0ZXh0OiAnMlxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnMVxcbid9LCAgICAgJzUnOiB7dGV4dDogJzBcXG4nfSwgICAgICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw2XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnNVxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnNVxcbid9LCAgICAgJzInOiB7dGV4dDogJzRcXG4nfSwgICAgICczJzoge3RleHQ6ICczXFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICcyXFxuJ30sICAgICAnNSc6IHt0ZXh0OiAnMVxcbid9LCAgICAgJzYnOiB7dGV4dDogJzBcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzZcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzZcXG4nfSwgJzInOiB7dGV4dDogJzVcXG4nfSwgICAgICczJzoge3RleHQ6ICc0XFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICczXFxuJ30sICc1Jzoge3RleHQ6ICcyXFxuJ30sICAgICAnNic6IHt0ZXh0OiAnMVxcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnMFxcbid9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8OFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc3XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc3XFxuJ30sICcyJzoge3RleHQ6ICc2XFxuJ30sICczJzoge3RleHQ6ICc1XFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICc0XFxuJ30sICc1Jzoge3RleHQ6ICczXFxuJ30sICc2Jzoge3RleHQ6ICcyXFxuJ30sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6ICcxXFxuJ30sICc4Jzoge3RleHQ6ICcwXFxuJ30sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw5XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnOFxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnOFxcbid9LCAnMic6IHt0ZXh0OiAnN1xcbid9LCAnMyc6IHt0ZXh0OiAnNlxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnNVxcbid9LCAnNSc6IHt0ZXh0OiAnNFxcbid9LCAnNic6IHt0ZXh0OiAnM1xcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnMlxcbid9LCAnOCc6IHt0ZXh0OiAnMVxcbid9LCAnOSc6IHt0ZXh0OiAnMFxcbid9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8MTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnOVxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnOVxcbid9LCAnMic6IHt0ZXh0OiAnOFxcbid9LCAnMyc6IHt0ZXh0OiAnN1xcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnNlxcbid9LCAnNSc6IHt0ZXh0OiAnNVxcbid9LCAnNic6IHt0ZXh0OiAnNFxcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnM1xcbid9LCAnOCc6IHt0ZXh0OiAnMlxcbid9LCAnOSc6IHt0ZXh0OiAnMVxcbid9XG4gICAgICAgIGl0IFwiYWxzbyBrZWVwcyBjaGFuZ2VkIHRleHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJjIGpcIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8XFxuMlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcwXFxuMVxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMFxcbjFcXG4nfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcblxuICAgICAgICBkZXNjcmliZSBcIndoaWNoIGdvZXMgdG8gbnVtYmVyZWQgYW5kIHdoaWNoIGdvZXMgdG8gc21hbGwtZGVsZXRlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInx7YWJjfVxcblwiXG5cbiAgICAgICAgICBpdCBcInNtYWxsLWNoYW5nZSBnb2VzIHRvIC0gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImMgJFwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8XFxuXCJcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICd7YWJjfSd9LCAnLSc6IHt0ZXh0OiAne2FiY30nfSxcbiAgICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBpdCBcInNtYWxsLWRlbGV0ZSBnb2VzIHRvIC0gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImQgJFwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8XFxuXCJcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICd7YWJjfSd9LCAnLSc6IHt0ZXh0OiAne2FiY30nfSxcbiAgICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBpdCBcIltleGNlcHRpb25dICUgbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XFxuXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgJVwiLCB0ZXh0QzogXCJ8XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICd7YWJjfSd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAne2FiY30nfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cbiAgICAgICAgICBpdCBcIltleGNlcHRpb25dIC8gbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cXG5cIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCAvIH0gZW50ZXJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifH1cXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ3thYmMnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ3thYmMnfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cblxuICAgICAgICAgIGl0IFwiLywgbiBtb3Rpb24gYWx3YXlzIHNhdmUgdG8gbnVtYmVyZWRcIiwgLT5cbiAgICAgICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmMgYXh4IGFiY1xcblwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkIC8gYSBlbnRlclwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8YXh4IGFiY1xcblwiLFxuICAgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAnYWJjICd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAnYWJjICd9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9fVxuICAgICAgICAgICAgZW5zdXJlIFwiZCBuXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxhYmNcXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ2F4eCAnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ2F4eCAnfSwgJzInOiB7dGV4dDogJ2FiYyAnfX1cbiAgICAgICAgICBpdCBcIj8sIE4gbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJhYmMgYXh4IHxhYmNcXG5cIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCA/IGEgZW50ZXJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwiYWJjIHxhYmNcXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ2F4eCAnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ2F4eCAnfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cbiAgICAgICAgICAgIGVuc3VyZSBcIjBcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifGFiYyBhYmNcXG5cIixcbiAgICAgICAgICAgIGVuc3VyZSBcImMgTlwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8YWJjXFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICdhYmMgJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICdhYmMgJ30sICcyJzoge3RleHQ6IFwiYXh4IFwifX1cblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtciBjb21tYW5kIGluIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG4gICAgICAgIHNldFxuICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgICAgICdhJzogdGV4dDogJ2FiYydcbiAgICAgICAgICAgICcqJzogdGV4dDogJ2FiYydcbiAgICAgICAgc2V0IHRleHRDOiBcIjAxfDJcXG5cIlxuICAgICAgICBlbnN1cmUgJ2knLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcInVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyID0gdHJ1ZVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgZnJvbSBcXFwiIHBhc3RlIGNsaXBib2FyZCBjb250ZW50XCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWVcbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ2N0cmwtciBcIicsIHRleHQ6ICcwMWNsaXAyXFxuJ1xuXG4gICAgICBkZXNjcmliZSBcInVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyID0gZmFsc2VcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGZyb20gXFxcIiByZWdpc3RlciBcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2VcbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgXCJjbGlwXCJcbiAgICAgICAgICBlbnN1cmVXYWl0ICdjdHJsLXIgXCInLCB0ZXh0OiAnMDEzNDUyXFxuJ1xuXG4gICAgICBkZXNjcmliZSBcImluc2VydCBmcm9tIG5hbWVkIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGZyb20gJ2EnXCIsIC0+XG4gICAgICAgICAgZW5zdXJlV2FpdCAnY3RybC1yIGEnLCB0ZXh0QzogJzAxYWJjfDJcXG4nLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBpdCBcImNhbmNlbCB3aXRoIGVzY2FwZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ2N0cmwtciBlc2NhcGUnLCB0ZXh0QzogJzAxfDJcXG4nLCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgZGVzY3JpYmUgXCJwZXIgc2VsZWN0aW9uIGNsaXBib2FyZFwiLCAtPlxuICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIgPSAodGV4dHMuLi4pIC0+XG4gICAgICAgIGZvciBzZWxlY3Rpb24sIGkgaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJyonOiB7dGV4dDogdGV4dHNbaV0sIHNlbGVjdGlvbjogc2VsZWN0aW9ufVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDEyOlxuICAgICAgICAgICAgYWJjOlxuICAgICAgICAgICAgZGVmOlxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDFdLCBbMSwgMV0sIFsyLCAxXV1cblxuICAgICAgZGVzY3JpYmUgXCJvbiBzZWxlY3Rpb24gZGVzdHJveWVcIiwgLT5cbiAgICAgICAgaXQgXCJyZW1vdmUgY29ycmVzcG9uZGluZyBzdWJzY3JpcHRpbiBhbmQgY2xpcGJvYXJkIGVudHJ5XCIsIC0+XG4gICAgICAgICAge2NsaXBib2FyZEJ5U2VsZWN0aW9uLCBzdWJzY3JpcHRpb25CeVNlbGVjdGlvbn0gPSB2aW1TdGF0ZS5yZWdpc3RlclxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmRCeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcblxuICAgICAgICAgIGVuc3VyZSBcInkgaSB3XCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMylcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgzKVxuICAgICAgICAgIHNlbGVjdGlvbi5kZXN0cm95KCkgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuXG4gICAgICBkZXNjcmliZSBcIllhbmtcIiwgLT5cbiAgICAgICAgaXQgXCJzYXZlIHRleHQgdG8gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInkgaSB3XCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuXG4gICAgICBkZXNjcmliZSBcIkRlbGV0ZSBmYW1pbHlcIiwgLT5cbiAgICAgICAgaXQgXCJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBpIHdcIiwgdGV4dDogXCI6XFxuOlxcbjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG4gICAgICAgIGl0IFwieFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInhcIiwgdGV4dDogXCIwMjpcXG5hYzpcXG5kZjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcxJywgJ2InLCAnZScpXG4gICAgICAgIGl0IFwiWFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIlhcIiwgdGV4dDogXCIxMjpcXG5iYzpcXG5lZjpcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwJywgJ2EnLCAnZCcpXG4gICAgICAgIGl0IFwiRFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIkRcIiwgdGV4dDogXCIwXFxuYVxcbmRcXG5cIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcxMjonLCAnYmM6JywgJ2VmOicpXG5cbiAgICAgIGRlc2NyaWJlIFwiUHV0IGZhbWlseVwiLCAtPlxuICAgICAgICBpdCBcInAgcGFzdGUgdGV4dCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgdyAkIHBcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAwMTI6MDEyXG4gICAgICAgICAgICAgIGFiYzphYmNcbiAgICAgICAgICAgICAgZGVmOmRlZlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJQIHBhc3RlIHRleHQgZnJvbSBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieSBpIHcgJCBQXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMDEyMDEyOlxuICAgICAgICAgICAgICBhYmNhYmM6XG4gICAgICAgICAgICAgIGRlZmRlZjpcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcImN0cmwtciBpbiBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgaSB3XCIsIHRleHQ6IFwiOlxcbjpcXG46XFxuXCJcbiAgICAgICAgICBlbnN1cmUgJ2EnLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGVuc3VyZVdhaXQgJ2N0cmwtciBcIicsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgOjAxMlxuICAgICAgICAgICAgICA6YWJjXG4gICAgICAgICAgICAgIDpkZWZcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJDb3VudCBtb2RpZmllclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIjAwMCAxMTEgMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdCBvcGVyYXRvclwiLCAtPlxuICAgICAgZW5zdXJlICczIGQgdycsIHRleHQ6IFwiMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICBpdCBcInJlcGVhdCBtb3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnZCAyIHcnLCB0ZXh0OiBcIjIyMiAzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yIGFuZCBtb3Rpb24gcmVzcGVjdGl2ZWx5XCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCAyIHcnLCB0ZXh0OiBcIjY2NiA3NzcgODg4IDk5OVwiXG4gIGRlc2NyaWJlIFwiQ291bnQgbW9kaWZpZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIwMDAgMTExIDIyMiAzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIHcnLCB0ZXh0OiBcIjMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgbW90aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ2QgMiB3JywgdGV4dDogXCIyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICBpdCBcInJlcGVhdCBvcGVyYXRvciBhbmQgbW90aW9uIHJlc3BlY3RpdmVseVwiLCAtPlxuICAgICAgZW5zdXJlICczIGQgMiB3JywgdGV4dDogXCI2NjYgNzc3IDg4OCA5OTlcIlxuXG4gIGRlc2NyaWJlIFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9ycyBzZXR0aW5nc1wiLCAtPlxuICAgIG9yaWdpbmFsVGV4dCA9IFwiaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudFwiXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcImF8YmNcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZhbHNlKGRlZmF1bHQpXCIsIC0+XG4gICAgICBpdCBcImRlZmF1bHRcIiwgIC0+IGVuc3VyZSBudWxsLCAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICBpdCAnYyB1cGRhdGUnLCAtPiBlbnN1cmUgJ2MgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgaXQgJ0MgdXBkYXRlJywgLT4gZW5zdXJlICdDJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiYyd9XG4gICAgICBpdCAneCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3gnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgaXQgJ1ggdXBkYXRlJywgLT4gZW5zdXJlICdYJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhJ31cbiAgICAgIGl0ICd5IHVwZGF0ZScsIC0+IGVuc3VyZSAneSBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICBpdCAnWSB1cGRhdGUnLCAtPiBlbnN1cmUgJ1knLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJhYmNcXG5cIn1cbiAgICAgIGl0ICdzIHVwZGF0ZScsIC0+IGVuc3VyZSAncycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICBpdCAnUyB1cGRhdGUnLCAtPiBlbnN1cmUgJ1MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2FiY1xcbid9XG4gICAgICBpdCAnZCB1cGRhdGUnLCAtPiBlbnN1cmUgJ2QgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgaXQgJ0QgdXBkYXRlJywgLT4gZW5zdXJlICdEJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiYyd9XG5cbiAgICBkZXNjcmliZSBcIndoZW4gdHJ1ZShkZWZhdWx0KVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJibGFja2hvbGUgYWxsXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgXCJibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzXCIsIFtcbiAgICAgICAgICAgIFwiY2hhbmdlXCIgIyBjXG4gICAgICAgICAgICBcImNoYW5nZS10by1sYXN0LWNoYXJhY3Rlci1vZi1saW5lXCIgIyBDXG4gICAgICAgICAgICBcImNoYW5nZS1saW5lXCIgIyBDIGluIHZpc3VhbFxuICAgICAgICAgICAgXCJjaGFuZ2Utb2NjdXJyZW5jZVwiXG4gICAgICAgICAgICBcImNoYW5nZS1vY2N1cnJlbmNlLWZyb20tc2VhcmNoXCJcbiAgICAgICAgICAgIFwiZGVsZXRlXCIgIyBkXG4gICAgICAgICAgICBcImRlbGV0ZS10by1sYXN0LWNoYXJhY3Rlci1vZi1saW5lXCIgIyBEXG4gICAgICAgICAgICBcImRlbGV0ZS1saW5lXCIgIyBEIGluIHZpc3VhbFxuICAgICAgICAgICAgXCJkZWxldGUtcmlnaHRcIiAjIHhcbiAgICAgICAgICAgIFwiZGVsZXRlLWxlZnRcIiAjIFhcbiAgICAgICAgICAgIFwic3Vic3RpdHV0ZVwiICMgc1xuICAgICAgICAgICAgXCJzdWJzdGl0dXRlLWxpbmVcIiAjIFNcbiAgICAgICAgICAgIFwieWFua1wiICMgeVxuICAgICAgICAgICAgXCJ5YW5rLWxpbmVcIiAjIFlcbiAgICAgICAgICAgICMgXCJkZWxldGUqXCJcbiAgICAgICAgICAgICMgXCJjaGFuZ2UqXCJcbiAgICAgICAgICAgICMgXCJ5YW5rKlwiXG4gICAgICAgICAgICAjIFwic3Vic3RpdHV0ZSpcIlxuICAgICAgICAgIF1cblxuICAgICAgICBpdCBcImRlZmF1bHRcIiwgICAgICAtPiBlbnN1cmUgbnVsbCwgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnYyBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdjIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ0MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnQycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICd4IE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3gnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnWCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdYJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ3kgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAneSBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdZIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ1knLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAncyBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdzJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnUycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdkIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ2QgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnRCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdEJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cblxuICAgICAgZGVzY3JpYmUgXCJibGFja2hvbGUgc2VsZWN0aXZlbHlcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCBcImJsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcnNcIiwgW1xuICAgICAgICAgICAgXCJjaGFuZ2UtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZVwiICMgQ1xuICAgICAgICAgICAgXCJkZWxldGUtcmlnaHRcIiAjIHhcbiAgICAgICAgICAgIFwic3Vic3RpdHV0ZVwiICMgc1xuICAgICAgICAgIF1cblxuICAgICAgICBpdCBcImRlZmF1bHRcIiwgICAgICAtPiBlbnN1cmUgbnVsbCwgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnYyB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdjIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgICAgaXQgJ0MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnQycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICd4IE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3gnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnWCB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdYJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhJ31cbiAgICAgICAgaXQgJ3kgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAneSBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICAgIGl0ICdZIHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ1knLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJhYmNcXG5cIn1cbiAgICAgICAgaXQgJ3MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAncycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdTIHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ1MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2FiY1xcbid9XG4gICAgICAgIGl0ICdkIHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ2QgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgICBpdCAnRCB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdEJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiYyd9XG5cbiAgICAgIGRlc2NyaWJlIFwiYmxhY2tob2xlIGJ5IHdpbGRjYXJkXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgXCJibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzXCIsIFtcbiAgICAgICAgICAgIFwiY2hhbmdlKlwiICMgQ1xuICAgICAgICAgICAgXCJkZWxldGUqXCIgIyB4XG4gICAgICAgICAgICAjIFwic3Vic3RpdHV0ZSpcIiAjIHNcbiAgICAgICAgICAgICMgXCJ5YW5rKlwiXG4gICAgICAgICAgXVxuXG4gICAgICAgIGl0IFwiZGVmYXVsdFwiLCAgICAgICAgICAgICAgIC0+IGVuc3VyZSBudWxsLCAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnYyBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICdjIGwnLCAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdjIHVwZGF0ZSBpZiBzcGVjaWZpZWQnLCAtPiBlbnN1cmUgJ1wiIGEgYyBsJywgcmVnaXN0ZXI6IHsnYSc6IHRleHQ6IFwiYlwifVxuICAgICAgICBpdCAnYyBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICdjIGwnLCAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdDIE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ0MnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ3ggTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAneCcsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnWCBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICdYJywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICd5IHVwZGF0ZScsICAgICAgICAgICAgICAtPiBlbnN1cmUgJ3kgbCcsICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgICAgaXQgJ1kgdXBkYXRlJywgICAgICAgICAgICAgIC0+IGVuc3VyZSAnWScsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJhYmNcXG5cIn1cbiAgICAgICAgaXQgJ3MgdXBkYXRlJywgICAgICAgICAgICAgIC0+IGVuc3VyZSAncycsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgICBpdCAnUyB1cGRhdGUnLCAgICAgICAgICAgICAgLT4gZW5zdXJlICdTJywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYWJjXFxuJ31cbiAgICAgICAgaXQgJ2QgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnZCBsJywgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnRCBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICdEJywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4iXX0=
