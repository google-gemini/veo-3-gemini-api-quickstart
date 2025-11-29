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

## 4. Custom Domain Mapping (Optional)

Map your custom domain to the Cloud Run service for a professional URL.

### A. Verify Domain Ownership

Before mapping, you must verify domain ownership with Google:

1. **Go to Google Search Console:**
   - Visit: https://search.google.com/search-console

2. **Add Your Domain:**
   - Click "Add Property"
   - Choose "Domain" (not URL prefix)
   - Enter your root domain (e.g., `yourdomain.com`)

3. **Verify via DNS TXT Record:**
   - Google provides a TXT record like: `google-site-verification=abc123...`
   - Add this to your domain's DNS settings at your registrar:
     - **Type:** TXT
     - **Name:** `@` (or root/apex)
     - **Value:** The verification string from Google
   - Wait for DNS propagation (5 mins to 24 hours)
   - Click "Verify" in Search Console

4. **Confirm Verification:**
   ```bash
   gcloud domains list-user-verified
   ```

### B. Create Domain Mapping

Once verified, map your subdomain to Cloud Run:

```bash
gcloud beta run domain-mappings create \
  --service=photoaig \
  --domain=subdomain.yourdomain.com \
  --region=us-central1
```

Example:
```bash
gcloud beta run domain-mappings create \
  --service=photoaig \
  --domain=photoverse.aigniter.in \
  --region=us-central1
```

### C. Configure DNS Records

Add the CNAME record provided by Google to your domain registrar:

- **Type:** CNAME
- **Name:** `subdomain` (e.g., `photoverse`)
- **Value:** `ghs.googlehosted.com`

Example for `photoverse.aigniter.in`:
| Type  | Name        | Value                  |
|-------|-------------|------------------------|
| CNAME | photoverse  | ghs.googlehosted.com   |

### D. Wait for SSL Certificate

- Google automatically provisions a managed SSL certificate
- This takes 15 minutes to several hours
- Check status:
  ```bash
  gcloud beta run domain-mappings describe \
    --domain=subdomain.yourdomain.com \
    --region=us-central1
  ```

### E. Update Supabase Redirect URLs

**Critical:** Add your custom domain to Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** > **URL Configuration**
3. Add to **Redirect URLs**:
   ```
   https://subdomain.yourdomain.com/auth/callback
   ```

### F. Verify Domain Mapping

```bash
# List all domain mappings
gcloud beta run domain-mappings list --region=us-central1

# Check DNS propagation
nslookup subdomain.yourdomain.com

# Test the URL
curl -I https://subdomain.yourdomain.com
```

## Important Notes

*   **Supabase Connectivity**: Ensure your Supabase database accepts connections from anywhere (0.0.0.0/0) or configure VPC peering if you want to restrict it. Cloud Run IPs change.
*   **Redirect URLs**: After deployment, add your Cloud Run URL (e.g., `https://photoaig-xyz.a.run.app`) **and custom domain** to your **Supabase Auth Redirect URLs** and Google Cloud Console (if using Google Auth).
*   **Environment Variables**: If you add more env vars, update the `env_vars` section in `.github/workflows/deploy.yml` and rebuild the Docker image.
*   **NEXT_PUBLIC Variables**: These are baked into the client bundle at build time via Docker build arguments. Changes require a rebuild.
*   **DNS Propagation**: Can take up to 48 hours, but usually completes within minutes to hours.
*   **SSL Certificate**: Automatically managed by Google. Check status if your site shows security warnings.
