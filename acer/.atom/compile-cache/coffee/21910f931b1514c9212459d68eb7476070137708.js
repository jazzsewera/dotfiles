(function() {
  var _, getSearchTerm;

  _ = require('underscore-plus');

  getSearchTerm = function(term, modifiers) {
    var char, escaped, hasC, hasc, j, len, modFlags, term_;
    if (modifiers == null) {
      modifiers = {
        'g': true
      };
    }
    escaped = false;
    hasc = false;
    hasC = false;
    term_ = term;
    term = '';
    for (j = 0, len = term_.length; j < len; j++) {
      char = term_[j];
      if (char === '\\' && !escaped) {
        escaped = true;
        term += char;
      } else {
        if (char === 'c' && escaped) {
          hasc = true;
          term = term.slice(0, -1);
        } else if (char === 'C' && escaped) {
          hasC = true;
          term = term.slice(0, -1);
        } else if (char !== '\\') {
          term += char;
        }
        escaped = false;
      }
    }
    if (hasC) {
      modifiers['i'] = false;
    }
    if ((!hasC && !term.match('[A-Z]') && atom.config.get("vim-mode:useSmartcaseForSearch")) || hasc) {
      modifiers['i'] = true;
    }
    modFlags = Object.keys(modifiers).filter(function(key) {
      return modifiers[key];
    }).join('');
    try {
      return new RegExp(term, modFlags);
    } catch (error) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  module.exports = {
    findInBuffer: function(buffer, pattern) {
      var found;
      found = [];
      buffer.scan(new RegExp(pattern, 'g'), function(obj) {
        return found.push(obj.range);
      });
      return found;
    },
    findNextInBuffer: function(buffer, curPos, pattern) {
      var found, i, more;
      found = this.findInBuffer(buffer, pattern);
      more = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = found.length; j < len; j++) {
          i = found[j];
          if (i.compare([curPos, curPos]) === 1) {
            results.push(i);
          }
        }
        return results;
      })();
      if (more.length > 0) {
        return more[0].start.row;
      } else if (found.length > 0) {
        return found[0].start.row;
      } else {
        return null;
      }
    },
    findPreviousInBuffer: function(buffer, curPos, pattern) {
      var found, i, less;
      found = this.findInBuffer(buffer, pattern);
      less = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = found.length; j < len; j++) {
          i = found[j];
          if (i.compare([curPos, curPos]) === -1) {
            results.push(i);
          }
        }
        return results;
      })();
      if (less.length > 0) {
        return less[less.length - 1].start.row;
      } else if (found.length > 0) {
        return found[found.length - 1].start.row;
      } else {
        return null;
      }
    },
    scanEditor: function(term, editor, position, reverse) {
      var rangesAfter, rangesBefore, ref;
      if (reverse == null) {
        reverse = false;
      }
      ref = [[], []], rangesBefore = ref[0], rangesAfter = ref[1];
      editor.scan(getSearchTerm(term), function(arg) {
        var isBefore, range;
        range = arg.range;
        if (reverse) {
          isBefore = range.start.compare(position) < 0;
        } else {
          isBefore = range.start.compare(position) <= 0;
        }
        if (isBefore) {
          return rangesBefore.push(range);
        } else {
          return rangesAfter.push(range);
        }
      });
      if (reverse) {
        return rangesAfter.concat(rangesBefore).reverse();
      } else {
        return rangesAfter.concat(rangesBefore);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9maW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixhQUFBLEdBQWdCLFNBQUMsSUFBRCxFQUFPLFNBQVA7QUFFZCxRQUFBOztNQUZxQixZQUFZO1FBQUMsR0FBQSxFQUFLLElBQU47OztJQUVqQyxPQUFBLEdBQVU7SUFDVixJQUFBLEdBQU87SUFDUCxJQUFBLEdBQU87SUFDUCxLQUFBLEdBQVE7SUFDUixJQUFBLEdBQU87QUFDUCxTQUFBLHVDQUFBOztNQUNFLElBQUcsSUFBQSxLQUFRLElBQVIsSUFBaUIsQ0FBSSxPQUF4QjtRQUNFLE9BQUEsR0FBVTtRQUNWLElBQUEsSUFBUSxLQUZWO09BQUEsTUFBQTtRQUlFLElBQUcsSUFBQSxLQUFRLEdBQVIsSUFBZ0IsT0FBbkI7VUFDRSxJQUFBLEdBQU87VUFDUCxJQUFBLEdBQU8sSUFBSyxjQUZkO1NBQUEsTUFHSyxJQUFHLElBQUEsS0FBUSxHQUFSLElBQWdCLE9BQW5CO1VBQ0gsSUFBQSxHQUFPO1VBQ1AsSUFBQSxHQUFPLElBQUssY0FGVDtTQUFBLE1BR0EsSUFBRyxJQUFBLEtBQVUsSUFBYjtVQUNILElBQUEsSUFBUSxLQURMOztRQUVMLE9BQUEsR0FBVSxNQVpaOztBQURGO0lBZUEsSUFBRyxJQUFIO01BQ0UsU0FBVSxDQUFBLEdBQUEsQ0FBVixHQUFpQixNQURuQjs7SUFFQSxJQUFHLENBQUMsQ0FBSSxJQUFKLElBQWEsQ0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsQ0FBakIsSUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBREQsQ0FBQSxJQUN1RCxJQUQxRDtNQUVFLFNBQVUsQ0FBQSxHQUFBLENBQVYsR0FBaUIsS0FGbkI7O0lBSUEsUUFB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RyxRQUFIO2lCQUNFLFlBQVksQ0FBQyxJQUFiLENBQWtCLEtBQWxCLEVBREY7U0FBQSxNQUFBO2lCQUdFLFdBQVcsQ0FBQyxJQUFaLENBQWlCLEtBQWpCLEVBSEY7O01BTitCLENBQWpDO01BV0EsSUFBRyxPQUFIO2VBQ0UsV0FBVyxDQUFDLE1BQVosQ0FBbUIsWUFBbkIsQ0FBZ0MsQ0FBQyxPQUFqQyxDQUFBLEVBREY7T0FBQSxNQUFBO2VBR0UsV0FBVyxDQUFDLE1BQVosQ0FBbUIsWUFBbkIsRUFIRjs7SUFiVSxDQTlCRzs7QUFyQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuZ2V0U2VhcmNoVGVybSA9ICh0ZXJtLCBtb2RpZmllcnMgPSB7J2cnOiB0cnVlfSkgLT5cblxuICBlc2NhcGVkID0gZmFsc2VcbiAgaGFzYyA9IGZhbHNlXG4gIGhhc0MgPSBmYWxzZVxuICB0ZXJtXyA9IHRlcm1cbiAgdGVybSA9ICcnXG4gIGZvciBjaGFyIGluIHRlcm1fXG4gICAgaWYgY2hhciBpcyAnXFxcXCcgYW5kIG5vdCBlc2NhcGVkXG4gICAgICBlc2NhcGVkID0gdHJ1ZVxuICAgICAgdGVybSArPSBjaGFyXG4gICAgZWxzZVxuICAgICAgaWYgY2hhciBpcyAnYycgYW5kIGVzY2FwZWRcbiAgICAgICAgaGFzYyA9IHRydWVcbiAgICAgICAgdGVybSA9IHRlcm1bLi4uLTFdXG4gICAgICBlbHNlIGlmIGNoYXIgaXMgJ0MnIGFuZCBlc2NhcGVkXG4gICAgICAgIGhhc0MgPSB0cnVlXG4gICAgICAgIHRlcm0gPSB0ZXJtWy4uLi0xXVxuICAgICAgZWxzZSBpZiBjaGFyIGlzbnQgJ1xcXFwnXG4gICAgICAgIHRlcm0gKz0gY2hhclxuICAgICAgZXNjYXBlZCA9IGZhbHNlXG5cbiAgaWYgaGFzQ1xuICAgIG1vZGlmaWVyc1snaSddID0gZmFsc2VcbiAgaWYgKG5vdCBoYXNDIGFuZCBub3QgdGVybS5tYXRjaCgnW0EtWl0nKSBhbmQgXFxcbiAgICAgIGF0b20uY29uZmlnLmdldChcInZpbS1tb2RlOnVzZVNtYXJ0Y2FzZUZvclNlYXJjaFwiKSkgb3IgaGFzY1xuICAgIG1vZGlmaWVyc1snaSddID0gdHJ1ZVxuXG4gIG1vZEZsYWdzID0gT2JqZWN0LmtleXMobW9kaWZpZXJzKS5maWx0ZXIoKGtleSkgLT4gbW9kaWZpZXJzW2tleV0pLmpvaW4oJycpXG5cbiAgdHJ5XG4gICAgbmV3IFJlZ0V4cCh0ZXJtLCBtb2RGbGFncylcbiAgY2F0Y2hcbiAgICBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RGbGFncylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpbmRJbkJ1ZmZlciA6IChidWZmZXIsIHBhdHRlcm4pIC0+XG4gICAgZm91bmQgPSBbXVxuICAgIGJ1ZmZlci5zY2FuKG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKSwgKG9iaikgLT4gZm91bmQucHVzaCBvYmoucmFuZ2UpXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgZmluZE5leHRJbkJ1ZmZlciA6IChidWZmZXIsIGN1clBvcywgcGF0dGVybikgLT5cbiAgICBmb3VuZCA9IEBmaW5kSW5CdWZmZXIoYnVmZmVyLCBwYXR0ZXJuKVxuICAgIG1vcmUgPSAoaSBmb3IgaSBpbiBmb3VuZCB3aGVuIGkuY29tcGFyZShbY3VyUG9zLCBjdXJQb3NdKSBpcyAxKVxuICAgIGlmIG1vcmUubGVuZ3RoID4gMFxuICAgICAgcmV0dXJuIG1vcmVbMF0uc3RhcnQucm93XG4gICAgZWxzZSBpZiBmb3VuZC5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gZm91bmRbMF0uc3RhcnQucm93XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIG51bGxcblxuICBmaW5kUHJldmlvdXNJbkJ1ZmZlciA6IChidWZmZXIsIGN1clBvcywgcGF0dGVybikgLT5cbiAgICBmb3VuZCA9IEBmaW5kSW5CdWZmZXIoYnVmZmVyLCBwYXR0ZXJuKVxuICAgIGxlc3MgPSAoaSBmb3IgaSBpbiBmb3VuZCB3aGVuIGkuY29tcGFyZShbY3VyUG9zLCBjdXJQb3NdKSBpcyAtMSlcbiAgICBpZiBsZXNzLmxlbmd0aCA+IDBcbiAgICAgIHJldHVybiBsZXNzW2xlc3MubGVuZ3RoIC0gMV0uc3RhcnQucm93XG4gICAgZWxzZSBpZiBmb3VuZC5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gZm91bmRbZm91bmQubGVuZ3RoIC0gMV0uc3RhcnQucm93XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIG51bGxcblxuICAjIFJldHVybnMgYW4gYXJyYXkgb2YgcmFuZ2VzIG9mIGFsbCBvY2N1cmVuY2VzIG9mIGB0ZXJtYCBpbiBgZWRpdG9yYC5cbiAgIyAgVGhlIGFycmF5IGlzIHNvcnRlZCBzbyB0aGF0IHRoZSBmaXJzdCBvY2N1cmVuY2VzIGFmdGVyIHRoZSBjdXJzb3IgY29tZVxuICAjICBmaXJzdCAoYW5kIHRoZSBzZWFyY2ggd3JhcHMgYXJvdW5kKS4gSWYgYHJldmVyc2VgIGlzIHRydWUsIHRoZSBhcnJheSBpc1xuICAjICByZXZlcnNlZCBzbyB0aGF0IHRoZSBmaXJzdCBvY2N1cmVuY2UgYmVmb3JlIHRoZSBjdXJzb3IgY29tZXMgZmlyc3QuXG4gIHNjYW5FZGl0b3I6ICh0ZXJtLCBlZGl0b3IsIHBvc2l0aW9uLCByZXZlcnNlID0gZmFsc2UpIC0+XG4gICAgW3Jhbmdlc0JlZm9yZSwgcmFuZ2VzQWZ0ZXJdID0gW1tdLCBbXV1cbiAgICBlZGl0b3Iuc2NhbiBnZXRTZWFyY2hUZXJtKHRlcm0pLCAoe3JhbmdlfSkgLT5cbiAgICAgIGlmIHJldmVyc2VcbiAgICAgICAgaXNCZWZvcmUgPSByYW5nZS5zdGFydC5jb21wYXJlKHBvc2l0aW9uKSA8IDBcbiAgICAgIGVsc2VcbiAgICAgICAgaXNCZWZvcmUgPSByYW5nZS5zdGFydC5jb21wYXJlKHBvc2l0aW9uKSA8PSAwXG5cbiAgICAgIGlmIGlzQmVmb3JlXG4gICAgICAgIHJhbmdlc0JlZm9yZS5wdXNoKHJhbmdlKVxuICAgICAgZWxzZVxuICAgICAgICByYW5nZXNBZnRlci5wdXNoKHJhbmdlKVxuXG4gICAgaWYgcmV2ZXJzZVxuICAgICAgcmFuZ2VzQWZ0ZXIuY29uY2F0KHJhbmdlc0JlZm9yZSkucmV2ZXJzZSgpXG4gICAgZWxzZVxuICAgICAgcmFuZ2VzQWZ0ZXIuY29uY2F0KHJhbmdlc0JlZm9yZSlcbn1cbiJdfQ==
