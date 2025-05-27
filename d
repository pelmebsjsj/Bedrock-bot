require('dotenv').config();
const { createClient } = require('bedrock-protocol');

// Конфиг из переменных окружения
const HOST = process.env.MC_HOST;
const PORT = +process.env.MC_PORT;
const USERNAME = process.env.MC_USERNAME;
const PASSWORD = process.env.MC_PASSWORD;
const VERSION = process.env.MC_VERSION || undefined; // можно указать версию клиента, если требуется

if (!HOST || !PORT || !USERNAME || !PASSWORD) {
  console.error('ERROR: Не указаны все обязательные переменные окружения!');
  process.exit(1);
}

const clientOptions = {
  host: HOST,
  port: PORT,
  username: USERNAME,
  offline: false
};

if (VERSION) {
  clientOptions.version = VERSION;
}

const client = createClient(clientOptions);

let registered = false;

client.on('text', async (packet) => {
  // Регистрация или вход
  if (!registered) {
    if (/\/register/i.test(packet.message)) {
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: USERNAME,
        message: `/register ${PASSWORD} ${PASSWORD}`
      });
      registered = true;
      console.log('Бот: Регистрация SimpleAuth...');
      return;
    }
    if (/\/login/i.test(packet.message)) {
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: USERNAME,
        message: `/login ${PASSWORD}`
      });
      registered = true;
      console.log('Бот: Вход SimpleAuth...');
      return;
    }
  }

  // Игнорируем свои сообщения
  if (packet.source_name === USERNAME) return;

  // === Пример реакции на команды из чата ===
  if (/бот.*привет/iu.test(packet.message)) {
    client.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: USERNAME,
      message: 'Привет! Я бот на Bedrock.'
    });
  }

  if (/бот.*наруб(ай|и).*дерев/iu.test(packet.message)) {
    client.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: USERNAME,
      message: 'Я бы срубил дерево, если бы умел ходить :)'
    });
    // Здесь может быть твоя функция поиска и рубки дерева!
  }
});

client.on('disconnect', (reason) => {
  console.log('Бот отключён от сервера:', reason);
  process.exit(1);
});

client.on('join', () => {
  console.log('Бот успешно зашёл на сервер!');
});

client.on('spawn', () => {
  console.log('Бот появился в мире!');
});

console.log('Бот запускается...');
