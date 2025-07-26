
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('useUserRole: user changed', user?.id, user?.email);
    if (user?.id) {
      fetchUserRole();
    } else {
      setRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user?.id) {
      console.log('useUserRole: No user ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('useUserRole: Fetching role for user', user.id, user.email);
      
      // First check for special admin/cashier emails as primary source
      const adminEmails = ['admin@admin.com'];
      const cashierEmails = ['kasir@kasir.com'];
      
      let determinedRole = 'parent'; // default role
      
      if (user.email && adminEmails.includes(user.email)) {
        console.log('useUserRole: Setting admin role for known admin email');
        determinedRole = 'admin';
      } else if (user.email && cashierEmails.includes(user.email)) {
        console.log('useUserRole: Setting cashier role for known cashier email');
        determinedRole = 'cashier';
      } else {
        // Try to get from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        console.log('useUserRole: Role data from user_roles:', roleData, 'Error:', roleError);

        if (roleData?.role) {
          console.log('useUserRole: Setting role from user_roles:', roleData.role);
          determinedRole = roleData.role;
        } else {
          // Fallback: try to get from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          console.log('useUserRole: Profile data:', profileData, 'Error:', profileError);

          if (profileData?.role) {
            console.log('useUserRole: Setting role from profiles:', profileData.role);
            determinedRole = profileData.role;
          }
        }
      }

      // Set the role in state
      setRole(determinedRole);

      // Update JWT claims by refreshing the session to ensure RLS policies work
      console.log('useUserRole: Updating JWT claims with role:', determinedRole);
      await updateUserRoleInDatabase(determinedRole);
      await refreshSessionWithRole(determinedRole);

    } catch (error) {
      console.error('useUserRole: Error fetching user role:', error);
      
      // Emergency fallback for known emails
      if (user.email === 'admin@admin.com') {
        console.log('useUserRole: Emergency fallback to admin for admin@admin.com');
        setRole('admin');
        await updateUserRoleInDatabase('admin');
        await refreshSessionWithRole('admin');
      } else if (user.email === 'kasir@kasir.com') {
        console.log('useUserRole: Emergency fallback to cashier for kasir@kasir.com');
        setRole('cashier');
        await updateUserRoleInDatabase('cashier');
        await refreshSessionWithRole('cashier');
      } else {
        setRole('parent');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRoleInDatabase = async (userRole: string) => {
    try {
      // Update or insert in user_roles table
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (existingRole) {
        await supabase
          .from('user_roles')
          .update({ role: userRole })
          .eq('user_id', user?.id);
      } else {
        await supabase
          .from('user_roles')
          .insert({ user_id: user?.id, role: userRole });
      }

      // Also update profiles table for consistency
      await supabase
        .from('profiles')
        .update({ role: userRole })
        .eq('id', user?.id);

      console.log('useUserRole: Updated role in database:', userRole);
    } catch (error) {
      console.error('useUserRole: Error updating role in database:', error);
    }
  };

  const refreshSessionWithRole = async (userRole: string) => {
    try {
      // Refresh the session to update JWT claims
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('useUserRole: Error refreshing session:', error);
      } else {
        console.log('useUserRole: Session refreshed with role:', userRole);
      }
    } catch (error) {
      console.error('useUserRole: Error in refreshSessionWithRole:', error);
    }
  };

  console.log('useUserRole: Current state - role:', role, 'loading:', loading, 'isAdmin:', role === 'admin', 'isCashier:', role === 'cashier');

  return { 
    role, 
    loading, 
    isAdmin: role === 'admin',
    isCashier: role === 'cashier' || role === 'admin' // Admin can also act as cashier
  };
};
