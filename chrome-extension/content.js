// Content script — extracts job data from supported job sites
// Runs automatically on matching URLs defined in manifest.json

(function () {
  function extractJobData() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    let data = {
      jobTitle: "",
      companyName: "",
      location: "",
      jobUrl: url,
      jobDescription: "",
      salary: "",
      platform: "Unknown",
    };

    try {
      if (hostname.includes("linkedin.com")) {
        data = extractLinkedIn(data);
      } else if (hostname.includes("indeed.com")) {
        data = extractIndeed(data);
      } else if (hostname.includes("glassdoor.com") || hostname.includes("glassdoor.co.in")) {
        data = extractGlassdoor(data);
      } else if (hostname.includes("naukri.com")) {
        data = extractNaukri(data);
      } else if (hostname.includes("lever.co")) {
        data = extractLever(data);
      } else if (hostname.includes("greenhouse.io")) {
        data = extractGreenhouse(data);
      } else {
        data = extractGeneric(data);
      }
    } catch (e) {
      console.error("JobPilot: extraction error", e);
      data = extractGeneric(data);
    }

    return data;
  }

  function extractLinkedIn(data) {
    data.platform = "LinkedIn";
    data.jobTitle =
      document.querySelector(".job-details-jobs-unified-top-card__job-title")?.textContent?.trim() ||
      document.querySelector(".jobs-unified-top-card__job-title")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() || "";
    data.companyName =
      document.querySelector(".job-details-jobs-unified-top-card__company-name")?.textContent?.trim() ||
      document.querySelector(".jobs-unified-top-card__company-name")?.textContent?.trim() || "";
    data.location =
      document.querySelector(".job-details-jobs-unified-top-card__primary-description-container .tvm__text")?.textContent?.trim() ||
      document.querySelector(".jobs-unified-top-card__bullet")?.textContent?.trim() || "";
    const descEl =
      document.querySelector(".jobs-description__content") ||
      document.querySelector(".jobs-box__html-content") ||
      document.querySelector("#job-details");
    data.jobDescription = descEl?.textContent?.trim() || "";
    return data;
  }

  function extractIndeed(data) {
    data.platform = "Indeed";
    data.jobTitle =
      document.querySelector(".jobsearch-JobInfoHeader-title")?.textContent?.trim() ||
      document.querySelector("h1[data-testid='jobsearch-JobInfoHeader-title']")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() || "";
    data.companyName =
      document.querySelector("[data-testid='inlineHeader-companyName']")?.textContent?.trim() ||
      document.querySelector(".jobsearch-InlineCompanyRating-companyHeader")?.textContent?.trim() || "";
    data.location =
      document.querySelector("[data-testid='inlineHeader-companyLocation']")?.textContent?.trim() ||
      document.querySelector(".jobsearch-JobInfoHeader-subtitle .css-6z8o9s")?.textContent?.trim() || "";
    const descEl =
      document.querySelector("#jobDescriptionText") ||
      document.querySelector(".jobsearch-jobDescriptionText");
    data.jobDescription = descEl?.textContent?.trim() || "";
    return data;
  }

  function extractGlassdoor(data) {
    data.platform = "Glassdoor";
    data.jobTitle =
      document.querySelector("[data-test='job-title']")?.textContent?.trim() ||
      document.querySelector(".css-1vg6q84")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() || "";
    data.companyName =
      document.querySelector("[data-test='employer-name']")?.textContent?.trim() ||
      document.querySelector(".css-87uc0g")?.textContent?.trim() || "";
    data.location =
      document.querySelector("[data-test='location']")?.textContent?.trim() || "";
    const descEl =
      document.querySelector(".jobDescriptionContent") ||
      document.querySelector("[data-test='job-description']");
    data.jobDescription = descEl?.textContent?.trim() || "";
    return data;
  }

  function extractNaukri(data) {
    data.platform = "Naukri";
    data.jobTitle =
      document.querySelector(".jd-header-title")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() || "";
    data.companyName =
      document.querySelector(".jd-header-comp-name")?.textContent?.trim() ||
      document.querySelector("a.jd-header-comp-name")?.textContent?.trim() || "";
    data.location =
      document.querySelector(".loc .locWdth")?.textContent?.trim() ||
      document.querySelector(".location")?.textContent?.trim() || "";
    data.salary =
      document.querySelector(".sal .salary")?.textContent?.trim() || "";
    const descEl = document.querySelector(".dang-inner-html") || document.querySelector(".job-desc");
    data.jobDescription = descEl?.textContent?.trim() || "";
    return data;
  }

  function extractLever(data) {
    data.platform = "Lever";
    data.jobTitle = document.querySelector(".posting-headline h2")?.textContent?.trim() || "";
    data.companyName = document.querySelector(".posting-headline .company-name")?.textContent?.trim() ||
      document.querySelector(".main-header-logo img")?.getAttribute("alt") || "";
    data.location = document.querySelector(".posting-categories .location")?.textContent?.trim() || "";
    const descEl = document.querySelector(".posting-page .section-wrapper");
    data.jobDescription = descEl?.textContent?.trim() || "";
    return data;
  }

  function extractGreenhouse(data) {
    data.platform = "Greenhouse";
    data.jobTitle = document.querySelector(".app-title")?.textContent?.trim() ||
      document.querySelector("h1")?.textContent?.trim() || "";
    data.location = document.querySelector(".location")?.textContent?.trim() || "";
    const descEl = document.querySelector("#content");
    data.jobDescription = descEl?.textContent?.trim() || "";
    return data;
  }

  function extractGeneric(data) {
    data.platform = "Other";
    // Try common patterns
    data.jobTitle = document.querySelector("h1")?.textContent?.trim() || document.title || "";
    // Try meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) data.jobTitle = ogTitle.getAttribute("content") || data.jobTitle;
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) data.jobDescription = ogDesc.getAttribute("content") || "";
    return data;
  }

  // Expose extraction function for popup to call
  window.__JOBPILOT_EXTRACT = extractJobData;

  // ----- Auto-fill application forms from JobPilot profile -----
  // Maps a list of canonical fields -> RegExp patterns matched against
  // input name/id/placeholder/aria-label/label text.
  function fillApplicationForm(profile) {
    if (!profile) return { filled: 0, skipped: 0 };
    const FIELD_MAP = [
      { val: profile.name, patterns: [/^name$/i, /full[_\s-]?name/i, /your[_\s-]?name/i, /applicant[_\s-]?name/i] },
      { val: (profile.name || "").split(" ")[0], patterns: [/first[_\s-]?name/i, /given[_\s-]?name/i, /fname/i] },
      { val: (profile.name || "").split(" ").slice(1).join(" "), patterns: [/last[_\s-]?name/i, /family[_\s-]?name/i, /surname/i, /lname/i] },
      { val: profile.email, patterns: [/email/i, /e-mail/i] },
      { val: profile.phone, patterns: [/phone/i, /mobile/i, /tel(?!ent)/i, /contact[_\s-]?number/i] },
      { val: profile.location, patterns: [/location/i, /city/i, /address/i, /current[_\s-]?location/i] },
      { val: profile.linkedin, patterns: [/linkedin/i] },
      { val: profile.github, patterns: [/github/i] },
      { val: profile.portfolio, patterns: [/portfolio/i, /website/i, /personal[_\s-]?site/i] },
      { val: profile.summary, patterns: [/summary/i, /about[_\s-]?you/i, /tell[_\s-]?us/i, /cover[_\s-]?letter/i] },
    ];

    const inputs = Array.from(document.querySelectorAll("input, textarea"));
    let filled = 0, skipped = 0;

    for (const el of inputs) {
      if (el.disabled || el.readOnly) { skipped++; continue; }
      const type = (el.type || "text").toLowerCase();
      if (["hidden", "file", "submit", "button", "checkbox", "radio", "image"].includes(type)) { skipped++; continue; }
      if (el.value && el.value.trim().length > 0) { skipped++; continue; }

      const haystack = [
        el.name, el.id, el.placeholder, el.getAttribute("aria-label"),
        // associated <label>
        el.labels && el.labels[0] ? el.labels[0].textContent : "",
        // closest label-like ancestor text
        el.closest("label")?.textContent || "",
      ].filter(Boolean).join(" ").toLowerCase();
      if (!haystack) continue;

      for (const f of FIELD_MAP) {
        if (!f.val) continue;
        if (f.patterns.some((re) => re.test(haystack))) {
          setReactFriendlyValue(el, f.val);
          filled++;
          break;
        }
      }
    }
    return { filled, skipped };
  }

  // React/Vue/Angular controlled inputs ignore direct value assignment;
  // we set via the native setter and dispatch input + change events so the
  // framework's listener picks up the new value.
  function setReactFriendlyValue(el, value) {
    const proto = el.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, String(value));
    else el.value = String(value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  window.__JOBPILOT_FILL = fillApplicationForm;
})();
