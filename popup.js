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
        const csvHeaders = ["Auteur", "Contenu",  "Likes", "Commentaires",  "Date"];
   // Dans l'export CSV
const rows = data.map(post => {
  const dateObj = new Date(post.date || post.timestamp);
  const shortDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

  return [
    `"${post.author.replace(/"/g, '""')}"`,
    `"${post.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    post.likes,
    post.comments,
    shortDate
  ];
});


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
        sidebar.style.cssText = 'position:fixed;top:0;right:0;width:600px;height:100%;background:white;z-index:9999;box-shadow:0 0 10px rgba(0,0,0,0.3);overflow:auto;padding:10px;font-family:sans-serif;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Fermer';
        closeBtn.style.cssText = 'float:right;margin-bottom:10px;background:#0073b1;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;';
        closeBtn.onclick = () => sidebar.remove();
        sidebar.appendChild(closeBtn);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.tableLayout = 'fixed';

        const headerRow = document.createElement('tr');
        const headers = ['Auteur', 'Contenu', 'Likes', 'Comm.', 'Date'];
        const widths = ['15%', '50%', '10%', '10%', '15%'];
        headers.forEach((h, i) => {
          const th = document.createElement('th');
          th.textContent = h;
          th.style.cssText = 'text-align:left;border-bottom:1px solid #ccc;padding:4px';
          th.style.width = widths[i];
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

// Dans l'affichage du tableau dans la sidebar
data.forEach(post => {
  const dateObj = new Date(post.date || post.timestamp);
  const shortDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

  const row = document.createElement('tr');
  const snippet = post.content.length > 100 ? post.content.slice(0, 100) + '…' : post.content;
  [post.author, snippet, post.likes, post.comments, shortDate].forEach((text, i) => {
    const td = document.createElement('td');
    td.textContent = text;
    td.style.cssText = 'border-bottom:1px solid #eee;padding:4px';
    td.style.width = widths[i];
    row.appendChild(td);
  });
  table.appendChild(row);
});


        sidebar.appendChild(table);
        document.body.appendChild(sidebar);
      }
    });
  });
});
