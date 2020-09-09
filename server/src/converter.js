const unified = require('unified');
const markdown = require('remark-parse');
const math = require('remark-math');
const mathjax = require('rehype-mathjax');
const remark2rehype = require('remark-rehype');
const stringify = require('rehype-stringify');

async function toHtml(markup) {
  return await unified()
    .use(markdown)
    .use(math)
    .use(remark2rehype)
    .use(mathjax)
    .use(stringify)
    .process(markup)
    .then((file) => {
      return file.contents;
    });
}

module.exports = { toHtml };
