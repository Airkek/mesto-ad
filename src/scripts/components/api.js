import { cohort, token } from "../practicum-identity.js";

const config = {
  baseUrl: `https://mesto.nomoreparties.co/v1/${cohort}`,
  headers: {
    authorization: token,
    "Content-Type": "application/json",
  },
};

const getResponseData = (response) => {
  if (!response.ok) {
    return Promise.reject(new Error(`Ошибка сервера: ${response.status}`));
  }

  return response.json();
};

const request = (path, options = {}) => {
  return fetch(`${config.baseUrl}${path}`, {
    ...options,
    headers: config.headers,
  }).then(getResponseData);
};

export const getUserInfo = () => request("/users/me");

export const getCardList = () => request("/cards");

export const setUserInfo = ({ name, about }) => request("/users/me", {
  method: "PATCH",
  body: JSON.stringify({ name, about }),
});

export const setUserAvatar = (avatar) => request("/users/me/avatar", {
  method: "PATCH",
  body: JSON.stringify({ avatar }),
});

export const addCard = ({ name, link }) => request("/cards", {
  method: "POST",
  body: JSON.stringify({ name, link }),
});

export const removeCard = (cardId) => request(`/cards/${cardId}`, {
  method: "DELETE",
});

export const addCardLike = (cardId) => request(`/cards/likes/${cardId}`, {
  method: "PUT",
});

export const removeCardLike = (cardId) => request(`/cards/likes/${cardId}`, {
  method: "DELETE",
});
