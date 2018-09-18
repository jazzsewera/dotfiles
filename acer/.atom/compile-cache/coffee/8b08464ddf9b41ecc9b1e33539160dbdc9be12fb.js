(function() {
  var Command, CommandError, Ex, ExViewModel, Find;

  ExViewModel = require('./ex-view-model');

  Ex = require('./ex');

  Find = require('./find');

  CommandError = require('./command-error');

  Command = (function() {
    function Command(editor, exState) {
      this.editor = editor;
      this.exState = exState;
      this.selections = this.exState.getSelections();
      this.viewModel = new ExViewModel(this, Object.keys(this.selections).length > 0);
    }

    Command.prototype.parseAddr = function(str, cursor) {
      var addr, buffer, mark, ref, ref1, row;
      row = cursor.getBufferRow();
      if (str === '.') {
        addr = row;
      } else if (str === '$') {
        buffer = this.editor.getBuffer();
        addr = ((ref = typeof buffer.getLineCount === "function" ? buffer.getLineCount() : void 0) != null ? ref : buffer.lines.length) - 1;
      } else if ((ref1 = str[0]) === "+" || ref1 === "-") {
        addr = row + this.parseOffset(str);
      } else if (!isNaN(str)) {
        addr = parseInt(str) - 1;
      } else if (str[0] === "'") {
        if (this.vimState == null) {
          throw new CommandError("Couldn't get access to vim-mode.");
        }
        mark = this.vimState.mark.marks[str[1]];
        if (mark == null) {
          throw new CommandError("Mark " + str + " not set.");
        }
        addr = mark.getEndBufferPosition().row;
      } else if (str[0] === "/") {
        str = str.slice(1);
        if (str[str.length - 1] === "/") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().end)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str);
        }
        addr = addr.start.row;
      } else if (str[0] === "?") {
        str = str.slice(1);
        if (str[str.length - 1] === "?") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().start, true)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
        addr = addr.start.row;
      }
      return addr;
    };

    Command.prototype.parseOffset = function(str) {
      var o;
      if (str.length === 0) {
        return 0;
      }
      if (str.length === 1) {
        o = 1;
      } else {
        o = parseInt(str.slice(1));
      }
      if (str[0] === '+') {
        return o;
      } else {
        return -o;
      }
    };

    Command.prototype.execute = function(input) {
      var addr1, addr2, addrPattern, address1, address2, args, buffer, bufferRange, cl, command, cursor, func, id, lastLine, m, match, matching, name, off1, off2, range, ref, ref1, ref2, ref3, ref4, results, runOverSelections, selection, val;
      this.vimState = (ref = this.exState.globalExState.vim) != null ? ref.getEditorState(this.editor) : void 0;
      cl = input.characters;
      cl = cl.replace(/^(:|\s)*/, '');
      if (!(cl.length > 0)) {
        return;
      }
      if (cl[0] === '"') {
        return;
      }
      buffer = this.editor.getBuffer();
      lastLine = ((ref1 = typeof buffer.getLineCount === "function" ? buffer.getLineCount() : void 0) != null ? ref1 : buffer.lines.length) - 1;
      if (cl[0] === '%') {
        range = [0, lastLine];
        cl = cl.slice(1);
      } else {
        addrPattern = /^(?:(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?(?:[^\\]\/|$)|\?.*?(?:[^\\]\?|$)|[+-]\d*)((?:\s*[+-]\d*)*))?(?:,(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?/;
        ref2 = cl.match(addrPattern), match = ref2[0], addr1 = ref2[1], off1 = ref2[2], addr2 = ref2[3], off2 = ref2[4];
        cursor = this.editor.getLastCursor();
        if (addr1 === "'<" && addr2 === "'>") {
          runOverSelections = true;
        } else {
          runOverSelections = false;
          if (addr1 != null) {
            address1 = this.parseAddr(addr1, cursor);
          } else {
            address1 = cursor.getBufferRow();
          }
          if (off1 != null) {
            address1 += this.parseOffset(off1);
          }
          if (address1 === -1) {
            address1 = 0;
          }
          if (address1 > lastLine) {
            address1 = lastLine;
          }
          if (address1 < 0) {
            throw new CommandError('Invalid range');
          }
          if (addr2 != null) {
            address2 = this.parseAddr(addr2, cursor);
          }
          if (off2 != null) {
            address2 += this.parseOffset(off2);
          }
          if (address2 === -1) {
            address2 = 0;
          }
          if (address2 > lastLine) {
            address2 = lastLine;
          }
          if (address2 < 0) {
            throw new CommandError('Invalid range');
          }
          if (address2 < address1) {
            throw new CommandError('Backwards range given');
          }
        }
        range = [address1, address2 != null ? address2 : address1];
      }
      cl = cl.slice(match != null ? match.length : void 0);
      cl = cl.trimLeft();
      if (cl.length === 0) {
        this.editor.setCursorBufferPosition([range[1], 0]);
        return;
      }
      if (cl.length === 2 && cl[0] === 'k' && /[a-z]/i.test(cl[1])) {
        command = 'mark';
        args = cl[1];
      } else if (!/[a-z]/i.test(cl[0])) {
        command = cl[0];
        args = cl.slice(1);
      } else {
        ref3 = cl.match(/^(\w+)(.*)/), m = ref3[0], command = ref3[1], args = ref3[2];
      }
      if ((func = Ex.singleton()[command]) == null) {
        matching = (function() {
          var ref4, results;
          ref4 = Ex.singleton();
          results = [];
          for (name in ref4) {
            val = ref4[name];
            if (name.indexOf(command) === 0) {
              results.push(name);
            }
          }
          return results;
        })();
        matching.sort();
        command = matching[0];
        func = Ex.singleton()[command];
      }
      if (func != null) {
        if (runOverSelections) {
          ref4 = this.selections;
          results = [];
          for (id in ref4) {
            selection = ref4[id];
            bufferRange = selection.getBufferRange();
            range = [bufferRange.start.row, bufferRange.end.row];
            results.push(func({
              range: range,
              args: args,
              vimState: this.vimState,
              exState: this.exState,
              editor: this.editor
            }));
          }
          return results;
        } else {
          return func({
            range: range,
            args: args,
            vimState: this.vimState,
            exState: this.exState,
            editor: this.editor
          });
        }
      } else {
        throw new CommandError("Not an editor command: " + input.characters);
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL2xpYi9jb21tYW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZCxFQUFBLEdBQUssT0FBQSxDQUFRLE1BQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVI7O0VBRVQ7SUFDUyxpQkFBQyxNQUFELEVBQVUsT0FBVjtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFVBQUQ7TUFDckIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQTtNQUNkLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxXQUFKLENBQWdCLElBQWhCLEVBQW1CLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFVBQWIsQ0FBd0IsQ0FBQyxNQUF6QixHQUFrQyxDQUFyRDtJQUZGOztzQkFJYixTQUFBLEdBQVcsU0FBQyxHQUFELEVBQU0sTUFBTjtBQUNULFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLFlBQVAsQ0FBQTtNQUNOLElBQUcsR0FBQSxLQUFPLEdBQVY7UUFDRSxJQUFBLEdBQU8sSUFEVDtPQUFBLE1BRUssSUFBRyxHQUFBLEtBQU8sR0FBVjtRQUtILE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQTtRQUNULElBQUEsR0FBTyxvR0FBMEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUF2QyxDQUFBLEdBQWlELEVBTnJEO09BQUEsTUFPQSxZQUFHLEdBQUksQ0FBQSxDQUFBLEVBQUosS0FBVyxHQUFYLElBQUEsSUFBQSxLQUFnQixHQUFuQjtRQUNILElBQUEsR0FBTyxHQUFBLEdBQU0sSUFBQyxDQUFBLFdBQUQsQ0FBYSxH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d0NBQVA7UUFFRSxRQUFBOztBQUFZO0FBQUE7ZUFBQSxZQUFBOztnQkFDVixJQUFJLENBQUMsT0FBTCxDQUFhLE9BQWIsQ0FBQSxLQUF5QjsyQkFEZjs7QUFBQTs7O1FBR1osUUFBUSxDQUFDLElBQVQsQ0FBQTtRQUVBLE9BQUEsR0FBVSxRQUFTLENBQUEsQ0FBQTtRQUVuQixJQUFBLEdBQU8sRUFBRSxDQUFDLFNBQUgsQ0FBQSxDQUFlLENBQUEsT0FBQSxFQVR4Qjs7TUFXQSxJQUFHLFlBQUg7UUFDRSxJQUFHLGlCQUFIO0FBQ0U7QUFBQTtlQUFBLFVBQUE7O1lBQ0UsV0FBQSxHQUFjLFNBQVMsQ0FBQyxjQUFWLENBQUE7WUFDZCxLQUFBLEdBQVEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQW5CLEVBQXdCLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBeEM7eUJBQ1IsSUFBQSxDQUFLO2NBQUUsT0FBQSxLQUFGO2NBQVMsTUFBQSxJQUFUO2NBQWdCLFVBQUQsSUFBQyxDQUFBLFFBQWhCO2NBQTJCLFNBQUQsSUFBQyxDQUFBLE9BQTNCO2NBQXFDLFFBQUQsSUFBQyxDQUFBLE1BQXJDO2FBQUw7QUFIRjt5QkFERjtTQUFBLE1BQUE7aUJBTUUsSUFBQSxDQUFLO1lBQUUsT0FBQSxLQUFGO1lBQVMsTUFBQSxJQUFUO1lBQWdCLFVBQUQsSUFBQyxDQUFBLFFBQWhCO1lBQTJCLFNBQUQsSUFBQyxDQUFBLE9BQTNCO1lBQXFDLFFBQUQsSUFBQyxDQUFBLE1BQXJDO1dBQUwsRUFORjtTQURGO09BQUEsTUFBQTtBQVNFLGNBQU0sSUFBSSxZQUFKLENBQWlCLHlCQUFBLEdBQTBCLEtBQUssQ0FBQyxVQUFqRCxFQVRSOztJQTlITzs7Ozs7O0VBeUlYLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBeE1qQiIsInNvdXJjZXNDb250ZW50IjpbIkV4Vmlld01vZGVsID0gcmVxdWlyZSAnLi9leC12aWV3LW1vZGVsJ1xuRXggPSByZXF1aXJlICcuL2V4J1xuRmluZCA9IHJlcXVpcmUgJy4vZmluZCdcbkNvbW1hbmRFcnJvciA9IHJlcXVpcmUgJy4vY29tbWFuZC1lcnJvcidcblxuY2xhc3MgQ29tbWFuZFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEBleFN0YXRlKSAtPlxuICAgIEBzZWxlY3Rpb25zID0gQGV4U3RhdGUuZ2V0U2VsZWN0aW9ucygpXG4gICAgQHZpZXdNb2RlbCA9IG5ldyBFeFZpZXdNb2RlbChALCBPYmplY3Qua2V5cyhAc2VsZWN0aW9ucykubGVuZ3RoID4gMClcblxuICBwYXJzZUFkZHI6IChzdHIsIGN1cnNvcikgLT5cbiAgICByb3cgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICBpZiBzdHIgaXMgJy4nXG4gICAgICBhZGRyID0gcm93XG4gICAgZWxzZSBpZiBzdHIgaXMgJyQnXG4gICAgICAjIExpbmVzIGFyZSAwLWluZGV4ZWQgaW4gQXRvbSwgYnV0IDEtaW5kZXhlZCBpbiB2aW0uXG4gICAgICAjIFRoZSB0d28gd2F5cyBvZiBnZXR0aW5nIGxlbmd0aCBsZXQgdXMgc3VwcG9ydCBBdG9tIDEuMTkncyBuZXcgYnVmZmVyXG4gICAgICAjIGltcGxlbWVudGF0aW9uIChodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL3B1bGwvMTQ0MzUpIGFuZCBzdGlsbFxuICAgICAgIyBzdXBwb3J0IDEuMTggYW5kIGJlbG93XG4gICAgICBidWZmZXIgPSBAZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICBhZGRyID0gKGJ1ZmZlci5nZXRMaW5lQ291bnQ/KCkgPyBidWZmZXIubGluZXMubGVuZ3RoKSAtIDFcbiAgICBlbHNlIGlmIHN0clswXSBpbiBbXCIrXCIsIFwiLVwiXVxuICAgICAgYWRkciA9IHJvdyArIEBwYXJzZU9mZnNldChzdHIpXG4gICAgZWxzZSBpZiBub3QgaXNOYU4oc3RyKVxuICAgICAgYWRkciA9IHBhcnNlSW50KHN0cikgLSAxXG4gICAgZWxzZSBpZiBzdHJbMF0gaXMgXCInXCIgIyBQYXJzZSBNYXJrLi4uXG4gICAgICB1bmxlc3MgQHZpbVN0YXRlP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiQ291bGRuJ3QgZ2V0IGFjY2VzcyB0byB2aW0tbW9kZS5cIilcbiAgICAgIG1hcmsgPSBAdmltU3RhdGUubWFyay5tYXJrc1tzdHJbMV1dXG4gICAgICB1bmxlc3MgbWFyaz9cbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk1hcmsgI3tzdHJ9IG5vdCBzZXQuXCIpXG4gICAgICBhZGRyID0gbWFyay5nZXRFbmRCdWZmZXJQb3NpdGlvbigpLnJvd1xuICAgIGVsc2UgaWYgc3RyWzBdIGlzIFwiL1wiXG4gICAgICBzdHIgPSBzdHJbMS4uLl1cbiAgICAgIGlmIHN0cltzdHIubGVuZ3RoLTFdIGlzIFwiL1wiXG4gICAgICAgIHN0ciA9IHN0clsuLi4tMV1cbiAgICAgIGFkZHIgPSBGaW5kLnNjYW5FZGl0b3Ioc3RyLCBAZWRpdG9yLCBjdXJzb3IuZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpLmVuZClbMF1cbiAgICAgIHVubGVzcyBhZGRyP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiUGF0dGVybiBub3QgZm91bmQ6ICN7c3RyfVwiKVxuICAgICAgYWRkciA9IGFkZHIuc3RhcnQucm93XG4gICAgZWxzZSBpZiBzdHJbMF0gaXMgXCI/XCJcbiAgICAgIHN0ciA9IHN0clsxLi4uXVxuICAgICAgaWYgc3RyW3N0ci5sZW5ndGgtMV0gaXMgXCI/XCJcbiAgICAgICAgc3RyID0gc3RyWy4uLi0xXVxuICAgICAgYWRkciA9IEZpbmQuc2NhbkVkaXRvcihzdHIsIEBlZGl0b3IsIGN1cnNvci5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKCkuc3RhcnQsIHRydWUpWzBdXG4gICAgICB1bmxlc3MgYWRkcj9cbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIlBhdHRlcm4gbm90IGZvdW5kOiAje3N0clsxLi4uLTFdfVwiKVxuICAgICAgYWRkciA9IGFkZHIuc3RhcnQucm93XG5cbiAgICByZXR1cm4gYWRkclxuXG4gIHBhcnNlT2Zmc2V0OiAoc3RyKSAtPlxuICAgIGlmIHN0ci5sZW5ndGggaXMgMFxuICAgICAgcmV0dXJuIDBcbiAgICBpZiBzdHIubGVuZ3RoIGlzIDFcbiAgICAgIG8gPSAxXG4gICAgZWxzZVxuICAgICAgbyA9IHBhcnNlSW50KHN0clsxLi5dKVxuICAgIGlmIHN0clswXSBpcyAnKydcbiAgICAgIHJldHVybiBvXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIC1vXG5cbiAgZXhlY3V0ZTogKGlucHV0KSAtPlxuICAgIEB2aW1TdGF0ZSA9IEBleFN0YXRlLmdsb2JhbEV4U3RhdGUudmltPy5nZXRFZGl0b3JTdGF0ZShAZWRpdG9yKVxuICAgICMgQ29tbWFuZCBsaW5lIHBhcnNpbmcgKG1vc3RseSkgZm9sbG93aW5nIHRoZSBydWxlcyBhdFxuICAgICMgaHR0cDovL3B1YnMub3Blbmdyb3VwLm9yZy9vbmxpbmVwdWJzLzk2OTk5MTk3OTkvdXRpbGl0aWVzXG4gICAgIyAvZXguaHRtbCN0YWdfMjBfNDBfMTNfMDNcblxuICAgICMgU3RlcHMgMS8yOiBMZWFkaW5nIGJsYW5rcyBhbmQgY29sb25zIGFyZSBpZ25vcmVkLlxuICAgIGNsID0gaW5wdXQuY2hhcmFjdGVyc1xuICAgIGNsID0gY2wucmVwbGFjZSgvXig6fFxccykqLywgJycpXG4gICAgcmV0dXJuIHVubGVzcyBjbC5sZW5ndGggPiAwXG5cbiAgICAjIFN0ZXAgMzogSWYgdGhlIGZpcnN0IGNoYXJhY3RlciBpcyBhIFwiLCBpZ25vcmUgdGhlIHJlc3Qgb2YgdGhlIGxpbmVcbiAgICBpZiBjbFswXSBpcyAnXCInXG4gICAgICByZXR1cm5cblxuICAgICMgU3RlcCA0OiBBZGRyZXNzIHBhcnNpbmdcbiAgICAjIHNlZSBjb21tZW50IGluIHBhcnNlQWRkciBhYm91dCBsaW5lIGxlbmd0aFxuICAgIGJ1ZmZlciA9IEBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICBsYXN0TGluZSA9IChidWZmZXIuZ2V0TGluZUNvdW50PygpID8gYnVmZmVyLmxpbmVzLmxlbmd0aCkgLSAxXG4gICAgaWYgY2xbMF0gaXMgJyUnXG4gICAgICByYW5nZSA9IFswLCBsYXN0TGluZV1cbiAgICAgIGNsID0gY2xbMS4uXVxuICAgIGVsc2VcbiAgICAgIGFkZHJQYXR0ZXJuID0gLy8vXlxuICAgICAgICAoPzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBGaXJzdCBhZGRyZXNzXG4gICAgICAgIChcbiAgICAgICAgXFwufCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEN1cnJlbnQgbGluZVxuICAgICAgICBcXCR8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTGFzdCBsaW5lXG4gICAgICAgIFxcZCt8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBuLXRoIGxpbmVcbiAgICAgICAgJ1tcXFtcXF08PidgXCJeLigpe31hLXpBLVpdfCAgICAgICAgICMgTWFya3NcbiAgICAgICAgLy4qPyg/OlteXFxcXF0vfCQpfCAgICAgICAgICAgICAgICAgIyBSZWdleFxuICAgICAgICBcXD8uKj8oPzpbXlxcXFxdXFw/fCQpfCAgICAgICAgICAgICAgICMgQmFja3dhcmRzIHNlYXJjaFxuICAgICAgICBbKy1dXFxkKiAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQ3VycmVudCBsaW5lICsvLSBhIG51bWJlciBvZiBsaW5lc1xuICAgICAgICApKCg/OlxccypbKy1dXFxkKikqKSAgICAgICAgICAgICAgICAjIExpbmUgb2Zmc2V0XG4gICAgICAgICk/XG4gICAgICAgICg/OiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFNlY29uZCBhZGRyZXNzXG4gICAgICAgICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFNhbWUgYXMgZmlyc3QgYWRkcmVzc1xuICAgICAgICBcXC58XG4gICAgICAgIFxcJHxcbiAgICAgICAgXFxkK3xcbiAgICAgICAgJ1tcXFtcXF08PidgXCJeLigpe31hLXpBLVpdfFxuICAgICAgICAvLio/W15cXFxcXS98XG4gICAgICAgIFxcPy4qP1teXFxcXF1cXD98XG4gICAgICAgIFsrLV1cXGQqXG4gICAgICAgICkoKD86XFxzKlsrLV1cXGQqKSopXG4gICAgICAgICk/XG4gICAgICAvLy9cblxuICAgICAgW21hdGNoLCBhZGRyMSwgb2ZmMSwgYWRkcjIsIG9mZjJdID0gY2wubWF0Y2goYWRkclBhdHRlcm4pXG5cbiAgICAgIGN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG5cbiAgICAgICMgU3BlY2lhbCBjYXNlOiBydW4gY29tbWFuZCBvbiBzZWxlY3Rpb24uIFRoaXMgY2FuJ3QgYmUgaGFuZGxlZCBieSBzaW1wbHlcbiAgICAgICMgcGFyc2luZyB0aGUgbWFyayBzaW5jZSB2aW0tbW9kZSBkb2Vzbid0IHNldCBpdCAoYW5kIGl0IHdvdWxkIGJlIGZhaXJseVxuICAgICAgIyB1c2VsZXNzIHdpdGggbXVsdGlwbGUgc2VsZWN0aW9ucylcbiAgICAgIGlmIGFkZHIxIGlzIFwiJzxcIiBhbmQgYWRkcjIgaXMgXCInPlwiXG4gICAgICAgIHJ1bk92ZXJTZWxlY3Rpb25zID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBydW5PdmVyU2VsZWN0aW9ucyA9IGZhbHNlXG4gICAgICAgIGlmIGFkZHIxP1xuICAgICAgICAgIGFkZHJlc3MxID0gQHBhcnNlQWRkcihhZGRyMSwgY3Vyc29yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBJZiBubyBhZGRyMSBpcyBnaXZlbiAoLCszKSwgYXNzdW1lIGl0IGlzICcuJ1xuICAgICAgICAgIGFkZHJlc3MxID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICAgIGlmIG9mZjE/XG4gICAgICAgICAgYWRkcmVzczEgKz0gQHBhcnNlT2Zmc2V0KG9mZjEpXG5cbiAgICAgICAgYWRkcmVzczEgPSAwIGlmIGFkZHJlc3MxIGlzIC0xXG4gICAgICAgIGFkZHJlc3MxID0gbGFzdExpbmUgaWYgYWRkcmVzczEgPiBsYXN0TGluZVxuXG4gICAgICAgIGlmIGFkZHJlc3MxIDwgMFxuICAgICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ0ludmFsaWQgcmFuZ2UnKVxuXG4gICAgICAgIGlmIGFkZHIyP1xuICAgICAgICAgIGFkZHJlc3MyID0gQHBhcnNlQWRkcihhZGRyMiwgY3Vyc29yKVxuICAgICAgICBpZiBvZmYyP1xuICAgICAgICAgIGFkZHJlc3MyICs9IEBwYXJzZU9mZnNldChvZmYyKVxuXG4gICAgICAgIGFkZHJlc3MyID0gMCBpZiBhZGRyZXNzMiBpcyAtMVxuICAgICAgICBhZGRyZXNzMiA9IGxhc3RMaW5lIGlmIGFkZHJlc3MyID4gbGFzdExpbmVcblxuICAgICAgICBpZiBhZGRyZXNzMiA8IDBcbiAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdJbnZhbGlkIHJhbmdlJylcblxuICAgICAgICBpZiBhZGRyZXNzMiA8IGFkZHJlc3MxXG4gICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignQmFja3dhcmRzIHJhbmdlIGdpdmVuJylcblxuICAgICAgcmFuZ2UgPSBbYWRkcmVzczEsIGlmIGFkZHJlc3MyPyB0aGVuIGFkZHJlc3MyIGVsc2UgYWRkcmVzczFdXG4gICAgY2wgPSBjbFttYXRjaD8ubGVuZ3RoLi5dXG5cbiAgICAjIFN0ZXAgNTogTGVhZGluZyBibGFua3MgYXJlIGlnbm9yZWRcbiAgICBjbCA9IGNsLnRyaW1MZWZ0KClcblxuICAgICMgU3RlcCA2YTogSWYgbm8gY29tbWFuZCBpcyBzcGVjaWZpZWQsIGdvIHRvIHRoZSBsYXN0IHNwZWNpZmllZCBhZGRyZXNzXG4gICAgaWYgY2wubGVuZ3RoIGlzIDBcbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW3JhbmdlWzFdLCAwXSlcbiAgICAgIHJldHVyblxuXG4gICAgIyBJZ25vcmUgc3RlcHMgNmIgYW5kIDZjIHNpbmNlIHRoZXkgb25seSBtYWtlIHNlbnNlIGZvciBwcmludCBjb21tYW5kcyBhbmRcbiAgICAjIHByaW50IGRvZXNuJ3QgbWFrZSBzZW5zZVxuXG4gICAgIyBJZ25vcmUgc3RlcCA3YSBzaW5jZSBmbGFncyBhcmUgb25seSB1c2VmdWwgZm9yIHByaW50XG5cbiAgICAjIFN0ZXAgN2I6IDprPHZhbGlkIG1hcms+IGlzIGVxdWFsIHRvIDptYXJrIDx2YWxpZCBtYXJrPiAtIG9ubHkgYS16QS1aIGlzXG4gICAgIyBpbiB2aW0tbW9kZSBmb3Igbm93XG4gICAgaWYgY2wubGVuZ3RoIGlzIDIgYW5kIGNsWzBdIGlzICdrJyBhbmQgL1thLXpdL2kudGVzdChjbFsxXSlcbiAgICAgIGNvbW1hbmQgPSAnbWFyaydcbiAgICAgIGFyZ3MgPSBjbFsxXVxuICAgIGVsc2UgaWYgbm90IC9bYS16XS9pLnRlc3QoY2xbMF0pXG4gICAgICBjb21tYW5kID0gY2xbMF1cbiAgICAgIGFyZ3MgPSBjbFsxLi5dXG4gICAgZWxzZVxuICAgICAgW20sIGNvbW1hbmQsIGFyZ3NdID0gY2wubWF0Y2goL14oXFx3KykoLiopLylcblxuICAgICMgSWYgdGhlIGNvbW1hbmQgbWF0Y2hlcyBhbiBleGlzdGluZyBvbmUgZXhhY3RseSwgZXhlY3V0ZSB0aGF0IG9uZVxuICAgIHVubGVzcyAoZnVuYyA9IEV4LnNpbmdsZXRvbigpW2NvbW1hbmRdKT9cbiAgICAgICMgU3RlcCA4OiBNYXRjaCBjb21tYW5kIGFnYWluc3QgZXhpc3RpbmcgY29tbWFuZHNcbiAgICAgIG1hdGNoaW5nID0gKG5hbWUgZm9yIG5hbWUsIHZhbCBvZiBFeC5zaW5nbGV0b24oKSB3aGVuIFxcXG4gICAgICAgIG5hbWUuaW5kZXhPZihjb21tYW5kKSBpcyAwKVxuXG4gICAgICBtYXRjaGluZy5zb3J0KClcblxuICAgICAgY29tbWFuZCA9IG1hdGNoaW5nWzBdXG5cbiAgICAgIGZ1bmMgPSBFeC5zaW5nbGV0b24oKVtjb21tYW5kXVxuXG4gICAgaWYgZnVuYz9cbiAgICAgIGlmIHJ1bk92ZXJTZWxlY3Rpb25zXG4gICAgICAgIGZvciBpZCwgc2VsZWN0aW9uIG9mIEBzZWxlY3Rpb25zXG4gICAgICAgICAgYnVmZmVyUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICAgIHJhbmdlID0gW2J1ZmZlclJhbmdlLnN0YXJ0LnJvdywgYnVmZmVyUmFuZ2UuZW5kLnJvd11cbiAgICAgICAgICBmdW5jKHsgcmFuZ2UsIGFyZ3MsIEB2aW1TdGF0ZSwgQGV4U3RhdGUsIEBlZGl0b3IgfSlcbiAgICAgIGVsc2VcbiAgICAgICAgZnVuYyh7IHJhbmdlLCBhcmdzLCBAdmltU3RhdGUsIEBleFN0YXRlLCBAZWRpdG9yIH0pXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vdCBhbiBlZGl0b3IgY29tbWFuZDogI3tpbnB1dC5jaGFyYWN0ZXJzfVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmRcbiJdfQ==
