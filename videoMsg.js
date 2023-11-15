"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidationEnd = exports.filterTypeArr = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs = require('fs');
const path = require('path');
const allFiles = fs.readdirSync(__dirname);
function filterAllFiles(foldPath) {
    return fs.readdirSync(foldPath);
}
const isFold = (fileOrFoldName) => fs.lstatSync(fileOrFoldName).isDirectory();
const filterTypeArr = (arr = allFiles, typeStr) => {
    let newArr = [];
    for (let i in arr) {
        if ((0, exports.isValidationEnd)(arr[i], typeStr)) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
};
exports.filterTypeArr = filterTypeArr;
function isValueNaN(value) {
    return Number.isNaN(value);
}
const isValidationEnd = (str, appoint) => {
    str = str.toLowerCase();
    let tempArr = str.split('.');
    let endStr = tempArr[tempArr.length - 1];
    if (appoint === endStr) {
        return true;
    }
    return false;
};
exports.isValidationEnd = isValidationEnd;
const filterOnlyFoldArr = (arr = allFiles) => {
    let newArr = [];
    for (let i in arr) {
        if (isFold(arr[i])) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
};
function filterNonNullAndEmpty(array) {
    return array.filter((item) => item !== null && item !== undefined && item !== '');
}
function sortArrayByName(array) {
    return array.sort((a, b) => {
        const nameA = a.toLowerCase();
        const nameB = b.toLowerCase();
        return nameA.localeCompare(nameB);
    });
}
function filterFileNameFromPathName(filePath) {
    return path.basename(filePath);
}
function formatBitrate(bitrate) {
    const kbps = bitrate / 1000;
    const formattedBitrate = kbps.toFixed(0);
    return `${formattedBitrate} kbps`;
}
function formatSecondsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
function findLargeFiles(directory, minSize) {
    const files = [];
    function traverseFolder(folderPath) {
        const entries = fs.readdirSync(folderPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(folderPath, entry.name);
            if (entry.isDirectory()) {
                traverseFolder(fullPath);
            }
            else if (entry.isFile()) {
                const fileSize = fs.statSync(fullPath).size;
                const fileSizeInGB = fileSize / (1024 * 1024 * 1024);
                if (fileSizeInGB > minSize) {
                    files.push(fullPath);
                }
            }
        }
    }
    traverseFolder(directory);
    return files;
}
const writeFile = (file, content = '') => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, content, 'utf8', (error) => {
            if (error)
                return reject(error);
            console.log('' + file + '文件已经被覆写！');
            return resolve(content);
        });
    });
};
function getVideoMessage(videoFilePath) {
    return new Promise((resolve) => {
        fluent_ffmpeg_1.default.ffprobe(videoFilePath, (err, metadata) => {
            if (err) {
                console.error('Error reading metadata:', err);
                return resolve(err);
            }
            const stats = fs.statSync(videoFilePath);
            const fileSizeInBytes = stats.size;
            const _fileSizeInGB = (fileSizeInBytes / Math.pow(1024, 3)).toFixed(1);
            const fileSizeInGB = `${_fileSizeInGB}g`;
            const createdTime = new Date(stats.birthtime).toISOString().split('T')[0];
            const modifiedTime = new Date(stats.mtime).toISOString().split('T')[0];
            const { streams } = metadata;
            const [video, audio] = streams;
            let { codec_name, width, height, duration, bit_rate } = video;
            let { codec_name: codec_name_audio, bit_rate: bit_rate_audio } = audio;
            let _codec_name_audio = '';
            if (codec_name_audio)
                _codec_name_audio = `音频编码格式：${codec_name_audio}\n`;
            let _codec_name = '';
            if (codec_name)
                _codec_name = `编码格式：${codec_name}\n`;
            let widthHeight = '';
            if (width && height)
                widthHeight = `${width} x ${height}\n`;
            let durationHMS = '';
            if (duration !== 'N/A')
                durationHMS = `${formatSecondsToHMS(duration)}\n`;
            let bitRite = '';
            if (bit_rate !== 'N/A')
                bitRite = `视频比特率：${formatBitrate(bit_rate)}\n`;
            let bitRateAudio = '';
            if (bit_rate_audio !== 'N/A')
                bitRateAudio = `音频比特率：${formatBitrate(bit_rate_audio)}\n`;
            let message = '';
            const videoName = filterFileNameFromPathName(videoFilePath);
            message = `${videoName}\n${fileSizeInGB}\n创建时间：${createdTime}\n修改时间：${modifiedTime}\n${durationHMS}${widthHeight}${bitRite}${_codec_name}${bitRateAudio}${_codec_name_audio}`;
            resolve(message);
        });
    });
}
function getFoldVideoMessage(foldPath = './', minSizeInGB = 0, videoTypeArr = videoType) {
    const files = findLargeFiles(foldPath, minSizeInGB);
    let targetArr = [];
    videoTypeArr.forEach((typeItem) => {
        targetArr.push(...(0, exports.filterTypeArr)(files, typeItem));
    });
    targetArr = sortArrayByName(targetArr);
    let message = '';
    return new Promise((resolve) => {
        Promise.all(targetArr.map((videoItem) => {
            return new Promise((resolve) => {
                getVideoMessage(videoItem).then((res) => {
                    resolve(res);
                });
            });
        })).then((messages) => {
            let msg = '';
            messages.forEach((msgItem) => {
                msg += msgItem + '\n';
            });
            resolve(msg);
        });
    });
}
function getSonFoldVideoMessage(minSizeInGB, txtFileName, sonFolds = filterOnlyFoldArr(allFiles)) {
    Promise.all(sonFolds.map((foldItem) => {
        return new Promise((resolve) => {
            getFoldVideoMessage(foldItem, minSizeInGB, videoType).then((msg) => resolve(msg));
        });
    })).then((res) => {
        let message = '';
        filterNonNullAndEmpty(res).forEach((msgItem) => {
            message += '\n' + msgItem + '\n';
        });
        writeFile(txtFileName, message).then((value) => {
            console.log('覆写的值：', value);
        }, (reason) => {
            console.log('覆写失败', reason);
        });
    });
}
const videoType = ['mp4', 'mkv', 'ts', 'rmvb'];
const minSizeInGB = 0.2;
const txtFileName = '1子文件夹里所有大文件的信息.txt';
getSonFoldVideoMessage(minSizeInGB, txtFileName);
