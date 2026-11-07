const handleKeyDown = (event) => {
  if (event.key === "Escape") {
    const openedModalWindow = document.querySelector(".popup_is-opened");
    closeModalWindow(openedModalWindow);
  }
};

export const openModalWindow = (modalWindow) => {
  if (document.querySelector(".popup_is-opened")) {
    return;
  }

  modalWindow.classList.add("popup_is-opened");
  modalWindow.setAttribute("aria-hidden", "false");
  document.body.classList.add("page_has-popup");
  document.addEventListener("keydown", handleKeyDown);
};

export const closeModalWindow = (modalWindow) => {
  if (!modalWindow.classList.contains("popup_is-opened")) {
    return;
  }

  modalWindow.classList.remove("popup_is-opened");
  modalWindow.setAttribute("aria-hidden", "true");
  document.body.classList.remove("page_has-popup");
  document.removeEventListener("keydown", handleKeyDown);
};

export const setCloseModalWindowEventListeners = (modalWindow) => {
  const closeButtonElement = modalWindow.querySelector(".popup__close");
  closeButtonElement.addEventListener("click", () => closeModalWindow(modalWindow));
  modalWindow.addEventListener("mousedown", (event) => {
    if (event.target === modalWindow) {
      closeModalWindow(modalWindow);
    }
  });
};
