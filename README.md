
# Campus Guardian

An empathy-driven campus safety and misconduct reporting platform.

## Features
- **Incident Reporting**: Easy logging of bunking, property damage, and physical altercations.
- **AI Case Insights**: Powered by Gemini 3 Flash to provide behavioral patterns and resolution suggestions.
- **Access Gatekeeper**: Administrative verification for all new campus accounts.
- **Interactive Dashboard**: Real-time safety metrics and distribution analysis.

## Vercel Deployment

To ensure the AI features work correctly on Vercel, you must configure your environment variables:

1. Push this repository to GitHub/GitLab.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. **Crucial Step**: Go to **Settings > Environment Variables**.
4. Add a new variable:
   - **Key**: `API_KEY`
   - **Value**: `your_google_gemini_api_key_here`
5. Click **Add** and then **Redeploy** your project.

Vercel's build process will now inject this key into the application, allowing the `gemini-3-flash-preview` model to generate insights.

## Technology Stack
- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide Icons**
- **Google Generative AI SDK**
