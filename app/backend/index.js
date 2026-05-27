import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js"; // Ton instance de configuration Shopify App

app.post("/api/save-config", async (req, res) => {
  // 1. Récupérer la session Shopify (gérée par le middleware d'authentification de l'app)
  const session = res.locals.shopify.session;
  const { configData } = req.body; // C'est le tableau JSON envoyé par le front-end

  try {
    // 2. Créer le client GraphQL
    const client = new shopify.api.clients.Graphql({ session });

    // 3. Récupérer d'abord l'ID de la boutique (nécessaire pour attribuer le metafield)
    const shopQuery = `query { shop { id } }`;
    const shopResponse = await client.request(shopQuery);
    const shopId = shopResponse.data.shop.id;

    // 4. Mutation pour sauvegarder le Metafield
    const mutationQuery = `
      mutation CreateMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id key value }
          userErrors { field message }
        }
      }
    `;

    const mutationVariables = {
      metafields: [
        {
          ownerId: shopId,
          namespace: "cosmiweb",
          key: "comparator_config",
          type: "json", // Important : stocker au format JSON natif
          value: JSON.stringify(configData)
        }
      ]
    };

    const response = await client.request(mutationQuery, { variables: mutationVariables });

    if (response.data.metafieldsSet.userErrors.length > 0) {
      return res.status(400).json({ success: false, errors: response.data.metafieldsSet.userErrors });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});