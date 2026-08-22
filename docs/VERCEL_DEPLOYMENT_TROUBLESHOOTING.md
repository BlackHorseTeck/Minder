# Vercel Deployment Troubleshooting

## Anonymous deployment is blocked by middleware runtime policy

The repository's Clerk middleware uses the standard Next.js middleware runtime. A claimable anonymous Vercel CLI deployment can finish building but reject the resulting artifact because anonymous deployments do not permit the Edge runtime used by `src/middleware.ts`.

This does not indicate a source build failure. The production build completed successfully after Vercel's local builder installed dependencies with the repository `.npmrc` policy. Create the deployment from an **authenticated Vercel account connected to the GitHub repository**, rather than using the anonymous temporary deployment route.

## Clean installs fail with an `ERESOLVE` peer-dependency error

The repository uses a current `zod` v4 range alongside a dependency that declares an optional `zod` v3 peer range. The `.npmrc` file sets `legacy-peer-deps=true`, matching the installation mode already used for this project and allowing Vercel to complete its clean install. Keep the setting until the transitive peer ranges are reconciled in a separately tested dependency upgrade.
