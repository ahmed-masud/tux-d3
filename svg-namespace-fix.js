window._svgFix = (window.Polymer.prototype._svgFix || function(parent) {
    var doc = document.currentScript.parentNode;
    var root = doc.querySelector('dom-module > template').content;
    var templates = root.querySelectorAll('svg template');
    _fixElements(templates);
    // _fixElements(elements);
    function _fixElements(_elements) {
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
});

window._swapNameSpace = function(newNamespace, element) {
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

window.fixSVGForeignObjects = function(shadowParent) {
    const SVGNS = 'http://www.w3.org/2000/svg';
    const XHTMLNS = 'http://www.w3.org/1999/xhtml';
    var foreignObjects = [].slice.call(shadowParent.querySelectorAll('svg [is="svg-foreign-object"]'));
    foreignObjects.forEach(function(element) {
        var parent = element.parentNode;
        fo = parent.ownerDocument.createElementNS(SVGNS, 'foreignObject');
        Polymer.dom(parent).insertBefore(fo, element);
        fo.appendChild(element);
        replacement = _swapNameSpace(XHTMLNS, element);
        if(!!replacement.id) {
            shadowParent.$[replacement.id] = replacement;
        }
    });
}

window.fixSVGBind = function(svgSelector) {
    const SVGNS = 'http://www.w3.org/2000/svg';
    function _fixNodeName(name) {
        switch(name) {
            case 'TEXT': return name.toLowerCase();
        }
        return name;
    }
    var svg = document.querySelector(svgSelector);
    if(!svg) {
        throw new Error("Bad SVG selector " + svgSelector);
    }

    var elements = [].slice.call(svg.querySelectorAll('[is="dom-bind"]'));
    elements.forEach(function(element, index) {
        var replacement = element.ownerDocument.createElement(_fixNodeName(element.nodeName));
        element.parentNode.insertBefore(replacement, element);
        var attributes = [].slice.call(element.attributes);
        attributes.forEach(function(attr){
            element.removeAttribute(attr.name);
            if(attr.name === "is") { return true; }
            replacement.setAttribute(attr.name, attr.value);
        });
        element.parentNode.removeChild(element);
        for(var child = element.firstChild; child; child = element.firstChild) {
            replacement.content.appendChild(child);
        }
        var svgLightElements = [].slice.call(replacement.querySelectorAll('[is="svg-dom"]'));
        svgLightElements.forEach(function(element) {
            console.log('node-name: ', element.nodeName);
            var replacement = element.ownerDocument.createElementNS(SVGNS, _fixNodeName(element.nodeName));
            element.parentNode.appendsChild(replacement, element);
            var attributes = [].slice.call(element.attributes);
            attributes.forEach(function(attr) {
                element.removeAttribute(attr.name);
                if(attr.name === "is") { return true; }
                replacement.setAttributeNS(null, attr.name, attr.value);
            });
            element.parentNode.removeChild(element);
            for(var child = element.firstChild; child; child = element.firstChild) {
                replacement.appendChild(child);

            }
        });
    });
}
