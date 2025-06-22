# Supabase Connection Troubleshooting Guide

If you're experiencing "Network request failed" errors when trying to create sessions, here's how to diagnose and fix the issue:

## 1. Check Environment Variables

First, verify your environment variables are set correctly:

1. Open `.env` file in your project root
2. Ensure these variables exist and have valid values:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

## 2. Restart Development Server

After modifying `.env`, always restart your development server:

```bash
npx expo start --clear
```

## 3. Check Network Connectivity

1. Ensure your device/simulator has internet access
2. Try opening your Supabase URL in a browser
3. If using a physical device, ensure it's on the same network as your development machine

## 4. Verify Supabase Project Status

1. Go to [app.supabase.com](https://app.supabase.com)
2. Check if your project is active (not paused)
3. Verify your API keys in Settings → API

## 5. Test Database Connection

Use the "Run Debug Tests" button in the app to test:

- Environment variable loading
- Basic connection to Supabase
- Database read/write operations

## 6. Common Issues

### Issue: "Network request failed"

**Causes:**

- No internet connection
- Firewall/proxy blocking requests
- Invalid Supabase URL
- Supabase project is paused/inactive

**Solutions:**

- Check internet connection
- Try on a different network
- Verify Supabase URL format
- Check Supabase project status

### Issue: "Missing environment variables"

**Causes:**

- `.env` file not in project root
- Variables not prefixed with `EXPO_PUBLIC_`
- Development server not restarted

**Solutions:**

- Ensure `.env` is in project root
- Use `EXPO_PUBLIC_` prefix for all variables
- Restart development server with `--clear` flag

### Issue: "Connection test passed but operations fail"

**Causes:**

- Database tables not created
- RLS (Row Level Security) policies blocking access
- Insufficient permissions

**Solutions:**

- Run the SQL setup script from `SUPABASE_SETUP.md`
- Check RLS policies in Supabase dashboard
- Verify user permissions

## 7. Debug Commands

Run these in your terminal for additional debugging:

```bash
# Check if environment variables are loaded
npx expo start --clear

# Clear all caches
npx expo start --clear --reset-cache

# Check network connectivity
curl -I https://your-project-ref.supabase.co
```

## 8. Getting Help

If issues persist:

1. Check the console logs for detailed error messages
2. Verify your Supabase project is properly configured
3. Ensure your database schema matches the expected structure
4. Test with a simple HTTP client (curl/Postman) to isolate React Native issues

## Need More Help?

- Check Supabase documentation: <https://supabase.com/docs>
- React Native network debugging: <https://reactnative.dev/docs/network>
- Expo troubleshooting: <https://docs.expo.dev/troubleshooting/>
