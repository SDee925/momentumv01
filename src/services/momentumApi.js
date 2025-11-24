import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Initialize the Supabase client lazily
const getSupabaseClient = () => {
  if (!supabase && supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};

/**
 * Fetches momentum response from Supabase Edge Function
 * @param {string} input - User's input phrase describing what they want to accomplish
 * @returns {Promise<Object>} - The momentum response with roast, tasks, and deep_dive_template
 * @throws {Error} - If the request fails or Supabase is not configured
 */
export const fetchMomentumFromServer = async (input) => {
  const client = getSupabaseClient();
  
  if (!client) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  }

  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    throw new Error('Input is required and must be a non-empty string');
  }

  try {
    const { data, error } = await client.functions.invoke('momentum', {
      body: JSON.stringify({ input: input.trim() })
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to invoke momentum function');
    }

    if (!data) {
      throw new Error('No data returned from momentum function');
    }

    // Check if the response contains an error from the edge function
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error fetching momentum from server:', error);
    throw error;
  }
};

/**
 * Check if Supabase is configured
 * @returns {boolean} - True if Supabase URL and key are configured
 */
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
