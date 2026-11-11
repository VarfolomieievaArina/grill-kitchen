/* Настройки подключения. Пустые значения не отправляют данные и не имитируют результат. */
window.SITE_CONFIG = {
  phone: "", // Например: +74951234567. Номер в макете — заглушка.
  telegramUrl: "", // Полная https://t.me/... ссылка магазина
  whatsappUrl: "", // Полная https://wa.me/... ссылка магазина
  formEndpoint: "", // URL обработчика POST JSON: {name, phone, channel}
  videoUrl: "", // URL MP4/WebM или https embed-страница видеоплеера
  privacyUrl: "",
  termsUrl: "",
  offerUrl: "",
  // Укажите функцию расчёта по реальному прайсу. Возвращает стоимость в рублях.
  // Аргумент: {material, placement, size, configuration}.
  calculatePrice: null,
};
