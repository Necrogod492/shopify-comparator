document.addEventListener("DOMContentLoaded", async function () {
  const emptyState = document.getElementById("compare-empty-state");
  const activeState = document.getElementById("compare-table-container");
  const compareTable = document.getElementById("compare-table");
  const headerRow = document.getElementById("table-header-row");
  const tableBody = document.getElementById("table-body");
  const clearBtn = document.getElementById("clear-compare-btn");

  //Récupérer les produits du localStorage
  const compareList = JSON.parse(localStorage.getItem("shopify_compare_list")) || [];

  if (compareList.length < 2) {
    if (emptyState) emptyState.style.display = "flex";
    if (activeState) activeState.style.display = "none";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  if (activeState) activeState.style.display = "block";

  fetchProductData(compareList);

  // Vider la liste de produit dans le localStorage
  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      localStorage.removeItem("shopify_compare_list");
      window.location.reload();
    });
  }

  function fetchProductData(productIds) {
    // La requête GraphQL écrite sous forme de chaîne de caractères (String)
    const query = `
      query getProducts($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
            descriptionHtml
            images(first: 1) {
              nodes { url altText }
            }
            variants(first: 10) {
              nodes {
                id
                title
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
              }
            }
          }
        }
      }
    `;

    const STOREFRONT_ACCESS_TOKEN = "0f258b90cf2239ce15565639eea250e1";

    // 1. Nettoyage et extraction des vrais IDs pour GraphQL
    const formattedIds = productIds.map((item, index) => {
      let rawId = "";

      // Cas A : L'élément dans le localStorage est un objet (ex: { id: 456789, title: "..." })
      if (typeof item === 'object' && item !== null) {
        // On cherche s'il y a une propriété 'id' ou 'variantId' dans ton objet
        rawId = item.id || item.variantId || "";
      } 
      // Cas B : L'élément est déjà une simple chaîne ou un nombre (ex: "456789" ou 456789)
      else if (item) {
        rawId = item.toString();
      }

      // Si après ça l'ID est toujours vide, on log l'anomalie
      if (!rawId) {
        console.error(`L'élément à l'index ${index} du localStorage est mal structuré :`, item);
        return null;
      }

      // Cas C : L'ID extrait est déjà au format GID (contient déjà gid://)
      if (rawId.startsWith("gid://")) {
        return rawId;
      }

      // Cas D : C'est un ID brut, on lui ajoute le préfixe requis par GraphQL
      return `gid://shopify/Product/${rawId}`;
    }).filter(id => id !== null); // On élimine les éventuels ratés pour ne pas faire planter GraphQL

    // 2. On prépare les variables pour la requête
    const variables = { ids: formattedIds };

    // Appel API Storefront
    fetch('/api/2024-01/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN 
      },
      body: JSON.stringify({ query, variables })
    })
    //partie faites avec l'IA Gemini
    .then(response => {
      if (!response.ok) throw new Error("Erreur lors de l'appel API Storefront");
      return response.json();
    })
    .then(res => {
      // Filtrer pour s'assurer qu'on ne garde que les objets "Product" valides
      const products = res.data?.nodes?.filter(node => node && node.id) || [];
      
      if (products.length > 0) {
        renderComparisonTable(products);
      } else {
        console.log("error product iDS");
        // Fallback si les IDs du localStorage ne retournent aucun produit valide
        localStorage.removeItem("shopify_compare_list");
        window.location.reload();
      }
    })
    .catch(error => {
      console.error("Erreur Comparateur GraphQL:", error);
      if (compareTable) compareTable.innerHTML = `<p class="error">Une erreur est survenue lors du chargement du comparateur.</p>`;
    });
  }

  /**
   * Helper algorithmique pour vérifier si une propriété est identique chez TOUS les produits
   */
  function checkIsIdentical(products, extractorFunc) {
    if (products.length < 2) return false;
    const firstValue = extractorFunc(products[0]);
    return products.every(product => extractorFunc(product) === firstValue);
  }

  /**
   * Génère dynamiquement le HTML du tableau comparatif sous forme de CSS Grid
   * @param {Array<Object>} products - Liste des produits retournés par GraphQL
   */
  function renderComparisonTable(products) {
    if (!compareTable) return;

    // Injection de la variable CSS pour définir dynamiquement le nombre de colonnes de la grille
    compareTable.style.setProperty("--products-count", products.length);

    // --- ANALYSE DES COMPARAISONS (Logique Métier demandée) ---
    
    // 1. Comparaison des Prix (On compare le prix de la première variante)
    const isPriceIdentical = checkIsIdentical(products, p => p.variants.nodes[0]?.price.amount);
    
    // 2. Comparaison des Stocks (Disponible ou non)
    const isStockIdentical = checkIsIdentical(products, p => p.variants.nodes[0]?.availableForSale);

    // 3. Comparaison du nombre de variantes disponibles
    const isVariantsIdentical = checkIsIdentical(products, p => p.variants.nodes.length);

    // --- CONSTRUCTION DU SQUELETTE HTML ---
    let tableHtml = "";

    // LIGNE 1 : IMAGES PRINCIPALES
    tableHtml += `
      <div class="comparison-row row-images">
        <div class="row-label">Visuel</div>
        ${products.map(p => {
          const img = p.images.nodes[0];
          return `
            <div class="product-col text-center">
              ${img ? `<img src="${img.url}" alt="${img.altText || p.title}" class="compare-img" loading="lazy">` : `<div class="no-image">Pas d'image</div>`}
            </div>
          `;
        }).join("")}
      </div>
    `;

    // LIGNE 2 : TITRES
    tableHtml += `
      <div class="comparison-row row-titles">
        <div class="row-label">Nom du produit</div>
        ${products.map(p => `
          <div class="product-col">
            <a href="/products/${p.handle}" class="compare-product-link"><strong>${p.title}</strong></a>
          </div>
        `).join("")}
      </div>
    `;

    // LIGNE 3 : PRIX (Avec détection des différences/similitudes)
    tableHtml += `
      <div class="comparison-row row-prices ${isPriceIdentical ? 'row-identical' : 'row-different'}">
        <div class="row-label">Prix ${isPriceIdentical ? '<span class="badge-identical">Identique</span>' : ''}</div>
        ${products.map(p => {
          const variant = p.variants.nodes[0];
          if (!variant) return `<div class="product-col">—</div>`;
          
          const price = parseFloat(variant.price.amount).toFixed(2);
          const hasDiscount = variant.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);
          
          return `
            <div class="product-col">
              <span class="price-current">${price} ${variant.price.currencyCode}</span>
              ${hasDiscount ? `<span class="price-compare" style="text-decoration: line-through; margin-left: 8px; color: #888;">${parseFloat(variant.compareAtPrice.amount).toFixed(2)}</span>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;

    // LIGNE 4 : DESCRIPTION COURTE (Nettoyage basique du HTML si nécessaire)
    tableHtml += `
      <div class="comparison-row row-descriptions">
        <div class="row-label">Description</div>
        ${products.map(p => {
          // On peut tronquer la description ou utiliser descriptionHtml directement
          const shortDesc = p.descriptionHtml ? p.descriptionHtml : "Aucune description disponible.";
          return `<div class="product-col user-content-truncated">${shortDesc}</div>`;
        }).join("")}
      </div>
    `;

    // LIGNE 5 : VARIANTES DISPONIBLES
    tableHtml += `
      <div class="comparison-row row-variants ${isVariantsIdentical ? 'row-identical' : 'row-different'}">
        <div class="row-label">Options disponibles</div>
        ${products.map(p => {
          const variantTitles = p.variants.nodes.map(v => v.title).join(", ");
          return `<div class="product-col variant-list-text">${variantTitles || "Unique"}</div>`;
        }).join("")}
      </div>
    `;

    // LIGNE 6 : STATUT DU STOCK
    tableHtml += `
      <div class="comparison-row row-stocks ${isStockIdentical ? 'row-identical' : 'row-different'}">
        <div class="row-label">Disponibilité</div>
        ${products.map(p => {
          const isAvailable = p.variants.nodes[0]?.availableForSale;
          return `
            <div class="product-col">
              <span class="stock-status ${isAvailable ? 'in-stock' : 'out-of-stock'}">
                ${isAvailable ? "● En stock" : "✕ Rupture de stock"}
              </span>
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Injection finale dans le conteneur du DOM
    compareTable.innerHTML = tableHtml;

  }

});