const productsData = require('./db-json/products.json');

const productsMap = new Map(); // { id : [title, description] }

for (const prod of productsData) {
  productsMap.set(prod.id, [prod.title, prod.description]);
}

module.exports = productsMap;
