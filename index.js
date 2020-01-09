const htmlparser = require('htmlparser2');
const fs = require('fs');


function html2Dom(html) {
  const handler = new htmlparser.DomHandler();
  const parser = new htmlparser.Parser(handler);
  parser.write(html);
  parser.end();
  return handler.dom;
}
const html = fs.readFileSync('./sample.html');

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

const getElement = node => {
  if (!node) {
    return;
  }
  if (node.type == 'tag') {
    return new Proxy(node, {
      get: function(target, key) {
        return Reflect.get(target, key);
      },
      set: function(target, key, value) {
        return Reflect.set(target, key, value);
      }
    });
  }
};

async function main() {
  const dom = await html2Dom(html);
  const document = getElement(rootElement(dom));
}
main();
