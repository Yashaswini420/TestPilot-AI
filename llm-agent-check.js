import { askLLM } from './llm.js';
import { SYSTEM_PROMPT } from './prompt.js';

const fakePage = {
  url: 'https://www.saucedemo.com/',
  title: 'Swag Labs',
  visibleText: 'Swag Labs Accepted usernames are: standard_user ...',
  elements: [
    { id: 0, tag: 'input', type: 'text', placeholder: 'Username', name: 'user-name' },
    { id: 1, tag: 'input', type: 'password', placeholder: 'Password', name: 'password' },
    { id: 2, tag: 'input', type: 'submit', label: 'Login' },
  ],
};

const messages = [
  { role: 'system', content: SYSTEM_PROMPT },
  {
    role: 'user',
    content:
      `TEST:\nLog in as standard_user with password {{TEST_PASSWORD}} and verify the Products page opens.\n\n` +
      `PREVIOUS STEPS:\n(none)\n\n` +
      `CURRENT PAGE:\n${JSON.stringify(fakePage)}`,
  },
];

const action = await askLLM(messages);
console.log(action);