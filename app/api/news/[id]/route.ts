import axios from "axios";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://studentsite.gunadarma.ac.id";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const url = `${BASE_URL}/index.php/site/berita/${id}`;

        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Extract the news title
        const title = $('h3.content-box-header').first().text().trim().replace(/\s+/g, ' ');

        // Extract the news content
        let content = '';
        const contentWrapper = $('div.content-box-wrapper').first();

        // Get all text nodes from the content wrapper
        contentWrapper.contents().each((_, node) => {
            if (node.type === 'text' && $(node).text().trim()) {
                content += $(node).text().trim() + '\n\n';
            }
        });

        // Also get text content from paragraph elements
        contentWrapper.find('p').each((_, element) => {
            const paragraphText = $(element).text().trim();
            if (paragraphText && !content.includes(paragraphText)) {
                content += paragraphText + '\n\n';
            }
        });

        // Extract date
        const dateText = $('div.font-gray').text().trim();
        const dateMatch = dateText.match(/\d{4}-\d{2}-\d{2}/);
        const date = dateMatch ? dateMatch[0] : '';

        return NextResponse.json({
            id,
            title,
            content: content.trim(),
            date,
            url
        });
    } catch (error) {
        console.error("Error fetching news detail:", error);
        return NextResponse.json(
            { error: "Failed to fetch news detail" },
            { status: 500 }
        );
    }
} 