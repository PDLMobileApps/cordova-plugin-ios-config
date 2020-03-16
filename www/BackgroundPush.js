var exec = require("cordova/exec");
var PLUGIN_NAME = "BackgroundPush";

module.exports = {
    getBackgroundNotification: function(onSuccess, onError) {
        exec(onSuccess, onError, PLUGIN_NAME, "getBackgroundNotification", []);
    }
};
