import * as React from "react";

const MOBILE_BREAKPOINT = 768;
// медиа-запрос: "ширина окна меньше 768px"
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

// 1. Как подписаться на изменения.
//    React передаёт callback. Мы вызываем его, когда ширина пересекает границу.
//    Возвращаем функцию отписки.
function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

// 2. Как узнать текущее значение (в браузере).
function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

// 3. Значение на сервере: там нет window, поэтому считаем "не мобильный".
//    Старый код тоже возвращал false до первого эффекта.
function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
