export function flyToCart(sourceEl, imageSrc) {
  try {
    const cartIcon = document.getElementById('cart-icon');
    if (!cartIcon || !sourceEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = cartIcon.getBoundingClientRect();

    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.position = 'fixed';
    img.style.left = `${sourceRect.left + sourceRect.width / 2 - 24}px`;
    img.style.top = `${sourceRect.top + sourceRect.height / 2 - 24}px`;
    img.style.width = '48px';
    img.style.height = '48px';
    img.style.borderRadius = '8px';
    img.style.zIndex = '9999';
    img.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    img.style.transition = 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease';
    img.style.transform = 'translate(0, 0) scale(1)';
    document.body.appendChild(img);

    const dx = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const dy = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

    requestAnimationFrame(() => {
      img.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
      img.style.opacity = '0.3';
    });

    setTimeout(() => {
      img.remove();
      // leve animação no ícone do carrinho
      cartIcon.classList.add('animate-bounce-once');
      setTimeout(() => cartIcon.classList.remove('animate-bounce-once'), 400);
    }, 750);
  } catch (e) {
    // silencioso
  }
}
