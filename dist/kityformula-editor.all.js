/*!
 * ====================================================
 * Kity Formula Editor - v1.0.0 - 2014-10-26
 * https://github.com/kitygraph/formula
 * GitHub: https://github.com/kitygraph/formula.git 
 * Copyright (c) 2014 Baidu Kity Group; Licensed MIT
 * ====================================================
 */

(function () {
var _p = {
    r: function(index) {
        if (_p[index].inited) {
            return _p[index].value;
        }
        if (typeof _p[index].value === "function") {
            var module = {
                exports: {}
            }, returnValue = _p[index].value(null, module.exports, module);
            _p[index].inited = true;
            _p[index].value = returnValue;
            if (returnValue !== undefined) {
                return returnValue;
            } else {
                for (var key in module.exports) {
                    if (module.exports.hasOwnProperty(key)) {
                        _p[index].inited = true;
                        _p[index].value = module.exports;
                        return module.exports;
                    }
                }
            }
        } else {
            _p[index].inited = true;
            return _p[index].value;
        }
    }
};

/**
 * Created by hn on 14-3-17.
 */
_p[0] = {
    value: function(require) {
        // copy保护
        var MAX_COPY_DEEP = 10, commonUtils = {
            extend: function(target, source) {
                var isDeep = false;
                if (typeof target === "boolean") {
                    isDeep = target;
                    target = source;
                    source = [].splice.call(arguments, 2);
                } else {
                    source = [].splice.call(arguments, 1);
                }
                if (!target) {
                    throw new Error("Utils: extend, target can not be empty");
                }
                commonUtils.each(source, function(src) {
                    if (src && typeof src === "object" || typeof src === "function") {
                        copy(isDeep, target, src);
                    }
                });
                return target;
            },
            /**
             * 返回给定节点parent是否包含target节点
             * @param parent
             * @param target
             */
            contains: function(parent, target) {
                if (parent.contains) {
                    return parent.contains(target);
                } else if (parent.compareDocumentPosition) {
                    return !!(parent.compareDocumentPosition(target) & 16);
                }
            },
            getRect: function(node) {
                return node.getBoundingClientRect();
            },
            isArray: function(obj) {
                return obj && {}.toString.call(obj) === "[object Array]";
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            proxy: function(fn, context) {
                return function() {
                    return fn.apply(context, arguments);
                };
            },
            each: function(obj, fn) {
                if (!obj) {
                    return;
                }
                if ("length" in obj && typeof obj.length === "number") {
                    for (var i = 0, len = obj.length; i < len; i++) {
                        if (fn.call(null, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                } else {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (fn.call(null, obj[key], key, obj) === false) {
                                break;
                            }
                        }
                    }
                }
            }
        };
        function copy(isDeep, target, source, count) {
            count = count | 0;
            if (count > MAX_COPY_DEEP) {
                return source;
            }
            count++;
            commonUtils.each(source, function(value, index, origin) {
                if (isDeep) {
                    if (!value || typeof value !== "object" && typeof value !== "function") {
                        target[index] = value;
                    } else {
                        target[index] = target[index] || (commonUtils.isArray(value) ? [] : {});
                        target[index] = copy(isDeep, target[index], value, count);
                    }
                } else {
                    target[index] = value;
                }
            });
            return target;
        }
        return commonUtils;
    }
};

/*!
 * 组件抽象类，所有的组件都是该类的子类
 * @abstract
 */
_p[1] = {
    value: function(require) {
        var kity = _p.r(21);
        return kity.createClass("Component", {
            constructor: function() {}
        });
    }
};

/*!
 * event模块
 */
/* jshint camelcase: false */
_p[2] = {
    value: function(require, exports, modules) {
        var EVENT_LISTENER = {}, eid = 0, BEFORE_RESULT = true, KFEvent = _p.r(3), commonUtils = _p.r(0), EVENT_HANDLER = function(e) {
            var type = e.type, target = e.target, eid = this.__kfe_eid, hasAutoTrigger = /^(?:before|after)/.test(type), HANDLER_LIST = EVENT_LISTENER[eid][type];
            if (!hasAutoTrigger) {
                EventListener.trigger(target, "before" + type);
                if (BEFORE_RESULT === false) {
                    BEFORE_RESULT = true;
                    return false;
                }
            }
            commonUtils.each(HANDLER_LIST, function(handler, index) {
                if (!handler) {
                    return;
                }
                if (handler.call(target, e) === false) {
                    BEFORE_RESULT = false;
                    return BEFORE_RESULT;
                }
            });
            if (!hasAutoTrigger) {
                EventListener.trigger(target, "after" + type);
            }
        };
        var EventListener = {
            addEvent: function(target, type, handler) {
                var hasHandler = true, eventCache = null;
                if (!target.__kfe_eid) {
                    hasHandler = false;
                    target.__kfe_eid = generateId();
                    EVENT_LISTENER[target.__kfe_eid] = {};
                }
                eventCache = EVENT_LISTENER[target.__kfe_eid];
                if (!eventCache[type]) {
                    hasHandler = false;
                    eventCache[type] = [];
                }
                eventCache[type].push(handler);
                if (hasHandler) {
                    return;
                }
                target.addEventListener(type, EVENT_HANDLER, false);
            },
            trigger: function(target, type, e) {
                e = e || KFEvent.createEvent(type, e);
                target.dispatchEvent(e);
            }
        };
        function generateId() {
            return ++eid;
        }
        return EventListener;
    }
};

/**
 * Created by hn on 14-3-17.
 */
_p[3] = {
    value: function(require) {
        return {
            createEvent: function(type, e) {
                var evt = document.createEvent("Event");
                evt.initEvent(type, true, true);
                return evt;
            }
        };
    }
};

/*!
 * 基础工具包
 */
_p[4] = {
    value: function(require) {
        var Utils = {}, commonUtils = _p.r(0);
        commonUtils.extend(Utils, commonUtils, _p.r(2));
        return Utils;
    }
};

/**
 * Created by hn on 14-4-11.
 */
_p[5] = {
    value: function(require) {
        var kity = _p.r(21), ListenerComponent = _p.r(8), ControllerComponent = kity.createClass("ControllerComponent", {
            constructor: function(kfEditor) {
                this.kfEditor = kfEditor;
                this.components = {};
                this.initComponents();
            },
            initComponents: function() {
                this.components.listener = new ListenerComponent(this, this.kfEditor);
            }
        });
        return ControllerComponent;
    }
};

/*!
 * 输入过滤器
 */
_p[6] = {
    value: function(require) {
        // 过滤列表， 其中的key对应于键盘事件的keycode， 带有s+字样的key，匹配的是shift+keycode
        var LIST = {
            32: "\\,",
            "s+219": "\\{",
            "s+221": "\\}",
            "220": "\\backslash",
            "s+51": "\\#",
            "s+52": "\\$",
            "s+53": "\\%",
            "s+54": "\\^",
            "s+55": "\\&",
            "s+189": "\\_",
            "s+192": "\\~"
        };
        return {
            getReplaceString: function(key) {
                return LIST[key] || null;
            }
        };
    }
};

/*!
 * 输入控制组件
 */
_p[7] = {
    value: function(require, exports, module) {
        var kity = _p.r(21), kfUtils = _p.r(4), CONF = _p.r(37), CURSOR_CHAR = CONF.cursorCharacter, InputFilter = _p.r(6), KEY_CODE = {
            LEFT: 37,
            RIGHT: 39,
            DELETE: 8,
            ENTER: 13,
            // 输入法特殊处理
            INPUT: 229
        };
        return kity.createClass("InputComponent", {
            constructor: function(parentComponent, kfEditor) {
                this.parentComponent = parentComponent;
                this.kfEditor = kfEditor;
                this.latexMode = false;
                this.latexInput = null;
                this.inputBox = this.createInputBox();
                this.initServices();
                this.initCommands();
                this.initEvent();
            },
            initServices: function() {
                this.kfEditor.registerService("control.update.input", this, {
                    updateInput: this.updateInput
                });
                this.kfEditor.registerService("control.insert.string", this, {
                    insertStr: this.insertStr
                });
                this.kfEditor.registerService("control.update.latex.mode", this, {
                    updateLatexMode: this.updateLatexMode
                });
                this.kfEditor.registerService("control.set.source", this, {
                    setSource: this.setSource
                });
            },
            initCommands: function() {
                this.kfEditor.registerCommand("reset", this, this.reset);
                this.kfEditor.registerCommand("focus", this, this.focus);
                this.kfEditor.registerCommand("get.source", this, this.getSource);
            },
            reset: function() {
                this.kfEditor.requestService("render.draw", "\\placeholder");
                this.kfEditor.requestService("ui.update.canvas.view");
                this.kfEditor.requestService("control.select.all");
            },
            createInputBox: function() {
                var editorContainer = this.kfEditor.getContainer(), box = this.kfEditor.getDocument().createElement("input");
                box.className = "kf-editor-input-box";
                box.type = "text";
                // focus是否可信
                box.isTrusted = false;
                editorContainer.appendChild(box);
                return box;
            },
            focus: function() {
                var rootInfo = null;
                this.inputBox.focus();
                // 如果当前不包含光标信息， 则手动设置光标信息， 以使得当前根节点被全选中
                //            if ( !this.kfEditor.requestService( "syntax.has.cursor.info" ) ) {
                rootInfo = this.kfEditor.requestService("syntax.get.root.group.info");
                this.kfEditor.requestService("syntax.update.record.cursor", {
                    groupId: rootInfo.id,
                    startOffset: 0,
                    endOffset: rootInfo.content.length
                });
                this.kfEditor.requestService("control.update.input");
                //            } else {
                //
                //                var t = this.kfEditor.requestService( "syntax.get.record.cursor" );
                //
                //                alert(t.groupId + " ; " + t.startOffset + " ; " + t.endOffset );
                //
                //            }
                this.kfEditor.requestService("control.reselect");
                this.kfEditor.requestService("ui.toolbar.enable");
            },
            getSource: function() {
                return this.latexInput.value.replace(/\\placeholder/g, "");
            },
            setSource: function(value) {
                this.latexInput.value = value;
            },
            updateLatexMode: function(mode) {
                this.latexMode = !!mode;
            },
            setUntrusted: function() {
                this.inputBox.isTrusted = false;
            },
            setTrusted: function() {
                this.inputBox.isTrusted = true;
            },
            updateInput: function() {
                var latexInfo = this.kfEditor.requestService("syntax.serialization"), latexMode = this.latexMode;
                this.setUntrusted();
                this.inputBox.value = latexInfo.str;
                this.inputBox.selectionStart = latexInfo.startOffset;
                this.inputBox.selectionEnd = latexInfo.endOffset;
                this.inputBox.focus();
                this.setTrusted();
                this.latexMode = latexMode;
                this.updateLatex();
            },
            insertStr: function(str) {
                var originString = null, latexInfo = null;
                str = " " + str + " ";
                if (this.latexInput === this.kfEditor.getDocument().activeElement) {
                    this.latexInput.setRangeText(str);
                    originString = this.latexInput.value;
                } else {
                    latexInfo = this.kfEditor.requestService("syntax.serialization");
                    originString = latexInfo.str;
                    // 拼接latex字符串
                    originString = originString.substring(0, latexInfo.startOffset) + str + originString.substring(latexInfo.endOffset);
                }
                this.restruct(originString);
                this.updateInput();
                this.kfEditor.requestService("ui.update.canvas.view");
            },
            updateLatex: function() {
                if (!CONF.enableLatex) {
                    return;
                }
                this.latexInput.value = this.inputBox.value.replace(CURSOR_CHAR, "").replace(CURSOR_CHAR, "");
                if (this.latexMode) {
                    this.latexInput.focus();
                }
            },
            initEvent: function() {
                var _self = this;
                kfUtils.addEvent(this.inputBox, "keydown", function(e) {
                    var isControl = false;
                    if (e.ctrlKey) {
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
                        _self.deleteUnit();
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
                kfUtils.addEvent(this.inputBox, "input", function(e) {
                    try {
                        _self.processingInput();
                    } catch (error) {}
                });
                // 光标显隐控制
                kfUtils.addEvent(this.inputBox, "blur", function(e) {
                    _self.kfEditor.requestService("ui.toolbar.disable");
                    _self.kfEditor.requestService("ui.toolbar.close");
                    _self.kfEditor.requestService("control.cursor.hide");
                    _self.kfEditor.requestService("render.clear.select");
                });
                kfUtils.addEvent(this.inputBox, "focus", function(e) {
                    if (!this.latexInput) {
                        this.latexInput = _self.kfEditor.requestService("ui.get.latex.input");
                    }
                    _self.updateLatexMode(false);
                    _self.latexInput.value = this.value.replace(CURSOR_CHAR, "").replace(CURSOR_CHAR, "");
                    _self.kfEditor.requestService("ui.toolbar.enable");
                    if (this.isTrusted) {
                        _self.kfEditor.requestService("control.reselect");
                    }
                });
                if (CONF.enableLatex) {
                    if (!this.latexInput) {
                        this.latexInput = _self.kfEditor.requestService("ui.get.latex.input");
                    }
                    kfUtils.addEvent(this.latexInput, "focus", function(e) {
                        _self.kfEditor.requestService("ui.toolbar.enable");
                        _self.updateLatexMode(true);
                    });
                    kfUtils.addEvent(this.latexInput, "blur", function(e) {
                        _self.updateLatexMode(false);
                        _self.kfEditor.requestService("ui.toolbar.disable");
                        _self.kfEditor.requestService("ui.toolbar.close");
                    });
                    kfUtils.addEvent(this.latexInput, "input", function(e) {
                        try {
                            _self.kfEditor.requestService("render.draw", this.value);
                            _self.kfEditor.requestService("ui.update.canvas.view");
                        } catch (error) {}
                    });
                }
                // 粘贴过滤
                kfUtils.addEvent(this.inputBox, "paste", function(e) {
                    e.preventDefault();
                });
            },
            hasRootplaceholder: function() {
                return this.kfEditor.requestService("syntax.has.root.placeholder");
            },
            leftMove: function() {
                // 当前处于"根占位符"上， 则不允许move
                if (this.hasRootplaceholder()) {
                    return;
                }
                this.kfEditor.requestService("syntax.cursor.move.left");
                this.update();
            },
            rightMove: function() {
                if (this.hasRootplaceholder()) {
                    return;
                }
                this.kfEditor.requestService("syntax.cursor.move.right");
                this.update();
            },
            deleteUnit: function() {
                var isNeedRedraw = null;
                // 当前处于"根占位符"上，不允许删除操作
                if (this.hasRootplaceholder()) {
                    return;
                }
                // 返回是否修要重绘
                isNeedRedraw = this.kfEditor.requestService("syntax.delete.group");
                if (isNeedRedraw) {
                    this.updateInput();
                    this.processingInput();
                } else {
                    this.updateInput();
                    this.kfEditor.requestService("control.reselect");
                }
            },
            newLine: function() {
                var latexInfo = this.kfEditor.requestService("syntax.serialization"), match = null, source = null, index = 0, pattern = /\\begin[\s\S]*?\\end/gi, pattern = /\\begin\{([^}]+)\}[\s\S]*?\\end\{\1\}/gi, rootShape = null, beginType = null, content = null, originString = latexInfo.str;
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
                source = "\\begin{" + beginType + "}" + source.join("\\\\") + "\\end{" + beginType + "}";
                originString = originString.substring(0, index) + source + originString.substring(index + match.length);
                this.inputBox.value = originString;
                this.inputBox.selectionStart = originString.indexOf(CURSOR_CHAR);
                this.inputBox.selectionEnd = originString.lastIndexOf(CURSOR_CHAR);
                this.processingInput();
            },
            processUserCtrl: function(e) {
                e.preventDefault();
                switch (e.keyCode) {
                  // ctrl + A
                    case 65:
                    this.kfEditor.requestService("control.select.all");
                    break;

                  // ctrl + S
                    case 83:
                    this.kfEditor.requestService("print.image");
                    break;
                }
            },
            // 输入前的预处理， 执行输入过滤
            pretreatmentInput: function(evt) {
                var keyCode = this.getKeyCode(evt), replaceStr = InputFilter.getReplaceString(keyCode);
                if (replaceStr === null) {
                    return true;
                }
                this.insertStr(replaceStr);
                return false;
            },
            getKeyCode: function(e) {
                return (e.shiftKey ? "s+" : "") + e.keyCode;
            },
            processingInput: function() {
                this.restruct(this.inputBox.value);
                this.latexInput.value = this.inputBox.value.replace(CURSOR_CHAR, "").replace(CURSOR_CHAR, "");
                this.kfEditor.requestService("ui.update.canvas.view");
            },
            // 根据给定的字符串重新进行构造公式
            restruct: function(latexStr) {
                this.kfEditor.requestService("render.draw", latexStr);
                this.kfEditor.requestService("control.reselect");
            },
            update: function() {
                // 更新输入框
                this.updateInput();
                this.kfEditor.requestService("control.reselect");
            }
        });
    }
};

/**
 * Created by hn on 14-4-11.
 */
_p[8] = {
    value: function(require, exports, module) {
        var kity = _p.r(21), // 光标定位
        LocationComponent = _p.r(9), // 输入控制组件
        InputComponent = _p.r(7), // 选区
        SelectionComponent = _p.r(10);
        return kity.createClass("MoveComponent", {
            constructor: function(parentComponent, kfEditor) {
                this.parentComponent = parentComponent;
                this.kfEditor = kfEditor;
                this.components = {};
                this.initComponents();
            },
            initComponents: function() {
                this.components.location = new LocationComponent(this, this.kfEditor);
                this.components.selection = new SelectionComponent(this, this.kfEditor);
                this.components.input = new InputComponent(this, this.kfEditor);
            }
        });
    }
};

/*!
 * 光标定位组件
 */
_p[9] = {
    value: function(require, exports, module) {
        var kity = _p.r(21);
        return kity.createClass("LocationComponent", {
            constructor: function(parentComponent, kfEditor) {
                this.parentComponent = parentComponent;
                this.kfEditor = kfEditor;
                // 创建光标
                this.paper = this.getPaper();
                this.cursorShape = this.createCursor();
                this.initServices();
                this.initEvent();
            },
            getPaper: function() {
                return this.kfEditor.requestService("render.get.paper");
            },
            initServices: function() {
                // 重定位光标
                this.kfEditor.registerService("control.cursor.relocation", this, {
                    relocationCursor: this.updateCursor
                });
                // 清除光标
                this.kfEditor.registerService("control.cursor.hide", this, {
                    hideCursor: this.hideCursor
                });
                this.kfEditor.registerService("control.reselect", this, {
                    reselect: this.reselect
                });
                this.kfEditor.registerService("control.get.cursor.location", this, {
                    getCursorLocation: this.getCursorLocation
                });
            },
            createCursor: function() {
                var cursorShape = new kity.Rect(1, 0, 0, 0).fill("black");
                cursorShape.setAttr("style", "display: none");
                this.paper.addShape(cursorShape);
                return cursorShape;
            },
            // 光标定位监听
            initEvent: function() {
                var eventServiceObject = this.kfEditor.request("ui.canvas.container.event"), _self = this;
                eventServiceObject.on("mousedown", function(e) {
                    e.preventDefault();
                    _self.kfEditor.requestService("control.update.latex.mode", false);
                    _self.updateCursorInfo(e);
                    _self.kfEditor.requestService("control.update.input");
                    _self.reselect();
                });
            },
            updateCursorInfo: function(evt) {
                var wrapNode = null, groupInfo = null, index = -1;
                // 有根占位符存在， 所有定位到定位到根占位符内部
                if (this.kfEditor.requestService("syntax.has.root.placeholder")) {
                    this.kfEditor.requestService("syntax.update.record.cursor", {
                        groupId: this.kfEditor.requestService("syntax.get.root.group.info").id,
                        startOffset: 0,
                        endOffset: 1
                    });
                    return false;
                }
                wrapNode = this.kfEditor.requestService("position.get.wrap", evt.target);
                // 占位符处理, 选中该占位符
                if (wrapNode && this.kfEditor.requestService("syntax.is.placeholder.node", wrapNode.id)) {
                    groupInfo = this.kfEditor.requestService("position.get.group.info", wrapNode);
                    this.kfEditor.requestService("syntax.update.record.cursor", groupInfo.group.id, groupInfo.index, groupInfo.index + 1);
                    return;
                }
                groupInfo = this.kfEditor.requestService("position.get.group", evt.target);
                if (groupInfo === null) {
                    groupInfo = this.kfEditor.requestService("syntax.get.root.group.info");
                }
                index = this.getIndex(evt.clientX, groupInfo);
                this.kfEditor.requestService("syntax.update.record.cursor", groupInfo.id, index);
            },
            hideCursor: function() {
                this.cursorShape.setAttr("style", "display: none");
            },
            // 根据当前的光标信息， 对选区和光标进行更新
            reselect: function() {
                var cursorInfo = this.kfEditor.requestService("syntax.get.record.cursor"), groupInfo = null;
                this.hideCursor();
                // 根节点单独处理
                if (this.kfEditor.requestService("syntax.is.select.placeholder")) {
                    groupInfo = this.kfEditor.requestService("syntax.get.group.content", cursorInfo.groupId);
                    this.kfEditor.requestService("render.select.group", groupInfo.content[cursorInfo.startOffset].id);
                    return;
                }
                if (cursorInfo.startOffset === cursorInfo.endOffset) {
                    // 更新光标位置
                    this.updateCursor();
                    // 请求背景着色
                    this.kfEditor.requestService("render.tint.current.cursor");
                } else {
                    this.kfEditor.requestService("render.select.current.cursor");
                }
            },
            updateCursor: function() {
                var cursorInfo = this.kfEditor.requestService("syntax.get.record.cursor");
                if (cursorInfo.startOffset !== cursorInfo.endOffset) {
                    this.hideCursor();
                    return;
                }
                var groupInfo = this.kfEditor.requestService("syntax.get.group.content", cursorInfo.groupId), isBefore = cursorInfo.endOffset === 0, index = isBefore ? 0 : cursorInfo.endOffset - 1, focusChild = groupInfo.content[index], paperContainerRect = getRect(this.paper.container.node), cursorOffset = 0, focusChildRect = getRect(focusChild), cursorTransform = this.cursorShape.getTransform(this.cursorShape), canvasZoom = this.kfEditor.requestService("render.get.canvas.zoom"), formulaZoom = this.paper.getZoom();
                this.cursorShape.setHeight(focusChildRect.height / canvasZoom / formulaZoom);
                // 计算光标偏移位置
                cursorOffset = isBefore ? focusChildRect.left - 2 : focusChildRect.left + focusChildRect.width - 2;
                cursorOffset -= paperContainerRect.left;
                // 定位光标
                cursorTransform.m.e = Math.floor(cursorOffset / canvasZoom / formulaZoom) + .5;
                cursorTransform.m.f = (focusChildRect.top - paperContainerRect.top) / canvasZoom / formulaZoom;
                this.cursorShape.setMatrix(cursorTransform);
                this.cursorShape.setAttr("style", "display: block");
            },
            getCursorLocation: function() {
                var rect = this.cursorShape.getRenderBox("paper");
                return {
                    x: rect.x,
                    y: rect.y
                };
            },
            getIndex: function(distance, groupInfo) {
                var index = -1, children = groupInfo.content, boundingRect = null;
                for (var i = children.length - 1, child = null; i >= 0; i--) {
                    index = i;
                    child = children[i];
                    boundingRect = getRect(child);
                    if (boundingRect.left < distance) {
                        if (boundingRect.left + boundingRect.width / 2 < distance) {
                            index += 1;
                        }
                        break;
                    }
                }
                return index;
            }
        });
        function getRect(node) {
            return node.getBoundingClientRect();
        }
    }
};

/*!
 * 光标选区组件
 */
_p[10] = {
    value: function(require, exports, module) {
        var kity = _p.r(21), kfUtils = _p.r(4), // 鼠标移动临界距离
        MAX_DISTANCE = 10;
        return kity.createClass("SelectionComponent", {
            constructor: function(parentComponent, kfEditor) {
                this.parentComponent = parentComponent;
                this.kfEditor = kfEditor;
                this.isDrag = false;
                this.isMousedown = false;
                this.startPoint = {
                    x: -1,
                    y: -1
                };
                // 起始位置是占位符
                this.startGroupIsPlaceholder = false;
                this.startGroup = {};
                this.initServices();
                this.initEvent();
            },
            initServices: function() {
                this.kfEditor.registerService("control.select.all", this, {
                    selectAll: this.selectAll
                });
            },
            initEvent: function() {
                var eventServiceObject = this.kfEditor.request("ui.canvas.container.event"), _self = this;
                /* 选区拖拽 start */
                eventServiceObject.on("mousedown", function(e) {
                    e.preventDefault();
                    // 存在根占位符， 禁止拖动
                    if (_self.kfEditor.requestService("syntax.has.root.placeholder")) {
                        return false;
                    }
                    _self.isMousedown = true;
                    _self.updateStartPoint(e.clientX, e.clientY);
                    _self.updateStartGroup();
                });
                eventServiceObject.on("mouseup", function(e) {
                    e.preventDefault();
                    _self.stopUpdateSelection();
                });
                eventServiceObject.on("mousemove", function(e) {
                    e.preventDefault();
                    if (!_self.isDrag) {
                        if (_self.isMousedown) {
                            // 移动的距离达到临界条件
                            if (MAX_DISTANCE < _self.getDistance(e.clientX, e.clientY)) {
                                _self.kfEditor.requestService("control.cursor.hide");
                                _self.startUpdateSelection();
                            }
                        }
                    } else {
                        if (e.which !== 1) {
                            _self.stopUpdateSelection();
                            return;
                        }
                        _self.updateSelection(e.target, e.clientX, e.clientY);
                    }
                });
                /* 选区拖拽 end */
                /* 双击选区 start */
                eventServiceObject.on("dblclick", function(e) {
                    _self.updateSelectionByTarget(e.target);
                });
            },
            getDistance: function(x, y) {
                var distanceX = Math.abs(x - this.startPoint.x), distanceY = Math.abs(y - this.startPoint.y);
                return Math.max(distanceX, distanceY);
            },
            updateStartPoint: function(x, y) {
                this.startPoint.x = x;
                this.startPoint.y = y;
            },
            updateStartGroup: function() {
                var cursorInfo = this.kfEditor.requestService("syntax.get.record.cursor");
                this.startGroupIsPlaceholder = this.kfEditor.requestService("syntax.is.select.placeholder");
                this.startGroup = {
                    groupInfo: this.kfEditor.requestService("syntax.get.group.content", cursorInfo.groupId),
                    offset: cursorInfo.startOffset
                };
            },
            startUpdateSelection: function() {
                this.isDrag = true;
                this.isMousedown = false;
                this.clearSelection();
            },
            stopUpdateSelection: function() {
                this.isDrag = false;
                this.isMousedown = false;
                this.kfEditor.requestService("control.update.input");
            },
            clearSelection: function() {
                this.kfEditor.requestService("render.clear.select");
            },
            updateSelection: function(target, x, y) {
                // 移动方向， true为右， false为左
                var dir = x > this.startPoint.x, cursorInfo = {}, communityGroupInfo = null, inRightArea = false, startGroupInfo = this.startGroup, currentGroupNode = null, currentGroupInfo = this.getGroupInof(x, target);
                if (currentGroupInfo.groupInfo.id === startGroupInfo.groupInfo.id) {
                    cursorInfo = {
                        groupId: currentGroupInfo.groupInfo.id,
                        startOffset: startGroupInfo.offset,
                        endOffset: currentGroupInfo.offset
                    };
                    // 如果起始点是占位符， 要根据移动方向修正偏移
                    if (this.startGroupIsPlaceholder) {
                        // 左移修正
                        if (!dir) {
                            cursorInfo.startOffset += 1;
                        } else if (cursorInfo.startOffset === cursorInfo.endOffset) {
                            cursorInfo.endOffset += 1;
                        }
                    }
                } else {
                    // 存在包含关系
                    if (kfUtils.contains(startGroupInfo.groupInfo.groupObj, currentGroupInfo.groupInfo.groupObj)) {
                        cursorInfo = {
                            groupId: startGroupInfo.groupInfo.id,
                            startOffset: startGroupInfo.offset,
                            endOffset: this.getIndex(startGroupInfo.groupInfo.groupObj, target, x)
                        };
                    } else if (kfUtils.contains(currentGroupInfo.groupInfo.groupObj, startGroupInfo.groupInfo.groupObj)) {
                        cursorInfo = {
                            groupId: currentGroupInfo.groupInfo.id,
                            startOffset: this.kfEditor.requestService("position.get.index", currentGroupInfo.groupInfo.groupObj, startGroupInfo.groupInfo.groupObj),
                            endOffset: currentGroupInfo.offset
                        };
                        // 向左移动要修正开始偏移
                        if (!dir) {
                            cursorInfo.startOffset += 1;
                        }
                    } else {
                        // 获取公共容器
                        communityGroupInfo = this.getCommunityGroup(startGroupInfo.groupInfo, currentGroupInfo.groupInfo);
                        // 修正偏移相同时的情况， 比如在分数中选中时
                        if (communityGroupInfo.startOffset === communityGroupInfo.endOffset) {
                            communityGroupInfo.endOffset += 1;
                        } else {
                            // 当前光标移动所在的组元素节点
                            currentGroupNode = communityGroupInfo.group.content[communityGroupInfo.endOffset];
                            inRightArea = this.kfEditor.requestService("position.get.area", currentGroupNode, x);
                            // 当前移动到右区域， 则更新结束偏移
                            if (inRightArea) {
                                communityGroupInfo.endOffset += 1;
                            }
                            // 左移动时， 修正起始偏移
                            if (!dir) {
                                communityGroupInfo.startOffset += 1;
                            }
                        }
                        cursorInfo = {
                            groupId: communityGroupInfo.group.id,
                            startOffset: communityGroupInfo.startOffset,
                            endOffset: communityGroupInfo.endOffset
                        };
                    }
                }
                // 更新光标信息
                this.kfEditor.requestService("syntax.update.record.cursor", cursorInfo.groupId, cursorInfo.startOffset, cursorInfo.endOffset);
                // 仅重新选中就可以，不用更新输入框内容
                this.kfEditor.requestService("control.reselect");
            },
            updateSelectionByTarget: function(target) {
                var parentGroupInfo = this.kfEditor.requestService("position.get.parent.group", target), containerInfo = null, cursorInfo = {};
                if (parentGroupInfo === null) {
                    return;
                }
                // 如果是根节点， 则直接选中其内容
                if (this.kfEditor.requestService("syntax.is.root.node", parentGroupInfo.id)) {
                    this.selectAll();
                    return;
                } else {
                    // 当前组可以是容器， 则选中该容器的内容
                    if (!this.kfEditor.requestService("syntax.is.virtual.node", parentGroupInfo.id)) {
                        cursorInfo = {
                            groupId: parentGroupInfo.id,
                            startOffset: 0,
                            endOffset: parentGroupInfo.content.length
                        };
                    } else {
                        // 获取包含父组的容器
                        containerInfo = this.kfEditor.requestService("position.get.group.info", parentGroupInfo.groupObj);
                        cursorInfo = {
                            groupId: containerInfo.group.id,
                            startOffset: containerInfo.index,
                            endOffset: containerInfo.index + 1
                        };
                    }
                }
                this.kfEditor.requestService("syntax.update.record.cursor", cursorInfo);
                this.kfEditor.requestService("control.reselect");
                this.kfEditor.requestService("control.update.input");
            },
            selectAll: function() {
                var rootGroupInfo = this.kfEditor.requestService("syntax.get.root.group.info");
                var cursorInfo = {
                    groupId: rootGroupInfo.id,
                    startOffset: 0,
                    endOffset: rootGroupInfo.content.length
                };
                this.kfEditor.requestService("syntax.update.record.cursor", cursorInfo);
                this.kfEditor.requestService("control.reselect");
                this.kfEditor.requestService("control.update.input");
            },
            getGroupInof: function(offset, target) {
                var groupInfo = this.kfEditor.requestService("position.get.group", target);
                if (groupInfo === null) {
                    groupInfo = this.kfEditor.requestService("syntax.get.root.group.info");
                }
                var index = this.kfEditor.requestService("position.get.location.info", offset, groupInfo);
                return {
                    groupInfo: groupInfo,
                    offset: index
                };
            },
            getIndex: function(groupNode, targetNode, offset) {
                var index = this.kfEditor.requestService("position.get.index", groupNode, targetNode), groupInfo = this.kfEditor.requestService("syntax.get.group.content", groupNode.id), targetWrapNode = groupInfo.content[index], targetRect = kfUtils.getRect(targetWrapNode);
                if (targetRect.left + targetRect.width / 2 < offset) {
                    index += 1;
                }
                return index;
            },
            /**
         * 根据给定的两个组信息， 获取其所在的公共容器及其各自的偏移
         * @param startGroupInfo 组信息
         * @param endGroupInfo 另一个组信息
         */
            getCommunityGroup: function(startGroupInfo, endGroupInfo) {
                var bigBoundingGroup = null, targetGroup = startGroupInfo.groupObj, groupNode = null;
                while (bigBoundingGroup = this.kfEditor.requestService("position.get.group.info", targetGroup)) {
                    targetGroup = bigBoundingGroup.group.groupObj;
                    if (kfUtils.contains(bigBoundingGroup.group.groupObj, endGroupInfo.groupObj)) {
                        break;
                    }
                }
                groupNode = bigBoundingGroup.group.groupObj;
                return {
                    group: bigBoundingGroup.group,
                    startOffset: bigBoundingGroup.index,
                    endOffset: this.kfEditor.requestService("position.get.index", groupNode, endGroupInfo.groupObj)
                };
            }
        });
    }
};

/*!
 * 组类型
 */
_p[11] = {
    value: function() {
        return {
            GROUP: "kf-editor-group",
            VIRTUAL: "kf-editor-virtual-group"
        };
    }
};

/*!
 * 编辑器主体结构
 */
_p[12] = {
    value: function(require) {
        var kity = _p.r(21), Utils = _p.r(4), defaultOpt = {
            formula: {
                fontsize: 50,
                autoresize: false
            },
            ui: {
                zoom: true,
                maxzoom: 2,
                minzoom: 1
            }
        };
        // 同步组件列表
        var COMPONENTS = {}, // 异步组件列表
        ResourceManager = _p.r(20).ResourceManager;
        var KFEditor = kity.createClass("KFEditor", {
            constructor: function(container, opt) {
                this.options = Utils.extend(true, {}, defaultOpt, opt);
                this.FormulaClass = null;
                // 就绪状态
                this._readyState = false;
                this._callbacks = [];
                this._readyCount = 0;
                this.container = container;
                this.services = {};
                this.commands = {};
                this.initResource();
            },
            isReady: function() {
                return !!this._readyState;
            },
            triggerReady: function() {
                var cb = null, _self = this;
                while (cb = this._callbacks.shift()) {
                    cb.call(_self, _self);
                }
            },
            ready: function(cb) {
                if (this._readyState) {
                    cb.call(this, this);
                } else {
                    this._callbacks.push(cb);
                }
            },
            getContainer: function() {
                return this.container;
            },
            getDocument: function() {
                return this.container.ownerDocument;
            },
            getFormulaClass: function() {
                return this.FormulaClass;
            },
            getOptions: function() {
                return this.options;
            },
            initResource: function() {
                var _self = this;
                ResourceManager.ready(function(Formula) {
                    _self.FormulaClass = Formula;
                    _self.initComponents();
                    _self._readyState = true;
                    _self.triggerReady();
                }, this.options.resource);
            },
            /**
         * 初始化同步组件
         */
            initComponents: function() {
                var _self = this;
                Utils.each(COMPONENTS, function(Component, name) {
                    new Component(_self, _self.options[name]);
                });
            },
            requestService: function(serviceName, args) {
                var serviceObject = getService.call(this, serviceName);
                return serviceObject.service[serviceObject.key].apply(serviceObject.provider, [].slice.call(arguments, 1));
            },
            request: function(serviceName) {
                var serviceObject = getService.call(this, serviceName);
                return serviceObject.service;
            },
            registerService: function(serviceName, provider, serviceObject) {
                var key = null;
                for (key in serviceObject) {
                    if (serviceObject[key] && serviceObject.hasOwnProperty(key)) {
                        serviceObject[key] = Utils.proxy(serviceObject[key], provider);
                    }
                }
                this.services[serviceName] = {
                    provider: provider,
                    key: key,
                    service: serviceObject
                };
            },
            registerCommand: function(commandName, executor, execFn) {
                this.commands[commandName] = {
                    executor: executor,
                    execFn: execFn
                };
            },
            execCommand: function(commandName, args) {
                var commandObject = this.commands[commandName];
                if (!commandObject) {
                    throw new Error("KFEditor: not found command, " + commandName);
                }
                return commandObject.execFn.apply(commandObject.executor, [].slice.call(arguments, 1));
            }
        });
        function getService(serviceName) {
            var serviceObject = this.services[serviceName];
            if (!serviceObject) {
                throw new Error("KFEditor: not found service, " + serviceName);
            }
            return serviceObject;
        }
        Utils.extend(KFEditor, {
            registerComponents: function(name, component) {
                COMPONENTS[name] = component;
            }
        });
        return KFEditor;
    }
};

/**
 * 编辑器工厂方法
 * 用于创建编辑器
 */
_p[13] = {
    value: function(require) {
        var kity = _p.r(21), KFEditor = _p.r(12);
        /* ------------------------------- 编辑器装饰对象 */
        function EditorWrapper(container, options) {
            var _self = this;
            this._callbacks = [];
            this.editor = new KFEditor(container, options);
            this.editor.ready(function() {
                _self._trigger();
            });
        }
        EditorWrapper.prototype._trigger = function() {
            var editor = this.editor;
            kity.Utils.each(this._callbacks, function(cb) {
                cb.call(editor, editor);
            });
        };
        EditorWrapper.prototype.ready = function(cb) {
            if (this.editor.isReady()) {
                cb.call(this.editor, this.editor);
            } else {
                this._callbacks.push(cb);
            }
        };
        return {
            create: function(container, options) {
                return new EditorWrapper(container, options);
            }
        };
    }
};

/**
 * Created by hn on 14-3-12.
 */
_p[14] = {
    value: function() {
        return window.FUI;
    }
};

/**
 * Created by hn on 14-3-31.
 */
_p[15] = {
    value: function() {
        return window.jQuery;
    }
};

/**
 * Created by hn on 14-3-18.
 */
_p[16] = {
    value: function() {
        return {
            selectColor: "rgba(42, 106, 189, 0.2)",
            allSelectColor: "rgba(42, 106, 189, 0.6)"
        };
    }
};

/**
 * 占位符表达式， 扩展KF自有的Empty表达式
 */
_p[17] = {
    value: function(require, exports, module) {
        var kity = _p.r(21), kf = _p.r(20), PlaceholderOperator = _p.r(19);
        return kity.createClass("PlaceholderExpression", {
            base: kf.CompoundExpression,
            constructor: function() {
                this.callBase();
                this.setFlag("Placeholder");
                this.label = null;
                this.box.setAttr("data-type", null);
                this.setOperator(new PlaceholderOperator());
            },
            setLabel: function(label) {
                this.label = label;
            },
            getLabel: function() {
                return this.label;
            },
            // 重载占位符的setAttr， 以处理根占位符节点
            setAttr: function(key, val) {
                if (key === "label") {
                    this.setLabel(val);
                } else {
                    if (key.label) {
                        this.setLabel(key.label);
                        // 删除label
                        delete key.label;
                    }
                    // 继续设置其他属性
                    this.callBase(key, val);
                }
            },
            select: function() {
                this.getOperator().select();
            },
            selectAll: function() {
                this.getOperator().selectAll();
            },
            unselect: function() {
                this.getOperator().unselect();
            }
        });
    }
};

/**
 * 公式扩展接口
 */
_p[18] = {
    value: function(require) {
        var kf = _p.r(20), SELECT_COLOR = _p.r(16).selectColor, ALL_SELECT_COLOR = _p.r(16).allSelectColor;
        function ext(parser) {
            kf.PlaceholderExpression = _p.r(17);
            kf.Expression.prototype.select = function() {
                this.box.fill(SELECT_COLOR);
            };
            kf.Expression.prototype.selectAll = function() {
                this.box.fill(ALL_SELECT_COLOR);
            };
            kf.Expression.prototype.unselect = function() {
                this.box.fill("transparent");
            };
            // 扩展解析和逆解析
            parser.getKFParser().expand({
                parse: {
                    placeholder: {
                        name: "placeholder",
                        handler: function(info) {
                            delete info.handler;
                            info.operand = [];
                            return info;
                        },
                        sign: false
                    }
                },
                reverse: {
                    placeholder: function() {
                        return "\\placeholder ";
                    }
                }
            });
        }
        return {
            ext: ext
        };
    }
};

/**
 * 占位符操作符
 */
_p[19] = {
    value: function(require, exports, modules) {
        var kity = _p.r(21), FILL_COLOR = _p.r(37).rootPlaceholder.color, SELECT_COLOR = _p.r(16).selectColor, ALL_SELECT_COLOR = _p.r(16).allSelectColor;
        return kity.createClass("PlaceholderOperator", {
            base: _p.r(20).Operator,
            constructor: function() {
                this.opShape = null;
                this.callBase("Placeholder");
            },
            applyOperand: function() {
                this.opShape = generateOpShape(this, this.parentExpression.getLabel());
                this.parentExpression.expand(20, 20);
                this.parentExpression.translateElement(10, 10);
            },
            select: function() {
                this.opShape.fill(SELECT_COLOR);
            },
            selectAll: function() {
                this.opShape.fill(ALL_SELECT_COLOR);
            },
            unselect: function() {
                this.opShape.fill("transparent");
            }
        });
        function generateOpShape(operator, label) {
            if (label !== null) {
                return createRootPlaceholder(operator, label);
            } else {
                return createCommonShape(operator);
            }
        }
        // 创建通用图形
        function createCommonShape(operator) {
            var w = 35, h = 50, shape = null;
            shape = new kity.Rect(w, h, 0, 0).stroke("black").fill("transparent");
            shape.setAttr("stroke-dasharray", "5, 5");
            operator.addOperatorShape(shape);
            return shape;
        }
        // 创建根占位符图形
        function createRootPlaceholder(operator, label) {
            var textShape = new kity.Text(label).fill(FILL_COLOR), shapeGroup = new kity.Group(), padding = 20, radius = 7, borderBoxShape = new kity.Rect(0, 0, 0, 0, radius).stroke(FILL_COLOR).fill("transparent"), textBox = null;
            textShape.setFontSize(40);
            shapeGroup.addShape(borderBoxShape);
            shapeGroup.addShape(textShape);
            operator.addOperatorShape(shapeGroup);
            textBox = textShape.getFixRenderBox();
            // 宽度要加上padding
            borderBoxShape.stroke(FILL_COLOR).fill("transparent");
            borderBoxShape.setSize(textBox.width + padding * 2, textBox.height + padding * 2);
            borderBoxShape.setRadius(radius);
            borderBoxShape.setAttr("stroke-dasharray", "5, 5");
            textShape.setAttr({
                dx: 0 - textBox.x,
                dy: 0 - textBox.y
            });
            textShape.translate(padding, padding);
            // 对于根占位符， 返回的不是组， 而是组容器内部的虚线框。 以方便选中变色
            return borderBoxShape;
        }
    }
};

/**
 * Created by hn on 14-3-12.
 */
_p[20] = {
    value: function() {
        return window.kf;
    }
};

/**
 * 数学公式Latex语法解析器
 */
_p[21] = {
    value: function() {
        return window.kity;
    }
};

/**
 * Created by hn on 14-8-20.
 */
_p[22] = {
    value: function(require) {
        return window.KF_UI_CONFIG;
    }
};

/*!
 * UI定义
 */
_p[23] = {
    value: function(require) {
        return {
            // 视窗状态
            VIEW_STATE: {
                // 内容未超出画布
                NO_OVERFLOW: 0,
                // 内容溢出
                OVERFLOW: 1
            },
            scrollbar: {
                step: 50,
                thumbMinSize: 50
            }
        };
    }
};

/*!
 * box类型定义
 */
_p[24] = {
    value: function(require) {
        return {
            // 分离式
            DETACHED: 1,
            // 重叠式
            OVERLAP: 2
        };
    }
};

/*!
 * toolbar元素类型定义
 */
_p[25] = {
    value: function(require) {
        return {
            DRAPDOWN_BOX: 1,
            AREA: 2,
            DELIMITER: 3
        };
    }
};

/*!
 * 组元素类型定义
 */
_p[26] = {
    value: function(require) {
        return {
            BIG: 1,
            SMALL: 2
        };
    }
};

/*!
 * 滚动条组件
 */
_p[27] = {
    value: function(require) {
        var kity = _p.r(21), SCROLLBAR_DEF = _p.r(23).scrollbar, SCROLLBAR_CONF = _p.r(37).scrollbar, Utils = _p.r(4), CLASS_PREFIX = "kf-editor-ui-";
        return kity.createClass("Scrollbar", {
            constructor: function(uiComponent, kfEditor) {
                this.uiComponent = uiComponent;
                this.kfEditor = kfEditor;
                this.widgets = null;
                this.container = this.uiComponent.scrollbarContainer;
                // 显示状态
                this.state = false;
                // 滚动条当前各个状态下的值
                this.values = {
                    // 滚动条此时实际的偏移值, 计算的时候假定滑块的宽度为0
                    offset: 0,
                    // 滑块此时偏移位置所占轨道的比例, 计算的时候假定滑块的宽度为0
                    left: 0,
                    // 滚动条控制的容器的可见宽度
                    viewWidth: 0,
                    // 滚动条对应的内容实际宽度
                    contentWidth: 0,
                    // 轨道长度
                    trackWidth: 0,
                    // 滑块宽度
                    thumbWidth: 0,
                    // 可滚动的宽度
                    scrollWidth: 0
                };
                // 滑块的物理偏移， 不同于values.offset
                this.thumbLocationX = 0;
                // 左溢出长度
                this.leftOverflow = 0;
                // 右溢出长度
                this.rightOverflow = 0;
                // 记录本次和上一次改变内容之间宽度是否变大
                this.isExpand = true;
                this.initWidget();
                this.mountWidget();
                this.initSize();
                this.hide();
                this.initServices();
                this.initEvent();
                this.updateHandler = function() {};
            },
            initWidget: function() {
                var doc = this.container.ownerDocument;
                this.widgets = {
                    leftButton: createElement(doc, "div", "left-button"),
                    rightButton: createElement(doc, "div", "right-button"),
                    track: createElement(doc, "div", "track"),
                    thumb: createElement(doc, "div", "thumb"),
                    thumbBody: createElement(doc, "div", "thumb-body")
                };
            },
            initSize: function() {
                var leftBtnWidth = getRect(this.widgets.leftButton).width, rightBtnWidth = getRect(this.widgets.rightButton).width;
                this.values.viewWidth = getRect(this.container).width;
                this.values.trackWidth = this.values.viewWidth - leftBtnWidth - rightBtnWidth;
                this.widgets.track.style.width = this.values.trackWidth + "px";
            },
            initServices: function() {
                this.kfEditor.registerService("ui.show.scrollbar", this, {
                    showScrollbar: this.show
                });
                this.kfEditor.registerService("ui.hide.scrollbar", this, {
                    hideScrollbar: this.hide
                });
                this.kfEditor.registerService("ui.update.scrollbar", this, {
                    updateScrollbar: this.update
                });
                this.kfEditor.registerService("ui.set.scrollbar.update.handler", this, {
                    setUpdateHandler: this.setUpdateHandler
                });
                this.kfEditor.registerService("ui.relocation.scrollbar", this, {
                    relocation: this.relocation
                });
            },
            initEvent: function() {
                preventDefault(this);
                trackClick(this);
                thumbHandler(this);
                btnClick(this);
            },
            mountWidget: function() {
                var widgets = this.widgets, container = this.container;
                for (var wgtName in widgets) {
                    if (widgets.hasOwnProperty(wgtName)) {
                        container.appendChild(widgets[wgtName]);
                    }
                }
                widgets.thumb.appendChild(widgets.thumbBody);
                widgets.track.appendChild(widgets.thumb);
            },
            show: function() {
                this.state = true;
                this.container.style.display = "block";
            },
            hide: function() {
                this.state = false;
                this.container.style.display = "none";
            },
            update: function(contentWidth) {
                var trackWidth = this.values.trackWidth, thumbWidth = 0;
                this.isExpand = contentWidth > this.values.contentWidth;
                this.values.contentWidth = contentWidth;
                this.values.scrollWidth = contentWidth - this.values.viewWidth;
                if (trackWidth >= contentWidth) {
                    this.hide();
                    return;
                }
                thumbWidth = Math.max(Math.ceil(trackWidth * trackWidth / contentWidth), SCROLLBAR_DEF.thumbMinSize);
                this.values.thumbWidth = thumbWidth;
                this.widgets.thumb.style.width = thumbWidth + "px";
                this.widgets.thumbBody.style.width = thumbWidth - 10 + "px";
            },
            setUpdateHandler: function(updateHandler) {
                this.updateHandler = updateHandler;
            },
            updateOffset: function(offset) {
                var values = this.values;
                values.offset = offset;
                values.left = offset / values.trackWidth;
                this.leftOverflow = values.left * (values.contentWidth - values.viewWidth);
                this.rightOverflow = values.contentWidth - values.viewWidth - this.leftOverflow;
                this.updateHandler(values.left, values.offset, values);
            },
            relocation: function() {
                var cursorLocation = this.kfEditor.requestService("control.get.cursor.location"), padding = SCROLLBAR_CONF.padding, contentWidth = this.values.contentWidth, viewWidth = this.values.viewWidth, // 视图左溢出长度
                viewLeftOverflow = this.values.left * (contentWidth - viewWidth), diff = 0;
                if (cursorLocation.x < viewLeftOverflow) {
                    if (cursorLocation.x < 0) {
                        cursorLocation.x = 0;
                    }
                    setThumbOffsetByViewOffset(this, cursorLocation.x);
                } else if (cursorLocation.x + padding > viewLeftOverflow + viewWidth) {
                    cursorLocation.x += padding;
                    if (cursorLocation.x > contentWidth) {
                        cursorLocation.x = contentWidth;
                    }
                    diff = cursorLocation.x - viewWidth;
                    setThumbOffsetByViewOffset(this, diff);
                } else {
                    if (this.isExpand) {
                        // 根据上一次左溢出值设置滑块位置
                        setThumbByLeftOverflow(this, this.leftOverflow);
                    } else {
                        // 减少左溢出
                        setThumbByLeftOverflow(this, contentWidth - viewWidth - this.rightOverflow);
                    }
                }
            }
        });
        function createElement(doc, eleName, className) {
            var node = doc.createElement(eleName), str = '<div class="$1"></div><div class="$2"></div>';
            node.className = CLASS_PREFIX + className;
            if (className === "thumb") {
                className = CLASS_PREFIX + className;
                node.innerHTML = str.replace("$1", className + "-left").replace("$2", className + "-right");
            }
            return node;
        }
        function getRect(node) {
            return node.getBoundingClientRect();
        }
        // 阻止浏览器在scrollbar上的默认行为
        function preventDefault(container) {
            Utils.addEvent(container, "mousedown", function(e) {
                e.preventDefault();
            });
        }
        function preventDefault(comp) {
            Utils.addEvent(comp.container, "mousedown", function(e) {
                e.preventDefault();
            });
        }
        // 轨道点击
        function trackClick(comp) {
            Utils.addEvent(comp.widgets.track, "mousedown", function(e) {
                trackClickHandler(this, comp, e);
            });
        }
        // 两端按钮点击
        function btnClick(comp) {
            // left
            Utils.addEvent(comp.widgets.leftButton, "mousedown", function() {
                setThumbOffsetByStep(comp, -SCROLLBAR_CONF.step);
            });
            Utils.addEvent(comp.widgets.rightButton, "mousedown", function() {
                setThumbOffsetByStep(comp, SCROLLBAR_CONF.step);
            });
        }
        // 滑块处理
        function thumbHandler(comp) {
            var isMoving = false, startPoint = 0, startOffset = 0, trackWidth = comp.values.trackWidth;
            Utils.addEvent(comp.widgets.thumb, "mousedown", function(e) {
                e.preventDefault();
                e.stopPropagation();
                isMoving = true;
                startPoint = e.clientX;
                startOffset = comp.thumbLocationX;
            });
            Utils.addEvent(comp.container.ownerDocument, "mouseup", function() {
                isMoving = false;
                startPoint = 0;
                startOffset = 0;
            });
            Utils.addEvent(comp.container.ownerDocument, "mousemove", function(e) {
                if (!isMoving) {
                    return;
                }
                var distance = e.clientX - startPoint, offset = startOffset + distance, thumbWidth = comp.values.thumbWidth;
                if (offset < 0) {
                    offset = 0;
                } else if (offset + thumbWidth > trackWidth) {
                    offset = trackWidth - thumbWidth;
                }
                setThumbLocation(comp, offset);
            });
        }
        // 轨道点击处理器
        function trackClickHandler(track, comp, evt) {
            var trackRect = getRect(track), values = comp.values, // 单位偏移值， 一个viewWidth所对应到轨道上后的offset值
            unitOffset = values.viewWidth / (values.contentWidth - values.viewWidth) * values.trackWidth, // 点击位置在轨道中的偏移
            clickOffset = evt.clientX - trackRect.left;
            // right click
            if (clickOffset > values.offset) {
                // 剩余距离已经不足以支撑滚动， 则直接偏移置最大
                if (values.offset + unitOffset > values.trackWidth) {
                    setThumbOffset(comp, values.trackWidth);
                } else {
                    setThumbOffset(comp, values.offset + unitOffset);
                }
            } else {
                // 剩余距离已经不足以支撑滚动， 则直接把偏移置零
                if (values.offset - unitOffset < 0) {
                    setThumbOffset(comp, 0);
                } else {
                    setThumbOffset(comp, values.offset - unitOffset);
                }
            }
        }
        function setThumbLocation(comp, locationX) {
            // 滑块偏移值
            var values = comp.values, trackPieceWidth = values.trackWidth - values.thumbWidth, offset = Math.floor(locationX / trackPieceWidth * values.trackWidth);
            comp.updateOffset(offset);
            // 更新滑块物理偏移: 定位
            comp.thumbLocationX = locationX;
            comp.widgets.thumb.style.left = locationX + "px";
        }
        // 根据指定的内容视图上移动的步长来改变滚动条的offset值
        function setThumbOffsetByStep(comp, step) {
            var leftOverflow = comp.leftOverflow + step;
            // 修正越界
            if (leftOverflow < 0) {
                leftOverflow = 0;
            } else if (leftOverflow > comp.values.scrollWidth) {
                leftOverflow = comp.values.scrollWidth;
            }
            setThumbByLeftOverflow(comp, leftOverflow);
        }
        // 设置偏移值, 会同时更新滑块在显示上的定位
        function setThumbOffset(comp, offset) {
            var values = comp.values, offsetProportion = offset / values.trackWidth, trackPieceWidth = values.trackWidth - values.thumbWidth, thumbLocationX = 0;
            thumbLocationX = Math.floor(offsetProportion * trackPieceWidth);
            if (offset < 0) {
                offset = 0;
                thumbLocationX = 0;
            }
            comp.updateOffset(offset);
            // 更新滑块定位
            comp.widgets.thumb.style.left = thumbLocationX + "px";
            comp.thumbLocationX = thumbLocationX;
        }
        /**
     * 根据内容视图上的偏移值设置滑块位置
     */
        function setThumbOffsetByViewOffset(comp, viewOffset) {
            var values = comp.values, offsetProportion = 0, offset = 0;
            // 轨道偏移比例
            offsetProportion = viewOffset / (values.contentWidth - values.viewWidth);
            // 轨道偏移值
            offset = Math.floor(offsetProportion * values.trackWidth);
            setThumbOffset(comp, offset);
        }
        /**
     * 根据左溢出值设置滑块定位
     */
        function setThumbByLeftOverflow(comp, leftViewOverflow) {
            var values = comp.values, overflowProportion = leftViewOverflow / (values.contentWidth - values.viewWidth);
            setThumbOffset(comp, overflowProportion * values.trackWidth);
        }
    }
};

/**
 * 新UI
 */
_p[28] = {
    value: function(require) {
        var kity = _p.r(21), Utils = _p.r(4), config = _p.r(22), FUI = _p.r(14), VIEW_STATE = _p.r(23).VIEW_STATE, Scrollbar = _p.r(27), UIComponent = kity.createClass("UIComponent", {
            constructor: function(kfEditor, options) {
                var currentDocument = null;
                this.options = options;
                this.lastHeight = -1;
                this.minHeight - 1;
                this.notifyCallback = null;
                this.container = kfEditor.getContainer();
                currentDocument = this.container.ownerDocument;
                // ui组件实例集合
                this.components = {};
                this.canvasRect = null;
                this.viewState = VIEW_STATE.NO_OVERFLOW;
                this.latexInput = null;
                this.kfEditor = kfEditor;
                this.toolbarWidget = FUI.Creator.parse(config);
                this.editArea = new FUI.Panel({
                    className: "kf-editor-ui-editor-area"
                });
                this.canvasContainer = new FUI.Panel({
                    className: "kf-editor-ui-canvas"
                });
                this.scrollbarContainer = new FUI.Panel({
                    className: "kf-editor-edit-scrollbar"
                });
                this.latexArea = new FUI.Panel({
                    className: "kf-editor-ui-latex-area"
                });
                this.latexInput = creatLatexInput(currentDocument);
                this.latexArea.getContentElement().appendChild(this.latexInput);
                this.scrollbarContainer = createScrollbarContainer(currentDocument);
                this.toolbarWidget.appendTo(this.container);
                this.latexArea.appendTo(this.editArea);
                this.canvasContainer.appendTo(this.editArea);
                this.editArea.appendTo(this.container);
                this.container.appendChild(this.scrollbarContainer);
                this.canvasContainer = this.canvasContainer.getContentElement();
                this.editArea = this.editArea.getContentElement();
                this.initComponents();
                this.initServices();
                this.initCommands();
                this.initEvent();
                this.updateContainerSize(this.container, this.toolbarWidget.getContentElement(), this.editArea);
                this.initScrollEvent();
            },
            // 组件实例化
            initComponents: function() {
                this.components.scrollbar = new Scrollbar(this, this.kfEditor);
            },
            updateContainerSize: function(container, toolbar, editArea) {
                var containerBox = container.getBoundingClientRect(), toolbarBox = toolbar.getBoundingClientRect(), height = containerBox.bottom - toolbarBox.bottom;
                editArea.style.width = containerBox.width + "px";
                editArea.style.height = height + "px";
                this.lastHeight = height - 100;
                this.minHeight = this.lastHeight;
                this.canvasContainer.style.height = this.lastHeight + "px";
            },
            updateCanvasSize: function() {
                var rootShape = this.kfEditor.requestService("syntax.get.root"), height = -1, shapeHeight = -1;
                shapeHeight = rootShape.getRenderBox("paper").height;
                if (shapeHeight < this.lastHeight) {
                    height = this.minHeight + 100;
                    if (shapeHeight + 100 < this.lastHeight) {
                        height = this.lastHeight - Math.max(shapeHeight, this.minHeight);
                        height = Math.floor(height / 100);
                        if (height === 0) {
                            return;
                        }
                        this.updateHeight(-height * 100);
                    }
                } else {
                    this.updateHeight(Math.ceil((shapeHeight - this.lastHeight) / 100) * 100);
                }
            },
            updateHeight: function(diff) {
                this.lastHeight += diff;
                this.canvasContainer.style.height = this.lastHeight + "px";
                this.editArea.style.height = this.lastHeight + 100 + "px";
                this.container.style.height = $(this.container).height() + diff + "px";
                this.notifyContainer(diff);
            },
            notifyContainer: function(changeValue) {
                if (!this.notifyCallback) {
                    return;
                }
                this.notifyCallback(changeValue);
            },
            setNotify: function(cb) {
                this.notifyCallback = cb;
            },
            // 初始化服务
            initServices: function() {
                this.kfEditor.registerService("ui.get.canvas.container", this, {
                    getCanvasContainer: this.getCanvasContainer
                });
                this.kfEditor.registerService("ui.get.latex.input", this, {
                    getLatexInput: this.getLatexInput
                });
                this.kfEditor.registerService("ui.update.canvas.view", this, {
                    updateCanvasView: this.updateCanvasView
                });
                this.kfEditor.registerService("ui.canvas.container.event", this, {
                    on: this.addEvent,
                    off: this.removeEvent,
                    trigger: this.trigger,
                    fire: this.trigger
                });
                this.kfEditor.registerService("ui.update.canvas.size", this, {
                    updateCanvasSize: this.updateCanvasSize
                });
                this.kfEditor.registerService("ui.toolbar.disable", this, {
                    disableToolbar: this.disableToolbar
                });
                this.kfEditor.registerService("ui.toolbar.enable", this, {
                    enableToolbar: this.enableToolbar
                });
                this.kfEditor.registerService("ui.toolbar.close", this, {
                    closeToolbar: this.closeToolbar
                });
            },
            initCommands: function() {
                this.kfEditor.registerCommand("resize.notify", this, this.setNotify);
            },
            initEvent: function() {
                var editor = this.kfEditor;
                Utils.addEvent(this.container, "mousewheel", function(e) {
                    e.preventDefault();
                });
                this.toolbarWidget.on("btnclick", function(e) {
                    var val = e.widget.getValue();
                    if (val) {
                        editor.requestService("control.insert.string", val);
                    }
                });
            },
            initScrollEvent: function() {
                var _self = this;
                this.kfEditor.requestService("ui.set.scrollbar.update.handler", function(proportion, offset, values) {
                    offset = Math.floor(proportion * (values.contentWidth - values.viewWidth));
                    _self.kfEditor.requestService("render.set.canvas.offset", offset);
                });
            },
            getCanvasContainer: function() {
                return this.canvasContainer;
            },
            addEvent: function(type, handler) {
                Utils.addEvent(this.canvasContainer, type, handler);
            },
            removeEvent: function() {},
            trigger: function(type) {
                Utils.trigger(this.canvasContainer, type);
            },
            getLatexInput: function() {
                return this.latexInput;
            },
            // 更新画布视窗， 决定是否出现滚动条
            updateCanvasView: function() {
                var canvas = this.kfEditor.requestService("render.get.canvas"), contentContainer = canvas.getContentContainer(), contentRect = null;
                if (this.canvasRect === null) {
                    // 兼容firfox， 获取容器大小，而不是获取画布大小
                    this.canvasRect = this.canvasContainer.getBoundingClientRect();
                }
                contentRect = contentContainer.getRenderBox("paper");
                if (contentRect.width > this.canvasRect.width) {
                    if (this.viewState === VIEW_STATE.NO_OVERFLOW) {
                        this.toggleViewState();
                        this.kfEditor.requestService("ui.show.scrollbar");
                        this.kfEditor.requestService("render.disable.relocation");
                    }
                    this.kfEditor.requestService("render.relocation");
                    // 更新滚动条， 参数是：滚动条所控制的内容长度
                    this.kfEditor.requestService("ui.update.scrollbar", contentRect.width);
                    this.kfEditor.requestService("ui.relocation.scrollbar");
                } else {
                    if (this.viewState === VIEW_STATE.OVERFLOW) {
                        this.toggleViewState();
                        this.kfEditor.requestService("ui.hide.scrollbar");
                        this.kfEditor.requestService("render.enable.relocation");
                    }
                    this.kfEditor.requestService("render.relocation");
                }
                this.updateCanvasSize();
            },
            toggleViewState: function() {
                this.viewState = this.viewState === VIEW_STATE.NO_OVERFLOW ? VIEW_STATE.OVERFLOW : VIEW_STATE.NO_OVERFLOW;
            },
            disableToolbar: function() {
                this.toolbarWidget.disable();
            },
            enableToolbar: function() {
                this.toolbarWidget.enable();
            },
            closeToolbar: function() {}
        });
        function createScrollbarContainer(doc) {
            var container = doc.createElement("div");
            container.className = "kf-editor-edit-scrollbar";
            return container;
        }
        function creatLatexInput(doc) {
            var container = doc.createElement("input");
            container.className = "kf-editor-latex-input";
            return container;
        }
        return UIComponent;
    }
};

/**
 * 数学公式解析器
 */
_p[29] = {
    value: function(require) {
        var KFParser = _p.r(20).Parser, kity = _p.r(21), CURSOR_CHAR = _p.r(37).cursorCharacter, VGROUP_LIST = _p.r(30), ROOT_P_TEXT = _p.r(37).rootPlaceholder.content, COMBINATION_NAME = "combination", PID_PREFIX = "_kf_editor_", GROUP_TYPE = _p.r(11), PID = 0;
        var Parser = kity.createClass("Parser", {
            constructor: function(kfEditor) {
                this.kfEditor = kfEditor;
                this.callBase();
                // kityformula 解析器
                this.kfParser = KFParser.use("latex");
                this.initKFormulExtension();
                this.pid = generateId();
                this.groupRecord = 0;
                this.tree = null;
                this.isResetId = true;
                this.initServices();
            },
            parse: function(str, isResetId) {
                var parsedResult = null;
                this.isResetId = !!isResetId;
                if (this.isResetId) {
                    this.resetGroupId();
                }
                parsedResult = this.kfParser.parse(str);
                // 对解析出来的结果树做适当的处理，使得编辑器能够更容易地识别当前表达式的语义
                supplementTree(this, parsedResult.tree);
                return parsedResult;
            },
            // 序列化， parse的逆过程
            serialization: function(tree) {
                return this.kfParser.serialization(tree);
            },
            initServices: function() {
                this.kfEditor.registerService("parser.parse", this, {
                    parse: this.parse
                });
                this.kfEditor.registerService("parser.latex.serialization", this, {
                    serialization: this.serialization
                });
            },
            getKFParser: function() {
                return this.kfParser;
            },
            // 初始化KF扩展
            initKFormulExtension: function() {
                _p.r(18).ext(this);
            },
            resetGroupId: function() {
                this.groupRecord = 0;
            },
            getGroupId: function() {
                return this.pid + "_" + ++this.groupRecord;
            }
        });
        // 把解析树丰富成公式编辑器的语义树, 该语义化的树同时也是合法的解析树
        function supplementTree(parser, tree, parentTree) {
            var currentOperand = null, // 只有根节点才没有parentTree
            isRoot = !parentTree;
            tree.attr = tree.attr || {};
            tree.attr.id = parser.getGroupId();
            if (isRoot) {
                processRootGroup(parser, tree);
            } else if (parentTree.attr["data-root"] && tree.name === "placeholder" && onlyPlaceholder(parentTree.operand)) {
                tree.attr.label = ROOT_P_TEXT;
            }
            for (var i = 0, len = tree.operand.length; i < len; i++) {
                currentOperand = tree.operand[i];
                if (isVirtualGroup(tree)) {
                    // 虚拟组处理
                    processVirtualGroup(parser, i, tree, currentOperand);
                } else {
                    processGroup(parser, i, tree, currentOperand);
                }
            }
            return tree;
        }
        function generateId() {
            return PID_PREFIX + ++PID;
        }
        function processRootGroup(parser, tree) {
            // 如果isResetId为false， 表示当前生成的是子树
            // 则不做data-root标记， 同时更改该包裹的类型为GROUP_TYPE.VIRTUAL
            if (!parser.isResetId) {
                tree.attr["data-type"] = GROUP_TYPE.VIRTUAL;
            } else {
                tree.attr["data-root"] = "true";
            }
        }
        /**
     * 虚拟组处理
     * @param parser 解析器实例
     * @param index 当前处理的子树所在其父节点的索引位置
     * @param tree 需要处理的树父树
     * @param subtree 当前需要处理的树
     */
        function processVirtualGroup(parser, index, tree, subtree) {
            // 括号组的前两个元素不用处理
            if (tree.name === "brackets" && index < 2) {
                return;
            } else if (tree.name === "function" && index === 0) {
                return;
            }
            tree.attr["data-type"] = GROUP_TYPE.VIRTUAL;
            if (!subtree) {
                tree.operand[index] = subtree;
            } else if (typeof subtree === "string") {
                tree.operand[index] = createGroup(parser);
                tree.operand[index].operand[0] = subtree;
            } else if (isPlaceholder(subtree)) {
                tree.operand[index] = createGroup(parser);
                tree.operand[index].operand[0] = supplementTree(parser, subtree, tree.operand[index]);
            } else {
                tree.operand[index] = supplementTree(parser, subtree, tree);
            }
        }
        function processGroup(parser, index, tree, subtree) {
            tree.attr["data-type"] = GROUP_TYPE.GROUP;
            if (!subtree || typeof subtree === "string") {
                tree.operand[index] = subtree;
            } else if (subtree.name === "text") {
                tree.operand[index] = subtree;
            } else {
                tree.operand[index] = supplementTree(parser, subtree, tree);
            }
        }
        /**
     * 判断给定的操作数列表内是否仅有一个占位符存在, 该判断仅支持对根内部的表达式做判断
     * @param operands 操作数列表
     * @returns {boolean}
     */
        function onlyPlaceholder(operands) {
            var result = operands.length;
            if (result > 3) {
                return false;
            }
            for (var i = 0, len = operands.length; i < len; i++) {
                if (operands[i] === CURSOR_CHAR || operands[i].name === "placeholder") {
                    result--;
                }
            }
            return !result;
        }
        // 判断给定的树是否是一个虚拟组
        function isVirtualGroup(tree) {
            return !!VGROUP_LIST[tree.name];
        }
        // 判断给定的树是否是一个占位符
        function isPlaceholder(tree) {
            return tree.name === "placeholder";
        }
        // 创建一个新组， 组的内容是空
        function createGroup(parser) {
            return {
                name: COMBINATION_NAME,
                attr: {
                    "data-type": GROUP_TYPE.GROUP,
                    id: parser.getGroupId()
                },
                operand: []
            };
        }
        return Parser;
    }
};

/*!
 * 虚拟组列表
 */
_p[30] = {
    value: function() {
        return {
            radical: true,
            fraction: true,
            summation: true,
            integration: true,
            placeholder: true,
            script: true,
            superscript: true,
            subscript: true,
            brackets: true,
            "function": true
        };
    }
};

/*!
 * 定位模块
 */
_p[31] = {
    value: function(require) {
        var kity = _p.r(21), kfUtils = _p.r(4), PositionComponenet = kity.createClass("PositionComponenet", {
            constructor: function(kfEditor) {
                this.kfEditor = kfEditor;
                this.initServices();
            },
            initServices: function() {
                this.kfEditor.registerService("position.get.group", this, {
                    getGroupByTarget: this.getGroupByTarget
                });
                this.kfEditor.registerService("position.get.index", this, {
                    getIndexByTargetInGroup: this.getIndexByTargetInGroup
                });
                this.kfEditor.registerService("position.get.location.info", this, {
                    getLocationInfo: this.getLocationInfo
                });
                this.kfEditor.registerService("position.get.parent.group", this, {
                    getParentGroupByTarget: this.getParentGroupByTarget
                });
                this.kfEditor.registerService("position.get.wrap", this, {
                    getWrap: this.getWrap
                });
                this.kfEditor.registerService("position.get.area", this, {
                    getAreaByCursorInGroup: this.getAreaByCursorInGroup
                });
                this.kfEditor.registerService("position.get.group.info", this, {
                    getGroupInfoByNode: this.getGroupInfoByNode
                });
                this.kfEditor.registerService("position.get.parent.info", this, {
                    getParentInfoByNode: this.getParentInfoByNode
                });
            },
            getGroupByTarget: function(target) {
                var groupDom = getGroup(target, false, false);
                if (groupDom) {
                    return this.kfEditor.requestService("syntax.get.group.content", groupDom.id);
                }
                return null;
            },
            /**
             * 根据给定的组节点和目标节点， 获取目标节点在组节点内部的索引
             * @param groupNode 组节点
             * @param targetNode 目标节点
             */
            getIndexByTargetInGroup: function(groupNode, targetNode) {
                var groupInfo = this.kfEditor.requestService("syntax.get.group.content", groupNode.id), index = -1;
                kity.Utils.each(groupInfo.content, function(child, i) {
                    index = i;
                    if (kfUtils.contains(child, targetNode)) {
                        return false;
                    }
                });
                return index;
            },
            /**
             * 根据给定的组节点和给定的偏移值，获取当前偏移值在组中的区域值。
             * 该区域值的取值为true时， 表示在右区域， 反之则在左区域
             * @param groupNode 组节点
             * @param offset 偏移值
             */
            getAreaByCursorInGroup: function(groupNode, offset) {
                var groupRect = kfUtils.getRect(groupNode);
                return groupRect.left + groupRect.width / 2 < offset;
            },
            getLocationInfo: function(distance, groupInfo) {
                var index = -1, children = groupInfo.content, boundingRect = null;
                for (var i = children.length - 1, child = null; i >= 0; i--) {
                    index = i;
                    child = children[i];
                    boundingRect = kfUtils.getRect(child);
                    if (boundingRect.left < distance) {
                        if (boundingRect.left + boundingRect.width / 2 < distance) {
                            index += 1;
                        }
                        break;
                    }
                }
                return index;
            },
            getParentGroupByTarget: function(target) {
                var groupDom = getGroup(target, true, false);
                if (groupDom) {
                    return this.kfEditor.requestService("syntax.get.group.content", groupDom.id);
                }
                return null;
            },
            getWrap: function(node) {
                return getGroup(node, true, true);
            },
            /**
             * 给定一个节点， 获取其节点所属的组及其在该组内的偏移
             * @param target 目标节点
             */
            getGroupInfoByNode: function(target) {
                var result = {}, containerNode = getGroup(target, false, false), containerInfo = null;
                if (!containerNode) {
                    return null;
                }
                containerInfo = this.kfEditor.requestService("syntax.get.group.content", containerNode.id);
                for (var i = 0, len = containerInfo.content.length; i < len; i++) {
                    result.index = i;
                    if (kfUtils.contains(containerInfo.content[i], target)) {
                        break;
                    }
                }
                result.group = containerInfo;
                return result;
            },
            /**
             * 给定一个节点， 获取其节点所属的直接包含组及其在该直接包含组内的偏移
             * @param target 目标节点
             */
            getParentInfoByNode: function(target) {
                var group = getGroup(target, true, false);
                group = this.kfEditor.requestService("syntax.get.group.content", group.id);
                return {
                    group: group,
                    index: group.content.indexOf(target)
                };
            }
        });
        /**
     * 获取给定节点元素所属的组
     * @param node 当前点击的节点
     * @param isAllowVirtual 是否允许选择虚拟组
     * @param isAllowWrap 是否允许选择目标节点的最小包裹单位
     * @returns {*}
     */
        function getGroup(node, isAllowVirtual, isAllowWrap) {
            var tagName = null;
            if (!node.ownerSVGElement) {
                return null;
            }
            node = node.parentNode;
            tagName = node.tagName.toLowerCase();
            if (node && tagName !== "body" && tagName !== "svg") {
                if (node.getAttribute("data-type") === "kf-editor-group") {
                    return node;
                }
                if (isAllowVirtual && node.getAttribute("data-type") === "kf-editor-virtual-group") {
                    return node;
                }
                if (isAllowWrap && node.getAttribute("data-flag") !== null) {
                    return node;
                }
                return getGroup(node, isAllowVirtual, isAllowWrap);
            } else {
                return null;
            }
        }
        return PositionComponenet;
    }
};

/*!
 * 打印服务
 */
_p[32] = {
    value: function(require) {
        var kity = _p.r(21);
        return kity.createClass("Printer", {
            constructor: function(kfEditor) {
                this.kfEditor = kfEditor;
                this.initServices();
                this.initCommands();
            },
            initServices: function() {
                this.kfEditor.registerService("print.image", this, {
                    printImage: this.printImage
                });
            },
            initCommands: function() {
                this.kfEditor.registerCommand("get.image.data", this, this.getImageData);
            },
            printImage: function(type) {
                var formula = this.kfEditor.requestService("render.get.paper");
                this._formatCanvas();
                formula.toPNG(function(dataUrl) {
                    document.body.innerHTML = '<img style="background: red;" src="' + dataUrl + '">';
                });
                this._restoreCanvas();
            },
            getImageData: function(cb) {
                var canvas = this.kfEditor.requestService("render.get.canvas"), formula = this.kfEditor.requestService("render.get.paper");
                this._formatCanvas();
                formula.toPNG(function(dataUrl) {
                    cb({
                        width: canvas.width,
                        height: canvas.height,
                        img: dataUrl
                    });
                });
                this._restoreCanvas();
            },
            _formatCanvas: function() {
                var canvas = this.kfEditor.requestService("render.get.canvas"), rect = canvas.container.getRenderBox();
                canvas.node.setAttribute("width", rect.width);
                canvas.node.setAttribute("height", rect.height);
                this.kfEditor.requestService("render.clear.canvas.transform");
                this.kfEditor.requestService("control.cursor.hide");
                this.kfEditor.requestService("render.clear.select");
            },
            _restoreCanvas: function() {
                var canvas = this.kfEditor.requestService("render.get.canvas");
                canvas.node.setAttribute("width", "100%");
                canvas.node.setAttribute("height", "100%");
                this.kfEditor.requestService("render.revert.canvas.transform");
                this.kfEditor.requestService("control.cursor.relocation");
                this.kfEditor.requestService("render.reselect");
            }
        });
    }
};

/**
 * Created by hn on 14-3-17.
 */
_p[33] = {
    value: function(require) {
        var kity = _p.r(21), Assembly = _p.r(20).Assembly, DEFAULT_OPTIONS = {
            autoresize: false,
            fontsize: 50,
            padding: [ 20, 50 ]
        }, RenderComponenet = kity.createClass("RenderComponent", {
            // 异步组件
            base: _p.r(1),
            constructor: function(kfEditor, options) {
                this.callBase();
                this.options = kity.Utils.extend({}, DEFAULT_OPTIONS, options);
                this.kfEditor = kfEditor;
                this.assembly = null;
                this.formula = null;
                this.__cbList = [];
                // 是否禁用重定位
                this.relDisabled = false;
                this.canvasZoom = 1;
                this.record = {
                    select: {},
                    cursor: {},
                    // 画布信息
                    canvas: {}
                };
                this.initCanvas();
                this.initServices();
                this.initCommands();
            },
            initCanvas: function() {
                var canvasContainer = this.kfEditor.requestService("ui.get.canvas.container"), Formula = this.kfEditor.getFormulaClass();
                this.assembly = new Assembly(new Formula(canvasContainer, this.options));
                this.formula = this.assembly.formula;
                this.setCanvasToCenter();
            },
            setCanvasOffset: function(offsetX, offsetY) {
                var viewBox = this.formula.getViewBox();
                offsetY = offsetY !== undefined ? offsetY : -viewBox.height / 2;
                this.formula.setViewBox(offsetX, offsetY, viewBox.width, viewBox.height);
            },
            setCanvasToCenter: function() {
                var viewBox = this.formula.getViewBox();
                this.formula.setViewBox(-viewBox.width / 2, -viewBox.height / 2, viewBox.width, viewBox.height);
            },
            initServices: function() {
                this.kfEditor.registerService("render.get.canvas", this, {
                    getCanvas: this.getCanvas
                });
                this.kfEditor.registerService("render.get.content.size", this, {
                    getContentSize: this.getContentSize
                });
                this.kfEditor.registerService("render.clear.canvas.transform", this, {
                    clearCanvasOffset: this.clearCanvasTransform
                });
                this.kfEditor.registerService("render.set.canvas.offset", this, {
                    setCanvasOffset: this.setCanvasOffset
                });
                this.kfEditor.registerService("render.set.canvas.to.center", this, {
                    setCanvasToCenter: this.setCanvasToCenter
                });
                this.kfEditor.registerService("render.revert.canvas.transform", this, {
                    revertCanvasTransform: this.revertCanvasTransform
                });
                this.kfEditor.registerService("render.relocation", this, {
                    relocation: this.relocation
                });
                this.kfEditor.registerService("render.disable.relocation", this, {
                    disableRelocation: this.disableRelocation
                });
                this.kfEditor.registerService("render.enable.relocation", this, {
                    enableRelocation: this.enableRelocation
                });
                this.kfEditor.registerService("render.select.group.content", this, {
                    selectGroupContent: this.selectGroupContent
                });
                this.kfEditor.registerService("render.select.group", this, {
                    selectGroup: this.selectGroup
                });
                this.kfEditor.registerService("render.select.group.all", this, {
                    selectAllGroup: this.selectAllGroup
                });
                this.kfEditor.registerService("render.tint.current.cursor", this, {
                    tintCurrentGroup: this.tintCurrentGroup
                });
                this.kfEditor.registerService("render.select.current.cursor", this, {
                    selectCurrentCursor: this.selectCurrentCursor
                });
                this.kfEditor.registerService("render.reselect", this, {
                    reselect: this.reselect
                });
                this.kfEditor.registerService("render.clear.select", this, {
                    clearSelect: this.clearSelect
                });
                this.kfEditor.registerService("render.set.canvas.zoom", this, {
                    setCanvasZoom: this.setCanvasZoom
                });
                this.kfEditor.registerService("render.get.canvas.zoom", this, {
                    getCanvasZoom: this.getCanvasZoom
                });
                this.kfEditor.registerService("render.get.paper.offset", this, {
                    getPaperOffset: this.getPaperOffset
                });
                this.kfEditor.registerService("render.draw", this, {
                    render: this.render
                });
                this.kfEditor.registerService("render.insert.string", this, {
                    insertString: this.insertString
                });
                this.kfEditor.registerService("render.insert.group", this, {
                    insertGroup: this.insertGroup
                });
                this.kfEditor.registerService("render.get.paper", this, {
                    getPaper: this.getPaper
                });
            },
            initCommands: function() {
                this.kfEditor.registerCommand("render", this, function(str) {
                    this.render(str);
                    this.kfEditor.requestService("control.set.source", str);
                    this.kfEditor.requestService("ui.update.canvas.view");
                });
                this.kfEditor.registerCommand("register.render.listener", this, this.registerListener);
                this.kfEditor.registerCommand("getPaper", this, this.getPaper);
            },
            relocation: function() {
                if (!this.relDisabled) {
                    this.relocationToCenter();
                } else {
                    this.relocationToLeft();
                }
            },
            relocationToCenter: function() {
                var formulaSpace = this.formula.container.getRenderBox();
                this.formula.container.setTranslate(-formulaSpace.width / 2, -formulaSpace.height / 2);
                this.setCanvasToCenter();
            },
            relocationToLeft: function() {
                var formulaSpace = this.formula.container.getRenderBox();
                this.formula.container.setTranslate(0, -formulaSpace.height / 2);
                this.setCanvasOffset(0);
            },
            registerListener: function(cb) {
                this.__cbList.push(cb);
            },
            selectGroup: function(groupId) {
                var groupObject = this.kfEditor.requestService("syntax.get.group.object", groupId);
                this.clearSelect();
                if (groupObject.node.getAttribute("data-root")) {
                    // 根节点不着色
                    return;
                }
                this.record.select.lastSelect = groupObject;
                groupObject.select();
            },
            selectGroupContent: function(group) {
                // 处理占位符
                if (group.groupObj.getAttribute("data-placeholder") !== null) {
                    group = {
                        id: group.content[0].id
                    };
                }
                var groupObject = this.kfEditor.requestService("syntax.get.group.object", group.id);
                this.clearSelect();
                this.record.select.lastSelect = groupObject;
                if (groupObject.node.getAttribute("data-root")) {
                    // 根节点不着色
                    return;
                }
                groupObject.select();
            },
            selectAllGroup: function(group) {
                // 处理占位符
                if (group.groupObj.getAttribute("data-placeholder") !== null) {
                    group = {
                        id: group.content[0].id
                    };
                }
                var groupObject = this.kfEditor.requestService("syntax.get.group.object", group.id);
                this.clearSelect();
                this.record.select.lastSelect = groupObject;
                groupObject.selectAll();
            },
            /**
             * 根据当前光标信息绘制选区
             */
            selectCurrentCursor: function() {
                var cursorInfo = this.kfEditor.requestService("syntax.get.record.cursor"), group = this.kfEditor.requestService("syntax.get.group.object", cursorInfo.groupId), box = null, offset = -1, width = 0, startIndex = Math.min(cursorInfo.startOffset, cursorInfo.endOffset), endIndex = Math.max(cursorInfo.startOffset, cursorInfo.endOffset);
                this.clearSelect();
                // 更新记录
                this.record.select.lastSelect = group;
                for (var i = startIndex, len = endIndex; i < len; i++) {
                    box = group.getOperand(i).getRenderBox(group);
                    if (offset == -1) {
                        offset = box.x;
                    }
                    width += box.width;
                }
                group.setBoxWidth(width);
                group.selectAll();
                group.getBox().setTranslate(offset, 0);
            },
            /**
             * 根据当前的光标信息，对当前光标所在的容器进行着色
             */
            tintCurrentGroup: function() {
                var groupId = this.kfEditor.requestService("syntax.get.record.cursor").groupId, groupObject = this.kfEditor.requestService("syntax.get.group.object", groupId), isPlaceholder = this.kfEditor.requestService("syntax.is.placeholder.node", groupId);
                this.clearSelect();
                if (groupObject.node.getAttribute("data-root")) {
                    // 根节点不着色
                    return;
                }
                // 占位符着色
                if (isPlaceholder) {
                    // 替换占位符包裹组为占位符本身
                    groupObject = this.kfEditor.requestService("syntax.get.group.object", groupObject.operands[0].node.id);
                }
                this.record.select.lastSelect = groupObject;
                groupObject.select();
            },
            reselect: function() {
                var cursorInfo = this.kfEditor.requestService("syntax.get.record.cursor"), groupObject = null;
                groupObject = this.kfEditor.requestService("syntax.get.group.object", cursorInfo.groupId);
                this.clearSelect();
                this.record.select.lastSelect = groupObject;
                if (groupObject.node.getAttribute("data-root")) {
                    // 根节点不着色
                    return;
                }
                groupObject.select();
            },
            clearSelect: function() {
                var box = null, currentSelect = this.record.select.lastSelect;
                if (!currentSelect || !currentSelect.node.ownerSVGElement) {
                    return;
                }
                currentSelect.unselect();
                box = currentSelect.getRenderBox(currentSelect);
                currentSelect.setBoxWidth(box.width);
                currentSelect.getBox().setTranslate(0, 0);
            },
            getPaper: function() {
                return this.formula;
            },
            render: function(latexStr) {
                var parsedTree = this.kfEditor.requestService("parser.parse", latexStr, true), objTree = this.assembly.regenerateBy(parsedTree);
                // 更新语法模块所维护的树
                this.kfEditor.requestService("syntax.update.objtree", objTree);
            },
            enableRelocation: function() {
                this.relDisabled = false;
            },
            disableRelocation: function() {
                this.relDisabled = true;
            },
            setCanvasZoom: function(zoom) {
                var viewPort = this.formula.getViewPort();
                this.canvasZoom = zoom;
                viewPort.zoom = zoom;
                this.formula.setViewPort(viewPort);
            },
            getCanvas: function() {
                return this.formula;
            },
            getContentSize: function() {
                return this.formula.container.getRenderBox();
            },
            /**
             * 清除编辑器里内容的偏移
             */
            clearCanvasTransform: function() {
                var canvasInfo = this.record.canvas;
                canvasInfo.viewBox = this.formula.getViewBox();
                canvasInfo.contentOffset = this.formula.container.getTranslate();
                this.setCanvasToCenter();
                this.formula.node.removeAttribute("viewBox");
                this.formula.container.setTranslate(0, 0);
            },
            /**
             * 恢复被clearCanvasTransform清除的偏移， 该方法仅针对上一次清除有效，
             * 且该方法应该只有在调用clearCanvasTransform后才可以调用该方法，并且两者之间应该配对出现
             * @returns {boolean}
             */
            revertCanvasTransform: function() {
                var canvasInfo = this.record.canvas, viewBox = canvasInfo.viewBox;
                if (!viewBox) {
                    return false;
                }
                this.formula.setViewBox(viewBox.x, viewBox.y, viewBox.width, viewBox.height);
                this.formula.container.setTranslate(canvasInfo.contentOffset);
                canvasInfo.viewBox = null;
                canvasInfo.contentOffset = null;
            },
            getCanvasZoom: function() {
                return this.canvasZoom;
            }
        });
        return RenderComponenet;
    }
};

/*！
 * 删除控制
 */
_p[34] = {
    value: function(require, exports, module) {
        var kity = _p.r(21);
        return kity.createClass("DeleteComponent", {
            constructor: function(parentComponent, kfEditor) {
                this.parentComponent = parentComponent;
                this.kfEditor = kfEditor;
            },
            deleteGroup: function() {
                var cursorInfo = this.parentComponent.getCursorRecord(), objTree = this.parentComponent.getObjectTree(), // 当前的树信息
                currentTree = objTree.mapping[cursorInfo.groupId].strGroup;
                // 选区长度为0, 则删除前一个组
                if (cursorInfo.startOffset === cursorInfo.endOffset) {
                    // 已经到最前， 需要进一步处理
                    if (cursorInfo.startOffset === 0) {
                        // 根节点时， 直接退出， 不做任何处理
                        if (this.parentComponent.isRootTree(currentTree)) {
                            return false;
                        }
                        // 不是根节点时， 选中当前容器的父容器
                        cursorInfo = this.selectParentContainer(cursorInfo.groupId);
                        this.parentComponent.updateCursor(cursorInfo);
                        return false;
                    } else {
                        // 还有更多剩余内容， 则直接删除前一个组
                        if (currentTree.operand.length > 1) {
                            cursorInfo = this.deletePrevGroup(currentTree, cursorInfo);
                        } else {
                            // 更新光标位置
                            cursorInfo.startOffset = 0;
                            cursorInfo.endOffset = 1;
                            // 处理组类型， 选中该组即可
                            if (currentTree.operand[0].attr && this.parentComponent.isGroupNode(currentTree.operand[0].attr.id)) {
                                this.parentComponent.updateCursor(cursorInfo);
                                return false;
                            } else {
                                // 替换成占位符
                                currentTree.operand[0] = {
                                    name: "placeholder",
                                    operand: []
                                };
                                this.parentComponent.updateCursor(cursorInfo);
                                return true;
                            }
                        }
                    }
                } else {
                    // 当前选中占位符的情况
                    if (this.parentComponent.isSelectPlaceholder()) {
                        // 如果是根节点， 则不允许删除
                        if (this.parentComponent.isRootTree(currentTree)) {
                            return false;
                        } else {
                            cursorInfo = this.selectParentContainer(cursorInfo.groupId);
                            this.parentComponent.updateCursor(cursorInfo);
                            return false;
                        }
                    } else {
                        var tmpCursorInfo = this.selectParentContainer(cursorInfo.groupId), isPlaceholder = false, tmpCurrentTree = null, tmpTree = objTree.mapping[tmpCursorInfo.groupId].strGroup;
                        // cases语句删除
                        if (tmpTree.name === "cases") {
                            tmpCurrentTree = tmpTree.operand[tmpCursorInfo.startOffset];
                            while (tmpCurrentTree.operand && tmpCurrentTree.operand.length > 0) {
                                isPlaceholder = tmpCurrentTree.operand[0].name === "placeholder";
                                if (isPlaceholder) {
                                    break;
                                }
                                tmpCurrentTree = tmpCurrentTree.operand[0];
                            }
                            if (isPlaceholder) {
                                // 选中整个表达式
                                if (tmpTree.operand.length === 1) {
                                    tmpCursorInfo = this.selectParentContainer(cursorInfo.groupId);
                                    tmpCursorInfo = this.selectParentContainer(tmpCursorInfo.groupId);
                                    this.parentComponent.updateCursor(tmpCursorInfo);
                                    return false;
                                }
                                tmpTree.operand.splice(tmpCursorInfo.startOffset, 1);
                                if (tmpCursorInfo.startOffset > 0) {
                                    tmpCursorInfo.startOffset -= 1;
                                    tmpCursorInfo.endOffset -= 1;
                                }
                                this.parentComponent.updateCursor(tmpCursorInfo);
                                return true;
                            } else {
                                return this.deleteSelection(currentTree, cursorInfo);
                            }
                        }
                        return this.deleteSelection(currentTree, cursorInfo);
                    }
                }
                this.parentComponent.updateCursor(cursorInfo);
                // 选区长度为0， 则可以判定当前公式发生了改变
                if (cursorInfo.startOffset === cursorInfo.endOffset) {
                    return true;
                }
                return false;
            },
            // 删除前一个节点, 返回更新后的光标信息
            deletePrevGroup: function(tree, cursorInfo) {
                // 待删除的组
                var index = cursorInfo.startOffset - 1, group = tree.operand[index];
                // 叶子节点可以直接删除
                if (this.parentComponent.isLeafTree(group)) {
                    tree.operand.splice(index, 1);
                    cursorInfo.startOffset -= 1;
                    cursorInfo.endOffset -= 1;
                } else {
                    cursorInfo.startOffset -= 1;
                }
                return cursorInfo;
            },
            // 删除选区内容
            deleteSelection: function(tree, cursorInfo) {
                // 选中的是容器内的所有内容
                if (cursorInfo.startOffset === 0 && cursorInfo.endOffset === tree.operand.length) {
                    tree.operand.length = 1;
                    tree.operand[0] = {
                        name: "placeholder",
                        operand: []
                    };
                    cursorInfo.endOffset = 1;
                } else {
                    tree.operand.splice(cursorInfo.startOffset, cursorInfo.endOffset - cursorInfo.startOffset);
                    cursorInfo.endOffset = cursorInfo.startOffset;
                }
                this.parentComponent.updateCursor(cursorInfo);
                return true;
            },
            // 选中给定ID节点的父容器
            selectParentContainer: function(groupId) {
                if (this.parentComponent.isRootNode(groupId)) {
                    return this.parentComponent.getCursorRecord();
                }
                var currentGroupNode = this.parentComponent.getGroupObject(groupId).node, parentContainerInfo = this.kfEditor.requestService("position.get.group", currentGroupNode), // 当前组在父容器中的索引
                index = this.kfEditor.requestService("position.get.index", parentContainerInfo.groupObj, currentGroupNode);
                // 返回新的光标信息
                return {
                    groupId: parentContainerInfo.id,
                    startOffset: index,
                    endOffset: index + 1
                };
            }
        });
    }
};

/*！
 * 光标移动控制
 */
_p[35] = {
    value: function(require, exports, module) {
        var kity = _p.r(21), DIRECTION = {
            LEFT: "left",
            RIGHT: "right"
        };
        return kity.createClass("MoveComponent", {
            constructor: function(parentComponent, kfEditor) {
                this.parentComponent = parentComponent;
                this.kfEditor = kfEditor;
            },
            leftMove: function() {
                var cursorInfo = this.parentComponent.getCursorRecord();
                cursorInfo = updateCursorGoLeft.call(this, cursorInfo);
                // cursorInfo 为null则不用处理
                if (cursorInfo) {
                    this.parentComponent.updateCursor(cursorInfo);
                }
            },
            rightMove: function() {
                var cursorInfo = this.parentComponent.getCursorRecord();
                cursorInfo = updateCursorGoRight.call(this, cursorInfo);
                // cursorInfo 为null则不用处理
                if (cursorInfo) {
                    this.parentComponent.updateCursor(cursorInfo);
                }
            }
        });
        function updateCursorGoLeft(cursorInfo) {
            var prevGroupNode = null, syntaxComponent = this.parentComponent, containerInfo = null;
            containerInfo = syntaxComponent.getGroupContent(cursorInfo.groupId);
            // 当前处于占位符中
            if (syntaxComponent.isSelectPlaceholder()) {
                return locateOuterIndex(this, containerInfo.content[cursorInfo.startOffset], DIRECTION.LEFT);
            }
            if (cursorInfo.startOffset === cursorInfo.endOffset) {
                if (cursorInfo.startOffset > 0) {
                    prevGroupNode = containerInfo.content[cursorInfo.startOffset - 1];
                    if (isGroupNode(prevGroupNode)) {
                        cursorInfo = locateIndex(this, prevGroupNode, DIRECTION.LEFT);
                    } else {
                        cursorInfo.startOffset -= 1;
                        // 非占位符处理
                        if (!isPlaceholderNode(prevGroupNode)) {
                            cursorInfo.endOffset = cursorInfo.startOffset;
                        }
                    }
                } else {
                    cursorInfo = locateOuterIndex(this, containerInfo.groupObj, DIRECTION.LEFT);
                }
            } else {
                cursorInfo.startOffset = Math.min(cursorInfo.startOffset, cursorInfo.endOffset);
                // 收缩
                cursorInfo.endOffset = cursorInfo.startOffset;
            }
            return cursorInfo;
        }
        function updateCursorGoRight(cursorInfo) {
            var nextGroupNode = null, syntaxComponent = this.parentComponent, containerInfo = null;
            containerInfo = syntaxComponent.getGroupContent(cursorInfo.groupId);
            // 当前处于占位符中
            if (syntaxComponent.isSelectPlaceholder()) {
                return locateOuterIndex(this, containerInfo.content[cursorInfo.startOffset], DIRECTION.RIGHT);
            }
            if (cursorInfo.startOffset === cursorInfo.endOffset) {
                if (cursorInfo.startOffset < containerInfo.content.length) {
                    nextGroupNode = containerInfo.content[cursorInfo.startOffset];
                    // 进入容器内部
                    if (isGroupNode(nextGroupNode)) {
                        cursorInfo = locateIndex(this, nextGroupNode, DIRECTION.RIGHT);
                    } else {
                        cursorInfo.startOffset += 1;
                        // 非占位符同时更新结束偏移
                        if (!isPlaceholderNode(nextGroupNode)) {
                            cursorInfo.endOffset = cursorInfo.startOffset;
                        }
                    }
                } else {
                    cursorInfo = locateOuterIndex(this, containerInfo.groupObj, DIRECTION.RIGHT);
                }
            } else {
                cursorInfo.endOffset = Math.max(cursorInfo.startOffset, cursorInfo.endOffset);
                // 收缩
                cursorInfo.startOffset = cursorInfo.endOffset;
            }
            return cursorInfo;
        }
        /**
     * 组内寻址, 入组
     */
        function locateIndex(moveComponent, groupNode, dir) {
            switch (dir) {
              case DIRECTION.LEFT:
                return locateLeftIndex(moveComponent, groupNode);

              case DIRECTION.RIGHT:
                return locateRightIndex(moveComponent, groupNode);
            }
            throw new Error("undefined move direction!");
        }
        /**
     * 组外寻址, 出组
     */
        function locateOuterIndex(moveComponent, groupNode, dir) {
            switch (dir) {
              case DIRECTION.LEFT:
                return locateOuterLeftIndex(moveComponent, groupNode);

              case DIRECTION.RIGHT:
                return locateOuterRightIndex(moveComponent, groupNode);
            }
            throw new Error("undefined move direction!");
        }
        // 左移内部定位
        function locateLeftIndex(moveComponent, groupNode) {
            var syntaxComponent = moveComponent.parentComponent, groupInfo = null, groupElement = null;
            if (isPlaceholderNode(groupNode) || isEmptyNode(groupNode)) {
                return locateOuterLeftIndex(moveComponent, groupNode);
            }
            if (isGroupNode(groupNode)) {
                groupInfo = syntaxComponent.getGroupContent(groupNode.id);
                // 容器内部中末尾的元素
                groupElement = groupInfo.content[groupInfo.content.length - 1];
                // 空检测
                if (isEmptyNode(groupElement)) {
                    // 做跳出处理
                    return locateOuterLeftIndex(moveComponent, groupElement);
                }
                // 待定位的组本身就是一个容器, 则检测其内部结构是否还包含容器
                if (isContainerNode(groupNode)) {
                    // 进入到占位符包裹容器内
                    if (isPlaceholderNode(groupElement)) {
                        return {
                            groupId: groupNode.id,
                            startOffset: groupInfo.content.length - 1,
                            endOffset: groupInfo.content.length
                        };
                    } else if (isContainerNode(groupElement) && groupInfo.content.length >= 1) {
                        return locateLeftIndex(moveComponent, groupElement);
                    }
                    return {
                        groupId: groupNode.id,
                        startOffset: groupInfo.content.length,
                        endOffset: groupInfo.content.length
                    };
                } else {
                    while (!isContainerNode(groupElement) && !isEmptyNode(groupElement) && !isPlaceholderNode(groupElement)) {
                        groupInfo = syntaxComponent.getGroupContent(groupElement.id);
                        groupElement = groupInfo.content[groupInfo.content.length - 1];
                    }
                    if (isEmptyNode(groupElement)) {
                        return locateOuterLeftIndex(moveComponent, groupElement);
                    }
                    if (isPlaceholderNode(groupElement)) {
                        return {
                            groupId: groupElement.id,
                            startOffset: groupInfo.content.length,
                            endOffset: groupInfo.content.length
                        };
                    }
                    return locateLeftIndex(moveComponent, groupElement);
                }
            }
            return null;
        }
        // 左移外部定位
        function locateOuterLeftIndex(moveComponent, groupNode) {
            var kfEditor = moveComponent.kfEditor, outerGroupInfo = null, groupInfo = null;
            // 根容器， 不用再跳出
            if (isRootNode(groupNode)) {
                return null;
            }
            outerGroupInfo = kfEditor.requestService("position.get.parent.info", groupNode);
            while (outerGroupInfo.index === 0) {
                if (isRootNode(outerGroupInfo.group.groupObj)) {
                    return {
                        groupId: outerGroupInfo.group.id,
                        startOffset: 0,
                        endOffset: 0
                    };
                }
                // 如果父组是一个容器， 并且该容器包含不止一个节点， 则跳到父组开头
                if (isContainerNode(outerGroupInfo.group.groupObj) && outerGroupInfo.group.content.length > 1) {
                    if (outerGroupInfo.index !== 0) {
                        return {
                            groupId: outerGroupInfo.group.id,
                            startOffset: 0,
                            endOffset: 0
                        };
                    }
                }
                outerGroupInfo = kfEditor.requestService("position.get.parent.info", outerGroupInfo.group.groupObj);
            }
            // 如果外部组是容器
            if (isContainerNode(outerGroupInfo.group.groupObj)) {
                var target = outerGroupInfo.group.content[outerGroupInfo.index - 1];
                // 如果内部元素不是一个容器，则直接定位即可
                if (!isContainerNode(target)) {
                    return {
                        groupId: outerGroupInfo.group.id,
                        startOffset: outerGroupInfo.index,
                        endOffset: outerGroupInfo.index
                    };
                } else {
                    return locateLeftIndex(moveComponent, target);
                }
            }
            groupNode = outerGroupInfo.group.content[outerGroupInfo.index - 1];
            // 定位到的组是一个容器， 则定位到容器尾部
            if (isGroupNode(groupNode)) {
                // 容器节点
                if (isContainerNode(groupNode)) {
                    // 进入容器内部
                    return locateLeftIndex(moveComponent, groupNode);
                } else {
                    return locateLeftIndex(moveComponent, groupNode);
                }
                return {
                    groupId: groupNode.id,
                    startOffset: groupInfo.content.length,
                    endOffset: groupInfo.content.length
                };
            }
            if (isEmptyNode(groupNode)) {
                return locateOuterLeftIndex(moveComponent, groupNode);
            }
            return {
                groupId: outerGroupInfo.group.id,
                startOffset: outerGroupInfo.index,
                endOffset: outerGroupInfo.index
            };
        }
        // 右移内部定位
        function locateRightIndex(moveComponent, groupNode) {
            var syntaxComponent = moveComponent.parentComponent, groupInfo = null, groupElement = null;
            if (isGroupNode(groupNode)) {
                groupInfo = syntaxComponent.getGroupContent(groupNode.id);
                // 容器内部中末尾的元素
                groupElement = groupInfo.content[0];
                // 待定位的组本身就是一个容器, 则检测其内部结构是否还包含容器
                if (isContainerNode(groupNode)) {
                    // 内部元素仍然是一个容器
                    if (isContainerNode(groupElement)) {
                        // 递归处理
                        return locateRightIndex(moveComponent, groupElement);
                    }
                    if (isPlaceholderNode(groupElement)) {
                        return {
                            groupId: groupNode.id,
                            startOffset: 0,
                            endOffset: 1
                        };
                    }
                    return {
                        groupId: groupNode.id,
                        startOffset: 0,
                        endOffset: 0
                    };
                } else {
                    while (!isContainerNode(groupElement) && !isPlaceholderNode(groupElement) && !isEmptyNode(groupElement)) {
                        groupInfo = syntaxComponent.getGroupContent(groupElement.id);
                        groupElement = groupInfo.content[0];
                    }
                    // 定位到占位符内部
                    if (isPlaceholderNode(groupElement)) {
                        return {
                            groupId: groupElement.id,
                            startOffset: 0,
                            endOffset: 0
                        };
                    } else if (isEmptyNode(groupElement)) {
                        return locateOuterRightIndex(moveComponent, groupElement);
                    } else {
                        return locateRightIndex(moveComponent, groupElement);
                    }
                }
            }
            return null;
        }
        // 右移外部定位
        function locateOuterRightIndex(moveComponent, groupNode) {
            var kfEditor = moveComponent.kfEditor, syntaxComponent = moveComponent.parentComponent, outerGroupInfo = null, groupInfo = null;
            // 根容器， 不用再跳出
            if (isRootNode(groupNode)) {
                return null;
            }
            outerGroupInfo = kfEditor.requestService("position.get.parent.info", groupNode);
            // 仍然需要回溯
            while (outerGroupInfo.index === outerGroupInfo.group.content.length - 1) {
                if (isRootNode(outerGroupInfo.group.groupObj)) {
                    return {
                        groupId: outerGroupInfo.group.id,
                        startOffset: outerGroupInfo.group.content.length,
                        endOffset: outerGroupInfo.group.content.length
                    };
                }
                // 如果父组是一个容器， 并且该容器包含不止一个节点， 则跳到父组末尾
                if (isContainerNode(outerGroupInfo.group.groupObj) && outerGroupInfo.group.content.length > 1) {
                    if (outerGroupInfo.index !== outerGroupInfo.group.content.length - 1) {
                        return {
                            groupId: outerGroupInfo.group.id,
                            startOffset: outerGroupInfo.group.content.length,
                            endOffset: outerGroupInfo.group.content.length
                        };
                    }
                }
                outerGroupInfo = kfEditor.requestService("position.get.parent.info", outerGroupInfo.group.groupObj);
            }
            groupNode = outerGroupInfo.group.content[outerGroupInfo.index + 1];
            // 空节点处理
            if (isEmptyNode(groupNode)) {
                return locateOuterRightIndex(moveComponent, groupNode);
            }
            // 定位到的组是一个容器， 则定位到容器内部开头位置上
            if (isContainerNode(groupNode)) {
                groupInfo = syntaxComponent.getGroupContent(groupNode.id);
                // 检查内容开始元素是否是占位符
                if (syntaxComponent.isPlaceholder(groupInfo.content[0].id)) {
                    return {
                        groupId: groupNode.id,
                        startOffset: 0,
                        endOffset: 1
                    };
                }
                return locateRightIndex(moveComponent, groupNode);
            }
            return {
                groupId: outerGroupInfo.group.id,
                startOffset: outerGroupInfo.index + 1,
                endOffset: outerGroupInfo.index + 1
            };
        }
        function isRootNode(node) {
            return !!node.getAttribute("data-root");
        }
        function isContainerNode(node) {
            return node.getAttribute("data-type") === "kf-editor-group";
        }
        function isGroupNode(node) {
            var dataType = node.getAttribute("data-type");
            return dataType === "kf-editor-group" || dataType === "kf-editor-virtual-group";
        }
        function isPlaceholderNode(node) {
            return node.getAttribute("data-flag") === "Placeholder";
        }
        function isEmptyNode(node) {
            return node.getAttribute("data-flag") === "Empty";
        }
    }
};

/*!
 * 语法控制单元
 */
_p[36] = {
    value: function(require) {
        var kity = _p.r(21), MoveComponent = _p.r(35), DeleteComponent = _p.r(34), CURSOR_CHAR = _p.r(37).cursorCharacter, GROUP_TYPE = _p.r(11), SyntaxComponenet = kity.createClass("SyntaxComponenet", {
            constructor: function(kfEditor) {
                this.kfEditor = kfEditor;
                // 数据记录表
                this.record = {
                    // 光标位置
                    cursor: {
                        group: null,
                        startOffset: -1,
                        endOffset: -1
                    }
                };
                // 子组件结构
                this.components = {};
                // 对象树
                this.objTree = null;
                this.initComponents();
                this.initServices();
                this.initCommands();
            },
            initComponents: function() {
                this.components.move = new MoveComponent(this, this.kfEditor);
                this.components.deleteComp = new DeleteComponent(this, this.kfEditor);
            },
            initServices: function() {
                this.kfEditor.registerService("syntax.update.objtree", this, {
                    updateObjTree: this.updateObjTree
                });
                this.kfEditor.registerService("syntax.get.objtree", this, {
                    getObjectTree: this.getObjectTree
                });
                this.kfEditor.registerService("syntax.get.group.object", this, {
                    getGroupObject: this.getGroupObject
                });
                this.kfEditor.registerService("syntax.is.root.node", this, {
                    isRootNode: this.isRootNode
                });
                this.kfEditor.registerService("syntax.is.group.node", this, {
                    isGroupNode: this.isGroupNode
                });
                this.kfEditor.registerService("syntax.is.virtual.node", this, {
                    isVirtualNode: this.isVirtualNode
                });
                this.kfEditor.registerService("syntax.is.placeholder.node", this, {
                    isPlaceholder: this.isPlaceholder
                });
                this.kfEditor.registerService("syntax.is.select.placeholder", this, {
                    isSelectPlaceholder: this.isSelectPlaceholder
                });
                this.kfEditor.registerService("syntax.has.root.placeholder", this, {
                    hasRootplaceholder: this.hasRootplaceholder
                });
                this.kfEditor.registerService("syntax.valid.brackets", this, {
                    isBrackets: this.isBrackets
                });
                this.kfEditor.registerService("syntax.get.group.content", this, {
                    getGroupContent: this.getGroupContent
                });
                this.kfEditor.registerService("syntax.get.root.group.info", this, {
                    getRootGroupInfo: this.getRootGroupInfo
                });
                this.kfEditor.registerService("syntax.get.root", this, {
                    getRootObject: this.getRootObject
                });
                this.kfEditor.registerService("syntax.update.record.cursor", this, {
                    updateCursor: this.updateCursor
                });
                this.kfEditor.registerService("syntax.update.selection", this, {
                    updateSelection: this.updateSelection
                });
                this.kfEditor.registerService("syntax.get.record.cursor", this, {
                    getCursorRecord: this.getCursorRecord
                });
                this.kfEditor.registerService("syntax.has.cursor.info", this, {
                    hasCursorInfo: this.hasCursorInfo
                });
                this.kfEditor.registerService("syntax.serialization", this, {
                    serialization: this.serialization
                });
                this.kfEditor.registerService("syntax.cursor.move.left", this, {
                    leftMove: this.leftMove
                });
                this.kfEditor.registerService("syntax.cursor.move.right", this, {
                    rightMove: this.rightMove
                });
                this.kfEditor.registerService("syntax.delete.group", this, {
                    deleteGroup: this.deleteGroup
                });
            },
            initCommands: function() {
                this.kfEditor.registerCommand("get.source", this, this.getSource);
                this.kfEditor.registerCommand("content.is.empty", this, this.isEmpty);
            },
            updateObjTree: function(objTree) {
                var selectInfo = objTree.select;
                if (selectInfo && selectInfo.groupId) {
                    this.updateCursor(selectInfo.groupId, selectInfo.startOffset, selectInfo.endOffset);
                }
                this.objTree = objTree;
            },
            hasCursorInfo: function() {
                return this.record.cursor.group !== null;
            },
            // 验证给定ID的组是否是根节点
            isRootNode: function(groupId) {
                return this.objTree.mapping.root.strGroup.attr.id === groupId;
            },
            // 验证给定ID的组是否是组节点
            isGroupNode: function(groupId) {
                var type = this.objTree.mapping[groupId].strGroup.attr["data-type"];
                return type === GROUP_TYPE.GROUP || type === GROUP_TYPE.VIRTUAL;
            },
            isVirtualNode: function(groupId) {
                return this.objTree.mapping[groupId].strGroup.attr["data-type"] === GROUP_TYPE.VIRTUAL;
            },
            // 验证给定ID的组是否是占位符
            isPlaceholder: function(groupId) {
                var currentNode = this.objTree.mapping[groupId];
                if (!currentNode) {
                    return false;
                }
                currentNode = currentNode.objGroup.node;
                return currentNode.getAttribute("data-flag") === "Placeholder";
            },
            isBrackets: function(groupId) {
                return !!this.objTree.mapping[groupId].objGroup.node.getAttribute("data-brackets");
            },
            // 当前是否存在“根占位符”
            hasRootplaceholder: function() {
                return this.objTree.mapping.root.strGroup.operand[0].name === "placeholder";
            },
            // 当前光标选中的是否是占位符
            isSelectPlaceholder: function() {
                var cursorInfo = this.record.cursor, groupInfo = null;
                if (cursorInfo.endOffset - cursorInfo.startOffset !== 1) {
                    return false;
                }
                groupInfo = this.getGroupContent(cursorInfo.groupId);
                if (!this.isPlaceholder(groupInfo.content[cursorInfo.startOffset].id)) {
                    return false;
                }
                return true;
            },
            // 给定的子树是否是一个叶子节点
            isLeafTree: function(tree) {
                return typeof tree === "string";
            },
            // 给定的子树是否是根节点
            isRootTree: function(tree) {
                return tree.attr && tree.attr["data-root"];
            },
            getObjectTree: function() {
                return this.objTree;
            },
            getGroupObject: function(id) {
                return this.objTree.mapping[id].objGroup || null;
            },
            getCursorRecord: function() {
                return kity.Utils.extend({}, this.record.cursor) || null;
            },
            getGroupContent: function(groupId) {
                var groupInfo = this.objTree.mapping[groupId], content = [], operands = groupInfo.objGroup.operands, offset = operands.length - 1, isLtr = groupInfo.strGroup.traversal !== "rtl";
                kity.Utils.each(operands, function(operand, i) {
                    if (isLtr) {
                        content.push(operand.node);
                    } else {
                        content[offset - i] = operand.node;
                    }
                });
                return {
                    id: groupId,
                    traversal: groupInfo.strGroup.traversal || "ltr",
                    groupObj: groupInfo.objGroup.node,
                    content: content
                };
            },
            getRootObject: function() {
                return this.objTree.mapping.root.objGroup;
            },
            getRootGroupInfo: function() {
                var rootGroupId = this.objTree.mapping.root.strGroup.attr.id;
                return this.getGroupContent(rootGroupId);
            },
            updateSelection: function(group) {
                var groupObj = this.objTree.mapping[group.id], curStrGroup = groupObj.strGroup, parentGroup = null, parentGroupObj = null, resultStr = null, startOffset = -1, endOffset = -1;
                parentGroup = group;
                parentGroupObj = groupObj;
                if (curStrGroup.name === "combination") {
                    this.record.cursor = {
                        groupId: parentGroup.id,
                        startOffset: 0,
                        endOffset: curStrGroup.operand.length
                    };
                    // 字符内容处理
                    curStrGroup.operand.unshift(CURSOR_CHAR);
                    curStrGroup.operand.push(CURSOR_CHAR);
                } else {
                    // 函数处理， 找到函数所处的最大范围
                    while (parentGroupObj.strGroup.name !== "combination" || parentGroup.content === 1) {
                        group = parentGroup;
                        groupObj = parentGroupObj;
                        parentGroup = this.kfEditor.requestService("position.get.parent.group", groupObj.objGroup.node);
                        parentGroupObj = this.objTree.mapping[parentGroup.id];
                    }
                    var parentIndex = [].indexOf.call(parentGroup.content, group.groupObj);
                    this.record.cursor = {
                        groupId: parentGroup.id,
                        startOffset: parentIndex,
                        endOffset: parentIndex + 1
                    };
                    // 在当前函数所在的位置作标记
                    parentGroupObj.strGroup.operand.splice(parentIndex + 1, 0, CURSOR_CHAR);
                    parentGroupObj.strGroup.operand.splice(parentIndex, 0, CURSOR_CHAR);
                }
                // 返回结构树进过序列化后所对应的latex表达式， 同时包含有当前光标定位点信息
                resultStr = this.kfEditor.requestService("parser.latex.serialization", this.objTree.parsedTree);
                startOffset = resultStr.indexOf(CURSOR_CHAR);
                resultStr = resultStr.replace(CURSOR_CHAR, "");
                endOffset = resultStr.indexOf(CURSOR_CHAR);
                parentGroupObj.strGroup.operand.splice(this.record.cursor.startOffset, 1);
                parentGroupObj.strGroup.operand.splice(this.record.cursor.endOffset, 1);
                return {
                    str: resultStr,
                    startOffset: startOffset,
                    endOffset: endOffset
                };
            },
            getSource: function() {
                return this.serialization().str.replace(CURSOR_CHAR, "").replace(CURSOR_CHAR, "");
            },
            isEmpty: function() {
                return this.hasRootplaceholder();
            },
            serialization: function() {
                var cursor = this.record.cursor, objGroup = this.objTree.mapping[cursor.groupId], curStrGroup = objGroup.strGroup, resultStr = null, strStartIndex = -1, strEndIndex = -1;
                // 格式化偏移值， 保证在处理操作数时， 标记位置不会出错
                strStartIndex = Math.min(cursor.endOffset, cursor.startOffset);
                strEndIndex = Math.max(cursor.endOffset, cursor.startOffset);
                curStrGroup.operand.splice(strEndIndex, 0, CURSOR_CHAR);
                curStrGroup.operand.splice(strStartIndex, 0, CURSOR_CHAR);
                strEndIndex += 1;
                // 返回结构树进过序列化后所对应的latex表达式， 同时包含有当前光标定位点信息
                resultStr = this.kfEditor.requestService("parser.latex.serialization", this.objTree.parsedTree);
                curStrGroup.operand.splice(strEndIndex, 1);
                curStrGroup.operand.splice(strStartIndex, 1);
                strStartIndex = resultStr.indexOf(CURSOR_CHAR);
                // 选区长度为0, 则只使用一个标记位
                if (cursor.startOffset === cursor.endOffset) {
                    resultStr = resultStr.replace(CURSOR_CHAR, "");
                }
                strEndIndex = resultStr.lastIndexOf(CURSOR_CHAR);
                return {
                    str: resultStr,
                    startOffset: strStartIndex,
                    endOffset: strEndIndex
                };
            },
            // 更新光标记录， 同时更新数据
            updateCursor: function(groupId, startOffset, endOffset) {
                var tmp = null;
                // 支持一个cursorinfo对象
                if (arguments.length === 1) {
                    endOffset = groupId.endOffset;
                    startOffset = groupId.startOffset;
                    groupId = groupId.groupId;
                }
                if (endOffset === undefined) {
                    endOffset = startOffset;
                }
                if (startOffset > endOffset) {
                    tmp = endOffset;
                    endOffset = startOffset;
                    startOffset = tmp;
                }
                this.record.cursor = {
                    groupId: groupId,
                    startOffset: startOffset,
                    endOffset: endOffset
                };
            },
            leftMove: function() {
                this.components.move.leftMove();
            },
            rightMove: function() {
                this.components.move.rightMove();
            },
            // 根据当前光标的信息，删除组
            deleteGroup: function() {
                return this.components.deleteComp.deleteGroup();
            },
            insertSubtree: function(subtree) {
                var cursorInfo = this.record.cursor, // 当前光标信息所在的子树
                startOffset = 0, endOffset = 0, currentTree = null, diff = 0;
                if (this.isPlaceholder(cursorInfo.groupId)) {
                    // 当前在占位符内，所以用子树替换占位符
                    this.replaceTree(subtree);
                } else {
                    startOffset = Math.min(cursorInfo.startOffset, cursorInfo.endOffset);
                    endOffset = Math.max(cursorInfo.startOffset, cursorInfo.endOffset);
                    diff = endOffset - startOffset;
                    currentTree = this.objTree.mapping[cursorInfo.groupId].strGroup;
                    // 插入子树
                    currentTree.operand.splice(startOffset, diff, subtree);
                    // 更新光标记录
                    cursorInfo.startOffset += 1;
                    cursorInfo.endOffset = cursorInfo.startOffset;
                }
            },
            replaceTree: function(subtree) {
                var cursorInfo = this.record.cursor, groupNode = this.objTree.mapping[cursorInfo.groupId].objGroup.node, parentInfo = this.kfEditor.requestService("position.get.parent.info", groupNode), currentTree = this.objTree.mapping[parentInfo.group.id].strGroup;
                // 替换占位符为子树
                currentTree.operand[parentInfo.index] = subtree;
                // 更新光标
                cursorInfo.groupId = parentInfo.group.id;
                cursorInfo.startOffset = parentInfo.index + 1;
                cursorInfo.endOffset = parentInfo.index + 1;
            }
        });
        return SyntaxComponenet;
    }
};

/*!
 * 系统配置文件
 */
_p[37] = {
    value: function() {
        return {
            // 光标符号
            cursorCharacter: "",
            // 根占位符内容与颜色
            rootPlaceholder: {
                color: "#666",
                content: "在此处键入公式",
                fontsize: 16
            },
            scrollbar: {
                padding: 5,
                step: 150
            },
            enableLatex: true
        };
    }
};

/*!
 * 启动模块
 */
_p[38] = {
    value: function(require) {
        var KFEditor = _p.r(12), Factory = _p.r(13);
        // 注册组件
        KFEditor.registerComponents("ui", _p.r(28));
        KFEditor.registerComponents("parser", _p.r(29));
        KFEditor.registerComponents("render", _p.r(33));
        KFEditor.registerComponents("position", _p.r(31));
        KFEditor.registerComponents("syntax", _p.r(36));
        KFEditor.registerComponents("control", _p.r(5));
        KFEditor.registerComponents("print", _p.r(32));
        kf.EditorFactory = Factory;
    }
};

var moduleMapping = {
    "kf.start": 38
};

function use(name) {
    _p.r([ moduleMapping[name] ]);
}
/**
 * 启动代码
 */

( function ( global ) {

    // build环境中才含有use
    try {
        use( 'kf.start' );
    } catch ( e ) {
    }

} )( this );
})();