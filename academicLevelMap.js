const metaData = require('./db-json/metadata-pretty.json');
const academicLevelsData = metaData['academicLevels'];


// mapping ids and labels of acadmicLevels from the file metadata-pretty.json
const academicLevelsMap = new Map();

var label;
for(const acadLevel of academicLevelsData){
  label = acadLevel.i18nLabel;
  label = label.substr(label.lastIndexOf('.') + 1);
  academicLevelsMap.set(acadLevel.id, label);
}


module.exports = academicLevelsMap;

