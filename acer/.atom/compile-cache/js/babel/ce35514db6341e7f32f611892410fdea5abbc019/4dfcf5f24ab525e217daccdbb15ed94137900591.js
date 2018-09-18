'use babel';

var path = require('path');
var generate = require('markdown-it-testgen');

var _require = require('../../lib/markdown-it-math/index.js');

var math_plugin = _require.math_plugin;

describe('Default math', function () {
  var md = require('markdown-it')().use(math_plugin);

  generate(path.join(__dirname, 'fixtures/default.txt'), md);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24taXQtbWF0aC9pbmRleC5zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7QUFFWCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUE7O2VBQ3ZCLE9BQU8sQ0FBQyxxQ0FBcUMsQ0FBQzs7SUFBOUQsV0FBVyxZQUFYLFdBQVc7O0FBRWpCLFFBQVEsQ0FBQyxjQUFjLEVBQUUsWUFBVztBQUNsQyxNQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7O0FBRWxELFVBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0NBQzNELENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9qYXp6Ly5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXByZXZpZXctcGx1cy9zcGVjL21hcmtkb3duLWl0LW1hdGgvaW5kZXguc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbnZhciBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG52YXIgZ2VuZXJhdGUgPSByZXF1aXJlKCdtYXJrZG93bi1pdC10ZXN0Z2VuJylcbnZhciB7IG1hdGhfcGx1Z2luIH0gPSByZXF1aXJlKCcuLi8uLi9saWIvbWFya2Rvd24taXQtbWF0aC9pbmRleC5qcycpXG5cbmRlc2NyaWJlKCdEZWZhdWx0IG1hdGgnLCBmdW5jdGlvbigpIHtcbiAgdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSgpLnVzZShtYXRoX3BsdWdpbilcblxuICBnZW5lcmF0ZShwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMvZGVmYXVsdC50eHQnKSwgbWQpXG59KVxuIl19