document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["geminikey"], (result) => {
    if (!result.geminikey) {
      document.getElementById("apikey").value = result.geminikey;
    }
  });

  document.getElementById("savebtn").addEventListener("click", () => {
    const apikey = document.getElementById("apikey").value.trim();
    console.log("my api key" + apikey)

    if (apikey) {
        console.log("my api key" + apikey)
      chrome.storage.sync.set({ geminikey: apikey }, () => {
        alert("Saved Successfully!🙌");

        setTimeout(() => {
          window.close();

          chrome.tabs.getCurrent((tab) => {
            if (tab) {
              chrome.tabs.remove(tab.id);
            }
          });
        }, 1000);
      });
    }
  });
});
