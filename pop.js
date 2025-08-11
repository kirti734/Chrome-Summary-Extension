document.getElementById("summarisebtn").addEventListener("click", async () => {
  const resultdiv = document.getElementById("result");
  const lang = document.getElementById("langbtn").value;
  const selectedtype = document.getElementById("selectbtn").value;
  let key;

  chrome.storage.sync.get(["geminikey"], async (result) => {
    if (!result.geminikey) {
      resultdiv.value =
        "API key is not found 😢.Please set your API key in the extension options";
      return;
    } else {
      key = result.geminikey;
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(
      tab.id,
      { type: "GET_ARTICLE_TEXT" },
      async (response) => {
        if (chrome.runtime.lastError) {
          resultdiv.value =
            "Error: Could not connect to page. Make sure you're on a valid webpage.";
          return;
        }

        if (response && response.text) {
          await summarisepagetext(
            selectedtype,
            response.text,
            key,
            lang,
            resultdiv
          );
        } else {
          resultdiv.value = "No content found on this page.";
        }
      }
    );
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const copybtn = document.getElementById("copybtn");
  const input = document.getElementById("result");
  const clearbtn = document.getElementById("clearbtn");
  const askto = document.getElementById("askto");

  copybtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      const originalText = copybtn.innerHTML;

      copybtn.innerHTML = "Copied!😊";

      setTimeout(() => {
        copybtn.innerHTML = originalText;
      }, 1000);
    } catch (err) {
      alert("Copy failed.");
    }
  });

  clearbtn.addEventListener("click", async () => {
    try {
      input.value = "";
      const originalText = clearbtn.innerHTML;

      clearbtn.innerHTML = "Cleared!😊";

      setTimeout(() => {
        clearbtn.innerHTML = originalText;
      }, 700);
    } catch (err) {
      alert("Clear failed.");
    }
  });

  askto.addEventListener("click", () => {
    const lang = document.getElementById("langbtn").value;
    const selectedtype = document.getElementById("selectbtn").value;

    chrome.storage.sync.get(["geminikey"], async (result) => {
      if (!result.geminikey) {
        input.value =
          "API key is not found 😢.Please set your API key in the extension options";
        return;
      } else {
        console.log(input.value)
        await summarisepagetext(selectedtype, input.value, result.geminikey, lang, input);
      }
    });
  });
});

async function summarisepagetext(
  selectedtype,
  responsetext,
  key,
  lang,
  resultdiv
) {
  try {
    resultdiv.value = "Waiting for the tool to extract the text....🤗";

    const summary = await gemini(selectedtype, responsetext, key, lang);
    console.log("hello")

    resultdiv.value = summary;
  } catch (error) {
    resultdiv.value = `Error: ${error.message || "Failed to generate summary"}`;
  }
}

async function gemini(type, article, key, lang) {
  let maxlength = 29000;
  const truncatedtext =
    article?.length > maxlength
      ? article.substring(0, maxlength) + "...."
      : article;

  let prompt;

  if (lang == "hineng")
    lang =
      "Casual Hinglish format. Use Hindi sentence flow, mix English keywords naturally, and keep the tone friendly and conversational, like you're explaining to a friend on a call. Avoid formal Hindi words.";

  switch (type) {
    case "brief":
      prompt = `Provide a concise summary of the ${truncatedtext} in 15-20 well-structured sentences. Focus only on the core message, main findings, or central arguments, avoiding minor details and background information.provide the text only in ${lang}`;
      break;

    case "bullet":
      prompt = `Summarize the ${truncatedtext} into 8 to 9 bullet points. Each point should highlight a major idea, key insight, or important fact from the article. Keep the language clear, direct, and informative. Avoid overly technical or complex phrasing unless necessary. Format each point as a line starting with "- " (dash followed by a space).provide the text only in ${lang}`;
      break;

    case "detailed":
      prompt = `Write a detailed summary of the ${truncatedtext} in approximately 600-700 words. Preserve the logical flow, include the main points, supporting arguments, and key examples, and reflect the tone and intent of the original article. Avoid copying text directly—rephrase in original language to maintain clarity and cohesion.provide the text only in ${lang}`;
      break;
  }

  const apiurl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  const requestdata = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 2,
    },
  };

  try {
    const response = await fetch(apiurl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestdata),
    });

    if (!response.ok) {
      const errordata = await response.json();
      throw new Error(errordata.error?.message || "API request failed");
    }

    const responsedata = await response.json();

    return (
      responsedata?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "failed in summary"
    );
  } catch (error) {
    console.log(error);
    return null;
  }
}
