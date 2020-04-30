const htmlparser = require('htmlparser2');
const CSSSelect = require('css-select');
const {
  getText,
  getInnerHTML,
  getOuterHTML
} = require('domutils/lib/stringify');

function html2Dom(html) {
  const handler = new htmlparser.DomHandler();
  const parser = new htmlparser.Parser(handler);
  parser.write(html);
  parser.end();
  return handler.dom;
}

const rootElement = dom => {
  if (Array.isArray(dom)) {
    return {
      name: 'root',
      type: 'tag',
      children: dom
    };
  }
  return dom;
};

const NamedAttributes = {
  a: new Set(['href']),
  form: new Set(['name', 'action', 'method', 'onsubmit']),
  input: new Set(['name', 'type', 'value', 'checked', 'disabled', 'onsubmit'])
};

const getElement = node => {
  if (!node) {
    return;
  }
  if (node.type == 'tag') {
    return new Proxy(node, {
      get: function(target, key) {
        if (
          NamedAttributes[target.name] &&
          NamedAttributes[target.name].has(key)
        ) {
          return target.attribs[key];
        } else if (Selectors[key]) {
          return getSelector(Selectors[key](node));
        } else if (key === 'innerText') {
          return getText(target);
        } else if (key === 'innerHTML') {
          return getInnerHTML(target);
        } else if (key === 'outerHTML') {
          return getOuterHTML(target);
        } else {
          return Reflect.get(target, key);
        }
      },
      set: function(target, key, value) {
        return Reflect.set(target, key, value);
      }
    });
  }
};

const getSelector = fn => selector => {
  const node = fn(selector);
  return node; 
};

const Selectors = {
  querySelector: dom => selector =>
    getElement(CSSSelect.selectOne(selector, dom)),
  querySelectorAll: dom => selector =>
    CSSSelect.selectAll(selector, dom).map(getElement),
  getElementById: dom => selector =>
    getElement(CSSSelect.selectOne(`#${selector}`, dom)),
  getElementsByClassName: dom => selector =>
    CSSSelect.selectAll(`.${selector}`, dom).map(getElement),
  getElementsByTagName: dom => selector =>
    CSSSelect.selectAll(selector, dom).map(getElement),
  getElementsByName: dom => selector =>
    CSSSelect.selectAll(`[name=${selector}]`, dom).map(getElement)
};

function parse(html) {
  const dom = html2Dom(html);
  const document = getElement(rootElement(dom));
  return document;
}

exports.parse = parse;
exports.html2Dom = html2Dom;
exports.getElement = getElement;
exports.rootElement = rootElement;
exports.Selectors = Selectors;
