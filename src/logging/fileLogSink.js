'use strict';

const fs = require('fs');
const path = require('path');

// Pattern: Factory - creates a synchronous bounded development-file sink.
function createFileLogSink(filePath, maxBytes, retentionCount) {
  prepareLogDirectory(path.dirname(filePath));
  return (line) => {
    rotateFilesWhenNeeded(filePath, Buffer.byteLength(line), maxBytes, retentionCount);
    fs.appendFileSync(filePath, line, { encoding: 'utf8', mode: 0o600 });
    fs.chmodSync(filePath, 0o600);
  };
}

// Pattern: Filesystem Boundary - creates and secures the application log directory.
function prepareLogDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { mode: 0o700, recursive: true });
  fs.chmodSync(directoryPath, 0o700);
}

// Pattern: Rotation Policy - rotates only when appending would exceed the byte cap.
function rotateFilesWhenNeeded(filePath, incomingBytes, maxBytes, retentionCount) {
  const currentBytes = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
  if (currentBytes === 0 || currentBytes + incomingBytes <= maxBytes) return;
  rotateRetainedFiles(filePath, retentionCount);
}

// Pattern: Filesystem Boundary - retains exactly the configured rotated generations.
function rotateRetainedFiles(filePath, retentionCount) {
  removeOldestRetainedFile(filePath, retentionCount);
  for (let index = retentionCount - 1; index >= 1; index -= 1) {
    renameWhenPresent(`${filePath}.${index}`, `${filePath}.${index + 1}`);
  }
  renameWhenPresent(filePath, `${filePath}.1`);
}

// Pattern: Filesystem Boundary - deletes only the oldest configured log generation.
function removeOldestRetainedFile(filePath, retentionCount) {
  const oldestPath = `${filePath}.${retentionCount}`;
  if (fs.existsSync(oldestPath)) fs.rmSync(oldestPath);
}

// Pattern: Filesystem Boundary - renames a known log generation when present.
function renameWhenPresent(sourcePath, destinationPath) {
  if (fs.existsSync(sourcePath)) fs.renameSync(sourcePath, destinationPath);
}

module.exports = createFileLogSink;
