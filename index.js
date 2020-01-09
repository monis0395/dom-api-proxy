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


async function main() {
  const dom = await html2Dom(html);
}
main();
