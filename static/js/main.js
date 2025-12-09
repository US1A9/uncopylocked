const $ = window.$;

$(document).ready(() => {
  const urlInput = $("#urlInput");
  const pasteButton = $("#pasteButton");
  const inputs = $("#inputs");
  const clipboardIcon = $("#icon-paste");
  const clearIcon = $("#icon-clear");
  const extractForm = $("#extractForm");
  const submitButton = $("#fetchImages");
  const btnIcon = $("#btn-icon");
  const btnText = $("#btn-text");
  const errorMessage = $("#error-message");

  const notification = $("#notification");
  const notifIcon = $("#notif-icon");
  const notifTitle = $("#notif-title");
  const notifMessage = $("#notif-message");
  const notifClose = $("#notif-close");
  const progressEl = notification.find(".notification-progress")[0];
  const gameMessage = $("#gameDetectedMessage");

  let gameCodes = {};
  fetch("/static/full.json")
    .then((res) => res.json())
    .then((data) => {
      const jsGames = data.filter((g) => g.nametwo);
      jsGames.forEach((g) => {
        gameCodes[g.gameidtwo] = g.nametwo;
      });
    });

  function checkGame() {
    const inputValue = urlInput.val().trim();
    const gameIdMatch = inputValue.match(/\/games\/(\d+)\//);

    if (gameIdMatch) {
      const gameId = gameIdMatch[1];
      const gameName = gameCodes[gameId];

      if (gameName) {
        gameMessage
          .show()
          .css("display", "flex")
          .find("#gameMessageText")
          .text(`You want download a "${gameName}" file, press copy to proceed`);
        return;
      }
    }

    gameMessage.hide();
  }

  function updateButtonState() {
    if (urlInput.val().trim() !== "") {
      clipboardIcon.hide();
      clearIcon.show();
      pasteButton.find("span").text("Clear");
    } else {
      clipboardIcon.show();
      clearIcon.hide();
      pasteButton.find("span").text("Paste");
    }
    checkGame();
  }

  function showMessage(message, type) {
    errorMessage.removeClass("show error success").text(message).addClass(type).addClass("show");
  }

  function hideMessage() {
    errorMessage.removeClass("show");
  }

  function setLoading(loading) {
    if (loading) {
      submitButton.addClass("loading");
      inputs.addClass("loading");
      btnIcon.removeClass("fa-download").addClass("fa-spinner fa-spin");
      btnText.text("Loading...");
    } else {
      submitButton.removeClass("loading");
      inputs.removeClass("loading");
      btnIcon.removeClass("fa-spinner fa-spin").addClass("fa-download");
      btnText.text("Extract Game!");
    }
  }

  let notifHideTimeout = null;

  function resetProgressAnimation(durationMs) {
    if (!progressEl) return;

    progressEl.style.animation = "none";

    void progressEl.offsetWidth;
    progressEl.style.display = "flex";

    progressEl.style.animation = `progress-shrink ${durationMs / 1000}s linear forwards`;
  }

  function clearProgress() {
    if (!progressEl) return;
    progressEl.style.animation = "none";
    progressEl.style.display = "none";
  }

  function showNotification(title, message, type = "success", duration = 5000) {
    notifTitle.text(title);
    notifMessage.text(message);
    notification.removeClass("success error");

    if (type === "error") {
      notification.addClass("error");
      notifIcon.removeClass("fa-check-circle").addClass("fa-exclamation-triangle");
    } else {
      notification.addClass("success");
      notifIcon.removeClass("fa-exclamation-triangle").addClass("fa-check-circle");
    }

    resetProgressAnimation(duration);

    notification.addClass("show");

    if (notifHideTimeout) {
      clearTimeout(notifHideTimeout);
    }

    notifHideTimeout = setTimeout(() => {
      hideNotification();
      notifHideTimeout = null;
    }, duration);
  }

  function hideNotification() {
    notification.removeClass("show");

    clearProgress();

    if (notifHideTimeout) {
      clearTimeout(notifHideTimeout);
      notifHideTimeout = null;
    }
  }

  notifClose.on("click", () => {
    hideNotification();
  });

  pasteButton.on("click", async () => {
    if (urlInput.val().trim() !== "") {
      urlInput.val("");
      updateButtonState();
      hideMessage();
    } else {
      try {
        const text = await navigator.clipboard.readText();
        urlInput.val(text);
        updateButtonState();
        hideMessage();
      } catch (err) {
        showMessage("Unable to access clipboard. Please paste manually.", "error");
      }
    }
  });

  urlInput.on("input", () => {
    updateButtonState();
    hideMessage();
  });

  extractForm.on("submit", (e) => {
    e.preventDefault();

    const placeId = urlInput.val().trim();

    if (!placeId) {
      showMessage("Please enter a game link to extract.", "error");
      return;
    }

    hideMessage();
    setLoading(true);

    $.ajax({
      url: "/",
      method: "POST",
      contentType: "application/json", 
      data: JSON.stringify({ place_id: placeId }),
      dataType: "json",
      success: (response) => {
        setLoading(false);

        if (response.type === "response") {
          const link = document.createElement("a");
          link.href = response.Path;
          link.download = response.Path.split("/").pop();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          showNotification("Success!", response.msg, "success", 5000);
          urlInput.val("");
          updateButtonState();
        } else if (response.type === "error") {
          showNotification("Error!", response.msg, "error", 5000);
        }
      },
      error: (xhr, status, error) => {
        setLoading(false);
        showNotification("Connection Error", "Please try again later.", "error", 5000);
      },
    });
  });

  updateButtonState();
});
