-- Allow users to search for other users by email
-- This is needed for the connection request feature
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Users can view basic info of all profiles (needed for connection requests)
CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);