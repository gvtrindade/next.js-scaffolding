/**
 * Transactional email bodies.
 *
 * Templates live apart from delivery (`services/email.ts`) so the markup can be
 * changed without touching the provider integration, and vice versa. All text
 * comes from the `Emails.*` translation namespaces.
 */

import { getTranslations } from "next-intl/server";

export interface RenderedEmail {
  subject: string;
  html: string;
}

interface EmailLayoutContent {
  heading: string;
  intro: string;
  instructions: string;
  cta: string;
  ignoreNote: string;
  expiryNote: string;
  fallbackNote: string;
  url: string;
}

function renderEmailLayout(content: EmailLayoutContent): string {
  const { heading, intro, instructions, cta, ignoreNote, expiryNote, fallbackNote, url } = content;

  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background: #2563eb; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">${heading}</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px;">${intro}</p>
        <p style="margin: 0 0 24px;">${instructions}</p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            ${cta}
          </a>
        </div>
        <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">
          ${ignoreNote}
        </p>
        <p style="margin: 0; font-size: 14px; color: #64748b;">
          ${expiryNote}
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          ${fallbackNote}<br />
          <a href="${url}" style="color: #2563eb;">${url}</a>
        </p>
      </div>
    </div>
  `;
}

export async function renderPasswordResetEmail(params: { url: string }): Promise<RenderedEmail> {
  const t = await getTranslations("Emails.resetPassword");

  return {
    subject: t("subject"),
    html: renderEmailLayout({
      heading: t("heading"),
      intro: t("intro"),
      instructions: t("instructions"),
      cta: t("cta"),
      ignoreNote: t("ignoreNote"),
      expiryNote: t("expiryNote"),
      fallbackNote: t("fallbackNote"),
      url: params.url,
    }),
  };
}

export async function renderVerificationEmail(params: { url: string }): Promise<RenderedEmail> {
  const t = await getTranslations("Emails.verification");

  return {
    subject: t("subject"),
    html: renderEmailLayout({
      heading: t("heading"),
      intro: t("intro"),
      instructions: t("instructions"),
      cta: t("cta"),
      ignoreNote: t("ignoreNote"),
      expiryNote: t("expiryNote"),
      fallbackNote: t("fallbackNote"),
      url: params.url,
    }),
  };
}
