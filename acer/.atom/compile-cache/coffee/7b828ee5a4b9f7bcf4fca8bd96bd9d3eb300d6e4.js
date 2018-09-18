(function() {
  var Command, CommandError, CompositeDisposable, Disposable, Emitter, ExState, ref;

  ref = require('event-kit'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Command = require('./command');

  CommandError = require('./command-error');

  ExState = (function() {
    function ExState(editorElement, globalExState) {
      this.editorElement = editorElement;
      this.globalExState = globalExState;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.editorElement.getModel();
      this.opStack = [];
      this.history = [];
      this.registerOperationCommands({
        open: (function(_this) {
          return function(e) {
            return new Command(_this.editor, _this);
          };
        })(this)
      });
    }

    ExState.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ExState.prototype.getExHistoryItem = function(index) {
      return this.globalExState.commandHistory[index];
    };

    ExState.prototype.pushExHistory = function(command) {
      return this.globalExState.commandHistory.unshift(command);
    };

    ExState.prototype.registerOperationCommands = function(commands) {
      var commandName, fn, results;
      results = [];
      for (commandName in commands) {
        fn = commands[commandName];
        results.push((function(_this) {
          return function(fn) {
            var pushFn;
            pushFn = function(e) {
              return _this.pushOperations(fn(e));
            };
            return _this.subscriptions.add(atom.commands.add(_this.editorElement, "ex-mode:" + commandName, pushFn));
          };
        })(this)(fn));
      }
      return results;
    };

    ExState.prototype.onDidFailToExecute = function(fn) {
      return this.emitter.on('failed-to-execute', fn);
    };

    ExState.prototype.onDidProcessOpStack = function(fn) {
      return this.emitter.on('processed-op-stack', fn);
    };

    ExState.prototype.pushOperations = function(operations) {
      this.opStack.push(operations);
      if (this.opStack.length === 2) {
        return this.processOpStack();
      }
    };

    ExState.prototype.clearOpStack = function() {
      return this.opStack = [];
    };

    ExState.prototype.processOpStack = function() {
      var command, e, input, ref1;
      ref1 = this.opStack, command = ref1[0], input = ref1[1];
      if (input.characters.length > 0) {
        this.history.unshift(command);
        try {
          command.execute(input);
        } catch (error) {
          e = error;
          if (e instanceof CommandError) {
            atom.notifications.addError("Command error: " + e.message);
            this.emitter.emit('failed-to-execute');
          } else {
            throw e;
          }
        }
      }
      this.clearOpStack();
      return this.emitter.emit('processed-op-stack');
    };

    ExState.prototype.getSelections = function() {
      var filtered, id, ref1, selection;
      filtered = {};
      ref1 = this.editor.getSelections();
      for (id in ref1) {
        selection = ref1[id];
        if (!selection.isEmpty()) {
          filtered[id] = selection;
        }
      }
      return filtered;
    };

    return ExState;

  })();

  module.exports = ExState;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxXQUFSLENBQTdDLEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQjs7RUFFdEIsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUNWLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBRVQ7SUFDUyxpQkFBQyxhQUFELEVBQWlCLGFBQWpCO01BQUMsSUFBQyxDQUFBLGdCQUFEO01BQWdCLElBQUMsQ0FBQSxnQkFBRDtNQUM1QixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLGFBQWEsQ0FBQyxRQUFmLENBQUE7TUFDVixJQUFDLENBQUEsT0FBRCxHQUFXO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUVYLElBQUMsQ0FBQSx5QkFBRCxDQUNFO1FBQUEsSUFBQSxFQUFNLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDttQkFBTyxJQUFJLE9BQUosQ0FBWSxLQUFDLENBQUEsTUFBYixFQUFxQixLQUFyQjtVQUFQO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOO09BREY7SUFQVzs7c0JBVWIsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtJQURPOztzQkFHVCxnQkFBQSxHQUFrQixTQUFDLEtBQUQ7YUFDaEIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFlLENBQUEsS0FBQTtJQURkOztzQkFHbEIsYUFBQSxHQUFlLFNBQUMsT0FBRDthQUNiLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBYyxDQUFDLE9BQTlCLENBQXNDLE9BQXRDO0lBRGE7O3NCQUdmLHlCQUFBLEdBQTJCLFNBQUMsUUFBRDtBQUN6QixVQUFBO0FBQUE7V0FBQSx1QkFBQTs7cUJBQ0ssQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxFQUFEO0FBQ0QsZ0JBQUE7WUFBQSxNQUFBLEdBQVMsU0FBQyxDQUFEO3FCQUFPLEtBQUMsQ0FBQSxjQUFELENBQWdCLEVBQUEsQ0FBRyxDQUFILENBQWhCO1lBQVA7bUJBQ1QsS0FBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLEtBQUMsQ0FBQSxhQUFuQixFQUFrQyxVQUFBLEdBQVcsV0FBN0MsRUFBNEQsTUFBNUQsQ0FERjtVQUZDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFILENBQUksRUFBSjtBQURGOztJQUR5Qjs7c0JBUTNCLGtCQUFBLEdBQW9CLFNBQUMsRUFBRDthQUNsQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxtQkFBWixFQUFpQyxFQUFqQztJQURrQjs7c0JBR3BCLG1CQUFBLEdBQXFCLFNBQUMsRUFBRDthQUNuQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxvQkFBWixFQUFrQyxFQUFsQztJQURtQjs7c0JBR3JCLGNBQUEsR0FBZ0IsU0FBQyxVQUFEO01BQ2QsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsVUFBZDtNQUVBLElBQXFCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxLQUFtQixDQUF4QztlQUFBLElBQUMsQ0FBQSxjQUFELENBQUEsRUFBQTs7SUFIYzs7c0JBS2hCLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLE9BQUQsR0FBVztJQURDOztzQkFHZCxjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsT0FBbUIsSUFBQyxDQUFBLE9BQXBCLEVBQUMsaUJBQUQsRUFBVTtNQUNWLElBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFqQixHQUEwQixDQUE3QjtRQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsT0FBVCxDQUFpQixPQUFqQjtBQUNBO1VBQ0UsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsS0FBaEIsRUFERjtTQUFBLGFBQUE7VUFFTTtVQUNKLElBQUksQ0FBQSxZQUFhLFlBQWpCO1lBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixpQkFBQSxHQUFrQixDQUFDLENBQUMsT0FBaEQ7WUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxtQkFBZCxFQUZGO1dBQUEsTUFBQTtBQUlFLGtCQUFNLEVBSlI7V0FIRjtTQUZGOztNQVVBLElBQUMsQ0FBQSxZQUFELENBQUE7YUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxvQkFBZDtJQWJjOztzQkFnQmhCLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQUFBLFFBQUEsR0FBVztBQUNYO0FBQUEsV0FBQSxVQUFBOztRQUNFLElBQUEsQ0FBTyxTQUFTLENBQUMsT0FBVixDQUFBLENBQVA7VUFDRSxRQUFTLENBQUEsRUFBQSxDQUFULEdBQWUsVUFEakI7O0FBREY7QUFJQSxhQUFPO0lBTk07Ozs7OztFQVFqQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQXZFakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG5cbkNvbW1hbmQgPSByZXF1aXJlICcuL2NvbW1hbmQnXG5Db21tYW5kRXJyb3IgPSByZXF1aXJlICcuL2NvbW1hbmQtZXJyb3InXG5cbmNsYXNzIEV4U3RhdGVcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yRWxlbWVudCwgQGdsb2JhbEV4U3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZWRpdG9yID0gQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKVxuICAgIEBvcFN0YWNrID0gW11cbiAgICBAaGlzdG9yeSA9IFtdXG5cbiAgICBAcmVnaXN0ZXJPcGVyYXRpb25Db21tYW5kc1xuICAgICAgb3BlbjogKGUpID0+IG5ldyBDb21tYW5kKEBlZGl0b3IsIEApXG5cbiAgZGVzdHJveTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBnZXRFeEhpc3RvcnlJdGVtOiAoaW5kZXgpIC0+XG4gICAgQGdsb2JhbEV4U3RhdGUuY29tbWFuZEhpc3RvcnlbaW5kZXhdXG5cbiAgcHVzaEV4SGlzdG9yeTogKGNvbW1hbmQpIC0+XG4gICAgQGdsb2JhbEV4U3RhdGUuY29tbWFuZEhpc3RvcnkudW5zaGlmdCBjb21tYW5kXG5cbiAgcmVnaXN0ZXJPcGVyYXRpb25Db21tYW5kczogKGNvbW1hbmRzKSAtPlxuICAgIGZvciBjb21tYW5kTmFtZSwgZm4gb2YgY29tbWFuZHNcbiAgICAgIGRvIChmbikgPT5cbiAgICAgICAgcHVzaEZuID0gKGUpID0+IEBwdXNoT3BlcmF0aW9ucyhmbihlKSlcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCBcImV4LW1vZGU6I3tjb21tYW5kTmFtZX1cIiwgcHVzaEZuKVxuICAgICAgICApXG5cbiAgb25EaWRGYWlsVG9FeGVjdXRlOiAoZm4pIC0+XG4gICAgQGVtaXR0ZXIub24oJ2ZhaWxlZC10by1leGVjdXRlJywgZm4pXG5cbiAgb25EaWRQcm9jZXNzT3BTdGFjazogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdwcm9jZXNzZWQtb3Atc3RhY2snLCBmbilcblxuICBwdXNoT3BlcmF0aW9uczogKG9wZXJhdGlvbnMpIC0+XG4gICAgQG9wU3RhY2sucHVzaCBvcGVyYXRpb25zXG5cbiAgICBAcHJvY2Vzc09wU3RhY2soKSBpZiBAb3BTdGFjay5sZW5ndGggPT0gMlxuXG4gIGNsZWFyT3BTdGFjazogLT5cbiAgICBAb3BTdGFjayA9IFtdXG5cbiAgcHJvY2Vzc09wU3RhY2s6IC0+XG4gICAgW2NvbW1hbmQsIGlucHV0XSA9IEBvcFN0YWNrXG4gICAgaWYgaW5wdXQuY2hhcmFjdGVycy5sZW5ndGggPiAwXG4gICAgICBAaGlzdG9yeS51bnNoaWZ0IGNvbW1hbmRcbiAgICAgIHRyeVxuICAgICAgICBjb21tYW5kLmV4ZWN1dGUoaW5wdXQpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgQ29tbWFuZEVycm9yKVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIkNvbW1hbmQgZXJyb3I6ICN7ZS5tZXNzYWdlfVwiKVxuICAgICAgICAgIEBlbWl0dGVyLmVtaXQoJ2ZhaWxlZC10by1leGVjdXRlJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRocm93IGVcbiAgICBAY2xlYXJPcFN0YWNrKClcbiAgICBAZW1pdHRlci5lbWl0KCdwcm9jZXNzZWQtb3Atc3RhY2snKVxuXG4gICMgUmV0dXJucyBhbGwgbm9uLWVtcHR5IHNlbGVjdGlvbnNcbiAgZ2V0U2VsZWN0aW9uczogLT5cbiAgICBmaWx0ZXJlZCA9IHt9XG4gICAgZm9yIGlkLCBzZWxlY3Rpb24gb2YgQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHVubGVzcyBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAgIGZpbHRlcmVkW2lkXSA9IHNlbGVjdGlvblxuXG4gICAgcmV0dXJuIGZpbHRlcmVkXG5cbm1vZHVsZS5leHBvcnRzID0gRXhTdGF0ZVxuIl19
