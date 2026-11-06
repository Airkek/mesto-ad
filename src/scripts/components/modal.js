let activeModalWindow = null;
let previousFocusedElement = null;

const handleKeyDown = (event) => {
  if (event.key === "Escape") {
    closeModalWindow(activeModalWindow);
  }

  if (event.key === "Tab" && activeModalWindow) {
    const focusableElements = Array.from(activeModalWindow.querySelectorAll(
      'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
    ));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
};

export const openModalWindow = (modalWindow) => {
  if (activeModalWindow) {
    closeModalWindow(activeModalWindow);
  }

  previousFocusedElement = document.activeElement;
  activeModalWindow = modalWindow;
  modalWindow.classList.add("popup_is-opened");
  modalWindow.setAttribute("aria-hidden", "false");
  document.body.classList.add("page_has-popup");
  document.addEventListener("keydown", handleKeyDown);
  const focusTarget = modalWindow.querySelector("input, .popup__close");
  focusTarget.focus();
};

export const closeModalWindow = (modalWindow) => {
  modalWindow.classList.remove("popup_is-opened");
  modalWindow.setAttribute("aria-hidden", "true");

  if (activeModalWindow === modalWindow) {
    activeModalWindow = null;
    document.body.classList.remove("page_has-popup");
    document.removeEventListener("keydown", handleKeyDown);
    previousFocusedElement?.focus();
  }
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
