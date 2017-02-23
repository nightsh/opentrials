'use strict';

const opentrialsApi = require('../config').opentrialsApi;

function getDocumentCategory(categoryId) {
  return opentrialsApi
    .then((client) => client.document_categories.getDocumentCategory({ id: categoryId }))
    .then((response) => response.obj);
}

function listDocumentCategories() {
  return opentrialsApi
    .then((client) => client.document_categories.listDocumentCategories())
    .then((response) => response.obj);
}

module.exports = {
  get: getDocumentCategory,
  list: listDocumentCategories,
};
