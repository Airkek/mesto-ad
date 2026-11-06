# Mesto

## Локальный запуск

Требуется Node.js 22.12 или новее.

```sh
npm ci
npm run dev
```

Страница автоматически открывается в браузере.

## Токен учебного API

Идентификатор группы и токен Mesto хранятся в `src/scripts/practicum-identity.js`. При публикации на GitHub Pages эти значения попадают в клиентскую JavaScript-сборку и доступны посетителям сайта. Хранение в `.env` с подстановкой при сборке даёт тот же результат, поэтому в проекте используются явные константы.

GitHub PAT для публикации хранится в GitHub Actions Secret `PUBLIC_PAGES_TOKEN`.

## Сборка

```sh
npm run build
```

Готовая сборка находится в `dist`.

Локальный просмотр сборки доступен через команду.

```sh
npm run preview
```

## Публикация

Требуется настроенная GitHub-аутентификация с доступом к `Airkek/ypraktikum-mesto-public`.

```sh
npm run deploy
```

Адрес GitHub Pages после публикации — [airkek.github.io/ypraktikum-mesto-public](https://airkek.github.io/ypraktikum-mesto-public/).
