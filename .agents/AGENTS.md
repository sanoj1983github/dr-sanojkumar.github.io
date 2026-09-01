# Project Rules & Guidelines

## Docker Configuration & Verification
- Whenever making codebase changes, adding/modifying static assets, updating routes, or changing dependencies, always apply and synchronize the changes to Docker setup (`Dockerfile`, `compose.yaml`, `.dockerignore`).
- Ensure static asset directories (such as `public/` containing Lottie files, documents, and media) are explicitly copied into the `runner` stage in `Dockerfile`.
- Always test and verify Docker container builds (`docker build`) or Docker compose execution whenever modifications are made to the codebase.

## Continuous Update Workflow (Mobile, Local & Web)
- Every time modifications are made, ensure responsive layout updates for both Mobile and Desktop viewports.
- Verify local builds (`npm run build`) and local dev server (`http://localhost:3000/`).
- Always commit and push changes to GitHub (`origin main`) for live website deployment.

