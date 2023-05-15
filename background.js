chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "executeScript" && sender && sender.tab && sender.tab.id) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          files: ["content.js"],
        });
      });
    }
  });
