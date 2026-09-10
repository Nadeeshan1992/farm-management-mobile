# 🐄 AgriCow - Dairy & Cattle Farm Management Mobile App

A modern, interactive mobile application for dairy and cattle farm management, featuring herd registry, heat/estrus detection, AI breeding, pregnancy monitoring, calving records, daily milk logging with drop alerts, veterinary health, vaccinations, weight tracking, and THI heat stress calculations.

---

## 🚀 How to Deploy to Vercel (Step-by-Step)

Vercel is a cloud platform that allows you to deploy and share web and mobile applications with anyone around the world for free.

### Method 1: Deploy via GitHub (Recommended & Easiest)

1. **Initialize Git & Commit (Already done locally):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Farm Management Mobile App"
   ```

2. **Create a GitHub Repository:**
   - Go to [github.com](https://github.com) and sign in.
   - Click **New repository** (e.g. name it `farm-management-mobile`).
   - Leave it public or private, don't check "Initialize with README".
   - Copy your repository URL (e.g. `https://github.com/YOUR_USERNAME/farm-management-mobile.git`).

3. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/farm-management-mobile.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in with GitHub.
   - Click **"Add New..."** &rarr; **"Project"**.
   - Select your `farm-management-mobile` repository and click **Import**.
   - Leave the default settings (Framework Preset: Other / Static).
   - Click **Deploy**!
   - In ~30 seconds, Vercel gives you a live public URL (e.g. `https://farm-management-mobile.vercel.app`) that you can open on any phone or share with your team!

---

### Method 2: Deploy directly via Vercel CLI

If you have Node.js installed, you can deploy directly from your command prompt without opening GitHub:

1. Open PowerShell or Command Prompt in this folder (`c:\xampp\htdocs\Farm Management`).
2. Run:
   ```bash
   npx vercel
   ```
3. Follow the quick login prompts in your browser.
4. Press Enter to accept the defaults.
5. Vercel will upload and deploy your app in seconds!

---

## 💡 Dual-Mode Architecture

- **Local Development (XAMPP)**: Runs with Apache on port 8080 and MySQL on port 3306 with PHP REST API.
- **Vercel Cloud**: Runs out of the box with browser-persistent storage (`localStorage`) pre-loaded with all 25 cows, Cow #105, charts, and alert triggers, so anyone testing the Vercel link gets a fast, fully interactive experience without needing server configuration!
