(function() {
  var VimOption,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  VimOption = (function() {
    function VimOption() {
      this.nogdefault = bind(this.nogdefault, this);
      this.gdefault = bind(this.gdefault, this);
      this.noscs = bind(this.noscs, this);
      this.nosmartcase = bind(this.nosmartcase, this);
      this.scs = bind(this.scs, this);
      this.smartcase = bind(this.smartcase, this);
      this.nosb = bind(this.nosb, this);
      this.nosplitbelow = bind(this.nosplitbelow, this);
      this.sb = bind(this.sb, this);
      this.splitbelow = bind(this.splitbelow, this);
      this.nospr = bind(this.nospr, this);
      this.nosplitright = bind(this.nosplitright, this);
      this.spr = bind(this.spr, this);
      this.splitright = bind(this.splitright, this);
      this.nonu = bind(this.nonu, this);
      this.nonumber = bind(this.nonumber, this);
      this.nu = bind(this.nu, this);
      this.number = bind(this.number, this);
      this.nolist = bind(this.nolist, this);
      this.list = bind(this.list, this);
    }

    VimOption.singleton = function() {
      return VimOption.option || (VimOption.option = new VimOption);
    };

    VimOption.prototype.list = function() {
      return atom.config.set("editor.showInvisibles", true);
    };

    VimOption.prototype.nolist = function() {
      return atom.config.set("editor.showInvisibles", false);
    };

    VimOption.prototype.number = function() {
      return atom.config.set("editor.showLineNumbers", true);
    };

    VimOption.prototype.nu = function() {
      return this.number();
    };

    VimOption.prototype.nonumber = function() {
      return atom.config.set("editor.showLineNumbers", false);
    };

    VimOption.prototype.nonu = function() {
      return this.nonumber();
    };

    VimOption.prototype.splitright = function() {
      return atom.config.set("ex-mode.splitright", true);
    };

    VimOption.prototype.spr = function() {
      return this.splitright();
    };

    VimOption.prototype.nosplitright = function() {
      return atom.config.set("ex-mode.splitright", false);
    };

    VimOption.prototype.nospr = function() {
      return this.nosplitright();
    };

    VimOption.prototype.splitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", true);
    };

    VimOption.prototype.sb = function() {
      return this.splitbelow();
    };

    VimOption.prototype.nosplitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", false);
    };

    VimOption.prototype.nosb = function() {
      return this.nosplitbelow();
    };

    VimOption.prototype.smartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", true);
    };

    VimOption.prototype.scs = function() {
      return this.smartcase();
    };

    VimOption.prototype.nosmartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", false);
    };

    VimOption.prototype.noscs = function() {
      return this.nosmartcase();
    };

    VimOption.prototype.gdefault = function() {
      return atom.config.set("ex-mode.gdefault", true);
    };

    VimOption.prototype.nogdefault = function() {
      return atom.config.set("ex-mode.gdefault", false);
    };

    return VimOption;

  })();

  module.exports = VimOption;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi92aW0tb3B0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsU0FBQTtJQUFBOztFQUFNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFDSixTQUFDLENBQUEsU0FBRCxHQUFZLFNBQUE7YUFDVixTQUFDLENBQUEsV0FBRCxTQUFDLENBQUEsU0FBVyxJQUFJO0lBRE47O3dCQUdaLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxJQUF6QztJQURJOzt3QkFHTixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsS0FBekM7SUFETTs7d0JBR1IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLElBQTFDO0lBRE07O3dCQUdSLEVBQUEsR0FBSSxTQUFBO2FBQ0YsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQURFOzt3QkFHSixRQUFBLEdBQVUsU0FBQTthQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsS0FBMUM7SUFEUTs7d0JBR1YsSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsUUFBRCxDQUFBO0lBREk7O3dCQUdOLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxJQUF0QztJQURVOzt3QkFHWixHQUFBLEdBQUssU0FBQTthQUNILElBQUMsQ0FBQSxVQUFELENBQUE7SUFERzs7d0JBR0wsWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLEtBQXRDO0lBRFk7O3dCQUdkLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQURLOzt3QkFHUCxVQUFBLEdBQVksU0FBQTthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsSUFBdEM7SUFEVTs7d0JBR1osRUFBQSxHQUFJLFNBQUE7YUFDRixJQUFDLENBQUEsVUFBRCxDQUFBO0lBREU7O3dCQUdKLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxLQUF0QztJQURZOzt3QkFHZCxJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxZQUFELENBQUE7SUFESTs7d0JBR04sU0FBQSxHQUFXLFNBQUE7YUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLEVBQWtELElBQWxEO0lBRFM7O3dCQUdYLEdBQUEsR0FBSyxTQUFBO2FBQ0gsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQURHOzt3QkFHTCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsRUFBa0QsS0FBbEQ7SUFEVzs7d0JBR2IsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsV0FBRCxDQUFBO0lBREs7O3dCQUdQLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQixFQUFvQyxJQUFwQztJQURROzt3QkFHVixVQUFBLEdBQVksU0FBQTthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0MsS0FBcEM7SUFEVTs7Ozs7O0VBR2QsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFoRWpCIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVmltT3B0aW9uXG4gIEBzaW5nbGV0b246ID0+XG4gICAgQG9wdGlvbiB8fD0gbmV3IFZpbU9wdGlvblxuXG4gIGxpc3Q6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZWRpdG9yLnNob3dJbnZpc2libGVzXCIsIHRydWUpXG5cbiAgbm9saXN0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93SW52aXNpYmxlc1wiLCBmYWxzZSlcblxuICBudW1iZXI6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZWRpdG9yLnNob3dMaW5lTnVtYmVyc1wiLCB0cnVlKVxuXG4gIG51OiA9PlxuICAgIEBudW1iZXIoKVxuXG4gIG5vbnVtYmVyOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93TGluZU51bWJlcnNcIiwgZmFsc2UpXG5cbiAgbm9udTogPT5cbiAgICBAbm9udW1iZXIoKVxuXG4gIHNwbGl0cmlnaHQ6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdHJpZ2h0XCIsIHRydWUpXG5cbiAgc3ByOiA9PlxuICAgIEBzcGxpdHJpZ2h0KClcblxuICBub3NwbGl0cmlnaHQ6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdHJpZ2h0XCIsIGZhbHNlKVxuXG4gIG5vc3ByOiA9PlxuICAgIEBub3NwbGl0cmlnaHQoKVxuXG4gIHNwbGl0YmVsb3c6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdGJlbG93XCIsIHRydWUpXG5cbiAgc2I6ID0+XG4gICAgQHNwbGl0YmVsb3coKVxuXG4gIG5vc3BsaXRiZWxvdzogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJleC1tb2RlLnNwbGl0YmVsb3dcIiwgZmFsc2UpXG5cbiAgbm9zYjogPT5cbiAgICBAbm9zcGxpdGJlbG93KClcblxuICBzbWFydGNhc2U6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwidmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoXCIsIHRydWUpXG5cbiAgc2NzOiA9PlxuICAgIEBzbWFydGNhc2UoKVxuXG4gIG5vc21hcnRjYXNlOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcInZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaFwiLCBmYWxzZSlcblxuICBub3NjczogPT5cbiAgICBAbm9zbWFydGNhc2UoKVxuXG4gIGdkZWZhdWx0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuZ2RlZmF1bHRcIiwgdHJ1ZSlcblxuICBub2dkZWZhdWx0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuZ2RlZmF1bHRcIiwgZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0gVmltT3B0aW9uXG4iXX0=
