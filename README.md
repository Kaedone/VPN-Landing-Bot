# 🛡️ AdultVPN — Защищенный приватный VPN для моделей и стримеров

<div align="center">

![AdultVPN](https://img.shields.io/badge/AdultVPN-VLESS%20Reality-A8B5A0?style=for-the-badge&logo=shield&logoColor=0b0f19)
![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Telegram Stars](https://img.shields.io/badge/Payment-Telegram%20Stars%20⭐-yellow?style=for-the-badge&logo=telegram)

**Конверсионный лендинг-воронка для авторов OnlyFans, Fansly, StripChat, Chaturbate, BongaCams и вебкам-моделей.**

[🤖 Telegram Бот](https://t.me/AdultVPN_bot) • [📋 Тарифы](#-тарифная-сетка)

</div>

---

## 🎯 О проекте

**AdultVPN** решает 3 главные боли авторов контента 18+ и вебкам-моделей:

1. **Деанон и слив домашнего адреса**: защита от перехвата IP-адреса через утечки WebRTC, DNS или системные сокеты.
2. **Падение стрима посреди приватной трансляции**: пропускная способность до 10 Гбит/с, оптимизация под 1080p60 / 4K в OBS Studio без дропов кадров.
3. **Обрыв сети без Kill Switch**: в клиентах **Happ** и **INCY** трафик мгновенно глушится аппаратно при секундном сбое Wi-Fi, не допуская утечки реального IP в открытый эфир.
4. **Опасность Shine Browser и зеркал**: раскрытие рисков встроенного скрытого криптомайнера в так называемых «антидетект-браузерах» и фишинга на зеркалах.

---

## 🚀 Ключевой функционал

- 🔍 **Интерактивный экспресс-аудит (лидогенератор)**:
  - Выбор платформы: _OnlyFans_, _Fansly_, _StripChat_, _Chaturbate_, _BongaCams_, приватные Telegram-каналы.
  - Анализ текущего способа подключения: _Зеркала_ (фишинг), _Shine Browser_ (скрытый криптомайнер + перегрев GPU/CPU + WebRTC утечки), _Обычный VPN_ (нет жесткого Kill Switch).
  - Персонализированный расчёт риска уязвимости (70–98%) и переход в Telegram-бота с параметром аудита.
- ⚡ **Kill Switch симулятор**:
  - Наглядная симуляция секундного сбоя домашней сети прямо на странице.
  - Сравнение: _Обычный VPN (слив домашнего IP провайдера)_ vs _AdultVPN в Happ/INCY (сокеты заблокированы, 0 байт наружу)_.
- 📱 **Поддержка современных клиентов Happ и INCY**:
  - Готовые профили для Windows, macOS, iOS и Android.
  - Протокол **VLESS Reality** — полная маскировка трафика под обычный TLS 1.3 серфинг (невидим для СОРМ и DPI).
- 💳 **Анонимная оплата через Telegram Stars ⭐**:
  - Никаких номеров карт, СБП или записей за adult-сервисы в банковских выписках.
- ⚙️ **Встроенная панель настроек для владельца (Admin Modal)**:
  - Быстрая смена юзернейма бота (по умолчанию `@AdultVPN_bot`).
  - Изменение стартовых UTM-меток (`start=...`).
  - Редактирование цен каждого тарифа в реальном времени с автосохранением в `localStorage`.

---

## 📦 Тарифная сетка

| Тариф                 | Срок     | Стоимость  | Особенности                                                      |
| --------------------- | -------- | ---------- | ---------------------------------------------------------------- |
| **Пробный**           | 7 дней   | **79 ₽**   | 3 устройства, VLESS Reality, Kill Switch                         |
| **Хит продаж**        | 30 дней  | **199 ₽**  | 3 устройства, битрейт для OBS 1080p, приоритет                   |
| **Квартальный**       | 90 дней  | **499 ₽**  | 3 устройства, экономия по сравнению с помесячной                 |
| **Полугодовой**       | 180 дней | **899 ₽**  | 3 устройства, выделенный канал                                   |
| **Годовой VIP**       | 365 дней | **1499 ₽** | ~125 ₽/мес, максимальный пакет обхода глушилок                   |
| 👥 **Семейный**       | 30 дней  | **349 ₽**  | **5 устройств**, **100 ГБ** обхода блокировок и глушилок         |
| ⚪ **Обход глушилок** | Пакет    | **139 ₽**  | **2 устройства**, **15 ГБ** трафика через глушилки сотовых сетей |

> _Все базовые подписки включают 3 устройства одновременно и полный безлимит на скоростных серверах._

---

## 🛠️ Стек технологий

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Сборщик**: [Vite](https://vitejs.dev/)
- **Стилизация**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Иконки**: [Lucide React](https://lucide.dev/)
- **Анимации**: [Motion](https://motion.dev/)
- **Цветовая палитра**: Brand Accent `#A8B5A0` (Sage Military/Cyber metallic), Dark Background `#0b0f19`, Danger Alert `#ef4444`.

---

## 💻 Установка и локальный запуск

В проекте настроен GitHub Actions CI: при пушах и пулл-реквестах в ветку `main` автоматически выполняется установка зависимостей, линтинг и сборка проекта.

```bash
# 1. Клонирование репозитория
git clone https://github.com/Kaedone/VPN-Landing-Bot.git
cd VPN-Landing-Bot

# 2. Установка зависимостей
npm install

# 3. Запуск сервера разработки
npm run dev

# 4. Сборка для продакшна
npm run build
```

Приложение запустится по адресу: `http://localhost:3000` (или `http://localhost:5173`).

---

## 🌐 Деплой за 1 минуту

### Vercel

1. Импортируй репозиторий в [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.

### Cloudflare Pages

1. Подключи репозиторий в Cloudflare Dashboard → Workers & Pages.
2. Build command: `npm run build`.
3. Build output directory: `dist`.

---

## 📱 Айдентика и настройка Telegram-бота

### Настройка в @BotFather:

1. `/setname` → `AdultVPN | Защита стримов & OnlyFans`
2. `/setdescription` →
   ```text
   🛡️ Приватный VLESS Reality VPN для моделей OnlyFans, Fansly, StripChat и Chaturbate.

   • Аварийный Kill Switch в клиентах Happ и INCY
   • 0 логов и защита от деанона домашнего адреса
   • Выделенный канал 10 Gbps для OBS 1080p/4K
   • Оплата через Telegram Stars ⭐
   ```
3. `/setabouttext` → `Защищенный VPN для adult-креаторов и вебкам-моделей. Никаких утечек IP и срывов эфира.`
4. `/setuserpic` → загрузить фирменный аватар в оттенке `#A8B5A0`.

---

## 📄 Лицензия

Распространяется под лицензией [Apache 2.0](./LICENSE).
