#!/usr/bin/env node
const yargs = require('yargs');

const argv = yargs
    .option('input', {
        alias: 'i',
        description: 'Input video file or folder',
        demandOption: true,
        normalize: true,
        requiresArg: true,
    })
    .option('output', {
        alias: 'o',
        description: 'Output video file or folder',
        demandOption: true,
        normalize: true,
        requiresArg: true,
    })
    .option('scale', {
        alias: 's',
        description: "upscale ratio",
        choices: [1, 2],
        requiresArg: true,
        type: "number",
        default: 2
    })
    .option('noise', {
        alias: 'n',
        description: "upscale ratio",
        choices: [-1, 0, 1, 2, 3],
        requiresArg: true,
        type: "number",
        default: 2
    })
    .option('model', {
        alias: 'm',
        description: "waifu2x model",
        requiresArg: true,
        default: 'models-cunet'
    })
    .option('tile-size', {
        alias: 't',
        description: "waifu2x tile size",
        requiresArg: true,
        type: "number",
        default: 400
    })
    .option('gpu', {
        alias: 'g',
        description: "gpu to use",
        requiresArg: true,
        type: "number",
        default: 0
    })
    .option('threads', {
        alias: 'j',
        description: "processing threads to use in waifu2x",
        requiresArg: true,
        type: "number",
        default: 2
    })
    .group([], 'Options:') //forces the default "Options:" group to be on top
    .help(true, "Show this help message")
    .alias('help', 'h')
    .version()
    .alias('version', 'v')
    .group(['help', 'version'], "Other")
    .detectLocale(false)
    .wrap(Math.min(80, yargs.terminalWidth()))
    .argv;

console.log(argv);