(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Find", function() {
    var editor, editorElement, ensure, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4];
    beforeEach(function() {
      settings.set('useExperimentalFasterInput', true);
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, _vim;
      });
    });
    xdescribe('the f performance', function() {
      var measureWithPerformanceNow, measureWithTimeEnd, timesToExecute;
      timesToExecute = 500;
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      measureWithPerformanceNow = function(fn) {
        var t0, t1;
        t0 = performance.now();
        fn();
        t1 = performance.now();
        return console.log("[performance.now] took " + (t1 - t0) + " msec");
      };
      beforeEach(function() {
        return set({
          text: "  " + "l".repeat(timesToExecute),
          cursor: [0, 0]
        });
      });
      describe('the f read-char-via-keybinding performance', function() {
        beforeEach(function() {
          return vimState.useMiniEditor = false;
        });
        return it('[with keybind] moves to l char', function() {
          var testPerformanceOfKeybind;
          testPerformanceOfKeybind = function() {
            var i, n, ref2;
            for (n = i = 1, ref2 = timesToExecute; 1 <= ref2 ? i <= ref2 : i >= ref2; n = 1 <= ref2 ? ++i : --i) {
              ensure("f l");
            }
            return ensure(null, {
              cursor: [0, timesToExecute + 1]
            });
          };
          console.log("== keybind");
          ensure("f l", {
            cursor: [0, 2]
          });
          set({
            cursor: [0, 0]
          });
          return measureWithTimeEnd(testPerformanceOfKeybind);
        });
      });
      return xdescribe('[with hidden-input] moves to l char', function() {
        return it('[with hidden-input] moves to l char', function() {
          var testPerformanceOfHiddenInput;
          testPerformanceOfHiddenInput = function() {
            var i, n, ref2;
            for (n = i = 1, ref2 = timesToExecute; 1 <= ref2 ? i <= ref2 : i >= ref2; n = 1 <= ref2 ? ++i : --i) {
              ensure('f l');
            }
            return ensure(null, {
              cursor: [0, timesToExecute + 1]
            });
          };
          console.log("== hidden");
          ensure('f l', {
            cursor: [0, 2]
          });
          set({
            cursor: [0, 0]
          });
          return measureWithTimeEnd(testPerformanceOfHiddenInput);
        });
      });
    });
    describe('the f/F keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the first specified character it finds', function() {
        return ensure('f c', {
          cursor: [0, 2]
        });
      });
      it('extends visual selection in visual-mode and repetable', function() {
        ensure('v', {
          mode: ['visual', 'characterwise']
        });
        ensure('f c', {
          selectedText: 'abc',
          cursor: [0, 3]
        });
        ensure(';', {
          selectedText: 'abcabc',
          cursor: [0, 6]
        });
        return ensure(',', {
          selectedText: 'abc',
          cursor: [0, 3]
        });
      });
      it('moves backwards to the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure('F a', {
          cursor: [0, 0]
        });
      });
      it('respects count forward', function() {
        return ensure('2 f a', {
          cursor: [0, 6]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure('2 F a', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure('f d', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure('1 0 f a', {
          cursor: [0, 0]
        });
        ensure('1 1 f a', {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure('1 0 F a', {
          cursor: [0, 6]
        });
        return ensure('1 1 F a', {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d 2 f a', {
          text: 'abcbc\n'
        });
      });
      return it("F behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d F a', {
          text: 'abcabcabc\n'
        });
      });
    });
    describe("[regression guard] repeat(; or ,) after used as operator target", function() {
      it("repeat after d f", function() {
        set({
          textC: "a1    |a2    a3    a4"
        });
        ensure("d f a", {
          textC: "a1    |3    a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a1    3    |a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "|a1    3    a4",
          mode: "normal",
          selectedText: ""
        });
      });
      it("repeat after d t", function() {
        set({
          textC: "|a1    a2    a3    a4"
        });
        ensure("d t a", {
          textC: "|a2    a3    a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a2   | a3    a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "a|2    a3    a4",
          mode: "normal",
          selectedText: ""
        });
      });
      it("repeat after d F", function() {
        set({
          textC: "a1    a2    a3    |a4"
        });
        ensure("d F a", {
          textC: "a1    a2    |a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a1    |a2    a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "a1    a2    |a4",
          mode: "normal",
          selectedText: ""
        });
      });
      return it("repeat after d T", function() {
        set({
          textC: "a1    a2    a3    |a4"
        });
        set({
          textC: "a1    a2    a|a4"
        });
        ensure("d T a", {
          textC: "a1    a2    a|a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a1    a|2    aa4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "a1    a2   | aa4",
          mode: "normal",
          selectedText: ""
        });
      });
    });
    describe("cancellation", function() {
      return it("keeps multiple-cursors when cancelled", function() {
        set({
          textC: "|   a\n!   a\n|   a\n"
        });
        return ensure("f escape", {
          textC: "|   a\n!   a\n|   a\n"
        });
      });
    });
    describe('the t/T keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the character previous to the first specified character it finds', function() {
        ensure('t a', {
          cursor: [0, 2]
        });
        return ensure('t a', {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure('T a', {
          cursor: [0, 1]
        });
      });
      it('respects count forward', function() {
        return ensure('2 t a', {
          cursor: [0, 5]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure('2 T a', {
          cursor: [0, 1]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure('t d', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure('1 0 t d', {
          cursor: [0, 0]
        });
        ensure('1 1 t a', {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure('1 0 T a', {
          cursor: [0, 6]
        });
        return ensure('1 1 T a', {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d 2 t b', {
          text: 'abcbcabc\n'
        });
      });
      it("delete char under cursor even when no movement happens since it's inclusive motion", function() {
        set({
          cursor: [0, 0]
        });
        return ensure('d t b', {
          text: 'bcabcabcabc\n'
        });
      });
      it("do nothing when inclusiveness inverted by v operator-modifier", function() {
        ({
          text: "abcabcabcabc\n"
        });
        set({
          cursor: [0, 0]
        });
        return ensure('d v t b', {
          text: 'abcabcabcabc\n'
        });
      });
      it("T behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d T b', {
          text: 'ababcabcabc\n'
        });
      });
      return it("T don't delete character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d T c', {
          text: 'abcabcabcabc\n'
        });
      });
    });
    describe('the ; and , keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it("repeat f in same direction", function() {
        ensure('f c', {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 8]
        });
      });
      it("repeat F in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure('F c', {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 2]
        });
      });
      it("repeat f in opposite direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure('f c', {
          cursor: [0, 8]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("repeat F in opposite direction", function() {
        set({
          cursor: [0, 4]
        });
        ensure('F c', {
          cursor: [0, 2]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("alternate repeat f in same direction and reverse", function() {
        ensure('f c', {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("alternate repeat F in same direction and reverse", function() {
        set({
          cursor: [0, 10]
        });
        ensure('F c', {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("repeat t in same direction", function() {
        ensure('t c', {
          cursor: [0, 1]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure('T c', {
          cursor: [0, 9]
        });
        return ensure(';', {
          cursor: [0, 6]
        });
      });
      it("repeat t in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 3]
        });
        ensure('t c', {
          cursor: [0, 4]
        });
        ensure(',', {
          cursor: [0, 3]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 4]
        });
        ensure('T c', {
          cursor: [0, 3]
        });
        ensure(',', {
          cursor: [0, 4]
        });
        return ensure(';', {
          cursor: [0, 3]
        });
      });
      it("repeat with count in same direction", function() {
        set({
          cursor: [0, 0]
        });
        ensure('f c', {
          cursor: [0, 2]
        });
        return ensure('2 ;', {
          cursor: [0, 8]
        });
      });
      return it("repeat with count in reverse direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure('f c', {
          cursor: [0, 8]
        });
        return ensure('2 ,', {
          cursor: [0, 2]
        });
      });
    });
    describe("last find/till is repeatable on other editor", function() {
      var other, otherEditor, pane, ref2;
      ref2 = [], other = ref2[0], otherEditor = ref2[1], pane = ref2[2];
      beforeEach(function() {
        return getVimState(function(otherVimState, _other) {
          set({
            text: "a baz bar\n",
            cursor: [0, 0]
          });
          other = _other;
          other.set({
            text: "foo bar baz",
            cursor: [0, 0]
          });
          otherEditor = otherVimState.editor;
          pane = atom.workspace.getActivePane();
          return pane.activateItem(editor);
        });
      });
      it("shares the most recent find/till command with other editors", function() {
        ensure('f b', {
          cursor: [0, 2]
        });
        other.ensure(null, {
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        other.ensure(';');
        ensure(null, {
          cursor: [0, 2]
        });
        other.ensure(null, {
          cursor: [0, 4]
        });
        other.ensure('t r');
        ensure(null, {
          cursor: [0, 2]
        });
        other.ensure(null, {
          cursor: [0, 5]
        });
        pane.activateItem(editor);
        ensure(';', {
          cursor: [0, 7]
        });
        return other.ensure(null, {
          cursor: [0, 5]
        });
      });
      return it("is still repeatable after original editor was destroyed", function() {
        ensure('f b', {
          cursor: [0, 2]
        });
        other.ensure(null, {
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        editor.destroy();
        expect(editor.isAlive()).toBe(false);
        other.ensure(';', {
          cursor: [0, 4]
        });
        other.ensure(';', {
          cursor: [0, 8]
        });
        return other.ensure(',', {
          cursor: [0, 4]
        });
      });
    });
    return describe("vmp unique feature of `f` family", function() {
      describe("ignoreCaseForFind", function() {
        beforeEach(function() {
          return settings.set("ignoreCaseForFind", true);
        });
        return it("ignore case to find", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    ab    |a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
      });
      describe("useSmartcaseForFind", function() {
        beforeEach(function() {
          return settings.set("useSmartcaseForFind", true);
        });
        it("ignore case when input is lower char", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    ab    |a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
        return it("find case-sensitively when input is lager char", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f A", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure("f A", {
            textC: "    A    ab    a    |Ab    a"
          });
          ensure(",", {
            textC: "    |A    ab    a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
      });
      describe("reuseFindForRepeatFind", function() {
        beforeEach(function() {
          return settings.set("reuseFindForRepeatFind", true);
        });
        it("can reuse f and t as ;, F and T as ',' respectively", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure("f", {
            textC: "    A    ab    |a    Ab    a"
          });
          ensure("f", {
            textC: "    A    ab    a    Ab    |a"
          });
          ensure("F", {
            textC: "    A    ab    |a    Ab    a"
          });
          ensure("F", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure("t", {
            textC: "    A    ab   | a    Ab    a"
          });
          ensure("t", {
            textC: "    A    ab    a    Ab   | a"
          });
          ensure("T", {
            textC: "    A    ab    a|    Ab    a"
          });
          return ensure("T", {
            textC: "    A    a|b    a    Ab    a"
          });
        });
        return it("behave as normal f if no successful previous find was exists", function() {
          set({
            textC: "  |  A    ab    a    Ab    a"
          });
          ensure("f escape", {
            textC: "  |  A    ab    a    Ab    a"
          });
          expect(vimState.globalState.get("currentFind")).toBeNull();
          ensure("f a", {
            textC: "    A    |ab    a    Ab    a"
          });
          return expect(vimState.globalState.get("currentFind")).toBeTruthy();
        });
      });
      describe("findAcrossLines", function() {
        beforeEach(function() {
          return settings.set("findAcrossLines", true);
        });
        return it("searches across multiple lines", function() {
          set({
            textC: "|0:    a    a\n1:    a    a\n2:    a    a\n"
          });
          ensure("f a", {
            textC: "0:    |a    a\n1:    a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    |a\n1:    a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    |a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    a    a\n2:    |a    a\n"
          });
          ensure("F a", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          ensure("t a", {
            textC: "0:    a    a\n1:    a    a\n2:   | a    a\n"
          });
          ensure("T a", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          return ensure("T a", {
            textC: "0:    a    a\n1:    a|    a\n2:    a    a\n"
          });
        });
      });
      describe("find-next/previous-pre-confirmed", function() {
        beforeEach(function() {
          settings.set("findCharsMax", 10);
          return jasmine.attachToDOM(atom.workspace.getElement());
        });
        return describe("can find one or two char", function() {
          it("adjust to next-pre-confirmed", function() {
            var element;
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("f a");
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            return ensure("enter", {
              textC: "    a    ab    |a    cd    a"
            });
          });
          it("adjust to previous-pre-confirmed", function() {
            var element;
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("3 f a enter", {
              textC: "    a    ab    |a    cd    a"
            });
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("3 f a");
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-previous-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-previous-pre-confirmed");
            return ensure("enter", {
              textC: "    |a    ab    a    cd    a"
            });
          });
          return it("is useful to skip earlier spot interactivelly", function() {
            var element;
            set({
              textC: 'text = "this is |\"example\" of use case"'
            });
            ensure('c t "');
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            return ensure("enter", {
              textC: 'text = "this is |"',
              mode: "insert"
            });
          });
        });
      });
      return describe("findCharsMax", function() {
        beforeEach(function() {
          return jasmine.attachToDOM(atom.workspace.getElement());
        });
        describe("with 2 length", function() {
          beforeEach(function() {
            return settings.set("findCharsMax", 2);
          });
          return describe("can find one or two char", function() {
            it("can find by two char", function() {
              set({
                textC: "|    a    ab    a    cd    a"
              });
              ensure("f a b", {
                textC: "    a    |ab    a    cd    a"
              });
              return ensure("f c d", {
                textC: "    a    ab    a    |cd    a"
              });
            });
            return it("can find by one-char by confirming explicitly", function() {
              set({
                textC: "|    a    ab    a    cd    a"
              });
              ensure("f a enter", {
                textC: "    |a    ab    a    cd    a"
              });
              return ensure("f c enter", {
                textC: "    a    ab    a    |cd    a"
              });
            });
          });
        });
        describe("with 3 length", function() {
          beforeEach(function() {
            return settings.set("findCharsMax", 3);
          });
          return describe("can find 3 at maximum", function() {
            return it("can find by one or two or three char", function() {
              set({
                textC: "|    a    ab    a    cd    efg"
              });
              ensure("f a b enter", {
                textC: "    a    |ab    a    cd    efg"
              });
              ensure("f a enter", {
                textC: "    a    ab    |a    cd    efg"
              });
              ensure("f c d enter", {
                textC: "    a    ab    a    |cd    efg"
              });
              return ensure("f e f g", {
                textC: "    a    ab    a    cd    |efg"
              });
            });
          });
        });
        return describe("autoConfirmTimeout", function() {
          beforeEach(function() {
            settings.set("findCharsMax", 2);
            return settings.set("findConfirmByTimeout", 500);
          });
          return it("auto-confirm single-char input on timeout", function() {
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("f a", {
              textC: "|    a    ab    a    cd    a"
            });
            advanceClock(500);
            ensure(null, {
              textC: "    |a    ab    a    cd    a"
            });
            ensure("f c d", {
              textC: "    a    ab    a    |cd    a"
            });
            ensure("f a", {
              textC: "    a    ab    a    |cd    a"
            });
            advanceClock(500);
            ensure(null, {
              textC: "    a    ab    a    cd    |a"
            });
            ensure("F b", {
              textC: "    a    ab    a    cd    |a"
            });
            advanceClock(500);
            return ensure(null, {
              textC: "    a    a|b    a    cd    a"
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvbW90aW9uLWZpbmQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQW9DLE9BQUEsQ0FBUSxlQUFSLENBQXBDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qjs7RUFDeEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO0FBQ3RCLFFBQUE7SUFBQSxPQUFpRCxFQUFqRCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLGdCQUFkLEVBQXNCLHVCQUF0QixFQUFxQztJQUVyQyxVQUFBLENBQVcsU0FBQTtNQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsNEJBQWIsRUFBMkMsSUFBM0M7YUFHQSxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBZ0I7TUFITixDQUFaO0lBSlMsQ0FBWDtJQVNBLFNBQUEsQ0FBVSxtQkFBVixFQUErQixTQUFBO0FBQzdCLFVBQUE7TUFBQSxjQUFBLEdBQWlCO01BRWpCLGtCQUFBLEdBQXFCLFNBQUMsRUFBRDtRQUNuQixPQUFPLENBQUMsSUFBUixDQUFhLEVBQUUsQ0FBQyxJQUFoQjtRQUNBLEVBQUEsQ0FBQTtlQUVBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQUUsQ0FBQyxJQUFuQjtNQUptQjtNQU1yQix5QkFBQSxHQUE0QixTQUFDLEVBQUQ7QUFDMUIsWUFBQTtRQUFBLEVBQUEsR0FBSyxXQUFXLENBQUMsR0FBWixDQUFBO1FBQ0wsRUFBQSxDQUFBO1FBQ0EsRUFBQSxHQUFLLFdBQVcsQ0FBQyxHQUFaLENBQUE7ZUFDTCxPQUFPLENBQUMsR0FBUixDQUFZLHlCQUFBLEdBQXlCLENBQUMs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Z0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBaEI7WUFFQSxNQUFBLENBQU8sS0FBUCxFQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUNBLFlBQUEsQ0FBYSxHQUFiO21CQUNBLE1BQUEsQ0FBTyxJQUFQLEVBQWdCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQWhCO1VBZjhDLENBQWhEO1FBTDZCLENBQS9CO01BaEN1QixDQUF6QjtJQXRHMkMsQ0FBN0M7RUEzVHNCLENBQXhCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiTW90aW9uIEZpbmRcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNldHRpbmdzLnNldCgndXNlRXhwZXJpbWVudGFsRmFzdGVySW5wdXQnLCB0cnVlKVxuICAgICMgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmV9ID0gX3ZpbVxuXG4gIHhkZXNjcmliZSAndGhlIGYgcGVyZm9ybWFuY2UnLCAtPlxuICAgIHRpbWVzVG9FeGVjdXRlID0gNTAwXG4gICAgIyB0aW1lc1RvRXhlY3V0ZSA9IDFcbiAgICBtZWFzdXJlV2l0aFRpbWVFbmQgPSAoZm4pIC0+XG4gICAgICBjb25zb2xlLnRpbWUoZm4ubmFtZSlcbiAgICAgIGZuKClcbiAgICAgICMgY29uc29sZS5sb2cgXCJbdGltZS1lbmRdXCJcbiAgICAgIGNvbnNvbGUudGltZUVuZChmbi5uYW1lKVxuXG4gICAgbWVhc3VyZVdpdGhQZXJmb3JtYW5jZU5vdyA9IChmbikgLT5cbiAgICAgIHQwID0gcGVyZm9ybWFuY2Uubm93KClcbiAgICAgIGZuKClcbiAgICAgIHQxID0gcGVyZm9ybWFuY2Uubm93KClcbiAgICAgIGNvbnNvbGUubG9nIFwiW3BlcmZvcm1hbmNlLm5vd10gdG9vayAje3QxIC0gdDB9IG1zZWNcIlxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiICBcIiArIFwibFwiLnJlcGVhdCh0aW1lc1RvRXhlY3V0ZSlcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlICd0aGUgZiByZWFkLWNoYXItdmlhLWtleWJpbmRpbmcgcGVyZm9ybWFuY2UnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2aW1TdGF0ZS51c2VNaW5pRWRpdG9yID0gZmFsc2VcblxuICAgICAgaXQgJ1t3aXRoIGtleWJpbmRdIG1vdmVzIHRvIGwgY2hhcicsIC0+XG4gICAgICAgIHRlc3RQZXJmb3JtYW5jZU9mS2V5YmluZCA9IC0+XG4gICAgICAgICAgZW5zdXJlKFwiZiBsXCIpIGZvciBuIGluIFsxLi50aW1lc1RvRXhlY3V0ZV1cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgY3Vyc29yOiBbMCwgdGltZXNUb0V4ZWN1dGUgKyAxXVxuXG4gICAgICAgIGNvbnNvbGUubG9nIFwiPT0ga2V5YmluZFwiXG4gICAgICAgIGVuc3VyZSBcImYgbFwiLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgbWVhc3VyZVdpdGhUaW1lRW5kKHRlc3RQZXJmb3JtYW5jZU9mS2V5YmluZClcbiAgICAgICAgIyBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgIyBtZWFzdXJlV2l0aFBlcmZvcm1hbmNlTm93KHRlc3RQZXJmb3JtYW5jZU9mS2V5YmluZClcblxuICAgIHhkZXNjcmliZSAnW3dpdGggaGlkZGVuLWlucHV0XSBtb3ZlcyB0byBsIGNoYXInLCAtPlxuICAgICAgaXQgJ1t3aXRoIGhpZGRlbi1pbnB1dF0gbW92ZXMgdG8gbCBjaGFyJywgLT5cbiAgICAgICAgdGVzdFBlcmZvcm1hbmNlT2ZIaWRkZW5JbnB1dCA9IC0+XG4gICAgICAgICAgZW5zdXJlKCdmIGwnKSBmb3IgbiBpbiBbMS4udGltZXNUb0V4ZWN1dGVdXG4gICAgICAgICAgZW5zdXJlIG51bGwsIGN1cnNvcjogWzAsIHRpbWVzVG9FeGVjdXRlICsgMV1cblxuICAgICAgICBjb25zb2xlLmxvZyBcIj09IGhpZGRlblwiXG4gICAgICAgIGVuc3VyZSAnZiBsJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgbWVhc3VyZVdpdGhUaW1lRW5kKHRlc3RQZXJmb3JtYW5jZU9mSGlkZGVuSW5wdXQpXG4gICAgICAgICMgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICMgbWVhc3VyZVdpdGhQZXJmb3JtYW5jZU5vdyh0ZXN0UGVyZm9ybWFuY2VPZkhpZGRlbklucHV0KVxuXG4gIGRlc2NyaWJlICd0aGUgZi9GIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgJ21vdmVzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0ICdleHRlbmRzIHZpc3VhbCBzZWxlY3Rpb24gaW4gdmlzdWFsLW1vZGUgYW5kIHJlcGV0YWJsZScsIC0+XG4gICAgICBlbnN1cmUgJ3YnLCAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgZW5zdXJlICdmIGMnLCBzZWxlY3RlZFRleHQ6ICdhYmMnLCAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICc7JywgICBzZWxlY3RlZFRleHQ6ICdhYmNhYmMnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcsJywgICBzZWxlY3RlZFRleHQ6ICdhYmMnLCAgICBjdXJzb3I6IFswLCAzXVxuXG4gICAgaXQgJ21vdmVzIGJhY2t3YXJkcyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJ0YgYScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgZm9yd2FyZCcsIC0+XG4gICAgICBlbnN1cmUgJzIgZiBhJywgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBiYWNrd2FyZCcsIC0+XG4gICAgICBzZXQgICAgICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMiBGIGEnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgaWYgdGhlIGNoYXJhY3RlciBzcGVjaWZpZWQgaXNuJ3QgZm91bmRcIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBkJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZXJlIGFyZW4ndCB0aGUgc3BlY2lmaWVkIGNvdW50IG9mIHRoZSBzcGVjaWZpZWQgY2hhcmFjdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJzEgMCBmIGEnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhIGJ1ZyB3YXMgbWFraW5nIHRoaXMgYmVoYXZpb3VyIGRlcGVuZCBvbiB0aGUgY291bnRcbiAgICAgIGVuc3VyZSAnMSAxIGYgYScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAjIGFuZCBiYWNrd2FyZHMgbm93XG4gICAgICBzZXQgICAgICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcxIDAgRiBhJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMSAxIEYgYScsIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCBcImNvbXBvc2VzIHdpdGggZFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ2QgMiBmIGEnLCB0ZXh0OiAnYWJjYmNcXG4nXG5cbiAgICBpdCBcIkYgYmVoYXZlcyBleGNsdXNpdmVseSB3aGVuIGNvbXBvc2VzIHdpdGggb3BlcmF0b3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIEYgYScsIHRleHQ6ICdhYmNhYmNhYmNcXG4nXG5cbiAgZGVzY3JpYmUgXCJbcmVncmVzc2lvbiBndWFyZF0gcmVwZWF0KDsgb3IgLCkgYWZ0ZXIgdXNlZCBhcyBvcGVyYXRvciB0YXJnZXRcIiwgLT5cbiAgICBpdCBcInJlcGVhdCBhZnRlciBkIGZcIiwgLT5cbiAgICAgIHNldCAgICAgICAgICAgICB0ZXh0QzogXCJhMSAgICB8YTIgICAgYTMgICAgYTRcIlxuICAgICAgZW5zdXJlIFwiZCBmIGFcIiwgdGV4dEM6IFwiYTEgICAgfDMgICAgYTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCI7XCIsICAgICB0ZXh0QzogXCJhMSAgICAzICAgIHxhNFwiLCBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcbiAgICAgIGVuc3VyZSBcIixcIiwgICAgIHRleHRDOiBcInxhMSAgICAzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgIGl0IFwicmVwZWF0IGFmdGVyIGQgdFwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICAgIHRleHRDOiBcInxhMSAgICBhMiAgICBhMyAgICBhNFwiXG4gICAgICBlbnN1cmUgXCJkIHQgYVwiLCB0ZXh0QzogXCJ8YTIgICAgYTMgICAgYTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCI7XCIsICAgICB0ZXh0QzogXCJhMiAgIHwgYTMgICAgYTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCIsXCIsICAgICB0ZXh0QzogXCJhfDIgICAgYTMgICAgYTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgaXQgXCJyZXBlYXQgYWZ0ZXIgZCBGXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwiYTEgICAgYTIgICAgYTMgICAgfGE0XCJcbiAgICAgIGVuc3VyZSBcImQgRiBhXCIsIHRleHRDOiBcImExICAgIGEyICAgIHxhNFwiLCBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcbiAgICAgIGVuc3VyZSBcIjtcIiwgICAgIHRleHRDOiBcImExICAgIHxhMiAgICBhNFwiLCBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcbiAgICAgIGVuc3VyZSBcIixcIiwgICAgIHRleHRDOiBcImExICAgIGEyICAgIHxhNFwiLCBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcbiAgICBpdCBcInJlcGVhdCBhZnRlciBkIFRcIiwgLT5cbiAgICAgIHNldCAgICAgICAgICAgICB0ZXh0QzogXCJhMSAgICBhMiAgICBhMyAgICB8YTRcIlxuICAgICAgc2V0ICAgICAgICAgICAgIHRleHRDOiBcImExICAgIGEyICAgIGF8YTRcIlxuICAgICAgZW5zdXJlIFwiZCBUIGFcIiwgdGV4dEM6IFwiYTEgICAgYTIgICAgYXxhNFwiLCBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcbiAgICAgIGVuc3VyZSBcIjtcIiwgICAgIHRleHRDOiBcImExICAgIGF8MiAgICBhYTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCIsXCIsICAgICB0ZXh0QzogXCJhMSAgICBhMiAgIHwgYWE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuXG4gIGRlc2NyaWJlIFwiY2FuY2VsbGF0aW9uXCIsIC0+XG4gICAgaXQgXCJrZWVwcyBtdWx0aXBsZS1jdXJzb3JzIHdoZW4gY2FuY2VsbGVkXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICBhXFxuISAgIGFcXG58ICAgYVxcblwiXG4gICAgICBlbnN1cmUgXCJmIGVzY2FwZVwiLCAgdGV4dEM6IFwifCAgIGFcXG4hICAgYVxcbnwgICBhXFxuXCJcblxuICBkZXNjcmliZSAndGhlIHQvVCBrZXliaW5kaW5ncycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiYWJjYWJjYWJjYWJjXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdtb3ZlcyB0byB0aGUgY2hhcmFjdGVyIHByZXZpb3VzIHRvIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIGVuc3VyZSAndCBhJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICMgb3Igc3RheXMgcHV0IHdoZW4gaXQncyBhbHJlYWR5IHRoZXJlXG4gICAgICBlbnN1cmUgJ3QgYScsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCAnbW92ZXMgYmFja3dhcmRzIHRvIHRoZSBjaGFyYWN0ZXIgYWZ0ZXIgdGhlIGZpcnN0IHNwZWNpZmllZCBjaGFyYWN0ZXIgaXQgZmluZHMnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJ1QgYScsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgZm9yd2FyZCcsIC0+XG4gICAgICBlbnN1cmUgJzIgdCBhJywgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0ICdyZXNwZWN0cyBjb3VudCBiYWNrd2FyZCcsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMiBUIGEnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgXCJkb2Vzbid0IG1vdmUgaWYgdGhlIGNoYXJhY3RlciBzcGVjaWZpZWQgaXNuJ3QgZm91bmRcIiwgLT5cbiAgICAgIGVuc3VyZSAndCBkJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZXJlIGFyZW4ndCB0aGUgc3BlY2lmaWVkIGNvdW50IG9mIHRoZSBzcGVjaWZpZWQgY2hhcmFjdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJzEgMCB0IGQnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhIGJ1ZyB3YXMgbWFraW5nIHRoaXMgYmVoYXZpb3VyIGRlcGVuZCBvbiB0aGUgY291bnRcbiAgICAgIGVuc3VyZSAnMSAxIHQgYScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAjIGFuZCBiYWNrd2FyZHMgbm93XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMSAwIFQgYScsIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMSBUIGEnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJjb21wb3NlcyB3aXRoIGRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIDIgdCBiJyxcbiAgICAgICAgdGV4dDogJ2FiY2JjYWJjXFxuJ1xuXG4gICAgaXQgXCJkZWxldGUgY2hhciB1bmRlciBjdXJzb3IgZXZlbiB3aGVuIG5vIG1vdmVtZW50IGhhcHBlbnMgc2luY2UgaXQncyBpbmNsdXNpdmUgbW90aW9uXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZCB0IGInLFxuICAgICAgICB0ZXh0OiAnYmNhYmNhYmNhYmNcXG4nXG4gICAgaXQgXCJkbyBub3RoaW5nIHdoZW4gaW5jbHVzaXZlbmVzcyBpbnZlcnRlZCBieSB2IG9wZXJhdG9yLW1vZGlmaWVyXCIsIC0+XG4gICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZCB2IHQgYicsXG4gICAgICAgIHRleHQ6ICdhYmNhYmNhYmNhYmNcXG4nXG5cbiAgICBpdCBcIlQgYmVoYXZlcyBleGNsdXNpdmVseSB3aGVuIGNvbXBvc2VzIHdpdGggb3BlcmF0b3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIFQgYicsXG4gICAgICAgIHRleHQ6ICdhYmFiY2FiY2FiY1xcbidcblxuICAgIGl0IFwiVCBkb24ndCBkZWxldGUgY2hhcmFjdGVyIHVuZGVyIGN1cnNvciBldmVuIHdoZW4gbm8gbW92ZW1lbnQgaGFwcGVuc1wiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ2QgVCBjJyxcbiAgICAgICAgdGV4dDogJ2FiY2FiY2FiY2FiY1xcbidcblxuICBkZXNjcmliZSAndGhlIDsgYW5kICwga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdCBmIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJzsnLCAgIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJzsnLCAgIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCBGIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlICdGIGMnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJyZXBlYXQgZiBpbiBvcHBvc2l0ZSBkaXJlY3Rpb25cIiwgLT5cbiAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnLCcsICAgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwicmVwZWF0IEYgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJ0YgYycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJywnLCAgIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCAgIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcImFsdGVybmF0ZSByZXBlYXQgZiBpbiBzYW1lIGRpcmVjdGlvbiBhbmQgcmV2ZXJzZVwiLCAtPlxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgXCJhbHRlcm5hdGUgcmVwZWF0IEYgaW4gc2FtZSBkaXJlY3Rpb24gYW5kIHJldmVyc2VcIiwgLT5cbiAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgMTBdXG4gICAgICBlbnN1cmUgJ0YgYycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzsnLCAgIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCAgIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCB0IGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ3QgYycsIGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJzsnLCAgIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInJlcGVhdCBUIGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlICdUIGMnLCBjdXJzb3I6IFswLCA5XVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJyZXBlYXQgdCBpbiBvcHBvc2l0ZSBkaXJlY3Rpb24gZmlyc3QsIGFuZCB0aGVuIHJldmVyc2VcIiwgLT5cbiAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAndCBjJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLCcsICAgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnOycsICAgY3Vyc29yOiBbMCwgNF1cblxuICAgIGl0IFwicmVwZWF0IFQgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uIGZpcnN0LCBhbmQgdGhlbiByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJ1QgYycsIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJywnLCAgIGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJzsnLCAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICBpdCBcInJlcGVhdCB3aXRoIGNvdW50IGluIHNhbWUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDJdXG4gICAgICBlbnN1cmUgJzIgOycsIGN1cnNvcjogWzAsIDhdXG5cbiAgICBpdCBcInJlcGVhdCB3aXRoIGNvdW50IGluIHJldmVyc2UgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJzIgLCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgZGVzY3JpYmUgXCJsYXN0IGZpbmQvdGlsbCBpcyByZXBlYXRhYmxlIG9uIG90aGVyIGVkaXRvclwiLCAtPlxuICAgIFtvdGhlciwgb3RoZXJFZGl0b3IsIHBhbmVdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBnZXRWaW1TdGF0ZSAob3RoZXJWaW1TdGF0ZSwgX290aGVyKSAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcImEgYmF6IGJhclxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBvdGhlciA9IF9vdGhlclxuICAgICAgICBvdGhlci5zZXRcbiAgICAgICAgICB0ZXh0OiBcImZvbyBiYXIgYmF6XCIsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgb3RoZXJFZGl0b3IgPSBvdGhlclZpbVN0YXRlLmVkaXRvclxuICAgICAgICAjIGphc21pbmUuYXR0YWNoVG9ET00ob3RoZXJFZGl0b3IuZWxlbWVudClcblxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcblxuICAgIGl0IFwic2hhcmVzIHRoZSBtb3N0IHJlY2VudCBmaW5kL3RpbGwgY29tbWFuZCB3aXRoIG90aGVyIGVkaXRvcnNcIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBiJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBudWxsLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAjIHJlcGxheSBzYW1lIGZpbmQgaW4gdGhlIG90aGVyIGVkaXRvclxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICBvdGhlci5lbnN1cmUgJzsnXG4gICAgICBlbnN1cmUgbnVsbCwgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBudWxsLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgICAjIGRvIGEgdGlsbCBpbiB0aGUgb3RoZXIgZWRpdG9yXG4gICAgICBvdGhlci5lbnN1cmUgJ3QgcidcbiAgICAgIGVuc3VyZSBudWxsLCBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIG51bGwsIGN1cnNvcjogWzAsIDVdXG5cbiAgICAgICMgYW5kIHJlcGxheSBpbiB0aGUgbm9ybWFsIGVkaXRvclxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0oZWRpdG9yKVxuICAgICAgZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgN11cbiAgICAgIG90aGVyLmVuc3VyZSBudWxsLCBjdXJzb3I6IFswLCA1XVxuXG4gICAgaXQgXCJpcyBzdGlsbCByZXBlYXRhYmxlIGFmdGVyIG9yaWdpbmFsIGVkaXRvciB3YXMgZGVzdHJveWVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgYicsIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgbnVsbCwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0ob3RoZXJFZGl0b3IpXG4gICAgICBlZGl0b3IuZGVzdHJveSgpXG4gICAgICBleHBlY3QoZWRpdG9yLmlzQWxpdmUoKSkudG9CZShmYWxzZSlcbiAgICAgIG90aGVyLmVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDRdXG4gICAgICBvdGhlci5lbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgb3RoZXIuZW5zdXJlICcsJywgY3Vyc29yOiBbMCwgNF1cblxuICBkZXNjcmliZSBcInZtcCB1bmlxdWUgZmVhdHVyZSBvZiBgZmAgZmFtaWx5XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpZ25vcmVDYXNlRm9yRmluZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJpZ25vcmVDYXNlRm9yRmluZFwiLCB0cnVlKVxuXG4gICAgICBpdCBcImlnbm9yZSBjYXNlIHRvIGZpbmRcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBhXCIsIHRleHRDOiBcIiAgICB8QSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICB8YSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgfEFiICAgIGFcIlxuXG4gICAgZGVzY3JpYmUgXCJ1c2VTbWFydGNhc2VGb3JGaW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldChcInVzZVNtYXJ0Y2FzZUZvckZpbmRcIiwgdHJ1ZSlcblxuICAgICAgaXQgXCJpZ25vcmUgY2FzZSB3aGVuIGlucHV0IGlzIGxvd2VyIGNoYXJcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBhXCIsIHRleHRDOiBcIiAgICB8QSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICB8YSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgfEFiICAgIGFcIlxuXG4gICAgICBpdCBcImZpbmQgY2FzZS1zZW5zaXRpdmVseSB3aGVuIGlucHV0IGlzIGxhZ2VyIGNoYXJcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBBXCIsIHRleHRDOiBcIiAgICB8QSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmIEFcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYSAgICB8QWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIixcIiwgICB0ZXh0QzogXCIgICAgfEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgfEFiICAgIGFcIlxuXG4gICAgZGVzY3JpYmUgXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldChcInJldXNlRmluZEZvclJlcGVhdEZpbmRcIiwgdHJ1ZSlcblxuICAgICAgaXQgXCJjYW4gcmV1c2UgZiBhbmQgdCBhcyA7LCBGIGFuZCBUIGFzICcsJyByZXNwZWN0aXZlbHlcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwgICAgQSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmIGFcIiwgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImZcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgfGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImZcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYSAgICBBYiAgICB8YVwiXG4gICAgICAgIGVuc3VyZSBcIkZcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgfGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIkZcIiwgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcInRcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICB8IGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcInRcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYSAgICBBYiAgIHwgYVwiXG4gICAgICAgIGVuc3VyZSBcIlRcIiwgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgYXwgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIlRcIiwgdGV4dEM6IFwiICAgIEEgICAgYXxiICAgIGEgICAgQWIgICAgYVwiXG5cbiAgICAgIGl0IFwiYmVoYXZlIGFzIG5vcm1hbCBmIGlmIG5vIHN1Y2Nlc3NmdWwgcHJldmlvdXMgZmluZCB3YXMgZXhpc3RzXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgICAgICB0ZXh0QzogXCIgIHwgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBlc2NhcGVcIiwgdGV4dEM6IFwiICB8ICBBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoXCJjdXJyZW50RmluZFwiKSkudG9CZU51bGwoKVxuICAgICAgICBlbnN1cmUgXCJmIGFcIiwgICAgICB0ZXh0QzogXCIgICAgQSAgICB8YWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZXhwZWN0KHZpbVN0YXRlLmdsb2JhbFN0YXRlLmdldChcImN1cnJlbnRGaW5kXCIpKS50b0JlVHJ1dGh5KClcblxuICAgIGRlc2NyaWJlIFwiZmluZEFjcm9zc0xpbmVzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldChcImZpbmRBY3Jvc3NMaW5lc1wiLCB0cnVlKVxuXG4gICAgICBpdCBcInNlYXJjaGVzIGFjcm9zcyBtdWx0aXBsZSBsaW5lc1wiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgIHRleHRDOiBcInwwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJmIGFcIiwgdGV4dEM6IFwiMDogICAgfGEgICAgYVxcbjE6ICAgIGEgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIwOiAgICBhICAgIHxhXFxuMTogICAgYSAgICBhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIHxhICAgIGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYSAgICB8YVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIGFcXG4yOiAgICB8YSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiRiBhXCIsIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgfGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJ0IGFcIiwgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYSAgICBhXFxuMjogICB8IGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIlQgYVwiLCB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIHxhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiVCBhXCIsIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGF8ICAgIGFcXG4yOiAgICBhICAgIGFcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJmaW5kLW5leHQvcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJmaW5kQ2hhcnNNYXhcIiwgMTApXG4gICAgICAgICMgVG8gcGFzcyBobEZpbmQgbG9naWMgaXQgcmVxdWlyZSBcInZpc2libGVcIiBzY3JlZW4gcmFuZ2UuXG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuXG4gICAgICBkZXNjcmliZSBcImNhbiBmaW5kIG9uZSBvciB0d28gY2hhclwiLCAtPlxuICAgICAgICBpdCBcImFkanVzdCB0byBuZXh0LXByZS1jb25maXJtZWRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuICAgICAgICAgIGVuc3VyZSBcImYgYVwiXG4gICAgICAgICAgZWxlbWVudCA9IHZpbVN0YXRlLmlucHV0RWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIilcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIilcbiAgICAgICAgICBlbnN1cmUgXCJlbnRlclwiLCAgICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgfGEgICAgY2QgICAgYVwiXG5cbiAgICAgICAgaXQgXCJhZGp1c3QgdG8gcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICBlbnN1cmUgXCIzIGYgYSBlbnRlclwiLCB0ZXh0QzogXCIgICAgYSAgICBhYiAgICB8YSAgICBjZCAgICBhXCJcbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgZW5zdXJlIFwiMyBmIGFcIlxuICAgICAgICAgIGVsZW1lbnQgPSB2aW1TdGF0ZS5pbnB1dEVkaXRvci5lbGVtZW50XG4gICAgICAgICAgZGlzcGF0Y2goZWxlbWVudCwgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtcHJldmlvdXMtcHJlLWNvbmZpcm1lZFwiKVxuICAgICAgICAgIGRpc3BhdGNoKGVsZW1lbnQsIFwidmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWRcIilcbiAgICAgICAgICBlbnN1cmUgXCJlbnRlclwiLCAgICAgdGV4dEM6IFwiICAgIHxhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG5cbiAgICAgICAgaXQgXCJpcyB1c2VmdWwgdG8gc2tpcCBlYXJsaWVyIHNwb3QgaW50ZXJhY3RpdmVsbHlcIiwgLT5cbiAgICAgICAgICBzZXQgIHRleHRDOiAndGV4dCA9IFwidGhpcyBpcyB8XFxcImV4YW1wbGVcXFwiIG9mIHVzZSBjYXNlXCInXG4gICAgICAgICAgZW5zdXJlICdjIHQgXCInXG4gICAgICAgICAgZWxlbWVudCA9IHZpbVN0YXRlLmlucHV0RWRpdG9yLmVsZW1lbnRcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIikgIyB0YWJcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIikgIyB0YWJcbiAgICAgICAgICBlbnN1cmUgXCJlbnRlclwiLCB0ZXh0QzogJ3RleHQgPSBcInRoaXMgaXMgfFwiJywgbW9kZTogXCJpbnNlcnRcIlxuXG4gICAgZGVzY3JpYmUgXCJmaW5kQ2hhcnNNYXhcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgIyBUbyBwYXNzIGhsRmluZCBsb2dpYyBpdCByZXF1aXJlIFwidmlzaWJsZVwiIHNjcmVlbiByYW5nZS5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCAyIGxlbmd0aFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENoYXJzTWF4XCIsIDIpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjYW4gZmluZCBvbmUgb3IgdHdvIGNoYXJcIiwgLT5cbiAgICAgICAgICBpdCBcImNhbiBmaW5kIGJ5IHR3byBjaGFyXCIsIC0+XG4gICAgICAgICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGEgYlwiLCB0ZXh0QzogXCIgICAgYSAgICB8YWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYyBkXCIsIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGFcIlxuXG4gICAgICAgICAgaXQgXCJjYW4gZmluZCBieSBvbmUtY2hhciBieSBjb25maXJtaW5nIGV4cGxpY2l0bHlcIiwgLT5cbiAgICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGEgZW50ZXJcIiwgdGV4dEM6IFwiICAgIHxhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGMgZW50ZXJcIiwgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICB8Y2QgICAgYVwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCAzIGxlbmd0aFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENoYXJzTWF4XCIsIDMpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjYW4gZmluZCAzIGF0IG1heGltdW1cIiwgLT5cbiAgICAgICAgICBpdCBcImNhbiBmaW5kIGJ5IG9uZSBvciB0d28gb3IgdGhyZWUgY2hhclwiLCAtPlxuICAgICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGVmZ1wiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGEgYiBlbnRlclwiLCB0ZXh0QzogXCIgICAgYSAgICB8YWIgICAgYSAgICBjZCAgICBlZmdcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBhIGVudGVyXCIsICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgfGEgICAgY2QgICAgZWZnXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYyBkIGVudGVyXCIsIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGVmZ1wiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGUgZiBnXCIsICAgICB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIGNkICAgIHxlZmdcIlxuXG4gICAgICBkZXNjcmliZSBcImF1dG9Db25maXJtVGltZW91dFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENoYXJzTWF4XCIsIDIpXG4gICAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENvbmZpcm1CeVRpbWVvdXRcIiwgNTAwKVxuXG4gICAgICAgIGl0IFwiYXV0by1jb25maXJtIHNpbmdsZS1jaGFyIGlucHV0IG9uIHRpbWVvdXRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG5cbiAgICAgICAgICBlbnN1cmUgXCJmIGFcIiwgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soNTAwKVxuICAgICAgICAgIGVuc3VyZSBudWxsLCAgICB0ZXh0QzogXCIgICAgfGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcblxuICAgICAgICAgIGVuc3VyZSBcImYgYyBkXCIsIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGFcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiZiBhXCIsICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICB8Y2QgICAgYVwiXG4gICAgICAgICAgYWR2YW5jZUNsb2NrKDUwMClcbiAgICAgICAgICBlbnN1cmUgbnVsbCwgICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICBjZCAgICB8YVwiXG5cbiAgICAgICAgICBlbnN1cmUgXCJGIGJcIiwgICB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIGNkICAgIHxhXCJcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soNTAwKVxuICAgICAgICAgIGVuc3VyZSBudWxsLCAgICB0ZXh0QzogXCIgICAgYSAgICBhfGIgICAgYSAgICBjZCAgICBhXCJcbiJdfQ==
