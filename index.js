"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var promises_1 = require("fs/promises");
var elasticsearch_1 = require("@elastic/elasticsearch");
var datajson = require('./db-json/resources.json');
var tagsDatajson = require('./db-json/tags.json');
var queries = require('./queries');
var metaData = require('./db-json/metadata-pretty.json');
var subjectsData = metaData['subjects'];
var academicLevelsData = metaData['academicLevels'];
var productsData = require('./db-json/products.json');
var subjectsMap = require('./subjectMap.js');
var tagsMap = require('./tagMap.js');
var academicLevelsMap = require('./academicLevelMap.js');
var productsMapTitle = require('./productTitleMap.js');
var productsMapDescription = require('./productDescriptionMap.js');
var productsMap = require('./productMap.js');
var EsAnalyzer = require('./analysis_of_diff_languages/english.js');
var DeAnalyzer = require('./analysis_of_diff_languages/dutch.js');
var JpAnalyzer = require('./analysis_of_diff_languages/japanese.js');
var queryNumber = 0;
// extractIdFromTagsString is used to extract the ids from the unformatted strings found in resources.json
function extractIdFromTagsString(str, name) {
    var arr = [];
    var obj = JSON.parse(str);
    if (obj != null && Object.keys(obj).length > 0) {
        if (name == 'subjects' ||
            name == 'academicLevels' ||
            name == 'productsTitle') {
            arr = JSON.parse(str)['secondary'];
            arr.push(JSON.parse(str)['primary']);
        }
        else if (name == 'tags')
            arr = JSON.parse(str);
    }
    return arr.flat();
}
var siteIdMap = new Map();
siteIdMap.set('a5ac163e-67f5-4464-aad1-faac2d05dbea', 'resources_index_en');
siteIdMap.set('7ce2909c-477b-11e6-b906-1712142eaacb', 'resources_index_de');
siteIdMap.set('6e926cec-477b-11e6-b906-1712142eaacb', 'resources_index_jp');
var getIndexName = function (locale) {
    return "resources_index_" + locale;
};
// making connection with elasticsearch localhost
var client = new elasticsearch_1.Client({
    node: 'http://localhost:9200',
});
/**
 *
 * @param index
 * @param query
 * @param filename
 */
function searchQuery(index, query, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var searchSnip, result, cnt, _i, _a, hit, content;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    searchSnip = query.substr(0, 20);
                    console.log('search...', searchSnip, '...');
                    return [4 /*yield*/, client.search({
                            index: index,
                            size: 5,
                            body: {
                                query: {
                                    multi_match: {
                                        query: query,
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
                        })];
                case 1:
                    result = _b.sent();
                    cnt = "<div class=\"shadow-lg bg-dark text-white\" data-toggle=\"collapse\" data-target=\"#a" + queryNumber + "\" style=\"margin: 0.2%; padding: 1%; border-radius: 10px 10px 10px 10px; background-image: linear-gradient(to right,  #2a5b72, #2c2a3a, #235b74)\" >QUERY : &nbsp   " + query + " <br> </div>\n               <div class=\"collapse\" id=\"a" + queryNumber + "\">";
                    return [4 /*yield*/, promises_1.appendFile(filename, cnt)];
                case 2:
                    _b.sent();
                    _i = 0, _a = result.body.hits.hits;
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    hit = _a[_i];
                    if (hit.highlight.tags == undefined)
                        hit.highlight.tags = hit._source.tags;
                    if (hit.highlight.subjects == undefined)
                        hit.highlight.subjects = hit._source.subjects;
                    if (hit.highlight.academicLevels == undefined)
                        hit.highlight.academicLevels = hit._source.academicLevels;
                    if (hit.highlight.productsTitle == undefined)
                        hit.highlight.productsTitle = hit._source.productsTitle;
                    if (hit.highlight.title == undefined)
                        hit.highlight.title = hit._source.title;
                    content = "\n\n    <div class=\"container-fluid\">\n    <div class=\"card\" style=\"width: 100%\">\n    <div class=\"card-body\">\n    <button type=\"button\" class=\"btn btn-dark\">\n      Score &nbsp;&nbsp;&nbsp; <span class=\"badge badge-light\"> " + hit._score + "</span>\n    </button>\n    <br><br>\n    <h4 class=\"card-title\"><div><b>Title: </b><a href='https://edex.adobe.com/resource/" + hit._source.vanityURL + "'>" + hit.highlight.title + "</a></div></h4>\n    <h5 class=\"card-text\">\n    <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"100%\" background-color: #e0e0e0; \">\n  \n          <div class=\"description\"><span class=\"loda\">Description :</span> " + hit.highlight.description + "</div>\n\n          <div class=\"card card-body\" >\n            <div class=\"tags\"><b>Tags :</b> " + hit.highlight.tags + "</div>\n            <div class=\"Subjects\"><b>Subjects :</b> " + hit.highlight.subjects + "</div>\n            <div class=\"academicLevels\"><b>Academic Level :</b> " + hit.highlight.academicLevels + "</div> \n            <div class=\"products\"><b>Products :</b> " + hit.highlight.productsTitle + " </div> \n          </div>\n\n    </table>\n    </h5>\n\n    </div>\n   </div>\n  </div>\n\n  ";
                    return [4 /*yield*/, promises_1.appendFile(filename, content)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, promises_1.appendFile(filename, "</div> <div></div>")];
                case 7:
                    _b.sent();
                    queryNumber += 1;
                    console.log('search...', searchSnip, '... done');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 *
 * @param similarity
 * @param index
 */
function search(similarity, index, querieslocale) {
    return __awaiter(this, void 0, void 0, function () {
        var filename, _a, topHtml, _i, _b, query;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('querieslocale is : ' + querieslocale);
                    filename = "./results/" + similarity + "--" + index + ".html";
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, promises_1.unlink(filename)];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    topHtml = "<!DOCTYPE html>\n  <html lang=\"en\">\n  <head>\n    \n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\"> \n    <link href=\"https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&display=swap\" rel=\"stylesheet\">\n    \n    <link rel = \"stylesheet\" href = \"https://fonts.googleapis.com/icon?family=Material+Icons\">\n    <link rel = \"stylesheet\" href = \"https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.3/css/materialize.min.css\">\n    <script type = \"text/javascript\"src = \"https://code.jquery.com/jquery-2.1.1.min.js\"></script>           \n    <script src = \"https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.3/js/materialize.min.js\"></script>\n\n    <link rel=\"stylesheet\" href=\"https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css\" integrity=\"sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T\" crossorigin=\"anonymous\">\n    <script src=\"https://code.jquery.com/jquery-3.3.1.slim.min.js\" integrity=\"sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js\" integrity=\"sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1\" crossorigin=\"anonymous\"></script>\n    <script src=\"https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js\" integrity=\"sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM\" crossorigin=\"anonymous\"></script>\n\n    <style>  \n\n    .hl {\n      color: #8a084b;\n    }\n    * {\n      font-family: 'Open Sans', sans-serif;\n    }\n    .loda{\n      font-weight: bold;\n    }\n \n    table\n    {\n      border: 0.7px solid black;\n      border-collapse: collapse;\n    }\n  \n    table {\n      background-color: white;\n      /* border: white; */\n\n    }\n    a {\n      text-decoration: none;\n      color: #7133b0;\n    }\n   \n    \n    </style>\n\n    <title>" + similarity + " results </title>\n  </head>\n  <body>\n   ";
                    return [4 /*yield*/, promises_1.appendFile(filename, topHtml)];
                case 5:
                    _c.sent();
                    _i = 0, _b = queries[querieslocale];
                    _c.label = 6;
                case 6:
                    if (!(_i < _b.length)) return [3 /*break*/, 9];
                    query = _b[_i];
                    return [4 /*yield*/, searchQuery(index, query, filename)];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9: return [2 /*return*/];
            }
        });
    });
}
var mapping = function () {
    return {
        type: 'text',
        analyzer: 'resource_analyzer',
        similarity: 'BM25_Similarity',
    };
};
var mappingES = function (similarity) {
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
function recommend(similarity, SimilarityES, querieslocale) {
    return __awaiter(this, void 0, void 0, function () {
        function convertStringsToActualInfo(name, s, map) {
            var IdsArray = [];
            IdsArray = extractIdFromTagsString(s, name);
            var valuesArray = [];
            if (IdsArray.length != 0) {
                IdsArray.forEach(function (element) {
                    valuesArray.push(map.get(element));
                });
            }
            return valuesArray;
        }
        var index, err_1, error, analysisLanguage, response, err_2, body, bulkResponse, count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = getIndexName(querieslocale);
                    console.log('index is : ' + index);
                    console.log('delete index...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.indices.delete({
                            index: index,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    error = err_1.body;
                    console.error('ERROR: ', JSON.stringify(error));
                    return [3 /*break*/, 4];
                case 4:
                    if (index == 'resources_index_en')
                        analysisLanguage = EsAnalyzer;
                    else if (index == 'resources_index_de')
                        analysisLanguage = DeAnalyzer;
                    else if (index == 'resources_index_jp')
                        analysisLanguage = JpAnalyzer;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    console.log('creating index...');
                    return [4 /*yield*/, client.indices.create({
                            index: index,
                            body: {
                                settings: {
                                    similarity: SimilarityES,
                                    analysis: analysisLanguage,
                                },
                                mappings: {
                                    properties: mappingES(similarity),
                                },
                            },
                        })];
                case 6:
                    response = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    console.log(JSON.stringify(err_2));
                    return [2 /*return*/];
                case 8:
                    body = datajson
                        .filter(function (doc) {
                        return doc.status === 'active';
                    })
                        .flatMap(function (doc) { return [
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
                            subjects: convertStringsToActualInfo('subjects', doc.subjects, subjectsMap),
                            academicLevels: convertStringsToActualInfo('academicLevels', doc.academicLevels, academicLevelsMap),
                            productsTitle: convertStringsToActualInfo('productsTitle', doc.products, productsMapTitle),
                        },
                    ]; });
                    // console.log(body);
                    console.log('bulk...');
                    return [4 /*yield*/, client.bulk({ refresh: true, body: body })];
                case 9:
                    bulkResponse = (_a.sent()).body;
                    if (bulkResponse.errors) {
                        console.log(bulkResponse.errors);
                    }
                    return [4 /*yield*/, client.count({ index: index })];
                case 10:
                    count = (_a.sent()).body;
                    console.log(count);
                    return [4 /*yield*/, search(similarity, index, querieslocale)];
                case 11:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var similarities, queryy, _i, queryy_1, key, _loop_1, _a, similarities_1, obj;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    similarities = [
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
                    queryy = Object.keys(queries);
                    _i = 0, queryy_1 = queryy;
                    _b.label = 1;
                case 1:
                    if (!(_i < queryy_1.length)) return [3 /*break*/, 6];
                    key = queryy_1[_i];
                    _loop_1 = function (obj) {
                        var index;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    console.log("------" + Object.keys(obj)[0] + "-------");
                                    return [4 /*yield*/, recommend(Object.keys(obj)[0], obj, key)];
                                case 1:
                                    _c.sent(); // similarity name, similarity object, query locale
                                    index = getIndexName(key);
                                    client.indices.getMapping({ index: index }, function (err, res) {
                                        if (!err) {
                                            var object = res.body[index].mappings.properties;
                                            var str = JSON.stringify(object, null, 10);
                                            // console.table(object);
                                            var mapES = "  <div class=\"shadow-lg bg-dark text-white\" data-toggle=\"collapse\" data-target=\"#aa\" style=\"margin: 0.2%; padding: 1%; border-radius: 10px 10px 10px 10px;  background-image: linear-gradient(to right, #244757, #282447, #2c5364);\" >\n          " + Object.keys(obj)[0] + "</div>\n          <div class=\"collapse\" id=\"aa\">\n                <pre>" + str + "</pre>\n                </div>\n                </div></body></html>";
                                            promises_1.appendFile("./results/" + Object.keys(obj)[0] + "--" + index + ".html", mapES);
                                        }
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a = 0, similarities_1 = similarities;
                    _b.label = 2;
                case 2:
                    if (!(_a < similarities_1.length)) return [3 /*break*/, 5];
                    obj = similarities_1[_a];
                    return [5 /*yield**/, _loop_1(obj)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _a++;
                    return [3 /*break*/, 2];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    main().catch(console.error);
}
