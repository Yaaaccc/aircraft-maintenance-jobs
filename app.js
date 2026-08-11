(function () {
  "use strict";

  var data = window.JOB_DATA;
  var TYPES = ["校招", "社招", "实习"];
  var REGIONS = ["中国大陆", "新加坡"];
  var CATEGORIES = ["航司", "维修企业", "发动机维修"];

  var state = {
    type: "全部",
    region: "全部",
    category: "全部",
    q: ""
  };

  function $(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function badgeClass(type) {
    if (type === "校招") return "xiao";
    if (type === "社招") return "she";
    if (type === "实习") return "shi";
    return "";
  }

  function renderChips(container, values, key) {
    var el = $(container);
    el.innerHTML = "";
    ["全部"].concat(values).forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (state[key] === v ? " active" : "");
      b.textContent = v;
      b.addEventListener("click", function () {
        state[key] = v;
        renderChips(container, values, key);
        renderJobs();
      });
      el.appendChild(b);
    });
  }

  function renderChannels(channels) {
    var box = document.createElement("div");
    box.className = "channels";
    channels.forEach(function (c) {
      if (c.url) {
        var a = document.createElement("a");
        a.className = "btn";
        a.href = c.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = c.label;
        box.appendChild(a);
      } else {
        var span = document.createElement("span");
        span.className = "chip-text";
        span.textContent = c.label;
        box.appendChild(span);
      }
    });
    return box;
  }

  function renderJob(job) {
    var card = document.createElement("article");
    card.className = "job-card";

    var badges = job.type.map(function (t) {
      return '<span class="badge ' + badgeClass(t) + '">' + escapeHtml(t) + "</span>";
    }).join("");
    badges += '<span class="badge region">' + escapeHtml(job.region) + "</span>";

    var reqs = job.requirements.map(function (r) {
      return "<li>" + escapeHtml(r) + "</li>";
    }).join("");

    var note = job.note ? '<p class="note">' + escapeHtml(job.note) : "";
    if (job.note && job.source) {
      note += ' · <a href="' + escapeHtml(job.source) + '" target="_blank" rel="noopener">信息来源</a>';
    }
    if (job.note) note += "</p>";

    card.innerHTML =
      '<div class="job-top">' +
        '<div class="company">' + escapeHtml(job.company) + "</div>" +
        '<div class="badges">' + badges + "</div>" +
      "</div>" +
      '<div class="job-title">' + escapeHtml(job.title) + "</div>" +
      '<div class="meta">' +
        "<span>📍 " + escapeHtml(job.locations) + "</span>" +
        "<span>🕒 更新：" + escapeHtml(job.updated) + "</span>" +
      "</div>" +
      '<ul class="requirements">' + reqs + "</ul>";

    card.appendChild(renderChannels(job.channels));
    card.insertAdjacentHTML("beforeend", note);
    return card;
  }

  function matches(job) {
    if (state.type !== "全部" && job.type.indexOf(state.type) === -1) return false;
    if (state.region !== "全部" && job.region !== state.region) return false;
    if (state.category !== "全部" && job.category !== state.category) return false;
    if (state.q) {
      var hay = (job.company + job.title + job.locations + job.requirements.join("")).toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function renderJobs() {
    var list = $("jobList");
    var filtered = data.positions
      .filter(matches)
      .sort(function (a, b) { return b.updated.localeCompare(a.updated); });

    $("resultCount").textContent = "共 " + filtered.length + " 个岗位";
    list.innerHTML = "";

    if (filtered.length === 0) {
      var empty = document.createElement("p");
      empty.className = "note";
      empty.style.textAlign = "center";
      empty.style.padding = "24px 0";
      empty.textContent = "没有符合条件的岗位，试试调整筛选条件。";
      list.appendChild(empty);
      return;
    }

    filtered.forEach(function (job) {
      list.appendChild(renderJob(job));
    });
  }

  function renderPortals() {
    var grid = $("portalList");
    data.portals.forEach(function (p) {
      var a = document.createElement("a");
      a.className = "portal-card";
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML = "<strong>" + escapeHtml(p.label) + "</strong><span>" + escapeHtml(p.note) + "</span>";
      grid.appendChild(a);
    });
  }

  function init() {
    $("lastUpdated").textContent = "数据更新于 " + data.lastUpdated;
    $("footerDate").textContent = data.lastUpdated;

    renderChips("typeFilter", TYPES, "type");
    renderChips("regionFilter", REGIONS, "region");
    renderChips("categoryFilter", CATEGORIES, "category");

    $("searchInput").addEventListener("input", function (e) {
      state.q = e.target.value.trim();
      renderJobs();
    });

    $("resetFilters").addEventListener("click", function () {
      state.type = "全部";
      state.region = "全部";
      state.category = "全部";
      state.q = "";
      $("searchInput").value = "";
      renderChips("typeFilter", TYPES, "type");
      renderChips("regionFilter", REGIONS, "region");
      renderChips("categoryFilter", CATEGORIES, "category");
      renderJobs();
    });

    renderPortals();
    renderJobs();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
