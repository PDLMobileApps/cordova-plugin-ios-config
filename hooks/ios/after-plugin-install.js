#!/usr/bin/env node

/* 
  FLMA-3379 Deeplinks not working with push notification - iOS

  While ExactTarget cordova plugin supports handling of remote push notification in 
  active/inactive state(foreground/background), it lacks handling while the App 
  is in terminated state(App is not in the Phone memory). 

  This script will modify AppDelegate.m to insert Background Push Notification object handler
  when received from iOS App terminated state.
*/

const path = require("path");
const readline = require('readline');
const fs = require('fs');
const et = require('elementtree');
const line_counter = ((i = 0) => () => ++i)();
const stringToInsert = "\
    NSDictionary *infoRemoteNotif = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey];\n\
    if (infoRemoteNotif) {\n\
        [[NSUserDefaults standardUserDefaults] setObject:infoRemoteNotif forKey:@\"backgroundNotification\"];\n\
        [[NSUserDefaults standardUserDefaults] synchronize];\n\
    }\n\n";


function jsonLog(params) {
  console.log(JSON.stringify(params));
}

function copyFile(source, target, cb) {
  let cbCalled = false;

  let rd = fs.createReadStream(source);
  rd.on("error", function (err) {
    done(err);
  });
  let wr = fs.createWriteStream(target);
  wr.on("error", function (err) {
    done(err);
  });
  wr.on("close", function (ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

/*
  Cordova default JS object with context(ctx) starting point
*/
module.exports = ctx => {
  console.log("cordova-plugin-ios-config: Begin modifications to AppDelegate.m");

  var cordova_util = ctx.requireCordovaModule("cordova-lib/src/cordova/util");
  var ConfigParser = require('cordova-common').ConfigParser;
  var xml = cordova_util.projectConfig(ctx.opts.projectRoot);
  var cfg = new ConfigParser(xml);
  var data = fs.readFileSync(cfg.path).toString();
  var etree = et.parse(data);
  var projName = etree.findtext('./name');

  // console.log(JSON.stringify(ctx));
  let realOptsPlatforms = ctx.opts.platforms ? ctx.opts.platforms : ctx.opts.cordova.platforms;
  if (!realOptsPlatforms.includes('ios')) return;

  const projectRoot = path.resolve(ctx.opts.projectRoot);
  const platformRoot = path.join(projectRoot, 'platforms/ios');
  const iosFLClassesPath = path.join(platformRoot, projName, 'Classes/');
  const scriptLocation = ctx.opts.plugin.dir + "/scripts/ios/";


  return new Promise((resolve, reject) => {
    // console.log(scriptLocation);

    let inputSouceCode = fs.createReadStream(iosFLClassesPath + "AppDelegate.m")
    let outputSouceCode = fs.createWriteStream(iosFLClassesPath + "AppDelegate.m.tmp")


    const readInterface = readline.createInterface({
      input: inputSouceCode,
      // output: process.stdout,
      console: false,
      crlfDelay: Infinity
    });

    let lineCursor;

    readInterface.on('line', (line, lineno = line_counter()) => {
      // console.log(`${line}`);
      if (line.includes("(BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions")) {
        lineCursor = lineno + 2;
      }
      if (lineno == lineCursor) {
        outputSouceCode.write(stringToInsert);
      }
      outputSouceCode.write(line + "\n");

    })
      .on('close', (res) => {
        copyFile(iosFLClassesPath + "AppDelegate.m.tmp", iosFLClassesPath + "AppDelegate.m", (err) => {
          if (err) throw err;
          console.log('cordova-plugin-ios-config: Successfully copied AppDelegate.m');
          resolve('cordova-plugin-ios-config: Successfully inserted code in AppDelegate.m');
        });
      });


  }).then(res => {
    fs.unlink(iosFLClassesPath + "AppDelegate.m.tmp", (err) => {
      if (err) return console.log(err);
      console.log('cordova-plugin-ios-config: Successfully deleted AppDelegate.m.tmp');
    });
  });
};