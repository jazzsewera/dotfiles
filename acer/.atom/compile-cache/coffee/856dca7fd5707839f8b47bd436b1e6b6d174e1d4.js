(function() {
  var Ex, ExClass, fs, helpers, os, path, uuid;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  uuid = require('node-uuid');

  helpers = require('./spec-helper');

  ExClass = require('../lib/ex');

  Ex = ExClass.singleton();

  describe("the commands", function() {
    var dir, dir2, editor, editorElement, exState, keydown, normalModeInputKeydown, openEx, projectPath, ref, submitNormalModeInputText, vimState;
    ref = [], editor = ref[0], editorElement = ref[1], vimState = ref[2], exState = ref[3], dir = ref[4], dir2 = ref[5];
    projectPath = function(fileName) {
      return path.join(dir, fileName);
    };
    beforeEach(function() {
      var exMode, vimMode;
      vimMode = atom.packages.loadPackage('vim-mode-plus');
      exMode = atom.packages.loadPackage('ex-mode');
      waitsForPromise(function() {
        var activationPromise;
        activationPromise = exMode.activate();
        helpers.activateExMode();
        return activationPromise;
      });
      runs(function() {
        return spyOn(exMode.mainModule.globalExState, 'setVim').andCallThrough();
      });
      waitsForPromise(function() {
        return vimMode.activate();
      });
      waitsFor(function() {
        return exMode.mainModule.globalExState.setVim.calls.length > 0;
      });
      return runs(function() {
        dir = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        dir2 = path.join(os.tmpdir(), "atom-ex-mode-spec-" + (uuid.v4()));
        fs.makeTreeSync(dir);
        fs.makeTreeSync(dir2);
        atom.project.setPaths([dir, dir2]);
        return helpers.getEditorElement(function(element) {
          atom.commands.dispatch(element, "ex-mode:open");
          atom.commands.dispatch(element.getModel().normalModeInputView.editorElement, "core:cancel");
          editorElement = element;
          editor = editorElement.getModel();
          vimState = vimMode.mainModule.getEditorState(editor);
          exState = exMode.mainModule.exStates.get(editor);
          vimState.resetNormalMode();
          return editor.setText("abc\ndef\nabc\ndef");
        });
      });
    });
    afterEach(function() {
      fs.removeSync(dir);
      return fs.removeSync(dir2);
    });
    keydown = function(key, options) {
      if (options == null) {
        options = {};
      }
      if (options.element == null) {
        options.element = editorElement;
      }
      return helpers.keydown(key, options);
    };
    normalModeInputKeydown = function(key, opts) {
      if (opts == null) {
        opts = {};
      }
      return editor.normalModeInputView.editorElement.getModel().setText(key);
    };
    submitNormalModeInputText = function(text) {
      var commandEditor;
      commandEditor = editor.normalModeInputView.editorElement;
      commandEditor.getModel().setText(text);
      return atom.commands.dispatch(commandEditor, "core:confirm");
    };
    openEx = function() {
      return atom.commands.dispatch(editorElement, "ex-mode:open");
    };
    describe("as a motion", function() {
      beforeEach(function() {
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("moves the cursor to a specific line", function() {
        openEx();
        submitNormalModeInputText('2');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
      it("moves to the second address", function() {
        openEx();
        submitNormalModeInputText('1,3');
        return expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
      });
      it("works with offsets", function() {
        openEx();
        submitNormalModeInputText('2+1');
        expect(editor.getCursorBufferPosition()).toEqual([2, 0]);
        openEx();
        submitNormalModeInputText('-2');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("limits to the last line", function() {
        openEx();
        submitNormalModeInputText('10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('3,10');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        editor.setCursorBufferPosition([0, 0]);
        openEx();
        submitNormalModeInputText('$+1000');
        expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("goes to the first line with address 0", function() {
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('0,0');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("doesn't move when the address is the current line", function() {
        openEx();
        submitNormalModeInputText('.');
        expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
        openEx();
        submitNormalModeInputText(',');
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      it("moves to the last line", function() {
        openEx();
        submitNormalModeInputText('$');
        return expect(editor.getCursorBufferPosition()).toEqual([3, 0]);
      });
      it("moves to a mark's line", function() {
        keydown('l');
        keydown('m');
        normalModeInputKeydown('a');
        keydown('j');
        openEx();
        submitNormalModeInputText("'a");
        return expect(editor.getCursorBufferPosition()).toEqual([0, 0]);
      });
      return it("moves to a specified search", function() {
        openEx();
        submitNormalModeInputText('/def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([2, 0]);
        openEx();
        submitNormalModeInputText('?def');
        expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
        editor.setCursorBufferPosition([3, 0]);
        openEx();
        submitNormalModeInputText('/ef');
        return expect(editor.getCursorBufferPosition()).toEqual([1, 0]);
      });
    });
    describe(":write", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('write');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('write-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('write');
          expect(fs.existsSync(filePath)).toBe(true);
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
          return expect(editor.isModified()).toBe(false);
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
          submitNormalModeInputText('write');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("write-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("saves the file", function() {
          editor.setText('abc');
          openEx();
          submitNormalModeInputText('write');
          expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc');
          return expect(editor.isModified()).toBe(false);
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, filePath + ".new");
            editor.getBuffer().setText('abc');
            return openEx();
          });
          afterEach(function() {
            submitNormalModeInputText("write " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(true);
            return fs.removeSync(newPath);
          });
          it("saves to the path", function() {});
          it("expands .", function() {
            return newPath = path.join('.', newPath);
          });
          it("expands ..", function() {
            return newPath = path.join('..', newPath);
          });
          return it("expands ~", function() {
            return newPath = path.join('~', newPath);
          });
        });
        it("throws an error with more than one path", function() {
          openEx();
          submitNormalModeInputText('write path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('write-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            openEx();
            submitNormalModeInputText("write " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :write!", function() {
            openEx();
            submitNormalModeInputText("write! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":wall", function() {
      return it("saves all", function() {
        spyOn(atom.workspace, 'saveAll');
        openEx();
        submitNormalModeInputText('wall');
        return expect(atom.workspace.saveAll).toHaveBeenCalled();
      });
    });
    describe(":saveas", function() {
      describe("when editing a new file", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('abc\ndef');
        });
        it("opens the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.showSaveDialogSync).toHaveBeenCalled();
        });
        it("saves when a path is specified in the save dialog", function() {
          var filePath;
          filePath = projectPath('saveas-from-save-dialog');
          spyOn(atom, 'showSaveDialogSync').andReturn(filePath);
          openEx();
          submitNormalModeInputText('saveas');
          expect(fs.existsSync(filePath)).toBe(true);
          return expect(fs.readFileSync(filePath, 'utf-8')).toEqual('abc\ndef');
        });
        return it("saves when a path is specified in the save dialog", function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
          spyOn(fs, 'writeFileSync');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(fs.writeFileSync.calls.length).toBe(0);
        });
      });
      return describe("when editing an existing file", function() {
        var filePath, i;
        filePath = '';
        i = 0;
        beforeEach(function() {
          i++;
          filePath = projectPath("saveas-" + i);
          editor.setText('abc\ndef');
          return editor.saveAs(filePath);
        });
        it("complains if no path given", function() {
          editor.setText('abc');
          openEx();
          submitNormalModeInputText('saveas');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Argument required');
        });
        describe("with a specified path", function() {
          var newPath;
          newPath = '';
          beforeEach(function() {
            newPath = path.relative(dir, filePath + ".new");
            editor.getBuffer().setText('abc');
            return openEx();
          });
          afterEach(function() {
            submitNormalModeInputText("saveas " + newPath);
            newPath = path.resolve(dir, fs.normalize(newPath));
            expect(fs.existsSync(newPath)).toBe(true);
            expect(fs.readFileSync(newPath, 'utf-8')).toEqual('abc');
            expect(editor.isModified()).toBe(false);
            return fs.removeSync(newPath);
          });
          it("saves to the path", function() {});
          it("expands .", function() {
            return newPath = path.join('.', newPath);
          });
          it("expands ..", function() {
            return newPath = path.join('..', newPath);
          });
          return it("expands ~", function() {
            return newPath = path.join('~', newPath);
          });
        });
        it("throws an error with more than one path", function() {
          openEx();
          submitNormalModeInputText('saveas path1 path2');
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
        return describe("when the file already exists", function() {
          var existsPath;
          existsPath = '';
          beforeEach(function() {
            existsPath = projectPath('saveas-exists');
            return fs.writeFileSync(existsPath, 'abc');
          });
          afterEach(function() {
            return fs.removeSync(existsPath);
          });
          it("throws an error if the file already exists", function() {
            openEx();
            submitNormalModeInputText("saveas " + existsPath);
            expect(atom.notifications.notifications[0].message).toEqual('Command error: File exists (add ! to override)');
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc');
          });
          return it("writes if forced with :saveas!", function() {
            openEx();
            submitNormalModeInputText("saveas! " + existsPath);
            expect(atom.notifications.notifications).toEqual([]);
            return expect(fs.readFileSync(existsPath, 'utf-8')).toEqual('abc\ndef');
          });
        });
      });
    });
    describe(":quit", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'destroyActiveItem').andCallThrough();
          return atom.workspace.open();
        });
      });
      it("closes the active pane item if not modified", function() {
        openEx();
        submitNormalModeInputText('quit');
        expect(pane.destroyActiveItem).toHaveBeenCalled();
        return expect(pane.getItems().length).toBe(1);
      });
      return describe("when the active pane item is modified", function() {
        beforeEach(function() {
          return editor.getBuffer().setText('def');
        });
        return it("opens the prompt to save", function() {
          spyOn(pane, 'promptToSaveItem');
          openEx();
          submitNormalModeInputText('quit');
          return expect(pane.promptToSaveItem).toHaveBeenCalled();
        });
      });
    });
    describe(":quitall", function() {
      return it("closes Atom", function() {
        spyOn(atom, 'close');
        openEx();
        submitNormalModeInputText('quitall');
        return expect(atom.close).toHaveBeenCalled();
      });
    });
    describe(":tabclose", function() {
      return it("acts as an alias to :quit", function() {
        var ref1;
        spyOn(Ex, 'tabclose').andCallThrough();
        spyOn(Ex, 'quit').andCallThrough();
        openEx();
        submitNormalModeInputText('tabclose');
        return (ref1 = expect(Ex.quit)).toHaveBeenCalledWith.apply(ref1, Ex.tabclose.calls[0].args);
      });
    });
    describe(":tabnext", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the next tab", function() {
        pane.activateItemAtIndex(1);
        openEx();
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(2);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(pane.getItems().length - 1);
        openEx();
        submitNormalModeInputText('tabnext');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
    });
    describe(":tabprevious", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return waitsForPromise(function() {
          pane = atom.workspace.getActivePane();
          return atom.workspace.open().then(function() {
            return atom.workspace.open();
          }).then(function() {
            return atom.workspace.open();
          });
        });
      });
      it("switches to the previous tab", function() {
        pane.activateItemAtIndex(1);
        openEx();
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(0);
      });
      return it("wraps around", function() {
        pane.activateItemAtIndex(0);
        openEx();
        submitNormalModeInputText('tabprevious');
        return expect(pane.getActiveItemIndex()).toBe(pane.getItems().length - 1);
      });
    });
    describe(":wq", function() {
      beforeEach(function() {
        spyOn(Ex, 'write').andCallThrough();
        return spyOn(Ex, 'quit');
      });
      it("writes the file, then quits", function() {
        spyOn(atom, 'showSaveDialogSync').andReturn(projectPath('wq-1'));
        openEx();
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
      it("doesn't quit when the file is new and no path is specified in the save dialog", function() {
        var wasNotCalled;
        spyOn(atom, 'showSaveDialogSync').andReturn(void 0);
        openEx();
        submitNormalModeInputText('wq');
        expect(Ex.write).toHaveBeenCalled();
        wasNotCalled = false;
        setImmediate((function() {
          return wasNotCalled = !Ex.quit.wasCalled;
        }));
        return waitsFor((function() {
          return wasNotCalled;
        }), 100);
      });
      return it("passes the file name", function() {
        openEx();
        submitNormalModeInputText('wq wq-2');
        expect(Ex.write).toHaveBeenCalled();
        expect(Ex.write.calls[0].args[0].args.trim()).toEqual('wq-2');
        return waitsFor((function() {
          return Ex.quit.wasCalled;
        }), "the :quit command to be called", 100);
      });
    });
    describe(":xit", function() {
      return it("acts as an alias to :wq", function() {
        spyOn(Ex, 'wq');
        openEx();
        submitNormalModeInputText('xit');
        return expect(Ex.wq).toHaveBeenCalled();
      });
    });
    describe(":x", function() {
      return it("acts as an alias to :xit", function() {
        spyOn(Ex, 'xit');
        openEx();
        submitNormalModeInputText('x');
        return expect(Ex.xit).toHaveBeenCalled();
      });
    });
    describe(":wqall", function() {
      return it("calls :wall, then :quitall", function() {
        spyOn(Ex, 'wall');
        spyOn(Ex, 'quitall');
        openEx();
        submitNormalModeInputText('wqall');
        expect(Ex.wall).toHaveBeenCalled();
        return expect(Ex.quitall).toHaveBeenCalled();
      });
    });
    describe(":edit", function() {
      describe("without a file name", function() {
        it("reloads the file from the disk", function() {
          var filePath;
          filePath = projectPath("edit-1");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit');
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 100);
        });
        it("doesn't reload when the file has been modified", function() {
          var filePath, isntDef;
          filePath = projectPath("edit-2");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No write since last change (add ! to override)');
          isntDef = false;
          setImmediate(function() {
            return isntDef = editor.getText() !== 'def';
          });
          return waitsFor((function() {
            return isntDef;
          }), "the editor's content not to change", 50);
        });
        it("reloads when the file has been modified and it is forced", function() {
          var filePath;
          filePath = projectPath("edit-3");
          editor.getBuffer().setText('abc');
          editor.saveAs(filePath);
          editor.getBuffer().setText('abcd');
          fs.writeFileSync(filePath, 'def');
          openEx();
          submitNormalModeInputText('edit!');
          expect(atom.notifications.notifications.length).toBe(0);
          return waitsFor((function() {
            return editor.getText() === 'def';
          }), "the editor's content to change", 50);
        });
        return it("throws an error when editing a new file", function() {
          editor.getBuffer().reload();
          openEx();
          submitNormalModeInputText('edit');
          expect(atom.notifications.notifications[0].message).toEqual('Command error: No file name');
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText('edit!');
          return expect(atom.notifications.notifications[1].message).toEqual('Command error: No file name');
        });
      });
      return describe("with a file name", function() {
        beforeEach(function() {
          spyOn(atom.workspace, 'open');
          return editor.getBuffer().reload();
        });
        it("opens the specified path", function() {
          var filePath;
          filePath = projectPath('edit-new-test');
          openEx();
          submitNormalModeInputText("edit " + filePath);
          return expect(atom.workspace.open).toHaveBeenCalledWith(filePath);
        });
        it("opens a relative path", function() {
          openEx();
          submitNormalModeInputText('edit edit-relative-test');
          return expect(atom.workspace.open).toHaveBeenCalledWith(projectPath('edit-relative-test'));
        });
        return it("throws an error if trying to open more than one file", function() {
          openEx();
          submitNormalModeInputText('edit edit-new-test-1 edit-new-test-2');
          expect(atom.workspace.open.callCount).toBe(0);
          return expect(atom.notifications.notifications[0].message).toEqual('Command error: Only one file name allowed');
        });
      });
    });
    describe(":tabedit", function() {
      it("acts as an alias to :edit if supplied with a path", function() {
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'edit');
        openEx();
        submitNormalModeInputText('tabedit tabedit-test');
        return (ref1 = expect(Ex.edit)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
      });
      return it("acts as an alias to :tabnew if not supplied with a path", function() {
        var ref1;
        spyOn(Ex, 'tabedit').andCallThrough();
        spyOn(Ex, 'tabnew');
        openEx();
        submitNormalModeInputText('tabedit  ');
        return (ref1 = expect(Ex.tabnew)).toHaveBeenCalledWith.apply(ref1, Ex.tabedit.calls[0].args);
      });
    });
    describe(":tabnew", function() {
      it("opens a new tab", function() {
        spyOn(atom.workspace, 'open');
        openEx();
        submitNormalModeInputText('tabnew');
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
      return it("opens a new tab for editing when provided an argument", function() {
        var ref1;
        spyOn(Ex, 'tabnew').andCallThrough();
        spyOn(Ex, 'tabedit');
        openEx();
        submitNormalModeInputText('tabnew tabnew-test');
        return (ref1 = expect(Ex.tabedit)).toHaveBeenCalledWith.apply(ref1, Ex.tabnew.calls[0].args);
      });
    });
    describe(":split", function() {
      return it("splits the current file upwards/downward", function() {
        var filePath, pane;
        pane = atom.workspace.getActivePane();
        if (atom.config.get('ex-mode.splitbelow')) {
          spyOn(pane, 'splitDown').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitDown).toHaveBeenCalled();
        } else {
          spyOn(pane, 'splitUp').andCallThrough();
          filePath = projectPath('split');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('split');
          return expect(pane.splitUp).toHaveBeenCalled();
        }
      });
    });
    describe(":vsplit", function() {
      return it("splits the current file to the left/right", function() {
        var filePath, pane;
        if (atom.config.get('ex-mode.splitright')) {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitRight').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        } else {
          pane = atom.workspace.getActivePane();
          spyOn(pane, 'splitLeft').andCallThrough();
          filePath = projectPath('vsplit');
          editor.saveAs(filePath);
          openEx();
          submitNormalModeInputText('vsplit');
          return expect(pane.splitLeft).toHaveBeenCalled();
        }
      });
    });
    describe(":delete", function() {
      beforeEach(function() {
        editor.setText('abc\ndef\nghi\njkl');
        return editor.setCursorBufferPosition([2, 0]);
      });
      it("deletes the current line", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(editor.getText()).toEqual('abc\ndef\njkl');
      });
      it("copies the deleted text", function() {
        openEx();
        submitNormalModeInputText('delete');
        return expect(atom.clipboard.read()).toEqual('ghi\n');
      });
      it("deletes the lines in the given range", function() {
        var processedOpStack;
        processedOpStack = false;
        exState.onDidProcessOpStack(function() {
          return processedOpStack = true;
        });
        openEx();
        submitNormalModeInputText('1,2delete');
        expect(editor.getText()).toEqual('ghi\njkl');
        waitsFor(function() {
          return processedOpStack;
        });
        editor.setText('abc\ndef\nghi\njkl');
        editor.setCursorBufferPosition([1, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(',/k/delete');
        return expect(editor.getText()).toEqual('abc\n');
      });
      return it("undos deleting several lines at once", function() {
        openEx();
        submitNormalModeInputText('-1,.delete');
        expect(editor.getText()).toEqual('abc\njkl');
        atom.commands.dispatch(editorElement, 'core:undo');
        return expect(editor.getText()).toEqual('abc\ndef\nghi\njkl');
      });
    });
    describe(":substitute", function() {
      beforeEach(function() {
        editor.setText('abcaABC\ndefdDEF\nabcaABC');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("replaces a character on the current line", function() {
        openEx();
        submitNormalModeInputText(':substitute /a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("doesn't need a space before the arguments", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      it("respects modifiers passed to it", function() {
        openEx();
        submitNormalModeInputText(':substitute/a/x/g');
        expect(editor.getText()).toEqual('xbcxABC\ndefdDEF\nabcaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':substitute/a/x/gi');
        return expect(editor.getText()).toEqual('xbcxxBC\ndefdDEF\nabcaABC');
      });
      it("replaces on multiple lines", function() {
        openEx();
        submitNormalModeInputText(':%substitute/abc/ghi');
        expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nghiaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText(':%substitute/abc/ghi/ig');
        return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nghiaghi');
      });
      it("set gdefault option", function() {
        openEx();
        atom.config.set('ex-mode.gdefault', true);
        submitNormalModeInputText(':substitute/a/x');
        expect(editor.getText()).toEqual('xbcxABC\ndefdDEF\nabcaABC');
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        atom.config.set('ex-mode.gdefault', true);
        submitNormalModeInputText(':substitute/a/x/g');
        return expect(editor.getText()).toEqual('xbcaABC\ndefdDEF\nabcaABC');
      });
      describe(":yank", function() {
        beforeEach(function() {
          editor.setText('abc\ndef\nghi\njkl');
          return editor.setCursorBufferPosition([2, 0]);
        });
        it("yanks the current line", function() {
          openEx();
          submitNormalModeInputText('yank');
          return expect(atom.clipboard.read()).toEqual('ghi\n');
        });
        return it("yanks the lines in the given range", function() {
          openEx();
          submitNormalModeInputText('1,2yank');
          return expect(atom.clipboard.read()).toEqual('abc\ndef\n');
        });
      });
      describe("illegal delimiters", function() {
        var test;
        test = function(delim) {
          openEx();
          submitNormalModeInputText(":substitute " + delim + "a" + delim + "x" + delim + "gi");
          expect(atom.notifications.notifications[0].message).toEqual("Command error: Regular expressions can't be delimited by alphanumeric characters, '\\', '\"' or '|'");
          return expect(editor.getText()).toEqual('abcaABC\ndefdDEF\nabcaABC');
        };
        it("can't be delimited by letters", function() {
          return test('n');
        });
        it("can't be delimited by numbers", function() {
          return test('3');
        });
        it("can't be delimited by '\\'", function() {
          return test('\\');
        });
        it("can't be delimited by '\"'", function() {
          return test('"');
        });
        return it("can't be delimited by '|'", function() {
          return test('|');
        });
      });
      describe("empty replacement", function() {
        beforeEach(function() {
          return editor.setText('abcabc\nabcabc');
        });
        it("removes the pattern without modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//");
          return expect(editor.getText()).toEqual('abc\nabcabc');
        });
        return it("removes the pattern with modifiers", function() {
          openEx();
          submitNormalModeInputText(":substitute/abc//g");
          return expect(editor.getText()).toEqual('\nabcabc');
        });
      });
      describe("replacing with escape sequences", function() {
        var test;
        beforeEach(function() {
          return editor.setText('abc,def,ghi');
        });
        test = function(escapeChar, escaped) {
          openEx();
          submitNormalModeInputText(":substitute/,/\\" + escapeChar + "/g");
          return expect(editor.getText()).toEqual("abc" + escaped + "def" + escaped + "ghi");
        };
        it("replaces with a tab", function() {
          return test('t', '\t');
        });
        it("replaces with a linefeed", function() {
          return test('n', '\n');
        });
        return it("replaces with a carriage return", function() {
          return test('r', '\r');
        });
      });
      describe("case sensitivity", function() {
        describe("respects the smartcase setting", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is off and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is on and the pattern is lowercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/abc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("uses case sensitive search if smartcase is on and the pattern is uppercase", function() {
            editor.setText('abcaABC\ndefdDEF\nabcaABC');
            openEx();
            submitNormalModeInputText(':substitute/ABC/ghi/g');
            return expect(editor.getText()).toEqual('abcaghi\ndefdDEF\nabcaABC');
          });
        });
        return describe("\\c and \\C in the pattern", function() {
          beforeEach(function() {
            return editor.setText('abcaABC\ndefdDEF\nabcaABC');
          });
          it("uses case insensitive search if smartcase is off and \c is in the pattern", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/abc\\c/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("doesn't matter where in the pattern \\c is", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', false);
            openEx();
            submitNormalModeInputText(':substitute/a\\cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("uses case sensitive search if smartcase is on, \\C is in the pattern and the pattern is lowercase", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cbc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\C comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\Cb\\cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          it("overrides \\C with \\c if \\c comes first", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/a\\cb\\Cc/ghi/g');
            return expect(editor.getText()).toEqual('ghiaghi\ndefdDEF\nabcaABC');
          });
          return it("overrides an appended /i flag with \\C", function() {
            atom.config.set('vim-mode.useSmartcaseForSearch', true);
            openEx();
            submitNormalModeInputText(':substitute/ab\\Cc/ghi/gi');
            return expect(editor.getText()).toEqual('ghiaABC\ndefdDEF\nabcaABC');
          });
        });
      });
      return describe("capturing groups", function() {
        beforeEach(function() {
          return editor.setText('abcaABC\ndefdDEF\nabcaABC');
        });
        it("replaces \\1 with the first group", function() {
          openEx();
          submitNormalModeInputText(':substitute/bc(.{2})/X\\1X');
          return expect(editor.getText()).toEqual('aXaAXBC\ndefdDEF\nabcaABC');
        });
        it("replaces multiple groups", function() {
          openEx();
          submitNormalModeInputText(':substitute/a([a-z]*)aA([A-Z]*)/X\\1XY\\2Y');
          return expect(editor.getText()).toEqual('XbcXYBCY\ndefdDEF\nabcaABC');
        });
        return it("replaces \\0 with the entire match", function() {
          openEx();
          submitNormalModeInputText(':substitute/ab(ca)AB/X\\0X');
          return expect(editor.getText()).toEqual('XabcaABXC\ndefdDEF\nabcaABC');
        });
      });
    });
    describe(":set", function() {
      it("throws an error without a specified option", function() {
        openEx();
        submitNormalModeInputText(':set');
        return expect(atom.notifications.notifications[0].message).toEqual('Command error: No option specified');
      });
      it("sets multiple options at once", function() {
        atom.config.set('editor.showInvisibles', false);
        atom.config.set('editor.showLineNumbers', false);
        openEx();
        submitNormalModeInputText(':set list number');
        expect(atom.config.get('editor.showInvisibles')).toBe(true);
        return expect(atom.config.get('editor.showLineNumbers')).toBe(true);
      });
      return describe("the options", function() {
        beforeEach(function() {
          atom.config.set('editor.showInvisibles', false);
          return atom.config.set('editor.showLineNumbers', false);
        });
        it("sets (no)list", function() {
          openEx();
          submitNormalModeInputText(':set list');
          expect(atom.config.get('editor.showInvisibles')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nolist');
          return expect(atom.config.get('editor.showInvisibles')).toBe(false);
        });
        it("sets (no)nu(mber)", function() {
          openEx();
          submitNormalModeInputText(':set nu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonu');
          expect(atom.config.get('editor.showLineNumbers')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set number');
          expect(atom.config.get('editor.showLineNumbers')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nonumber');
          return expect(atom.config.get('editor.showLineNumbers')).toBe(false);
        });
        it("sets (no)sp(lit)r(ight)", function() {
          openEx();
          submitNormalModeInputText(':set spr');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nospr');
          expect(atom.config.get('ex-mode.splitright')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitright');
          expect(atom.config.get('ex-mode.splitright')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitright');
          return expect(atom.config.get('ex-mode.splitright')).toBe(false);
        });
        it("sets (no)s(plit)b(elow)", function() {
          openEx();
          submitNormalModeInputText(':set sb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosb');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set splitbelow');
          expect(atom.config.get('ex-mode.splitbelow')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nosplitbelow');
          return expect(atom.config.get('ex-mode.splitbelow')).toBe(false);
        });
        it("sets (no)s(mart)c(a)s(e)", function() {
          openEx();
          submitNormalModeInputText(':set scs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set noscs');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
          openEx();
          submitNormalModeInputText(':set smartcase');
          expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(true);
          openEx();
          submitNormalModeInputText(':set nosmartcase');
          return expect(atom.config.get('vim-mode.useSmartcaseForSearch')).toBe(false);
        });
        return it("sets (no)gdefault", function() {
          openEx();
          submitNormalModeInputText(':set gdefault');
          expect(atom.config.get('ex-mode.gdefault')).toBe(true);
          atom.commands.dispatch(editorElement, 'ex-mode:open');
          submitNormalModeInputText(':set nogdefault');
          return expect(atom.config.get('ex-mode.gdefault')).toBe(false);
        });
      });
    });
    describe("aliases", function() {
      it("calls the aliased function without arguments", function() {
        ExClass.registerAlias('W', 'w');
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        return expect(Ex.write).toHaveBeenCalled();
      });
      return it("calls the aliased function with arguments", function() {
        var WArgs, writeArgs;
        ExClass.registerAlias('W', 'write');
        spyOn(Ex, 'W').andCallThrough();
        spyOn(Ex, 'write');
        openEx();
        submitNormalModeInputText('W');
        WArgs = Ex.W.calls[0].args[0];
        writeArgs = Ex.write.calls[0].args[0];
        return expect(WArgs).toBe(writeArgs);
      });
    });
    describe("with selections", function() {
      it("executes on the selected range", function() {
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        return expect(Ex.s.calls[0].args[0].range).toEqual([0, 2]);
      });
      return it("calls the functions multiple times if there are multiple selections", function() {
        var calls;
        spyOn(Ex, 's');
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToBufferPosition([2, 1]);
        editor.addCursorAtBufferPosition([3, 0]);
        editor.selectToBufferPosition([3, 2]);
        atom.commands.dispatch(editorElement, 'ex-mode:open');
        submitNormalModeInputText("'<,'>s/abc/def");
        calls = Ex.s.calls;
        expect(calls.length).toEqual(2);
        expect(calls[0].args[0].range).toEqual([0, 2]);
        return expect(calls[1].args[0].range).toEqual([3, 3]);
      });
    });
    return describe(':sort', function() {
      beforeEach(function() {
        editor.setText('ghi\nabc\njkl\ndef\n142\nzzz\n91xfds9\n');
        return editor.setCursorBufferPosition([0, 0]);
      });
      it("sorts entire file if range is not multi-line", function() {
        openEx();
        submitNormalModeInputText('sort');
        return expect(editor.getText()).toEqual('142\n91xfds9\nabc\ndef\nghi\njkl\nzzz\n');
      });
      return it("sorts specific range if range is multi-line", function() {
        openEx();
        submitNormalModeInputText('2,4sort');
        return expect(editor.getText()).toEqual('ghi\nabc\ndef\njkl\n142\nzzz\n91xfds9\n');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9leC1tb2RlL3NwZWMvZXgtY29tbWFuZHMtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsV0FBUjs7RUFDUCxPQUFBLEdBQVUsT0FBQSxDQUFRLGVBQVI7O0VBRVYsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztFQUNWLEVBQUEsR0FBSyxPQUFPLENBQUMsU0FBUixDQUFBOztFQUVMLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLE1BQXdELEVBQXhELEVBQUMsZUFBRCxFQUFTLHNCQUFULEVBQXdCLGlCQUF4QixFQUFrQyxnQkFBbEMsRUFBMkMsWUFBM0MsRUFBZ0Q7SUFDaEQsV0FBQSxHQUFjLFNBQUMsUUFBRDthQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLFFBQWY7SUFBZDtJQUNkLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsZUFBMUI7TUFDVixNQUFBLEdBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFkLENBQTBCLFNBQTFCO01BQ1QsZUFBQSxDQUFnQixTQUFBO0FBQ2QsWUFBQTtRQUFBLGlCQUFBLEdBQW9CLE1BQU0sQ0FBQyxRQUFQLENBQUE7UUFDcEIsT0FBTyxDQUFDLGNBQVIsQ0FBQTtlQUNBO01BSGMsQ0FBaEI7TUFLQSxJQUFBLENBQUssU0FBQTtlQUNILEtBQUEsQ0FBTSxNQUFNLENBQUMsVUFBVSxDQUFDLGFBQXhCLEVBQXVDLFFBQXZDLENBQWdELENBQUMs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Q0FBNUI7V0FzQkEsUUFBQSxDQUFTLE9BQVQsRUFBa0IsU0FBQTtNQUNoQixVQUFBLENBQVcsU0FBQTtRQUNULE1BQU0sQ0FBQyxPQUFQLENBQWUseUNBQWY7ZUFDQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEvQjtNQUZTLENBQVg7TUFJQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQTtRQUNqRCxNQUFBLENBQUE7UUFDQSx5QkFBQSxDQUEwQixNQUExQjtlQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyx5Q0FBakM7TUFIaUQsQ0FBbkQ7YUFLQSxFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQTtRQUNoRCxNQUFBLENBQUE7UUFDQSx5QkFBQSxDQUEwQixTQUExQjtlQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxPQUF6QixDQUFpQyx5Q0FBakM7TUFIZ0QsQ0FBbEQ7SUFWZ0IsQ0FBbEI7RUFwK0J1QixDQUF6QjtBQVRBIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5vcyA9IHJlcXVpcmUgJ29zJ1xudXVpZCA9IHJlcXVpcmUgJ25vZGUtdXVpZCdcbmhlbHBlcnMgPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5FeENsYXNzID0gcmVxdWlyZSgnLi4vbGliL2V4JylcbkV4ID0gRXhDbGFzcy5zaW5nbGV0b24oKVxuXG5kZXNjcmliZSBcInRoZSBjb21tYW5kc1wiLCAtPlxuICBbZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZSwgZXhTdGF0ZSwgZGlyLCBkaXIyXSA9IFtdXG4gIHByb2plY3RQYXRoID0gKGZpbGVOYW1lKSAtPiBwYXRoLmpvaW4oZGlyLCBmaWxlTmFtZSlcbiAgYmVmb3JlRWFjaCAtPlxuICAgIHZpbU1vZGUgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJylcbiAgICBleE1vZGUgPSBhdG9tLnBhY2thZ2VzLmxvYWRQYWNrYWdlKCdleC1tb2RlJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGFjdGl2YXRpb25Qcm9taXNlID0gZXhNb2RlLmFjdGl2YXRlKClcbiAgICAgIGhlbHBlcnMuYWN0aXZhdGVFeE1vZGUoKVxuICAgICAgYWN0aXZhdGlvblByb21pc2VcblxuICAgIHJ1bnMgLT5cbiAgICAgIHNweU9uKGV4TW9kZS5tYWluTW9kdWxlLmdsb2JhbEV4U3RhdGUsICdzZXRWaW0nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIHZpbU1vZGUuYWN0aXZhdGUoKVxuXG4gICAgd2FpdHNGb3IgLT5cbiAgICAgIGV4TW9kZS5tYWluTW9kdWxlLmdsb2JhbEV4U3RhdGUuc2V0VmltLmNhbGxzLmxlbmd0aCA+IDBcblxuICAgIHJ1bnMgLT5cbiAgICAgIGRpciA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgXCJhdG9tLWV4LW1vZGUtc3BlYy0je3V1aWQudjQoKX1cIilcbiAgICAgIGRpcjIgPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIFwiYXRvbS1leC1tb2RlLXNwZWMtI3t1dWlkLnY0KCl9XCIpXG4gICAgICBmcy5tYWtlVHJlZVN5bmMoZGlyKVxuICAgICAgZnMubWFrZVRyZWVTeW5jKGRpcjIpXG4gICAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW2RpciwgZGlyMl0pXG5cbiAgICAgIGhlbHBlcnMuZ2V0RWRpdG9yRWxlbWVudCAoZWxlbWVudCkgLT5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlbGVtZW50LCBcImV4LW1vZGU6b3BlblwiKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVsZW1lbnQuZ2V0TW9kZWwoKS5ub3JtYWxNb2RlSW5wdXRWaWV3LmVkaXRvckVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjb3JlOmNhbmNlbFwiKVxuICAgICAgICBlZGl0b3JFbGVtZW50ID0gZWxlbWVudFxuICAgICAgICBlZGl0b3IgPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgICAgICAgdmltU3RhdGUgPSB2aW1Nb2RlLm1haW5Nb2R1bGUuZ2V0RWRpdG9yU3RhdGUoZWRpdG9yKVxuICAgICAgICBleFN0YXRlID0gZXhNb2RlLm1haW5Nb2R1bGUuZXhTdGF0ZXMuZ2V0KGVkaXRvcilcbiAgICAgICAgdmltU3RhdGUucmVzZXROb3JtYWxNb2RlKClcbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJhYmNcXG5kZWZcXG5hYmNcXG5kZWZcIilcblxuICBhZnRlckVhY2ggLT5cbiAgICBmcy5yZW1vdmVTeW5jKGRpcilcbiAgICBmcy5yZW1vdmVTeW5jKGRpcjIpXG5cbiAga2V5ZG93biA9IChrZXksIG9wdGlvbnM9e30pIC0+XG4gICAgb3B0aW9ucy5lbGVtZW50ID89IGVkaXRvckVsZW1lbnRcbiAgICBoZWxwZXJzLmtleWRvd24oa2V5LCBvcHRpb25zKVxuXG4gIG5vcm1hbE1vZGVJbnB1dEtleWRvd24gPSAoa2V5LCBvcHRzID0ge30pIC0+XG4gICAgZWRpdG9yLm5vcm1hbE1vZGVJbnB1dFZpZXcuZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLnNldFRleHQoa2V5KVxuXG4gIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgPSAodGV4dCkgLT5cbiAgICBjb21tYW5kRWRpdG9yID0gZWRpdG9yLm5vcm1hbE1vZGVJbnB1dFZpZXcuZWRpdG9yRWxlbWVudFxuICAgIGNvbW1hbmRFZGl0b3IuZ2V0TW9kZWwoKS5zZXRUZXh0KHRleHQpXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChjb21tYW5kRWRpdG9yLCBcImNvcmU6Y29uZmlybVwiKVxuXG4gIG9wZW5FeCA9IC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCBcImV4LW1vZGU6b3BlblwiKVxuXG4gIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGEgc3BlY2lmaWMgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzInXG5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMSwgMF1cblxuICAgIGl0IFwibW92ZXMgdG8gdGhlIHNlY29uZCBhZGRyZXNzXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnMSwzJ1xuXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzIsIDBdXG5cbiAgICBpdCBcIndvcmtzIHdpdGggb2Zmc2V0c1wiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzIrMSdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMiwgMF1cblxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJy0yJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAwXVxuXG4gICAgaXQgXCJsaW1pdHMgdG8gdGhlIGxhc3QgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzEwJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFszLCAwXVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzMsMTAnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzMsIDBdXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnJCsxMDAwJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFszLCAwXVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGl0IFwiZ29lcyB0byB0aGUgZmlyc3QgbGluZSB3aXRoIGFkZHJlc3MgMFwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsyLCAwXSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcwJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAwXVxuXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDBdKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJzAsMCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIHdoZW4gdGhlIGFkZHJlc3MgaXMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJy4nXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDBdXG5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcsJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAwXVxuXG4gICAgaXQgXCJtb3ZlcyB0byB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnJCdcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMywgMF1cblxuICAgIGl0IFwibW92ZXMgdG8gYSBtYXJrJ3MgbGluZVwiLCAtPlxuICAgICAga2V5ZG93bignbCcpXG4gICAgICBrZXlkb3duKCdtJylcbiAgICAgIG5vcm1hbE1vZGVJbnB1dEtleWRvd24gJ2EnXG4gICAgICBrZXlkb3duKCdqJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0IFwiJ2FcIlxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAwXVxuXG4gICAgaXQgXCJtb3ZlcyB0byBhIHNwZWNpZmllZCBzZWFyY2hcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0ICcvZGVmJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsxLCAwXVxuXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDBdKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQgJz9kZWYnXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzEsIDBdXG5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMywgMF0pXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCAnL2VmJ1xuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFsxLCAwXVxuXG4gIGRlc2NyaWJlIFwiOndyaXRlXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGVkaXRpbmcgYSBuZXcgZmlsZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjXFxuZGVmJylcblxuICAgICAgaXQgXCJvcGVucyB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dyaXRlJylcbiAgICAgICAgZXhwZWN0KGF0b20uc2hvd1NhdmVEaWFsb2dTeW5jKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgICAgaXQgXCJzYXZlcyB3aGVuIGEgcGF0aCBpcyBzcGVjaWZpZWQgaW4gdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3dyaXRlLWZyb20tc2F2ZS1kaWFsb2cnKVxuICAgICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cml0ZScpXG4gICAgICAgIGV4cGVjdChmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSkudG9CZSh0cnVlKVxuICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCAndXRmLTgnKSkudG9FcXVhbCgnYWJjXFxuZGVmJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5pc01vZGlmaWVkKCkpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGl0IFwic2F2ZXMgd2hlbiBhIHBhdGggaXMgc3BlY2lmaWVkIGluIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKHVuZGVmaW5lZClcbiAgICAgICAgc3B5T24oZnMsICd3cml0ZUZpbGVTeW5jJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3JpdGUnKVxuICAgICAgICBleHBlY3QoZnMud3JpdGVGaWxlU3luYy5jYWxscy5sZW5ndGgpLnRvQmUoMClcblxuICAgIGRlc2NyaWJlIFwid2hlbiBlZGl0aW5nIGFuIGV4aXN0aW5nIGZpbGVcIiwgLT5cbiAgICAgIGZpbGVQYXRoID0gJydcbiAgICAgIGkgPSAwXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgaSsrXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJ3cml0ZS0je2l9XCIpXG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNcXG5kZWYnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuXG4gICAgICBpdCBcInNhdmVzIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd3cml0ZScpXG4gICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmMnKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmlzTW9kaWZpZWQoKSkudG9CZShmYWxzZSlcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGEgc3BlY2lmaWVkIHBhdGhcIiwgLT5cbiAgICAgICAgbmV3UGF0aCA9ICcnXG5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLnJlbGF0aXZlKGRpciwgXCIje2ZpbGVQYXRofS5uZXdcIilcbiAgICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjJylcbiAgICAgICAgICBvcGVuRXgoKVxuXG4gICAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJ3cml0ZSAje25ld1BhdGh9XCIpXG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGgucmVzb2x2ZShkaXIsIGZzLm5vcm1hbGl6ZShuZXdQYXRoKSlcbiAgICAgICAgICBleHBlY3QoZnMuZXhpc3RzU3luYyhuZXdQYXRoKSkudG9CZSh0cnVlKVxuICAgICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMobmV3UGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiYycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5pc01vZGlmaWVkKCkpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBmcy5yZW1vdmVTeW5jKG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJzYXZlcyB0byB0aGUgcGF0aFwiLCAtPlxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyAuXCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignLicsIG5ld1BhdGgpXG5cbiAgICAgICAgaXQgXCJleHBhbmRzIC4uXCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignLi4nLCBuZXdQYXRoKVxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyB+XCIsIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGguam9pbignficsIG5ld1BhdGgpXG5cbiAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIHdpdGggbW9yZSB0aGFuIG9uZSBwYXRoXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dyaXRlIHBhdGgxIHBhdGgyJylcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IE9ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJ1xuICAgICAgICApXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgZmlsZSBhbHJlYWR5IGV4aXN0c1wiLCAtPlxuICAgICAgICBleGlzdHNQYXRoID0gJydcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZXhpc3RzUGF0aCA9IHByb2plY3RQYXRoKCd3cml0ZS1leGlzdHMnKVxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZXhpc3RzUGF0aCwgJ2FiYycpXG5cbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgZnMucmVtb3ZlU3luYyhleGlzdHNQYXRoKVxuXG4gICAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaWxlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwid3JpdGUgI3tleGlzdHNQYXRofVwiKVxuICAgICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IEZpbGUgZXhpc3RzIChhZGQgISB0byBvdmVycmlkZSknXG4gICAgICAgICAgKVxuICAgICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZXhpc3RzUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiYycpXG5cbiAgICAgICAgaXQgXCJ3cml0ZXMgaWYgZm9yY2VkIHdpdGggOndyaXRlIVwiLCAtPlxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIndyaXRlISAje2V4aXN0c1BhdGh9XCIpXG4gICAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zKS50b0VxdWFsKFtdKVxuICAgICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZXhpc3RzUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiY1xcbmRlZicpXG5cbiAgZGVzY3JpYmUgXCI6d2FsbFwiLCAtPlxuICAgIGl0IFwic2F2ZXMgYWxsXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ3NhdmVBbGwnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dhbGwnKVxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLnNhdmVBbGwpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiOnNhdmVhc1wiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBlZGl0aW5nIGEgbmV3IGZpbGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiY1xcbmRlZicpXG5cbiAgICAgIGl0IFwib3BlbnMgdGhlIHNhdmUgZGlhbG9nXCIsIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzYXZlYXMnKVxuICAgICAgICBleHBlY3QoYXRvbS5zaG93U2F2ZURpYWxvZ1N5bmMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBpdCBcInNhdmVzIHdoZW4gYSBwYXRoIGlzIHNwZWNpZmllZCBpbiB0aGUgc2F2ZSBkaWFsb2dcIiwgLT5cbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgnc2F2ZWFzLWZyb20tc2F2ZS1kaWFsb2cnKVxuICAgICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzYXZlYXMnKVxuICAgICAgICBleHBlY3QoZnMuZXhpc3RzU3luYyhmaWxlUGF0aCkpLnRvQmUodHJ1ZSlcbiAgICAgICAgZXhwZWN0KGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiY1xcbmRlZicpXG5cbiAgICAgIGl0IFwic2F2ZXMgd2hlbiBhIHBhdGggaXMgc3BlY2lmaWVkIGluIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgICBzcHlPbihhdG9tLCAnc2hvd1NhdmVEaWFsb2dTeW5jJykuYW5kUmV0dXJuKHVuZGVmaW5lZClcbiAgICAgICAgc3B5T24oZnMsICd3cml0ZUZpbGVTeW5jJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc2F2ZWFzJylcbiAgICAgICAgZXhwZWN0KGZzLndyaXRlRmlsZVN5bmMuY2FsbHMubGVuZ3RoKS50b0JlKDApXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZWRpdGluZyBhbiBleGlzdGluZyBmaWxlXCIsIC0+XG4gICAgICBmaWxlUGF0aCA9ICcnXG4gICAgICBpID0gMFxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGkrK1xuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKFwic2F2ZWFzLSN7aX1cIilcbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZicpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG5cbiAgICAgIGl0IFwiY29tcGxhaW5zIGlmIG5vIHBhdGggZ2l2ZW5cIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiYycpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NhdmVhcycpXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBBcmd1bWVudCByZXF1aXJlZCdcbiAgICAgICAgKVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggYSBzcGVjaWZpZWQgcGF0aFwiLCAtPlxuICAgICAgICBuZXdQYXRoID0gJydcblxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGgucmVsYXRpdmUoZGlyLCBcIiN7ZmlsZVBhdGh9Lm5ld1wiKVxuICAgICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmMnKVxuICAgICAgICAgIG9wZW5FeCgpXG5cbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcInNhdmVhcyAje25ld1BhdGh9XCIpXG4gICAgICAgICAgbmV3UGF0aCA9IHBhdGgucmVzb2x2ZShkaXIsIGZzLm5vcm1hbGl6ZShuZXdQYXRoKSlcbiAgICAgICAgICBleHBlY3QoZnMuZXhpc3RzU3luYyhuZXdQYXRoKSkudG9CZSh0cnVlKVxuICAgICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMobmV3UGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiYycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5pc01vZGlmaWVkKCkpLnRvQmUoZmFsc2UpXG4gICAgICAgICAgZnMucmVtb3ZlU3luYyhuZXdQYXRoKVxuXG4gICAgICAgIGl0IFwic2F2ZXMgdG8gdGhlIHBhdGhcIiwgLT5cblxuICAgICAgICBpdCBcImV4cGFuZHMgLlwiLCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4oJy4nLCBuZXdQYXRoKVxuXG4gICAgICAgIGl0IFwiZXhwYW5kcyAuLlwiLCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4oJy4uJywgbmV3UGF0aClcblxuICAgICAgICBpdCBcImV4cGFuZHMgflwiLCAtPlxuICAgICAgICAgIG5ld1BhdGggPSBwYXRoLmpvaW4oJ34nLCBuZXdQYXRoKVxuXG4gICAgICBpdCBcInRocm93cyBhbiBlcnJvciB3aXRoIG1vcmUgdGhhbiBvbmUgcGF0aFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzYXZlYXMgcGF0aDEgcGF0aDInKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogT25seSBvbmUgZmlsZSBuYW1lIGFsbG93ZWQnXG4gICAgICAgIClcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBmaWxlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgIGV4aXN0c1BhdGggPSAnJ1xuXG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBleGlzdHNQYXRoID0gcHJvamVjdFBhdGgoJ3NhdmVhcy1leGlzdHMnKVxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZXhpc3RzUGF0aCwgJ2FiYycpXG5cbiAgICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgICAgZnMucmVtb3ZlU3luYyhleGlzdHNQYXRoKVxuXG4gICAgICAgIGl0IFwidGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaWxlIGFscmVhZHkgZXhpc3RzXCIsIC0+XG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwic2F2ZWFzICN7ZXhpc3RzUGF0aH1cIilcbiAgICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAgICdDb21tYW5kIGVycm9yOiBGaWxlIGV4aXN0cyAoYWRkICEgdG8gb3ZlcnJpZGUpJ1xuICAgICAgICAgIClcbiAgICAgICAgICBleHBlY3QoZnMucmVhZEZpbGVTeW5jKGV4aXN0c1BhdGgsICd1dGYtOCcpKS50b0VxdWFsKCdhYmMnKVxuXG4gICAgICAgIGl0IFwid3JpdGVzIGlmIGZvcmNlZCB3aXRoIDpzYXZlYXMhXCIsIC0+XG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwic2F2ZWFzISAje2V4aXN0c1BhdGh9XCIpXG4gICAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zKS50b0VxdWFsKFtdKVxuICAgICAgICAgIGV4cGVjdChmcy5yZWFkRmlsZVN5bmMoZXhpc3RzUGF0aCwgJ3V0Zi04JykpLnRvRXF1YWwoJ2FiY1xcbmRlZicpXG5cbiAgZGVzY3JpYmUgXCI6cXVpdFwiLCAtPlxuICAgIHBhbmUgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgc3B5T24ocGFuZSwgJ2Rlc3Ryb3lBY3RpdmVJdGVtJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKClcblxuICAgIGl0IFwiY2xvc2VzIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGlmIG5vdCBtb2RpZmllZFwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3F1aXQnKVxuICAgICAgZXhwZWN0KHBhbmUuZGVzdHJveUFjdGl2ZUl0ZW0pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGgpLnRvQmUoMSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgYWN0aXZlIHBhbmUgaXRlbSBpcyBtb2RpZmllZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnZGVmJylcblxuICAgICAgaXQgXCJvcGVucyB0aGUgcHJvbXB0IHRvIHNhdmVcIiwgLT5cbiAgICAgICAgc3B5T24ocGFuZSwgJ3Byb21wdFRvU2F2ZUl0ZW0nKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdxdWl0JylcbiAgICAgICAgZXhwZWN0KHBhbmUucHJvbXB0VG9TYXZlSXRlbSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCI6cXVpdGFsbFwiLCAtPlxuICAgIGl0IFwiY2xvc2VzIEF0b21cIiwgLT5cbiAgICAgIHNweU9uKGF0b20sICdjbG9zZScpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgncXVpdGFsbCcpXG4gICAgICBleHBlY3QoYXRvbS5jbG9zZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCI6dGFiY2xvc2VcIiwgLT5cbiAgICBpdCBcImFjdHMgYXMgYW4gYWxpYXMgdG8gOnF1aXRcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAndGFiY2xvc2UnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ3F1aXQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFiY2xvc2UnKVxuICAgICAgZXhwZWN0KEV4LnF1aXQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKEV4LnRhYmNsb3NlLmNhbGxzWzBdLmFyZ3MuLi4pXG5cbiAgZGVzY3JpYmUgXCI6dGFibmV4dFwiLCAtPlxuICAgIHBhbmUgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4gLT4gYXRvbS53b3Jrc3BhY2Uub3BlbigpXG4gICAgICAgICAgLnRoZW4gLT4gYXRvbS53b3Jrc3BhY2Uub3BlbigpXG5cbiAgICBpdCBcInN3aXRjaGVzIHRvIHRoZSBuZXh0IHRhYlwiLCAtPlxuICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KDEpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFibmV4dCcpXG4gICAgICBleHBlY3QocGFuZS5nZXRBY3RpdmVJdGVtSW5kZXgoKSkudG9CZSgyKVxuXG4gICAgaXQgXCJ3cmFwcyBhcm91bmRcIiwgLT5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleChwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIC0gMSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJuZXh0JylcbiAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW1JbmRleCgpKS50b0JlKDApXG5cbiAgZGVzY3JpYmUgXCI6dGFicHJldmlvdXNcIiwgLT5cbiAgICBwYW5lID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKS50aGVuIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuICAgICAgICAgIC50aGVuIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oKVxuXG4gICAgaXQgXCJzd2l0Y2hlcyB0byB0aGUgcHJldmlvdXMgdGFiXCIsIC0+XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgoMSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJwcmV2aW91cycpXG4gICAgICBleHBlY3QocGFuZS5nZXRBY3RpdmVJdGVtSW5kZXgoKSkudG9CZSgwKVxuXG4gICAgaXQgXCJ3cmFwcyBhcm91bmRcIiwgLT5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCgwKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3RhYnByZXZpb3VzJylcbiAgICAgIGV4cGVjdChwYW5lLmdldEFjdGl2ZUl0ZW1JbmRleCgpKS50b0JlKHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggLSAxKVxuXG4gIGRlc2NyaWJlIFwiOndxXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oRXgsICd3cml0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKEV4LCAncXVpdCcpXG5cbiAgICBpdCBcIndyaXRlcyB0aGUgZmlsZSwgdGhlbiBxdWl0c1wiLCAtPlxuICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpLmFuZFJldHVybihwcm9qZWN0UGF0aCgnd3EtMScpKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dxJylcbiAgICAgIGV4cGVjdChFeC53cml0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAjIFNpbmNlIGA6d3FgIG9ubHkgY2FsbHMgYDpxdWl0YCBhZnRlciBgOndyaXRlYCBpcyBmaW5pc2hlZCwgd2UgbmVlZCB0b1xuICAgICAgIyAgd2FpdCBhIGJpdCBmb3IgdGhlIGA6cXVpdGAgY2FsbCB0byBvY2N1clxuICAgICAgd2FpdHNGb3IoKC0+IEV4LnF1aXQud2FzQ2FsbGVkKSwgXCJ0aGUgOnF1aXQgY29tbWFuZCB0byBiZSBjYWxsZWRcIiwgMTAwKVxuXG4gICAgaXQgXCJkb2Vzbid0IHF1aXQgd2hlbiB0aGUgZmlsZSBpcyBuZXcgYW5kIG5vIHBhdGggaXMgc3BlY2lmaWVkIGluIHRoZSBzYXZlIGRpYWxvZ1wiLCAtPlxuICAgICAgc3B5T24oYXRvbSwgJ3Nob3dTYXZlRGlhbG9nU3luYycpLmFuZFJldHVybih1bmRlZmluZWQpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnd3EnKVxuICAgICAgZXhwZWN0KEV4LndyaXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIHdhc05vdENhbGxlZCA9IGZhbHNlXG4gICAgICAjIEZJWE1FOiBUaGlzIHNlZW1zIGRhbmdlcm91cywgYnV0IHNldFRpbWVvdXQgc29tZWhvdyBkb2Vzbid0IHdvcmsuXG4gICAgICBzZXRJbW1lZGlhdGUoKC0+XG4gICAgICAgIHdhc05vdENhbGxlZCA9IG5vdCBFeC5xdWl0Lndhc0NhbGxlZCkpXG4gICAgICB3YWl0c0ZvcigoLT4gd2FzTm90Q2FsbGVkKSwgMTAwKVxuXG4gICAgaXQgXCJwYXNzZXMgdGhlIGZpbGUgbmFtZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dxIHdxLTInKVxuICAgICAgZXhwZWN0KEV4LndyaXRlKVxuICAgICAgICAudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QoRXgud3JpdGUuY2FsbHNbMF0uYXJnc1swXS5hcmdzLnRyaW0oKSkudG9FcXVhbCgnd3EtMicpXG4gICAgICB3YWl0c0ZvcigoLT4gRXgucXVpdC53YXNDYWxsZWQpLCBcInRoZSA6cXVpdCBjb21tYW5kIHRvIGJlIGNhbGxlZFwiLCAxMDApXG5cbiAgZGVzY3JpYmUgXCI6eGl0XCIsIC0+XG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDp3cVwiLCAtPlxuICAgICAgc3B5T24oRXgsICd3cScpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgneGl0JylcbiAgICAgIGV4cGVjdChFeC53cSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCI6eFwiLCAtPlxuICAgIGl0IFwiYWN0cyBhcyBhbiBhbGlhcyB0byA6eGl0XCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3hpdCcpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgneCcpXG4gICAgICBleHBlY3QoRXgueGl0KS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjp3cWFsbFwiLCAtPlxuICAgIGl0IFwiY2FsbHMgOndhbGwsIHRoZW4gOnF1aXRhbGxcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAnd2FsbCcpXG4gICAgICBzcHlPbihFeCwgJ3F1aXRhbGwnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3dxYWxsJylcbiAgICAgIGV4cGVjdChFeC53YWxsKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChFeC5xdWl0YWxsKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIjplZGl0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aXRob3V0IGEgZmlsZSBuYW1lXCIsIC0+XG4gICAgICBpdCBcInJlbG9hZHMgdGhlIGZpbGUgZnJvbSB0aGUgZGlza1wiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKFwiZWRpdC0xXCIpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmMnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCAnZGVmJylcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCcpXG4gICAgICAgICMgUmVsb2FkaW5nIHRha2VzIGEgYml0XG4gICAgICAgIHdhaXRzRm9yKCgtPiBlZGl0b3IuZ2V0VGV4dCgpIGlzICdkZWYnKSxcbiAgICAgICAgICBcInRoZSBlZGl0b3IncyBjb250ZW50IHRvIGNoYW5nZVwiLCAxMDApXG5cbiAgICAgIGl0IFwiZG9lc24ndCByZWxvYWQgd2hlbiB0aGUgZmlsZSBoYXMgYmVlbiBtb2RpZmllZFwiLCAtPlxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKFwiZWRpdC0yXCIpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmMnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dCgnYWJjZCcpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsICdkZWYnKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdlZGl0JylcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgJ0NvbW1hbmQgZXJyb3I6IE5vIHdyaXRlIHNpbmNlIGxhc3QgY2hhbmdlIChhZGQgISB0byBvdmVycmlkZSknKVxuICAgICAgICBpc250RGVmID0gZmFsc2VcbiAgICAgICAgc2V0SW1tZWRpYXRlKC0+IGlzbnREZWYgPSBlZGl0b3IuZ2V0VGV4dCgpIGlzbnQgJ2RlZicpXG4gICAgICAgIHdhaXRzRm9yKCgtPiBpc250RGVmKSwgXCJ0aGUgZWRpdG9yJ3MgY29udGVudCBub3QgdG8gY2hhbmdlXCIsIDUwKVxuXG4gICAgICBpdCBcInJlbG9hZHMgd2hlbiB0aGUgZmlsZSBoYXMgYmVlbiBtb2RpZmllZCBhbmQgaXQgaXMgZm9yY2VkXCIsIC0+XG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoXCJlZGl0LTNcIilcbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHQoJ2FiYycpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0KCdhYmNkJylcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgJ2RlZicpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2VkaXQhJylcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICB3YWl0c0ZvcigoLT4gZWRpdG9yLmdldFRleHQoKSBpcyAnZGVmJylcbiAgICAgICAgICBcInRoZSBlZGl0b3IncyBjb250ZW50IHRvIGNoYW5nZVwiLCA1MClcblxuICAgICAgaXQgXCJ0aHJvd3MgYW4gZXJyb3Igd2hlbiBlZGl0aW5nIGEgbmV3IGZpbGVcIiwgLT5cbiAgICAgICAgZWRpdG9yLmdldEJ1ZmZlcigpLnJlbG9hZCgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ2VkaXQnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMF0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogTm8gZmlsZSBuYW1lJylcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCEnKVxuICAgICAgICBleHBlY3QoYXRvbS5ub3RpZmljYXRpb25zLm5vdGlmaWNhdGlvbnNbMV0ubWVzc2FnZSkudG9FcXVhbChcbiAgICAgICAgICAnQ29tbWFuZCBlcnJvcjogTm8gZmlsZSBuYW1lJylcblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIGZpbGUgbmFtZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKVxuICAgICAgICBlZGl0b3IuZ2V0QnVmZmVyKCkucmVsb2FkKClcblxuICAgICAgaXQgXCJvcGVucyB0aGUgc3BlY2lmaWVkIHBhdGhcIiwgLT5cbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgnZWRpdC1uZXctdGVzdCcpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoXCJlZGl0ICN7ZmlsZVBhdGh9XCIpXG4gICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChmaWxlUGF0aClcblxuICAgICAgaXQgXCJvcGVucyBhIHJlbGF0aXZlIHBhdGhcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCBlZGl0LXJlbGF0aXZlLXRlc3QnKVxuICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uub3BlbikudG9IYXZlQmVlbkNhbGxlZFdpdGgoXG4gICAgICAgICAgcHJvamVjdFBhdGgoJ2VkaXQtcmVsYXRpdmUtdGVzdCcpKVxuXG4gICAgICBpdCBcInRocm93cyBhbiBlcnJvciBpZiB0cnlpbmcgdG8gb3BlbiBtb3JlIHRoYW4gb25lIGZpbGVcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZWRpdCBlZGl0LW5ldy10ZXN0LTEgZWRpdC1uZXctdGVzdC0yJylcbiAgICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4uY2FsbENvdW50KS50b0JlKDApXG4gICAgICAgIGV4cGVjdChhdG9tLm5vdGlmaWNhdGlvbnMubm90aWZpY2F0aW9uc1swXS5tZXNzYWdlKS50b0VxdWFsKFxuICAgICAgICAgICdDb21tYW5kIGVycm9yOiBPbmx5IG9uZSBmaWxlIG5hbWUgYWxsb3dlZCcpXG5cbiAgZGVzY3JpYmUgXCI6dGFiZWRpdFwiLCAtPlxuICAgIGl0IFwiYWN0cyBhcyBhbiBhbGlhcyB0byA6ZWRpdCBpZiBzdXBwbGllZCB3aXRoIGEgcGF0aFwiLCAtPlxuICAgICAgc3B5T24oRXgsICd0YWJlZGl0JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oRXgsICdlZGl0JylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJlZGl0IHRhYmVkaXQtdGVzdCcpXG4gICAgICBleHBlY3QoRXguZWRpdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoRXgudGFiZWRpdC5jYWxsc1swXS5hcmdzLi4uKVxuXG4gICAgaXQgXCJhY3RzIGFzIGFuIGFsaWFzIHRvIDp0YWJuZXcgaWYgbm90IHN1cHBsaWVkIHdpdGggYSBwYXRoXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3RhYmVkaXQnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ3RhYm5ldycpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFiZWRpdCAgJylcbiAgICAgIGV4cGVjdChFeC50YWJuZXcpXG4gICAgICAgIC50b0hhdmVCZWVuQ2FsbGVkV2l0aChFeC50YWJlZGl0LmNhbGxzWzBdLmFyZ3MuLi4pXG5cbiAgZGVzY3JpYmUgXCI6dGFibmV3XCIsIC0+XG4gICAgaXQgXCJvcGVucyBhIG5ldyB0YWJcIiwgLT5cbiAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpXG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndGFibmV3JylcbiAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGl0IFwib3BlbnMgYSBuZXcgdGFiIGZvciBlZGl0aW5nIHdoZW4gcHJvdmlkZWQgYW4gYXJndW1lbnRcIiwgLT5cbiAgICAgIHNweU9uKEV4LCAndGFibmV3JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24oRXgsICd0YWJlZGl0JylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd0YWJuZXcgdGFibmV3LXRlc3QnKVxuICAgICAgZXhwZWN0KEV4LnRhYmVkaXQpXG4gICAgICAgIC50b0hhdmVCZWVuQ2FsbGVkV2l0aChFeC50YWJuZXcuY2FsbHNbMF0uYXJncy4uLilcblxuICBkZXNjcmliZSBcIjpzcGxpdFwiLCAtPlxuICAgIGl0IFwic3BsaXRzIHRoZSBjdXJyZW50IGZpbGUgdXB3YXJkcy9kb3dud2FyZFwiLCAtPlxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0YmVsb3cnKVxuICAgICAgICBzcHlPbihwYW5lLCAnc3BsaXREb3duJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCdzcGxpdCcpXG4gICAgICAgIGVkaXRvci5zYXZlQXMoZmlsZVBhdGgpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3NwbGl0JylcbiAgICAgICAgZXhwZWN0KHBhbmUuc3BsaXREb3duKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGVsc2VcbiAgICAgICAgc3B5T24ocGFuZSwgJ3NwbGl0VXAnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGZpbGVQYXRoID0gcHJvamVjdFBhdGgoJ3NwbGl0JylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnc3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdFVwKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICMgRklYTUU6IFNob3VsZCB0ZXN0IHdoZXRoZXIgdGhlIG5ldyBwYW5lIGNvbnRhaW5zIGEgVGV4dEVkaXRvclxuICAgICAgIyAgICAgICAgcG9pbnRpbmcgdG8gdGhlIHNhbWUgcGF0aFxuXG4gIGRlc2NyaWJlIFwiOnZzcGxpdFwiLCAtPlxuICAgIGl0IFwic3BsaXRzIHRoZSBjdXJyZW50IGZpbGUgdG8gdGhlIGxlZnQvcmlnaHRcIiwgLT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdHJpZ2h0JylcbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBzcHlPbihwYW5lLCAnc3BsaXRSaWdodCcpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgZmlsZVBhdGggPSBwcm9qZWN0UGF0aCgndnNwbGl0JylcbiAgICAgICAgZWRpdG9yLnNhdmVBcyhmaWxlUGF0aClcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgndnNwbGl0JylcbiAgICAgICAgZXhwZWN0KHBhbmUuc3BsaXRMZWZ0KS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGVsc2VcbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBzcHlPbihwYW5lLCAnc3BsaXRMZWZ0JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBmaWxlUGF0aCA9IHByb2plY3RQYXRoKCd2c3BsaXQnKVxuICAgICAgICBlZGl0b3Iuc2F2ZUFzKGZpbGVQYXRoKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCd2c3BsaXQnKVxuICAgICAgICBleHBlY3QocGFuZS5zcGxpdExlZnQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgIyBGSVhNRTogU2hvdWxkIHRlc3Qgd2hldGhlciB0aGUgbmV3IHBhbmUgY29udGFpbnMgYSBUZXh0RWRpdG9yXG4gICAgICAjICAgICAgICBwb2ludGluZyB0byB0aGUgc2FtZSBwYXRoXG5cbiAgZGVzY3JpYmUgXCI6ZGVsZXRlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY1xcbmRlZlxcbmdoaVxcbmprbCcpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDBdKVxuXG4gICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdkZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmRlZlxcbmprbCcpXG5cbiAgICBpdCBcImNvcGllcyB0aGUgZGVsZXRlZCB0ZXh0XCIsIC0+XG4gICAgICBvcGVuRXgoKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnZGVsZXRlJylcbiAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwoJ2doaVxcbicpXG5cbiAgICBpdCBcImRlbGV0ZXMgdGhlIGxpbmVzIGluIHRoZSBnaXZlbiByYW5nZVwiLCAtPlxuICAgICAgcHJvY2Vzc2VkT3BTdGFjayA9IGZhbHNlXG4gICAgICBleFN0YXRlLm9uRGlkUHJvY2Vzc09wU3RhY2sgLT4gcHJvY2Vzc2VkT3BTdGFjayA9IHRydWVcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCcxLDJkZWxldGUnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaVxcbmprbCcpXG5cbiAgICAgIHdhaXRzRm9yIC0+IHByb2Nlc3NlZE9wU3RhY2tcbiAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNcXG5kZWZcXG5naGlcXG5qa2wnKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxLCAxXSlcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCcsL2svZGVsZXRlJylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNcXG4nKVxuXG4gICAgaXQgXCJ1bmRvcyBkZWxldGluZyBzZXZlcmFsIGxpbmVzIGF0IG9uY2VcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCctMSwuZGVsZXRlJylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNcXG5qa2wnKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnY29yZTp1bmRvJylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNcXG5kZWZcXG5naGlcXG5qa2wnKVxuXG4gIGRlc2NyaWJlIFwiOnN1YnN0aXR1dGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICBpdCBcInJlcGxhY2VzIGEgY2hhcmFjdGVyIG9uIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZSAvYS94JylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgaXQgXCJkb2Vzbid0IG5lZWQgYSBzcGFjZSBiZWZvcmUgdGhlIGFyZ3VtZW50c1wiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2EveCcpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgneGJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgIGl0IFwicmVzcGVjdHMgbW9kaWZpZXJzIHBhc3NlZCB0byBpdFwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2EveC9nJylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmN4QUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94L2dpJylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmN4eEJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgaXQgXCJyZXBsYWNlcyBvbiBtdWx0aXBsZSBsaW5lc1wiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzolc3Vic3RpdHV0ZS9hYmMvZ2hpJylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhQUJDXFxuZGVmZERFRlxcbmdoaWFBQkMnKVxuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOiVzdWJzdGl0dXRlL2FiYy9naGkvaWcnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuZ2hpYWdoaScpXG5cbiAgICBpdCBcInNldCBnZGVmYXVsdCBvcHRpb25cIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2V4LW1vZGUuZ2RlZmF1bHQnLCB0cnVlKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYS94JylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmN4QUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdleC1tb2RlLmdkZWZhdWx0JywgdHJ1ZSlcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2EveC9nJylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCd4YmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgZGVzY3JpYmUgXCI6eWFua1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjXFxuZGVmXFxuZ2hpXFxuamtsJylcbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsyLCAwXSlcblxuICAgICAgaXQgXCJ5YW5rcyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ3lhbmsnKVxuICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsKCdnaGlcXG4nKVxuXG4gICAgICBpdCBcInlhbmtzIHRoZSBsaW5lcyBpbiB0aGUgZ2l2ZW4gcmFuZ2VcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnMSwyeWFuaycpXG4gICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwoJ2FiY1xcbmRlZlxcbicpXG5cbiAgICBkZXNjcmliZSBcImlsbGVnYWwgZGVsaW1pdGVyc1wiLCAtPlxuICAgICAgdGVzdCA9IChkZWxpbSkgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIjpzdWJzdGl0dXRlICN7ZGVsaW19YSN7ZGVsaW19eCN7ZGVsaW19Z2lcIilcbiAgICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICAgXCJDb21tYW5kIGVycm9yOiBSZWd1bGFyIGV4cHJlc3Npb25zIGNhbid0IGJlIGRlbGltaXRlZCBieSBhbHBoYW51bWVyaWMgY2hhcmFjdGVycywgJ1xcXFwnLCAnXFxcIicgb3IgJ3wnXCIpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBpdCBcImNhbid0IGJlIGRlbGltaXRlZCBieSBsZXR0ZXJzXCIsIC0+IHRlc3QgJ24nXG4gICAgICBpdCBcImNhbid0IGJlIGRlbGltaXRlZCBieSBudW1iZXJzXCIsIC0+IHRlc3QgJzMnXG4gICAgICBpdCBcImNhbid0IGJlIGRlbGltaXRlZCBieSAnXFxcXCdcIiwgICAgLT4gdGVzdCAnXFxcXCdcbiAgICAgIGl0IFwiY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5ICdcXFwiJ1wiLCAgICAtPiB0ZXN0ICdcIidcbiAgICAgIGl0IFwiY2FuJ3QgYmUgZGVsaW1pdGVkIGJ5ICd8J1wiLCAgICAgLT4gdGVzdCAnfCdcblxuICAgIGRlc2NyaWJlIFwiZW1wdHkgcmVwbGFjZW1lbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FiY1xcbmFiY2FiYycpXG5cbiAgICAgIGl0IFwicmVtb3ZlcyB0aGUgcGF0dGVybiB3aXRob3V0IG1vZGlmaWVyc1wiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwiOnN1YnN0aXR1dGUvYWJjLy9cIilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY1xcbmFiY2FiYycpXG5cbiAgICAgIGl0IFwicmVtb3ZlcyB0aGUgcGF0dGVybiB3aXRoIG1vZGlmaWVyc1wiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwiOnN1YnN0aXR1dGUvYWJjLy9nXCIpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdcXG5hYmNhYmMnKVxuXG4gICAgZGVzY3JpYmUgXCJyZXBsYWNpbmcgd2l0aCBlc2NhcGUgc2VxdWVuY2VzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmMsZGVmLGdoaScpXG5cbiAgICAgIHRlc3QgPSAoZXNjYXBlQ2hhciwgZXNjYXBlZCkgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIjpzdWJzdGl0dXRlLywvXFxcXCN7ZXNjYXBlQ2hhcn0vZ1wiKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcImFiYyN7ZXNjYXBlZH1kZWYje2VzY2FwZWR9Z2hpXCIpXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgd2l0aCBhIHRhYlwiLCAtPiB0ZXN0KCd0JywgJ1xcdCcpXG4gICAgICBpdCBcInJlcGxhY2VzIHdpdGggYSBsaW5lZmVlZFwiLCAtPiB0ZXN0KCduJywgJ1xcbicpXG4gICAgICBpdCBcInJlcGxhY2VzIHdpdGggYSBjYXJyaWFnZSByZXR1cm5cIiwgLT4gdGVzdCgncicsICdcXHInKVxuXG4gICAgZGVzY3JpYmUgXCJjYXNlIHNlbnNpdGl2aXR5XCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlc3BlY3RzIHRoZSBzbWFydGNhc2Ugc2V0dGluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJ1c2VzIGNhc2Ugc2Vuc2l0aXZlIHNlYXJjaCBpZiBzbWFydGNhc2UgaXMgb2ZmIGFuZCB0aGUgcGF0dGVybiBpcyBsb3dlcmNhc2VcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIGZhbHNlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYWJjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcInVzZXMgY2FzZSBzZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvZmYgYW5kIHRoZSBwYXR0ZXJuIGlzIHVwcGVyY2FzZVwiLCAtPlxuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KCdhYmNhQUJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvQUJDL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnYWJjYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcInVzZXMgY2FzZSBpbnNlbnNpdGl2ZSBzZWFyY2ggaWYgc21hcnRjYXNlIGlzIG9uIGFuZCB0aGUgcGF0dGVybiBpcyBsb3dlcmNhc2VcIiwgLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcsIHRydWUpXG4gICAgICAgICAgb3BlbkV4KClcbiAgICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hYmMvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwidXNlcyBjYXNlIHNlbnNpdGl2ZSBzZWFyY2ggaWYgc21hcnRjYXNlIGlzIG9uIGFuZCB0aGUgcGF0dGVybiBpcyB1cHBlcmNhc2VcIiwgLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL0FCQy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2FiY2FnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGRlc2NyaWJlIFwiXFxcXGMgYW5kIFxcXFxDIGluIHRoZSBwYXR0ZXJuXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnYWJjYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcInVzZXMgY2FzZSBpbnNlbnNpdGl2ZSBzZWFyY2ggaWYgc21hcnRjYXNlIGlzIG9mZiBhbmQgXFxjIGlzIGluIHRoZSBwYXR0ZXJuXCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCBmYWxzZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FiY1xcXFxjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcImRvZXNuJ3QgbWF0dGVyIHdoZXJlIGluIHRoZSBwYXR0ZXJuIFxcXFxjIGlzXCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCBmYWxzZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FcXFxcY2JjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYWdoaVxcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcInVzZXMgY2FzZSBzZW5zaXRpdmUgc2VhcmNoIGlmIHNtYXJ0Y2FzZSBpcyBvbiwgXFxcXEMgaXMgaW4gdGhlIHBhdHRlcm4gYW5kIHRoZSBwYXR0ZXJuIGlzIGxvd2VyY2FzZVwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgdHJ1ZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FcXFxcQ2JjL2doaS9nJylcbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCgnZ2hpYUFCQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICAgICAgICBpdCBcIm92ZXJyaWRlcyBcXFxcQyB3aXRoIFxcXFxjIGlmIFxcXFxDIGNvbWVzIGZpcnN0XCIsIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnLCB0cnVlKVxuICAgICAgICAgIG9wZW5FeCgpXG4gICAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYVxcXFxDYlxcXFxjYy9naGkvZycpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFnaGlcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgICAgaXQgXCJvdmVycmlkZXMgXFxcXEMgd2l0aCBcXFxcYyBpZiBcXFxcYyBjb21lcyBmaXJzdFwiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgdHJ1ZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FcXFxcY2JcXFxcQ2MvZ2hpL2cnKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdnaGlhZ2hpXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICAgIGl0IFwib3ZlcnJpZGVzIGFuIGFwcGVuZGVkIC9pIGZsYWcgd2l0aCBcXFxcQ1wiLCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJywgdHJ1ZSlcbiAgICAgICAgICBvcGVuRXgoKVxuICAgICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzdWJzdGl0dXRlL2FiXFxcXENjL2doaS9naScpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaWFBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICBkZXNjcmliZSBcImNhcHR1cmluZyBncm91cHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ2FiY2FBQkNcXG5kZWZkREVGXFxuYWJjYUFCQycpXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgXFxcXDEgd2l0aCB0aGUgZmlyc3QgZ3JvdXBcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnN1YnN0aXR1dGUvYmMoLnsyfSkvWFxcXFwxWCcpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCdhWGFBWEJDXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBpdCBcInJlcGxhY2VzIG11bHRpcGxlIGdyb3Vwc1wiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hKFthLXpdKilhQShbQS1aXSopL1hcXFxcMVhZXFxcXDJZJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ1hiY1hZQkNZXFxuZGVmZERFRlxcbmFiY2FBQkMnKVxuXG4gICAgICBpdCBcInJlcGxhY2VzIFxcXFwwIHdpdGggdGhlIGVudGlyZSBtYXRjaFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c3Vic3RpdHV0ZS9hYihjYSlBQi9YXFxcXDBYJylcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ1hhYmNhQUJYQ1xcbmRlZmRERUZcXG5hYmNhQUJDJylcblxuICBkZXNjcmliZSBcIjpzZXRcIiwgLT5cbiAgICBpdCBcInRocm93cyBhbiBlcnJvciB3aXRob3V0IGEgc3BlY2lmaWVkIG9wdGlvblwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQnKVxuICAgICAgZXhwZWN0KGF0b20ubm90aWZpY2F0aW9ucy5ub3RpZmljYXRpb25zWzBdLm1lc3NhZ2UpLnRvRXF1YWwoXG4gICAgICAgICdDb21tYW5kIGVycm9yOiBObyBvcHRpb24gc3BlY2lmaWVkJylcblxuICAgIGl0IFwic2V0cyBtdWx0aXBsZSBvcHRpb25zIGF0IG9uY2VcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNob3dJbnZpc2libGVzJywgZmFsc2UpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnLCBmYWxzZSlcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IGxpc3QgbnVtYmVyJylcbiAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJykpLnRvQmUodHJ1ZSlcblxuICAgIGRlc2NyaWJlIFwidGhlIG9wdGlvbnNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnLCBmYWxzZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJywgZmFsc2UpXG5cbiAgICAgIGl0IFwic2V0cyAobm8pbGlzdFwiLCAtPlxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IGxpc3QnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0ludmlzaWJsZXMnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vbGlzdCcpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcInNldHMgKG5vKW51KG1iZXIpXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgbnUnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub251JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycpKS50b0JlKGZhbHNlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG51bWJlcicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zaG93TGluZU51bWJlcnMnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vbnVtYmVyJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNob3dMaW5lTnVtYmVycycpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcInNldHMgKG5vKXNwKGxpdClyKGlnaHQpXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc3ByJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdHJpZ2h0JykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NwcicpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRyaWdodCcpKS50b0JlKGZhbHNlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IHNwbGl0cmlnaHQnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0cmlnaHQnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vc3BsaXRyaWdodCcpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRyaWdodCcpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcInNldHMgKG5vKXMocGxpdCliKGVsb3cpXCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc2InKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0YmVsb3cnKSkudG9CZSh0cnVlKVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vc2InKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0YmVsb3cnKSkudG9CZShmYWxzZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBzcGxpdGJlbG93JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5zcGxpdGJlbG93JykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NwbGl0YmVsb3cnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLnNwbGl0YmVsb3cnKSkudG9CZShmYWxzZSlcblxuICAgICAgaXQgXCJzZXRzIChubylzKG1hcnQpYyhhKXMoZSlcIiwgLT5cbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBzY3MnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCd2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2gnKSkudG9CZSh0cnVlKVxuICAgICAgICBvcGVuRXgoKVxuICAgICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCc6c2V0IG5vc2NzJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJykpLnRvQmUoZmFsc2UpXG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgc21hcnRjYXNlJylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgndmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoJykpLnRvQmUodHJ1ZSlcbiAgICAgICAgb3BlbkV4KClcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub3NtYXJ0Y2FzZScpXG4gICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcInNldHMgKG5vKWdkZWZhdWx0XCIsIC0+XG4gICAgICAgIG9wZW5FeCgpXG4gICAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzpzZXQgZ2RlZmF1bHQnKVxuICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdleC1tb2RlLmdkZWZhdWx0JykpLnRvQmUodHJ1ZSlcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpvcGVuJylcbiAgICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dCgnOnNldCBub2dkZWZhdWx0JylcbiAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnZXgtbW9kZS5nZGVmYXVsdCcpKS50b0JlKGZhbHNlKVxuXG4gIGRlc2NyaWJlIFwiYWxpYXNlc1wiLCAtPlxuICAgIGl0IFwiY2FsbHMgdGhlIGFsaWFzZWQgZnVuY3Rpb24gd2l0aG91dCBhcmd1bWVudHNcIiwgLT5cbiAgICAgIEV4Q2xhc3MucmVnaXN0ZXJBbGlhcygnVycsICd3JylcbiAgICAgIHNweU9uKEV4LCAnd3JpdGUnKVxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJ1cnKVxuICAgICAgZXhwZWN0KEV4LndyaXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGl0IFwiY2FsbHMgdGhlIGFsaWFzZWQgZnVuY3Rpb24gd2l0aCBhcmd1bWVudHNcIiwgLT5cbiAgICAgIEV4Q2xhc3MucmVnaXN0ZXJBbGlhcygnVycsICd3cml0ZScpXG4gICAgICBzcHlPbihFeCwgJ1cnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBzcHlPbihFeCwgJ3dyaXRlJylcbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdXJylcbiAgICAgIFdBcmdzID0gRXguVy5jYWxsc1swXS5hcmdzWzBdXG4gICAgICB3cml0ZUFyZ3MgPSBFeC53cml0ZS5jYWxsc1swXS5hcmdzWzBdXG4gICAgICBleHBlY3QoV0FyZ3MpLnRvQmUgd3JpdGVBcmdzXG5cbiAgZGVzY3JpYmUgXCJ3aXRoIHNlbGVjdGlvbnNcIiwgLT5cbiAgICBpdCBcImV4ZWN1dGVzIG9uIHRoZSBzZWxlY3RlZCByYW5nZVwiLCAtPlxuICAgICAgc3B5T24oRXgsICdzJylcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9CdWZmZXJQb3NpdGlvbihbMiwgMV0pXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvckVsZW1lbnQsICdleC1tb2RlOm9wZW4nKVxuICAgICAgc3VibWl0Tm9ybWFsTW9kZUlucHV0VGV4dChcIic8LCc+cy9hYmMvZGVmXCIpXG4gICAgICBleHBlY3QoRXgucy5jYWxsc1swXS5hcmdzWzBdLnJhbmdlKS50b0VxdWFsIFswLCAyXVxuXG4gICAgaXQgXCJjYWxscyB0aGUgZnVuY3Rpb25zIG11bHRpcGxlIHRpbWVzIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBzZWxlY3Rpb25zXCIsIC0+XG4gICAgICBzcHlPbihFeCwgJ3MnKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcbiAgICAgIGVkaXRvci5zZWxlY3RUb0J1ZmZlclBvc2l0aW9uKFsyLCAxXSlcbiAgICAgIGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKFszLCAwXSlcbiAgICAgIGVkaXRvci5zZWxlY3RUb0J1ZmZlclBvc2l0aW9uKFszLCAyXSlcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yRWxlbWVudCwgJ2V4LW1vZGU6b3BlbicpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KFwiJzwsJz5zL2FiYy9kZWZcIilcbiAgICAgIGNhbGxzID0gRXgucy5jYWxsc1xuICAgICAgZXhwZWN0KGNhbGxzLmxlbmd0aCkudG9FcXVhbCAyXG4gICAgICBleHBlY3QoY2FsbHNbMF0uYXJnc1swXS5yYW5nZSkudG9FcXVhbCBbMCwgMl1cbiAgICAgIGV4cGVjdChjYWxsc1sxXS5hcmdzWzBdLnJhbmdlKS50b0VxdWFsIFszLCAzXVxuXG4gIGRlc2NyaWJlICc6c29ydCcsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQoJ2doaVxcbmFiY1xcbmprbFxcbmRlZlxcbjE0Mlxcbnp6elxcbjkxeGZkczlcXG4nKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGl0IFwic29ydHMgZW50aXJlIGZpbGUgaWYgcmFuZ2UgaXMgbm90IG11bHRpLWxpbmVcIiwgLT5cbiAgICAgIG9wZW5FeCgpXG4gICAgICBzdWJtaXROb3JtYWxNb2RlSW5wdXRUZXh0KCdzb3J0JylcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKCcxNDJcXG45MXhmZHM5XFxuYWJjXFxuZGVmXFxuZ2hpXFxuamtsXFxuenp6XFxuJylcblxuICAgIGl0IFwic29ydHMgc3BlY2lmaWMgcmFuZ2UgaWYgcmFuZ2UgaXMgbXVsdGktbGluZVwiLCAtPlxuICAgICAgb3BlbkV4KClcbiAgICAgIHN1Ym1pdE5vcm1hbE1vZGVJbnB1dFRleHQoJzIsNHNvcnQnKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoJ2doaVxcbmFiY1xcbmRlZlxcbmprbFxcbjE0Mlxcbnp6elxcbjkxeGZkczlcXG4nKVxuIl19
