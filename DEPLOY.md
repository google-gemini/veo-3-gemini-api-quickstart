# Deployment Guide: PhotoAIG to Google Cloud Run

This guide explains how to set up Google Cloud and GitHub Actions to deploy your Next.js application.

## 1. Google Cloud Setup

### A. Enable APIs
Go to the Google Cloud Console and enable the following APIs for your project:
1.  **Cloud Run API**
2.  **Artifact Registry API**
3.  **Cloud Build API** (optional, but good to have)

### B. Create Artifact Registry Repository
You need a place to store your Docker images.
1.  Go to **Artifact Registry**.
2.  Click **Create Repository**.
3.  Name: `photoaig` (Must match `REPO_NAME` in `.github/workflows/deploy.yml`).
4.  Format: **Docker**.
5.  Region: `us-central1` (Must match `REGION` in workflow).
6.  Click **Create**.

### C. Create Service Account
1.  Go to **IAM & Admin** > **Service Accounts**.
2.  Click **Create Service Account**.
3.  Name: `github-deployer`.
4.  Grant the following roles:
    *   **Cloud Run Admin** (to deploy services)
    *   **Service Account User** (to act as the runtime service account)
    *   **Artifact Registry Writer** (to push images)
5.  Click **Done**.

### D. Generate Key
1.  Click on the newly created service account (`github-deployer@...`).
2.  Go to the **Keys** tab.
3.  Click **Add Key** > **Create new key**.
4.  Select **JSON**.
5.  The key file will download to your computer. **Keep this safe!**

## 2. GitHub Secrets

Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions**.
Add the following **Repository secrets**:

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | Your Google Cloud Project ID (e.g., `my-project-123`) |
| `GCP_SA_KEY` | The content of the JSON key file you downloaded (paste the whole JSON string) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `DATABASE_URL` | Your Supabase Connection String (Transaction Mode recommended for serverless) |
| `GEMINI_API_KEY` | Your Google Gemini API Key |

## 3. Deploy

1.  Push your code to the `main` branch.
2.  Go to the **Actions** tab in GitHub to watch the deployment.
3.  Once finished, the Cloud Run URL will be displayed in the logs (or find it in GCP Console > Cloud Run).

## Important Notes

*   **Supabase Connectivity**: Ensure your Supabase database accepts connections from anywhere (0.0.0.0/0) or configure VPC peering if you want to restrict it. Cloud Run IPs change.
*   **Redirect URLs**: After deployment, add your Cloud Run URL (e.g., `https://photoaig-xyz.a.run.app`) to your **Supabase Auth Redirect URLs** and Google Cloud Console (if using Google Auth).
*   **Environment Variables**: If you add more env vars, update the `env_vars` section in `.github/workflows/deploy.yml`.
