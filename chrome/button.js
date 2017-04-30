/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function ComposerOpenIn(appname) {
		var exePaths = [], macBundleId = "", stripFileProtocol = false;
		var url = GetCurrentEditor().document.location.href;
		
		switch (appname) {
			case "custom-editor-1":
			case "custom-editor-2":
			stripFileProtocol = true;
				var path = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.composer-open-in." + appname + ".")
					.getCharPref("path");
				if (!path) {
					var title = "Composer Open In";
					var message = "This custom application does not have a path defined. Got to the Add-on Manager to define a path.";
					try {
						Components.classes['@mozilla.org/alerts-service;1']
							.getService(Components.interfaces.nsIAlertsService)
							.showAlertNotification(null, title, message, false, '', null);
					} catch (e) {
						Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService)
							.alert(null, title, message);
					}
					return;
				}
				exePaths = [path];
				break;
			case "seamonkey":
				window.open(url);
				return;
			case "chrome":
				exePaths = [
					"/usr/local/bin/google-chrome",
					"/usr/bin/google-chrome",
					"/usr/local/bin/chromium-browser",
					"/usr/bin/chromium-browser",
					"/usr/local/bin/chromium",
					"/usr/bin/chromium",
					"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
					"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
				];
				macBundleId = "com.google.Chrome";
				break;
			case "ie":
				exePaths = [
					"C:\\Program Files\\Internet Explorer\\iexplore.exe",
					"C:\\Program Files (x86)\\Internet Explorer\\iexplore.exe",
				];
				break;
			case "firefox":
				exePaths = [
					"/usr/local/bin/firefox",
					"/usr/bin/firefox",
					"C:\\Program Files\\Mozilla Firefox\\firefox.exe",
					"C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe",
				];
				macBundleId = "org.mozilla.firefox";
				break;
		}
		
		var showNotFoundMessage = function () {
			var title = "Composer Open In";
			var message = "The selected application could not be found.";
			try {
				Components.classes['@mozilla.org/alerts-service;1']
					.getService(Components.interfaces.nsIAlertsService)
					.showAlertNotification(null, title, message, false, '', null);
			} catch (e) {
				Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService)
					.alert(null, title, message);
			}
		};
		
		var os = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;
		var _nsIFile = Components.Constructor("@mozilla.org/file/local;1", "nsILocalFile", "initWithPath");
		
		if (stripFileProtocol) {
			var iosvc = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
			var url = iosvc.newURI(url, null, null);
			var file = url.QueryInterface(Components.interfaces.nsIFileURL).file;
			url = file.path;
		}
		
		if (os == "Darwin" && macBundleId && !exePathPref) {
			var openExe = new _nsIFile("/usr/bin/open");
			if (openExe.isFile()) {
				var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
				process.init(openExe);
				process.runwAsync(["-b", macBundleId, "--args", url], 4, {
					observe: function (subject, topic, data) {
						if (topic == "process-failed" || subject.exitValue != 0) {
							showNotFoundMessage();
						}
					}
				});
				return;
			}
		}
		
		var file;
		for (var i=0; i<exePaths.length; i++) {
			try {
				file = new _nsIFile(exePaths[i]);
				if (file.isFile()) break;
			} catch (e) {
				file = null;
			}
		}
		
		if (file == null || !file.isFile()) {
			showNotFoundMessage();
		} else {
			var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
			process.init(file);
			if (process.runw) {
				process.runw(false, [url], 1);
			} else {
				process.run(false, [url], 1);
			}
		}
}
