(function() {
  var CompositeDisposable, Disposable, Ex, ExMode, ExState, GlobalExState, ref;

  GlobalExState = require('./global-ex-state');

  ExState = require('./ex-state');

  Ex = require('./ex');

  ref = require('event-kit'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  module.exports = ExMode = {
    activate: function(state) {
      this.globalExState = new GlobalExState;
      this.disposables = new CompositeDisposable;
      this.exStates = new WeakMap;
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var element, exState;
          if (editor.mini) {
            return;
          }
          element = atom.views.getView(editor);
          if (!_this.exStates.get(editor)) {
            exState = new ExState(element, _this.globalExState);
            _this.exStates.set(editor, exState);
            return _this.disposables.add(new Disposable(function() {
              return exState.destroy();
            }));
          }
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    provideEx: function() {
      return {
        registerCommand: Ex.registerCommand.bind(Ex),
        registerAlias: Ex.registerAlias.bind(Ex)
      };
    },
    consumeVim: function(vim) {
      this.vim = vim;
      return this.globalExState.setVim(vim);
    },
    consumeVimModePlus: function(vim) {
      return this.consumeVim(vim);
    },
    config: {
      splitbelow: {
        title: 'Split below',
        description: 'when splitting, split from below',
        type: 'boolean',
        "default": 'false'
      },
      splitright: {
        title: 'Split right',
        description: 'when splitting, split from right',
        type: 'boolean',
        "default": 'false'
      },
      gdefault: {
        title: 'Gdefault',
        description: 'When on, the ":substitute" flag \'g\' is default on',
        type: 'boolean',
        "default": 'false'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9leC1tb2RlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVI7O0VBQ2hCLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUjs7RUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLE1BQVI7O0VBQ0wsTUFBb0MsT0FBQSxDQUFRLFdBQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLE1BQUEsR0FDZjtJQUFBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUk7YUFFaEIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7QUFDakQsY0FBQTtVQUFBLElBQVUsTUFBTSxDQUFDLElBQWpCO0FBQUEsbUJBQUE7O1VBRUEsT0FBQSxHQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQjtVQUVWLElBQUcsQ0FBSSxLQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxNQUFkLENBQVA7WUFDRSxPQUFBLEdBQVUsSUFBSSxPQUFKLENBQ1IsT0FEUSxFQUVSLEtBQUMsQ0FBQSxhQUZPO1lBS1YsS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxFQUFzQixPQUF0QjttQkFFQSxLQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxVQUFKLENBQWUsU0FBQTtxQkFDOUIsT0FBTyxDQUFDLE9BQVIsQ0FBQTtZQUQ4QixDQUFmLENBQWpCLEVBUkY7O1FBTGlEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFqQjtJQUxRLENBQVY7SUFxQkEsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTtJQURVLENBckJaO0lBd0JBLFNBQUEsRUFBVyxTQUFBO2FBQ1Q7UUFBQSxlQUFBLEVBQWlCLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBbkIsQ0FBd0IsRUFBeEIsQ0FBakI7UUFDQSxhQUFBLEVBQWUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFqQixDQUFzQixFQUF0QixDQURmOztJQURTLENBeEJYO0lBNEJBLFVBQUEsRUFBWSxTQUFDLEdBQUQ7TUFDVixJQUFDLENBQUEsR0FBRCxHQUFPO2FBQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLEdBQXRCO0lBRlUsQ0E1Qlo7SUFnQ0Esa0JBQUEsRUFBb0IsU0FBQyxHQUFEO2FBQ2xCLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCO0lBRGtCLENBaENwQjtJQW1DQSxNQUFBLEVBQ0U7TUFBQSxVQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLFdBQUEsRUFBYSxrQ0FEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO09BREY7TUFLQSxVQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sYUFBUDtRQUNBLFdBQUEsRUFBYSxrQ0FEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO09BTkY7TUFVQSxRQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sVUFBUDtRQUNBLFdBQUEsRUFBYSxxREFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO09BWEY7S0FwQ0Y7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJHbG9iYWxFeFN0YXRlID0gcmVxdWlyZSAnLi9nbG9iYWwtZXgtc3RhdGUnXG5FeFN0YXRlID0gcmVxdWlyZSAnLi9leC1zdGF0ZSdcbkV4ID0gcmVxdWlyZSAnLi9leCdcbntEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcblxubW9kdWxlLmV4cG9ydHMgPSBFeE1vZGUgPVxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBnbG9iYWxFeFN0YXRlID0gbmV3IEdsb2JhbEV4U3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBleFN0YXRlcyA9IG5ldyBXZWFrTWFwXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgcmV0dXJuIGlmIGVkaXRvci5taW5pXG5cbiAgICAgIGVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuXG4gICAgICBpZiBub3QgQGV4U3RhdGVzLmdldChlZGl0b3IpXG4gICAgICAgIGV4U3RhdGUgPSBuZXcgRXhTdGF0ZShcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIEBnbG9iYWxFeFN0YXRlXG4gICAgICAgIClcblxuICAgICAgICBAZXhTdGF0ZXMuc2V0KGVkaXRvciwgZXhTdGF0ZSlcblxuICAgICAgICBAZGlzcG9zYWJsZXMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICAgICAgZXhTdGF0ZS5kZXN0cm95KClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBwcm92aWRlRXg6IC0+XG4gICAgcmVnaXN0ZXJDb21tYW5kOiBFeC5yZWdpc3RlckNvbW1hbmQuYmluZChFeClcbiAgICByZWdpc3RlckFsaWFzOiBFeC5yZWdpc3RlckFsaWFzLmJpbmQoRXgpXG5cbiAgY29uc3VtZVZpbTogKHZpbSkgLT5cbiAgICBAdmltID0gdmltXG4gICAgQGdsb2JhbEV4U3RhdGUuc2V0VmltKHZpbSlcblxuICBjb25zdW1lVmltTW9kZVBsdXM6ICh2aW0pIC0+XG4gICAgdGhpcy5jb25zdW1lVmltKHZpbSlcblxuICBjb25maWc6XG4gICAgc3BsaXRiZWxvdzpcbiAgICAgIHRpdGxlOiAnU3BsaXQgYmVsb3cnXG4gICAgICBkZXNjcmlwdGlvbjogJ3doZW4gc3BsaXR0aW5nLCBzcGxpdCBmcm9tIGJlbG93J1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiAnZmFsc2UnXG4gICAgc3BsaXRyaWdodDpcbiAgICAgIHRpdGxlOiAnU3BsaXQgcmlnaHQnXG4gICAgICBkZXNjcmlwdGlvbjogJ3doZW4gc3BsaXR0aW5nLCBzcGxpdCBmcm9tIHJpZ2h0J1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiAnZmFsc2UnXG4gICAgZ2RlZmF1bHQ6XG4gICAgICB0aXRsZTogJ0dkZWZhdWx0J1xuICAgICAgZGVzY3JpcHRpb246ICdXaGVuIG9uLCB0aGUgXCI6c3Vic3RpdHV0ZVwiIGZsYWcgXFwnZ1xcJyBpcyBkZWZhdWx0IG9uJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiAnZmFsc2UnXG4iXX0=
