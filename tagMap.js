const tagsDatajson = require('./db-json/tags.json');

// this tagsMap has mapping of id and title of tags.json
const tagsMap = new Map();
for (const tag of tagsDatajson) {
  tagsMap.set(tag.id, tag.title);
}

module.exports = tagsMap;

// Example testing :   console.log(tagsMap.get('02a465e4-7973-419f-b5d1-f8f4298999a1'));
