#!/usr/bin/env node
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const commandExists = require('command-exists').sync;
const child_process = require('child_process');

const argv = yargs
    .option('input', {
        alias: 'i',
        description: 'Input video file or folder',
        demandOption: true,
        // normalize: true,
        requiresArg: true,
    })
    .option('output', {
        alias: 'o',
        description: 'Output video file or folder',
        demandOption: true,
        // normalize: true,
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
    .option('verbose', {
        alias: 'v',
        description: 'verbose output',
        type: "boolean",
    })
    .group([], 'Options:') //forces the default "Options:" group to be on top
    .help(true, "Show this help message")
    .alias('help', 'h')
    .version()
    .group(['help', 'version', 'verbose'], "Other")
    .detectLocale(false)
    .wrap(Math.min(100, yargs.terminalWidth()))
    .check((argv) => {
        let files = [];
        let out_files = [];
        if(typeof argv.i != "string") {
            for (let i = 0; i < argv.i.length; i++) {
                const element = argv.i[i];
                if(!fs.existsSync(element)) throw `File ${element} does not exist`;
                if(fs.statSync(element).isDirectory()) throw `You can only specify files while using multipple -i options`
                files.push(path.resolve(element));
            }
        } else {
            if(!fs.existsSync(argv.i)) throw `File ${argv.i} does not exist`;
            if(fs.statSync(argv.i).isFile()) {
                files.push(path.resolve(argv.i));
            } else {
                let in_dir_files = fs.readdirSync(argv.i);
                in_dir_files.forEach(element=> {
                    let file = path.resolve(path.join(argv.i, element));
                    if(fs.statSync(file).isFile()) {
                        files.push(file);
                    }
                });
            }
        }
        if(files.length == 0) throw `No files found in specified input directory`;
        if(typeof argv.o != "string") throw `Multiple outputs are not supported`;
        if(!fs.existsSync(argv.o) || fs.statSync(argv.o).isFile()) { //FIXME: bug: same in and out directory
            if(files.length > 1) throw `Use a single directory as output when using mutiple input files`;
            else out_files.push(path.resolve(argv.o));
        } else {
            let out_dir = path.resolve(argv.o);
            files.forEach(file => {
                out_files.push(path.resolve(path.join(out_dir, path.basename(file)))); //FIXME: bug: multiple input files wit the same name
            });
        }
        if(files.length != out_files.length) throw `Internal error "files.length != out_files.length" please submit a issue on github`
        argv.i = files;
        argv.o = out_files;
        return true;
    })
    .argv;

var verbose = !!argv.v;

if(verbose) process.stderr.write(`Detected ${argv.i.length} input files\n`);

process.env['PATH'] += path.delimiter + path.resolve(path.join(__dirname, "deps", "ffmpeg", "bin"));
process.env['PATH'] += path.delimiter + path.resolve(path.join(__dirname, "deps", "waifu2x-ncnn-vulkan"));

var ffmpeg_executable = "ffmpeg";
var waifu2x_executable = "waifu2x-ncnn-vulkan";

if(!commandExists("ffmpeg")) {
    if(commandExists("ffmpeg.exe")) {
        ffmpeg_executable = "ffmpeg.exe"; //for WSL compatibility ;)
    } else {
        console.error("could not find ffmpeg");
        process.exit(-1);
    }
}
if(!commandExists("waifu2x-ncnn-vulkan")) {
    if(commandExists("waifu2x-ncnn-vulkan.exe")) {
        waifu2x_executable = "waifu2x-ncnn-vulkan.exe"; //for WSL compatibility ;)
    } else {
        console.error("could not find waifu2x-ncnn-vulkan");
        process.exit(-1);
    }
}
if(verbose) process.stderr.write(`Using "${ffmpeg_executable}" as ffmpeg executable and "${waifu2x_executable}" as waifu2x executable\n`);