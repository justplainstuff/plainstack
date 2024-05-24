import { Handler } from "plainweb";
import RootLayout from "~/app/root";
import { zfd } from "zod-form-data";
import { db } from "~/app/database/database";
import { contacts } from "~/app/database/schema";
import { FooterSection } from "~/app/components/footer-section";
import { HeroSection } from "~/app/components/hero-section";
import { SignupSection } from "~/app/components/signup-section";
import { StackSection } from "~/app/components/stack-section";

export const POST: Handler = async ({ req }) => {
  const parsed = zfd
    .formData({ email: zfd.text().refine((e) => e.includes("@")) })
    .safeParse(req.body);
  if (!parsed.success) {
    return (
      <div class="text-lg text-error leading-8">
        Please provide a valid email address
      </div>
    );
  }
  await db
    .insert(contacts)
    .values({ email: parsed.data.email, created: Date.now() });
  return (
    <div class="text-lg leading-8">
      Thanks for subscribing, I'll keep you posted!
    </div>
  );
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
