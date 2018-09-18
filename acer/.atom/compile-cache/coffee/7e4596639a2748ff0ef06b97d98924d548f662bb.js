(function() {
  var AutoComplete, Ex, ExViewModel, Input, ViewModel, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('./view-model'), ViewModel = ref.ViewModel, Input = ref.Input;

  AutoComplete = require('./autocomplete');

  Ex = require('./ex');

  module.exports = ExViewModel = (function(superClass) {
    extend(ExViewModel, superClass);

    function ExViewModel(exCommand, withSelection) {
      this.exCommand = exCommand;
      this.confirm = bind(this.confirm, this);
      this.decreaseHistoryEx = bind(this.decreaseHistoryEx, this);
      this.increaseHistoryEx = bind(this.increaseHistoryEx, this);
      this.tabAutocomplete = bind(this.tabAutocomplete, this);
      ExViewModel.__super__.constructor.call(this, this.exCommand, {
        "class": 'command'
      });
      this.historyIndex = -1;
      if (withSelection) {
        this.view.editorElement.getModel().setText("'<,'>");
      }
      this.view.editorElement.addEventListener('keydown', this.tabAutocomplete);
      atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistoryEx);
      atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistoryEx);
      this.autoComplete = new AutoComplete(Ex.getCommands());
    }

    ExViewModel.prototype.restoreHistory = function(index) {
      return this.view.editorElement.getModel().setText(this.history(index).value);
    };

    ExViewModel.prototype.history = function(index) {
      return this.exState.getExHistoryItem(index);
    };

    ExViewModel.prototype.tabAutocomplete = function(event) {
      var completed;
      if (event.keyCode === 9) {
        event.stopPropagation();
        event.preventDefault();
        completed = this.autoComplete.getAutocomplete(this.view.editorElement.getModel().getText());
        if (completed) {
          this.view.editorElement.getModel().setText(completed);
        }
        return false;
      } else {
        return this.autoComplete.resetCompletion();
      }
    };

    ExViewModel.prototype.increaseHistoryEx = function() {
      if (this.history(this.historyIndex + 1) != null) {
        this.historyIndex += 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.decreaseHistoryEx = function() {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        return this.view.editorElement.getModel().setText('');
      } else {
        this.historyIndex -= 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.confirm = function(view) {
      this.value = this.view.value;
      this.exState.pushExHistory(this);
      return ExViewModel.__super__.confirm.call(this, view);
    };

    return ExViewModel;

  })(ViewModel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC12aWV3LW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0RBQUE7SUFBQTs7OztFQUFBLE1BQXFCLE9BQUEsQ0FBUSxjQUFSLENBQXJCLEVBQUMseUJBQUQsRUFBWTs7RUFDWixZQUFBLEdBQWUsT0FBQSxDQUFRLGdCQUFSOztFQUNmLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDUyxxQkFBQyxTQUFELEVBQWEsYUFBYjtNQUFDLElBQUMsQ0FBQSxZQUFEOzs7OztNQUNaLDZDQUFNLElBQUMsQ0FBQSxTQUFQLEVBQWtCO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO09BQWxCO01BQ0EsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FBQztNQUVqQixJQUFHLGFBQUg7UUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFwQixDQUFBLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsT0FBdkMsRUFERjs7TUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBcEIsQ0FBcUMsU0FBckMsRUFBZ0QsSUFBQyxDQUFBLGVBQWpEO01BQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBeEIsRUFBdUMsY0FBdkMsRUFBdUQsSUFBQyxDQUFBLGlCQUF4RDtNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsSUFBSSxDQUFDLGFBQXhCLEVBQXVDLGdCQUF2QyxFQUF5RCxJQUFDLENBQUEsaUJBQTFEO01BRUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxZQUFKLENBQWlCLEVBQUUsQ0FBQyxXQUFILENBQUEsQ0FBakI7SUFYTDs7MEJBYWIsY0FBQSxHQUFnQixTQUFDLEtBQUQ7YUFDZCxJQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFwQixDQUFBLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsSUFBQyxDQUFBLE9BQUQsQ0FBUyxLQUFULENBQWUsQ0FBQyxLQUF2RDtJQURjOzswQkFHaEIsT0FBQSxHQUFTLFNBQUMsS0FBRDthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBMEIsS0FBMUI7SUFETzs7MEJBR1QsZUFBQSxHQUFpQixTQUFDLEtBQUQ7QUFDZixVQUFBO01BQUEsSUFBRyxLQUFLLENBQUMsT0FBTixLQUFpQixDQUFwQjtRQUNFLEtBQUssQ0FBQyxlQUFOLENBQUE7UUFDQSxLQUFLLENBQUMsY0FBTixDQUFBO1FBRUEsU0FBQSxHQUFZLElBQUMsQ0FBQSxZQUFZLENBQUMsZUFBZCxDQUE4QixJQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFwQixDQUFBLENBQThCLENBQUMsT0FBL0IsQ0FBQSxDQUE5QjtRQUNaLElBQUcsU0FBSDtVQUNFLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQXBCLENBQUEsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxTQUF2QyxFQURGOztBQUdBLGVBQU8sTUFSVDtPQUFBLE1BQUE7ZUFVRSxJQUFDLENBQUEsWUFBWSxDQUFDLGVBQWQsQ0FBQSxFQVZGOztJQURlOzswQkFhakIsaUJBQUEsR0FBbUIsU0FBQTtNQUNqQixJQUFHLDJDQUFIO1FBQ0UsSUFBQyxDQUFBLFlBQUQsSUFBaUI7ZUFDakIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFlBQWpCLEVBRkY7O0lBRGlCOzswQkFLbkIsaUJBQUEsR0FBbUIsU0FBQTtNQUNqQixJQUFHLElBQUMsQ0FBQSxZQUFELElBQWlCLENBQXBCO1FBRUUsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsQ0FBQztlQUNqQixJQUFDLENBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFwQixDQUFBLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsRUFBdkMsRUFIRjtPQUFBLE1BQUE7UUFLRSxJQUFDLENBQUEsWUFBRCxJQUFpQjtlQUNqQixJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsWUFBakIsRUFORjs7SUFEaUI7OzBCQVNuQixPQUFBLEdBQVMsU0FBQyxJQUFEO01BQ1AsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDO01BQ2YsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLElBQXZCO2FBQ0EseUNBQU0sSUFBTjtJQUhPOzs7O0tBL0NlO0FBTDFCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXdNb2RlbCwgSW5wdXR9ID0gcmVxdWlyZSAnLi92aWV3LW1vZGVsJ1xuQXV0b0NvbXBsZXRlID0gcmVxdWlyZSAnLi9hdXRvY29tcGxldGUnXG5FeCA9IHJlcXVpcmUgJy4vZXgnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEV4Vmlld01vZGVsIGV4dGVuZHMgVmlld01vZGVsXG4gIGNvbnN0cnVjdG9yOiAoQGV4Q29tbWFuZCwgd2l0aFNlbGVjdGlvbikgLT5cbiAgICBzdXBlcihAZXhDb21tYW5kLCBjbGFzczogJ2NvbW1hbmQnKVxuICAgIEBoaXN0b3J5SW5kZXggPSAtMVxuXG4gICAgaWYgd2l0aFNlbGVjdGlvblxuICAgICAgQHZpZXcuZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLnNldFRleHQoXCInPCwnPlwiKVxuXG4gICAgQHZpZXcuZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgQHRhYkF1dG9jb21wbGV0ZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAdmlldy5lZGl0b3JFbGVtZW50LCAnY29yZTptb3ZlLXVwJywgQGluY3JlYXNlSGlzdG9yeUV4KVxuICAgIGF0b20uY29tbWFuZHMuYWRkKEB2aWV3LmVkaXRvckVsZW1lbnQsICdjb3JlOm1vdmUtZG93bicsIEBkZWNyZWFzZUhpc3RvcnlFeClcblxuICAgIEBhdXRvQ29tcGxldGUgPSBuZXcgQXV0b0NvbXBsZXRlKEV4LmdldENvbW1hbmRzKCkpXG5cbiAgcmVzdG9yZUhpc3Rvcnk6IChpbmRleCkgLT5cbiAgICBAdmlldy5lZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuc2V0VGV4dChAaGlzdG9yeShpbmRleCkudmFsdWUpXG5cbiAgaGlzdG9yeTogKGluZGV4KSAtPlxuICAgIEBleFN0YXRlLmdldEV4SGlzdG9yeUl0ZW0oaW5kZXgpXG5cbiAgdGFiQXV0b2NvbXBsZXRlOiAoZXZlbnQpID0+XG4gICAgaWYgZXZlbnQua2V5Q29kZSA9PSA5XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBjb21wbGV0ZWQgPSBAYXV0b0NvbXBsZXRlLmdldEF1dG9jb21wbGV0ZShAdmlldy5lZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuZ2V0VGV4dCgpKVxuICAgICAgaWYgY29tcGxldGVkXG4gICAgICAgIEB2aWV3LmVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5zZXRUZXh0KGNvbXBsZXRlZClcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgZWxzZVxuICAgICAgQGF1dG9Db21wbGV0ZS5yZXNldENvbXBsZXRpb24oKVxuXG4gIGluY3JlYXNlSGlzdG9yeUV4OiA9PlxuICAgIGlmIEBoaXN0b3J5KEBoaXN0b3J5SW5kZXggKyAxKT9cbiAgICAgIEBoaXN0b3J5SW5kZXggKz0gMVxuICAgICAgQHJlc3RvcmVIaXN0b3J5KEBoaXN0b3J5SW5kZXgpXG5cbiAgZGVjcmVhc2VIaXN0b3J5RXg6ID0+XG4gICAgaWYgQGhpc3RvcnlJbmRleCA8PSAwXG4gICAgICAjIGdldCB1cyBiYWNrIHRvIGEgY2xlYW4gc2xhdGVcbiAgICAgIEBoaXN0b3J5SW5kZXggPSAtMVxuICAgICAgQHZpZXcuZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLnNldFRleHQoJycpXG4gICAgZWxzZVxuICAgICAgQGhpc3RvcnlJbmRleCAtPSAxXG4gICAgICBAcmVzdG9yZUhpc3RvcnkoQGhpc3RvcnlJbmRleClcblxuICBjb25maXJtOiAodmlldykgPT5cbiAgICBAdmFsdWUgPSBAdmlldy52YWx1ZVxuICAgIEBleFN0YXRlLnB1c2hFeEhpc3RvcnkoQClcbiAgICBzdXBlcih2aWV3KVxuIl19
