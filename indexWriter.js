const os = require('os');
const path = require('path');
const fs = require('fs');
const fileExclusions = [
    '.js',
    '.less',
    '.md',
    '.sh',
    '.png',
    '.jpg',
    '.json',
    '.xml',
    'webpack.config.js',
    'jest.config.js',
    '.yarnignore',
    'NOTICE',
    'LICENSE',
    '.d.ts',
    '.DS_Store',
    'Tests.ts',
];
const directoryExclusions = [
    'node_modules',
    'typings',
    'dist',
    'tests',
];
// don't write index export entries for items in this, but still go into the directories and write index files
const directoryExportExclusions = [
    '_test-common_',
];

const logger = (message) => {
    console.log(`IndexWriter: ${message}`);
};

const fileSorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

const tryRecursivelyWriteIndexFiles = function (directory) {
    if (directoryExclusions.includes(path.basename(directory))) {
        return;
    }
    let files = fs.readdirSync(directory).sort(fileSorter);
    let directoryExports = '';
    let sideEffectImport = '';
    let fileExports = '';
    let newLine = os.platform() === 'win32' ? '\r\n' : '\n';
    files.forEach(function (file) {
        let directory1 = directory + '/' + file;
        if (fs.statSync(directory1).isDirectory()) {
            if (tryRecursivelyWriteIndexFiles(directory1)) {
                let excludeExport = directoryExportExclusions.some(ex => ex === file);
                if (!excludeExport) {
                    if (file.includes('.global')) {
                        sideEffectImport += `import './${file}'; // directory${newLine}`;
                    } else {
                        directoryExports += `export * from './${file}';${newLine}`;
                    }
                }
            }
        } else {
            const baseName = path.basename(file);
            let excludeFile = baseName === 'index.ts' || fileExclusions.some(exclusion => {
                return baseName.toLowerCase().endsWith(exclusion.toLowerCase());
            });
            if (!excludeFile) {
                if (file.includes('.global')) {
                    sideEffectImport += `import './${path.parse(file).name}';${newLine}`;
                } else {
                    fileExports += `export * from './${path.parse(file).name}';${newLine}`;
                }
            }
        }
    });
    let finalOutput = ``;
    if (directoryExports) {
        finalOutput += directoryExports;
    }
    if (sideEffectImport) {
        finalOutput += sideEffectImport;
    }
    if (fileExports) {
        finalOutput += fileExports;
    }

    if (finalOutput === '') {
        finalOutput = 'export { };';
    }

    let blurb = `// Auto-generated ${newLine}`;
    let indexFile = `${directory}/index.ts`;
    finalOutput = `${blurb}${finalOutput}`;
    fs.writeFileSync(indexFile, finalOutput);
    return true;
};

const writeAllIndexFiles = (packagesDirectory) => {
    let directories = fs.readdirSync(packagesDirectory).sort(fileSorter);

    const tryRecursivelyWriteIndexFilesForSubDir = (package, directory, subDirectory) => {
        let path = `${package}/${directory}/${subDirectory}`;
        if (!fs.existsSync(path)) {
            return;
        }
        if (!fs.statSync(path).isDirectory()) {
            return;
        }
        logger(`Writing all index files under directory ${path}`);
        tryRecursivelyWriteIndexFiles(path, true);
    }

    directories.forEach(function (directory) {
        let fullDirectoryPath = `${packagesDirectory}/${directory}`;
        if (!fs.statSync(fullDirectoryPath).isDirectory()) {
            return;
        }
        if (directoryExclusions.includes(path.basename(directory))) {
            return;
        }

        tryRecursivelyWriteIndexFilesForSubDir(packagesDirectory, directory, 'src');
        tryRecursivelyWriteIndexFilesForSubDir(packagesDirectory, directory, 'tests');
    });
};

writeAllIndexFiles(path.join(__dirname, 'packages'));
