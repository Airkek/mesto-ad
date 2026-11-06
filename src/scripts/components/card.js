const cardTemplate = document.querySelector("#card-template").content.querySelector(".card");

export const updateCardLikes = (cardElement, likes, userId) => {
  const likeButton = cardElement.querySelector(".card__like-button");
  const isLiked = likes.some((user) => user._id === userId);

  likeButton.classList.toggle("card__like-button_is-active", isLiked);
  likeButton.setAttribute("aria-pressed", String(isLiked));
  likeButton.setAttribute("aria-label", isLiked ? "Убрать лайк" : "Поставить лайк");
  cardElement.querySelector(".card__like-count").textContent = String(likes.length);
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
) => {
  const cardElement = cardTemplate.cloneNode(true);
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardElement.dataset.cardId = data._id;
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardImage.setAttribute("aria-label", `Открыть фотографию «${data.name}»`);
  cardElement.querySelector(".card__title").textContent = data.name;
  updateCardLikes(cardElement, data.likes, userId);

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");
    onLikeIcon(data._id, cardElement, likeButton, isLiked);
  });

  if (data.owner._id === userId) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  } else {
    deleteButton.remove();
  }

  cardImage.addEventListener("click", () => onPreviewPicture(data));
  cardImage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPreviewPicture(data);
    }
  });

  return cardElement;
};
