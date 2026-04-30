const DEFAULT_SERVER = "http://localhost:3001";

const $title = document.getElementById("jobTitle");
const $company = document.getElementById("companyName");
const $location = document.getElementById("location");
const $url = document.getElementById("jobUrl");
const $desc = document.getElementById("jobDescription");
const $platform = document.getElementById("platformBadge");
const $serverUrl = document.getElementById("serverUrl");
const $importBtn = document.getElementById("importBtn");
const $extractBtn = document.getElementById("extractBtn");
const $fillFormBtn = document.getElementById("fillFormBtn");
const $status = document.getElementById("statusMsg");

// Load saved server URL
chrome.storage.local.get(["jobpilotServer"], (result) => {
  $serverUrl.value = result.jobpilotServer || DEFAULT_SERVER;
});

$serverUrl.addEventListener("change", () => {
  chrome.storage.local.set({ jobpilotServer: $serverUrl.value });
});

// Auto-extract on popup open
extractFromPage();

$extractBtn.addEventListener("click", extractFromPage);

$importBtn.addEventListener("click", async () => {
  const server = $serverUrl.value || DEFAULT_SERVER;
  const data = {
    jobTitle: $title.value,
    companyName: $company.value,
    location: $location.value,
    jobUrl: $url.value,
    jobDescription: $desc.value,
    status: "saved",
  };

  if (!data.jobTitle || !data.companyName) {
    showStatus("Please fill in job title and company name.", "error");
    return;
  }

  $importBtn.disabled = true;
  $importBtn.textContent = "Importing...";

  try {
    const res = await fetch(`${server}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      showStatus("Imported to JobPilot!", "success");
      $importBtn.textContent = "Imported!";
    } else {
      const err = await res.json().catch(() => ({}));
      showStatus(err.error || `Error: ${res.status}`, "error");
      $importBtn.textContent = "Import to JobPilot";
      $importBtn.disabled = false;
    }
  } catch (e) {
    showStatus(`Cannot connect to ${server}. Is JobPilot running?`, "error");
    $importBtn.textContent = "Import to JobPilot";
    $importBtn.disabled = false;
  }
});

$fillFormBtn.addEventListener("click", async () => {
  const server = $serverUrl.value || DEFAULT_SERVER;
  $fillFormBtn.disabled = true;
  $fillFormBtn.textContent = "Filling...";
  try {
    const res = await fetch(`${server}/api/profile`);
    if (!res.ok) {
      showStatus(`Profile fetch failed: ${res.status}`, "error");
      return;
    }
    const profile = await res.json();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        showStatus("No active tab", "error");
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: (p) => {
            // Inline fill — works on any page (job boards or external ATS)
            const FIELD_MAP = [
              { val: p.name, patterns: [/^name$/i, /full[_\s-]?name/i, /your[_\s-]?name/i, /applicant[_\s-]?name/i] },
              { val: (p.name || "").split(" ")[0], patterns: [/first[_\s-]?name/i, /given[_\s-]?name/i, /\bfname\b/i] },
              { val: (p.name || "").split(" ").slice(1).join(" "), patterns: [/last[_\s-]?name/i, /family[_\s-]?name/i, /surname/i, /\blname\b/i] },
              { val: p.email, patterns: [/email/i, /e-mail/i] },
              { val: p.phone, patterns: [/phone/i, /mobile/i, /\btel\b/i, /contact[_\s-]?number/i] },
              { val: p.location, patterns: [/location/i, /city/i, /address/i, /current[_\s-]?location/i] },
              { val: p.linkedin, patterns: [/linkedin/i] },
              { val: p.github, patterns: [/github/i] },
              { val: p.portfolio, patterns: [/portfolio/i, /website/i, /personal[_\s-]?site/i] },
              { val: p.summary, patterns: [/summary/i, /about[_\s-]?you/i, /tell[_\s-]?us/i, /cover[_\s-]?letter/i] },
            ];
            const setVal = (el, value) => {
              const proto = el.tagName === "TEXTAREA"
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype;
              const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
              if (setter) setter.call(el, String(value));
              else el.value = String(value);
              el.dispatchEvent(new Event("input", { bubbles: true }));
              el.dispatchEvent(new Event("change", { bubbles: true }));
            };
            const inputs = Array.from(document.querySelectorAll("input, textarea"));
            let filled = 0, skipped = 0;
            for (const el of inputs) {
              if (el.disabled || el.readOnly) { skipped++; continue; }
              const type = (el.type || "text").toLowerCase();
              if (["hidden", "file", "submit", "button", "checkbox", "radio", "image"].includes(type)) { skipped++; continue; }
              if (el.value && el.value.trim().length > 0) { skipped++; continue; }
              const haystack = [
                el.name, el.id, el.placeholder, el.getAttribute("aria-label"),
                el.labels && el.labels[0] ? el.labels[0].textContent : "",
                el.closest("label")?.textContent || "",
              ].filter(Boolean).join(" ").toLowerCase();
              if (!haystack) continue;
              for (const f of FIELD_MAP) {
                if (!f.val) continue;
                if (f.patterns.some((re) => re.test(haystack))) {
                  setVal(el, f.val);
                  filled++;
                  break;
                }
              }
            }
            return { filled, skipped };
          },
          args: [profile],
        },
        (results) => {
          if (chrome.runtime.lastError) {
            showStatus(chrome.runtime.lastError.message || "Cannot run on this page", "error");
            $fillFormBtn.textContent = "Auto-fill Application Form";
            $fillFormBtn.disabled = false;
            return;
          }
          const r = results?.[0]?.result;
          if (r?.error) {
            showStatus(r.error, "error");
          } else if (r) {
            showStatus(`Filled ${r.filled} field${r.filled === 1 ? "" : "s"} (${r.skipped} skipped)`, r.filled > 0 ? "success" : "error");
          }
          $fillFormBtn.textContent = "Auto-fill Application Form";
          $fillFormBtn.disabled = false;
        }
      );
    });
  } catch (e) {
    showStatus(`Cannot connect to ${server}`, "error");
    $fillFormBtn.textContent = "Auto-fill Application Form";
    $fillFormBtn.disabled = false;
  }
});

function extractFromPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;

    $url.value = tab.url || "";

    // Try to extract using content script
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: () => {
          if (typeof window.__JOBPILOT_EXTRACT === "function") {
            return window.__JOBPILOT_EXTRACT();
          }
          // Fallback: basic extraction
          return {
            jobTitle: document.querySelector("h1")?.textContent?.trim() || document.title || "",
            companyName: "",
            location: "",
            jobUrl: window.location.href,
            jobDescription: "",
            platform: "Other",
          };
        },
      },
      (results) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded (non-matching URL) — use tab info
          $title.value = tab.title || "";
          $platform.textContent = "Manual";
          return;
        }

        const data = results?.[0]?.result;
        if (data) {
          $title.value = data.jobTitle || "";
          $company.value = data.companyName || "";
          $location.value = data.location || "";
          $desc.value = data.jobDescription?.slice(0, 5000) || "";
          $platform.textContent = data.platform || "Other";
          if (data.jobUrl) $url.value = data.jobUrl;
        }
      }
    );
  });
}

function showStatus(msg, type) {
  $status.textContent = msg;
  $status.className = `status ${type}`;
  $status.style.display = "block";
  setTimeout(() => {
    $status.style.display = "none";
  }, 4000);
}
