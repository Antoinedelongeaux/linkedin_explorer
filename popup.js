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
        const existing = document.getElementById('linkedinSidebar');
        if (existing) { existing.remove(); return; }

        const data = JSON.parse(localStorage.getItem("linkedinPosts") || "[]");
        if (!data.length) { alert("Aucune donnée trouvée."); return; }

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

        const headers = ['Auteur', 'Contenu', 'Likes', 'Comm.', 'Date'];
        const widths = ['15%', '50%', '10%', '10%', '15%'];

        const headerRow = document.createElement('tr');
        headers.forEach((h, i) => {
          const th = document.createElement('th');
          th.style.cssText = 'text-align:left;border-bottom:1px solid #ccc;padding:4px;position:relative';
          th.style.width = widths[i];
          th.textContent = h;
          const filterBtn = document.createElement('span');
          filterBtn.textContent = '\u25BC';
          filterBtn.style.cssText = 'cursor:pointer;font-size:10px;margin-left:4px;color:#888;';
          filterBtn.onclick = (e) => { e.stopPropagation(); openFilter(i, th); };
          th.appendChild(filterBtn);
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        const rows = [];
        data.forEach(post => {
          const dateObj = new Date(post.date || post.timestamp);
          const shortDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
          const rowValues = [post.author, post.content.length > 100 ? post.content.slice(0, 100) + '…' : post.content, String(post.likes), String(post.comments), shortDate];
          const row = document.createElement('tr');
          row.dataset.values = JSON.stringify(rowValues);
          rowValues.forEach((text, i) => {
            const td = document.createElement('td');
            td.textContent = text;
            td.style.cssText = 'border-bottom:1px solid #eee;padding:4px';
            td.style.width = widths[i];
            row.appendChild(td);
          });
          rows.push(row);
          table.appendChild(row);
        });

        sidebar.appendChild(table);
        document.body.appendChild(sidebar);

        const filters = headers.map((_, i) => new Set(rows.map(r => JSON.parse(r.dataset.values)[i])));

        function updateTable() {
          rows.forEach(row => {
            const vals = JSON.parse(row.dataset.values);
            const visible = vals.every((v, i) => filters[i].has(v));
            row.style.display = visible ? '' : 'none';
          });
        }

        function openFilter(colIndex, th) {
          const existingMenu = th.querySelector('.filterMenu');
          if (existingMenu) { existingMenu.remove(); return; }

          const menu = document.createElement('div');
          menu.className = 'filterMenu';
          menu.style.cssText = 'position:absolute;top:100%;left:0;background:white;border:1px solid #ccc;padding:4px;z-index:10000;max-height:200px;overflow:auto;min-width:120px';

          const search = document.createElement('input');
          search.type = 'text';
          search.placeholder = 'Filtrer...';
          search.style.cssText = 'width:100%;margin-bottom:4px';

          const list = document.createElement('div');

          function renderOptions() {
            list.innerHTML = '';
            Array.from(filters[colIndex]).sort().filter(v => v.toLowerCase().includes(search.value.toLowerCase())).forEach(val => {
              const label = document.createElement('label');
              label.style.display = 'block';
              const cb = document.createElement('input');
              cb.type = 'checkbox';
              cb.checked = true;
              cb.onchange = () => {
                if (cb.checked) {
                  filters[colIndex].add(val);
                } else {
                  filters[colIndex].delete(val);
                }
                updateTable();
              };
              label.appendChild(cb);
              label.appendChild(document.createTextNode(' ' + val));
              list.appendChild(label);
            });
          }

          search.oninput = renderOptions;
          menu.appendChild(search);
          menu.appendChild(list);
          th.appendChild(menu);
          renderOptions();

          document.addEventListener('click', function handler(e) {
            if (!menu.contains(e.target) && e.target !== menu) {
              menu.remove();
              document.removeEventListener('click', handler);
            }
          });
        }
      }
    });
  });
});
