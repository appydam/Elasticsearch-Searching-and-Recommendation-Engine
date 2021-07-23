const productsData = require('./db-json/products.json');


const productsMapDescription = new Map();     // { id : description }
for(const prod of productsData){
  productsMapDescription.set(prod.id, prod.description);
}


module.exports = productsMapDescription;
