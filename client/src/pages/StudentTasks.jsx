import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  LoaderCircle,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Send,
  Upload,
  Video,
  Image as ImageIcon,
  Music,
  File,
  ClipboardCheck,
  CircleHelp,
  Trophy,
} from "lucide-react";

import { API_URL } from "../config";

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getStatusStyle = (status) => {
  const styles = {
    assigned: {
      className: "st-status-pending",
      label: "Pending",
    },
    submitted: {
      className: "st-status-submitted",
      label: "Submitted",
    },
    late_submitted: {
      className: "st-status-late",
      label: "Submitted Late",
    },
    reviewed: {
      className: "st-status-reviewed",
      label: "Reviewed",
    },
    overdue: {
      className: "st-status-overdue",
      label: "Overdue",
    },
  };

  return styles[status] || styles.assigned;
};

const getFileIcon = (type) => {
  if (type === "video") return Video;
  if (type === "image") return ImageIcon;
  if (type === "audio") return Music;
  if (type === "document" || type === "text_file") return FileText;

  if (type === "mcq") return ClipboardCheck;

  return File;
};

const isSubmittedStatus = (status) =>
  ["submitted", "late_submitted", "reviewed"].includes(status);

const STYLES = `
  .st-root, .st-root * {
    font-family: "Times New Roman", Times, serif !important;
    box-sizing: border-box;
  }

  .st-root {
    min-height: 100%;
    background: linear-gradient(180deg, #F4F6FA 0%, #F7F8FB 100%);
    padding: 32px;
    color: #102B4E;
  }

  @keyframes stSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes stFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes stPop {
    0% { opacity: 0; transform: scale(0.96); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes stFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7px); }
  }

  @keyframes stShimmer {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(260%); }
  }

  .student-task-spin { animation: stSpin 1s linear infinite; }
  .st-fade-up { animation: stFadeUp 0.45s ease both; }
  .st-pop { animation: stPop 0.3s ease both; }
  .st-float { animation: stFloat 2.8s ease-in-out infinite; }

  .st-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 18px;
    margin-bottom: 28px;
    padding: 30px 34px;
    border-radius: 22px;
    background: linear-gradient(135deg, #102B4E 0%, #17375F 100%);
    color: #FFFFFF;
    box-shadow: 0 16px 38px rgba(16, 43, 78, 0.18);
    position: relative;
    overflow: hidden;
  }

  .st-header::after {
    content: "";
    position: absolute;
    right: -70px;
    top: -90px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    border: 36px solid rgba(255, 255, 255, 0.06);
    pointer-events: none;
  }

  .st-eyebrow {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: #9DB8D9;
  }

  .st-title {
    font-size: 44px;
    line-height: 1.1;
    font-weight: 700;
    margin: 8px 0 10px;
  }

  .st-subtitle {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.78);
    max-width: 620px;
    line-height: 1.5;
  }

  .st-btn {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 9px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease,
      background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  }

  .st-btn:hover:not(:disabled) { transform: translateY(-3px); }
  .st-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }

  .st-btn:focus-visible {
    outline: 3px solid rgba(51, 141, 253, 0.45);
    outline-offset: 2px;
  }

  .st-btn-primary {
    border: 2px solid #102B4E;
    padding: 13px 22px;
    background: #102B4E;
    color: #FFFFFF;
    box-shadow: 0 6px 16px rgba(16, 43, 78, 0.2);
  }

  .st-btn-primary:hover:not(:disabled) {
    background: #1B4170;
    border-color: #1B4170;
    box-shadow: 0 12px 26px rgba(16, 43, 78, 0.3);
  }

  .st-btn-primary::after {
    content: "";
    position: absolute;
    inset: 0;
    width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
    transform: translateX(-120%);
  }

  .st-btn-primary:hover:not(:disabled)::after {
    animation: stShimmer 0.9s ease;
  }

  .st-btn-secondary {
    border: 2px solid #CBD7E6;
    padding: 12px 20px;
    background: #FFFFFF;
    color: #102B4E;
    box-shadow: 0 3px 10px rgba(16, 43, 78, 0.06);
  }

  .st-btn-secondary:hover:not(:disabled) {
    border-color: #102B4E;
    background: #102B4E;
    color: #FFFFFF;
    box-shadow: 0 10px 22px rgba(16, 43, 78, 0.22);
  }

  .st-btn-light {
    border: 2px solid rgba(255, 255, 255, 0.35);
    padding: 12px 22px;
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
  }

  .st-btn-light:hover:not(:disabled) {
    background: #FFFFFF;
    color: #102B4E;
    border-color: #FFFFFF;
  }

  .st-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .st-back { margin-bottom: 20px; }

  .st-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 18px;
    margin-bottom: 28px;
  }

  .st-stat {
    background: #FFFFFF;
    border: 2px solid #DDE5EF;
    border-radius: 18px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 4px 14px rgba(16, 43, 78, 0.05);
    position: relative;
    overflow: hidden;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }

  .st-stat::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 4px;
    background: #102B4E;
  }

  .st-stat:hover {
    transform: translateY(-5px);
    border-color: #A9BDD6;
    box-shadow: 0 18px 36px rgba(16, 43, 78, 0.14);
  }

  .st-stat-label {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #5B6B80;
  }

  .st-stat-value {
    margin: 8px 0 0;
    font-size: 46px;
    line-height: 1;
    font-weight: 700;
    color: #102B4E;
  }

  .st-stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EEF2F8;
    color: #102B4E;
    flex-shrink: 0;
  }

  .st-list-card {
    background: #FFFFFF;
    border: 2px solid #DDE5EF;
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(16, 43, 78, 0.06);
  }

  .st-list-header {
    padding: 24px 28px;
    border-bottom: 2px solid #E8EDF4;
    background: #FAFBFD;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
  }

  .st-list-title {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #102B4E;
  }

  .st-count-pill {
    display: inline-block;
    margin-left: 12px;
    padding: 3px 12px;
    border-radius: 999px;
    background: #EAF0F8;
    color: #2A4C78;
    font-size: 18px;
    font-weight: 700;
  }

  .st-filter {
    border: 2px solid #CBD7E6;
    border-radius: 12px;
    padding: 12px 16px;
    background: #FFFFFF;
    color: #102B4E;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
  }

  .st-task-list {
    padding: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 22px;
  }

  .st-task-card {
    position: relative;
    border: 2px solid #DDE5EF;
    border-radius: 18px;
    padding: 24px 24px 22px 28px;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    animation: stFadeUp 0.45s ease both;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  }

  .st-task-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background: #9DB3CE;
    transition: width 0.25s ease;
  }

  .st-task-card.is-pending::before { background: #5F86B8; }
  .st-task-card.is-submitted::before { background: #4E9A7E; }
  .st-task-card.is-late::before { background: #C2924A; }
  .st-task-card.is-reviewed::before { background: #8068B5; }
  .st-task-card.is-overdue::before { background: #C25555; }

  .st-task-card:hover {
    transform: translateY(-6px);
    border-color: #A9BDD6;
    box-shadow: 0 22px 44px rgba(16, 43, 78, 0.15);
  }

  .st-task-card:hover::before { width: 9px; }

  .st-task-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
  }

  .st-task-head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .st-task-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    padding: 0 8px;
    border-radius: 999px;
    background: #102B4E;
    color: #FFFFFF;
    font-size: 17px;
    font-weight: 700;
  }

  .st-task-title {
    font-size: 28px;
    line-height: 1.2;
    font-weight: 700;
    margin: 14px 0 8px;
    color: #102B4E;
    overflow-wrap: anywhere;
  }

  .st-task-desc {
    color: #55667C;
    font-size: 19px;
    line-height: 1.55;
    margin: 0;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .st-task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 20px 0 16px;
  }

  .st-meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 13px;
    border-radius: 10px;
    background: #F1F4F9;
    color: #3D5169;
    font-size: 16px;
    font-weight: 700;
    text-transform: capitalize;
  }

  .st-task-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: auto;
    padding-top: 16px;
    border-top: 2px solid #EDF1F6;
  }

  .st-task-note {
    color: #5B6B80;
    font-size: 16px;
    font-weight: 700;
  }

  .st-category {
    display: inline-block;
    padding: 6px 13px;
    border-radius: 8px;
    background: #EAF0F8;
    color: #2A4C78;
    font-size: 15px;
    font-weight: 700;
  }

  .st-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    border: 2px solid transparent;
  }

  .st-status-pending { background: #EEF3FA; color: #2F5A94; border-color: #D5E0EF; }
  .st-status-submitted { background: #E9F4EF; color: #226B52; border-color: #C9E3D7; }
  .st-status-late { background: #FBF2E3; color: #8F5A12; border-color: #EFD9B4; }
  .st-status-reviewed { background: #F0ECF8; color: #5B3FA0; border-color: #DCD3EE; }
  .st-status-overdue { background: #FBEAEA; color: #A32626; border-color: #EFC7C7; }

  .st-empty {
    padding: 70px 20px;
    text-align: center;
    color: #102B4E;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .st-empty h3 {
    margin: 10px 0 0;
    font-size: 30px;
    font-weight: 700;
  }

  .st-empty p {
    margin: 0;
    font-size: 20px;
    color: #5B6B80;
    overflow-wrap: anywhere;
  }

  .st-empty-icon {
    width: 84px;
    height: 84px;
    background: #102B4E;
    color: #FFFFFF;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 26px rgba(16, 43, 78, 0.22);
  }

  .st-detail {
    background: #FFFFFF;
    border: 2px solid #DDE5EF;
    border-radius: 22px;
    padding: 34px;
    max-width: 1080px;
    margin: 0 auto;
    box-shadow: 0 10px 30px rgba(16, 43, 78, 0.08);
    animation: stFadeUp 0.45s ease both;
  }

  .st-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 22px;
    flex-wrap: wrap;
    padding-bottom: 26px;
    border-bottom: 2px solid #E8EDF4;
  }

  .st-detail-title {
    font-size: 42px;
    line-height: 1.15;
    font-weight: 700;
    margin: 14px 0 10px;
    color: #102B4E;
    overflow-wrap: anywhere;
  }

  .st-detail-desc {
    margin: 0;
    color: #55667C;
    font-size: 20px;
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .st-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    padding: 26px 0 4px;
  }

  .st-info-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    background: #F6F8FB;
    border: 2px solid #E3E9F1;
    border-radius: 14px;
    min-width: 0;
  }

  .st-info-icon {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    border-radius: 12px;
    background: #FFFFFF;
    color: #102B4E;
    border: 2px solid #DDE5EF;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .st-info-label {
    color: #5B6B80;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .st-info-value {
    margin-top: 4px;
    font-size: 18px;
    font-weight: 700;
    text-transform: capitalize;
    color: #102B4E;
    overflow-wrap: anywhere;
  }

  .st-section {
    margin-top: 24px;
    padding: 24px;
    border: 2px solid #E0E8F1;
    border-radius: 16px;
    background: #FFFFFF;
    animation: stFadeUp 0.45s ease both;
  }

  .st-section-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 14px;
    color: #102B4E;
    padding-left: 14px;
    border-left: 5px solid #102B4E;
  }

  .st-section p {
    font-size: 19px;
    font-weight: 500;
    color: #34475F;
  }

  .st-textarea {
    width: 100%;
    min-height: 220px;
    resize: vertical;
    border: 2px solid #CBD7E6;
    border-radius: 14px;
    padding: 16px;
    font-size: 19px;
    line-height: 1.6;
    color: #102B4E;
    background: #FFFFFF;
  }

  .st-textarea:focus {
    outline: none;
    border-color: #338DFD;
    box-shadow: 0 0 0 4px rgba(51, 141, 253, 0.15);
  }

  .st-textarea:disabled {
    background: #F3F5F8;
    cursor: not-allowed;
  }

  .st-upload {
    border: 3px dashed #B7C9E0;
    border-radius: 16px;
    padding: 40px 18px;
    background: #F7F9FC;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    text-align: center;
    transition: transform 0.22s ease, border-color 0.22s ease,
      background-color 0.22s ease, box-shadow 0.22s ease;
  }

  .st-upload:hover {
    transform: translateY(-3px);
    border-color: #102B4E;
    background: #EEF3FA;
    box-shadow: 0 14px 30px rgba(16, 43, 78, 0.12);
  }

  .st-upload-icon {
    width: 62px;
    height: 62px;
    border-radius: 18px;
    background: #102B4E;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .st-upload strong { font-size: 22px; color: #102B4E; }
  .st-upload span { font-size: 17px; font-weight: 600; color: #5B6B80; }

  .st-file-row,
  .st-file-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 2px solid #E0E8F1;
    border-radius: 12px;
    margin-top: 10px;
    font-size: 17px;
    font-weight: 700;
    color: #102B4E;
    background: #FFFFFF;
    overflow-wrap: anywhere;
  }

  .st-file-link {
    text-decoration: none;
    transition: transform 0.2s ease, border-color 0.2s ease,
      background-color 0.2s ease, box-shadow 0.2s ease;
  }

  .st-file-link:hover {
    transform: translateX(4px);
    border-color: #102B4E;
    background: #F1F5FA;
  }

  .st-file-size { color: #5B6B80; font-weight: 700; }

  .st-message {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border-radius: 12px;
    padding: 15px 18px;
    margin-top: 16px;
    line-height: 1.5;
    font-size: 18px;
    font-weight: 700;
    border: 2px solid transparent;
    overflow-wrap: anywhere;
  }

  .st-message.is-error { background: #FBEAEA; color: #A32626; border-color: #EFC7C7; }
  .st-message.is-success { background: #E9F4EF; color: #226B52; border-color: #C9E3D7; }

  .st-warning {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 18px;
    border-radius: 12px;
    background: #FBF2E3;
    border: 2px solid #EFD9B4;
    color: #8F5A12;
    margin-top: 20px;
    font-size: 18px;
    font-weight: 700;
  }

  .st-feedback {
    margin-top: 24px;
    padding: 24px;
    border-radius: 16px;
    border: 2px solid #C9E3D7;
    background: #F2F8F5;
    animation: stFadeUp 0.45s ease both;
  }

  .st-feedback p {
    font-size: 19px;
    font-weight: 500;
    color: #2B4A3F;
    overflow-wrap: anywhere;
  }

  .st-submitted-on {
    color: #5B6B80;
    margin: 18px 0 0;
    font-size: 17px;
    font-weight: 700;
  }

  .st-submit-wrap { margin-top: 20px; }

  /* ---------- MCQ interface ---------- */

  .st-mcq-intro {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #EEF4FB;
    border: 2px solid #D6E4F4;
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 22px;
    color: #294B73;
    font-size: 18px;
    line-height: 1.5;
  }

  .st-mcq-progress {
    height: 10px;
    border-radius: 999px;
    background: #E4EAF2;
    overflow: hidden;
    margin: 12px 0 8px;
  }

  .st-mcq-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #338DFD, #4E9A7E);
    border-radius: inherit;
    transition: width 0.25s ease;
  }

  .st-mcq-question {
    border: 2px solid #DDE5EF;
    border-radius: 16px;
    padding: 22px;
    margin-top: 18px;
    background: #FFFFFF;
    scroll-margin-top: 24px;
  }

  .st-mcq-question.is-unanswered {
    border-color: #D9A0A0;
    background: #FFFBFB;
  }

  .st-mcq-question-heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
  }

  .st-mcq-question-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    border-radius: 12px;
    background: #102B4E;
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 700;
  }

  .st-mcq-question-text {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.5;
    color: #102B4E;
    margin: 3px 0 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .st-mcq-option {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 15px 16px;
    margin-top: 10px;
    border: 2px solid #DDE5EF;
    border-radius: 12px;
    cursor: pointer;
    background: #FFFFFF;
    transition: border-color 0.18s ease, background-color 0.18s ease,
      transform 0.18s ease, box-shadow 0.18s ease;
  }

  .st-mcq-option:hover:not(.is-disabled) {
    border-color: #7CA4D5;
    background: #F5F8FD;
    transform: translateX(3px);
  }

  .st-mcq-option.is-selected {
    border-color: #338DFD;
    background: #EDF5FF;
    box-shadow: 0 0 0 2px rgba(51, 141, 253, 0.09);
  }

  .st-mcq-option.is-disabled {
    cursor: default;
  }

  .st-mcq-option input {
    width: 19px;
    height: 19px;
    flex-shrink: 0;
    margin: 3px 0 0;
    accent-color: #102B4E;
    cursor: inherit;
  }

  .st-mcq-option-text {
    font-size: 19px;
    line-height: 1.5;
    color: #34475F;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .st-mcq-result {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 22px;
    padding: 24px;
    border: 2px solid #C9E3D7;
    border-radius: 16px;
    background: linear-gradient(135deg, #F2F8F5, #FFFFFF);
  }

  .st-mcq-result-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 62px;
    height: 62px;
    border-radius: 18px;
    background: #E0F0E8;
    color: #226B52;
    flex-shrink: 0;
  }

  .st-mcq-score {
    margin: 2px 0;
    font-size: 38px;
    font-weight: 700;
    color: #226B52;
  }

  .st-mcq-result-label {
    margin: 0;
    color: #416657;
    font-size: 17px;
    font-weight: 700;
  }

  .st-mcq-review {
    margin-top: 24px;
  }

  .st-mcq-review-item {
    padding: 18px;
    margin-top: 12px;
    border: 2px solid #DDE5EF;
    border-radius: 12px;
    background: #FFFFFF;
  }

  .st-mcq-review-item.is-correct {
    border-color: #C9E3D7;
    background: #F4FAF6;
  }

  .st-mcq-review-item.is-incorrect {
    border-color: #EFC7C7;
    background: #FFFAFA;
  }

  .st-mcq-review-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .st-mcq-review-item.is-correct .st-mcq-review-status { color: #226B52; }
  .st-mcq-review-item.is-incorrect .st-mcq-review-status { color: #A32626; }

  .st-mcq-review-answer {
    margin-top: 7px;
    color: #34475F;
    font-size: 17px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .st-mcq-review-answer strong { color: #102B4E; }

  @media (max-width: 760px) {
    .st-root { padding: 16px; }
    .st-header { padding: 22px; }
    .st-title { font-size: 34px; }
    .st-detail { padding: 20px; }
    .st-detail-title { font-size: 32px; }
    .st-task-list { grid-template-columns: 1fr; padding: 16px; }
    .st-section { padding: 17px; }
    .st-mcq-question { padding: 16px; }
    .st-mcq-question-text { font-size: 20px; }
    .st-mcq-option-text { font-size: 18px; }
    .st-task-top { flex-wrap: wrap; }
  }

  @media (prefers-reduced-motion: reduce) {
    .st-root *, .st-root *::before, .st-root *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/*
Checks a pasted YouTube link (watch, youtu.be, embed, shorts).
Must match the validation done by the backend.
*/
const isValidYouTubeLink = (value) => {
  try {
    const url = new URL(String(value || "").trim());

    if (url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");

    if (host === "youtu.be") {
      return url.pathname.length > 1;
    }

    if (host === "youtube.com") {
      if (url.pathname === "/watch") return Boolean(url.searchParams.get("v"));
      return /^\/(embed|shorts)\/[\w-]+/.test(url.pathname);
    }

    return false;
  } catch {
    return false;
  }
};

export default function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const [submissionText, setSubmissionText] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const getToken = () => localStorage.getItem("studentToken");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again to view your tasks.");
      }

      const response = await fetch(`${API_URL}/api/student-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load tasks.");
      }

      const loadedTasks = data.tasks || [];
      setTasks(loadedTasks);

      setSelectedTask((current) => {
        if (!current) return null;

        return (
          loadedTasks.find(
            (task) => task.assignmentId === current.assignmentId,
          ) || null
        );
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const openTask = (task) => {
    setSelectedTask(task);
    setSubmissionText(task.submissionText || "");
    setVideoLink(task.submissionText || "");
    setSelectedFiles([]);
    setMessage("");
    setMessageType("success");

    // Restore previously saved answers if the API returns them.
    const savedAnswers = {};
    (task.mcqAnswers || []).forEach((answer) => {
      if (
        Number.isInteger(Number(answer.questionIndex)) &&
        Number.isInteger(Number(answer.selectedOptionIndex))
      ) {
        savedAnswers[Number(answer.questionIndex)] = Number(
          answer.selectedOptionIndex,
        );
      }
    });

    setMcqAnswers(savedAnswers);
  };

  const closeTask = () => {
    setSelectedTask(null);
    setSelectedFiles([]);
    setSubmissionText("");
    setVideoLink("");
    setMcqAnswers({});
    setMessage("");
    setMessageType("success");
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!selectedTask) return;

    const maxFiles = selectedTask.maxFiles || 1;
    const maxSize = (selectedTask.maxFileSizeMB || 10) * 1024 * 1024;

    if (files.length > maxFiles) {
      setMessage(`You can select up to ${maxFiles} file(s).`);
      setMessageType("error");
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxSize);

    if (oversizedFile) {
      setMessage(
        `Each file must be ${selectedTask.maxFileSizeMB || 10} MB or smaller.`,
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    setSelectedFiles(files);
    setMessage("");
    setMessageType("success");
  };

  const handleMcqAnswerChange = (questionIndex, optionIndex) => {
    if (!selectedTask?.canSubmit || submitting) return;

    setMcqAnswers((current) => ({
      ...current,
      [questionIndex]: optionIndex,
    }));

    setMessage("");
    setMessageType("success");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTask || submitting) return;

    const type = selectedTask.submissionType;
    const formData = new FormData();

    if (type === "mcq") {
      const questions = selectedTask.questions || [];

      if (!questions.length) {
        setMessage(
          "This MCQ task does not contain any questions. Please contact your teacher.",
        );
        setMessageType("error");
        return;
      }

      const unansweredIndex = questions.findIndex(
        (_, index) => !Number.isInteger(Number(mcqAnswers[index])) ||
          Number(mcqAnswers[index]) < 1 ||
          Number(mcqAnswers[index]) > (questions[index]?.options?.length || 0),
      );

      if (unansweredIndex !== -1) {
        setMessage(
          `Please answer all questions. Question ${unansweredIndex + 1} is unanswered.`,
        );
        setMessageType("error");

        document
          .getElementById(`st-mcq-question-${unansweredIndex}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });

        return;
      }

      const answers = questions.map((_, questionIndex) => ({
        questionIndex,
        selectedOptionIndex: Number(mcqAnswers[questionIndex]),
      }));

      formData.append("mcqAnswers", JSON.stringify(answers));
    } else if (type === "video") {
      if (!videoLink.trim()) {
        setMessage("Please paste your YouTube video link first.");
        setMessageType("error");
        return;
      }

      if (!isValidYouTubeLink(videoLink)) {
        setMessage(
          "Please enter a valid https YouTube link (youtube.com or youtu.be).",
        );
        setMessageType("error");
        return;
      }

      formData.append("submissionText", videoLink.trim());
    } else if (type === "text") {
      if (!submissionText.trim()) {
        setMessage("Please enter your answer first.");
        setMessageType("error");
        return;
      }

      formData.append("submissionText", submissionText);
    } else {
      if (selectedFiles.length === 0) {
        setMessage("Please select your submission file(s).");
        setMessageType("error");
        return;
      }

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
    }

    setSubmitting(true);
    setMessage("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again to submit your task.");
      }

      const response = await fetch(
        `${API_URL}/api/student-tasks/${selectedTask.assignmentId}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed.");
      }

      setMessage(
        type === "mcq" &&
          data.task?.mcqScore !== undefined &&
          data.task?.mcqTotalQuestions !== undefined
          ? `${data.message || "MCQ submitted successfully."} Your score: ${data.task.mcqScore}/${data.task.mcqTotalQuestions}.`
          : data.message || "Task submitted successfully.",
      );
      setMessageType("success");
      setSelectedFiles([]);

      // Refresh the server's saved status and score.
      await loadTasks();
    } catch (err) {
      setMessage(err.message || "Submission failed.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;

    if (filter === "pending") {
      return ["assigned", "overdue"].includes(task.status);
    }

    if (filter === "submitted") {
      return ["submitted", "late_submitted"].includes(task.status);
    }

    if (filter === "reviewed") {
      return task.status === "reviewed";
    }

    return true;
  });

  const pendingCount = tasks.filter((task) =>
    ["assigned", "overdue"].includes(task.status),
  ).length;

  const submittedCount = tasks.filter((task) =>
    ["submitted", "late_submitted", "reviewed"].includes(task.status),
  ).length;

  const reviewedCount = tasks.filter(
    (task) => task.status === "reviewed",
  ).length;

  if (selectedTask) {
    const statusStyle = getStatusStyle(selectedTask.status);
    const FileIcon = getFileIcon(selectedTask.submissionType);
    const readOnly = !selectedTask.canSubmit;
    const isMcq = selectedTask.submissionType === "mcq";
    const questions = isMcq ? selectedTask.questions || [] : [];
    const answeredCount = questions.filter((_, index) =>
      Number.isInteger(Number(mcqAnswers[index])) &&
      Number(mcqAnswers[index]) >= 1 &&
      Number(mcqAnswers[index]) <= (questions[index]?.options?.length || 0),
    ).length;

    const scoreAvailable =
      isMcq &&
      selectedTask.mcqScore !== null &&
      selectedTask.mcqScore !== undefined &&
      selectedTask.mcqTotalQuestions !== null &&
      selectedTask.mcqTotalQuestions !== undefined;

    return (
      <div className="st-root">
        <style>{STYLES}</style>

        <button
          type="button"
          onClick={closeTask}
          className="st-btn st-btn-secondary st-back"
        >
          <ArrowLeft size={21} />
          Back to Tasks
        </button>

        <div className="st-detail">
          <div className="st-detail-header">
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="st-category">
                {selectedTask.category || "General"}
              </div>

              <h1 className="st-detail-title">{selectedTask.title}</h1>

              <p className="st-detail-desc">{selectedTask.description}</p>
            </div>

            <span className={`st-status ${statusStyle.className}`}>
              {statusStyle.label}
            </span>
          </div>

          <div className="st-info-grid">
            <InfoItem
              icon={CalendarDays}
              label="Deadline"
              value={formatDate(selectedTask.dueDate)}
            />

            <InfoItem
              icon={FileIcon}
              label="Submission type"
              value={selectedTask.submissionType.replaceAll("_", " ")}
            />

            {isMcq ? (
              <InfoItem
                icon={ClipboardCheck}
                label="Questions"
                value={`${questions.length} question(s)`}
              />
            ) : selectedTask.submissionType === "video" ? (
              <InfoItem
                icon={Video}
                label="Submission"
                value="YouTube link"
              />
            ) : (
              <InfoItem
                icon={Paperclip}
                label="Upload limit"
                value={`${selectedTask.maxFiles ?? 1} file(s), ${selectedTask.maxFileSizeMB ?? 10} MB each`}
              />
            )}
          </div>

          {selectedTask.instructions && (
            <div className="st-section">
              <h3 className="st-section-title">Instructions</h3>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {selectedTask.instructions}
              </p>
            </div>
          )}

          {selectedTask.isPastDeadline &&
            selectedTask.status === "assigned" && (
              <div className="st-warning">
                <AlertCircle size={24} />
                <span>
                  The deadline has passed.
                  {selectedTask.allowLateSubmission
                    ? " Late submissions are allowed."
                    : " Submissions are closed."}
                </span>
              </div>
            )}

          {isMcq && !readOnly && (
            <div className="st-section">
              <h3 className="st-section-title">Assessment Progress</h3>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  color: "#34475F",
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                <span>Questions answered</span>
                <span>
                  {answeredCount} of {questions.length}
                </span>
              </div>

              <div
                className="st-mcq-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={questions.length}
                aria-valuenow={answeredCount}
                aria-label="Questions answered"
              >
                <div
                  className="st-mcq-progress-fill"
                  style={{
                    width: questions.length
                      ? `${(answeredCount / questions.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>

              <p style={{ margin: "8px 0 0", fontSize: 16 }}>
                Please answer every question before submitting. Your score is
                calculated automatically.
              </p>
            </div>
          )}

          {isMcq && scoreAvailable && (
            <div className="st-mcq-result">
              <div className="st-mcq-result-icon">
                <Trophy size={32} />
              </div>

              <div>
                <p className="st-mcq-result-label">Your MCQ Result</p>
                <h2 className="st-mcq-score">
                  {selectedTask.mcqScore}/{selectedTask.mcqTotalQuestions}
                </h2>
                <p className="st-mcq-result-label">
                  {selectedTask.mcqTotalQuestions > 0
                    ? `${Math.round(
                        (selectedTask.mcqScore /
                          selectedTask.mcqTotalQuestions) *
                          100,
                      )}% score`
                    : "Assessment completed"}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isMcq ? (
              <div className="st-section">
                <h3 className="st-section-title">
                  {readOnly ? "Your Answers" : "Answer the Questions"}
                </h3>

                <div className="st-mcq-intro">
                  <CircleHelp size={25} style={{ flexShrink: 0 }} />
                  <span>
                    {readOnly
                      ? "Your submitted selections are shown below."
                      : "Choose one option for every question. Your answers will be submitted together, and your score will appear after submission."}
                  </span>
                </div>

                {questions.length === 0 ? (
                  <div className="st-message is-error">
                    <AlertCircle size={23} />
                    No questions were found for this MCQ assessment. Please
                    contact your teacher.
                  </div>
                ) : (
                  questions.map((question, questionIndex) => {
                    const selectedOption = Number(
                      mcqAnswers[questionIndex] || 0,
                    );

                    const savedAnswer = (selectedTask.mcqAnswers || []).find(
                      (answer) =>
                        Number(answer.questionIndex) === questionIndex,
                    );

                    const isCorrect =
                      savedAnswer?.isCorrect === true ||
                      savedAnswer?.isCorrect === false
                        ? savedAnswer.isCorrect
                        : null;

                    return (
                      <div
                        key={`${selectedTask.assignmentId}-question-${questionIndex}`}
                        id={`st-mcq-question-${questionIndex}`}
                        className={`st-mcq-question ${
                          !readOnly && !selectedOption
                            ? "is-unanswered"
                            : ""
                        }`}
                      >
                        <div className="st-mcq-question-heading">
                          <span className="st-mcq-question-number">
                            {questionIndex + 1}
                          </span>

                          <h4 className="st-mcq-question-text">
                            {question.questionText}
                          </h4>
                        </div>

                        {(question.options || []).map(
                          (option, optionIndex) => {
                            const optionNumber = optionIndex + 1;
                            const checked = selectedOption === optionNumber;

                            return (
                              <label
                                key={`${questionIndex}-option-${optionIndex}`}
                                className={`st-mcq-option ${
                                  checked ? "is-selected" : ""
                                } ${readOnly ? "is-disabled" : ""}`}
                              >
                                <input
                                  type="radio"
                                  name={`mcq-question-${questionIndex}`}
                                  value={optionNumber}
                                  checked={checked}
                                  disabled={readOnly || submitting}
                                  onChange={() =>
                                    handleMcqAnswerChange(
                                      questionIndex,
                                      optionNumber,
                                    )
                                  }
                                />

                                <span className="st-mcq-option-text">
                                  <strong>
                                    {String.fromCharCode(64 + optionNumber)}.
                                  </strong>{" "}
                                  {option}
                                </span>
                              </label>
                            );
                          },
                        )}

                        {readOnly && savedAnswer && (
                          <div
                            className={`st-mcq-review-item ${
                              isCorrect === true
                                ? "is-correct"
                                : isCorrect === false
                                  ? "is-incorrect"
                                  : ""
                            }`}
                            style={{ marginTop: 16 }}
                          >
                            <div className="st-mcq-review-status">
                              {isCorrect === true ? (
                                <>
                                  <CheckCircle2 size={20} />
                                  Correct answer
                                </>
                              ) : isCorrect === false ? (
                                <>
                                  <AlertCircle size={20} />
                                  Incorrect answer
                                </>
                              ) : (
                                <>
                                  <ClipboardCheck size={20} />
                                  Answer submitted
                                </>
                              )}
                            </div>

                            {savedAnswer.selectedAnswerText && (
                              <div className="st-mcq-review-answer">
                                <strong>Your answer:</strong>{" "}
                                {savedAnswer.selectedAnswerText}
                              </div>
                            )}

                            {savedAnswer.correctAnswerText && (
                              <div className="st-mcq-review-answer">
                                <strong>Correct answer:</strong>{" "}
                                {savedAnswer.correctAnswerText}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {message && (
                  <div
                    className={`st-message ${
                      messageType === "error" ? "is-error" : "is-success"
                    }`}
                    role="status"
                  >
                    {messageType === "error" ? (
                      <AlertCircle size={23} />
                    ) : (
                      <CheckCircle2 size={23} />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                {!readOnly && questions.length > 0 && (
                  <div className="st-submit-wrap">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="st-btn st-btn-primary"
                      style={{ cursor: submitting ? "wait" : "pointer" }}
                    >
                      {submitting ? (
                        <LoaderCircle
                          size={22}
                          className="student-task-spin"
                        />
                      ) : (
                        <Send size={22} />
                      )}

                      {submitting ? "Submitting..." : "Submit Assessment"}
                    </button>
                  </div>
                )}

                {readOnly && selectedTask.submittedAt && (
                  <p className="st-submitted-on">
                    Submitted on: {formatDate(selectedTask.submittedAt)}
                  </p>
                )}
              </div>
            ) : (
              <div className="st-section">
                <h3 className="st-section-title">
                  {readOnly ? "Your Submission" : "Submit Your Work"}
                </h3>

                {selectedTask.submissionType === "text" ? (
                  <textarea
                    value={submissionText}
                    onChange={(event) =>
                      setSubmissionText(event.target.value)
                    }
                    placeholder="Write your answer here..."
                    maxLength={50000}
                    disabled={readOnly}
                    className="st-textarea"
                  />
                ) : selectedTask.submissionType === "video" ? (
                  readOnly ? (
                    selectedTask.submissionText ? (
                      <a
                        href={selectedTask.submissionText}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="st-file-link"
                      >
                        <Video size={22} />
                        <span style={{ flex: 1, overflowWrap: "anywhere" }}>
                          {selectedTask.submissionText}
                        </span>
                        <ExternalLink size={21} />
                      </a>
                    ) : null
                  ) : (
                    <>
                      <input
                        type="url"
                        value={videoLink}
                        onChange={(event) => setVideoLink(event.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        maxLength={500}
                        className="st-textarea"
                        style={{ minHeight: 0 }}
                      />
                      <p
                        style={{
                          marginTop: 10,
                          fontSize: 13,
                          opacity: 0.8,
                          lineHeight: 1.6,
                        }}
                      >
                        Upload your video to YouTube as <strong>Unlisted</strong>{" "}
                        and paste the link here.
                      </p>
                    </>
                  )
                ) : (
                  !readOnly && (
                    <label className="st-upload">
                      <span className="st-upload-icon">
                        <Upload size={30} color="#FFFFFF" />
                      </span>

                      <strong>Choose file(s) to upload</strong>

                      <span>
                        Up to {selectedTask.maxFiles ?? 1} file(s),{" "}
                        {selectedTask.maxFileSizeMB ?? 10} MB each
                      </span>

                      <input
                        type="file"
                        multiple={(selectedTask.maxFiles ?? 1) > 1}
                        accept={
                          selectedTask.submissionType === "image"
                            ? "image/*"
                            : selectedTask.submissionType === "video"
                              ? "video/*"
                              : selectedTask.submissionType === "audio"
                                ? "audio/*"
                                : selectedTask.submissionType === "document"
                                  ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                  : selectedTask.submissionType === "text_file"
                                    ? ".txt,.csv"
                                    : undefined
                        }
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </label>
                  )
                )}

                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="st-file-row"
                      >
                        <FileText size={22} />

                        <span
                          style={{
                            flex: 1,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {file.name}
                        </span>

                        <span className="st-file-size">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {readOnly && selectedTask.submissionFiles?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    {selectedTask.submissionFiles.map((file, index) => (
                      <a
                        key={`${file.driveFileId || file.publicId || file.originalName}-${index}`}
                        href={file.url || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="st-file-link"
                        onClick={(event) => {
                          if (!file.url) event.preventDefault();
                        }}
                      >
                        <FileText size={22} />
                        <span style={{ flex: 1 }}>
                          {file.originalName}
                        </span>
                        <Download size={21} />
                      </a>
                    ))}
                  </div>
                )}

                {message && (
                  <div
                    className={`st-message ${
                      messageType === "error" ? "is-error" : "is-success"
                    }`}
                    role="status"
                  >
                    {messageType === "error" ? (
                      <AlertCircle size={23} />
                    ) : (
                      <CheckCircle2 size={23} />
                    )}
                    <span>{message}</span>
                  </div>
                )}

                {!readOnly && (
                  <div className="st-submit-wrap">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="st-btn st-btn-primary"
                      style={{ cursor: submitting ? "wait" : "pointer" }}
                    >
                      {submitting ? (
                        <LoaderCircle
                          size={22}
                          className="student-task-spin"
                        />
                      ) : (
                        <Send size={22} />
                      )}

                      {submitting ? "Submitting..." : "Submit Task"}
                    </button>
                  </div>
                )}

                {selectedTask.submittedAt && (
                  <p className="st-submitted-on">
                    Submitted on: {formatDate(selectedTask.submittedAt)}
                  </p>
                )}
              </div>
            )}
          </form>

          {selectedTask.feedback && (
            <div className="st-feedback">
              <h3 className="st-section-title">
                <MessageSquare
                  size={24}
                  style={{ verticalAlign: "middle", marginRight: 10 }}
                />
                Teacher Feedback
              </h3>

              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                {selectedTask.feedback}
              </p>

              {selectedTask.marks !== null &&
                selectedTask.marks !== undefined && (
                  <p style={{ fontSize: 24, fontWeight: 700 }}>
                    Marks: {selectedTask.marks}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="st-root">
      <style>{STYLES}</style>

      <div className="st-header st-fade-up">
        <div style={{ position: "relative", zIndex: 1 }}>
          <p className="st-eyebrow">STUDENT LEARNING PORTAL</p>
          <h1 className="st-title">Assessments & Tasks</h1>
          <p className="st-subtitle">
            View your assignments, complete assessments, submit your work and
            track feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTasks}
          disabled={loading}
          className="st-btn st-btn-light"
          style={{ position: "relative", zIndex: 1 }}
        >
          <RefreshCw
            size={21}
            className={loading ? "student-task-spin" : undefined}
          />
          Refresh
        </button>
      </div>

      <div className="st-stats">
        <StatCard title="Total Tasks" value={tasks.length} icon={FileText} />
        <StatCard title="Pending" value={pendingCount} icon={Clock3} />
        <StatCard title="Submitted" value={submittedCount} icon={Upload} />
        <StatCard title="Reviewed" value={reviewedCount} icon={CheckCircle2} />
      </div>

      <div className="st-list-card">
        <div className="st-list-header">
          <h2 className="st-list-title">
            My Tasks
            {!loading && !error && (
              <span className="st-count-pill">{filteredTasks.length}</span>
            )}
          </h2>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="st-filter"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        {loading ? (
          <div className="st-empty">
            <LoaderCircle
              size={48}
              color="#102B4E"
              className="student-task-spin"
            />
            <p>Loading your tasks...</p>
          </div>
        ) : error ? (
          <div className="st-empty">
            <AlertCircle size={52} color="#B03A3A" />
            <h3>Unable to load tasks</h3>
            <p>{error}</p>

            <button
              type="button"
              onClick={loadTasks}
              className="st-btn st-btn-primary"
              style={{ marginTop: 10 }}
            >
              Try Again
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="st-empty">
            <div className="st-empty-icon st-float">
              <FileText size={40} color="#FFFFFF" />
            </div>

            <h3>
              {tasks.length === 0
                ? "No tasks assigned yet"
                : "No tasks in this category"}
            </h3>

            <p>
              {tasks.length === 0
                ? "Your assigned tasks will appear here."
                : "Try selecting a different filter."}
            </p>
          </div>
        ) : (
          <div className="st-task-list">
            {filteredTasks.map((task, index) => {
              const status = getStatusStyle(task.status);
              const overdue =
                task.isPastDeadline && task.status === "assigned";

              const cardTone = overdue
                ? "is-overdue"
                : task.status === "submitted"
                  ? "is-submitted"
                  : task.status === "late_submitted"
                    ? "is-late"
                    : task.status === "reviewed"
                      ? "is-reviewed"
                      : task.status === "overdue"
                        ? "is-overdue"
                        : "is-pending";

              const isMcq = task.submissionType === "mcq";
              const hasScore =
                isMcq &&
                task.mcqScore !== null &&
                task.mcqScore !== undefined &&
                task.mcqTotalQuestions !== null &&
                task.mcqTotalQuestions !== undefined;

              return (
                <div
                  key={task.assignmentId}
                  className={`st-task-card ${cardTone}`}
                  style={{
                    animationDelay: `${Math.min(index * 0.06, 0.4)}s`,
                  }}
                >
                  <div className="st-task-top">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="st-task-head">
                        <span className="st-task-number">{index + 1}</span>

                        <span className="st-category">
                          {task.category || "General"}
                        </span>
                      </div>

                      <h3 className="st-task-title">{task.title}</h3>
                      <p className="st-task-desc">{task.description}</p>
                    </div>

                    <span
                      className={`st-status ${
                        overdue ? "st-status-overdue" : status.className
                      }`}
                    >
                      {overdue ? "Overdue" : status.label}
                    </span>
                  </div>

                  <div className="st-task-meta">
                    <span className="st-meta-chip">
                      <CalendarDays size={19} />
                      Due: {formatDate(task.dueDate)}
                    </span>

                    <span className="st-meta-chip">
                      {isMcq ? (
                        <ClipboardCheck size={19} />
                      ) : (
                        <Paperclip size={19} />
                      )}
                      {task.submissionType.replaceAll("_", " ")}
                    </span>

                    {hasScore && (
                      <span className="st-meta-chip">
                        <Trophy size={19} />
                        Score: {task.mcqScore}/{task.mcqTotalQuestions}
                      </span>
                    )}
                  </div>

                  <div className="st-task-bottom">
                    <span className="st-task-note">
                      {task.submittedAt
                        ? `Submitted: ${formatDate(task.submittedAt)}`
                        : overdue
                          ? "Deadline passed"
                          : "Awaiting submission"}
                    </span>

                    <button
                      type="button"
                      onClick={() => openTask(task)}
                      className="st-btn st-btn-primary"
                    >
                      {task.canSubmit ? "Open & Submit" : "View Details"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="st-info-item">
      <div className="st-info-icon">
        <Icon size={24} />
      </div>

      <div style={{ minWidth: 0 }}>
        <div className="st-info-label">{label}</div>
        <div className="st-info-value">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="st-stat">
      <div>
        <p className="st-stat-label">{title}</p>
        <h2 className="st-stat-value">{value}</h2>
      </div>

      <div className="st-stat-icon">
        <Icon size={28} />
      </div>
    </div>
  );
}