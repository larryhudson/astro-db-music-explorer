function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function getUrlOrigin(url) {
  try {
    const urlObject = new URL(url);
    return urlObject.origin;
  } catch (error) {
    return "";
  }
}

async function getUrlTitle(url) {
  const titleResponse = await fetch(`/api/get-title-from-url?url=${url}`);

  if (!titleResponse.ok) {
    return;
  }

  const titleData = await titleResponse.json();

  const title = titleData.title;

  return title;
}

// when URL is entered, automatically fetch the title using an API

document.addEventListener("astro:page-load", function () {
  const urlInputs = Array.from(
    document.querySelectorAll("[data-fill-url-title-to]"),
  );

  for (const urlInput of urlInputs) {
    const titleInputId = urlInput.getAttribute("data-fill-url-title-to");

    const titleInput = document.getElementById(titleInputId);

    urlInput.addEventListener("input", async function (event) {
      const url = event.target.value;
      const urlIsValid = validateUrl(url);
      if (!urlIsValid) {
        return;
      }

      const articleTitle = await getUrlTitle(url);

      titleInput.value = articleTitle;

      const fillOriginUrlTo = urlInput.getAttribute("data-fill-origin-url-to");
      const fillOriginTitleTo = urlInput.getAttribute(
        "data-fill-origin-title-to",
      );

      const urlOrigin = getUrlOrigin(url);

      if (fillOriginUrlTo) {
        const originUrlInput = document.getElementById(fillOriginUrlTo);
        originUrlInput.value = urlOrigin;
      }

      if (fillOriginTitleTo) {
        const originTitleInput = document.getElementById(fillOriginTitleTo);
        const originTitle = await getUrlTitle(urlOrigin);
        originTitleInput.value = originTitle;
      }
    });
  }
});
