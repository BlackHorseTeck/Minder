const required = [
  ["DATABASE_URL"],
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
  ["CLERK_SECRET_KEY"],
  ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GOGOLE_API_KEY"],
  ["E2B_API_KEY"],
  ["INNGEST_EVENT_KEY"],
  ["INNGEST_SIGNING_KEY"],
];

const missing = required.filter((names) =>
  names.every((name) => !process.env[name]?.trim()),
);

if (missing.length > 0) {
  console.error("\nMinder cannot create a production build because required environment variables are missing.");
  console.error("Add these values in Vercel → Project Settings → Environment Variables for the target environment:\n");

  for (const names of missing) {
    console.error(`  - ${names.join(" or ")}`);
  }

  console.error("\nSee docs/VERCEL_DEPLOYMENT.md. Values are intentionally not printed.");
  process.exit(1);
}

console.log("Production environment preflight passed.");
