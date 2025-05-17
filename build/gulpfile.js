const spawn = require('child_process').spawn;
const gulp = require('gulp');
const path = require('path');

const dryRun = false;

const remoteIP = "45.33.112.108";

const rsyncRegex = /\/([^/]+)\/src\/$/m;
/**
 * Get the "src" path and the rsync conf name
 * The rsync conf name is the project directory name
 */
const srcPath = path.normalize(process.cwd().toLowerCase() + '/../src').replace('g:', '/mnt/g').replace(/\\/g, '/') + '/';
/** @type {Array} */
const match = rsyncRegex.exec(srcPath);

if (match == null) {
    console.log("Can't find project name in " + srcPath);
    process.exit();
}

const dstPath = '/webs/' + match[1] + '/';

const rsyncCmds = [
    "-azv",
    "--delete",
    "--omit-dir-times",
    "--no-perms",
    "--exclude-from=excludes.txt",
    "--chmod=Du+rwx,Dgo+rx,Fu=rw,Fgo=r"
];

gulp.task("rsync", (cb) => {
    if (dryRun) {
        rsyncCmds.unshift("--dry-run");
    }

    rsyncCmds.unshift("rsync");
    rsyncCmds.unshift("-e");

    console.log(rsyncCmds.join(" "));

    const cmdProcess = spawn("wsl", rsyncCmds);

    cmdProcess.stdout.on("data", (data) => {
        const msg = data.toString().replace(/^([^\r\n]*)[\r\n]*$/mg, "$1");
        console.log(msg);
    });
    cmdProcess.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
    });

    cmdProcess.on("exit", () => {
        cb();
    });
});


gulp.task('setDownload', function (cb) {
    rsyncCmds.push('larissa@' + remoteIP + ':' + dstPath);
    rsyncCmds.push(srcPath);
    cb();
});

gulp.task('setUpload', function (cb) {
    rsyncCmds.push(srcPath);
    rsyncCmds.push('larissa@' + remoteIP + ':' + dstPath);
    cb();
});

gulp.task("download", gulp.series('setDownload', 'rsync'));

gulp.task("upload", gulp.series('setUpload', 'rsync'));

