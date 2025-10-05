# Quiz System - Quick Start Guide

## 🚀 Fresh Setup (New Database)

### Step 1: Create Tables and Policies
```sql
-- Run in Supabase SQL Editor
-- File: schemas/quiz_complete_schema.sql
```
**Time:** ~10 seconds
**What it does:** Creates all tables, indexes, RLS policies, and triggers

### Step 2: Add Sample Data (Optional)
```sql
-- Run in Supabase SQL Editor
-- File: schemas/quiz_sample_data.sql
```
**Time:** ~5 seconds
**What it does:** Adds 3 sample quizzes with 18 questions

---

## 🔧 Fixing 403 Errors

If you get **403 Forbidden** when saving quizzes:

### Quick Fix
```sql
-- Run just the DROP and CREATE POLICY sections from:
-- File: schemas/quiz_complete_schema.sql

-- Or run the entire file (it's safe)
```

**Root cause:** Missing `WITH CHECK` clauses in RLS policies
**More info:** See `schemas/QUIZ_403_ERROR_FIX.md`

---

## 📝 Creating Your First Quiz

### Via UI (Recommended)
1. Login as admin
2. Navigate to **Admin → Quiz Management**
3. Click **"Create Quiz"**
4. Fill in title, description, difficulty
5. Click **"Create Quiz"**
6. You'll be redirected to the edit page
7. Add questions and options
8. Change **Status** to **"Published"**
9. Click **"Save Quiz"**

### Via SQL (Advanced)
```sql
-- Get your user ID first
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Create a quiz
INSERT INTO quizzes (title, description, difficulty, status, created_by)
VALUES (
  'My First Quiz',
  'Test your knowledge',
  'easy',
  'published',
  'YOUR-USER-ID-HERE'
);
```

---

## ✅ Verification Checklist

After running the schema:

- [ ] Tables created (quizzes, quiz_questions, quiz_options)
- [ ] RLS enabled on all tables
- [ ] All policies have both USING and WITH CHECK (for FOR ALL)
- [ ] Triggers created for automatic timestamps
- [ ] Sample data loaded (if you ran quiz_sample_data.sql)

### Check with SQL:
```sql
-- Verify tables
SELECT tablename FROM pg_tables
WHERE tablename LIKE 'quiz%';

-- Verify RLS
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename LIKE 'quiz%';

-- Verify policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename LIKE 'quiz%';
```

---

## 🎯 Common Tasks

### Make Quiz Visible to Users
1. Go to **Admin → Quiz Management**
2. Click **Edit** on the quiz
3. Change **Status** to **"Published"**
4. **Save**

Quiz will now appear in:
- Navbar dropdown
- /quizzes page

### Hide Quiz from Users
Change status to **"Draft"** or **"Archived"**

### Delete Quiz
1. Go to **Admin → Quiz Management**
2. Click the **trash icon**
3. Confirm deletion

**Note:** Deletes all questions and options (CASCADE)

---

## 🐛 Troubleshooting

### "No quizzes available"
**Cause:** No published quizzes exist
**Fix:** Create a quiz and set status to "Published"

### "403 Forbidden" when saving
**Cause:** Missing RLS policies
**Fix:** Run `schemas/quiz_complete_schema.sql`

### "Failed to load quiz"
**Cause:** Quiz doesn't exist or user lacks permission
**Fix:** Check quiz ID and ensure it's published (or you're the owner)

### Sample data fails to insert
**Cause:** No users in auth.users table
**Fix:** Create a user account first (sign up)

---

## 📁 File Structure

```
schemas/
├── README.md                    # Detailed documentation
├── QUICK_START.md              # This file
├── QUIZ_403_ERROR_FIX.md       # 403 error explanation
├── quiz_complete_schema.sql    # Main schema file ⭐
└── quiz_sample_data.sql        # Test data
```

---

## 🔗 Navigation

- **Home:** `/`
- **Quiz List:** `/quizzes`
- **Take Quiz:** `/quiz/:quizId`
- **Admin Panel:** `/admin`
- **Quiz Management:** `/admin?section=quiz`
- **Edit Quiz:** `/admin/quiz/:quizId/edit`

---

## 💡 Pro Tips

1. **Test in Draft First:** Create quizzes as draft, test them, then publish
2. **Use Time Limits:** Set time limits for more challenging quizzes
3. **Multiple Answers:** Enable for questions with multiple correct options
4. **Add Explanations:** Help users learn from their mistakes
5. **Order Matters:** Questions are displayed in order_index order

---

## 📊 Sample Quiz Stats

If you loaded the sample data:
- **3 quizzes** (Easy, Medium, Hard)
- **18 questions** total
- **72 answer options** total
- Mix of single and multiple-answer questions
- All with explanations

---

## 🎓 Next Steps

1. ✅ Run schema → ✅ Add sample data → ✅ Create account
2. 📝 Try the sample quizzes
3. 🎨 Create your own quiz
4. 📱 Test on mobile
5. 🚀 Deploy to production

---

**Need help?** Check `schemas/README.md` for detailed documentation.
