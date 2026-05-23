import type { BudgetSheetPayload } from "@/lib/mims/budget-export";

const GSI_SCRIPT = "https://accounts.google.com/gsi/client";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

export function getGoogleClientId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  return id || undefined;
}

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(getGoogleClientId());
}

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Sheets export runs in the browser only."));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  const existing = document.querySelector(`script[src="${GSI_SCRIPT}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

export function requestGoogleAccessToken(clientId: string): Promise<string> {
  return loadGoogleIdentityScript().then(
    () =>
      new Promise((resolve, reject) => {
        const oauth2 = window.google?.accounts?.oauth2;
        if (!oauth2) {
          reject(new Error("Google Identity Services did not initialize."));
          return;
        }

        const client = oauth2.initTokenClient({
          client_id: clientId,
          scope: SHEETS_SCOPE,
          callback: (response) => {
            if (response.error || !response.access_token) {
              reject(new Error(response.error || "Google sign-in was cancelled."));
              return;
            }
            resolve(response.access_token);
          },
        });
        client.requestAccessToken();
      }),
  );
}

async function sheetsFetch<T>(accessToken: string, url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Google Sheets API error (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function formatRequests(sheetId: number, payload: BudgetSheetPayload) {
  const requests: object[] = [
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 1 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 14 },
          },
        },
        fields: "userEnteredFormat.textFormat",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 4, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 6 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            backgroundColor: { red: 0.85, green: 0.85, blue: 0.85 },
          },
        },
        fields: "userEnteredFormat(textFormat,backgroundColor)",
      },
    },
  ];

  for (const row of payload.sectionHeaderRows) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: 0, endColumnIndex: 6 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
          },
        },
        fields: "userEnteredFormat(textFormat,backgroundColor)",
      },
    });
  }

  for (const row of payload.totalRows) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: row, endRowIndex: row + 1, startColumnIndex: 0, endColumnIndex: 6 },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true },
            backgroundColor: { red: 1, green: 0.95, blue: 0.7 },
          },
        },
        fields: "userEnteredFormat(textFormat,backgroundColor)",
      },
    });
  }

  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: payload.grandTotalRow,
        endRowIndex: payload.grandTotalRow + 1,
        startColumnIndex: 0,
        endColumnIndex: 6,
      },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true },
          backgroundColor: { red: 0.82, green: 0.82, blue: 0.82 },
        },
      },
      fields: "userEnteredFormat(textFormat,backgroundColor)",
    },
  });

  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 5, endRowIndex: payload.values.length, startColumnIndex: 2, endColumnIndex: 5 },
      cell: {
        userEnteredFormat: {
          numberFormat: { type: "CURRENCY", pattern: "$#,##0.00" },
        },
      },
      fields: "userEnteredFormat.numberFormat",
    },
  });

  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 220 },
      fields: "pixelSize",
    },
  });

  return requests;
}

export async function createGoogleBudgetSheet(
  accessToken: string,
  payload: BudgetSheetPayload,
): Promise<{ spreadsheetId: string; url: string }> {
  const created = await sheetsFetch<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    sheets: Array<{ properties: { sheetId: number; title: string } }>;
  }>(accessToken, "https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    body: JSON.stringify({
      properties: { title: payload.title },
      sheets: [{ properties: { title: "Budget" } }],
    }),
  });

  const sheetId = created.sheets[0]?.properties.sheetId ?? 0;
  const range = `Budget!A1:F${payload.values.length}`;

  await sheetsFetch(
    accessToken,
    `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      body: JSON.stringify({ values: payload.values }),
    },
  );

  await sheetsFetch(accessToken, `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({ requests: formatRequests(sheetId, payload) }),
  });

  return {
    spreadsheetId: created.spreadsheetId,
    url: created.spreadsheetUrl,
  };
}

export async function exportBudgetToGoogleSheets(payload: BudgetSheetPayload): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Google Sheets is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment.");
  }
  const token = await requestGoogleAccessToken(clientId);
  const { url } = await createGoogleBudgetSheet(token, payload);
  return url;
}
