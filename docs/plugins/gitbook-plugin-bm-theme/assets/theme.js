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
      document.body.appendChild(button);
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
    var headings = Array.from(document.querySelectorAll(".markdown-section h2[id],.markdown-section h3[id]"));
    if (!headings.length) return;
    var toc = document.createElement("nav");
    toc.className = "bm-toc";
    toc.setAttribute("aria-label", "On this page");
    toc.innerHTML = '<div class="bm-toc-title">On this page</div>';
    var links = [];
    headings.forEach(function (heading) {
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.className = heading.tagName === "H3" ? "toc-h3" : "toc-h2";
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

  function focusSearch(event) {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "k") return;
    event.preventDefault();
    var searchButton = document.querySelector(".js-toolbar-action[aria-label*='Search'], a[href='#search']");
    if (searchButton) searchButton.click();
    window.setTimeout(function () {
      var input = document.querySelector("#book-search-input input, .book-search input");
      if (input) input.focus();
    }, 80);
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
    enhanceCode();
    enhanceHeadings();
    buildToc();
    buildBreadcrumbs();
    enhanceTabs();
    enhanceExternalLinks();
    buildFooter();
    renderMermaid(false);
  }

  document.addEventListener("keydown", focusSearch);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if ((localStorage.getItem("bm-docs-theme") || "system") === "system") applyTheme("system");
  });
  if (window.gitbook && window.gitbook.events) window.gitbook.events.bind("page.change", enhancePage);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enhancePage); else enhancePage();
}());
