/**
 * Simple network connectivity test utility
 */

/**
 * Test basic internet connectivity
 */
export const testInternetConnectivity = async (): Promise<boolean> => {
    try {
        console.log('🌐 Testing internet connectivity...');

        // Try fetching from a reliable public API with AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('https://httpbin.org/get', {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log('✅ Internet connectivity test passed');
            return true;
        } else {
            console.error('❌ Internet connectivity test failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Internet connectivity test error:', error);
        return false;
    }
};

/**
 * Test if we can reach Supabase specifically
 */
export const testSupabaseReachability = async (): Promise<boolean> => {
    try {
        console.log('🔍 Testing Supabase reachability...');

        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            console.error('❌ No Supabase URL configured');
            return false;
        }

        // Try a simple HEAD request to the Supabase URL with AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(supabaseUrl, {
            method: 'HEAD',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log('✅ Supabase reachability test passed');
            return true;
        } else {
            console.error('❌ Supabase reachability test failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase reachability test error:', error);
        return false;
    }
};

/**
 * Run comprehensive network tests
 */
export const runNetworkTests = async () => {
    console.log('🚀 Running comprehensive network tests...');

    const internetTest = await testInternetConnectivity();
    const supabaseTest = await testSupabaseReachability();

    const results = {
        internet: internetTest,
        supabase: supabaseTest,
        overall: internetTest && supabaseTest
    };

    console.log('📊 Network test results:', results);

    if (!internetTest) {
        console.error('🚨 No internet connectivity detected');
        console.error('Please check:');
        console.error('1. Device/simulator internet connection');
        console.error('2. WiFi/cellular connection');
        console.error('3. Firewall/proxy settings');
    } else if (!supabaseTest) {
        console.error('🚨 Cannot reach Supabase servers');
        console.error('Please check:');
        console.error('1. Supabase project status');
        console.error('2. Supabase URL configuration');
        console.error('3. Network security settings');
    } else {
        console.log('✅ All network tests passed!');
    }

    return results;
};
