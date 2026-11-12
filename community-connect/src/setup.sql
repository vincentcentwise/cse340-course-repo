
-- ==========================================
-- COMMUNITY CONNECT DATABASE SETUP
-- ==========================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    icon VARCHAR(20) NOT NULL,
    description TEXT NOT NULL
);

-- 2. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    image TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    description TEXT NOT NULL,
    mission TEXT NOT NULL
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    image TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    activity TEXT NOT NULL
);

-- 4. PROJECT-CATEGORIES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS project_categories (
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- ==========================================
-- INSERT CATEGORIES
-- ==========================================

INSERT INTO categories (name, slug, icon, description)
VALUES
(
    'Environmental',
    'environmental',
    '🌳',
    'Protect the environment through tree planting, community clean-ups, recycling, and conservation activities.'
),
(
    'Educational',
    'educational',
    '📚',
    'Support learning through tutoring, mentorship, digital literacy training, and access to educational resources.'
),
(
    'Community Service',
    'community-service',
    '🤝',
    'Strengthen communities by helping people in need, supporting local initiatives, and participating in volunteer activities.'
),
(
    'Health and Wellness',
    'health-and-wellness',
    '❤️',
    'Promote healthier communities through health awareness, wellness education, outreach, and support initiatives.'
)
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description;

-- ==========================================
-- INSERT ORGANIZATIONS
-- ==========================================

INSERT INTO organizations (
    name,
    slug,
    category_id,
    image,
    image_alt,
    description,
    mission
)
SELECT
    'Green Future Initiative',
    'green-future-initiative',
    c.id,
    '/images/organizations/green-future.jpg',
    'Volunteers participating in an environmental activity',
    'Promoting environmental protection through community participation and sustainable practices.',
    'To create cleaner, greener, and healthier communities.'
FROM categories c
WHERE c.slug = 'environmental'
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    image = EXCLUDED.image,
    image_alt = EXCLUDED.image_alt,
    description = EXCLUDED.description,
    mission = EXCLUDED.mission;

INSERT INTO organizations (
    name,
    slug,
    category_id,
    image,
    image_alt,
    description,
    mission
)
SELECT
    'Bright Minds Foundation',
    'bright-minds-foundation',
    c.id,
    '/images/organizations/bright-minds.jpg',
    'Students participating in an educational activity',
    'Supporting education through learning opportunities, mentorship, and educational resources.',
    'To make quality learning opportunities accessible to everyone.'
FROM categories c
WHERE c.slug = 'educational'
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    image = EXCLUDED.image,
    image_alt = EXCLUDED.image_alt,
    description = EXCLUDED.description,
    mission = EXCLUDED.mission;

INSERT INTO organizations (
    name,
    slug,
    category_id,
    image,
    image_alt,
    description,
    mission
)
SELECT
    'Healthy Living Network',
    'healthy-living-network',
    c.id,
    '/images/organizations/healthy-living.jpg',
    'Community members participating in a health activity',
    'Encouraging healthier communities through awareness, outreach, and wellness education.',
    'To promote healthier lives through community engagement.'
FROM categories c
WHERE c.slug = 'health-and-wellness'
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    image = EXCLUDED.image,
    image_alt = EXCLUDED.image_alt,
    description = EXCLUDED.description,
    mission = EXCLUDED.mission;

-- ==========================================
-- INSERT PROJECTS
-- ==========================================

INSERT INTO projects (
    name,
    slug,
    organization_id,
    image,
    image_alt,
    description,
    location,
    activity
)
SELECT
    'Community Tree Planting',
    'community-tree-planting',
    o.id,
    '/images/projects/tree-planting.jpg',
    'Volunteers planting trees in a community',
    'Join local volunteers in planting trees and creating greener public spaces.',
    'Community parks',
    'Tree planting and environmental awareness'
FROM organizations o
WHERE o.slug = 'green-future-initiative'
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    organization_id = EXCLUDED.organization_id,
    image = EXCLUDED.image,
    image_alt = EXCLUDED.image_alt,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    activity = EXCLUDED.activity;

INSERT INTO projects (
    name,
    slug,
    organization_id,
    image,
    image_alt,
    description,
    location,
    activity
)
SELECT
    'Free Digital Literacy Training',
    'free-digital-literacy-training',
    o.id,
    '/images/projects/digital-training.jpg',
    'People learning digital skills in a classroom',
    'Help young people and adults develop essential computer and digital skills.',
    'Community learning centres',
    'Computer training and mentorship'
FROM organizations o
WHERE o.slug = 'bright-minds-foundation'
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    organization_id = EXCLUDED.organization_id,
    image = EXCLUDED.image,
    image_alt = EXCLUDED.image_alt,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    activity = EXCLUDED.activity;

INSERT INTO projects (
    name,
    slug,
    organization_id,
    image,
    image_alt,
    description,
    location,
    activity
)
SELECT
    'Community Health Outreach',
    'community-health-outreach',
    o.id,
    '/images/projects/health-outreach.jpg',
    'Volunteers participating in community health outreach',
    'Support health awareness and wellness education within local communities.',
    'Local community centres',
    'Health education and awareness'
FROM organizations o
WHERE o.slug = 'healthy-living-network'
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    organization_id = EXCLUDED.organization_id,
    image = EXCLUDED.image,
    image_alt = EXCLUDED.image_alt,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    activity = EXCLUDED.activity;

INSERT INTO projects (
    name,
    slug,
    organization_id,
    image,
    image_alt,
    description,
    location,
    activity
)
SELECT
    'Neighborhood Clean-up Campaign',
    'neighborhood-clean-up-campaign',
    o.id,
    '/images/projects/cleanup.jpg',
    'Volunteers cleaning a public community space',
    'Work together to improve public spaces and promote environmental cleanliness.',
    'Local neighborhoods',
    'Community cleaning and waste awareness'
FROM organizations o
WHERE o.slug = 'green-future-initiative'
ON CONFLICT (slug)
DO UPDATE SET
    name = EXCLUDED.name,
    organization_id = EXCLUDED.organization_id,
    image = EXCLUDED.image,
    image_alt = EXCLUDED.image_alt,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    activity = EXCLUDED.activity;

-- ==========================================
-- ASSIGN PROJECT CATEGORIES
-- ==========================================

-- Community Tree Planting -> Environmental
INSERT INTO project_categories (project_id, category_id)
SELECT p.id, c.id
FROM projects p
CROSS JOIN categories c
WHERE p.slug = 'community-tree-planting'
AND c.slug = 'environmental'
ON CONFLICT DO NOTHING;

-- Free Digital Literacy Training -> Educational
INSERT INTO project_categories (project_id, category_id)
SELECT p.id, c.id
FROM projects p
CROSS JOIN categories c
WHERE p.slug = 'free-digital-literacy-training'
AND c.slug = 'educational'
ON CONFLICT DO NOTHING;

-- Community Health Outreach -> Health and Wellness
INSERT INTO project_categories (project_id, category_id)
SELECT p.id, c.id
FROM projects p
CROSS JOIN categories c
WHERE p.slug = 'community-health-outreach'
AND c.slug = 'health-and-wellness'
ON CONFLICT DO NOTHING;

-- Neighborhood Clean-up Campaign -> Environmental
INSERT INTO project_categories (project_id, category_id)
SELECT p.id, c.id
FROM projects p
CROSS JOIN categories c
WHERE p.slug = 'neighborhood-clean-up-campaign'
AND c.slug = 'environmental'
ON CONFLICT DO NOTHING;

-- Neighborhood Clean-up Campaign -> Community Service
INSERT INTO project_categories (project_id, category_id)
SELECT p.id, c.id
FROM projects p
CROSS JOIN categories c
WHERE p.slug = 'neighborhood-clean-up-campaign'
AND c.slug = 'community-service'
ON CONFLICT DO NOTHING;
