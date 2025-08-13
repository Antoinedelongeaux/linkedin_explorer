document.getElementById("exportBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const data = JSON.parse(localStorage.getItem("linkedinPosts") || "[]");
        if (!data.length) {
          alert("Aucune donnée trouvée.");
          return;
        }

        // Génère le CSV
        const csvHeaders = ["Auteur", "Contenu", "Likes", "Commentaires", "Date"];
        const rows = data.map(post => [
          `"${post.author.replace(/"/g, '""')}"`,
          `"${post.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          post.likes,
          post.comments,
          post.timestamp
        ]);

        const csvContent = [csvHeaders.join(','), ...rows.map(row => row.join(','))].join('\n');

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "linkedin-top100.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  });
});
