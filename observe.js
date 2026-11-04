export async function observe(page) {
  return page.evaluate(() => {
    // Remove ids from the previous step
    document.querySelectorAll('[data-agent-id]').forEach(e => e.removeAttribute('data-agent-id'));

    const selector =
      'a,button,input,select,textarea,[role=button],[role=link],[role=checkbox],[role=tab],[role=menuitem]';

    const isVisible = el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };

    const clean = s => (s || '').trim().replace(/\s+/g, ' ').slice(0, 80);

    const elements = [...document.querySelectorAll(selector)]
      .filter(isVisible)
      .slice(0, 150)
      .map((el, i) => {
        el.setAttribute('data-agent-id', i); // lets Playwright find it again later
        const isPassword = el.type === 'password';
        const isButtonInput = ['submit', 'button'].includes(el.type);
        return {
          id: i,
          tag: el.tagName.toLowerCase(),
          type: el.type || undefined,
          label: clean(
            el.getAttribute('aria-label') ||
            el.innerText ||
            (isButtonInput ? el.value : '') ||
            el.getAttribute('title')
          ),
          placeholder: el.placeholder || undefined,
          name: el.name || undefined,
          // never expose typed passwords
          value: isPassword || isButtonInput ? undefined : clean(el.value) || undefined,
          disabled: el.disabled || undefined,
        };
      });

    return {
      url: location.href,
      title: document.title,
      visibleText: document.body.innerText.replace(/\s+/g, ' ').slice(0, 1500),
      elements,
    };
  });
}