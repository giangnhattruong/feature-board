---
name: create-migration
description: Create a new Supabase SQL migration with sequential numbering
disable-model-invocation: true
---

# Create Supabase Migration

Create a new numbered SQL migration file in `supabase/migrations/`.

## Steps

1. **Determine the next migration number**: List existing files in `supabase/migrations/` and increment the highest number (e.g., `001` -> `002`).

2. **Create the migration file**: Name it `{NNN}_{description}.sql` where:
   - `{NNN}` is the zero-padded sequence number
   - `{description}` is a snake_case summary of the change (from user input or inferred)

3. **Write the SQL**: Include the migration SQL based on user's request. Always:
   - Use `CREATE TABLE IF NOT EXISTS` or appropriate guards
   - Enable RLS on new tables: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`
   - Add RLS policies for the intended access patterns
   - Add comments explaining the purpose

4. **Verify**: Read back the file to confirm it's correct.

5. **Remind the user** to run:
   ```bash
   supabase db push
   ```
   And to regenerate TypeScript types if using generated types:
   ```bash
   supabase gen types typescript --local > lib/supabase/types.ts
   ```
