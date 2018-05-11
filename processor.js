var rp = require('request-promise');
var async = require("async");
var fs = require("fs");
var JSZip = require("jszip");
var saveAs = require('file-saver').saveAs;

var processor = {};

processor.replaceTwoEqWithThreeEq = function () {

};

processor.addSemiColon = function(req, res){
    var data = {
        componentRoots: "ELR05_X3:ELR05_X3",
        rules: "javascript:Semicolon",
        resolved: false,
        ps: 200
    };
    var options = {
        uri: 'http://192.168.2.27:9000/api/issues/search',
        qs: data,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    rp(options)
        .then(function(parsedBody) {
            console.log("Call succeeded...");
            // res.json({all:parsedBody, componentCount: parsedBody.components.length, issueCount: parsedBody.issues.length});
            async.waterfall([
                function(sortCb) {
                    var sortedArr = parsedBody.components.sort(function(a, b) {
                        return a.id - b.id;
                    });
                    parsedBody.components = sortedArr;
                    sortCb(null, parsedBody);
                },
                function(sortedIssues, componentWiseCb) {
                    var componentArr = sortedIssues.components.filter(function(comp) {
                        return comp.qualifier === "FIL";
                    });

                    var issueLinesArr = [];
                    var compIssueArr = [];

                    for (var i = 0; i < componentArr.length; i++) {
                        issueLinesArr = [];
                        var component = componentArr[i];
                        var componentIssues = sortedIssues.issues.filter(function(issue) {
                            if(issue.componentId === component.id){
                              issueLinesArr.push(issue.line);
                              return true;
                            }
                        });
                        // componentIssues = componentIssues.sort();
                        compIssueArr.push({
                            componentId: component.id,
                            componentKey: component.key,
                            componentPath: component.path,
                            issues: componentIssues,
                            issueLinesArr: issueLinesArr
                        });
                    }

                    // res.json(compIssueArr);

                    componentWiseCb(null, compIssueArr);

                },
                function(compIssueArr, createFileCb) {
                    var processedFiles = [];
                    var tempAr = [compIssueArr[1]];
                    for (var i = 0; i < compIssueArr.length; i++) {
                        console.log(compIssueArr[i].componentKey);
                        console.log(compIssueArr[i].issueLinesArr);
                    }
                    async.each(compIssueArr, function(compIssue, compIssueCb) {
                        var fileData = {
                            resource: compIssue.componentKey
                        };
                        var fileOpts = {
                            uri: 'http://192.168.2.27:9000/api/sources',
                            qs: fileData,
                            headers: {
                                'User-Agent': 'Request-Promise'
                            },
                            json: true
                        };

                        var fileStr = '';

                        rp(fileOpts)
                            .then(function(fileContents) {
                                var multilineFlag = false;
                                var skip = false;
                                var fileContentsJson = fileContents[0];
                                var issueArr = compIssue.issueLinesArr;

                                // for (var i = 0; i < compIssue.issueLinesArr.length; i++) {
                                //   var lineNo = compIssue.issueLinesArr[i];
                                //   var lineStr = fileContentsJson[lineNo.toString()];
                                // }

                                for (var lineKey in fileContentsJson) {
                                    skip = false;
                                    if (fileContentsJson.hasOwnProperty(lineKey)) {
                                        var lineStr = fileContentsJson[lineKey];
                                        if(compIssue.issueLinesArr.indexOf(parseInt(lineKey, 10)) > -1){
                                          lineStr += ';';
                                        }

                                        fileStr += ('\n' + lineStr);
                                    }
                                }

                                fileStr = fileStr.slice(1);

                                processedFiles.push({
                                    file: compIssue.componentKey,
                                    fileStr: fileStr
                                });
                                compIssueCb();
                            })
                            .catch(function(err) {
                                console.log("Call failed...", err);
                                compIssueCb(err);
                            });

                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log('A file failed to process');
                        } else {
                            createFileCb(null, processedFiles);
                        }
                    });
                }
            ], function(err, results) {

              var zip = new JSZip();
                //res.json(results);
                for (var i = 0; i < results.length; i++) {
                    var filePath = results[i].file.split(":")[2];
                    var fileTxt = results[i].fileStr;

                    zip.file(filePath, fileTxt);
                }



                // var img = zip.folder("images");
                // img.file("smile.gif", imgData, {base64: true});
                zip.generateAsync({type:"nodebuffer"})
                .then(function(content) {
                    // see FileSaver.js
                    //saveAs(content, "example.zip");
                     res.set({"Content-Disposition":"attachment; filename=sonar-fixes.zip"});
                     res.send(content);
                });

                // res.json(results);
            });


        })
        .catch(function(err) {
            console.log("Call failed...", err);
            res.end(JSON.stringify(err));
        });
};

processor.replaceArrObjConstr = function(req, res){
    var data = {
        componentRoots: "ELR05_X3:ELR05_X3",
        rules: "javascript:ArrayAndObjectConstructors",
        resolved: false,
        ps: 200
    };
    var options = {
        uri: 'http://192.168.2.27:9000/api/issues/search',
        qs: data,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    rp(options)
        .then(function(parsedBody) {
            console.log("Call succeeded...");
            // res.json({all:parsedBody, componentCount: parsedBody.components.length, issueCount: parsedBody.issues.length});
            async.waterfall([
                function(sortCb) {
                    var sortedArr = parsedBody.components.sort(function(a, b) {
                        return a.id - b.id;
                    });
                    parsedBody.components = sortedArr;
                    sortCb(null, parsedBody);
                },
                function(sortedIssues, componentWiseCb) {
                    var componentArr = sortedIssues.components.filter(function(comp) {
                        return comp.qualifier === "FIL";
                    });

                    var issueLinesArr = [];
                    var compIssueArr = [];

                    for (var i = 0; i < componentArr.length; i++) {
                        issueLinesArr = [];
                        var component = componentArr[i];
                        var componentIssues = sortedIssues.issues.filter(function(issue) {
                            if(issue.componentId === component.id){
                              issueLinesArr.push(issue.line);
                              return true;
                            }
                        });
                        // componentIssues = componentIssues.sort();
                        compIssueArr.push({
                            componentId: component.id,
                            componentKey: component.key,
                            componentPath: component.path,
                            issues: componentIssues,
                            issueLinesArr: issueLinesArr
                        });
                    }

                    // res.json(compIssueArr);

                    componentWiseCb(null, compIssueArr);

                },
                function(compIssueArr, createFileCb) {
                    var processedFiles = [];
                    var tempAr = [compIssueArr[1]];
                    for (var i = 0; i < compIssueArr.length; i++) {
                        console.log(compIssueArr[i].componentKey);
                        console.log(compIssueArr[i].issueLinesArr);
                    }
                    async.each(compIssueArr, function(compIssue, compIssueCb) {
                        var fileData = {
                            resource: compIssue.componentKey
                        };
                        var fileOpts = {
                            uri: 'http://192.168.2.27:9000/api/sources',
                            qs: fileData,
                            headers: {
                                'User-Agent': 'Request-Promise'
                            },
                            json: true
                        };

                        var fileStr = '';

                        rp(fileOpts)
                            .then(function(fileContents) {
                                var multilineFlag = false;
                                var skip = false;
                                var fileContentsJson = fileContents[0];
                                var issueArr = compIssue.issueLinesArr;

                                // for (var i = 0; i < compIssue.issueLinesArr.length; i++) {
                                //   var lineNo = compIssue.issueLinesArr[i];
                                //   var lineStr = fileContentsJson[lineNo.toString()];
                                // }

                                for (var lineKey in fileContentsJson) {
                                    skip = false;
                                    if (fileContentsJson.hasOwnProperty(lineKey)) {
                                        var lineStr = fileContentsJson[lineKey];
                                        if(compIssue.issueLinesArr.indexOf(parseInt(lineKey, 10)) > -1){
                                          var constStrIdx = lineStr.indexOf();
                                          if(/new Array\(\)/g.test(lineStr)){
                                            lineStr = lineStr.replace(/new Array\(\)/g, "[]");
                                          }
                                          if(/new Object\(\)/g.test(lineStr)){
                                            lineStr = lineStr.replace(/new Object\(\)/g, "{}");
                                          }
                                        }

                                        fileStr += ('\n' + lineStr);
                                    }
                                }

                                fileStr = fileStr.slice(1);

                                processedFiles.push({
                                    file: compIssue.componentKey,
                                    fileStr: fileStr
                                });
                                compIssueCb();
                            })
                            .catch(function(err) {
                                console.log("Call failed...", err);
                                compIssueCb(err);
                            });

                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log('A file failed to process');
                        } else {
                            createFileCb(null, processedFiles);
                        }
                    });
                }
            ], function(err, results) {

              var zip = new JSZip();
                //res.json(results);
                for (var i = 0; i < results.length; i++) {
                    var filePath = results[i].file.split(":")[2];
                    var fileTxt = results[i].fileStr;

                    zip.file(filePath, fileTxt);
                }



                // var img = zip.folder("images");
                // img.file("smile.gif", imgData, {base64: true});
                zip.generateAsync({type:"nodebuffer"})
                .then(function(content) {
                    // see FileSaver.js
                    //saveAs(content, "example.zip");
                     res.set({"Content-Disposition":"attachment; filename=sonar-fixes.zip"});
                     res.send(content);
                });

                // res.json(results);
            });


        })
        .catch(function(err) {
            console.log("Call failed...", err);
            res.end(JSON.stringify(err));
        });
};

processor.addVarKeyword = function(req, res){
    var data = {
        componentRoots: "ELR05_X3:ELR05_X3",
        rules: "javascript:S2703",
        resolved: false,
        ps: 100
    };
    var options = {
        uri: 'http://192.168.2.27:9000/api/issues/search',
        qs: data,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    rp(options)
        .then(function(parsedBody) {
            console.log("Call succeeded...");
            // res.json({all:parsedBody, componentCount: parsedBody.components.length, issueCount: parsedBody.issues.length});
            async.waterfall([
                function(sortCb) {
                    var sortedArr = parsedBody.components.sort(function(a, b) {
                        return a.id - b.id;
                    });
                    parsedBody.components = sortedArr;
                    sortCb(null, parsedBody);
                },
                function(sortedIssues, componentWiseCb) {
                    var componentArr = sortedIssues.components.filter(function(comp) {
                        return comp.qualifier === "FIL";
                    });

                    var issueLinesArr = [];
                    var compIssueArr = [];

                    for (var i = 0; i < componentArr.length; i++) {
                        issueLinesArr = [];
                        var lineIssueMap = {};
                        var component = componentArr[i];
                        var componentIssues = sortedIssues.issues.filter(function(issue) {
                            if(issue.componentId === component.id){
                              issueLinesArr.push(issue.line);
                              lineIssueMap[""+issue.line] = issue.message;
                              return true;
                            }
                        });
                        // componentIssues = componentIssues.sort();
                        compIssueArr.push({
                            componentId: component.id,
                            componentKey: component.key,
                            componentPath: component.path,
                            issues: componentIssues,
                            issueLinesArr: issueLinesArr,
                            lineIssueMap: lineIssueMap
                        });
                    }

                    // res.json(compIssueArr);

                    componentWiseCb(null, compIssueArr);

                },
                function(compIssueArr, createFileCb) {
                    var processedFiles = [];
                    var tempAr = [compIssueArr[1]];
                    for (var i = 0; i < compIssueArr.length; i++) {
                        console.log(compIssueArr[i].componentKey);
                        console.log(compIssueArr[i].issueLinesArr);
                    }
                    async.each(compIssueArr, function(compIssue, compIssueCb) {
                        var fileData = {
                            resource: compIssue.componentKey
                        };
                        var fileOpts = {
                            uri: 'http://192.168.2.27:9000/api/sources',
                            qs: fileData,
                            headers: {
                                'User-Agent': 'Request-Promise'
                            },
                            json: true
                        };

                        var fileStr = '';

                        rp(fileOpts)
                            .then(function(fileContents) {
                                var multilineFlag = false;
                                var skip = false;
                                var fileContentsJson = fileContents[0];
                                var issueArr = compIssue.issueLinesArr;

                                // for (var i = 0; i < compIssue.issueLinesArr.length; i++) {
                                //   var lineNo = compIssue.issueLinesArr[i];
                                //   var lineStr = fileContentsJson[lineNo.toString()];
                                // }

                                for (var lineKey in fileContentsJson) {
                                    skip = false;
                                    if (fileContentsJson.hasOwnProperty(lineKey)) {
                                        var lineStr = fileContentsJson[lineKey];
                                        if(compIssue.issueLinesArr.indexOf(parseInt(lineKey, 10)) > -1){
                                          var issueMsg = compIssue.lineIssueMap[lineKey];
                                          var splitArr = issueMsg.split('\"');
                                          var wordToSearch = splitArr[splitArr.length - 2];//second last word
                                          // if(/new Array\(\)/g.test(lineStr)){
                                            lineStr = lineStr.replace(wordToSearch, "var "+wordToSearch);
                                          // }
                                          // if(/new Object\(\)/g.test(lineStr)){
                                            // lineStr = lineStr.replace(/new Object\(\)/g, "{}");
                                          // }
                                        }

                                        fileStr += ('\n' + lineStr);
                                    }
                                }

                                fileStr = fileStr.slice(1);

                                processedFiles.push({
                                    file: compIssue.componentKey,
                                    fileStr: fileStr
                                });
                                compIssueCb();
                            })
                            .catch(function(err) {
                                console.log("Call failed...", err);
                                compIssueCb(err);
                            });

                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log('A file failed to process');
                        } else {
                            createFileCb(null, processedFiles);
                        }
                    });
                }
            ], function(err, results) {

              var zip = new JSZip();
                //res.json(results);
                for (var i = 0; i < results.length; i++) {
                    var filePath = results[i].file.split(":")[2];
                    var fileTxt = results[i].fileStr;

                    zip.file(filePath, fileTxt);
                }



                // var img = zip.folder("images");
                // img.file("smile.gif", imgData, {base64: true});
                zip.generateAsync({type:"nodebuffer"})
                .then(function(content) {
                    // see FileSaver.js
                    //saveAs(content, "example.zip");
                     res.set({"Content-Disposition":"attachment; filename=sonar-fixes.zip"});
                     res.send(content);
                });

                // res.json(results);
            });


        })
        .catch(function(err) {
            console.log("Call failed...", err);
            res.end(JSON.stringify(err));
        });
};

processor.removeCommentedCode = function(req, res) {
    var data = {
        componentRoots: "ELR05_X3:ELR05_X3",
        rules: "javascript:CommentedCode",
        resolved: false
    };
    var options = {
        uri: 'http://192.168.2.27:9000/api/issues/search',
        qs: data,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };
    rp(options)
        .then(function(parsedBody) {
            console.log("Call succeeded...");
            // res.json({all:parsedBody, componentCount: parsedBody.components.length, issueCount: parsedBody.issues.length});
            async.waterfall([
                function(sortCb) {
                    var sortedArr = parsedBody.components.sort(function(a, b) {
                        return a.id - b.id;
                    });
                    parsedBody.components = sortedArr;
                    sortCb(null, parsedBody);
                },
                function(sortedIssues, componentWiseCb) {
                    var componentArr = sortedIssues.components.filter(function(comp) {
                        return comp.qualifier === "FIL";
                    });

                    var issueLinesArr = [];
                    var compIssueArr = [];

                    for (var i = 0; i < componentArr.length; i++) {
                        issueLinesArr = [];
                        var component = componentArr[i];
                        var componentIssues = sortedIssues.issues.filter(function(issue) {
                            issueLinesArr.push(issue.line);
                            return issue.componentId === component.id;
                        });
                        // componentIssues = componentIssues.sort();
                        compIssueArr.push({
                            componentId: component.id,
                            componentKey: component.key,
                            componentPath: component.path,
                            issues: componentIssues,
                            issueLinesArr: issueLinesArr
                        });
                    }

                    componentWiseCb(null, compIssueArr);

                },
                function(compIssueArr, createFileCb) {
                    var processedFiles = [];
                    var tempAr = [compIssueArr[1]];
                    for (var i = 0; i < compIssueArr.length; i++) {
                        console.log(compIssueArr[i].componentKey);
                        console.log(compIssueArr[i].issueLinesArr);
                    }
                    async.each(compIssueArr, function(compIssue, compIssueCb) {
                        var fileData = {
                            resource: compIssue.componentKey
                        };
                        var fileOpts = {
                            uri: 'http://192.168.2.27:9000/api/sources',
                            qs: fileData,
                            headers: {
                                'User-Agent': 'Request-Promise'
                            },
                            json: true
                        };

                        var fileStr = '';

                        rp(fileOpts)
                            .then(function(fileContents) {
                                var multilineFlag = false;
                                var skip = false;
                                var fileContentsJson = fileContents[0];
                                for (var lineKey in fileContentsJson) {
                                    skip = false;
                                    if (fileContentsJson.hasOwnProperty(lineKey)) {
                                        var lineStr = fileContentsJson[lineKey];
                                        if(compIssue.issueLinesArr.indexOf(parseInt(lineKey, 10)) > -1){
                                          if (/\/\//g.test(lineStr)) {
                                              var idx = lineStr.indexOf("//");
                                              if (idx > -1) {
                                                  if (idx === 0) {
                                                      skip = true;
                                                  } else {
                                                      lineStr = lineStr.replace(lineStr.substr(idx), '');
                                                      skip = false;
                                                  }
                                              }
                                          } else if (/\/\*/g.test(lineStr) || multilineFlag) {
                                              multilineFlag = true;
                                              var idx = lineStr.indexOf("/*");
                                              if (idx === 0) {
                                                  skip = true;
                                              } else {
                                                  lineStr = lineStr.replace(lineStr.substr(idx), '');
                                                  skip = false;
                                              }

                                              if (lineStr.indexOf("*/")) {
                                                  multilineFlag = false;
                                              }
                                          }
                                        }

                                        if (skip) {
                                            continue;
                                        } else {
                                            fileStr += ('\n' + lineStr);
                                        }
                                    }
                                }

                                fileStr = fileStr.slice(1);

                                processedFiles.push({
                                    file: compIssue.componentKey,
                                    fileStr: fileStr
                                });
                                compIssueCb();
                            })
                            .catch(function(err) {
                                console.log("Call failed...", err);
                                compIssueCb(err);
                            });

                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log('A file failed to process');
                        } else {
                            createFileCb(null, processedFiles);
                        }
                    });
                }
            ], function(err, results) {

              var zip = new JSZip();
                //res.json(results);
                for (var i = 0; i < results.length; i++) {
                    var filePath = results[i].file.split(":")[2];
                    var fileTxt = results[i].fileStr;

                    zip.file(filePath, fileTxt);
                }



                // var img = zip.folder("images");
                // img.file("smile.gif", imgData, {base64: true});
                zip.generateAsync({type:"nodebuffer"})
                .then(function(content) {
                    // see FileSaver.js
                    //saveAs(content, "example.zip");
                     res.set({"Content-Disposition":"attachment; filename=sonar-fixes.zip"});
                     res.send(content);
                });

                // res.json(results);
            });


        })
        .catch(function(err) {
            console.log("Call failed...", err);
            res.end(JSON.stringify(err));
        });
};

module.exports = processor;
