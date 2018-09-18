(function() {
  var changeTabBarSize, observeEditorsOnEvents, root, setSize, showTabBarInTreeView, tabsInTreeView, treeViewTitles, unsetSize;

  root = document.documentElement;

  tabsInTreeView = root.querySelector('.list-inline.tab-bar.inset-panel');

  treeViewTitles = document.querySelectorAll('.tree-view span.name');

  module.exports = {
    activate: function(state) {
      var fontSizeValue, tabSizeValue;
      console.log('activate city lights ui ', state);
      tabSizeValue = atom.config.get('city-lights-ui.tabSize');
      fontSizeValue = atom.config.get('city-lights-ui.fontSize');
      setSize(fontSizeValue);
      changeTabBarSize(tabSizeValue);
      atom.config.observe('city-lights-ui.showTabsInTreeView', function(newValue) {
        return showTabBarInTreeView(newValue);
      });
      atom.config.observe('city-lights-ui.fontSize', function(newValue) {
        return setSize(newValue);
      });
      return atom.config.observe('city-lights-ui.tabSize', function(tabSizeValue) {
        return changeTabBarSize(tabSizeValue);
      });
    },
    deactivate: function() {
      return unsetSize();
    }
  };

  showTabBarInTreeView = function(boolean) {
    if (boolean) {
      return tabsInTreeView.style.display = 'flex';
    } else {
      return tabsInTreeView.style.display = 'none';
    }
  };

  setSize = function(currentFontSize) {
    root.style.fontSize = currentFontSize + 'px';
    if (currentFontSize >= 11) {
      return root.style.lineHeight = 2.4;
    } else {
      return root.style.lineHeight = 2.1;
    }
  };

  unsetSize = function() {
    var i, j, len, results, span;
    results = [];
    for (i = j = 0, len = treeViewTitles.length; j < len; i = ++j) {
      span = treeViewTitles[i];
      results.push(span.style.fontSize = '');
    }
    return results;
  };

  changeTabBarSize = function(tabValue) {
    var j, k, l, len, len1, len2, results, results1, results2, tab, tabBars;
    tabBars = document.querySelectorAll('.tab-bar .tab');
    switch (tabValue) {
      case 'small':
        results = [];
        for (j = 0, len = tabBars.length; j < len; j++) {
          tab = tabBars[j];
          tab.classList.add(tabValue);
          tab.classList.remove('medium');
          results.push(tab.classList.remove('large'));
        }
        return results;
        break;
      case 'medium':
        results1 = [];
        for (k = 0, len1 = tabBars.length; k < len1; k++) {
          tab = tabBars[k];
          tab.classList.add(tabValue);
          tab.classList.remove('large');
          results1.push(tab.classList.remove('small'));
        }
        return results1;
        break;
      case 'large':
        results2 = [];
        for (l = 0, len2 = tabBars.length; l < len2; l++) {
          tab = tabBars[l];
          tab.classList.add(tabValue);
          tab.classList.remove('medium');
          results2.push(tab.classList.remove('small'));
        }
        return results2;
    }
  };

  observeEditorsOnEvents = function() {
    var fontSizeValue, tabSizeValue;
    tabSizeValue = atom.config.get('city-lights-ui.tabSize');
    fontSizeValue = atom.config.get('city-lights-ui.fontSize');
    setSize(fontSizeValue);
    return changeTabBarSize(tabSizeValue);
  };

  atom.workspace.observeActivePaneItem(function(editor) {
    return observeEditorsOnEvents();
  });

  atom.workspace.observeTextEditors(function(editor) {
    return observeEditorsOnEvents();
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9jaXR5LWxpZ2h0cy11aS9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxRQUFRLENBQUM7O0VBQ2hCLGNBQUEsR0FBaUIsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsa0NBQW5COztFQUNqQixjQUFBLEdBQWlCLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixzQkFBMUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksMEJBQVosRUFBd0MsS0FBeEM7TUFFQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQjtNQUNmLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQjtNQUNoQixPQUFBLENBQVEsYUFBUjtNQUNBLGdCQUFBLENBQWlCLFlBQWpCO01BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLG1DQUFwQixFQUF5RCxTQUFDLFFBQUQ7ZUFDdkQsb0JBQUEsQ0FBcUIsUUFBckI7TUFEdUQsQ0FBekQ7TUFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IseUJBQXBCLEVBQStDLFNBQUMsUUFBRDtlQUM3QyxPQUFBLENBQVEsUUFBUjtNQUQ2QyxDQUEvQzthQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBWixDQUFvQix3QkFBcEIsRUFBOEMsU0FBQyxZQUFEO2VBQzVDLGdCQUFBLENBQWlCLFlBQWpCO01BRDRDLENBQTlDO0lBZFEsQ0FBVjtJQWlCQSxVQUFBLEVBQVksU0FBQTthQUNWLFNBQUEsQ0FBQTtJQURVLENBakJaOzs7RUFxQkYsb0JBQUEsR0FBdUIsU0FBQyxPQUFEO0lBQ3JCLElBQUcsT0FBSDthQUNFLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBckIsR0FBK0IsT0FEakM7S0FBQSxNQUFBO2FBR0UsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFyQixHQUErQixPQUhqQzs7RUFEcUI7O0VBT3ZCLE9BQUEsR0FBVSxTQUFDLGVBQUQ7SUFDUixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVgsR0FBc0IsZUFBQSxHQUFrQjtJQUN4QyxJQUFHLGVBQUEsSUFBbUIsRUFBdEI7YUFDRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVgsR0FBd0IsSUFEMUI7S0FBQSxNQUFBO2FBR0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFYLEdBQXdCLElBSDFCOztFQUZROztFQU9WLFNBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtBQUFBO1NBQUEsd0RBQUE7O21CQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBWCxHQUFzQjtBQUR4Qjs7RUFEVTs7RUFJWixnQkFBQSxHQUFtQixTQUFDLFFBQUQ7QUFDakIsUUFBQTtJQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsZUFBMUI7QUFDVixZQUFPLFFBQVA7QUFBQSxXQUNPLE9BRFA7QUFFSTthQUFBLHlDQUFBOztVQUNFLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBZCxDQUFrQixRQUFsQjtVQUNBLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixRQUFyQjt1QkFDQSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQWQsQ0FBcUIsT0FBckI7QUFIRjs7QUFERztBQURQLFdBT08sUUFQUDtBQVFJO2FBQUEsMkNBQUE7O1VBQ0UsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQWtCLFFBQWxCO1VBQ0EsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFkLENBQXFCLE9BQXJCO3dCQUNBLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBZCxDQUFxQixPQUFyQjtBQUhGOztBQURHO0FBUFAsV0FhTyxPQWJQO0FBY0k7YUFBQSwyQ0FBQTs7VUFDRSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBa0IsUUFBbEI7VUFDQSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQWQsQ0FBcUIsUUFBckI7d0JBQ0EsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFkLENBQXFCLE9BQXJCO0FBSEY7O0FBZEo7RUFGaUI7O0VBcUJuQixzQkFBQSxHQUF5QixTQUFBO0FBQ3ZCLFFBQUE7SUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQjtJQUNmLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQjtJQUNoQixPQUFBLENBQVEsYUFBUjtXQUNBLGdCQUFBLENBQWlCLFlBQWpCO0VBSnVCOztFQU16QixJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFmLENBQXFDLFNBQUMsTUFBRDtXQUNuQyxzQkFBQSxDQUFBO0VBRG1DLENBQXJDOztFQUdBLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsU0FBQyxNQUFEO1dBQ2hDLHNCQUFBLENBQUE7RUFEZ0MsQ0FBbEM7QUExRUEiLCJzb3VyY2VzQ29udGVudCI6WyJyb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG50YWJzSW5UcmVlVmlldyA9IHJvb3QucXVlcnlTZWxlY3RvciAnLmxpc3QtaW5saW5lLnRhYi1iYXIuaW5zZXQtcGFuZWwnXG50cmVlVmlld1RpdGxlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50cmVlLXZpZXcgc3Bhbi5uYW1lJylcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIGNvbnNvbGUubG9nICdhY3RpdmF0ZSBjaXR5IGxpZ2h0cyB1aSAnLCBzdGF0ZVxuXG4gICAgdGFiU2l6ZVZhbHVlID0gYXRvbS5jb25maWcuZ2V0KCdjaXR5LWxpZ2h0cy11aS50YWJTaXplJylcbiAgICBmb250U2l6ZVZhbHVlID0gYXRvbS5jb25maWcuZ2V0KCdjaXR5LWxpZ2h0cy11aS5mb250U2l6ZScpXG4gICAgc2V0U2l6ZShmb250U2l6ZVZhbHVlKVxuICAgIGNoYW5nZVRhYkJhclNpemUodGFiU2l6ZVZhbHVlKVxuXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSAnY2l0eS1saWdodHMtdWkuc2hvd1RhYnNJblRyZWVWaWV3JywgKG5ld1ZhbHVlKSAtPlxuICAgICAgc2hvd1RhYkJhckluVHJlZVZpZXcobmV3VmFsdWUpXG5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdjaXR5LWxpZ2h0cy11aS5mb250U2l6ZScsIChuZXdWYWx1ZSkgLT5cbiAgICAgIHNldFNpemUobmV3VmFsdWUpXG5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlICdjaXR5LWxpZ2h0cy11aS50YWJTaXplJywgKHRhYlNpemVWYWx1ZSkgLT5cbiAgICAgIGNoYW5nZVRhYkJhclNpemUodGFiU2l6ZVZhbHVlKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgdW5zZXRTaXplKClcblxuXG5zaG93VGFiQmFySW5UcmVlVmlldyA9IChib29sZWFuKSAtPlxuICBpZiBib29sZWFuXG4gICAgdGFic0luVHJlZVZpZXcuc3R5bGUuZGlzcGxheSA9ICdmbGV4J1xuICBlbHNlXG4gICAgdGFic0luVHJlZVZpZXcuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG5cbnNldFNpemUgPSAoY3VycmVudEZvbnRTaXplKSAtPlxuICByb290LnN0eWxlLmZvbnRTaXplID0gY3VycmVudEZvbnRTaXplICsgJ3B4J1xuICBpZiBjdXJyZW50Rm9udFNpemUgPj0gMTFcbiAgICByb290LnN0eWxlLmxpbmVIZWlnaHQgPSAyLjRcbiAgZWxzZVxuICAgIHJvb3Quc3R5bGUubGluZUhlaWdodCA9IDIuMVxuXG51bnNldFNpemUgPSAoKSAtPlxuICBmb3Igc3BhbiwgaSBpbiB0cmVlVmlld1RpdGxlc1xuICAgIHNwYW4uc3R5bGUuZm9udFNpemUgPSAnJ1xuXG5jaGFuZ2VUYWJCYXJTaXplID0gKHRhYlZhbHVlKSAtPlxuICB0YWJCYXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhYi1iYXIgLnRhYicpXG4gIHN3aXRjaCB0YWJWYWx1ZVxuICAgIHdoZW4gJ3NtYWxsJ1xuICAgICAgZm9yIHRhYiBpbiB0YWJCYXJzXG4gICAgICAgIHRhYi5jbGFzc0xpc3QuYWRkKHRhYlZhbHVlKVxuICAgICAgICB0YWIuY2xhc3NMaXN0LnJlbW92ZSgnbWVkaXVtJylcbiAgICAgICAgdGFiLmNsYXNzTGlzdC5yZW1vdmUoJ2xhcmdlJylcblxuICAgIHdoZW4gJ21lZGl1bSdcbiAgICAgIGZvciB0YWIgaW4gdGFiQmFyc1xuICAgICAgICB0YWIuY2xhc3NMaXN0LmFkZCh0YWJWYWx1ZSlcbiAgICAgICAgdGFiLmNsYXNzTGlzdC5yZW1vdmUoJ2xhcmdlJylcbiAgICAgICAgdGFiLmNsYXNzTGlzdC5yZW1vdmUoJ3NtYWxsJylcblxuICAgIHdoZW4gJ2xhcmdlJ1xuICAgICAgZm9yIHRhYiBpbiB0YWJCYXJzXG4gICAgICAgIHRhYi5jbGFzc0xpc3QuYWRkKHRhYlZhbHVlKVxuICAgICAgICB0YWIuY2xhc3NMaXN0LnJlbW92ZSgnbWVkaXVtJylcbiAgICAgICAgdGFiLmNsYXNzTGlzdC5yZW1vdmUoJ3NtYWxsJylcblxub2JzZXJ2ZUVkaXRvcnNPbkV2ZW50cyA9IC0+XG4gIHRhYlNpemVWYWx1ZSA9IGF0b20uY29uZmlnLmdldCgnY2l0eS1saWdodHMtdWkudGFiU2l6ZScpXG4gIGZvbnRTaXplVmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQoJ2NpdHktbGlnaHRzLXVpLmZvbnRTaXplJylcbiAgc2V0U2l6ZShmb250U2l6ZVZhbHVlKVxuICBjaGFuZ2VUYWJCYXJTaXplKHRhYlNpemVWYWx1ZSlcblxuYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtIChlZGl0b3IpIC0+XG4gIG9ic2VydmVFZGl0b3JzT25FdmVudHMoKVxuXG5hdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgLT5cbiAgb2JzZXJ2ZUVkaXRvcnNPbkV2ZW50cygpXG4iXX0=
