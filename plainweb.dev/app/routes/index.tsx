import { Handler } from "plainweb";
import RootLayout from "~/app/root";
import { zfd } from "zod-form-data";
import { database } from "~/app/config/database";
import { contacts } from "~/app/config/schema";
import { FooterSection } from "~/app/components/footer-section";
import { HeroSection } from "~/app/components/hero-section";
import { SignupSection } from "~/app/components/signup-section";
import { StackSection } from "~/app/components/stack-section";
import { env } from "~/app/config/env";
import express from "express";
import { createContact } from "~/app/services/contacts";

async function validateTurnstile(req: express.Request, token: string) {
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

  const outcome = await result.json();
  if (!outcome.success) {
    console.error("Turnstile error", outcome);
    return false;
  }
  return true;
}

export const POST: Handler = async ({ req }) => {
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
    parsed.data["cf-turnstile-response"]
  );
  if (!isHuman) {
    return (
      <div class="mt-10 text-xl text-error">
        An error occurred. Please try again later.
      </div>
    );
  }

  try {
    await createContact(parsed.data.email);
    return (
      <div class="mt-10 text-xl text-neutral-700">Thanks for subscribing!</div>
    );
  } catch (e) {
    if ((e as Error).message.includes("UNIQUE constraint failed")) {
      return (
        <div class="mt-10 text-xl tetxt-neutral-700">
          You are already subscribed.
        </div>
      );
    }
    console.error(e);
    return (
      <div class="mt-10 text-xl text-error">
        An error occurred. Please try again later.
      </div>
    );
  }
};

export const GET: Handler = async () => {
  return (
    <RootLayout>
      <HeroSection />
      <StackSection />
      <SignupSection />
      <FooterSection />
    </RootLayout>
  );
};
