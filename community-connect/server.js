import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory
app.set("views", "./views");

// Serve static files
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.render("index", {
    title: "Home | Community Connect"
  });
});

// Organizations route
app.get("/organizations", (req, res) => {
  const organizations = [
    {
      name: "Green Future Initiative",
      category: "Environmental",
      image: "/images/organizations/green-future.jpg",
      imageAlt: "Volunteers participating in an environmental activity",
      description: "Promoting environmental protection through community participation and sustainable practices.",
      mission: "To create cleaner, greener, and healthier communities."
    },
    {
      name: "Bright Minds Foundation",
      category: "Education",
      image: "/images/organizations/bright-minds.jpg",
      imageAlt: "Students participating in an educational activity",
      description: "Supporting education through learning opportunities, mentorship, and educational resources.",
      mission: "To make quality learning opportunities accessible to everyone."
    },
    {
      name: "Healthy Living Network",
      category: "Health and Wellness",
      image: "/images/organizations/healthy-living.jpg",
      imageAlt: "Community members participating in a health activity",
      description: "Encouraging healthier communities through awareness, outreach, and wellness education.",
      mission: "To promote healthier lives through community engagement."
    }
  ];

  res.render("organizations", {
    title: "Organizations | Community Connect",
    organizations
  });
});



// Service projects route
app.get("/projects", (req, res) => {
  const projects = [
    {
      name: "Community Tree Planting",
      category: "Environmental",
      image: "/images/projects/tree-planting.jpg",
      imageAlt: "Volunteers planting trees in a community",
      description: "Join local volunteers in planting trees and creating greener public spaces.",
      location: "Community parks",
      activity: "Tree planting and environmental awareness"
    },
    {
      name: "Free Digital Literacy Training",
      category: "Educational",
      image: "/images/projects/digital-training.jpg",
      imageAlt: "People learning digital skills in a classroom",
      description: "Help young people and adults develop essential computer and digital skills.",
      location: "Community learning centres",
      activity: "Computer training and mentorship"
    },
    {
      name: "Community Health Outreach",
      category: "Health and Wellness",
      image: "/images/projects/health-outreach.jpg",
      imageAlt: "Volunteers participating in community health outreach",
      description: "Support health awareness and wellness education within local communities.",
      location: "Local community centres",
      activity: "Health education and awareness"
    },
    {
      name: "Neighborhood Clean-up Campaign",
      category: "Community Service",
      image: "/images/projects/cleanup.jpg",
      imageAlt: "Volunteers cleaning a public community space",
      description: "Work together to improve public spaces and promote environmental cleanliness.",
      location: "Local neighborhoods",
      activity: "Community cleaning and waste awareness"
    }
  ];

  res.render("projects", {
    title: "Service Projects | Community Connect",
    projects
  });
});



// Categories route
app.get("/categories", (req, res) => {
  const categories = [
    {
      name: "Environmental",
      icon: "🌳",
      description:
        "Protect the environment through tree planting, community clean-ups, recycling, and conservation activities."
    },
    {
      name: "Educational",
      icon: "📚",
      description:
        "Support learning through tutoring, mentorship, digital literacy training, and access to educational resources."
    },
    {
      name: "Community Service",
      icon: "🤝",
      description:
        "Strengthen communities by helping people in need, supporting local initiatives, and participating in volunteer activities."
    },
    {
      name: "Health and Wellness",
      icon: "❤️",
      description:
        "Promote healthier communities through health awareness, wellness education, outreach, and support initiatives."
    }
  ];

  res.render("categories", {
    title: "Categories | Community Connect",
    categories
  });
});



// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Community Connect is running on port ${PORT}`);
});