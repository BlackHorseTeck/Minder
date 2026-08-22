# Deploying Minder on Vercel

This repository is a **Next.js 15** application and can be deployed directly from the `Minder` branch with Vercel's standard Git import flow. No custom server, container, or `vercel.json` file is required. The included `.nvmrc` pins builds to Node.js 20, and the Inngest route sets a 300-second maximum duration for its serve handler.

The repository also includes `.npmrc` with `legacy-peer-deps=true`. This preserves the dependency-resolution mode required by the current `openai` and `zod` peer dependency range during Vercel's clean `npm install`; it does **not** add or enable an OpenAI runtime integration.

## 1. Import the GitHub repository

In Vercel, create a new project from the GitHub repository and select the **`Minder` branch** as the production branch. Vercel should detect Next.js automatically. Keep the default build command, which runs `npm run build` and therefore executes `prisma generate`, the repository's Gemini thought-signature compatibility patch through `postinstall`, and a secret-safe production environment preflight.

> Do not use `npm run dev` as the production command. Vercel deploys the result of the Next.js build as serverless functions and static assets.[1]

## 2. Configure production environment variables

Add these variables in the Vercel project settings. Enter values directly in Vercel; never commit them to GitHub or paste them into this document.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection string for the existing Prisma database. Do not reuse a development-only database. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk client-side publishable key. |
| `CLERK_SECRET_KEY` | Yes | Clerk server-side secret key. |
| `NEXT_PUBLIC_APP_URL` | Recommended before using a custom domain | Canonical production URL, for example `https://minder.example.com`. On an initial Vercel deployment the application safely falls back to Vercel's `VERCEL_URL`; set this variable once the production domain is stable. |
| `GEMINI_API_KEY` | Yes | Google Gemini server-side API key. This is the preferred variable name used by the application. The legacy `GOOGLE_API_KEY` and `GOGOLE_API_KEY` names remain accepted only for compatibility. |
| `GEMINI_MODEL` | Yes | Set to `gemini-3.5-flash-lite`. |
| `E2B_API_KEY` | Yes | E2B server-side API key used to create and restore previews. |
| `E2B_TEMPLATE` | Yes | Set to `minder-sandbox`. |
| `INNGEST_EVENT_KEY` | Yes | Inngest event key for the selected environment. |
| `INNGEST_SIGNING_KEY` | Yes | Inngest signing key used to verify calls to `/api/inngest`. |
| `INNGEST_SERVE_ORIGIN` | Recommended | Set to the canonical production origin, for example `https://minder.example.com`, once the domain is live. |

Select **Production**, **Preview**, and **Development** for every required variable above if you intend to use all three Vercel environments. At minimum, the three values that caused the reported build error must be set in the environment being deployed: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY`. The build preflight now stops before Next.js prerendering and lists missing variable *names* without revealing any values.

Set the Clerk production redirect URLs and allowed origins to include the Vercel production domain before testing sign-in. Configure a **separate database** for Vercel preview deployments if pull requests might include Prisma schema changes; this avoids preview builds affecting production data.[2]

## 3. Connect Inngest

Install the official Inngest integration for the Vercel project when available. It synchronizes the deployed application and supplies the event and signing keys. If installing the integration is not appropriate, add the two Inngest variables above manually and register this endpoint in the Inngest dashboard:

```text
https://<production-domain>/api/inngest
```

The handler is already implemented at `src/app/api/inngest/route.ts`. Do not expose the endpoint behind Vercel deployment protection unless an Inngest protection-bypass configuration is also supplied; otherwise Inngest cannot invoke the application.[3]

## 4. Verify the deployment

After Vercel reports a successful build, verify the following in order: the public landing page, Clerk sign-in and sign-out, creation of one disposable test project, Inngest app sync, Gemini generation status updates, and E2B preview restoration. Delete the disposable project after verification.

> An unauthenticated Vercel CLI temporary deployment may reject this repository because Next.js middleware runs on Vercel's Edge runtime. Deploy through an authenticated Vercel project connected to GitHub instead; that is the supported route for this application.

## References

[1]: https://vercel.com/docs/frameworks/full-stack/nextjs "Next.js on Vercel"
[2]: https://www.prisma.io/docs/orm/prisma-client/deployment/serverless/deploy-to-vercel "Prisma: Deploy to Vercel"
[3]: https://www.inngest.com/docs/deploy/vercel "Inngest: Deploy to Vercel"
