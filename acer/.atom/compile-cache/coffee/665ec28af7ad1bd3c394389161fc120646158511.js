(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Scrolling", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure;
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("scrolling keybindings", function() {
      beforeEach(function() {
        var component, initialRowRange;
        component = editor.component;
        component.element.style.height = component.getLineHeight() * 5 + 'px';
        editorElement.measureDimensions();
        initialRowRange = [0, 5];
        set({
          textC: "100\n200\n30|0\n400\n500\n600\n700\n800\n900\n1000"
        });
        return expect(editorElement.getVisibleRowRange()).toEqual(initialRowRange);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          ensure('ctrl-e', {
            cursor: [3, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(6);
          ensure('2 ctrl-e', {
            cursor: [5, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(8);
          ensure('2 ctrl-y', {
            cursor: [4, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          return expect(editor.getLastVisibleScreenRow()).toBe(6);
        });
      });
    });
    describe("redraw-cursor-line keybindings", function() {
      var _ensure;
      _ensure = function(keystroke, arg) {
        var moveToFirstChar, scrollTop;
        scrollTop = arg.scrollTop, moveToFirstChar = arg.moveToFirstChar;
        ensure(keystroke);
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(scrollTop);
        if (moveToFirstChar) {
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        } else {
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        }
      };
      beforeEach(function() {
        var j, results;
        editor.setText((function() {
          results = [];
          for (j = 1; j <= 200; j++){ results.push(j); }
          return results;
        }).apply(this).join("\n"));
        editorElement.style.lineHeight = "20px";
        editorElement.setHeight(20 * 10);
        editorElement.measureDimensions();
        spyOn(editor, 'moveToFirstCharacterOfLine');
        spyOn(editorElement, 'setScrollTop');
        spyOn(editor, 'getFirstVisibleScreenRow').andReturn(90);
        spyOn(editor, 'getLastVisibleScreenRow').andReturn(110);
        return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
          top: 1000,
          left: 0
        });
      });
      describe("at top", function() {
        it("without move cursor", function() {
          return _ensure('z t', {
            scrollTop: 960,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z enter', {
            scrollTop: 960,
            moveToFirstChar: true
          });
        });
      });
      describe("at upper-middle", function() {
        it("without move cursor", function() {
          return _ensure('z u', {
            scrollTop: 950,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z space', {
            scrollTop: 950,
            moveToFirstChar: true
          });
        });
      });
      describe("at middle", function() {
        it("without move cursor", function() {
          return _ensure('z z', {
            scrollTop: 900,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z .', {
            scrollTop: 900,
            moveToFirstChar: true
          });
        });
      });
      return describe("at bottom", function() {
        it("without move cursor", function() {
          return _ensure('z b', {
            scrollTop: 860,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z -', {
            scrollTop: 860,
            moveToFirstChar: true
          });
        });
      });
    });
    return describe("horizontal scroll cursor keybindings", function() {
      beforeEach(function() {
        var i, j, text;
        editorElement.setWidth(600);
        editorElement.setHeight(600);
        editorElement.style.lineHeight = "10px";
        editorElement.style.font = "16px monospace";
        editorElement.measureDimensions();
        text = "";
        for (i = j = 100; j <= 199; i = ++j) {
          text += i + " ";
        }
        editor.setText(text);
        return editor.setCursorBufferPosition([0, 0]);
      });
      describe("the zs keybinding", function() {
        var startPosition, zsPos;
        startPosition = null;
        zsPos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          ensure('z s');
          return editorElement.getScrollLeft();
        };
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        xit("does nothing near the start of the line", function() {
          var pos1;
          pos1 = zsPos(1);
          return expect(pos1).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the left edge of the editor", function() {
          var pos10, pos11;
          pos10 = zsPos(10);
          expect(pos10).toBeGreaterThan(startPosition);
          pos11 = zsPos(11);
          return expect(pos11 - pos10).toEqual(10);
        });
        it("does nothing near the end of the line", function() {
          var pos340, pos390, posEnd;
          posEnd = zsPos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos390 = zsPos(390);
          expect(pos390).toEqual(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 390]);
          pos340 = zsPos(340);
          return expect(pos340).toEqual(posEnd);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zsPos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zsPos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
      return describe("the ze keybinding", function() {
        var startPosition, zePos;
        zePos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          ensure('z e');
          return editorElement.getScrollLeft();
        };
        startPosition = null;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
          expect(zePos(1)).toEqual(startPosition);
          return expect(zePos(40)).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the right edge of the editor", function() {
          var pos110;
          pos110 = zePos(110);
          expect(pos110).toBeGreaterThan(startPosition);
          return expect(pos110 - zePos(109)).toEqual(10);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, posEnd;
          posEnd = zePos(399);
          expect(zePos(397)).toBeLessThan(posEnd);
          pos380 = zePos(380);
          expect(pos380).toBeLessThan(posEnd);
          return expect(zePos(382) - pos380).toEqual(19);
        });
        return it("does nothing if all lines are short", function() {
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          expect(zePos(1)).toEqual(startPosition);
          return expect(zePos(10)).toEqual(startPosition);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvc2Nyb2xsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUVoQixRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO0FBQ3BCLFFBQUE7SUFBQSxNQUFpRCxFQUFqRCxFQUFDLFlBQUQsRUFBTSxlQUFOLEVBQWMsZUFBZCxFQUFzQixzQkFBdEIsRUFBcUM7SUFFckMsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7UUFDUixhQUFELEVBQU07ZUFDTixPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQjtNQUpVLENBQVo7SUFEUyxDQUFYO0lBT0EsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUE7TUFDaEMsVUFBQSxDQUFXLFNBQUE7QUFDVCxZQUFBO1FBQUMsWUFBYTtRQUNkLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQXhCLEdBQWlDLFNBQVMsQ0FBQyxhQUFWLENBQUEsQ0FBQSxHQUE0QixDQUE1QixHQUFnQztRQUNqRSxhQUFhLENBQUMsaUJBQWQsQ0FBQTtRQUNBLGVBQUEsR0FBa0IsQ0FBQyxDQUFELEVBQUksQ0FBSjtRQUVsQixHQUFBLENBQ0U7VUFBQSxLQUFBLEVBQU8sb0RBQVA7U0FERjtlQWFBLE1BQUEsQ0FBTyxhQUFhLENBQUMsa0JBQWQsQ0FBQSxDQUFQLENBQTBDLENBQUMsT0FBM0MsQ0FBbUQsZUFBbkQ7TUFuQlMsQ0FBWDthQXFCQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQTtlQUM1QyxFQUFBLENBQUcsK0RBQUgsRUFBb0UsU0FBQTtVQUNsRSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLE1BQUEsRUFB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MkIsQ0FBQyxPQUE1QixDQUFvQyxFQUFwQztRQUxvRCxDQUF0RDtlQU9BLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBO1VBQ3hDLE1BQU0sQ0FBQyxPQUFQLENBQWUsT0FBZjtVQUNBLGFBQUEsR0FBZ0IsYUFBYSxDQUFDLGFBQWQsQ0FBQTtVQUNoQixNQUFBLENBQU8sS0FBQSxDQUFNLENBQU4sQ0FBUCxDQUFnQixDQUFDLE9BQWpCLENBQXlCLGFBQXpCO2lCQUNBLE1BQUEsQ0FBTyxLQUFBLENBQU0sRUFBTixDQUFQLENBQWlCLENBQUMsT0FBbEIsQ0FBMEIsYUFBMUI7UUFKd0MsQ0FBMUM7TUE1QjRCLENBQTlCO0lBMUQrQyxDQUFqRDtFQWpGb0IsQ0FBdEI7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIlNjcm9sbGluZ1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmV9ID0gdmltXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgZGVzY3JpYmUgXCJzY3JvbGxpbmcga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB7Y29tcG9uZW50fSA9IGVkaXRvclxuICAgICAgY29tcG9uZW50LmVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gY29tcG9uZW50LmdldExpbmVIZWlnaHQoKSAqIDUgKyAncHgnXG4gICAgICBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zKClcbiAgICAgIGluaXRpYWxSb3dSYW5nZSA9IFswLCA1XVxuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDEwMFxuICAgICAgICAgIDIwMFxuICAgICAgICAgIDMwfDBcbiAgICAgICAgICA0MDBcbiAgICAgICAgICA1MDBcbiAgICAgICAgICA2MDBcbiAgICAgICAgICA3MDBcbiAgICAgICAgICA4MDBcbiAgICAgICAgICA5MDBcbiAgICAgICAgICAxMDAwXG4gICAgICAgIFwiXCJcIlxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlKCkpLnRvRXF1YWwoaW5pdGlhbFJvd1JhbmdlKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1lIGFuZCBjdHJsLXkga2V5YmluZGluZ3NcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB1cCBhbmQgZG93biBieSBvbmUgYW5kIGtlZXBzIGN1cnNvciBvbnNjcmVlblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtZScsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgMVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgNlxuXG4gICAgICAgIGVuc3VyZSAnMiBjdHJsLWUnLCBjdXJzb3I6IFs1LCAyXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDNcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDhcblxuICAgICAgICBlbnN1cmUgJzIgY3RybC15JywgY3Vyc29yOiBbNCwgMl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSAxXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSA2XG5cbiAgZGVzY3JpYmUgXCJyZWRyYXctY3Vyc29yLWxpbmUga2V5YmluZGluZ3NcIiwgLT5cbiAgICBfZW5zdXJlID0gKGtleXN0cm9rZSwge3Njcm9sbFRvcCwgbW92ZVRvRmlyc3RDaGFyfSkgLT5cbiAgICAgIGVuc3VyZShrZXlzdHJva2UpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHNjcm9sbFRvcClcbiAgICAgIGlmIG1vdmVUb0ZpcnN0Q2hhclxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGVsc2VcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgWzEuLjIwMF0uam9pbihcIlxcblwiKVxuICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5saW5lSGVpZ2h0ID0gXCIyMHB4XCJcblxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoMjAgKiAxMClcbiAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuXG4gICAgICBzcHlPbihlZGl0b3IsICdtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZScpXG4gICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnc2V0U2Nyb2xsVG9wJylcbiAgICAgIHNweU9uKGVkaXRvciwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig5MClcbiAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDExMClcbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdwaXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24nKS5hbmRSZXR1cm4oe3RvcDogMTAwMCwgbGVmdDogMH0pXG5cbiAgICBkZXNjcmliZSBcImF0IHRvcFwiLCAtPlxuICAgICAgaXQgXCJ3aXRob3V0IG1vdmUgY3Vyc29yXCIsIC0+ICAgX2Vuc3VyZSAneiB0JywgICAgIHNjcm9sbFRvcDogOTYwLCBtb3ZlVG9GaXJzdENoYXI6IGZhbHNlXG4gICAgICBpdCBcIndpdGggbW92ZSB0byAxc3QgY2hhclwiLCAtPiBfZW5zdXJlICd6IGVudGVyJywgc2Nyb2xsVG9wOiA5NjAsIG1vdmVUb0ZpcnN0Q2hhcjogdHJ1ZVxuICAgIGRlc2NyaWJlIFwiYXQgdXBwZXItbWlkZGxlXCIsIC0+XG4gICAgICBpdCBcIndpdGhvdXQgbW92ZSBjdXJzb3JcIiwgLT4gICBfZW5zdXJlICd6IHUnLCAgICAgc2Nyb2xsVG9wOiA5NTAsIG1vdmVUb0ZpcnN0Q2hhcjogZmFsc2VcbiAgICAgIGl0IFwid2l0aCBtb3ZlIHRvIDFzdCBjaGFyXCIsIC0+IF9lbnN1cmUgJ3ogc3BhY2UnLCBzY3JvbGxUb3A6IDk1MCwgbW92ZVRvRmlyc3RDaGFyOiB0cnVlXG4gICAgZGVzY3JpYmUgXCJhdCBtaWRkbGVcIiwgLT5cbiAgICAgIGl0IFwid2l0aG91dCBtb3ZlIGN1cnNvclwiLCAtPiAgIF9lbnN1cmUgJ3ogeicsICAgICBzY3JvbGxUb3A6IDkwMCwgbW92ZVRvRmlyc3RDaGFyOiBmYWxzZVxuICAgICAgaXQgXCJ3aXRoIG1vdmUgdG8gMXN0IGNoYXJcIiwgLT4gX2Vuc3VyZSAneiAuJywgICAgIHNjcm9sbFRvcDogOTAwLCBtb3ZlVG9GaXJzdENoYXI6IHRydWVcbiAgICBkZXNjcmliZSBcImF0IGJvdHRvbVwiLCAtPlxuICAgICAgaXQgXCJ3aXRob3V0IG1vdmUgY3Vyc29yXCIsIC0+ICAgX2Vuc3VyZSAneiBiJywgICAgIHNjcm9sbFRvcDogODYwLCBtb3ZlVG9GaXJzdENoYXI6IGZhbHNlXG4gICAgICBpdCBcIndpdGggbW92ZSB0byAxc3QgY2hhclwiLCAtPiBfZW5zdXJlICd6IC0nLCAgICAgc2Nyb2xsVG9wOiA4NjAsIG1vdmVUb0ZpcnN0Q2hhcjogdHJ1ZVxuXG4gIGRlc2NyaWJlIFwiaG9yaXpvbnRhbCBzY3JvbGwgY3Vyc29yIGtleWJpbmRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCg2MDApXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg2MDApXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmxpbmVIZWlnaHQgPSBcIjEwcHhcIlxuICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5mb250ID0gXCIxNnB4IG1vbm9zcGFjZVwiXG4gICAgICBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zKClcblxuICAgICAgdGV4dCA9IFwiXCJcbiAgICAgIGZvciBpIGluIFsxMDAuLjE5OV1cbiAgICAgICAgdGV4dCArPSBcIiN7aX0gXCJcbiAgICAgIGVkaXRvci5zZXRUZXh0KHRleHQpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgenMga2V5YmluZGluZ1wiLCAtPlxuICAgICAgc3RhcnRQb3NpdGlvbiA9IG51bGxcblxuICAgICAgenNQb3MgPSAocG9zKSAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIHBvc10pXG4gICAgICAgIGVuc3VyZSAneiBzJ1xuICAgICAgICBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICAjIEZJWE1FOiByZW1vdmUgaW4gZnV0dXJlXG4gICAgICB4aXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zMSA9IHpzUG9zKDEpXG4gICAgICAgIGV4cGVjdChwb3MxKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0aGUgbmVhcmVzdCBpdCBjYW4gdG8gdGhlIGxlZnQgZWRnZSBvZiB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICAgIHBvczEwID0genNQb3MoMTApXG4gICAgICAgIGV4cGVjdChwb3MxMCkudG9CZUdyZWF0ZXJUaGFuKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgICAgcG9zMTEgPSB6c1BvcygxMSlcbiAgICAgICAgZXhwZWN0KHBvczExIC0gcG9zMTApLnRvRXF1YWwoMTApXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIG5lYXIgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3NFbmQgPSB6c1BvcygzOTkpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMzk5XVxuXG4gICAgICAgIHBvczM5MCA9IHpzUG9zKDM5MClcbiAgICAgICAgZXhwZWN0KHBvczM5MCkudG9FcXVhbChwb3NFbmQpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMzkwXVxuXG4gICAgICAgIHBvczM0MCA9IHpzUG9zKDM0MClcbiAgICAgICAgZXhwZWN0KHBvczM0MCkudG9FcXVhbChwb3NFbmQpXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGFsbCBsaW5lcyBhcmUgc2hvcnRcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ3Nob3J0JylcbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICAgIHBvczEgPSB6c1BvcygxKVxuICAgICAgICBleHBlY3QocG9zMSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDFdXG4gICAgICAgIHBvczEwID0genNQb3MoMTApXG4gICAgICAgIGV4cGVjdChwb3MxMCkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcInRoZSB6ZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICB6ZVBvcyA9IChwb3MpIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgcG9zXSlcbiAgICAgICAgZW5zdXJlICd6IGUnXG4gICAgICAgIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgIHN0YXJ0UG9zaXRpb24gPSBudWxsXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIG5lYXIgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGV4cGVjdCh6ZVBvcygxKSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoemVQb3MoNDApKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0aGUgbmVhcmVzdCBpdCBjYW4gdG8gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGVkaXRvclwiLCAtPlxuICAgICAgICBwb3MxMTAgPSB6ZVBvcygxMTApXG4gICAgICAgIGV4cGVjdChwb3MxMTApLnRvQmVHcmVhdGVyVGhhbihzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QocG9zMTEwIC0gemVQb3MoMTA5KSkudG9FcXVhbCgxMClcblxuICAgICAgIyBGSVhNRSBkZXNjcmlwdGlvbiBpcyBubyBsb25nZXIgYXBwcm9wcmlhdGVcbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIHdoZW4gdmVyeSBuZWFyIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zRW5kID0gemVQb3MoMzk5KVxuICAgICAgICBleHBlY3QoemVQb3MoMzk3KSkudG9CZUxlc3NUaGFuKHBvc0VuZClcbiAgICAgICAgcG9zMzgwID0gemVQb3MoMzgwKVxuICAgICAgICBleHBlY3QocG9zMzgwKS50b0JlTGVzc1RoYW4ocG9zRW5kKVxuICAgICAgICBleHBlY3QoemVQb3MoMzgyKSAtIHBvczM4MCkudG9FcXVhbCgxOSlcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgYWxsIGxpbmVzIGFyZSBzaG9ydFwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnc2hvcnQnKVxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgICAgICAgZXhwZWN0KHplUG9zKDEpKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdCh6ZVBvcygxMCkpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiJdfQ==
