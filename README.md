<div align="center">

  <a href="https://dr-mritunjaysp.github.io/">
    <img src="public/media/profile-circle.png?v=4" alt="Dr. Mritunjay Shall Peelam" width="160" height="160" />
  </a>

  # Dr. Mritunjay Shall Peelam
  ### **Assistant Professor (Selection Grade) & Research Faculty**
  *Department of Computer Science & Engineering, UPES Dehradun, Uttarakhand, India*  
  *Ph.D. in Electrical & Electronics Engineering, BITS Pilani*

  <br />

  [![Website](https://img.shields.io/badge/Website-dr--mritunjaysp.github.io-0284c7?style=for-the-badge&logo=google-chrome&logoColor=white)](https://dr-mritunjaysp.github.io/)
  [![Google Scholar](https://img.shields.io/badge/Google%20Scholar-Metrics-4285F4?style=for-the-badge&logo=google-scholar&logoColor=white)](https://scholar.google.com/citations?user=mritunjaysp)
  [![ORCID](https://img.shields.io/badge/ORCID-0000--0003--3987--2028-A6CE39?style=for-the-badge&logo=orcid&logoColor=white)](https://orcid.org/0000-0003-3987-2028)
  [![GitHub](https://img.shields.io/badge/GitHub-dr--mritunjaysp-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dr-mritunjaysp)

</div>

---

## 📌 Executive Summary

This repository hosts the official source code for the personal academic portfolio of **Dr. Mritunjay Shall Peelam**. Designed with a modern tech stack (**Next.js 16**, **React 19**, **TypeScript**, **Vinext/Vite**), the website provides an interactive experience showcasing academic research, peer-reviewed journal publications, course teaching materials, and spiritual/cultural collections.

```
📁 Academic Portfolio Architecture
├── 📄 Curriculum Vitae       → Employment timeline, Ph.D. background, awards & PDF download
├── 🔬 Research & Papers      → Q1 IEEE/Elsevier journals with live citation metrics
├── 🕉️ Daily Mantra           → Sacred Sanskrit Stotram collection & modal reader
├── 🏔️ Travel Blog            → Badrinath, Kedarnath, and Chakarata travel stories
└── 🎓 Teaching & Courses     → Software Engineering, OS, COA, Data Structures
```

---

## 🔬 Core Research Domains

- 🌐 **Blockchain & Distributed Ledgers**: Proof-of-Authority consensus, Inter-Blockchain Communication (IBC) protocols, fog-assisted NFT evidence systems, and V2V/V2G carbon-aware energy trading.
- ⚡ **Edge AI & Federated Learning**: Privacy-preserving predictive maintenance algorithms for connected vehicle fleets and onboard diagnostics.
- 🚗 **Intelligent Transportation Systems (ITS)**: Multi-agent vehicle location verification (*V-Track*), global IMEI management, and emergency vehicle preemption.
- 🔐 **Quantum Computing & Post-Quantum Security**: NIST-standardized FALCON lattice signature algorithms and Quantum Key Distribution (QKD) for IoT gateways.

---

## 📐 Portfolio Sections & Key Features

| Section | Icon | Highlights |
| :--- | :---: | :--- |
| **Academic CV** | 📄 | Ph.D. BITS Pilani summary, UPES Dehradun role, awards, and downloadable PDF resume. |
| **Publications** | 📚 | Peer-reviewed Q1 IEEE & Elsevier journal papers with real-time Firebase citation tracking. |
| **Daily Mantra** | 🕉️ | Sacred Sanskrit verses (*Shiva Tandava*, *Karpura Gauram*, *Shri Hari*, *Hanuman Chalisa*) with modal reader. |
| **Travel Stories** | 🏔️ | Interactive logs and photography albums for Badrinath, Kedarnath, and Chakarata. |
| **Course Teaching** | 🎓 | Curriculum topics for Software Engineering, Operating Systems, COA, and Data Structures. |

---

## 🛠️ Technical Specifications & Stack

- **Framework**: Next.js 16 / Vinext (Vite 8 SSR & RSC engine)
- **UI & Components**: React 19, Lucide React, React Icons, Lottie-web animations
- **Design System**: Responsive Glassmorphism, CSS Variable Design Tokens, Dark/Light Mode
- **Database & Services**: Firebase Realtime Database (Live visitor counter & citation counters)
- **DevOps**: Docker & Docker Compose (Multi-stage build runtime), GitHub Actions workflow

---

## 💻 Local Development & Deployment Guide

### 🐳 1. Docker Deployment (Recommended)

```bash
# Build and run container on port 3000
docker compose up --build -d portfolio

# Stream container logs
docker compose logs -f portfolio

# Stop container
docker compose down
```

Access the site at **`http://localhost:3000`**.

#### 🔄 Hot-Reloading Development Container
```bash
docker compose --profile dev up --build portfolio-dev
```
Access dev server at **`http://localhost:3001`**.

---

### 📦 2. Node.js Local Setup (Without Docker)

Requires **Node.js >= 22.13.0**:

```bash
# Install dependencies
npm ci

# Start local dev server
npm run dev

# Run production build & test suite
npm run build
npm test

# Deploy to Firebase Hosting
npm run deploy:firebase
```

---

### 🔥 3. Firebase Hosting Deployment

```bash
# Login to Firebase CLI (one-time setup)
npx firebase login

# Deploy pre-rendered static site to Firebase Hosting CDN
npm run deploy:firebase
```

Automated GitHub deployment is configured in `.github/workflows/deploy-firebase.yml`. Add `FIREBASE_SERVICE_ACCOUNT_PORTFOLIO_6A1B9` to your GitHub repository secrets for continuous integration on `git push`.

---

## 📬 Contact Information

- 📧 **Primary Email**: [mritunjay.iete@gmail.com](mailto:mritunjay.iete@gmail.com)
- 🏫 **Institutional Email**: [mritunjay.peelam@ddn.upes.ac.in](mailto:mritunjay.peelam@ddn.upes.ac.in)
- 📞 **Phone**: +91-8745080986
- 📍 **Location**: Mirzapur, Uttar Pradesh 231001 & UPES Dehradun, Uttarakhand, India
- 🌐 **Live Website**: [dr-mritunjaysp.github.io](https://dr-mritunjaysp.github.io/)

---

<div align="center">
  <sub>© 2026 Dr. Mritunjay Shall Peelam. All rights reserved.</sub>
</div>
