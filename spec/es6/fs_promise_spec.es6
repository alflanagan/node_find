/** test suite for fs_promise node module */
"use strict";

import "babel-polyfill";
import {readdirPromise} from "../build/fs_promise";

describe("read a directory", function() {
  // note call to done() is required to ensure Promise is fulfiiled or rejected before test
  // completes.
  it("should be able to find files", function(done) {
    var promise = readdirPromise(".");
    promise.then(function (filelist) {
      expect(filelist).toContain('package.json');
    }, function(err) {
      fail(`Promise rejected: ${err}`);
    }).then(function () { done(); });
  });

  it("should reject if the directory doesn't exist", function (done) {
    readdirPromise("fred").then(function(filelist) {
      fail("Promise was fulfilled with non-existent directory fred/.");
    }, function(err) {
      expect(err.errno).toBe(-2);
      expect(err.code).toBe("ENOENT");
    }).then(function () { done(); });
  })
})
