import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  FileQuestion,
  LoaderCircle,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { createFAQ, deleteFAQ, getAllFAQs, updateFAQ } from "../lib/faqsApi";

/* =========================================================
   CONSTANTS
========================================================= */

const INITIAL_FORM = {
  question: "",
  answer: "",
  linkText: "",
  linkUrl: "",
  isPublished: true,
  order: 0,
};

const COLORS = {
  navy: "#102B4E",
  mint: "#61D6BD",
  mintDark: "#168C79",
  ivory: "#F8F6EF",
  blue: "#338DFD",
  text: "#24364B",
  muted: "#6B7A8D",
  border: "#E2E8F0",
  white: "#FFFFFF",
  danger: "#DC4545",
};

/* =========================================================
   HELPERS
========================================================= */

const getFAQId = (faq) => faq?._id || faq?.id;

const normalizeFAQ = (faq) => ({
  _id: getFAQId(faq),
  question: faq?.question || "",
  answer: faq?.answer || "",
  linkText: faq?.linkText || "",
  linkUrl: faq?.linkUrl || "",
  isPublished: faq?.isPublished !== false,
  order: Number.isFinite(Number(faq?.order)) ? Number(faq.order) : 0,
  createdAt: faq?.createdAt || null,
});

const sortFAQs = (items) =>
  [...items].sort((a, b) => {
    const orderDifference = a.order - b.order;
    if (orderDifference !== 0) return orderDifference;

    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* Internal path (/ielts) — no "//" and no backslashes (browsers treat
   "/\evil.com" like a protocol-relative URL) — or a full HTTPS URL. */
const isInternalPath = (url) => /^\/(?!\/)[^\s\\]*$/.test(url);
const isHttpsUrl = (url) => /^https:\/\/[^\s]+$/i.test(url);
const isValidLink = (url) => isInternalPath(url) || isHttpsUrl(url);

const toPayload = (faq) => ({
  question: faq.question,
  answer: faq.answer,
  linkText: faq.linkText,
  linkUrl: faq.linkUrl,
  isPublished: faq.isPublished,
  order: faq.order,
});

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="faq-stat-card">
      <div
        className="faq-stat-icon"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="faq-stat-label">{label}</p>
        <p className="faq-stat-value">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ published }) {
  return (
    <span
      className={`faq-status ${
        published ? "faq-status-published" : "faq-status-draft"
      }`}
    >
      <span className="faq-status-dot" />
      {published ? "Published" : "Unpublished"}
    </span>
  );
}

function FieldLabel({ children, required = false, htmlFor }) {
  return (
    <label className="faq-field-label" htmlFor={htmlFor}>
      {children}
      {required && <span className="faq-required"> *</span>}
    </label>
  );
}

function Notices({ error, success }) {
  return (
    <>
      {error && (
        <div className="faq-notice faq-notice-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="faq-notice faq-notice-success" role="status">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}
    </>
  );
}

/* =========================================================
   STYLES (static, so they are not rebuilt on every render)
========================================================= */

const STYLES = `
  .admin-faqs {
    --faq-navy: ${COLORS.navy};
    --faq-mint: ${COLORS.mint};
    --faq-mint-dark: ${COLORS.mintDark};
    --faq-ivory: ${COLORS.ivory};
    --faq-blue: ${COLORS.blue};
    --faq-text: ${COLORS.text};
    --faq-muted: ${COLORS.muted};
    --faq-border: ${COLORS.border};
    --faq-danger: ${COLORS.danger};
    color: var(--faq-text);
    width: 100%;
    min-width: 0;
    padding: 28px;
    font-family: inherit;
  }

  .admin-faqs *,
  .admin-faqs *::before,
  .admin-faqs *::after {
    box-sizing: border-box;
  }

  .admin-faqs button:focus-visible,
  .admin-faqs a:focus-visible {
    outline: 3px solid rgba(51, 141, 253, .45);
    outline-offset: 2px;
  }

  .faq-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 28px;
  }

  .faq-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--faq-mint-dark);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .faq-header h1 {
    color: var(--faq-navy);
    font-size: clamp(28px, 3vw, 38px);
    font-weight: 850;
    letter-spacing: -1px;
    line-height: 1.15;
    margin: 0;
  }

  .faq-header p {
    color: var(--faq-muted);
    font-size: 15px;
    line-height: 1.7;
    max-width: 650px;
    margin: 12px 0 0;
  }

  .faq-primary-button,
  .faq-secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    border-radius: 12px;
    padding: 13px 17px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .faq-primary-button {
    color: white;
    background: var(--faq-navy);
    box-shadow: 0 7px 18px rgba(16, 43, 78, .12);
  }

  .faq-primary-button:hover:not(:disabled) {
    background: #183D68;
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(16, 43, 78, .2);
  }

  .faq-secondary-button {
    color: var(--faq-navy);
    background: white;
    border-color: var(--faq-border);
  }

  .faq-secondary-button:hover:not(:disabled) {
    background: var(--faq-ivory);
  }

  .admin-faqs button:disabled {
    opacity: .55;
    cursor: not-allowed;
  }

  .faq-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 25px;
  }

  .faq-stat-card {
    display: flex;
    align-items: center;
    gap: 15px;
    background: white;
    border: 1px solid var(--faq-border);
    border-radius: 17px;
    padding: 21px;
    min-width: 0;
  }

  .faq-stat-icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    display: grid;
    place-items: center;
    border-radius: 14px;
  }

  .faq-stat-label {
    color: var(--faq-muted);
    font-size: 13px;
    font-weight: 650;
    margin: 0 0 6px;
  }

  .faq-stat-value {
    color: var(--faq-navy);
    font-size: 27px;
    font-weight: 850;
    line-height: 1;
    margin: 0;
  }

  .faq-editor {
    background: white;
    border: 1px solid var(--faq-border);
    border-radius: 20px;
    margin-bottom: 25px;
    overflow: hidden;
    box-shadow: 0 10px 35px rgba(16, 43, 78, .055);
  }

  .faq-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 22px 25px;
    background: var(--faq-ivory);
    border-bottom: 1px solid var(--faq-border);
  }

  .faq-editor-header h2 {
    margin: 0;
    color: var(--faq-navy);
    font-size: 21px;
    font-weight: 850;
  }

  .faq-editor-header p {
    margin: 6px 0 0;
    color: var(--faq-muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .faq-icon-button {
    display: inline-grid;
    place-items: center;
    width: 39px;
    height: 39px;
    border: 1px solid var(--faq-border);
    border-radius: 11px;
    background: white;
    color: var(--faq-navy);
    cursor: pointer;
    flex: 0 0 auto;
    transition: background .2s ease, transform .2s ease;
  }

  .faq-icon-button:hover:not(:disabled) {
    background: #EFF6FF;
    transform: translateY(-1px);
  }

  .faq-form {
    padding: 25px;
  }

  .faq-form-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 22px;
  }

  .faq-field {
    display: flex;
    flex-direction: column;
    gap: 9px;
    min-width: 0;
    margin-bottom: 22px;
  }

  .faq-field-full {
    grid-column: 1 / -1;
  }

  .faq-field-label {
    color: var(--faq-navy);
    font-size: 14px;
    font-weight: 800;
  }

  .faq-required {
    color: var(--faq-danger);
  }

  .faq-field input:not([type="checkbox"]),
  .faq-field textarea,
  .faq-field select {
    width: 100%;
    min-width: 0;
    border: 1px solid #D5DEE8;
    border-radius: 11px;
    background: white;
    color: var(--faq-text);
    font-family: inherit;
    font-size: 14px;
    padding: 13px 14px;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  .faq-field input:focus,
  .faq-field textarea:focus,
  .faq-field select:focus {
    border-color: var(--faq-blue);
    box-shadow: 0 0 0 3px rgba(51, 141, 253, .12);
  }

  .faq-field textarea {
    resize: vertical;
    line-height: 1.7;
  }

  .faq-field small {
    color: var(--faq-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .faq-input-counter {
    text-align: right;
    font-size: 11px !important;
  }

  .faq-link-section {
    border: 1px dashed #C9D8E6;
    background: #FBFDFF;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 22px;
  }

  .faq-link-section h3 {
    color: var(--faq-navy);
    font-size: 16px;
    font-weight: 850;
    margin: 0 0 7px;
  }

  .faq-link-section > p {
    color: var(--faq-muted);
    font-size: 13px;
    line-height: 1.6;
    margin: 0 0 18px;
  }

  .faq-link-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 18px;
  }

  .faq-checkbox-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border: 1px solid var(--faq-border);
    border-radius: 13px;
    padding: 16px;
    margin-bottom: 22px;
    cursor: pointer;
  }

  .faq-checkbox-copy strong {
    display: block;
    color: var(--faq-navy);
    font-size: 14px;
    margin-bottom: 5px;
  }

  .faq-checkbox-copy span {
    display: block;
    color: var(--faq-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .faq-switch {
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    width: 47px;
    height: 27px;
    flex: 0 0 47px;
    margin: 0;
    border: none;
    border-radius: 99px;
    background: #CBD5E1;
    cursor: pointer;
    transition: background .2s ease;
  }

  .faq-switch::after {
    content: "";
    position: absolute;
    left: 3px;
    top: 3px;
    width: 21px;
    height: 21px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .2);
    transition: transform .2s ease;
  }

  .faq-switch:checked {
    background: var(--faq-mint-dark);
  }

  .faq-switch:checked::after {
    transform: translateX(20px);
  }

  .faq-switch:focus-visible {
    outline: 3px solid rgba(51, 141, 253, .45);
    outline-offset: 2px;
  }

  .faq-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
    padding-top: 6px;
  }

  .faq-preview {
    background: var(--faq-ivory);
    border: 1px solid #EEE7D8;
    border-radius: 15px;
    padding: 20px;
    margin: 0 0 23px;
  }

  .faq-preview-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--faq-mint-dark);
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 13px;
  }

  .faq-preview h3 {
    color: var(--faq-navy);
    font-size: 17px;
    line-height: 1.5;
    font-weight: 850;
    margin: 0 0 9px;
    overflow-wrap: anywhere;
  }

  .faq-preview p {
    color: var(--faq-muted);
    font-size: 14px;
    line-height: 1.8;
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .faq-preview-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--faq-mint-dark);
    font-size: 13px;
    font-weight: 850;
    text-decoration: none;
    margin-top: 13px;
    overflow-wrap: anywhere;
    cursor: default;
  }

  .faq-notice {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    border-radius: 12px;
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.6;
    margin-bottom: 20px;
    overflow-wrap: anywhere;
  }

  .faq-notice svg {
    flex: 0 0 auto;
    margin-top: 1px;
  }

  .faq-notice-error {
    background: #FFF1F1;
    border: 1px solid #F4CCCC;
    color: #9D2929;
  }

  .faq-notice-success {
    background: #EAFBF5;
    border: 1px solid #B9EBDD;
    color: #176A56;
  }

  .faq-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 17px;
    flex-wrap: wrap;
  }

  .faq-toolbar h2 {
    color: var(--faq-navy);
    font-size: 22px;
    font-weight: 850;
    margin: 0;
  }

  .faq-toolbar h2 span {
    color: var(--faq-muted);
    font-size: 14px;
    font-weight: 650;
    margin-left: 6px;
  }

  .faq-toolbar-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .faq-search {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 240px;
    padding: 0 12px;
    background: white;
    border: 1px solid var(--faq-border);
    border-radius: 11px;
    color: var(--faq-muted);
  }

  .faq-search input {
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    padding: 12px 0;
    color: var(--faq-text);
    font-family: inherit;
    font-size: 13px;
  }

  .faq-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--faq-border);
    border-radius: 11px;
    background: white;
    padding: 0 10px;
    color: var(--faq-muted);
  }

  .faq-filter select {
    max-width: 160px;
    border: none;
    outline: none;
    background: transparent;
    padding: 12px 0;
    color: var(--faq-navy);
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
  }

  .faq-reorder-hint {
    color: var(--faq-muted);
    font-size: 12px;
    margin: -6px 0 14px;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 13px;
  }

  .faq-item {
    min-width: 0;
    background: white;
    border: 1px solid var(--faq-border);
    border-radius: 16px;
    overflow: hidden;
    transition: border-color .2s ease, box-shadow .2s ease;
  }

  .faq-item:hover {
    border-color: #C6D8E7;
    box-shadow: 0 8px 24px rgba(16, 43, 78, .045);
  }

  .faq-item-main {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 19px;
  }

  .faq-order-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    flex: 0 0 30px;
  }

  .faq-order-number {
    color: var(--faq-muted);
    font-size: 12px;
    font-weight: 850;
    margin: 2px 0;
  }

  .faq-order-controls .faq-icon-button {
    width: 29px;
    height: 29px;
    border-radius: 8px;
  }

  .faq-item-content {
    flex: 1;
    min-width: 0;
  }

  .faq-item-topline {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    margin-bottom: 9px;
  }

  .faq-item h3 {
    color: var(--faq-navy);
    font-size: 16px;
    line-height: 1.55;
    font-weight: 850;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .faq-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 9px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
  }

  .faq-status-published {
    color: #14765D;
    background: #E5F9F1;
  }

  .faq-status-draft {
    color: #7B5A20;
    background: #FFF4D8;
  }

  .faq-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .faq-item-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    color: var(--faq-muted);
    font-size: 11px;
    margin: 9px 0 11px;
  }

  .faq-item-answer {
    color: #536479;
    font-size: 13px;
    line-height: 1.8;
    margin: 0;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .faq-item-answer-collapsed {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .faq-item-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 11px;
    color: var(--faq-mint-dark);
    font-size: 12px;
    font-weight: 800;
    overflow-wrap: anywhere;
    text-decoration: none;
  }

  .faq-item-link:hover {
    text-decoration: underline;
  }

  .faq-item-actions {
    display: flex;
    align-items: center;
    gap: 7px;
    flex: 0 0 auto;
  }

  .faq-item-actions .faq-icon-button {
    width: 35px;
    height: 35px;
    border-radius: 10px;
  }

  .faq-delete-button {
    color: var(--faq-danger);
  }

  .faq-delete-button:hover:not(:disabled) {
    background: #FFF0F0;
  }

  .faq-expand-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: none;
    background: transparent;
    padding: 8px 0 0;
    color: var(--faq-blue);
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .faq-empty {
    text-align: center;
    background: white;
    border: 1px dashed #CBD7E3;
    border-radius: 18px;
    padding: 55px 20px;
  }

  .faq-empty-icon {
    display: grid;
    place-items: center;
    width: 62px;
    height: 62px;
    margin: 0 auto 17px;
    border-radius: 18px;
    background: #EAFBF5;
    color: var(--faq-mint-dark);
  }

  .faq-empty h3 {
    color: var(--faq-navy);
    font-size: 20px;
    font-weight: 850;
    margin: 0 0 8px;
  }

  .faq-empty p {
    color: var(--faq-muted);
    font-size: 13px;
    line-height: 1.7;
    max-width: 440px;
    margin: 0 auto 20px;
  }

  .faq-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    min-height: 220px;
    color: var(--faq-muted);
    font-size: 14px;
    font-weight: 700;
  }

  .faq-spinner {
    animation: faq-spin 1s linear infinite;
  }

  @keyframes faq-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .faq-spinner { animation-duration: 2.5s; }
    .admin-faqs * { transition: none !important; }
  }

  @media (max-width: 1000px) {
    .admin-faqs { padding: 22px; }
    .faq-header { flex-direction: column; }
    .faq-stats { gap: 10px; }
    .faq-stat-card { padding: 16px; }
    .faq-stat-icon { width: 40px; height: 40px; flex-basis: 40px; }
    .faq-stat-value { font-size: 23px; }
    .faq-item-main { flex-wrap: wrap; }
    .faq-item-content { flex-basis: calc(100% - 60px); }
    .faq-item-actions { margin-left: 44px; }
  }

  @media (max-width: 650px) {
    .admin-faqs { padding: 15px; }
    .faq-header .faq-primary-button { width: 100%; }
    .faq-stats { grid-template-columns: 1fr; }
    .faq-stat-card { padding: 14px 17px; }
    .faq-form { padding: 18px; }
    .faq-form-grid, .faq-link-grid { grid-template-columns: 1fr; gap: 0; }
    .faq-field-full { grid-column: auto; }
    .faq-editor-header { padding: 18px; }
    .faq-toolbar { align-items: stretch; }
    .faq-toolbar-controls { width: 100%; }
    .faq-search { min-width: 0; flex: 1; }
    .faq-item-main { gap: 10px; padding: 14px; }
    .faq-order-controls { flex-basis: 27px; }
    .faq-item-content { flex-basis: calc(100% - 42px); }
    .faq-item-actions { margin-left: 37px; }
    .faq-form-actions { flex-direction: column-reverse; }
    .faq-form-actions button { width: 100%; }
  }
`;

/* =========================================================
   MAIN ADMIN PAGE
========================================================= */

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false); // publish / delete / reorder in progress

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);

  const [form, setForm] = useState({ ...INITIAL_FORM });

  /* =======================================================
     LOAD FAQs  (silent = refresh without the full-page spinner)
  ======================================================= */

  const loadFAQs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const response = await getAllFAQs();
      const rawList = Array.isArray(response)
        ? response
        : (response?.faqs ?? response?.data ?? []);

      const items = Array.isArray(rawList) ? rawList.map(normalizeFAQ) : [];
      setFaqs(sortFAQs(items));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  /* success messages disappear by themselves */
  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  /* Esc closes the editor */
  useEffect(() => {
    if (!showEditor) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        setShowEditor(false);
        setEditingId(null);
        setForm({ ...INITIAL_FORM });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showEditor, saving]);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const showSuccess = (message) => {
    setError("");
    setSuccess(message);
  };

  /* =======================================================
     EDITOR
  ======================================================= */

  const openCreateForm = () => {
    clearMessages();
    setEditingId(null);
    setForm({
      ...INITIAL_FORM,
      order: faqs.length ? Math.max(...faqs.map((faq) => faq.order)) + 1 : 0,
    });
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (faq) => {
    clearMessages();
    setEditingId(getFAQId(faq));
    setForm({
      question: faq.question,
      answer: faq.answer,
      linkText: faq.linkText,
      linkUrl: faq.linkUrl,
      isPublished: faq.isPublished,
      order: faq.order,
    });
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeEditor = () => {
    if (saving) return;
    setShowEditor(false);
    setEditingId(null);
    setForm({ ...INITIAL_FORM });
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "order"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  };

  /* =======================================================
     SAVE FAQ
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    const question = form.question.trim();
    const answer = form.answer.trim();
    const linkText = form.linkText.trim();
    const linkUrl = form.linkUrl.trim();

    if (!question || !answer) {
      setError("Please enter both the question and the answer.");
      return;
    }

    if (question.length > 300) {
      setError("The question cannot exceed 300 characters.");
      return;
    }

    if (answer.length > 5000) {
      setError("The answer cannot exceed 5000 characters.");
      return;
    }

    if (linkText.length > 100) {
      setError("Link text cannot exceed 100 characters.");
      return;
    }

    if (linkUrl.length > 500) {
      setError("Link URL cannot exceed 500 characters.");
      return;
    }

    if (Boolean(linkText) !== Boolean(linkUrl)) {
      setError(
        "Please provide both Link Text and Link URL, or leave both empty.",
      );
      return;
    }

    if (linkUrl.startsWith("//") || linkUrl.includes("\\")) {
      setError("Protocol-relative URLs and backslashes are not allowed.");
      return;
    }

    if (linkUrl && !isValidLink(linkUrl)) {
      setError("Use a website path such as /ielts or a complete HTTPS URL.");
      return;
    }

    const order = Number(form.order);

    if (form.order === "" || !Number.isInteger(order) || order < 0) {
      setError("Display order must be a non-negative whole number.");
      return;
    }

    const payload = {
      question,
      answer,
      linkText,
      linkUrl,
      isPublished: form.isPublished,
      order,
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateFAQ(editingId, payload);
        showSuccess("FAQ updated successfully.");
      } else {
        await createFAQ(payload);
        showSuccess("FAQ created successfully.");
      }

      setShowEditor(false);
      setEditingId(null);
      setForm({ ...INITIAL_FORM });

      await loadFAQs(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     PUBLISH / UNPUBLISH
  ======================================================= */

  const togglePublished = async (faq) => {
    if (busy) return;
    clearMessages();

    const id = getFAQId(faq);

    if (!id) {
      setError("Unable to identify this FAQ.");
      return;
    }

    setBusy(true);

    try {
      await updateFAQ(id, { ...toPayload(faq), isPublished: !faq.isPublished });

      setFaqs((previous) =>
        previous.map((item) =>
          getFAQId(item) === id
            ? { ...item, isPublished: !item.isPublished }
            : item,
        ),
      );

      showSuccess(
        faq.isPublished
          ? "FAQ unpublished successfully."
          : "FAQ published successfully.",
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /* =======================================================
     DELETE FAQ
  ======================================================= */

  const handleDelete = async (faq) => {
    if (busy) return;

    const id = getFAQId(faq);

    if (!id) {
      setError("Unable to identify this FAQ.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete this FAQ?\n\n"${faq.question}"\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    clearMessages();
    setBusy(true);

    try {
      await deleteFAQ(id);

      setFaqs((previous) => previous.filter((item) => getFAQId(item) !== id));
      setExpandedIds((previous) =>
        previous.filter((expandedId) => expandedId !== id),
      );

      if (editingId === id) {
        setShowEditor(false);
        setEditingId(null);
        setForm({ ...INITIAL_FORM });
      }

      showSuccess("FAQ deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /* =======================================================
     REORDER FAQs
     Orders are re-numbered 0..n-1 and EVERY FAQ whose number
     changed is saved, so duplicate / gapped order values in the
     database can no longer cause the list to jump back on reload.
  ======================================================= */

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all";

  const moveFAQ = async (faq, direction) => {
    if (busy || hasActiveFilter) return;

    const currentIndex = faqs.findIndex(
      (item) => getFAQId(item) === getFAQId(faq),
    );
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= faqs.length) {
      return;
    }

    clearMessages();

    const previousOrders = new Map(
      faqs.map((item) => [getFAQId(item), item.order]),
    );

    const reordered = [...faqs];
    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];

    const updatedOrder = reordered.map((item, index) => ({
      ...item,
      order: index,
    }));

    const changed = updatedOrder.filter(
      (item) => previousOrders.get(getFAQId(item)) !== item.order,
    );

    // optimistic update
    setFaqs(updatedOrder);
    setBusy(true);

    try {
      await Promise.all(
        changed.map((item) => updateFAQ(getFAQId(item), toPayload(item))),
      );
      showSuccess("FAQ display order updated.");
    } catch (err) {
      setError(`Could not save the new display order. ${getErrorMessage(err)}`);
      await loadFAQs(true);
    } finally {
      setBusy(false);
    }
  };

  /* =======================================================
     EXPAND / COLLAPSE
  ======================================================= */

  const toggleExpanded = (id) => {
    setExpandedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  /* =======================================================
     FILTERS AND COUNTS
  ======================================================= */

  const filteredFAQs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        !normalizedSearch ||
        faq.question.toLowerCase().includes(normalizedSearch) ||
        faq.answer.toLowerCase().includes(normalizedSearch) ||
        faq.linkText.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && faq.isPublished) ||
        (statusFilter === "unpublished" && !faq.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [faqs, search, statusFilter]);

  const publishedCount = faqs.filter((faq) => faq.isPublished).length;
  const unpublishedCount = faqs.length - publishedCount;

  const previewLinkText = form.linkText.trim();
  const previewLinkUrl = form.linkUrl.trim();
  const showPreviewLink =
    previewLinkText && previewLinkUrl && isValidLink(previewLinkUrl);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-faqs">
      <style>{STYLES}</style>

      {/* HEADER */}
      <header className="faq-header">
        <div>
          <div className="faq-eyebrow">
            <MessageCircle size={15} />
            Content Management
          </div>

          <h1>Frequently Asked Questions</h1>

          <p>
            Manage the questions learners ask most often. Write clear answers,
            add helpful page links, and control which FAQs appear on the Jashna
            Edu website.
          </p>
        </div>

        <button
          type="button"
          className="faq-primary-button"
          onClick={openCreateForm}
          disabled={saving}
        >
          <Plus size={19} />
          Add New FAQ
        </button>
      </header>

      {/* NOTIFICATIONS (shown inside the editor while it is open) */}
      {!showEditor && <Notices error={error} success={success} />}

      {/* STATISTICS */}
      <section className="faq-stats">
        <StatCard
          icon={FileQuestion}
          label="Total FAQs"
          value={faqs.length}
          accent={COLORS.blue}
        />
        <StatCard
          icon={Eye}
          label="Published"
          value={publishedCount}
          accent={COLORS.mintDark}
        />
        <StatCard
          icon={EyeOff}
          label="Unpublished"
          value={unpublishedCount}
          accent="#B88935"
        />
      </section>

      {/* CREATE / EDIT FORM */}
      {showEditor && (
        <section className="faq-editor">
          <div className="faq-editor-header">
            <div>
              <h2>{editingId ? "Edit FAQ" : "Create a New FAQ"}</h2>
              <p>Fields marked with * are required.</p>
            </div>

            <button
              type="button"
              className="faq-icon-button"
              onClick={closeEditor}
              disabled={saving}
              aria-label="Close FAQ editor"
              title="Close (Esc)"
            >
              <X size={19} />
            </button>
          </div>

          <form className="faq-form" onSubmit={handleSubmit}>
            <div className="faq-form-grid">
              {/* QUESTION */}
              <div className="faq-field faq-field-full">
                <FieldLabel required htmlFor="faq-question">
                  Question
                </FieldLabel>

                <input
                  id="faq-question"
                  type="text"
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  placeholder="e.g. Which English communication programs do you offer?"
                  maxLength={300}
                  required
                />

                <small className="faq-input-counter">
                  {form.question.length}/300 characters
                </small>
              </div>

              {/* ANSWER */}
              <div className="faq-field faq-field-full">
                <FieldLabel required htmlFor="faq-answer">
                  Answer
                </FieldLabel>

                <textarea
                  id="faq-answer"
                  name="answer"
                  value={form.answer}
                  onChange={handleChange}
                  placeholder="Write a helpful, clear answer for your website visitors..."
                  rows={6}
                  maxLength={5000}
                  required
                />

                <small className="faq-input-counter">
                  {form.answer.length}/5000 characters
                </small>
              </div>
            </div>

            {/* OPTIONAL LINK */}
            <section className="faq-link-section">
              <h3>Optional: Add a Related Link</h3>

              <p>
                Direct visitors to a relevant page, such as IELTS, Programs,
                Events, or an external resource. Leave both fields empty if no
                link is needed.
              </p>

              <div className="faq-link-grid">
                <div className="faq-field">
                  <FieldLabel htmlFor="faq-link-text">Link Text</FieldLabel>

                  <input
                    id="faq-link-text"
                    type="text"
                    name="linkText"
                    value={form.linkText}
                    onChange={handleChange}
                    placeholder="e.g. Explore Our IELTS Program"
                    maxLength={100}
                  />

                  <small>The clickable text visitors will see.</small>
                </div>

                <div className="faq-field">
                  <FieldLabel htmlFor="faq-link-url">Link URL</FieldLabel>

                  <input
                    id="faq-link-url"
                    type="text"
                    name="linkUrl"
                    value={form.linkUrl}
                    onChange={handleChange}
                    placeholder="/ielts"
                    maxLength={500}
                  />

                  <small>
                    Use /ielts for an internal page or a complete HTTPS address
                    for an external page.
                  </small>
                </div>
              </div>
            </section>

            {/* DISPLAY SETTINGS */}
            <div className="faq-form-grid">
              <div className="faq-field">
                <FieldLabel htmlFor="faq-order">Display Order</FieldLabel>

                <input
                  id="faq-order"
                  type="number"
                  name="order"
                  min="0"
                  step="1"
                  value={form.order}
                  onChange={handleChange}
                  required
                />

                <small>
                  Lower numbers appear first. FAQs with the same order use their
                  creation date as a secondary sort.
                </small>
              </div>
            </div>

            <label className="faq-checkbox-row">
              <span className="faq-checkbox-copy">
                <strong>Publish this FAQ</strong>
                <span>
                  Published FAQs can appear on the public website. Unpublished
                  FAQs remain available in the admin panel.
                </span>
              </span>

              <input
                type="checkbox"
                name="isPublished"
                className="faq-switch"
                checked={form.isPublished}
                onChange={handleChange}
                aria-label="Publish FAQ"
              />
            </label>

            {/* LIVE PREVIEW */}
            <div className="faq-preview">
              <div className="faq-preview-label">
                <Eye size={15} />
                Live Preview
              </div>

              <h3>
                {form.question.trim() || "Your question will appear here"}
              </h3>

              <p>
                {form.answer.trim() ||
                  "Your answer will appear here as you type."}
              </p>

              {showPreviewLink && (
                <span className="faq-preview-link">
                  {previewLinkText}
                  <ExternalLink size={14} />
                </span>
              )}
            </div>

            {/* ERRORS appear right above the buttons so they are never missed */}
            <Notices error={error} success={success} />

            {/* FORM ACTIONS */}
            <div className="faq-form-actions">
              <button
                type="button"
                className="faq-secondary-button"
                onClick={closeEditor}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="faq-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={17} className="faq-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    {editingId ? "Save Changes" : "Create FAQ"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FAQ LIST TOOLBAR */}
      <section>
        <div className="faq-toolbar">
          <h2>
            All FAQs <span>({filteredFAQs.length})</span>
          </h2>

          <div className="faq-toolbar-controls">
            <label className="faq-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search FAQs..."
                aria-label="Search FAQs"
              />
            </label>

            <label className="faq-filter">
              <ChevronDown size={15} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter FAQs by status"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </label>

            <button
              type="button"
              className="faq-icon-button"
              onClick={() => loadFAQs()}
              disabled={loading}
              aria-label="Refresh FAQs"
              title="Refresh"
            >
              <RefreshCw size={17} className={loading ? "faq-spinner" : ""} />
            </button>
          </div>
        </div>

        {hasActiveFilter && faqs.length > 1 && (
          <p className="faq-reorder-hint">
            Clear the search and status filter to change the display order.
          </p>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="faq-loading">
            <LoaderCircle size={22} className="faq-spinner" />
            Loading FAQs...
          </div>
        ) : filteredFAQs.length === 0 ? (
          /* EMPTY STATE */
          <div className="faq-empty">
            <div className="faq-empty-icon">
              <FileQuestion size={29} />
            </div>

            <h3>
              {faqs.length === 0
                ? "No FAQs created yet"
                : "No matching FAQs found"}
            </h3>

            <p>
              {faqs.length === 0
                ? "Start by adding the questions learners frequently ask about Jashna Edu's programs, admissions, and learning experience."
                : "Try another search term or change the publication filter."}
            </p>

            {faqs.length === 0 && (
              <button
                type="button"
                className="faq-primary-button"
                onClick={openCreateForm}
              >
                <Plus size={18} />
                Create Your First FAQ
              </button>
            )}
          </div>
        ) : (
          /* FAQ CARDS */
          <div className="faq-list">
            {filteredFAQs.map((faq) => {
              const id = getFAQId(faq);
              const expanded = expandedIds.includes(id);
              const listIndex = faqs.findIndex((item) => getFAQId(item) === id);
              const canExpand =
                faq.answer.length > 140 || faq.answer.includes("\n");
              const linkIsExternal = !faq.linkUrl.startsWith("/");

              return (
                <article key={id} className="faq-item">
                  <div className="faq-item-main">
                    {/* ORDER CONTROLS */}
                    <div
                      className="faq-order-controls"
                      aria-label={`Display order ${faq.order}`}
                    >
                      <button
                        type="button"
                        className="faq-icon-button"
                        onClick={() => moveFAQ(faq, -1)}
                        disabled={
                          listIndex <= 0 || loading || busy || hasActiveFilter
                        }
                        title="Move up"
                        aria-label="Move FAQ up"
                      >
                        <ArrowUp size={15} />
                      </button>

                      <span className="faq-order-number">{faq.order}</span>

                      <button
                        type="button"
                        className="faq-icon-button"
                        onClick={() => moveFAQ(faq, 1)}
                        disabled={
                          listIndex < 0 ||
                          listIndex >= faqs.length - 1 ||
                          loading ||
                          busy ||
                          hasActiveFilter
                        }
                        title="Move down"
                        aria-label="Move FAQ down"
                      >
                        <ArrowDown size={15} />
                      </button>
                    </div>

                    {/* CONTENT */}
                    <div className="faq-item-content">
                      <div className="faq-item-topline">
                        <StatusBadge published={faq.isPublished} />

                        {faq.linkUrl && (
                          <span className="faq-status faq-status-published">
                            <ExternalLink size={11} />
                            Has link
                          </span>
                        )}
                      </div>

                      <h3>{faq.question}</h3>

                      <div className="faq-item-meta">
                        <span>Order: {faq.order}</span>
                        <span>Created: {formatDate(faq.createdAt)}</span>
                      </div>

                      <p
                        className={`faq-item-answer ${
                          expanded ? "" : "faq-item-answer-collapsed"
                        }`}
                      >
                        {faq.answer}
                      </p>

                      {canExpand && (
                        <button
                          type="button"
                          className="faq-expand-button"
                          aria-expanded={expanded}
                          onClick={() => toggleExpanded(id)}
                        >
                          {expanded ? (
                            <>
                              Show less
                              <ChevronUp size={15} />
                            </>
                          ) : (
                            <>
                              Read full answer
                              <ChevronDown size={15} />
                            </>
                          )}
                        </button>
                      )}

                      {faq.linkText && faq.linkUrl && (
                        <div>
                          {/* always opens in a new tab so the admin page is never lost */}
                          <a
                            className="faq-item-link"
                            href={faq.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={
                              linkIsExternal
                                ? "Opens an external page"
                                : "Opens this page of the website"
                            }
                          >
                            {faq.linkText}
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="faq-item-actions">
                      <button
                        type="button"
                        className="faq-icon-button"
                        onClick={() => togglePublished(faq)}
                        disabled={busy}
                        title={
                          faq.isPublished ? "Unpublish FAQ" : "Publish FAQ"
                        }
                        aria-label={
                          faq.isPublished ? "Unpublish FAQ" : "Publish FAQ"
                        }
                      >
                        {faq.isPublished ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="faq-icon-button"
                        onClick={() => openEditForm(faq)}
                        disabled={busy}
                        title="Edit FAQ"
                        aria-label="Edit FAQ"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="faq-icon-button faq-delete-button"
                        onClick={() => handleDelete(faq)}
                        disabled={busy}
                        title="Delete FAQ"
                        aria-label="Delete FAQ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
