import { FooterSection } from "app/components/footer-section";
import { FullstackSection } from "app/components/fullstack-section";
import { HeroSection } from "app/components/hero-section";
import { PlatformSection } from "app/components/platform-section";
import { ShippingSection } from "app/components/shipping-section";
import { SignupSection } from "app/components/signup-section";
import type { Database } from "app/config/database";
import env from "app/config/env";
import Layout from "app/layouts/root";
import { createContact } from "app/services/contacts";
import type { Request } from "express";
import { asset, defineHandler, getLogger } from "plainstack";
import { zfd } from "zod-form-data";

async function validateTurnstile(req: Request, token: string) {
  const ip = req.header("CF-Connecting-IP");
  const formData = new FormData();
  formData.append("secret", env.CF_TURNSTILE_SECRET);
  formData.append("response", token);
  formData.append("remoteip", ip || "");
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });

  const outcome = (await result.json()) as { success: boolean };
  if (!outcome.success) {
    console.error("Turnstile error", outcome);
    return false;
  }
  return true;
}

export const POST = defineHandler(async ({ req, res }) => {
  const log = getLogger("contacts");
  const database = res.locals.database as Database;
  const parsed = zfd
    .formData({
      "cf-turnstile-response": zfd.text(),
      email: zfd.text().refine((e) => e.includes("@")),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    return (
      <div class="mt-10 text-xl text-error">
        Please provide a valid email address
      </div>
    );
  }
  const isHuman = await validateTurnstile(
    req,
    parsed.data["cf-turnstile-response"],
  );
  if (!isHuman) {
    return (
      <div class="mt-10 text-xl text-error">
        An error occurred. Please try again later.
      </div>
    );
  }

  try {
    await createContact(database, parsed.data.email);
    return (
      <div class="mt-10 text-xl text-base-content">
        Thanks for subscribing, check your inbox.
      </div>
    );
  } catch (e) {
    log.error(e);
    return (
      <div class="mt-10 text-xl text-error">
        An error occurred. Please try again later.
      </div>
    );
  }
});

export const GET = defineHandler(async () => {
  return (
    <Layout head=<script defer src={asset("confetti.ts")} />>
      <HeroSection />
      <FullstackSection />
      <ShippingSection />
      <PlatformSection />
      <SignupSection />
      <FooterSection />
    </Layout>
  );
});
