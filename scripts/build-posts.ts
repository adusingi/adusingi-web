import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
  draft?: boolean;
}

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
}

async function buildPosts() {
  const postsDir = path.join(__dirname, '../posts');
  const outputPath = path.join(__dirname, '../src/data/posts.json');

  // Check if posts directory exists
  if (!fs.existsSync(postsDir)) {
    console.log('📁 Creating posts directory...');
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // Read all markdown files
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('⚠️  No posts found in /posts directory');
    // Create empty posts.json
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    return;
  }

  const posts: Post[] = [];

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter and content
    const { data, content } = matter(fileContent);
    const frontmatter = data as PostFrontmatter;

    // Skip drafts
    if (frontmatter.draft) {
      console.log(`⏭️  Skipping draft: ${file}`);
      continue;
    }

    // Extract slug from filename (remove date prefix and .md extension)
    // Example: 2024-01-15-my-first-post.md -> my-first-post
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');

    // Convert markdown to HTML
    const htmlContent = await marked(content);

    posts.push({
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      description: frontmatter.description,
      tags: frontmatter.tags || [],
      content: htmlContent,
    });

    console.log(`✅ Processed: ${file} -> ${slug}`);
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));

  console.log(`\n🎉 Built ${posts.length} posts -> src/data/posts.json`);
}

buildPosts().catch(err => {
  console.error('❌ Error building posts:', err);
  process.exit(1);
});
