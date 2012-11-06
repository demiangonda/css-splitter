/**
 * CSS Splitter
 * This nodejs scripts receives a css filename as first argument, and creates for each mediaquery present in that file a new one.
 * @author Gerardo Bort<gerardobort@gmail.com> | github.com/gerardobort
 * @date 20121130
 */

String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };

// you can override this methos as you want
var getOutputFilename = function (inputFilename, mediaquery) {
    return inputFilename.replace(/\.css$/, '') + '--' + 
           mediaquery
            .replace(/[\s:]+/g, '-') // replace whitespaces or colons by dashes
            .replace(/\([^\)]+\)/g, function (arg) {
                return arg.replace(/\((.*?)\)/, '$1').replace(/-/g, '');
            }) // group parenthesis blocks removing their internal dashes
            + '.css';
};

var fs = require('fs'),
    inputFilename = process.argv[2],
    encoding = 'utf8',
    outputFilesContent = {};
    outputFilesQueries = {};

if (process.argv.length !== 3) {
    return console.log('usage: $ node ' + process.argv[1] + ' your-css-filename.css');
}

fs.readFile(inputFilename, encoding, function (err, block) {
    if (err) {
        return console.log(err);
    }

    // split input file in @media blocks
    var mediaqueryBlocks = block
        .replace(/[\n\t]/g, '') // remove breaklines and tabs
        .replace(/ +/g, ' ') // remove extra whitespaces
        .replace(/; +/g, ';') // remove whitespaces after semicolons
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
        .match(/(@media .*?{[^@]*}}|[^@]+)/g) // match media queries

    // process blocks
    mediaqueryBlocks.forEach(function (block, index) {
        var mediaqueryBlock = block.match(/@media ([^{]*) ?{(.*)}/),
            query, rules, filename, content;
        if (null === mediaqueryBlock) {
            query = 'all';
            rules = block.trim();
        } else {
            query = mediaqueryBlock[1].trim();
            rules = mediaqueryBlock[2].trim();

            query = query
                .replace(/\) +and +\(/g, ') and (') // normalize queries
                .replace(/: +/g, ':');
        }
        filename = getOutputFilename(inputFilename, query); // per mediaquery new output filename
        if (!outputFilesContent[filename]) {
            content = '/* ' + inputFilename + ' | ' + query + ' */\n\n' + rules; // attach comments to each new output file
            outputFilesContent[filename] = content;
            outputFilesQueries[filename] = query;
        } else {
            content = content;
            outputFilesContent[filename] += content; // same mediaquery blocks merging
        }
    });

    // write per mediaquery file
    for (filename in outputFilesContent) {
        var content = outputFilesContent[filename];
        fs.writeFile(filename, content, encoding, function (err, data) {
            if (err) {
                console.log('error writting file.', err);
            }
        });
        console.log(filename + ' written.')
    }

    // write import file
    var importCssFilename = inputFilename.replace(/\.css$/, '') + '--import.css',
        importCssContent = '/* ' + inputFilename + ' */\n\n';
    for (filename in outputFilesQueries) {
        var query = outputFilesQueries[filename];
        importCssContent += '@media '+ query + ' { '
            + '@import url("' + filename + '");'
            + ' }\n';
    }
    fs.writeFile(importCssFilename, importCssContent, encoding, function (err, data) {
        if (err) {
            console.log('error writting file.', err);
        }
    });
    console.log(importCssFilename + ' written.')

});
