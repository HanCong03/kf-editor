/*!
 * 输入控制组件
 */

define(function (require, exports, module) {

    var kity = require("kity"),
        kfUtils = require("base/utils"),
        CONF = require("sysconf"),
        CURSOR_CHAR = CONF.cursorCharacter,
        InputFilter = require("control/input-filter"),
        KEY_CODE = {
            LEFT: 37,
            RIGHT: 39,
            DELETE: 8,
            ENTER: 13,
            // 输入法特殊处理
            INPUT: 229
        };

    return kity.createClass("InputComponent", {

        constructor: function (parentComponent, kfEditor) {

            this.parentComponent = parentComponent;
            this.kfEditor = kfEditor;

            this.inputBox = this.createInputBox();

            this.initServices();
            this.initCommands();

            this.initEvent();

        },

        initServices: function () {

            this.kfEditor.registerService("control.update.input", this, {
                updateInput: this.updateInput
            });

            this.kfEditor.registerService("control.insert.string", this, {
                insertStr: this.insertStr
            });

        },

        initCommands: function () {

            this.kfEditor.registerCommand("focus", this, this.focus);

        },

        createInputBox: function () {

            var editorContainer = this.kfEditor.getContainer(),
                box = this.kfEditor.getDocument().createElement("input");

            box.className = "kf-editor-input-box";
            box.type = "text";

            // focus是否可信
            box.isTrusted = false;

            editorContainer.appendChild(box);

            return box;

        },

        focus: function () {

            var rootInfo = null;

            this.inputBox.focus();

            // 如果当前不包含光标信息， 则手动设置光标信息， 以使得当前根节点被全选中
            if (!this.kfEditor.requestService("syntax.has.cursor.info")) {

                rootInfo = this.kfEditor.requestService("syntax.get.root.group.info");

                this.kfEditor.requestService("syntax.update.record.cursor", {
                    groupId: rootInfo.id,
                    startOffset: 0,
                    endOffset: rootInfo.content.length
                });

                this.kfEditor.requestService("control.update.input");

            }

            this.kfEditor.requestService("control.reselect");

        },

        setUntrusted: function () {
            this.inputBox.isTrusted = false;
        },

        setTrusted: function () {
            this.inputBox.isTrusted = true;
        },

        updateInput: function () {

            var latexInfo = this.kfEditor.requestService("syntax.serialization");

            this.setUntrusted();
            this.inputBox.value = latexInfo.str;
            this.inputBox.selectionStart = latexInfo.startOffset;
            this.inputBox.selectionEnd = latexInfo.endOffset;
            this.inputBox.focus();
            this.setTrusted();

        },

        insertStr: function (str) {

            var latexInfo = this.kfEditor.requestService("syntax.serialization"),
                originString = latexInfo.str;

            // 拼接latex字符串
            originString = originString.substring(0, latexInfo.startOffset) + " " + str + " " + originString.substring(latexInfo.endOffset);

            this.restruct(originString);
            this.updateInput();

            this.kfEditor.requestService("ui.update.canvas.view");

        },

        initEvent: function () {

            var _self = this;

            kfUtils.addEvent(this.inputBox, "keydown", function (e) {

                var isControl = false;

                if (e.ctrlKey || e.metaKey) {
                    // 处理用户控制行为
                    _self.processUserCtrl(e);
                    return;
                }

                switch (e.keyCode) {

                    case KEY_CODE.INPUT:
                        return;

                    case KEY_CODE.LEFT:
                        e.preventDefault();
                        _self.leftMove();
                        isControl = true;
                        break;

                    case KEY_CODE.RIGHT:
                        e.preventDefault();
                        _self.rightMove();
                        isControl = true;
                        break;

                    case KEY_CODE.DELETE:
                        e.preventDefault();
                        _self.delete();
                        isControl = true;
                        break;

                    case KEY_CODE.ENTER:
                        e.preventDefault();
                        _self.newLine();
                        isControl = true;
                        break;
                }

                if (isControl) {
                    _self.kfEditor.requestService("ui.update.canvas.view");
                }

                if (!_self.pretreatmentInput(e)) {
                    e.preventDefault();
                }

            });

            // 用户输入
            kfUtils.addEvent(this.inputBox, "input", function (e) {

                _self.processingInput();

            });

            // 光标显隐控制
            kfUtils.addEvent(this.inputBox, "blur", function (e) {

                _self.kfEditor.requestService("ui.toolbar.disable");
                _self.kfEditor.requestService("ui.toolbar.close");

                _self.kfEditor.requestService("control.cursor.hide");
                _self.kfEditor.requestService("render.clear.select");

            });

            kfUtils.addEvent(this.inputBox, "focus", function (e) {

                _self.kfEditor.requestService("ui.toolbar.enable");

                if (this.isTrusted) {
                    _self.kfEditor.requestService("control.reselect");
                }

            });

            // 粘贴过滤
            kfUtils.addEvent(this.inputBox, "paste", function (e) {

                e.preventDefault();

            });

        },

        hasRootplaceholder: function () {
            return this.kfEditor.requestService("syntax.has.root.placeholder");
        },

        leftMove: function () {

            // 当前处于"根占位符"上， 则不允许move
            if (this.hasRootplaceholder()) {
                return;
            }

            this.kfEditor.requestService("syntax.cursor.move.left");
            this.update();

        },

        rightMove: function () {

            if (this.hasRootplaceholder()) {
                return;
            }

            this.kfEditor.requestService("syntax.cursor.move.right");
            this.update();

        },

        delete: function () {

            // 当前处于"根占位符"上，不允许删除操作
            if (this.hasRootplaceholder()) {
                return;
            }

            // 返回是否修要重绘
            var isNeedRedraw = this.kfEditor.requestService("syntax.delete.group");

            if (isNeedRedraw) {
                this.updateInput();
                this.processingInput();
            } else {
                this.updateInput();
                this.kfEditor.requestService("control.reselect");
            }

        },

        processUserCtrl: function (e) {

            switch (e.keyCode) {

                // ctrl + A
                case 65:
                    e.preventDefault();
                    this.kfEditor.requestService("control.select.all");
                    break;

                // ctrl + S
                case 83:
                    //this.kfEditor.requestService( "print.image" );
                    break;

            }

        },

        // 输入前的预处理， 执行输入过滤
        pretreatmentInput: function (evt) {

            var keyCode = this.getKeyCode(evt),
                replaceStr = InputFilter.getReplaceString(keyCode);

            if (replaceStr === null) {
                return true;
            }

            this.insertStr(replaceStr);
            return false;

        },

        getKeyCode: function (e) {
            return ( e.shiftKey ? "s+" : "" ) + e.keyCode;
        },

        processingInput: function () {

            this.restruct(this.inputBox.value);
            this.kfEditor.requestService("ui.update.canvas.view");

        },

        // 根据给定的字符串重新进行构造公式
        restruct: function (latexStr) {

            this.kfEditor.requestService("render.draw", latexStr);
            this.kfEditor.requestService("control.reselect");

        },

        newLine: function () {

            var latexInfo = this.kfEditor.requestService("syntax.serialization"),
                match = null,
                source = null,
                index = 0,
                pattern = /\\begin\{([^}]+)\}[\s\S]*?\\end\{\1\}/ig,
                rootShape = null,
                beginType = null,
                content = null,
                originString = latexInfo.str;

            while (match = pattern.exec(originString)) {

                index = match.index;

                beginType = match[1];
                match = match[0];

                if (match.indexOf(CURSOR_CHAR) === -1) {
                    match = null;
                    continue;
                } else {
                    break;
                }

            }

            if (!match) {
                return;
            }

            source = originString.substring(index, match.length + index);

            source = source.replace("\\begin{" + beginType + "}", "").replace("\\end{" + beginType + "}", "");

            source = source.split("\\\\");

            for (var i = 0, len = source.length; i < len; i++) {

                if (source[i].indexOf(CURSOR_CHAR) !== -1) {

                    if (beginType === 'split') {
                        source[i] = source[i].replace(CURSOR_CHAR, "").replace(CURSOR_CHAR, "");
                        source.splice(i + 1, 0, "&{" + CURSOR_CHAR + " \\placeholder " + CURSOR_CHAR + "}");
                        break;
                    } else {
                        content = source[i];
                        source[i] = source[i].replace(CURSOR_CHAR, "").replace(CURSOR_CHAR, "");

                        content = content.split("&");

                        for (var j = 0, jlen = content.length; j < jlen; j++) {
                            if (content[j].indexOf(CURSOR_CHAR) !== -1) {
                                content[j] = CURSOR_CHAR + " \\placeholder " + CURSOR_CHAR;
                            } else {
                                content[j] = "\\placeholder";
                            }
                        }

                        source.splice(i + 1, 0, content.join("&"));
                        break;
                    }

                }

            }

            source = "\\begin{" + beginType + "}" + source.join("\\\\") + "\\end{" + beginType + "}";

            originString = originString.substring(0, index) + source + originString.substring(index + match.length);
            this.inputBox.value = originString;
            this.inputBox.selectionStart = originString.indexOf(CURSOR_CHAR);
            this.inputBox.selectionEnd = originString.lastIndexOf(CURSOR_CHAR);

            this.processingInput();

        },

        update: function () {

            // 更新输入框
            this.updateInput();
            this.kfEditor.requestService("control.reselect");

        }

    });

});