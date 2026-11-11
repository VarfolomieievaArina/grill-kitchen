"use strict";
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const config = window.SITE_CONFIG || {};
  const data = window.DESIGN_DATA;
  const modal = $("#modal"),
    content = $("#modal-content");
  let lastFocus,
    currentStep = 0,
    currentWork = 0;
  const escape = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const safeUrl = (s) => {
    try {
      const u = new URL(s, location.href);
      return ["https:", "http:"].includes(u.protocol) ? u.href : "";
    } catch {
      return "";
    }
  };
  function openModal(title, html, type = "") {
    if (!modal.open) lastFocus = document.activeElement;
    modal.className = type;
    content.innerHTML = `<h2 class="modal-title" id="modal-title">${escape(title)}</h2>${html}`;
    if (!modal.open) modal.showModal();
    document.body.classList.add("modal-open");
    $(".modal-close").focus();
  }
  function closeModal() {
    modal.close();
  }
  $(".modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      const r = modal.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        closeModal();
    }
  });
  modal.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    $("video", modal)?.pause();
    content.innerHTML = "";
    lastFocus?.focus();
  });
  function contact(channel) {
    openModal(
      "Связаться с нами",
      $("#contact-template").innerHTML,
      "modal-contact",
    );
    const heading = $(".contact-form h3", content);
    heading?.remove();
    if (channel)
      $$("input[name=channel]", content).forEach(
        (input) => (input.checked = input.value === channel),
      );
  }
  function showModal(type) {
    if (type === "contact") return contact();
    if (data.features[type]) {
      const f = data.features[type];
      return openModal(
        f.title,
        `<img class="modal-image" src="assets/${f.image}" alt="${escape(f.title)}"><p class="modal-body">${escape(f.body)}</p><button class="button" data-modal="contact">Обсудить проект</button>`,
      );
    }
    if (type === "video") {
      const url = safeUrl(config.videoUrl);
      if (!url)
        return openModal(
          "Видеообзор",
          '<p class="modal-info">Видео пока недоступно.</p>',
        );
      const html = /\.(mp4|webm)(\?|$)/i.test(url)
        ? `<video class="modal-video" src="${escape(url)}" controls autoplay playsinline></video>`
        : `<iframe class="modal-video" src="${escape(url)}" title="Видеообзор" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      return openModal("Видеообзор", html);
    }
    const legal = {
      privacy: ["Политика конфиденциальности", config.privacyUrl],
      terms: ["Пользовательское соглашение", config.termsUrl],
      offer: ["Публичная оферта", config.offerUrl],
    };
    if (legal[type]) {
      const [title, url] = legal[type];
      if (safeUrl(url)) location.assign(safeUrl(url));
      else
        openModal(title, '<p class="modal-info">Документ пока недоступен.</p>');
    }
  }
  document.addEventListener("click", (e) => {
    const target = e.target.closest(
      "[data-modal],[data-channel],[data-review]",
    );
    if (!target) return;
    if (target.dataset.modal) showModal(target.dataset.modal);
    if (target.dataset.channel) {
      const channel = target.dataset.channel,
        url = safeUrl(
          channel === "Telegram" ? config.telegramUrl : config.whatsappUrl,
        );
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else contact(channel);
    }
    if (target.dataset.review !== undefined) {
      const name = data.reviewNames[Number(target.dataset.review)];
      openModal(
        `Отзыв — ${name}`,
        `<img class="modal-image" src="assets/4b807.png" alt="Гриль-кухня"><p class="modal-body">${escape(data.reviewText)}</p>`,
      );
    }
  });
  const menu = $("#navigation"),
    toggle = $(".menu-toggle");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    menu.classList.toggle("open", open);
  });
  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
    menu.classList.remove("open");
  }
  $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      $(".floating-contact").classList.remove("expanded");
      $(".floating-call").setAttribute("aria-expanded", "false");
    }
  });

  function setStep(index, focus = false) {
    currentStep = (index + data.steps.length) % data.steps.length;

    $$("[data-step]").forEach((button) => {
      const active = Number(button.dataset.step) === currentStep;

      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;

      if (focus && active) {
        button.focus();
      }
    });

    $("#step-panel").setAttribute("aria-labelledby", `step-${currentStep}`);

    $(".step-copy h3").textContent = data.steps[currentStep].title;
    $(".step-copy p").textContent = data.steps[currentStep].body;

    $$("[data-step-page]").forEach((button) => {
      const active = Number(button.dataset.stepPage) === currentStep;

      if (active) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  $$("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      setStep(Number(button.dataset.step));
    });
  });

  $$("[data-step-page]").forEach((button) => {
    button.addEventListener("click", () => {
      setStep(Number(button.dataset.stepPage));
    });
  });

  $(".step-next").addEventListener("click", () => {
    setStep(currentStep + 1);
  });

  $(".step-prev").addEventListener("click", () => {
    setStep(currentStep - 1);
  });

  $(".step-tabs").addEventListener("keydown", (event) => {
    const directions = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };

    if (directions[event.key]) {
      event.preventDefault();
      setStep(currentStep + directions[event.key], true);
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();

      setStep(event.key === "Home" ? 0 : data.steps.length - 1, true);
    }
  });

  const stepMobileQuery = matchMedia("(max-width: 600px)");

  function updateStepOrientation() {
    $(".step-tabs").setAttribute(
      "aria-orientation",
      stepMobileQuery.matches ? "horizontal" : "vertical",
    );
  }

  stepMobileQuery.addEventListener("change", updateStepOrientation);
  updateStepOrientation();
  setStep(currentStep);

  $$(".faq-list details").forEach((details) => {
    details.addEventListener("toggle", () => {
      if (details.open) {
        $$(".faq-list details").forEach((other) => {
          if (other !== details) {
            other.open = false;
          }
        });
      }
    });
  });

  function setWork(index) {
    currentWork = (index + 2) % 2;
    $("#work-photo").src = `assets/${currentWork ? data.work2 : "06ba3.png"}`;
    $$("[data-work]").forEach((b, i) => {
      b.classList.toggle("active", i === currentWork);
      b.setAttribute("aria-current", String(i === currentWork));
    });
  }
  $(".work-prev").addEventListener("click", () => setWork(currentWork - 1));
  $(".work-next").addEventListener("click", () => setWork(currentWork + 1));
  $$("[data-work]").forEach((b) =>
    b.addEventListener("click", () => setWork(Number(b.dataset.work))),
  );
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  $$("[data-scroll]").forEach((b) =>
    b.addEventListener("click", () => {
      const track = document.getElementById(b.dataset.scroll),
        direction = Number(b.dataset.direction);
      const max = track.scrollWidth - track.clientWidth;
      let left =
        track.scrollLeft +
        direction *
          (track.firstElementChild.getBoundingClientRect().width + 20);
      if (left > max + 5) left = 0;
      if (left < 0) left = max;
      track.scrollTo({
        left,
        behavior: reduced.matches ? "instant" : "smooth",
      });
    }),
  );
  let touchX = 0;
  $(".works-slider").addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0].clientX;
    },
    { passive: true },
  );
  $(".works-slider").addEventListener(
    "touchend",
    (e) => {
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 60) setWork(currentWork + (delta < 0 ? 1 : -1));
    },
    { passive: true },
  );
  $("#calculator").addEventListener("submit", (e) => {
    e.preventDefault();
    const selection = Object.fromEntries(new FormData(e.currentTarget));
    const labels = {
      material: "Материал фасада",
      placement: "Тип размещения",
      size: "Размер",
      configuration: "Конфигурация",
    };
    let price = null;
    try {
      if (typeof config.calculatePrice === "function")
        price = config.calculatePrice(selection);
    } catch (error) {
      console.warn("Не удалось рассчитать цену", error);
    }
    const validPrice =
      typeof price === "number" && Number.isFinite(price) && price >= 0;
    const summary = `<dl class="selection-summary">${Object.entries(selection)
      .map(([k, v]) => `<dt>${labels[k]}</dt><dd>${escape(v)}</dd>`)
      .join("")}</dl>`;
    const note = validPrice
      ? `<p class="result-price">${new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(price)}</p>`
      : '<p class="modal-info">Стоимость уточняется у менеджера. Вы можете сохранить выбранные параметры.</p>';
    openModal(
      "Ваша гриль-кухня",
      summary +
        note +
        '<div class="modal-actions"><button class="button outline" id="download-selection">Скачать параметры</button><button class="button" data-modal="contact">Связь с менеджером</button></div>',
    );
    $("#download-selection").addEventListener("click", () => {
      const text =
        "Параметры гриль-кухни\n\n" +
        Object.entries(selection)
          .map(([k, v]) => labels[k] + ": " + v)
          .join("\n") +
        "\n\n" +
        (validPrice
          ? "Предварительная стоимость: " + price + " ₽"
          : "Стоимость уточняется у менеджера.");
      const blob = new Blob(["\ufeff" + text], {
          type: "text/plain;charset=utf-8",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "grill-kitchen-parameters.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  });
  document.addEventListener("submit", async (e) => {
    if (!e.target.matches(".contact-form")) return;
    e.preventDefault();
    const form = e.target,
      status = $(".form-status", form),
      button = $("[type=submit]", form);
    status.hidden = false;
    const payload = Object.fromEntries(new FormData(form));
    if (payload.phone.replace(/\D/g, "").length < 10) {
      status.textContent = "Укажите телефон, включая код города или оператора.";
      return;
    }
    const endpoint = safeUrl(config.formEndpoint);
    if (!endpoint) {
      status.textContent = "Отправка пока недоступна. Заявка не отправлена.";
      return;
    }
    button.disabled = true;
    status.textContent = "Отправляем заявку…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(String(response.status));
      status.textContent = "Заявка отправлена. Мы свяжемся с вами.";
      form.reset();
    } catch {
      status.textContent = "Не удалось отправить заявку. Попробуйте ещё раз.";
    } finally {
      button.disabled = false;
    }
  });
  const floating = $(".floating-contact"),
    floatButton = $(".floating-call");
  function floatOpen(open) {
    floating.classList.toggle("expanded", open);
    floatButton.setAttribute("aria-expanded", String(open));
  }
  floatButton.addEventListener("click", () =>
    floatOpen(!floating.classList.contains("expanded")),
  );
  floating.addEventListener("mouseenter", () => {
    if (matchMedia("(hover:hover)").matches) floatOpen(true);
  });
  floating.addEventListener("mouseleave", () => floatOpen(false));
  if (config.phone)
    $$(".site-phone").forEach((el) => {
      const link = document.createElement("a");
      link.className = el.className;
      link.href = "tel:" + config.phone.replace(/[^+\d]/g, "");
      link.textContent = config.phone;
      el.replaceWith(link);
    });
})();

const reviewsTrack = document.querySelector(".reviews-track");
const reviewsPagination = document.querySelector(".reviews-pagination");

if (reviewsTrack && reviewsPagination) {
  const cards = [...reviewsTrack.querySelectorAll(".review-card")];

  cards.forEach((card, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.setAttribute("aria-label", `Отзыв ${index + 1}`);

    button.addEventListener("click", () => {
      reviewsTrack.scrollTo({
        left: card.offsetLeft - cards[0].offsetLeft,
        behavior: "smooth",
      });
    });

    reviewsPagination.append(button);
  });

  const updateReviewsPagination = () => {
    if (!cards.length) return;

    const firstOffset = cards[0].offsetLeft;
    const current = cards.reduce((nearest, card, index) => {
      const distance = Math.abs(
        card.offsetLeft - firstOffset - reviewsTrack.scrollLeft,
      );

      const nearestDistance = Math.abs(
        cards[nearest].offsetLeft - firstOffset - reviewsTrack.scrollLeft,
      );

      return distance < nearestDistance ? index : nearest;
    }, 0);

    [...reviewsPagination.children].forEach((button, index) => {
      const active = index === current;

      button.classList.toggle("active", active);
      button.setAttribute("aria-current", String(active));
    });
  };

  reviewsTrack.addEventListener("scroll", updateReviewsPagination, {
    passive: true,
  });

  new ResizeObserver(updateReviewsPagination).observe(reviewsTrack);
  updateReviewsPagination();
}
