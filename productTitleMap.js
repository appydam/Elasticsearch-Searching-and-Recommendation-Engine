const productsData = require('./db-json/products.json');

const productsMapTitle = new Map(); // { id : title }

for(const prod of productsData){
  productsMapTitle.set(prod.id, prod.title);
}


module.exports = productsMapTitle;


