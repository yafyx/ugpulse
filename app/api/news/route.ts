import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

const BASE_URL = "https://studentsite.gunadarma.ac.id";

interface NewsItem {
    id: string;
    title: string;
    link: string;
    date: string;
    content: string;
}

export async function GET() {
    try {
        const response = await axios.get(BASE_URL);
        const html = response.data;
        const $ = cheerio.load(html);

        const newsItems: NewsItem[] = [];

        // Find all news containers
        $('.content-box').each((i, element) => {
            // Extract the title from h3.content-box-header
            const headerElement = $(element).find('h3.content-box-header');
            const titleElement = headerElement.find('a');
            const title = titleElement.text().trim().replace(/\s+/g, ' ');

            // Get the link
            const link = titleElement.attr('href');

            // Extract content from div.content-box-wrapper
            const contentWrapper = $(element).find('div.content-box-wrapper');
            // Extract text content before the "Selengkapnya" button
            let content = '';
            contentWrapper.contents().each((_, node) => {
                if (node.type === 'text' && $(node).text().trim()) {
                    content += $(node).text().trim() + ' ';
                }
            });

            // Get date from div.font-gray
            const dateElement = contentWrapper.find('div.font-gray');
            const dateText = dateElement.text().trim();
            // Extract date using regex (format: yyyy-mm-dd)
            const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}/);
            const date = dateMatch ? dateMatch[0] : '';

            // Extract ID from the link
            let newsId = '';
            if (link) {
                const idMatch = link.match(/berita\/(\d+)/);
                if (idMatch && idMatch[1]) {
                    newsId = idMatch[1];
                }
            }

            // Only add items that have titles and links
            if (title && link) {
                const fullLink = link.startsWith('/') ? `${BASE_URL}${link}` : link;
                newsItems.push({
                    id: newsId,
                    title: title,
                    link: fullLink,
                    date,
                    content: content.trim()
                });
            }
        });

        return NextResponse.json({ news: newsItems });
    } catch (error) {
        console.error("Error fetching news:", error);
        return NextResponse.json(
            { error: "Failed to fetch news" },
            { status: 500 }
        );
    }
} 