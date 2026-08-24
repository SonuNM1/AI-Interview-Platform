                    SHELL
                      │
       ┌──────────────┼──────────────┐
       │              │              │
   Auth/Routing   Shared UI      MFE Loading
       │
       ├── Login
       ├── Register
       ├── Verify Email
       ├── Forgot Password
       └── Reset Password
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
     Candidate    Recruiter     Mentor
        MFE          MFE          MFE

### Shell should own the following things

- Authentication 
- login/register
- email verification 
- forgot / reset password 
- global routing 
- authentication state
- global error boundary 
- global toast
- loading/fallback
- loading remote MFEs 
- deciding which MFEs a user enters based on role 

