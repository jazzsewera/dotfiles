(function() {
  var dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator Increase", function() {
    var editor, editorElement, ensure, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
    });
    describe("the ctrl-a/ctrl-x keybindings", function() {
      beforeEach(function() {
        return set({
          textC: "|123\n|ab45\n|cd-67ef\nab-|5\n!a-bcdef"
        });
      });
      describe("increasing numbers", function() {
        describe("normal-mode", function() {
          it("increases the next number", function() {
            set({
              textC: "|     1 abc"
            });
            return ensure('ctrl-a', {
              textC: '     |2 abc'
            });
          });
          it("increases the next number and repeatable", function() {
            ensure('ctrl-a', {
              textC: "12|4\nab4|6\ncd-6|6ef\nab-|4\n!a-bcdef"
            });
            return ensure('.', {
              textC: "12|5\nab4|7\ncd-6|5ef\nab-|3\n!a-bcdef"
            });
          });
          it("support count", function() {
            return ensure('5 ctrl-a', {
              textC: "12|8\nab5|0\ncd-6|2ef\nab|0\n!a-bcdef"
            });
          });
          it("can make a negative number positive, change number of digits", function() {
            return ensure('9 9 ctrl-a', {
              textC: "22|2\nab14|4\ncd3|2ef\nab9|4\n|a-bcdef"
            });
          });
          it("does nothing when cursor is after the number", function() {
            set({
              cursor: [2, 5]
            });
            return ensure('ctrl-a', {
              textC: "123\nab45\ncd-67|ef\nab-5\na-bcdef"
            });
          });
          it("does nothing on an empty line", function() {
            set({
              textC: "|\n!"
            });
            return ensure('ctrl-a', {
              textC: "|\n!"
            });
          });
          return it("honours the vim-mode-plus.numberRegex setting", function() {
            settings.set('numberRegex', '(?:\\B-)?[0-9]+');
            set({
              textC: "|123\n|ab45\n|cd -67ef\nab-|5\n!a-bcdef"
            });
            return ensure('ctrl-a', {
              textC: "12|4\nab4|6\ncd -6|6ef\nab-|6\n!a-bcdef"
            });
          });
        });
        return describe("visual-mode", function() {
          beforeEach(function() {
            return set({
              textC: "1 |2 3\n1 2 3\n1 2 3\n1 2 3"
            });
          });
          it("increase number in characterwise selected range", function() {
            return ensure('v 2 j ctrl-a', {
              textC: "1 |3 4\n2 3 4\n2 3 3\n1 2 3"
            });
          });
          it("increase number in characterwise selected range when multiple cursors", function() {
            set({
              textC: "1 |2 3\n1 2 3\n1 !2 3\n1 2 3"
            });
            return ensure('v 1 0 ctrl-a', {
              textC: "1 |12 3\n1 2 3\n1 !12 3\n1 2 3"
            });
          });
          it("increase number in linewise selected range", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('V 2 j ctrl-a', {
              textC: "|2 3 4\n2 3 4\n2 3 4\n1 2 3"
            });
          });
          return it("increase number in blockwise selected range", function() {
            set({
              cursor: [1, 2]
            });
            set({
              textC: "1 2 3\n1 !2 3\n1 2 3\n1 2 3"
            });
            return ensure('ctrl-v 2 l 2 j ctrl-a', {
              textC: "1 2 3\n1 !3 4\n1 3 4\n1 3 4"
            });
          });
        });
      });
      return describe("decreasing numbers", function() {
        describe("normal-mode", function() {
          it("decreases the next number and repeatable", function() {
            ensure('ctrl-x', {
              textC: "12|2\nab4|4\ncd-6|8ef\nab-|6\n!a-bcdef"
            });
            return ensure('.', {
              textC: "12|1\nab4|3\ncd-6|9ef\nab-|7\n!a-bcdef"
            });
          });
          it("support count", function() {
            return ensure('5 ctrl-x', {
              textC: "11|8\nab4|0\ncd-7|2ef\nab-1|0\n!a-bcdef"
            });
          });
          it("can make a positive number negative, change number of digits", function() {
            return ensure('9 9 ctrl-x', {
              textC: "2|4\nab-5|4\ncd-16|6ef\nab-10|4\n!a-bcdef"
            });
          });
          it("does nothing when cursor is after the number", function() {
            set({
              cursor: [2, 5]
            });
            return ensure('ctrl-x', {
              textC: "123\nab45\ncd-67|ef\nab-5\na-bcdef"
            });
          });
          it("does nothing on an empty line", function() {
            set({
              textC: "|\n!"
            });
            return ensure('ctrl-x', {
              textC: "|\n!"
            });
          });
          return it("honours the vim-mode-plus.numberRegex setting", function() {
            settings.set('numberRegex', '(?:\\B-)?[0-9]+');
            set({
              textC: "|123\n|ab45\n|cd -67ef\nab-|5\n!a-bcdef"
            });
            return ensure('ctrl-x', {
              textC: "12|2\nab4|4\ncd -6|8ef\nab-|4\n!a-bcdef"
            });
          });
        });
        return describe("visual-mode", function() {
          beforeEach(function() {
            return set({
              text: "1 2 3\n1 2 3\n1 2 3\n1 2 3"
            });
          });
          it("decrease number in characterwise selected range", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('v 2 j ctrl-x', {
              textC: "1 |1 2\n0 1 2\n0 1 3\n1 2 3"
            });
          });
          it("decrease number in characterwise selected range when multiple cursors", function() {
            set({
              textC: "1 |2 3\n1 2 3\n1 !2 3\n1 2 3"
            });
            return ensure('v 5 ctrl-x', {
              textC: "1 |-3 3\n1 2 3\n1 !-3 3\n1 2 3"
            });
          });
          it("decrease number in linewise selected range", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('V 2 j ctrl-x', {
              textC: "|0 1 2\n0 1 2\n0 1 2\n1 2 3"
            });
          });
          return it("decrease number in blockwise selected rage", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('ctrl-v 2 l 2 j ctrl-x', {
              textC: "1 2 3\n1 !1 2\n1 1 2\n1 1 2"
            });
          });
        });
      });
    });
    return describe("the 'g ctrl-a', 'g ctrl-x' increment-number, decrement-number", function() {
      describe("increment", function() {
        beforeEach(function() {
          return set({
            text: "1 10 0\n0 7 0\n0 0 3",
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-1", function() {
          set({
            text: "1 1 1",
            cursor: [0, 0]
          });
          return ensure('g ctrl-a $', {
            text: "1 2 3",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-2", function() {
          set({
            text: "99 1 1",
            cursor: [0, 0]
          });
          return ensure('g ctrl-a $', {
            text: "99 100 101",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("can take count, and used as step to each increment", function() {
          set({
            text: "5 0 0",
            cursor: [0, 0]
          });
          return ensure('5 g ctrl-a $', {
            text: "5 10 15",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("only increment number in target range", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('g ctrl-a j', {
            text: "1 10 0\n0 1 2\n3 4 5",
            mode: 'normal'
          });
        });
        it("works in characterwise visual-mode", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v j g ctrl-a', {
            text: "1 10 0\n0 7 8\n9 10 3",
            mode: 'normal'
          });
        });
        it("works in blockwise visual-mode", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('ctrl-v 2 j $ g ctrl-a', {
            textC: "1 !10 11\n0 12 13\n0 14 15",
            mode: 'normal'
          });
        });
        return describe("point when finished and repeatable", function() {
          beforeEach(function() {
            set({
              text: "1 0 0 0 0",
              cursor: [0, 0]
            });
            return ensure("v $", {
              selectedText: '1 0 0 0 0'
            });
          });
          it("put cursor on start position when finished and repeatable (case: selection is not reversed)", function() {
            ensure(null, {
              selectionIsReversed: false
            });
            ensure('g ctrl-a', {
              text: "1 2 3 4 5",
              cursor: [0, 0],
              mode: 'normal'
            });
            return ensure('.', {
              text: "6 7 8 9 10",
              cursor: [0, 0]
            });
          });
          return it("put cursor on start position when finished and repeatable (case: selection is reversed)", function() {
            ensure('o', {
              selectionIsReversed: true
            });
            ensure('g ctrl-a', {
              text: "1 2 3 4 5",
              cursor: [0, 0],
              mode: 'normal'
            });
            return ensure('.', {
              text: "6 7 8 9 10",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("decrement", function() {
        beforeEach(function() {
          return set({
            text: "14 23 13\n10 20 13\n13 13 16",
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-1", function() {
          set({
            text: "10 1 1"
          });
          return ensure('g ctrl-x $', {
            text: "10 9 8",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-2", function() {
          set({
            text: "99 1 1"
          });
          return ensure('g ctrl-x $', {
            text: "99 98 97",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("can take count, and used as step to each increment", function() {
          set({
            text: "5 0 0",
            cursor: [0, 0]
          });
          return ensure('5 g ctrl-x $', {
            text: "5 0 -5",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("only decrement number in target range", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('g ctrl-x j', {
            text: "14 23 13\n10 9 8\n7 6 5",
            mode: 'normal'
          });
        });
        it("works in characterwise visual-mode", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('v j l g ctrl-x', {
            text: "14 23 13\n10 20 19\n18 17 16",
            mode: 'normal'
          });
        });
        return it("works in blockwise visual-mode", function() {
          set({
            cursor: [0, 3]
          });
          return ensure('ctrl-v 2 j l g ctrl-x', {
            text: "14 23 13\n10 22 13\n13 21 16",
            mode: 'normal'
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvb3BlcmF0b3ItaW5jcmVhc2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTBCLE9BQUEsQ0FBUSxlQUFSLENBQTFCLEVBQUMsNkJBQUQsRUFBYzs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO0FBQzVCLFFBQUE7SUFBQSxPQUFpRCxFQUFqRCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLGdCQUFkLEVBQXNCLHVCQUF0QixFQUFxQztJQUVyQyxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFnQjtNQUhOLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUE7TUFDeEMsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxLQUFBLEVBQU8sd0NBQVA7U0FERjtNQURTLENBQVg7TUFVQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtRQUM3QixRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO1VBQ3RCLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBO1lBQzlCLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxhQUFQO2FBQUo7bUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7Y0FBQSxLQUFBLEVBQU8sYUFBUDthQUFqQjtVQUY4QixDQUFoQztVQUlBLEVBQUEsQ0FBRywwQ0FBSCxFQUErQyxTQUFBO1lBQzdDLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7Y0FBQSxLQUFBLEVBQU8sd0NBQVA7YUFERjttQkFTQSxNQUFBLENBQU8s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LEVBQU0seUJBQU47WUFLQSxJQUFBLEVBQU0sUUFMTjtXQURGO1FBRjBDLENBQTVDO1FBU0EsRUFBQSxDQUFHLG9DQUFILEVBQXlDLFNBQUE7VUFDdkMsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLE1BQUEsQ0FBTyxnQkFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLDhCQUFOO1lBS0EsSUFBQSxFQUFNLFFBTE47V0FERjtRQUZ1QyxDQUF6QztlQVNBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO1VBQ25DLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtpQkFDQSxNQUFBLENBQU8sdUJBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSw4QkFBTjtZQUtBLElBQUEsRUFBTSxRQUxOO1dBREY7UUFGbUMsQ0FBckM7TUFwQ29CLENBQXRCO0lBMUR3RSxDQUExRTtFQTlTNEIsQ0FBOUI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2h9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk9wZXJhdG9yIEluY3JlYXNlXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZX0gPSB2aW1cblxuICBkZXNjcmliZSBcInRoZSBjdHJsLWEvY3RybC14IGtleWJpbmRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgfDEyM1xuICAgICAgICB8YWI0NVxuICAgICAgICB8Y2QtNjdlZlxuICAgICAgICBhYi18NVxuICAgICAgICAhYS1iY2RlZlxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW5jcmVhc2luZyBudW1iZXJzXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIm5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0IFwiaW5jcmVhc2VzIHRoZSBuZXh0IG51bWJlclwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ8ICAgICAxIGFiY1wiXG4gICAgICAgICAgZW5zdXJlICdjdHJsLWEnLCB0ZXh0QzogJyAgICAgfDIgYWJjJ1xuXG4gICAgICAgIGl0IFwiaW5jcmVhc2VzIHRoZSBuZXh0IG51bWJlciBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC1hJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyfDRcbiAgICAgICAgICAgIGFiNHw2XG4gICAgICAgICAgICBjZC02fDZlZlxuICAgICAgICAgICAgYWItfDRcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMnw1XG4gICAgICAgICAgICBhYjR8N1xuICAgICAgICAgICAgY2QtNnw1ZWZcbiAgICAgICAgICAgIGFiLXwzXG4gICAgICAgICAgICAhYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICc1IGN0cmwtYScsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMnw4XG4gICAgICAgICAgICBhYjV8MFxuICAgICAgICAgICAgY2QtNnwyZWZcbiAgICAgICAgICAgIGFifDBcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImNhbiBtYWtlIGEgbmVnYXRpdmUgbnVtYmVyIHBvc2l0aXZlLCBjaGFuZ2UgbnVtYmVyIG9mIGRpZ2l0c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnOSA5IGN0cmwtYScsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAyMnwyXG4gICAgICAgICAgICBhYjE0fDRcbiAgICAgICAgICAgIGNkM3wyZWZcbiAgICAgICAgICAgIGFiOXw0XG4gICAgICAgICAgICB8YS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgd2hlbiBjdXJzb3IgaXMgYWZ0ZXIgdGhlIG51bWJlclwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCA1XVxuICAgICAgICAgIGVuc3VyZSAnY3RybC1hJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyM1xuICAgICAgICAgICAgYWI0NVxuICAgICAgICAgICAgY2QtNjd8ZWZcbiAgICAgICAgICAgIGFiLTVcbiAgICAgICAgICAgIGEtYmNkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiZG9lcyBub3RoaW5nIG9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxcbiAgICAgICAgICAgICFcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnY3RybC1hJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxcbiAgICAgICAgICAgICFcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiaG9ub3VycyB0aGUgdmltLW1vZGUtcGx1cy5udW1iZXJSZWdleCBzZXR0aW5nXCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdudW1iZXJSZWdleCcsICcoPzpcXFxcQi0pP1swLTldKycpXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzpcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHwxMjNcbiAgICAgICAgICAgICAgfGFiNDVcbiAgICAgICAgICAgICAgfGNkIC02N2VmXG4gICAgICAgICAgICAgIGFiLXw1XG4gICAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnY3RybC1hJyxcbiAgICAgICAgICAgIHRleHRDOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgMTJ8NFxuICAgICAgICAgICAgICBhYjR8NlxuICAgICAgICAgICAgICBjZCAtNnw2ZWZcbiAgICAgICAgICAgICAgYWItfDZcbiAgICAgICAgICAgICAgIWEtYmNkZWZcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMSB8MiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcImluY3JlYXNlIG51bWJlciBpbiBjaGFyYWN0ZXJ3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IDIgaiBjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIHwzIDRcbiAgICAgICAgICAgICAgMiAzIDRcbiAgICAgICAgICAgICAgMiAzIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiaW5jcmVhc2UgbnVtYmVyIGluIGNoYXJhY3Rlcndpc2Ugc2VsZWN0ZWQgcmFuZ2Ugd2hlbiBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEgfDIgM1xuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICd2IDEgMCBjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIHwxMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgITEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiaW5jcmVhc2UgbnVtYmVyIGluIGxpbmV3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIDIgaiBjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MiAzIDRcbiAgICAgICAgICAgICAgMiAzIDRcbiAgICAgICAgICAgICAgMiAzIDRcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiaW5jcmVhc2UgbnVtYmVyIGluIGJsb2Nrd2lzZSBzZWxlY3RlZCByYW5nZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiAyIGwgMiBqIGN0cmwtYScsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgITMgNFxuICAgICAgICAgICAgICAxIDMgNFxuICAgICAgICAgICAgICAxIDMgNFxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZGVjcmVhc2luZyBudW1iZXJzXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIm5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0IFwiZGVjcmVhc2VzIHRoZSBuZXh0IG51bWJlciBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC14JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyfDJcbiAgICAgICAgICAgIGFiNHw0XG4gICAgICAgICAgICBjZC02fDhlZlxuICAgICAgICAgICAgYWItfDZcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMnwxXG4gICAgICAgICAgICBhYjR8M1xuICAgICAgICAgICAgY2QtNnw5ZWZcbiAgICAgICAgICAgIGFiLXw3XG4gICAgICAgICAgICAhYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICc1IGN0cmwteCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMXw4XG4gICAgICAgICAgICBhYjR8MFxuICAgICAgICAgICAgY2QtN3wyZWZcbiAgICAgICAgICAgIGFiLTF8MFxuICAgICAgICAgICAgIWEtYmNkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiY2FuIG1ha2UgYSBwb3NpdGl2ZSBudW1iZXIgbmVnYXRpdmUsIGNoYW5nZSBudW1iZXIgb2YgZGlnaXRzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICc5IDkgY3RybC14JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDJ8NFxuICAgICAgICAgICAgYWItNXw0XG4gICAgICAgICAgICBjZC0xNnw2ZWZcbiAgICAgICAgICAgIGFiLTEwfDRcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImRvZXMgbm90aGluZyB3aGVuIGN1cnNvciBpcyBhZnRlciB0aGUgbnVtYmVyXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDVdXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzXG4gICAgICAgICAgICBhYjQ1XG4gICAgICAgICAgICBjZC02N3xlZlxuICAgICAgICAgICAgYWItNVxuICAgICAgICAgICAgYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgIVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgIVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJob25vdXJzIHRoZSB2aW0tbW9kZS1wbHVzLm51bWJlclJlZ2V4IHNldHRpbmdcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ251bWJlclJlZ2V4JywgJyg/OlxcXFxCLSk/WzAtOV0rJylcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHwxMjNcbiAgICAgICAgICAgIHxhYjQ1XG4gICAgICAgICAgICB8Y2QgLTY3ZWZcbiAgICAgICAgICAgIGFiLXw1XG4gICAgICAgICAgICAhYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTJ8MlxuICAgICAgICAgICAgYWI0fDRcbiAgICAgICAgICAgIGNkIC02fDhlZlxuICAgICAgICAgICAgYWItfDRcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcImRlY3JlYXNlIG51bWJlciBpbiBjaGFyYWN0ZXJ3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICd2IDIgaiBjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIHwxIDJcbiAgICAgICAgICAgICAgMCAxIDJcbiAgICAgICAgICAgICAgMCAxIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiZGVjcmVhc2UgbnVtYmVyIGluIGNoYXJhY3Rlcndpc2Ugc2VsZWN0ZWQgcmFuZ2Ugd2hlbiBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEgfDIgM1xuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICd2IDUgY3RybC14JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMSB8LTMgM1xuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEtMyAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiZGVjcmVhc2UgbnVtYmVyIGluIGxpbmV3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIDIgaiBjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MCAxIDJcbiAgICAgICAgICAgICAgMCAxIDJcbiAgICAgICAgICAgICAgMCAxIDJcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiZGVjcmVhc2UgbnVtYmVyIGluIGJsb2Nrd2lzZSBzZWxlY3RlZCByYWdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXYgMiBsIDIgaiBjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICExIDJcbiAgICAgICAgICAgICAgMSAxIDJcbiAgICAgICAgICAgICAgMSAxIDJcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgJ2cgY3RybC1hJywgJ2cgY3RybC14JyBpbmNyZW1lbnQtbnVtYmVyLCBkZWNyZW1lbnQtbnVtYmVyXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbmNyZW1lbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxIDEwIDBcbiAgICAgICAgICAgIDAgNyAwXG4gICAgICAgICAgICAwIDAgM1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwidXNlIGZpcnN0IG51bWJlciBhcyBiYXNlIG51bWJlciBjYXNlLTFcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMSAxIDFcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIGN0cmwtYSAkJywgdGV4dDogXCIxIDIgM1wiLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwidXNlIGZpcnN0IG51bWJlciBhcyBiYXNlIG51bWJlciBjYXNlLTJcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiOTkgMSAxXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBjdHJsLWEgJCcsIHRleHQ6IFwiOTkgMTAwIDEwMVwiLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiY2FuIHRha2UgY291bnQsIGFuZCB1c2VkIGFzIHN0ZXAgdG8gZWFjaCBpbmNyZW1lbnRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiNSAwIDBcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICc1IGcgY3RybC1hICQnLCB0ZXh0OiBcIjUgMTAgMTVcIiwgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIm9ubHkgaW5jcmVtZW50IG51bWJlciBpbiB0YXJnZXQgcmFuZ2VcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBjdHJsLWEgaicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxIDEwIDBcbiAgICAgICAgICAgIDAgMSAyXG4gICAgICAgICAgICAzIDQgNVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwid29ya3MgaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICd2IGogZyBjdHJsLWEnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMSAxMCAwXG4gICAgICAgICAgICAwIDcgOFxuICAgICAgICAgICAgOSAxMCAzXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgaXQgXCJ3b3JrcyBpbiBibG9ja3dpc2UgdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnY3RybC12IDIgaiAkIGcgY3RybC1hJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxICExMCAxMVxuICAgICAgICAgICAgMCAxMiAxM1xuICAgICAgICAgICAgMCAxNCAxNVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGRlc2NyaWJlIFwicG9pbnQgd2hlbiBmaW5pc2hlZCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiMSAwIDAgMCAwXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlIFwidiAkXCIsIHNlbGVjdGVkVGV4dDogJzEgMCAwIDAgMCdcbiAgICAgICAgaXQgXCJwdXQgY3Vyc29yIG9uIHN0YXJ0IHBvc2l0aW9uIHdoZW4gZmluaXNoZWQgYW5kIHJlcGVhdGFibGUgKGNhc2U6IHNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWQpXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG51bGwsIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgICAgZW5zdXJlICdnIGN0cmwtYScsIHRleHQ6IFwiMSAyIDMgNCA1XCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiNiA3IDggOSAxMFwiICwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJwdXQgY3Vyc29yIG9uIHN0YXJ0IHBvc2l0aW9uIHdoZW4gZmluaXNoZWQgYW5kIHJlcGVhdGFibGUgKGNhc2U6IHNlbGVjdGlvbiBpcyByZXZlcnNlZClcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ28nLCBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICAgICAgZW5zdXJlICdnIGN0cmwtYScsIHRleHQ6IFwiMSAyIDMgNCA1XCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiNiA3IDggOSAxMFwiICwgY3Vyc29yOiBbMCwgMF1cbiAgICBkZXNjcmliZSBcImRlY3JlbWVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDE0IDIzIDEzXG4gICAgICAgICAgICAxMCAyMCAxM1xuICAgICAgICAgICAgMTMgMTMgMTZcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcInVzZSBmaXJzdCBudW1iZXIgYXMgYmFzZSBudW1iZXIgY2FzZS0xXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEwIDEgMVwiXG4gICAgICAgIGVuc3VyZSAnZyBjdHJsLXggJCcsIHRleHQ6IFwiMTAgOSA4XCIsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJ1c2UgZmlyc3QgbnVtYmVyIGFzIGJhc2UgbnVtYmVyIGNhc2UtMlwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCI5OSAxIDFcIlxuICAgICAgICBlbnN1cmUgJ2cgY3RybC14ICQnLCB0ZXh0OiBcIjk5IDk4IDk3XCIsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJjYW4gdGFrZSBjb3VudCwgYW5kIHVzZWQgYXMgc3RlcCB0byBlYWNoIGluY3JlbWVudFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCI1IDAgMFwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzUgZyBjdHJsLXggJCcsIHRleHQ6IFwiNSAwIC01XCIsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJvbmx5IGRlY3JlbWVudCBudW1iZXIgaW4gdGFyZ2V0IHJhbmdlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgY3RybC14IGonLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTQgMjMgMTNcbiAgICAgICAgICAgIDEwIDkgOFxuICAgICAgICAgICAgNyA2IDVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBpdCBcIndvcmtzIGluIGNoYXJhY3Rlcndpc2UgdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAndiBqIGwgZyBjdHJsLXgnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTQgMjMgMTNcbiAgICAgICAgICAgIDEwIDIwIDE5XG4gICAgICAgICAgICAxOCAxNyAxNlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwid29ya3MgaW4gYmxvY2t3aXNlIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ2N0cmwtdiAyIGogbCBnIGN0cmwteCcsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxNCAyMyAxM1xuICAgICAgICAgICAgMTAgMjIgMTNcbiAgICAgICAgICAgIDEzIDIxIDE2XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuIl19