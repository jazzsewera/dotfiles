(function() {
  var ExState, GlobalExState, activateExMode, dispatchKeyboardEvent, dispatchTextEvent, getEditorElement, keydown,
    slice = [].slice;

  ExState = require('../lib/ex-state');

  GlobalExState = require('../lib/global-ex-state');

  beforeEach(function() {
    return atom.workspace || (atom.workspace = {});
  });

  activateExMode = function() {
    return atom.workspace.open().then(function() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'ex-mode:open');
      keydown('escape');
      return atom.workspace.getActivePane().destroyActiveItem();
    });
  };

  getEditorElement = function(callback) {
    var textEditor;
    textEditor = null;
    waitsForPromise(function() {
      return atom.workspace.open().then(function(e) {
        return textEditor = e;
      });
    });
    return runs(function() {
      var element;
      element = atom.views.getView(textEditor);
      return callback(element);
    });
  };

  dispatchKeyboardEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    e = document.createEvent('KeyboardEvent');
    e.initKeyboardEvent.apply(e, eventArgs);
    if (e.keyCode === 0) {
      Object.defineProperty(e, 'keyCode', {
        get: function() {
          return void 0;
        }
      });
    }
    return target.dispatchEvent(e);
  };

  dispatchTextEvent = function() {
    var e, eventArgs, target;
    target = arguments[0], eventArgs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    e = document.createEvent('TextEvent');
    e.initTextEvent.apply(e, eventArgs);
    return target.dispatchEvent(e);
  };

  keydown = function(key, arg) {
    var alt, canceled, ctrl, element, eventArgs, meta, raw, ref, shift;
    ref = arg != null ? arg : {}, element = ref.element, ctrl = ref.ctrl, shift = ref.shift, alt = ref.alt, meta = ref.meta, raw = ref.raw;
    if (!(key === 'escape' || (raw != null))) {
      key = "U+" + (key.charCodeAt(0).toString(16));
    }
    element || (element = document.activeElement);
    eventArgs = [true, true, null, key, 0, ctrl, alt, shift, meta];
    canceled = !dispatchKeyboardEvent.apply(null, [element, 'keydown'].concat(slice.call(eventArgs)));
    dispatchKeyboardEvent.apply(null, [element, 'keypress'].concat(slice.call(eventArgs)));
    if (!canceled) {
      if (dispatchTextEvent.apply(null, [element, 'textInput'].concat(slice.call(eventArgs)))) {
        element.value += key;
      }
    }
    return dispatchKeyboardEvent.apply(null, [element, 'keyup'].concat(slice.call(eventArgs)));
  };

  module.exports = {
    keydown: keydown,
    getEditorElement: getEditorElement,
    activateExMode: activateExMode
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyR0FBQTtJQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsaUJBQVI7O0VBQ1YsYUFBQSxHQUFnQixPQUFBLENBQVEsd0JBQVI7O0VBRWhCLFVBQUEsQ0FBVyxTQUFBO1dBQ1QsSUFBSSxDQUFDLGNBQUwsSUFBSSxDQUFDLFlBQWM7RUFEVixDQUFYOztFQUdBLGNBQUEsR0FBaUIsU0FBQTtXQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQTtNQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUF2QixFQUEyRCxjQUEzRDtNQUNBLE9BQUEsQ0FBUSxRQUFSO2FBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBOEIsQ0FBQyxpQkFBL0IsQ0FBQTtJQUh5QixDQUEzQjtFQURlOztFQU9qQixnQkFBQSxHQUFtQixTQUFDLFFBQUQ7QUFDakIsUUFBQTtJQUFBLFVBQUEsR0FBYTtJQUViLGVBQUEsQ0FBZ0IsU0FBQTthQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFBLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxDQUFEO2VBQ3pCLFVBQUEsR0FBYTtNQURZLENBQTNCO0lBRGMsQ0FBaEI7V0FJQSxJQUFBLENBQUssU0FBQTtBQVNILFVBQUE7TUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLFVBQW5CO2FBRVYsUUFBQSxDQUFTLE9BQVQ7SUFYRyxDQUFMO0VBUGlCOztFQW9CbkIscUJBQUEsR0FBd0IsU0FBQTtBQUN0QixRQUFBO0lBRHVCLHVCQUFRO0lBQy9CLENBQUEsR0FBSSxRQUFRLENBQUMsV0FBVCxDQUFxQixlQUFyQjtJQUNKLENBQUMsQ0FBQyxpQkFBRixVQUFvQixTQUFwQjtJQUVBLElBQTBELENBQUMsQ0FBQyxPQUFGLEtBQWEsQ0FBdkU7TUFBQSxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUF0QixFQUF5QixTQUF6QixFQUFvQztRQUFBLEdBQUEsRUFBSyxTQUFBO2lCQUFHO1FBQUgsQ0FBTDtPQUFwQyxFQUFBOztXQUNBLE1BQU0sQ0FBQyxhQUFQLENBQXFCLENBQXJCO0VBTHNCOztFQU94QixpQkFBQSxHQUFvQixTQUFBO0FBQ2xCLFFBQUE7SUFEbUIsdUJBQVE7SUFDM0IsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxXQUFULENBQXFCLFdBQXJCO0lBQ0osQ0FBQyxDQUFDLGFBQUYsVUFBZ0IsU0FBaEI7V0FDQSxNQUFNLENBQUMsYUFBUCxDQUFxQixDQUFyQjtFQUhrQjs7RUFLcEIsT0FBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFDUixRQUFBO3dCQURjLE1BQXVDLElBQXRDLHVCQUFTLGlCQUFNLG1CQUFPLGVBQUssaUJBQU07SUFDaEQsSUFBQSxDQUFBLENBQW1ELEdBQUEsS0FBTyxRQUFQLElBQW1CLGFBQXRFLENBQUE7TUFBQSxHQUFBLEdBQU0sSUFBQSxHQUFJLENBQUMsR0FBRyxDQUFDLFVBQUosQ0FBZSxDQUFmLENBQWlCLENBQUMsUUFBbEIsQ0FBMkIsRUFBM0IsQ0FBRCxFQUFWOztJQUNBLFlBQUEsVUFBWSxRQUFRLENBQUM7SUFDckIsU0FBQSxHQUFZLENBQ1YsSUFEVSxFQUVWLElBRlUsRUFHVixJQUhVLEVBSVYsR0FKVSxFQUtWLENBTFUsRUFNVixJQU5VLEVBTUosR0FOSSxFQU1DLEtBTkQsRUFNUSxJQU5SO0lBU1osUUFBQSxHQUFXLENBQUkscUJBQUEsYUFBc0IsQ0FBQSxPQUFBLEVBQVMsU0FBVyxTQUFBLFdBQUEsU0FBQSxDQUFBLENBQTFDO0lBQ2YscUJBQUEsYUFBc0IsQ0FBQSxPQUFBLEVBQVMsVUFBWSxTQUFBLFdBQUEsU0FBQSxDQUFBLENBQTNDO0lBQ0EsSUFBRyxDQUFJLFFBQVA7TUFDRSxJQUFHLGlCQUFBLGFBQWtCLENBQUEsT0FBQSxFQUFTLFdBQWEsU0FBQSxXQUFBLFNBQUEsQ0FBQSxDQUF4QyxDQUFIO1FBQ0UsT0FBTyxDQUFDLEtBQVIsSUFBaUIsSUFEbkI7T0FERjs7V0FHQSxxQkFBQSxhQUFzQixDQUFBLE9BQUEsRUFBUyxPQUFTLFNBQUEsV0FBQSxTQUFBLENBQUEsQ0FBeEM7RUFqQlE7O0VBbUJWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUMsU0FBQSxPQUFEO0lBQVUsa0JBQUEsZ0JBQVY7SUFBNEIsZ0JBQUEsY0FBNUI7O0FBaEVqQiIsInNvdXJjZXNDb250ZW50IjpbIkV4U3RhdGUgPSByZXF1aXJlICcuLi9saWIvZXgtc3RhdGUnXG5HbG9iYWxFeFN0YXRlID0gcmVxdWlyZSAnLi4vbGliL2dsb2JhbC1leC1zdGF0ZSdcblxuYmVmb3JlRWFjaCAtPlxuICBhdG9tLndvcmtzcGFjZSB8fD0ge31cblxuYWN0aXZhdGVFeE1vZGUgPSAtPlxuICBhdG9tLndvcmtzcGFjZS5vcGVuKCkudGhlbiAtPlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ2V4LW1vZGU6b3BlbicpXG4gICAga2V5ZG93bignZXNjYXBlJylcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZGVzdHJveUFjdGl2ZUl0ZW0oKVxuXG5cbmdldEVkaXRvckVsZW1lbnQgPSAoY2FsbGJhY2spIC0+XG4gIHRleHRFZGl0b3IgPSBudWxsXG5cbiAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGUpIC0+XG4gICAgICB0ZXh0RWRpdG9yID0gZVxuXG4gIHJ1bnMgLT5cbiAgICAjIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXRvbS10ZXh0LWVkaXRvclwiKVxuICAgICMgZWxlbWVudC5zZXRNb2RlbCh0ZXh0RWRpdG9yKVxuICAgICMgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aW0tbW9kZScpXG4gICAgIyBlbGVtZW50LmV4U3RhdGUgPSBuZXcgRXhTdGF0ZShlbGVtZW50LCBuZXcgR2xvYmFsRXhTdGF0ZSlcbiAgICAjXG4gICAgIyBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJrZXlkb3duXCIsIChlKSAtPlxuICAgICMgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChlKVxuXG4gICAgZWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKVxuXG4gICAgY2FsbGJhY2soZWxlbWVudClcblxuZGlzcGF0Y2hLZXlib2FyZEV2ZW50ID0gKHRhcmdldCwgZXZlbnRBcmdzLi4uKSAtPlxuICBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0tleWJvYXJkRXZlbnQnKVxuICBlLmluaXRLZXlib2FyZEV2ZW50KGV2ZW50QXJncy4uLilcbiAgIyAwIGlzIHRoZSBkZWZhdWx0LCBhbmQgaXQncyB2YWxpZCBBU0NJSSwgYnV0IGl0J3Mgd3JvbmcuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCAna2V5Q29kZScsIGdldDogLT4gdW5kZWZpbmVkKSBpZiBlLmtleUNvZGUgaXMgMFxuICB0YXJnZXQuZGlzcGF0Y2hFdmVudCBlXG5cbmRpc3BhdGNoVGV4dEV2ZW50ID0gKHRhcmdldCwgZXZlbnRBcmdzLi4uKSAtPlxuICBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ1RleHRFdmVudCcpXG4gIGUuaW5pdFRleHRFdmVudChldmVudEFyZ3MuLi4pXG4gIHRhcmdldC5kaXNwYXRjaEV2ZW50IGVcblxua2V5ZG93biA9IChrZXksIHtlbGVtZW50LCBjdHJsLCBzaGlmdCwgYWx0LCBtZXRhLCByYXd9PXt9KSAtPlxuICBrZXkgPSBcIlUrI3trZXkuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNil9XCIgdW5sZXNzIGtleSBpcyAnZXNjYXBlJyBvciByYXc/XG4gIGVsZW1lbnQgfHw9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgZXZlbnRBcmdzID0gW1xuICAgIHRydWUsICMgYnViYmxlc1xuICAgIHRydWUsICMgY2FuY2VsYWJsZVxuICAgIG51bGwsICMgdmlld1xuICAgIGtleSwgICMga2V5XG4gICAgMCwgICAgIyBsb2NhdGlvblxuICAgIGN0cmwsIGFsdCwgc2hpZnQsIG1ldGFcbiAgXVxuXG4gIGNhbmNlbGVkID0gbm90IGRpc3BhdGNoS2V5Ym9hcmRFdmVudChlbGVtZW50LCAna2V5ZG93bicsIGV2ZW50QXJncy4uLilcbiAgZGlzcGF0Y2hLZXlib2FyZEV2ZW50KGVsZW1lbnQsICdrZXlwcmVzcycsIGV2ZW50QXJncy4uLilcbiAgaWYgbm90IGNhbmNlbGVkXG4gICAgaWYgZGlzcGF0Y2hUZXh0RXZlbnQoZWxlbWVudCwgJ3RleHRJbnB1dCcsIGV2ZW50QXJncy4uLilcbiAgICAgIGVsZW1lbnQudmFsdWUgKz0ga2V5XG4gIGRpc3BhdGNoS2V5Ym9hcmRFdmVudChlbGVtZW50LCAna2V5dXAnLCBldmVudEFyZ3MuLi4pXG5cbm1vZHVsZS5leHBvcnRzID0ge2tleWRvd24sIGdldEVkaXRvckVsZW1lbnQsIGFjdGl2YXRlRXhNb2RlfVxuIl19
