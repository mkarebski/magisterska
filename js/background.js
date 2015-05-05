console.log("Loaded.");

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: "content.html"}, function(tab) {});
});
