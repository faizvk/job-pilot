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
