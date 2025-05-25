from duckduckgo_search import DDGS
import requests
from bs4 import BeautifulSoup

def duckduckgo_search(query, max_results=3):
    # Initialize the DuckDuckGo Search client
    ddgs = DDGS()
    # Perform a text search; returns a list of dicts with 'href' keys
    results = ddgs.text(query, max_results=max_results)  # :contentReference[oaicite:0]{index=0}
    urls = [r['href'] for r in results]
    return urls

def scrape_page(url):
    try:
        res = requests.get(url, timeout=5)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all("p")
        text = "\n".join(p.get_text() for p in paragraphs)
        return text[:2000]  # limit to 2000 characters
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return ""

if __name__ == "__main__":
    query = input("Enter search query: ")
    urls = duckduckgo_search(query)
    print(f"Found URLs: {urls}")
    for url in urls:
        print(f"\n--- Content from {url} ---")
        content = scrape_page(url)
        print(content)

