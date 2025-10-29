# 🔧 TALENTFLOW Troubleshooting Guide

## Error: "Unexpected token '<', "<!doctype "... is not valid JSON"

This error means the API is returning HTML instead of JSON, indicating that **Mock Service Worker (MSW) is not intercepting requests**.

### Quick Fix Steps:

#### 1. **Stop the Dev Server**
Press `Ctrl+C` in the terminal running the dev server.

#### 2. **Clear Browser Cache**
- **Chrome/Edge:** Press `Ctrl+Shift+Delete`, select "Cached images and files", click "Clear data"
- **Firefox:** Press `Ctrl+Shift+Delete`, select "Cache", click "Clear Now"
- Or use **Incognito/Private mode** for a fresh start

#### 3. **Regenerate MSW Worker**
```bash
npx msw@latest init public --save
```

#### 4. **Restart Dev Server**
```bash
npm run dev
```

#### 5. **Hard Reload the Page**
- Press `Ctrl+Shift+R` (Windows/Linux)
- Or `Cmd+Shift+R` (Mac)

---

## Detailed Diagnostics

### Check 1: MSW Worker File Exists
```bash
ls -la public/mockServiceWorker.js
```
**Expected:** File should exist and be ~9KB

**If missing:** Run `npx msw init public --save`

### Check 2: Browser Console Logs
Open DevTools (F12) and look for these messages:

✅ **Success indicators:**
```
🚀 Starting TALENTFLOW...
📦 Initializing database...
✅ Database ready
🔧 Starting Mock Service Worker...
📡 Starting MSW worker...
✅ MSW worker started and ready to intercept requests
✅ Registered 23 API handlers
🎨 Rendering application...
✅ Application rendered successfully
```

❌ **Error indicators:**
```
❌ MSW failed to start
❌ Database failed to initialize
Failed to register/update a ServiceWorker
```

### Check 3: Network Tab
1. Open DevTools → Network tab
2. Reload page
3. Look for API requests (e.g., `/jobs`, `/candidates`)
4. Click on a request

**Expected:** 
- Status: `200 OK`
- Type: `xhr` or `fetch`
- Response: JSON data

**If you see:**
- Status: `404`
- Response: HTML page
→ MSW is NOT intercepting

### Check 4: Service Worker Status
1. Open DevTools → Application tab (Chrome) or Storage tab (Firefox)
2. Click "Service Workers" in the sidebar
3. Look for `mockServiceWorker.js`

**Expected:** Status should be "activated and running"

**If "redundant" or missing:** 
1. Click "Unregister"
2. Reload page

---

## Common Issues & Solutions

### Issue 1: "Service Worker registration failed"

**Cause:** HTTPS required in some browsers, or scope issues

**Solution:**
1. Ensure you're using `http://localhost:5174` (not `https://`)
2. Check that `public/mockServiceWorker.js` exists
3. Try different browser

### Issue 2: "Handler not found for GET /jobs"

**Cause:** Handlers not registered properly

**Solution:**
1. Check `src/msw/handlers/index.ts` exports all handlers
2. Restart dev server
3. Check console for "Registered X API handlers" message

### Issue 3: Blank white screen

**Cause:** JavaScript error during initialization

**Solution:**
1. Open console (F12)
2. Look for red error messages
3. Common causes:
   - Database initialization failed
   - Missing dependencies
   - TypeScript errors

**Fix:** Run `npm install` and restart

### Issue 4: "Database initialization failed"

**Cause:** IndexedDB not available or corrupted

**Solution:**
1. Open DevTools → Application → Storage
2. Click "IndexedDB" → "talentflowDB"
3. Right-click → Delete database
4. Reload page (database will recreate)

---

## Nuclear Option: Complete Reset

If nothing else works, perform a complete reset:

### Step 1: Clear Everything
```bash
# Stop dev server (Ctrl+C)

# Remove node_modules and lock files
rm -rf node_modules package-lock.json

# Remove dist folder
rm -rf dist

# Clear npm cache
npm cache clean --force
```

### Step 2: Reinstall
```bash
npm install
```

### Step 3: Regenerate MSW
```bash
npx msw@latest init public --save
```

### Step 4: Clear Browser Data
1. Close ALL browser tabs with the app
2. Open DevTools → Application → Storage
3. Click "Clear site data" button
4. Close browser completely

### Step 5: Fresh Start
```bash
npm run dev
```
Open in **Incognito/Private** window

---

## Verification Checklist

After following any fix, verify these work:

- [ ] Page loads without errors
- [ ] Console shows "✅ MSW worker started"
- [ ] Console shows "✅ Registered 23 API handlers"
- [ ] Jobs page shows seed data (25 jobs)
- [ ] Candidates page loads
- [ ] Can create new job
- [ ] Can drag & drop in Kanban view
- [ ] No "Unexpected token" errors in console

---

## Still Having Issues?

1. **Check MSW version:**
   ```bash
   npm list msw
   ```
   Should be `^2.0.0` or higher

2. **Check Node version:**
   ```bash
   node --version
   ```
   Should be `v18.0.0` or higher

3. **Try a different browser:**
   - Chrome/Edge (recommended)
   - Firefox
   - Safari (may have service worker issues)

4. **Check console for detailed errors:**
   - Red errors often contain the root cause
   - Stack traces show which file/line failed

5. **Look at Network tab:**
   - Filter by "XHR" or "Fetch"
   - Check response content
   - Verify correct endpoints

---

## Getting Help

If you've tried everything and it still doesn't work:

1. Open browser DevTools (F12)
2. Copy **all** console messages (especially errors)
3. Check Network tab → failed request → Copy response
4. Include:
   - Your OS (Windows/Mac/Linux)
   - Browser version
   - Node version
   - Full error message
   - What you've already tried

---

## Prevention Tips

To avoid these issues in the future:

1. **Always use localhost:** Don't use IP addresses
2. **Keep dependencies updated:** Run `npm update` monthly
3. **Clear cache regularly:** Especially after major changes
4. **Use Incognito for testing:** Avoids cache issues
5. **Check console on every reload:** Catch errors early

---

## Technical Details

### How MSW Works:
1. Service worker registers at `/mockServiceWorker.js`
2. Intercepts all HTTP requests from your app
3. Matches request against registered handlers
4. Returns mock response or passes through
5. No actual network requests leave the browser

### Why It Breaks:
- Service worker not registered/activated
- Browser cache serving old worker
- Worker scope misconfigured
- Handlers not properly exported
- Race condition during initialization

### Debug Mode:
Set `quiet: false` in `src/msw/browser.ts` to see all intercepted requests in console.

---

**Last Updated:** 2025-01-28
**Version:** 1.0.0

