var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

'use babel';

var SelectListView = require('atom-select-list');
var fuzzaldrinPlus = require('fuzzaldrin-plus');

module.exports = (function () {
  function SelectList() {
    var _this = this;

    _classCallCheck(this, SelectList);

    this.selectListView = new SelectListView({
      initiallyVisibleItemCount: 10,
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.displayName;
      },
      elementForItem: function elementForItem(item, _ref) {
        var index = _ref.index;
        var selected = _ref.selected;
        var visible = _ref.visible;

        if (!visible) {
          return document.createElement('li');
        }
        var li = document.createElement('li');
        var div = document.createElement('div');
        div.classList.add('pull-right');

        var commandName = item.klass.getCommandName();
        _this.keyBindingsForActiveElement.filter(function (_ref2) {
          var command = _ref2.command;
          return command === commandName;
        }).forEach(function (keyBinding) {
          var kbd = document.createElement('kbd');
          kbd.classList.add('key-binding');
          kbd.textContent = (0, _underscorePlus.humanizeKeystroke)(keyBinding.keystrokes);
          div.appendChild(kbd);
        });

        var span = document.createElement('span');
        highlightMatchesInElement(item.displayName, _this.selectListView.getQuery(), span);

        li.appendChild(div);
        li.appendChild(span);
        return li;
      },
      emptyMessage: 'No matches found',
      didConfirmSelection: function didConfirmSelection(item) {
        _this.confirmed = true;
        if (_this.onConfirm) _this.onConfirm(item);
        _this.hide();
      },
      didCancelSelection: function didCancelSelection() {
        if (_this.confirmed) return;
        if (_this.onCancel) _this.onCancel();
        _this.hide();
      }
    });
    this.selectListView.element.classList.add('vim-mode-plus-select-list');
  }

  _createClass(SelectList, [{
    key: 'selectFromItems',
    value: function selectFromItems(items) {
      var _this2 = this;

      return new Promise(function (resolve) {
        _this2.show({
          items: items,
          onCancel: resolve,
          onConfirm: resolve
        });
      });
    }
  }, {
    key: 'show',
    value: _asyncToGenerator(function* (_ref3) {
      var items = _ref3.items;
      var onCancel = _ref3.onCancel;
      var onConfirm = _ref3.onConfirm;

      this.keyBindingsForActiveElement = atom.keymaps.findKeyBindings({ target: this.activeElement });

      this.confirmed = false;
      this.onConfirm = onConfirm;
      this.onCancel = onCancel;

      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      }
      this.selectListView.reset();
      yield this.selectListView.update({ items: items });

      this.previouslyFocusedElement = document.activeElement;
      this.panel.show();
      this.selectListView.focus();
    })
  }, {
    key: 'hide',
    value: function hide() {
      this.panel.hide();
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    }
  }]);

  return SelectList;
})();

function highlightMatchesInElement(text, query, el) {
  var matches = fuzzaldrinPlus.match(text, query);
  var matchedChars = [];
  var lastIndex = 0;
  for (var matchIndex of matches) {
    var _unmatched = text.substring(lastIndex, matchIndex);
    if (_unmatched) {
      if (matchedChars.length > 0) {
        var matchSpan = document.createElement('span');
        matchSpan.classList.add('character-match');
        matchSpan.textContent = matchedChars.join('');
        el.appendChild(matchSpan);
        matchedChars = [];
      }

      el.appendChild(document.createTextNode(_unmatched));
    }

    matchedChars.push(text[matchIndex]);
    lastIndex = matchIndex + 1;
  }

  if (matchedChars.length > 0) {
    var matchSpan = document.createElement('span');
    matchSpan.classList.add('character-match');
    matchSpan.textContent = matchedChars.join('');
    el.appendChild(matchSpan);
  }

  var unmatched = text.substring(lastIndex);
  if (unmatched) {
    el.appendChild(document.createTextNode(unmatched));
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0LWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzhCQUVnQyxpQkFBaUI7O0FBRmpELFdBQVcsQ0FBQTs7QUFHWCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUNsRCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7QUFFakQsTUFBTSxDQUFDLE9BQU87QUFDQSxXQURTLFVBQVUsR0FDaEI7OzswQkFETSxVQUFVOztBQUU3QixRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksY0FBYyxDQUFDO0FBQ3ZDLCtCQUF5QixFQUFFLEVBQUU7QUFDN0IsV0FBSyxFQUFFLEVBQUU7QUFDVCxzQkFBZ0IsRUFBRSwwQkFBQSxJQUFJO2VBQUksSUFBSSxDQUFDLFdBQVc7T0FBQTtBQUMxQyxvQkFBYyxFQUFFLHdCQUFDLElBQUksRUFBRSxJQUEwQixFQUFLO1lBQTlCLEtBQUssR0FBTixJQUEwQixDQUF6QixLQUFLO1lBQUUsUUFBUSxHQUFoQixJQUEwQixDQUFsQixRQUFRO1lBQUUsT0FBTyxHQUF6QixJQUEwQixDQUFSLE9BQU87O0FBQzlDLFlBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixpQkFBTyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQ3BDO0FBQ0QsWUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN2QyxZQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3pDLFdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBOztBQUUvQixZQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFBO0FBQy9DLGNBQUssMkJBQTJCLENBQUMs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Q2xCOztBQUVELFFBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFTLENBQUMsQ0FBQyxDQUFBO0tBQ25EOztBQUVELGdCQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO0FBQ25DLGFBQVMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFBO0dBQzNCOztBQUVELE1BQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDM0IsUUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNoRCxhQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQzFDLGFBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUM3QyxNQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0dBQzFCOztBQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDM0MsTUFBSSxTQUFTLEVBQUU7QUFDYixNQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtHQUNuRDtDQUNGIiwiZmlsZSI6Ii9ob21lL2phenovLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0LWxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge2h1bWFuaXplS2V5c3Ryb2tlfSBmcm9tICd1bmRlcnNjb3JlLXBsdXMnXG5jb25zdCBTZWxlY3RMaXN0VmlldyA9IHJlcXVpcmUoJ2F0b20tc2VsZWN0LWxpc3QnKVxuY29uc3QgZnV6emFsZHJpblBsdXMgPSByZXF1aXJlKCdmdXp6YWxkcmluLXBsdXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNlbGVjdExpc3Qge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpbml0aWFsbHlWaXNpYmxlSXRlbUNvdW50OiAxMCxcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIGZpbHRlcktleUZvckl0ZW06IGl0ZW0gPT4gaXRlbS5kaXNwbGF5TmFtZSxcbiAgICAgIGVsZW1lbnRGb3JJdGVtOiAoaXRlbSwge2luZGV4LCBzZWxlY3RlZCwgdmlzaWJsZX0pID0+IHtcbiAgICAgICAgaWYgKCF2aXNpYmxlKSB7XG4gICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgZGl2LmNsYXNzTGlzdC5hZGQoJ3B1bGwtcmlnaHQnKVxuXG4gICAgICAgIGNvbnN0IGNvbW1hbmROYW1lID0gaXRlbS5rbGFzcy5nZXRDb21tYW5kTmFtZSgpXG4gICAgICAgIHRoaXMua2V5QmluZGluZ3NGb3JBY3RpdmVFbGVtZW50LmZpbHRlcigoe2NvbW1hbmR9KSA9PiBjb21tYW5kID09PSBjb21tYW5kTmFtZSkuZm9yRWFjaChrZXlCaW5kaW5nID0+IHtcbiAgICAgICAgICBjb25zdCBrYmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdrYmQnKVxuICAgICAgICAgIGtiZC5jbGFzc0xpc3QuYWRkKCdrZXktYmluZGluZycpXG4gICAgICAgICAga2JkLnRleHRDb250ZW50ID0gaHVtYW5pemVLZXlzdHJva2Uoa2V5QmluZGluZy5rZXlzdHJva2VzKVxuICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChrYmQpXG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc3Qgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBoaWdobGlnaHRNYXRjaGVzSW5FbGVtZW50KGl0ZW0uZGlzcGxheU5hbWUsIHRoaXMuc2VsZWN0TGlzdFZpZXcuZ2V0UXVlcnkoKSwgc3BhbilcblxuICAgICAgICBsaS5hcHBlbmRDaGlsZChkaXYpXG4gICAgICAgIGxpLmFwcGVuZENoaWxkKHNwYW4pXG4gICAgICAgIHJldHVybiBsaVxuICAgICAgfSxcbiAgICAgIGVtcHR5TWVzc2FnZTogJ05vIG1hdGNoZXMgZm91bmQnLFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogaXRlbSA9PiB7XG4gICAgICAgIHRoaXMuY29uZmlybWVkID0gdHJ1ZVxuICAgICAgICBpZiAodGhpcy5vbkNvbmZpcm0pIHRoaXMub25Db25maXJtKGl0ZW0pXG4gICAgICAgIHRoaXMuaGlkZSgpXG4gICAgICB9LFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpcm1lZCkgcmV0dXJuXG4gICAgICAgIGlmICh0aGlzLm9uQ2FuY2VsKSB0aGlzLm9uQ2FuY2VsKClcbiAgICAgICAgdGhpcy5oaWRlKClcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCd2aW0tbW9kZS1wbHVzLXNlbGVjdC1saXN0JylcbiAgfVxuXG4gIHNlbGVjdEZyb21JdGVtcyAoaXRlbXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNob3coe1xuICAgICAgICBpdGVtczogaXRlbXMsXG4gICAgICAgIG9uQ2FuY2VsOiByZXNvbHZlLFxuICAgICAgICBvbkNvbmZpcm06IHJlc29sdmVcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIHNob3cgKHtpdGVtcywgb25DYW5jZWwsIG9uQ29uZmlybX0pIHtcbiAgICB0aGlzLmtleUJpbmRpbmdzRm9yQWN0aXZlRWxlbWVudCA9IGF0b20ua2V5bWFwcy5maW5kS2V5QmluZGluZ3Moe3RhcmdldDogdGhpcy5hY3RpdmVFbGVtZW50fSlcblxuICAgIHRoaXMuY29uZmlybWVkID0gZmFsc2VcbiAgICB0aGlzLm9uQ29uZmlybSA9IG9uQ29uZmlybVxuICAgIHRoaXMub25DYW5jZWwgPSBvbkNhbmNlbFxuXG4gICAgaWYgKCF0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogdGhpcy5zZWxlY3RMaXN0Vmlld30pXG4gICAgfVxuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcucmVzZXQoKVxuICAgIGF3YWl0IHRoaXMuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtpdGVtc30pXG5cbiAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICB0aGlzLnBhbmVsLnNob3coKVxuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcuZm9jdXMoKVxuICB9XG5cbiAgaGlkZSAoKSB7XG4gICAgdGhpcy5wYW5lbC5oaWRlKClcbiAgICBpZiAodGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKClcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gbnVsbFxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBoaWdobGlnaHRNYXRjaGVzSW5FbGVtZW50ICh0ZXh0LCBxdWVyeSwgZWwpIHtcbiAgY29uc3QgbWF0Y2hlcyA9IGZ1enphbGRyaW5QbHVzLm1hdGNoKHRleHQsIHF1ZXJ5KVxuICBsZXQgbWF0Y2hlZENoYXJzID0gW11cbiAgbGV0IGxhc3RJbmRleCA9IDBcbiAgZm9yIChjb25zdCBtYXRjaEluZGV4IG9mIG1hdGNoZXMpIHtcbiAgICBjb25zdCB1bm1hdGNoZWQgPSB0ZXh0LnN1YnN0cmluZyhsYXN0SW5kZXgsIG1hdGNoSW5kZXgpXG4gICAgaWYgKHVubWF0Y2hlZCkge1xuICAgICAgaWYgKG1hdGNoZWRDaGFycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBtYXRjaFNwYW4uY2xhc3NMaXN0LmFkZCgnY2hhcmFjdGVyLW1hdGNoJylcbiAgICAgICAgbWF0Y2hTcGFuLnRleHRDb250ZW50ID0gbWF0Y2hlZENoYXJzLmpvaW4oJycpXG4gICAgICAgIGVsLmFwcGVuZENoaWxkKG1hdGNoU3BhbilcbiAgICAgICAgbWF0Y2hlZENoYXJzID0gW11cbiAgICAgIH1cblxuICAgICAgZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodW5tYXRjaGVkKSlcbiAgICB9XG5cbiAgICBtYXRjaGVkQ2hhcnMucHVzaCh0ZXh0W21hdGNoSW5kZXhdKVxuICAgIGxhc3RJbmRleCA9IG1hdGNoSW5kZXggKyAxXG4gIH1cblxuICBpZiAobWF0Y2hlZENoYXJzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBtYXRjaFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBtYXRjaFNwYW4uY2xhc3NMaXN0LmFkZCgnY2hhcmFjdGVyLW1hdGNoJylcbiAgICBtYXRjaFNwYW4udGV4dENvbnRlbnQgPSBtYXRjaGVkQ2hhcnMuam9pbignJylcbiAgICBlbC5hcHBlbmRDaGlsZChtYXRjaFNwYW4pXG4gIH1cblxuICBjb25zdCB1bm1hdGNoZWQgPSB0ZXh0LnN1YnN0cmluZyhsYXN0SW5kZXgpXG4gIGlmICh1bm1hdGNoZWQpIHtcbiAgICBlbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1bm1hdGNoZWQpKVxuICB9XG59XG4iXX0=