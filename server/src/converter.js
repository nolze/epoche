const unified = require('unified');
const markdown = require('remark-parse');
const math = require('remark-math');
const mathjax = require('rehype-mathjax');
const remark2rehype = require('remark-rehype');
const stringify = require('rehype-stringify');
const urls = require('rehype-urls');
const slug = require('rehype-slug');

const path = require('path');

// TODO: Put in one place
const BASEPATH = process.env.BASEPATH || '/';

function isWikiLink(path) {
  const r = new RegExp('^(?:[a-z]+:)?/', 'i');
  return !r.test(path);
}

function toWikiLink(url, node) {
  if (isWikiLink(url.href)) {
    return path.join(BASEPATH, url.href);
  } else {
    node.properties.target = '_blank';
  }
}

async function toHtml(markup) {
  return await unified()
    .use(markdown)
    .use(math)
    .use(remark2rehype)
    .use(slug)
    .use(urls, toWikiLink)
    .use(mathjax)
    .use(stringify)
    .process(markup)
    .then((file) => {
      return file.contents;
    });
}

module.exports = { toHtml };
