document.addEventListener("DOMContentLoaded", () => {
  const LOCAL_STORAGE_KEY = "shopify_compare_list";
  const drawer = document.getElementById("compare-drawer");
  const drawerItemsContainer = document.getElementById("compare-drawer-items");
  const minimizeDrawerBtn = document.getElementById("drawer-toggle");

  updateDrawer();

  minimizeDrawerBtn.addEventListener('click', () => {
    const drawer = document.getElementById('compare-drawer');

    if (drawer.classList.contains('is-minimized')) {
      drawer.classList.remove('is-minimized');
    } else {
      drawer.classList.add('is-minimized');
    }
  });

  function updateDrawer() {
    const savedProducts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

    if (savedProducts.length === 0) {
      drawer.style.display = "none";
      return;
    }

    drawer.style.display = "block";
    fetchDrawerProductsData(savedProducts);
  }

  /**
   * Requête GraphQL vers l'API Storefront
   */
  function fetchDrawerProductsData(productIds) {
    const formattedIds = productIds.map(id => {
      const rawId = (typeof id === 'object' && id !== null) ? (id.id || "") : id.toString();
      return rawId.startsWith("gid://") ? rawId : `gid://shopify/Product/${rawId}`;
    }).filter(id => id !== "");

    const query = `
      query getDrawerProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            images(first: 1) {
              nodes { url }
            }
          }
        }
      }
    `;

    const graphqlEndpoint = `${window.Shopify?.routes?.root || '/'}api/2024-01/graphql.json`;
    const STOREFRONT_ACCESS_TOKEN = "0f258b90cf2239ce15565639eea250e1"; // Utilise ton token fonctionnel

    fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({ query, variables: { ids: formattedIds } })
    })
    .then(res => res.json())
    .then(response => {
      if (response.errors) throw new Error(response.errors[0].message);
      const products = response.data?.nodes?.filter(node => node && node.id) || [];
      renderDrawerItems(products);
    })
    .catch(err => console.error("Erreur Tiroir GraphQL:", err));
  }

  function renderDrawerItems(products) {
    drawerItemsContainer.innerHTML = products.map(product => {
      const imageUrl = product.images.nodes[0]?.url || "";
      return `
        <div class="drawer-item" data-id="${product.id}">
          <button class="drawer-item-remove" data-id="${product.id}" title="Retirer">✕</button>
          ${imageUrl ? `<img src="${imageUrl}" alt="${product.title}">` : `<div class="no-img"></div>`}
          <span class="drawer-item-title">${product.title}</span>
        </div>
      `;
    }).join("");

    initRemoveEvents();
  }

  function initRemoveEvents() {
    const removeButtons = drawerItemsContainer.querySelectorAll(".drawer-item-remove");
    
    removeButtons.forEach(button => {
      button.addEventListener("click", (e) => {
        const idToRemove = button.getAttribute("data-id");
        let savedProducts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

        savedProducts = savedProducts.filter(item => {
          const itemId = (typeof item === 'object' && item !== null) ? item.id : item.toString();

          const fullItemId = itemId.startsWith("gid://") ? itemId : `gid://shopify/Product/${itemId}`;
          return fullItemId !== idToRemove;
        });

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedProducts));
        
        updateDrawer();

        document.dispatchEvent(new CustomEvent("comparator:updated"));
      });
    });
  }

  document.addEventListener("comparator:added", () => {
    updateDrawer();
  });
});