(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Insert mode commands", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
    });
    return describe("Copy from line above/below", function() {
      beforeEach(function() {
        set({
          text: "12345\n\nabcd\nefghi",
          cursor: [[1, 0], [3, 0]]
        });
        return ensure('i');
      });
      describe("the ctrl-y command", function() {
        it("copies from the line above", function() {
          ensure('ctrl-y', {
            text: "12345\n1\nabcd\naefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-y', {
            text: "12345\n1 3\nabcd\na cefghi"
          });
        });
        it("does nothing if there's nothing above the cursor", function() {
          editor.insertText('fill');
          ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
          return ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
        });
        return it("does nothing on the first line", function() {
          set({
            textC: "12|345\n\nabcd\nef!ghi"
          });
          editor.insertText('a');
          ensure(null, {
            textC: "12a|345\n\nabcd\nefa!ghi"
          });
          return ensure('ctrl-y', {
            textC: "12a|345\n\nabcd\nefad!ghi"
          });
        });
      });
      describe("the ctrl-e command", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-e': 'vim-mode-plus:copy-from-line-below'
            }
          });
        });
        it("copies from the line below", function() {
          ensure('ctrl-e', {
            text: "12345\na\nabcd\nefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-e', {
            text: "12345\na c\nabcd\n efghi"
          });
        });
        return it("does nothing if there's nothing below the cursor", function() {
          editor.insertText('foo');
          ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
          return ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
        });
      });
      return describe("InsertLastInserted", function() {
        var ensureInsertLastInserted;
        ensureInsertLastInserted = function(key, options) {
          var finalText, insert, text;
          insert = options.insert, text = options.text, finalText = options.finalText;
          ensure(key);
          editor.insertText(insert);
          ensure("escape", {
            text: text
          });
          return ensure("G I ctrl-a", {
            text: finalText
          });
        };
        beforeEach(function() {
          var initialText;
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-a': 'vim-mode-plus:insert-last-inserted'
            }
          });
          initialText = "abc\ndef\n";
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
        it("case-i: single-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx',
            text: "xxxabc\ndef\n",
            finalText: "xxxabc\nxxxdef\n"
          });
        });
        it("case-o: single-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx',
            text: "abc\nxxx\ndef\n",
            finalText: "abc\nxxx\nxxxdef\n"
          });
        });
        it("case-O: single-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx',
            text: "xxx\nabc\ndef\n",
            finalText: "xxx\nabc\nxxxdef\n"
          });
        });
        it("case-i: multi-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\nabc\ndef\n",
            finalText: "xxx\nyyy\nabc\nxxx\nyyy\ndef\n"
          });
        });
        it("case-o: multi-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx\nyyy\n',
            text: "abc\nxxx\nyyy\n\ndef\n",
            finalText: "abc\nxxx\nyyy\n\nxxx\nyyy\ndef\n"
          });
        });
        return it("case-O: multi-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\n\nabc\ndef\n",
            finalText: "xxx\nyyy\n\nabc\nxxx\nyyy\ndef\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvaW5zZXJ0LW1vZGUtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLGNBQWUsT0FBQSxDQUFRLGVBQVI7O0VBRWhCLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO0FBQy9CLFFBQUE7SUFBQSxNQUFpRCxFQUFqRCxFQUFDLFlBQUQsRUFBTSxlQUFOLEVBQWMsZUFBZCxFQUFzQixzQkFBdEIsRUFBcUM7SUFFckMsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxTQUFELEVBQVksR0FBWjtRQUNWLFFBQUEsR0FBVztRQUNWLHlCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBZ0I7TUFITixDQUFaO0lBRFMsQ0FBWDtXQU1BLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBO01BQ3JDLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsR0FBQSxDQUNFO1VBQUEsSUFBQSxFQUFNLHNCQUFOO1VBTUEsTUFBQSxFQUFRLENBQUMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFELEVBQVMsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFULENBTlI7U0FERjtlQVFBLE1BQUEsQ0FBTyxHQUFQO01BVFMsQ0FBWDtNQVdBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBO1FBQzdCLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO1VBQy9CLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sd0JBQU47V0FERjtVQU9BLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO2lCQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sNEJBQU47V0FERjtRQVQrQixDQUFqQztRQWlCQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQTtVQUNyRCxNQUFNLENBQUMsVUFB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RUEsU0FBQSxFQUFXLG9CQUZYO1dBREY7UUFEd0IsQ0FBMUI7UUFLQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQTtpQkFDeEIsd0JBQUEsQ0FBeUIsR0FBekIsRUFDRTtZQUFBLE1BQUEsRUFBUSxLQUFSO1lBQ0EsSUFBQSxFQUFNLGlCQUROO1lBRUEsU0FBQSxFQUFXLG9CQUZYO1dBREY7UUFEd0IsQ0FBMUI7UUFNQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQTtpQkFDdkIsd0JBQUEsQ0FBeUIsR0FBekIsRUFDRTtZQUFBLE1BQUEsRUFBUSxZQUFSO1lBQ0EsSUFBQSxFQUFNLHNCQUROO1lBRUEsU0FBQSxFQUFXLGdDQUZYO1dBREY7UUFEdUIsQ0FBekI7UUFLQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQTtpQkFDdkIsd0JBQUEsQ0FBeUIsR0FBekIsRUFDRTtZQUFBLE1BQUEsRUFBUSxZQUFSO1lBQ0EsSUFBQSxFQUFNLHdCQUROO1lBRUEsU0FBQSxFQUFXLGtDQUZYO1dBREY7UUFEdUIsQ0FBekI7ZUFLQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQTtpQkFDdkIsd0JBQUEsQ0FBeUIsR0FBekIsRUFDRTtZQUFBLE1BQUEsRUFBUSxZQUFSO1lBQ0EsSUFBQSxFQUFNLHdCQUROO1lBRUEsU0FBQSxFQUFXLGtDQUZYO1dBREY7UUFEdUIsQ0FBekI7TUFsRDZCLENBQS9CO0lBaEhxQyxDQUF2QztFQVQrQixDQUFqQztBQUZBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlIFwiSW5zZXJ0IG1vZGUgY29tbWFuZHNcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChfdmltU3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gX3ZpbVN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IF92aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlfSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiQ29weSBmcm9tIGxpbmUgYWJvdmUvYmVsb3dcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcblxuICAgICAgICAgIGFiY2RcbiAgICAgICAgICBlZmdoaVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFszLCAwXV1cbiAgICAgIGVuc3VyZSAnaSdcblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwteSBjb21tYW5kXCIsIC0+XG4gICAgICBpdCBcImNvcGllcyBmcm9tIHRoZSBsaW5lIGFib3ZlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC15JyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICAxXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBhZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnICdcbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIDEgM1xuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgYSBjZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiB0aGVyZSdzIG5vdGhpbmcgYWJvdmUgdGhlIGN1cnNvclwiLCAtPlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnZmlsbCdcbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGZpbGw1XG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBmaWxsZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2N0cmwteScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgZmlsbDVcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGZpbGxlZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIG9uIHRoZSBmaXJzdCBsaW5lXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAxMnwzNDVcblxuICAgICAgICAgIGFiY2RcbiAgICAgICAgICBlZiFnaGlcbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnYSdcbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTJhfDM0NVxuXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBlZmEhZ2hpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyYXwzNDVcblxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZWZhZCFnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1lIGNvbW1hbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlJzpcbiAgICAgICAgICAgICdjdHJsLWUnOiAndmltLW1vZGUtcGx1czpjb3B5LWZyb20tbGluZS1iZWxvdydcblxuICAgICAgaXQgXCJjb3BpZXMgZnJvbSB0aGUgbGluZSBiZWxvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnICdcbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGEgY1xuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgIGVmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgdGhlcmUncyBub3RoaW5nIGJlbG93IHRoZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2ZvbydcbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGZvb2RcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGZvb2VmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGZvb2RcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGZvb2VmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiSW5zZXJ0TGFzdEluc2VydGVkXCIsIC0+XG4gICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgPSAoa2V5LCBvcHRpb25zKSAtPlxuICAgICAgICB7aW5zZXJ0LCB0ZXh0LCBmaW5hbFRleHR9ID0gb3B0aW9uc1xuICAgICAgICBlbnN1cmUga2V5XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGluc2VydClcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsIHRleHQ6IHRleHRcbiAgICAgICAgZW5zdXJlIFwiRyBJIGN0cmwtYVwiLCB0ZXh0OiBmaW5hbFRleHRcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMuaW5zZXJ0LW1vZGUnOlxuICAgICAgICAgICAgJ2N0cmwtYSc6ICd2aW0tbW9kZS1wbHVzOmluc2VydC1sYXN0LWluc2VydGVkJ1xuXG4gICAgICAgIGluaXRpYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiBcIlwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2knXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KGluaXRpYWxUZXh0KVxuICAgICAgICBlbnN1cmUgXCJlc2NhcGUgZyBnXCIsXG4gICAgICAgICAgdGV4dDogaW5pdGlhbFRleHRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImNhc2UtaTogc2luZ2xlLWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkICdpJyxcbiAgICAgICAgICBpbnNlcnQ6ICd4eHgnXG4gICAgICAgICAgdGV4dDogXCJ4eHhhYmNcXG5kZWZcXG5cIlxuICAgICAgICAgIGZpbmFsVGV4dDogXCJ4eHhhYmNcXG54eHhkZWZcXG5cIlxuICAgICAgaXQgXCJjYXNlLW86IHNpbmdsZS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnbycsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4J1xuICAgICAgICAgIHRleHQ6IFwiYWJjXFxueHh4XFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwiYWJjXFxueHh4XFxueHh4ZGVmXFxuXCJcbiAgICAgIGl0IFwiY2FzZS1POiBzaW5nbGUtbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgJ08nLFxuICAgICAgICAgIGluc2VydDogJ3h4eCdcbiAgICAgICAgICB0ZXh0OiBcInh4eFxcbmFiY1xcbmRlZlxcblwiXG4gICAgICAgICAgZmluYWxUZXh0OiBcInh4eFxcbmFiY1xcbnh4eGRlZlxcblwiXG5cbiAgICAgIGl0IFwiY2FzZS1pOiBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnaScsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4XFxueXl5XFxuJ1xuICAgICAgICAgIHRleHQ6IFwieHh4XFxueXl5XFxuYWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwieHh4XFxueXl5XFxuYWJjXFxueHh4XFxueXl5XFxuZGVmXFxuXCJcbiAgICAgIGl0IFwiY2FzZS1vOiBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnbycsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4XFxueXl5XFxuJ1xuICAgICAgICAgIHRleHQ6IFwiYWJjXFxueHh4XFxueXl5XFxuXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwiYWJjXFxueHh4XFxueXl5XFxuXFxueHh4XFxueXl5XFxuZGVmXFxuXCJcbiAgICAgIGl0IFwiY2FzZS1POiBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnTycsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4XFxueXl5XFxuJ1xuICAgICAgICAgIHRleHQ6IFwieHh4XFxueXl5XFxuXFxuYWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwieHh4XFxueXl5XFxuXFxuYWJjXFxueHh4XFxueXl5XFxuZGVmXFxuXCJcbiJdfQ==
