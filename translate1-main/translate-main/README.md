# Переводчик Чат - Русский ⇄ 中文

Современное веб-приложение для перевода между русским и китайским языками с поддержкой голосового ввода.

## ✨ Возможности

- 🗣️ **Голосовой ввод** - говорите на русском или китайском языке
- 🌍 **Двусторонний перевод** - русский ↔ китайский 
- 🎨 **Современный интерфейс** - темная тема и анимации
- 💾 **Сохранение истории** - все переводы сохраняются локально
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- ⚡ **Статическое приложение** - готово для GitHub Pages

## 🚀 Развертывание на GitHub Pages

### Метод 1: Автоматическое развертывание

1. **Создайте репозиторий** на GitHub
2. **Загрузите все файлы** из этой папки в репозиторий
3. **Откройте Settings** → **Pages**
4. **Выберите источник**: Deploy from a branch
5. **Выберите ветку**: main / (root)
6. **Нажмите Save**

Ваш сайт будет доступен по адресу: `https://yourusername.github.io/repository-name`

### Метод 2: С GitHub Actions (рекомендуется)

1. Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## 🛠️ Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build
```

## 📁 Структура проекта

```
/
├── public/
│   └── index.html          # HTML шаблон
├── src/
│   ├── App.js             # Главный компонент
│   ├── App.css            # Стили приложения
│   └── index.js           # Точка входа
├── package.json           # Зависимости проекта
└── README.md             # Документация
```

## 🎨 Особенности дизайна

- **Темная тема** - современный дизайн для комфортной работы
- **Градиенты** - красивые переходы цветов
- **Анимации** - плавные переходы и эффекты
- **Адаптивность** - работает на мобильных устройствах
- **Эмодзи** - визуальные индикаторы для языков

## 🔧 Настройка

### Добавление реального API переводчика

Для использования настоящих переводов замените функцию `translateText` в `App.js`:

```javascript
const translateText = async (text, fromLang, toLang) => {
  // Пример с Google Translate API
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, fromLang, toLang })
  });
  return await response.json();
};
```

### Поддерживаемые API переводчиков

- Google Translate API
- DeepL API
- Yandex Translate API
- Microsoft Translator

## 📱 Поддержка браузеров

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Opera 47+

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - используйте свободно!

---

**Создано для GitHub Pages** 🚀