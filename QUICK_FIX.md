# Quick Fix for Network Request Failed Error

The "Network request failed" error you're experiencing is a common network connectivity issue. Here are the immediate steps to resolve it:

## Immediate Solutions (Try in Order)

### 1. **Restart iOS Simulator**

```bash
# Close the simulator completely
# Re-open it and try again
```

### 2. **Test on Physical Device**

- Open Expo Go on your iPhone
- Scan the QR code from the terminal
- Try creating a session on the physical device

### 3. **Check WiFi Network**

- Try switching to a different WiFi network
- If using company/school WiFi, they might block external API calls
- Try using mobile hotspot

### 4. **Reset Network Settings**

```bash
# In iOS Simulator:
# Device > Erase All Content and Settings
# Then restart Expo app
```

### 5. **Clear Expo Cache**

```bash
cd /Users/jcnouwens/Git/jcnouwens/TinderForDinner
npx expo start --clear --reset-cache
```

## Test Your Supabase Connection

1. **Verify Supabase is Active**:
   - Go to <https://app.supabase.com>
   - Check your project status
   - Ensure it's not paused

2. **Test Direct URL Access**:
   - Open browser
   - Visit: `https://dtxqlyxpkwngfpnnfktr.supabase.co`
   - Should show Supabase landing page

3. **Use Debug Button**:
   - In the app, tap "Run Debug Tests"
   - Check console for detailed network information

## If Still Not Working

### Option 1: Use Mock Data (Temporary)

I can help you set up mock data so you can continue developing while we fix the network issue.

### Option 2: Alternative Network Testing

```bash
# Test from your computer's terminal
curl -I https://dtxqlyxpkwngfpnnfktr.supabase.co

# Should return HTTP headers if reachable
```

### Option 3: Expo Web Version

```bash
# Try running on web instead
npx expo start --web
```

## Most Common Solutions

**For iOS Simulator Issues:**

1. Restart the simulator
2. Try a physical device
3. Check system network settings

**For Network Issues:**

1. Change WiFi networks
2. Use mobile hotspot
3. Check firewall/proxy settings

**For Corporate Networks:**

- Corporate firewalls often block API calls
- Try from home network or mobile hotspot

Let me know which solution works for you!
