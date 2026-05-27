import { useState, useEffect } from "react";
import { Page, Layout, Card, BlockStack, InlineStack, Text, Button, ToggleButton, Box } from "@shopify/polaris";
import { ArrowUpIcon, ArrowDownIcon } from "@shopify/polaris-icons";

const DEFAULT_FIELDS = [
    { id: "price", label: "Prix", enabled: true },
    { id: "description", label: "Description", "enabled": true },
    { id: "variants", label: "Variantes", enabled: false },
    { id: "stock", label: "Stock", enabled: true },
    { id: "weight", label: "Poids", enabled: false },
    { id: "custom_metafield", label: "Metafield personnalisé", enabled: false }
];

export default function ConfigurationScreen() {
    const [fields, setFields] = useState(DEFAULT_FIELDS);
    const [isSaving, setIsSaving] = useState(false);
    
    const handleToggle = (id) => {
        setFields(prevFields =>
            prevFields.map(field =>
            field.id === id ? { ...field, enabled: !field.enabled } : field
            )
        );
    };

    const moveField = (index, direction) => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        
        // Vérification des limites du tableau
        if (newIndex < 0 || newIndex >= fields.length) return;

        const updatedFields = [...fields];
        // Échange de place (Swap) entre les deux éléments
        const temp = updatedFields[index];
        updatedFields[index] = updatedFields[newIndex];
        updatedFields[newIndex] = temp;

        setFields(updatedFields);
    };

    return (
        <Page 
            title="Configuration du Comparateur"
            primaryAction={{
            content: 'Sauvegarder',
            loading: isSaving,
            onAction: handleSave, // On va créer cette fonction à l'étape 4
            }}
        >
            <Layout>
            <Layout.Section>
                <Card>
                <BlockStack gap="400">
                    {fields.map((field, index) => (
                    <Box key={field.id} padding="300" borderBlockEndWidth="025" borderColor="border-sm">
                        <InlineStack align="space-between" blockAlign="center">
                        {/* Nom du champ */}
                        <Text variant="bodyMd" as="span">{field.label}</Text>
                        
                        {/* Actions : Flèches + Toggle */}
                        <InlineStack gap="200">
                            <Button 
                            icon={ArrowUpIcon} 
                            disabled={index === 0} 
                            onClick={() => moveField(index, "up")}
                            />
                            <Button 
                            icon={ArrowDownIcon} 
                            disabled={index === fields.length - 1} 
                            onClick={() => moveField(index, "down")}
                            />
                            <Button
                            toggle
                            pressed={field.enabled}
                            onClick={() => handleToggle(field.id)}
                            >
                            {field.enabled ? "Activé" : "Désactivé"}
                            </Button>
                        </InlineStack>
                        </InlineStack>
                    </Box>
                    ))}
                </BlockStack>
                </Card>
            </Layout.Section>
            </Layout>
        </Page>
    );
}