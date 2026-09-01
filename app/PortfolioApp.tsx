"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Mail,
  Medal,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  StepForward,
  Trophy,
  UsersRound,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  SiGooglescholar,
  SiGithub,
  SiOrcid,
  SiWhatsapp,
  SiYoutube,
} from "react-icons/si";
import { FaLinkedinIn, FaEnvelope, FaFileLines } from "react-icons/fa6";
import { useEffect, useMemo, useRef, useState } from "react";
import { LiveUpdateRefresh } from "./LiveUpdateRefresh";
import { LottieIcon } from "./LottieIcon";

import { ScrollJumpButton } from "./ScrollJumpButton";
import { subscribeVisitorCounter, subscribeScholarMetrics, subscribePublicationCitations } from "./firebase";
import type { ScholarMetrics } from "./firebase";
import {
  getScholarPaperUrl,
  normalizeScholarTitle,
} from "./scholar-data";
import { SortingVisualizer } from "./sorting/SortingVisualizer";
import { InkoraApp } from "./inkora/InkoraApp";
import { MSPLiveFrameApp } from "./msp-live-frame/MSPLiveFrameApp";
import { VisionPenPage } from "./vision-pen/VisionPenPage";
import { FilterVerseShell } from "./filterverse/FilterVerseShell";

type SectionKey =
  | "home"
  | "blog"
  | "publications"
  | "projects"
  | "sorting-visualizer"
  | "vision-pen"
  | "filterverse"
  | "inkora"
  | "pen-app"
  | "penapp"
  | "msp-live-frame"
  | "mspliveframe"
  | "mriframe"
  | "finger-frame"

  | "cv"
  | "teaching"
  | "people"
  | "award-fdp"
  | "game"
  | "daily-mantra"
  | "bhagwatgita"
  | "ramayan"
  | "quantum-computation"
  | "blockchain"
  | "poems"
  | "motivations"
  | "news"
  | "repositories"
  | "books"
  | "profiles";

type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: number;
  citations: number;
  tags: string[];
  abstract: string;
  doi?: string;
};

const primaryNav = [
  { label: "Blog", href: "/blog", key: "blog" },
  { label: "Publications", href: "/publications", key: "publications" },
  { label: "Projects", href: "/projects", key: "projects" },
  { label: "CV", href: "/cv", key: "cv" },
  { label: "Teaching", href: "/teaching", key: "teaching" },
  { label: "People", href: "/people", key: "people" },
] as const;

const moreNav = [
  { label: "Filter Verse", href: "/filterverse", key: "filterverse" },
  { label: "Vision Pen", href: "/vision-pen", key: "vision-pen" },
  { label: "Live Research Frame", href: "/msp-live-frame", key: "msp-live-frame" },
  { label: "Inkora PenApp", href: "/inkora", key: "inkora" },
  { label: "Sorting Visualizer", href: "/sorting-visualizer", key: "sorting-visualizer" },
  { label: "Awards & FDP", href: "/award-fdp", key: "award-fdp" },
  { label: "Game", href: "/game", key: "game" },
  { label: "Daily Mantra", href: "/daily-mantra", key: "daily-mantra" },
  { label: "Bhagwatgita", href: "/bhagwatgita", key: "bhagwatgita" },
  { label: "Ramayan", href: "/ramayan", key: "ramayan" },
  {
    label: "Computer Vision",
    href: "/quantum-computation",
    key: "quantum-computation",
  },
  { label: "Computer Vision", href: "/blockchain", key: "blockchain" },
  { label: "Poems", href: "/poems", key: "poems" },
  { label: "Motivations", href: "/motivations", key: "motivations" },
] as const;

const publications: Publication[] = [
  {
    title: "Brain MRI Segmentation using Deep Learning: A Review",
    authors: "Rahul Pal, Sanoj Kumar, and Gaurav Bhatnagar",
    venue: "Neurocomputing (Elsevier)",
    year: 2026,
    citations: 0,
    tags: [
      "Journal",
      "Under Review",
      "SCI",
      "Impact Factor: 6.5"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Uncertainty-aware multi-class brain tumor segmentation using Bayesian U-Net variants",
    authors: "Rahul Pal, Sanoj Kumar, and Gaurav Bhatnagar",
    venue: "Biomedical Physics & Engineering Express, 12(2), 025076",
    year: 2026,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.0"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Sequential Multimodal Biometric Authentication Fusion System",
    authors: "Swati Rastogi, Sanoj Kumar, Musrrat Ali, and Abdul Rahaman Wahab Sait",
    venue: "Mathematics, 14(7), 1178",
    year: 2026,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.3"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Earthquake-Resilient Structural Control Using PSO-Based Fractional Order Controllers",
    authors: "Sanoj Kumar, Harendra Pal Singh, Musrrat Ali, and Abdul Rahaman Wahab Sait",
    venue: "Fractal and Fractional, 9(12), 759",
    year: 2025,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 3.5"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Optimization-Driven Reconstruction of 3D Space Curves from Two Views Using NURBS",
    authors: "Musrrat Ali, Deepika Saini, Sanoj Kumar, and Abdul Rahaman Wahab Sait",
    venue: "Mathematics, 13(14), 2256",
    year: 2025,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.3"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A Complex Network Analysis of Image Watermarking Scheme Based on SVD and DWT",
    authors: "Manoj Kumar Singh, Sanoj Kumar, and Deepika Saini",
    venue: "SN Computer Science, 5(8), 1009",
    year: 2024,
    citations: 0,
    tags: [
      "Journal"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Machine Learning-Based Stability Prediction and Analysis of Polypropylene Cu-MA Superhydrophobic Coating on the Aluminum Substrate",
    authors: "Himanshu Prasad Mamgain, Rahul Pal, Sanoj Kumar, Ranjeet Brajpuriya, and Jitendra K Pandey",
    venue: "The Journal of Physical Chemistry C, 35, 2011-2022",
    year: 2024,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 3.3"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Topological analysis of image reconstruction based on polar complex exponential transform",
    authors: "Manoj K. Singh, Deepika Saini, and Sanoj Kumar",
    venue: "Journal of Computational and Cognitive Engineering",
    year: 2024,
    citations: 0,
    tags: [
      "Journal"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Unveiling anomalies: harnessing machine learning for detection and insights",
    authors: "Shubh Gupta, Sanoj Kumar, Karan Singh, and Deepika Saini",
    venue: "Engineering Research Express, 6(3), 5215",
    year: 2024,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 1.5"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Inverse Geometric Reconstruction Based on MW-NURBS Curves",
    authors: "Musrrat Ali, Deepika Saini, and Sanoj Kumar",
    venue: "Mathematics, 12(13), 2071",
    year: 2024,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.2"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Topological Data Analysis and Image Visibility Graph for Texture Classification",
    authors: "Rahul C. Pal, Sanoj Kumar, and Manoj K. Singh",
    venue: "International Journal of System Assurance Engineering and Management",
    year: 2024,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.018"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Edge Computing Enabled Abnormal Activity Recognition for Visual Surveillance",
    authors: "Musrrat Ali, Lakshay Goyal, CM Sharma, and Sanoj Kumar",
    venue: "Electronics, 13(2), 251",
    year: 2024,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.690"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A Robust Zero-Watermarking Scheme in Spatial Domain by Achieving Features Similar to Frequency Domain",
    authors: "Musrrat Ali and Sanoj Kumar",
    venue: "Electronics, 13(2), 435",
    year: 2024,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.690"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Graph-and Machine-Learning-Based Texture Classification",
    authors: "Musrrat Ali, Sanoj Kumar, Rahul Pal, Manoj K Singh, and Deepika Saini",
    venue: "Electronics, 12(22), 4626",
    year: 2023,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.690"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Comparative Study of Rough Set-Based FCM and K-Means Clustering for Tumor Segmentation from Brain MRI Images",
    authors: "Pooja Singh, Neeru Rathee, Sunanda Sharda, and Sanoj Kumar",
    venue: "Revue d'Intelligence Artificielle, 37(4), 921-927",
    year: 2023,
    citations: 0,
    tags: [
      "Journal"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A Blend of Analytical and Numerical Methods to Compute Orthogonal Image Moments over a Unit Disk",
    authors: "Manoj K Singh, Sanoj Kumar, Gaurav Bhatnagar, Deepika Saini, Musrrat Ali, Chandra Mani Sharma, and Navel Sharma",
    venue: "Wireless Communications and Mobile Computing, Article ID 1344584",
    year: 2022,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.146"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A secure and robust stereo image encryption algorithm based on DCT and Schur decomposition",
    authors: "Sanoj Kumar, Gaurav Bhatnagar, Girish Dobhal, Manoj K. Singh, and Deepika Saini",
    venue: "Journal of Information Technology Management, 14, 23-43",
    year: 2022,
    citations: 0,
    tags: [
      "Journal",
      "Scopus"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Application of a novel image moment computation in X-ray and MRI image watermarking",
    authors: "Manoj K. Singh, Sanoj Kumar, Musrrat Ali, and Deepika Saini",
    venue: "IET Image Processing, 11, 666-682",
    year: 2021,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.373"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Two View NURBS reconstruction based on GACO model",
    authors: "Deepika Saini, Sanoj Kumar, Manoj K. Singh, and Musrrat Ali",
    venue: "Complex & Intelligent Systems, 7(5), 2329-2346",
    year: 2021,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 6.700"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "An image watermarking framework based on PSO and FrQWT",
    authors: "Sanoj Kumar, Manoj K. Singh, and Deepika Saini",
    venue: "Journal of Discrete Mathematical Sciences and Cryptography, 24(5), 1293-1308",
    year: 2021,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 0.68"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "An Optimized Digital Watermarking Scheme Based on Invariant DC Coefficients in Spatial Domain",
    authors: "Musrrat Ali, Chang Wook Ahn, Millie Pant, Sanoj Kumar, Manoj K. Singh, and Deepika Saini",
    venue: "Electronics, 9(9), 1428",
    year: 2020,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 2.690"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Dual Tree Fractional Quaternion Wavelet Transform for Disparity Estimation",
    authors: "Sanoj Kumar, Sanjeev Kumar, Balasubramanian Raman, and N. Sukavanam",
    venue: "ISA Transactions, 53(2), 547-559",
    year: 2014,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 5.991"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Image Disparity Estimation using Fractional Dual-Tree Complex Wavelet Transform: A Multi-Scale Approach",
    authors: "Sanoj Kumar, Sanjeev Kumar, Nagarajan Sukavanam, and Balasubramanian Raman",
    venue: "International Journal of Wavelets, Multiresolution and Information Processing, 11, 1350004",
    year: 2013,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 1.408"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Human Visual System and Segment-Based Disparity Estimation",
    authors: "Sanoj Kumar, Sanjeev Kumar, Nagarajan Sukavanam, and Balasubramanian Raman",
    venue: "International Journal of Electronics and Communications, 67(5), 372-381",
    year: 2013,
    citations: 0,
    tags: [
      "Journal",
      "SCI",
      "Impact Factor: 3.183"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Security of Stereo Images during Communication and Transmission",
    authors: "Sanoj Kumar, Gaurav Bhatnagar, Balasubramanian Raman, and N. Sukavanam",
    venue: "Advanced Science Letters, 6, 173-179",
    year: 2012,
    citations: 0,
    tags: [
      "Journal"
    ],
    abstract: "Journal publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Uncertainty-Aware Brain Tumor Segmentation",
    authors: "Rahul Pal, Sanoj Kumar, and Gaurav Bhatnagar",
    venue: "2025 IEEE International Conference on Computer Vision and Machine Intelligence (CVMI)",
    year: 2025,
    citations: 0,
    tags: [
      "Conference",
      "IEEE"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Integrating Image Visibility Graph and Topological Data Analysis for Enhanced Texture Classification",
    authors: "Rahul C. Pal, Sanoj Kumar, and Manoj K. Singh",
    venue: "International Conference on Soft Computing for Problem-Solving, Springer Nature Singapore",
    year: 2024,
    citations: 0,
    tags: [
      "Conference",
      "Springer"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A reversible and rotational invariant watermarking scheme using polar harmonic transforms",
    authors: "Manoj K. Singh, Sanoj Kumar, Deepika Saini, and Gaurav Bhatnagar",
    venue: "Academia-Industry Consortium for Data Science (AICDS-2020)",
    year: 2020,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A secure and robust stereo image encryption algorithm based on DCT and Schur decomposition",
    authors: "Sanoj Kumar, Gaurav Bhatnagar, Girish Dobhal, Manoj K. Singh, and Deepika Saini",
    venue: "International Conference on Communication and Computing Systems (ICCCS-2021)",
    year: 2021,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "An image watermarking framework based on PSO and FrQWT",
    authors: "Sanoj Kumar, Manoj K. Singh, and Deepika Saini",
    venue: "2nd International Conference on Networks and Cryptology (NETCRYPT-2020)",
    year: 2020,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A robust medical image watermarking framework based on SVD and DE in Integer DCT domain",
    authors: "Sanoj Kumar, Manoj K. Singh, Musrrat Ali, and Deepika Saini",
    venue: "2020 IEEE Sixth International Conference on Multimedia Big Data (BigMM)",
    year: 2020,
    citations: 0,
    tags: [
      "Conference",
      "IEEE"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Reconfiguration of PTZ Camera Network with minimum resolution",
    authors: "Sanoj Kumar, Claudio Piciarelli, and Harendra Pal Singh",
    venue: "4th International Conference on Harmony Search, Soft Computing and Applications (ICHSA 2018)",
    year: 2018,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Histogram based Motion Estimation of Underwater Images",
    authors: "Sanoj Kumar, Sanjeev Kumar, and Anuj Kumar",
    venue: "International Conference on Frontiers in Industrial and Applied Mathematics (FIAM 2018)",
    year: 2018,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "A Variational Approach for Optical Flow Estimation in Infra-Red or Thermal Images",
    authors: "Sanoj Kumar, Sanjeev Kumar, and Balasubramanian Raman",
    venue: "Second International Conference on Image Information Processing (ICIIP-2013)",
    year: 2013,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Optical flow Estimation using Fractional Quaternion Wavelet Transform",
    authors: "Sanoj Kumar, Sanjeev Kumar, Nagarajan Sukavanam, and Balasubramanian Raman",
    venue: "International Conference on Industrial and Intelligent Information (ICIII-2012), Singapore",
    year: 2012,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Human Visual System and Wavelet transform based disparity estimation",
    authors: "Sanoj Kumar, Nagarajan Sukavanam, Balasubramanian Raman, and Sanjeev Kumar",
    venue: "Fourth International Conference on Emerging Trends in Engineering and Technology (ICETET), Mauritius",
    year: 2011,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Disparity Estimation using Fractional Dual Tree Complex Wavelet Transform",
    authors: "Sanoj Kumar, Sanjeev Kumar, Nagarajan Sukavanam, and Balasubramanian Raman",
    venue: "International Conference on Image Information Processing (ICIIP-2011)",
    year: 2011,
    citations: 0,
    tags: [
      "Conference"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  },
  {
    title: "Human Action Recognition in a Wide and Complex Environment",
    authors: "Sanoj Kumar, Sanjeev Kumar, Balasubramanian Raman, and Nagarajan Sukavanam",
    venue: "Real-Time Image and Video Processing 2011, IS&T/SPIE Electronic Imaging",
    year: 2011,
    citations: 0,
    tags: [
      "Conference",
      "SPIE"
    ],
    abstract: "Conference publication from Dr. Sanoj Kumar's research record, covering applied mathematics, optimization, image processing, computer vision, machine learning, deep learning, reconstruction, watermarking, segmentation, and visual computing."
  }
];

const news = [
  {
    date: "Mar 2026",
    text: "Elevated to Senior Associate Professor in the Data Science Cluster, SOCS, UPES Dehradun.",
    badge: "New",
  },
  {
    date: "Jul 2025",
    text: "Convenor of FDP on Effective Pedagogy: Practice and Policy Alignment.",
  },
  {
    date: "Jul 2024",
    text: "Convenor of workshop on Deep Learning: From Foundations to Cutting-Edge Techniques.",
  },
  {
    date: "2024",
    text: "Edited book Artificial Intelligence in Healthcare published by CRC Press.",
  },
  {
    date: "2023-2024",
    text: "Received Best Teachers Award at UPES.",
  },
  {
    date: "2020",
    text: "Received Best Paper Award and Young Scientist Award at NETCRYPT.",
  },
];

const travelPosts = [
  {
    title: "Badrinath",
    date: "November 24, 2025",
    image: "/media/badrinath.jpg",
    description:
      "बद्रीनाथ धाम की शांत यात्रा, हिमालय की दिव्यता और आस्था से भरे अनुभवों की एक छोटी झलक।",
    content: `बद्रीनाथ धाम की यात्रा हिमालय की शांति, आध्यात्मिक ऊर्जा और प्राकृतिक सौंदर्य से भरा एक अविस्मरणीय अनुभव है। यह यात्रा केवल एक धार्मिक सफर नहीं, बल्कि आस्था, इतिहास, प्रकृति और मानव धैर्य को करीब से महसूस करने का अवसर है। अलकनंदा नदी के किनारे बसे इस धाम तक पहुंचते हुए हर मोड़ पर पहाड़ों की गंभीरता, नदी की निरंतरता और यात्रियों की श्रद्धा साथ चलती है।

बद्रीनाथ धाम भगवान विष्णु को समर्पित भारत के सबसे पवित्र तीर्थों में से एक माना जाता है। यह चार धाम और उत्तराखंड के छोटे चार धाम यात्रा मार्ग का महत्वपूर्ण हिस्सा है। लोककथा के अनुसार भगवान विष्णु ने यहां गहन तपस्या की थी और माता लक्ष्मी ने उन्हें हिमालय की कठोर ठंड से बचाने के लिए बदरी वृक्ष का रूप धारण किया। इसी कथा से इस स्थान को बदरीनाथ या बदरिकाश्रम के नाम से जाना गया। आदि शंकराचार्य ने इस धाम को पुनः प्रतिष्ठित कर तीर्थ परंपरा में विशेष स्थान दिया, इसलिए यहां उत्तर और दक्षिण भारत की आध्यात्मिक परंपराएं भी एक साथ दिखाई देती हैं।

मंदिर समुद्र तल से लगभग 3,100 मीटर की ऊंचाई पर स्थित है और कठोर मौसम के कारण सामान्यतः वर्ष में लगभग छह महीने ही भक्तों के लिए खुला रहता है। मंदिर के सामने नर पर्वत, पीछे नीलकंठ की दिव्य चोटियां और पास में बहती अलकनंदा धाम के वातावरण को और भी अद्भुत बना देते हैं। इतिहास में इस क्षेत्र ने भूकंप, हिमस्खलन, भू-स्खलन और मौसम की कठिनाइयों को झेला है, फिर भी श्रद्धा की धारा कभी रुकी नहीं।

उत्तराखंड की आपदाओं, विशेषकर 2013 की बाढ़ और भूस्खलन की यादें इस पूरे हिमालयी क्षेत्र की संवेदनशीलता को समझाती हैं। उस समय कई तीर्थयात्री और स्थानीय लोग अलग-अलग स्थानों पर फंस गए थे और बड़े पैमाने पर बचाव कार्य चलाए गए। ऐसी घटनाएं हमें यह भी सिखाती हैं कि पहाड़ों की यात्रा में श्रद्धा के साथ सावधानी, मौसम की जानकारी, स्थानीय प्रशासन के निर्देश और प्रकृति के प्रति सम्मान बहुत जरूरी है।

आज बद्रीनाथ यात्रा केवल दर्शन तक सीमित नहीं रह गई है। बेहतर सड़क, यात्रा पंजीकरण, आपदा प्रबंधन, स्वास्थ्य सहायता और डिजिटल जानकारी के कारण यात्रियों को अधिक सुविधा मिलती है, लेकिन पहाड़ों की वास्तविकता वही है: यहां हर कदम विनम्रता मांगता है। यह यात्रा नोट इन्हीं अनुभवों, रास्तों, तस्वीरों और स्मृतियों को संजोने के लिए तैयार किया गया है, ताकि सफर की शुरुआत से दर्शन तक की अनुभूति एक जगह जीवित रहे।

बद्रीनाथ दर्शन के बाद माणा गांव की ओर जाना इस यात्रा का एक अलग ही सुंदर हिस्सा रहा। भारत-तिब्बत सीमा के पास बसा माणा गांव अपनी ऊंचाई, शांत हिमालयी घाटियों, पत्थर के घरों, बहती नदी और सरल पहाड़ी जीवन के कारण बहुत विशेष लगता है। यहां पहुंचकर ऐसा महसूस होता है कि यात्रा मंदिर के दर्शन से आगे बढ़कर हिमालय की संस्कृति, लोककथाओं और प्रकृति के और करीब चली गई है।

माणा गांव को अक्सर भारत के अंतिम गांव के रूप में जाना जाता है। गांव के आसपास व्यास गुफा, गणेश गुफा, भीम पुल और सरस्वती नदी से जुड़ी मान्यताएं इस स्थान को पौराणिक महत्व देती हैं। संकरी पगडंडियां, दूर तक फैली घाटी, बर्फ से चमकती चोटियां और ठंडी हवा मिलकर यहां के हर दृश्य को यादगार बना देते हैं। बद्रीनाथ यात्रा में माणा गांव का यह पड़ाव श्रद्धा के साथ-साथ हिमालयी जीवन की सादगी और गहराई को महसूस कराने वाला रहा।

## यात्रा एल्बम
• अलकनंदा के संग, बद्रीनाथ दर्शन तक

## यात्रा वीडियो
• माणा गांव की ओर, हिमालयी रास्तों के बीच`,
  },
  {
    title: "Kedarnath",
    date: "April 08, 2026",
    image: "/media/kedarnath.jpg",
    description:
      "केदारनाथ धाम की यात्रा, हिमालय की शांति और भगवान शिव की भक्ति से जुड़े सुंदर अनुभवों की झलक।",
    content: `केदारनाथ धाम की यात्रा हिमालय की ऊंचाइयों, आध्यात्मिक वातावरण और भगवान शिव की भक्ति से भरा एक विशेष अनुभव है। यह यात्रा नोट रास्तों, मौसम, दर्शन और यादगार पलों को संजोने के लिए तैयार किया गया है।`,
  },
  {
    title: "Chakarata",
    date: "April 09, 2026",
    image: "/media/chakarata.jpg",
    description:
      "चकराता की शांत वादियों, ठंडी हवाओं और पहाड़ी सौंदर्य से जुड़े यादगार अनुभवों की झलक।",
    content: `चकराता की यात्रा शांत पहाड़ों, ठंडी हवाओं और प्राकृतिक सुंदरता से भरा एक सुकून देने वाला अनुभव है। यह यात्रा नोट वहां के रास्तों, मौसम, दृश्यों और यादगार पलों को संजोने के लिए तैयार किया गया है।`,
  },
];



const courses = [
  {
    title: "Introduction to Mathematical Logic",
    year: "2026",
    image: "/media/data-structures.jpg",
    description:
      "Foundations of formal reasoning, proof techniques, propositions, predicates, and mathematical structures.",
    topics: ["Logic", "Proofs", "Reasoning", "Structures"],
  },
  {
    title: "PDE and System of ODE Lab",
    year: "2026",
    image: "/media/operating-systems.jpg",
    description:
      "Computational lab work for partial differential equations, systems of ordinary differential equations, and numerical solution methods.",
    topics: ["PDE", "ODE", "Numerics", "Lab"],
  },
  {
    title: "Mathematics I, II, and III",
    year: "2026",
    image: "/media/software-engineering.jpg",
    description:
      "Core undergraduate mathematics covering calculus, algebra, differential equations, transforms, and applied problem solving.",
    topics: ["Calculus", "Algebra", "ODE", "Applications"],
  },
  {
    title: "Discrete Mathematics",
    year: "2026",
    image: "/media/computer-organization.jpg",
    description:
      "Sets, relations, functions, combinatorics, graph theory, recurrence relations, and discrete structures for computing.",
    topics: ["Sets", "Graphs", "Combinatorics", "Structures"],
  },
  {
    title: "Probability and Statistics",
    year: "2026",
    image: "/media/operating-systems.jpg",
    description:
      "Probability models, inference, estimation, hypothesis testing, and statistical foundations for data science.",
    topics: ["Probability", "Inference", "Testing", "Estimation"],
  },
  {
    title: "Introduction to Data Science",
    year: "2026",
    image: "/media/data-structures.jpg",
    description:
      "Data-driven thinking, statistics, computational tools, and introductory machine learning workflows.",
    topics: ["Data", "Statistics", "Python", "Models"],
  },
  {
    title: "Statistics for Data Science",
    year: "2026",
    image: "/media/computer-organization.jpg",
    description:
      "Statistical summaries, distributions, sampling, inference, regression, and data-driven decision making.",
    topics: ["Statistics", "Sampling", "Regression", "Inference"],
  },
  {
    title: "Discrete Mathematical Structures",
    year: "2026",
    image: "/media/software-engineering.jpg",
    description:
      "Mathematical structures used in computer science, including logic, relations, graphs, trees, and counting methods.",
    topics: ["Logic", "Relations", "Graphs", "Counting"],
  },
  {
    title: "Digital Image Processing and Machine Vision",
    year: "2026",
    image: "/media/software-engineering.jpg",
    description:
      "Image enhancement, segmentation, feature extraction, object analysis, and computer vision pipelines.",
    topics: ["Images", "Segmentation", "Features", "Vision"],
  },
  {
    title: "Advanced Mathematics",
    year: "2026",
    image: "/media/operating-systems.jpg",
    description:
      "Advanced mathematical tools for engineering, analytics, modeling, and computational research.",
    topics: ["Modeling", "Analysis", "Transforms", "Applications"],
  },
  {
    title: "Digital Image Processing and Pattern Analysis",
    year: "2026",
    image: "/media/data-structures.jpg",
    description:
      "Pattern analysis, feature representation, classification, and image-processing methods for visual data.",
    topics: ["Patterns", "Features", "Classification", "Images"],
  },
  {
    title: "Applied Numerical Methods",
    year: "2026",
    image: "/media/computer-organization.jpg",
    description:
      "Numerical approximation, interpolation, integration, linear systems, optimization, and computational problem solving.",
    topics: ["Numerics", "Approximation", "Systems", "Optimization"],
  },
  {
    title: "Python Programming",
    year: "2026",
    image: "/media/software-engineering.jpg",
    description:
      "Programming foundations, scientific computing, data handling, and practical Python workflows for analytics.",
    topics: ["Python", "Programming", "Data", "Computing"],
  },
  {
    title: "System Modeling and Identification",
    year: "2026",
    image: "/media/operating-systems.jpg",
    description:
      "Model formulation, parameter identification, dynamic systems, and data-informed representation of physical processes.",
    topics: ["Systems", "Models", "Identification", "Dynamics"],
  },
  {
    title: "Applied Statistical Analysis",
    year: "2026",
    image: "/media/data-structures.jpg",
    description:
      "Applied statistics for experimentation, analysis, interpretation, and evidence-based conclusions.",
    topics: ["Analysis", "Inference", "Experiments", "Evidence"],
  },
  {
    title: "PDE and System of ODE",
    year: "2026",
    image: "/media/computer-organization.jpg",
    description:
      "Theory and applications of differential equations, including partial differential equations and systems of ODEs.",
    topics: ["PDE", "ODE", "Theory", "Applications"],
  },
  {
    title: "Document Image Processing",
    year: "2026",
    image: "/media/software-engineering.jpg",
    description:
      "Document analysis, preprocessing, enhancement, segmentation, recognition, and image-based information extraction.",
    topics: ["Documents", "OCR", "Segmentation", "Enhancement"],
  },
  {
    title: "Machine Learning",
    year: "2026",
    image: "/media/computer-organization.jpg",
    description:
      "Supervised and unsupervised learning, model evaluation, optimization, and applied AI problem solving.",
    topics: ["Regression", "Classification", "Clustering", "Evaluation"],
  },
  {
    title: "Problem Solving",
    year: "2026",
    image: "/media/data-structures.jpg",
    description:
      "Structured analytical thinking, mathematical modeling, algorithms, and practical strategies for complex problems.",
    topics: ["Reasoning", "Algorithms", "Modeling", "Strategy"],
  },
];

const cvSections = {
  Education: [
    {
      period: "2008 - 2013",
      title: "Ph.D. in Applied Mathematics",
      place: "Indian Institute of Technology Roorkee, India",
      detail:
        "Thesis: Robust Estimation of Optical Flow and Disparity Map from Image Sequences. Advisors: Prof. N. Sukavanam and Dr. R. Balasubramanian.",
    },
    {
      period: "2003 - 2005",
      title: "M.Sc. in Mathematics",
      place: "Ch. Charan Singh University, Meerut, India",
      detail: "First division.",
    },
    {
      period: "2000 - 2003",
      title: "B.Sc. in Mathematics",
      place: "Ch. Charan Singh University, Meerut, India",
      detail: "First division.",
    },
    {
      period: "2000",
      title: "Intermediate",
      place: "Ch. Bharat Singh DAV Inter College, Jhabrera, Haridwar, Uttarakhand",
      detail: "First division.",
    },
    {
      period: "1998",
      title: "High School",
      place: "Ch. Bharat Singh DAV Inter College, Jhabrera, Haridwar, Uttarakhand",
      detail: "First division.",
    },
  ],
  Experience: [
    {
      period: "Mar 2026 - Till date",
      title: "Senior Associate Professor",
      place: "Data Science Cluster, SOCS, UPES Dehradun",
      detail:
        "Assigned departmental duties including lectures, tutorials, research work, mentoring, and academic service.",
    },
    {
      period: "Mar 2025 - Feb 2026",
      title: "Associate Professor",
      place: "Data Science Cluster, SOCS, UPES Dehradun",
      detail:
        "Assigned departmental duties including lectures, tutorials, research work, mentoring, and academic service.",
    },
    {
      period: "Jun 2023 - Feb 2025",
      title: "Assistant Professor (Selection Grade)",
      place: "Data Science Cluster, SOCS, UPES Dehradun",
      detail:
        "Teaching and research across mathematics, data science, machine learning, image processing, and departmental academic duties.",
    },
    {
      period: "Jan 2018 - May 2023",
      title: "Assistant Professor (Selection Grade)",
      place: "Department of Mathematics, University of Petroleum and Energy Studies, Dehradun",
      detail:
        "Assigned departmental duties including lectures, tutorials, research work, and student mentoring.",
    },
    {
      period: "Jan 2015 - Dec 2017",
      title: "Assistant Professor (Senior Scale)",
      place: "Department of Mathematics, University of Petroleum and Energy Studies, Dehradun",
      detail:
        "Assigned departmental duties including lectures, tutorials, research work, and academic responsibilities.",
    },
    {
      period: "Oct 2013 - Sep 2014",
      title: "Postdoctoral Fellow",
      place: "Department of Mathematics and Computer Science, University of Udine, Udine, Italy",
      detail:
        "Postdoctoral research in mathematics, computer science, and image-analysis related areas.",
    },
    {
      period: "2008 - 2013",
      title: "Teaching Assistant",
      place: "Department of Mathematics, Indian Institute of Technology Roorkee, India",
      detail:
        "Conducted tutorials and labs for Calculus, Numerical Analysis, Image Processing, and Computer Applications.",
    },
    {
      period: "2008 - 2013",
      title: "MHRD Research Fellow",
      place: "Department of Mathematics, Indian Institute of Technology Roorkee, India",
      detail:
        "Research fellowship during doctoral work on robust optical flow and disparity map estimation.",
    },
    {
      period: "2006 - 2008",
      title: "Guest Lecturer",
      place: "Department of Mathematics, Motilal Nehru National Institute of Technology Allahabad, India",
      detail:
        "Conducted lectures, tutorials, and labs for graduate and undergraduate courses including Mathematics I, II, III, Numerical Analysis, and Business Mathematics.",
    },
  ],
};

function Header({
  section,
  theme,
  onTheme,
  onSearch,
}: {
  section: SectionKey;
  theme: "light" | "dark";
  onTheme: () => void;
  onSearch: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(
        scrollable > 0
          ? Math.min(100, (window.scrollY / scrollable) * 100)
          : 0,
      );
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".more-wrap")) {
        setMoreOpen(false);
      }
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    document.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="site-header">
      <div
        className={`mobile-nav-backdrop ${mobileOpen ? "is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <nav className="nav-pill" aria-label="Main navigation">
        {section !== "home" && (
          <Link className="desktop-page-brand" href="/" aria-label="Dr. Sanoj Kumar Home">
            <strong>Dr. Sanoj</strong>&nbsp;Kumar
          </Link>
        )}
        <Link className="mobile-page-brand" href="/" aria-label="Dr. Sanoj Kumar Home">
          <strong>Dr. Sanoj</strong>&nbsp;Kumar
        </Link>

        <div className={`nav-links ${mobileOpen ? "is-open" : ""}`}>
          <Link
            className={`nav-home-link ${section === "home" ? "active" : ""}`}
            href="/"
            title="Home"
            aria-label="Home"
            onClick={() => setMobileOpen(false)}
          >
            <LottieIcon
              path="/lottie/home-button.json"
              className="home-lottie-icon"
            />
          </Link>
          {primaryNav.map((item) => (
            <Link
              key={item.key}
              className={section === item.key ? "active" : ""}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div
            className="more-wrap"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              className={
                moreNav.some((item) => item.key === section) ? "active" : ""
              }
              onClick={(e) => {
                e.stopPropagation();
                setMoreOpen((value) => !value);
              }}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              More{" "}
              <span className="navbar-dropdown-arrow" aria-hidden="true">
                ▾
              </span>
            </button>
            {moreOpen && (
              <div className="more-menu" role="menu">
                <Link
                  href="/filterverse"
                  role="menuitem"
                  className={section === "filterverse" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoreOpen(false);
                    setMobileOpen(false);
                  }}
                >
                  Filter Verse
                </Link>
                <Link
                  href="/vision-pen"
                  role="menuitem"
                  className={section === "vision-pen" ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoreOpen(false);
                    setMobileOpen(false);
                  }}
                >
                  Vision Pen
                </Link>
                <a
                  href="/resumebuilder"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMoreOpen(false);
                    setMobileOpen(false);
                  }}
                >
                  Scholar Resume
                </a>
                {moreNav.slice(2).map((item) => (
                  <Link
                    href={item.href}
                    key={item.key}
                    role="menuitem"
                    className={section === item.key ? "active" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMoreOpen(false);
                      setMobileOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="nav-actions">
          <button onClick={onSearch} aria-label="Search" className="search-button">
            <span>Search</span>
            <LottieIcon
              path="/lottie/search-icon.json"
              className="search-lottie-icon"
            />
          </button>
          <button
            onClick={onTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="theme-button"
          >
            <LottieIcon
              path="/lottie/theme-toggle.json"
              className="theme-toggle-lottie"
            />
          </button>
          <button
            className="mobile-button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <div
        className="rainbow-progress"
        style={{ width: `${scrollProgress}%` }}
      />
    </header>
  );
}

function SectionTitle({
  children,
  count,
  eyebrow,
}: {
  children: React.ReactNode;
  count?: number;
  eyebrow?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title-with-badge">
          <span>{children}</span>
          {typeof count === "number" && (
            <span className="title-count-badge" aria-label={`${count} items`}>
              {count}
            </span>
          )}
        </h2>
      </div>
    </div>
  );
}

function generateBibTex(pub: Publication): string {
  const authorParts = pub.authors.split(",")[0].trim().split(" ");
  const firstAuthorLast = authorParts[authorParts.length - 1]?.toLowerCase() ?? "peelam";
  const firstWord = pub.title.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const citeKey = `${firstAuthorLast}${pub.year}${firstWord}`;
  const isJournal = pub.tags.some((t) => t.includes("Journal") || t.includes("Indexed"));
  const entryType = isJournal ? "article" : "inproceedings";

  return `@${entryType}{${citeKey},
  title={${pub.title}},
  author={${pub.authors}},
  ${isJournal ? "journal" : "booktitle"}={${pub.venue}},
  year={${pub.year}}${pub.doi ? `,\n  doi={${pub.doi.replace("https://doi.org/", "")}}` : ""}
}`;
}

function PublicationCard({
  publication,
  index,
  open,
  onToggle,
  compact = false,
  liveCitation,
}: {
  publication: Publication;
  index: number;
  open: boolean;
  onToggle: () => void;
  compact?: boolean;
  liveCitation?: number;
}) {
  const [showBib, setShowBib] = useState(false);
  const [copiedBib, setCopiedBib] = useState(false);

  useEffect(() => {
    if (open) {
      setShowBib(false);
    }
  }, [open]);

  const handleToggleAbs = () => {
    if (showBib) setShowBib(false);
    onToggle();
  };

  const handleToggleBib = () => {
    if (open) onToggle();
    setShowBib((v) => !v);
  };

  const citationsCount = liveCitation ?? publication.citations;
  const scholarPaperUrl = getScholarPaperUrl(publication.title);
  const bibtex = generateBibTex(publication);

  const copyBib = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      void navigator.clipboard.writeText(bibtex);
    } catch {}
    setCopiedBib(true);
    setTimeout(() => setCopiedBib(false), 2000);
  };

  return (
    <article className={`publication-card ${compact ? "compact" : ""}`}>
      <div className="publication-body">
        <div className="pub-meta-header">
          <span className="publication-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="venue-chip">
            <em>{publication.venue}</em>
          </span>
          <span className="year-chip">{publication.year}</span>
        </div>
        <h3>{publication.title}</h3>
        <p className="authors">
          {publication.authors.split("Sanoj Kumar").map((part, i, arr) => (
            <span key={`${part}-${i}`}>
              {part}
              {i < arr.length - 1 && <strong className="author-highlight">Sanoj Kumar</strong>}
            </span>
          ))}
        </p>

        {/* Top Attribute Pills matching Dr website / Google Scholar style */}
        <div className="pub-attributes-row">
          {publication.tags.map((tag) => (
            <span key={tag} className="attribute-pill">
              {tag}
            </span>
          ))}
          <a
            className="attribute-pill citation-pill citation-tag"
            href={scholarPaperUrl}
            target="_blank"
            rel="noreferrer"
            title="View this paper and its citations on Google Scholar"
          >
            <span className="firebase-live-dot" aria-hidden="true" />
            Citations: {citationsCount}
          </a>
        </div>

        {/* Bottom Action Pill Buttons: ABS, BIB, HTML (Mutually Exclusive) */}
        <div className="pub-actions-row">
          <button
            type="button"
            onClick={handleToggleAbs}
            className={`action-pill ${open && !showBib ? "active" : ""}`}
            aria-expanded={open && !showBib}
          >
            ABS
          </button>
          <button
            type="button"
            onClick={handleToggleBib}
            className={`action-pill ${showBib ? "active" : ""}`}
            aria-expanded={showBib}
          >
            BIB
          </button>
          {publication.doi ? (
            <a
              href={publication.doi}
              target="_blank"
              rel="noreferrer"
              className="action-pill"
            >
              HTML <ExternalLink size={11} style={{ marginLeft: 3 }} />
            </a>
          ) : (
            <a
              href="https://scholar.google.com/citations?user=MdGRPEIAAAAJ&hl=en"
              target="_blank"
              rel="noreferrer"
              className="action-pill"
            >
              HTML <ExternalLink size={11} style={{ marginLeft: 3 }} />
            </a>
          )}
        </div>

        {/* Expandable Abstract Box (Mutually Exclusive) */}
        {open && !showBib && (
          <div className="abstract-box">
            <p className="abstract">{publication.abstract}</p>
          </div>
        )}

        {/* Expandable BibTeX Box (Mutually Exclusive) */}
        {showBib && !open && (
          <div className="bibtex-box">
            <div className="bibtex-header">
              <span>BibTeX Citation</span>
              <button type="button" onClick={copyBib} className="copy-bib-btn">
                {copiedBib ? "Copied!" : "Copy BibTeX"}
              </button>
            </div>
            <pre>{bibtex}</pre>
          </div>
        )}
      </div>
    </article>
  );
}

function AnimatedCount({
  value,
  fallback = "…",
  className = "",
}: {
  value: number;
  fallback?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [tickColor, setTickColor] = useState<string | null>(null);
  const [isTicking, setIsTicking] = useState<boolean>(false);

  useEffect(() => {
    if (value <= 0) return;

    const targetVal = value;
    const tickColors = ["#48dbfb", "#1dd1a1", "#feca57", "#ff6b6b", "#a855f7", "#22c55e"];
    let colorIdx = 0;
    const duration = 2400;
    const frameDelay = 20;
    const maxFrames = Math.floor(duration / frameDelay);
    const step = Math.max(1, Math.ceil(targetVal / maxFrames));
    let cur = 0;

    setIsTicking(true);

    const timer = setInterval(() => {
      cur += step;
      if (cur >= targetVal) {
        cur = targetVal;
        clearInterval(timer);
        setDisplayValue(targetVal);
        setTickColor(null);
        setIsTicking(false);
      } else {
        const nextColor = tickColors[colorIdx % tickColors.length];
        colorIdx++;
        setTickColor(nextColor);
        setDisplayValue(cur);
      }
    }, frameDelay);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span
      className={`animated-count ${isTicking ? "is-ticking" : ""} ${className}`}
      style={
        tickColor
          ? ({
              color: tickColor,
              WebkitTextFillColor: tickColor,
              textShadow: `0 0 8px ${tickColor}`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {displayValue > 0 ? displayValue.toLocaleString() : fallback}
    </span>
  );
}

function SocialStrip() {
  const [visitorTotal, setVisitorTotal] = useState<number>(14850);
  const [scholar, setScholar] = useState<ScholarMetrics>({
    total_citations: 622,
    h_index: 14,
    i10_index: 17,
  });

  useEffect(() => {
    const unsubCounter = subscribeVisitorCounter({
      onTotal: (total) => setVisitorTotal(total),
    });
    const unsubScholar = subscribeScholarMetrics((m) => {
      setScholar((prev) => ({
        total_citations: m.total_citations ?? prev.total_citations,
        h_index: m.h_index ?? prev.h_index,
        i10_index: m.i10_index ?? prev.i10_index,
      }));
    });
    return () => {
      unsubCounter();
      unsubScholar();
    };
  }, []);

  const socials = [
    {
      id: "cv",
      label: "Download CV",
      href: "/documents/Sanoj-Kumar-updated.pdf",
      icon: FaFileLines,
    },
    {
      id: "email",
      label: "Email",
      href: "mailto:sanoj.kumar@upes.ac.in",
      icon: FaEnvelope,
    },
    {
      id: "scholar",
      label: "Google Scholar",
      href: "https://scholar.google.com/citations?user=MdGRPEIAAAAJ",
      icon: SiGooglescholar,
    },
    {
      id: "orcid",
      label: "ORCID",
      href: "https://orcid.org/0000-0002-8022-3815",
      icon: SiOrcid,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: "https://wa.me/919058523010",
      icon: SiWhatsapp,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/dr-sanoj-kumar",
      icon: FaLinkedinIn,
    },
    {
      id: "youtube",
      label: "YouTube",
      href: "https://youtube.com/@msptutorial7884",
      icon: SiYoutube,
    },
  ];

  return (
    <section className="social-panel" aria-label="Contact and research profiles">
      {/* SVG Gradient definitions for brand-tailored gradient icons */}
      <svg width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <linearGradient id="grad-cv" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="grad-email" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#3a7bd5" />
          </linearGradient>
          <linearGradient id="grad-scholar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4285f4" />
            <stop offset="33%" stopColor="#ea4335" />
            <stop offset="66%" stopColor="#f4b400" />
            <stop offset="100%" stopColor="#34a853" />
          </linearGradient>
          <linearGradient id="grad-orcid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a6ce39" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="grad-whatsapp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25d366" />
            <stop offset="100%" stopColor="#128c7e" />
          </linearGradient>
          <linearGradient id="grad-linkedin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a66c2" />
            <stop offset="100%" stopColor="#0077b5" />
          </linearGradient>
          <linearGradient id="grad-youtube" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="100%" stopColor="#ff4d6d" />
          </linearGradient>
        </defs>
      </svg>

      <div className="social site-social-strip">
        <div className="social-icons contact-icons">
          {socials.map(({ id, label, href, icon: Icon }) => (
            <a
              href={href}
              key={label}
              className={`social-icon-btn ${id}`}
              aria-label={label}
              title={label}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
            >
              <Icon />
            </a>
          ))}
        </div>
        <div className="visitor-counter">
          <span className="visitor-counter-item">
            <span className="visitor-counter-eye" aria-hidden="true">
              <img src="/media/view.gif" alt="" width={34} height={34} />
            </span>
            <AnimatedCount
              value={visitorTotal}
              fallback="14,850"
              className="visitor-counter-value"
            />
          </span>
          <span className="visitor-counter-text">
            <span className="visitor-counter-separator" aria-hidden="true"> | </span>
            <span className="visitor-counter-metric">
              Citations :{" "}
              <AnimatedCount
                value={scholar.total_citations ?? 622}
                fallback="622"
                className="visitor-counter-metric-value"
              />
            </span>
            <span className="visitor-counter-separator" aria-hidden="true"> | </span>
            <span className="visitor-counter-metric">
              H-index :{" "}
              <AnimatedCount
                value={scholar.h_index ?? 14}
                fallback="14"
                className="visitor-counter-metric-value"
              />
            </span>
            <span className="visitor-counter-separator" aria-hidden="true"> | </span>
            <span className="visitor-counter-metric">
              i10-index :{" "}
              <AnimatedCount
                value={scholar.i10_index ?? 17}
                fallback="17"
                className="visitor-counter-metric-value"
              />
            </span>
          </span>
        </div>
        <div className="contact-note">
          The best way to reach me is via email at{" "}
          <a href="mailto:sanoj.kumar@upes.ac.in">
            sanoj.kumar@upes.ac.in
          </a>
          .
        </div>
      </div>
    </section>
  );
}

function getCitationCount(title: string, liveMap: Record<string, number>, fallback: number): number {
  if (liveMap[title] !== undefined) return liveMap[title];
  const norm = normalizeScholarTitle(title);
  for (const [key, val] of Object.entries(liveMap)) {
    if (normalizeScholarTitle(key) === norm) return val;
  }
  return fallback;
}

function HomePage() {
  const [opened, setOpened] = useState<number | null>(null);
  const [liveCitationsMap, setLiveCitationsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    return subscribePublicationCitations((map) => {
      setLiveCitationsMap(map);
    });
  }, []);

  return (
    <>
      <section className="hero">
        <div className="portrait-ring">
          <img
            src="/media/profile.png"
            alt="Dr. Sanoj Kumar"
            width={190}
            height={190}
          />
        </div>
        <h1>
          <span className="font-weight-bold">
            Dr. Sanoj Kumar
          </span>
        </h1>
        <div className="credentials">
          <p>
            <LottieIcon
              path="/lottie/tiktok-bullet-loader.json"
              className="about-bullet-lottie"
            />
            <span>
              <strong>Senior Associate Professor</strong> at{" "}
              <a href="https://www.upes.ac.in/">UPES Dehradun, Uttarakhand</a>
            </span>
          </p>
          <p>
            <LottieIcon
              path="/lottie/tiktok-bullet-loader.json"
              className="about-bullet-lottie"
            />
            <span>
              <strong>IEEE Member and active reviewer</strong>
            </span>
          </p>
          <p>
            <LottieIcon
              path="/lottie/tiktok-bullet-loader.json"
              className="about-bullet-lottie"
            />
            <span>
              <strong>Ph.D. in Applied Mathematics</strong> from{" "}
              <a href="https://www.iitr.ac.in/">
                IIT Roorkee
              </a>
            </span>
          </p>
          <p>
            <LottieIcon
              path="/lottie/tiktok-bullet-loader.json"
              className="about-bullet-lottie"
            />
            <span>
              <strong>M.Sc. Mathematics</strong> from{" "}
              <a href="https://www.ccsuniversity.ac.in/">Ch. Charan Singh University, Meerut</a>
            </span>
          </p>
          <p>
            <LottieIcon
              path="/lottie/tiktok-bullet-loader.json"
              className="about-bullet-lottie"
            />
            <span>
              <strong>Research Areas:</strong> Mathematical Statistics, Optimization,
              Computer Vision, Machine Learning
            </span>
          </p>
        </div>
      </section>

      <article className="bio copy">
        <p>
          I am Dr. Sanoj Kumar, Senior Associate Professor in the Data Science
          Cluster, School of Computer Science, UPES Dehradun. My work brings
          mathematical foundations into intelligent visual computing, combining
          statistics, numerical analysis, optimization, image processing,
          computer vision, machine learning, and deep learning to solve
          data-rich real-world problems.
        </p>
        <p>
          I completed my Ph.D. in Applied Mathematics from IIT Roorkee with a
          thesis on robust estimation of optical flow and disparity maps from
          image sequences. I later served as a Postdoctoral Fellow at the
          University of Udine, Italy.
        </p>
        <p>
          My research portfolio includes medical image analysis, brain MRI and
          tumor segmentation, image watermarking, NURBS-based reconstruction,
          texture classification, visual surveillance, anomaly detection, and
          AI-driven mathematical modeling.
        </p>
        <p>
          I have supervised doctoral, postgraduate, undergraduate, and minor
          projects, and I actively contribute through teaching, FDPs, workshops,
          reviewing, and conference service.
        </p>
      </article>

      <section className="home-section">
        <SectionTitle eyebrow="Highlights">News</SectionTitle>
        <div className="news-table">
          {news.map((item) => (
            <div className="news-row" key={`${item.date}-${item.text}`}>
              <time>{item.date}</time>
              <p>
                {item.badge && <span className="new-badge">{item.badge}</span>}
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <Link className="text-link" href="/news">
          View all news <ChevronRight size={16} />
        </Link>
      </section>

      <section className="home-section">
        <SectionTitle eyebrow="Recent activity">Latest Updates</SectionTitle>
        <div className="updates-grid">
          <Link href="/award-fdp" className="update-card">
            <div className="update-card-header">
              <span className="update-category-tag tag-membership">Professional Honor</span>
              <time className="update-date">Aug 23, 2026</time>
            </div>
            <strong>IEEE Member and active reviewer</strong>
            <p className="update-description">Elevated to IEEE Senior Member grade in recognition of significant professional experience and contributions to engineering and research.</p>
            <span className="update-card-footer">View Achievement <ChevronRight size={14} /></span>
          </Link>
          <Link href="/award-fdp" className="update-card">
            <div className="update-card-header">
              <span className="update-category-tag tag-award">Award</span>
              <time className="update-date">May 17, 2026</time>
            </div>
            <strong>Wiley Top Viewed Article 2025</strong>
            <p className="update-description">Recognized by Wiley for top-cited research article on DemocracyGuard in Expert Systems.</p>
            <span className="update-card-footer">Read Announcement <ChevronRight size={14} /></span>
          </Link>
          <Link href="/teaching" className="update-card">
            <div className="update-card-header">
              <span className="update-category-tag tag-teaching">Teaching</span>
              <time className="update-date">May 08, 2026</time>
            </div>
            <strong>Operating System Interview Questions</strong>
            <p className="update-description">Curated study notes & practice questions for Operating Systems interview preparation.</p>
            <span className="update-card-footer">View Materials <ChevronRight size={14} /></span>
          </Link>
          <Link href="/news" className="update-card">
            <div className="update-card-header">
              <span className="update-category-tag tag-fellowship">Fellowship</span>
              <time className="update-date">Mar 03, 2026</time>
            </div>
            <strong>Postdoctoral Research - University of Udine</strong>
            <p className="update-description">Awarded Postdoctoral Fellow, Department of Mathematics and Computer Science, University of Udine, Italy.</p>
            <span className="update-card-footer">View Details <ChevronRight size={14} /></span>
          </Link>
          <Link href="/publications" className="update-card">
            <div className="update-card-header">
              <span className="update-category-tag tag-research">Research</span>
              <time className="update-date">Apr 15, 2025</time>
            </div>
            <strong>Top 10 Most-Cited Paper Recognition</strong>
            <p className="update-description">Recognized among the Top 10 Most-Cited Papers in IET Quantum Communication.</p>
            <span className="update-card-footer">Explore Paper <ChevronRight size={14} /></span>
          </Link>
        </div>
      </section>

      <section className="home-section">
        <SectionTitle count={publications.length} eyebrow="Selected work">
          Publications
        </SectionTitle>
        <div className="publication-list">
          {publications.map((publication, index) => (
            <PublicationCard
              compact
              key={`${publication.title}-${index}`}
              publication={publication}
              index={index}
              open={opened === index}
              onToggle={() => setOpened(opened === index ? null : index)}
              liveCitation={getCitationCount(publication.title, liveCitationsMap, publication.citations)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function getQuartileRank(tags: string[]): number {
  for (const tag of tags) {
    if (tag.includes("Q1")) return 1;
    if (tag.includes("Q2")) return 2;
    if (tag.includes("Q3")) return 3;
    if (tag.includes("Q4")) return 4;
  }
  return 5;
}

function getImpactFactor(tags: string[]): number {
  for (const tag of tags) {
    const match = tag.match(/Impact Factor:\s*([\d.]+)/i);
    if (match) return parseFloat(match[1]);
  }
  return 0;
}

function PublicationsPage() {
  const [opened, setOpened] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [liveCitationsMap, setLiveCitationsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    return subscribePublicationCitations((map) => {
      setLiveCitationsMap(map);
    });
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = publications.filter((publication) => {
      const matchesText =
        `${publication.title} ${publication.authors} ${publication.venue}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesText && (year === "all" || publication.year === Number(year));
    });

    if (sortBy === "quartile") {
      list = [...list].sort((a, b) => getQuartileRank(a.tags) - getQuartileRank(b.tags));
    } else if (sortBy === "year-desc") {
      list = [...list].sort((a, b) => b.year - a.year);
    } else if (sortBy === "year-asc") {
      list = [...list].sort((a, b) => a.year - b.year);
    } else if (sortBy === "impact-desc") {
      list = [...list].sort((a, b) => getImpactFactor(b.tags) - getImpactFactor(a.tags));
    } else if (sortBy === "citations-desc") {
      list = [...list].sort((a, b) => {
        const citA = getCitationCount(a.title, liveCitationsMap, a.citations);
        const citB = getCitationCount(b.title, liveCitationsMap, b.citations);
        return citB - citA;
      });
    }

    return list;
  }, [query, year, sortBy, liveCitationsMap]);

  return (
    <section className="page-section">
      <PageIntro
        eyebrow="Research record"
        title="Publications"
        count={publications.length}
        sortElement={
          <div className="title-sort-wrapper">
            <span className="title-sort-icon">⚡</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="title-sort-select"
              aria-label="Sort publications"
            >
              <option value="default">Default Order</option>
              <option value="quartile">Quartile (Q1 → Q4)</option>
              <option value="year-desc">Year (Newest First)</option>
              <option value="year-asc">Year (Oldest First)</option>
              <option value="impact-desc">Impact Factor (Highest)</option>
              <option value="citations-desc">Citations (Most Cited)</option>
            </select>
          </div>
        }
        description={`Complete research record comprising ${publications.length} journal papers and conference proceedings, including journal impact factors where available.`}
      />
      <div className="publication-toolbar">
        <label className="filter-input">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search publications"
            aria-label="Search publications"
          />
        </label>
        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          aria-label="Filter by year"
        >
          <option value="all">All years</option>
          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2018, 2014, 2013, 2012, 2011].map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort by"
          className="toolbar-sort-select"
        >
          <option value="default">Sort: Default</option>
          <option value="quartile">Sort: Quartile (Q1 → Q4)</option>
          <option value="year-desc">Sort: Year (Newest)</option>
          <option value="year-asc">Sort: Year (Oldest)</option>
          <option value="impact-desc">Sort: Impact Factor</option>
          <option value="citations-desc">Sort: Citations</option>
        </select>
        <span className="result-count">
          Showing <strong>{filteredAndSorted.length}</strong> of <strong>{publications.length}</strong> Total Publications
        </span>
      </div>
      <div className="publication-list">
        {filteredAndSorted.map((publication) => {
          const originalIndex = publications.indexOf(publication);
          return (
            <PublicationCard
              key={`${publication.title}-${originalIndex}`}
              publication={publication}
              index={originalIndex}
              open={opened === originalIndex}
              onToggle={() =>
                setOpened(opened === originalIndex ? null : originalIndex)
              }
              liveCitation={getCitationCount(publication.title, liveCitationsMap, publication.citations)}
            />
          );
        })}
      </div>
    </section>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
  count,
  sortElement,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count?: number;
  sortElement?: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <div className="title-header-row">
        <h1 className="page-intro-title">{title}</h1>
        {typeof count === "number" && (
          <span className="title-count-badge" title={`Total ${count} Publications`} aria-label={`${count} items`}>
            {count}
          </span>
        )}
        {sortElement}
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}

const travelQuotes = [
  "Take only memories, leave only footprints, and keep walking toward wonder.",
  "Every journey writes a quiet poem in the language of mountains, rain, and light.",
  "Travel slows the heart enough to notice how beautiful the world already is.",
  "Roads do not only lead to places; they lead us back to ourselves.",
];

function TypewriterQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentQuote = travelQuotes[quoteIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (charIndex < currentQuote.length) {
        timer = setTimeout(() => setCharIndex((c) => c + 1), 45);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2800);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => setCharIndex((c) => c - 1), 25);
      } else {
        setIsDeleting(false);
        setQuoteIndex((q) => (q + 1) % travelQuotes.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, quoteIndex]);

  return (
    <div className="travel-quote-wrap">
      <p className="travel-kicker">Nature Notes</p>
      <p className="travel-typed-quote">
        "{travelQuotes[quoteIndex].slice(0, charIndex)}"
        <span className="typing-cursor">|</span>
      </p>
    </div>
  );
}

function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<(typeof travelPosts)[0] | null>(null);

  return (
    <section className="page-section">
      <div className="projects travel-blog-grid">
        <div className="header-bar">
          <h1>Travel Blog</h1>
          <TypewriterQuote />
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 compact-travel-row">
          {travelPosts.map((post) => (
            <div className="col mb-4" key={post.title}>
              <div
                className="card h-100 hoverable"
                onClick={() => setSelectedPost(post)}
                style={{ cursor: "pointer" }}
              >
                <figure>
                  <picture>
                    <img
                      src={post.image}
                      className="card-img-top"
                      alt={post.title}
                      loading="eager"
                    />
                  </picture>
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{post.title}</h2>
                  <p className="card-text">{post.description}</p>
                  <p className="post-meta mb-0">{post.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Travel Story Reader Modal */}
      {selectedPost && (
        <div
          className="blog-modal-backdrop"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="blog-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="blog-modal-close"
              onClick={() => setSelectedPost(null)}
            >
              <X size={18} />
            </button>
            <div style={{ marginBottom: "16px" }}>
              <span className="venue-chip" style={{ marginRight: "8px" }}>
                Himalayan Journal
              </span>
              <span className="year-chip">{selectedPost.date}</span>
            </div>
            <h2 style={{ fontSize: "1.6rem", marginBottom: "14px", fontWeight: 800 }}>
              {selectedPost.title}
            </h2>
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              style={{
                width: "100%",
                maxHeight: "380px",
                objectFit: "cover",
                borderRadius: "16px",
                marginBottom: "20px",
              }}
            />
            <div
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.75",
                whiteSpace: "pre-line",
                color: "var(--text)",
              }}
            >
              {selectedPost.content}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TeachingPage() {
  return (
    <section className="page-section">
      <div className="teaching-hero">
        <p className="eyebrow">Learning studio</p>
        <h1>Sanoj Kumar Teaching Studio</h1>
        <strong>Dr. Sanoj Kumar</strong>
        <p>
          Education is where curiosity becomes discipline, and discipline
          becomes transformation.
        </p>
      </div>
      <div className="course-grid">
        {courses.map((course) => (
          <article className="course-card" key={course.title}>
            <img src={course.image} alt="" />
            <div>
              <span className="course-year">{course.year}</span>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <div className="topic-row">
                {course.topics.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
              <Link
                href={
                  course.title === "Operating Systems"
                    ? "/teaching#operating-systems"
                    : "/teaching"
                }
                className="text-link"
              >
                Course resources <ChevronRight size={15} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CvPage() {
  const [openedPub, setOpenedPub] = useState<number | null>(null);
  const [liveCitationsMap, setLiveCitationsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    return subscribePublicationCitations((map) => {
      setLiveCitationsMap(map);
    });
  }, []);

  return (
    <section className="page-section cv-page">
      <div className="cv-hero">
        <div className="cv-avatar-ring">
          <img src="/media/profile-color.jpg" alt="Dr. Sanoj Kumar" />
        </div>
        <div>
          <p className="eyebrow">Academic curriculum vitae</p>
          <h1>Dr. Sanoj Kumar</h1>
          <strong>Senior Associate Professor, UPES Dehradun</strong>
          <strong className="cv-membership">Senior Member, IEEE</strong>
          <p>
            Applied mathematics and data science researcher translating mathematical statistics, numerical analysis, optimization, and visual computing into machine learning and deep learning solutions for complex real-world problems.
          </p>
          <div className="cv-actions">
            <a
              className="primary-link"
              href="/documents/Sanoj-Kumar-updated.pdf"
              download="Sanoj-Kumar-Resume.pdf"
            >
              <Download size={17} /> Download PDF
            </a>
            <a
              className="secondary-link"
              href="mailto:sanoj.kumar@upes.ac.in"
            >
              <Mail size={17} /> Email
            </a>
          </div>
        </div>
      </div>

      <div className="cv-section">
        <SectionTitle eyebrow="Training">Education</SectionTitle>
        <Timeline items={cvSections.Education} />
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Academic journey">Experience</SectionTitle>
        <Timeline items={cvSections.Experience} />
      </div>

      <div className="cv-section">
        <SectionTitle count={publications.length} eyebrow="Scholarly output">
          Peer-Reviewed Publications
        </SectionTitle>
        <div className="publication-list">
          {publications.map((publication, index) => (
            <PublicationCard
              compact
              key={`${publication.title}-${index}`}
              publication={publication}
              index={index}
              open={openedPub === index}
              onToggle={() => setOpenedPub(openedPub === index ? null : index)}
              liveCitation={getCitationCount(publication.title, liveCitationsMap, publication.citations)}
            />
          ))}
        </div>
      </div>

      <div className="cv-section">
        <SectionTitle eyebrow="Key technical & research systems">
          Research Projects & Systems
        </SectionTitle>
        <div className="detail-grid">
          {[
            [
              "QMachine LearningChain",
              "Quantum Machine Learning-Computer Vision fusion framework combining post-quantum cryptographic primitives, lattice-based signatures, and distributed ledgers for Industry 4.0 data protection.",
              "IET Image Processing · 2024",
            ],
            [
              "EVM ITS",
              "Emergency vehicle priority signal preemption and dynamic route optimization using real-time V2X communications and edge computing.",
              "IEEE Transactions on ITS · 2024",
            ],
            [
              "DemocracyGuard",
              "Decentralized electronic voting framework leveraging permissioned blockchain ledgers, zero-knowledge proofs (ZKP), and ring signatures.",
              "Expert Systems · Wiley Top Viewed 2025",
            ],
            [
              "V-Track",
              "Computer Vision-enabled Machine Learning system for reliable vehicle location verification, fusing OBD sensors, RSU multi-lateration, and spatial-temporal consensus.",
              "Digital Communications and Networks · 2024",
            ],
            [
              "V2V & V2G Energy Trading",
              "Hyperledger Fabric blockchain & Stackelberg game theoretical model for carbon-intelligent electric vehicle peer-to-peer energy settlements.",
              "IEEE Internet of Things Journal · 2025",
            ],
            [
              "Quantum-Safe Consumer Machine Learning",
              "Explorative deployment of Quantum Key Distribution (QKD) BB84/E91 protocols and quantum digital signatures for resource-constrained smart home nodes.",
              "IEEE Transactions on Consumer Electronics · 2024",
            ],
            [
              "Vehicular Predictive Maintenance",
              "Privacy-preserving Statistical Modeling (FL) combined with immutable blockchain ledgers for decentralized vehicle component fault diagnosis.",
              "IEEE Transactions on Consumer Electronics · 2024",
            ],
            [
              "FALCON Post-Quantum Signatures",
              "NIST-qualified lattice-based compact signatures for high-speed signature generation and verification in Vehicular Cloud Networks.",
              "Vehicular Communications · 2025",
            ],
          ].map(([title, desc, meta]) => (
            <article key={title}>
              <span>{meta}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="cv-section">
        <SectionTitle eyebrow="Pedagogy & core instruction">
          Teaching Portfolio
        </SectionTitle>
        <div className="detail-grid">
          {courses.map((course) => (
            <article key={course.title}>
              <span>{course.year}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Capabilities">Research & Skills</SectionTitle>
        <div className="skill-grid">
          {[
            ["Research", "Mathematical Statistics, Optimization, Computer Vision, Machine Learning"],
            ["Computing Platforms", "Windows 7, 10, 11"],
            ["Programming Languages", "C, C++, Python, Matlab, Mathematica"],
            ["Tools", "OpenCV"],
            ["Software Packages", "MS Office, LaTeX, SmartDraw"],
          ].map(([title, text]) => (
            <div className="skill-card" key={title}>
              <Code2 size={19} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Recognition">Selected Awards</SectionTitle>
        <div className="award-grid">
          {[
            "GATE Mathematics qualified with All India Rank 201 in 2008",
            "CSIR-UGC NET Mathematics qualified with All India Rank 112 in December 2009",
            "Best Paper Award, NETCRYPT 2020",
            "Young Scientist Award, NETCRYPT 2020",
            "Best Teachers Award, UPES 2023 and UPES 2024",
          ].map((title) => (
            <div className="award-card" key={title}>
              <Award size={20} />
              <strong>{title}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Continuing education">
          Certificates & FDP
        </SectionTitle>
        <div className="detail-grid">
          {[
            [
              "2026",
              "Advanced Architectures and Real-Time Systems for Intelligent Embedded Applications",
              "E&ICT Academy, IIT Guwahati",
            ],
            [
              "2025",
              "Intelligent Systems and Emerging Technologies in Computing and Electronics",
              "UPES Dehradun with NIT Jamshedpur",
            ],
            ["2022", "Project Management", "E&ICT Academy, IIT Kanpur"],
            [
              "2022",
              "Computer Vision — Building Concepts Advanced FDP",
              "Amity University Uttar Pradesh",
            ],
            [
              "2020",
              "Computer Vision",
              "Malaviya National Institute of Technology Jaipur",
            ],
          ].map(([year, title, issuer]) => (
            <article key={title}>
              <span>{year}</span>
              <h3>{title}</h3>
              <p>{issuer}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Academic contribution">
          Professional Service
        </SectionTitle>
        <div className="copy cv-copy-list">
          <p>
            IEEE member, Institute of Electrical and Electronics Engineers, USA.
          </p>
          <p>
            Reviewer for <em>ISA Transactions</em>,{" "}
            <em>Optical Engineering</em>,{" "}
            <em>Applied Mathematical Modelling</em>,{" "}
            <em>IET Image Processing</em>,{" "}
            <em>Mathematics</em>,{" "}
            <em>International Journal of System Assurance Engineering and Management</em>,{" "}
            <em>Symmetry</em>, and{" "}
            <em>Journal of Imaging</em>.
          </p>
          <p>
            Convenor for the workshop <em>Deep Learning: From Foundations to Cutting-Edge Techniques</em> from July 15-19, 2024, and the FDP <em>Effective Pedagogy: Practice and Policy Alignment</em> from July 28-August 01, 2025.
          </p>
          <p>
            Session Co-Chair at CVIP 2016, ICHSA 2018, NETCRYPT 2020, ICCCS 2021, ICCSAI 2023, ICMLDE 2023, ICICCT 2024, and ICMLDE 2025.
          </p>
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Communication">Languages</SectionTitle>
        <div className="detail-grid compact-details">
          <article>
            <h3>Hindi</h3>
            <p>Native / Professional proficiency</p>
          </article>
          <article>
            <h3>English</h3>
            <p>Professional proficiency</p>
          </article>
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Contact record">Personal Details</SectionTitle>
        <div className="profile-details">
          <p>
            <strong>Nationality</strong>
            <span>Indian</span>
          </p>
          <p>
            <strong>Gender</strong>
            <span>Male</span>
          </p>
          <p>
            <strong>Marital Status</strong>
            <span>Married</span>
          </p>
          <p>
            <strong>Current Address</strong>
            <span>
              Village and Post: Manakpur Adampur, District: Haridwar, Uttarakhand, India - 247668
            </span>
          </p>
          <p>
            <strong>Additional Emails</strong>
            <span>
              sanojdma@gmail.com ·
              sanoj.kumar@upes.ac.in
            </span>
          </p>
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle eyebrow="Academic referees">References</SectionTitle>
        <div className="detail-grid reference-grid">
          {[
            [
              "Prof. Biplab Sikdar",
              "National University of Singapore · bsikdar@nus.edu.sg",
            ],
            [
              "Prof. Mohsen Guizani",
              "MBZUAI · mohsen.guizani@mbzuai.ac.ae",
            ],
            [
              "Prof. G. Sai Sesha Chalapathi",
              "IIT Roorkee · gssc@pilani.bits-pilani.ac.in",
            ],
            [
              "Prof. Tejasvi Alladi",
              "IIT Roorkee · tejasvi.alladi@pilani.bits-pilani.ac.in",
            ],
            [
              "Prof. Brijesh Kumar Chaurasia",
              "PSIT Kanpur · brijesh.chaurasia@psit.ac.in",
            ],
          ].map(([name, reference]) => (
            <article key={name}>
              <h3>{name}</h3>
              <p>{reference}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline({
  items,
}: {
  items: Array<{
    period: string;
    title: string;
    place: string;
    detail: string;
  }>;
}) {
  return (
    <div className="timeline">
      {items.map((item) => (
        <article key={`${item.period}-${item.title}`}>
          <span className="timeline-dot" />
          <time>{item.period}</time>
          <h3>{item.title}</h3>
          <strong>{item.place}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function NewsPage() {
  return (
    <section className="page-section">
      <PageIntro
        eyebrow="Milestones"
        title="News"
        description="Academic appointments, recognition, research milestones, and professional development."
      />
      <div className="news-cards">
        {news.map((item, index) => (
          <article key={item.text}>
            <div className="news-icon">
              {index === 0 ? <Award /> : <Sparkles />}
            </div>
            <div>
              <time>{item.date}</time>
              <h2>{item.text}</h2>
              <p>
                A highlight from ongoing academic, research, and professional
                work.
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AwardsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "award" | "fdp" | "honor">("all");

  const achievements = [
    {
      year: "2026",
      category: "honor" as const,
      badge: "Professional Distinction",
      icon: Award,
      title: "Senior Member, IEEE",
      organization: "Institute of Electrical and Electronics Engineers (IEEE)",
      detail:
        "Elevated to IEEE Senior Member grade in recognition of significant professional experience and contributions to engineering and research.",
    },
    {
      year: "2026",
      category: "award" as const,
      badge: "International Award",
      icon: Trophy,
      title: "Best Researcher Award",
      organization: "International Research Excellence Forum",
      detail:
        "International recognition for research excellence in blockchain, post-quantum security & intelligent transportation systems.",
    },
    {
      year: "2026",
      category: "award" as const,
      badge: "Top Publication Honor",
      icon: Medal,
      title: "Wiley Top Viewed Article 2025",
      organization: "Wiley & Sons Journal Publishing",
      detail:
        "Recognized for Best Paper Award and Young Scientist Award at NETCRYPT 2020.",
    },
    {
      year: "2026",
      category: "fdp" as const,
      badge: "Faculty Development",
      icon: GraduationCap,
      title: "Advanced Embedded Systems FDP",
      organization: "E&ICT Academy, IIT Guwahati",
      detail:
        "Advanced Architectures and Real-Time Systems for Intelligent Embedded Applications.",
    },
    {
      year: "2025",
      category: "award" as const,
      badge: "Doctoral Award",
      icon: Award,
      title: "Outstanding Research Article Award",
      organization: "IIT Roorkee EEE Department",
      detail:
        "IIT Roorkee Doctoral Colloquium recognition for work on emergency vehicle management.",
    },
    {
      year: "2025",
      category: "award" as const,
      badge: "Most Cited Honor",
      icon: Sparkles,
      title: "Top 10 Most-Cited Paper Award",
      organization: "IET Quantum Communication",
      detail:
        "Recognition for teaching excellence at UPES in 2023 and 2024.",
    },
    {
      year: "2022",
      category: "fdp" as const,
      badge: "Quantum FDP",
      icon: BookOpen,
      title: "Computer Vision Advanced FDP",
      organization: "Amity University",
      detail: "Faculty development programme on Computer Vision - Building Concepts Advanced.",
    },
    {
      year: "2022",
      category: "fdp" as const,
      badge: "Management FDP",
      icon: ShieldCheck,
      title: "Project Management FDP",
      organization: "E&ICT Academy, IIT Kanpur",
      detail: "Faculty development programme focused on agile research project execution and management.",
    },
    {
      year: "2020",
      category: "fdp" as const,
      badge: "Professional Program",
      icon: GraduationCap,
      title: "Computer Vision PDP",
      organization: "MNIT Jaipur",
      detail:
        "Professional development programme at Malaviya National Institute of Technology Jaipur.",
    },
    {
      year: "Honor",
      category: "honor" as const,
      badge: "Academic Honor",
      icon: Trophy,
      title: "Mr. Talented of the Year",
      organization: "Post-Graduate Academic Recognition",
      detail: "Academic & extracurricular excellence recognition during M.Tech post-graduation.",
    },
  ];

  const filtered = activeTab === "all" ? achievements : achievements.filter((a) => a.category === activeTab);

  return (
    <section className="page-section">
      <PageIntro
        eyebrow="Recognition & development"
        title="Awards & FDP"
        description="Research recognition, academic awards, faculty development programmes, and continuing education."
      />
      <div className="filter-strip" style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All Recognitions" },
          { key: "award", label: "Research Awards" },
          { key: "fdp", label: "FDP & Training" },
          { key: "honor", label: "Academic Honors" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`filter-btn ${activeTab === tab.key ? "active" : ""}`}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="achievement-grid">
        {filtered.map((item) => {
          const IconComp = item.icon;
          return (
            <article key={item.title} className="achievement-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span className="year-tag">{item.year}</span>
                <span className="badge-pill" style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", opacity: 0.85 }}>
                  {item.badge}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{ padding: "0.5rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconComp size={22} />
                </div>
                <h2 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 600 }}>{item.title}</h2>
              </div>
              <div style={{ fontSize: "0.825rem", fontWeight: 500, opacity: 0.7, marginBottom: "0.5rem" }}>
                📍 {item.organization}
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>{item.detail}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProfilesPage() {
  const profiles = [
    {
      name: "Google Scholar",
      note: "Publications, citations, h-index, and research record",
      href: "https://scholar.google.com/citations?user=MdGRPEIAAAAJ",
      icon: SiGooglescholar,
    },
    {
      name: "ORCID",
      note: "Persistent researcher identity · 0000-0002-8022-3815",
      href: "https://orcid.org/0000-0002-8022-3815",
      icon: SiOrcid,
    },
    {
      name: "LinkedIn",
      note: "Academic experience and professional network",
      href: "https://www.linkedin.com/in/dr-sanoj-kumar",
      icon: FaLinkedinIn,
    },
    {
      name: "GitHub",
      note: "Code, experiments, teaching resources, and repositories",
      href: "https://github.com/sanoj1983github",
      icon: SiGithub,
    },
    {
      name: "YouTube",
      note: "Sanoj Kumar Teaching Studio lectures and computer science learning",
      href: "https://youtube.com/@msptutorial7884",
      icon: SiYoutube,
    },
  ];
  return (
    <section className="page-section">
      <PageIntro
        eyebrow="Research identity"
        title="Profiles"
        description="Verified academic, professional, and teaching profiles across the web."
      />
      <div className="profile-link-grid">
        {profiles.map(({ name, note, href, icon: Icon }) => (
          <a href={href} target="_blank" rel="noreferrer" key={name}>
            <Icon />
            <div>
              <h2>{name}</h2>
              <p>{note}</p>
            </div>
            <ExternalLink size={17} />
          </a>
        ))}
      </div>
    </section>
  );
}

function RepositoriesPage() {
  const repos = [
    {
      title: "Academic Portfolio",
      detail:
        "The independent, theme-free portfolio implementation and content source.",
      tags: ["Next.js", "TypeScript", "CSS"],
    },
    {
      title: "Computer Vision and Data Science Experiments",
      detail:
        "Reproducible work around image processing, optimization, machine learning, and data science.",
      tags: ["Computer Vision", "Machine Learning", "Research"],
    },
    {
      title: "Sanoj Kumar Teaching Studio Resources",
      detail:
        "Teaching notes and supporting material for data science, machine learning, statistics, and image processing.",
      tags: ["Education", "Data Science", "Machine Learning"],
    },
  ];
  return (
    <section className="page-section">
      <PageIntro
        eyebrow="Open work"
        title="Repositories"
        description="Code, research experiments, and teaching resources maintained across GitHub."
      />
      <div className="repo-grid">
        {repos.map((repo) => (
          <a
            href="https://github.com/sanoj1983github"
            target="_blank"
            rel="noreferrer"
            key={repo.title}
          >
            <SiGithub size={23} />
            <h2>{repo.title}</h2>
            <p>{repo.detail}</p>
            <div className="topic-row">
              {repo.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function BooksPage() {
  const editedBooks = [
    [
      "Artificial Intelligence in Healthcare: Emphasis on Diabetes, Hypertension and Depression Management",
      "Gaurav Bathla, Sanoj Kumar, Harish Garg, and Deepika Saini",
      "Edited book in the series Intelligent Data-Driven Systems and Artificial Intelligence, CRC Press, 2024.",
    ],
    [
      "Artificial Intelligence Techniques in Mathematical Modeling and Optimization",
      "Mukesh Kumar Awasthi, Sanoj Kumar, and Deepika Saini",
      "Edited book in the series Intelligent Data-Driven Systems and Artificial Intelligence, CRC Press, 2025.",
    ],
  ];

  const bookChapters = [
    [
      "Introduction to AI-Driven Mathematical Modeling",
      "Mukesh Kumar Awasthi, Sanoj Kumar, and Deepika Saini",
      "Artificial Intelligence Techniques in Mathematical Modeling and Optimization, CRC Press, Taylor & Francis, pages 1-12, 2026.",
    ],
    [
      "Deep Learning Techniques From Training to Generalization",
      "Manoj Kumar Singh, Sanoj Kumar, and Deepika Saini",
      "Artificial Intelligence Techniques in Mathematical Modeling and Optimization, CRC Press, Taylor & Francis, pages 57-66, 2026.",
    ],
    [
      "Future Trends and Emerging Technologies in AI Optimization",
      "Sanoj Kumar, Mukesh Kumar Awasthi, and Deepika Saini",
      "Artificial Intelligence Techniques in Mathematical Modeling and Optimization, CRC Press, Taylor & Francis, pages 308-324, 2026.",
    ],
    [
      "Depression Prediction Using Machine Learning Techniques",
      "Sanoj Kumar, Zahid Akhtar, Harsh Satsangi, Sakshi Sehrawat, Namit Arora, and Kartik Bamal",
      "Artificial Intelligence in Healthcare, CRC Press, Taylor & Francis, 2024.",
    ],
    [
      "AI Chatbot for Depression Self-Help",
      "Sanoj Kumar, Rahul Pal, Niki Martinel, and Deepika Saini",
      "Artificial Intelligence in Healthcare, CRC Press, Taylor & Francis, 2024.",
    ],
    [
      "Image watermarking with polar harmonic moments",
      "Sanoj Kumar, Manoj K. Singh, and Deepika Saini",
      "Computing and Simulation for Engineers, CRC Press, Taylor & Francis, 2021.",
    ],
    [
      "SIE: An application to secure Stereo Images using Encryption",
      "Sanoj Kumar and Gaurav Bhatnagar",
      "Handbook of Multimedia Information Security: Techniques and Applications, Springer, October 2018.",
    ],
  ];

  return (
    <section className="page-section">
      <PageIntro
        eyebrow="Books and chapters"
        title="Books"
        description="Edited books and book chapters from Dr. Sanoj Kumar's CV, spanning AI in healthcare, mathematical modeling, optimization, and multimedia security."
      />
      <div className="cv-section">
        <SectionTitle count={editedBooks.length} eyebrow="Edited volumes">
          Edited Books
        </SectionTitle>
        <div className="books-grid">
          {editedBooks.map(([title, author, detail], index) => (
            <article key={title}>
              <div className={`book-cover cover-${index + 1}`}>
                <BookOpen />
              </div>
              <h2>{title}</h2>
              <p>{author}</p>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="cv-section">
        <SectionTitle count={bookChapters.length} eyebrow="Published chapters">
          Book Chapters
        </SectionTitle>
        <div className="detail-grid">
          {bookChapters.map(([title, author, detail]) => (
            <article key={title}>
              <span>Book chapter</span>
              <h3>{title}</h3>
              <p>{author}</p>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GamePage() {
  const games = [
    {
      kicker: "Classic Arcade",
      title: "Snake",
      description:
        "Eat food, grow longer, and survive as long as you can without hitting the walls or yourself.",
      overview:
        "Snake is a timeless reflex game: each food pickup grows your body, makes navigation tighter, and turns every move into a strategy decision.",
    },
    {
      kicker: "Royal Board Game",
      title: "Ludo King",
      description:
        "Roll the dice, race four tokens home, capture rivals, and use safe stars to protect your lead.",
      overview:
        "A local 2–4 player match with animated turns, captures, safe squares, home lanes, bonus rolls, and a winner celebration.",
    },
  ];

  return (
    <section className="page-section">
      <PageIntro
        eyebrow="Play"
        title="Game"
        description="A small set of browser games from the original portfolio."
      />
      <div className="game-grid">
        {games.map((game) => (
          <article className="game-card" key={game.title}>
            <p className="eyebrow">{game.kicker}</p>
            <h2>{game.title}</h2>
            <p>{game.description}</p>
            <div className="game-overview">
              <strong>Overview</strong>
              <p>{game.overview}</p>
            </div>
            <span className="primary-link">Play Now</span>
          </article>
        ))}
      </div>
    </section>
  );
}

interface MantraItem {
  id: string;
  deity: string;
  symbol: string;
  title: string;
  sanskrit: string;
  description: string;
  fullVerses: string;
  englishMeaning: string;
}

const dailyMantraList: MantraItem[] = [
  {
    id: "shiva-tandava",
    deity: "Lord Shiva",
    symbol: "ॐ",
    title: "Shiva Tandava Stotram",
    sanskrit: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्। तरत्तुरङ्गमालिकानिनादवद् डमड्डमद् डमड्डमन्निनादवद् डमर्युगं चकार चण्डताण्डवं तनोतु नः शिवः शिवम्॥",
    description: "Powerful Sanskrit verses composed by King Ravana celebrating Lord Shiva's cosmic dance, divine energy, and eternal rhythm.",
    fullVerses: `जटाटवीगलज्जलप्रवाहपावितस्थले
गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ।
डमड्डमड्डमड्डमन्निनादवड्डमर्वयं
चकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥१॥

जटाकटाहसम्भ्रमभ्रमन्निलिम्पनिर्झरी-
विलोलवीचिवल्लरीविराजमानमूर्धनि ।
धगद्धगद्धगज्ज्वलल्ललाटपट्टपावके
किशोरचन्द्रशेखरे रतिः प्रतिक्षणं मम ॥२॥

धराधरेन्द्रनन्दिनीविलासबन्धुबन्धुर-
स्फुरद्दिगन्तसन्ततिप्रमोदमानमानसे ।
कृपाकटाक्षधोरणीनिरुद्धदुर्धरापदि
क्वचिद्दिगम्बरे मनो विनोदमेतु वस्तुनि ॥३॥`,
    englishMeaning: "With his neck consecrated by the flow of water that flows from his matted hair, and a garland of high snakes hanging around his neck, Lord Shiva performed his fierce cosmic dance to the sound of damaru.",
  },
  {
    id: "shiv-stotram",
    deity: "Lord Shiva",
    symbol: "ॐ",
    title: "Shiv Stotram (Karpura Gauram)",
    sanskrit: "कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम्। सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि॥",
    description: "Sacred ancient Sanskrit verse extolling Lord Shiva's compassionate form, pure as camphor, residing in the heart.",
    fullVerses: `कर्पूरगौरं करुणावतारं
संसारसारम् भुजगेन्द्रहारम् ।
सदावसन्तं हृदयारविन्दे
भवं भवानीसहितं नमामि ॥

ध्यायेन्नित्यं महेशं रजतगिरिनिभं चारुचंद्रावतंसं
रत्नाकल्पोज्ज्वलांगं परशुमृगवराभीतिहस्तं प्रसन्नम् ।
पद्मासीनं समन्तात स्तुतममरगणैर्व्याघ्रकृत्तिं वसानं
विश्वाद्यं विश्ववंद्यं निखिलभयहरं पंचवक्त्रं त्रिनेत्रम् ॥`,
    englishMeaning: "I bow to that Lord Shiva together with Goddess Bhavani, who is white as camphor, the incarnation of compassion, the essence of worldly existence, and who resides forever in the lotus heart.",
  },
  {
    id: "shri-hari",
    deity: "Lord Vishnu",
    symbol: "ॐ",
    title: "Shri Hari Stotram",
    sanskrit: "जगज्जालपालं चलत्कण्ठमालं शरद्चन्द्रफालं महादैत्यकालम्। गले मुण्डमालं तनौ रत्नजालं भजे हं भजे हं नृसिंहं विशालम्॥",
    description: "Devotional praise of Lord Vishnu protecting the cosmic order, showering grace, and destroying darkness.",
    fullVerses: `जगज्जालपालं चलत्कण्ठमालं शरद्चन्द्रफालं महादैत्यकालम् ।
गले मुण्डमालं तनौ रत्नजालं भजे हं भजे हं नृसिंहं विशालम् ॥१॥

सुराधीशलीलं जगत्प्राणनीलं घनाकारकालं सुरारिप्रशस्तम् ।
प्रसन्नास्यपद्मं महादैत्यमर्द्यं भजे हं भजे हं मुकुन्दं मुरारिम् ॥२॥

त्रिविक्रमं विशालं महाभैरवाभं महाचक्रधारीं महादिव्यतेजम् ।
सुरेन्द्रैः सुगीतं शरण्यं वरेण्यं भजे हं भजे हं श्रीहरिम् ॥३॥`,
    englishMeaning: "I worship Shri Hari, the protector of the cosmic web, adorned with shimmering garlands, radiant like the autumn moon, and the eternal refuge of all beings.",
  },
  {
    id: "ganapati-stotram",
    deity: "Lord Ganesha",
    symbol: "卐",
    title: "Sankat Vinashan Ganapati Stotram",
    sanskrit: "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्। भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये॥ प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम्...",
    description: "A sacred prayer to Lord Ganesha for destroying all obstacles, granting intellect, peace, and spiritual fulfillment.",
    fullVerses: `प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम् ।
भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये ॥१॥

प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम् ।
तृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम् ॥२॥

लम्बोदरं पञ्चमं च षष्ठं विकटमेव च ।
सप्तमं विघ्नराजेन्द्रं धूम्रवर्णं तथाष्टमम् ॥३॥

नवमं भालचन्द्रं च दशमं तु विनायकम् ।
एकादशं गणपतिं द्वादशं तु गजाननम् ॥४॥`,
    englishMeaning: "Bow your head in reverence to Vinayaka, the son of Goddess Gauri. Reciting the twelve names of Ganesha daily removes all obstacles and grants success in every endeavor.",
  },
  {
    id: "hanuman-chalisa",
    deity: "Lord Hanuman",
    symbol: "🚩",
    title: "Hanuman Chalisa",
    sanskrit: "जय हनुमान ज्ञान गुण सागर। जय कपीस तिहुँ लोक उजागर॥ राम दूत अतुलित बल धामा। अंजनि पुत्र पवनसुत नामा॥",
    description: "Forty devotional verses composed by Goswami Tulsidas in praise of Lord Hanuman's strength, wisdom, and devotion.",
    fullVerses: `श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि ।
बरनउँ रघुबर बिमल जसु जो दायकु फल चारि ॥

बुद्धिहीन तनु जानिके सुमिरौं पवन-कुमार ।
बल बुद्धि बिकार ॥

जय हनुमान ज्ञान गुन सागर । जय कपीस तिहुँ लोक उजागर ॥
राम दूत अतुलित बल धामा । अंजनि-पुत्र पवनसुत नामा ॥
महाबीर बिक्रम बजरंगी । कुमति निवार सुमति के संगी ॥
कंचन बरन बिराज सुबेसा । कानन कुंडल कुंचित केसा ॥`,
    englishMeaning: "Victory to Hanuman, ocean of wisdom and virtue! Messenger of Lord Rama, possessor of immeasurable strength, remover of difficulties and bestower of wisdom.",
  },
];

function DailyMantraPage() {
  const [selectedMantra, setSelectedMantra] = useState<MantraItem | null>(null);

  return (
    <section className="page-section">
      <div className="daily-mantra-hero">
        <p className="daily-mantra-hero-kicker">Sacred Collection</p>
        <h1 className="daily-mantra-hero-title">Daily Mantra</h1>
        <div className="daily-mantra-hero-line">
          <p>
            "Sacred mantra cards with Shiva Tandava Stotram, Sanskrit verses, and Hindi and English meanings."
          </p>
        </div>
        <div className="daily-mantra-hero-rule" />
      </div>

      <div className="daily-mantra-grid">
        {dailyMantraList.map((item) => (
          <div
            key={item.id}
            className="daily-mantra-card"
            onClick={() => setSelectedMantra(item)}
          >
            <div className="daily-mantra-symbol-wrapper">
              <span className="daily-mantra-symbol">{item.symbol}</span>
            </div>
            <span className="daily-mantra-card-deity">{item.deity}</span>
            <h3 className="daily-mantra-card-title">{item.title}</h3>
            <p className="daily-mantra-card-desc">{item.description}</p>
            <div className="daily-mantra-card-sanskrit">{item.sanskrit}</div>
            <div className="daily-mantra-card-footer">
              <span>Read Full Stotram & Meaning</span>
              <ChevronRight size={15} />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Stotram Reader Modal */}
      {selectedMantra && (
        <div
          className="blog-modal-backdrop"
          onClick={() => setSelectedMantra(null)}
        >
          <div
            className="blog-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px" }}
          >
            <button
              className="blog-modal-close"
              onClick={() => setSelectedMantra(null)}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="daily-mantra-symbol-wrapper" style={{ width: "42px", height: "42px", margin: 0 }}>
                <span className="daily-mantra-symbol" style={{ fontSize: "1.3rem" }}>{selectedMantra.symbol}</span>
              </div>
              <div>
                <span className="venue-chip">{selectedMantra.deity}</span>
              </div>
            </div>

            <h2 style={{ fontSize: "1.65rem", marginBottom: "16px", fontWeight: 800 }}>
              {selectedMantra.title}
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "0.85rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontWeight: 800 }}>
                Sanskrit Verses (संस्कृत श्लोक)
              </h4>
              <div
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.8",
                  fontWeight: 700,
                  whiteSpace: "pre-line",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  background: "color-mix(in srgb, var(--surface) 90%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                  color: "var(--text)",
                }}
              >
                {selectedMantra.fullVerses}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "0.85rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontWeight: 800 }}>
                English Meaning & Significance
              </h4>
              <p
                style={{
                  fontSize: "0.92rem",
                  lineHeight: "1.68",
                  color: "var(--muted)",
                  margin: 0,
                }}
              >
                {selectedMantra.englishMeaning}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectsPage() {
  return (
    <section className="projects-page">
      <PageIntro
        eyebrow="Interactive Work & Systems"
        title="Featured Projects"
        description="Explorations across algorithm design, quantum computing, post-quantum cryptography, and interactive web visualizers."
        count={4}
      />

      <div className="projects-showcase-grid">
        <div className="project-feature-card">
          <div>
            <div className="project-badge-tag">
              <Sparkles size={13} /> Interactive Workbench
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>
              Sorting Visualizer System
            </h3>
            <div className="subdomain-badge-banner" style={{ fontSize: "0.78rem", padding: "4px 10px", marginBottom: "12px" }}>
              <span className="subdomain-badge-link">https://sanoj1983github.github.io/dr-sanojkumar.github.io/sorting-visualizer</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "16px" }}>
              Interactive algorithm animation suite built with step-by-step playback controls, real-time comparisons & swaps telemetry, and Web Audio API tone feedback.
            </p>
            <div className="pub-attributes-row" style={{ marginBottom: "20px" }}>
              <span className="attribute-pill">Algorithms</span>
              <span className="attribute-pill">Interactive Visualizer</span>
              <span className="attribute-pill">React 19</span>
              <span className="attribute-pill">Web Audio API</span>
            </div>
          </div>
          <Link className="btn-sort-primary" href="/sorting-visualizer" style={{ textDecoration: "none", textAlign: "center", justifyContent: "center" }}>
            Launch Visualizer <ChevronRight size={16} />
          </Link>
        </div>

        <div className="project-feature-card">
          <div>
            <div className="project-badge-tag">
              <Sparkles size={13} strokeWidth={2.5} color="#10b981" /> Multi-Monitor Pen System
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>
              Inkora PenApp Ink Studio
            </h3>
            <div className="subdomain-badge-banner" style={{ fontSize: "0.78rem", padding: "4px 10px", marginBottom: "12px" }}>
              <span className="subdomain-badge-link">https://sanoj1983github.github.io/dr-sanojkumar.github.io/inkora</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "16px" }}>
              Windows 10/11 multi-monitor transparent glass overlay annotation app featuring Catmull-Rom smooth splines, laser pointers, shape tools, highlighters, and offline installer.
            </p>
            <div className="pub-attributes-row" style={{ marginBottom: "20px" }}>
              <span className="attribute-pill">C# WPF & Web Canvas</span>
              <span className="attribute-pill">Multi-Monitor Glass Overlay</span>
              <span className="attribute-pill">Catmull-Rom Spline</span>
              <span className="attribute-pill">Subdomain App</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link className="btn-sort-primary" href="/inkora" style={{ flex: "1", textDecoration: "none", textAlign: "center", justifyContent: "center", background: "linear-gradient(135deg, #10b981, #059669)" }}>
              Open Inkora PenApp <ChevronRight size={16} />
            </Link>
            <a
              className="btn-sort-secondary"
              href="/downloads/Inkora-Setup-1.0.0-x64.exe"
              download="Inkora-Setup-1.0.0-x64.exe"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.86rem", padding: "8px 14px" }}
            >
              <Download size={15} /> Download .exe Setup
            </a>
          </div>
        </div>

        <div className="project-feature-card">
          <div>
            <div className="project-badge-tag">
              <Sparkles size={13} strokeWidth={2.5} color="#10b981" /> Hand Gesture AI Vision Studio
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>
              Live Research Frame AI Studio
            </h3>
            <div className="subdomain-badge-banner" style={{ fontSize: "0.78rem", padding: "4px 10px", marginBottom: "12px" }}>
              <span className="subdomain-badge-link">https://sanoj1983github.github.io/dr-sanojkumar.github.io/msp-live-frame</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "16px" }}>
              Real-time AI video-to-video hand-gesture framing system powered by MediaPipe Hand Landmarker, Decart Lucy 2.5 WebRTC, and zero-latency GPU canvas artistic filters. Created by Dr. Sanoj Kumar.
            </p>
            <div className="pub-attributes-row" style={{ marginBottom: "20px" }}>
              <span className="attribute-pill">MediaPipe Vision</span>
              <span className="attribute-pill">Decart Lucy 2.5 WebRTC</span>
              <span className="attribute-pill">Hand Box Hysteresis</span>
              <span className="attribute-pill">Subdomain App</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link className="btn-sort-primary" href="/msp-live-frame" style={{ flex: "1", textDecoration: "none", textAlign: "center", justifyContent: "center", background: "linear-gradient(135deg, #10b981, #059669)" }}>
              Launch Live Research Frame <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div className="project-feature-card">
          <div>
            <div className="project-badge-tag">
              <Code2 size={13} /> Research System
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>
              Brain MRI Segmentation and Vision AI
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "16px" }}>
              Applied deep learning and computer vision research for brain MRI segmentation, texture classification, watermarking, and visual intelligence.
            </p>
            <div className="pub-attributes-row" style={{ marginBottom: "20px" }}>
              <span className="attribute-pill">Medical Imaging</span>
              <span className="attribute-pill">Computer Vision</span>
              <span className="attribute-pill">Deep Learning</span>
            </div>
          </div>
          <Link className="btn-sort-secondary" href="/publications" style={{ textDecoration: "none", textAlign: "center", justifyContent: "center" }}>
            View Publication <ExternalLink size={14} />
          </Link>
        </div>

        <div className="project-feature-card">
          <div>
            <div className="project-badge-tag">
              <BarChart3 size={13} /> Simulation Engine
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>
              Quantum Edge UAV Fleet Router
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "16px" }}>
              Quantum approximate optimization algorithm (QAOA) based route planner for autonomous UAV swarms operating under dynamic network constraints.
            </p>
            <div className="pub-attributes-row" style={{ marginBottom: "20px" }}>
              <span className="attribute-pill">QAOA</span>
              <span className="attribute-pill">UAV Swarms</span>
              <span className="attribute-pill">Optimization</span>
            </div>
          </div>
          <Link className="btn-sort-secondary" href="/publications" style={{ textDecoration: "none", textAlign: "center", justifyContent: "center" }}>
            Explore Research <ExternalLink size={14} />
          </Link>
        </div>

        <div className="project-feature-card">
          <div>
            <div className="project-badge-tag">
              <Layers size={13} /> Analytics Platform
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "8px" }}>
              Real-time Scholar & Visitor Hub
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "16px" }}>
              Distributed real-time pub-sub sync engine powered by Firebase RTDB & REST fallbacks tracking global academic metrics and page engagement.
            </p>
            <div className="pub-attributes-row" style={{ marginBottom: "20px" }}>
              <span className="attribute-pill">Firebase RTDB</span>
              <span className="attribute-pill">Pub-Sub</span>
              <span className="attribute-pill">REST Analytics</span>
            </div>
          </div>
          <Link className="btn-sort-secondary" href="/" style={{ textDecoration: "none", textAlign: "center", justifyContent: "center" }}>
            View Live Dashboard <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

type AlgorithmType =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap";

interface AlgorithmInfo {
  name: string;
  bestTime: string;
  avgTime: string;
  worstTime: string;
  space: string;
  stable: string;
  description: string;
  details: string;
}

const ALGORITHMS_INFO: Record<AlgorithmType, AlgorithmInfo> = {
  bubble: {
    name: "Bubble Sort",
    bestTime: "O(n)",
    avgTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    description:
      "Repeatedly steps through the array, compares adjacent elements and swaps them if out of order.",
    details:
      "Simple comparison-based algorithm suitable for teaching basic sorting mechanics. Efficient primarily for small or nearly sorted datasets.",
  },
  selection: {
    name: "Selection Sort",
    bestTime: "O(n²)",
    avgTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    stable: "No",
    description:
      "Divides input into sorted and unsorted regions, repeatedly selecting the minimum element from the unsorted region.",
    details:
      "Performs O(n²) comparisons but minimizes total memory write operations (at most n swaps), making it efficient when memory writes are expensive.",
  },
  insertion: {
    name: "Insertion Sort",
    bestTime: "O(n)",
    avgTime: "O(n²)",
    worstTime: "O(n²)",
    space: "O(1)",
    stable: "Yes",
    description:
      "Builds the sorted array one item at a time by inserting elements into their correct location relative to sorted items.",
    details:
      "Highly adaptive algorithm that excels on small datasets (n <= 15) and online streaming data arriving sequentially.",
  },
  merge: {
    name: "Merge Sort",
    bestTime: "O(n log n)",
    avgTime: "O(n log n)",
    worstTime: "O(n log n)",
    space: "O(n)",
    stable: "Yes",
    description:
      "Divide-and-conquer algorithm that recursively splits the array into halves, sorts them, and merges them together.",
    details:
      "Provides guaranteed O(n log n) performance regardless of initial array ordering, ideal for external sorting and linked lists.",
  },
  quick: {
    name: "Quick Sort",
    bestTime: "O(n log n)",
    avgTime: "O(n log n)",
    worstTime: "O(n²)",
    space: "O(log n)",
    stable: "No",
    description:
      "Selects a 'pivot' element and partitions the array such that elements smaller than pivot go left and larger go right.",
    details:
      "Widely used in production standard libraries due to superior cache locality and minimal auxiliary space consumption.",
  },
  heap: {
    name: "Heap Sort",
    bestTime: "O(n log n)",
    avgTime: "O(n log n)",
    worstTime: "O(n log n)",
    space: "O(1)",
    stable: "No",
    description:
      "Converts the array into a Binary Max-Heap, then repeatedly extracts the maximum element and restores heap property.",
    details:
      "Combines the in-place storage efficiency of selection sort with the guaranteed O(n log n) time complexity of merge sort.",
  },
};

function playTone(val: number, maxVal: number, audioEnabled: boolean) {
  if (!audioEnabled || typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 140 + (val / maxVal) * 550;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

function SortingVisualizerPage() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("quick");
  const [arraySize, setArraySize] = useState<number>(30);
  const [speed, setSpeed] = useState<number>(40);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [array, setArray] = useState<number[]>([]);
  const [comparedIndices, setComparedIndices] = useState<number[]>([]);
  const [swappedIndices, setSwappedIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [pivotIndex, setPivotIndex] = useState<number | null>(null);

  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [comparisons, setComparisons] = useState<number>(0);
  const [swaps, setSwaps] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const stepsRef = useRef<any[]>([]);
  const stepIdxRef = useRef<number>(0);
  const isSortingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);

  const generateRandomArray = (size: number) => {
    const newArr: number[] = [];
    for (let i = 0; i < size; i++) {
      newArr.push(Math.floor(Math.random() * 260) + 20);
    }
    setArray(newArr);
    setComparedIndices([]);
    setSwappedIndices([]);
    setSortedIndices([]);
    setPivotIndex(null);
    setComparisons(0);
    setSwaps(0);
    setElapsedTime(0);
    setStartTime(null);
    setIsSorting(false);
    setIsPaused(false);
    isSortingRef.current = false;
    isPausedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    generateRandomArray(arraySize);
  }, [arraySize]);

  const handleCopySubdomain = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText("https://sanoj1983github.github.io/dr-sanojkumar.github.io/sorting-visualizer");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateAllSteps = (alg: AlgorithmType, initialArray: number[]) => {
    const steps: any[] = [];
    const a = [...initialArray];
    const n = a.length;

    if (alg === "bubble") {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({ type: "compare", indices: [j, j + 1] });
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            steps.push({ type: "swap", indices: [j, j + 1], array: [...a] });
          }
        }
        steps.push({ type: "sorted", index: n - 1 - i });
      }
      steps.push({ type: "sorted", index: 0 });
    } else if (alg === "selection") {
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          steps.push({ type: "compare", indices: [minIdx, j] });
          if (a[j] < a[minIdx]) {
            minIdx = j;
          }
        }
        if (minIdx !== i) {
          [a[i], a[minIdx]] = [a[minIdx], a[i]];
          steps.push({ type: "swap", indices: [i, minIdx], array: [...a] });
        }
        steps.push({ type: "sorted", index: i });
      }
      steps.push({ type: "sorted", index: n - 1 });
    } else if (alg === "insertion") {
      steps.push({ type: "sorted", index: 0 });
      for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0) {
          steps.push({ type: "compare", indices: [j - 1, j] });
          if (a[j] < a[j - 1]) {
            [a[j], a[j - 1]] = [a[j - 1], a[j]];
            steps.push({ type: "swap", indices: [j - 1, j], array: [...a] });
            j--;
          } else {
            break;
          }
        }
      }
      for (let i = 0; i < n; i++) {
        steps.push({ type: "sorted", index: i });
      }
    } else if (alg === "merge") {
      const helper = (start: number, end: number) => {
        if (start >= end) return;
        const mid = Math.floor((start + end) / 2);
        helper(start, mid);
        helper(mid + 1, end);

        let left = start;
        let right = mid + 1;
        const temp: number[] = [];

        while (left <= mid && right <= end) {
          steps.push({ type: "compare", indices: [left, right] });
          if (a[left] <= a[right]) {
            temp.push(a[left++]);
          } else {
            temp.push(a[right++]);
          }
        }
        while (left <= mid) temp.push(a[left++]);
        while (right <= end) temp.push(a[right++]);

        for (let i = 0; i < temp.length; i++) {
          a[start + i] = temp[i];
          steps.push({ type: "overwrite", index: start + i, value: temp[i], array: [...a] });
        }
      };
      helper(0, n - 1);
      for (let i = 0; i < n; i++) {
        steps.push({ type: "sorted", index: i });
      }
    } else if (alg === "quick") {
      const partition = (low: number, high: number): number => {
        const pivot = a[high];
        steps.push({ type: "pivot", index: high });
        let i = low - 1;
        for (let j = low; j < high; j++) {
          steps.push({ type: "compare", indices: [j, high] });
          if (a[j] < pivot) {
            i++;
            [a[i], a[j]] = [a[j], a[i]];
            steps.push({ type: "swap", indices: [i, j], array: [...a] });
          }
        }
        [a[i + 1], a[high]] = [a[high], a[i + 1]];
        steps.push({ type: "swap", indices: [i + 1, high], array: [...a] });
        return i + 1;
      };

      const quickSortHelper = (low: number, high: number) => {
        if (low < high) {
          const pi = partition(low, high);
          steps.push({ type: "sorted", index: pi });
          quickSortHelper(low, pi - 1);
          quickSortHelper(pi + 1, high);
        } else if (low === high) {
          steps.push({ type: "sorted", index: low });
        }
      };

      quickSortHelper(0, n - 1);
      for (let i = 0; i < n; i++) {
        steps.push({ type: "sorted", index: i });
      }
    } else if (alg === "heap") {
      const heapify = (size: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size) {
          steps.push({ type: "compare", indices: [left, largest] });
          if (a[left] > a[largest]) largest = left;
        }
        if (right < size) {
          steps.push({ type: "compare", indices: [right, largest] });
          if (a[right] > a[largest]) largest = right;
        }

        if (largest !== i) {
          [a[i], a[largest]] = [a[largest], a[i]];
          steps.push({ type: "swap", indices: [i, largest], array: [...a] });
          heapify(size, largest);
        }
      };

      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
      }

      for (let i = n - 1; i > 0; i--) {
        [a[0], a[i]] = [a[i], a[0]];
        steps.push({ type: "swap", indices: [0, i], array: [...a] });
        steps.push({ type: "sorted", index: i });
        heapify(i, 0);
      }
      steps.push({ type: "sorted", index: 0 });
    }

    return steps;
  };

  const runVisualization = () => {
    if (isSortingRef.current) return;
    const steps = generateAllSteps(algorithm, array);
    stepsRef.current = steps;
    stepIdxRef.current = 0;
    setIsSorting(true);
    setIsPaused(false);
    isSortingRef.current = true;
    isPausedRef.current = false;
    const st = Date.now();
    setStartTime(st);

    let compCount = 0;
    let swapCount = 0;

    const executeNextStep = () => {
      if (!isSortingRef.current || isPausedRef.current) return;

      if (stepIdxRef.current >= stepsRef.current.length) {
        setIsSorting(false);
        isSortingRef.current = false;
        setComparedIndices([]);
        setSwappedIndices([]);
        setPivotIndex(null);
        setSortedIndices(Array.from({ length: arraySize }, (_, idx) => idx));
        setElapsedTime(Date.now() - st);
        return;
      }

      const step = stepsRef.current[stepIdxRef.current];
      stepIdxRef.current++;

      if (step.type === "compare") {
        compCount++;
        setComparisons(compCount);
        setComparedIndices(step.indices);
        setSwappedIndices([]);
        playTone(array[step.indices[0]] || 100, 280, audioEnabled);
      } else if (step.type === "swap") {
        swapCount++;
        setSwaps(swapCount);
        setArray(step.array);
        setSwappedIndices(step.indices);
        setComparedIndices([]);
        playTone(step.array[step.indices[0]] || 100, 280, audioEnabled);
      } else if (step.type === "overwrite") {
        swapCount++;
        setSwaps(swapCount);
        setArray(step.array);
        setSwappedIndices([step.index]);
        setComparedIndices([]);
        playTone(step.value, 280, audioEnabled);
      } else if (step.type === "pivot") {
        setPivotIndex(step.index);
      } else if (step.type === "sorted") {
        setSortedIndices((prev) => [...prev, step.index]);
      }

      setElapsedTime(Date.now() - st);
      const delay = Math.max(2, 200 - speed * 3.8);
      timerRef.current = setTimeout(executeNextStep, delay);
    };

    executeNextStep();
  };

  const handlePauseResume = () => {
    if (!isSorting) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
  };

  const currentInfo = ALGORITHMS_INFO[algorithm];
  const maxVal = Math.max(...array, 280);

  return (
    <section className="sorting-page">
      <PageIntro
        eyebrow="Interactive Algorithm Workbench"
        title="Sorting Visualizer"
        description="Step-by-step interactive sorting visualizer with real-time comparison tracking, execution telemetry, and audio feedback synthesizer."
      />

      <div className="subdomain-badge-banner">
        <span>Sub-domain link:</span>
        <a
          href="https://sanoj1983github.github.io/dr-sanojkumar.github.io/sorting-visualizer"
          className="subdomain-badge-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://sanoj1983github.github.io/dr-sanojkumar.github.io/sorting-visualizer
        </a>
        <button
          className="subdomain-copy-btn"
          onClick={handleCopySubdomain}
          title="Copy URL"
        >
          {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
          <span style={{ marginLeft: "4px" }}>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      <div className="sorting-workbench">
        <div className="sorting-control-panel">
          <div className="sorting-controls-grid">
            <div className="sorting-select-group">
              <label>Select Algorithm</label>
              <select
                className="sorting-select"
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value as AlgorithmType);
                  generateRandomArray(arraySize);
                }}
                disabled={isSorting}
              >
                <option value="quick">Quick Sort (Average O(n log n))</option>
                <option value="merge">Merge Sort (Guaranteed O(n log n))</option>
                <option value="heap">Heap Sort (In-place O(n log n))</option>
                <option value="insertion">Insertion Sort (O(n²))</option>
                <option value="selection">Selection Sort (O(n²))</option>
                <option value="bubble">Bubble Sort (O(n²))</option>
              </select>
            </div>

            <div className="sorting-slider-group">
              <label>Array Size: {arraySize} Bars</label>
              <input
                type="range"
                className="sorting-slider"
                min={10}
                max={70}
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                disabled={isSorting}
              />
            </div>

            <div className="sorting-slider-group">
              <label>Animation Speed: {speed}%</label>
              <input
                type="range"
                className="sorting-slider"
                min={1}
                max={50}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="sorting-actions-row">
            <button
              className="btn-sort-primary"
              onClick={runVisualization}
              disabled={isSorting && !isPaused}
            >
              <Play size={16} /> {isSorting ? "Sorting..." : "Start Sorting"}
            </button>

            {isSorting && (
              <button
                className="btn-sort-secondary"
                onClick={handlePauseResume}
              >
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
                {isPaused ? "Resume" : "Pause"}
              </button>
            )}

            <button
              className="btn-sort-secondary"
              onClick={() => generateRandomArray(arraySize)}
            >
              <RotateCcw size={15} /> Reset Array
            </button>

            <button
              className="btn-sort-secondary"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title="Toggle Audio Feedback"
            >
              {audioEnabled ? <Volume2 size={15} color="#10b981" /> : <VolumeX size={15} />}
              {audioEnabled ? "Sound ON" : "Muted"}
            </button>
          </div>
        </div>

        <div className="sorting-canvas-container">
          <div className="sorting-status-bar">
            <div className="sorting-telemetry">
              <span>
                Comparisons: <strong>{comparisons}</strong>
              </span>
              <span>
                Swaps / Writes: <strong>{swaps}</strong>
              </span>
              <span>
                Time: <strong>{(elapsedTime / 1000).toFixed(2)}s</strong>
              </span>
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 750,
                color: isSorting
                  ? isPaused
                    ? "#f59e0b"
                    : "#3b82f6"
                  : sortedIndices.length === arraySize
                  ? "#10b981"
                  : "var(--muted)",
              }}
            >
              Status:{" "}
              {isSorting
                ? isPaused
                  ? "Paused"
                  : "Sorting..."
                : sortedIndices.length === arraySize
                ? "Sorted!"
                : "Idle"}
            </div>
          </div>

          <div className="sorting-bars-frame">
            {array.map((val, idx) => {
              const isComp = comparedIndices.includes(idx);
              const isSwap = swappedIndices.includes(idx);
              const isSorted = sortedIndices.includes(idx);
              const isPivot = pivotIndex === idx;

              let barClass = "default";
              if (isSorted) barClass = "sorted";
              else if (isSwap) barClass = "swap";
              else if (isComp) barClass = "compare";
              else if (isPivot) barClass = "pivot";

              const heightPercent = Math.max(8, Math.round((val / maxVal) * 100));

              return (
                <div
                  key={idx}
                  className={`sorting-bar ${barClass}`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {arraySize <= 35 && val}
                </div>
              );
            })}
          </div>
        </div>

        <div className="algo-info-card">
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "6px" }}>
            {currentInfo.name} Algorithm Breakdown
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: "1.6" }}>
            {currentInfo.description}
          </p>

          <div className="algo-info-grid">
            <div className="algo-stat-box">
              <div className="algo-stat-label">Best Case</div>
              <div className="algo-stat-val">{currentInfo.bestTime}</div>
            </div>
            <div className="algo-stat-box">
              <div className="algo-stat-label">Average Case</div>
              <div className="algo-stat-val">{currentInfo.avgTime}</div>
            </div>
            <div className="algo-stat-box">
              <div className="algo-stat-label">Worst Case</div>
              <div className="algo-stat-val">{currentInfo.worstTime}</div>
            </div>
            <div className="algo-stat-box">
              <div className="algo-stat-label">Space Complexity</div>
              <div className="algo-stat-val">{currentInfo.space}</div>
            </div>
            <div className="algo-stat-box">
              <div className="algo-stat-label">Stable Sort</div>
              <div className="algo-stat-val">{currentInfo.stable}</div>
            </div>
          </div>

          <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: "1.65", margin: 0 }}>
            {currentInfo.details}
          </p>
        </div>
      </div>
    </section>
  );
}

function ComingSoonPage({ kind }: { kind: string }) {
  return (
    <section className="coming-soon">
      <div className="coming-icon">
        {kind === "Projects" ? (
          <BriefcaseBusiness />
        ) : kind === "People" ? (
          <UsersRound />
        ) : (
          <Sparkles />
        )}
      </div>
      <p className="eyebrow">{kind}</p>
      <h1>Coming soon</h1>
      <p>
        This section is being prepared and will be available with the next
        content update.
      </p>
      <Link className="secondary-link" href="/">
        Return home
      </Link>
    </section>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const items = useMemo(
    () => [
      ...primaryNav.map((item) => ({
        title: item.label,
        href: item.href,
        meta: "Page",
      })),
      ...moreNav.map((item) => ({
        title: item.label,
        href: item.href,
        meta: "Page",
      })),
      ...publications.map((publication) => ({
        title: publication.title,
        href: "/publications",
        meta: `${publication.year} · ${publication.venue}`,
      })),
    ],
    [],
  );
  const results = query.trim()
    ? items
        .filter((item) =>
          `${item.title} ${item.meta}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .slice(0, 8)
    : items.slice(0, 6);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="search-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search portfolio"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="search-field">
          <Search size={20} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages and publications"
            aria-label="Search pages and publications"
          />
          <button onClick={onClose} aria-label="Close search">
            <X size={19} />
          </button>
        </div>
        <div className="search-results">
          {results.map((item, index) => (
            <Link href={item.href} key={`${item.title}-${index}`}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>
              <ChevronRight size={17} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const footerFish = [
  {
    top: "8px",
    size: "20px",
    duration: "112s",
    delay: "-38s",
    from: "-8vw",
    midA: "34vw",
    midB: "67vw",
    midC: "91vw",
    to: "108vw",
    face: 1,
    driftY: "5px",
    riseY: "-4px",
    opacity: 0.54,
    filter: "hue-rotate(18deg) saturate(1.22)",
    playback: 0.28,
  },
  {
    top: "24px",
    size: "17px",
    duration: "136s",
    delay: "-84s",
    from: "108vw",
    midA: "72vw",
    midB: "39vw",
    midC: "13vw",
    to: "-8vw",
    face: -1,
    driftY: "4px",
    riseY: "-3px",
    opacity: 0.48,
    filter: "hue-rotate(150deg) saturate(1.18) brightness(1.06)",
    playback: 0.24,
  },
  {
    top: "15px",
    size: "23px",
    duration: "128s",
    delay: "-12s",
    from: "-12vw",
    midA: "29vw",
    midB: "62vw",
    midC: "89vw",
    to: "112vw",
    face: 1,
    driftY: "6px",
    riseY: "-5px",
    opacity: 0.6,
    filter: "hue-rotate(285deg) saturate(1.16)",
    playback: 0.3,
  },
  {
    top: "31px",
    size: "18px",
    duration: "104s",
    delay: "-62s",
    from: "110vw",
    midA: "76vw",
    midB: "43vw",
    midC: "16vw",
    to: "-10vw",
    face: -1,
    driftY: "4px",
    riseY: "-3px",
    opacity: 0.5,
    filter: "hue-rotate(55deg) saturate(1.24) brightness(1.03)",
    playback: 0.26,
  },
  {
    top: "3px",
    size: "16px",
    duration: "148s",
    delay: "-111s",
    from: "104vw",
    midA: "69vw",
    midB: "38vw",
    midC: "12vw",
    to: "-9vw",
    face: -1,
    driftY: "3px",
    riseY: "-3px",
    opacity: 0.46,
    filter: "hue-rotate(215deg) saturate(1.08)",
    playback: 0.22,
  },
  {
    top: "37px",
    size: "21px",
    duration: "119s",
    delay: "-47s",
    from: "-10vw",
    midA: "31vw",
    midB: "63vw",
    midC: "87vw",
    to: "106vw",
    face: 1,
    driftY: "5px",
    riseY: "-4px",
    opacity: 0.52,
    filter: "hue-rotate(325deg) saturate(1.12) brightness(1.04)",
    playback: 0.27,
  },
  {
    top: "12px",
    size: "26px",
    duration: "98s",
    delay: "-23s",
    from: "-15vw",
    midA: "25vw",
    midB: "58vw",
    midC: "83vw",
    to: "115vw",
    face: 1,
    driftY: "7px",
    riseY: "-6px",
    opacity: 0.62,
    filter: "hue-rotate(200deg) saturate(1.3) brightness(1.1)",
    playback: 0.32,
  },
  {
    top: "28px",
    size: "19px",
    duration: "142s",
    delay: "-75s",
    from: "106vw",
    midA: "70vw",
    midB: "35vw",
    midC: "10vw",
    to: "-12vw",
    face: -1,
    driftY: "5px",
    riseY: "-4px",
    opacity: 0.55,
    filter: "hue-rotate(80deg) saturate(1.2)",
    playback: 0.25,
  },
  {
    top: "18px",
    size: "22px",
    duration: "110s",
    delay: "-50s",
    from: "-10vw",
    midA: "33vw",
    midB: "66vw",
    midC: "90vw",
    to: "110vw",
    face: 1,
    driftY: "4px",
    riseY: "-3px",
    opacity: 0.58,
    filter: "hue-rotate(340deg) saturate(1.25)",
    playback: 0.29,
  },
  {
    top: "6px",
    size: "15px",
    duration: "130s",
    delay: "-95s",
    from: "105vw",
    midA: "68vw",
    midB: "36vw",
    midC: "14vw",
    to: "-6vw",
    face: -1,
    driftY: "3px",
    riseY: "-2px",
    opacity: 0.44,
    filter: "hue-rotate(160deg) saturate(1.1)",
    playback: 0.21,
  },
  {
    top: "34px",
    size: "25px",
    duration: "105s",
    delay: "-15s",
    from: "-12vw",
    midA: "28vw",
    midB: "60vw",
    midC: "85vw",
    to: "112vw",
    face: 1,
    driftY: "6px",
    riseY: "-5px",
    opacity: 0.65,
    filter: "hue-rotate(40deg) saturate(1.35) brightness(1.05)",
    playback: 0.31,
  },
  {
    top: "9px",
    size: "42px",
    duration: "46s",
    delay: "-9s",
    from: "0",
    midA: "0",
    midB: "0",
    midC: "0",
    to: "0",
    face: 1,
    driftY: "4px",
    riseY: "-4px",
    opacity: 0.72,
    filter: "hue-rotate(95deg) saturate(1.28) brightness(1.08)",
    playback: 0.23,
    wander: true,
  },
];

function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-wave-background" aria-hidden="true">
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          viewBox="0 0 1600 260"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="footer-wave-back-gradient" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(126, 194, 255, 0.46)" />
              <stop offset="100%" stopColor="rgba(74, 139, 226, 0.2)" />
            </linearGradient>
            <linearGradient id="footer-wave-mid-gradient" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(91, 166, 247, 0.58)" />
              <stop offset="100%" stopColor="rgba(48, 116, 217, 0.34)" />
            </linearGradient>
            <linearGradient id="footer-wave-front-gradient" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(62, 144, 238, 0.68)" />
              <stop offset="100%" stopColor="rgba(35, 101, 205, 0.54)" />
            </linearGradient>
            <path
              id="footer-wave-back"
              fill="url(#footer-wave-back-gradient)"
              d="M-320 46 C-120 10 38 68 230 38 C430 8 586 58 778 34 C1002 6 1138 70 1328 42 C1496 18 1608 28 1760 56 L1760 260 L-320 260 Z"
            />
            <path
              id="footer-wave-mid"
              fill="url(#footer-wave-mid-gradient)"
              d="M-320 80 C-98 38 56 100 250 64 C454 28 604 92 798 58 C1012 26 1146 104 1340 68 C1508 40 1610 54 1760 86 L1760 260 L-320 260 Z"
            />
            <path
              id="footer-wave-front"
              fill="url(#footer-wave-front-gradient)"
              d="M-320 112 C-98 70 50 132 252 94 C470 52 612 120 810 86 C1018 52 1160 132 1358 96 C1518 70 1624 84 1760 118 L1760 260 L-320 260 Z"
            />
          </defs>
          <g>
            <use href="#footer-wave-back" opacity=".62">
              <animateTransform
                attributeName="transform"
                type="translate"
                dur="7s"
                values="240 0; -280 14; 240 0"
                keyTimes="0; .5; 1"
                repeatCount="indefinite"
              />
            </use>
            <use href="#footer-wave-mid" opacity=".72">
              <animateTransform
                attributeName="transform"
                type="translate"
                dur="5s"
                values="-260 0; 230 -12; -260 0"
                keyTimes="0; .55; 1"
                repeatCount="indefinite"
              />
            </use>
            <use href="#footer-wave-front" opacity=".78">
              <animateTransform
                attributeName="transform"
                type="translate"
                dur="3.8s"
                values="80 0; -170 -10; 80 0"
                keyTimes="0; .45; 1"
                repeatCount="indefinite"
              />
            </use>
          </g>
        </svg>
        <div className="footer-sea-life">
          {footerFish.map((fish, index) => (
            <LottieIcon
              key={index}
              path="/lottie/fish.json"
              speed={fish.playback}
              className={`footer-fish ${fish.wander ? "footer-fish-wander" : ""}`}
              style={
                {
                  "--fish-top": fish.top,
                  "--fish-size": fish.size,
                  "--fish-duration": fish.duration,
                  "--fish-delay": fish.delay,
                  "--fish-from": fish.from || "0",
                  "--fish-mid-a": fish.midA || "0",
                  "--fish-mid-b": fish.midB || "0",
                  "--fish-mid-c": fish.midC || "0",
                  "--fish-to": fish.to || "0",
                  "--fish-face": fish.face || 1,
                  "--fish-drift-y": fish.driftY || "4px",
                  "--fish-rise-y": fish.riseY || "-4px",
                  "--fish-opacity": fish.opacity,
                  "--fish-filter": fish.filter || "none",
                } as React.CSSProperties
              }
            />
          ))}
          <span className="footer-jellyfish footer-jellyfish-1" />
          <span className="footer-jellyfish footer-jellyfish-2" />
          <span className="footer-jellyfish footer-jellyfish-3" />
          <span className="footer-jellyfish footer-jellyfish-4" />
          <span className="footer-bubble footer-bubble-1" />
          <span className="footer-bubble footer-bubble-2" />
          <span className="footer-bubble footer-bubble-3" />
          <span className="footer-bubble footer-bubble-4" />
          <span className="footer-bubble footer-bubble-5" />
          <span className="footer-bubble footer-bubble-6" />
        </div>
      </div>
      <div className="footer-wave-content">
        <div className="footer-wave-container">
          © Copyright 2026 Dr. Sanoj Kumar. Last updated: September 1, 2026.
        </div>
      </div>
    </footer>
  );
}

export function PortfolioApp({ section = "home" }: { section?: string }) {
  const validSections = [
    "home",
    ...primaryNav.map((item) => item.key),
    ...moreNav.map((item) => item.key),
    "msp-live-frame",
    "mspliveframe",
    "mriframe",
    "finger-frame",
    "pen-app",
    "penapp",
    "news",
    "repositories",
    "books",
    "profiles",
  ];

  const getEffectiveSection = (): SectionKey => {
    let target = section;
    if (typeof window !== "undefined") {
      const pathSeg = window.location.pathname.replace(/^\//, "").split("/")[0];
      if (pathSeg && validSections.includes(pathSeg)) {
        target = pathSeg;
      }
    }
    return (validSections.includes(target) ? target : "home") as SectionKey;
  };

  const [currentSection, setCurrentSection] = useState<SectionKey>(getEffectiveSection);

  useEffect(() => {
    setCurrentSection(getEffectiveSection());
  }, [section]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleLocationChange = () => {
      const pathSeg = window.location.pathname.replace(/^\//, "").split("/")[0];
      if (pathSeg && validSections.includes(pathSeg)) {
        setCurrentSection(pathSeg as SectionKey);
      } else if (!pathSeg) {
        setCurrentSection("home");
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const safeSection = currentSection;
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("portfolio-theme");
    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || (!stored && preferredDark) ? "dark" : "light";
    document.documentElement.dataset.theme = initial;
    const frame = window.requestAnimationFrame(() => setTheme(initial));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("portfolio-theme", next);
  };

  let content: React.ReactNode;
  switch (safeSection) {
    case "publications":
      content = <PublicationsPage />;
      break;
    case "blog":
      content = <BlogPage />;
      break;
    case "teaching":
      content = <TeachingPage />;
      break;
    case "cv":
      content = <CvPage />;
      break;
    case "projects":
      content = <ProjectsPage />;
      break;
    case "sorting-visualizer":
      content = <SortingVisualizer />;
      break;
    case "vision-pen":
      content = <VisionPenPage />;
      break;
    case "filterverse":
      content = <FilterVerseShell />;
      break;
    case "inkora":
    case "pen-app":
    case "penapp":
      content = <InkoraApp />;
      break;
    case "msp-live-frame":
    case "mspliveframe":
    case "mriframe":
    case "finger-frame":
      content = <MSPLiveFrameApp />;
      break;
    case "people":
      content = <ComingSoonPage kind="People" />;
      break;
    case "game":
      content = <GamePage />;
      break;
    case "daily-mantra":
      content = <DailyMantraPage />;
      break;
    case "bhagwatgita":
      content = <ComingSoonPage kind="Bhagwatgita" />;
      break;
    case "ramayan":
      content = <ComingSoonPage kind="Ramayan" />;
      break;
    case "quantum-computation":
      content = <ComingSoonPage kind="Computer Vision" />;
      break;
    case "blockchain":
      content = <ComingSoonPage kind="Computer Vision" />;
      break;
    case "poems":
      content = <ComingSoonPage kind="Poems" />;
      break;
    case "motivations":
      content = <ComingSoonPage kind="Motivations" />;
      break;
    case "news":
      content = <NewsPage />;
      break;
    case "award-fdp":
      content = <AwardsPage />;
      break;
    case "repositories":
      content = <RepositoriesPage />;
      break;
    case "books":
      content = <BooksPage />;
      break;
    case "profiles":
      content = <ProfilesPage />;
      break;

    default:
      content = <HomePage />;
  }

  return (
    <div className="site-frame">
      <LiveUpdateRefresh />
      <Header
        section={safeSection}
        theme={theme}
        onTheme={toggleTheme}
        onSearch={() => setSearchOpen(true)}
      />
      <main className="site-main">{content}</main>
      <SocialStrip />
      <Footer />
      <ScrollJumpButton pageKey={safeSection} />
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
