import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseMDX(fileContent: string) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = fileContent.match(frontmatterRegex);
  
  let metadata: Record<string, string> = {};
  let content = fileContent;
  
  if (match) {
    const yamlBlock = match[1];
    content = fileContent.replace(frontmatterRegex, '').trim();
    
    const lines = yamlBlock.split('\n');
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        metadata[key] = value;
      }
    }
  }
  
  return { metadata, content };
}

export async function GET() {
  try {
    const achievementsDir = path.join(process.cwd(), 'content', 'achievements');
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    
    const getFilesData = (dir: string) => {
      if (!fs.existsSync(dir)) return [];
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
      return files.map(file => {
        const filePath = path.join(dir, file);
        const rawContent = fs.readFileSync(filePath, 'utf-8');
        const { metadata, content } = parseMDX(rawContent);
        return {
          slug: file.replace('.mdx', ''),
          metadata,
          content
        };
      });
    };

    const achievements = getFilesData(achievementsDir);
    const blog = getFilesData(blogDir);

    return NextResponse.json({ achievements, blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
