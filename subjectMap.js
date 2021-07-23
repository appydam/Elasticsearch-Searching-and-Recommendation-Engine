/* eslint-disable no-plusplus */
const metaData = require('./db-json/metadata-pretty.json');

const subjectsData = metaData['subjects'];

// mapping ids and labels of subjects from the file metadata-pretty.json

const subjectsMap = new Map();

var label;
for(const streams of subjectsData){
  label = streams.i18nLabel;
  label = label.substr(label.lastIndexOf('.') + 1);
  subjectsMap.set(streams.id, label);

  for(const subjects of streams.children){
    label = subjects.i18nLabel;
    label = label.substr(label.lastIndexOf('.') + 1);
    subjectsMap.set(subjects.id, label);
  }
}



module.exports = subjectsMap;
