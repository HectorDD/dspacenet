'use strict';

const hbs = require('hbs');

const blocks = {};

hbs.registerHelper('extend', function (name, context) {
  let block = blocks[name];
  if (!block) block = blocks[name] = [];
  block.push(context.fn(this));
});

hbs.registerHelper('block', (name, context) => {
  const block = (blocks[name] || []).join('\n');
  blocks[name] = [];
  return block;
})