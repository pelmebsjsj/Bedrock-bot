require('dotenv').config();
const { createClient } = require('bedrock-protocol');
const { OpenAI } = require('openai');

// Конфиг из переменных окружения
const HOST = process.env.MC_HOST;
const PORT = +process.env.MC_PORT;
const USERNAME = process.env.MC_USERNAME;
const PASSWORD = process.env.MC_PASSWORD;
const OPENAI_KEY = process.env.OPENAI_KEY;

const openai = new OpenAI({ apiKey: OPENAI_KEY });

const client = createClient({
  host: HOST,
  port: PORT,
  username: USERNAME,
  offline: false // ставь true если сервер не требует Xbox авторизацию
});

let registered = false;

client.on('text', async (packet) => {
  // Автоматическая регистрация/логин
  if (!registered) {
    if (/\/register/i.test(packet.message)) {
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: USERNAME,
        message: `/register ${PASSWORD} ${PASSWORD}`
      });
      registered = true;
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
      return;
    }
  }

  // Игнорируем свои же сообщения
  if (packet.source_name === USERNAME) return;

  // === ПРИМЕР: Обработка команд игрока ===
  // Ты можешь добавить свою обработку команд здесь

  // Пример: бот реагирует на "бот, нарубай дерева"
  if (/бот.*наруб(ай|и).*дерев/iu.test(packet.message)) {
    client.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: USERNAME,
      message: 'Я бы нарубил дерево, если бы умел двигаться! (логику надо дописать)'
    });
    // Здесь добавь свою функцию: findAndChopTree()
  }

  // Пример: бот отвечает на "бот, привет"
  if (/бот.*привет/iu.test(packet.message)) {
    client.queue('text', {
      type: 'chat',
      needs_translation: false,
      source_name: USERNAME,
      message: 'Привет! Я бот.'
    });
  }

  // === Пример интеграции с OpenAI для интерпретации команд ===
  // Ниже пример того, как можно подключить анализ команд через GPT, если нужно:
  /*
  const gptRes = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Ты переводишь команды Minecraft на JSON-действия.' },
      { role: 'user', content: packet.message }
    ]
  });
  try {
    const action = JSON.parse(gptRes.choices[0].message.content);
    // обработка action
  } catch {}
  */
});

client.on('disconnect', (reason) => {
  console.log('Бот отключен:', reason);
  process.exit(1);
});

console.log('Бот запускается...');
