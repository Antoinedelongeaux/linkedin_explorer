console.log("[Scraper] Démarrage du scraping LinkedIn...");

function extractPostData(postElement) {
  // 📝 Contenu textuel du post
  const content = postElement.querySelector('.update-components-text')?.innerText.slice(0, 1000) || '';

  // 👤 Auteur du post
  const author = postElement.querySelector('.update-components-actor__title span[aria-hidden="true"]')?.innerText.trim() || 'Inconnu';



  // ❤️ Réactions
  const likesText = postElement.querySelector('.social-details-social-counts__reactions-count')?.innerText || '0';
  const likes = parseInt(likesText.replace(/\D/g, '') || '0');

  // 💬 Commentaires
  const commentsText = postElement.querySelector('.social-details-social-counts__comments')?.innerText || '0';
  const comments = parseInt(commentsText.replace(/\D/g, '') || '0');

  return {
    content,
    author,
    likes,
    comments,
    timestamp: new Date().toISOString()
  };
}


function scrapePosts() {
  const posts = document.querySelectorAll('div.feed-shared-update-v2, div.feed-shared-update'); // plusieurs structures possibles
  console.log(`[Scraper] ${posts.length} posts détectés`);

  const results = [];

  posts.forEach(post => {
    const data = extractPostData(post);
    if (data.content && data.author) {
      results.push(data);
    }
  });

  console.log(`[Scraper] ${results.length} posts extraits :`, results);

  const oldData = JSON.parse(localStorage.getItem("linkedinPosts") || "[]");
  const merged = [...oldData, ...results];

  const unique = Array.from(new Map(merged.map(p => [`${p.author}_${p.content}`, p])).values());
  unique.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
  const top100 = unique.slice(0, 100);

  localStorage.setItem("linkedinPosts", JSON.stringify(top100));
  console.log("[Scraper] Données enregistrées dans localStorage");
}

setInterval(scrapePosts, 10000);
