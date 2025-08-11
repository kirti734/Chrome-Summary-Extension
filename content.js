function getArticleText() {
  const article = document.querySelector("article");
  if (article) return article.innerText;

  const paragraphs = Array.from(document.querySelectorAll("p,span,li"));
  return paragraphs.map((p) => p.innerText).join("\n");

}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_ARTICLE_TEXT") {
    try {
      const text = getArticleText();
      sendResponse({ text: text, success: true });
    } catch (error) {
      sendResponse({
        text: "Error extracting content from page: " + error.message,
        success: false,
      });
    }
  }
  return true;
});
