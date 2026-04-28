#!/usr/bin/env python3
"""
新闻抓取脚本
从 Hacker News、arXiv 和 RSS 订阅源抓取新闻，输出 news.json
"""

import json
import datetime
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import re
import sys
import time

# ============ 配置 ============
OUTPUT_FILE = "news/news.json"
MAX_HN_ITEMS = 20
MAX_ARXIV_PAPERS = 8
MAX_RSS_ITEMS = 12
CACHE_DURATION_HOURS = 12

# RSS 订阅源（权威科技/AI/音频类）
RSS_SOURCES = [
    {"name": "MIT Tech Review", "url": "https://www.technologyreview.com/feed/", "category": "科技"},
    {"name": "Wired", "url": "https://www.wired.com/feed/rss", "category": "科技"},
    {"name": "TechCrunch", "url": "https://techcrunch.com/feed/", "category": "科技"},
    {"name": "IEEE Spectrum", "url": "https://spectrum.ieee.org/feeds/feed.rss", "category": "科技"},
    {"name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/index", "category": "科技"},
    {"name": "Hacker News", "url": "https://hnrss.org/frontpage", "category": "科技"},
    {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml", "category": "科技"},
    {"name": "Quanta Magazine", "url": "https://www.quantamagazine.org/feed/", "category": "科技"},
    {"name": "AI News", "url": "https://www.artificialintelligence-news.com/feed/", "category": "人工智能"},
    {"name": "MIT AI News", "url": "https://news.mit.edu/rss/ai", "category": "人工智能"},
]

# arXiv 搜索关键词
ARXIV_QUERIES = [
    "cat:cs.AI AND (abs:deep learning OR abs:neural network OR abs:transformer)",
    "cat:cs.LG AND (abs:diffusion model OR abs:audio OR abs:speech)",
    "cat:cs.SD AND (abs:speech enhancement OR abs:denoising)",  # Speech and Audio
]

# ============ 工具函数 ============

def fetch_url(url, timeout=10):
    """获取 URL 内容"""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; NewsFetcher/1.0)"
        })
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  [WARN] fetch {url[:60]}... failed: {e}", file=sys.stderr)
        return None


def parse_rss_item(xml_str, source_name, category):
    """解析单条 RSS 项目"""
    try:
        root = ET.fromstring(xml_str)
        # RSS 2.0
        item = root.find("channel/item") or root.find("item")
        if item is None:
            return None

        def get_text(tag):
            el = item.find(tag)
            return el.text.strip() if el is not None and el.text else ""

        title = get_text("title")
        link = get_text("link")
        desc = get_text("description")
        pub_date = get_text("pubDate")

        if not title or not link:
            return None

        # 清理 HTML 标签
        desc = re.sub(r"<[^>]+>", "", desc).strip()
        if len(desc) > 300:
            desc = desc[:300] + "..."

        return {
            "title": title,
            "link": link,
            "description": desc,
            "source": source_name,
            "category": category,
            "date": pub_date,
            "type": "article"
        }
    except Exception as e:
        print(f"  [WARN] parse RSS item failed: {e}", file=sys.stderr)
        return None


def parse_rss_feed(xml_str, source_name, category, max_items=5):
    """解析整个 RSS Feed"""
    items = []
    try:
        root = ET.fromstring(xml_str)
        channel = root.find("channel") or root
        for item in channel.findall("item")[:max_items]:
            def get_text(tag):
                el = item.find(tag)
                return el.text.strip() if el is not None and el.text else ""

            title = get_text("title")
            link = get_text("link")
            desc = get_text("description")
            pub_date = get_text("pubDate")

            if not title or not link:
                continue

            desc = re.sub(r"<[^>]+>", "", desc).strip()
            if len(desc) > 300:
                desc = desc[:300] + "..."

            items.append({
                "title": title,
                "link": link,
                "description": desc,
                "source": source_name,
                "category": category,
                "date": pub_date,
                "type": "article"
            })
    except Exception as e:
        print(f"  [WARN] parse RSS feed {source_name} failed: {e}", file=sys.stderr)
    return items


def fetch_hacker_news():
    """从 Hacker News 获取热门故事"""
    items = []
    try:
        # 获取 Top Stories IDs
        top_ids_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
        ids_data = fetch_url(top_ids_url)
        if not ids_data:
            return items

        ids = json.loads(ids_data)[:MAX_HN_ITEMS]

        for i, story_id in enumerate(ids):
            try:
                story_url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
                story_data = fetch_url(story_url)
                if not story_data:
                    continue

                story = json.loads(story_data)
                title = story.get("title", "")
                url = story.get("url", f"https://news.ycombinator.com/item?id={story_id}")
                score = story.get("score", 0)
                descendants = story.get("descendants", 0)

                # 判断类别
                title_lower = title.lower()
                category = "科技"
                if any(k in title_lower for k in ["ai", "ml", "machine learning", "deep learning", "neural", "gpt", "llm", "transformer"]):
                    category = "人工智能"
                elif any(k in title_lower for k in ["audio", "music", "speech", "sound", "voice"]):
                    category = "音频"

                items.append({
                    "title": title,
                    "link": url,
                    "description": f"Hacker News · {score} points · {descendants} comments",
                    "source": "Hacker News",
                    "category": category,
                    "date": "",
                    "type": "article"
                })
                time.sleep(0.1)  # 避免请求过快
            except Exception as e:
                print(f"  [WARN] fetch HN story {story_id} failed: {e}", file=sys.stderr)
                continue

    except Exception as e:
        print(f"  [WARN] fetch Hacker News failed: {e}", file=sys.stderr)

    return items


def fetch_arxiv():
    """从 arXiv 获取最新论文"""
    import urllib.parse
    papers = []
    for query in ARXIV_QUERIES:
        try:
            encoded_query = urllib.parse.quote(query)
            search_url = f"https://export.arxiv.org/api/query?search_query={encoded_query}&start=0&max_results={MAX_ARXIV_PAPERS // len(ARXIV_QUERIES)}&sortBy=submittedDate&sortOrder=descending"
            data = fetch_url(search_url)
            if not data:
                continue

            root = ET.fromstring(data)
            ns = {"atom": "http://www.w3.org/2005/Atom"}

            for entry in root.findall("atom:entry", ns)[:MAX_ARXIV_PAPERS // len(ARXIV_QUERIES)]:
                title = entry.find("atom:title", ns)
                title = title.text.strip().replace("\n", " ") if title is not None else ""
                link_el = entry.find("atom:id", ns)
                link = link_el.text.strip() if link_el is not None else ""
                summary = entry.find("atom:summary", ns)
                summary = summary.text.strip().replace("\n", " ") if summary is not None else ""
                published = entry.find("atom:published", ns)
                date = published.text[:10] if published is not None and published.text else ""

                # 判断类别
                title_lower = title.lower()
                category = "深度学习"
                if "audio" in title_lower or "speech" in title_lower or "voice" in title_lower or "sound" in title_lower:
                    category = "音频"
                elif "reinforcement" in title_lower or "gpt" in title_lower or "llm" in title_lower:
                    category = "人工智能"

                if len(summary) > 300:
                    summary = summary[:300] + "..."

                papers.append({
                    "title": title,
                    "link": link,
                    "description": summary,
                    "source": "arXiv",
                    "category": category,
                    "date": date,
                    "type": "paper"
                })
            time.sleep(0.5)
        except Exception as e:
            print(f"  [WARN] fetch arXiv query '{query[:50]}...' failed: {e}", file=sys.stderr)
            continue

    return papers


def fetch_rss_feeds():
    """抓取所有 RSS 源"""
    all_items = []
    for src in RSS_SOURCES:
        print(f"  Fetching RSS: {src['name']}...")
        data = fetch_url(src["url"])
        if data:
            items = parse_rss_feed(data, src["name"], src["category"], max_items=MAX_RSS_ITEMS)
            all_items.extend(items)
            print(f"    -> {len(items)} items")
        time.sleep(0.3)
    return all_items


def main():
    print("=" * 50)
    print(f"News Fetcher started at {datetime.datetime.now().isoformat()}")
    print("=" * 50)

    all_news = []

    # 1. Hacker News
    print("\n[1/3] Fetching Hacker News...")
    hn_news = fetch_hacker_news()
    print(f"  -> Got {len(hn_news)} items")
    all_news.extend(hn_news)

    # 2. arXiv
    print("\n[2/3] Fetching arXiv papers...")
    arxiv_news = fetch_arxiv()
    print(f"  -> Got {len(arxiv_news)} papers")
    all_news.extend(arxiv_news)

    # 3. RSS Feeds
    print("\n[3/3] Fetching RSS feeds...")
    rss_news = fetch_rss_feeds()
    print(f"  -> Got {len(rss_news)} articles")
    all_news.extend(rss_news)

    # 按日期排序（优先有日期的）
    def sort_key(item):
        date = item.get("date", "")
        return date if date else "0"

    all_news.sort(key=sort_key, reverse=True)

    # 去重（基于标题相似度）
    seen_titles = set()
    deduped = []
    for item in all_news:
        title_clean = re.sub(r"[^\w]", "", item["title"].lower())[:50]
        if title_clean not in seen_titles:
            seen_titles.add(title_clean)
            deduped.append(item)

    print(f"\nTotal unique news: {len(deduped)}")

    # 生成输出
    output = {
        "generated_at": datetime.datetime.now().isoformat(),
        "update_interval_hours": CACHE_DURATION_HOURS,
        "items": deduped
    }

    # 写入文件
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nOutput written to {OUTPUT_FILE}")
    print("Done!")


if __name__ == "__main__":
    main()
