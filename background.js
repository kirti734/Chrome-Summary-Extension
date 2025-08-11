chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["geminikey"], (result) => {
    if (!result.geminikey)
    {
      chrome.tabs.create({
        url: "option.html",
      });
    }
  });
});
