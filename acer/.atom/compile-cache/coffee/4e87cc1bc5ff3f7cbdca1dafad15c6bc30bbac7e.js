(function() {
  var AutoComplete, Ex, fs, os, path;

  fs = require('fs');

  path = require('path');

  os = require('os');

  Ex = require('./ex');

  module.exports = AutoComplete = (function() {
    function AutoComplete(commands) {
      this.commands = commands;
      this.resetCompletion();
    }

    AutoComplete.prototype.resetCompletion = function() {
      this.autoCompleteIndex = 0;
      this.autoCompleteText = null;
      return this.completions = [];
    };

    AutoComplete.prototype.expandTilde = function(filePath) {
      if (filePath.charAt(0) === '~') {
        return os.homedir() + filePath.slice(1);
      } else {
        return filePath;
      }
    };

    AutoComplete.prototype.getAutocomplete = function(text) {
      var cmd, filePath, parts;
      if (!this.autoCompleteText) {
        this.autoCompleteText = text;
      }
      parts = this.autoCompleteText.split(' ');
      cmd = parts[0];
      if (parts.length > 1) {
        filePath = parts.slice(1).join(' ');
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getFilePathCompletion(cmd, filePath);
          };
        })(this));
      } else {
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getCommandCompletion(cmd);
          };
        })(this));
      }
    };

    AutoComplete.prototype.filterByPrefix = function(commands, prefix) {
      return commands.sort().filter((function(_this) {
        return function(f) {
          return f.startsWith(prefix);
        };
      })(this));
    };

    AutoComplete.prototype.getCompletion = function(completeFunc) {
      var complete;
      if (this.completions.length === 0) {
        this.completions = completeFunc();
      }
      complete = '';
      if (this.completions.length) {
        complete = this.completions[this.autoCompleteIndex % this.completions.length];
        this.autoCompleteIndex++;
        if (complete.endsWith('/') && this.completions.length === 1) {
          this.resetCompletion();
        }
      }
      return complete;
    };

    AutoComplete.prototype.getCommandCompletion = function(command) {
      return this.filterByPrefix(this.commands, command);
    };

    AutoComplete.prototype.getFilePathCompletion = function(command, filePath) {
      var baseName, basePath, basePathStat, err, files;
      filePath = this.expandTilde(filePath);
      if (filePath.endsWith(path.sep)) {
        basePath = path.dirname(filePath + '.');
        baseName = '';
      } else {
        basePath = path.dirname(filePath);
        baseName = path.basename(filePath);
      }
      try {
        basePathStat = fs.statSync(basePath);
        if (basePathStat.isDirectory()) {
          files = fs.readdirSync(basePath);
          return this.filterByPrefix(files, baseName).map((function(_this) {
            return function(f) {
              filePath = path.join(basePath, f);
              if (fs.lstatSync(filePath).isDirectory()) {
                return command + ' ' + filePath + path.sep;
              } else {
                return command + ' ' + filePath;
              }
            };
          })(this));
        }
        return [];
      } catch (error) {
        err = error;
        return [];
      }
    };

    return AutoComplete;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9hdXRvY29tcGxldGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLE1BQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHNCQUFDLFFBQUQ7TUFDWCxJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLGVBQUQsQ0FBQTtJQUZXOzsyQkFJYixlQUFBLEdBQWlCLFNBQUE7TUFDZixJQUFDLENBQUEsaUJBQUQsR0FBcUI7TUFDckIsSUFBQyxDQUFBLGdCQUFELEdBQW9CO2FBQ3BCLElBQUMsQ0FBQSxXQUFELEdBQWU7SUFIQTs7MkJBS2pCLFdBQUEsR0FBYSxTQUFDLFFBQUQ7TUFDWCxJQUFHLFFBQVEsQ0FBQyxNQUFULENBQWdCLENBQWhCLENBQUEsS0FBc0IsR0FBekI7QUFDRSxlQUFPLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBQSxHQUFlLFFBQVEsQ0FBQyxLQUFULENBQWUsQ0FBZixFQUR4QjtPQUFBLE1BQUE7QUFHRSxlQUFPLFNBSFQ7O0lBRFc7OzJCQU1iLGVBQUEsR0FBaUIsU0FBQyxJQUFEO0FBQ2YsVUFBQTtNQUFBLElBQUcsQ0FBQyxJQUFDLENBQUEsZ0JBQUw7UUFDRSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsS0FEdEI7O01BR0EsS0FBQSxHQUFRLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxLQUFsQixDQUF3QixHQUF4QjtNQUNSLEdBQUEsR0FBTSxLQUFNLENBQUEsQ0FBQTtNQUVaLElBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFsQjtRQUNFLFFBQUEsR0FB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O1lBRjBDO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQyxFQUZUOztBQVNBLGVBQU8sR0FYVDtPQUFBLGFBQUE7UUFZTTtBQUNKLGVBQU8sR0FiVDs7SUFWbUI7Ozs7O0FBeER6QiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbm9zID0gcmVxdWlyZSAnb3MnXG5FeCA9IHJlcXVpcmUgJy4vZXgnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEF1dG9Db21wbGV0ZVxuICBjb25zdHJ1Y3RvcjogKGNvbW1hbmRzKSAtPlxuICAgIEBjb21tYW5kcyA9IGNvbW1hbmRzXG4gICAgQHJlc2V0Q29tcGxldGlvbigpXG5cbiAgcmVzZXRDb21wbGV0aW9uOiAoKSAtPlxuICAgIEBhdXRvQ29tcGxldGVJbmRleCA9IDBcbiAgICBAYXV0b0NvbXBsZXRlVGV4dCA9IG51bGxcbiAgICBAY29tcGxldGlvbnMgPSBbXVxuXG4gIGV4cGFuZFRpbGRlOiAoZmlsZVBhdGgpIC0+XG4gICAgaWYgZmlsZVBhdGguY2hhckF0KDApID09ICd+J1xuICAgICAgcmV0dXJuIG9zLmhvbWVkaXIoKSArIGZpbGVQYXRoLnNsaWNlKDEpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZpbGVQYXRoXG5cbiAgZ2V0QXV0b2NvbXBsZXRlOiAodGV4dCkgLT5cbiAgICBpZiAhQGF1dG9Db21wbGV0ZVRleHRcbiAgICAgIEBhdXRvQ29tcGxldGVUZXh0ID0gdGV4dFxuXG4gICAgcGFydHMgPSBAYXV0b0NvbXBsZXRlVGV4dC5zcGxpdCgnICcpXG4gICAgY21kID0gcGFydHNbMF1cblxuICAgIGlmIHBhcnRzLmxlbmd0aCA+IDFcbiAgICAgIGZpbGVQYXRoID0gcGFydHMuc2xpY2UoMSkuam9pbignICcpXG4gICAgICByZXR1cm4gQGdldENvbXBsZXRpb24oKCkgPT4gQGdldEZpbGVQYXRoQ29tcGxldGlvbihjbWQsIGZpbGVQYXRoKSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gQGdldENvbXBsZXRpb24oKCkgPT4gQGdldENvbW1hbmRDb21wbGV0aW9uKGNtZCkpXG5cbiAgZmlsdGVyQnlQcmVmaXg6IChjb21tYW5kcywgcHJlZml4KSAtPlxuICAgIGNvbW1hbmRzLnNvcnQoKS5maWx0ZXIoKGYpID0+IGYuc3RhcnRzV2l0aChwcmVmaXgpKVxuXG4gIGdldENvbXBsZXRpb246IChjb21wbGV0ZUZ1bmMpIC0+XG4gICAgaWYgQGNvbXBsZXRpb25zLmxlbmd0aCA9PSAwXG4gICAgICBAY29tcGxldGlvbnMgPSBjb21wbGV0ZUZ1bmMoKVxuXG4gICAgY29tcGxldGUgPSAnJ1xuICAgIGlmIEBjb21wbGV0aW9ucy5sZW5ndGhcbiAgICAgIGNvbXBsZXRlID0gQGNvbXBsZXRpb25zW0BhdXRvQ29tcGxldGVJbmRleCAlIEBjb21wbGV0aW9ucy5sZW5ndGhdXG4gICAgICBAYXV0b0NvbXBsZXRlSW5kZXgrK1xuXG4gICAgICAjIE9ubHkgb25lIHJlc3VsdCBzbyBsZXRzIHJldHVybiB0aGlzIGRpcmVjdG9yeVxuICAgICAgaWYgY29tcGxldGUuZW5kc1dpdGgoJy8nKSAmJiBAY29tcGxldGlvbnMubGVuZ3RoID09IDFcbiAgICAgICAgQHJlc2V0Q29tcGxldGlvbigpXG5cbiAgICByZXR1cm4gY29tcGxldGVcblxuICBnZXRDb21tYW5kQ29tcGxldGlvbjogKGNvbW1hbmQpIC0+XG4gICAgcmV0dXJuIEBmaWx0ZXJCeVByZWZpeChAY29tbWFuZHMsIGNvbW1hbmQpXG5cbiAgZ2V0RmlsZVBhdGhDb21wbGV0aW9uOiAoY29tbWFuZCwgZmlsZVBhdGgpIC0+XG4gICAgICBmaWxlUGF0aCA9IEBleHBhbmRUaWxkZShmaWxlUGF0aClcblxuICAgICAgaWYgZmlsZVBhdGguZW5kc1dpdGgocGF0aC5zZXApXG4gICAgICAgIGJhc2VQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoICsgJy4nKVxuICAgICAgICBiYXNlTmFtZSA9ICcnXG4gICAgICBlbHNlXG4gICAgICAgIGJhc2VQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgICAgICBiYXNlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG5cbiAgICAgIHRyeVxuICAgICAgICBiYXNlUGF0aFN0YXQgPSBmcy5zdGF0U3luYyhiYXNlUGF0aClcbiAgICAgICAgaWYgYmFzZVBhdGhTdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGJhc2VQYXRoKVxuICAgICAgICAgIHJldHVybiBAZmlsdGVyQnlQcmVmaXgoZmlsZXMsIGJhc2VOYW1lKS5tYXAoKGYpID0+XG4gICAgICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihiYXNlUGF0aCwgZilcbiAgICAgICAgICAgIGlmIGZzLmxzdGF0U3luYyhmaWxlUGF0aCkuaXNEaXJlY3RvcnkoKVxuICAgICAgICAgICAgICByZXR1cm4gY29tbWFuZCArICcgJyArIGZpbGVQYXRoICArIHBhdGguc2VwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBjb21tYW5kICsgJyAnICsgZmlsZVBhdGhcbiAgICAgICAgICApXG4gICAgICAgIHJldHVybiBbXVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIHJldHVybiBbXVxuIl19
