import { createCardElement, deleteCard, updateCardLikes } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  removeCard,
  addCardLike,
  removeCardLike,
} from "./components/api.js";

const validationSettings = {
  formSelector: '.popup__form:not([name="remove-card"])',
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const placesSection = document.querySelector(".places");
const placesWrap = placesSection.querySelector(".places__list");
const placesStatus = placesSection.querySelector(".places__status");
const placesMessage = placesSection.querySelector(".places__message");
const retryButton = placesSection.querySelector(".places__retry");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const removeModalWindow = document.querySelector(".popup_type_remove-card");
const removeForm = removeModalWindow.querySelector(".popup__form");
const logo = document.querySelector(".header__logo");
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalUserList = usersStatsModalWindow.querySelector(".popup__list");
const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template").content;
const userPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content;
const allPopups = document.querySelectorAll(".popup");
const formStates = new Map(
  [profileForm, avatarForm, cardForm, removeForm].map((formElement) => {
    const buttonElement = formElement.querySelector(".popup__button");
    return [formElement, {
      buttonElement,
      inputElements: formElement.querySelectorAll(".popup__input"),
      errorElement: formElement.querySelector(".popup__request-error"),
      defaultText: buttonElement.textContent,
      submitting: false,
    }];
  }),
);
let userId = "";
let selectedCard = null;
let statsLoading = false;

const formatDate = (date) => date.toLocaleDateString("ru-RU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const createInfoString = (term, description) => {
  const infoElement = infoDefinitionTemplate.querySelector(".popup__info-item").cloneNode(true);
  infoElement.querySelector(".popup__info-term").textContent = term;
  infoElement.querySelector(".popup__info-description").textContent = String(description);
  return infoElement;
};

const renderUsersStats = (cards) => {
  const users = new Map();
  let firstDate = null;
  let lastDate = null;
  let maxCards = 0;

  cards.forEach((card) => {
    const user = users.get(card.owner._id) || { name: card.owner.name, count: 0 };
    user.count += 1;
    users.set(card.owner._id, user);
    maxCards = Math.max(maxCards, user.count);
    const createdAt = new Date(card.createdAt);

    if (!firstDate || createdAt < firstDate) {
      firstDate = createdAt;
    }

    if (!lastDate || createdAt > lastDate) {
      lastDate = createdAt;
    }
  });

  usersStatsModalInfoList.replaceChildren(
    createInfoString("Всего карточек:", cards.length),
    createInfoString("Первая создана:", firstDate ? formatDate(firstDate) : "Нет карточек"),
    createInfoString("Последняя создана:", lastDate ? formatDate(lastDate) : "Нет карточек"),
    createInfoString("Всего пользователей:", users.size),
    createInfoString("Максимум карточек от одного:", maxCards),
  );

  usersStatsModalUserList.replaceChildren();
  users.forEach((user) => {
    const userElement = userPreviewTemplate.querySelector(".popup__list-item").cloneNode(true);
    userElement.textContent = user.name;
    userElement.title = user.name;
    usersStatsModalUserList.append(userElement);
  });
};

const handleLogoClick = () => {
  if (statsLoading) {
    return;
  }

  statsLoading = true;
  logo.setAttribute("aria-busy", "true");
  getCardList()
    .then((cards) => {
      renderUsersStats(cards);
      placesStatus.hidden = true;
      openModalWindow(usersStatsModalWindow);
    })
    .catch(showPageError)
    .finally(() => {
      statsLoading = false;
      logo.removeAttribute("aria-busy");
    });
};

const showPageError = (error) => {
  placesStatus.hidden = false;
  placesMessage.textContent = `Не удалось выполнить запрос. ${error.message}`;
};

const renderUser = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${JSON.stringify(userData.avatar)})`;
};

const handlePreviewPicture = ({ name, link }) => {
  if (document.querySelector(".popup_is-opened")) {
    return;
  }

  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardId, cardElement, likeButton, isLiked) => {
  likeButton.disabled = true;
  const updateLike = isLiked ? removeCardLike : addCardLike;

  updateLike(cardId)
    .then((cardData) => {
      updateCardLikes(cardElement, cardData.likes, userId);
      placesStatus.hidden = true;
    })
    .catch(showPageError)
    .finally(() => {
      likeButton.disabled = false;
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  const formState = formStates.get(removeForm);
  if (formState.submitting) {
    return;
  }

  selectedCard = { cardId, cardElement };
  formState.errorElement.hidden = true;
  openModalWindow(removeModalWindow);
};

const buildCard = (cardData) => createCardElement(cardData, userId, {
  onPreviewPicture: handlePreviewPicture,
  onLikeIcon: handleLikeCard,
  onDeleteCard: handleDeleteCard,
});

const prepareForm = (formElement, modalWindow, reset = true) => {
  const formState = formStates.get(formElement);
  if (formState.submitting) {
    return;
  }

  if (reset) {
    formElement.reset();
  }

  formState.errorElement.hidden = true;
  clearValidation(formElement, validationSettings);
  openModalWindow(modalWindow);
};

const submitForm = (formElement, modalWindow, loadingText, sendRequest, onSuccess) => {
  const formState = formStates.get(formElement);
  const { buttonElement, inputElements, errorElement, defaultText } = formState;
  if (formState.submitting || buttonElement.disabled || !formElement.checkValidity()) {
    return;
  }

  formState.submitting = true;
  errorElement.hidden = true;
  buttonElement.disabled = true;
  buttonElement.textContent = loadingText;
  formElement.setAttribute("aria-busy", "true");
  inputElements.forEach((inputElement) => {
    inputElement.disabled = true;
  });

  sendRequest()
    .then((data) => {
      onSuccess(data);
      closeModalWindow(modalWindow);
    })
    .catch((error) => {
      errorElement.textContent = `Не удалось сохранить изменения. ${error.message}`;
      errorElement.hidden = false;
    })
    .finally(() => {
      formState.submitting = false;
      buttonElement.disabled = false;
      buttonElement.textContent = defaultText;
      formElement.removeAttribute("aria-busy");
      inputElements.forEach((inputElement) => {
        inputElement.disabled = false;
      });
    });
};

const loadPage = () => {
  retryButton.hidden = true;
  placesStatus.hidden = false;
  placesMessage.textContent = "Загрузка профиля и карточек…";
  placesSection.setAttribute("aria-busy", "true");

  Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
      userId = userData._id;
      renderUser(userData);
      placesWrap.replaceChildren(...cards.map(buildCard));
      placesStatus.hidden = true;
      profileAvatar.disabled = false;
      openProfileFormButton.disabled = false;
      openCardFormButton.disabled = false;
    })
    .catch((error) => {
      showPageError(error);
      retryButton.hidden = false;
    })
    .finally(() => {
      placesSection.setAttribute("aria-busy", "false");
    });
};

const handleProfileFormSubmit = (event) => {
  event.preventDefault();
  submitForm(profileForm, profileFormModalWindow, "Сохранение…", () => {
    return setUserInfo({
      name: profileTitleInput.value,
      about: profileDescriptionInput.value,
    });
  }, renderUser);
};

const handleAvatarFormSubmit = (event) => {
  event.preventDefault();
  submitForm(avatarForm, avatarFormModalWindow, "Сохранение…", () => {
    return setUserAvatar(avatarInput.value);
  }, renderUser);
};

const handleCardFormSubmit = (event) => {
  event.preventDefault();
  submitForm(cardForm, cardFormModalWindow, "Создание…", () => {
    return addCard({ name: cardNameInput.value, link: cardLinkInput.value });
  }, (cardData) => {
    placesWrap.prepend(buildCard(cardData));
  });
};

const handleRemoveFormSubmit = (event) => {
  event.preventDefault();
  submitForm(removeForm, removeModalWindow, "Удаление…", () => {
    return removeCard(selectedCard.cardId);
  }, () => {
    deleteCard(selectedCard.cardElement);
    selectedCard = null;
  });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
removeForm.addEventListener("submit", handleRemoveFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  if (formStates.get(profileForm).submitting) {
    return;
  }

  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  prepareForm(profileForm, profileFormModalWindow, false);
});

profileAvatar.addEventListener("click", () => prepareForm(avatarForm, avatarFormModalWindow));
openCardFormButton.addEventListener("click", () => prepareForm(cardForm, cardFormModalWindow));
retryButton.addEventListener("click", loadPage);
logo.addEventListener("click", handleLogoClick);
logo.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleLogoClick();
  }
});
allPopups.forEach(setCloseModalWindowEventListeners);
enableValidation(validationSettings);
loadPage();
