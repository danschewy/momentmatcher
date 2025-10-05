# MomentMatcher - Documentation Index

Welcome to the MomentMatcher documentation! This index will help you find the right documentation for your needs.

## 📚 Documentation Overview

### For Developers

1. **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - Complete technical overview

   - System architecture
   - Technology stack details
   - Database schema
   - API endpoint specifications
   - AI/ML integration details
   - Security & performance considerations

2. **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Visual system diagrams

   - System architecture overview
   - Data flow diagrams
   - Database relationships (ERD)
   - Component interactions
   - Deployment architecture
   - Mermaid diagrams (GitHub-rendered)

3. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment
   - Prerequisites and setup
   - Environment configuration
   - Database setup (Neon)
   - Twelve Labs integration
   - OpenAI integration
   - Local development
   - Production deployment (Vercel)
   - Troubleshooting

### For Product & Business

4. **[HACKATHON_PITCH.md](./HACKATHON_PITCH.md)** - Product overview

   - Problem statement
   - Solution overview
   - Business model
   - Market opportunity
   - Technical capabilities
   - Demo flow

5. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Quick overview
   - What is MomentMatcher
   - Key features
   - Tech stack summary
   - Getting started

### For Users

6. **[QUICKSTART.md](./QUICKSTART.md)** - Get started quickly

   - Installation steps
   - First video upload
   - Understanding results
   - Basic troubleshooting

7. **[VIDEO_UPLOAD_GUIDE.md](./VIDEO_UPLOAD_GUIDE.md)** - Video upload best practices
   - Supported formats
   - Optimal video specs
   - Upload process
   - Status monitoring

### Technical Deep Dives

8. **[TWELVE_LABS_INTEGRATION.md](./TWELVE_LABS_INTEGRATION.md)** - Video AI integration

   - Twelve Labs API usage
   - Index management
   - Video analysis pipeline
   - Semantic search queries

9. **[PREMIUM_SPOTS_IMPROVEMENTS.md](./PREMIUM_SPOTS_IMPROVEMENTS.md)** - Premium ad spots
   - How premium spots work
   - Visual timeline features
   - Spot quality calculation
   - CPM valuation methodology

### Maintenance & Updates

10. **[RECENT_CHANGES.md](./RECENT_CHANGES.md)** - Latest updates

    - Recent feature additions
    - Bug fixes
    - Performance improvements

11. **[STATUS.md](./STATUS.md)** - Current project status

    - Completed features
    - In-progress work
    - Known issues
    - Roadmap

12. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues
    - Error messages explained
    - Solutions and workarounds
    - Debug techniques

---

## 🚀 Quick Navigation by Role

### "I'm a **Frontend Developer**"

Start here:

1. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Understand the project
2. [QUICKSTART.md](./QUICKSTART.md) - Set up locally
3. [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - Frontend components section
4. [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - Component interaction diagrams

### "I'm a **Backend Developer**"

Start here:

1. [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - API endpoints & business logic
2. [TWELVE_LABS_INTEGRATION.md](./TWELVE_LABS_INTEGRATION.md) - Video API details
3. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Environment setup
4. [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - Data flow diagrams

### "I'm a **DevOps Engineer**"

Start here:

1. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment process
2. [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - Infrastructure section
3. [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - Deployment architecture
4. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common deployment issues

### "I'm a **Product Manager**"

Start here:

1. [HACKATHON_PITCH.md](./HACKATHON_PITCH.md) - Product vision
2. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Feature overview
3. [STATUS.md](./STATUS.md) - Current progress
4. [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - What's technically possible

### "I'm an **AI/ML Engineer**"

Start here:

1. [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - AI/ML Integration section
2. [TWELVE_LABS_INTEGRATION.md](./TWELVE_LABS_INTEGRATION.md) - Video understanding
3. [PREMIUM_SPOTS_IMPROVEMENTS.md](./PREMIUM_SPOTS_IMPROVEMENTS.md) - Spot quality algorithms
4. [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - Spot quality flow

### "I'm a **New Contributor**"

Start here:

1. [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview
2. [QUICKSTART.md](./QUICKSTART.md) - Local setup
3. [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - Deep dive
4. [RECENT_CHANGES.md](./RECENT_CHANGES.md) - What's been happening

---

## 📖 Documentation by Task

### Setting Up Development Environment

1. Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - "Local Development" section
2. Follow [QUICKSTART.md](./QUICKSTART.md)
3. Reference [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if issues arise

### Deploying to Production

1. Complete [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) in order
2. Reference [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - "Security & Performance" section
3. Use [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - "Deployment Architecture"

### Understanding the Codebase

1. Start with [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
2. Deep dive: [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)
3. Visualize: [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)
4. Specific features: Check other MD files

### Adding New Features

1. Review [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - Architecture constraints
2. Check [STATUS.md](./STATUS.md) - Ensure not already planned
3. Update [RECENT_CHANGES.md](./RECENT_CHANGES.md) after implementation

### Debugging Issues

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first
2. Review relevant architecture docs
3. Check [STATUS.md](./STATUS.md) for known issues

---

## 🔧 Environment Setup Quick Reference

### Required API Keys

| Service       | Get From                                           | Environment Variable   | Used For                |
| ------------- | -------------------------------------------------- | ---------------------- | ----------------------- |
| Neon Database | [neon.tech](https://neon.tech)                     | `DATABASE_URL`         | Data persistence        |
| Twelve Labs   | [twelvelabs.io](https://twelvelabs.io)             | `TWELVE_LABS_API_KEY`  | Video analysis          |
| Twelve Labs   | Dashboard → Indexes                                | `TWELVE_LABS_INDEX_ID` | Video indexing          |
| OpenAI        | [platform.openai.com](https://platform.openai.com) | `OPENAI_API_KEY`       | Product recommendations |

### Installation Commands

```bash
# Clone and install
git clone <repo-url>
cd momentmatcher
npm install

# Database setup
npm run db:push

# Development
npm run dev

# Production build
npm run build
npm start
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📊 Key Technical Details

### Tech Stack

- **Framework**: Next.js 15.5 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **AI Services**: Twelve Labs + OpenAI GPT-4
- **Hosting**: Vercel (recommended)
- **Language**: TypeScript

### Database Schema

See [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md#database-schema) for complete schema, or [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) for visual ERD.

### API Endpoints

Full list in [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md#api-endpoints).

---

## 🐛 Common Issues & Solutions

### "Cannot connect to database"

→ See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)

### "Premium spots not showing"

→ See [PREMIUM_SPOTS_IMPROVEMENTS.md](./PREMIUM_SPOTS_IMPROVEMENTS.md#troubleshooting)

### "Video upload fails"

→ See [VIDEO_UPLOAD_GUIDE.md](./VIDEO_UPLOAD_GUIDE.md) and [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Other Issues

→ Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first, then [STATUS.md](./STATUS.md) for known issues.

---

## 📝 Contributing

When contributing:

1. **Read the relevant docs** before starting
2. **Update documentation** when adding features
3. **Add to RECENT_CHANGES.md** when merging
4. **Update STATUS.md** if changing project status
5. **Follow existing patterns** shown in architecture docs

---

## 🆘 Getting Help

1. **Check documentation** - Most questions are answered here
2. **Search issues** - GitHub issues for similar problems
3. **Read source code** - Well-commented and organized
4. **Ask the team** - Last resort, but we're happy to help!

---

## 📅 Documentation Maintenance

This documentation index is maintained with the codebase. Last updated: **2025-01-06**

To update this index:

1. Add new documentation files to the project
2. Update this index with links and descriptions
3. Update the "Last updated" date
4. Commit with the relevant changes

---

## 🎯 Documentation Quality

All documentation aims to be:

- ✅ **Accurate** - Reflects current implementation
- ✅ **Complete** - Covers all major features
- ✅ **Clear** - Easy to understand
- ✅ **Practical** - Includes examples and code snippets
- ✅ **Maintained** - Updated with code changes

Found an issue? Please update the relevant doc and submit a PR!

---

**Happy coding! 🚀**

_Built with ❤️ by the MomentMatcher team_
