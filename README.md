# PhotoAIG - AI-Powered Creative Studio

A professional Next.js application for creating and editing images and videos using Google's latest Gemini API models including [Veo 3](https://ai.google.dev/gemini-api/docs/video), [Imagen 4](https://ai.google.dev/gemini-api/docs/imagen), and [Gemini 2.5 Flash Image](https://ai.google.dev/gemini-api/docs/image-generations).

<table>
  <tr>
    <td align="center">
      <img src="./public/compose.png" alt="Compose" width="300"/>
      <br/>
      <strong>Compose</strong>
    </td>
    <td align="center">
      <img src="./public/edit.png" alt="Edit" width="300"/>
      <br/>
      <strong>Edit</strong>
    </td>
    <td align="center">
      <img src="./public/video.png" alt="Video" width="300"/>
      <br/>
      <strong>Video</strong>
    </td>
  </tr>
</table>

> [!NOTE]
> If you want a full studio, consider [Google's Flow](https://labs.google/fx/tools/flow). Use this repo as a production-ready template to build your own AI creative platform with authentication, billing, and custom branding.

(This is not an official Google product.)

## ✨ Features

### 🎨 Creative Tools

-   **Create Image**: Generate images from text prompts using **Imagen 4** or **Gemini 2.5 Flash Image**
-   **Edit Image**: Edit images based on text prompts using **Gemini 2.5 Flash Image**
-   **Compose Image**: Combine multiple images with advanced composition controls
-   **Compose Album**: Generate multiple themed variations from a single reference image
-   **Create Video**: Generate videos from text prompts or images using **Veo 3**

### 🚀 Advanced Features

-   **AI Prompt Enhancement**: Automatically improve prompts using Gemini for better results
-   **Smart Inspiration Library**: Browse categorized prompt templates with instant preview
-   **Composition Controls**: Fine-tune layouts, styles, vibes, and advanced features
-   **Character Consistency**: Maintain character features across generations
-   **Text Integration**: Add text overlays to generated images
-   **User Authentication**: Supabase-based auth with Google OAuth
-   **Credit System**: Built-in credit management with Stripe integration
-   **History & Organization**: Save generations to folders with full history tracking
-   **Video Trimming**: Cut videos directly in the browser
-   **Download & Share**: Export all generated content

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) with App Router
-   **UI**: [React 19](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
-   **Database**: [Prisma](https://www.prisma.io/) with PostgreSQL (Supabase)
-   **Authentication**: [Supabase Auth](https://supabase.com/auth)
-   **Payments**: [Stripe](https://stripe.com/)
-   **AI Models**: 
  - **Veo 3** - Video generation
  - **Imagen 4** - High-quality image generation
  - **Gemini 2.5 Flash** - Fast image generation, editing, and composition
-   **Deployment**: Docker + Google Cloud Run

## 🚀 Quick Start

### Prerequisites

-   Node.js 20+ and npm
-   [Gemini API Key](https://aistudio.google.com/app/apikey) (Paid tier required)
-   Supabase account for auth and database
-   Stripe account for payments (optional)

> [!WARNING]  
> Veo 3, Imagen 4, and Gemini 2.5 Flash Image require the Gemini API Paid tier.

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd PhotoAIG
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file:
   ```bash
   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_supabase_connection_string

   # Stripe (optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
PhotoAIG/
├── app/
│   ├── page.tsx                 # Main studio interface
│   ├── login/                   # Authentication page
│   └── api/                     # API routes
│       ├── gemini/              # Gemini image operations
│       │   ├── generate/        # Image generation
│       │   ├── edit/            # Image editing
│       │   └── enhance/         # Prompt enhancement
│       ├── imagen/generate/     # Imagen 4 generation
│       ├── veo/                 # Veo 3 video operations
│       ├── user/                # User data endpoints
│       └── stripe/              # Payment processing
├── components/
│   ├── ui/                      # UI components
│   │   ├── Composer.tsx         # Main composer interface
│   │   ├── ModelSelector.tsx   # Model selection
│   │   ├── ImageComposerControls.tsx
│   │   ├── AlbumComposerControls.tsx
│   │   ├── PricingModal.tsx    # Credit purchase UI
│   │   └── PromptLibrary.tsx   # Inspiration templates
│   └── auth/
│       └── LoginButton.tsx      # Auth UI component
├── lib/
│   ├── prisma.ts               # Database client
│   └── supabase.ts             # Supabase client
├── prisma/
│   └── schema.prisma           # Database schema
└── public/
    ├── prompt.json             # Inspiration library data
    └── samples/                # Sample images
```

## 🎯 Key Features Explained

### Prompt Enhancement

Uses Gemini to automatically improve user prompts:
- Analyzes user intent and context
- Adds technical details for better results
- Maintains creative direction
- Works for both image and album generation

### Inspiration Library

Organized prompt templates by category:
- **Compositions**: Layouts and arrangements
- **Styles**: Artistic styles and techniques
- **Vibes**: Moods and atmospheres
- Searchable and filterable
- One-click application

### Credit System

- Tracks usage per generation
- Different costs per model
- Stripe integration for purchases
- Real-time credit display

### History & Organization

- Automatic saving of all generations
- Folder organization
- Preview and download
- Full metadata tracking

## 📚 Documentation

- **[DEPLOY.md](./DEPLOY.md)**: Complete deployment guide for Cloud Run
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)**: Stripe integration setup
- **[PRICING.md](./PRICING.md)**: Credit pricing structure

## 🔧 Configuration

### Database Schema

The app uses Prisma with the following models:
- `UserProfile`: User accounts and credits
- `Folder`: Image organization
- `Prompt`: Saved prompts
- `Image`: Generated images with metadata

### API Routes

#### Image Generation
- `/api/imagen/generate` - Imagen 4 generation
- `/api/gemini/generate` - Gemini Flash generation
- `/api/gemini/edit` - Image editing/composition
- `/api/gemini/enhance` - Prompt enhancement

#### Video Generation
- `/api/veo/generate` - Start video generation
- `/api/veo/operation` - Check generation status
- `/api/veo/download` - Download completed videos

#### User & Billing
- `/api/user/credits` - Credit balance
- `/api/user/history` - Generation history
- `/api/user/folders` - Folder management
- `/api/stripe/checkout` - Create payment session
- `/api/stripe/webhook` - Handle payment events

## 🚢 Deployment

### Docker Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="your_url" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="your_key" \
  -t photoaig .
```

### Google Cloud Run

See [DEPLOY.md](./DEPLOY.md) for complete deployment instructions including:
- Google Cloud setup
- GitHub Actions CI/CD
- Custom domain mapping
- Environment configuration

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss proposed changes.

## 📄 License

This project is licensed under the Apache License 2.0.

## 🔗 Resources

-   [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
-   [Veo 3 Guide](https://ai.google.dev/gemini-api/docs/video)
-   [Imagen 4 Guide](https://ai.google.dev/gemini-api/docs/imagen)
-   [Supabase Docs](https://supabase.com/docs)
-   [Stripe Docs](https://stripe.com/docs)

## ⚠️ Important Notes

- **API Costs**: Veo 3, Imagen 4, and Gemini 2.5 Flash are paid APIs
- **Resource Limits**: Be aware of rate limits and quotas
- **Production**: Configure proper error handling and monitoring
- **Security**: Never expose API keys in client-side code
