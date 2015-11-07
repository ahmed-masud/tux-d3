// TUX-D3 wrapper Object

window.TuxD3 = window.TuxD3 || (function() {
    var self = {};

    self.SVGPolymer = function() {
        var domModuleNode = document.currentScript.parentNode;
        if(domModuleNode.nodeName !== 'DOM-MODULE') {
            throw(new Error('SVGPolymer should be called inside <script></script> within <dom-module> definition'));
        }
        self._fixSVGTemplates(domModuleNode);
        var args = arguments[0];
        args.behaviors = args.behaviors || [];
        args.behaviors.push({
            ready: function() { self._fixSVGForeignObjects(this); }
        });
        Polymer(args);
    }

    self._fixSVGTemplates = function(doc) {
        var root = doc.querySelector('dom-module > template');
        /*
         * If someone calls this just from a pure behavior we want to return
         */
        if(!root) { return ; }

        root = root.content;
        var templates = root.querySelectorAll('svg template');
        _fixTemplates(templates);

        function _fixTemplates(_elements) {
            var el, newNode, attribs, attrib, count, child, content;
            for (var i=0; i<_elements.length; i++) {
                el = _elements[i];
                newNode = el.ownerDocument.createElement(_elements[i].nodeName);
                el.parentNode.insertBefore(newNode, el);
                attribs = el.attributes;
                count = attribs.length;
                while (count-- > 0) {
                    attrib = attribs[count];
                    newNode.setAttribute(attrib.name, attrib.value);
                    el.removeAttribute(attrib.name);
                }
                el.parentNode.removeChild(el);
                content = newNode.content;
                while ((child = el.firstChild)) {
                    content.appendChild(child);
                    // el.removeChild(child);
                }
            }
        }


    }

    self._swapNameSpace = function _swapNameSpace(newNamespace, element) {
        var replacement = element.ownerDocument.createElementNS(newNamespace, element.nodeName);
        var temp = element.ownerDocument.createElementNS(newNamespace, 'temp');
        // Polymer.dom(element.parentNode).replaceChild(temp, element);
        Polymer.dom(element.parentNode).replaceChild(replacement, element);
        var attributes = [].slice.call(element.attributes);
        attributes.forEach(function(attr){
            Polymer.dom(element).removeAttribute(attr.name);
            if(attr.name === "is") { return true; }
            Polymer.dom(replacement).setAttribute(attr.name, attr.value);
        });
        for(var child = element.firstChild; child; child = element.firstChild) {
            Polymer.dom(replacement.content).appendChild(child);
        }
        return replacement;
    }

    self._fixSVGForeignObjects = function _fixSVGForeignObjects(root) {
        const SVGNS = 'http://www.w3.org/2000/svg';
        const XHTMLNS = 'http://www.w3.org/1999/xhtml';
        var foreignObjects = [].slice.call(root.querySelectorAll('svg [is="svg-foreign-object"]'));
        foreignObjects.forEach(function(element) {
            var parent = element.parentNode;
            fo = parent.ownerDocument.createElementNS(SVGNS, 'foreignObject');
            Polymer.dom(parent).insertBefore(fo, element);
            fo.appendChild(element);
            replacement = _swapNameSpace(XHTMLNS, element);
            if(!!replacement.id) {
                root.$[replacement.id] = replacement;
            }
        });
    }

    return self;
})();
