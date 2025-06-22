document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tracker-form');
    const searchInput = document.getElementById('search');
    const tableBody = document.querySelector('#interaction-table tbody');

    // Load interactions from database on page load
    fetch('/get_interactions')
        .then(response => response.json())
        .then(data => updateTable(data))
        .catch(error => console.error("Error loading interactions:", error));

    // Handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const agent = document.getElementById('agent').value;
        const client = document.getElementById('client').value;
        const interaction = document.getElementById('interaction').value;

        if (agent && client && interaction) {
            fetch('/add_interaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `agent=${encodeURIComponent(agent)}&client=${encodeURIComponent(client)}&interaction=${encodeURIComponent(interaction)}`
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.message) {
                    fetch('/get_interactions')  // Reload table after adding interaction
                        .then(response => response.json())
                        .then(data => updateTable(data));
                    form.reset();
                } else {
                    alert("Error adding interaction.");
                }
            })
            .catch(error => console.error("Error:", error));
        }
    });

    // Handle search input
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.toLowerCase();
        fetch('/get_interactions')
            .then(response => response.json())
            .then(data => {
                const filteredInteractions = data.filter((item) =>
                    item.agent.toLowerCase().includes(searchText) ||
                    item.client.toLowerCase().includes(searchText)
                );
                updateTable(filteredInteractions);
            });
    });

    // Update table with interactions
    function updateTable(interactions) {
        tableBody.innerHTML = '';
        interactions.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.agent}</td><td>${item.client}</td><td>${item.interaction}</td>`;
            tableBody.appendChild(row);
        });
    }
});
