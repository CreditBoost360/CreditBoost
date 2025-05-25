import subprocess
from duckduckgo_search import search

def search_and_notify(query="latest tech news"):
    print(f"Running search for: {query}")

    results = search(query, max_results=3)
    urls = [r['url'] for r in results]

    print("Found URLs:", urls)

    # Send desktop notification on Ubuntu (requires 'notify-send')
    notify_message = f"Search done for '{query}', found {len(urls)} results."
    subprocess.run(['notify-send', 'TinyLlama', notify_message])

if __name__ == "__main__":
    search_and_notify()
