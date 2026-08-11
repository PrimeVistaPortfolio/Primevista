// Starter Services catalog seeded on first setup (Admin > Services > "Seed default catalog",
// or via `npm run seed:services`). Fully editable afterwards — this is starting content, not
// hardcoded into the frontend. Grouped by category so the /services listing page and the
// admin Services Manager can render sections instead of one flat list.

const SERVICE_CATEGORIES = [
  "Web & App Development",
  "Business Software",
  "E-commerce & Marketplace",
  "Booking & Mobility",
  "Industry Software",
  "AI, Cloud & Support",
];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const RAW_CATALOG = [
  // Web & App Development
  { title: "Website Development", category: "Web & App Development", keywordFocus: "website development company" },
  { title: "Web Application Development", category: "Web & App Development", keywordFocus: "web application development company" },
  { title: "Mobile App Development", category: "Web & App Development", keywordFocus: "mobile app development company" },
  { title: "Android App Development", category: "Web & App Development", keywordFocus: "android app development company" },
  { title: "iOS App Development", category: "Web & App Development", keywordFocus: "ios app development company" },
  { title: "React Development", category: "Web & App Development", keywordFocus: "react js development company" },
  { title: "Next.js Development", category: "Web & App Development", keywordFocus: "next js development company" },
  { title: "MERN Stack Development", category: "Web & App Development", keywordFocus: "mern stack development company" },
  { title: "Node.js Development", category: "Web & App Development", keywordFocus: "node js development company" },
  { title: "UI/UX Design", category: "Web & App Development", keywordFocus: "ui ux design agency" },
  { title: "API Development", category: "Web & App Development", keywordFocus: "api development company" },
  { title: "Landing Page Development", category: "Web & App Development", keywordFocus: "landing page development service" },
  { title: "Dashboard Development", category: "Web & App Development", keywordFocus: "custom dashboard development" },
  { title: "Admin Panel Development", category: "Web & App Development", keywordFocus: "admin panel development company" },

  // Business Software
  { title: "SaaS Development", category: "Business Software", keywordFocus: "saas development company" },
  { title: "CRM Development", category: "Business Software", keywordFocus: "custom crm development" },
  { title: "ERP Development", category: "Business Software", keywordFocus: "erp software development company" },
  { title: "Custom Software Development", category: "Business Software", keywordFocus: "custom software development company" },
  { title: "Inventory Management System", category: "Business Software", keywordFocus: "inventory management system development" },
  { title: "POS System", category: "Business Software", keywordFocus: "pos system development company" },
  { title: "HRMS", category: "Business Software", keywordFocus: "hrms software development" },
  { title: "Finance & Accounting Software", category: "Business Software", keywordFocus: "finance and accounting software development" },

  // E-commerce & Marketplace
  { title: "E-commerce Website Development", category: "E-commerce & Marketplace", keywordFocus: "ecommerce website development company" },
  { title: "Food Ordering Application", category: "E-commerce & Marketplace", keywordFocus: "food ordering app development" },
  { title: "Restaurant Management System", category: "E-commerce & Marketplace", keywordFocus: "restaurant management system development" },
  { title: "Grocery Delivery App", category: "E-commerce & Marketplace", keywordFocus: "grocery delivery app development" },
  { title: "Quick Commerce Platform", category: "E-commerce & Marketplace", keywordFocus: "quick commerce app development" },
  { title: "Service Marketplace App", category: "E-commerce & Marketplace", keywordFocus: "service marketplace app development" },

  // Booking & Mobility
  { title: "Taxi Booking App", category: "Booking & Mobility", keywordFocus: "taxi booking app development" },
  { title: "Cab Booking Solution", category: "Booking & Mobility", keywordFocus: "cab booking app development company" },
  { title: "Travel Booking Platform", category: "Booking & Mobility", keywordFocus: "travel booking platform development" },
  { title: "Hotel Booking Platform", category: "Booking & Mobility", keywordFocus: "hotel booking platform development" },
  { title: "Real Estate Platform", category: "Booking & Mobility", keywordFocus: "real estate website development" },
  { title: "Property Listing Website", category: "Booking & Mobility", keywordFocus: "property listing website development" },

  // Industry Software
  { title: "School Management Software", category: "Industry Software", keywordFocus: "school management software development" },
  { title: "Hospital Management Software", category: "Industry Software", keywordFocus: "hospital management software development" },
  { title: "Logistics Software", category: "Industry Software", keywordFocus: "logistics software development company" },

  // AI, Cloud & Support
  { title: "AI Integration", category: "AI, Cloud & Support", keywordFocus: "ai integration services" },
  { title: "Chatbot Development", category: "AI, Cloud & Support", keywordFocus: "chatbot development company" },
  { title: "Automation Solutions", category: "AI, Cloud & Support", keywordFocus: "business automation solutions" },
  { title: "Cloud Deployment", category: "AI, Cloud & Support", keywordFocus: "cloud deployment services" },
  { title: "DevOps Services", category: "AI, Cloud & Support", keywordFocus: "devops services company" },
  { title: "Maintenance & Support", category: "AI, Cloud & Support", keywordFocus: "website maintenance and support services" },
];

const SERVICE_CATALOG_SEED = RAW_CATALOG.map((svc, i) => ({
  title: svc.title,
  slug: slugify(svc.title),
  category: svc.category,
  keywordFocus: svc.keywordFocus,
  icon: "code",
  shortDescription: `${svc.title} tailored to your business goals, built for performance and scale.`,
  longDescription: "",
  relatedProjectTags: [],
  featured: false,
  order: i,
  status: "published",
  seo: {
    metaTitle: `${svc.title} Company | PrimeVista Technologies`,
    metaDescription: `Looking for ${svc.title.toLowerCase()}? PrimeVista Technologies delivers custom, scalable, and secure solutions tailored to your business.`,
  },
}));

module.exports = { SERVICE_CATEGORIES, SERVICE_CATALOG_SEED, slugify };
