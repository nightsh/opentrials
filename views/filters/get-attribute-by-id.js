'use strict';

const _ = require('lodash');

function getAttributeById(items, id, attr) {
  const result = _.find(items, (i) => i.id === id);
  if (result && result[attr]) {
    return result[attr];
  } else {
    return null;
  }
}

module.exports = getAttributeById;
