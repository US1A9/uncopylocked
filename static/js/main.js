const $ = window.$

$(document).ready(() => {
  const urlInput = $("#urlInput")
  const pasteButton = $("#pasteButton")
  const inputs = $("#inputs")
  const clipboardIcon = $("#Cclear")
  const clearIcon = $("#Xclear")
  const extractForm = $("#extractForm")
  const submitButton = $("#fetchImages")
  const btnIcon = $("#btn-icon")
  const btnText = $("#btn-text")
  const errorMessage = $("#error-message")
  const notification = $("#notification")
  const notifIcon = $("#notif-icon")
  const notifTitle = $("#notif-title")
  const notifMessage = $("#notif-message")
  const notifClose = $("#notif-close")

  /**
   * Toggle between paste and clear icons
   */
  function updateButtonState() {
    if (urlInput.val().trim() !== "") {
      clipboardIcon.hide()
      clearIcon.show()
      pasteButton.find("span").text("Clear")
    } else {
      clipboardIcon.show()
      clearIcon.hide()
      pasteButton.find("span").text("Paste")
    }
  }

  /**
   * Show notification popup with slide-in animation
   */
  let notifCooldown = false
  function showNotification(title, message, type) {
   if (notifCooldown) return;
    notifTitle.text(title)
    notifMessage.text(message)

    notification.removeClass("success error")

    if (type === "error") {
      notification.addClass("error")
      notifIcon.removeClass("fa-check-circle").addClass("fa-exclamation-triangle")
    } else {
      notification.addClass("success")
      notifIcon.removeClass("fa-exclamation-triangle").addClass("fa-check-circle")
    }

    notification.addClass("show")
    notifCooldown = true
    // Auto hide after 5 seconds
    setTimeout(() => {
      hideNotification()
      notifCooldown = false
    }, 5000)
  }

  /**
   * Hide notification popup
   */
  function hideNotification() {
    notification.removeClass("show")
  }

  /**
   * Close notification on click
   */
  notifClose.on("click", () => {
    hideNotification()
  })

  /**
   * Paste button click handler
   */
  pasteButton.on("click", async () => {
    if (urlInput.val().trim() !== "") {
      urlInput.val("")
      updateButtonState()
      hideMessage()
    } else {
      try {
        const text = await navigator.clipboard.readText()
        urlInput.val(text)
        updateButtonState()
        hideMessage()
      } catch (err) {
        showMessage("Unable to access clipboard. Please paste manually.", "error")
      }
    }
  })

  /**
   * Monitor input changes
   */
  urlInput.on("input", () => {
    updateButtonState()
    hideMessage()
  })

  /**
   * Show inline error message
   */
  function showMessage(message, type) {
    errorMessage.removeClass("show error success").text(message).addClass(type).addClass("show")
  }

  /**
   * Hide inline message
   */
  function hideMessage() {
    errorMessage.removeClass("show")
  }

  /**
   * Set loading state on button with animation
   */
  function setLoading(loading) {
    if (loading) {
      submitButton.addClass("loading")
      inputs.addClass("loading")
      btnIcon.removeClass("fa-download").addClass("fa-spinner fa-spin")
      btnText.text("Loading...") 
    } else {
      submitButton.removeClass("loading")
      inputs.removeClass("loading")
      btnIcon.removeClass("fa-spinner fa-spin").addClass("fa-download")
      btnText.text("Copy Game")
    }
  }

  /**
   * Form submission via AJAX to root route
   */
  extractForm.on("submit", (e) => {
    e.preventDefault()

    const placeId = urlInput.val().trim()

    if (!placeId) {
      showMessage("Please enter a game link to extract.", "error")
      return
    }

    hideMessage()
    setLoading(true)

    $.ajax({
      url: "/",
      method: "POST",
      data: { place_id: placeId },
      dataType: "json",
      success: (response) => {
        setLoading(false)

        if (response.type === "response") {
          const link = document.createElement("a");
          link.href = response.Path;
          link.download = response.Path.split("/").pop();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);         

          showNotification("Success!", response.msg, "success")
          urlInput.val("")
          updateButtonState()
        } else if (response.type === "error") {
          showNotification("Error!", response.msg, "error")
        }
      },
      error: (xhr, status, error) => {
        setLoading(false)
        showNotification("Connection Error", "Please try again later.", "error")
      },
    })
  })

  // Initialize button state
  updateButtonState()
})
