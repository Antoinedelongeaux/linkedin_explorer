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

document.getElementById("showBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        // Supprime la barre si elle existe déjà
        const existing = document.getElementById('linkedinSidebar');
        if (existing) {
          existing.remove();
          return;
        }

        const data = JSON.parse(localStorage.getItem("linkedinPosts") || "[]");
        if (!data.length) {
          alert("Aucune donnée trouvée.");
          return;
        }

        const sidebar = document.createElement('div');
        sidebar.id = 'linkedinSidebar';
        sidebar.style.cssText = 'position:fixed;top:0;right:0;width:400px;height:100%;background:white;z-index:9999;box-shadow:0 0 10px rgba(0,0,0,0.3);overflow:auto;padding:10px;font-family:sans-serif;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fermer';
        closeBtn.style.cssText = 'float:right;margin-bottom:10px;background:#0073b1;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;';
        closeBtn.onclick = () => sidebar.remove();
        sidebar.appendChild(closeBtn);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        const headerRow = document.createElement('tr');
        ['Auteur', 'Likes', 'Commentaires', 'Lien'].forEach(h => {
          const th = document.createElement('th');
          th.textContent = h;
          th.style.cssText = 'text-align:left;border-bottom:1px solid #ccc;padding:4px';
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        data.forEach(post => {
          const row = document.createElement('tr');
          [post.author, post.likes, post.comments].forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            td.style.cssText = 'border-bottom:1px solid #eee;padding:4px';
            row.appendChild(td);
          });
          const linkTd = document.createElement('td');
          const a = document.createElement('a');
          a.href = post.link || '#';
          a.textContent = 'Ouvrir';
          a.target = '_blank';
          linkTd.appendChild(a);
          linkTd.style.cssText = 'border-bottom:1px solid #eee;padding:4px';
          row.appendChild(linkTd);
          table.appendChild(row);
        });

        sidebar.appendChild(table);
        document.body.appendChild(sidebar);
      }
    });
  });
});
