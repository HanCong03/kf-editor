/**
 * Created by hn on 14-3-17.
 */

define(function (require) {

    var MAX_BIG_HISTORY = 3;
    var MAX_SMALL_HISTORY = 20;

    var kity = require("kity"),

    // UiUitls
        $$ = require("ui/ui-impl/ui-utils"),

        Utils = require("base/utils"),

        VIEW_STATE = require("ui/def").VIEW_STATE,

        Scrollbar = require("ui/ui-impl/scrollbar/scrollbar"),

        Toolbar = require("ui/toolbar/toolbar"),
    // 控制组件
        ScrollZoom = require("ui/control/zoom"),

        ELEMENT_LIST = require("ui/toolbar-ele-list"),

        UIComponent = kity.createClass('UIComponent', {

            bigNodes: [],
            smallNodes: [],

            disabled: false,
            historyInited: false,

            constructor: function (kfEditor, options) {
                this.options = options;

                this.container = kfEditor.getContainer();

                var currentDocument = this.container.ownerDocument;

                // ui组件实例集合
                this.components = {};

                this.canvasRect = null;
                this.viewState = VIEW_STATE.NO_OVERFLOW;

                this.kfEditor = kfEditor;

                this.toolbarWrap = createToolbarWrap(currentDocument);
                this.toolbarContainer = createToolbarContainer(currentDocument);
                this.editArea = createEditArea(currentDocument);
                this.historyArea = createHistoryArea(currentDocument);
                this.canvasContainer = createCanvasContainer(currentDocument);
                this.scrollbarContainer = createScrollbarContainer(currentDocument);

                this.toolbarWrap.appendChild(this.toolbarContainer);
                this.container.appendChild(this.toolbarWrap);
                this.editArea.appendChild(this.canvasContainer);
                this.container.appendChild(this.editArea);
                this.container.appendChild(this.scrollbarContainer);

                this.initComponents();

                this.initServices();

                this.initEvent();

                this.updateContainerSize(this.container, this.toolbarWrap, this.editArea, this.canvasContainer);

                this.toolbarWrap.appendChild(this.historyArea);

                this.bigHistory = $(".kf-big-history", this.historyArea);
                this.smallHistory = $(".kf-small-history", this.historyArea);

                this.initScrollEvent();

            },

            // 组件实例化
            initComponents: function () {

                // 工具栏组件
                this.components.toolbar = new Toolbar(this, this.kfEditor, ELEMENT_LIST);

                // TODO 禁用缩放, 留待后面再重新开启
                if (false) {
//                if ( this.options.zoom ) {
                    this.components.scrollZoom = new ScrollZoom(this, this.kfEditor, this.canvasContainer, {
                        max: this.options.maxzoom,
                        min: this.options.minzoom
                    });
                }
                this.components.scrollbar = new Scrollbar(this, this.kfEditor);

            },

            addBigHistory: function (node) {
                this.checkHistoryInit();

                var index = this.bigNodes.indexOf(node);
                var childs = this.bigHistory.children();

                if (index !== -1) {
                    this.bigNodes.splice(index, 1);
                    this.bigNodes.unshift(node);

                    node = childs[index];

                    node.remove();
                    $(this.bigHistory).prepend(node);
                    return;
                }

                this.bigNodes.unshift(node);

                if (childs.length >= MAX_BIG_HISTORY) {
                    childs[childs.length - 1].remove();
                    this.bigNodes.pop();
                }

                $(this.bigHistory).prepend(node.outerHTML);
            },

            addSmallHistory: function (node) {
                this.checkHistoryInit();

                var val = node.getAttribute('data-value');
                var index = this.smallNodes.indexOf(val);
                var childs = this.smallHistory.children();

                if (index !== -1) {
                    this.smallNodes.splice(index, 1);
                    this.smallNodes.unshift(val);

                    node = childs[index];

                    node.remove();
                    this.smallHistory.prepend(node);
                    return;
                }

                this.smallNodes.unshift(val);

                if (childs.length >= MAX_SMALL_HISTORY) {
                    childs[childs.length - 1].remove();
                    this.smallNodes.pop();
                }

                $(this.smallHistory).prepend(node.outerHTML);
            },

            checkHistoryInit: function () {
                if (this.historyInited) {
                    return;
                }

                this.historyInited = true;
                this.historyArea.style.height = '100px';

                this.updateContainerSize(this.container, this.toolbarWrap, this.editArea, this.canvasContainer);
                this.kfEditor.requestService('render.resize');
            },

            addSmallCopyHistory: function (node) {
                var index = +node.getAttribute('index');
                this.addSmallHistory($(".kf-editor-ui-area-item")[index]);
            },

            updateContainerSize: function (container, toolbar, editArea) {

                var containerBox = container.getBoundingClientRect(),
                    toolbarBox = toolbar.getBoundingClientRect();

                editArea.style.width = containerBox.width + "px";
                editArea.style.height = containerBox.bottom - toolbarBox.bottom + "px";
            },

            disableHistory: function () {
                $(this.historyArea).addClass('b-disabled');
                this.disabled = true;
            },

            enableHistory: function () {
                $(this.historyArea).removeClass('b-disabled');
                this.disabled = false;
            },

            // 初始化服务
            initServices: function () {

                this.kfEditor.registerService("ui.get.canvas.container", this, {
                    getCanvasContainer: this.getCanvasContainer
                });

                this.kfEditor.registerService("ui.add.big.history", this, {
                    addBigHistory: this.addBigHistory
                });

                this.kfEditor.registerService("ui.add.small.history", this, {
                    addSmallHistory: this.addSmallHistory
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

            },

            initEvent: function () {
                var _self = this;

                $$.subscribe("small.icon.click", function (node) {
                    _self.addSmallHistory(node);
                });

                $$.subscribe("big.icon.click", function (node) {
                    _self.addBigHistory(node);
                });

                $$.subscribe("small.icon.copy.click", function (node) {
                    _self.addSmallCopyHistory(node);
                });

                $$.subscribe("disable.history", function () {
                    _self.disableHistory();
                });

                $$.subscribe("enable.history", function () {
                    _self.enableHistory();
                });

                $(this.historyArea).delegate(".kf-editor-ui-box-item, .kf-editor-ui-area-item", "mousedown", function (e) {
                    e.preventDefault();

                    if (_self.disabled) {
                        return;
                    }

                    $$.publish("data.select", this.getAttribute("data-value"));
                });

            },

            initScrollEvent: function () {

                var _self = this;

                this.kfEditor.requestService("ui.set.scrollbar.update.handler", function (proportion, offset, values) {

                    offset = Math.floor(proportion * ( values.contentWidth - values.viewWidth ));
                    _self.kfEditor.requestService("render.set.canvas.offset", offset);

                });

            },

            getCanvasContainer: function () {

                return this.canvasContainer;

            },

            addEvent: function (type, handler) {

                Utils.addEvent(this.canvasContainer, type, handler);

            },

            removeEvent: function () {
            },

            trigger: function (type) {

                Utils.trigger(this.canvasContainer, type);

            },

            // 更新画布视窗， 决定是否出现滚动条
            updateCanvasView: function () {

                var canvas = this.kfEditor.requestService("render.get.canvas"),
                    contentContainer = canvas.getContentContainer(),
                    contentRect = null;

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

            },

            toggleViewState: function () {

                this.viewState = this.viewState === VIEW_STATE.NO_OVERFLOW ? VIEW_STATE.OVERFLOW : VIEW_STATE.NO_OVERFLOW;

            }

        });

    function createToolbarWrap(doc) {

        return $$.ele(doc, "div", {
            className: "kf-editor-toolbar"
        });

    }

    function createToolbarContainer(doc) {

        return $$.ele(doc, "div", {
            className: "kf-editor-inner-toolbar"
        });

    }

    function createHistoryArea(doc) {
        var node = $$.ele(doc, "div", {
            className: "kf-editor-history"
        });

        node.innerHTML = '<div class="kf-big-history"></div><div class="kf-small-history"></div>';

        return node;
    }


    function createEditArea(doc) {
        var container = doc.createElement("div");
        container.className = "kf-editor-edit-area";
        container.style.width = "80%";
        container.style.height = "800px";
        return container;
    }

    function createCanvasContainer(doc) {
        var container = doc.createElement("div");
        container.className = "kf-editor-canvas-container";
        return container;
    }

    function createScrollbarContainer(doc) {
        var container = doc.createElement("div");
        container.className = "kf-editor-edit-scrollbar";
        return container;
    }

    return UIComponent;

});