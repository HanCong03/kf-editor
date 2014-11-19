/**
 * 新UI
 */

define( function ( require ) {

    var kity = require( "kity"),

        Utils = require( "base/utils" ),

        config = require( "newui/config" ),

        FUI = require( "fui" ),

        VIEW_STATE = require( "newui/def" ).VIEW_STATE,

        Scrollbar = require( "newui/ui-impl/scrollbar/scrollbar" ),

        UIComponent = kity.createClass( 'UIComponent', {

            constructor: function ( kfEditor, options ) {

                var currentDocument = null;

                this.options = options;
                this.lastHeight = -1;
                this.minHeight -1;
                this.notifyCallback = null;

                this.container = kfEditor.getContainer();

                currentDocument = this.container.ownerDocument;

                // ui组件实例集合
                this.components = {};

                this.canvasRect = null;
                this.viewState = VIEW_STATE.NO_OVERFLOW;
                this.latexInput = null;

                this.kfEditor = kfEditor;

                this.toolbarWidget = FUI.Creator.parse( config );

                this.editArea = new FUI.Panel( {
                    className: 'kf-editor-ui-editor-area'
                } );

                this.canvasContainer = new FUI.Panel( {
                    className: 'kf-editor-ui-canvas'
                } );

                this.scrollbarContainer = new FUI.Panel( {
                    className: 'kf-editor-edit-scrollbar'
                } );

                this.latexArea = new FUI.Panel( {
                    className: 'kf-editor-ui-latex-area'
                } );

                this.latexInput = creatLatexInput( currentDocument );

                this.latexArea.getContentElement().appendChild( this.latexInput );

                this.scrollbarContainer = createScrollbarContainer( currentDocument );

                this.toolbarWidget.appendTo( this.container );
                this.canvasContainer.appendTo( this.editArea );
                this.latexArea.appendTo( this.editArea );
                this.editArea.appendTo( this.container );

                this.container.appendChild( this.scrollbarContainer );

                this.canvasContainer = this.canvasContainer.getContentElement();
                this.editArea = this.editArea.getContentElement();

                this.initComponents();

                this.initServices();
                this.initCommands();

                this.initEvent();

                this.updateContainerSize( this.container, this.toolbarWidget.getContentElement(), this.editArea );

                this.initScrollEvent();

            },

            // 组件实例化
            initComponents: function () {

                this.components.scrollbar = new Scrollbar( this, this.kfEditor );

            },

            updateContainerSize: function ( container, toolbar, editArea ) {

                var containerBox = container.getBoundingClientRect(),
                    toolbarBox = toolbar.getBoundingClientRect(),
                    height = containerBox.bottom - toolbarBox.bottom;

                editArea.style.width = containerBox.width + "px";
                editArea.style.height = height + "px";

                this.lastHeight = height;
                this.minHeight = this.lastHeight;
                this.canvasContainer.style.height = this.lastHeight + 'px';

            },

            updateCanvasSize: function () {

                var rootShape = this.kfEditor.requestService( 'syntax.get.root' ),
                    height = -1,
                    shapeHeight = -1;

                shapeHeight = rootShape.getRenderBox( "paper" ).height;

                if ( shapeHeight < this.lastHeight ) {

                    height = this.minHeight;

                    if ( shapeHeight < this.lastHeight ) {

                        height = this.lastHeight - Math.max( shapeHeight, this.minHeight );
                        height = Math.floor( height / 100 );

                        if ( height === 0 ) {
                            return;
                        }

                        this.updateHeight( -height * 100 );
                    }

                } else {

                    this.updateHeight( Math.ceil( ( shapeHeight - this.lastHeight ) / 100 ) * 100 );

                }

            },

            updateHeight: function ( diff ) {

                this.lastHeight += diff;
                this.canvasContainer.style.height = this.lastHeight + 'px';
                this.editArea.style.height = this.lastHeight + 'px';
                this.container.style.height = $( this.container ).height() + diff + 'px';

                this.notifyContainer( diff );

            },

            notifyContainer: function ( changeValue ) {

                if ( !this.notifyCallback ) {
                    return;
                }

                this.notifyCallback( changeValue );

            },

            setNotify: function ( cb ) {
                this.notifyCallback = cb;
            },

            // 初始化服务
            initServices: function () {

                this.kfEditor.registerService( "ui.get.canvas.container", this, {
                    getCanvasContainer: this.getCanvasContainer
                } );

                this.kfEditor.registerService( "ui.get.latex.input", this, {
                    getLatexInput: this.getLatexInput
                } );

                this.kfEditor.registerService( "ui.update.canvas.view", this, {
                    updateCanvasView: this.updateCanvasView
                } );

                this.kfEditor.registerService( "ui.canvas.container.event", this, {
                    on: this.addEvent,
                    off: this.removeEvent,
                    trigger: this.trigger,
                    fire: this.trigger
                } );

                this.kfEditor.registerService( 'ui.update.canvas.size', this, {
                    updateCanvasSize: this.updateCanvasSize
                } );

                this.kfEditor.registerService( "ui.toolbar.disable", this, {
                    disableToolbar: this.disableToolbar
                } );

                this.kfEditor.registerService( "ui.toolbar.enable", this, {
                    enableToolbar: this.enableToolbar
                } );

                this.kfEditor.registerService( "ui.toolbar.close", this, {
                    closeToolbar: this.closeToolbar
                } );

            },

            initCommands: function () {
                this.kfEditor.registerCommand( "resize.notify", this, this.setNotify );
            },

            initEvent: function () {

                var editor = this.kfEditor;

                Utils.addEvent( this.container, 'mousewheel', function ( e ) {
                    e.preventDefault();
                } );

                this.toolbarWidget.on( "btnclick", function ( e ) {

                    var val = e.widget.getValue();

                    if ( val ) {
                        editor.requestService( "control.insert.string", val );
                    }

                } );

            },

            initScrollEvent: function () {

                var _self = this;

                this.kfEditor.requestService( "ui.set.scrollbar.update.handler", function ( proportion, offset, values ) {

                    offset = Math.floor( proportion * ( values.contentWidth - values.viewWidth ) );
                    _self.kfEditor.requestService( "render.set.canvas.offset", offset );

                } );

            },

            getCanvasContainer: function () {

                return this.canvasContainer;

            },

            addEvent: function ( type, handler ) {

                Utils.addEvent( this.canvasContainer, type, handler );

            },

            removeEvent: function () {},

            trigger: function ( type ) {

                Utils.trigger( this.canvasContainer, type );

            },

            getLatexInput: function () {
                return this.latexInput;
            },

            // 更新画布视窗， 决定是否出现滚动条
            updateCanvasView: function () {

                var canvas = this.kfEditor.requestService( "render.get.canvas" ),
                    contentContainer = canvas.getContentContainer(),
                    contentRect = null;

                if ( this.canvasRect === null ) {
                    // 兼容firfox， 获取容器大小，而不是获取画布大小
                    this.canvasRect = this.canvasContainer.getBoundingClientRect();
                }

                contentRect = contentContainer.getRenderBox( "paper" );

                if ( contentRect.width > this.canvasRect.width ) {

                    if ( this.viewState === VIEW_STATE.NO_OVERFLOW  ) {
                        this.toggleViewState();
                        this.kfEditor.requestService( "ui.show.scrollbar" );
                        this.kfEditor.requestService( "render.disable.relocation" );
                    }

                    this.kfEditor.requestService( "render.relocation" );

                    // 更新滚动条， 参数是：滚动条所控制的内容长度
                    this.kfEditor.requestService( "ui.update.scrollbar", contentRect.width );
                    this.kfEditor.requestService( "ui.relocation.scrollbar" );

                } else {

                    if ( this.viewState === VIEW_STATE.OVERFLOW  ) {
                        this.toggleViewState();
                        this.kfEditor.requestService( "ui.hide.scrollbar" );
                        this.kfEditor.requestService( "render.enable.relocation" );
                    }

                    this.kfEditor.requestService( "render.relocation" );

                }

                this.updateCanvasSize();

            },

            toggleViewState: function () {

                this.viewState = this.viewState === VIEW_STATE.NO_OVERFLOW ? VIEW_STATE.OVERFLOW : VIEW_STATE.NO_OVERFLOW;

            },

            disableToolbar: function () {
                //this.toolbarWidget.disable();
            },

            enableToolbar: function () {
                //this.toolbarWidget.enable();
            },

            closeToolbar: function () {}

        } );

    function createScrollbarContainer ( doc ) {
        var container = doc.createElement( "div" );
        container.className = "kf-editor-edit-scrollbar";
        return container;
    }

    function creatLatexInput ( doc ) {
        var container = doc.createElement( "textarea" );
        container.className = "kf-editor-latex-input";

        return container;
    }

    return UIComponent;

} );