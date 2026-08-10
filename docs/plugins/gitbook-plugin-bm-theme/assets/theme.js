(function () {
  "use strict";
  var themes = ["system", "light", "dark"];

  function effectiveTheme(preference) {
    return preference === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
  }

  function applyTheme(preference) {
    document.documentElement.dataset.bmTheme = effectiveTheme(preference);
    document.documentElement.dataset.bmThemePreference = preference;
    var button = document.querySelector(".theme-toggle");
    if (button) {
      button.textContent = preference === "system" ? "◐ System" : preference === "dark" ? "☾ Dark" : "☀ Light";
      button.setAttribute("aria-label", "Color theme: " + preference + ". Activate to change.");
    }
  }

  function installThemeToggle() {
    var preference = localStorage.getItem("bm-docs-theme") || "system";
    var button = document.querySelector(".theme-toggle");
    if (!button) {
      button = document.createElement("button");
      button.className = "theme-toggle";
      button.type = "button";
      (document.querySelector(".book-header") || document.body).appendChild(button);
      button.addEventListener("click", function () {
        var current = document.documentElement.dataset.bmThemePreference || "system";
        var next = themes[(themes.indexOf(current) + 1) % themes.length];
        localStorage.setItem("bm-docs-theme", next);
        applyTheme(next);
        renderMermaid(true);
      });
    }
    applyTheme(preference);
  }

  function enhanceCode() {
    document.querySelectorAll(".markdown-section pre").forEach(function (pre) {
      if (pre.dataset.enhanced) return;
      pre.dataset.enhanced = "true";
      var code = pre.querySelector("code");
      if (!code || code.classList.contains("lang-mermaid")) return;
      var language = Array.from(code.classList).find(function (name) { return name.indexOf("lang-") === 0; });
      var label = document.createElement("span");
      label.className = "code-language";
      label.textContent = language ? language.slice(5) : "text";
      var copy = document.createElement("button");
      copy.type = "button";
      copy.className = "code-copy";
      copy.textContent = "Copy";
      copy.setAttribute("aria-label", "Copy code");
      copy.addEventListener("click", function () {
        var value = code.innerText;
        var operation = navigator.clipboard && window.isSecureContext
          ? navigator.clipboard.writeText(value)
          : Promise.reject(new Error("clipboard_api_unavailable"));
        operation.catch(function () {
          var textarea = document.createElement("textarea");
          textarea.value = value;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          var copied = document.execCommand("copy");
          textarea.remove();
          if (!copied) throw new Error("copy_command_failed");
        }).then(function () {
          copy.textContent = "Copied";
          copy.setAttribute("aria-live", "polite");
          window.setTimeout(function () { copy.textContent = "Copy"; }, 1600);
        }).catch(function () {
          copy.textContent = "Select & copy";
          window.setTimeout(function () { copy.textContent = "Copy"; }, 2000);
        });
      });
      pre.appendChild(label);
      pre.appendChild(copy);
    });
  }

  function enhanceHeadings() {
    document.querySelectorAll(".markdown-section h2[id],.markdown-section h3[id]").forEach(function (heading) {
      if (heading.querySelector(".heading-anchor")) return;
      var anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = "#" + heading.id;
      anchor.textContent = "#";
      anchor.setAttribute("aria-label", "Link to " + heading.textContent);
      heading.appendChild(anchor);
    });
  }

  function buildToc() {
    var old = document.querySelector(".bm-toc");
    if (old) old.remove();
    var headings = Array.from(document.querySelectorAll(".markdown-section h1[id],.markdown-section h2[id],.markdown-section h3[id]"));
    if (!headings.length) {
      var pageTitle = document.querySelector(".markdown-section h1");
      if (pageTitle) {
        if (!pageTitle.id) pageTitle.id = "page-top";
        headings = [pageTitle];
      }
    }
    if (!headings.length) return;
    var toc = document.createElement("nav");
    toc.className = "bm-toc";
    toc.setAttribute("aria-label", "On this page");
    toc.innerHTML = '<div class="bm-toc-title">Page minimap</div><div class="bm-toc-track" aria-hidden="true"><span></span></div>';
    var links = [];
    headings.forEach(function (heading) {
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.className = heading.tagName === "H3" ? "toc-h3" : heading.tagName === "H1" ? "toc-h1" : "toc-h2";
      link.textContent = heading.childNodes[0] ? heading.childNodes[0].textContent.trim() : heading.textContent.trim();
      toc.appendChild(link);
      links.push({ heading: heading, link: link });
    });
    document.body.appendChild(toc);
    function activateFromPosition() {
      var current = links[0];
      links.forEach(function (item) {
        if (item.heading.getBoundingClientRect().top <= 190) current = item;
      });
      links.forEach(function (item) { item.link.classList.toggle("active", item === current); });
      var progress = toc.querySelector(".bm-toc-track span");
      if (progress) {
        var maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        progress.style.height = Math.min(100, Math.max(4, window.scrollY / maximum * 100)) + "%";
      }
    }
    if (window.bmTocScrollHandler) window.removeEventListener("scroll", window.bmTocScrollHandler);
    window.bmTocScrollHandler = activateFromPosition;
    window.addEventListener("scroll", activateFromPosition, { passive: true });
    links.forEach(function (item) {
      item.link.addEventListener("click", function () {
        links.forEach(function (candidate) { candidate.link.classList.toggle("active", candidate === item); });
      });
    });
    activateFromPosition();
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (item) { item.link.classList.toggle("active", item.heading === entry.target); });
        });
      }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
      links.forEach(function (item) { observer.observe(item.heading); });
    }
  }

  function buildBreadcrumbs() {
    var article = document.querySelector(".markdown-section");
    if (!article || article.querySelector(".bm-breadcrumbs")) return;
    var active = document.querySelector(".book-summary li.active a");
    if (!active) return;
    var header = active.closest("li").previousElementSibling;
    while (header && !header.classList.contains("header")) header = header.previousElementSibling;
    var crumbs = document.createElement("nav");
    crumbs.className = "bm-breadcrumbs";
    crumbs.setAttribute("aria-label", "Breadcrumb");
    crumbs.innerHTML = '<a href="' + (window.location.pathname.indexOf("/_book/") >= 0 ? "/_book/" : "../") + '">Docs</a> / ' + (header ? header.textContent.trim() + " / " : "") + active.textContent.trim();
    article.insertBefore(crumbs, article.firstChild);
  }

  function enhanceTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (tabs) {
      if (tabs.dataset.enhanced) return;
      tabs.dataset.enhanced = "true";
      var buttons = Array.from(tabs.querySelectorAll('[role="tab"]'));
      function activate(button) {
        buttons.forEach(function (item) {
          var selected = item === button;
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
          var panel = document.getElementById(item.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
      }
      buttons.forEach(function (button, index) {
        button.addEventListener("click", function () { activate(button); });
        button.addEventListener("keydown", function (event) {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          event.stopPropagation();
          var offset = event.key === "ArrowRight" ? 1 : -1;
          var next = buttons[(index + offset + buttons.length) % buttons.length];
          activate(next);
          next.focus();
        });
      });
      activate(buttons.find(function (button) { return button.getAttribute("aria-selected") === "true"; }) || buttons[0]);
    });
  }

  function enhanceExternalLinks() {
    document.querySelectorAll('.markdown-section a[href^="http://"],.markdown-section a[href^="https://"]').forEach(function (link) {
      var target = new URL(link.href, window.location.href);
      if (target.origin === window.location.origin) return;
      link.classList.add("external-link");
      link.target = "_blank";
      link.rel = "noopener noreferrer external";
      if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", link.textContent.trim() + " (opens in a new tab)");
    });
  }

  function buildFooter() {
    var article = document.querySelector(".markdown-section");
    if (!article || article.querySelector(".bm-doc-footer")) return;
    var configuredVersion = "0.1.0";
    try {
      configuredVersion = gitbook.state.config.pluginsConfig["bm-theme"].projectVersion || configuredVersion;
    } catch (_error) {}
    var updated = new Date(document.lastModified);
    var updatedLabel = Number.isNaN(updated.getTime()) ? "Build time unavailable" : "Updated " + updated.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    var prefix = window.location.pathname.split("/").filter(Boolean).length > 1 ? "../" : "";
    var footer = document.createElement("footer");
    footer.className = "bm-doc-footer";
    footer.innerHTML = '<span>BM Agents World v' + configuredVersion + '</span><span>' + updatedLabel + '</span><span><a href="' + prefix + 'reference/commands.html">Commands</a> · <a href="' + prefix + 'deployment/security.html">Security</a></span>';
    article.appendChild(footer);
  }

  function buildPageNavigation() {
    var article = document.querySelector(".markdown-section");
    if (!article || article.querySelector(".bm-page-nav")) return;
    var links = Array.from(document.querySelectorAll(".book-summary ul.summary li a[href]"));
    var activeIndex = links.findIndex(function (link) { return link.closest("li") && link.closest("li").classList.contains("active"); });
    if (activeIndex < 0) return;
    var previous = links[activeIndex - 1];
    var next = links[activeIndex + 1];
    if (!previous && !next) return;
    var navigation = document.createElement("nav");
    navigation.className = "bm-page-nav";
    navigation.setAttribute("aria-label", "Documentation pages");
    function card(link, direction) {
      if (!link) return '<span class="bm-page-nav-spacer"></span>';
      var anchor = document.createElement("a");
      anchor.className = "bm-page-nav-card bm-page-nav-" + direction;
      anchor.href = link.href;
      var eyebrow = document.createElement("span");
      eyebrow.className = "bm-page-nav-label";
      eyebrow.textContent = direction === "previous" ? "Previous" : "Next";
      var title = document.createElement("strong");
      title.textContent = link.textContent.trim();
      anchor.appendChild(eyebrow);
      anchor.appendChild(title);
      return anchor;
    }
    var previousCard = card(previous, "previous");
    var nextCard = card(next, "next");
    if (typeof previousCard === "string") navigation.insertAdjacentHTML("beforeend", previousCard); else navigation.appendChild(previousCard);
    if (typeof nextCard === "string") navigation.insertAdjacentHTML("beforeend", nextCard); else navigation.appendChild(nextCard);
    var footer = article.querySelector(".bm-doc-footer");
    article.insertBefore(navigation, footer || null);
  }

  function installHeaderSearch() {
    var header = document.querySelector(".book-header");
    if (!header || header.querySelector(".bm-search-trigger")) return;
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "bm-search-trigger";
    trigger.innerHTML = '<span class="bm-search-icon" aria-hidden="true"></span><span class="bm-search-placeholder">Search documentation...</span><kbd>Ctrl K</kbd>';
    trigger.setAttribute("aria-label", "Search documentation");
    header.appendChild(trigger);

    var modal = document.createElement("div");
    modal.className = "bm-search-modal";
    modal.hidden = true;
    modal.innerHTML = '<div class="bm-search-backdrop"></div><section class="bm-search-dialog" role="dialog" aria-modal="true" aria-label="Search documentation"><div class="bm-search-input-row"><span class="bm-search-icon" aria-hidden="true"></span><input type="search" autocomplete="off" placeholder="Search documentation" aria-label="Search documentation"><kbd>Esc</kbd></div><div class="bm-search-results"><div class="bm-search-empty">Start typing to search every documentation page.</div></div><footer><span>Use arrow keys to navigate</span><span>Enter to open</span></footer></section>';
    document.body.appendChild(modal);
    var input = modal.querySelector("input");
    var results = modal.querySelector(".bm-search-results");
    var searchDocuments = [];
    var selected = -1;

    function close() {
      modal.hidden = true;
      document.body.classList.remove("bm-search-open");
      trigger.focus();
    }
    function open() {
      modal.hidden = false;
      document.body.classList.add("bm-search-open");
      input.focus();
      input.select();
      if (!searchDocuments.length) {
        var basePath = window.gitbook && gitbook.state ? gitbook.state.basePath || "." : ".";
        fetch(new URL(basePath.replace(/\/$/, "") + "/search_index.json", window.location.href)).then(function (response) { return response.json(); }).then(function (payload) {
          var store = payload.store || {};
          searchDocuments = Object.keys(store).map(function (key) { return store[key]; });
          if (input.value.trim()) render(input.value);
        }).catch(function () { results.innerHTML = '<div class="bm-search-empty">Search index could not be loaded.</div>'; });
      }
    }
    function render(value) {
      var terms = value.toLowerCase().trim().split(/\s+/).filter(Boolean);
      selected = -1;
      results.innerHTML = "";
      if (!terms.length) {
        results.innerHTML = '<div class="bm-search-empty">Start typing to search every documentation page.</div>';
        return;
      }
      var matches = searchDocuments.map(function (document) {
        var title = (document.title || "Untitled").toLowerCase();
        var body = (document.body || "").toLowerCase();
        var score = terms.reduce(function (total, term) { return total + (title.indexOf(term) >= 0 ? 8 : 0) + (body.indexOf(term) >= 0 ? 1 : 0); }, 0);
        return { document: document, score: score };
      }).filter(function (item) { return item.score > 0; }).sort(function (a, b) { return b.score - a.score; }).slice(0, 8);
      if (!matches.length) {
        results.innerHTML = '<div class="bm-search-empty">No documentation matched your search.</div>';
        return;
      }
      matches.forEach(function (item) {
        var link = document.createElement("a");
        link.className = "bm-search-result";
        var basePath = window.gitbook && gitbook.state ? gitbook.state.basePath || "." : ".";
        link.href = new URL(basePath.replace(/\/$/, "") + "/" + item.document.url.replace(/^\.\//, ""), window.location.href).href;
        var title = document.createElement("strong");
        title.textContent = item.document.title || "Untitled";
        var excerpt = document.createElement("span");
        var body = (item.document.body || "").replace(/\s+/g, " ").trim();
        excerpt.textContent = body.slice(0, 150) + (body.length > 150 ? "..." : "");
        link.appendChild(title);
        link.appendChild(excerpt);
        results.appendChild(link);
      });
    }
    function select(offset) {
      var options = Array.from(results.querySelectorAll(".bm-search-result"));
      if (!options.length) return;
      selected = (selected + offset + options.length) % options.length;
      options.forEach(function (option, index) { option.classList.toggle("selected", index === selected); });
      options[selected].scrollIntoView({ block: "nearest" });
    }
    trigger.addEventListener("click", open);
    modal.querySelector(".bm-search-backdrop").addEventListener("click", close);
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "ArrowDown") { event.preventDefault(); select(1); }
      if (event.key === "ArrowUp") { event.preventDefault(); select(-1); }
      if (event.key === "Enter" && selected >= 0) { event.preventDefault(); results.querySelectorAll(".bm-search-result")[selected].click(); }
    });
    window.bmOpenSearch = open;
  }

  function focusSearch(event) {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
    event.preventDefault();
    if (window.bmOpenSearch) window.bmOpenSearch();
  }

  function loadMermaid() {
    if (window.mermaid || document.querySelector("script[data-bm-mermaid]")) return Promise.resolve();
    return new Promise(function (resolve) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
      script.dataset.bmMermaid = "true";
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }

  function renderMermaid(force) {
    loadMermaid().then(function () {
      if (!window.mermaid) return;
      if (force) {
        document.querySelectorAll(".mermaid[data-source]").forEach(function (container) {
          container.textContent = container.dataset.source;
          container.removeAttribute("data-processed");
        });
      }
      document.querySelectorAll("pre code.lang-mermaid").forEach(function (code, index) {
        var pre = code.parentElement;
        if (!pre || pre.dataset.mermaidRendered) return;
        pre.dataset.mermaidRendered = "true";
        var container = document.createElement("div");
        container.className = "mermaid";
        container.id = "mermaid-" + Date.now() + "-" + index;
        container.textContent = code.textContent;
        container.dataset.source = code.textContent;
        pre.replaceWith(container);
      });
      window.mermaid.initialize({ startOnLoad: false, theme: document.documentElement.dataset.bmTheme === "dark" ? "dark" : "default", securityLevel: "strict" });
      window.mermaid.run({ querySelector: ".mermaid" }).catch(function () {});
    });
  }

  function enhancePage() {
    installThemeToggle();
    installHeaderSearch();
    enhanceCode();
    enhanceHeadings();
    buildToc();
    buildBreadcrumbs();
    enhanceTabs();
    enhanceExternalLinks();
    buildFooter();
    buildPageNavigation();
    renderMermaid(false);
  }

  document.addEventListener("keydown", focusSearch);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if ((localStorage.getItem("bm-docs-theme") || "system") === "system") applyTheme("system");
  });
  if (window.gitbook && window.gitbook.events) window.gitbook.events.bind("page.change", enhancePage);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhancePage); else enhancePage();
}());
