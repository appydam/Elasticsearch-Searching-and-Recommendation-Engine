import { appendFile, unlink } from 'fs/promises';
import { Client } from '@elastic/elasticsearch';
const datajson = require('./db-json/resources.json');
const tagsDatajson = require('./db-json/tags.json');
const queries = require('./queries');
const metaData = require('./db-json/metadata-pretty.json');
const subjectsData = metaData['subjects'];
const academicLevelsData = metaData['academicLevels'];
const productsData = require('./db-json/products.json');
const subjectsMap = require('./subjectMap.js');
const tagsMap = require('./tagMap.js');
const academicLevelsMap = require('./academicLevelMap.js');
const productsMapTitle = require('./productTitleMap.js');
const productsMapDescription = require('./productDescriptionMap.js');
const productsMap = require('./productMap.js');
const EsAnalyzer = require('./analysis_of_diff_languages/english.js');
const DeAnalyzer = require('./analysis_of_diff_languages/dutch.js');
const JpAnalyzer = require('./analysis_of_diff_languages/japanese.js');
var queryNumber = 0;
// extractIdFromTagsString is used to extract the ids from the unformatted strings found in resources.json

function extractIdFromTagsString(str: string, name: string) {
  var arr = [];
  var obj = JSON.parse(str);

  if (obj != null && Object.keys(obj).length > 0) {
    if (
      name == 'subjects' ||
      name == 'academicLevels' ||
      name == 'productsTitle'
    ) {
      arr = JSON.parse(str)['secondary'];
      arr.push(JSON.parse(str)['primary']);
    } else if (name == 'tags') arr = JSON.parse(str);
  }

  return arr.flat();
}

let siteIdMap = new Map();
siteIdMap.set('a5ac163e-67f5-4464-aad1-faac2d05dbea', 'resources_index_en');
siteIdMap.set('7ce2909c-477b-11e6-b906-1712142eaacb', 'resources_index_de');
siteIdMap.set('6e926cec-477b-11e6-b906-1712142eaacb', 'resources_index_jp');

var getIndexName = function (locale: string) {
  return `resources_index_${locale}`;
};

// making connection with elasticsearch localhost
const client = new Client({
  node: 'http://localhost:9200',
});
/**
 *
 * @param index
 * @param query
 * @param filename
 */

async function searchQuery(index: string, query: string, filename: string) {
  const searchSnip = query.substr(0, 20);
  console.log('search...', searchSnip, '...');

  const result = await client.search({
    index,
    size: 5,
    body: {
      query: {
        multi_match: {
          query,
          fields: [
            'title^1.5',
            'description^2',
            'tags',
            'subjects',
            'academicLevels',
            'productsTitle',
          ],
          fuzziness: 'AUTO',
        },
      },
      highlight: {
        pre_tags: ['<span class="hl">'],
        post_tags: ['</span>'],
        number_of_fragments: 1,
        fragment_size: 10000,
        fields: {
          description: {},
          title: {},
          tags: {},
          academicLevels: {},
          subjects: {},
          productsTitle: {},
        },
      },
    },
  });

  // TODO : bail if errors.

  const cnt = `<div class="shadow-lg bg-dark text-white" data-toggle="collapse" data-target="#a${queryNumber}" style="margin: 0.2%; padding: 1%; border-radius: 10px 10px 10px 10px; background-image: linear-gradient(to right,  #2a5b72, #2c2a3a, #235b74)" >QUERY : &nbsp   ${query} <br> </div>
               <div class="collapse" id="a${queryNumber}">`;
  await appendFile(filename, cnt);

  //console.log(result.body.hits.hits);

  for (const hit of result.body.hits.hits) {
    if (hit.highlight.tags == undefined) hit.highlight.tags = hit._source.tags;
    if (hit.highlight.subjects == undefined)
      hit.highlight.subjects = hit._source.subjects;
    if (hit.highlight.academicLevels == undefined)
      hit.highlight.academicLevels = hit._source.academicLevels;
    if (hit.highlight.productsTitle == undefined)
      hit.highlight.productsTitle = hit._source.productsTitle;
    if (hit.highlight.title == undefined)
      hit.highlight.title = hit._source.title;

    const content = `

    <div class="container-fluid">
    <div class="card" style="width: 100%">
    <div class="card-body">
    <button type="button" class="btn btn-dark">
      Score &nbsp;&nbsp;&nbsp; <span class="badge badge-light"> ${hit._score}</span>
    </button>
    <br><br>
    <h4 class="card-title"><div><b>Title: </b><a href='https://edex.adobe.com/resource/${hit._source.vanityURL}'>${hit.highlight.title}</a></div></h4>
    <h5 class="card-text">
    <table border="0" cellspacing="0" cellpadding="0" width="100%" background-color: #e0e0e0; ">
  
          <div class="description"><span class="loda">Description :</span> ${hit.highlight.description}</div>

          <div class="card card-body" >
            <div class="tags"><b>Tags :</b> ${hit.highlight.tags}</div>
            <div class="Subjects"><b>Subjects :</b> ${hit.highlight.subjects}</div>
            <div class="academicLevels"><b>Academic Level :</b> ${hit.highlight.academicLevels}</div> 
            <div class="products"><b>Products :</b> ${hit.highlight.productsTitle} </div> 
          </div>

    </table>
    </h5>

    </div>
   </div>
  </div>

  `;

    await appendFile(filename, content);
  }

  await appendFile(filename, `</div> <div></div>`);
  queryNumber += 1;

  console.log('search...', searchSnip, '... done');
}
/**
 *
 * @param similarity
 * @param index
 */

async function search(
  similarity: string,
  index: string,
  querieslocale: string
) {
  console.log('querieslocale is : ' + querieslocale);

  const filename = `./results/${similarity}--${index}.html`;
  try {
    await unlink(filename);
  } catch {}

  const topHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
    
    <link rel="preconnect" href="https://fonts.gstatic.com"> 
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&display=swap" rel="stylesheet">
    
    <link rel = "stylesheet" href = "https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel = "stylesheet" href = "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.3/css/materialize.min.css">
    <script type = "text/javascript"src = "https://code.jquery.com/jquery-2.1.1.min.js"></script>           
    <script src = "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.3/js/materialize.min.js"></script>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

    <style>  

    .hl {
      color: #8a084b;
    }
    * {
      font-family: 'Open Sans', sans-serif;
    }
    .loda{
      font-weight: bold;
    }
 
    table
    {
      border: 0.7px solid black;
      border-collapse: collapse;
    }
  
    table {
      background-color: white;
      /* border: white; */

    }
    a {
      text-decoration: none;
      color: #7133b0;
    }
   
    
    </style>

    <title>${similarity} results </title>
  </head>
  <body>
   `;

  await appendFile(filename, topHtml);

  for (let query of queries[querieslocale]) {
    await searchQuery(index, query, filename);
  }
}

const mapping = function () {
  return {
    type: 'text',
    analyzer: 'resource_analyzer',
    similarity: 'BM25_Similarity',
  };
};

const mappingES = function (similarity: string) {
  return {
    title: mapping(),
    shortDescription: mapping(),
    description: mapping(),
    tags: mapping(),
    subjects: mapping(),
    productsTitle: mapping(),
    academicLevels: mapping(),
    vanityURL: mapping(),
  };
};

/**
 * Recommendations for a given similarity.
 * @param similarity
 * @param index
 */

async function recommend(
  similarity: string,
  SimilarityES: object,
  querieslocale: string
) {
  let index = getIndexName(querieslocale); // naming index on the basis of locale

  console.log('index is : ' + index);

  console.log('delete index...');
  try {
    await client.indices.delete({
      index,
    });
  } catch (err) {
    const { body: error } = err;
    console.error('ERROR: ', JSON.stringify(error));
  }

  let analysisLanguage;
  if (index == 'resources_index_en') analysisLanguage = EsAnalyzer;
  else if (index == 'resources_index_de') analysisLanguage = DeAnalyzer;
  else if (index == 'resources_index_jp') analysisLanguage = JpAnalyzer;

  try {
    console.log('creating index...');
    const response = await client.indices.create({
      index,
      body: {
        settings: {
          similarity: SimilarityES,

          analysis: analysisLanguage,
        },

        mappings: {
          properties: mappingES(similarity),
        },
      },
    });
  } catch (err) {
    console.log(JSON.stringify(err));
    return;
  }

  interface Resource {
    id: string;
    title: string;
    shortDescription: string;
    description: string;
    tags: string;
    vanityURL: string;
    products: string;
    subjects: string;
    academicLevels: string;
    status: string;
    siteID: String;
  }

  function convertStringsToActualInfo(
    name: string,
    s: string,
    map: Map<any, any>
  ) {
    var IdsArray = [];
    IdsArray = extractIdFromTagsString(s, name);

    var valuesArray: any[] = [];

    if (IdsArray.length != 0) {
      IdsArray.forEach((element: any) => {
        valuesArray.push(map.get(element));
      });
    }

    return valuesArray;
  }

  //   Given index to every document, means we just mapped {index} with every document
  const body = datajson
    .filter(function (doc: { status: string }) {
      return doc.status === 'active';
    })

    .flatMap((doc: Resource) => [
      {
        index: {
          _index: siteIdMap.get(doc.siteID),
          _id: doc.id,
        },
      },
      {
        siteID: doc.siteID,
        title: doc.title,
        shortDescription: doc.shortDescription,
        description: doc.description,
        tags: convertStringsToActualInfo('tags', doc.tags, tagsMap),
        vanityURL: doc.vanityURL,

        subjects: convertStringsToActualInfo(
          'subjects',
          doc.subjects,
          subjectsMap
        ),
        academicLevels: convertStringsToActualInfo(
          'academicLevels',
          doc.academicLevels,
          academicLevelsMap
        ),
        productsTitle: convertStringsToActualInfo(
          'productsTitle',
          doc.products,
          productsMapTitle
        ),
      },
    ]);

  // console.log(body);

  console.log('bulk...');
  // await call to bulk API of elasticsearch. Its an async await calling
  const { body: bulkResponse } = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    console.log(bulkResponse.errors);
  }

  const { body: count } = await client.count({ index });
  console.log(count);

  await search(similarity, index, querieslocale);
}

async function main() {
  // main code
  const similarities = [
    {
      BM25_Similarity: {
        type: 'BM25',
        b: 1,
        k1: 1.5,
      },
    },
    // {
    //   DFR_Similarity: {
    //     type: 'DFR',
    //     basic_model: 'g',
    //     after_effect: 'b',
    //     normalization: 'h2',
    //     'normalization.h2.c': '5',
    //   },
    // },
    // {
    //   LMDirichlet_similarity: {
    //     type: 'LMDirichlet',
    //     mu: 500,
    //   },
    // },
    // {
    //   LMJelinekMercer_Similarity: {
    //     type: 'LMJelinekMercer',
    //     lambda: 0.5,
    //   },
    // },
    // {
    //   DFI_similarity: {
    //     type: 'DFI',
    //     independence_measure: 'chisquared',
    //   },
    // },
    // {
    //   IB_similarity: {
    //     type: 'IB',
    //     distribution: 'll',
    //     lambda: 'df',
    //     normalization: 'h2',
    //     'normalization.h2.c': '5',
    //   },
    // },
  ];

  const queryy = Object.keys(queries);
  for (const key of queryy) {
    for (let obj of similarities) {
      console.log(`------${Object.keys(obj)[0]}-------`);

      await recommend(Object.keys(obj)[0], obj, key); // similarity name, similarity object, query locale
      let index = getIndexName(key);
      client.indices.getMapping({ index }, (err, res) => {
        if (!err) {
          var object = res.body[index].mappings.properties;
          var str = JSON.stringify(object, null, 10);
          // console.table(object);
          const mapES = `  <div class="shadow-lg bg-dark text-white" data-toggle="collapse" data-target="#aa" style="margin: 0.2%; padding: 1%; border-radius: 10px 10px 10px 10px;  background-image: linear-gradient(to right, #244757, #282447, #2c5364);" >
          ${Object.keys(obj)[0]}</div>
          <div class="collapse" id="aa">
                <pre>${str}</pre>
                </div>
                </div></body></html>`;
          appendFile(`./results/${Object.keys(obj)[0]}--${index}.html`, mapES);
        }
      });
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}
