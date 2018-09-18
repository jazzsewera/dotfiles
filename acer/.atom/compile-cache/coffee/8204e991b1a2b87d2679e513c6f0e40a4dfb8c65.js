(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe("dirty work for fast package activation", function() {
    var ensureRequiredFiles, withCleanActivation;
    withCleanActivation = null;
    ensureRequiredFiles = null;
    beforeEach(function() {
      return runs(function() {
        var cleanRequireCache, getRequiredLibOrNodeModulePaths, packPath;
        packPath = atom.packages.loadPackage('vim-mode-plus').path;
        getRequiredLibOrNodeModulePaths = function() {
          return Object.keys(require.cache).filter(function(p) {
            return p.startsWith(packPath + 'lib') || p.startsWith(packPath + 'node_modules');
          });
        };
        cleanRequireCache = function() {
          var oldPaths, savedCache;
          savedCache = {};
          oldPaths = getRequiredLibOrNodeModulePaths();
          oldPaths.forEach(function(p) {
            savedCache[p] = require.cache[p];
            return delete require.cache[p];
          });
          return function() {
            oldPaths.forEach(function(p) {
              return require.cache[p] = savedCache[p];
            });
            return getRequiredLibOrNodeModulePaths().forEach(function(p) {
              if (indexOf.call(oldPaths, p) < 0) {
                return delete require.cache[p];
              }
            });
          };
        };
        withCleanActivation = function(fn) {
          var restoreRequireCache;
          restoreRequireCache = null;
          runs(function() {
            return restoreRequireCache = cleanRequireCache();
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('vim-mode-plus').then(fn);
          });
          return runs(function() {
            return restoreRequireCache();
          });
        };
        return ensureRequiredFiles = function(files) {
          var should;
          should = files.map(function(file) {
            return packPath + file;
          });
          return expect(getRequiredLibOrNodeModulePaths()).toEqual(should);
        };
      });
    });
    describe("requrie as minimum num of file as possible on startup", function() {
      var shouldRequireFilesInOrdered;
      shouldRequireFilesInOrdered = null;
      beforeEach(function() {
        shouldRequireFilesInOrdered = ["lib/main.js", "lib/settings.js", "lib/vim-state.js", "lib/json/command-table.json"];
        if (atom.inDevMode()) {
          return shouldRequireFilesInOrdered.push('lib/developer.js');
        }
      });
      it("THIS IS WORKAROUND FOR Travis-CI's", function() {
        return withCleanActivation(function() {
          return null;
        });
      });
      it("require minimum set of files", function() {
        return withCleanActivation(function() {
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
      it("[one editor opened] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open();
          });
          return runs(function() {
            var files;
            files = shouldRequireFilesInOrdered.concat('lib/status-bar-manager.js');
            return ensureRequiredFiles(files);
          });
        });
      });
      it("[after motion executed] require minimum set of files", function() {
        return withCleanActivation(function() {
          waitsForPromise(function() {
            return atom.workspace.open().then(function(e) {
              return atom.commands.dispatch(e.element, 'vim-mode-plus:move-right');
            });
          });
          return runs(function() {
            var extraShouldRequireFilesInOrdered, files;
            extraShouldRequireFilesInOrdered = ["lib/status-bar-manager.js", "lib/operation-stack.js", "lib/base.js", "lib/json/file-table.json", "lib/motion.js", "lib/utils.js", "lib/cursor-style-manager.js"];
            files = shouldRequireFilesInOrdered.concat(extraShouldRequireFilesInOrdered);
            return ensureRequiredFiles(files);
          });
        });
      });
      it("just referencing service function doesn't load base.js", function() {
        return withCleanActivation(function(pack) {
          var i, key, len, ref, service;
          service = pack.mainModule.provideVimModePlus();
          ref = Object.keys(service);
          for (i = 0, len = ref.length; i < len; i++) {
            key = ref[i];
            service.key;
          }
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
      it("calling service.getClass load base.js", function() {
        return withCleanActivation(function(pack) {
          var extraShouldRequireFilesInOrdered, service;
          service = pack.mainModule.provideVimModePlus();
          service.getClass("MoveRight");
          extraShouldRequireFilesInOrdered = ["lib/base.js", "lib/json/file-table.json", "lib/motion.js"];
          return ensureRequiredFiles(shouldRequireFilesInOrdered.concat(extraShouldRequireFilesInOrdered));
        });
      });
      return it("calling service.registerCommandFromSpec doesn't load base.js", function() {
        return withCleanActivation(function(pack) {
          var service;
          service = pack.mainModule.provideVimModePlus();
          service.registerCommandFromSpec("SampleCommand", {
            prefix: 'vim-mode-plus-user',
            getClass: function() {
              return "SampleCommand";
            }
          });
          return ensureRequiredFiles(shouldRequireFilesInOrdered);
        });
      });
    });
    return describe("command-table", function() {
      describe("initial classRegistry", function() {
        return it("is empty", function() {
          return withCleanActivation(function(pack) {
            var Base;
            Base = require('../lib/base');
            return expect(Base.classByName.size).toBe(0);
          });
        });
      });
      describe("fully populated Base.classByName", function() {
        return it("Base.getClass(motionClass) populate class table for all members belonging to same file(motions)", function() {
          return withCleanActivation(function(pack) {
            var Base, fileTable;
            Base = require('../lib/base');
            expect(Base.classByName.size).toBe(0);
            Base.getClass("MoveRight");
            fileTable = require("../lib/json/file-table.json");
            expect(fileTable["./motion"].length).toBe(Base.classByName.size);
            return expect(Base.classByName.size > 0).toBe(true);
          });
        });
      });
      return describe("make sure command-table and file-table is NOT out-of-date", function() {
        return it("buildCommandTable return table which is equals to initially loaded command table", function() {
          return withCleanActivation(function(pack) {
            var Base, commandTable, developer, fileTable, oldCommandTable, oldFileTable, ref;
            Base = require('../lib/base');
            oldCommandTable = require("../lib/json/command-table.json");
            oldFileTable = require("../lib/json/file-table.json");
            developer = require("../lib/developer");
            ref = developer.buildCommandTableAndFileTable(), commandTable = ref.commandTable, fileTable = ref.fileTable;
            expect(oldCommandTable).not.toBe(commandTable);
            expect(oldCommandTable).toEqual(commandTable);
            expect(oldFileTable).not.toBe(fileTable);
            return expect(oldFileTable).toEqual(fileTable);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvZmFzdC1hY3RpdmF0aW9uLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWtCQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxDQUFTLHdDQUFULEVBQW1ELFNBQUE7QUFDakQsUUFBQTtJQUFBLG1CQUFBLEdBQXNCO0lBQ3RCLG1CQUFBLEdBQXNCO0lBRXRCLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsSUFBQSxDQUFLLFNBQUE7QUFDSCxZQUFBO1FBQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBZCxDQUEwQixlQUExQixDQUEwQyxDQUFDO1FBRXRELCtCQUFBLEdBQWtDLFNBQUE7aUJBQ2hDLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLEtBQXBCLENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsU0FBQyxDQUFEO21CQUNoQyxDQUFDLENBQUMsVUFBRixDQUFhLFFBQUEsR0FBVyxLQUF4QixDQUFBLElBQWtDLENBQUMsQ0FBQyxVQUFGLENBQWEsUUFBQSxHQUFXLGNBQXhCO1VBREYsQ0FBbEM7UUFEZ0M7UUFLbEMsaUJBQUEsR0FBb0IsU0FBQTtBQUNsQixjQUFBO1VBQUEsVUFBQSxHQUFhO1VBQ2IsUUFBQSxHQUFXLCtCQUFBLENBQUE7VUFDWCxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFDLENBQUQ7WUFDZixVQUFXLENBQUEsQ0FBQSxDQUFYLEdBQWdCLE9BQU8sQ0FBQyxLQUFNLENBQUEsQ0FBQTttQkFDOUIsT0FBTyxPQUFPLENBQUMsS0FBTSxDQUFBLENBQUE7VUFGTixDQUFqQjtBQUlBLGlCQUFPLFNBQUE7WUFDTCxRQUFRLENBQUMsT0FBVCxDQUFpQixTQUFDLENBQUQ7cUJBQ2YsT0FBTyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQWQsR0FBbUIsVUFBVyxDQUFBLENBQUE7WUFEZixDQUFqQjtt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QUQsRUFBZTtZQUVmLE1BQUEsQ0FBTyxlQUFQLENBQXVCLENBQUMsR0FBRyxDQUFDLElBQTVCLENBQWlDLFlBQWpDO1lBQ0EsTUFBQSxDQUFPLGVBQVAsQ0FBdUIsQ0FBQyxPQUF4QixDQUFnQyxZQUFoQztZQUVBLE1BQUEsQ0FBTyxZQUFQLENBQW9CLENBQUMsR0FBRyxDQUFDLElBQXpCLENBQThCLFNBQTlCO21CQUNBLE1BQUEsQ0FBTyxZQUFQLENBQW9CLENBQUMsT0FBckIsQ0FBNkIsU0FBN0I7VUFaa0IsQ0FBcEI7UUFEcUYsQ0FBdkY7TUFEb0UsQ0FBdEU7SUF2QndCLENBQTFCO0VBMUhpRCxDQUFuRDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyBbREFOR0VSXVxuIyBXaGF0IEknbSBkb2luZyBpbiB0aGlzIHRlc3Qtc3BlYyBpcyBTVVBFUiBoYWNreSwgYW5kIEkgZG9uJ3QgbGlrZSB0aGlzLlxuI1xuIyAtIFdoYXQgSSdtIGRvaW5nIGFuZCB3aHlcbiMgIC0gSW52YWxpZGF0ZSByZXF1aXJlLmNhY2hlIHRvIFwib2JzZXJ2ZSByZXF1aXJlZCBmaWxlIG9uIHN0YXJ0dXBcIi5cbiMgIC0gVGhlbiByZXN0b3JlIHJlcXVpcmUuY2FjaGUgdG8gb3JpZ2luYWwgc3RhdGUuXG4jXG4jIC0gSnVzdCBpbnZhbGlkYXRpbmcgaXMgbm90IGVub3VnaCB1bmxlc3MgcmVzdG9yZWluZyBvdGhlciBzcGVjIGZpbGUgZmFpbC5cbiNcbiMgLSBXaGF0IGhhcHBlbnMganVzdCBpbnZhbGlkYXRlIHJlcXVpcmUuY2FjaGUgYW5kIE5PVCByZXN0b3JlZCB0byBvcmlnaW5hbCByZXF1aXJlLmNhY2hlP1xuIyAgLSBGb3IgbW9kdWxlIHN1Y2ggbGlrZSBgZ2xvYmxhbC1zdGF0ZS5jb2ZmZWVgIGl0IGluc3RhbnRpYXRlZCBhdCByZXF1aXJlZCB0aW1lLlxuIyAgLSBJbnZhbGlkYXRpbmcgcmVxdWlyZS5jYWNoZSBmb3IgYGdsb2JhbC1zdGF0ZS5jb2ZmZWVgIG1lYW5zLCBpdCdzIHJlbG9hZGVkIGFnYWluLlxuIyAgLSBUaGlzIDJuZCByZWxvYWQgcmV0dXJuIERJRkZFUkVOVCBnbG9iYWxTdGF0ZSBpbnN0YW5jZS5cbiMgIC0gU28gZ2xvYmFsU3RhdGUgaXMgbm93IG5vIGxvbmdlciBnbG9iYWxseSByZWZlcmVuY2luZyBzYW1lIHNhbWUgb2JqZWN0LCBpdCdzIGJyb2tlbi5cbiMgIC0gVGhpcyBzaXR1YXRpb24gaXMgY2F1c2VkIGJ5IGV4cGxpY2l0IGNhY2hlIGludmFsaWRhdGlvbiBhbmQgbm90IGhhcHBlbiBpbiByZWFsIHVzYWdlLlxuI1xuIyAtIEkga25vdyB0aGlzIHNwZWMgaXMgc3RpbGwgc3VwZXIgaGFja3kgYW5kIEkgd2FudCB0byBmaW5kIHNhZmVyIHdheS5cbiMgIC0gQnV0IEkgbmVlZCB0aGlzIHNwZWMgdG8gZGV0ZWN0IHVud2FudGVkIGZpbGUgaXMgcmVxdWlyZWQgYXQgc3RhcnR1cCggdm1wIGdldCBzbG93ZXIgc3RhcnR1cCApLlxuZGVzY3JpYmUgXCJkaXJ0eSB3b3JrIGZvciBmYXN0IHBhY2thZ2UgYWN0aXZhdGlvblwiLCAtPlxuICB3aXRoQ2xlYW5BY3RpdmF0aW9uID0gbnVsbFxuICBlbnN1cmVSZXF1aXJlZEZpbGVzID0gbnVsbFxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBydW5zIC0+XG4gICAgICBwYWNrUGF0aCA9IGF0b20ucGFja2FnZXMubG9hZFBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5wYXRoXG5cbiAgICAgIGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMgPSAtPlxuICAgICAgICBPYmplY3Qua2V5cyhyZXF1aXJlLmNhY2hlKS5maWx0ZXIgKHApIC0+XG4gICAgICAgICAgcC5zdGFydHNXaXRoKHBhY2tQYXRoICsgJ2xpYicpIG9yIHAuc3RhcnRzV2l0aChwYWNrUGF0aCArICdub2RlX21vZHVsZXMnKVxuXG4gICAgICAjIFJldHVybiBmdW5jdGlvbiB0byByZXN0b3JlIG9yaWdpbmFsIHJlcXVpcmUuY2FjaGUgb2YgaW50ZXJlc3RcbiAgICAgIGNsZWFuUmVxdWlyZUNhY2hlID0gLT5cbiAgICAgICAgc2F2ZWRDYWNoZSA9IHt9XG4gICAgICAgIG9sZFBhdGhzID0gZ2V0UmVxdWlyZWRMaWJPck5vZGVNb2R1bGVQYXRocygpXG4gICAgICAgIG9sZFBhdGhzLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgc2F2ZWRDYWNoZVtwXSA9IHJlcXVpcmUuY2FjaGVbcF1cbiAgICAgICAgICBkZWxldGUgcmVxdWlyZS5jYWNoZVtwXVxuXG4gICAgICAgIHJldHVybiAtPlxuICAgICAgICAgIG9sZFBhdGhzLmZvckVhY2ggKHApIC0+XG4gICAgICAgICAgICByZXF1aXJlLmNhY2hlW3BdID0gc2F2ZWRDYWNoZVtwXVxuICAgICAgICAgIGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMoKS5mb3JFYWNoIChwKSAtPlxuICAgICAgICAgICAgaWYgcCBub3QgaW4gb2xkUGF0aHNcbiAgICAgICAgICAgICAgZGVsZXRlIHJlcXVpcmUuY2FjaGVbcF1cblxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiA9IChmbikgLT5cbiAgICAgICAgcmVzdG9yZVJlcXVpcmVDYWNoZSA9IG51bGxcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHJlc3RvcmVSZXF1aXJlQ2FjaGUgPSBjbGVhblJlcXVpcmVDYWNoZSgpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykudGhlbihmbilcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHJlc3RvcmVSZXF1aXJlQ2FjaGUoKVxuXG4gICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzID0gKGZpbGVzKSAtPlxuICAgICAgICBzaG91bGQgPSBmaWxlcy5tYXAoKGZpbGUpIC0+IHBhY2tQYXRoICsgZmlsZSlcblxuICAgICAgICAjIGNvbnNvbGUubG9nIFwiIyBzaG91bGRcIiwgc2hvdWxkLmpvaW4oXCJcXG5cIilcbiAgICAgICAgIyBjb25zb2xlLmxvZyBcIiMgYWN0dWFsXCIsIGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMoKS5qb2luKFwiXFxuXCIpXG5cbiAgICAgICAgZXhwZWN0KGdldFJlcXVpcmVkTGliT3JOb2RlTW9kdWxlUGF0aHMoKSkudG9FcXVhbChzaG91bGQpXG5cbiAgIyAqIFRvIHJlZHVjZSBJTyBhbmQgY29tcGlsZS1ldmFsdWF0aW9uIG9mIGpzIGZpbGUgb24gc3RhcnR1cFxuICBkZXNjcmliZSBcInJlcXVyaWUgYXMgbWluaW11bSBudW0gb2YgZmlsZSBhcyBwb3NzaWJsZSBvbiBzdGFydHVwXCIsIC0+XG4gICAgc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkID0gW1xuICAgICAgICBcImxpYi9tYWluLmpzXCJcbiAgICAgICAgXCJsaWIvc2V0dGluZ3MuanNcIlxuICAgICAgICBcImxpYi92aW0tc3RhdGUuanNcIlxuICAgICAgICBcImxpYi9qc29uL2NvbW1hbmQtdGFibGUuanNvblwiXG4gICAgICBdXG4gICAgICBpZiBhdG9tLmluRGV2TW9kZSgpXG4gICAgICAgIHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZC5wdXNoKCdsaWIvZGV2ZWxvcGVyLmpzJylcblxuICAgIGl0IFwiVEhJUyBJUyBXT1JLQVJPVU5EIEZPUiBUcmF2aXMtQ0knc1wiLCAtPlxuICAgICAgIyBIQUNLOlxuICAgICAgIyBBZnRlciB2ZXJ5IGZpcnN0IGNhbGwgb2YgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKVxuICAgICAgIyByZXF1aXJlLmNhY2hlIGlzIE5PVCBwb3B1bGF0ZWQgeWV0IG9uIFRyYXZpcy1DSS5cbiAgICAgICMgSXQgZG9lc24ndCBpbmNsdWRlIGxpYi9tYWluLmNvZmZlZSggdGhpcyBpcyBvZGQgc3RhdGUhICkuXG4gICAgICAjIFRoaXMgb25seSBoYXBwZW5zIGluIHZlcnkgZmlyc3QgYWN0aXZhdGlvbi5cbiAgICAgICMgU28gcHV0aW5nIGhlcmUgdXNlbGVzcyB0ZXN0IGp1c3QgYWN0aXZhdGUgcGFja2FnZSBjYW4gYmUgd29ya2Fyb3VuZC5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgbnVsbFxuXG4gICAgaXQgXCJyZXF1aXJlIG1pbmltdW0gc2V0IG9mIGZpbGVzXCIsIC0+XG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIC0+XG4gICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkKVxuXG4gICAgaXQgXCJbb25lIGVkaXRvciBvcGVuZWRdIHJlcXVpcmUgbWluaW11bSBzZXQgb2YgZmlsZXNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBmaWxlcyA9IHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZC5jb25jYXQoJ2xpYi9zdGF0dXMtYmFyLW1hbmFnZXIuanMnKVxuICAgICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoZmlsZXMpXG5cbiAgICBpdCBcIlthZnRlciBtb3Rpb24gZXhlY3V0ZWRdIHJlcXVpcmUgbWluaW11bSBzZXQgb2YgZmlsZXNcIiwgLT5cbiAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gKGUpIC0+XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGUuZWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6bW92ZS1yaWdodCcpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHRyYVNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZCA9IFtcbiAgICAgICAgICAgIFwibGliL3N0YXR1cy1iYXItbWFuYWdlci5qc1wiXG4gICAgICAgICAgICBcImxpYi9vcGVyYXRpb24tc3RhY2suanNcIlxuICAgICAgICAgICAgXCJsaWIvYmFzZS5qc1wiXG4gICAgICAgICAgICBcImxpYi9qc29uL2ZpbGUtdGFibGUuanNvblwiXG4gICAgICAgICAgICBcImxpYi9tb3Rpb24uanNcIlxuICAgICAgICAgICAgXCJsaWIvdXRpbHMuanNcIlxuICAgICAgICAgICAgXCJsaWIvY3Vyc29yLXN0eWxlLW1hbmFnZXIuanNcIlxuICAgICAgICAgIF1cbiAgICAgICAgICBmaWxlcyA9IHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZC5jb25jYXQoZXh0cmFTaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQpXG4gICAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhmaWxlcylcblxuICAgIGl0IFwianVzdCByZWZlcmVuY2luZyBzZXJ2aWNlIGZ1bmN0aW9uIGRvZXNuJ3QgbG9hZCBiYXNlLmpzXCIsIC0+XG4gICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICBzZXJ2aWNlID0gcGFjay5tYWluTW9kdWxlLnByb3ZpZGVWaW1Nb2RlUGx1cygpXG4gICAgICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMoc2VydmljZSlcbiAgICAgICAgICBzZXJ2aWNlLmtleVxuICAgICAgICBlbnN1cmVSZXF1aXJlZEZpbGVzKHNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZClcblxuICAgIGl0IFwiY2FsbGluZyBzZXJ2aWNlLmdldENsYXNzIGxvYWQgYmFzZS5qc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAocGFjaykgLT5cbiAgICAgICAgc2VydmljZSA9IHBhY2subWFpbk1vZHVsZS5wcm92aWRlVmltTW9kZVBsdXMoKVxuICAgICAgICBzZXJ2aWNlLmdldENsYXNzKFwiTW92ZVJpZ2h0XCIpXG4gICAgICAgIGV4dHJhU2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkID0gW1xuICAgICAgICAgIFwibGliL2Jhc2UuanNcIlxuICAgICAgICAgIFwibGliL2pzb24vZmlsZS10YWJsZS5qc29uXCJcbiAgICAgICAgICBcImxpYi9tb3Rpb24uanNcIlxuICAgICAgICBdXG4gICAgICAgIGVuc3VyZVJlcXVpcmVkRmlsZXMoc2hvdWxkUmVxdWlyZUZpbGVzSW5PcmRlcmVkLmNvbmNhdChleHRyYVNob3VsZFJlcXVpcmVGaWxlc0luT3JkZXJlZCkpXG5cbiAgICBpdCBcImNhbGxpbmcgc2VydmljZS5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyBkb2Vzbid0IGxvYWQgYmFzZS5qc1wiLCAtPlxuICAgICAgd2l0aENsZWFuQWN0aXZhdGlvbiAocGFjaykgLT5cbiAgICAgICAgc2VydmljZSA9IHBhY2subWFpbk1vZHVsZS5wcm92aWRlVmltTW9kZVBsdXMoKVxuICAgICAgICBzZXJ2aWNlLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKFwiU2FtcGxlQ29tbWFuZFwiLCB7cHJlZml4OiAndmltLW1vZGUtcGx1cy11c2VyJywgZ2V0Q2xhc3M6IC0+IFwiU2FtcGxlQ29tbWFuZFwifSlcbiAgICAgICAgZW5zdXJlUmVxdWlyZWRGaWxlcyhzaG91bGRSZXF1aXJlRmlsZXNJbk9yZGVyZWQpXG5cbiAgZGVzY3JpYmUgXCJjb21tYW5kLXRhYmxlXCIsIC0+XG4gICAgIyAqIExvYWRpbmcgYXRvbSBjb21tYW5kcyBmcm9tIHByZS1nZW5lcmF0ZWQgY29tbWFuZC10YWJsZS5cbiAgICAjICogV2h5P1xuICAgICMgIHZtcCBhZGRzIGFib3V0IDMwMCBjbWRzLCB3aGljaCBpcyBodWdlLCBkeW5hbWljYWxseSBjYWxjdWxhdGluZyBhbmQgcmVnaXN0ZXIgY21kc1xuICAgICMgIHRvb2sgdmVyeSBsb25nIHRpbWUuXG4gICAgIyAgU28gY2FsY2x1YXRlIG5vbi1keW5hbWljIHBhciB0aGVuIHNhdmUgdG8gY29tbWFuZC10YWJsZS5jb2ZmZSBhbmQgbG9hZCBpbiBvbiBzdGFydHVwLlxuICAgICMgIFdoZW4gY29tbWFuZCBhcmUgZXhlY3V0ZWQsIG5lY2Vzc2FyeSBjb21tYW5kIGNsYXNzIGZpbGUgaXMgbGF6eS1yZXF1aXJlZC5cbiAgICBkZXNjcmliZSBcImluaXRpYWwgY2xhc3NSZWdpc3RyeVwiLCAtPlxuICAgICAgaXQgXCJpcyBlbXB0eVwiLCAtPlxuICAgICAgICB3aXRoQ2xlYW5BY3RpdmF0aW9uIChwYWNrKSAtPlxuICAgICAgICAgIEJhc2UgPSByZXF1aXJlICcuLi9saWIvYmFzZSdcbiAgICAgICAgICBleHBlY3QoQmFzZS5jbGFzc0J5TmFtZS5zaXplKS50b0JlKDApXG5cbiAgICBkZXNjcmliZSBcImZ1bGx5IHBvcHVsYXRlZCBCYXNlLmNsYXNzQnlOYW1lXCIsIC0+XG4gICAgICBpdCBcIkJhc2UuZ2V0Q2xhc3MobW90aW9uQ2xhc3MpIHBvcHVsYXRlIGNsYXNzIHRhYmxlIGZvciBhbGwgbWVtYmVycyBiZWxvbmdpbmcgdG8gc2FtZSBmaWxlKG1vdGlvbnMpXCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHJlcXVpcmUgJy4uL2xpYi9iYXNlJ1xuICAgICAgICAgIGV4cGVjdChCYXNlLmNsYXNzQnlOYW1lLnNpemUpLnRvQmUoMClcbiAgICAgICAgICBCYXNlLmdldENsYXNzKFwiTW92ZVJpZ2h0XCIpXG4gICAgICAgICAgZmlsZVRhYmxlID0gcmVxdWlyZShcIi4uL2xpYi9qc29uL2ZpbGUtdGFibGUuanNvblwiKVxuICAgICAgICAgIGV4cGVjdChmaWxlVGFibGVbXCIuL21vdGlvblwiXS5sZW5ndGgpLnRvQmUoQmFzZS5jbGFzc0J5TmFtZS5zaXplKVxuICAgICAgICAgIGV4cGVjdChCYXNlLmNsYXNzQnlOYW1lLnNpemUgPiAwKS50b0JlIHRydWVcblxuICAgIGRlc2NyaWJlIFwibWFrZSBzdXJlIGNvbW1hbmQtdGFibGUgYW5kIGZpbGUtdGFibGUgaXMgTk9UIG91dC1vZi1kYXRlXCIsIC0+XG4gICAgICBpdCBcImJ1aWxkQ29tbWFuZFRhYmxlIHJldHVybiB0YWJsZSB3aGljaCBpcyBlcXVhbHMgdG8gaW5pdGlhbGx5IGxvYWRlZCBjb21tYW5kIHRhYmxlXCIsIC0+XG4gICAgICAgIHdpdGhDbGVhbkFjdGl2YXRpb24gKHBhY2spIC0+XG4gICAgICAgICAgQmFzZSA9IHJlcXVpcmUgJy4uL2xpYi9iYXNlJ1xuICAgICAgICAgIG9sZENvbW1hbmRUYWJsZSA9IHJlcXVpcmUoXCIuLi9saWIvanNvbi9jb21tYW5kLXRhYmxlLmpzb25cIilcbiAgICAgICAgICBvbGRGaWxlVGFibGUgPSByZXF1aXJlKFwiLi4vbGliL2pzb24vZmlsZS10YWJsZS5qc29uXCIpXG5cbiAgICAgICAgICBkZXZlbG9wZXIgPSByZXF1aXJlIFwiLi4vbGliL2RldmVsb3BlclwiXG4gICAgICAgICAge2NvbW1hbmRUYWJsZSwgZmlsZVRhYmxlfSA9IGRldmVsb3Blci5idWlsZENvbW1hbmRUYWJsZUFuZEZpbGVUYWJsZSgpXG5cbiAgICAgICAgICBleHBlY3Qob2xkQ29tbWFuZFRhYmxlKS5ub3QudG9CZShjb21tYW5kVGFibGUpXG4gICAgICAgICAgZXhwZWN0KG9sZENvbW1hbmRUYWJsZSkudG9FcXVhbChjb21tYW5kVGFibGUpXG5cbiAgICAgICAgICBleHBlY3Qob2xkRmlsZVRhYmxlKS5ub3QudG9CZShmaWxlVGFibGUpXG4gICAgICAgICAgZXhwZWN0KG9sZEZpbGVUYWJsZSkudG9FcXVhbChmaWxlVGFibGUpXG4iXX0=
