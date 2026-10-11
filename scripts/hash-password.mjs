#!/usr/bin/env node
import { argon2id } from 'hash-wasm';
import * as crypto from 'crypto';
import * as readline from 'readline';

function askHiddenPassword(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(promptText);

    let password = '';
    const onData = (char) => {
      char = char.toString('utf-8');
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.removeListener('data', onData);
          process.stdin.setRawMode(false);
          rl.close();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.stdin.setRawMode(false);
          rl.close();
          process.stdout.write('\n');
          process.exit(130);
          break;
        case '\u0008':
        case '\x7f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    };

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', onData);
    } else {
      // Non-interactive fallback (e.g. piped input in CI)
      rl.question('', (ans) => {
        rl.close();
        resolve(ans);
      });
    }
  });
}

function evaluatePasswordStrength(password) {
  if (password.length < 16) {
    return { valid: false, error: 'Пароль должен быть не менее 16 символов длиной' };
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const categories = [hasLower, hasUpper, hasDigits, hasSpecial].filter(Boolean).length;
  if (categories < 3) {
    return {
      valid: false,
      error: 'Пароль должен содержать как минимум 3 категории: строчные, заглавные буквы, цифры или спецсимволы',
    };
  }
  return { valid: true };
}

async function main() {
  console.log('\n🔒 Генератор хэша пароля администратора AdultVPN (Argon2id PHC)\n');
  console.log('Параметры безопасности (OWASP):');
  console.log('  • Алгоритм: Argon2id (RFC 9106)');
  console.log('  • Память (m): 65536 КиБ (64 МиБ)');
  console.log('  • Итерации (t): 3');
  console.log('  • Параллелизм (p): 1');
  console.log('  • Длина пароля: от 16 символов\n');

  const password = await askHiddenPassword('Введите новый пароль администратора: ');
  const strength = evaluatePasswordStrength(password);
  if (!strength.valid) {
    console.error(`\n❌ Ошибка: ${strength.error}`);
    process.exit(1);
  }

  const confirm = await askHiddenPassword('Подтвердите пароль еще раз: ');
  if (password !== confirm) {
    console.error('\n❌ Ошибка: Введенные пароли не совпадают!');
    process.exit(1);
  }

  console.log('\n⏳ Вычисление хэша Argon2id...');
  const salt = crypto.randomBytes(16);

  const phcHash = await argon2id({
    password,
    salt,
    iterations: 3,
    memorySize: 65536,
    parallelism: 1,
    hashLength: 32,
    outputType: 'encoded',
  });

  console.log('\n✅ Хэш успешно сгенерирован!\n');
  console.log('Скопируйте эту строку в переменные окружения (.env или Vercel Dashboard):\n');
  console.log('--------------------------------------------------------------------------------');
  console.log(`ADMIN_PASSWORD_HASH="${phcHash}"`);
  console.log('--------------------------------------------------------------------------------\n');
  console.log('⚠️  Важно: Храните исходный пароль в надежном менеджере паролей.');
  console.log('    При утере пароля восстановить его из хэша технически невозможно.\n');
}

main().catch((err) => {
  console.error('\n❌ Ошибка генерации хэша:', err);
  process.exit(1);
});
