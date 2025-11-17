// // app/lib/actions/friendActions.ts
// "use server"

// Unused code commented out

// import { getSupabaseServerActionClient } from '@/app/lib/hooks/supabaseServerActionClient'

// export async function logActivity(activityType: string, activityData: any) {
//   const supabase = await getSupabaseServerActionClient()
//   const { data: { user }, error: userError } = await supabase.auth.getUser()
  
//   if (userError || !user) return null

//   const { data, error } = await supabase
//     .from('UserActivity')
//     .insert([{
//       user_id: user.id,
//       activity_type: activityType,
//       activity_data: activityData
//     }])
//     .select()
//     .single()

//   if (error) {
//     console.error('Error logging activity:', error)
//     return null
//   }

//   return data
// }