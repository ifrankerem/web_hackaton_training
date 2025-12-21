# Task Manager PWA - Railway Deployment Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Push to GitHub

```bash
cd /home/kero/Desktop/web_hackaton_training
git init
git add .
git commit -m "Task Manager PWA - ready for deployment"
```

Go to [github.com/new](https://github.com/new), create a repo named `task-manager`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → Sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `task-manager` repository
4. Click **"Add Service"** → Keep the one Railway detected
5. Go to **Settings** tab:
   - Set **Root Directory**: `backend`
6. Go to **Variables** tab, add:
   | Variable | Value |
   |----------|-------|
   | `DEBUG` | `False` |
   | `DJANGO_SECRET_KEY` | `your-random-secret-key-here` |
   | `ALLOWED_HOSTS` | `*.railway.app` |

7. Click **Deploy** and wait (~2 min)
8. Go to **Settings** → **Networking** → **Generate Domain**
9. Copy your backend URL (like `xxx.railway.app`)

---

### Step 3: Deploy Frontend on Railway

1. In the same project, click **"New"** → **"GitHub Repo"**
2. Select the same `task-manager` repo again
3. Go to **Settings** tab:
   - Set **Root Directory**: `frontend`
   - Set **Dockerfile Path**: `Dockerfile.prod`
4. Go to **Variables** tab, add:
   | Variable | Value |
   |----------|-------|
   | `BACKEND_URL` | `https://YOUR_BACKEND_URL.railway.app` |

5. Click **Deploy** and wait (~3 min)
6. Go to **Settings** → **Networking** → **Generate Domain**
7. Copy your frontend URL

---

### Step 4: Update Backend CSRF

Go back to your **backend** service→ **Variables**, add:
| Variable | Value |
|----------|-------|
| `CSRF_TRUSTED_ORIGINS` | `https://YOUR_FRONTEND_URL.railway.app` |

Redeploy if needed.

---

## ✅ Done!

Your app is live at: `https://YOUR_FRONTEND_URL.railway.app`

### Install as PWA:
- **iPhone**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Install App

---

## 💡 Tips

- **Database persists** inside Railway as long as you don't delete the service
- **Free tier**: ~500 hours/month (enough for personal use)
- **Custom domain**: You can add your own domain in Railway settings
