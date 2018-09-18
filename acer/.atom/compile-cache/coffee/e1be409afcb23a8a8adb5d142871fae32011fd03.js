(function() {
  var getView, getVimState, packageName, ref;

  ref = require('./spec-helper'), getVimState = ref.getVimState, getView = ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, ref1, set, vimState, workspaceElement;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4], workspaceElement = ref1[5];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure(null, {
          mode: 'normal'
        });
      });
      return it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("N");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("I");
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvdmltLW1vZGUtcGx1cy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLGVBQVIsQ0FBekIsRUFBQyw2QkFBRCxFQUFjOztFQUVkLFdBQUEsR0FBYzs7RUFDZCxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0FBQ3hCLFFBQUE7SUFBQSxPQUFtRSxFQUFuRSxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLGdCQUFkLEVBQXNCLHVCQUF0QixFQUFxQyxrQkFBckMsRUFBK0M7SUFFL0MsVUFBQSxDQUFXLFNBQUE7TUFDVCxXQUFBLENBQVksU0FBQyxTQUFELEVBQVksR0FBWjtRQUNWLFFBQUEsR0FBVztRQUNWLHlCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBZ0I7TUFITixDQUFaO01BS0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLElBQUksQ0FBQyxTQUFiO2FBRW5CLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixZQUE5QjtNQURjLENBQWhCO0lBUlMsQ0FBWDtJQVdBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUE7TUFDcEIsRUFBQSxDQUFHLHFEQUFILEVBQTBELFNBQUE7ZUFDeEQsTUFBQSxDQUFPLElBQVAsRUFBYTtVQUFBLElBQUEsRUFBTSxRQUFOO1NBQWI7TUFEd0QsQ0FBMUQ7YUFHQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQTtBQUNqRCxZQUFBO1FBQUEsYUFBQSxHQUFnQjtRQUVoQixRQUFBLENBQVMsU0FBQTtpQkFDUCxhQUFBLEdBQWdCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLDJCQUEvQjtRQURULENBQVQ7ZUFHQSxJQUFBLENBQUssU0FBQTtVQUNILE1BQUEsQ0FBTyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QztVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFaO2lCQUNBLE1BQUEsQ0FBTyxhQUFhLENBQUMsV0FBckIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxHQUF2QztRQUhHLENBQUw7TUFOaUQsQ0FBbkQ7SUFKb0IsQ0FBdEI7V0FlQSxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO01BQ3RCLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO1FBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWQsQ0FBZ0MsV0FBaEM7UUFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxlQUFqQyxDQUFQLENBQXlELENBQUMsSUFBMUQsQ0FBK0QsS0FBL0Q7ZUFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxhQUFqQyxDQUFQLENBQXVELENBQUMsSUFBeEQsQ0FBNkQsS0FBN0Q7TUFINEMsQ0FBOUM7YUFLQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQTtBQUNyRCxZQUFBO1FBQUEsV0FBQSxHQUFjLFNBQUE7aUJBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFkLENBQTJCO1lBQUEsTUFBQSxFQUFRLGFBQVI7V0FBM0IsQ0FBaUQsQ0FBQyxNQUFsRCxDQUF5RCxTQUFDLEdBQUQ7bUJBQ3ZELEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVCxDQUFvQixnQkFBcEI7VUFEdUQsQ0FBekQ7UUFEWTtRQUlkLE1BQUEsQ0FBTyxXQUFBLENBQUEsQ0FBYSxDQUFDLE1BQXJCLENBQTRCLENBQUMsZUFBN0IsQ0FBNkMsQ0FBN0M7UUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLFdBQWhDO2VBQ0EsTUFBQSxDQUFPLFdBQUEsQ0FBQSxDQUFhLENBQUMsTUFBckIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxDQUFsQztNQVBxRCxDQUF2RDtJQU5zQixDQUF4QjtFQTdCd0IsQ0FBMUI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZ2V0Vmlld30gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5wYWNrYWdlTmFtZSA9ICd2aW0tbW9kZS1wbHVzJ1xuZGVzY3JpYmUgXCJ2aW0tbW9kZS1wbHVzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZSwgd29ya3NwYWNlRWxlbWVudF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoX3ZpbVN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IF92aW1TdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBfdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZX0gPSB2aW1cblxuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBnZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnc3RhdHVzLWJhcicpXG5cbiAgZGVzY3JpYmUgXCIuYWN0aXZhdGVcIiwgLT5cbiAgICBpdCBcInB1dHMgdGhlIGVkaXRvciBpbiBub3JtYWwtbW9kZSBpbml0aWFsbHkgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgZW5zdXJlIG51bGwsIG1vZGU6ICdub3JtYWwnXG5cbiAgICBpdCBcInNob3dzIHRoZSBjdXJyZW50IHZpbSBtb2RlIGluIHRoZSBzdGF0dXMgYmFyXCIsIC0+XG4gICAgICBzdGF0dXNCYXJUaWxlID0gbnVsbFxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBzdGF0dXNCYXJUaWxlID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI3N0YXR1cy1iYXItdmltLW1vZGUtcGx1c1wiKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChzdGF0dXNCYXJUaWxlLnRleHRDb250ZW50KS50b0JlKFwiTlwiKVxuICAgICAgICBlbnN1cmUgJ2knLCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICBleHBlY3Qoc3RhdHVzQmFyVGlsZS50ZXh0Q29udGVudCkudG9CZShcIklcIilcblxuICBkZXNjcmliZSBcIi5kZWFjdGl2YXRlXCIsIC0+XG4gICAgaXQgXCJyZW1vdmVzIHRoZSB2aW0gY2xhc3NlcyBmcm9tIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFja2FnZU5hbWUpXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJ2aW0tbW9kZS1wbHVzXCIpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibm9ybWFsLW1vZGVcIikpLnRvQmUoZmFsc2UpXG5cbiAgICBpdCBcInJlbW92ZXMgdGhlIHZpbSBjb21tYW5kcyBmcm9tIHRoZSBlZGl0b3IgZWxlbWVudFwiLCAtPlxuICAgICAgdmltQ29tbWFuZHMgPSAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmZpbmRDb21tYW5kcyh0YXJnZXQ6IGVkaXRvckVsZW1lbnQpLmZpbHRlciAoY21kKSAtPlxuICAgICAgICAgIGNtZC5uYW1lLnN0YXJ0c1dpdGgoXCJ2aW0tbW9kZS1wbHVzOlwiKVxuXG4gICAgICBleHBlY3QodmltQ29tbWFuZHMoKS5sZW5ndGgpLnRvQmVHcmVhdGVyVGhhbigwKVxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrYWdlTmFtZSlcbiAgICAgIGV4cGVjdCh2aW1Db21tYW5kcygpLmxlbmd0aCkudG9CZSgwKVxuIl19
