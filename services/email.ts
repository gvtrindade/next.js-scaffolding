/**
 * Email delivery service.
 *
 * Owns the Resend integration: templates come from `lib/email-templates.ts`,
 * this module only sends and reports failures. Resend does not throw on API
 * errors — it returns `{ error }` — so both the returned error and thrown
 * transport failures are captured in Sentry and rethrown as
 * `EmailDeliveryError`.
 */

import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { renderPasswordResetEmail, renderVerificationEmail } from "@/lib/email-templates";
import { requireEnv } from "@/lib/env";

export class EmailDeliveryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "EmailDeliveryError";
  }
}

interface DeliveryInput {
  to: string;
  subject: string;
  html: string;
  template: string;
}

async function deliver(input: DeliveryInput): Promise<void> {
  let from: string;

  try {
    from = requireEnv("RESEND_SENDER");
  } catch (error) {
    Sentry.captureException(error, {
      tags: { service: "email", template: input.template, reason: "configuration" },
    });
    throw new EmailDeliveryError("RESEND_SENDER is not configured", { cause: error });
  }

  try {
    const resend = new Resend(requireEnv("RESEND_API_KEY"));
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      throw new EmailDeliveryError(error.message, { cause: error });
    }
  } catch (error) {
    const failure =
      error instanceof EmailDeliveryError
        ? error
        : new EmailDeliveryError("Failed to send email", { cause: error });

    Sentry.captureException(failure, {
      tags: { service: "email", template: input.template },
      extra: { to: input.to },
    });
    throw failure;
  }
}

export async function sendPasswordResetEmail(params: { to: string; url: string }): Promise<void> {
  const email = await renderPasswordResetEmail({ url: params.url });

  await deliver({
    to: params.to,
    subject: email.subject,
    html: email.html,
    template: "resetPassword",
  });
}

export async function sendVerificationEmail(params: { to: string; url: string }): Promise<void> {
  const email = await renderVerificationEmail({ url: params.url });

  await deliver({
    to: params.to,
    subject: email.subject,
    html: email.html,
    template: "verification",
  });
}
