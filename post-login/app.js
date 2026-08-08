/* =========================================================================
   Repair Partner — Customer Dashboard
   Shared application script. Provides:
   - RP namespace: dummy "backend" (categories, items, repairs, user,
     addresses, notifications) persisted to localStorage
   - Shell behaviors: sidebar, topbar popovers, active-link highlighting
   - Reusable UI helpers: toast(), openModal()/closeModal(), statusMeta(),
     formatDate(), formatMoney(), timeAgo(), uid()
   Vanilla JS only. Include this file on every dashboard page, then call
   RP.initShell() once the DOM is ready.
   ========================================================================= */

(function (global) {
  "use strict";

  /* ---------------------------------------------------------------------
     Seed / dummy data
     --------------------------------------------------------------------- */

  const CATEGORIES = [
    { id: "kitchen", name: "Kitchen Appliances", desc: "Mixers, chimneys, microwaves", icon: "kitchen" },
    { id: "home", name: "Home Appliances", desc: "Washing machines, ACs, geysers", icon: "home" },
    { id: "audio", name: "Audio Devices", desc: "Speakers, headphones", icon: "audio" },
    { id: "power-tools", name: "Power Tools", desc: "Drills, grinders, saws", icon: "tool" },
    { id: "electrical", name: "Electrical Items", desc: "Switchboards, inverters", icon: "bolt" },
    { id: "watches", name: "Watches & Clocks", desc: "Straps, batteries, movements", icon: "clock" },
  ];

  const ITEMS = {
    kitchen: ["Mixer Grinder", "Chimney", "Microwave Oven", "Induction Cooktop", "Electric Kettle", "Toaster"],
    home: ["Washing Machine", "Split AC", "Window AC", "Geyser / Water Heater", "Refrigerator", "Water Purifier"],
    audio: ["Bluetooth Speaker", "Headphones", "Home Theatre System", "Soundbar", "Wired Earphones"],
    "power-tools": ["Drill Machine", "Angle Grinder", "Circular Saw", "Jigsaw", "Hedge Trimmer"],
    electrical: ["Switchboard", "Inverter", "Stabilizer", "Extension Board", "Ceiling Fan"],
    watches: ["Analog Watch", "Smart Watch", "Wall Clock", "Table Clock"],
  };

  const STATUS_FLOW = [
    "Submitted",
    "Ready for Pickup",
    "Picked Up",
    "Repair in Progress",
    "Ready for Delivery",
    "Out for Delivery",
    "Payment Received",
    "Delivered",
  ];

  const DEFAULT_USER = {
    name: "Ananya Kulkarni",
    email: "ananya.kulkarni@example.com",
    phone: "+91 98220 11223",
    memberSince: "Jan 2025",
    addresses: [
      {
        id: "addr-1",
        label: "Home",
        name: "Ananya Kulkarni",
        mobile: "+91 98220 11223",
        address: "B-402, Sunrise Residency, Baner Road, Pune, Maharashtra 411045",
        isDefault: true,
      },
      {
        id: "addr-2",
        label: "Office",
        name: "Ananya Kulkarni",
        mobile: "+91 98220 11223",
        address: "3rd Floor, Weikfield IT Park, Nagar Road, Pune, Maharashtra 411014",
        isDefault: false,
      },
    ],
    notifSettings: {
      bookingUpdates: true,
      technicianAssigned: true,
      deliveryUpdates: true,
      promotions: false,
      smsAlerts: true,
      emailAlerts: true,
    },
  };

  function seedRepairs() {
    const now = Date.now();
    const day = 86400000;
    return [
      {
        id: "RP-284510",
        category: "home",
        categoryName: "Home Appliances",
        item: "Washing Machine",
        brand: "LG 7kg Front Load",
        issue: "Drum makes a loud grinding noise during spin cycle and doesn't drain properly.",
        status: "Repair in Progress",
        createdAt: now - 2 * day,
        pickupDate: fmtISODate(now - 1 * day),
        pickupSlot: "10:00 AM – 12:00 PM",
        address: DEFAULT_USER.addresses[0],
        estimatedCost: 1450,
        technicianNotes: "Diagnosed a worn drain pump and bearing assembly. Replacement parts ordered, ETA 1 day.",
        images: [],
        timeline: buildTimeline(3, now - 2 * day),
      },
      {
        id: "RP-284322",
        category: "audio",
        categoryName: "Audio Devices",
        item: "Bluetooth Speaker",
        brand: "JBL Flip 6",
        issue: "Speaker doesn't turn on. Charging light doesn't come on either.",
        status: "Out for Delivery",
        createdAt: now - 5 * day,
        pickupDate: fmtISODate(now - 4 * day),
        pickupSlot: "2:00 PM – 4:00 PM",
        address: DEFAULT_USER.addresses[0],
        estimatedCost: 890,
        technicianNotes: "Replaced the charging IC and internal battery. Tested for 2 hours of continuous playback — working fine.",
        images: [],
        timeline: buildTimeline(7, now - 5 * day),
      },
      {
        id: "RP-283980",
        category: "kitchen",
        categoryName: "Kitchen Appliances",
        item: "Mixer Grinder",
        brand: "Preethi Zodiac",
        issue: "Motor runs but jars don't spin. Possible coupler issue.",
        status: "Delivered",
        createdAt: now - 12 * day,
        pickupDate: fmtISODate(now - 11 * day),
        pickupSlot: "9:00 AM – 11:00 AM",
        address: DEFAULT_USER.addresses[1],
        estimatedCost: 420,
        technicianNotes: "Replaced worn plastic coupler on all three jars. Motor bearing greased and tested.",
        images: [],
        timeline: buildTimeline(9, now - 12 * day),
      },
      {
        id: "RP-283711",
        category: "power-tools",
        categoryName: "Power Tools",
        item: "Drill Machine",
        brand: "Bosch GSB 500W",
        issue: "Chuck won't tighten and drill overheats after 5 minutes of use.",
        status: "Cancelled",
        createdAt: now - 18 * day,
        pickupDate: fmtISODate(now - 17 * day),
        pickupSlot: "11:00 AM – 1:00 PM",
        address: DEFAULT_USER.addresses[0],
        estimatedCost: 0,
        technicianNotes: "Customer cancelled the request before pickup — decided to replace the unit instead.",
        images: [],
        timeline: buildCancelledTimeline(now - 18 * day),
      },
      {
        id: "RP-284601",
        category: "electrical",
        categoryName: "Electrical Items",
        item: "Inverter",
        brand: "Luminous Zelio+ 1100",
        issue: "Beeps continuously and doesn't switch to battery backup during a power cut.",
        status: "Ready for Pickup",
        createdAt: now - 0.5 * day,
        pickupDate: fmtISODate(now + 1 * day),
        pickupSlot: "4:00 PM – 6:00 PM",
        address: DEFAULT_USER.addresses[0],
        estimatedCost: null,
        technicianNotes: "",
        images: [],
        timeline: buildTimeline(1, now - 0.5 * day),
      },
      {
        id: "RP-282990",
        category: "home",
        categoryName: "Home Appliances",
        item: "Split AC",
        brand: "Daikin 1.5 Ton",
        issue: "Cooling has reduced significantly and there's water leakage from the indoor unit.",
        status: "Delivered",
        createdAt: now - 26 * day,
        pickupDate: fmtISODate(now - 25 * day),
        pickupSlot: "10:00 AM – 12:00 PM",
        address: DEFAULT_USER.addresses[0],
        estimatedCost: 2100,
        technicianNotes: "Gas top-up done, drain pipe cleared of blockage, and filters deep-cleaned.",
        images: [],
        timeline: buildTimeline(9, now - 26 * day),
      },
    ];
  }

  function fmtISODate(ms) {
    const d = new Date(ms);
    return d.toISOString().slice(0, 10);
  }

  function buildTimeline(reachedIndex, startedAt) {
    const day = 86400000;
    return STATUS_FLOW.map((label, i) => {
      if (i < reachedIndex) return { label, state: "done", at: startedAt + i * day * 0.6 };
      if (i === reachedIndex) return { label, state: "current", at: startedAt + i * day * 0.6 };
      return { label, state: "pending", at: null };
    });
  }

  function buildCancelledTimeline(startedAt) {
    const day = 86400000;
    return [
      { label: "Submitted", state: "done", at: startedAt },
      { label: "Ready for Pickup", state: "done", at: startedAt + 0.4 * day },
      { label: "Cancelled", state: "cancelled", at: startedAt + 0.8 * day },
    ];
  }

  function seedNotifications() {
    const now = Date.now();
    const hr = 3600000;
    return [
      { id: "n1", icon: "wrench", text: "Your Washing Machine repair (RP-284510) is now in progress.", at: now - 2 * hr, read: false },
      { id: "n2", icon: "truck", text: "Your Bluetooth Speaker (RP-284322) is out for delivery today.", at: now - 5 * hr, read: false },
      { id: "n3", icon: "check", text: "Mixer Grinder (RP-283980) was delivered successfully.", at: now - 26 * hr, read: true },
      { id: "n4", icon: "calendar", text: "Pickup scheduled for your Inverter (RP-284601) tomorrow, 4–6 PM.", at: now - 30 * hr, read: true },
      { id: "n5", icon: "tag", text: "Get 15% off your next bulk repair request this month.", at: now - 4 * 24 * hr, read: true },
    ];
  }

  /* ---------------------------------------------------------------------
     Storage layer (localStorage-backed, seeded once)
     --------------------------------------------------------------------- */

  const KEYS = {
    repairs: "rp_repairs",
    user: "rp_user",
    notifications: "rp_notifications",
    bulkRequests: "rp_bulk_requests",
    seeded: "rp_seeded_v1",
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("RP storage write failed:", e);
      return false;
    }
  }

  function ensureSeeded() {
    if (readJSON(KEYS.seeded, false)) return;
    writeJSON(KEYS.repairs, seedRepairs());
    writeJSON(KEYS.user, DEFAULT_USER);
    writeJSON(KEYS.notifications, seedNotifications());
    writeJSON(KEYS.bulkRequests, []);
    writeJSON(KEYS.seeded, true);
  }
  ensureSeeded();

  function uid(prefix) {
    const n = Math.floor(100000 + Math.random() * 900000);
    return (prefix || "RP") + "-" + n;
  }

  /* ---------------------------------------------------------------------
     Public data API
     --------------------------------------------------------------------- */

  const RP = {
    categories: CATEGORIES,
    items: ITEMS,
    statusFlow: STATUS_FLOW,

    getUser() { return readJSON(KEYS.user, DEFAULT_USER); },
    saveUser(user) { writeJSON(KEYS.user, user); },

    getRepairs() {
      return readJSON(KEYS.repairs, []).sort((a, b) => b.createdAt - a.createdAt);
    },
    getRepairById(id) {
      return this.getRepairs().find((r) => r.id === id) || null;
    },
    addRepair(repair) {
      const list = readJSON(KEYS.repairs, []);
      list.unshift(repair);
      writeJSON(KEYS.repairs, list);
      return repair;
    },
    updateRepair(id, patch) {
      const list = readJSON(KEYS.repairs, []);
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      list[idx] = Object.assign({}, list[idx], patch);
      writeJSON(KEYS.repairs, list);
      return list[idx];
    },
    cancelRepair(id) {
      return this.updateRepair(id, {
        status: "Cancelled",
        timeline: (this.getRepairById(id).timeline || []).map((t) =>
          t.state === "done" ? t : { label: t.label, state: "pending", at: null }
        ).slice(0, 2).concat([{ label: "Cancelled", state: "cancelled", at: Date.now() }]),
      });
    },

    getNotifications() {
      return readJSON(KEYS.notifications, []).sort((a, b) => b.at - a.at);
    },
    unreadNotifCount() {
      return this.getNotifications().filter((n) => !n.read).length;
    },
    markAllNotifsRead() {
      const list = readJSON(KEYS.notifications, []).map((n) => Object.assign({}, n, { read: true }));
      writeJSON(KEYS.notifications, list);
    },
    addNotification(n) {
      const list = readJSON(KEYS.notifications, []);
      list.unshift(Object.assign({ id: "n" + Date.now(), at: Date.now(), read: false }, n));
      writeJSON(KEYS.notifications, list);
    },

    addBulkRequest(req) {
      const list = readJSON(KEYS.bulkRequests, []);
      list.unshift(req);
      writeJSON(KEYS.bulkRequests, list);
      return req;
    },
    getBulkRequests() {
      return readJSON(KEYS.bulkRequests, []);
    },

    newBookingId() { return uid("RP"); },

    logout() {
      openConfirmLogout();
    },
  };

  /* ---------------------------------------------------------------------
     Formatters
     --------------------------------------------------------------------- */

  function formatDate(input, opts) {
    const d = typeof input === "string" ? new Date(input) : new Date(input);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", opts || { day: "numeric", month: "short", year: "numeric" });
  }
  function formatDateTime(ms) {
    const d = new Date(ms);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", " +
      d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
  function formatMoney(n) {
    if (n === null || n === undefined) return "Pending quote";
    return "₹" + Number(n).toLocaleString("en-IN");
  }
  function timeAgo(ms) {
    const s = Math.floor((Date.now() - ms) / 1000);
    if (s < 60) return "Just now";
    const m = Math.floor(s / 60);
    if (m < 60) return m + " min ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + " hr ago";
    const d = Math.floor(h / 24);
    if (d < 7) return d + " day" + (d > 1 ? "s" : "") + " ago";
    return formatDate(ms);
  }

  const STATUS_META = {
    "Submitted": { cls: "badge-grey", dotColor: "var(--ink-faint)" },
    "Ready for Pickup": { cls: "badge-blue" },
    "Picked Up": { cls: "badge-blue" },
    "Repair in Progress": { cls: "badge-amber" },
    "Ready for Delivery": { cls: "badge-violet" },
    "At Delivery Partner": { cls: "badge-violet" },
    "Confirmation Required": { cls: "badge-amber" },
    "Out for Delivery": { cls: "badge-teal" },
    "Payment Received": { cls: "badge-teal" },
    "Delivered": { cls: "badge-green" },
    "Cancelled": { cls: "badge-red" },
  };
  function statusMeta(status) {
    return STATUS_META[status] || { cls: "badge-grey" };
  }
  function statusBadgeHTML(status) {
    const m = statusMeta(status);
    return '<span class="badge ' + m.cls + '"><span class="badge-dot"></span>' + status + "</span>";
  }
  function isActiveStatus(status) {
    return status !== "Delivered" && status !== "Cancelled";
  }

  /* ---------------------------------------------------------------------
     Toast
     --------------------------------------------------------------------- */

  function ensureToastStack() {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }

  const TOAST_ICONS = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  function toast(message, type) {
    type = type || "info";
    const stack = ensureToastStack();
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.innerHTML = '<span class="toast-ic">' + (TOAST_ICONS[type] || TOAST_ICONS.info) + "</span><span>" + message + "</span>";
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 220);
    }, 3200);
  }

  /* ---------------------------------------------------------------------
     Modal helpers (works with a <div class="modal-overlay" id="...">)
     --------------------------------------------------------------------- */

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("open");
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("open");
  }

  function openConfirmLogout() {
    let overlay = document.getElementById("rp-logout-modal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.id = "rp-logout-modal";
      overlay.innerHTML =
        '<div class="modal-box">' +
        '<div class="modal-icon sq-red icon-sq"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
        "<h3>Log out of Repair Partner?</h3>" +
        "<p>You'll need to sign in again to book or track repairs.</p>" +
        '<div class="modal-actions">' +
        '<button class="btn btn-secondary" onclick="RP.closeModal(\'rp-logout-modal\')">Cancel</button>' +
        '<button class="btn btn-danger-solid" onclick="RP.confirmLogout()">Log Out</button>' +
        "</div></div>";
      document.body.appendChild(overlay);
    }
    openModal("rp-logout-modal");
  }
  function confirmLogout() {
    closeModal("rp-logout-modal");
    toast("Signed out. Redirecting to sign in…", "info");
    setTimeout(() => { window.location.href = "signin.html"; }, 700);
  }

  /* ---------------------------------------------------------------------
     Shell: sidebar, topbar popovers, active link, notif rendering
     --------------------------------------------------------------------- */

  function currentPage() {
    const p = window.location.pathname.split("/").pop();
    return p || "dashboard.html";
  }

  function highlightActiveNav() {
    const page = currentPage();
    document.querySelectorAll(".sidebar-link[data-page]").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("data-page") === page);
    });
  }

  function initSidebarToggle() {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    const openBtn = document.querySelector(".topbar-menu-btn");
    const closeBtn = document.querySelector(".sidebar-close");
    function open() { sidebar && sidebar.classList.add("open"); overlay && overlay.classList.add("open"); }
    function close() { sidebar && sidebar.classList.remove("open"); overlay && overlay.classList.remove("open"); }
    openBtn && openBtn.addEventListener("click", open);
    closeBtn && closeBtn.addEventListener("click", close);
    overlay && overlay.addEventListener("click", close);
    document.querySelectorAll(".sidebar-link").forEach((a) => a.addEventListener("click", close));
  }

  function initPopovers() {
    const triggers = document.querySelectorAll("[data-popover-trigger]");
    triggers.forEach((trigger) => {
      const targetId = trigger.getAttribute("data-popover-trigger");
      const pop = document.getElementById(targetId);
      if (!pop) return;
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = pop.classList.contains("open");
        document.querySelectorAll(".popover.open").forEach((p) => p.classList.remove("open"));
        if (!isOpen) pop.classList.add("open");
      });
    });
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".popover.open").forEach((p) => {
        if (!p.contains(e.target)) p.classList.remove("open");
      });
    });
  }

  function renderNotifBell() {
    const dot = document.querySelector("[data-notif-dot]");
    const count = RP.unreadNotifCount();
    if (dot) dot.style.display = count > 0 ? "block" : "none";
    const body = document.querySelector("[data-notif-body]");
    if (!body) return;
    const list = RP.getNotifications().slice(0, 6);
    if (list.length === 0) {
      body.innerHTML = '<div class="empty-state"><p>You\'re all caught up — no notifications yet.</p></div>';
      return;
    }
    body.innerHTML = list.map((n) => (
      '<div class="notif-item ' + (n.read ? "" : "unread") + '">' +
      '<div class="notif-dot-icon">' + notifIcon(n.icon) + "</div>" +
      '<div class="notif-text"><p>' + n.text + "</p><span>" + timeAgo(n.at) + "</span></div>" +
      "</div>"
    )).join("");
  }

  function notifIcon(name) {
    const icons = {
      wrench: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 005.4-5.4l-2.3 2.3-2-2 2.3-2.3z" stroke-width="1.6" stroke-linejoin="round"/></svg>',
      truck: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="12" height="9" rx="1" stroke-width="1.6"/><path d="M14 10h4l3 3v3h-7z" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.6" stroke-width="1.6"/><circle cx="17" cy="18" r="1.6" stroke-width="1.6"/></svg>',
      check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke-width="1.6"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke-width="1.6"/><path d="M3 10h18M8 3v4M16 3v4" stroke-width="1.6" stroke-linecap="round"/></svg>',
      tag: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 12l-8 8-9-9V4h7l10 8z" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7.5" cy="7.5" r="1.4" stroke-width="1.6"/></svg>',
    };
    return icons[name] || icons.check;
  }

  function initMarkAllRead() {
    const btn = document.querySelector("[data-notif-mark-all]");
    btn && btn.addEventListener("click", () => {
      RP.markAllNotifsRead();
      renderNotifBell();
      toast("All notifications marked as read.", "success");
    });
  }

  function renderUserChips() {
    const user = RP.getUser();
    document.querySelectorAll("[data-user-name]").forEach((el) => (el.textContent = user.name));
    document.querySelectorAll("[data-user-email]").forEach((el) => (el.textContent = user.email));
    document.querySelectorAll("[data-user-initials]").forEach((el) => (el.textContent = initials(user.name)));
  }
  function initials(name) {
    return (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }

  function initShell() {
    highlightActiveNav();
    initSidebarToggle();
    renderAccountPopover();
    initPopovers();
    renderNotifBell();
    initMarkAllRead();
    renderUserChips();
  }

  /* ---------------------------------------------------------------------
     Expose
     --------------------------------------------------------------------- */

  RP.uid = uid;
  RP.formatDate = formatDate;
  RP.formatDateTime = formatDateTime;
  RP.formatMoney = formatMoney;
  RP.timeAgo = timeAgo;
  RP.statusMeta = statusMeta;
  RP.statusBadgeHTML = statusBadgeHTML;
  RP.isActiveStatus = isActiveStatus;
  RP.toast = toast;
  RP.openModal = openModal;
  RP.closeModal = closeModal;
  RP.confirmLogout = confirmLogout;
  RP.initShell = initShell;
  RP.renderNotifBell = renderNotifBell;
  RP.initials = initials;

  /* -----------------------------------------------------------------
     Shared "account" popover — same header + menu everywhere.
     On profile.html this switches tabs in place; on every other page
     the same items are plain links to profile.html#tab, so the menu
     you get from the top-right avatar is identical across the app.
     ----------------------------------------------------------------- */
  function accountPopoverHTML(user, opts) {
    opts = opts || {};
    const onProfilePage = !!opts.onProfilePage;
    const tabHref = (tab) => (onProfilePage ? "javascript:void(0)" : "profile.html#" + tab);
    const tabAttrs = (tab) =>
      (onProfilePage ? ' onclick="RP.setProfileTab(\'' + tab + '\')" data-tab="' + tab + '"'
                      : ' onclick="RP.closeAllPopovers()"');
    return (
      '<div class="account-pop-head">' +
        '<div><b>' + user.name + '</b><span>' + user.email + '</span></div>' +
      '</div>' +
      '<nav class="menu-list profile-nav">' +
        '<a href="' + tabHref("personal") + '" class="menu-item profile-nav-item active"' + tabAttrs("personal") + '>' +
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke-width="1.7"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke-width="1.7" stroke-linecap="round"/></svg>Personal Information</a>' +
        '<a href="' + tabHref("addresses") + '" class="menu-item profile-nav-item"' + tabAttrs("addresses") + '>' +
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.1 7-11.5A7 7 0 005 9.5C5 14.9 12 21 12 21z" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.4" stroke-width="1.7"/></svg>Saved Addresses</a>' +
        '<a href="' + tabHref("password") + '" class="menu-item profile-nav-item"' + tabAttrs("password") + '>' +
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="10" rx="2" stroke-width="1.7"/><path d="M8 10V7a4 4 0 018 0v3" stroke-width="1.7"/></svg>Change Password</a>' +
        '<a href="' + tabHref("notifications") + '" class="menu-item profile-nav-item"' + tabAttrs("notifications") + '>' +
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.7 21a2 2 0 01-3.4 0" stroke-width="1.7" stroke-linecap="round"/></svg>Notification Settings</a>' +
        '<div class="menu-divider"></div>' +
        '<a href="#" class="menu-item danger" onclick="RP.logout(); return false;"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 17l5-5-5-5M21 12H9" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>Logout</a>' +
      '</nav>'
    );
  }

  function renderAccountPopover() {
    const el = document.getElementById("userPopover");
    if (!el) return;
    const onProfilePage = /(^|\/)profile\.html$/.test(window.location.pathname);
    el.innerHTML = accountPopoverHTML(RP.getUser(), { onProfilePage: onProfilePage });
  }

  function closeAllPopovers() {
    document.querySelectorAll(".popover.open").forEach((p) => p.classList.remove("open"));
  }

  RP.renderAccountPopover = renderAccountPopover;
  RP.closeAllPopovers = closeAllPopovers;

  global.RP = RP;
})(window);

/* ---------- shell helpers ---------- */
  function toast(msg, type){ RP.toast(msg, type); }

  /* ---------- profile section navigation (top-right account popover) ---------- */
  function setProfileTab(tab){
    document.querySelectorAll('.profile-nav-item[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.profile-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
    RP.closeAllPopovers();
    history.replaceState(null, '', '#' + tab);
    window.scrollTo({ top:0, behavior:'smooth' });
  }
  RP.setProfileTab = setProfileTab;
