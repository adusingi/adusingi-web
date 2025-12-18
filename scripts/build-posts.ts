import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

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
  content: string; // Detail API includes content
}

interface PostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  // Summary API excludes content to save bandwidth
}

async function buildPosts() {
  const postsDir = path.join(__dirname, '../posts');
  // Output to public/data so it can be fetched at runtime
  const outputDir = path.join(__dirname, '../public/data');
  const postsOutputDir = path.join(outputDir, 'posts');

  // Check if posts directory exists
  if (!fs.existsSync(postsDir)) {
    console.log('📁 Creating posts directory...');
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // Ensure output directories exist
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(postsOutputDir)) fs.mkdirSync(postsOutputDir, { recursive: true });

  // Read all markdown files
  const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

  if (files.length === 0) {
    console.log('⚠️  No posts found');
    fs.writeFileSync(path.join(outputDir, 'posts.json'), JSON.stringify([], null, 2));
    return;
  }

  const posts: Post[] = [];

  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const frontmatter = data as PostFrontmatter;

    if (frontmatter.draft) continue;

    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');
    const rawHtml = await marked(content);
    const htmlContent = sanitizeHtml(rawHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'title', 'width', 'height']
      }
    });

    const post: Post = {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      description: frontmatter.description,
      tags: frontmatter.tags || [],
      content: htmlContent,
    };

    posts.push(post);

    // Write individual post file (Full Content)
    fs.writeFileSync(
      path.join(postsOutputDir, `${slug}.json`),
      JSON.stringify(post, null, 2)
    );
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Create Summaries (No content) for listing
  const summaries: PostSummary[] = posts.map(({ content, ...summary }) => summary);

  // Pagination Config
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(summaries.length / PAGE_SIZE);

  // Write Main List (Page 1) -> public/data/posts.json (Backward compatibility mostly, or default entry)
  // Actually, let's keep it as the full list OR paginated?
  // Audit Recommendation: "Split posts.json into chunks".
  // Strategy: 
  // posts.json -> Page 1
  // posts-page-2.json -> Page 2
  // ...
  // Metadata about having more pages?

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const chunk = summaries.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE);

    const pageData = {
      posts: chunk,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext: pageNum < totalPages
      }
    };

    const fileName = pageNum === 1 ? 'posts.json' : `posts-page-${pageNum}.json`;
    fs.writeFileSync(
      path.join(outputDir, fileName),
      JSON.stringify(pageData, null, 2)
    );
  }

  // Also write "all-posts.json" (summaries only) for search or tag filtering if needed?
  // The Tag Filter in blog.tsx relied on ALL tags. 
  // If we paginate, tag filtering becomes complex (needs backend or load all summaries).
  // For this portfolio, loading ALL summaries (without content) is likely fine (very small).
  // Loading ALL content was the problem.
  // Let's write `posts-all.json` containing all summaries for client-side tag filtering if desired.
  fs.writeFileSync(
    path.join(outputDir, 'posts-all.json'),
    JSON.stringify(summaries, null, 2)
  );

  console.log(`\n🎉 Built ${posts.length} posts.`);
  console.log(`   - Individual posts: public/data/posts/*.json`);
  console.log(`   - Paginated lists: public/data/posts-page-*.json`);
  console.log(`   - All summaries: public/data/posts-all.json`);
}

buildPosts().catch(err => {
  console.error('❌ Error building posts:', err);
  process.exit(1);
});
