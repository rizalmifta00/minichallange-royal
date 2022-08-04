"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/bin.js
var require_bin = __commonJS({
  "../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/bin.js"(exports2, module2) {
    "use strict";
    var spawn = require("child_process").spawn;
    function run(cmd, args, options, done) {
      if (typeof options === "function") {
        done = options;
        options = void 0;
      }
      var executed = false;
      var ch = spawn(cmd, args, options);
      var stdout = "";
      var stderr = "";
      ch.stdout.on("data", function(d) {
        stdout += d.toString();
      });
      ch.stderr.on("data", function(d) {
        stderr += d.toString();
      });
      ch.on("error", function(err) {
        if (executed)
          return;
        executed = true;
        done(new Error(err));
      });
      ch.on("close", function(code) {
        if (executed)
          return;
        executed = true;
        if (stderr) {
          return done(new Error(stderr));
        }
        done(null, stdout, code);
      });
    }
    module2.exports = run;
  }
});

// ../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/ps.js
var require_ps = __commonJS({
  "../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/ps.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var bin = require_bin();
    function ps(callback) {
      var args = ["-A", "-o", "ppid,pid"];
      bin("ps", args, function(err, stdout, code) {
        if (err)
          return callback(err);
        if (code !== 0) {
          return callback(new Error("pidtree ps command exited with code " + code));
        }
        try {
          stdout = stdout.split(os.EOL);
          var list2 = [];
          for (var i = 1; i < stdout.length; i++) {
            stdout[i] = stdout[i].trim();
            if (!stdout[i])
              continue;
            stdout[i] = stdout[i].split(/\s+/);
            stdout[i][0] = parseInt(stdout[i][0], 10);
            stdout[i][1] = parseInt(stdout[i][1], 10);
            list2.push(stdout[i]);
          }
          callback(null, list2);
        } catch (error) {
          callback(error);
        }
      });
    }
    module2.exports = ps;
  }
});

// ../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/wmic.js
var require_wmic = __commonJS({
  "../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/wmic.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var bin = require_bin();
    function wmic(callback) {
      var args = ["PROCESS", "get", "ParentProcessId,ProcessId"];
      var options = { windowsHide: true, windowsVerbatimArguments: true };
      bin("wmic", args, options, function(err, stdout, code) {
        if (err) {
          callback(err);
          return;
        }
        if (code !== 0) {
          callback(new Error("pidtree wmic command exited with code " + code));
          return;
        }
        try {
          stdout = stdout.split(os.EOL);
          var list2 = [];
          for (var i = 1; i < stdout.length; i++) {
            stdout[i] = stdout[i].trim();
            if (!stdout[i])
              continue;
            stdout[i] = stdout[i].split(/\s+/);
            stdout[i][0] = parseInt(stdout[i][0], 10);
            stdout[i][1] = parseInt(stdout[i][1], 10);
            list2.push(stdout[i]);
          }
          callback(null, list2);
        } catch (error) {
          callback(error);
        }
      });
    }
    module2.exports = wmic;
  }
});

// ../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/get.js
var require_get = __commonJS({
  "../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/get.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var platformToMethod = {
      darwin: require_ps(),
      sunos: require_ps(),
      freebsd: require_ps(),
      netbsd: require_ps(),
      win: require_wmic(),
      linux: require_ps(),
      aix: require_ps()
    };
    var platform = os.platform();
    if (platform.startsWith("win")) {
      platform = "win";
    }
    var file = platformToMethod[platform];
    function get(callback) {
      if (file === void 0) {
        callback(new Error(os.platform() + " is not supported yet, please open an issue (https://github.com/simonepri/pidtree)"));
      }
      var list2 = file;
      list2(callback);
    }
    module2.exports = get;
  }
});

// ../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/pidtree.js
var require_pidtree = __commonJS({
  "../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/lib/pidtree.js"(exports2, module2) {
    "use strict";
    var getAll = require_get();
    function list2(PID, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (typeof options !== "object") {
        options = {};
      }
      PID = parseInt(PID, 10);
      if (isNaN(PID) || PID < -1) {
        callback(new TypeError("The pid provided is invalid"));
        return;
      }
      getAll(function(err, list3) {
        if (err) {
          callback(err);
          return;
        }
        if (PID === -1) {
          for (var i = 0; i < list3.length; i++) {
            list3[i] = options.advanced ? { ppid: list3[i][0], pid: list3[i][1] } : list3[i] = list3[i][1];
          }
          callback(null, list3);
          return;
        }
        var root;
        for (var l = 0; l < list3.length; l++) {
          if (list3[l][1] === PID) {
            root = options.advanced ? { ppid: list3[l][0], pid: PID } : PID;
            break;
          }
          if (list3[l][0] === PID) {
            root = options.advanced ? { pid: PID } : PID;
          }
        }
        if (!root) {
          callback(new Error("No matching pid found"));
          return;
        }
        var tree = {};
        while (list3.length > 0) {
          var element = list3.pop();
          if (tree[element[0]]) {
            tree[element[0]].push(element[1]);
          } else {
            tree[element[0]] = [element[1]];
          }
        }
        var idx = 0;
        var pids = [root];
        while (idx < pids.length) {
          var curpid = options.advanced ? pids[idx++].pid : pids[idx++];
          if (!tree[curpid])
            continue;
          var length = tree[curpid].length;
          for (var j = 0; j < length; j++) {
            pids.push(options.advanced ? { ppid: curpid, pid: tree[curpid][j] } : tree[curpid][j]);
          }
          delete tree[curpid];
        }
        if (!options.root) {
          pids.shift();
        }
        callback(null, pids);
      });
    }
    module2.exports = list2;
  }
});

// ../../node_modules/.pnpm/pidtree@0.5.0/node_modules/pidtree/index.js
function pify(fn, arg1, arg2) {
  return new Promise(function(resolve, reject) {
    fn(arg1, arg2, function(err, data) {
      if (err)
        return reject(err);
      resolve(data);
    });
  });
}
String.prototype.startsWith = function(suffix) {
  return this.substring(0, suffix.length) === suffix;
};
var pidtree = require_pidtree();
function list(pid, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = void 0;
  }
  if (typeof callback === "function") {
    pidtree(pid, options, callback);
    return;
  }
  return pify(pidtree, pid, options);
}
module.exports = list;
