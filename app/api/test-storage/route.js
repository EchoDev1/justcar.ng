import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test 1: Check if we can list buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      return Response.json({
        success: false,
        error: 'Failed to list buckets',
        details: bucketsError
      }, { status: 500 })
    }

    // Test 2: Try to get bucket info
    const { data: carImagesBucket, error: imagesError } = await supabase
      .storage
      .getBucket('car-images')

    const { data: carVideosBucket, error: videosError } = await supabase
      .storage
      .getBucket('car-videos')

    // Test 3: Check environment variables
    const envVars = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    }

    return Response.json({
      success: true,
      buckets: buckets || [],
      carImagesBucket: carImagesBucket || null,
      carVideosBucket: carVideosBucket || null,
      imagesError: imagesError?.message || null,
      videosError: videosError?.message || null,
      environmentVariables: envVars,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
