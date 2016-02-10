/** test suite for fs_promise node module */
"use strict";

import "babel-polyfill";
import {readdirPromise, statPromise} from "../build/fs_promise";

describe("read a directory", function() {

  // note call to done() is required to ensure Promise is fulfiiled or rejected before test
  // completes.
  it("should be able to find files", function(done) {
    let was_fulfilled = false,
        promise = readdirPromise(".");
    promise.then(function (filelist) {
      expect(filelist).toContain('package.json');
      console.log('should be able to find files fulfilled.');
      was_fulfilled = true;
    }, function(err) {
      fail(`Promise rejected: ${err}`);
    }).then(function () { done(); });
    expect(was_fulfilled).toBe(true);
  });

  it("should reject if the directory doesn't exist", function (done) {
    let was_rejected = false;
    readdirPromise("fred").then(function(filelist) {
      fail("Promise was fulfilled with non-existent directory fred/.");
    }, function(err) {
      was_rejected = true;
      expect(err.errno).toBe(-2);
      expect(err.code).toBe("ENOENT");
    }).then(function () { done(); });
    // ensure rejection occurred. should be guaranteed by done() call.
    expect(was_rejected).toBe(false);
  })
})

describe("get file status", function() {

  it("should get status for normal file", function(done) {
    let was_fulfilled = false,
        promise = statPromise("package.json");
        promise.then(function(fstats) {
          expect(fstats.isFile()).toBe(true);
          expect(fstats.isDirectory()).toBe(false);
          was_fulfilled = true;
        },
      function(err) {
        fail(`Promise rejected with error ${err}.`);
      }).then(function() { done(); });
      expect(was_fulfilled).toBe(true);
  })
})
