(function() {
  var ExNormalModeInputElement, Input, ViewModel;

  ExNormalModeInputElement = require('./ex-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      ref = this.command, this.editor = ref.editor, this.exState = ref.exState;
      this.view = new ExNormalModeInputElement().initialize(this, opts);
      this.editor.normalModeInputView = this.view;
      this.exState.onDidFailToExecute((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
      this.done = false;
    }

    ViewModel.prototype.confirm = function(view) {
      this.exState.pushOperations(new Input(this.view.value));
      return this.done = true;
    };

    ViewModel.prototype.cancel = function(view) {
      if (!this.done) {
        this.exState.pushOperations(new Input(''));
        return this.done = true;
      }
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi92aWV3LW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsd0JBQUEsR0FBMkIsT0FBQSxDQUFRLGdDQUFSOztFQUVyQjtJQUNTLG1CQUFDLE9BQUQsRUFBVyxJQUFYO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxVQUFEOztRQUFVLE9BQUs7O01BQzNCLE1BQXNCLElBQUMsQ0FBQSxPQUF2QixFQUFDLElBQUMsQ0FBQSxhQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsY0FBQTtNQUVYLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSx3QkFBSixDQUFBLENBQThCLENBQUMsVUFBL0IsQ0FBMEMsSUFBMUMsRUFBNkMsSUFBN0M7TUFDUixJQUFDLENBQUEsTUFBTSxDQUFDLG1CQUFSLEdBQThCLElBQUMsQ0FBQTtNQUMvQixJQUFDLENBQUEsT0FBTyxDQUFDLGtCQUFULENBQTRCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QjtNQUNBLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFORzs7d0JBUWIsT0FBQSxHQUFTLFNBQUMsSUFBRDtNQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixJQUFJLEtBQUosQ0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQWhCLENBQXhCO2FBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUZEOzt3QkFJVCxNQUFBLEdBQVEsU0FBQyxJQUFEO01BQ04sSUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFSO1FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQXdCLElBQUksS0FBSixDQUFVLEVBQVYsQ0FBeEI7ZUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLEtBRlY7O0lBRE07Ozs7OztFQUtKO0lBQ1MsZUFBQyxVQUFEO01BQUMsSUFBQyxDQUFBLGFBQUQ7SUFBRDs7Ozs7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixXQUFBLFNBRGU7SUFDSixPQUFBLEtBREk7O0FBdkJqQiIsInNvdXJjZXNDb250ZW50IjpbIkV4Tm9ybWFsTW9kZUlucHV0RWxlbWVudCA9IHJlcXVpcmUgJy4vZXgtbm9ybWFsLW1vZGUtaW5wdXQtZWxlbWVudCdcblxuY2xhc3MgVmlld01vZGVsXG4gIGNvbnN0cnVjdG9yOiAoQGNvbW1hbmQsIG9wdHM9e30pIC0+XG4gICAge0BlZGl0b3IsIEBleFN0YXRlfSA9IEBjb21tYW5kXG5cbiAgICBAdmlldyA9IG5ldyBFeE5vcm1hbE1vZGVJbnB1dEVsZW1lbnQoKS5pbml0aWFsaXplKEAsIG9wdHMpXG4gICAgQGVkaXRvci5ub3JtYWxNb2RlSW5wdXRWaWV3ID0gQHZpZXdcbiAgICBAZXhTdGF0ZS5vbkRpZEZhaWxUb0V4ZWN1dGUgPT4gQHZpZXcucmVtb3ZlKClcbiAgICBAZG9uZSA9IGZhbHNlXG5cbiAgY29uZmlybTogKHZpZXcpIC0+XG4gICAgQGV4U3RhdGUucHVzaE9wZXJhdGlvbnMobmV3IElucHV0KEB2aWV3LnZhbHVlKSlcbiAgICBAZG9uZSA9IHRydWVcblxuICBjYW5jZWw6ICh2aWV3KSAtPlxuICAgIHVubGVzcyBAZG9uZVxuICAgICAgQGV4U3RhdGUucHVzaE9wZXJhdGlvbnMobmV3IElucHV0KCcnKSlcbiAgICAgIEBkb25lID0gdHJ1ZVxuXG5jbGFzcyBJbnB1dFxuICBjb25zdHJ1Y3RvcjogKEBjaGFyYWN0ZXJzKSAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVmlld01vZGVsLCBJbnB1dFxufVxuIl19
