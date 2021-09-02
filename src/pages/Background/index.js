const setBadgeText = () => {
  chrome.action.setBadgeBackgroundColor({ color: "#3eba45" }, () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        let currentUrl = tabs[0].url.split("/")[2];

        console.log(currentUrl);

        // Get user data and update state
        chrome.storage.sync.get(["websites"], function (result) {
          let knownEmailsOnCurrentUrl = 0;

          if (result.websites && result.websites[currentUrl]) {
            knownEmailsOnCurrentUrl = result.websites[currentUrl].length;
          }

          chrome.action.setBadgeText({
            text:
              knownEmailsOnCurrentUrl > 0
                ? knownEmailsOnCurrentUrl.toString()
                : "",
          });
        });
      }
    });
  });
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  setBadgeText();
});

chrome.tabs.onActivated.addListener((tab) => {
  setBadgeText();
});

chrome.tabs.onCreated.addListener((tab) => {
  setBadgeText();
});
