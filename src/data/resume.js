// Arvind Venkatesh's resume, mapped onto Hogwarts castle zones.
// Each zone carries its own camera waypoint (for the GSAP fly-through),
// a proximity anchor + radius (for free-flight overlay reveals), and a
// floating in-world label position.

export const PROFILE = {
  name: 'Arvind Venkatesh',
  tagline:
    'Business Analytics & Information Technology + Data Science · Rutgers University Honors College',
  email: 'arvind.venkat28@gmail.com',
  linkedin: 'linkedin.com/in/arvindvenkatesh36',
  location: 'Robbinsville, NJ',
}

export const ZONES = [
  {
    id: 'great-hall',
    name: 'The Great Hall',
    theme: 'Introduction',
    flavor: 'Welcome, first-year. The floating candles have been expecting you.',
    camera: { position: [-11, 16, 66], lookAt: [-11, 10, 37.5] },
    anchor: [-11, 0, 34],
    radius: 34,
    label: { text: 'The Great Hall', position: [-11, 24, 34] },
    sections: [
      {
        heading: 'Arvind Venkatesh',
        sub: 'Rutgers University — Honors College · Class of 2027',
        items: [
          'B.S. in Business Analytics & Information Technology + Data Science (GPA 3.7/4.0), New Brunswick, NJ.',
          'Solves real-world problems with data and design — from AI product roadmaps at Capital One to full-stack builds and analytics dashboards.',
          'Coursework: Data Management, Management Information Systems, Investment Modeling with R, Regression Methods.',
          'Robbinsville, NJ · arvind.venkat28@gmail.com · linkedin.com/in/arvindvenkatesh36',
        ],
      },
      {
        heading: 'The Spellbook — Skills',
        items: [
          'Languages & frameworks: Python, R, SQL, Java, JavaScript, HTML/CSS, Next.js, Pandas, NumPy, Matplotlib.',
          'Tools: Excel, Tableau, Power BI, Power Automate, Copilot Studio, Firebase Studio, Git, SharePoint, Figma, Jira, Snowflake, Supabase, Agile.',
          'Machine learning & storytelling · Tamil (fluent) · Spanish (intermediate).',
        ],
      },
    ],
  },
  {
    id: 'dungeon',
    name: 'The Potions Dungeon',
    theme: 'Professional Experience',
    flavor: 'Down here, raw data is brewed into measurable impact.',
    camera: { position: [-44, 8, 46], lookAt: [-24, 8, 16] },
    anchor: [-28, 0, 20],
    radius: 32,
    label: { text: 'The Potions Dungeon', position: [-26, 14, 20] },
    sections: [
      {
        heading: 'Capital One — Product Management Intern',
        sub: 'June 2026 – Present · McLean, VA',
        items: [
          'Led requirements gathering and PRD development for a voice-prompted AI banking assistant — projected to cut task completion time by 40% and average handling time by 30 minutes per interaction.',
          'Partnered with engineering and design on AI voice interaction flows, running 10+ user tests projected to reduce error rates by 20%.',
          'Analyzed workflow and usage data across 40+ users with SQL and Python to prioritize a roadmap projected to save 7 hours/week of manual processing.',
        ],
      },
      {
        heading: 'Bristol Myers Squibb — Data Analyst Intern',
        sub: 'June – Aug 2025 · Princeton, NJ',
        items: [
          'Built a Power BI dashboard tracking 10+ productivity metrics, cutting reporting cycles by 6 hours and surfacing performance gaps in real time.',
          'Deployed AI agents in Microsoft Copilot Studio to automate repetitive workflows — 40% less manual effort, ~4 hours saved per week.',
          'Designed automated Power Automate + SharePoint pipelines that improved reporting reliability company-wide.',
        ],
      },
      {
        heading: "L'Oréal — Product Strategy Fellow, Brandstorm",
        sub: 'Feb – Sept 2025 · New York, NY (Remote)',
        items: [
          'Directed a cross-functional team through a 9-month global product innovation competition judged against 150+ universities across 64 countries.',
          'Ran quantitative and statistical analysis of financial, market, and consumer datasets to shape go-to-market strategy and competitive positioning.',
        ],
      },
    ],
  },
  {
    id: 'library',
    name: 'The Library',
    theme: 'Projects',
    flavor: 'The Restricted Section — where the technical builds are shelved.',
    camera: { position: [24, 44, -24], lookAt: [4, 36, -4] },
    anchor: [4, 0, -4],
    radius: 34,
    label: { text: 'The Library', position: [4, 66, -4] },
    sections: [
      {
        heading: 'NBA MVP Predictor',
        sub: 'Python · Machine Learning · scikit-learn',
        items: [
          'Machine-learning model that predicts the NBA Most Valuable Player from historical player and team statistics.',
          'Feature engineering over decades of season data with Pandas/NumPy; trained and evaluated scikit-learn regressors to rank MVP candidates.',
        ],
      },
      {
        heading: 'Practice Pal',
        sub: 'Firebase · JavaScript · Figma',
        items: [
          'Practice-tracking web app for student musicians — log sessions, set goals, and visualize progress over time.',
          'Designed the interface in Figma and shipped it with JavaScript on a Firebase realtime backend and auth.',
        ],
      },
      {
        heading: 'Verizon Case Competition — Winning Team',
        sub: 'Product Strategy & Innovation · Sept – Dec 2025',
        items: [
          'One of 3 winning teams out of 90 across Rutgers–Newark and Rutgers–New Brunswick, judged by Verizon professionals.',
          'Defined product vision, core features, and go-to-market strategy for a user-centric redesign of the student course-scheduling experience.',
        ],
      },
    ],
  },
  {
    id: 'common-room',
    name: 'The Common Room',
    theme: 'Campus Leadership',
    flavor: 'Where the house gathers — and someone has to lead it.',
    camera: { position: [38, 14, 48], lookAt: [26, 10, 30] },
    anchor: [26, 0, 20],
    radius: 34,
    label: { text: 'The Common Room', position: [26, 22, 28] },
    sections: [
      {
        heading: 'Business Information Technology Society (BITS) — VP of Web Development',
        sub: 'April 2026 – Present',
        items: [
          'Maintains the BITS website as the central hub for 500+ Rutgers IT students and 25+ events per semester.',
          'Migrated the site to Next.js + Supabase and led a site-wide redesign, driving a 20% semester-over-semester increase in engagement.',
        ],
      },
      {
        heading: 'Phi Chi Theta (Alpha Omega) — Professional Development Chair',
        sub: 'Dec 2025 – Present',
        items: [
          'Directs professional development for a 60+ member co-ed business fraternity — recruiting, branding, and technical workshops.',
          'Manages a 6-person committee; the chapter holds an 85% internship placement rate.',
        ],
      },
      {
        heading: 'Rutgers University Dhol Effect — President',
        sub: 'April 2024 – Present',
        items: [
          'Oversees weekly rehearsals and 15+ on- and off-campus performances per semester for the South Asian drumming ensemble.',
          'Primary liaison between 21 active members and 7 external organizations, expanding performance opportunities and visibility.',
        ],
      },
    ],
  },
  {
    id: 'quidditch',
    name: 'The Quidditch Pitch',
    theme: 'Hobbies & Interests',
    flavor: 'Every seeker needs a life outside the castle walls.',
    camera: { position: [40, 16, -98], lookAt: [0, -2, -100] },
    anchor: [0, 0, -95],
    radius: 42,
    label: { text: 'The Quidditch Pitch', position: [0, 12, -100] },
    sections: [
      {
        heading: 'Off the Broomstick',
        items: [
          'Basketball — pickup games and a lifelong fan (hence the NBA MVP Predictor).',
          'Indian classical violin — 7+ years of Carnatic training and performance.',
          'Chess, lifting, and track & field — pattern recognition and discipline in equal measure.',
          'Yoga and travel — balance on and off the pitch.',
        ],
      },
    ],
  },
]
