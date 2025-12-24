/* Dispatcher screen — автономная демо-панель (localStorage) */

const DISPATCH_STORAGE_KEY = "coal_dispatcher_state_v1";

/** @typedef {{id:string, board:string, type:string, driverId:string|null, status:'on_line'|'loading'|'queue'|'fuel'|'repair', location:string, fuelPct:number, payloadTons:number, etaMin:number|null, updatedAt:number, critical:boolean, note?:string}} Vehicle */
/** @typedef {{id:string, name:string, phone:string}} Driver */
/** @typedef {{id:string, priority:'P1'|'P2'|'P3', route:string, tons:number, status:'new'|'assigned'|'in_progress'|'done'|'cancelled', assignedVehicleId:string|null, createdAt:number, comment?:string}} Order */
/** @typedef {{id:string, orderId:string, vehicleId:string, driverId:string, route:string, tons:number, status:'active'|'done'|'cancelled', startAt:number, endAt:number|null, note?:string}} Trip */
/** @typedef {{id:string, at:number, level:'info'|'warn'|'error', message:string, meta?:string}} LogEntry */
/** @typedef {{dispatcherName:string, shift:'day'|'night', planTons:number}} Settings */
/** @typedef {{version:1, settings:Settings, drivers:Driver[], vehicles:Vehicle[], orders:Order[], trips:Trip[], log:LogEntry[]}} DispatchState */

function now() {
  return Date.now();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateTime(ts) {
  const d = new Date(ts);
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function formatShort(ts) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function uid(prefix) {
  const rnd = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `${prefix}-${rnd}`;
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function seedState() {
  /** @type {Driver[]} */
  const drivers = [
    { id: "d1", name: "Сергей К.", phone: "+7 900 000-01-01" },
    { id: "d2", name: "Андрей М.", phone: "+7 900 000-02-02" },
    { id: "d3", name: "Дмитрий С.", phone: "+7 900 000-03-03" },
    { id: "d4", name: "Олег В.", phone: "+7 900 000-04-04" },
    { id: "d5", name: "Павел Н.", phone: "+7 900 000-05-05" },
  ];

  const t = now();
  /** @type {Vehicle[]} */
  const vehicles = [
    {
      id: "v1",
      board: "АВ-102",
      type: "БелАЗ 75131",
      driverId: "d1",
      status: "on_line",
      location: "Трасса №2",
      fuelPct: 62,
      payloadTons: 45,
      etaMin: 18,
      updatedAt: t - 4 * 60_000,
      critical: false,
    },
    {
      id: "v2",
      board: "АВ-117",
      type: "БелАЗ 75135",
      driverId: "d2",
      status: "loading",
      location: "Экскаватор ЭКГ‑10",
      fuelPct: 38,
      payloadTons: 0,
      etaMin: 12,
      updatedAt: t - 2 * 60_000,
      critical: true,
      note: "Низкий уровень топлива (<40%)",
    },
    {
      id: "v3",
      board: "АВ-088",
      type: "КамАЗ 6520",
      driverId: "d3",
      status: "queue",
      location: "Весы №1",
      fuelPct: 74,
      payloadTons: 0,
      etaMin: 25,
      updatedAt: t - 9 * 60_000,
      critical: false,
    },
    {
      id: "v4",
      board: "АВ-141",
      type: "БелАЗ 7547",
      driverId: null,
      status: "repair",
      location: "РММ (бокс 3)",
      fuelPct: 20,
      payloadTons: 0,
      etaMin: null,
      updatedAt: t - 33 * 60_000,
      critical: true,
      note: "ТО/ремонт: гидравлика",
    },
    {
      id: "v5",
      board: "АВ-205",
      type: "КамАЗ 6520",
      driverId: "d5",
      status: "fuel",
      location: "Топливозаправка",
      fuelPct: 12,
      payloadTons: 0,
      etaMin: 10,
      updatedAt: t - 6 * 60_000,
      critical: true,
      note: "Критически низкое топливо",
    },
  ];

  /** @type {Order[]} */
  const orders = [
    {
      id: "O-1206",
      priority: "P2",
      route: "Карьер → Перегруз",
      tons: 60,
      status: "in_progress",
      assignedVehicleId: "v1",
      createdAt: t - 62 * 60_000,
      comment: "В работе (смена началась)",
    },
    {
      id: "O-1207",
      priority: "P1",
      route: "Карьер → Перегруз",
      tons: 60,
      status: "new",
      assignedVehicleId: null,
      createdAt: t - 22 * 60_000,
      comment: "Срочно закрыть окно отгрузки",
    },
    {
      id: "O-1208",
      priority: "P2",
      route: "Карьер → Склад",
      tons: 55,
      status: "new",
      assignedVehicleId: null,
      createdAt: t - 17 * 60_000,
      comment: "План по складу, стандарт",
    },
    {
      id: "O-1209",
      priority: "P3",
      route: "Перегруз → Склад",
      tons: 40,
      status: "new",
      assignedVehicleId: null,
      createdAt: t - 9 * 60_000,
    },
  ];

  /** @type {Trip[]} */
  const trips = [
    {
      id: "T-9101",
      orderId: "O-1206",
      vehicleId: "v1",
      driverId: "d1",
      route: "Карьер → Перегруз",
      tons: 60,
      status: "active",
      startAt: t - 46 * 60_000,
      endAt: null,
      note: "Смена 1",
    },
  ];

  /** @type {LogEntry[]} */
  const log = [
    { id: uid("L"), at: t - 55 * 60_000, level: "info", message: "Открыта смена", meta: "День (08:00–20:00)" },
    { id: uid("L"), at: t - 33 * 60_000, level: "warn", message: "Техника АВ-141 переведена в ремонт", meta: "РММ (бокс 3)" },
    { id: uid("L"), at: t - 6 * 60_000, level: "error", message: "Критическое топливо у АВ-205", meta: "Топливо 12%" },
  ];

  /** @type {DispatchState} */
  return {
    version: 1,
    settings: {
      dispatcherName: "Иван Петров",
      shift: "day",
      planTons: 1200,
    },
    drivers,
    vehicles,
    orders,
    trips,
    log,
  };
}

/** @returns {DispatchState} */
function loadState() {
  const raw = localStorage.getItem(DISPATCH_STORAGE_KEY);
  const parsed = raw ? safeJsonParse(raw) : null;
  if (parsed && parsed.version === 1) return parsed;
  const seeded = seedState();
  saveState(seeded);
  return seeded;
}

/** @param {DispatchState} state */
function saveState(state) {
  localStorage.setItem(DISPATCH_STORAGE_KEY, JSON.stringify(state));
}

/** @param {DispatchState} state */
function resetState(state) {
  const seeded = seedState();
  saveState(seeded);
  Object.assign(state, seeded);
}

function el(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node;
}

function statusLabel(status) {
  switch (status) {
    case "on_line":
      return "На линии";
    case "loading":
      return "Погрузка";
    case "queue":
      return "Очередь";
    case "fuel":
      return "Топливо";
    case "repair":
      return "Ремонт";
    default:
      return status;
  }
}

function orderStatusLabel(status) {
  switch (status) {
    case "new":
      return "Новая";
    case "assigned":
      return "Назначена";
    case "in_progress":
      return "В работе";
    case "done":
      return "Завершена";
    case "cancelled":
      return "Отменена";
    default:
      return status;
  }
}

function tripStatusLabel(status) {
  switch (status) {
    case "active":
      return "Активен";
    case "done":
      return "Завершен";
    case "cancelled":
      return "Отменен";
    default:
      return status;
  }
}

function pillClassForVehicle(status) {
  return `dispatch-pill dispatch-pill--${status}`;
}

function pillClassForOrder(status) {
  return `dispatch-pill dispatch-pill--${status}`;
}

function pillClassForTrip(status) {
  return `dispatch-pill dispatch-pill--${status}`;
}

function badgeClassForPriority(p) {
  if (p === "P1") return "dispatch-badge dispatch-badge--p1";
  if (p === "P2") return "dispatch-badge dispatch-badge--p2";
  return "dispatch-badge dispatch-badge--p3";
}

function setConnectionState(mode) {
  const wrap = el("connection-indicator");
  const text = wrap.querySelector(".dispatch-connection__text");
  if (!text) return;
  wrap.classList.remove("is-warn", "is-error");
  if (mode === "ok") {
    text.textContent = "Локально";
  } else if (mode === "warn") {
    wrap.classList.add("is-warn");
    text.textContent = "Локально (пауза)";
  } else {
    wrap.classList.add("is-error");
    text.textContent = "Нет связи";
  }
}

function addLog(state, level, message, meta) {
  /** @type {LogEntry} */
  const entry = { id: uid("L"), at: now(), level, message, meta };
  state.log.unshift(entry);
  state.log = state.log.slice(0, 250);
}

function driverName(state, driverId) {
  if (!driverId) return "—";
  return state.drivers.find((d) => d.id === driverId)?.name ?? "—";
}

function vehicleBoard(state, vehicleId) {
  if (!vehicleId) return "—";
  return state.vehicles.find((v) => v.id === vehicleId)?.board ?? "—";
}

function findOrder(state, id) {
  return state.orders.find((o) => o.id === id) ?? null;
}

function findVehicle(state, id) {
  return state.vehicles.find((v) => v.id === id) ?? null;
}

function isCriticalVehicle(v) {
  return v.critical || v.fuelPct <= 15 || v.status === "repair";
}

function computeFactTons(state) {
  return state.trips
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + (Number.isFinite(t.tons) ? t.tons : 0), 0);
}

function getFilters() {
  const search = String(el("global-search").value || "").trim().toLowerCase();
  const fleetStatus = String(el("fleet-status-filter").value || "all");
  const orderPriority = String(el("order-priority-filter").value || "all");
  const onlyCritical = Boolean(el("only-critical").checked);
  return { search, fleetStatus, orderPriority, onlyCritical };
}

function matchesSearch(state, search, obj) {
  if (!search) return true;
  const hay = [
    obj?.id,
    obj?.board,
    obj?.type,
    obj?.route,
    obj?.location,
    obj?.comment,
    obj?.note,
    driverName(state, obj?.driverId),
    vehicleBoard(state, obj?.vehicleId),
    vehicleBoard(state, obj?.assignedVehicleId),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(search);
}

function renderClock() {
  el("clock").textContent = formatTime(now());
}

function setActiveTab(tab) {
  document.querySelectorAll(".dispatch-nav__item").forEach((b) => {
    const isActive = b.getAttribute("data-tab") === tab;
    b.classList.toggle("is-active", isActive);
    b.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  document.querySelectorAll(".dispatch-panel").forEach((p) => {
    const key = p.getAttribute("data-panel");
    p.classList.toggle("is-hidden", key !== tab);
  });
}

function renderKpis(state) {
  const onLine = state.vehicles.filter((v) => v.status === "on_line").length;
  const loading = state.vehicles.filter((v) => v.status === "loading").length;
  const queue = state.vehicles.filter((v) => v.status === "queue").length;
  const repair = state.vehicles.filter((v) => v.status === "repair").length;
  const critical = state.vehicles.filter((v) => isCriticalVehicle(v)).length;

  el("kpi-on-line").textContent = String(onLine);
  el("kpi-loading").textContent = String(loading);
  el("kpi-queue").textContent = String(queue);
  el("kpi-repair").textContent = String(repair);
  el("kpi-critical").textContent = String(critical);
}

function renderShiftMeta(state) {
  const shiftLabel = state.settings.shift === "day" ? "День (08:00–20:00)" : "Ночь (20:00–08:00)";
  el("shift-meta").textContent = `${shiftLabel} • План: ${state.settings.planTons.toLocaleString("ru-RU")} т`;
}

function renderPlanFact(state) {
  const plan = state.settings.planTons;
  const fact = computeFactTons(state);
  el("plan-tons").textContent = `${plan.toLocaleString("ru-RU")} т`;
  el("fact-tons").textContent = `${fact.toLocaleString("ru-RU")} т`;
  const pct = plan > 0 ? clamp((fact / plan) * 100, 0, 140) : 0;
  el("planfact-fill").style.width = `${pct}%`;
  const left = Math.max(0, plan - fact);
  el("planfact-hint").textContent = left > 0 ? `До плана осталось: ${left.toLocaleString("ru-RU")} т` : "План выполнен (или перевыполнен)";
}

function renderOverview(state) {
  const { search, orderPriority, onlyCritical } = getFilters();
  const queueWrap = el("overview-queue");
  const logWrap = el("overview-log");
  queueWrap.innerHTML = "";
  logWrap.innerHTML = "";

  const orders = state.orders
    .filter((o) => ["new", "assigned", "in_progress"].includes(o.status))
    .filter((o) => (orderPriority === "all" ? true : o.priority === orderPriority))
    .filter((o) => matchesSearch(state, search, o))
    .sort((a, b) => (a.priority === b.priority ? b.createdAt - a.createdAt : a.priority.localeCompare(b.priority)));

  const limited = orders.slice(0, 6);
  if (limited.length === 0) {
    queueWrap.innerHTML = `<div class="dispatch-table__muted">Нет заявок в очереди.</div>`;
  } else {
    for (const o of limited) {
      const assigned = o.assignedVehicleId ? `Назначено: ${vehicleBoard(state, o.assignedVehicleId)}` : "Не назначено";
      const item = document.createElement("div");
      item.className = "dispatch-item";
      item.innerHTML = `
        <div class="dispatch-item__main">
          <div class="dispatch-item__title">${o.id} • ${o.route}</div>
          <div class="dispatch-item__sub">${o.tons} т • ${assigned} • ${formatShort(o.createdAt)}</div>
        </div>
        <div class="dispatch-badges">
          <span class="${badgeClassForPriority(o.priority)}">${o.priority}</span>
          <span class="dispatch-badge dispatch-badge--status">${orderStatusLabel(o.status)}</span>
          ${onlyCritical && o.priority !== "P1" ? "" : `<button class="dispatch-btn dispatch-btn--link" data-action="assign" data-order="${o.id}">Назначить</button>`}
        </div>
      `;
      if (!onlyCritical || o.priority === "P1") queueWrap.appendChild(item);
    }
  }

  const logItems = state.log.slice(0, 8);
  if (logItems.length === 0) {
    logWrap.innerHTML = `<div class="dispatch-table__muted">Пока пусто.</div>`;
  } else {
    for (const e of logItems) {
      const item = document.createElement("div");
      item.className = "dispatch-item";
      const badge =
        e.level === "error"
          ? `<span class="dispatch-badge dispatch-badge--danger">Критично</span>`
          : e.level === "warn"
            ? `<span class="dispatch-badge dispatch-badge--p2">Внимание</span>`
            : `<span class="dispatch-badge dispatch-badge--p3">Инфо</span>`;
      item.innerHTML = `
        <div class="dispatch-item__main">
          <div class="dispatch-item__title">${e.message}</div>
          <div class="dispatch-item__sub">${e.meta ? e.meta + " • " : ""}${formatShort(e.at)}</div>
        </div>
        <div class="dispatch-badges">${badge}</div>
      `;
      logWrap.appendChild(item);
    }
  }
}

function renderFleet(state) {
  const { search, fleetStatus, onlyCritical } = getFilters();
  const tbody = el("fleet-tbody");
  tbody.innerHTML = "";

  const rows = state.vehicles
    .slice()
    .filter((v) => (fleetStatus === "all" ? true : v.status === fleetStatus))
    .filter((v) => (onlyCritical ? isCriticalVehicle(v) : true))
    .filter((v) => matchesSearch(state, search, v))
    .sort((a, b) => {
      const ac = isCriticalVehicle(a) ? 0 : 1;
      const bc = isCriticalVehicle(b) ? 0 : 1;
      if (ac !== bc) return ac - bc;
      return b.updatedAt - a.updatedAt;
    });

  for (const v of rows) {
    const tr = document.createElement("tr");
    tr.dataset.vehicle = v.id;
    tr.innerHTML = `
      <td><strong>${v.board}</strong>${isCriticalVehicle(v) ? ` <span class="dispatch-badge dispatch-badge--danger">!</span>` : ""}</td>
      <td class="dispatch-table__muted">${v.type}</td>
      <td>${driverName(state, v.driverId)}</td>
      <td><span class="${pillClassForVehicle(v.status)}">${statusLabel(v.status)}</span></td>
      <td>${v.location}</td>
      <td>${v.fuelPct}%</td>
      <td>${v.payloadTons}</td>
      <td>${v.etaMin == null ? "—" : `${v.etaMin} мин`}</td>
      <td class="dispatch-table__muted">${formatShort(v.updatedAt)}</td>
      <td>
        <div class="dispatch-rowbtns">
          <button class="dispatch-btn dispatch-btn--ghost" data-action="veh-status" data-vehicle="${v.id}" title="Сменить статус">Статус</button>
          <button class="dispatch-btn dispatch-btn--ghost" data-action="veh-card" data-vehicle="${v.id}" title="Карточка">Карточка</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="10" class="dispatch-table__muted">Нет строк по заданным фильтрам.</td>`;
    tbody.appendChild(tr);
  }
}

function renderOrders(state) {
  const { search, orderPriority, onlyCritical } = getFilters();
  const tbody = el("orders-tbody");
  tbody.innerHTML = "";

  const orders = state.orders
    .slice()
    .filter((o) => (orderPriority === "all" ? true : o.priority === orderPriority))
    .filter((o) => (onlyCritical ? o.priority === "P1" : true))
    .filter((o) => matchesSearch(state, search, o))
    .sort((a, b) => b.createdAt - a.createdAt);

  for (const o of orders) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${o.id}</strong></td>
      <td><span class="${badgeClassForPriority(o.priority)}">${o.priority}</span></td>
      <td>${o.route}</td>
      <td>${o.tons}</td>
      <td><span class="${pillClassForOrder(o.status)}">${orderStatusLabel(o.status)}</span></td>
      <td>${o.assignedVehicleId ? `<strong>${vehicleBoard(state, o.assignedVehicleId)}</strong>` : "—"}</td>
      <td class="dispatch-table__muted">${formatDateTime(o.createdAt)}</td>
      <td>
        <div class="dispatch-rowbtns">
          <button class="dispatch-btn dispatch-btn--ghost" data-action="assign" data-order="${o.id}">Назначить</button>
          <button class="dispatch-btn dispatch-btn--ghost" data-action="order-cancel" data-order="${o.id}">Отмена</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  if (orders.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8" class="dispatch-table__muted">Нет заявок по заданным фильтрам.</td>`;
    tbody.appendChild(tr);
  }
}

function renderTrips(state) {
  const { search, onlyCritical } = getFilters();
  const tbody = el("trips-tbody");
  tbody.innerHTML = "";

  const trips = state.trips
    .slice()
    .filter((t) => matchesSearch(state, search, t))
    .filter((t) => (onlyCritical ? t.status === "active" : true))
    .sort((a, b) => b.startAt - a.startAt);

  for (const t of trips) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${t.id}</strong></td>
      <td><strong>${vehicleBoard(state, t.vehicleId)}</strong></td>
      <td>${driverName(state, t.driverId)}</td>
      <td>${t.route}</td>
      <td>${t.tons}</td>
      <td><span class="${pillClassForTrip(t.status)}">${tripStatusLabel(t.status)}</span></td>
      <td class="dispatch-table__muted">${formatDateTime(t.startAt)}</td>
      <td class="dispatch-table__muted">${t.endAt ? formatDateTime(t.endAt) : "—"}</td>
      <td>
        <div class="dispatch-rowbtns">
          <button class="dispatch-btn dispatch-btn--ghost" data-action="trip-done" data-trip="${t.id}">Завершить</button>
          <button class="dispatch-btn dispatch-btn--ghost" data-action="trip-cancel" data-trip="${t.id}">Отмена</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  if (trips.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9" class="dispatch-table__muted">Нет рейсов по заданным фильтрам.</td>`;
    tbody.appendChild(tr);
  }
}

function renderLog(state) {
  const { search } = getFilters();
  const list = el("log-list");
  list.innerHTML = "";
  const items = state.log.filter((e) => matchesSearch(state, search, e)).slice(0, 120);
  for (const e of items) {
    const row = document.createElement("div");
    row.className = "dispatch-log__row";
    const level =
      e.level === "error" ? "Критично" : e.level === "warn" ? "Внимание" : "Инфо";
    row.innerHTML = `
      <div class="dispatch-log__time">${formatDateTime(e.at)} • ${level}</div>
      <div class="dispatch-log__msg">${e.message}</div>
      <div class="dispatch-log__meta">${e.meta ?? ""}</div>
    `;
    list.appendChild(row);
  }
  if (items.length === 0) {
    list.innerHTML = `<div class="dispatch-table__muted">Нет записей.</div>`;
  }
}

function renderAll(state) {
  renderClock();
  renderKpis(state);
  renderShiftMeta(state);
  renderPlanFact(state);
  renderOverview(state);
  renderFleet(state);
  renderOrders(state);
  renderTrips(state);
  renderLog(state);
}

function openModal(id) {
  el(id).classList.remove("is-hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  el(id).classList.add("is-hidden");
  const anyOpen = Array.from(document.querySelectorAll(".dispatch-modal")).some((m) => !m.classList.contains("is-hidden"));
  if (!anyOpen) document.body.style.overflow = "auto";
}

function closeAllModals() {
  document.querySelectorAll(".dispatch-modal").forEach((m) => m.classList.add("is-hidden"));
  document.body.style.overflow = "auto";
}

function populateTripForm(state, preselectOrderId) {
  /** @type {HTMLSelectElement} */
  const orderSel = el("trip-order");
  /** @type {HTMLSelectElement} */
  const vehSel = el("trip-vehicle");
  /** @type {HTMLSelectElement} */
  const drvSel = el("trip-driver");
  /** @type {HTMLInputElement} */
  const tonsInp = el("trip-tons");
  /** @type {HTMLInputElement} */
  const noteInp = el("trip-note");

  orderSel.innerHTML = "";
  vehSel.innerHTML = "";
  drvSel.innerHTML = "";
  noteInp.value = "";

  const availableOrders = state.orders.filter((o) => o.status === "new" || o.status === "assigned");
  for (const o of availableOrders) {
    const opt = document.createElement("option");
    opt.value = o.id;
    opt.textContent = `${o.id} • ${o.priority} • ${o.route} • ${o.tons} т`;
    orderSel.appendChild(opt);
  }

  const eligibleVehicles = state.vehicles.filter((v) => v.status !== "repair");
  for (const v of eligibleVehicles) {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = `${v.board} • ${statusLabel(v.status)} • топл. ${v.fuelPct}%`;
    vehSel.appendChild(opt);
  }

  for (const d of state.drivers) {
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = `${d.name} (${d.phone})`;
    drvSel.appendChild(opt);
  }

  // Defaults
  if (preselectOrderId && availableOrders.some((o) => o.id === preselectOrderId)) {
    orderSel.value = preselectOrderId;
  }

  const order = findOrder(state, orderSel.value) ?? availableOrders[0] ?? null;
  tonsInp.value = order ? String(order.tons) : "60";

  // Prefer a free vehicle with ok fuel
  const preferred = eligibleVehicles
    .slice()
    .sort((a, b) => {
      const aScore = (a.status === "queue" ? 0 : 1) + (a.fuelPct < 25 ? 5 : 0) + (isCriticalVehicle(a) ? 2 : 0);
      const bScore = (b.status === "queue" ? 0 : 1) + (b.fuelPct < 25 ? 5 : 0) + (isCriticalVehicle(b) ? 2 : 0);
      return aScore - bScore;
    })[0];
  if (preferred) vehSel.value = preferred.id;

  const v = findVehicle(state, vehSel.value);
  if (v?.driverId) drvSel.value = v.driverId;
}

function openTripModal(state, orderId) {
  populateTripForm(state, orderId || undefined);
  openModal("modal-trip");
  setTimeout(() => el("trip-order").focus(), 0);
}

function openOrderModal() {
  /** @type {HTMLInputElement} */ (el("order-tons")).value = "60";
  /** @type {HTMLInputElement} */ (el("order-comment")).value = "";
  openModal("modal-order");
  setTimeout(() => el("order-priority").focus(), 0);
}

function openVehicleModal(state, vehicleId) {
  const v = findVehicle(state, vehicleId);
  if (!v) return;
  const wrap = el("vehicle-details");
  const d = v.driverId ? state.drivers.find((x) => x.id === v.driverId) : null;
  wrap.innerHTML = `
    <div class="dispatch-details__title">${v.board} • ${v.type}</div>
    <div class="dispatch-details__grid">
      <div class="dispatch-details__item"><div class="dispatch-details__k">Статус</div><div class="dispatch-details__v">${statusLabel(v.status)}</div></div>
      <div class="dispatch-details__item"><div class="dispatch-details__k">Локация</div><div class="dispatch-details__v">${v.location}</div></div>
      <div class="dispatch-details__item"><div class="dispatch-details__k">Водитель</div><div class="dispatch-details__v">${d ? d.name : "—"}</div></div>
      <div class="dispatch-details__item"><div class="dispatch-details__k">Телефон</div><div class="dispatch-details__v">${d ? d.phone : "—"}</div></div>
      <div class="dispatch-details__item"><div class="dispatch-details__k">Топливо</div><div class="dispatch-details__v">${v.fuelPct}%</div></div>
      <div class="dispatch-details__item"><div class="dispatch-details__k">Груз</div><div class="dispatch-details__v">${v.payloadTons} т</div></div>
      <div class="dispatch-details__item"><div class="dispatch-details__k">ETA</div><div class="dispatch-details__v">${v.etaMin == null ? "—" : `${v.etaMin} мин`}</div></div>
      <div class="dispatch-details__item"><div class="dispatch-details__k">Обновлено</div><div class="dispatch-details__v">${formatDateTime(v.updatedAt)}</div></div>
    </div>
    ${v.note ? `<div class="dispatch-details__item"><div class="dispatch-details__k">Примечание</div><div class="dispatch-details__v">${v.note}</div></div>` : ""}
  `;
  openModal("modal-vehicle");
}

function cycleVehicleStatus(v) {
  const order = ["queue", "loading", "on_line", "fuel", "repair"];
  const idx = order.indexOf(v.status);
  const next = order[(idx + 1) % order.length];
  v.status = next;
  v.updatedAt = now();
  v.critical = isCriticalVehicle(v);
}

function assignTripFromForm(state) {
  /** @type {HTMLSelectElement} */
  const orderSel = el("trip-order");
  /** @type {HTMLSelectElement} */
  const vehSel = el("trip-vehicle");
  /** @type {HTMLSelectElement} */
  const drvSel = el("trip-driver");
  /** @type {HTMLInputElement} */
  const tonsInp = el("trip-tons");
  /** @type {HTMLInputElement} */
  const noteInp = el("trip-note");

  const orderId = orderSel.value;
  const vehicleId = vehSel.value;
  const driverId = drvSel.value;
  const tons = clamp(parseInt(tonsInp.value, 10) || 0, 1, 999);
  const note = String(noteInp.value || "").trim();

  const o = findOrder(state, orderId);
  const v = findVehicle(state, vehicleId);
  if (!o || !v) return;

  // Update order
  o.status = "assigned";
  o.assignedVehicleId = vehicleId;

  // Update vehicle
  v.driverId = driverId;
  v.payloadTons = 0;
  v.location = o.route.includes("Карьер") ? "Площадка погрузки" : "Пункт назначения";
  v.etaMin = 18;
  v.updatedAt = now();

  // Create trip
  /** @type {Trip} */
  const trip = {
    id: uid("T"),
    orderId: o.id,
    vehicleId: v.id,
    driverId,
    route: o.route,
    tons,
    status: "active",
    startAt: now(),
    endAt: null,
    note: note || undefined,
  };
  state.trips.unshift(trip);

  // Move order into progress
  o.status = "in_progress";

  addLog(state, "info", `Назначен рейс ${trip.id}`, `${v.board} • ${driverName(state, driverId)} • ${o.route} • ${tons} т`);

  // Persist
  saveState(state);
}

function createOrderFromForm(state) {
  /** @type {HTMLSelectElement} */ const pr = el("order-priority");
  /** @type {HTMLSelectElement} */ const route = el("order-route");
  /** @type {HTMLInputElement} */ const tons = el("order-tons");
  /** @type {HTMLInputElement} */ const comment = el("order-comment");

  const o = {
    id: uid("O"),
    priority: /** @type {'P1'|'P2'|'P3'} */ (pr.value),
    route: route.value,
    tons: clamp(parseInt(tons.value, 10) || 0, 1, 999),
    status: "new",
    assignedVehicleId: null,
    createdAt: now(),
    comment: String(comment.value || "").trim() || undefined,
  };
  state.orders.unshift(o);
  addLog(state, o.priority === "P1" ? "warn" : "info", `Создана заявка ${o.id}`, `${o.priority} • ${o.route} • ${o.tons} т`);
  saveState(state);
}

function markTripDone(state, tripId) {
  const t = state.trips.find((x) => x.id === tripId);
  if (!t || t.status !== "active") return;
  t.status = "done";
  t.endAt = now();

  const v = findVehicle(state, t.vehicleId);
  if (v) {
    v.payloadTons = 0;
    v.location = "Перегруз/Склад";
    v.etaMin = null;
    v.updatedAt = now();
    // Slight fuel consumption simulation
    v.fuelPct = clamp(v.fuelPct - (5 + Math.floor(Math.random() * 8)), 0, 100);
    v.critical = isCriticalVehicle(v);
  }

  const o = findOrder(state, t.orderId);
  if (o) {
    o.status = "done";
  }

  addLog(state, "info", `Рейс ${t.id} завершен`, `${vehicleBoard(state, t.vehicleId)} • ${t.route} • ${t.tons} т`);
  saveState(state);
}

function cancelTrip(state, tripId) {
  const t = state.trips.find((x) => x.id === tripId);
  if (!t || t.status !== "active") return;
  t.status = "cancelled";
  t.endAt = now();
  addLog(state, "warn", `Рейс ${t.id} отменен`, `${vehicleBoard(state, t.vehicleId)} • ${t.route}`);
  saveState(state);
}

function cancelOrder(state, orderId) {
  const o = findOrder(state, orderId);
  if (!o || o.status === "done" || o.status === "cancelled") return;
  o.status = "cancelled";
  addLog(state, "warn", `Заявка ${o.id} отменена`, `${o.priority} • ${o.route} • ${o.tons} т`);
  saveState(state);
}

function bindEvents(state) {
  // Tabs
  document.querySelectorAll(".dispatch-nav__item").forEach((b) => {
    b.addEventListener("click", () => setActiveTab(b.getAttribute("data-tab")));
  });

  // Modal close
  document.addEventListener("click", (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    const closeId = t.getAttribute("data-close");
    if (closeId) closeModal(closeId);
  });

  // Escape to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });

  // Actions: top buttons
  el("btn-new-trip").addEventListener("click", () => openTripModal(state));
  el("btn-new-order").addEventListener("click", () => openOrderModal());
  el("btn-reset-demo").addEventListener("click", () => {
    resetState(state);
    addLog(state, "warn", "Демо-данные сброшены", "Состояние восстановлено по умолчанию");
    saveState(state);
    renderAll(state);
    setConnectionState("warn");
    setTimeout(() => setConnectionState("ok"), 700);
  });

  // Search
  el("clear-search").addEventListener("click", () => {
    el("global-search").value = "";
    renderAll(state);
  });

  ["global-search", "fleet-status-filter", "order-priority-filter", "only-critical"].forEach((id) => {
    el(id).addEventListener("input", () => renderAll(state));
    el(id).addEventListener("change", () => renderAll(state));
  });

  // Persist settings
  el("shift-select").addEventListener("change", () => {
    state.settings.shift = /** @type {'day'|'night'} */ (el("shift-select").value);
    addLog(state, "info", "Смена изменена", state.settings.shift === "day" ? "День" : "Ночь");
    saveState(state);
    renderAll(state);
  });

  el("dispatcher-name").addEventListener("input", () => {
    state.settings.dispatcherName = String(el("dispatcher-name").value || "").trim() || "—";
    saveState(state);
  });

  // Hotkeys
  document.addEventListener("keydown", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
    if (e.key === "/" && !isInput) {
      e.preventDefault();
      el("global-search").focus();
    }
    if ((e.key === "n" || e.key === "N") && !isInput) {
      openOrderModal();
    }
    if ((e.key === "t" || e.key === "T") && !isInput) {
      openTripModal(state);
    }
  });

  // Forms
  el("trip-form").addEventListener("submit", (e) => {
    e.preventDefault();
    assignTripFromForm(state);
    closeModal("modal-trip");
    setConnectionState("ok");
    renderAll(state);
  });

  el("order-form").addEventListener("submit", (e) => {
    e.preventDefault();
    createOrderFromForm(state);
    closeModal("modal-order");
    setConnectionState("ok");
    renderAll(state);
  });

  // Delegated table/list actions
  document.addEventListener("click", (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    const action = t.getAttribute("data-action");
    if (!action) return;

    if (action === "assign") {
      const orderId = t.getAttribute("data-order");
      if (orderId) openTripModal(state, orderId);
    }

    if (action === "veh-card") {
      const vehicleId = t.getAttribute("data-vehicle");
      if (vehicleId) openVehicleModal(state, vehicleId);
    }

    if (action === "veh-status") {
      const vehicleId = t.getAttribute("data-vehicle");
      const v = vehicleId ? findVehicle(state, vehicleId) : null;
      if (v) {
        const before = v.status;
        cycleVehicleStatus(v);
        addLog(state, v.status === "repair" ? "warn" : "info", `Статус техники ${v.board}: ${statusLabel(before)} → ${statusLabel(v.status)}`, v.location);
        saveState(state);
        renderAll(state);
      }
    }

    if (action === "trip-done") {
      const tripId = t.getAttribute("data-trip");
      if (tripId) {
        markTripDone(state, tripId);
        renderAll(state);
        setConnectionState("ok");
      }
    }

    if (action === "trip-cancel") {
      const tripId = t.getAttribute("data-trip");
      if (tripId) {
        cancelTrip(state, tripId);
        renderAll(state);
        setConnectionState("warn");
        setTimeout(() => setConnectionState("ok"), 650);
      }
    }

    if (action === "order-cancel") {
      const orderId = t.getAttribute("data-order");
      if (orderId) {
        cancelOrder(state, orderId);
        renderAll(state);
        setConnectionState("warn");
        setTimeout(() => setConnectionState("ok"), 650);
      }
    }
  });
}

function init() {
  /** @type {DispatchState} */
  const state = loadState();

  // Apply persisted settings to UI
  el("shift-select").value = state.settings.shift;
  el("dispatcher-name").value = state.settings.dispatcherName;

  setConnectionState("ok");
  renderAll(state);
  setActiveTab("overview");

  bindEvents(state);

  // Clock tick
  setInterval(() => {
    renderClock();
  }, 1000);

  // Light “telemetry” simulation (update timestamps, small random changes)
  setInterval(() => {
    const v = state.vehicles[Math.floor(Math.random() * state.vehicles.length)];
    if (!v) return;
    if (v.status === "repair") return;
    v.updatedAt = now();
    if (v.status === "on_line") {
      v.etaMin = clamp((v.etaMin ?? 20) - 1, 3, 120);
      v.payloadTons = clamp(v.payloadTons + (Math.random() < 0.25 ? 5 : 0), 0, 80);
    }
    if (v.fuelPct > 0 && Math.random() < 0.2) v.fuelPct = clamp(v.fuelPct - 1, 0, 100);
    v.critical = isCriticalVehicle(v);
    saveState(state);
    renderKpis(state);
  }, 6000);
}

document.addEventListener("DOMContentLoaded", init);

