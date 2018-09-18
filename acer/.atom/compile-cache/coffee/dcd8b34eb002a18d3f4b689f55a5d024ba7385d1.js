(function() {
  var _, getVimState;

  _ = require('underscore-plus');

  getVimState = require('./spec-helper').getVimState;

  xdescribe("visual-mode performance", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, _vim;
      });
    });
    afterEach(function() {
      vimState.resetNormalMode();
      return vimState.globalState.reset();
    });
    return describe("slow down editor", function() {
      var measureWithTimeEnd, moveRightAndLeftCheck;
      moveRightAndLeftCheck = function(scenario, modeSig) {
        var moveBySelect, moveByVMP, moveCount;
        console.log([scenario, modeSig, atom.getVersion(), atom.packages.getActivePackage('vim-mode-plus').metadata.version]);
        moveCount = 89;
        switch (scenario) {
          case 'vmp':
            moveByVMP = function() {
              _.times(moveCount, function() {
                return ensure('l');
              });
              return _.times(moveCount, function() {
                return ensure('h');
              });
            };
            return _.times(10, function() {
              return measureWithTimeEnd(moveByVMP);
            });
          case 'sel':
            moveBySelect = function() {
              _.times(moveCount, function() {
                return editor.getLastSelection().selectRight();
              });
              return _.times(moveCount, function() {
                return editor.getLastSelection().selectLeft();
              });
            };
            return _.times(15, function() {
              return measureWithTimeEnd(moveBySelect);
            });
        }
      };
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      beforeEach(function() {
        return set({
          cursor: [0, 0],
          text: "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
        });
      });
      return describe("vmp", function() {
        it("[normal] slow down editor", function() {
          return moveRightAndLeftCheck('vmp', 'moveCount');
        });
        it("[vC] slow down editor", function() {
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          ensure('escape', {
            mode: 'normal'
          });
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          return ensure('escape', {
            mode: 'normal'
          });
        });
        return it("[vC] slow down editor", function() {
          return moveRightAndLeftCheck('sel', 'vC');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvcGVyZm9ybWFuY2Utc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUgsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFFaEIsU0FBQSxDQUFVLHlCQUFWLEVBQXFDLFNBQUE7QUFDbkMsUUFBQTtJQUFBLE1BQWlELEVBQWpELEVBQUMsWUFBRCxFQUFNLGVBQU4sRUFBYyxlQUFkLEVBQXNCLHNCQUF0QixFQUFxQztJQUVyQyxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFnQjtNQUhOLENBQVo7SUFEUyxDQUFYO0lBTUEsU0FBQSxDQUFVLFNBQUE7TUFDUixRQUFRLENBQUMsZUFBVCxDQUFBO2FBQ0EsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFyQixDQUFBO0lBRlEsQ0FBVjtXQUlBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFVBQUE7TUFBQSxxQkFBQSxHQUF3QixTQUFDLFFBQUQsRUFBVyxPQUFYO0FBQ3RCLFlBQUE7UUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0IsSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUFwQixFQUF1QyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLGVBQS9CLENBQStDLENBQUMsUUFBUSxDQUFDLE9BQWhHLENBQVo7UUFFQSxTQUFBLEdBQVk7QUFDWixnQkFBTyxRQUFQO0FBQUEsZUFDTyxLQURQO1lBRUksU0FBQSxHQUFZLFNBQUE7Y0FDVixDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxNQUFBLENBQU8sR0FBUDtjQUFILENBQW5CO3FCQUNBLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLE1BQUEsQ0FBTyxHQUFQO2NBQUgsQ0FBbkI7WUFGVTttQkFHWixDQUFDLENBQUMsS0FBRixDQUFRLEVBQVIsRUFBWSxTQUFBO3FCQUFHLGtCQUFBLENBQW1CLFNBQW5CO1lBQUgsQ0FBWjtBQUxKLGVBTU8sS0FOUDtZQU9JLFlBQUEsR0FBZSxTQUFBO2NBQ2IsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBeUIsQ0FBQyxXQUExQixDQUFBO2NBQUgsQ0FBbkI7cUJBQ0EsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBeUIsQ0FBQyxVQUExQixDQUFBO2NBQUgsQ0FBbkI7WUFGYTttQkFHZixDQUFDLENBQUMsS0FBRixDQUFRLEVBQVIsRUFBWSxTQUFBO3FCQUFHLGtCQUFBLENBQW1CLFlBQW5CO1lBQUgsQ0FBWjtBQVZKO01BSnNCO01BZ0J4QixrQkFBQSxHQUFxQixTQUFDLEVBQUQ7UUFDbkIsT0FBTyxDQUFDLElBQVIsQ0FBYSxFQUFFLENBQUMsSUFBaEI7UUFDQSxFQUFBLENBQUE7ZUFDQSxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFFLENBQUMsSUFBbkI7TUFIbUI7TUFLckIsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1VBQ0EsSUFBQSxFQUFNLDRGQUROO1NBREY7TUFEUyxDQUFYO2FBT0EsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsU0FBQTtRQUVkLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBO2lCQUM5QixxQkFBQSxDQUFzQixLQUF0QixFQUE2QixXQUE3QjtRQUQ4QixDQUFoQztRQUVBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBO1VBQzFCLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsZUFBWCxDQUFOO1dBQVo7VUFDQSxxQkFBQSxDQUFzQixLQUF0QixFQUE2QixJQUE3QjtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBakI7VUFFQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLGVBQVgsQ0FBTjtXQUFaO1VBQ0EscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBN0I7aUJBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtRQVAwQixDQUE1QjtlQVNBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBO2lCQUUxQixxQkFBQSxDQUFzQixLQUF0QixFQUE2QixJQUE3QjtRQUYwQixDQUE1QjtNQWJjLENBQWhCO0lBN0IyQixDQUE3QjtFQWJtQyxDQUFyQztBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue2dldFZpbVN0YXRlfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbnhkZXNjcmliZSBcInZpc3VhbC1tb2RlIHBlcmZvcm1hbmNlXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlICMgdG8gcmVmZXIgYXMgdmltU3RhdGUgbGF0ZXIuXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmV9ID0gX3ZpbVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgdmltU3RhdGUuZ2xvYmFsU3RhdGUucmVzZXQoKVxuXG4gIGRlc2NyaWJlIFwic2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgIG1vdmVSaWdodEFuZExlZnRDaGVjayA9IChzY2VuYXJpbywgbW9kZVNpZykgLT5cbiAgICAgIGNvbnNvbGUubG9nIFtzY2VuYXJpbywgbW9kZVNpZywgYXRvbS5nZXRWZXJzaW9uKCksIGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgndmltLW1vZGUtcGx1cycpLm1ldGFkYXRhLnZlcnNpb25dXG5cbiAgICAgIG1vdmVDb3VudCA9IDg5XG4gICAgICBzd2l0Y2ggc2NlbmFyaW9cbiAgICAgICAgd2hlbiAndm1wJ1xuICAgICAgICAgIG1vdmVCeVZNUCA9IC0+XG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4gZW5zdXJlICdsJ1xuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGVuc3VyZSAnaCdcbiAgICAgICAgICBfLnRpbWVzIDEwLCAtPiBtZWFzdXJlV2l0aFRpbWVFbmQobW92ZUJ5Vk1QKVxuICAgICAgICB3aGVuICdzZWwnXG4gICAgICAgICAgbW92ZUJ5U2VsZWN0ID0gLT5cbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLnNlbGVjdFJpZ2h0KClcbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLnNlbGVjdExlZnQoKVxuICAgICAgICAgIF8udGltZXMgMTUsIC0+IG1lYXN1cmVXaXRoVGltZUVuZChtb3ZlQnlTZWxlY3QpXG5cbiAgICBtZWFzdXJlV2l0aFRpbWVFbmQgPSAoZm4pIC0+XG4gICAgICBjb25zb2xlLnRpbWUoZm4ubmFtZSlcbiAgICAgIGZuKClcbiAgICAgIGNvbnNvbGUudGltZUVuZChmbi5uYW1lKVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ2bXBcIiwgLT5cbiAgICAgICMgYmVmb3JlRWFjaCAtPlxuICAgICAgaXQgXCJbbm9ybWFsXSBzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygndm1wJywgJ21vdmVDb3VudCcpXG4gICAgICBpdCBcIlt2Q10gc2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCd2bXAnLCAndkMnKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygndm1wJywgJ3ZDJylcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcIlt2Q10gc2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgICAgICAjIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3NlbCcsICd2QycpXG4iXX0=
